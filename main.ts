import { render } from "solid-js/web";
import { createSignal } from "solid-js";
import { html } from "./solid-html";

function Counter() {
  const [count, setCount] = createSignal(1);
  const increment = () => setCount(count => count + 1);

  return (
    html`<button type="button" @click=${increment}>
      ${count}
    </button>`
  );
}

render(Counter, document.body);