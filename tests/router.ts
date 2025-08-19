import { A, HashRouter, Route, createAsync, type RouteSectionProps } from "@solidjs/router";
import { render, Suspense } from "solid-js/web";
import { h, html, XML, once } from "../src";
import { createSignal } from "solid-js";

const [time, setTime] = createSignal(0)

setInterval(() => setTime(s => s + 1), 1000)

const xml = XML({
  Routes,
  Layout,
  Route,
  HashRouter,
  A,
});

function Routes() {
  return xml`<A href="home">Home</A>
  <A href="about">About Us</A>
`
}

function getAsyncData(message) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(message);
    }, 2000);
  });
}

const user = createAsync(() => getAsyncData("User Data: John Doe"), { initialValue: "Loading User..." });



 const asyncArray = createAsync(()=>getAsyncData([1,2,3,4,5]), { initialValue: [] });

function Layout(props: RouteSectionProps) {
 

  return xml`
    <div>
      <nav>
        <span time=${time} class="mx-2 flex-1 px-2">${time} </span>
        <Routes />
      </nav>
    </div>
    <main class="bg-base-100 w-full overflow-auto grow">
      ${props.children}
    </main>
`;
}

function App() {
  return xml`<HashRouter root=${Layout}>
    <Route path="/" component=${Home} />
    <Route path="/home" component=${Home} />
    <Route path="/about" component=${About} />
  </HashRouter>`
}

function Home(props) {
  return xml`Home`
}

function About(props) {
  const [selected, setSelected] = createSignal("2");

  return xml`<Suspense><select value=${selected} onChange=${e=>setSelected(e.target.value)}><option value=${"default"}>
  ${"DEFAULT"}  
  
  </option><For each=${()=>asyncArray()} >
    ${(item) =>xml`<option value=${item} selected=${item == selected()}>Item: ${item}</option>`}
  </For></select></Suspense>`
}

render(App, document.getElementById("app")!);
