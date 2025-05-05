import { createDynamic, render } from "solid-js/web";
import { createComponent, createContext, createEffect, createSignal, useContext, Show as _Show } from "solid-js";
import { html, h, Show, Keyed, wrapProps, For, w } from "./solid-html";



const [count, setCount] = createSignal(0);
const increment = () => setCount(count => count + 5);

setInterval(increment,2000)
const ctx = createContext([count,setCount])

function Consumer(){
  const [count, ] = useContext(ctx)

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

  setInterval(increment,1000)

  const result = [
    h("button", ({
      onClick: () => setShow(p => !p),
      textContent: () => String(show())
    })),
    w(Counter, {}),
    // Show(show,w(Counter,{})),
    h(ctx.Provider,{value:[count,setCount],children:h(B,{})}),
    
  ]
  return result
}

function B(){  

  const [show, setShow] = createSignal(true)
  return [
    h("button", ({
      onClick: () => setShow(p => !p),
      textContent: () => String(show())
    })),
    h(Consumer,{}),
    ()=>h(Consumer,{}),
    w(Counter, {}),
    // Show(show,w(Counter,{})),
  ]
}

render(() => h(App, {}), document.getElementById("app")!);