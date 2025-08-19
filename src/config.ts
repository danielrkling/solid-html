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
  AssignmentFunction,
  AssignmentRules,
  assignProperty,
  assignRef,
  assignStyle,
} from "./assign";

export type Config = {
  defaultRule: AssignmentFunction;
  rules: AssignmentRules;
  components: Record<string, any>;
};

export const defaultConfig: Config = {
  defaultRule: assignAttribute,
  rules: [
    { filter: "on:", assign: assignEvent, isReactive: false },
    { filter: "on", assign: assignDelegatedEvent, isReactive: false },
    { filter: "prop:", assign: assignProperty },
    { filter: "bool:", assign: assignBooleanAttribute },
    { filter: "attr:", assign: assignAttribute },
    { filter: "ref:", assign: assignRef, isReactive: false },
    // { filter: "xlink:", assign: (e, n, v, p) => assignAttributeNS("http://www.w3.org/1999/xlink", e, n, v, p) },
    { filter: "xml:", assign: (e, n, v, p) => assignAttributeNS("http://www.w3.org/XML/1998/namespace", e, n, v, p) },
    { filter: "class:", assign: assignClass },
    { filter: "style:", assign: assignStyle },
    { filter: "@", assign: assignDelegatedEvent },
    { filter: ".", assign: assignProperty },
    { filter: "?", assign: assignBooleanAttribute },
  ],
  components: {
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
  },
};
