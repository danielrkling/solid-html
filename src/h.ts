import {
  createComponent,
  type ComponentProps,
  type JSX,
  type ValidComponent,
} from "solid-js";
import { spread } from "solid-js/web";
import { doc, isFunction, isString } from "./util";

export type MaybeFunction<T> = T | (() => T);

export type MaybeFunctionProps<T extends Record<string, any>> = {
  [K in keyof T]: K extends `on${string}` | "ref" ? T[K] : MaybeFunction<T[K]>;
};

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
    spread(elem, wrapProps(props));
    return elem;
  } else if (isFunction(component)) {
    return createComponent(component, wrapProps(props));
  }
}

const markedOnce = new WeakSet();
export function once<T extends (...args: any[]) => any>(fn: T): T {
  markedOnce.add(fn);
  return fn;
}

//Replaces Accessor props with getters
export function wrapProps<
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
