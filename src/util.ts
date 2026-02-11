import { SVGElements } from "solid-js/web";
import { ELEMENT_NODE, ElementNode, ChildNode } from "./parse";

export const flat = (arr: any[]) => {
  return arr.length === 1 ? arr[0] : arr;
}

export const getValue = (value: any) => {
  while (typeof value === "function") value = value();
  return value;
}

export const createElement = (name: string, isSVG = false) => {
  return isSVG
        ? document.createElementNS("http://www.w3.org/2000/svg", name)
        : document.createElement(name);
}

/**
 * Checks if a node is a Component.
 * In your parser, a node is a component if:
 * 1. It is an ELEMENT_NODE AND
 * 2. Its name is a number (dynamic expression) OR
 * 3. Its name is a string starting with an Uppercase letter (static component).
 */
export const isComponentNode = (name: string): boolean => {
  const char = name.charCodeAt(0);
  return (
    char >= 65 && char <= 90 // Uppercase A-Z
  );
}


export const voidElements = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

export const rawTextElements = new Set([
  "script",
  "style",
  "textarea",
  "title",
]);
