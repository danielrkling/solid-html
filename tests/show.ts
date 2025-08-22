import { render } from "solid-js/web";
import { createContext, createSignal, useContext } from "solid-js";
import { html, Show, h } from "../src";


const ctx = createContext("A")

function Counter() {
    const [count, setCount] = createSignal(1);
    const increment = () => setCount(count => count + 1);

    return (
        h(ctx.Provider, {
            value: "B", children:
                html`<button type="button" onClick=${increment}>
      ${() => count()}
        ${Show(() => count() % 2 === 0, ()=>Read())}
    </button>`
        }))
}

function Read() {
    const context = (useContext(ctx))

    return html`<span>${context}</span>`
}

render(Counter, document.getElementById("app")!);
