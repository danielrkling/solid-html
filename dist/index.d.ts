import * as solid_js0 from "solid-js";
import { ComponentProps, Context as Context$1, JSX, ValidComponent } from "solid-js";

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
type AssignmentRules = Array<AssignmentRule>;
type ComponentRegistry = Record<string, ValidComponent>;
//#endregion
//#region src/components.d.ts
declare function getValue<T>(value: MaybeFunction<T>): T;
/**
 * Solid-compatible Show component. Renders children if `when` is truthy, otherwise renders `fallback`.
 * @example
 * Show(() => isVisible(), html`<span>Hello</span>`, "Fallback")
 */
declare function Show(when: () => boolean, children: MaybeFunction<JSX.Element>, fallback?: MaybeFunction<JSX.Element>): JSX.Element;
/**
 * Show component with keyed mode. Renders children with keyed context if `when` is truthy.
 * @example
 * ShowKeyed(() => user(), user => html`<span>${user.name}</span>`, "No user")
 */
declare function ShowKeyed<T>(when: () => T, children: JSX.Element | ((item: NonNullable<T>) => JSX.Element), fallback?: MaybeFunction<JSX.Element>): JSX.Element;
/**
 * Switch component for conditional rendering. Renders the first matching child, or `fallback` if none match.
 * @example
 * Switch("No match", Match(() => cond1(), html`A`), Match(() => cond2(), html`B`))
 */
declare function Switch(fallback: MaybeFunction<JSX.Element>, ...children: JSX.Element[]): JSX.Element;
/**
 * Match component for use inside Switch. Renders children if `when` is truthy.
 * @example
 * Match(() => value() === 1, html`One`)
 */
declare function Match<T>(when: () => T | undefined | null | false, children: JSX.Element | ((item: T) => JSX.Element)): JSX.Element;
/**
 * Keyed Match component for use inside Switch. Renders children with keyed context if `when` is truthy.
 * @example
 * MatchKeyed(() => user(), user => html`<span>${user.name}</span>`)
 */
declare function MatchKeyed<T>(when: () => T | undefined | null | false, children: JSX.Element | ((item: T) => JSX.Element)): JSX.Element;
/**
 * For component for iterating over arrays. Renders children for each item in `each`.
 * @example
 * For(() => items(), (item) => html`<li>${item}</li>`)
 */
declare function For<T extends readonly any[]>(each: () => T | false | null | undefined, children: (item: T[number], index: () => number) => JSX.Element, fallback?: MaybeFunction<JSX.Element>): JSX.Element;
/**
 * Index component for iterating over arrays by index. Renders children for each item in `each`.
 * @example
 * Index(() => items(), (item, i) => html`<li>${item()}</li>`)
 */
declare function Index<T extends readonly any[]>(each: () => T | false | null | undefined, children: (item: () => T[number], index: number) => JSX.Element, fallback?: MaybeFunction<JSX.Element>): JSX.Element;
/**
 * Suspense component for async boundaries. Renders `children` or `fallback` while loading.
 * @example
 * Suspense(html`<div>Loaded</div>`, html`<div>Loading...</div>`)
 */
declare function Suspense(children: MaybeFunction<JSX.Element>, fallback?: MaybeFunction<JSX.Element>): JSX.Element;
/**
 * ErrorBoundary component. Catches errors in children and renders `fallback` on error.
 * @example
 * ErrorBoundary(html`<App />`, (err) => html`<div>Error: ${err.message}</div>`)
 */
declare function ErrorBoundary(children: MaybeFunction<JSX.Element>, fallback: MaybeFunction<JSX.Element> | ((err: any, reset: () => void) => JSX.Element)): JSX.Element;
/**
 * Context provider component. Provides a context value to all children.
 * @example
 * Context(MyContext, value, () => html`<Child />`)
 */
declare function Context<T>(context: Context$1<T>, value: T | (() => T), children: () => JSX.Element): JSX.Element;
//#endregion
//#region src/h.d.ts
declare function H(components?: Record<string, any>, rules?: AssignmentRules): {
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
//#endregion
//#region src/lit-html.d.ts
/** TemplateResult types */
declare const HTML_RESULT = 1;
declare const SVG_RESULT = 2;
declare const MATHML_RESULT = 3;
type ResultType = typeof HTML_RESULT | typeof SVG_RESULT | typeof MATHML_RESULT;
/**
 * Returns an HTML string for the given TemplateStringsArray and result type
 * (HTML or SVG), along with the case-sensitive bound attribute names in
 * template order. The HTML contains comment markers denoting the `ChildPart`s
 * and suffixes on bound attributes denoting the `AttributeParts`.
 *
 * @param strings template strings array
 * @param type HTML or SVG
 * @return Array containing `[html, attrNames]` (array returned for terseness,
 *     to avoid object fields since this code is shared with non-minified SSR
 *     code)
 */
//#endregion
//#region src/html.d.ts
/**
 * Creates a tagged template function for html/svg/mathml templates with Solid reactivity.
 * @internal
 */
declare function HTML(type?: ResultType, rules?: AssignmentRules): {
  (strings: TemplateStringsArray, ...values: any[]): JSX.Element;
  rules: AssignmentRule[];
};
//#endregion
//#region src/xml.d.ts
declare function XML(components?: ComponentRegistry, rules?: AssignmentRules): {
  (template: TemplateStringsArray, ...values: any[]): any;
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
declare function assign(rules: AssignmentRules, elem: Element, name: string, value: any, prev?: any): any;
declare function spread(rules: AssignmentRules, elem: Element, props: any, prev?: any): any;
//#endregion
//#region src/defaults.d.ts
declare const defaultRules: AssignmentRules;
declare const defaultComponents: ComponentRegistry;
declare const h: {
  <T extends ValidComponent>(component: T, props: MaybeFunctionProps<solid_js0.ComponentProps<T>>, ...children: solid_js0.JSX.Element[]): solid_js0.JSX.Element;
  components: {
    [x: string]: any;
  };
  define(components: Record<string, ValidComponent>): void;
  rules: AssignmentRule[];
};
declare const xml: {
  (template: TemplateStringsArray, ...values: any[]): any;
  h: {
    <T extends ValidComponent>(component: T, props: MaybeFunctionProps<solid_js0.ComponentProps<T>>, ...children: solid_js0.JSX.Element[]): solid_js0.JSX.Element;
    components: {
      [x: string]: any;
    };
    define(components: Record<string, ValidComponent>): void;
    rules: AssignmentRule[];
  };
};
declare const html: {
  (strings: TemplateStringsArray, ...values: any[]): solid_js0.JSX.Element;
  rules: AssignmentRule[];
};
declare const svg: {
  (strings: TemplateStringsArray, ...values: any[]): solid_js0.JSX.Element;
  rules: AssignmentRule[];
};
declare const mathml: {
  (strings: TemplateStringsArray, ...values: any[]): solid_js0.JSX.Element;
  rules: AssignmentRule[];
};
//#endregion
export { AssignmentFunction, AssignmentRule, AssignmentRules, ComponentRegistry, Context, ErrorBoundary, For, H, HTML, Index, Match, MatchKeyed, MaybeFunction, MaybeFunctionProps, RuleFilter, Show, ShowKeyed, Suspense, Switch, XML, assign, assignAttribute, assignAttributeNS, assignBooleanAttribute, assignClass, assignDelegatedEvent, assignEvent, assignProperty, assignRef, assignStyle, defaultComponents, defaultRules, getValue, h, html, markedOnce, mathml, once, spread, svg, xml };
//# sourceMappingURL=index.d.ts.map