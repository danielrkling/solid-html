import { ErrorBoundary, For, Index, JSX, Match, Show, Suspense, Switch } from "solid-js";

//#region src/types.d.ts

type FunctionComponent = (...args: any[]) => JSX.Element;
/**
 * Component registry type
 * @example
 * ```tsx
 * const components: ComponentRegistry = {
 *   MyComponent: (props) => <div>Hello {props.name}</div>
 * }
 * ```
 */
type ComponentRegistry = Record<string, FunctionComponent>;
/**
 * SLD Instance type
 * @template T Component registry
 */
type SLDInstance<T extends ComponentRegistry> = {
  /**
   * SLD template function
   * @example
   * ```tsx
   * const myTemplate = sld`<div>Hello World</div>`
   * ```
   */
  (strings: TemplateStringsArray, ...values: any[]): JSX.Element;
  /**
   * Self reference to SLD instance for tooling
   * @example
   * ```tsx
   * const MyComponent: FunctionComponent = (props) => {
   *   // Use sld to create a template inside a component
   *   return mySLD.sld`<div>Hello ${props.name}</div>`
   * ```
   */
  sld: SLDInstance<T>;
  /**
   * Create a new SLD instance with additional components added to the registry
   * @param components New components to add to the registry
   * @example
   * ```tsx
   * const MyComponent: FunctionComponent = (props) => <div>Hello {props.name}</div>
   * const mySLD = sld.define({MyComponent})
   * const myTemplate = mySLD`<MyComponent name="World" />`
   * ```
   */
  define<TNew extends ComponentRegistry>(components: TNew): SLDInstance<T & TNew>;
  /**
   * Component registry
   */
  components: T;
  /**
   * For types for tools only. Not used at runtime.
   */
  elements: JSX.IntrinsicElements;
};
//#endregion
//#region src/sld.d.ts
declare function createSLD<T extends ComponentRegistry>(components: T): SLDInstance<T>;
//#endregion
//#region src/tokenize.d.ts
declare const OPEN_TAG_TOKEN = "<";
declare const CLOSE_TAG_TOKEN = ">";
declare const SLASH_TOKEN = "/";
declare const IDENTIFIER_TOKEN = "IDENTIFIER";
declare const EQUALS_TOKEN = "=";
declare const ATTRIBUTE_VALUE_TOKEN = "Attr";
declare const TEXT_TOKEN = "Text";
declare const EXPRESSION_TOKEN = "${}";
declare const QUOTE_CHAR_TOKEN = "'";
declare const SPREAD_TOKEN = "...";
interface OpenTagToken {
  type: typeof OPEN_TAG_TOKEN;
}
interface CloseTagToken {
  type: typeof CLOSE_TAG_TOKEN;
}
interface SlashToken {
  type: typeof SLASH_TOKEN;
}
interface IdentifierToken {
  type: typeof IDENTIFIER_TOKEN;
  value: string;
}
interface EqualsToken {
  type: typeof EQUALS_TOKEN;
}
interface AttributeToken {
  type: typeof ATTRIBUTE_VALUE_TOKEN;
  value: string;
}
interface TextToken {
  type: typeof TEXT_TOKEN;
  value: string;
}
interface ExpressionToken {
  type: typeof EXPRESSION_TOKEN;
  value: number;
}
interface QuoteToken {
  type: typeof QUOTE_CHAR_TOKEN;
  value: "'" | '"';
}
interface SpreadToken {
  type: typeof SPREAD_TOKEN;
}
type Token = OpenTagToken | CloseTagToken | SlashToken | IdentifierToken | EqualsToken | AttributeToken | TextToken | ExpressionToken | QuoteToken | SpreadToken;
//#endregion
//#region src/parse.d.ts
declare const ROOT_NODE = "Root";
declare const ELEMENT_NODE = "Elem";
declare const TEXT_NODE = "Text";
declare const EXPRESSION_NODE = "Expression";
declare const BOOLEAN_PROP = "Bool";
declare const STATIC_PROP = "Static";
declare const EXPRESSION_PROP = "Expression";
declare const SPREAD_PROP = "Spread";
declare const MIXED_PROP = "Mixed";
type ChildNode = ElementNode | TextNode | ExpressionNode;
interface RootNode {
  type: typeof ROOT_NODE;
  children: ChildNode[];
  template?: HTMLTemplateElement;
}
interface ElementNode {
  type: typeof ELEMENT_NODE;
  name: string;
  props: PropNode[];
  children: ChildNode[];
  template?: HTMLTemplateElement;
}
interface TextNode {
  type: typeof TEXT_NODE;
  value: string;
}
interface ExpressionNode {
  type: typeof EXPRESSION_NODE;
  value: number;
}
interface BooleanProp {
  name: string;
  type: typeof BOOLEAN_PROP;
  value: boolean;
}
interface StaticProp {
  name: string;
  type: typeof STATIC_PROP;
  value: string;
  quote?: "'" | '"';
}
interface ExpressionProp {
  name: string;
  type: typeof EXPRESSION_PROP;
  value: number;
  quote?: "'" | '"';
}
interface SpreadProp {
  type: typeof SPREAD_PROP;
  value: number;
}
interface MixedProp {
  name: string;
  type: typeof MIXED_PROP;
  value: Array<string | number>;
  quote?: "'" | '"';
}
type PropNode = BooleanProp | StaticProp | ExpressionProp | SpreadProp | MixedProp;
declare function parse(tokens: Token[], voidElements: Set<string>): RootNode;
//#endregion
//#region src/index.d.ts
/**
 * Default components included with SLD. Can be extended with sld.define({MyComponent})
 */
declare const defaultComponents: {
  For: typeof For;
  Index: typeof Index;
  Match: typeof Match;
  Suspense: typeof Suspense;
  ErrorBoundary: typeof ErrorBoundary;
  Show: typeof Show;
  Switch: typeof Switch;
};
/**
 * Default SLD instance with basic components included. Can be extended with sld.define({MyComponent})
 */
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
 * SLD factory function to create new SLD instances with built-in components.
 */
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