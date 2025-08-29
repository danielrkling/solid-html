import { INode, IText, SyntaxKind, parse } from "html5parser";
import { insert, setAttribute } from "solid-js/web";
import { assign } from "./assign";
import { H, createElement } from "./h";
import { AssignmentRule, ComponentRegistry } from "./types";
import { doc, isFunction, isString, toArray } from "./util";

type TreeNode = TextNode | ComponentNode | ElementNode | InsertNode | CommentNode

type ValueParts = Array<string | number>

type Property = [name: string, value: ValueParts]

type TextNode = {
  type: "text"
  value: string
}

type CommentNode = {
  type: "comment"
  value: string
}

type InsertNode = {
  type: "insert"
  value: number
}

type ComponentNode = {
  type: "component"
  name: string
  props: Property[]
  children: TreeNode[]
  template?: HTMLTemplateElement
}

type ElementNode = {
  type: "element"
  name: string
  props: Property[]
  children: TreeNode[],
}

type RootNode = {
  type: "root"
  children: TreeNode[]
  template?: HTMLTemplateElement
}

//Should be unique character that would never be in the template literal
const marker = '⧙⧘';


//Captures index of hole
const match = new RegExp(`${marker}(\\d+)${marker}`, "g")

const cache = new WeakMap<TemplateStringsArray, RootNode>();
const walker = doc.createTreeWalker(doc, 133);


function getCachedRoot(strings: TemplateStringsArray): RootNode {
  let root = cache.get(strings);
  if (!root) {
    //join string with markers and index    
    const ast = parse(strings.slice(1).reduce((prev, current, index) => prev + marker + index + marker + current, strings[0]))
    const children = ast.flatMap(n => parseNode(n))

    const template = buildTemplate(children)
    root = {
      type: "root",
      children,
      template
    }

    cache.set(strings, root);
  }
  return root;
}

function flat(arr: any[]) {
  return (arr.length === 1 ? arr[0] : arr);
}

function getValue(value: any) {
  while (isFunction(value)) value = value();
  return value;
}


export function HTML(components: ComponentRegistry = {}, rules: AssignmentRule[] = [], clone = true) {
  function html(strings: TemplateStringsArray, ...values: any[]) {
    const cached = getCachedRoot(strings);

    function renderTemplate(template: HTMLTemplateElement, componentNode: ComponentNode | RootNode) {
      const clone = template.content.cloneNode(true)
      walker.currentNode = clone;
      walkNodes(componentNode.children)

      function walkNodes(nodes: TreeNode[]) {
        nodes.forEach(node => {
          const domNode = walker.nextNode()!;
          if (node.type === "element") {
            for (const [name, parts] of node.props) {
              // if (parts.length===1 && isString(parts[0])) continue
              const value = substituteValues(parts, values);
              assign(html.h.rules, domNode as Element, name, value.length === 1 ? value[0] : () => value.map(getValue).join(""))
            }
            walkNodes(node.children)
          } else if (node.type === "insert" || node.type === "component") {
            insert(domNode.parentNode!, renderNode(node), domNode)
            walker.currentNode = domNode
          }
        })
      }
      return toArray(clone.childNodes)
    }

    function renderNode(node: TreeNode): any {
      if (node.type === "text") {
        return node.value
      } else if (node.type === "insert") {
        return values[node.value]
      } else if (node.type === "comment") {
        return doc.createComment(node.value)
      }

      // gather props
      const props = {} as Record<string, any>;
      for (let [name, parts] of node.props) {
        const value = substituteValues(parts, values);
        props[name] = value.length === 1 ? value[0] : () => value.map(getValue)
      }

      // children - childNodes overwrites any props.children
      if (node.children.length) {
        if (node.type === "component" && node.template && clone) {
          props.children = () => renderTemplate(node.template!, node)
        } else {
          props.children = () => flat(node.children.map(renderNode));
        }
      }

      return html.h(node.name, props);
    }

    if (cached.template && clone) {
      // const r = renderTemplate(cached.template, cached)
      // performance.mark("render-template")
      // return r
      return renderTemplate(cached.template, cached)
    }

    // const r = flat(cached.children.map(renderNode));
    // performance.mark("render-node")
    // return r
    return flat(cached.children.map(renderNode));
  }

  html.h = H(components, rules);

  return html;
}




function substituteValues(parts: ValueParts, values: any[]) {
  return parts.map(v => isString(v) ? v : values[v])
}

//Split by marker and extract index of hole. Remove empty strings 
function parseValue(value: string = ""): ValueParts {
  return value.split(match).map((v, i) => (i % 2 === 1 ? Number(v) : v)).filter(v => !isString(v) || v.trim())
}


//Parse html5parser result for what we care about
function parseNode(node: INode): TreeNode | TreeNode[] {

  //Text nodes are either static text or holes to insert in
  if (node.type === SyntaxKind.Text) {
    const parts = parseValue(node.value)
    return parts.map(value => {
      const type = isString(value) ? "text" : "insert"
      return {
        type,
        value,
      } as InsertNode | TextNode
    })
  }


  if (node.name[0] === "!" || node.name === "") {
    return {
      type: "comment",
      value: (node.body as IText[])[0].value
    } as CommentNode
  }

  const props = node.attributes.map(v => [v.name.value, parseValue(v.value?.value)]) as Property[]
  const children = node.body?.flatMap((n) => parseNode(n)) ?? []

  if (/^[A-Z]/.test(node.rawName)) {
    return {
      type: "component",
      name: node.rawName,
      props,
      children,
      template: buildTemplate(children)
    } as ComponentNode
  }

  return {
    type: "element",
    name: node.name,
    props,
    children,
  } as ElementNode
}


//build template element with same exact shape as tree so they can be walked through in sync
function buildTemplate(nodes: TreeNode[]): HTMLTemplateElement | undefined {
  //Criteria for using template is component or root has at least 1 element. May be be a more optimal condition.
  if (nodes.some((v) => v.type === "element")) {
    const template = doc.createElement("template")
    buildNodes(nodes, template.content)
    return template
  }
}


function buildNodes(nodes: TreeNode[], parent: Node,) {
  nodes.forEach((node, i) => {
    if (node.type === "text") {
      parent.appendChild(doc.createTextNode(node.value))
    } else if (node.type === "comment") {
      parent.appendChild(doc.createComment(node.value))
    } else if (node.type === "insert") {
      parent.appendChild(doc.createComment(node.type))
    } else if (node.type === "component") {
      parent.appendChild(doc.createComment(node.name))
    } else if (node.type === "element") {
      const elem = createElement(node.name)
      parent.appendChild(elem)
      // node.props.forEach((([name,value])=>{
      //   if (value.length===1 &&  isString(value[0])){
      //     setAttribute(elem,name,value[0])
      //   }
      // }))
      buildNodes(node.children, elem)
    }
  })
}

function writeNodes(nodes: TreeNode[]): string {
  return nodes.map((node, i) => {
    if (node.type === "text") {
      return node.value
    } else if (node.type === "comment") {
      return `<!--${node.value}-->`
    } else if (node.type === "insert") {
      return `<!--${node.type}-->`
    } else if (node.type === "component") {
      return `<!--${node.name}-->`
    } else if (node.type === "element") {
      return `<${node.name}>${writeNodes(node.children)}</${node.name}>`
    }
  }).join("")
}

