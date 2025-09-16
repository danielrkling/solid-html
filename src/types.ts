import { JSX } from "solid-js";




export type FunctionComponent = (...args: any[]) => JSX.Element
export type ComponentRegistry = Record<string, FunctionComponent>;