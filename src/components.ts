import {
  type Context as _Context,
  ErrorBoundary as _ErrorBoundary,
  For as _For,
  Index as _Index,
  Match as _Match,
  Show as _Show,
  Suspense as _Suspense,
  Switch as _Switch,
  createComponent,
  JSX,
  Accessor,
} from "solid-js";
import { MaybeFunction } from "./types";

export function getValue<T>(value: MaybeFunction<T>): T {
  if (typeof value === "function") {
    //@ts-expect-error
    return value();
  }else{
    return value;
  }
}

/**
 * Solid-compatible Show component. Renders children if `when` is truthy, otherwise renders `fallback`.
 * @example
 * Show(() => isVisible(), html`<span>Hello</span>`, "Fallback")
 */
export function Show<T>(
  when: () => T,
  children: (item: Accessor<NonNullable<T>>)=>JSX.Element,
  fallback?: ()=>JSX.Element
): JSX.Element {
  return createComponent(_Show, {
    get when() {
      return when();
    },
    //@ts-expect-error
    children,
    get fallback(){
      return fallback?.()
    },
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
  children: ((item: NonNullable<T>) => JSX.Element),
  fallback?: ()=>JSX.Element
): JSX.Element {
  return createComponent(_Show, {
    get when() {
      return when();
    },
    //@ts-expect-error
    children,
    get fallback(){
      return fallback?.()
    },
    keyed: true,
  });
}

/**
 * Switch component for conditional rendering. Renders the first matching child, or `fallback` if none match.
 * @example
 * Switch("No match", Match(() => cond1(), html`A`), Match(() => cond2(), html`B`))
 */
export function Switch(
  children: ()=>JSX.Element[],
  fallback: ()=>JSX.Element,  
): JSX.Element {
  return createComponent(_Switch, {
    get fallback() {
      return fallback();
    },
    get children(){
      return children()
    }
  });
}

/**
 * Match component for use inside Switch. Renders children if `when` is truthy.
 * @example
 * Match(() => value() === 1, html`One`)
 */
export function Match<T>(
  when: () => T,
  children: ((item: Accessor<NonNullable<T>>) => JSX.Element)
): JSX.Element {
  return createComponent(_Match, {
    get when() {
      return when();
    },
    //@ts-expect-error
    children,
  });
}

/**
 * Keyed Match component for use inside Switch. Renders children with keyed context if `when` is truthy.
 * @example
 * MatchKeyed(() => user(), user => html`<span>${user.name}</span>`)
 */
export function MatchKeyed<T>(
  when: () => T,
  children: ((item: NonNullable<T>) => JSX.Element)
): JSX.Element {
  return createComponent(_Match, {
    get when() {
      return when();
    },
    //@ts-expect-error
    children,
    keyed: true
  });
}

/**
 * For component for iterating over arrays. Renders children for each item in `each`.
 * @example
 * For(() => items(), (item) => html`<li>${item}</li>`)
 */
export function For<T extends readonly any[]>(
  each: () => T | false | null | undefined,
  children: (item: T[number], index: () => number) => JSX.Element,
  fallback?: ()=>JSX.Element
): JSX.Element {
  return createComponent(_For, {
    get each() {
      return each();
    },
    children,
    get fallback() {
      return fallback?.();
    }
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
  fallback?: ()=>JSX.Element
): JSX.Element {
  return createComponent(_Index, {
    get each() {
      return each();
    },
    children,
    get fallback() {
      return fallback?.()
    }
  });
}

/**
 * Suspense component for async boundaries. Renders `children` or `fallback` while loading.
 * @example
 * Suspense(html`<div>Loaded</div>`, html`<div>Loading...</div>`)
 */
export function Suspense(
  children: ()=>JSX.Element,
  fallback?: ()=>JSX.Element
): JSX.Element {
  return createComponent(_Suspense, {
    get children() {
      return children()
    },
    get fallback() {
      return fallback?.()
    },
  });
}

/**
 * ErrorBoundary component. Catches errors in children and renders `fallback` on error.
 * @example
 * ErrorBoundary(html`<App />`, (err) => html`<div>Error: ${err.message}</div>`)
 */
export function ErrorBoundary(
  children: ()=>JSX.Element,
  fallback: ((err: any, reset: () => void) => JSX.Element)
): JSX.Element {
  return createComponent(_ErrorBoundary, {
    get children() {
      return children()
    },
    fallback
  });
}

/**
 * Context provider component. Provides a context value to all children.
 * @example
 * Context(MyContext, value, () => html`<Child />`)
 */
export function Context<T>(
  context: _Context<T>,
  value: T,
  children: () => JSX.Element
): JSX.Element {
  return createComponent(context.Provider, {
    get children() {
      return children()
    },
    value
  });
}
