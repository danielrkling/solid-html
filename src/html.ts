import { type JSX } from "solid-js";
import {
  effect,
  insert,
  SVGElements
} from "solid-js/web";

import {
  boundAttributeSuffix,
  getTemplateHtml,
  HTML_RESULT,
  marker,
  markerMatch,
  MATHML_RESULT,
  ResultType,
  SVG_RESULT,
} from "./lit-html";
import { doc, isFunction } from "./util";
import { AssignmentRules } from "./types";
import { assign, spread } from "./assign";
import { defaultRules } from "./defaults";



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
 * Creates a tagged template function for html/svg/mathml templates with Solid reactivity.
 * @internal
 */
export function HTML(type: ResultType = 1, rules: AssignmentRules = []) {
  function html(
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
                effect(() => spread(rules, node as Element, value()));
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


    return render as unknown as JSX.Element;
  };


  html.rules = [...rules, ...defaultRules];

  return html;
}

