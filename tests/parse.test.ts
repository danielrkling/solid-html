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
  it("simple text", () => {
    const ast = jsx`Hello World!`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [{ type: TEXT_NODE,  value: "Hello World!" }],
    });
  });

  it("simple element", () => {
    const ast = jsx`<div></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [{ type: ELEMENT_NODE, isSVG: false, name: "div", props: [], children: [], }],
    });
  });

  it("text content", () => {
    const ast = jsx`<div>Hello</div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE, isSVG: false,
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
          type: ELEMENT_NODE, isSVG: false,
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
        { type: ELEMENT_NODE, isSVG: false, name: "input", props: [], children: [] },
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
          type: ELEMENT_NODE, isSVG: false,
          name: "div",
          props: [],
          children: [
            {
              type: ELEMENT_NODE, isSVG: false,
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
          type: ELEMENT_NODE, isSVG: false,
          name: "div",
          props: [{ name: "id", type: STATIC_PROP, value: "app", quote: '"' }],
          children: [],
        },
      ],
    });
  });

  it("string attribute single quoted", () => {
    const ast = jsx`<div id='app'></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE, isSVG: false,
          name: "div",
          props: [{ name: "id", type: STATIC_PROP, value: "app", quote: "'" }],
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
          isSVG: false,
          name: "input",
          props: [{ name: "checked", type: BOOLEAN_PROP, value: true }],
          children: [],
        },
      ],
    });
  });

  it("boolean attribute", () => {
    const ast = jsx`<button checked></button>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE,
          isSVG: false,
          name: "button",
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
          isSVG: false,
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
          isSVG: false,
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
          isSVG: false,
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
          type: ELEMENT_NODE, isSVG: false,
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
          type: ELEMENT_NODE, isSVG: false,
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
          type: ELEMENT_NODE, isSVG: false,
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

  it("mixed attributes",()=>{
    const ast = jsx`
        <h1 title="${1} John ${"Smith"}"></h1>
      `
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE, isSVG: false,
          name: "h1",
          props: [
            {
              name: "title",
              type: MIXED_PROP,
              value: [0, " John ", 1],
              quote: '"',
            },
          ],
          children: [],
        },
      ],
    });
  })

  it("multiple attributes", () => {
    const value = "test";
    const ast = jsx`<input type="text" value=${value} disabled />`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE, isSVG: false,
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


  it("spread attribute with ...", () => {
    const id = "my-id";
    const ast = jsx`<div ...${id}></div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE, isSVG: false,
          name: "div",
          props: [{ type: SPREAD_PROP, value: 0 }],
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
          type: ELEMENT_NODE, isSVG: false,
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
          type: ELEMENT_NODE, isSVG: false,
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
          type: ELEMENT_NODE, isSVG: false,
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
          type: ELEMENT_NODE, isSVG: false,
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
              type: ELEMENT_NODE, isSVG: false,
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
          type: ELEMENT_NODE, isSVG: false,
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
          type: ELEMENT_NODE, isSVG: false,
          name: "div",
          props: [],
          children: [{ type: EXPRESSION_NODE, value: 0 }],
        },
      ],
    });
  });

    it("trims whitespace-only text nodes around expressions", () => {
    const name = "User";
    const ast = jsx`   ${name}   `;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: TEXT_NODE,
          value: "   ",
        },
        {
          type: EXPRESSION_NODE,
          value: 0,
        },
        {
          type: TEXT_NODE,
          value: "   ",
        },
      ],
    });
  });

  it("filters only beginning and trailing whitespace in mixed text nodes", () => {
    const name = "User";
    const ast = jsx`<div>  ${"Hello"}  ${name}  !  </div>`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE, isSVG: false,
          name: "div",
          props: [],
          children: [
            { type: EXPRESSION_NODE, value: 0 },
            { type: TEXT_NODE, value: "  " },
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
          type: ELEMENT_NODE, isSVG: false,
          name: "div",
          props: [{ name: "id", type: STATIC_PROP, value: "root", quote: '"' }],
          children: [
            {
              type: ELEMENT_NODE, isSVG: false,
              name: "h1",
              props: [],
              children: [{ type: EXPRESSION_NODE, value: 0 }],
            },
            {
              type: ELEMENT_NODE, isSVG: false,
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
          type: ELEMENT_NODE, isSVG: false,
          name: "ul",
          props: [],
          children: [
            {
              type: ELEMENT_NODE, isSVG: false,
              name: "li",
              props: [],
              children: [{ type: EXPRESSION_NODE, value: 0 }],
            },
            {
              type: ELEMENT_NODE, isSVG: false,
              name: "li",
              props: [],
              children: [{ type: EXPRESSION_NODE, value: 1 }],
            },
            {
              type: ELEMENT_NODE, isSVG: false,
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
  it("void elements: children", () => {
    // Note: br is void, img is void. They should be siblings, not nested.
    const ast = jsx`<div><img src="test.png" >Children should get <span>wiped</span></img></div>`;

    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE, isSVG: false,
          name: "div",
          props: [],
          children: [

            {
              type: ELEMENT_NODE, isSVG: false,
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
    const ast = jsx`<textarea><div class="fake">${0}</div></textarea>`;

    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        {
          type: ELEMENT_NODE, isSVG: false,
          name: "textarea",
          props: [],
          children: [
            {
              type: TEXT_NODE,
              value: '<div class="fake">',
            },
            { type: EXPRESSION_NODE, value: 0 },
            {
              type: TEXT_NODE,
              value: "</div>",
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
          type: ELEMENT_NODE, isSVG: false,
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



describe("Edge Cases", () => {
  it("empty template", () => {
    const ast = jsx``;
    expect(ast).toEqual({ type: ROOT_NODE, children: [] });
  });
  it("only expressions", () => {
    const a = 1;
    const b = 2;
    const ast = jsx`${a}${b}`;
    expect(ast).toEqual({
      type: ROOT_NODE,
      children: [
        { type: EXPRESSION_NODE, value: 0 },
        { type: EXPRESSION_NODE, value: 1 },
      ],
    });
  });


});

describe("Errors",()=>{
  it("error on open tag",()=>{
    expect(()=>jsx`<div`).toThrow()
  })

  it("error on mismatched tag",()=>{
    expect(()=>jsx`<div></span>`).toThrow()
  })

  it("error on extra <",()=>{
    expect(()=>jsx`<div><</span>`).toThrow()
  })

  it("error on bad tag name",()=>{
    expect(()=>jsx`<1div><</1div>`).toThrow()
  })

  it("error on unclosed tags",()=>{
    expect(()=>jsx`<div>`).toThrow()
  })

  it("error on spread without expression",()=>{
    expect(()=>jsx`<div ... bool></div>`).toThrow()
  })

  it("error on unmatched close",()=>{
    expect(()=>jsx`</div>`).toThrow()
  })
})
