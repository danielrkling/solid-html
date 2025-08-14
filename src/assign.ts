import {
  addEventListener,
  DelegatedEvents,
  delegateEvents,
  effect,
  insert,
} from "solid-js/web";
import { isFunction } from "./util";
import { markedOnce } from "./h";

export type AssignmentFunction = (
  node: Element,
  name: string,
  value: any,
  prev: any
) => any;

export type AssignmentRule = [string, AssignmentFunction];
export type AssignmentRules = Array<AssignmentRule>;

export function assignEvent(
  node: Element,
  name: string,
  value: any,
  prev?: any
) {
  node.addEventListener(name, value);
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
}

export function assignProperty(
  node: Element,
  name: string,
  value: any,
  prev?: any
) {
  node[name] = value;
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
}

export function assignAttribute(
  node: Element,
  name: string,
  value: any,
  prev?: any
) {
  node.setAttribute(name, value);
}

export function assignRef(node: Element, name: string, value: any, prev?: any) {
  if (isFunction(value)) {
    value(node);
  }
}

export const defaultRules: AssignmentRules = [
  ["on:", assignEvent],
  ["prop:", assignProperty],
  ["bool:", assignBooleanAttribute],
  ["attr:", assignAttribute],
  ["ref:", assignRef],
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
  for (const [prefix, assignFn] of rules) {
    if (name.startsWith(prefix)) {
      elem.removeAttribute(name); // Remove the original attribute to prevent conflicts
      name = name.slice(prefix.length);
      if (isFunction(value) && !markedOnce.has(value)) {
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
  prev?: any
) {
  if (isFunction(props) && !markedOnce.has(props)) {
    effect(() => {
      spreadProps(rules, elem, props());
    });
  } else {
    spreadProps(rules, elem, props);
  }
}

function spreadProps(
  rules: AssignmentRules,
  elem: Element,
  props: Record<string, any>
) {
  for (const [name, value] of Object.entries(props)) {
    if (name === "children") {
      insert(elem, value);
    } else {
      assign(rules, elem, name, value);
    }
  }
}
