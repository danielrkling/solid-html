import {
    Context,
    ErrorBoundary as _ErrorBoundary,
    For as _For,
    Index as _Index,
    Match as _Match,
    Show as _Show,
    Suspense as _Suspense,
    Switch as _Switch,
    type JSX
} from "solid-js";
import { MaybeFunction, h, once } from "./h";








//Wrapper function to correct types
export function Show(
  when: () => boolean,
  children:  MaybeFunction<JSX.Element>,
  fallback?: MaybeFunction<JSX.Element>
) {
  return h(_Show, ({
    when,
    children,
    fallback,
    //@ts-expect-error
    keyed: false
  }));
}

//Wrapper function for keyed show
export function Keyed<T>(
  when: () => T,
  children: JSX.Element | ((item: NonNullable<T>) => JSX.Element),
  fallback?: MaybeFunction<JSX.Element>
) {
  return h(_Show, {
    when,
    //@ts-expect-error
    children,
    fallback,
    keyed: true
  });
}

//Wrapper function for For



export function Switch(fallback: MaybeFunction<JSX.Element>, ...children: JSX.Element[]) {
  return h(_Switch, { children, fallback });
}

export function Match<T>(when: () => (T | undefined | null | false),
  children: JSX.Element | ((item: T) => JSX.Element)) {
  //@ts-expect-error
  return h(_Match, { when, children, keyed: false })
}

export function MatchKeyed<T>(when: () => (T | undefined | null | false),
  children: JSX.Element | ((item: T) => JSX.Element)) {
  //@ts-expect-error
  return h(_Match, { when, children, keyed: true })
}

export function For<T extends readonly any[]>(
  each: () => T | false | null | undefined,
  children: (item: T[number], index: () => number) => JSX.Element,
  fallback?: MaybeFunction<JSX.Element>
) {
  return h(_For, {
    get each() {
      return each();
    },
    children: once(children),
    fallback,
  });
}

//Wrapper function for Index
export function Index<T extends readonly any[]>(
  each: () => T | false | null | undefined,
  children: (item: () => T[number], index: number) => JSX.Element,
  fallback?: MaybeFunction<JSX.Element>
) {
  return h(_Index, {
    get each() {
      return each();
    },
    children: once(children),
    fallback,
  });
}

//Wrapper function for Suspsense
export function Suspense(children: MaybeFunction<JSX.Element>, fallback?: MaybeFunction<JSX.Element>) {
  return h(_Suspense, { children, fallback });
}

export function ErrorBoundary(
  children: MaybeFunction<JSX.Element>,
  fallback: MaybeFunction<JSX.Element> | ((err: any, reset: () => void) => JSX.Element)
): JSX.Element {
  return h(_ErrorBoundary, { children, fallback })
}

//Context must have lazy children
export function Context<T>(context: Context<T>, value: T | (() => T), children: ()=>JSX.Element) {
  return h(context.Provider, { value, children })
}