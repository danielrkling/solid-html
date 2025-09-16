import { Dynamic, ErrorBoundary, For, Index, Match, NoHydration, Portal, Show, Suspense, Switch } from "solid-js/web";
import { JSX } from "solid-js";

//#region src/types.d.ts
type FunctionComponent = (...args: any[]) => JSX.Element;
type ComponentRegistry = Record<string, FunctionComponent>;
//#endregion
//#region src/sld.d.ts
type SLD<T extends ComponentRegistry> = {
  (strings: TemplateStringsArray, ...values: any[]): JSX.Element;
  sld(strings: TemplateStringsArray, ...values: any[]): JSX.Element;
  define<TNew extends ComponentRegistry>(components: TNew): SLD<T & TNew>;
} & T;
declare function SLD<T extends ComponentRegistry>(components: T): SLD<T>;
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
  Dynamic: typeof Dynamic;
  Portal: typeof Portal;
  NoHydration: typeof NoHydration;
};
declare const sld: SLD<{
  For: typeof For;
  Index: typeof Index;
  Match: typeof Match;
  Suspense: typeof Suspense;
  ErrorBoundary: typeof ErrorBoundary;
  Show: typeof Show;
  Switch: typeof Switch;
  Dynamic: typeof Dynamic;
  Portal: typeof Portal;
  NoHydration: typeof NoHydration;
}>;
/**
 * Helper function for giving better typescript to components. Wrap in createComponent but keep same signature of function. Helps for overlaods.
 * @param component Function of component
 * @returns
 */
declare function comp<T extends FunctionComponent>(component: T): T;
//#endregion
export { SLD, comp, sld as default, sld, defaultComponents, parse };
//# sourceMappingURL=index.d.ts.map