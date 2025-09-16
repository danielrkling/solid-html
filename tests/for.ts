import { createContext, useContext, createSignal, For } from "solid-js";
import { render } from "solid-js/web";
import {  sld } from "../src";
import htm from "solid-js/html"



  function CounterB() {
    const [demo, setDemo] = createSignal(1);
    const [list, setList] = createSignal([0, 1, 2]);
  
    return sld`<div>
    <For each=${list}>${()=>sld`<div>${"A"}-${demo}</div>`}</For>
    <button on:click=${() => setList([...list(), Math.random()])}>add</button>
    <button on:click=${() => setDemo(demo() + 1)}>add</button>
    </div>
    `
  }



  

render(CounterB, document.getElementById("app")!);
