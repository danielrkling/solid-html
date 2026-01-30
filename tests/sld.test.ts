import { createRoot, createSignal } from "solid-js/dist/solid.js";
import { createSLD } from "../src/sld"; // Adjust path to your file
import {expect, describe, it} from "vitest";

describe("Solid-HTML Renderer", () => {
  // Setup a basic registry
  const MyComponent = (props: any) => {
    return createSLD({})`<span>Component: ${props.text}</span>`;
  };

  const sld = createSLD({ MyComponent });

  it("renders static HTML correctly", () => {
    const result = sld`<div><p>Hello World</p></div>` as unknown as Node[];
    const container = document.createElement("div");
    container.append(...result);
    
    expect(container.innerHTML).toBe("<div><p>Hello World</p></div>");
  });

  it("handles reactive signals in text", () => {
    createRoot((dispose) => {
      const [name, setName] = createSignal("Alice");
      const result = sld`<div>Hello ${name}</div>` as unknown as Node[];
      const container = document.createElement("div");
      container.append(...result);

      expect(container.textContent).toBe("Hello Alice");

      setName("Bob");
      // Solid updates are fine-grained, so textContent should update
      expect(container.textContent).toBe("Hello Bob");
      dispose();
    });
  });

  it("renders dynamic components via name or index", () => {
    const Dynamic = (props: any) => sld`<strong>${props.children}</strong>`;
    
    // 1. Registered name: <MyComponent />
    // 2. Expression index: <${Dynamic} />
    const result = sld`
      <section>
        <MyComponent text="Static" />
        <${Dynamic}>Dynamic</${Dynamic}>
      </section>
    ` as unknown as Node[];

    const container = document.createElement("div");
    container.append(...result);

    expect(container.querySelector("span")?.textContent).toBe("Component: Static");
    expect(container.querySelector("strong")?.textContent).toBe("Dynamic");
  });

  it("handles spread props and boolean attributes", () => {
    const props = { id: "test-id", class: "btn" };
    const result = sld`<button ...${props} disabled>Click</button>` as unknown as Node[];
    const btn = result[0] as HTMLButtonElement;

    expect(btn.id).toBe("test-id");
    expect(btn.classList.contains("btn")).toBe(true);
    expect(btn.disabled).toBe(true);
  });

  it("correctly handles the shorthand close syntax <//>", () => {
    const Wrapper = (props: any) => sld`<div class="wrapper">${props.children}</div>`;
    const result = sld`<${Wrapper}><span>Inside</span><//>` as unknown as Node[];
    
    const container = document.createElement("div");
    container.append(...result);
    
    expect(container.innerHTML).toBe('<div class="wrapper"><span>Inside</span></div>');
  });

  it("preserves SVG context for paths", () => {
    const result = sld`
      <svg>
        <path d="M10 10" />
      </svg>
    ` as unknown as Node[];
    
    const svg = result[0] as SVGSVGElement;
    const path = svg.querySelector("path");
    
    // Check namespaceURI to ensure it's a real SVG element, not an HTML unknown element
    expect(path?.namespaceURI).toBe("http://www.w3.org/2000/svg");
  });
});