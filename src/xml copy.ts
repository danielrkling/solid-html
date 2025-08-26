import { xmlNamespaces } from "./defaults";
import { H } from "./h";
import { AssignmentRule, ComponentRegistry } from "./types";
import { doc, isFunction, toArray } from "./util";
import { INode, SyntaxKind, parse } from "html5parser";

const start = `$START$`
const end = `$END$`
const match = /\$START\$(\d+)\$END\$/g

const xmlCache = new WeakMap<TemplateStringsArray, INode[]>();

/**
 * Parses a template string as XML and returns the child nodes, using a cache for performance.
 * @internal
 */
function getXml(strings: TemplateStringsArray, xmlns: string[]) {
  let xml = xmlCache.get(strings);
  if (xml === undefined) {
    const str = strings.slice(1).reduce((p,c,i,a)=>p+start+i+end+c,strings[0])
    xml = parse(str,{setAttributeMap:true})
    xmlCache.set(strings, xml);
  }
  return xml;
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

    function nodes(node: INode): any {

      if (node.type === SyntaxKind.Tag) {
        if (node.name.startsWith("!") || node.name.startsWith("?")){
          return doc.createComment(extractValues(values, flat(toArray(node.body!).map(nodes)), true));
        }
        // gather props
        const props = {} as Record<string, any>;
        for (let { name, value } of node.attributes) {
          props[name.value] = extractValues(values, value?.value!, true);
        }

        // children - childNodes overwrites any props.children
        if (node.body?.length) {
          props.children = () => flat(toArray(node.body!).map(nodes));
        }

        return xml.h(node.rawName, props);
      } else if (node.type === SyntaxKind.Text) {
        // Text Node
        return extractValues(values, node.value);
      } else {
        console.error(`xml: nodeType not supported ${node}`);
      }
    }

    return flat(toArray(cached).map(nodes));
  }

  xml.xlmns = [...xmlNamespaces, ...xmlns]
  xml.h = H(components, rules);

  return xml;
}
