import {
  Dynamic,
  ErrorBoundary,
  For,
  Index,
  Match,
  NoHydration,
  Portal,
  Show,
  Suspense,
  Switch,
} from "solid-js/web";
import {
  assignAttribute,
  assignBooleanAttribute,
  assignClass,
  assignDelegatedEvent,
  assignEvent,
  assignProperty,
  assignRef,
  assignStyle
} from "./assign";
import { H } from "./h";
import { HTML } from "./html";
import { AssignmentRule, ComponentRegistry } from "./types";



export const defaultRules: AssignmentRule[] = [
  { filter: "on:", assign: assignEvent, isReactive: false },
  { filter: "on", assign: assignDelegatedEvent, isReactive: false },
  { filter: "prop:", assign: assignProperty },
  { filter: "bool:", assign: assignBooleanAttribute },
  { filter: "attr:", assign: assignAttribute },
  { filter: "ref:", assign: assignRef, isReactive: false },
  { filter: "class:", assign: assignClass },
  { filter: "style:", assign: assignStyle },
  { filter: "@", assign: assignDelegatedEvent, isReactive: false },
  { filter: ".", assign: assignProperty },
  { filter: "?", assign: assignBooleanAttribute },
  { filter: "", assign: assignAttribute } //default
]



export const defaultComponents: ComponentRegistry = {
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
}

export const xmlNamespaces = ["on", "prop", "bool", "attr", "ref", "style", "class", "xlink"]


export const h = H();

export const html = HTML()
//link global xml with global h
html.h = h

