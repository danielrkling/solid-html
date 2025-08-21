import { createEffect, createSignal } from "solid-js";
import { h, H, html, XML } from "../src"
import { render } from "solid-js/web";

const xml = XML({
    Counter
})

const [timer, setTimer] = createSignal(0)
setInterval(() => setTimer(v => v + 1), 1000)


function Counter(props) {
    const [count, setCount] = createSignal(0);
    return xml`<button on:click="${() => setCount(v => v + 1)}">${()=>props.name}: ${()=>count()}</button>` 
}




function App() {
    const [show, setShow] = createSignal(0);

    return xml`
    <div>${()=>timer()}<button on:click="${()=>setShow(v=>v+1)}">Showing: ${()=>String(show())}</button></div>
    
    <div><Show when="${show}" children="${s=>xml`A<Counter name="${"a"}" />`}" /></div>
    <div><Show when="${show}" >B<Counter name="${"b"}" /></Show></div>

    <div><Show when="${show}" keyed="${true}" children="${s=>xml`C<Counter name="${"c"}" />`}" /></div>
    <div><Show when="${show}" keyed="${true}" >${s=>xml`D<Counter name="${"d"}" />`}</Show></div>
    `
}



render(App, document.getElementById("app")!)