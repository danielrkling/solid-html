import { createContext, useContext, createSignal, For } from "solid-js";
import { render } from "solid-js/web";
import {  h, For as ForWrapper, html } from "../src";
import htm from "solid-js/html"


function CounterA() {
    const [demo, setDemo] = createSignal(1);
    const [list, setList] = createSignal([0, 1, 2]);
  
    return h('div', {}, [
      h(For, {
        each: list
      }, (item, i) => (
          h('div', {}, () => demo())
      )),
  
      h('button', {
        onClick: () => setList([...list(), Math.random()])
      }, 'add'),
      
      h('button', {
        onClick: () => setDemo(demo() + 1)
      }, 'demo'),
    ])
  }

  function CounterB() {
    const [demo, setDemo] = createSignal(1);
    const [list, setList] = createSignal([0, 1, 2]);
  
    return html`<div>
    <For each=${list}>${()=>html`<div>${"A"}-${demo}</div>`}</For>
    <button on:click=${() => setList([...list(), Math.random()])}>add</button>
    <button on:click=${() => setDemo(demo() + 1)}>add</button>
    </div>
    `
  }

  function CounterC() {
    const [demo, setDemo] = createSignal(1);
    const [list, setList] = createSignal([0, 1, 2]);
  
    return htm`<div>
    <${For} each=${list}>${()=>html`<div>${"A"}-${demo}</div>`}<//>
    <button on:click=${() => setList([...list(), Math.random()])}>add</button>
    <button on:click=${() => setDemo(demo() + 1)}>add</button>
    </div>
    `
  }

  

render(()=>[CounterA,CounterB, CounterC], document.getElementById("app")!);
