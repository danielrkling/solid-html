import { ValidComponent } from "solid-js";

/**
 * A value or a function returning a value. Used for reactive or static props.
 * @example
 * type X = MaybeFunction<string>; // string | () => string
 */
export type MaybeFunction<T> = T | (() => T);

/**
 * Props where each value can be a value or a function, except for event handlers and refs.
 * @example
 * type P = MaybeFunctionProps<{ foo: number; onClick: () => void }>
 */
export type MaybeFunctionProps<T extends Record<string, any>> = {
  [K in keyof T]: K extends `on${string}` | "ref" ? T[K] : MaybeFunction<T[K]>;
};

export type AssignmentFunction = (
  node: Element,
  name: string,
  value: any,
  prev: any
) => any;

export type RuleFilter = (
  node: Element,
  name: string,
  value: any,
  prev: any
) => string;

export type AssignmentRule = {
  filter: string | RuleFilter;
  assign: AssignmentFunction;
  isReactive?: boolean;
};
export type AssignmentRules = Array<AssignmentRule>;

export type ComponentRegistry = Record<string, ValidComponent>;