import { Show, createContext, useContext } from "solid-js";
import { render } from "solid-js/web";
import { sld } from "../src";
import htm from "solid-js/html"

const ctx = createContext("Wrong Context")

const mySld = sld.define({ Provider: ctx.Provider, ReadContext, ShowChildren })

function ReadContext() {
    const context = (useContext(ctx))

    return mySld`<div>${context}</div>`
}

function ShowChildren(props) {
    return props.children
}

function App() {
    // return html`
    // <${ctx.Provider} value=${"Correct Context"}><${ReadContext} /></>
    // <${Show} when=${false} >${"B"}<//>
    // <${ShowChildren}>This Should be A: ${"A"}<//>
    // `

    return mySld`
    <Provider value=${"Correct Context"}><ReadContext /></Provider>
    <Show when=${false} >${"B"}</Show>
    <ShowChildren>This Should be A: ${"A"}</ShowChildren>
    `
}

render(App, document.getElementById("app")!);
