import { render } from "solid-js/web";
import {  sld } from "../src";
import { createSignal } from "solid-js";
import html from "solid-js/html"
// Number of components to render in batch
const COUNT = 100;

// Benchmark helper
function benchmark(label, fn) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${label}: ${(end - start).toFixed(2)}ms`);
}


function CounterJSX() {
  const [count, setCount] = createSignal(1);
  const increment = () => setCount(count => count + 1);

  return (
    <div class="counter-xml">
      <section>
        <header>
          <h2>XML Counter</h2>
        </header>
        <main>
          <article>
            <p>You have clicked the button:</p>
            <button on:click={() => setCount(v => v + 1)}>
              <span>Click me</span>
              <strong> → {count()} times</strong>
            </button>
          </article>
        </main>
        <footer>
          <small>Rendered using <code><${CounterJSX} //></code> template</small>
        </footer>
      </section>
    </div>
  )
}

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
            <button on:click=${() => setCount(v => v + 1)}>
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


// Counter using `sld`
function CounterSLD() {
  const [count, setCount] = createSignal(0);
  return sld`
    <div class="counter-xml">
      <section>
        <header>
          <h2>XML Counter</h2>
        </header>
        <main>
          <article>
            <p>You have clicked the button:</p>
            <button @click=${() => setCount(v => v + 1)}>
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

benchmark("Render SLD", () => {
  render(() => Array.from({ length: COUNT }, () => CounterSLD()), root2);
});

// Benchmark render performance
benchmark("Render HTML", () => {
  render(() => Array.from({ length: COUNT }, () => CounterHTML()), root3);
});


