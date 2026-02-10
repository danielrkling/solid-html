import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { sld } from "./dist/index.mjs";

const jsx = sld`
<textarea type=${1}>alert("Hello");<span>${1}</span></textarea>`;

render(() => jsx, document.getElementById("app")!);
