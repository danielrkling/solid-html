import * as solid_js0 from "solid-js";
import { Accessor, ComponentProps, Context as Context$1, JSX, ValidComponent } from "solid-js";

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
//#region src/components.d.ts
/**
 * Solid-compatible Show component. Renders children if `when` is truthy, otherwise renders `fallback`.
 * @example
 * Show(() => isVisible(), html`<span>Hello</span>`, "Fallback")
 */
declare function Show<T>(when: () => T, children: (item: Accessor<NonNullable<T>>) => JSX.Element, fallback?: () => JSX.Element): JSX.Element;
/**
 * Show component with keyed mode. Renders children with keyed context if `when` is truthy.
 * @example
 * ShowKeyed(() => user(), user => html`<span>${user.name}</span>`, "No user")
 */
declare function ShowKeyed<T>(when: () => T, children: ((item: NonNullable<T>) => JSX.Element), fallback?: () => JSX.Element): JSX.Element;
/**
 * Switch component for conditional rendering. Renders the first matching child, or `fallback` if none match.
 * @example
 * Switch("No match", Match(() => cond1(), html`A`), Match(() => cond2(), html`B`))
 */
declare function Switch(children: () => JSX.Element[], fallback: () => JSX.Element): JSX.Element;
/**
 * Match component for use inside Switch. Renders children if `when` is truthy.
 * @example
 * Match(() => value() === 1, html`One`)
 */
declare function Match<T>(when: () => T, children: ((item: Accessor<NonNullable<T>>) => JSX.Element)): JSX.Element;
/**
 * Keyed Match component for use inside Switch. Renders children with keyed context if `when` is truthy.
 * @example
 * MatchKeyed(() => user(), user => html`<span>${user.name}</span>`)
 */
declare function MatchKeyed<T>(when: () => T, children: ((item: NonNullable<T>) => JSX.Element)): JSX.Element;
/**
 * For component for iterating over arrays. Renders children for each item in `each`.
 * @example
 * For(() => items(), (item) => html`<li>${item}</li>`)
 */
declare function For<T extends readonly any[]>(each: () => T | false | null | undefined, children: (item: T[number], index: () => number) => JSX.Element, fallback?: () => JSX.Element): JSX.Element;
/**
 * Index component for iterating over arrays by index. Renders children for each item in `each`.
 * @example
 * Index(() => items(), (item, i) => html`<li>${item()}</li>`)
 */
declare function Index<T extends readonly any[]>(each: () => T | false | null | undefined, children: (item: () => T[number], index: number) => JSX.Element, fallback?: () => JSX.Element): JSX.Element;
/**
 * Suspense component for async boundaries. Renders `children` or `fallback` while loading.
 * @example
 * Suspense(html`<div>Loaded</div>`, html`<div>Loading...</div>`)
 */
declare function Suspense(children: () => JSX.Element, fallback?: () => JSX.Element): JSX.Element;
/**
 * ErrorBoundary component. Catches errors in children and renders `fallback` on error.
 * @example
 * ErrorBoundary(html`<App />`, (err) => html`<div>Error: ${err.message}</div>`)
 */
declare function ErrorBoundary(children: () => JSX.Element, fallback: ((err: any, reset: () => void) => JSX.Element)): JSX.Element;
/**
 * Context provider component. Provides a context value to all children.
 * @example
 * Context(MyContext, value, () => html`<Child />`)
 */
declare function Context<T>(context: Context$1<T>, value: T, children: () => JSX.Element): JSX.Element;
//#endregion
export { AssignmentFunction, AssignmentRule, ComponentRegistry, Context, ErrorBoundary, For, H, HTML, Index, Match, MatchKeyed, MaybeFunction, MaybeFunctionProps, RuleFilter, Show, ShowKeyed, Suspense, Switch, assign, assignAttribute, assignAttributeNS, assignBooleanAttribute, assignClass, assignDelegatedEvent, assignEvent, assignProperty, assignRef, assignStyle, defaultComponents, defaultRules, h, html, markedOnce, once, spread, wrapProps };
//# sourceMappingURL=index.d.ts.map