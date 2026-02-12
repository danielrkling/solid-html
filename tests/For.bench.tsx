import { bench, describe } from "vitest";
import { createRoot, For } from "solid-js";
import { render } from "solid-js/web";
import html from "solid-js/html";
import { run, sld } from "../src"; // Your library

describe("SolidJS Rendering Benchmark (JSX vs Tags)", () => {
  const items = Array.from({ length: 500 }, (_, i) => ({ id: i }));

  // Standard JSX Component for Benchmarking
  const JsxItem = (props: { id: number }) => (
    <div class="item">
      <span>ID: {props.id}</span>
    </div>
  );

  // 1. Compiled JSX (The gold standard)
  bench("Standard JSX (Compiled)", () => {
    const container = document.createElement("div");
    const dispose = render(
      () => <For each={items}>{(item) => <JsxItem id={item.id} />}</For>,
      container,
    );
    dispose();
  });

  // 2. Your 'sld' library
  bench("Your 'sld' library", () => {
    const container = document.createElement("div");
    const dispose = render(
      () => sld`
        <For each=${items}>
          ${(item) => sld`<div class="item"><span>ID: ${item.id}</span></div>`}
        </For>
      `,
      container,
    );
    dispose();
  });

  // 3. Your 'sld' library
  bench("Your 'sld' library, with run", () => {
    const container = document.createElement("div");
    const dispose = render(
      () =>
        run(For)({
          each: items,
          children: (item) => sld`<div class="item"><span>ID: ${item.id}</span></div>`,
        }),
      container,
    );
    dispose();
  });

  // 2. Solid's Native html library
  bench("Solid Native 'html' tag", () => {
    const container = document.createElement("div");
    const dispose = render(
      () => html`
        <${For} each=${items}>
          ${(item) => html`<div class="item"><span>ID: ${item.id}</span></div>`}
        <//>
      `,
      container,
    );
    dispose();
  });
});
