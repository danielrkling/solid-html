import { render } from "solid-js/web";
import {  html } from "../src";
import { createSignal } from "solid-js";
import {HTML} from "../src/html"
import { CounterJSX } from "./counter";
// Number of components to render in batch
const COUNT = 1000;

// Benchmark helper
function benchmark(label, fn) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${label}: ${(end - start).toFixed(2)}ms`);
}

const clone = HTML({},[],true)

// Counter using `xml`
function CounterXML() {
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
          <small>Rendered using <code>xml</code> template</small>
        </footer>
      </section>
    </div>
  `;
}





// Create root containers
const root1 = document.createElement("div");
const root2 = document.createElement("div");
const root3 = document.createElement("div");
document.body.append(root1, root2);

benchmark("Render JSX", () => {
  render(() => Array.from({ length: COUNT }, () => CounterJSX()), root1);
});




window.build = false

// Benchmark render performance
benchmark("Render HTML - build", () => {
  render(() => Array.from({ length: COUNT }, () => CounterXML()), root3);
});


