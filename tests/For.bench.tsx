import { bench, describe } from "vitest";
import { createRoot, For } from "solid-js";
import { render } from "solid-js/web";
import html from "solid-js/html";
import { sld } from "../src"; // Your library

// Standard JSX Component for Benchmarking
const JsxItem = (props: { id: number }) => (
  <div class="item">
    <span>ID: {props.id}</span>
  </div>
);

describe("SolidJS Rendering Benchmark (JSX vs Tags)", () => {
  const items = Array.from({ length: 1 }, (_, i) => ({ id: i }));

  // 1. Compiled JSX (The gold standard)
  bench("Standard JSX (Compiled)", () => {
    const container = document.createElement("div");
    createRoot((dispose) => {
      render(() => (
        <For each={items}>
          {(item) => <JsxItem id={item.id} />}
        </For>
      ), container);
      dispose();
    });
  });

  // 2. Solid's Native html library
  // bench("Solid Native 'html' tag", () => {
  //   const container = document.createElement("div");
  //   createRoot((dispose) => {
  //     render(() => html`
  //       <${For} each=${items}>
  //         ${(item) => html`<div class="item"><span>ID: ${item.id}</span></div>`}
  //       <//>
  //     `, container);
  //     dispose();
  //   });
  // });

  // 3. Your 'sld' library
  bench("Your 'sld' library", () => {
    const container = document.createElement("div");
    createRoot((dispose) => {
      render(() => sld`
        <For each=${items}>
          ${(item) => sld`<div class="item"><span>ID: ${item.id}</span></div>`}
        </For>
      `, container);
      dispose();
    });
  });
});

