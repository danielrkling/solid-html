import { xmlNamespaces } from "./defaults";
import { H } from "./h";
import { AssignmentRule, ComponentRegistry } from "./types";
import { doc, isFunction, isString, toArray } from "./util";
import { INode, SyntaxKind, parse } from "html5parser";

//Should be unique character that would never be in the template literal
const markerStart = '⧙⧙';
const markerEnd = '⧘⧘';

//Captures index of hole
const match = new RegExp(`${markerStart}(\\d+)${markerEnd}`, "g")

const cachedAST = new WeakMap<TemplateStringsArray, INode[]>();


function getAST(strings: TemplateStringsArray) {
  let ast = cachedAST.get(strings);
  if (ast === undefined) {
    //join string with markers and index
    ast = parse(strings.slice(1).reduce((prev, current, index) => prev + markerStart + index + markerEnd + current, strings[0]))
    cachedAST.set(strings, ast);
  }
  return ast;
}

const flat = (arr: any) => (arr.length === 1 ? arr[0] : arr);

function getValue(value: any) {
  while (isFunction(value)) value = value();
  return value;
}


function insertValuesAtMarkers(values: any[], value: string = "", convertMultiPartToString = false) {
  const parts = value.split(match).map((v, i) => (i % 2 === 1 ? values[Number(v)] : v)).filter(v => !isString(v) || v.trim())
  return parts.length === 1 ? parts[0] : convertMultiPartToString ? () => parts.map(getValue).join("") : parts
}

export function XML(components: ComponentRegistry = {}, rules: AssignmentRule[] = []) {
  function xml(template: TemplateStringsArray, ...values: any[]) {
    const cached = getAST(template);

    function nodes(node: INode): any {
      if (node.type === SyntaxKind.Tag) {
        //Comment Node
        if (node.name.startsWith("!") || node.name.startsWith("?")) {
          //Comment nodes will not be reactive.
          return doc.createComment(insertValuesAtMarkers(values, node.body?.map(v => v.type === SyntaxKind.Text && v.value).join(""), true)());
        }

        // gather props
        const props = {} as Record<string, any>;
        for (let { name, value } of node.attributes) {
          props[name.value] = insertValuesAtMarkers(values, value?.value, true);
        }

        // children - childNodes overwrites any props.children
        if (node.body?.length) {
          props.children = () => flat(node.body!.map(nodes));
        }

        return xml.h(node.rawName, props);
      } else {
        // Text Node
        return insertValuesAtMarkers(values, node.value);
      }
    }

    return flat(toArray(cached).map(nodes));
  }

  xml.h = H(components, rules);

  return xml;
}
