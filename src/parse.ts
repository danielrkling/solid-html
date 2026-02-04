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
export const EXPRESSION_NODE = "Expr";

// Prop type constants
export const BOOLEAN_PROP = "Bool";
export const STATIC_PROP = "Static";
export const EXPRESSION_PROP = "Expre";
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
    const token = tokens[pos];
    const currentParent = stack[stack.length - 1];

    // 1. TEXT PATH (with filtering)
    if (token.type === TEXT_TOKEN) {
      const val = token.value;

      const trimmed = val.trim();
      if (trimmed === "") {
        const prev = tokens[pos - 1]?.type;
        const next = tokens[pos + 1]?.type;
        // Filter out if between two tags or at start/end of a tag
        if (
          prev === CLOSE_TAG_TOKEN ||
          prev === OPEN_TAG_TOKEN ||
          next === OPEN_TAG_TOKEN
        ) {
          pos++;
          continue;
        }
      }

      currentParent.children.push({ type: TEXT_NODE, value: val });
      pos++;
      continue;
    }

    // 2. EXPRESSION PATH
    if (token.type === EXPRESSION_TOKEN) {
      currentParent.children.push({
        type: EXPRESSION_NODE,
        value: token.value,
      });
      pos++;
      continue;
    }

    // 3. TAG PATH
    if (token.type === OPEN_TAG_TOKEN) {
      const next = tokens[pos + 1];


      // Handle Closing Tag: </name>
      if (next && next.type === SLASH_TOKEN) {

        if (stack.length > 1) {
          const nameToken = tokens[pos + 2];

          if (nameToken?.type === IDENTIFIER_TOKEN &&
            (stack[stack.length - 1] as ElementNode).name === nameToken.value) {
            stack.pop();
            pos += 4; // Move past <, /, (name or /), and >
            continue;
          } else {
            throw new Error(`Mismatched Clsoing Tag`)
          }
        } else {
          throw new Error(`No Tag to Close`)
        }


      }

      if (next && next.type === IDENTIFIER_TOKEN) {
        // Handle Opening Tag: <name ...>
        pos++; // consume <
        const tagName = next.value;
        const node: ElementNode = {
          type: ELEMENT_NODE,
          name: tagName,
          props: [],
          children: [],
        };
        currentParent.children.push(node)
        pos++

        // Inline Prop Parsing Loop
        while (pos < len) {
          const t = tokens[pos];
          console.log("props", t)
          if (t.type === CLOSE_TAG_TOKEN || t.type === SLASH_TOKEN) {
            // pos++;
            break;
          };

          if (t.type === EXPRESSION_TOKEN) {
            node.props.push({ type: SPREAD_PROP, value: t.value });
            pos++;
            continue;
          }

          if (t.type === SPREAD_TOKEN) {
            const expr = tokens[pos + 1]
            if (expr && expr.type === EXPRESSION_TOKEN) {
              node.props.push({ type: SPREAD_PROP, value: expr.value });
              pos += 2
              continue;
            } else {
              throw new Error(`No expression to spread`)
            }
          }

          if (t.type === IDENTIFIER_TOKEN) {
            const pName = t.value;
            pos++;

            if (tokens[pos]?.type === EQUALS_TOKEN) {
              pos++; // consume =
              const valToken = tokens[pos];

              if (valToken.type === EXPRESSION_TOKEN) {
                node.props.push({
                  name: pName,
                  type: EXPRESSION_PROP,
                  value: valToken.value,
                });
                pos++;
              } else if (valToken.type === QUOTE_CHAR_TOKEN) {
                const q = valToken.value;
                pos++; // consume opening quote

                let parts: (string | number)[] = [];
                while (pos < len && tokens[pos].type !== QUOTE_CHAR_TOKEN) {
                  const part = tokens[pos++] as ExpressionToken | AttributeToken;
                  if (part.value !== "") parts.push(part.value);
                }
                pos++; // consume closing quote

                if (parts.length === 0) {
                  node.props.push({
                    name: pName,
                    type: STATIC_PROP,
                    value: "",
                    quote: q,
                  });
                } else if (parts.length === 1) {
                  const v = parts[0];
                  node.props.push({
                    name: pName,
                    type: typeof v === "string" ? STATIC_PROP : EXPRESSION_PROP,
                    value: v as any,
                    quote: q,
                  });
                } else {
                  node.props.push({
                    name: pName,
                    type: MIXED_PROP,
                    value: parts,
                    quote: q,
                  });
                }
              }
            } else {
              node.props.push({
                type: BOOLEAN_PROP,
                name: pName,
                value: true
              })
            }

            continue;
          }

          // A token that is not an attribute or a tag closer is invalid here.
          throw new Error(`Unexpected token in tag: ${JSON.stringify(t)}`);

        }

        if (tokens[pos].type === CLOSE_TAG_TOKEN){
          pos++
          stack.push(node)
        }else if (tokens[pos].type === SLASH_TOKEN && tokens[pos+1].type===CLOSE_TAG_TOKEN){
          pos+=2
        }
        continue;
      }

      pos++
      continue; // Continue main parsing loop
    }

    if (pos<len){
      throw new Error(`Unexpected Token: ${JSON.stringify(token)}`)
    }
    
    pos++;
  }

  return root;
}


