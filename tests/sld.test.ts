import { createRoot, createSignal, For, Show } from "solid-js";
import { createSLD } from "../src";
import { expect, it, describe, beforeEach } from "vitest";

describe("SLD Advanced Integration", () => {
  const sld = createSLD({ For, Show });

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  // --- ATTRIBUTE EDGE CASES ---
  describe("Attributes and Props", () => {
    it("handles complex attribute names and mixed values", () => {
      const [cls, setCls] = createSignal("active");
      const result = sld`<div class="base ${cls}" data-test-id="main-div" aria-hidden="false"></div>` as Node[];
      const el = result[0] as HTMLElement;

      expect(el.className).toBe("base active");
      expect(el.getAttribute("data-test-id")).toBe("main-div");
      
      setCls("inactive");
      expect(el.className).toBe("base inactive");
    });

    it("handles boolean attributes correctly", () => {
      const [disabled, setDisabled] = createSignal(true);
      const result = sld`<button disabled=${disabled} autofocus>Click</button>` as Node[];
      const btn = result[0] as HTMLButtonElement;

      expect(btn.disabled).toBe(true);
      expect(btn.hasAttribute("autofocus")).toBe(true);

      setDisabled(false);
      expect(btn.disabled).toBe(false);
    });

    it("handles spread props and overrides", () => {
      const props = { id: "spread", class: "blue", "data-attr": "val" };
      const result = sld`<div id="static" class="red"  ...${props}></div>` as Node[];
      const el = result[0] as HTMLElement;

      expect(el.id).toBe("spread");
      expect(el.className).toBe("blue");
      expect(el.getAttribute("data-attr")).toBe("val");
    });

        it("handles spread props and overrides", () => {
      const props = { id: "spread", class: "blue", "data-attr": "val" };
      const result = sld`<div  ...${props} id="static" class="red"  ></div>` as Node[];
      const el = result[0] as HTMLElement;

      expect(el.id).toBe("static");
      expect(el.className).toBe("red");
      expect(el.getAttribute("data-attr")).toBe("val");
    });
  });

  // --- TOKENIZER & PARSER EDGE CASES ---
  describe("Parser & Tokenizer Robustness", () => {
    it("ignores HTML comments and their contents", () => {
      const signal = () => "HIDDEN";
      // The tokenizer should skip the expression inside the comment entirely
      const result = sld`
        <div>
            <!-- This is a comment with an expression: ${signal()} -->
          <p>Visible</p>
        </div>` as Node[];
      
      const container = document.createElement("div");
      container.append(...result);
      expect(container.innerHTML).not.toContain("HIDDEN");
      expect(container.querySelector("p")?.textContent).toBe("Visible");
    });

    it("handles deep nesting and shorthand closing in mixed order", () => {
      const Box = (props: any) => sld`<div class="box">${props.children}</div>`;
      const localSld = createSLD({ Box });

      
      
      const result = localSld`
        <Box>
          <ul>
            <li><Box>Item 1<//></li>
            <li><Box>Item 2</Box></li>
          </ul>
        </Box>` as Node[];

      const container = document.createElement("div");
      container.append(...result);
      console.log(container.innerHTML);
      expect(container.querySelectorAll(".box").length).toBe(3);
      expect(container.querySelector("li")?.textContent).toBe("Item 1");
    });

    it("handles weird whitespace and line breaks in tags", () => {
      const result = sld`
        <div 
          id="test"
          class = 
            "spaced"
        >  Text  </div>` as Node[];
      const el = result[0] as HTMLElement;
      expect(el.id).toBe("test");
      expect(el.className).toBe("spaced");
      expect(el.textContent?.trim()).toBe("Text");
    });
  });

  // --- REACTIVITY & LOGIC ---
  describe("Logic and Control Flow", () => {
    it("works with Solid's <Show> component", () => {
      const [visible, setVisible] = createSignal(false);
      const result = sld`<div>
        <Show when=${visible}>
          <span id="target">I am visible</span>
        </Show>
        </div>` as Node[];

        console.log(result);
      
      const container = document.createElement("div");
      container.append(...result);
      document.body.appendChild(container);

      expect(container.querySelector("#target")).toBeNull();

      setVisible(true);
      expect(container.querySelector("#target")).not.toBeNull();
      expect(container.querySelector("#target")?.textContent).toBe("I am visible");
    });

    it("works with Solid's <For> component", () => {
      const [items, setItems] = createSignal(["A", "B"]);
      const result = sld`
        <ul>
          <For each=${items}>
            ${(item: string) => sld`<li>${item}</li>`}
          </For>
        </ul>` as Node[];

      const container = document.createElement("div");
      container.append(...result);
      
      expect(container.querySelectorAll("li").length).toBe(2);
      
      setItems(["A", "B", "C"]);
      expect(container.querySelectorAll("li").length).toBe(3);
    });
  });



  // --- RAW TEXT ELEMENTS ---
  it("treats <script> and <style> as raw text", () => {
    // This tests that < or > inside style don't get parsed as tags
    const result = sld`
      <style>
        body > div { color: red; }
      </style>` as Node[];
    
    expect(result[0].textContent).toContain("body > div");
    expect((result[0] as HTMLElement).tagName).toBe("STYLE");
  });
});