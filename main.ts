import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { sld } from "./src";



const jsx = sld`
<tr class=${0}>
                  <td class="col-md-1" textContent=${1} />
                  <td class="col-md-4">
                    <a onClick=${2} textContent=${3} />
                  </td>
                  <td class="col-md-1">
                    <a onClick=${4}>
                      <span class="glyphicon glyphicon-remove" aria-hidden="true" />
                    </a>
                  </td>
                  <td class="col-md-6" />
                </tr>`

render(()=>jsx, document.getElementById("app")!);
