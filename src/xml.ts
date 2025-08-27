import { assign } from "./assign";
import { xmlNamespaces } from "./defaults";
import { H } from "./h";
import { AssignmentRule, ComponentRegistry } from "./types";
import { doc, isFunction, isString, toArray } from "./util";
import { IAttribute, INode, SyntaxKind, parse } from "html5parser";

//Should be unique character that would never be in the template literal
const markerStart = '⧙⧙';
const markerEnd = '⧘⧘';

//Captures index of hole
const match = new RegExp(`${markerStart}(\\d+)${markerEnd}`, "g")

const cache = new WeakMap<TemplateStringsArray, Template>();
const walker = doc.createTreeWalker(doc, 133);


type Template = {
  ast: INode[]
  attributes?: IAttribute[][]
  element?: HTMLTemplateElement
}


function getAST(strings: TemplateStringsArray): Template {
  let template = cache.get(strings);
  if (template === undefined) {
    //join string with markers and index
    const ast = parse(strings.slice(1).reduce((prev, current, index) => prev + markerStart + index + markerEnd + current, strings[0]))
    template = {
      ast      
    }
    if (!ast.some(hasComponents)){
      template.element = document.createElement("template");
      template.attributes = [];
      buildTemplate(ast,template.element.content, template.attributes!);      
    }
    cache.set(strings, template);
  }
  return template;
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

    if(cached.element && cached.attributes){
      const clone = cached.element.content.cloneNode(true)
      walker.currentNode = clone;

      let elemIndex = 0
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.nodeType===1){
          const attributes = cached.attributes[elemIndex++]
          for (const attribute of attributes){
            assign(xml.h.rules,node as Element,attribute.name.value,attribute.value?.value)
          }
        }
      }

    }

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


function hasComponents(node: INode): boolean | undefined {
  if (node.type===SyntaxKind.Tag){
    if (/^[A-Z]/.test(node.rawName)) return  true
    return node.body?.some(hasComponents)
  }
}

function buildTemplate(nodes: INode[], parent: Node, attributes: IAttribute[][]) {
  for (const node of nodes) {
    if (node.type === SyntaxKind.Tag) {
      if (node.name.startsWith("!") || node.name.startsWith("?")) {

      } else {
        const element = doc.createElement(node.name)
        attributes.push(node.attributes)
        buildTemplate(node.body ?? [], element, attributes)
        parent.appendChild(element)
      }
    }
    if (node.type === SyntaxKind.Text) {
      const parts = node.value.split(match)
      parts.forEach((part,i)=>{
        if (i % 2 ===1){
          const comment = doc.createComment(markerStart+part+markerEnd)
          parent.appendChild(comment)
        } else if (part.trim() !== "") {
          const text = doc.createTextNode(part)
          parent.appendChild(text)
        }
      })
    }
  }
}

