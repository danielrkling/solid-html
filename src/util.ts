import { SVGElements } from "solid-js/web";
import { ELEMENT_NODE, ElementNode, ChildNode } from "./parse";

export function isString(value: any): value is string {
  return typeof value === "string";
}

export function isNumber(value: any): value is number {
  return typeof value === "number";
}

export function isFunction(value: any): value is Function {
  return typeof value === "function";
}

export function isBoolean(value: any): value is boolean {
  return typeof value === "boolean";
}

export function isObject(value: any): value is object {
  return typeof value === "object";
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

export const toArray = Array.from;

export const createComment = (data: string) => document.createComment(data);

export function createElement(tag: string) {
  return SVGElements.has(tag)
    ? document.createElementNS("http://www.w3.org/2000/svg", tag)
    : document.createElement(tag);
}

export function flat(arr: any[]) {
  return arr.length === 1 ? arr[0] : arr;
}

export function getValue(value: any) {
  while (isFunction(value)) value = value();
  return value;
}

/**
 * Checks if a node is an ELEMENT_NODE.
 * Narrowing this allows access to node.name, node.props, and node.children.
 */
export function isElementNode(node: ChildNode): node is ElementNode {
  return node.type === ELEMENT_NODE;
}

/**
 * Checks if a node is a Component.
 * In your parser, a node is a component if:
 * 1. It is an ELEMENT_NODE AND
 * 2. Its name is a number (dynamic expression) OR
 * 3. Its name is a string starting with an Uppercase letter (static component).
 */
export function isComponentNode(node: ElementNode): boolean {
  const name = node.name;
  if (typeof name === "number") return true;
  const char = name.charCodeAt(0);
  return (
    char >= 65 && char <= 90 // Uppercase A-Z
  );
}

/**
 * Optional: Check specifically for static HTML elements (div, span, etc.)
 */
export function isHtmlElementNode(node: ElementNode): boolean {
  return !isComponentNode(node);
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
