import { xmlNamespaces } from "./defaults";
import { H } from "./h";
import { AssignmentRule, ComponentRegistry } from "./types";
import { doc, isFunction, toArray } from "./util";

const start = `$START$`
const end = `$END$`
const match = /\$START\$(\d+)\$END\$/g

const xmlCache = new WeakMap<TemplateStringsArray, Node>();

/**
 * Parses a template string as XML and returns the child nodes, using a cache for performance.
 * @internal
 */
function getXml(strings: TemplateStringsArray, xmlns: string[]) {
  let xml = xmlCache.get(strings);
  if (xml === undefined) {
    let contents = "", i = 0
    const l = strings.length
    //Join XML with index so proper value can be extracted later independent of when it's executed
    for (i; i < l - 1; i++) {
      const part = strings[i]
      // Allows no quotes for single attribute. Causes edge case for =${} in text nodes or within attribute values. Can be fixed with ${'=' + var}
      if (part.endsWith("=")) {
        contents += `${part}"${start}${i}${end}"`
      } else {
        contents += `${part}${start}${i}${end}`
      }
    }
    contents += strings.at(-1)

    const namespaces = xmlns
      .map((ns) => `xmlns:${ns}="/"`)
      .join(" ");

    const parser = new DOMParser();
    xml = parser.parseFromString(`<xml ${namespaces}>${contents}</xml>`, "text/xml")
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

function extractValues(values: any[], value: string | null, convertMultiPartToString = false) {
  if (value === null) return null
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

export function XML(components: ComponentRegistry = {}, rules: AssignmentRule[] = [], xmlns: string[] = []) {
  function xml(template: TemplateStringsArray, ...values: any[]) {
    const cached = getXml(template, xml.xlmns);

    function nodes(node: Node) {
      if (node.nodeType === 1) {
        // Element Node
        const { tagName, childNodes, attributes } = (node as Element);

        // gather props
        const props = {} as Record<string, any>;
        for (let { name, value } of attributes) {
          props[name] = extractValues(values, value, true);
        }

        // children - childNodes overwrites any props.children
        if (childNodes.length) {
          props.children = () => flat(toArray(childNodes).map(nodes));
        }

        return xml.h(tagName, props);
      } else if (node.nodeType === 3) {
        // Text Node
        return extractValues(values, node.nodeValue);
      } else if (node.nodeType === 8) {
        // Comment Node
        return doc.createComment(extractValues(values, node.nodeValue, true));
      } else {
        console.error(`xml: nodeType not supported ${node.nodeType}`);
      }
    }

    return flat(toArray(cached).map(nodes));
  }

  xml.xlmns = [...xmlNamespaces, ...xmlns]
  xml.h = H(components, rules);

  return xml;
}
