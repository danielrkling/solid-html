import { SVGElements } from "solid-js/web";
import {
  BOOLEAN_PROP,
  ChildNode,
  COMPONENT_NODE,
  ELEMENT_NODE,
  EXPRESSION_NODE,
  ROOT_NODE,
  RootNode,
  SPREAD_PROP,
  STATIC_PROP,
  TEXT_NODE,
} from "./parse";
import { createElement, isComponentNode } from "./util";

//build template element with same exact shape as tree so they can be walked through in sync
export const buildTemplate = (node: RootNode | ChildNode): void => {
  if (node.type === ROOT_NODE || node.type === COMPONENT_NODE) {
    //Criteria for using template is component or root has at least 1 element. May be be a more optimal condition.
    if (
      node.children.some((v) => v.type === ELEMENT_NODE)
    ) {
      const template = document.createElement("template");
      template.content.append(...node.children.map(buildNodes))
      // buildNodes(node.children, template.content);
      // template.innerHTML = node.children.map(buildHTML).join("");
      node.template = template;
    }
    node.children.forEach(buildTemplate);
  } else if (node.type === ELEMENT_NODE){
    node.children.forEach(buildTemplate);

  }
}

const comment = "<!--+-->";

//Lets browser handle svg,mathml, and html encoding
export const buildHTML = (node: ChildNode): string => {
  switch (node.type) {
    case TEXT_NODE:
      return node.value;
    case EXPRESSION_NODE:
      return comment;
      case COMPONENT_NODE:
        return comment
    case ELEMENT_NODE:

      let attributeHTML = "";
      let hasSpread = false;
      //props located after spread need to be applied after spread for possible overrides
      node.props = node.props.filter((prop) => {
        if (prop.type === STATIC_PROP) {
          if (prop.name.startsWith("prop:")) return true
          const name = (prop.name.startsWith("attr:"))? prop.name.slice(5): prop.name
          attributeHTML += ` ${name}=${prop.quote}${prop.value}${prop.quote}`;
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

const textTemplate = document.createElement("template")

const buildNodes = (node: ChildNode): Node =>{
switch (node.type) {
    case TEXT_NODE:
      textTemplate.innerHTML = node.value
      return document.createTextNode(textTemplate.content.textContent)
    case EXPRESSION_NODE:
      return document.createComment(node.value.toString());
    case COMPONENT_NODE:
      return document.createComment(node.name)
    case ELEMENT_NODE:

      let attributeHTML = "";
      let hasSpread = false;

      const elem = createElement(node.name,node.isSVG)
      //props located after spread need to be applied after spread for possible overrides
      node.props = node.props.filter((prop) => {
        if (prop.type === STATIC_PROP) {
          if (prop.name.startsWith("prop:")) return true
          const name = (prop.name.startsWith("attr:"))? prop.name.slice(5): prop.name
          elem.setAttribute(name,prop.value)
          return hasSpread;
        } else if (prop.type === BOOLEAN_PROP) {
          // attributeHTML += ` ${prop.name}`;
          elem.setAttribute(prop.name,"")
          return hasSpread;
        } else if (prop.type === SPREAD_PROP) {
          hasSpread = true;
          return hasSpread;
        }
        return true;
      });
      elem.append(...node.children.map(buildNodes))

      return elem;
  }
}