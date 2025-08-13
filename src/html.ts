import { type JSX } from "solid-js";
import {
  DelegatedEvents,
  SVGElements,
  addEventListener,
  delegateEvents,
  effect,
  insert,
  setAttribute,
  setBoolAttribute,
  setProperty,
  style,
} from "solid-js/web";
import {
  HTML_RESULT,
  MATHML_RESULT,
  ResultType,
  boundAttributeSuffix,
  getTemplateHtml,
  marker,
  markerMatch,
  SVG_RESULT,
} from "./lit-html";
import { doc, isFunction } from "./util";
import { markedOnce } from "./h";

type AssignmentFunction = (
  node: Element,
  name: string,
  value: any,
  prev: any
) => any;

export type AssignmentRule = [string, AssignmentFunction];
export type AssignmentRules = Array<AssignmentRule>;

export function assignEvent(
  node: Element,
  name: string,
  value: any,
  prev?: any
) {
  node.addEventListener(name, value);
}

export function assignDelegatedEvent(
  node: Element,
  name: string,
  value: any,
  prev?: any
) {
  let delegate = DelegatedEvents.has(name);
  addEventListener(node, name, value, delegate);
  if (delegate) delegateEvents([name]);
}

export function assignProperty(
  node: Element,
  name: string,
  value: any,
  prev?: any
) {
  node[name] = value;
}

export function assignBooleanAttribute(
  node: Element,
  name: string,
  value: any,
  prev?: any
) {
  if (value) {
    node.setAttribute(name, "");
  } else {
    node.removeAttribute(name);
  }
}

export function assignAttribute(
  node: Element,
  name: string,
  value: any,
  prev?: any
) {
  node.setAttribute(name, value);
}

const defaultRules: AssignmentRules = [
  ["on:", assignEvent],
  // ["@", assignDelegatedEvent],
  ["prop:", assignProperty],
  // [".", assignProperty],
  ["bool:", assignBooleanAttribute],
  // ["?", assignBooleanAttribute],
  ["attr:", assignAttribute],
];

type Template = [element: HTMLTemplateElement, attributes: string[]];

const walker = doc.createTreeWalker(doc, 129);

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
    const [html, attributes] = getTemplateHtml(strings, type);
    const element = doc.createElement("template");
    element.innerHTML = html;
    template = [element, attributes];
    templateCache.set(strings, template);
  }
  return template;
}

/**
 * Assigns a property, attribute, boolean, or event handler to an element, supporting reactivity.
 * @internal
 */
export function assign(rules: AssignmentRules,elem: Element, name: string, value: any, prev?:  any) {
  for (const [prefix, assignFn] of rules) {
    if (name.startsWith(prefix)) {
      elem.removeAttribute(name); // Remove the original attribute to prevent conflicts
      name = name.slice(prefix.length);
      if (isFunction(value) && !markedOnce.has(value)) {
        effect(() => prev = assignFn(elem, name, value, prev))
      } else {
        assignFn(elem, name, value, prev);
      }
      
      return;
    }
  }
  // If no syntax matched, default to setting the attribute
  assignAttribute(elem, name, value);
}

export function spread(rules: AssignmentRules, elem: Element, props: Record<string, any>, prev?: Record<string, any>) {
  for (const [name, value] of Object.entries(props)) {
    if (name === "children") continue; // Skip children
    assign(rules, elem, name, value);
  }
}

/**
 * Creates a tagged template function for html/svg/mathml templates with Solid reactivity.
 * @internal
 */
export function HTML(rules: AssignmentRules = [],type: ResultType = 1) {
  return function html(
    strings: TemplateStringsArray,
    ...values: any[]
  ): JSX.Element {
    function render() {
      const [element, attributes] = getTemplate(strings, type);
      const clone = element.content.cloneNode(true);

      let valueIndex = 0;
      let boundAttributeIndex = 0;
      walker.currentNode = clone;

      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.nodeType === 1) {
          for (const attr of [...(node as Element).attributes]) {
            if (attr.name.endsWith(boundAttributeSuffix)) {
              //Bound attribute/prop/event
              let value: any
              if (attr.value === marker) {
                value = values[valueIndex++];
              } else {
                const strings = attr.value.split(marker);
                let parts = [strings[0]] as any[];
                for (let j = 1; j < strings.length; j++) {
                  parts.push(values[valueIndex++], strings[j]);
                }
                value = () => parts.map((v) => (isFunction(v) ? v() : v)).join("");

              }
              assign(rules, node as Element, attributes[boundAttributeIndex++], value);
              (node as Element).removeAttribute(attr.name);
            } else if (attr.name === `...${marker}`) {
              //Spread
              const isSvg = SVGElements.has((node as Element).tagName);
              const value = values[valueIndex++];
              if (isFunction(value)) {
                effect(() => spread(rules,node as Element, value() ));
              } else {
                spread(rules, node as Element, value);
              }
              (node as Element).removeAttribute(attr.name);
            } else if (attr.name.startsWith(marker)) {
              //Refs
              const value = values[valueIndex++];
              if (isFunction(value)) {
                value(node as Element);
              }
              (node as Element).removeAttribute(attr.name);
            }
          }
        } else if (node.nodeType === 8) {
          if (node.nodeValue === markerMatch) {
            node.nodeValue = marker + valueIndex; //I don't know why, but this prevents misplaced elements
            const value = values[valueIndex++];
            const parent = node.parentNode;
            if (parent) insert(parent, value, node);
          }
        }
      }
      if (type === SVG_RESULT || type === MATHML_RESULT) {
        return [...clone.firstChild!.childNodes];
      }
      return [...clone.childNodes];
    }

    render.addRules = (newRules: AssignmentRules) => {
      rules.push(...newRules);
    }
    render.addRule = (prefix: string, assignFn: AssignmentFunction) => {
      rules.push([prefix, assignFn]);
    }

    return render as unknown as JSX.Element;
  };
}

/**
 * Tagged template for creating reactive HTML templates with Solid. Use for DOM elements only.
 *
 * @example
 * html`<div class="foo">${bar}</div>`
 * html`<button @click=${onClick}>Click</button>`
 */
export const html = HTML(defaultRules, HTML_RESULT);

/**
 * Tagged template for creating reactive SVG templates with Solid. Use inside <svg> only.
 *
 * @example
 * svg`<circle cx="10" cy="10" r="5" />`
 */
export const svg = HTML(defaultRules, SVG_RESULT);

/**
 * Tagged template for creating reactive MathML templates with Solid. Use inside <math> only.
 *
 * @example
 * mathml`<math><mi>x</mi></math>`
 */
export const mathml = HTML(defaultRules, MATHML_RESULT);
