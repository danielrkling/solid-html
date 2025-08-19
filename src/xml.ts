import {
  ErrorBoundary,
  For,
  Index,
  Match,
  Show,
  Suspense,
  Switch,
} from "solid-js";
import { H } from "./h";
import { Dynamic, NoHydration, Portal } from "solid-js/web";
import { doc, isFunction } from "./util";
import { AssignmentRules, defaultRules } from "./assign";
import { Config, defaultConfig } from "./config";

const xmlns = ["on", "prop", "bool", "attr", "ref", "xlink", "xml"]
  .map((ns) => `xmlns:${ns}="/"`)
  .join(" ");

const marker = "MARKER46846";
const markerRX = new RegExp(`(${marker})`, "g");
const markerAttr = new RegExp(`=${marker}`, "g");

const xmlCache = new WeakMap<TemplateStringsArray, Node>();

/**
 * Parses a template string as XML and returns the child nodes, using a cache for performance.
 * @internal
 */
function getXml(strings: TemplateStringsArray) {
  let xml = xmlCache.get(strings);
  if (xml === undefined) {
    const contents = strings.join(marker).replace(markerAttr, `="${marker}"`);
    const parser = new DOMParser();
    xml = parser.parseFromString(`<xml ${xmlns}>${contents}</xml>`, "text/xml")
      .firstChild!;
    xmlCache.set(strings, xml);
  }
  return xml.childNodes;
}

const flat = (arr: any) => (arr.length === 1 ? arr[0] : arr);
function getValue(value: any) {
  while (isFunction(value)) value = value();
  return value;
}
const toArray = Array.from;

/**
 * Converts parsed XML nodes and values into Solid hyperscript calls.
 * @internal
 */
function toH(config: Config = defaultConfig, cached: NodeList, values: any[]) {
  let index = 0;
  const h = H(config);
  function nodes(node: any) {
    // console.log(node)
    if (node.nodeType === 1) {
      // element
      const tagName = node.tagName;

      // gather props
      const props = {} as Record<string, any>;
      for (let { name, value } of node.attributes) {
        if (value === marker) {
          value = values[index++];
        } else if (value.includes(marker)) {
          const val = value
            .split(markerRX)
            .map((x: string) => (x === marker ? values[index++] : x));

          value = () => val.map(getValue).join("");
        }
        props[name] = value;
      }

      // gather children
      const childNodes = node.childNodes;
      if (childNodes.length) {
        Object.defineProperty(props, "children", {
          get() {
            return flat(
              toArray(childNodes)
                .map(nodes)
                .filter((n) => n)
            );
          },
        });
      }

      /[A-Z]/.test(tagName) &&
        !config.components[tagName] &&
        console.warn(`xml: Forgot to jsx.define({ ${tagName} })?`);

      return h(config.components[tagName] || tagName, props);
    } else if (node.nodeType === 3) {
      // text

      const value = node.nodeValue;
      if (value.trim() === marker) {
        return values[index++];
      }
      return value.includes(marker)
        ? value
            .split(markerRX)
            .map((x: string) => (x === marker ? values[index++] : x))
        : value;
    } else if (node.nodeType === 8) {
      // comment
      const value = node.nodeValue;
      if (value.includes(marker)) {
        const val = value
          .split(markerRX)
          .map((x: string) => (x === marker ? values[index++] : x));
        return () => doc.createComment(val.map(getValue).join(""));
      } else {
        return doc.createComment(value);
      }
    } else {
      console.error(`xml: nodeType not supported ${node.nodeType}`);
    }
  }

  return flat(toArray(cached).map(nodes));
}

/**
 * Creates an XML template tag function for Solid, supporting custom component registries.
 * Use `xml.define({ ... })` to add or override components.
 *
 * @example
 * const xml = XML({ MyComponent })
 * xml`<MyComponent foo="bar">${child}</MyComponent>`
 *
 * @param userComponents Custom components to add to the registry.
 * @returns An xml template tag function.
 */
export function XML(config: Config = defaultConfig) {
  function xml(template: TemplateStringsArray, ...values: any[]) {
    return toH(config, getXml(template), values);
  }

  return xml;
}

/**
 * Default XML template tag for Solid, with built-in registry. Use `xml.define` to add components.
 *
 * @example
 * xml`<For each=${list}>${item => xml`<div>${item}</div>`}</For>`
 */
export const xml = XML(defaultConfig);
