import {
  createComponent,
  type ComponentProps,
  type JSX,
  type ValidComponent,
} from "solid-js";
import { spread, SVGElements } from "solid-js/web";
import { doc, isFunction, isString } from "./util";


/**
 * A value or a function returning a value. Used for reactive or static props.
 * @example
 * type X = MaybeFunction<string>; // string | () => string
 */
export type MaybeFunction<T> = T | (() => T);


/**
 * Props where each value can be a value or a function, except for event handlers and refs.
 * @example
 * type P = MaybeFunctionProps<{ foo: number; onClick: () => void }>
 */
export type MaybeFunctionProps<T extends Record<string, any>> = {
  [K in keyof T]: K extends `on${string}` | "ref" ? T[K] : MaybeFunction<T[K]>;
};


/**
 * Hyperscript function for Solid-compatible components and elements. Accepts a component or tag name, props, and children.
 * Children passed as arguments override `children` in props.
 * @example
 * h("button", { onClick: () => alert("Hi") }, "Click Me")
 * h(MyComponent, { foo: 1 }, html`<span>Child</span>`)
 */
export function h<T extends ValidComponent>(
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
    const elem = doc.createElement(component);
    spread(elem, props, SVGElements.has(component));
    return elem;
  } else if (isFunction(component)) {
    return createComponent(component, wrapProps(props));
  }
}


const markedOnce = new WeakSet();

/**
 * Marks a function so it is not wrapped as a getter by h().
 * Useful for event handlers or functions that should not be auto-accessed.
 * @example
 * once(() => doSomething())
 */
export function once<T extends (...args: any[]) => any>(fn: T): T {
  markedOnce.add(fn);
  return fn;
}


/**
 * Internal: Replaces accessor props with getters for reactivity, except for refs and event handlers.
 */
function wrapProps<
  TComponent extends ValidComponent,
  TProps extends MaybeFunctionProps<ComponentProps<TComponent>>
>(props: TProps = {} as TProps): ComponentProps<TComponent> {
  for (const [key, descriptor] of Object.entries(
    Object.getOwnPropertyDescriptors(props)
  )) {
    const value = descriptor.value;
    if (
      key !== "ref" &&
      key.slice(0, 2) !== "on" &&
      isFunction(value) &&
      value.length === 0 &&
      !markedOnce.has(value)
    ) {
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
