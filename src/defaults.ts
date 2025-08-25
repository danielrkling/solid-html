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
import { HTML_RESULT, MATHML_RESULT, SVG_RESULT } from "./lit-html";
import { AssignmentRule, ComponentRegistry } from "./types";
import { XML } from "./xml";


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

export const xml = XML()
//link global xml with global h
xml.h = h

export const html = HTML(HTML_RESULT);

export const svg = HTML(SVG_RESULT);

export const mathml = HTML(MATHML_RESULT);
