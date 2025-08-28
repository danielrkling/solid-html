import { insert } from "solid-js/web";
import { assign } from "./assign";
import { xmlNamespaces } from "./defaults";
import { H } from "./h";
import { AssignmentRule, ComponentRegistry } from "./types";
import { doc, isFunction, isString, toArray } from "./util";
import { IAttribute, INode, SyntaxKind, parse } from "html5parser";

//Should be unique character that would never be in the template literal
const marker = '⧙⧘';


//Captures index of hole
const match = new RegExp(`${marker}(\\d+)${marker}`, "g")
const nodeMatch = new RegExp(`${marker}(?<name>\\w+)?${marker}(?<index>\\d+)${marker}`, "g")

const cache = new WeakMap<TemplateStringsArray, Cached>();
const walker = doc.createTreeWalker(doc, 133);


type Cached = {
  nodes: MyNode[]
  components: CommentNode[]
  elements: ElementNode[]
  allProperties: Property[][]
  element?: HTMLTemplateElement
}


function getCached(strings: TemplateStringsArray): Cached {
  let cached = cache.get(strings);
  if (cached === undefined) {
    //join string with markers and index
    const ast = parse(strings.slice(1).reduce((prev, current, index) => prev + marker + index + marker + current, strings[0]))
    const elements = []
    const components = []
    const nodes = ast.map(n => parseNode(n, elements, components))
    const element = doc.createElement("template")
    const allProperties = []
    buildTemplate(nodes, element.content, allProperties)
    cached = {
      nodes,
      elements,
      components
    }

    console.log(cached)


    cache.set(strings, cached);
  }
  return cached;
}

function flat(arr: any[]) {
  return (arr.length === 1 ? arr[0] : arr);
}

function getValue(value: any) {
  while (isFunction(value)) value = value();
  return value;
}


function insertValuesAtMarkers(values: any[], value: string = "", convertMultiPartToString = false) {
  const parts = value.split(match).map((v, i) => (i % 2 === 1 ? values[Number(v)] : v)).filter(v => !isString(v) || v.trim())
  return parts.length === 1 ? parts[0] : convertMultiPartToString ? () => parts.map(getValue).join("") : parts
}

export function XML(components: ComponentRegistry = {}, rules: AssignmentRule[] = [], clone = false) {
  function xml(strings: TemplateStringsArray, ...values: any[]) {
    const cached = getCached(strings);

    function renderTemplate(template: HTMLTemplateElement) {
      const clone = template.content.cloneNode(true)
      walker.currentNode = clone;

      let index = 0
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.nodeType === 1) {
          const attributes = cached.allProperties[index++]
          for (const [name, parts] of attributes) {
            const value = substituteValues(parts, values);
            assign(xml.h.rules, node as Element, name, value.length === 1 ? value[0] : () => value.map(getValue))
          }
        } else if (node.nodeType === 8) {
          const m = nodeMatch.exec(node.nodeValue ?? "")
          if (m?.groups?.type === "text") {

          }
          if (m?.groups?.type === "name") {
            const comp = h(m.groups.type,)
            insert(node.parentNode!, values[Number(m[1])], node)
          } else {
            insert(node.parentNode!, values[Number(m[1])], node)
          }
        }
      }

      return toArray(clone.childNodes)
    }

    function renderNode(node: MyNode): any {
      if (node.type === "text") {
        return substituteValues(node.parts, values)
      } else if (node.type === "comment") {
        const value = substituteValues(node.parts, values);
        return xml.h("!", { "prop:textContent": value.length === 1 ? value[0] : () => value.map(getValue) })
      }

      // gather props
      const props = {} as Record<string, any>;
      for (let [name, parts] of node.props) {
        const value = substituteValues(parts, values);
        props[name] = value.length === 1 ? value[0] : () => value.map(getValue)
      }

      // children - childNodes overwrites any props.children
      if (node.children.length) {
        // if (node.hasComponents) {
        props.children = () => flat(node.children.map(renderNode));
        // } else {
        //   const template = doc.createElement("template")
        //   buildTemplate(node.children, template.content, cached.allProperties)
        //   props.childen = () => renderTemplate(template)

        // }
      }

      return xml.h(node.name, props);

    }


    return flat(toArray(cached.nodes).map(renderNode));
  }

  xml.h = H(components, rules);

  return xml;
}

type MyNode = TextNode | CommentNode | ComponentNode | ElementNode

type ValueParts = Array<string | number>

type Property = [name: string, value: ValueParts]

type TextNode = {
  type: "text"
  value: string
  parts: ValueParts
}

type CommentNode = {
  type: "comment"
  value: string
  parts: ValueParts
}

type ComponentNode = {
  type: "component"
  name: string
  props: Property[]
  children: MyNode[]
  template: HTMLTemplateElement | null
}

type ElementNode = {
  type: "element"
  name: string
  props: Property[]
  children: MyNode[],
  template: HTMLTemplateElement | null
}

function substituteValues(parts: ValueParts, values: any[]) {
  return parts.map(v => isString(v) ? v : values[v])
}


function parseValue(value: string = ""): ValueParts {
  return value.split(match).map((v, i) => (i % 2 === 1 ? Number(v) : v)).filter(v => !isString(v) || v.trim())
}

function parseNode(node: INode, buildTemplate = false): MyNode {
  if (node.type === SyntaxKind.Text) {
    return {
      type: "text",
      value: node.value,
      parts: parseValue(node.value)
    } as TextNode
  }

  if (node.name.startsWith("!") || node.name.startsWith("?")) {
    const value = node.body?.map(n => n.type === SyntaxKind.Text ? n.value : "").join("") ?? ""
    const parts = parseValue(value)

    return {
      type: "comment",
      value,
      parts
    } as CommentNode
  }

  const children = node.body?.map((n) => parseNode(n)) ?? []
  const hasElementChilden = children.some(v => v.type === "element")

  const props = node.attributes.map(v => [v.name.value, parseValue(v.value?.value)]) as Property[]


  if (/^[A-Z]/.test(node.rawName)) {
    const component = {
      type: "component",
      name: node.rawName,
      props,
      children,
      template: null
    } as ComponentNode

    return component
  }

  const element = {
    type: "element",
    name: node.name,
    props,
    children,
    template: null
  } as ElementNode

  return element
}




function buildTemplate(nodes: MyNode[]): HTMLTemplateElement {
  const template = doc.createElement("template")


  function buildNodes(nodes: MyNode[], parent: Node){
    for (const node of nodes) {
      if (node.type === "text") {
        node.parts.forEach((part, i) => {
          if (isString(part)) {
            parent.appendChild(doc.createTextNode(part))
          } else {
            parent.appendChild(doc.createComment(marker + marker + part + marker))
          }
        })
      } else if (node.type === "comment") {
  
      } else if (node.type === "component") {
        parent.appendChild(doc.createComment(marker + node.name + marker + length + marker))
        node.template = doc.createElement("template")
        buildTemplate()
      } else if (node.type === "element") {
        const elem = doc.createElement(node.name)
        parent.appendChild(elem)
        //Apply static attributes here?
        allProps.push(node.props)
        buildTemplate(node.children, elem, allProps)
      }
  
    }
  }

  

  return template
}

