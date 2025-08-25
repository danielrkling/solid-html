

import { H } from "./h";
import { AssignmentRules, ComponentRegistry } from "./types";
import { doc, isFunction } from "./util";


const xmlns = ["on", "prop", "bool", "attr", "ref", "style", "class", "xlink",]
  .map((ns) => `xmlns:${ns}="/"`)
  .join(" ");

const marker = "MARKER46846";
const markerRX = new RegExp(`(${marker})`, "g");
const markerAttr = new RegExp(`=${marker}`, "g");

const start = `$START$`
const end = `$END$`
const match = /\$START\$(\d+)\$END\$/g

const xmlCache = new WeakMap<TemplateStringsArray, Node>();

/**
 * Parses a template string as XML and returns the child nodes, using a cache for performance.
 * @internal
 */
function getXml(strings: TemplateStringsArray) {
  let xml = xmlCache.get(strings);
  if (xml === undefined) {
    let contents = "", i = 0
    const l = strings.length
    for (i; i < l - 1; i++) {
      const part = strings[i]
      if (part.endsWith("=")) {
        contents += `${part}"${start}${i}${end}"`
      } else {
        contents += `${part}${start}${i}${end}`
      }
    }
    contents += strings.at(-1)
    // const contents = strings.join(marker).replace(markerAttr, `="${marker}"`);

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

    function nodes(node: Node) {
      if (node.nodeType === 1) {
        // element
        const { tagName, childNodes, attributes } = (node as Element);

        // gather props
        const props = {} as Record<string, any>;
        for (let { name, value } of attributes) {

          const m = [...value.matchAll(match)]
          if (m.length === 1) {
            value = values[Number(m[0][1])];
          } else if (m.length > 1) {
            const parts = value.split(match)
            let j = 0
            const val = parts.map((x, i) => (i % 2 === 1 ? values[Number(m[j++][1])] : x));
            //@ts-expect-error 
            value = () => val.map(getValue).join("");
          }
          props[name] = value;
        }

        // children - childNodes overwrites any props.children
        if (childNodes.length) {
          props.children = ()=> (Array.from(childNodes).map(nodes));
        }

        return xml.h(tagName, props);
      } else if (node.nodeType === 3) {
        // text

        const value = node.nodeValue || "";
        const m = [...value.matchAll(match)]
        if (m.length) {
          if (m[0][0] === m[0].input.trim()) {
            return values[index++];
          } else {
            const parts = value.split(match)
            let j = 0
            const v = parts.map((x, i) => (i % 2 === 1 ? values[Number(m[j++][1])] : x));
            return v
          }
        }
        return value
      } else if (node.nodeType === 8) {
        // comment
        const value = node.nodeValue || "";
        const m = [...value.matchAll(match)]
        if (m.length) {
          let j = 0
          const val = value.split(match)
            .map((x, i) => (i % 2 === 1 ? values[Number(m[j++][1])] : x));
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
