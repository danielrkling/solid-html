import { type JSX } from "solid-js";
import {
  effect,
  insert,
  SVGElements,
  template
} from "solid-js/web";

import {
  boundAttributeSuffix,
  getTemplateHtml,
  HTML_RESULT,
  marker,
  MATHML_RESULT,
  ResultType,
  SVG_RESULT,
} from "./lit-html";
import { doc, isFunction, toArray } from "./util";
import { AssignmentRule } from "./types";
import { assign, spread } from "./assign";
import { defaultRules, h } from "./defaults";

import { IAttribute, INode, parse, SyntaxKind } from "html5parser";
import { H } from "./h";


const start = `$START$`
const end = `$END$`
const match = /\$START\$(\d+)\$END\$/g


const insertMarker = `#insert#`
const commentMarker = `#comment#`
const componentMarker = `#component#`

const insertMatch = new RegExp(`${insertMarker}(\\d+)${insertMarker}`,"g")
const commentMatch = new RegExp(`${commentMarker}(\\d+)${commentMarker}`,"g")
const componentMatch = new RegExp(`${componentMarker}([A-Z][A-Za-z0-9_$]*)${componentMarker}(\\d+)${componentMarker}`,"g")

type Template = {
  element: HTMLTemplateElement
  attributes: IAttribute[][]
  props: Record<string,any>[]
}


const walker = doc.createTreeWalker(doc, 133);

const templateCache = new WeakMap<TemplateStringsArray, Template>();

/**
 * Returns a parsed template and its bound attributes for a given template string and type.
 * @internal
 */
function getTemplate(
  strings: TemplateStringsArray,
  type: ResultType
): Template {
  let template = templateCache.get(strings);
  if (template === undefined) {
    const ast = parse(strings.slice(1).reduce((p, c, i, a) => p + start + i + end + c, strings[0]))
    template = {
      element: doc.createElement("template"),
      attributes: [],
      props: []
    }
    buildTemplate(ast, template.element.content, template)
    templateCache.set(strings, template);
  }
  return template;
}

const attributes = Symbol("attributes")
type TemplateElement = Element & { [attributes]: IAttribute[] }

function buildTemplate(nodes: INode[], parent: Node, template: Template) {
  for (const node of nodes) {
    if (node.type === SyntaxKind.Tag) {
      if (node.name.startsWith("!") || node.name.startsWith("?")) {
        const comment = doc.createComment(node.body?.reduce((p,c)=>p+c.value,"")??"")
        parent.appendChild(comment)
      } else if (node.rawName.match(/^[A-Z]/)) {
        const id = template.props.length
        template.props.push(node.attributes)
        
        const component = doc.createComment(componentMarker + node.rawName 
          + componentMarker + id + componentMarker)
          
        parent.appendChild(component)
      } else {
        const element = doc.createElement(node.rawName)
        element.id = template.attributes.length.toString()
        template.attributes.push(node.attributes)
        buildTemplate(node.body ?? [], element, template)
        parent.appendChild(element)
      }
    }
    if (node.type === SyntaxKind.Text) {
      const parts = node.value.split(match)
      parts.forEach((part,i)=>{
        if (i % 2 ===1){
          const comment = doc.createComment(insertMarker+part+insertMarker)
          parent.appendChild(comment)
        } else if (part.trim() !== "") {
          const text = doc.createTextNode(part)
          parent.appendChild(text)
        }
      })
    }
  }
}


/**
 * Creates a tagged template function for html/svg/mathml templates with Solid reactivity.
 * @internal
 */
export function HTML(type: ResultType = 1, rules: AssignmentRule[] = []) {
  function html(
    strings: TemplateStringsArray,
    ...values: any[]
  ): JSX.Element {

    const { element, attributes, props } = getTemplate(strings, type);
    const clone = element.content.cloneNode(true);

    console.log(element,attributes)


    let valueIndex = 0;
    let boundAttributeIndex = 0;
    walker.currentNode = clone;

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeType === 1) {
        const elem = node as Element, id = elem.id
        if (id) {
          elem.removeAttribute("id")
          for (const attr of attributes[Number(id)]) {
            assign(html.rules, node as Element, attr.name.value, extractValues(values, attr.value?.value, true));

          }
        }

      } else if (node.nodeType === 8) {
        const parent = node.parentNode;
        
        let m = insertMatch.exec(node.nodeValue!)
        console.log(node.nodeValue, m)
        if (m) {
          if (parent) insert(parent, values[Number(m[1])], node);
          walker.currentNode = node
        }


        m = componentMatch.exec(node.nodeValue!)
        if (m) {
          const p = props[Number(m[2])]
          
          const component = h(m[1],p)
          console.log(p,m[1] )
          // if (parent) insert(parent, component, node);
        }

      }
    }
    if (type === SVG_RESULT || type === MATHML_RESULT) {
      return [...clone.firstChild!.childNodes];
    }
    return [...clone.childNodes];
  }


  html.rules = [...rules, ...defaultRules];

  return html;
}


function extractValues(values: any[], value?: string, convertMultiPartToString = false) {
  if (value === undefined) return
  const matches = toArray(value.matchAll(match))
  if (matches.length) {
    if (matches[0][0] === matches[0].input.trim()) {
      return values[Number(matches[0][1])];
    } else {
      let index = 0
      const parts = value.split(match).map((x, i) => (i % 2 === 1 ? values[Number(matches[index++][1])] : x));
      return convertMultiPartToString ? () => parts.map(getValue).join("") : parts
    }
  }
  return value
}

const flat = (arr: any) => (arr.length === 1 ? arr[0] : arr);
function getValue(value: any) {
  while (isFunction(value)) value = value();
  return value;
}