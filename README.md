# solid-html

This library is an alternative to h and html provided by solid-js for no-build or no-jsx projects.

It provides 3 functions for templating. 
- `h` - Use for minimally nested components and elements ( < 2 Layers) or when type checking is desired
- `xml` - Use for heavily nested components and elements ( > 2 Layers) (Adapted from https://pota.quack.uy/XML)
- `html` - Use for plain html/svg elements. More performant

## `h` and `H` function

`h(tagName,props,...children)` will either
 - Create and return an element with the given tagname and apply it's props reactively.
 - Create and return a componenet with the given function or registered Componenent Name and it's props wrapped into getters.

 ```ts
function Counter(){
    const [count,setCount] = createSignal(0)
    return h("button",{onClick:()=>setCount(v=>v+1)},()=>props.count())
}
 ```

### Wrapping Props

For components only, it will wrap `()=>value` props in getters under the following conditions:
 - function has length of 0 (no arguments)
 - function is not registered with `once`

 ```ts
import {h,once} from "solid-html"

 function Counter(props: {setCount:Setter<number>, count: Accessor<number>}){
  return h("button",{onClick:()=>setCount(v=>v+1)},()=>props.count())
 }

 function App(){
  const [count,setCount] = createSignal(0)
  
  return h(Counter,{
    // setCount won't wrap into getter since it has an argument
    setCount,
    // count is wrapped but wrap is accounted for
    count: ()=>count
    //count is marked to opt out of wrap
    count: once(count)
    })
 }
 ```

### Registering Components
Components can be registered by string. This becomes more important with xml.

```ts
import {H, h} from "solid-html"

//define counter on global h.
h.define({
  Counter
})

// Register new h with custom components
const localH = H({
  Counter
})

//works with string now
function App(){
  return localH("Counter",{})
}


```
The following components are registered by default.

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


### Context

In order to have components render in the right context, `h` has to be wrapped like `()=>h()` for children of context providers or any component providing context within it. 
```ts
const ctx = createContext("Default")

function App(){
  return h(ctx.Provider,{value:"App"},()=>h("div",{},()=>useContext(ctx)))
}
```

## `xml` function 

`xml` provides a similar experience to JSX. It compiles the string into a series of `h` calls. It uses XML syntax which comes with the following rules:
- Elements must be closed with matching tag or be self closing.
- Attribute values must be quoted. (If it's a single hole, quotes are added (class=${"btn"}))
- Attribute names must be `^[a-zA-Z_][a-zA-Z0-9._-]*$` and be in specified namespace (bool:hidden)
- Some characters (>,<,&) may have to be encoded depending on their location
- Tag names and attributes are case sensitive
- Tag names and attribute names cannot be dynamic

```ts
function Counter(){
  const [count,setCount] = createSignal(0)
  return xml`<button onClick=${()=>setCount(v=>v+1)}>${count}</button>`
}

//Prop wrapping rules are the same as h. Needs additional ()=> or once() for zero length fns
function App() {
  return xml`<HashRouter root=${() => (Layout)}>
    <Route path="/" component=${() => (Home)} />
    <Route path="/home" component=${once(Home)} />
    <Route path="/about" component=${() => About} />
  </HashRouter>`
}
```

### Registering Components
Components can be registered by string. This becomes more important with xml.

```ts
import {XML, xml} from "solid-html"

//global xml has global h attached to it.
xml.h.define({
  HashRouter,
  Route
})


// Register new xml with custom components
const localXml = XML({
  Counter
})

//works with string now
function App(){
  return localXml`<Counter />`
}
```

## Context
Since all component creation is handled by the xml function, they will run in the proper context automatically.


## `html` function

`html` uses lit-html style syntax in addtion to standard solid-js rules. The main advantage of this is vscode extensions for lit-html now also work for this (Formatting, TS featues). `html` can only be used for actual html elements not components. Componenets must use `h` or `xml`. Element tags cannot be dynamic. `svg` and `mathml` should be used for fragments within svgs or mathml tags.

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

## Customizing Syntax

`solid-html` has slightly different rules from solid-js for applying attributes to elements. There are a set of rules that it checks for before applying them to an element. Additional rules can be added for `h`,`xml`, and `html`

### Default Rules

```ts
export type AssignmentFunction = (
  node: Element,
  name: string,
  value: any,
  prev: any
) => any;

export type RuleFilter = (
  node: Element,
  name: string,
  value: any,
  prev: any
) => string;

export type AssignmentRule = {
  filter: string | RuleFilter;
  assign: AssignmentFunction;
  isReactive?: boolean;
};

export const defaultRules: AssignmentRules = [
  { filter: "on:", assign: assignEvent, isReactive: false },
  { filter: "on", assign: assignDelegatedEvent, isReactive: false },
  { filter: "prop:", assign: assignProperty },
  { filter: "bool:", assign: assignBooleanAttribute },
  { filter: "attr:", assign: assignAttribute },
  { filter: "ref:", assign: assignRef, isReactive: false },
  { filter: "class:", assign: assignClass },
  { filter: "style:", assign: assignStyle },
  { filter: "@", assign: assignDelegatedEvent, isReactive: false },
  { filter: ".", assign: assignProperty },
  { filter: "?", assign: assignBooleanAttribute },
  { filter: "", assign: assignAttribute } //default
]
```

### Adding rules
```ts
const h = H({},[{
  filter: "custom:", assign(node,name,value,prev){
    node[name] = `custom${value}`
    return value
  }
}])

const html = HTML({},[{
  filter: "$", assign(node,name,value,prev){
    node.setAttribute("money",`$${value}.00`)
    return value
  }
}])

// Only namespace rules (prefix:) can be added to xml. They also have to be added to the xmlns registry.
const xml = XML({
  Counter
},[{
  filter: "custom:", assign(node,name,value,prev){
    node[name] = `custom${value}`
    return value
  }
}],["custom"])

//or

xml.xmlns.push("custom")


```





## Components Wrappers

Prebuilt wrappers for Solid's control for components are exported for more concise code and correct type checking. Use as functions, do not use with `h`


```typescript
declare function Show<T>(when: () => T, children: (item: Accessor<NonNullable<T>>) => JSX.Element, fallback?: () => JSX.Element): JSX.Element;
/**
 * Show component with keyed mode. Renders children with keyed context if `when` is truthy.
 * @example
 * ShowKeyed(() => user(), user => html`<span>${user.name}</span>`, "No user")
 */
declare function ShowKeyed<T>(when: () => T, children: ((item: NonNullable<T>) => JSX.Element), fallback?: () => JSX.Element): JSX.Element;
/**
 * Switch component for conditional rendering. Renders the first matching child, or `fallback` if none match.
 * @example
 * Switch("No match", Match(() => cond1(), html`A`), Match(() => cond2(), html`B`))
 */
declare function Switch(children: () => JSX.Element[], fallback: () => JSX.Element): JSX.Element;
/**
 * Match component for use inside Switch. Renders children if `when` is truthy.
 * @example
 * Match(() => value() === 1, html`One`)
 */
declare function Match<T>(when: () => T, children: ((item: Accessor<NonNullable<T>>) => JSX.Element)): JSX.Element;
/**
 * Keyed Match component for use inside Switch. Renders children with keyed context if `when` is truthy.
 * @example
 * MatchKeyed(() => user(), user => html`<span>${user.name}</span>`)
 */
declare function MatchKeyed<T>(when: () => T, children: ((item: NonNullable<T>) => JSX.Element)): JSX.Element;
/**
 * For component for iterating over arrays. Renders children for each item in `each`.
 * @example
 * For(() => items(), (item) => html`<li>${item}</li>`)
 */
declare function For<T extends readonly any[]>(each: () => T | false | null | undefined, children: (item: T[number], index: () => number) => JSX.Element, fallback?: () => JSX.Element): JSX.Element;
/**
 * Index component for iterating over arrays by index. Renders children for each item in `each`.
 * @example
 * Index(() => items(), (item, i) => html`<li>${item()}</li>`)
 */
declare function Index<T extends readonly any[]>(each: () => T | false | null | undefined, children: (item: () => T[number], index: number) => JSX.Element, fallback?: () => JSX.Element): JSX.Element;
/**
 * Suspense component for async boundaries. Renders `children` or `fallback` while loading.
 * @example
 * Suspense(html`<div>Loaded</div>`, html`<div>Loading...</div>`)
 */
declare function Suspense(children: () => JSX.Element, fallback?: () => JSX.Element): JSX.Element;
/**
 * ErrorBoundary component. Catches errors in children and renders `fallback` on error.
 * @example
 * ErrorBoundary(html`<App />`, (err) => html`<div>Error: ${err.message}</div>`)
 */
declare function ErrorBoundary(children: () => JSX.Element, fallback: ((err: any, reset: () => void) => JSX.Element)): JSX.Element;
/**
 * Context provider component. Provides a context value to all children.
 * @example
 * Context(MyContext, value, () => html`<Child />`)
 */
declare function Context<T>(context: Context$1<T>, value: T, children: () => JSX.Element): JSX.Element;
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

function Counter() {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count => count + 1);

  return xml`<button type="button" onClick=${increment}>
    Count: ${count}
  </button>`
}

function Counter() {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count => count + 1);

  return h("button",{type:"button",onClick:increment},()=>`Count: ${count()}`)
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

