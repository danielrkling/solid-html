import { createSignal, batch, createEffect } from "solid-js";
import { SetStoreFunction, Store, createStore } from "solid-js/store"
import { render } from "solid-js/web";
import { h, html, For } from "../src";

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
      ${For(() => todos, (todo, i) =>
      html`<div>
          <input
            type="checkbox"
            ?checked=${() => todo.done}
            @change=${(e) => setTodos(i(), "done", e.currentTarget.checked)}
          />
          <input
            type="text"
            .value=${todo.title}
            @change=${(e) => setTodos(i(), "title", e.currentTarget.value)}
          />
          <button ...${{ onClick: () => setTodos((t) => removeIndex(t, i())) }}>
            x
          </button>
        </div>`)}

    `
  );
};

render(App, document.getElementById("app")!);


