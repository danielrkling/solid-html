import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { sld } from "./src";


function Counter() {
    const [count, setCount] = createSignal(0);
    return sld`<button onclick=${() => setCount(count() + 1)}>Count: ${() => count()}</button>`;
}

render(Counter, document.getElementById("app")!);