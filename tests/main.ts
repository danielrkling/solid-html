import { render } from "solid-js/web";
import { createSignal, createContext, useContext } from "solid-js";
import {
  xml,
  h,
  HTML,
  assignEvent,
  assignProperty,
  assignDelegatedEvent,
  assignBooleanAttribute,
  assignAttribute,
} from "../src";

const html = HTML([
  ["on:", assignEvent],
  ["@", assignDelegatedEvent],
  ["prop:", assignProperty],
  [".", assignProperty],
  ["bool:", assignBooleanAttribute],
  ["?", assignBooleanAttribute],
  ["attr:", assignAttribute],
]);

//Lit style templating
function Counter() {
  const [count, setCount] = createSignal(1);
  const increment = () => setCount((count) => count + 1);

  return html`<button type="button" @click=${increment}>
    Count : ${() => count()}
  </button>`;
}

render(Counter, document.getElementById("app")!);
