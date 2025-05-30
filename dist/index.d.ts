import { ComponentProps } from 'solid-js';
import { Context as Context_2 } from 'solid-js';
import { JSX } from 'solid-js';
import { ValidComponent } from 'solid-js';

export declare function Context<T>(context: Context_2<T>, value: T | (() => T), children: () => JSX.Element): JSX.Element;

export declare function ErrorBoundary(children: MaybeFunction<JSX.Element>, fallback: MaybeFunction<JSX.Element> | ((err: any, reset: () => void) => JSX.Element)): JSX.Element;

export declare function For<T extends readonly any[]>(each: () => T | false | null | undefined, children: (item: T[number], index: () => number) => JSX.Element, fallback?: MaybeFunction<JSX.Element>): JSX.Element;

export declare function h<T extends ValidComponent>(component: T, props: MaybeFunctionProps<ComponentProps<T>>, ...children: JSX.Element[]): JSX.Element;

export declare function html(strings: TemplateStringsArray, ...values: any[]): JSX.Element;

export declare function Index<T extends readonly any[]>(each: () => T | false | null | undefined, children: (item: () => T[number], index: number) => JSX.Element, fallback?: MaybeFunction<JSX.Element>): JSX.Element;

export declare function Keyed<T>(when: () => T, children: JSX.Element | ((item: NonNullable<T>) => JSX.Element), fallback?: MaybeFunction<JSX.Element>): JSX.Element;

export declare function Match<T>(when: () => (T | undefined | null | false), children: JSX.Element | ((item: T) => JSX.Element)): JSX.Element;

export declare function MatchKeyed<T>(when: () => (T | undefined | null | false), children: JSX.Element | ((item: T) => JSX.Element)): JSX.Element;

export declare type MaybeFunction<T> = T | (() => T);

export declare type MaybeFunctionProps<T extends Record<string, any>> = {
    [K in keyof T]: K extends `on${string}` | "ref" ? T[K] : MaybeFunction<T[K]>;
};

export declare function once<T extends (...args: any[]) => any>(fn: T): T;

export declare function Show(when: () => boolean, children: MaybeFunction<JSX.Element>, fallback?: MaybeFunction<JSX.Element>): JSX.Element;

export declare function Suspense(children: MaybeFunction<JSX.Element>, fallback?: MaybeFunction<JSX.Element>): JSX.Element;

export declare function Switch(fallback: MaybeFunction<JSX.Element>, ...children: JSX.Element[]): JSX.Element;

export declare function wrapProps<TComponent extends ValidComponent, TProps extends MaybeFunctionProps<ComponentProps<TComponent>>>(props?: TProps): ComponentProps<TComponent>;

export { }
