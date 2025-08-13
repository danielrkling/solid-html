import { type JSX } from "solid-js";
import {
  DelegatedEvents,
  SVGElements,
  addEventListener,
  assign,
  delegateEvents,
  effect,
  insert,
  setAttribute,
  setBoolAttribute,
  setProperty,
} from "solid-js/web";
import {
  HTML_RESULT,
  MATHML_RESULT,
  ResultType,
  SVG_RESULT,
  boundAttributeSuffix,
  getTemplateHtml,
  marker,
  markerMatch,
} from "./lit-html";
import { doc, isFunction } from "./util";


type Template = [
  element: HTMLTemplateElement,
  attributes: string[]
]

const walker = doc.createTreeWalker(doc, 129);


const templateCache = new WeakMap<TemplateStringsArray, Template>();

/**
 * Returns a parsed template and its bound attributes for a given template string and type.
 * @internal
 */
function getTemplate(strings: TemplateStringsArray, type: ResultType): Template {
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
function assignAttribute(elem: Element, name: string, value: any) {
  if (name[0] === "@") {
    const event = name.slice(1);
    let delegate = DelegatedEvents.has(event);
    addEventListener(elem, event, value, delegate);
    if (delegate) delegateEvents([event]);
    elem.removeAttribute(name);
  } else if (name[0] === ".") {
    if (isFunction(value)) {
      effect(() => {
        setProperty(elem, name.slice(1), value());
      });
    } else {
      setProperty(elem, name.slice(1), value);
    }
    elem.removeAttribute(name);
  } else if (name[0] === "?") {
    if (isFunction(value)) {
      effect(() => setBoolAttribute(elem, name.slice(1), value()));
    } else {
      setBoolAttribute(elem, name.slice(1), value);
    }
  } else {
    if (isFunction(value)) {
      effect(() => setAttribute(elem, name, value()));
    } else {
      setAttribute(elem, name, value);
    }
  }
}


/**
 * Creates a tagged template function for html/svg/mathml templates with Solid reactivity.
 * @internal
 */
function createHtml(type: ResultType){
  return function html(
    strings: TemplateStringsArray,
    ...values: any[]
  ): JSX.Element {
    function render() {
      const [element,attributes] = getTemplate(strings, type);
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
              if (attr.value === marker) {
                assignAttribute(node as Element, attributes[boundAttributeIndex++], values[valueIndex++]);
              } else {
                const strings = attr.value.split(marker);
                let parts = [strings[0]] as any[];
                for (let j = 1; j < strings.length; j++) {
                  parts.push(values[valueIndex++], strings[j]);
                }
                assignAttribute(node as Element, attributes[boundAttributeIndex++], () =>
                  parts.map((v) => (isFunction(v) ? v() : v)).join("")
                );
              }
              (node as Element).removeAttribute(attr.name);
            } else if (attr.name === `...${marker}`) {
              //Spread
              const isSvg = SVGElements.has((node as Element).tagName);
              const value = values[valueIndex++];
              if (isFunction(value)) {
                effect(() => assign(node as Element, value(), isSvg, true));
              } else {
                assign(node as Element, value, isSvg, true);
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
            node.nodeValue = marker + valueIndex  //I don't know why, but this prevents misplaced elements
            const value = values[valueIndex++];
            const parent = node.parentNode;
            if (parent) insert(parent, value, node);
          }
        }
      }
      if (type === SVG_RESULT || type === MATHML_RESULT) {
        return [...clone.firstChild!.childNodes]
      }
      return [...clone.childNodes];
    }
    return render as unknown as JSX.Element;
  }
}


/**
 * Tagged template for creating reactive HTML templates with Solid. Use for DOM elements only.
 *
 * @example
 * html`<div class="foo">${bar}</div>`
 * html`<button @click=${onClick}>Click</button>`
 */
export const html = createHtml(HTML_RESULT)

/**
 * Tagged template for creating reactive SVG templates with Solid. Use inside <svg> only.
 *
 * @example
 * svg`<circle cx="10" cy="10" r="5" />`
 */
export const svg = createHtml(SVG_RESULT)

/**
 * Tagged template for creating reactive MathML templates with Solid. Use inside <math> only.
 *
 * @example
 * mathml`<math><mi>x</mi></math>`
 */
export const mathml = createHtml(MATHML_RESULT)



