import { createRoot, createSignal } from "solid-js";
import { createSLD, sld } from "../src"; // Your entry point
import { expect, it, describe } from "vitest";

describe("SLD Integration (Browser)", () => {
  
  it("should render a static tree using a template clone", () => {
    const sld = createSLD({});
    const result = sld`
      <div class="container">
        <h1>Title</h1>
        <p>Description</p>
      </div>
    ` as unknown as Node[];

    const container = document.createElement("div");
    container.append(...result);
    document.body.appendChild(container);

    // Verify structure
    expect(container.querySelector(".container")).not.toBeNull();
    expect(container.querySelector("h1")?.textContent).toBe("Title");
  });

  it("should handle dynamic components with <//> shorthand", () => {
    const Card = (props: any) => sld`<div class="card">${props.children}</div>`;
    const sldA = createSLD({ Card });

    const result = sldA`
      <Card>
        <span>Content</span>
      <//>
    ` as unknown as Node[];

    const container = document.createElement("div");
    container.append(...result);
    document.body.appendChild(container);

    const card = container.querySelector(".card");
    expect(card).not.toBeNull();
    expect(card?.firstElementChild?.tagName).toBe("SPAN");
  });

  it("should be reactive when signals update", () => {
    const sld = createSLD({});
    
    createRoot((dispose) => {
      const [count, setCount] = createSignal(0);
      const result = sld`<div>Count: ${() => count()}</div>` as unknown as Node[];
      
      const container = document.createElement("div");
      container.append(...result);
      document.body.appendChild(container);

      expect(container.textContent).toBe("Count: 0");

      setCount(1);
      // Solid's fine-grained update happens here
      console.log(count());
      expect(container.textContent).toBe("Count: 1");
      
      dispose();
    });
  });

  it("should preserve SVG namespace for nested paths", () => {
    const sld = createSLD({});
    const result = sld`
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" />
      </svg>
    ` as unknown as Node[];

    const svg = result[0] as SVGSVGElement;
    const circle = svg.querySelector("circle");
    
    // Crucial: check that it's not an HTMLUnknownElement
    expect(circle?.namespaceURI).toBe("http://www.w3.org/2000/svg");
  });

  it("should handle void elements without breaking the TreeWalker", () => {
    const sld = createSLD({});
    // If <br> isn't handled as void, the walker might look for children
    const result = sld`
      <div>
        <br>
        <span id="after">After</span>
      </div>
    ` as unknown as Node[];

    const container = document.createElement("div");
    container.append(...result);

    expect(container.querySelector("#after")).not.toBeNull();
    expect(container.querySelector("br")?.childNodes.length).toBe(0);
  });
});