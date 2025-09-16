import { SLD, sld, defaultComponents, comp } from "../src";
import { Show, createComponent, type Component, For } from "solid-js";

import { render } from "solid-js/web";
import { createSignal } from "solid-js";

const onlyCounter = SLD({ Counter });
const defaultAndCounter = sld.define({ Counter });
const alsoDefaultAndCounter = SLD({ ...defaultComponents, Counter });

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
    defaultAndCounter`<Counter message="" />`,
    sld.define({ Counter })`<Counter message="inline " />`,
    sld.define({ Counter }).sld`<Counter message="sld tag " />`, //named tag for future vscode extension when inlining

    onlyCounter.Counter({ message: "Only Counter " }), //allows for better type checking than createComponent without addtional tools
    //Example
    comp(For)({
      get each() {
        return [1, 2, 3]; //reactive props need to be manually wrapped
      },
      children: (num) => num.toString(),
    }),
    sld.For( {
      get each() {
        return [1, 2, 3]; //reactive props need to be manually wrapped
      },
      children: (num) => num.toString(),
    }),
  ],
  document.getElementById("app")!,
);
