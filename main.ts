import { createDynamic, render, style } from "solid-js/web";
import { createComponent, createContext, createEffect, createSignal, useContext, Show as _Show, children, For, createResource } from "solid-js";
import { html, h, Show, Keyed, wrapProps, fragment, create, Suspense, Switch, Match } from "./solid-html";



async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}



function App() {
  const [message] = createResource(()=>wait(2000).then(()=>"Hello"))

  

  return Switch(null,Match(()=>))
}



render(() => h(App,{}), document.getElementById("app")!);