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
  // marker,
  markerMatch,
} from "./lit-html";
import { doc, isFunction } from "./util";


type Template = [
  element: HTMLTemplateElement,
  attributes: string[]
]

const walker = doc.createTreeWalker(doc, 133);


const templateCache = new WeakMap<TemplateStringsArray, HTMLTemplateElement>();

const marker = `$marker$`



/**
 * Returns a parsed template and its bound attributes for a given template string and type.
 * @internal
 */
function getTemplate(strings: TemplateStringsArray, type: ResultType): HTMLTemplateElement {
  let template = templateCache.get(strings);
  if (template === undefined) {
    // const [html, attributes] = getTemplateHtml(strings, type);
    const html = strings.join(marker)
    const element = doc.createElement("template");
    element.innerHTML = html;
    template = element
    templateCache.set(strings, element);
  }
  return template;
}

type AttributeType = "attribute" | "boolean" | "property" | "event" | "delegated-event"
type Prefixes = Record<string, AttributeType>

const prefixes: Prefixes = {
  // "": "attribute",
  "@": "delegated-event",
  "?": "boolean",
  ".": "property",
  "attr:": "attribute",
  "bool:": "boolean",
  "on:": "event",
  "prop:": "property"

}


/**
 * Assigns a property, attribute, boolean, or event handler to an element, supporting reactivity.
 * @internal
 */
function assignAttribute(elem: Element, nameWithPrefix: string, value: any, prefixes: Prefixes) {
  const prefix = Object.keys(prefixes).find(v => nameWithPrefix.startsWith(v))
  const type = prefixes[prefix!]
  const name = nameWithPrefix?.slice(prefix?.length)
  elem.removeAttribute(nameWithPrefix)
  if (type === "boolean") {
    if (isFunction(value)) {
      effect(() => setBoolAttribute(elem, name, value()));
    } else {
      setBoolAttribute(elem, name, value)
    }
  } else if (type === "property") {
    if (isFunction(value)) {
      effect(() => setProperty(elem, name, value()));
    } else {
      setProperty(elem, name, value)
    }
  } else if (type === "event") {
    addEventListener(elem, name, value, false);
  } else if (type === "delegated-event") {
    let delegate = DelegatedEvents.has(name);
    addEventListener(elem, name, value, delegate);
    if (delegate) delegateEvents([name]);
  } else {
    if (isFunction(value)) {
      effect(() => setAttribute(elem, name, value()));
    } else {
      setAttribute(elem, name, value)
    }
  }
}


/**
 * Creates a tagged template function for html/svg/mathml templates with Solid reactivity.
 * @internal
 */
function HTML(prefixes?: Prefixes, type: ResultType = 1) {
  function html(
    strings: TemplateStringsArray,
    ...values: any[]
  ): JSX.Element {
    function render() {
      const element = getTemplate(strings, type);
      const clone = element.content.cloneNode(true);

      let valueIndex = 0;
      let boundAttributeIndex = 0;
      walker.currentNode = clone;


      while (walker.nextNode()) {
        const node = walker.currentNode;

        if (node.nodeType === 1) {
          for (const attr of [...(node as Element).attributes]) {
            if (attr.name === `...${marker}`) {
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
            } else if (attr.value === marker) {
              assignAttribute(node as Element, attr.name, values[valueIndex++], html.prefixes);
            } else if (attr.value.includes(marker)) {
              const strings = attr.value.split(marker);
              let parts = [strings[0]] as any[];
              for (let j = 1; j < strings.length; j++) {
                parts.push(values[valueIndex++], strings[j]);
              }
              assignAttribute(node as Element, attr.name, () =>
                parts.map((v) => (isFunction(v) ? v() : v)).join(""), html.prefixes
              );
            }

          }

        } else if (node.nodeType === 3 && node.nodeValue?.includes(marker)) {
          const parts = node.nodeValue?.split(marker)
          const parent = node.parentElement!
          parent.insertBefore(doc.createTextNode(parts[0]), node)
          for (let i = 1; i < parts.length; i++) {
            const textNode = doc.createTextNode(parts[i])
            node.parentElement?.insertBefore(textNode, node)
            insert(parent, values[valueIndex++], textNode);
          }
          walker.currentNode = node.previousSibling!
          parent.removeChild(node)

        }
      }

      if (type === SVG_RESULT || type === MATHML_RESULT) {
        return [...clone.firstChild!.childNodes]
      }
      return [...clone.childNodes];
    }
    return render as unknown as JSX.Element;
  }

  html.prefixes = prefixes
  html.addPrefixes = (prefixes: Prefixes) => {
    Object.assign(html.prefixes, prefixes)
  }

  return html
}


/**
 * Tagged template for creating reactive HTML templates with Solid. Use for DOM elements only.
 *
 * @example
 * html`<div class="foo">${bar}</div>`
 * html`<button @click=${onClick}>Click</button>`
 */
export const html = HTML(HTML_RESULT)

/**
 * Tagged template for creating reactive SVG templates with Solid. Use inside <svg> only.
 *
 * @example
 * svg`<circle cx="10" cy="10" r="5" />`
 */
export const svg = HTML(SVG_RESULT)

/**
 * Tagged template for creating reactive MathML templates with Solid. Use inside <math> only.
 *
 * @example
 * mathml`<math><mi>x</mi></math>`
 */
export const mathml = HTML(MATHML_RESULT)





