import { createSignal } from "solid-js";
import { render } from "solid-js/web";
/** @jsx h */
import {h} from "../src"


//Lit style templating
function Counter() {
    const [count, setCount] = createSignal(1);
    const increment = () => setCount(count => count + 1);
  
    return (
      <button attr:type="button" prop:value={1} on:click={increment}>
        Count: {()=>count()}
      </button>
    )
  }
  
  render(Counter, document.getElementById("app")!);