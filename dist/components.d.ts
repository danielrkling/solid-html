import { Accessor, Context as Context$1, JSX } from "solid-js";

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
export { Context, ErrorBoundary, For, Index, Match, MatchKeyed, Show, ShowKeyed, Suspense, Switch };
//# sourceMappingURL=components.d.ts.map