import { Show, createContext, useContext } from "solid-js";
import { render } from "solid-js/web";
import { html } from "../src";
import htm from "solid-js/html"

const ctx = createContext("Wrong Context")

html.h.define({ Provider: ctx.Provider, ReadContext, ShowChildren })

function ReadContext() {
    const context = (useContext(ctx))

    return html`<div>${context}</div>`
}

function ShowChildren(props) {
    return props.children
}

function App() {
    return html`
    <${ctx.Provider} value=${"Correct Context"}><${ReadContext} /></>
    <${Show} when=${false} >${"B"}<//>
    <${ShowChildren}>This Should be A: ${"A"}<//>
    `

    return html`
    <Provider value=${"Correct Context"}><ReadContext /></Provider>
    <Show when=${false} >${"B"}</Show>
    <ShowChildren>This Should be A: ${"A"}</ShowChildren>
    `
}

render(App, document.getElementById("app")!);
