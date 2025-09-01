import { render } from "solid-js/web";
import {  html } from "../src";
import { createSignal } from "solid-js";

function Counter() {
  const [count, setCount] = createSignal(0);
  return html`
    <button ...${{class:count}} ...${{style:"color:red;"}} on:click=${() => setCount(count() + 1)}>
      ${"Hole"}${count}
    </button>
  `;
}



html.h.define({Counter})


function App(){
    return html`<div><Counter />Hello<Counter >Count:</Counter></div>` 
}

render(App,document.getElementById("app")!)