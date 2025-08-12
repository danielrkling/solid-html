import {
    A,
    HashRouter,
    Route,
    type RouteSectionProps
  } from "@solidjs/router";
  import { render } from "solid-js/web";
  // import { currentUser } from "./global";
  import { h, html } from "../src";

  
  function Routes() {
    return html`
      <li>${h(A, { href: "mustering", innerText: "Mustering" })}</li>
      <li>${h(A, { href: "calendar", innerText: "Calendar" })}</li>
      <li>${h(A, { href: "report", innerText: "Report" })}</li>
      <li>${h(A, { href: "profile", innerText: "Profile" })}</li>
    `;
  }
  
  function Layout(props: RouteSectionProps) {
    // const user = createAsync(()=>currentUser())
    // const role = createAsync(()=>currentRole())
    // const [pending,start] = useTransition()
    return html`<div class="drawer">
      <input id="my-drawer-3" type="checkbox" class="drawer-toggle" >
      <div class="drawer-content flex flex-col h-screen print:h-auto">
        <div class="navbar bg-base-300 w-full print:hidden">
          <div class="flex-none lg:hidden">
            <label
              for="my-drawer-3"
              aria-label="open sidebar"
              class="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="inline-block h-6 w-6 stroke-current"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
          <div class="mx-2 flex-1 px-2">${`() => currentUser.value?.fullname`}</div>
          <div class="hidden flex-none lg:block">
            <ul class="menu menu-horizontal">
              ${h(Routes, {})}
            </ul>
          </div>
        </div>
        <main class="bg-base-100 w-full overflow-auto grow">
          ${`()=>props.children`}
        </main>
      </div>
      <div class="drawer-side">
        <label
          for="my-drawer-3"
          aria-label="close sidebar"
          class="drawer-overlay"
        ></label>
        <label for="my-drawer-3" class="bg-base-200 min-h-full w-80 p-4">
          <ul class="menu w-full">
            ${`h(Routes, {})`}
          </ul>
        </label>
      </div>
    </div>`;
  }
  
  function App() {
    return h(HashRouter, {
      root: Layout,
      children: [
        h(Route, {
          path: "/",
          get component() {
            return Mustering;
          },
        }),
        h(Route, {
          path: "/mustering",
          get component() {
            return Mustering;
          },
        }),
        h(Route, {
          path: "/calendar",
          get component() {
            return Mustering;
          },
        }),
        h(Route, {
          path: "/report",
          get component() {
            return Mustering;
          },
        }),
        h(Route, {
          path: "/profile",
          get component() {
            return Mustering;
          },
        }),
      ],
    });
  }

  
  render(App, document.getElementById("app")!);

  
  function Mustering(){
    return html`<button>MUSTERING</button>`
  }