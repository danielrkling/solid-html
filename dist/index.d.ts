import { ErrorBoundary, For, Index, JSX, Match, Show, Suspense, Switch } from "solid-js";

//#region src/types.d.ts

type FunctionComponent = (...args: any[]) => JSX.Element;
type ComponentRegistry = Record<string, FunctionComponent>;
type SLDInstance<T extends ComponentRegistry> = {
  (strings: TemplateStringsArray, ...values: any[]): JSX.Element;
  sld: SLDInstance<T>;
  define<TNew extends ComponentRegistry>(components: TNew): SLDInstance<T & TNew>;
  components: T;
  elements: JSX.IntrinsicElements;
};
//#endregion
//#region src/sld.d.ts
declare function createSLD<T extends ComponentRegistry>(components: T): SLDInstance<T>;
//#endregion
//#region src/parse.d.ts
declare const TEXT_NODE = 1;
type TextNode = {
  type: typeof TEXT_NODE;
  value: string;
};
declare const COMMENT_NODE = 2;
type CommentNode = {
  type: typeof COMMENT_NODE;
  value: string;
};
declare const INSERT_NODE = 3;
type InsertNode = {
  type: typeof INSERT_NODE;
  value: number;
};
declare const ELEMENT_NODE = 4;
type ElementNode = {
  type: typeof ELEMENT_NODE;
  name: string;
  props: Property[];
  children: ChildNode[];
};
declare const COMPONENT_NODE = 5;
type ComponentNode = {
  type: typeof COMPONENT_NODE;
  name: string;
  props: Property[];
  children: ChildNode[];
  template?: HTMLTemplateElement;
};
declare const ROOT_NODE = 6;
type RootNode = {
  type: typeof ROOT_NODE;
  children: ChildNode[];
  template?: HTMLTemplateElement;
};
type ChildNode = TextNode | ComponentNode | ElementNode | InsertNode | CommentNode;
type Property = BooleanProperty | StringProperty | DynamicProperty | MixedProperty | SpreadProperty | AnonymousProperty;
declare const BOOLEAN_PROPERTY = 1;
type BooleanProperty = {
  type: typeof BOOLEAN_PROPERTY;
  name: string;
};
declare const STRING_PROPERTY = 2;
type StringProperty = {
  type: typeof STRING_PROPERTY;
  name: string;
  value: string;
};
declare const DYNAMIC_PROPERTY = 3;
type DynamicProperty = {
  type: typeof DYNAMIC_PROPERTY;
  name: string;
  value: number;
};
declare const MIXED_PROPERTY = 4;
type MixedProperty = {
  type: typeof MIXED_PROPERTY;
  name: string;
  value: Array<string | number>;
};
declare const SPREAD_PROPERTY = 5;
type SpreadProperty = {
  type: typeof SPREAD_PROPERTY;
  value: number;
};
declare const ANONYMOUS_PROPERTY = 6;
type AnonymousProperty = {
  type: typeof ANONYMOUS_PROPERTY;
  value: number;
};
/**
 *
 * @param input jsx like string to parse
 * @returns RootNode of an AST
 */
declare function parse(input: TemplateStringsArray): RootNode;
//#endregion
//#region src/index.d.ts
declare const defaultComponents: {
  For: typeof For;
  Index: typeof Index;
  Match: typeof Match;
  Suspense: typeof Suspense;
  ErrorBoundary: typeof ErrorBoundary;
  Show: typeof Show;
  Switch: typeof Switch;
};
declare const sld: SLDInstance<{
  For: typeof For;
  Index: typeof Index;
  Match: typeof Match;
  Suspense: typeof Suspense;
  ErrorBoundary: typeof ErrorBoundary;
  Show: typeof Show;
  Switch: typeof Switch;
}>;
declare const SLD: <TNew extends ComponentRegistry>(components: TNew) => SLDInstance<{
  For: typeof For;
  Index: typeof Index;
  Match: typeof Match;
  Suspense: typeof Suspense;
  ErrorBoundary: typeof ErrorBoundary;
  Show: typeof Show;
  Switch: typeof Switch;
} & TNew>;
/**
 * Helper function for giving better typescript to components. Wrap in createComponent but keep same signature of function. Helps for overlaods.
 * @param component Function of component
 * @returns
 */
declare function run<T extends FunctionComponent>(component: T): T;
//#endregion
export { SLD, SLDInstance, createSLD, sld as default, sld, defaultComponents, parse, run };
//# sourceMappingURL=index.d.ts.map