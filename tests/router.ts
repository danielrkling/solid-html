import { A, HashRouter, Route, createAsync, type RouteSectionProps } from "@solidjs/router";
import { render, Suspense } from "solid-js/web";
import _sld from "../src";
import { createSignal } from "solid-js";

const [time, setTime] = createSignal(0)

setInterval(() => setTime(s => s + 1), 1000)

const sld = _sld.define({
  A,
  HashRouter,
  Route,
  Suspense,
  Routes
});

function Routes() {
  return sld`<A href="home">Home</A>
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
  return sld`
    <div>
      <nav>
        <time title=${() => time()} class="mx-2 flex-1 px-2">SPAN </time>

        <Routes />
      </nav>
    </div>
    <main class="bg-base-100 w-full overflow-auto grow">
      ${props.children}

      EdgeCase=${"Hello"} can be prevented with \${"=" + "Hello"} like Solved${"=" + "Hello"}

    </main>
`;
}

function App() {

  return sld`<HashRouter root=${() => (Layout)}>
    <Route path="/" component=${() => (Home)} />
    <Route path="/home" component=${() => (Home)} />
    <Route path="/about" component=${() => About} />
  </HashRouter>`
}

function Home() {
  return sld`<div   class:even=${() => time() % 2} class="base-class" style:width=${() => `${time() * 4}px`} >Home</div>`
}

function About() {
  return sld`
<svg version="1.1"
     baseProfile="full"
     width="20" height="600"
>
     
   <defs>
          <path id="testPath" d="M 10 10 L 10 600 z"
         stroke="black" stroke-width="3" />
   </defs>
   
   <text>
      <textPath href="#testPath">
         teeeest
      </textPath>
   </text>
   
</svg>
  `
}

render(App, document.getElementById("app")!);

