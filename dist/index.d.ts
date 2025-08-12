import { ComponentProps } from 'solid-js';
import { Context as Context_2 } from 'solid-js';
import { JSX as JSX_2 } from 'solid-js';
import { ValidComponent } from 'solid-js';

export declare function Context<T>(context: Context_2<T>, value: T | (() => T), children: () => JSX_2.Element): JSX_2.Element;

export declare function ErrorBoundary(children: MaybeFunction<JSX_2.Element>, fallback: MaybeFunction<JSX_2.Element> | ((err: any, reset: () => void) => JSX_2.Element)): JSX_2.Element;

export declare function For<T extends readonly any[]>(each: () => T | false | null | undefined, children: (item: T[number], index: () => number) => JSX_2.Element, fallback?: MaybeFunction<JSX_2.Element>): JSX_2.Element;

export declare function h<T extends ValidComponent>(component: T, props: MaybeFunctionProps<ComponentProps<T>>, ...children: JSX_2.Element[]): JSX_2.Element;

export declare function html(strings: TemplateStringsArray, ...values: any[]): JSX_2.Element;

export declare function Index<T extends readonly any[]>(each: () => T | false | null | undefined, children: (item: () => T[number], index: number) => JSX_2.Element, fallback?: MaybeFunction<JSX_2.Element>): JSX_2.Element;

export declare function JSX(): {
    (template: TemplateStringsArray, ...values: any[]): any;
    components: {
        For: any;
        Index: any;
        Match: any;
        Suspense: any;
        ErrorBoundary: any;
        Show: any;
        Switch: any;
        Dynamic: any;
        Portal: any;
        NoHydration: any;
    };
    define(userComponents: Record<string, any>): void;
};

export declare const jsx: {
    (template: TemplateStringsArray, ...values: any[]): any;
    components: {
        For: any;
        Index: any;
        Match: any;
        Suspense: any;
        ErrorBoundary: any;
        Show: any;
        Switch: any;
        Dynamic: any;
        Portal: any;
        NoHydration: any;
    };
    define(userComponents: Record<string, any>): void;
};

export declare function Keyed<T>(when: () => T, children: JSX_2.Element | ((item: NonNullable<T>) => JSX_2.Element), fallback?: MaybeFunction<JSX_2.Element>): JSX_2.Element;

export declare function Match<T>(when: () => (T | undefined | null | false), children: JSX_2.Element | ((item: T) => JSX_2.Element)): JSX_2.Element;

export declare function MatchKeyed<T>(when: () => (T | undefined | null | false), children: JSX_2.Element | ((item: T) => JSX_2.Element)): JSX_2.Element;

export declare type MaybeFunction<T> = T | (() => T);

export declare type MaybeFunctionProps<T extends Record<string, any>> = {
    [K in keyof T]: K extends `on${string}` | "ref" ? T[K] : MaybeFunction<T[K]>;
};

export declare function once<T extends (...args: any[]) => any>(fn: T): T;

export declare function Show(when: () => boolean, children: MaybeFunction<JSX_2.Element>, fallback?: MaybeFunction<JSX_2.Element>): JSX_2.Element;

export declare function Suspense(children: MaybeFunction<JSX_2.Element>, fallback?: MaybeFunction<JSX_2.Element>): JSX_2.Element;

export declare function Switch(fallback: MaybeFunction<JSX_2.Element>, ...children: JSX_2.Element[]): JSX_2.Element;

export declare function wrapProps<TComponent extends ValidComponent, TProps extends MaybeFunctionProps<ComponentProps<TComponent>>>(props?: TProps): ComponentProps<TComponent>;

export { }
