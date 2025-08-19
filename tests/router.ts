import { A, HashRouter, Route, createAsync, type RouteSectionProps } from "@solidjs/router";
import { render, Suspense } from "solid-js/web";
import { h, html, XML, once } from "../src";
import { createSignal } from "solid-js";
import { defaultConfig } from "../src/config";

const [time, setTime] = createSignal(0)

setInterval(() => setTime(s => s + 1), 1000)

const xml = XML({
    defaultRule: defaultConfig.defaultRule,
    rules: defaultConfig.rules,
    components: {
        ...defaultConfig.components,
        A,
        HashRouter,
        Route,
        Suspense,
    },
});

function Routes() {
  return xml`<A href="home">Home</A>
  <A href="about">About Us</A>
`
}

// function Mustering(){
//   return html`<button>MUSTERING</button>`
// }

function Layout(props: RouteSectionProps) {
  // const user = createAsync(()=>currentUser())
  // const role = createAsync(()=>currentRole())
  // const [pending,start] = useTransition()
  return xml`
    <div>
      <nav>
        <span time=${time} class="mx-2 flex-1 px-2">SPAN </span>
        <Routes />
      </nav>
    </div>
    <main class="bg-base-100 w-full overflow-auto grow">
      ${props.children}
    </main>
`;
}

function App() {
  return xml`<HashRouter root=${() => (Layout)}>
    <Route path="/" component=${() => (Home)} />
    <Route path="/home" component=${() => (Home)} />
    <Route path="/about" component=${() => About} />
  </HashRouter>`
}

function Home() {
  return xml`Home`
}

function About() {
  return "About Us"
}

render(App, document.getElementById("app")!);