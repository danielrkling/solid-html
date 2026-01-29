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
declare const OPEN_TAG_TOKEN = 0;
declare const CLOSE_TAG_TOKEN = 1;
declare const SLASH_TOKEN = 2;
declare const IDENTIFIER_TOKEN = 3;
declare const EQUALS_TOKEN = 4;
declare const ATTRIBUTE_VALUE_TOKEN = 5;
declare const TEXT_TOKEN = 6;
declare const EXPRESSION_TOKEN = 7;
declare const QUOTE_CHAR_TOKEN = 8;
interface OpenTagToken {
  type: typeof OPEN_TAG_TOKEN;
  value: "<";
}
interface CloseTagToken {
  type: typeof CLOSE_TAG_TOKEN;
  value: ">";
}
interface SlashToken {
  type: typeof SLASH_TOKEN;
  value: "/";
}
interface IdentifierToken {
  type: typeof IDENTIFIER_TOKEN;
  value: string;
}
interface EqualsToken {
  type: typeof EQUALS_TOKEN;
  value: "=";
}
interface AttributeValueToken {
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
interface QuoteCharToken {
  type: typeof QUOTE_CHAR_TOKEN;
  value: "'" | '"';
}
type Token = OpenTagToken | CloseTagToken | SlashToken | IdentifierToken | EqualsToken | AttributeValueToken | TextToken | ExpressionToken | QuoteCharToken;
//#endregion
//#region src/parse.d.ts
declare const ROOT_NODE = 0;
declare const ELEMENT_NODE = 1;
declare const TEXT_NODE = 2;
declare const EXPRESSION_NODE = 3;
declare const BOOLEAN_PROP = 0;
declare const STATIC_PROP = 1;
declare const EXPRESSION_PROP = 2;
declare const SPREAD_PROP = 3;
declare const MIXED_PROP = 4;
interface RootNode {
  type: typeof ROOT_NODE;
  children: ChildNode[];
}
type ChildNode = ElementNode | TextNode | ExpressionNode;
interface ElementNode {
  type: typeof ELEMENT_NODE;
  name: string;
  props: PropNode[];
  children: ChildNode[];
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
//# sourceMappingURL=index.d.ts.map