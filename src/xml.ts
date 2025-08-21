

import { H } from "./h";
import { AssignmentRules, ComponentRegistry } from "./types";
import { doc, isFunction } from "./util";


const xmlns = ["on", "prop", "bool", "attr", "ref", "style", "class", "xlink",]
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

function makeCallback(children) {
  return () => (q, u, a, c, k) =>
    [children].flat(Infinity).map(x => (typeof x === "function" ? x(q, u, a, c, k) : x));
}

export function XML(components: ComponentRegistry = {}, rules: AssignmentRules = []) {
  function xml(template: TemplateStringsArray, ...values: any[]) {
    const cached = getXml(template);
    let index = 0;

    function nodes(node: any) {
      // console.log(node)
      if (node.nodeType === 1) {
        // element
        const { tagName, childNodes, attributes } = node;

        // gather props
        const props = {} as Record<string, any>;
        for (let { name, value } of attributes) {

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

        // children - childNodes overwrites any props.children
        if (childNodes.length) {
          props.children = makeCallback(Array.from(childNodes).map(nodes));
        }

        return xml.h(tagName, props);
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

  xml.h = H(components, rules);

  return xml;
}
