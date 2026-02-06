import { createComponent, ErrorBoundary, For, Index, Match, Show, Suspense, Switch } from "solid-js";
import { createSLD, } from "./sld";
import { type FunctionComponent, type SLDInstance } from "./types";

export { parse } from "./parse";
export { createSLD, SLDInstance };

/**
 * Default components included with SLD. Can be extended with sld.define({MyComponent})
 */
export const defaultComponents = {
    For,
    Index,
    Match,
    Suspense,
    ErrorBoundary,
    Show,
    Switch,
};

/**
 * Default SLD instance with basic components included. Can be extended with sld.define({MyComponent})
 */
export const sld = createSLD(defaultComponents)
export default sld

/**
 * SLD factory function to create new SLD instances with built-in components.
 */
export const SLD = sld.define



/**
 * Helper function for giving better typescript to components. Wrap in createComponent but keep same signature of function. Helps for overlaods.
 * @param component Function of component
 * @returns 
 */
export const run = <T extends FunctionComponent>(component: T): T => {
    //@ts-expect-error
    return (props)=>createComponent(component, props)
}