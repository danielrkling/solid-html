import {
  addEventListener,
  DelegatedEvents,
  delegateEvents,
  effect,
  insert,
} from "solid-js/web";
import { isFunction, isString } from "./util";

export type AssignmentFunction = (
  node: Element,
  name: string,
  value: any,
  prev: any
) => any;

export type RuleFilter = (
  node: Element,
  name: string,
  value: any,
  prev: any
) => string;

export type AssignmentRule = {
  filter: string | RuleFilter;
  assign: AssignmentFunction;
  isReactive?: boolean;
};
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
  (node as any)[name] = value;
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
  { filter: "on:", assign: assignEvent },
  { filter: "don:", assign: assignDelegatedEvent },
  { filter: "prop:", assign: assignProperty },
  { filter: "bool:", assign: assignBooleanAttribute },
  { filter: "attr:", assign: assignAttribute },
  { filter: "ref:", assign: assignRef },
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
  if (value === prev) return value;
  for (const { filter, assign, isReactive = true } of rules) {
    if (isString(filter) && name.startsWith(filter)) {
      name = name.slice(filter.length);
    } else if (isFunction(filter)) {
      name = filter(elem, name, value, prev);
    } else {
      continue;
    }
    if (name) {
      if (isFunction(value) && isReactive) {
        effect(() => (prev = assign(elem, name, value, prev)));
      } else {
        assign(elem, name, value, prev);
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
      prev[name] = insert(elem, value, );
    } else {
      prev[name] = assign(rules, elem, name, value, prev[name]);
    }
  }
}
