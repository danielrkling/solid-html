import {
  BOOLEAN_PROP,
  ChildNode,
  ELEMENT_NODE,
  EXPRESSION_NODE,
  ROOT_NODE,
  RootNode,
  SPREAD_PROP,
  STATIC_PROP,
  TEXT_NODE,
} from "./parse";
import { isComponentNode } from "./util";

//build template element with same exact shape as tree so they can be walked through in sync
export function buildTemplate(node: RootNode | ChildNode): void {
  if (node.type === ROOT_NODE || node.type === ELEMENT_NODE) {
    //Criteria for using template is component or root has at least 1 element. May be be a more optimal condition.
    if (
      node.type === ELEMENT_NODE && isComponentNode(node) &&
      node.children.some((v) => v.type === ELEMENT_NODE && !isComponentNode(v))
    ) {
      const template = document.createElement("template");
      // buildNodes(node.children, template.content);
      template.innerHTML = node.children.map(buildHTML).join("");
      node.template = template;
    }
    node.children.forEach(buildTemplate);
  }
}

const comment = "<--+-->";

//Lets browser handle svg,mathml, and html encoding
function buildHTML(node: ChildNode): string {
  switch (node.type) {
    case TEXT_NODE:
      return node.value;
    case EXPRESSION_NODE:
      return comment;
    case ELEMENT_NODE:
      if (isComponentNode(node)) {
        return comment;
      }
      let attributeHTML = "";
      let hasSpread = false;
      //props located after spread need to be applied after spread for possible overrides
      node.props = node.props.filter((prop) => {
        if (prop.type === STATIC_PROP) {
          attributeHTML += ` ${prop.name}=${prop.quote}${prop.value}${prop.quote}`;
          return hasSpread;
        } else if (prop.type === BOOLEAN_PROP) {
          attributeHTML += ` ${prop.name}`;
          return hasSpread;
        } else if (prop.type === SPREAD_PROP) {
          hasSpread = true;
          return hasSpread;
        }
        return true;
      });

      return `<${node.name}${attributeHTML}>${node.children.map(buildHTML).join("")}</${node.name}>`;
  }
}
