import {
  ATTRIBUTE_VALUE_TOKEN,
  AttributeToken,
  CLOSE_TAG_TOKEN,
  EQUALS_TOKEN,
  EXPRESSION_TOKEN,
  ExpressionToken,
  IDENTIFIER_TOKEN,
  IdentifierToken,
  OPEN_TAG_TOKEN,
  QUOTE_CHAR_TOKEN,
  SLASH_TOKEN,
  SPREAD_TOKEN,
  TEXT_TOKEN,
  Token,
} from "./tokenize";

// Node type constants
export const ROOT_NODE = "Root";
export const ELEMENT_NODE = "Elem";
export const TEXT_NODE = "Text";
export const EXPRESSION_NODE = "Expression";

// Prop type constants
export const BOOLEAN_PROP = "Bool";
export const STATIC_PROP = "Static";
export const EXPRESSION_PROP = "Expression";
export const SPREAD_PROP = "Spread";
export const MIXED_PROP = "Mixed";

export type NodeType =
  | typeof ROOT_NODE
  | typeof ELEMENT_NODE
  | typeof TEXT_NODE
  | typeof EXPRESSION_NODE;
export type PropType =
  | typeof BOOLEAN_PROP
  | typeof STATIC_PROP
  | typeof EXPRESSION_PROP
  | typeof SPREAD_PROP
  | typeof MIXED_PROP;

export type ChildNode = ElementNode | TextNode | ExpressionNode;

export interface RootNode {
  type: typeof ROOT_NODE;
  children: ChildNode[];
  template?: HTMLTemplateElement;
}

export interface ElementNode {
  type: typeof ELEMENT_NODE;
  name: string | number;
  props: PropNode[];
  children: ChildNode[];
  template?: HTMLTemplateElement;
}

export interface TextNode {
  type: typeof TEXT_NODE;
  value: string;
}

export interface ExpressionNode {
  type: typeof EXPRESSION_NODE;
  value: number;
}

export interface BooleanProp {
  name: string;
  type: typeof BOOLEAN_PROP;
  value: boolean;
}

export interface StaticProp {
  name: string;
  type: typeof STATIC_PROP;
  value: string;
  quote?: "'" | '"';
}

export interface ExpressionProp {
  name: string;
  type: typeof EXPRESSION_PROP;
  value: number;
  quote?: "'" | '"';
}

export interface SpreadProp {
  type: typeof SPREAD_PROP;
  value: number;
}

export interface MixedProp {
  name: string;
  type: typeof MIXED_PROP;
  value: Array<string | number>;
  quote?: "'" | '"';
}

export type PropNode =
  | BooleanProp
  | StaticProp
  | ExpressionProp
  | SpreadProp
  | MixedProp;

export function parse(tokens: Token[], voidElements: Set<string>): RootNode {
  const root: RootNode = { type: ROOT_NODE, children: [] };
  const stack: (RootNode | ElementNode)[] = [root];
  let pos = 0;
  const len = tokens.length;

  while (pos < len) {
    let currentToken = tokens[pos];
    const currentParent = stack.at(-1)!;


    if (currentToken.type === TEXT_TOKEN) {
      const value = currentToken.value;

      const trimmed = value.trim();
      if (trimmed === "") {
        const prev = tokens[pos - 1]?.type;
        const next = tokens[pos + 1]?.type;
        // Filter out if between two tags or at start/end of a tag
        if (
          prev === CLOSE_TAG_TOKEN ||
          next === OPEN_TAG_TOKEN
        ) {
          pos++;
          continue;
        }
      }

      currentParent.children.push({ type: TEXT_NODE, value });
      pos++;
      continue;
    } else if (currentToken.type === EXPRESSION_TOKEN) {
      currentParent.children.push({
        type: EXPRESSION_NODE,
        value: currentToken.value,
      });
      pos++;
      continue;
    } else if (currentToken.type === OPEN_TAG_TOKEN) {
      currentToken = tokens[++pos];

      // Handle Closing Tag: </name>
      if (currentToken && currentToken.type === SLASH_TOKEN) {

        if (stack.length > 1) {
          const nameToken = tokens[++pos];

          if (nameToken?.type === IDENTIFIER_TOKEN &&
            (stack.at(-1) as ElementNode).name === nameToken.value) {
            stack.pop();
            pos += 2
            continue;
          } else {
            throw new Error(`Mismatched Clsoing Tag`)
          }
        } else {
          throw new Error(`No Tag to Close`)
        }


      }

      if (currentToken && currentToken.type === IDENTIFIER_TOKEN) {
        const tagName = currentToken.value;
        const node: ElementNode = {
          type: ELEMENT_NODE,
          name: tagName,
          props: [],
          children: [],
        };
        currentParent.children.push(node)

        // Inline Prop Parsing Loop
        while (pos < len) {
          currentToken = tokens[++pos];
          console.log(currentToken)
          if (currentToken.type === CLOSE_TAG_TOKEN || currentToken.type === SLASH_TOKEN) {
            break;
          };

          if (currentToken.type === EXPRESSION_TOKEN) {
            node.props.push({ type: SPREAD_PROP, value: currentToken.value });
            // pos++;
            continue;
          }

          if (currentToken.type === SPREAD_TOKEN) {
            const expr = tokens[pos + 1]
            if (expr && expr.type === EXPRESSION_TOKEN) {
              node.props.push({ type: SPREAD_PROP, value: expr.value });
              pos++
              continue;
            } else {
              throw new Error(`No expression to spread`)
            }
          }

          if (currentToken.type === IDENTIFIER_TOKEN) {
            const name = currentToken.value;

            currentToken = tokens[++pos]
            console.log(currentToken)

            if (currentToken?.type === EQUALS_TOKEN) {
              currentToken = tokens[++pos]

              if (currentToken.type === EXPRESSION_TOKEN) {
                node.props.push({
                  name,
                  type: EXPRESSION_PROP,
                  value: currentToken.value,
                });
                // pos++;
              } else if (currentToken.type === QUOTE_CHAR_TOKEN) {
                const quote = currentToken.value;
                pos++; // consume opening quote

                let parts: (string | number)[] = [];
                while (pos < len && tokens[pos].type !== QUOTE_CHAR_TOKEN) {
                  currentToken = tokens[pos++] as ExpressionToken | AttributeToken;
                  if (currentToken.value !== "") parts.push(currentToken.value);
                }

                if (parts.length === 0) {
                  node.props.push({
                    name,
                    type: STATIC_PROP,
                    value: "",
                    quote,
                  });
                } else if (parts.length === 1) {
                  const v = parts[0];
                  node.props.push({
                    name,
                    type: typeof v === "string" ? STATIC_PROP : EXPRESSION_PROP,
                    value: v as any,
                    quote,
                  });
                } else {
                  node.props.push({
                    name,
                    type: MIXED_PROP,
                    value: parts,
                    quote,
                  });
                }
              }
            } else {
              node.props.push({
                type: BOOLEAN_PROP,
                name,
                value: true
              })
              if (currentToken.type === CLOSE_TAG_TOKEN || currentToken.type===SLASH_TOKEN){
                break;
              }
            }

            continue;
          }
        } 

        console.log(currentToken)
        if (currentToken.type === CLOSE_TAG_TOKEN) {
          pos++
          stack.push(node)
        } else if (currentToken.type === SLASH_TOKEN && tokens[pos + 1].type === CLOSE_TAG_TOKEN) {
          pos += 2
        }
        continue;
      }

      pos++
      continue; // Continue main parsing loop
    }
  }
  if (stack.length>1){
    throw new Error(`Unclosed Tag ${JSON.stringify(stack.map(v=>v.type))}`)
  }

  return root;
}


