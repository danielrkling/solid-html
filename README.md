# solid-html

This library is an alternative to h and html provided by solid-js for a no-build solution made to work with lit-html tooling.

## `h` function

`h` will create a component using createElement for strings and createComponent for functions. 

It will wrap `()=>value` props in getters under the following conditions:
 - property name !== "ref" or begins with "on"
 - function has length of 0 (no arguments)
 - function is not registered with `once`

In order to have components render in the right context, `h` may have to be wrapped like `()=>h()` for children of context providers or any component providing context within it. This delays the creation of the element to after the context is set.


### Examples

```typescript
h("button",{onClick:()=>alert("Alert"), children: "Click Me"})

// Using default control flow components
h(Show,{when: ()=>show(),children: html`<span>Hello</span>`})
h(For,{each:()=>[1,2,3], children: (item)=>h("li",{textContent:item})})

//using solid-html wrappers
Show(()=>show(),html`<span>Hello</span>`,"Fallback")
For(()=>[1,2,3],(item)=>h("li",{textContent:item}),"Fallback")

//Issue with arrays
function B() {

  const [count, setCount] = createSignal(0);
  setInterval(()=>setCount(v=>v+1),2000)

  return [
    ()=>count(),
    h(Counter, {}), //Will reset state when count changes
    create(Counter, {}), //Does not reset state when count changes

  ]
}

```



## `html` function

`html` uses lit-html style syntax. The main advantage of this is vscode extensions for lit-html now also work for this (Formatting, TS featues). The explicit nature makes it very simple as well. `html` will work with custom elements just fine. `html` can only be used for actual html elements not components. Componenets must use `h` or `xml`. Element tags cannot be dynamic. `svg` and `mathml` are also exporting and should only be used for fragments within svgs or mathml tags.

Attributes
- `${}` - accepts callback with the element at creation time
- `...${}` - Spread Syntax - This will use solid property names applied to the element (e.g. onClick or on:click)
- `@event=${}` - Attaches delegated listener to the element
- `.prop=${}` - Applies value as element property
- `?attr=${}` - Toggle boolean attribute
- `attr=${}` - Plain attribute

Children
- `${value}` can be placed within the content of an element 

```typescript

//Static properties
html`<div class="container">Content</div>` ✅ // Attribute applied without binding
html`<div class=${"container"}>Content</div>` ✅ // Attribute applied with binding
html`<div class="btn ${"bg-blue"}">Content</div>` ✅ // Attribute applied with multi-part binding
html`<button disabled>Click Me</button>` ✅ // Boolean attribute applied without binding
html`<button ?disabled=${false}>Click Me</button>` ✅ // Boolean attribute applied with binding
html`<button @click=${()=>console.log("Clicked!")}>Click</button>` ✅ // Attaching an event listener
html`<input ...${{ onInput: (e) => console.log(e.target.value) }} />` ✅ // Spread syntax for properties
html`<input .value=${3} />` ✅ // Applying a property to an element. **Must** use binding
html`<input .value="Text ${"MoreText"}" />` ✅ // Multi-part bindings for string properties
html`<div ${(el) => console.log(el)}>Hello</div>` ✅ // Any binding inside an element that is not attribute is a ref callback


//Reactive properties
html`<div class=${()=>reactiveValue()}>Content</div>` ✅ // Class applied as an attribute
html`<input .value=${()=>reactiveValue()} />` ✅ // Applying a property to an element
html`<button ?disabled=${()=>reactiveValue()}>Click Me</button>` ✅ // Toggle boolean attributes
html`<input ...${()=>reactiveValue()} />` ✅ // Spread syntax for properties

//Child values
html`<p>${"Dynamic Content"}</p>` ✅ // Static text inside an element
html`<p>${()=>reactiveValue()}</p>` ✅ // Dynamic text inside an element
html`<p>${html`<b>Content</b>`}</p>` ✅ // template inside an element
html`<p>${h("b",{children:"Content"})}</p>` ✅ // h inside an element
html`<p>${jsx`<b>Content</b>`}</p>` ✅ // jsx inside an element

// Not supported
html`<${dynamicTag}>Hello</${dynamicTag}>` ❌ // Element tags **cannot** be dynamic, use createDyanmic from solid-js
html`<MyComponent></MyComponent>` ❌ // Components **must** use `h` or `jsx`, not `html`
html`<div ${dynamicName}="value" ></div>` ❌ // attribute names cannot be dynamic, use spread instead
html`<div ${dynamicName}=${value} ></div>` ❌ // attribute names cannot be dynamic, use spread instead
html`<input .value="Text" />` ❌ // Properties must have a binding
```
## XML Function
`xml` parses the template as XML and calls h on each element. Components can be defined on the global xml function or a local xml function. Taken from https://pota.quack.uy/XML and applied to Solid. Context works as expected. Component and Attributes names must be valid XML

```typescript
const ctx = createContext("Default")

xml.define({ Counter, Provider: ctx.Provider })

function App() {
    return xml`<For each=${["A","B","C"]}>${(v)=>xml`<Provider value=${v}><Counter></Counter></Provider>`}</For>`
}


function Counter() {
    const [count, setCount] = createSignal(0)
    return xml`<div><button on:click=${()=>setCount(v=>v+1)} >Button ${useContext(ctx)}: ${count}</button></div>`
}
```
The following components are the default registry.

```typescript
const defaultRegistry = {
    For,
    Index,
    Match,
    Suspense,
    ErrorBoundary,
    Show,
    Switch,
    Dynamic,
    Portal,
    NoHydration
}
```

### Notes
- `children` as an attribute will be used as long as the node doesnt have any `childNodes` (just like in JSX). It must be totally empty, or else the children attribute will be ignored
- on `xml.define` the registry is case sensitive
- on `xml.define` it is possible to define a component named div, and make all divs behave differently. This is a warning, not a recommendation.



## Components

Prebuilt wrappers for Solid's control for components are exported for more concise code and correct type checking.


```typescript
function Show(when: () => boolean, children: JSX.Element, fallback?: JSX.Element): JSX.Element;

function Keyed<T>(when: () => T, children: JSX.Element | ((item: NonNullable<T>) => JSX.Element), fallback?: JSX.Element): JSX.Element;

function For<T extends readonly any[]>(each: () => T | false | null | undefined, children: (item: T[number], index: () => number) => JSX.Element, fallback?: JSX.Element): JSX.Element;

function Index<T extends readonly any[]>(each: () => T | false | null | undefined, children: (item: () => T[number], index: number) => JSX.Element, fallback?: JSX.Element): JSX.Element;

function Context<T>(context: Context<T>, value: T | (() => T), children: () => JSX.Element): JSX.Element;

function Suspense(children: JSX.Element, fallback?: JSX.Element): JSX.Element;

function ErrorBoundary(children: JSX.Element, fallback: JSX.Element | ((err: any, reset: () => void) => JSX.Element)): JSX.Element;

function Switch(fallback: JSX.Element, ...children: JSX.Element[]): JSX.Element;

function Match<T>(when: () => (T | undefined | null | false), children: JSX.Element | ((item: T) => JSX.Element)): JSX.Element;

function MatchKeyed<T>(when: () => (T | undefined | null | false), children: JSX.Element | ((item: T) => JSX.Element)): JSX.Element;
```

## Examples

### Counter
```typescript
function Counter() {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count => count + 1);

  return html`<button type="button" @click=${increment}>
  Count: ${count}
</button>`
}
```

### Todos
```typescript
import { createSignal, batch, For, createEffect } from "solid-js";
import {SetStoreFunction, Store, createStore} from "solid-js/store"
import { render } from "solid-js/web";
import { h, html } from "./solid-html";

export function createLocalStore<T extends object>(
    name: string,
    init: T
): [Store<T>, SetStoreFunction<T>] {
    const localState = localStorage.getItem(name);
    const [state, setState] = createStore<T>(
        localState ? JSON.parse(localState) : init
    );
    createEffect(() => localStorage.setItem(name, JSON.stringify(state)));
    return [state, setState];
}

export function removeIndex<T>(array: readonly T[], index: number): T[] {
    return [...array.slice(0, index), ...array.slice(index + 1)];
}

type TodoItem = { title: string; done: boolean };

const App = () => {
    const [newTitle, setTitle] = createSignal("");
    const [todos, setTodos] = createLocalStore<TodoItem[]>("todo list", []);

    const addTodo = (e: SubmitEvent) => {
        e.preventDefault();
        batch(() => {
            setTodos(todos.length, {
                title: newTitle(),
                done: false,
            });
            setTitle("");
        });
    };

    return (
        html`
      <h3>Simple Todos Example</h3>
      <form @submit=${addTodo}>
        <input
          placeholder="enter todo and click +"
          required
          .value=${() => newTitle()}
          @input=${(e) => setTitle(e.currentTarget.value)}
        />
        <button>+</button>
      </form>
      ${h(For, {
            each: () => todos, children: (todo, i) =>
                html`<div>
          <input
            type="checkbox"
            ?checked=${()=>todo.done}
            @change=${(e) => setTodos(i(), "done", e.currentTarget.checked)}
          />
          <input
            type="text"
            .value=${todo.title}
            @change=${(e) => setTodos(i(), "title", e.currentTarget.value)}
          />
          <button @click=${() => setTodos((t) => removeIndex(t, i()))}>
            x
          </button>
        </div>`})}

    `
    );
};

render(App, document.getElementById("app")!);
```

### Children ownership

In both components A and B, the first and second counters run in the base component context and so does not reset state when show changes. (This is not the intended behavior the second)

The 3rd counter properly runs with show as the owner and will reset state

```typescript
function A() {
  const [show, setShow] = createSignal(true)

  return html`<button @click=${() => setShow(v => !v)}>${() => String(show())}</button>
  ${h(Counter, {})}
  ${h(_Show, { when: () => show(), children: h(Counter, {}) })}
  ${h(_Show, { when: () => show(), children: ()=>h(Counter, {}) })}`

}

function B() {

  const [show, setShow] = createSignal(true)
  return [
    h("button", ({
      onClick: () => setShow(p => !p),
      textContent: () => String(show())
    })),
    h(Counter, {}),
    h(_Show, { when: () => show(), children: h(Counter, {}) }),
    h(_Show, { when: () => show(), children: () => h(Counter, {}) })
  ]
}
```