import { getTemplateHtml } from "../src/lit-html.ts";

function html(strings: TemplateStringsArray, ...values: any[]): string {
  const template = getTemplateHtml(strings, "html", values);
  return template;
}


console.log(html`<div class="test" id="test">Hello ${"World"}!</div>`);
// Output: <div class="test" id="