import { render } from "solid-js/web";
import {  xml } from "../src";
import { createSignal } from "solid-js";
import {XML} from "../src/xml"
// Number of components to render in batch
const COUNT = 1000;

// Benchmark helper
function benchmark(label, fn) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${label}: ${(end - start).toFixed(2)}ms`);
}

const clone = XML({},[],true)

// Counter using `xml`
function CounterXML() {
  const [count, setCount] = createSignal(0);
  return xml`
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

// Counter using `html`
function CounterClone() {
  const [count, setCount] = createSignal(0);
  return clone`
    <div class="counter-html">
      <section>
        <header>
          <h2>HTML Counter</h2>
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
          <small>Rendered using <code>html</code> template</small>
        </footer>
      </section>
    </div>
  `;
}


// Create root containers
const root1 = document.createElement("div");
const root2 = document.createElement("div");
document.body.append(root1, root2);

// Benchmark render performance
benchmark("Render XML counters", () => {
  render(() => Array.from({ length: COUNT }, () => CounterXML()), root1);
});

benchmark("Render cloned nodes", () => {
  render(() => Array.from({ length: COUNT }, () => CounterClone()), root2);
});

