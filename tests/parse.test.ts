import { describe, it, expect } from "vitest";
import {
  BOOLEAN_PROP,
  ELEMENT_NODE,
  EXPRESSION_NODE,
  MIXED_PROP,
  ROOT_NODE,
  STATIC_PROP,
  TEXT_NODE,
  EXPRESSION_PROP,
  SPREAD_PROP,
  parse,
} from "../src/parse";
import { rawTextElements, voidElements } from "../src/util";
import { tokenize } from "../src/tokenize";

function jsx(strings: TemplateStringsArray, ...values: any[]) {
  return parse(tokenize(strings, rawTextElements), voidElements);
}

describe("Simple AST", () => {
  it("simple element", () => {
    const ast = jsx`<div></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [{ type: ELEMENT_NODE, name: "div", props: [], children: [] }],
    });
  });

  it("text content", () => {
    const ast = jsx`<div>Hello</div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [{ type: TEXT_NODE, value: "Hello" }],
        },
      ],
    });
  });

  it("expression inside text", () => {
    const name = "World";
    const ast = jsx`<div>Hello ${name}</div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [
            { type: TEXT_NODE, value: "Hello " },
            { type: EXPRESSION_NODE, value: 0 },
          ],
        },
      ],
    });
  });

  it("self-closing", () => {
    const ast = jsx`<input />`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        { type: ELEMENT_NODE, name: "input", props: [], children: [] },
      ],
    });
  });

  it("nested elements", () => {
    const ast = jsx`
      <div>
        <span>text</span>
      </div>
    `;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [
            {
              type: ELEMENT_NODE,
              name: "span",
              props: [],
              children: [{ type: TEXT_NODE, value: "text" }],
            },
          ],
        },
      ],
    });
  });
});

describe("Attributes", () => {
  it("string attribute", () => {
    const ast = jsx`<div id="app"></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [{ name: "id", type: STATIC_PROP, value: "app", quote: '"' }],
          children: [],
        },
      ],
    });
  });

  it("boolean attribute", () => {
    const ast = jsx`<input checked />`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "input",
          props: [{ name: "checked", type: BOOLEAN_PROP, value: true }],
          children: [],
        },
      ],
    });
  });

  it("expression attribute", () => {
    const id = "my-id";
    const ast = jsx`<div id=${id}></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [{ name: "id", type: EXPRESSION_PROP, value: 0 }],
          children: [],
        },
      ],
    });
  });

  it("quoted expression attribute", () => {
    const id = "my-id";
    const ast = jsx`<div id="${id}"></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [{ name: "id", type: EXPRESSION_PROP, value: 0, quote: '"' }],
          children: [],
        },
      ],
    });
  });

  it("single quoted expression attribute", () => {
    const id = "my-id";
    const ast = jsx`<div id='${id}'></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [{ name: "id", type: EXPRESSION_PROP, value: 0, quote: "'" }],
          children: [],
        },
      ],
    });
  });

  it("mixed attribute (string + expression)", () => {
    const active = true;
    const ast = jsx`<div class="btn ${active ? "active" : ""}"></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [
            {
              name: "class",
              type: MIXED_PROP,
              value: ["btn ", 0],
              quote: '"',
            },
          ],
          children: [],
        },
      ],
    });
  });

  it("mixed attribute (string + expression)", () => {
    const active = true;
    const ast = jsx`<div class="btn ${active ? "active" : ""}"></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [
            {
              name: "class",
              type: MIXED_PROP,
              value: ["btn ", 0],
              quote: '"',
            },
          ],
          children: [],
        },
      ],
    });
  });

  it("mixed attribute (string + expression) with single quotes", () => {
    const active = true;
    const ast = jsx`<div class='btn ${active ? "active" : ""}'></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [
            {
              name: "class",
              type: MIXED_PROP,
              value: ["btn ", 0],
              quote: "'",
            },
          ],
          children: [],
        },
      ],
    });
  });

  it("mixed attribute (2 expression) with whitespace", () => {
    const active = true;
    const ast = jsx`<div class="${active ? "active" : ""}  ${"1"}"></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [
            {
              name: "class",
              type: MIXED_PROP,
              value: [0, "  ", 1],
              quote: '"',
            },
          ],
          children: [],
        },
      ],
    });
  });

  it("multiple attributes", () => {
    const value = "test";
    const ast = jsx`<input type="text" value=${value} disabled />`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "input",
          props: [
            { name: "type", type: STATIC_PROP, value: "text", quote: '"' },
            { name: "value", type: EXPRESSION_PROP, value: 0 },
            { name: "disabled", type: BOOLEAN_PROP, value: true },
          ],
          children: [],
        },
      ],
    });
  });
});

describe("whitespace handling", () => {
  it("preserves whitespace in text nodes in root", () => {
    const ast = jsx`  Hello <div>   Hello   World   </div> !   `;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        { type: TEXT_NODE, value: "  Hello " },
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [{ type: TEXT_NODE, value: "   Hello   World   " }],
        },
        { type: TEXT_NODE, value: " !   " },
      ],
    });
  });

  it("trims leading and trailing whitespace-only text nodes at root", () => {
    const ast = jsx`
    <div>Hello World</div>
    `;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [{ type: TEXT_NODE, value: "Hello World" }],
        },
      ],
    });
  });

  it("preserves whitespace in text nodes", () => {
    const ast = jsx`<div>   Hello   World   </div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [{ type: TEXT_NODE, value: "   Hello   World   " }],
        },
      ],
    });
  });
  it("preserves whitespace in text nodes with elements", () => {
    const ast = jsx`<div>
       Hello World
       <span>!</span> 
       </div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [
            {
              type: TEXT_NODE,
              value: `
       Hello World
       `,
            },
            {
              type: ELEMENT_NODE,
              name: "span",
              props: [],
              children: [{ type: TEXT_NODE, value: "!" }],
            },
          ],
        },
      ],
    });
  });

  it("preserves whitespace in mixed text nodes", () => {
    const name = "User";
    const ast = jsx`<div>  Hello ${name}  !  </div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [
            { type: TEXT_NODE, value: "  Hello " },
            { type: EXPRESSION_NODE, value: 0 },
            { type: TEXT_NODE, value: "  !  " },
          ],
        },
      ],
    });
  });

  it("trims whitespace-only text nodes around expressions", () => {
    const name = "User";
    const ast = jsx`<div>
      ${name}
    </div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [{ type: EXPRESSION_NODE, value: 0 }],
        },
      ],
    });
  });

  it("filters only beginning and trailing whitespace in mixed text nodes", () => {
    const name = "User";
    const ast = jsx`<div>  ${"Hello"} ${name}  !  </div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [
            { type: EXPRESSION_NODE, value: 0 },
            { type: TEXT_NODE, value: " " },
            { type: EXPRESSION_NODE, value: 1 },
            { type: TEXT_NODE, value: "  !  " },
          ],
        },
      ],
    });
  });
});

describe("Complex Examples", () => {
  it("JSX with multiple expressions", () => {
    const title = "App";
    const content = "Hello";
    const count = 42;
    const ast = jsx`
      <div id="root">
        <h1>${title}</h1>
        <p>${content} - ${count}</p>
      </div>
    `;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [{ name: "id", type: STATIC_PROP, value: "root", quote: '"' }],
          children: [
            {
              type: ELEMENT_NODE,
              name: "h1",
              props: [],
              children: [{ type: EXPRESSION_NODE, value: 0 }],
            },
            {
              type: ELEMENT_NODE,
              name: "p",
              props: [],
              children: [
                { type: EXPRESSION_NODE, value: 1 },
                { type: TEXT_NODE, value: " - " },
                { type: EXPRESSION_NODE, value: 2 },
              ],
            },
          ],
        },
      ],
    });
  });

  it("list-like structure", () => {
    const items = ["a", "b", "c"];
    const ast = jsx`
      <ul>
        <li>${items[0]}</li>
        <li>${items[1]}</li>
        <li>${items[2]}</li>
      </ul>
    `;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "ul",
          props: [],
          children: [
            {
              type: ELEMENT_NODE,
              name: "li",
              props: [],
              children: [{ type: EXPRESSION_NODE, value: 0 }],
            },
            {
              type: ELEMENT_NODE,
              name: "li",
              props: [],
              children: [{ type: EXPRESSION_NODE, value: 1 }],
            },
            {
              type: ELEMENT_NODE,
              name: "li",
              props: [],
              children: [{ type: EXPRESSION_NODE, value: 2 }],
            },
          ],
        },
      ],
    });
  });
});

describe("Specialized Element AST", () => {
  it("void elements: img and br siblings", () => {
    // Note: br is void, img is void. They should be siblings, not nested.
    const ast = jsx`<div><br><img src="test.png"></div>`;

    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "div",
          props: [],
          children: [
            {
              type: ELEMENT_NODE,
              name: "br",
              props: [],
              children: [],
            },
            {
              type: ELEMENT_NODE,
              name: "img",
              props: [
                {
                  name: "src",
                  type: STATIC_PROP,
                  value: "test.png",
                  quote: '"',
                },
              ],
              children: [],
            },
          ],
        },
      ],
    });
  });

  it("raw text elements: textarea ignoring content", () => {
    // The content inside <textarea> is treated as a single TEXT_NODE
    const ast = jsx`<textarea><div class="fake">Content</div></textarea>`;

    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "textarea",
          props: [],
          children: [
            {
              type: TEXT_NODE,
              value: '<div class="fake">Content</div>',
            },
          ],
        },
      ],
    });
  });

  it("complex mixed props in void elements", () => {
    const theme = "dark";
    const ast = jsx`<input class="btn ${theme}" disabled />`;

    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: "input",
          props: [
            {
              name: "class",
              type: MIXED_PROP,
              value: ["btn ", 0], // 0 is index of 'theme' in expressions
              quote: '"',
            },
            {
              name: "disabled",
              type: BOOLEAN_PROP,
              value: true,
            },
          ],
          children: [], // Input is self-closing/void
        },
      ],
    });
  });
});

describe("Dynamic Tag AST", () => {
  it("simple dynamic component", () => {
    const Comp = "div";
    const ast = jsx`<${Comp}>Hello</${Comp}>`;

    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: 0, // Reference to the first expression (${Comp})
          props: [],
          children: [{ type: TEXT_NODE, value: "Hello" }],
        },
      ],
    });
  });

  it("nested dynamic components with shorthand close", () => {
    const Outer = "section";
    const Inner = "div";
    const ast = jsx`<${Outer}><${Inner}>Nested<//><//>`;

    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: 0, // Outer
          props: [],
          children: [
            {
              type: ELEMENT_NODE,
              name: 1, // Inner
              props: [],
              children: [{ type: TEXT_NODE, value: "Nested" }],
            },
          ],
        },
      ],
    });
  });

  it("dynamic tag with mixed props and children", () => {
    const MyButton = "button";
    const isActive = true;
    const ast = jsx`<${MyButton} class=${isActive ? "active" : ""}>Click Me</${MyButton}>`;

    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: 0,
          props: [
            {
              name: "class",
              type: EXPRESSION_PROP,
              value: 1, // The second expression (ternary)
            },
          ],
          children: [{ type: TEXT_NODE, value: "Click Me" }],
        },
      ],
    });
  });

  it("mixed static and dynamic tags", () => {
    const Row = "div";
    const ast = jsx`
      <${Row}>
        <span>Static</span>
        <${Row}>Dynamic</${Row}>
      </${Row}>
    `;

    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          name: 0, // Outer Row
          props: [],
          children: [
            {
              type: ELEMENT_NODE,
              name: "span",
              props: [],
              children: [{ type: TEXT_NODE, value: "Static" }],
            },
            {
              type: ELEMENT_NODE,
              name: 1, // Inner Row
              props: [],
              children: [{ type: TEXT_NODE, value: "Dynamic" }],
            },
          ],
        },
      ],
    });
  });

  describe("Dynamic and Void Elements AST", () => {
    it("should verify whole AST for mixed dynamic and void elements", () => {
      const Comp = "div";
      // We use a fragment-like structure: A dynamic component containing a void element and text
      const ast = jsx`<${Comp}><br>Content</${Comp}>`;

      expect(ast).toEqual({
        type: ROOT_NODE,
        children: [
          {
            type: ELEMENT_NODE,
            name: 0, // The expression ${Comp}
            props: [],
            children: [
              {
                type: ELEMENT_NODE,
                name: "br",
                props: [],
                children: [], // Void element must have empty children
              },
              {
                type: TEXT_NODE,
                value: "Content",
              },
            ],
          },
        ],
      });
    });

    it("should verify whole AST for self-closing dynamic tags", () => {
      const Comp = "div";
      // Testing that the slash / correctly terminates a dynamic tag without a closing tag
      const ast = jsx`<${Comp} /><span>Next</span>`;

      expect(ast).toEqual({
        type: ROOT_NODE,
        children: [
          {
            type: ELEMENT_NODE,
            name: 0, // ${Comp}
            props: [],
            children: [], // Self-closed via />
          },
          {
            type: ELEMENT_NODE,
            name: "span",
            props: [],
            children: [
              {
                type: TEXT_NODE,
                value: "Next",
              },
            ],
          },
        ],
      });
    });

    it("should verify whole AST for shorthand closing with dynamic tags", () => {
      const Box = "div";
      const ast = jsx`<${Box}>Outer<${Box}>Inner<//><//>`;

      expect(ast).toEqual({
        type: ROOT_NODE,
        children: [
          {
            type: ELEMENT_NODE,
            name: 0, // Outer ${Box}
            props: [],
            children: [
              {
                type: TEXT_NODE,
                value: "Outer",
              },
              {
                type: ELEMENT_NODE,
                name: 1, // Inner ${Box}
                props: [],
                children: [
                  {
                    type: TEXT_NODE,
                    value: "Inner",
                  },
                ],
              },
            ],
          },
        ],
      });
    });
  });
});
