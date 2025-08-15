import {
  addEventListener,
  DelegatedEvents,
  delegateEvents,
  effect,
  insert,
} from "solid-js/web";
import { isFunction } from "./util";


export type AssignmentFunction = (
  node: Element,
  name: string,
  value: any,
  prev: any
) => any;

export type AssignmentRule = [RegExp, AssignmentFunction];
export type AssignmentRules = Array<AssignmentRule>;

export function assignEvent(
  node: Element,
  name: string,
  value: any,
  prev?: any
) {
  prev && node.removeEventListener(name, prev);
  value && node.addEventListener(name, value);
  return value; 
}

export function assignDelegatedEvent(
  node: Element,
  name: string,
  value: any,
  prev?: any
) {
  let delegate = DelegatedEvents.has(name);
  addEventListener(node, name, value, delegate);
  if (delegate) delegateEvents([name]);
  return value;
}

export function assignProperty(
  node: Element,
  name: string,
  value: any,
  prev?: any
) {
  node[name] = value;
  return value;
}

export function assignBooleanAttribute(
  node: Element,
  name: string,
  value: any,
  prev?: any
) {
  if (value) {
    node.setAttribute(name, "");
  } else {
    node.removeAttribute(name);
  }
  return value;
}

export function assignAttribute(
  node: Element,
  name: string,
  value: any,
  prev?: any
) {
  if (value === null || value === undefined) {
    node.removeAttribute(name);
    return value;
  }
  node.setAttribute(name, value);
  return value;
}

export function assignRef(node: Element, name: string, value: any, prev?: any) {
  if (isFunction(value)) {
    value(node);
  }
}

export const defaultRules: AssignmentRules = [
  [/^on:(.*)/, assignEvent],
  [/^prop:(.*)/, assignProperty],
  [/^bool:(.*)/, assignBooleanAttribute],
  [/^attr:(.*)/, assignAttribute],
  [/^ref:(.*)/, assignRef],
];

/**
 * Assigns a property, attribute, boolean, or event handler to an element, supporting reactivity.
 * @internal
 */
export function assign(
  rules: AssignmentRules,
  elem: Element,
  name: string,
  value: any,
  prev?: any
) {
  if (value === prev) return value
  for (const [regexp, assignFn] of rules) {    
    const m = name.match(regexp)
    if (m) {
      name = m[1];
      if (isFunction(value)) {
        effect(() => (prev = assignFn(elem, name, value, prev)));
      } else {
        assignFn(elem, name, value, prev);
      }

      return;
    }
  }
  // If no syntax matched, default to setting the attribute
  assignAttribute(elem, name, value);
}

export function spread(
  rules: AssignmentRules,
  elem: Element,
  props: any,
  prev: any = {}
) {
  if (isFunction(props)) {
    effect(() => {
      prev = spreadProps(rules, elem, props(), prev);
    });
  } else {
    prev = spreadProps(rules, elem, props, prev);
  }
}

function spreadProps(
  rules: AssignmentRules,
  elem: Element,
  props: Record<string, any>,
  prev: any = {}
) {
  for (const [name, value] of Object.entries(props)) {
    if (name === "children") {
      insert(elem, value);
    } else {
      assign(rules, elem, name, value, prev[name]);
    }
  }
}
