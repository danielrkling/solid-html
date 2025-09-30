import { JSX } from "solid-js";


export type MaybeFunction<T> = T | (() => T);
export type MaybeFunctionProps<T> = {
    [K in keyof T]: K extends `on${string}` | "ref" ? T[K] : MaybeFunction<T[K]>;
};
export type IntrinsicElementsMaybeFunction = {
    [K in keyof JSX.IntrinsicElements]: MaybeFunctionProps<JSX.IntrinsicElements[K]>;
};


export type FunctionComponent = (...args: any[]) => JSX.Element
/**
 * Component registry type
 * @example
 * ```tsx
 * const components: ComponentRegistry = {
 *   MyComponent: (props) => <div>Hello {props.name}</div>
 * }
 * ```
 */
export type ComponentRegistry = Record<string, FunctionComponent>;

/**
 * SLD Instance type
 * @template T Component registry
 */
export type SLDInstance<T extends ComponentRegistry> = {
  /**
   * SLD template function
   * @example
   * ```tsx
   * const myTemplate = sld`<div>Hello World</div>`
   * ```
   */
  (strings: TemplateStringsArray, ...values: any[]): JSX.Element;

  /**
   * Self reference to SLD instance for tooling
   * @example
   * ```tsx
   * const MyComponent: FunctionComponent = (props) => {
   *   // Use sld to create a template inside a component
   *   return mySLD.sld`<div>Hello ${props.name}</div>`
   * ```
   */
  sld: SLDInstance<T>;

  /**
   * Create a new SLD instance with additional components added to the registry
   * @param components New components to add to the registry
   * @example
   * ```tsx
   * const MyComponent: FunctionComponent = (props) => <div>Hello {props.name}</div>
   * const mySLD = sld.define({MyComponent})
   * const myTemplate = mySLD`<MyComponent name="World" />`
   * ```
   */
  define<TNew extends ComponentRegistry>(components: TNew): SLDInstance<T & TNew>;

  /**
   * Component registry
   */
  components: T;

  /**
   * For types for tools only. Not used at runtime.
   */
  elements: JSX.IntrinsicElements;
};