import { createContext, createResource, useContext } from "solid-js";
import { render } from "solid-js/web";
import { Context, Match, Suspense, Switch, h, html } from "./solid-html";

const ctx = createContext("Global")

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function Consumer() {

  return html`<span>${useContext(ctx)}</span>`
}


function App() {
  const [message] = createResource(() => wait(2000).then(() => "Hello"))



  return h(ctx.Provider, { value: "App", children: [h(Consumer,{}), create(Consumer,{})] })
}


render(() => h(App, {}), document.getElementById("app")!);