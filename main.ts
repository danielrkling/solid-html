import { createDynamic, render } from "solid-js/web";
import { createComponent, createContext, createSignal, useContext } from "solid-js";
import { html, h } from "./solid-html";

const ctx = createContext(createSignal(0))

function Child() {
  const [count] = useContext(ctx)

  return html`<span>${count}</span>`
}

function Counter() {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count => count + 1);

  return html`<button type="button" @click=${increment}>
  Count: ${count}
</button>`
}


function App() {
  const counter = createSignal(5);
  const [count, setCount] = counter
  const increment = () => setCount(count => count + 1);

  return (

    html`<button type="button" @click=${increment}>
      ${count}
    </button>
    <div>
    <b>Inside Context:</b>
    ${h(ctx.Provider, {
      value: counter,
      children: html`

      <div>
      Create Component - ${h(Child, {})}
      </div>
      <div>
       ()=>Create Component - ${() => h(Child, {})}
      </div>

      `
    })}
    </div>
    <div>
    <b>Outside Context:</b>
    ${html`
      <div>
      Create Component - ${h(Child, {})}
      </div>
      <div>
       ()=>Create Component - ${() => h(Child, {})}
      </div>
      `
      }
    </div>

`
  );
}

render(Counter, document.body);