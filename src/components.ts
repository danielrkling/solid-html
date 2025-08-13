import {
  type Context as _Context,
  ErrorBoundary as _ErrorBoundary,
  For as _For,
  Index as _Index,
  Match as _Match,
  Show as _Show,
  Suspense as _Suspense,
  Switch as _Switch,
  type JSX,
} from "solid-js";
import { MaybeFunction, h, once } from "./h";

/**
 * Solid-compatible Show component. Renders children if `when` is truthy, otherwise renders `fallback`.
 * @example
 * Show(() => isVisible(), html`<span>Hello</span>`, "Fallback")
 */
export function Show(
  when: () => boolean,
  children: MaybeFunction<JSX.Element>,
  fallback?: MaybeFunction<JSX.Element>
): JSX.Element {
  return h(_Show, {
    when,
    children,
    fallback,
    //@ts-expect-error
    keyed: false,
  });
}

/**
 * Show component with keyed mode. Renders children with keyed context if `when` is truthy.
 * @example
 * ShowKeyed(() => user(), user => html`<span>${user.name}</span>`, "No user")
 */
export function ShowKeyed<T>(
  when: () => T,
  children: JSX.Element | ((item: NonNullable<T>) => JSX.Element),
  fallback?: MaybeFunction<JSX.Element>
): JSX.Element {
  return h(_Show, {
    when,
    //@ts-expect-error
    children,
    fallback,
    keyed: true,
  });
}

/**
 * Switch component for conditional rendering. Renders the first matching child, or `fallback` if none match.
 * @example
 * Switch("No match", Match(() => cond1(), html`A`), Match(() => cond2(), html`B`))
 */
export function Switch(
  fallback: MaybeFunction<JSX.Element>,
  ...children: JSX.Element[]
): JSX.Element {
  return h(_Switch, { children, fallback });
}

/**
 * Match component for use inside Switch. Renders children if `when` is truthy.
 * @example
 * Match(() => value() === 1, html`One`)
 */
export function Match<T>(
  when: () => T | undefined | null | false,
  children: JSX.Element | ((item: T) => JSX.Element)
): JSX.Element {
  //@ts-expect-error
  return h(_Match, { when, children, keyed: false });
}

/**
 * Keyed Match component for use inside Switch. Renders children with keyed context if `when` is truthy.
 * @example
 * MatchKeyed(() => user(), user => html`<span>${user.name}</span>`)
 */
export function MatchKeyed<T>(
  when: () => T | undefined | null | false,
  children: JSX.Element | ((item: T) => JSX.Element)
): JSX.Element {
  // @ts-expect-error
  return h(_Match, { when, children, keyed: true });
}

/**
 * For component for iterating over arrays. Renders children for each item in `each`.
 * @example
 * For(() => items(), (item) => html`<li>${item}</li>`)
 */
export function For<T extends readonly any[]>(
  each: () => T | false | null | undefined,
  children: (item: T[number], index: () => number) => JSX.Element,
  fallback?: MaybeFunction<JSX.Element>
): JSX.Element {
  return h(_For, {
    get each() {
      return each();
    },
    children: once(children),
    fallback,
  });
}

/**
 * Index component for iterating over arrays by index. Renders children for each item in `each`.
 * @example
 * Index(() => items(), (item, i) => html`<li>${item()}</li>`)
 */
export function Index<T extends readonly any[]>(
  each: () => T | false | null | undefined,
  children: (item: () => T[number], index: number) => JSX.Element,
  fallback?: MaybeFunction<JSX.Element>
): JSX.Element {
  return h(_Index, {
    get each() {
      return each();
    },
    children: once(children),
    fallback,
  });
}

/**
 * Suspense component for async boundaries. Renders `children` or `fallback` while loading.
 * @example
 * Suspense(html`<div>Loaded</div>`, html`<div>Loading...</div>`)
 */
export function Suspense(
  children: MaybeFunction<JSX.Element>,
  fallback?: MaybeFunction<JSX.Element>
): JSX.Element {
  return h(_Suspense, { children, fallback });
}

/**
 * ErrorBoundary component. Catches errors in children and renders `fallback` on error.
 * @example
 * ErrorBoundary(html`<App />`, (err) => html`<div>Error: ${err.message}</div>`)
 */
export function ErrorBoundary(
  children: MaybeFunction<JSX.Element>,
  fallback:
    | MaybeFunction<JSX.Element>
    | ((err: any, reset: () => void) => JSX.Element)
): JSX.Element {
  return h(_ErrorBoundary, { children, fallback });
}

/**
 * Context provider component. Provides a context value to all children.
 * @example
 * Context(MyContext, value, () => html`<Child />`)
 */
export function Context<T>(
  context: _Context<T>,
  value: T | (() => T),
  children: () => JSX.Element
): JSX.Element {
  return h(context.Provider, { value, children });
}
