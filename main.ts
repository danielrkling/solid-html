import { createEffect, createSignal } from "solid-js";
import { render } from "solid-js/web";
import { sld } from "./src";

const Circle = () => {
  return sld`<circle cx="0" cy="0" r="50" fill="red" />`;
};

function Vector() {
  return sld.define({ Circle })`
    <div>
      <svg width="500" height="250">
        <circle cx="0" cy="0" r="20" fill="#000" />
        <Circle />
      </svg>
    </div>
  `;
}

render(Vector, document.getElementById("app")!);
