import { createContext, useContext } from "solid-js";
import { render } from "solid-js/web";
import { XML } from "../src";


const ctx = createContext("Wrong Context")

const xml = XML({ Provider: ctx.Provider, ReadContext, ShowChildren })

function ReadContext() {
    const context = (useContext(ctx))

    return xml`<div>${context}</div>`
}

function ShowChildren(props) {
    return props.children
}

function App() {
    return xml`
    <Provider value=${"Correct Context"}><ReadContext /></Provider>
    <Show fallback="${"A"}${"B"}" when=${false} >${"B"}</Show>
    <Show when=${false} children=${"C"} />
    <ShowChildren attr.="2" >This Should be A: ${"A"}</ShowChildren>
    `
}

render(App, document.getElementById("app")!);
