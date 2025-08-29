import { SVGElements } from "solid-js/web";
import { MaybeFunction } from "./types";

export function isString(value: any): value is string {
  return typeof value === "string";
}

export function isFunction(value: any): value is Function {
  return typeof value === "function";
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

export const toArray = Array.from;


export const doc = document

export const createComment = (data:string)=>doc.createComment(data)

export function createElement(tag: string){
  return SVGElements.has(tag) ? doc.createElementNS("http://www.w3.org/2000/svg", tag) : doc.createElement(tag)
}

export function flat(arr: any[]) {
  return (arr.length === 1 ? arr[0] : arr);
}

export function getValue(value: any) {
  while (isFunction(value)) value = value();
  return value;
}