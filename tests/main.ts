
import { render } from "solid-js/web";
import { html } from "../src/html.ts";

const t = html`<div  nothing="att" class="${2} test ${1}"  ...${{}}  .nodeValue="13  ${"12"}" ${"1"} ${1} ID=${"someid"}>Hello ${"World"}! ${"This is Danny"}</div>`


render(()=>t, document.getElementById("app")!);