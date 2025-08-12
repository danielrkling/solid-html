
import { render } from "solid-js/web";
// import { currentUser } from "./global";
import { h, html, mathml, xml } from "../src";
import { createContext, createSignal, useContext } from "solid-js";


function App() {
    return html`<math>
    <mfrac>
      ${()=>mathml`<mn>${1}</mn>`}
      
      <mn>${()=>4}</mn>
    </mfrac>
  </math>`
}




render(App, document.getElementById("app")!);

