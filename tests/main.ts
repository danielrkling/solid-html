import { render } from "solid-js/web";
import { createSignal, createContext, useContext } from "solid-js";
import {html, xml, h} from "../src"

const ctx = createContext("Default")

//XML style templating (inspired from Pota)
xml.define({ Counter, Provider: ctx.Provider })
function App() {
    return xml`${h(Div,{color: "red"},)}<For each=${["A","B","C"]}>${(v)=>xml`<Provider value=${v}><Counter></Counter></Provider>`}</For>`
}

//Hyperscript style
function Div(props){
  return h("div",{style:()=>`color:${props.color}`},"Example for h")
}

//Lit style templating
function Counter() {
  const [count, setCount] = createSignal(1);
  const increment = () => setCount(count => count + 1);

  return (
    html`<button type="button" ${console.warn} ${console.error}1  prop:Solid=${1} @click=${increment}>
      Count ${"A"}: <span style="color:red">${()=>count()}</span>
    </button>`
  );
}

render(Counter, document.getElementById("app")!);
