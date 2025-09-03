import { render } from "solid-js/web";
import {  html } from "../src";
import { createSignal } from "solid-js";

function Counter(props) {
  const [count, setCount] = createSignal(0);
  return html`
    <button ...${{class:count}} ...${{style:"color:red;"}} disabled on:click=${() => setCount(count() + 1)}>
      ${props.boolean}${count}
    </button>
  `;
}



html.h.define({Counter})


function App(){
    return html`<div><Counter boolean />Hello<Counter >Count:</Counter></div>` 
}

render(App,document.getElementById("app")!)