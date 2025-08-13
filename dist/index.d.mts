import { ComponentProps, Context as Context$1, ErrorBoundary as ErrorBoundary$1, For as For$1, Index as Index$1, JSX, Match as Match$1, Show as Show$1, Suspense as Suspense$1, Switch as Switch$1, ValidComponent } from "solid-js";
import { Dynamic, NoHydration, Portal } from "solid-js/web";

//#region src/h.d.ts

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
/**
 * Hyperscript function for Solid-compatible components and elements. Accepts a component or tag name, props, and children.
 * Children passed as arguments override `children` in props.
 * @example
 * h("button", { onClick: () => alert("Hi") }, "Click Me")
 * h(MyComponent, { foo: 1 }, html`<span>Child</span>`)
 */
declare function h<T extends ValidComponent>(component: T, props: MaybeFunctionProps<ComponentProps<T>>, ...children: JSX.Element[]): JSX.Element;
/**
 * Marks a function so it is not wrapped as a getter by h().
 * Useful for event handlers or functions that should not be auto-accessed.
 * @example
 * once(() => doSomething())
 */
declare function once<T extends (...args: any[]) => any>(fn: T): T;
//#endregion
//#region src/components.d.ts
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
//#region src/html.d.ts
/**
 * Tagged template for creating reactive HTML templates with Solid. Use for DOM elements only.
 *
 * @example
 * html`<div class="foo">${bar}</div>`
 * html`<button @click=${onClick}>Click</button>`
 */
declare const html: (strings: TemplateStringsArray, ...values: any[]) => JSX.Element;
/**
 * Tagged template for creating reactive SVG templates with Solid. Use inside <svg> only.
 *
 * @example
 * svg`<circle cx="10" cy="10" r="5" />`
 */
declare const svg: (strings: TemplateStringsArray, ...values: any[]) => JSX.Element;
/**
 * Tagged template for creating reactive MathML templates with Solid. Use inside <math> only.
 *
 * @example
 * mathml`<math><mi>x</mi></math>`
 */
declare const mathml: (strings: TemplateStringsArray, ...values: any[]) => JSX.Element;
//#endregion
//#region src/xml.d.ts
/**
 * Creates an XML template tag function for Solid, supporting custom component registries.
 * Use `xml.define({ ... })` to add or override components.
 *
 * @example
 * const xml = XML({ MyComponent })
 * xml`<MyComponent foo="bar">${child}</MyComponent>`
 *
 * @param userComponents Custom components to add to the registry.
 * @returns An xml template tag function.
 */
declare function XML(userComponents?: Record<string, any>): {
  (template: TemplateStringsArray, ...values: any[]): any;
  components: {
    For: typeof For$1;
    Index: typeof Index$1;
    Match: typeof Match$1;
    Suspense: typeof Suspense$1;
    ErrorBoundary: typeof ErrorBoundary$1;
    Show: typeof Show$1;
    Switch: typeof Switch$1;
    Dynamic: typeof Dynamic;
    Portal: typeof Portal;
    NoHydration: typeof NoHydration;
  };
  define(userComponents: Record<string, any>): /*elided*/any;
};
/**
 * Default XML template tag for Solid, with built-in registry. Use `xml.define` to add components.
 *
 * @example
 * xml`<For each=${list}>${item => xml`<div>${item}</div>`}</For>`
 */
declare const xml: {
  (template: TemplateStringsArray, ...values: any[]): any;
  components: {
    For: typeof For$1;
    Index: typeof Index$1;
    Match: typeof Match$1;
    Suspense: typeof Suspense$1;
    ErrorBoundary: typeof ErrorBoundary$1;
    Show: typeof Show$1;
    Switch: typeof Switch$1;
    Dynamic: typeof Dynamic;
    Portal: typeof Portal;
    NoHydration: typeof NoHydration;
  };
  define(userComponents: Record<string, any>): /*elided*/any;
};
//#endregion
export { Context, ErrorBoundary, For, Index, Match, MatchKeyed, MaybeFunction, MaybeFunctionProps, Show, ShowKeyed, Suspense, Switch, XML, h, html, mathml, once, svg, xml };
//# sourceMappingURL=index.d.mts.map