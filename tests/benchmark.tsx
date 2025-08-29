import { render } from "solid-js/web";
import {  html } from "../src";
import { createSignal } from "solid-js";
import {HTML} from "../src/html"
import { CounterJSX } from "./counter";
import htm from "solid-js/html"
// Number of components to render in batch
const COUNT = 10;

// Benchmark helper
function benchmark(label, fn) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${label}: ${(end - start).toFixed(2)}ms`);
}


// Counter using `xml`
function CounterHTM() {
  const [count, setCount] = createSignal(0);
  return htm`
    <div class="counter-xml">
      <section>
        <header>
          <h2>XML Counter</h2>
        </header>
        <main>
          <article>
            <p>You have clicked the button:</p>
            <button onClick=${() => setCount(v => v + 1)}>
              <span>Click me</span>
              <strong> → ${() => count()} times</strong>
            </button>
          </article>
        </main>
        <footer>
          <small>Rendered using <code><${CounterJSX} //></code> template</small>
        </footer>
      </section>
    </div>
  `;
}

html.h.define({CounterJSX})

// Counter using `xml`
function CounterHTML() {
  const [count, setCount] = createSignal(0);
  return html`
    <div class="counter-xml">
      <section>
        <header>
          <h2>XML Counter</h2>
        </header>
        <main>
          <article>
            <p>You have clicked the button:</p>
            <button onClick=${() => setCount(v => v + 1)}>
              <span>Click me</span>
              <strong> → ${() => count()} times</strong>
            </button>
          </article>
        </main>
        <footer>
          <small>Rendered using <code><CounterJSX/></code> template</small>
        </footer>
      </section>
    </div>
  `;
}





// Create root containers
const root1 = document.createElement("div");
const root2 = document.createElement("div");
const root3 = document.createElement("div");
document.body.append(root1, root2, root3);

benchmark("Render JSX", () => {
  render(() => Array.from({ length: COUNT }, () => CounterJSX()), root1);
});

benchmark("Render HTML", () => {
  render(() => Array.from({ length: COUNT }, () => CounterHTML()), root2);
});

// Benchmark render performance
benchmark("Render HTM", () => {
  render(() => Array.from({ length: COUNT }, () => CounterHTM()), root3);
});


