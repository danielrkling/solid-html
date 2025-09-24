import { createComponent, ErrorBoundary, For, Index, Match, Show, Suspense, Switch } from "solid-js";
import { createSLD, } from "./sld";
import { type FunctionComponent, type SLDInstance } from "./types";

export { parse } from "./parse";
export { createSLD, SLDInstance };

export const defaultComponents = {
    For,
    Index,
    Match,
    Suspense,
    ErrorBoundary,
    Show,
    Switch,
};

export function SLD(components = {}) {
    return createSLD({ ...defaultComponents, ...components });
}

export const sld = createSLD(defaultComponents)

export default sld

/**
 * Helper function for giving better typescript to components. Wrap in createComponent but keep same signature of function. Helps for overlaods.
 * @param component Function of component
 * @returns 
 */
export function run<T extends FunctionComponent>(component: T): T {
    //@ts-expect-error
    return (props)=>createComponent(component, props)
}