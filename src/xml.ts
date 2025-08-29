import { INode, SyntaxKind, parse } from "html5parser";
import { insert } from "solid-js/web";
import { assign } from "./assign";
import { H } from "./h";
import { AssignmentRule, ComponentRegistry } from "./types";
import { doc, isFunction, isString, toArray } from "./util";

type TreeNode = TextNode  | ComponentNode | ElementNode | InsertNode

type ValueParts = Array<string | number>

type Property = [name: string, value: ValueParts]

type TextNode = {
  type: "text"
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
  template: HTMLTemplateElement | null
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
  template: HTMLTemplateElement | null
}

//Should be unique character that would never be in the template literal
const marker = '⧙⧘';


//Captures index of hole
const match = new RegExp(`${marker}(\\d+)${marker}`, "g")

const cache = new WeakMap<TemplateStringsArray, RootNode>();
const walker = doc.createTreeWalker(doc, 133);


function getCachedRoot(strings: TemplateStringsArray): RootNode {
  let root = cache.get(strings);
  if (root === undefined) {
    //join string with markers and index
    const ast = parse(strings.slice(1).reduce((prev, current, index) => prev + marker + index + marker + current, strings[0]))
    const children = ast.flatMap(n => parseNode(n))

    const template = children.some(n => n.type === "element") ? buildTemplate(children) : null

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


export function XML(components: ComponentRegistry = {}, rules: AssignmentRule[] = [], clone = false) {
  function xml(strings: TemplateStringsArray, ...values: any[]) {
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
              const value = substituteValues(parts, values);
              assign(xml.h.rules, domNode as Element, name, value.length === 1 ? value[0] : () => value.map(getValue))
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
      }

      // gather props
      const props = {} as Record<string, any>;
      for (let [name, parts] of node.props) {
        const value = substituteValues(parts, values);
        props[name] = value.length === 1 ? value[0] : () => value.map(getValue)
      }

      // children - childNodes overwrites any props.children
      if (node.children.length) {     
        if (node.type === "component" && node.template) {
          props.children = ()=>renderTemplate(node.template!, node)
        } else {
          props.children = () => flat(node.children.map(renderNode));
        }
      }

      return xml.h(node.name, props);
    }

    if (cached.template) {
      return renderTemplate(cached.template, cached)
    }

    return flat(cached.children.map(renderNode));
  }

  xml.h = H(components, rules);

  return xml;
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

  //Comment Nodes - Do not include in the tree
  if (node.name[0] === "!" || node.name === "") {
    console.log(node, node.body?.length)
    return []
  }

  const children = node.body?.flatMap((n) => parseNode(n)) ?? []
  const props = node.attributes.map(v => [v.name.value, parseValue(v.value?.value)]) as Property[]


  if (/^[A-Z]/.test(node.rawName)) {
    //Criteria for using template is 1 element. May be be a more optimal condition.
    const hasElementChilden = children.some(v => v.type === "element")
    const template = hasElementChilden ? buildTemplate(children) : null

    return {
      type: "component",
      name: node.rawName,
      props,
      children,
      template
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
function buildTemplate(nodes: TreeNode[]): HTMLTemplateElement {
  const template = doc.createElement("template")
  buildNodes(nodes, template.content)
  return template
}


function buildNodes(nodes: TreeNode[], parent: Node,) {
  nodes.forEach((node, i) => {
    if (node.type === "text") {
      parent.appendChild(doc.createTextNode(node.value))
    } else if (node.type === "insert") {
      parent.appendChild(doc.createComment(marker + node.type + marker))
    } else if (node.type === "component") {
      parent.appendChild(doc.createComment(marker + node.name + marker))
    } else if (node.type === "element") {
      const elem = doc.createElement(node.name)
      parent.appendChild(elem)
      //Apply static attributes here?
      buildNodes(node.children, elem)
    }
  })
}