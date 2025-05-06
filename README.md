# solid-html

This library is an alternative to h and html provided by solid-js for a no-build solution made to work with lit-html tooling.

## `h` and `create` function

`create` will create a component using uses createElement / createComponent and changes `()=>value` to getters on props. 

In order to have components render in the right context, create has to be called within the context of the parent component. This is done with the `h` function.

`h` wraps `create` to return an accessor to the component. Most of the time you will want to use `h`. However, this wrappin gcan cause issues when trying to render an array that reads a signal in one of its entries. The solution for this opt out of the wrap using the `create` function.

Prebuilt wrappers for Show (keyed=false), Keyed (Show w/ keyed=true), For, Index, and Suspense are included for more concise code. 

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

`html` uses lit-html style syntax. The main advantage of this is vscode extensions for lit-html now also work for this (Formatting, TS featues). The explicit nature makes it very simple as well. `html` will work with custome elements just fine. `html` can only be used for actual html elements not components. Componenets must use `h`. Element tags cannot be dynamic.

Attributes
- `$ref` - accepts callback with the element at creation time ($so vscode extension doesnt give warning)
- `...` - Spread Syntax - This will use solid property names applied to the element (e.g. onClick or on:click)
- `@event` - Attaches delegated listener to the element
- `.prop` - Applies value as element property
- `?attr` - Toggle boolean attribute
- `attr` - Plain attribute

Children
- `${value}` can be placed within the content of an element 

```typescript

//Static properties
html`<div class=${"container"}>Content</div>` ✅ // Class applied as an attribute
html`<div class="${"container"}">Content</div>` ✅ // Surrounding quotes works (quotes get added automatically if not)
html`<input .value=${"Text"} />` ✅ // Applying a property to an element
html`<button ?disabled=${false}>Click Me</button>` ✅ // Toggle boolean attributes
html`<button @click=${()=>console.log("Clicked!")}>Click</button>` ✅ // Attaching an event listener
html`<input ...${{ onInput: (e) => console.log(e.target.value) }} />` ✅ // Spread syntax for properties
html`<div $ref=${(el) => console.log(el)}>Hello</div>` ✅ // Using a ref callback


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


// Not supported
html`<${dynamicTag}>Hello</${dynamicTag}>` ❌ // Element tags **cannot** be dynamic, use createDyanmic from solid-js
html`<MyComponent></MyComponent>` ❌ // Components **must** use `h`, not `html`
html`<div class="btn ${"bg-blue"}" ></MyComponent>` ❌ // attribute values must be 100% static or 100% dynamic
html`<div ${dynamicName}="value" ></MyComponent>` ❌ // attribute names cannot be dynamic, use spread instead
html`<div ${dynamicName}=${value} ></MyComponent>` ❌ // attribute names cannot be dynamic, use spread instead
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