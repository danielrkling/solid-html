# solid-html

This library is an alternative to h and html provided by solid-js for a no-build solution made to work with lit-html tooling.

## `h` function

`h` is essentially just a wrapper around `createDynamic` to make it lazy and change `()=>value` to getters on props

For componenets with overloads (Show) the types for properties may cause issues.

```typescript
export function h<T extends ValidComponent>(
  component: T,
  props: PossibleFunction<ComponentProps<T>>
): JSX.Element {
  return (() => createDynamic(() => component, wrapProps(props))) as unknown as JSX.Element;
}

h("button",{onClick:()=>alert("Alert"), children: "Click Me"})
h(For,{each:()=>[1,2,3], children: (item)=>h("li",{textContent:item})})
```

## `html` function

`html` uses lit-html style syntax. The main advantage of this is vscode extensions for lit-html now also work for this (Formatting, TS featues). The explicit nature makes it very simple as well. `html` will work with custome elements just fine. `html` can only be used for actual html elements not components. Componenets must use `h`. Element tags cannot be dynamic.

Attributes
- `$ref` - accepts callback with the element at creation time ($so vscode extension doesnt give warning)
- `...` - Spread Syntax - This will use solid property names applied to the element (e.g. onClick or on:click)
- `@event` - Attaches listener to the element same as on:click (Not sure how to delegate here)
- `.prop` - Applies value as element property
- `?attr` - Toggle boolean attribute
- `attr` - Plain attribute

Children
- `${value}` can be placed within the content of an element 

```typescript
html`<button class=${"flex"} ?disabled=${()=>false} @click=${()=>alert("Alert")}>Click ${"Me"}</button>`
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