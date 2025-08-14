import { render } from "solid-js/web";
import { createSignal, createContext, useContext } from "solid-js";
import {
  XML,
  H,
  HTML,
  assignEvent,
  assignProperty,
  assignDelegatedEvent,
  assignBooleanAttribute,
  assignAttribute,
  once,
  AssignmentRules,
  assignRef,

} from "../src";

const rules: AssignmentRules = [
  ["on:", assignEvent],
  ["@", assignDelegatedEvent],
  ["prop:", assignProperty],
  [".", assignProperty],
  ["bool:", assignBooleanAttribute],
  ["?", assignBooleanAttribute],
  ["attr:", assignAttribute],
  ["ref:", assignRef]
]

const html = HTML(rules);
const h = H(rules);
const xml = XML(rules)

const ctx = createContext("Default")

//XML style templating (inspired from Pota)
xml.define({ Counter, Provider: ctx.Provider })
function App() {
    return xml`${h(Div,{color: "red"},)}<For each=${["A","B","C"]}>${(v)=>xml`<Provider value=${v}><Counter></Counter></Provider>`}</For>`
}

//Hyperscript style
function Div(props){
  return h("div",{style:()=>`color:${props.color}`,"ref:click":once(console.info)},"Example for h")
}

//Lit style templating
function Counter() {
  const [count, setCount] = createSignal(1);
  const increment = () => setCount(count => count + 1);

  return (
    html`<button type="button" .value=${1} @click=${increment}>
      Button ${useContext(ctx)}: ${()=>count()}
    </button>`
  );
}

render(App, document.getElementById("app")!);