import {
  addEventListener,
  DelegatedEvents,
  delegateEvents,
  effect,
  insert,
} from "solid-js/web";
import { isFunction, isString } from "./util";
import { AssignmentRule } from "./types";




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
  (node as HTMLElement).style[name as any] = value ? value : "";
  return value;
}


export function assignRef(node: Element, name: string, value: any, prev?: any) {
  if (isFunction(value)) {
    value(node);
  }
}

export function assign(
  rules: AssignmentRule[],
  elem: Element,
  name: string,
  value: any,
  prev?: any
) {
  if (value === prev) return value;
  //special cases
  if (name === "children") {
    return insert(elem, value);
  } else   if (name === "ref"){
    return assignRef(elem, name, value, prev);
  } else if (name === "..."){
    return spread(rules, elem, value, prev);
  }

  for (const rule of rules) {
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
}



export function spread(
  rules: AssignmentRule[],
  elem: Element,
  props: any,
  prev: any = {}
) {

  if (isFunction(props)) {
    effect(() => {
      for (const [name, value] of Object.entries(props())) {
        prev[name] = assign(rules, elem, name, value, prev[name]);
      }
    });
  } else {
    for (const [name, value] of Object.entries(props)) {
      prev[name] = assign(rules, elem, name, value, prev[name]);
    }
  }
  return prev;
}

