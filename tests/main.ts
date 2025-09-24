import { For } from "solid-js";
import { SLD, createSLD, defaultComponents, run, sld } from "../src";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

const onlyCounter = createSLD({ Counter });
const defaultAndCounterA = SLD({ Counter });
const defaultAndCounterB = createSLD({ ...defaultComponents, Counter });
const defaultAndCounterC = sld.define({ Counter });

function Counter(props: { message: string }) {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount((count) => count + 1);

  return sld`<button type="button" onClick=${increment}>
      ${() => props.message} ${() => count()}
    </button>
    `;
}


render(
  () => [
    defaultAndCounterA`<Counter message="" />`,
    sld.define({ Counter })`<Counter message="inline " />`,
    sld.define({ Counter }).sld`<Counter message="sld tag " />`, //named tag for future vscode extension when inlining

    //Example
    run(For)({
      get each() {
        return [1, 2, 3]; //reactive props need to be manually wrapped
      },
      children: (num) => num.toString(),
    }),

  ],
  document.getElementById("app")!,
);
