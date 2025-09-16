import { Dynamic, ErrorBoundary, For, Index, Match, NoHydration, Portal, Show, Suspense, Switch } from "solid-js/web";
import { SLD } from "./sld";
import { createComponent } from "solid-js";
import { FunctionComponent } from "./types";

export {parse} from "./parse"

export {SLD}

export const defaultComponents = {
    For,
    Index,
    Match,
    Suspense,
    ErrorBoundary,
    Show,
    Switch,
    Dynamic,
    Portal,
    NoHydration,
};

export const sld = SLD(defaultComponents)

export default sld

/**
 * Helper function for giving better typescript to components. Wrap in createComponent but keep same signature of function. Helps for overlaods.
 * @param component Function of component
 * @returns 
 */
export function comp<T extends FunctionComponent>(component: T): T {
    //@ts-expect-error
    return (props)=>createComponent(component, props)
}