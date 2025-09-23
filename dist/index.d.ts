import { ErrorBoundary, For, Index, JSX, Match, Show, Suspense, Switch } from "solid-js";

//#region src/types.d.ts
type MaybeFunction<T> = T | (() => T);
type MaybeFunctionProps<T> = { [K in keyof T]: K extends `on${string}` | "ref" ? T[K] : MaybeFunction<T[K]> };
type IntrinsicElementsMaybeFunction = { [K in keyof JSX.IntrinsicElements]: MaybeFunctionProps<JSX.IntrinsicElements[K]> };
type FunctionComponent = (...args: any[]) => JSX.Element;
type ComponentRegistry = Record<string, FunctionComponent>;
//#endregion
//#region src/sld.d.ts
type SLDInstance<T extends ComponentRegistry> = {
  (strings: TemplateStringsArray, ...values: any[]): JSX.Element;
  sld: SLDInstance<T>;
  SLD<TNew extends ComponentRegistry>(components: TNew): SLDInstance<T & TNew>;
  components: T;
  elements: IntrinsicElementsMaybeFunction;
};
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
type Property = [name: string, value: ValueParts];
type ValueParts = string | boolean | number | Array<string | number>;
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
declare function SLD(components?: {}): SLDInstance<{
  For: typeof For;
  Index: typeof Index;
  Match: typeof Match;
  Suspense: typeof Suspense;
  ErrorBoundary: typeof ErrorBoundary;
  Show: typeof Show;
  Switch: typeof Switch;
}>;
declare const sld: SLDInstance<{
  For: typeof For;
  Index: typeof Index;
  Match: typeof Match;
  Suspense: typeof Suspense;
  ErrorBoundary: typeof ErrorBoundary;
  Show: typeof Show;
  Switch: typeof Switch;
}>;
/**
 * Helper function for giving better typescript to components. Wrap in createComponent but keep same signature of function. Helps for overlaods.
 * @param component Function of component
 * @returns
 */
declare function comp<T extends FunctionComponent>(component: T): T;
//#endregion
export { SLD, SLDInstance, comp, createSLD, sld as default, sld, defaultComponents, parse };
//# sourceMappingURL=index.d.ts.map