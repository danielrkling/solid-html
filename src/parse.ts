import {
  ATTRIBUTE_VALUE_TOKEN,
  CLOSE_TAG_TOKEN,
  EQUALS_TOKEN,
  EXPRESSION_TOKEN,
  IDENTIFIER_TOKEN,
  IdentifierToken,
  OPEN_TAG_TOKEN,
  QUOTE_CHAR_TOKEN,
  SLASH_TOKEN,
  TEXT_TOKEN,
  Token,
  TokenType,
} from "./tokenize";

// Node type constants
export const ROOT_NODE = 0;
export const ELEMENT_NODE = 1;
export const TEXT_NODE = 2;
export const EXPRESSION_NODE = 3;

// Prop type constants
export const BOOLEAN_PROP = 0;
export const STATIC_PROP = 1;
export const EXPRESSION_PROP = 2;
export const SPREAD_PROP = 3;
export const MIXED_PROP = 4;

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

export interface RootNode {
  type: typeof ROOT_NODE;
  children: ChildNode[];
}

export type ChildNode = ElementNode | TextNode | ExpressionNode;

export interface ElementNode {
  type: typeof ELEMENT_NODE;
  name: string | number;
  props: PropNode[];
  children: ChildNode[];
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

      // Optimization: Only trim if the string is small and looks like whitespace
      // Most meaningful text nodes are longer or contain non-whitespace characters
      let shouldPush = true;
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
          shouldPush = false;
        }
      }

      if (shouldPush) {
        currentParent.children.push({ type: TEXT_NODE, value: val });
      }
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
        const nameToken = tokens[pos + 2];
        // Ensure we only pop if the tag matches (prevents stack corruption)
        if (nameToken && nameToken.type === IDENTIFIER_TOKEN) {
          if (
            stack.length > 1 &&
            (stack[stack.length - 1] as ElementNode).name === nameToken.value
          ) {
            stack.pop();
          }
        }
        pos += 4; // skip <, /, name, >
        continue;
      }

      // Handle Opening Tag: <name ...>
      pos++; // consume <
      const tagName = (tokens[pos++] as IdentifierToken).value;
      const node: ElementNode = {
        type: ELEMENT_NODE,
        name: tagName,
        props: [],
        children: [],
      };

      // Inline Prop Parsing Loop
      while (pos < len) {
        const t = tokens[pos];
        if (t.type === CLOSE_TAG_TOKEN || t.type === SLASH_TOKEN) break;

        if (t.type === EXPRESSION_TOKEN) {
          node.props.push({ type: SPREAD_PROP, value: t.value });
          pos++;
          continue;
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
                const part = tokens[pos++];
                if (part.value !== "") parts.push(part.value as any);
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
            node.props.push({ name: pName, type: BOOLEAN_PROP, value: true });
          }
          continue;
        }
        pos++;
      }

      currentParent.children.push(node);

      // Handle Self-Closing/Void Logic
      if (tokens[pos]?.type === SLASH_TOKEN) {
        pos += 2; // skip / and >
      } else if (voidElements.has(tagName)) {
        pos++; // skip >
      } else {
        pos++; // skip >
        stack.push(node); // Move context into this element
      }
      continue;
    }

    pos++;
  }

  return root;
}
