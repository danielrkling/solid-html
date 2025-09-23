import { JSX } from "solid-js";


export type MaybeFunction<T> = T | (() => T);
export type MaybeFunctionProps<T> = {
    [K in keyof T]: K extends `on${string}` | "ref" ? T[K] : MaybeFunction<T[K]>;
};
export type IntrinsicElementsMaybeFunction = {
    [K in keyof JSX.IntrinsicElements]: MaybeFunctionProps<JSX.IntrinsicElements[K]>;
};


export type FunctionComponent = (...args: any[]) => JSX.Element
export type ComponentRegistry = Record<string, FunctionComponent>;

export type SLDInstance<T extends ComponentRegistry> = {
  (strings: TemplateStringsArray, ...values: any[]): JSX.Element;
  sld: SLDInstance<T>;
  define<TNew extends ComponentRegistry>(components: TNew): SLDInstance<T & TNew>;
  components: T;
  elements: JSX.IntrinsicElements;
};