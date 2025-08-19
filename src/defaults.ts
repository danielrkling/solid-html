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
  assignAttributeNS,
  assignBooleanAttribute,
  assignClass,
  assignDelegatedEvent,
  assignEvent,

  assignProperty,
  assignRef,
  assignStyle,
} from "./assign";
import { H } from "./h";
import { XML } from "./xml";
import { HTML } from "./html";
import { HTML_RESULT, SVG_RESULT, MATHML_RESULT } from "./lit-html";
import { ValidComponent } from "solid-js";
import { AssignmentRules, ComponentRegistry } from "./types";


export const defaultRules: AssignmentRules = [
  { filter: "on:", assign: assignEvent, isReactive: false },
  { filter: "on", assign: assignDelegatedEvent, isReactive: false },
  { filter: "prop:", assign: assignProperty },
  { filter: "bool:", assign: assignBooleanAttribute },
  { filter: "attr:", assign: assignAttribute },
  { filter: "ref:", assign: assignRef, isReactive: false },
  { filter: "class:", assign: assignClass },
  { filter: "style:", assign: assignStyle },
  { filter: "@", assign: assignDelegatedEvent },
  { filter: ".", assign: assignProperty },
  { filter: "?", assign: assignBooleanAttribute },
  { filter: "", assign: assignAttribute }
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


export const h = H();

export const xml = XML()

export const html = HTML(HTML_RESULT);

export const svg = HTML(SVG_RESULT);

export const mathml = HTML(MATHML_RESULT);
