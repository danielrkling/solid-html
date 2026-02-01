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
            <li><Box>Item 2<//></li>
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
          id="test
          "
          class = 
            "spaced"
        >  Text  </div>` as Node[];
      const el = result[0] as HTMLElement;
      expect(el.id).toBe(`test
          `);
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

  it("handles explicit properties and attributes via namespaces", () => {
  const [val, setVal] = createSignal("initial");
  // prop: ensures it hits el.value, not el.setAttribute('value')
  const result = sld`<input prop:value=${val} attr:title=${"hello"} />` as Node[];
  const input = result[0] as HTMLInputElement;

  expect(input.value).toBe("initial");
  expect(input.getAttribute("title")).toBe("hello");

  setVal("updated");
  expect(input.value).toBe("updated");
});

it("handles refs and event listeners correctly", () => {
  let elementRef: HTMLDivElement | undefined;
  let clickCount = 0;

  const result = sld`
    <div 
      ref=${(el: HTMLDivElement) => (elementRef = el)} 
      on:click=${() => clickCount++}
    >Click me</div>` as Node[];

  const el = result[0] as HTMLDivElement;
  
  // Test Ref
  expect(elementRef).toBe(el);

  // Test Event
  el.click();
  expect(clickCount).toBe(1);
});

it("maintains SVG namespace across nested dynamic paths", () => {
  const [radius, setRadius] = createSignal(10);
  const result = sld`
    <svg>
      <g>
        <circle r=${radius} />
      </g>
    </svg>` as Node[];

  const svg = result[0] as SVGSVGElement;
  const circle = svg.querySelector("circle")!;

  expect(circle.namespaceURI).toBe("http://www.w3.org/2000/svg");
  expect(circle.getAttribute("r")).toBe("10");

  setRadius(20);
  expect(circle.getAttribute("r")).toBe("20");
});

it("handles sibling expressions and static text correctly", () => {
  const [a] = createSignal("A");
  const [b] = createSignal("B");
  
  const result = sld`<div>${a} - ${b} !</div>` as Node[];
  const el = result[0] as HTMLDivElement;

  // Expected: A - B !
  expect(el.textContent).toBe("A - B !");
});

it("respects override order with spreads and static attributes", () => {
  const props = { id: "from-spread", "data-info": "hidden" };
  
  // Static ID should override Spread ID if it comes AFTER
  const result = sld`<div ...${props} id="final-id"></div>` as Node[];
  const el = result[0] as HTMLElement;

  expect(el.id).toBe("final-id");
  expect(el.getAttribute("data-info")).toBe("hidden");
});

it("passes children correctly to registered components", () => {
  const Wrapper = (props: { children: any }) => sld`<section>${props.children}</section>`;
  const localSld = createSLD({ Wrapper });

  const result = localSld`
    <Wrapper>
      <span>Inside</span>
    </Wrapper>` as Node[];

  const section = result[0] as HTMLElement;
  expect(section.tagName).toBe("SECTION");
  expect(section.querySelector("span")?.textContent).toBe("Inside");
});

// --- HTML CONFORMANCE & PARSING ---
  describe("HTML Parsing Edge Cases", () => {
    it("handles multi-line, complex, and unquoted-style attributes", () => {
      // Testing multi-line values and strange character attribute names
      const result = sld`
        <div
          multiline="
            foo
            bar
          "
          baz=123=456
          #$%=123
          lorem ipsum
        ></div>` as HTMLElement[];

      const div = result[0];
      
      expect(div.getAttribute("multiline")).toContain("foo");
      expect(div.getAttribute("multiline")).toContain("bar");
      expect(div.getAttribute("baz")).toBe("123=456");
      expect(div.getAttribute("#$%")).toBe("123");
      expect(div.hasAttribute("lorem")).toBe(true);
      expect(div.hasAttribute("ipsum")).toBe(true);
    });

    it("correctly handles JSON-like strings in attributes", () => {
      const result = sld`
        <lume-box uniforms='{ "iTime": { "value": 0 } }'></lume-box>
      ` as HTMLElement[];
      
      expect(result[0].getAttribute("uniforms")).toBe('{ "iTime": { "value": 0 } }');
    });

    it("trims whitespace correctly while preserving nested spaces", () => {
      const name = "John";
      const result = sld`
        <div>
          <b>Hello, my name is: <i> ${name}</i></b>
        </div>
      ` as HTMLElement[];

      const b = result[0].querySelector("b")!;
      // Should preserve the space before <i> but trim the outer indentation
      expect(b.innerHTML).toContain("Hello, my name is: <i>John<!--+--></i>");
      expect(b.textContent).toBe("Hello, my name is: John");
    });
  });

  // --- DYNAMIC ATTRIBUTES & REACTIVITY ---
  describe("Reactivity and Signals", () => {
    it("handles dynamic class objects and signal toggles", () => {
      createRoot((dispose) => {
        const [d, setD] = createSignal("first");
        const result = sld`<div class=${() => ({ [d()]: true })} />` as HTMLElement[];
        const el = result[0];

        expect(el.classList.contains("first")).toBe(true);

        setD("second");
        // Verify fine-grained update
        expect(el.classList.contains("second")).toBe(true);
        expect(el.classList.contains("first")).toBe(false);
        dispose();
      });
    });

    it("handles mixed static and dynamic attribute parts", () => {
      const [welcoming] = createSignal("hello");
      const result = sld`
        <h1 title="${welcoming} John ${"Smith"}"></h1>
      ` as HTMLElement[];

      expect(result[0].title).toBe("hello John Smith");
    });
  });

  // --- EVENTS & REFS ---
  describe("Events and Refs", () => {
    it("integrates bound, delegated, and native listener events", () => {
      const exec = { bound: false, delegated: false, listener: false };

      const result = sld`
        <div id="main">
          <button onclick=${() => (exec.bound = true)}>Bound</button>
          <button onClick=${[v => (exec.delegated = v), true]}>Delegated</button>
          <button on:click=${() => (exec.listener = true)}>Listener</button>
        </div>
      ` as HTMLElement[];

      const [btn1, btn2, btn3] = result[0].querySelectorAll("button");

      expect(btn1.innerText).toBe("Bound");
      expect(btn2.innerText).toBe("Delegated");
      expect(btn3.innerText).toBe("Listener");

      btn1.click();
      btn2.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      btn3.click();

      expect(exec.bound).toBe(true);
      expect(exec.delegated).toBe(true);
      expect(exec.listener).toBe(true);
    });

    it("captures refs across components and elements", () => {
      let linkRef: HTMLAnchorElement | undefined;
      const result = sld`
        <div>
          <a href="/" ref=${(el: HTMLAnchorElement) => (linkRef = el)}>Link</a>
        </div>
      ` as HTMLElement[];

      expect(linkRef).toBe(result[0].querySelector("a"));
    });

    });
});