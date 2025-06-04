import {
  type JSX
} from "solid-js";
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
  setProperty
} from "solid-js/web";

//These could probably be more unique
const marker = `$Marker$`;
const attributeMarker = `$Attribute$`;
const childNodeValue = `$Child$`
const childMarker = `<!--${childNodeValue}-->`;
const spreadMarker = `...${marker.toLowerCase()}`


const templateCache = new WeakMap<TemplateStringsArray, HTMLTemplateElement>();
function getTemplate(strings: TemplateStringsArray): HTMLTemplateElement {
  let template = templateCache.get(strings);
  if (template === undefined) {
    template = document.createElement("template");
    template.innerHTML = strings.join(marker);

    let html = template.innerHTML;
    //The markers placed at attributes will get quotes sourrounding it so we can replace those without touching the child markers
    html = html.replaceAll(`"${marker}"`, `"${attributeMarker}"`);
    //turn remaining markers into comments
    html = html.replaceAll(marker, childMarker);
    template.innerHTML = html;
    // console.log(html)
    templateCache.set(strings, template)
  }
  return template;
}

function assignAttribute(elem: Element, name: string, value: any) {
  if (name === spreadMarker) {
    const isSvg = SVGElements.has(elem.tagName);
    if (typeof value === "function") {
      effect(() => assign(elem, value(), isSvg, true));
    } else {
      assign(elem, value, isSvg, true);
    }
    elem.removeAttribute(name);
  } else if (name === "$ref") {
    if (typeof value === "function") {
      value(elem);
    }
    elem.removeAttribute(name);
  } else if (name[0] === "@") {
    const event = name.slice(1)
    let delegate = DelegatedEvents.has(event)
    addEventListener(elem, event, value, delegate);
    if (delegate) delegateEvents([event])
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
    const clone = getTemplate(strings).content.cloneNode(true);

    let i = 0;
    walker.currentNode = clone;

    while (walker.nextNode()) {

      const node = walker.currentNode;
      if (node.nodeType === 1) {
        for (const attr of [...(node as Element).attributes]) {
          if (attr.value === attributeMarker || attr.name === spreadMarker) {
            assignAttribute(node as Element, attr.name, values[i++]);
          } else if (attr.value.includes(childMarker)) {
            const strings = attr.value.split(childMarker);
            let parts = [strings[0]] as any[]
            for (let j = 1; j < strings.length; j++) {
              parts.push(values[i++], strings[j]);
            }
            assignAttribute(node as Element, attr.name, () => parts.map(v => typeof v === "function" ? v() : v).join(''));
          }

        }
      } else if (node.nodeType === 8) {
        if (node.nodeValue === childNodeValue) {
          node.nodeValue = i.toString()
          const value = values[i++];
          const parent = node.parentNode;
          if (parent) insert(parent, value, node);
        }
      }
    }
    return [...clone.childNodes];
  }
  return (render) as unknown as JSX.Element
}

