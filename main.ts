import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { sld } from "./src";


function Counter() {
    const [count, setCount] = createSignal(0);
    return sld`<button  "quote" attr  =  "false" disabled ...${{class: "btn"}} onclick=${() => setCount(count() + 1)}>Count: ${() => count()}</button>`;
}

render(Counter, document.getElementById("app")!);

const span = document.createElement("span");
span.innerHTML = `<button "quote" attr = "false" >btn</button>`;
document.body.appendChild(span);
