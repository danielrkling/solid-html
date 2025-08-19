import {
  addEventListener,
  DelegatedEvents,
  delegateEvents,
  effect,
  insert,
} from "solid-js/web";
import { isFunction, isString } from "./util";
import { Config } from "./config";

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
  name = name.toLowerCase()
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

export function assignAttributeNS(
  namespace: string,
  node: Element,
  name: string,
  value: any,
  prev?: any,
) {
  if (value === null || value === undefined) {
    node.removeAttributeNS(namespace, name);
    return value;
  }
  node.setAttributeNS(namespace, name, value);
  return value;
}

export function assignClass(
  node: Element,
  name: string,
  value: any,
  prev?: any
) {
  node.classList.toggle(name, !!value);
  return value;
}

export function assignStyle(
  node: Element,
  name: string,
  value: any,
  prev?: any
) {
  (node as HTMLElement).style[name] = value ? value : "";
  return value;
}


export function assignRef(node: Element, name: string, value: any, prev?: any) {
  if (isFunction(value)) {
    value(node);
  }
}

/**
 * Assigns a property, attribute, boolean, or event handler to an element, supporting reactivity.
 * @internal
 */
export function assign(
  config: Config,
  elem: Element,
  name: string,
  value: any,
  prev?: any
) {
  if (value === prev) return value;
  if (name === "children") {
    return insert(elem, value);
  }

  for (const rule of config.rules) {
    const { filter, assign, isReactive = true } = rule;
    if (isString(filter) && name.startsWith(filter)) {
      name = name.slice(filter.length);
    } else if (isFunction(filter)) {
      name = filter(elem, name, value, prev);
    } else {
      continue;
    }
    if (name) {
      if (isFunction(value) && isReactive) {
        effect(() => (prev = assign(elem, name, value(), prev)));
      } else {
        assign(elem, name, value, prev);
      }
      return prev;
    }
  }
  if (isFunction(value)) {
    effect(() => (prev = config.defaultRule(elem, name, value(), prev)));
  } else {
    prev = config.defaultRule(elem, name, value, prev);
  }
  return prev;
}



export function spread(
  config: Config,
  elem: Element,
  props: any,
  prev: any = {}
) {

  if (isFunction(props)) {
    effect(() => {
      for (const [name, value] of Object.entries(props())) {
        prev[name] = assign(config, elem, name, value, prev[name]);
      }
    });
  } else {
    for (const [name, value] of Object.entries(props)) {
      prev[name] = assign(config, elem, name, value, prev[name]);
    }
  }
  return prev;
}

