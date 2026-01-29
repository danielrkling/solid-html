export const OPEN_TAG_TOKEN = 0;
export const CLOSE_TAG_TOKEN = 1;
export const SLASH_TOKEN = 2;
export const IDENTIFIER_TOKEN = 3;
export const EQUALS_TOKEN = 4;
export const ATTRIBUTE_VALUE_TOKEN = 5;
export const TEXT_TOKEN = 6;
export const EXPRESSION_TOKEN = 7;
export const QUOTE_CHAR_TOKEN = 8;

export type TokenType =
  | typeof OPEN_TAG_TOKEN
  | typeof CLOSE_TAG_TOKEN
  | typeof SLASH_TOKEN
  | typeof IDENTIFIER_TOKEN
  | typeof EQUALS_TOKEN
  | typeof ATTRIBUTE_VALUE_TOKEN
  | typeof TEXT_TOKEN
  | typeof EXPRESSION_TOKEN
  | typeof QUOTE_CHAR_TOKEN;

// Character code helpers for fast path testing (faster than regex)
const isIdentifierChar = (code: number): boolean => {
  return (
    (code >= 48 && code <= 57) || // 0-9
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) || // a-z
    code === 46 || // .
    code === 58 || // :
    code === 95 || // _
    code === 45
  ); // -
};

const isWhitespace = (code: number): boolean => {
  return (code >= 9 && code <= 13) || code === 32; // \t \n \v \f \r space
};

export interface OpenTagToken {
  type: typeof OPEN_TAG_TOKEN;
  value: "<";
}

export interface CloseTagToken {
  type: typeof CLOSE_TAG_TOKEN;
  value: ">";
}

export interface SlashToken {
  type: typeof SLASH_TOKEN;
  value: "/";
}

export interface IdentifierToken {
  type: typeof IDENTIFIER_TOKEN;
  value: string;
}

export interface EqualsToken {
  type: typeof EQUALS_TOKEN;
  value: "=";
}

export interface AttributeValueToken {
  type: typeof ATTRIBUTE_VALUE_TOKEN;
  value: string;
}

export interface TextToken {
  type: typeof TEXT_TOKEN;
  value: string;
}

export interface ExpressionToken {
  type: typeof EXPRESSION_TOKEN;
  value: number;
}


export interface QuoteCharToken {
  type: typeof QUOTE_CHAR_TOKEN;
  value: "'" | '"';
}

export type Token =
  | OpenTagToken
  | CloseTagToken
  | SlashToken
  | IdentifierToken
  | EqualsToken
  | AttributeValueToken
  | TextToken
  | ExpressionToken
  | QuoteCharToken;



// Add a new state for elements that contain raw text only
const STATE_TEXT = 0;
const STATE_TAG = 1;
const STATE_ATTR_VALUE = 2;
const STATE_RAW_TEXT = 3;

export function tokenize(
  strings: TemplateStringsArray | string[],
  rawTextElements: Set<string>,
): Token[] {
  const tokens: Token[] = [];
  let state = STATE_TEXT;
  let quoteChar: '"' | "'" | "" = "";
  let lastTagName = ""; 
  let cursor = 0;

  for (let i = 0; i < strings.length; i++) {
    const str = strings[i];
    const len = str.length;
    cursor = 0;

    while (cursor < len) {
      if (state === STATE_TEXT) {
        const nextTag = str.indexOf("<", cursor);
        if (nextTag === -1) {
          if (cursor < len) tokens.push({ type: TEXT_TOKEN, value: str.slice(cursor) });
          cursor = len;
        } else {
          if (nextTag > cursor) tokens.push({ type: TEXT_TOKEN, value: str.slice(cursor, nextTag) });
          
          const nextCode = str.charCodeAt(nextTag + 1);
          // Case-sensitive identifier check remains the same
          if (nextCode === 47 || isIdentifierChar(nextCode)) {
            tokens.push({ type: OPEN_TAG_TOKEN, value: "<" });
            state = STATE_TAG;
            cursor = nextTag + 1;
          } else {
            tokens.push({ type: TEXT_TOKEN, value: "<" });
            cursor = nextTag + 1;
          }
        }
      } 
      
      else if (state === STATE_TAG) {
        const char = str[cursor];
        const code = str.charCodeAt(cursor);

        if (isWhitespace(code)) {
          cursor++;
        } else if (char === ">") {
          tokens.push({ type: CLOSE_TAG_TOKEN, value: ">" });
          
          // Case-sensitive lookup
          if (rawTextElements.has(lastTagName)) {
            state = STATE_RAW_TEXT;
          } else {
            state = STATE_TEXT;
          }
          cursor++;
        } else if (char === "=") {
          tokens.push({ type: EQUALS_TOKEN, value: char });
          cursor++;
        } else if (char === "/") {
          tokens.push({ type: SLASH_TOKEN, value: char });
          cursor++;
        } else if (char === '"' || char === "'") {
          tokens.push({ type: QUOTE_CHAR_TOKEN, value: char });
          quoteChar = char;
          state = STATE_ATTR_VALUE;
          cursor++;
        } else if (isIdentifierChar(code)) {
          const start = cursor;
          while (cursor < len && isIdentifierChar(str.charCodeAt(cursor))) cursor++;
          // Capture tag name exactly as it appears
          lastTagName = str.slice(start, cursor);
          tokens.push({ type: IDENTIFIER_TOKEN, value: lastTagName });
        } else {
          cursor++;
        }
      } 
      
      else if (state === STATE_ATTR_VALUE) {
        const endQuoteIndex = str.indexOf(quoteChar, cursor);
        if (endQuoteIndex === -1) {
          tokens.push({ type: ATTRIBUTE_VALUE_TOKEN, value: str.slice(cursor) });
          cursor = len;
        } else {
          if (endQuoteIndex > cursor) {
            tokens.push({ type: ATTRIBUTE_VALUE_TOKEN, value: str.slice(cursor, endQuoteIndex) });
          }
          tokens.push({ type: QUOTE_CHAR_TOKEN, value: quoteChar as any });
          state = STATE_TAG;
          quoteChar = "";
          cursor = endQuoteIndex + 1;
        }
      }

      else if (state === STATE_RAW_TEXT) {
        // Case-sensitive search for the specific closing tag
        const closeTagStr = `</${lastTagName}>`;
        const endOfRawIdx = str.indexOf(closeTagStr, cursor);

        if (endOfRawIdx === -1) {
          tokens.push({ type: TEXT_TOKEN, value: str.slice(cursor) });
          cursor = len;
        } else {
          if (endOfRawIdx > cursor) {
            tokens.push({ type: TEXT_TOKEN, value: str.slice(cursor, endOfRawIdx) });
          }
          state = STATE_TEXT;
          cursor = endOfRawIdx; 
        }
      }
    }

    if (i < strings.length - 1) {
      tokens.push({ type: EXPRESSION_TOKEN, value: i });
    }
  }

  return tokens;
}
