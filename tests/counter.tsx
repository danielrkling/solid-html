import { createEffect, createSignal } from "solid-js";
import { h, H, html, xml } from "../src"
import { render } from "solid-js/web";

const [timer, setTimer] = createSignal(0)
setInterval(() => setTimer(v => v + 1), 1000)


function Counter_H_1() {
    const [count, setCount] = createSignal(0);
    return h("button", { onClick: () => setCount(v => v + 1), children: () => `Count: ${count()}` });
}

function Counter_H_2() {
    const [count, setCount] = createSignal(0);
    return h("button", { "on:click": () => setCount(v => v + 1), "prop:innerText": () => `Count: ${count()}` });
}

function Counter_H_3() {
    const [count, setCount] = createSignal(0);
    return h("button", { "@click": () => setCount(v => v + 1), ".innerText": () => `Count: ${count()}` });
}

function Counter_HTML_1() {
    const [count, setCount] = createSignal(0);
    return html`<button onClick=${() => setCount(v => v + 1)}>Count: ${() => count()}</button>`;
}

function Counter_HTML_2() {
    const [count, setCount] = createSignal(0);
    return html`<button on:click=${() => setCount(v => v + 1)}>Count: ${() => count()}</button>`;
}

function Counter_HTML_3() {
    const [count, setCount] = createSignal(0);
    return html`<button @click=${() => setCount(v => v + 1)}>Count: ${() => count()}</button>`;
}

function Counter_XML_1() {
    const [count, setCount] = createSignal(0);
    return xml`<button onClick=${() => setCount(v => v + 1)}>Count: ${() => count()}</button>`;
}

function Counter_XML_2() {
    const [count, setCount] = createSignal(0);
    return xml`<button on:click=${() => setCount(v => v + 1)} prop:innerText=${() => `Count: ${count()}`} />`;
}

// function Counter_JSX_1() {
//     const [count, setCount] = createSignal(0);
//     return <button onClick={() => setCount(v => v + 1)}>Count: {() => count()}</button>;
// }

// function Counter_JSX_2() {
//     const [count, setCount] = createSignal(0);
//     return <button on:click={() => setCount(v => v + 1)}>Count: {() => count()}</button>;
// }





function App() {
    return [
        () => timer(),
        h(Counter_H_1, {}),
        h(Counter_H_2, {}),
        h(Counter_H_2, {}),
        h(Counter_H_3, {}),
        h(Counter_HTML_1, {}),
        h(Counter_HTML_2, {}),
        h(Counter_HTML_2, {}),
        h(Counter_HTML_3, {}),
        h(Counter_XML_1, {}),
        h(Counter_XML_2, {}),
        h(Counter_XML_2, {}),
        // h(Counter_JSX_1, {}),
        // h(Counter_JSX_2, {}),
    ]
}



render(App, document.getElementById("app")!)