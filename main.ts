import { createDynamic, render, style } from "solid-js/web";
import { createComponent, createContext, createEffect, createSignal, useContext, Show as _Show, children, For } from "solid-js";
import { html, h, Show, Keyed, wrapProps,  w, fragment } from "./solid-html";



const [count, setCount] = createSignal(0);
const increment = () => setCount(count => count + 5);

setInterval(increment, 2000)
const ctx = createContext([count, setCount])

function Consumer() {
  const [count,] = useContext(ctx)

  return html`<div>${count}</div>`
}


function Counter() {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count => count + 1);


  return html`<button type="button" @click=${increment}>
    Count: ${count}
  </button>
  `

}




function App() {
  const [show, setShow] = createSignal(true)
  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count => count + 1);

  setInterval(increment, 1000)

  return html`<div ...${{ style: "color:red" }}>Hello ${"World!"}</div>`
}

function A() {
  const [show, setShow] = createSignal(true)

  return html`<button @click=${() => setShow(v => !v)}>${() => String(show())}</button>
  ${h(Counter, {})}
  ${h(_Show, { when: () => show(), children: h(Counter, {}) })}
  ${h(_Show, { when: () => show(), children: ()=>h(Counter, {}) })}`

}

function B() {

  const [show, setShow] = createSignal(true)
  return fragment(
    h("button", ({
      onClick: () => setShow(p => !p),
      textContent: () => String(show())
    })),
    h(Counter, {}),
    h(_Show, { when: () => show(), children: h(Counter, {}) }),
    h(_Show, { when: () => show(), children: () => h(Counter, {}) }),
  )
}

render(() => html`<div>${h(A)}</div><div>${h(B)}</div>`, document.getElementById("app")!);