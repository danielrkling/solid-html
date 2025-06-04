import { createContext, createResource, createSignal, useContext, For } from "solid-js";
import { render } from "solid-js/web";
import { Context, Match, Suspense, Switch, h, html } from "../src";
import { jsx } from "../src/jsx";

const ctx = createContext("Global")

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function Consumer() {

  return html`<span>${useContext(ctx)}</span>`
}


function App() {

  return html`<button class="something ${()=>"class2"}" >buto</button> `
}


function Counter() {
  const [count, setCount] = createSignal(0);

  return jsx`<button on:click=${() => setCount(p => p + 1)}>${() => count()}</button>`
}

jsx.define({
  "ctx.Counte3r": Counter,
})

function List() {
  const [data, setData] = createSignal(
    ["Item 1", "Item 2", "Item 3"]
  );

  return jsx`
  <ctx.Counter />
    <ul >
      <For each=${() => data()} >
      ${(item) => jsx`<li>${item}</li>`}
      </For>
    </ul>    
  `;
}






render(() => h(App, {}), document.getElementById("app")!);