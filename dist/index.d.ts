import * as solid_js0 from "solid-js";
import { ComponentProps, JSX, ValidComponent } from "solid-js";

//#region src/types.d.ts

/**
 * A value or a function returning a value. Used for reactive or static props.
 * @example
 * type X = MaybeFunction<string>; // string | () => string
 */
type MaybeFunction<T> = T | (() => T);
/**
 * Props where each value can be a value or a function, except for event handlers and refs.
 * @example
 * type P = MaybeFunctionProps<{ foo: number; onClick: () => void }>
 */
type MaybeFunctionProps<T extends Record<string, any>> = { [K in keyof T]: K extends `on${string}` | "ref" ? T[K] : MaybeFunction<T[K]> };
type AssignmentFunction = (node: Element, name: string, value: any, prev: any) => any;
type RuleFilter = (node: Element, name: string, value: any, prev: any) => string;
type AssignmentRule = {
  filter: string | RuleFilter;
  assign: AssignmentFunction;
  isReactive?: boolean;
};
type ComponentRegistry = Record<string, ValidComponent>;
//#endregion
//#region src/h.d.ts
declare function H(components?: Record<string, any>, rules?: AssignmentRule[]): {
  <T extends ValidComponent>(component: T, props: MaybeFunctionProps<ComponentProps<T>>, ...children: JSX.Element[]): JSX.Element;
  components: {
    [x: string]: any;
  };
  define(components: Record<string, ValidComponent>): void;
  rules: AssignmentRule[];
};
declare const markedOnce: WeakSet<WeakKey>;
/**
 * Marks a function so it is not wrapped as a getter by h().
 * Useful for event handlers or functions that should not be auto-accessed.
 * @example
 * once(() => doSomething())
 */
declare function once<T extends (...args: any[]) => any>(fn: T): T;
/**
 * Internal: Replaces accessor props with getters for reactivity, except for refs and event handlers.
 */
declare function wrapProps<TComponent extends ValidComponent, TProps extends MaybeFunctionProps<ComponentProps<TComponent>>>(props?: TProps): ComponentProps<TComponent>;
//#endregion
//#region src/html.d.ts
declare function HTML(components?: ComponentRegistry, rules?: AssignmentRule[]): {
  (strings: TemplateStringsArray, ...values: any[]): any;
  h: {
    <T extends solid_js0.ValidComponent>(component: T, props: MaybeFunctionProps<solid_js0.ComponentProps<T>>, ...children: solid_js0.JSX.Element[]): solid_js0.JSX.Element;
    components: {
      [x: string]: any;
    };
    define(components: Record<string, solid_js0.ValidComponent>): void;
    rules: AssignmentRule[];
  };
};
//#endregion
//#region src/assign.d.ts
declare function assignEvent(node: Element, name: string, value: any, prev?: any): any;
declare function assignDelegatedEvent(node: Element, name: string, value: any, prev?: any): any;
declare function assignProperty(node: Element, name: string, value: any, prev?: any): any;
declare function assignBooleanAttribute(node: Element, name: string, value: any, prev?: any): any;
declare function assignAttribute(node: Element, name: string, value: any, prev?: any): any;
declare function assignAttributeNS(namespace: string, node: Element, name: string, value: any, prev?: any): any;
declare function assignClass(node: Element, name: string, value: any, prev?: any): any;
declare function assignStyle(node: Element, name: string, value: any, prev?: any): any;
declare function assignRef(node: Element, name: string, value: any, prev?: any): void;
declare function assign(rules: AssignmentRule[], elem: Element, name: string, value: any, prev?: any): any;
declare function spread(rules: AssignmentRule[], elem: Element, props: any, prev?: any): any;
//#endregion
//#region src/defaults.d.ts
declare const defaultRules: AssignmentRule[];
declare const defaultComponents: ComponentRegistry;
declare const h: {
  <T extends solid_js0.ValidComponent>(component: T, props: MaybeFunctionProps<solid_js0.ComponentProps<T>>, ...children: solid_js0.JSX.Element[]): solid_js0.JSX.Element;
  components: {
    [x: string]: any;
  };
  define(components: Record<string, solid_js0.ValidComponent>): void;
  rules: AssignmentRule[];
};
declare const html: {
  (strings: TemplateStringsArray, ...values: any[]): any;
  h: {
    <T extends solid_js0.ValidComponent>(component: T, props: MaybeFunctionProps<solid_js0.ComponentProps<T>>, ...children: solid_js0.JSX.Element[]): solid_js0.JSX.Element;
    components: {
      [x: string]: any;
    };
    define(components: Record<string, solid_js0.ValidComponent>): void;
    rules: AssignmentRule[];
  };
};
//#endregion
export { AssignmentFunction, AssignmentRule, ComponentRegistry, H, HTML, MaybeFunction, MaybeFunctionProps, RuleFilter, assign, assignAttribute, assignAttributeNS, assignBooleanAttribute, assignClass, assignDelegatedEvent, assignEvent, assignProperty, assignRef, assignStyle, defaultComponents, defaultRules, h, html, markedOnce, once, spread, wrapProps };
//# sourceMappingURL=index.d.ts.map