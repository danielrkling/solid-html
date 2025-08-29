import { render } from "solid-js/web";
import {  xml } from "../src";
import { createSignal } from "solid-js";

// Counter using `xml`
function Counter(props) {
  const [count, setCount] = createSignal(0);


  return xml`
  <!-- 1 --><?ABC><!ABC <!Aa13   sdfom.asdf!.asd.1!>
    <button class="${"A"}" bool:disabled=${false} style=${count} prop:id="${"A"}B${"C"}" @click=${()=>setCount(v=>v+1)} ><span>${props.children}</span> ${count}</button>
    
  `;
}

xml.h.define({Counter})

function App(){
    return xml`<div><Counter />Hello<Counter >Count:</Counter></div>` 
}

render(App,document.getElementById("app")!)