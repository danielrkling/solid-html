import {
    createComponent,
    type ComponentProps,
    type JSX,
    type ValidComponent
} from "solid-js";
import {
    spread
} from "solid-js/web";

export type MaybeFunction<T> = T | (()=>T)

export type MaybeFunctionProps<T extends Record<string, any>> = {
  [K in keyof T]: K extends `on${string}` | "ref" ? T[K] : MaybeFunction<T[K]>;
};

export function h<T extends ValidComponent>(
  component: T,
  props: MaybeFunctionProps<ComponentProps<T>>,
  ...children: JSX.Element[]
): JSX.Element {
  //children in spread syntax override children in props
  if (children.length === 1){
    //@ts-expect-error
    props.children = children[0]
  }else if (children.length >1){
    //@ts-expect-error
    props.children = children
  }

  if (typeof component === "string") {
    const elem = document.createElement(component)
    spread(elem, wrapProps(props))
    return elem
  } else if (typeof component === "function") {
    return createComponent(component, wrapProps(props))
  }
}



const markedOnce = new WeakSet()
export function once<T extends (...args: any[]) => any>(fn: T): T {
  markedOnce.add(fn)
  return fn
}


//Reaplces Accessor props with getters
export function wrapProps<
  TComponent extends ValidComponent,
  TProps extends MaybeFunctionProps<ComponentProps<TComponent>>
>(props: TProps = {} as TProps): ComponentProps<TComponent> {
  const descriptors = Object.getOwnPropertyDescriptors(props);
  for (const [key, descriptor] of Object.entries(descriptors)) {
    // console.log(key,descriptor)
    if (
      key !== "ref" &&
      key.slice(0, 2) !== "on" &&
      typeof descriptor.value === "function" &&
      (descriptor.value.length === 0) &&
      !markedOnce.has(descriptor.value)
    ) {
      const src = descriptor.value;
      Object.defineProperty(props, key, {
        get() {
          return src();
        },
        enumerable: true,
      });


    }
  }
  return props as ComponentProps<TComponent>;
}

