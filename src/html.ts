import { INode, IText, SyntaxKind, parse } from "html5parser";
import { insert, setAttribute } from "solid-js/web";
import { assign } from "./assign";
import { H, createElement } from "./h";
import { AssignmentRule, ComponentRegistry } from "./types";
import { doc, isFunction, isString, toArray } from "./util";

type TreeNode = TextNode | ComponentNode | ElementNode | InsertNode | CommentNode

type ValueParts = Array<string | number>

type Property = [name: string, value: ValueParts]


const TEXT_NODE = 1
type TextNode = {
  type: 1
  value: string
}

const COMMENT_NODE = 2
type CommentNode = {
  type: 2
  value: string
}

const INSERT_NODE = 3
type InsertNode = {
  type: 3
  value: number
}

const COMPONENT_NODE = 4
type ComponentNode = {
  type: 4
  name: string
  props: Property[]
  children: TreeNode[]
  template?: HTMLTemplateElement
}

const ELEMENT_NODE = 5
type ElementNode = {
  type: 5
  name: string
  props: Property[]
  children: TreeNode[],
}

type RootNode = {
  children: TreeNode[]
  template?: HTMLTemplateElement
}

//Should be unique character that would never be in the template literal
const marker = 'MARKER';



//Captures index of hole
const match = new RegExp(`${marker}(\\d+)${marker}`, "g")

const cache = new WeakMap<TemplateStringsArray, RootNode>();
const walker = doc.createTreeWalker(doc, 133);


function getCachedRoot(strings: TemplateStringsArray): RootNode {
  let root = cache.get(strings);
  if (!root) {
    //join string with markers and index    
    const ast = parse(strings.slice(1).reduce((prev, current, index) => prev + marker + index + marker + current, strings[0]))
    console.log(ast)
    const children = ast.flatMap(n => parseNode(n))

    const template = buildTemplate(children)
    root = {
      children,
      template
    }
    console.log(children,template) 

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
          if (node.type === ELEMENT_NODE) {
            for (const [name, parts] of node.props) {
              // if (parts.length===1 && isString(parts[0])) continue
              const value = substituteValues(parts, values);
              assign(html.h.rules, domNode as Element, name, value.length === 1 ? value[0] : () => value.map(getValue).join(""))
            }
            walkNodes(node.children)
          } else if (node.type === INSERT_NODE || node.type === COMPONENT_NODE) {
            insert(domNode.parentNode!, renderNode(node), domNode)
            walker.currentNode = domNode
          }
        })
      }
      return toArray(clone.childNodes)
    }

    function renderNode(node: TreeNode): any {
      if (node.type === TEXT_NODE) {
        return node.value
      } else if (node.type === INSERT_NODE) {
        return values[node.value]
      } else if (node.type === COMMENT_NODE) {
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
        if (node.type === COMPONENT_NODE && node.template && clone) {
          props.children = () => renderTemplate(node.template!, node)
        } else {
          props.children = () => flat(node.children.map(renderNode));
        }
      }
      if (!isString(node.name)){
        return html.h(values[node.name], props);
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
      const type = isString(value) ? TEXT_NODE : INSERT_NODE
      return {
        type,
        value,
      } as InsertNode | TextNode
    })
  }


  if (node.name[0] === "!" || node.name === "") {
    return {
      type: COMMENT_NODE,
      value: (node.body as IText[])[0].value
    } as CommentNode
  }

  const props = node.attributes.map(v => [v.name.value, parseValue(v.value?.value)]) as Property[]
  const children = node.body?.flatMap((n) => parseNode(n)) ?? []
  const name = parseValue(node.rawName)[0]

  if (/^[A-Z]/.test(node.rawName)) {
    return {
      type: COMPONENT_NODE,
      name,
      props,
      children,
      template: buildTemplate(children)
    } as ComponentNode
  }

  return {
    type: ELEMENT_NODE,
    name,
    props,
    children,
  } as ElementNode
}


//build template element with same exact shape as tree so they can be walked through in sync
function buildTemplate(nodes: TreeNode[]): HTMLTemplateElement | undefined {
  //Criteria for using template is component or root has at least 1 element. May be be a more optimal condition.
  if (nodes.some((v) => v.type === ELEMENT_NODE)) {
    const template = doc.createElement("template")
    buildNodes(nodes, template.content)
    return template
  }
}


function buildNodes(nodes: TreeNode[], parent: Node,) {
  nodes.forEach((node, i) => {
    if (node.type === TEXT_NODE) {
      parent.appendChild(doc.createTextNode(node.value))
    } else if (node.type === COMMENT_NODE) {
      parent.appendChild(doc.createComment(node.value))
    } else if (node.type === INSERT_NODE) {
      parent.appendChild(doc.createComment("+"))
    } else if (node.type === COMPONENT_NODE) {
      parent.appendChild(doc.createComment(node.name))
    } else if (node.type === ELEMENT_NODE) {
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
    if (node.type === TEXT_NODE) {
      return node.value
    } else if (node.type === COMMENT_NODE) {
      return `<!--${node.value}-->`
    } else if (node.type ===INSERT_NODE) {
      return `<!--${node.type}-->`
    } else if (node.type === COMPONENT_NODE) {
      return `<!--${node.name}-->`
    } else if (node.type === ELEMENT_NODE) {
      return `<${node.name}>${writeNodes(node.children)}</${node.name}>`
    }
  }).join("")
}

