import { createContext, createResource, useContext } from "solid-js";
import { render } from "solid-js/web";
import { Context, Match, Suspense, Switch, h, html } from "../src";

const ctx = createContext("Global")

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function Consumer() {

  return html`<span>${useContext(ctx)}</span>`
}


function App() {

  return html`<div  ...${{"attr1":1}} .class=${"red"} >${"Child"}</div>`
}


render(() => h(App, {}), document.getElementById("app")!);