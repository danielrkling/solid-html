import {
  createComponent,
  type ComponentProps,
  type JSX,
  type ValidComponent,
} from "solid-js";

import { spread } from "./assign";
import { defaultComponents, defaultRules } from "./defaults";

import { doc, isFunction, isString } from "./util";
import { SVGElements } from "solid-js/web";
import { AssignmentRule, MaybeFunctionProps } from "./types";

export function H(components: Record<string, any> = {}, rules: AssignmentRule[] = []) {

  function h<T extends ValidComponent>(
    component: T,
    props: MaybeFunctionProps<ComponentProps<T>>,
    ...children: JSX.Element[]
  ): JSX.Element {
    //children in spread syntax override children in props
    if (children.length === 1) {
      //@ts-expect-error
      props.children = children[0];
    } else if (children.length > 1) {
      //@ts-expect-error
      props.children = children;
    }

    if (isString(component)) {
      const componentFunction = (h.components)[component];
      if (componentFunction) {
        return createComponent(componentFunction, wrapProps(props));
      }
      
      if (/[A-Z]/.test(component)) {
        console.warn(`Forgot to define ${componentFunction}`);
      }

      const elem = createElement(component)
      spread(h.rules, elem, props);
      return elem;
    } else if (isFunction(component)) {
      return createComponent(component, wrapProps(props));
    }
  }
  h.components = {...defaultComponents, ...components};
  h.define = (components: Record<string, ValidComponent>) => {
    Object.assign(h.components, components);
  };
  h.rules = [...rules, ...defaultRules];


  return h;

}

const elementCache = new Map<string,Element>()
function createElement(tag: string){
  return SVGElements.has(tag) ? doc.createElementNS("http://www.w3.org/2000/svg", tag) : doc.createElement(tag)
  let elem = elementCache.get(tag)
  if (elem){
    return elem.cloneNode()
  }else{
    elem = SVGElements.has(tag) ? doc.createElementNS("http://www.w3.org/2000/svg", tag) : doc.createElement(tag)
    elementCache.set(tag,elem)
    return elem
  }
}

export const markedOnce = new WeakSet();

/**
 * Marks a function so it is not wrapped as a getter by h().
 * Useful for event handlers or functions that should not be auto-accessed.
 * @example
 * once(() => doSomething())
 */
export function once<T extends (...args: any[]) => any>(fn: T): T {
  if (isFunction(fn)) markedOnce.add(fn);
  return fn;
}

/**
 * Internal: Replaces accessor props with getters for reactivity, except for refs and event handlers.
 */
export function wrapProps<
  TComponent extends ValidComponent,
  TProps extends MaybeFunctionProps<ComponentProps<TComponent>>
>(props: TProps = {} as TProps): ComponentProps<TComponent> {
  for (const [key, descriptor] of Object.entries(
    Object.getOwnPropertyDescriptors(props)
  )) {
    const value = descriptor.value;
    if (isFunction(value) && value.length === 0 && !markedOnce.has(value)) {
      Object.defineProperty(props, key, {
        get() {
          return value();
        },
        enumerable: true,
      });
    }
  }
  return props as ComponentProps<TComponent>;
}
