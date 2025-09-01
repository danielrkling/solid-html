# solid-html

This library is an alternative to h and html provided by solid-js for no-build or no-jsx projects. The main difference is it allows custom syntax rules for applying properties/attributes. It's performance is a little slower but comparable to solid-js/html.

It provides 2 functions for templating. 
- `h` - Use when type checking is desired
- `html` - Use most of the time

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

For components, it will wrap `()=>value` props in getters under the following conditions:
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
Components can be registered by string. This becomes more important with html.

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
- on `h.define` the registry is case sensitive
- on `h.define` it is possible to define a component named div, and make all divs behave differently. This is a warning, not a recommendation.


### Context

In order to have components render in the right context, `h` has to be wrapped like `()=>h()` for children of context providers or any component providing context within it. 
```ts
const ctx = createContext("Default")

function App(){
  return h(ctx.Provider,{value:"App"},()=>h("div",{},()=>useContext(ctx)))
}
```

## `html` function 

`html` provides a similar experience to JSX. It creates templates for 
- Elements and Components must be closed with matching tag or be self closing.
- Tag names and attributes are case sensitive
- Tag names and attribute names cannot be dynamic
- `<div ${(e)=>console.log(e)} />` Holes in element apply ref
- `<div ...${{class:"red"}} />` or `<div ...${{class:"red"}} />` Spread can be applied to elements and components. Components spread cannot be dynamic though.

```ts
function Counter(){
  const [count,setCount] = createSignal(0)
  return html`<button onClick=${()=>setCount(v=>v+1)}>${count}</button>`
}

//Prop wrapping rules are the same as h. Needs additional ()=> or once() for zero length fns
function App() {
  return html`<HashRouter root=${() => (Layout)}>
    <Route path="/" component=${() => (Home)} />
    <Route path="/home" component=${once(Home)} />
    <Route path="/about" component=${() => About} />
  </HashRouter>`
}
```

### Registering Components
Components can be registered by string. This becomes more important with xml.

```ts
import {HTML, html} from "solid-html"

//global html has global h attached to it.
html.h.define({
  HashRouter,
  Route
})


// Register new xml with custom components
const localHTML = HTML({
  Counter
})

//works with string now
function App(){
  return localHTML`<Counter />`
}
```

## Context
Component creation is handled by the html function, they will run in the proper context automatically.


## Customizing Syntax

`solid-html` has slightly different rules from solid-js for applying attributes to elements. There are a set of rules that it checks for before applying them to an element. Additional rules can be added for `h` and `html`

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
  isReactive?: boolean; //default = true
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

```





## Components Wrappers

Prebuilt wrappers for Solid's control for components are exported for more concise code and correct type checking. Use as functions, do not use with `h`.

```ts
import {Show, For} from "solid-html/components"

function App(){
  
  return Show(()=>open(),()=>For(()=>[1,2,3],(v)=>`Number: ${v}`))
}
```


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

