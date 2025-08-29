import { render } from "solid-js/web";
import {  html } from "../src";
import { createSignal } from "solid-js";

function Counter() {
  const [count, setCount] = createSignal(0);
  return html`
    <div class="counter-xml">
      <section>
        <header>
          <h2>XML Counter</h2>
          <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          ${Circle}
          <text x="50" y="55" font-size="12" text-anchor="middle" fill="white">
            ${"Label"}
          </text>
        </svg>        
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


function Circle(){
  return html`<circle cx="50" cy="50" r="${20}px" fill="${"blue"}" />`
}

html.h.define({Counter,Circle})


function App(){
    return html`<div><Counter />Hello<Counter >Count:</Counter></div>` 
}

render(App,document.getElementById("app")!)

const marks = performance.getEntriesByType('mark');
for (let i = 1; i < marks.length; i++) {
  const prev = marks[i - 1];
  const current = marks[i];
  const delta = current.startTime - prev.startTime;
  console.log(
    `${prev.name} → ${current.name}: ${delta.toFixed(2)}ms`
  );
}