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
  assignDelegatedEvent,
  assignEvent,
  AssignmentFunction,
  AssignmentRules,
  assignProperty,
  assignRef,
} from "./assign";

export type Config = {
  defaultRule: AssignmentFunction;
  rules: AssignmentRules;
  components: Record<string, any>;
};

export const defaultConfig: Config = {
  defaultRule: assignAttribute,
  rules: [
    { filter: "on:", assign: assignEvent },
    { filter: "don:", assign: assignDelegatedEvent },
    { filter: "prop:", assign: assignProperty },
    { filter: "bool:", assign: assignBooleanAttribute },
    { filter: "attr:", assign: assignAttribute },
    { filter: "ref:", assign: assignRef },
    {
      filter: "xlink:",
      assign: (e, n, v, p) =>
        assignAttributeNS("http://www.w3.org/1999/xlink", e, n, v, p),
    },
    {
      filter: "xml:",
      assign: (e, n, v, p) =>
        assignAttributeNS("http://www.w3.org/XML/1998/namespace", e, n, v, p),
    },
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
