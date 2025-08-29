import { INode, IText, SyntaxKind, parse } from "html5parser";
import { insert, setAttribute } from "solid-js/web";
import { assign } from "./assign";
import { H } from "./h";
import { AssignmentRule, ComponentRegistry } from "./types";
import { createComment, doc, isFunction, isString, toArray, createElement, flat, getValue } from "./util";

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
      children,
      template
    }

    cache.set(strings, root);
  }
  return root;
}



export function HTML(components: ComponentRegistry = {}, rules: AssignmentRule[] = []) {
  function html(strings: TemplateStringsArray, ...values: any[]) {
    const cached = getCachedRoot(strings);

    function renderTemplate(template: HTMLTemplateElement, componentNode: ComponentNode | RootNode) {
      const clone = template.content.cloneNode(true)
      walker.currentNode = clone;
      walkNodes(componentNode.children)

      function walkNodes(nodes: TreeNode[]) {
        for (const node of nodes) {
          const domNode = walker.nextNode()!;
          if (node.type === ELEMENT_NODE) {
            for (const [name, parts] of node.props) {
              // If static props appplied template, they can be skipped here
              // if (parts.length===1 && isString(parts[0])) continue
              const value = substituteValues(parts, values);
              assign(html.h.rules, domNode as Element, name, value.length === 1 ? value[0] : () => value.map(getValue).join(""))
            }
            walkNodes(node.children)
          } else if (node.type === INSERT_NODE || node.type === COMPONENT_NODE) {
            insert(domNode.parentNode!, renderNode(node), domNode)
            walker.currentNode = domNode
          }
        }
      }
      return toArray(clone.childNodes)
    }

    function renderNode(node: TreeNode): any {
      switch (node.type) {
        case TEXT_NODE:
          return node.value;
        case INSERT_NODE:
          return values[node.value];
        case COMMENT_NODE:
          return createComment(node.value);
      }
      const template = node.type === COMPONENT_NODE && node.template

      // gather props
      const props = {} as Record<string, any>;
      for (let [name, parts] of node.props) {
        const value = substituteValues(parts, values);
        props[name] = value.length === 1 ? value[0] : () => value.map(getValue)
      }

      // children - childNodes overwrites any props.children
      if (node.children.length) {
        props.children = template ? () => renderTemplate(template, node) : () => flat(node.children.map(renderNode))
      }

      return html.h(node.name, props);
    }

    return cached.template ? renderTemplate(cached.template, cached) : flat(cached.children.map(renderNode));
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

  if (/^[A-Z]/.test(node.rawName)) {
    return {
      type: COMPONENT_NODE,
      name: node.rawName,
      props,
      children,
      template: buildTemplate(children)
    } as ComponentNode
  }

  return {
    type: ELEMENT_NODE,
    name: node.name,
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
  for (const node of nodes) {
    switch (node.type) {
      case TEXT_NODE:
        parent.appendChild(doc.createTextNode(node.value));
        break;
      case COMMENT_NODE:
        parent.appendChild(createComment(node.value));
        break;
      case INSERT_NODE:
        parent.appendChild(createComment('+'));
        break;
      case COMPONENT_NODE:
        parent.appendChild(createComment(node.name));
        break;
      case ELEMENT_NODE:
        const elem = createElement(node.name);
        parent.appendChild(elem);
        //Apply static properties here?
        buildNodes(node.children, elem);
        break;
    }
  }
}
