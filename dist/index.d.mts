import { ComponentProps, Context as Context$1, ErrorBoundary as ErrorBoundary$1, For as For$1, Index as Index$1, JSX, Match as Match$1, Show as Show$1, Suspense as Suspense$1, Switch as Switch$1, ValidComponent } from "solid-js";
import { Dynamic, NoHydration, Portal } from "solid-js/web";

//#region src/h.d.ts
type MaybeFunction<T> = T | (() => T);
type MaybeFunctionProps<T extends Record<string, any>> = { [K in keyof T]: K extends `on${string}` | "ref" ? T[K] : MaybeFunction<T[K]> };
declare function h<T extends ValidComponent>(component: T, props: MaybeFunctionProps<ComponentProps<T>>, ...children: JSX.Element[]): JSX.Element;
declare function once<T extends (...args: any[]) => any>(fn: T): T;
declare function wrapProps<TComponent extends ValidComponent, TProps extends MaybeFunctionProps<ComponentProps<TComponent>>>(props?: TProps): ComponentProps<TComponent>;
//#endregion
//#region src/components.d.ts
declare function Show(when: () => boolean, children: MaybeFunction<JSX.Element>, fallback?: MaybeFunction<JSX.Element>): JSX.Element;
declare function Keyed<T>(when: () => T, children: JSX.Element | ((item: NonNullable<T>) => JSX.Element), fallback?: MaybeFunction<JSX.Element>): JSX.Element;
declare function Switch(fallback: MaybeFunction<JSX.Element>, ...children: JSX.Element[]): JSX.Element;
declare function Match<T>(when: () => (T | undefined | null | false), children: JSX.Element | ((item: T) => JSX.Element)): JSX.Element;
declare function MatchKeyed<T>(when: () => (T | undefined | null | false), children: JSX.Element | ((item: T) => JSX.Element)): JSX.Element;
declare function For<T extends readonly any[]>(each: () => T | false | null | undefined, children: (item: T[number], index: () => number) => JSX.Element, fallback?: MaybeFunction<JSX.Element>): JSX.Element;
declare function Index<T extends readonly any[]>(each: () => T | false | null | undefined, children: (item: () => T[number], index: number) => JSX.Element, fallback?: MaybeFunction<JSX.Element>): JSX.Element;
declare function Suspense(children: MaybeFunction<JSX.Element>, fallback?: MaybeFunction<JSX.Element>): JSX.Element;
declare function ErrorBoundary(children: MaybeFunction<JSX.Element>, fallback: MaybeFunction<JSX.Element> | ((err: any, reset: () => void) => JSX.Element)): JSX.Element;
declare function Context<T>(context: Context$1<T>, value: T | (() => T), children: () => JSX.Element): JSX.Element;
//#endregion
//#region src/html.d.ts
declare const html: (strings: TemplateStringsArray, ...values: any[]) => JSX.Element;
declare const svg: (strings: TemplateStringsArray, ...values: any[]) => JSX.Element;
declare const mathml: (strings: TemplateStringsArray, ...values: any[]) => JSX.Element;
//#endregion
//#region src/xml.d.ts
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
export { Context, ErrorBoundary, For, Index, Keyed, Match, MatchKeyed, MaybeFunction, MaybeFunctionProps, Show, Suspense, Switch, XML, h, html, mathml, once, svg, wrapProps, xml };
//# sourceMappingURL=index.d.mts.map