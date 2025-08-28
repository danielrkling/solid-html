import { insert, template } from "solid-js/web";
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
const pathMatch = new RegExp(`${marker}(\\d+(?:,\\d+)*)${marker}`, "g")

const cache = new WeakMap<TemplateStringsArray, Cached>();
const walker = doc.createTreeWalker(doc, 133);


type Cached = RootNode


function getCached(strings: TemplateStringsArray): Cached {
  let cached = cache.get(strings);
  if (cached === undefined) {
    //join string with markers and index
    const ast = parse(strings.slice(1).reduce((prev, current, index) => prev + marker + index + marker + current, strings[0]))
    const children = ast.map(n => parseNode(n))

    const template = children.some(n => n.type === "element") ? buildTemplate(children) : null



    cached = {
      type: "root",
      children,
      template
    }


    console.log(cached, template)


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

function getNode(node: ComponentNode, id: string) {

  let current = node as ComponentNode | ElementNode
  id.split(",").forEach(i => {
    current = current.children[Number(i)] as ElementNode
  })
  return current as ElementNode
}

export function XML(components: ComponentRegistry = {}, rules: AssignmentRule[] = [], clone = false) {
  function xml(strings: TemplateStringsArray, ...values: any[]) {
    const cached = getCached(strings);

    function renderTemplate(template: HTMLTemplateElement, componentNode: ComponentNode) {
      const clone = template.content.cloneNode(true)
      walker.currentNode = clone;

      // console.log(componentNode.name || componentNode.type,template.innerHTML)

      let index = 0
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.nodeType === 1) {
          const _node = getNode(componentNode, (node as Element).id)
          // console.log(componentNode,node,_node)
          for (const [name, parts] of _node.props) {
            const value = substituteValues(parts, values);
            assign(xml.h.rules, node as Element, name, value.length === 1 ? value[0] : () => value.map(getValue))
          }
        } else if (node.nodeType === 8) {
          const m = pathMatch.exec(node.nodeValue ?? "")
          console.log(node.nodeValue,m)
          if (m) {
            const _node = getNode(componentNode, m[1])
            insert(node.parentNode!, renderNode(_node), node)
          }

        }
      }

      return toArray(clone.childNodes)
    }

    function renderNode(node: MyNode): any {
      // console.log(node.type,node.value, values)

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
        if (node.type === "component" && node.template) {
          props.children = ()=>renderTemplate(node.template, node)
        } else {
          props.children = () => flat(node.children.map(renderNode));
        }
      }

      // console.log(props)

      return xml.h(node.name, props);

    }


    if (cached.template) {
      return renderTemplate(cached.template, cached)
    }


    return flat(toArray(cached.children).map(renderNode));
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
}

type RootNode = {
  type: "root"
  children: MyNode[]
  template: HTMLTemplateElement | null
}


function substituteValues(parts: ValueParts, values: any[]) {
  return parts.map(v => isString(v) ? v : values[v])
}


function parseValue(value: string = ""): ValueParts {
  return value.split(match).map((v, i) => (i % 2 === 1 ? Number(v) : v)).filter(v => !isString(v) || v.trim())
}

function parseNode(node: INode): MyNode {
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


  const props = node.attributes.map(v => [v.name.value, parseValue(v.value?.value)]) as Property[]


  if (/^[A-Z]/.test(node.rawName)) {
    const hasElementChilden = children.some(v => v.type === "element")
    const template = hasElementChilden ? buildTemplate(children) : null

    const component = {
      type: "component",
      name: node.rawName,
      props,
      children,
      template
    } as ComponentNode

    return component
  }

  const element = {
    type: "element",
    name: node.name,
    props,
    children,
  } as ElementNode

  return element
}




function buildTemplate(nodes: MyNode[]): HTMLTemplateElement {
  const template = doc.createElement("template")
  buildNodes(nodes, template.content, [])

  function buildNodes(nodes: MyNode[], parent: Node, path: number[]) {
    nodes.forEach((node, i) => {
      const newPath = [...path, i]
      if (node.type === "text") {
        node.parts.forEach((part, i) => {
          if (isString(part)) {
            parent.appendChild(doc.createTextNode(part))
          } else {
            parent.appendChild(doc.createComment(marker + newPath + marker))
          }
        })
      } else if (node.type === "comment") {

      } else if (node.type === "component") {
        parent.appendChild(doc.createComment(marker + newPath + marker))
        // node.template = buildTemplate(node.children)
      } else if (node.type === "element") {
        const elem = doc.createElement(node.name)
        elem.id = newPath.toString()
        parent.appendChild(elem)
        //Apply static attributes here?
        buildNodes(node.children, elem, newPath)
      }
    })

  }

  return template
}

