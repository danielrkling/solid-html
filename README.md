# sld

sld is a no-build, no-JSX tagged-template library for SolidJS and designed to work with template tooling (editor syntax highlighting, formatters, etc.).

## Quick overview

- `sld` - default tagged template instance with the built-in component registry.
  - `sld.define({CompA})` - creates a new instance from the existing instance and combines registered components
  - `sld.sld` - self reference so all tags can start with `sld` for potential tooling
- `SLD({CompA})` - factory function which includes built-in components
- `createSLD({CompA})` - factory function which doesn't include built-in components
- `run(CompA)(props)` helper function for createComponent to get better TypeScript types. Must manually do getters on props.

## Basic usage

Use the default `sld` tag for templates and the `SLD` or `sld.define` factory to create a local instance.

```ts
import { sld } from "solid-html";

//Write a component with JSX like syntax
function Counter() {
  const [count, setCount] = createSignal(0);
  return sld`<button onClick=${() => setCount((v) => v + 1)}>
    ${() => count()}
  </button>`;
}

//Use component in another template by defining or inlining
function App(){
  return sld.define({Counter}).sld`
  <Counter />
  <${Counter} />
`
}

//Render like normal solid-js component
render(()=>App(),document.body)
```
## Syntax

### Text & Whitespace
- Text in the template gets set via innerHTML so it will decode html encoded characters. You really only need this for < `&lt;` and > `&gt;` and sometimes spaces (&nbsp;)
- Pure whitepace between elements is ignored in the AST. Leading and Trailing Whitespace is omitted when there is at least one expression in it.
- When in doubt set text via expression to ensure exact match.

### Elements && Component Tags
- Tag names must immediately follow < and can have `a-zA-Z0-9.:-_` characters.
- Elements/Components can be self closing `<div />`, matched closing `<div></div>`, or shorthand closing `<div><//>` (Not recomended for elemnts)
- Capital tags are treated as components and will throw if now registered `<ComponentA></ComponentA>` or `<ComponentA><//>` (Not recomended for registered components)
- Tags can also be dynamic `<${ComponentA} />` with self closing or `<${ComponentA}><//>`. ComponentA must be a function.
- Content between tags is treated as children. Will return an array unless only one child node (text,elem, or expression)

### Attributes & Properties
- `<input value="Hello World" />` - static string property
- `<input value='Hello World' />` - static string property
- `<input disabled />` - static boolean property
- `<input value=${val} />` - dynamic property
- `<input value="${val}" />` - dynamic property
- `<input value='${val}' />` - dynamic property
- `<input value="Hello ${val}" />` - mixed dynamic string property
- `<input onEvent=${} />` — Delgated event listener (Not Reactive)
- `<input onevent=${} />` - Delegated event (depracated) (Not Reactive)
- `<input on:event=${} />` - event listener on the element (Not Reactive)
- `<input prop:value=${} />` — DOM property
- `<input attr:class=${} />` — string attribute
- `<input bool:disabled=${} />` — boolean attribute
- `<input ...${} />` — spread properties
- `<input ${} />` also spread
- `<input ref=${} />` — ref (Not Reactive)
- `<div children=${} />` attribute is used only if the element has no child nodes (JSX-like behavior).

## Reactivity and props

- Props that are functions with zero arguments and not `on` events or `ref` are treated as reactive accessors and are auto-wrapped (so you can pass `() => value` and the runtime will call it for updates).
- For properties that accept a function that are not `on` events. You may need to add `()=>` to ensure the function doesn't get wrapped.

```ts
import { sld, run } from "solid-html";

const [count, setCount] = createSignal(0);

sld`<button count=${() => count()}  />`;
//or just the signal/memo
sld`<button count=${count} />`;

//Add ()=> to avoid Counter possibly getting auto-wrapped
sld`<Route component=${()=>Counter} />`

//Using the run helper with getters. (TS support)
//reactive props must be read in getters.
const [show,setShow] = createSignal(true)
sld`<div>
  ${run(Show)({
    get when(){
      return show()
    },
    children: "Hello World"
  })}
</div>`
//vs
sld`<div>
  <Show when=${show}>
    Hello World
  </Show>
</div>`

```


## HTML vs JSX vs SLD

| Feature | HTML | JSX | sld |
| :--- | :--- | :--- | :--- |
| **Syntax Style** | Tag-based markup language. | XML-like syntax extension for JavaScript. | Tagged-template literal that mimics HTML/JSX. |
| **Case Sensitivity** | Tag and attribute names are **case-insensitive**. | **Case-sensitive**. Lowercase for HTML elements (`div`), PascalCase for components (`MyComponent`). | **Case-sensitive**. Distinguishes between standard elements and capitalized components (`<ComponentA />`). |
| **Valid Tag Characters** | `a-z`, `0-9`, and `-` (for custom elements). | Standard JavaScript identifier characters. | `a-z`, `A-Z`, `0-9`, `.`, `:`, `-`, `_`.  |
| **Valid Attribute Name Characters** | Almost anything | Standard JavaScript identifier characters + ":". | `a-z`, `A-Z`, `0-9`, `.`, `:`, `-`, `_`.  |
| **Self-Closing Tags** | Only for "void elements" like `<input>` and `<img>`. Writing `<div />` is invalid. | **Any element** can be self-closing if it has no children (e.g., `<div />`). | **Any element** can be self-closing (`<div />`). "void elements are auto-closed". Also supports a shorthand closing tag (`<div><//>`). |
| **Whitespace Rules** | Collapses multiple whitespace characters between elements into a single space. | Similar to HTML, collapses whitespace. Use `{ ' ' }` for explicit spacing. | Leading/trailing whitespace only text nodes are omitted in at the top level and as child nodes. |
| **Character Decoding** | Automatically decodes HTML entities (e.g., `&lt;` becomes `<`). | Encodes string content by default to prevent XSS. Raw HTML requires `dangerouslySetInnerHTML`. | Text is set via `innerHTML`, so it decodes HTML entities like `&lt;` and `&nbsp;`. |
| **Dynamic Attributes** | Not supported. Requires JavaScript to manipulate the DOM. | Uses curly braces `{}` to embed JavaScript expressions for props. | Uses template literal placeholders `${}` for dynamic properties, events, and spreads. |
| **Component Model** | Uses "Custom Elements" (e.g., `<my-element>`). | Components are functions or classes, invoked with `<MyComponent />`. | Components are functions registered via `sld.define()` or inlined (`<${Comp} />`). |
| **Comments** | `<!-- comment -->` | Uses JavaScript block comments inside braces: `{/* comment */}` | `<!-- comment -->` (Skipped during parsing) |
| **Spread** | N/A | `{...obj}` | `...${}` or `${}` |