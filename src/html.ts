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
  boundAttributeSuffix,
  getTemplateHtml,
  marker,
  markerMatch,
} from "./lit-html";


type Template = {
  element: HTMLTemplateElement;
  attributes: string[];
};

const templateCache = new WeakMap<TemplateStringsArray, Template>();
function getTemplate(strings: TemplateStringsArray): Template {
  let template = templateCache.get(strings);
  if (template === undefined) {
    const [html, attributes] = getTemplateHtml(strings, 1);
    const element = document.createElement("template");
    element.innerHTML = html;
    template = {
      element,
      attributes,
    };
  }
  return template;
}

function assignAttribute(elem: Element, name: string, value: any) {
  if (name === `...${marker}`) {
    const isSvg = SVGElements.has(elem.tagName);
    if (typeof value === "function") {
      effect(() => assign(elem, value(), isSvg, true));
    } else {
      assign(elem, value, isSvg, true);
    }
    elem.removeAttribute(name);
  } else if (name.startsWith(marker)) {
    if (typeof value === "function") {
      value(elem);
    }
    elem.removeAttribute(name);
  } else if (name[0] === "@") {
    const event = name.slice(1);
    let delegate = DelegatedEvents.has(event);
    addEventListener(elem, event, value, delegate);
    if (delegate) delegateEvents([event]);
    elem.removeAttribute(name);
  } else if (name[0] === ".") {
    if (typeof value === "function") {
      effect(() => {
        setProperty(elem, name.slice(1), value());
      });
    } else {
      setProperty(elem, name.slice(1), value);
    }
    elem.removeAttribute(name);
  } else if (name[0] === "?") {
    if (typeof value === "function") {
      effect(() => setBoolAttribute(elem, name.slice(1), value()));
    } else {
      setBoolAttribute(elem, name.slice(1), value);
    }
  } else {
    if (typeof value === "function") {
      effect(() => setAttribute(elem, name, value()));
    } else {
      setAttribute(elem, name, value);
    }
  }
}

const walker = document.createTreeWalker(document, 129);
export function html(
  strings: TemplateStringsArray,
  ...values: any[]
): JSX.Element {
  function render() {
    const { element, attributes } = getTemplate(strings);
    const clone = element.content.cloneNode(true);

    let valueIndex = 0;
    let boundAttributeIndex = 0;
    walker.currentNode = clone;

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeType === 1) {
        for (const attr of [...(node as Element).attributes]) {
          if (attr.name.endsWith(boundAttributeSuffix)) {
            if (attr.value === marker) {
              assignAttribute(node as Element, attributes[boundAttributeIndex++], values[valueIndex++]);
            } else {
              const strings = attr.value.split(marker);
              let parts = [strings[0]] as any[];
              for (let j = 1; j < strings.length; j++) {
                parts.push(values[valueIndex++], strings[j]);
              }
              assignAttribute(node as Element, attributes[boundAttributeIndex], () =>
                parts.map((v) => (typeof v === "function" ? v() : v)).join("")
              );
            }
            (node as Element).removeAttribute(attr.name);
          } else if (attr.name.includes(marker)) {
            assignAttribute(node as Element, attr.name, values[valueIndex++]);
          }
        }
      } else if (node.nodeType === 8) {
        if (node.nodeValue === markerMatch) {
          // node.nodeValue = i.toString();
          const value = values[valueIndex++];
          const parent = node.parentNode;
          if (parent) insert(parent, value, node);
        }
      }
    }
    return [...clone.childNodes];
  }
  return render as unknown as JSX.Element;
}
