import { render } from "solid-js/web";
import {  xml } from "../src";
import { createSignal } from "solid-js";

// Counter using `xml`
function Counter() {
  const [count, setCount] = createSignal(0);
  return xml`
    <button class="${"A"}" bool:disabled=${false} style=${count} prop:id="${"A"}B${"C"}" @click=${()=>setCount(v=>v+1)} >Count: ${count}</button>
    <!-- ${count} -->
  `;
}

xml.h.define({Counter})

function App(){
    return xml`<Counter />` 
}

render(App,document.getElementById("app")!)