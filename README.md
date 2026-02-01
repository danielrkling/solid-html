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

Use the default `sld` tag for templates and the `SLD` factory to create a local instance.

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

### Elements && Component Tags
- Tag names must immediately follow < and can have `a-zA-Z0-9.:-_` characters.
- Elements/Components can be self closing `<div />`, matched closing `<div></div>`, or shorthand closing `<div><//>`
- Capital tags are treated as components and will throw if now registered `<ComponentA></ComponentA>
- Tags can also be dynamic `<${ComponentA} />` with self closing or `<${ComponentA}><//>`. ComponentA must be a function.
- Content between tags is treated as children. Will return an array unless only one 

### Attributes & Properties
- `<input value="Hello World" />` - static string property
- `<input value='Hello World' />` - static string property
- `<input disabled />` - static boolean property
- `<input value=${val} />` - dynamic property
- `<input value="${val}" />` - dynamic property
- `<input value='${val}' />` - dynamic property
- `<input value="Hello ${val}" />` - mixed dynamic string property
- `onEvent=${}` or `on:event` — event listeners (Not Reactive)
- `ref=${}` — ref (Not Reactive)
- `prop:value=${}` — DOM property
- `attr:class=${}` — string attribute
- `bool:class=${}` — boolean attribute
- `...${}` — spread properties
- `${}` in content — child value

## Reactivity and props

- Props that are functions with zero arguments and not `on` events or `ref` are treated as reactive accessors and are auto-wrapped (so you can pass `() => value` and the runtime will call it for updates).
- For properties that accept a function that are not `on` events. You may need to add `()=>` to ensure the function doesn't get wrapped.

```ts
import { sld } from "solid-html";

const [count, setCount] = createSignal(0);

sld`<button count=${() => count()}  />`;
//or just the signal/memo
sld`<button count=${count} />`;

//Add ()=> to avoid Counter possibly getting auto-wrapped
sld`<Route component=${()=>Counter} />
```

## Template rules and syntax

- Templates are static: tag names and attribute names must be literal (not dynamic expressions). Use spread and the Dynamic component if necessary.
- Tags can be self closing (like JSX)
- Attribute binding syntax (Same as SolidJS):
  - `<input value="Hello World" />` - static string property
  - `<input disabled />` - static boolean property
  - `<input value=${val} />` - dynamic property
  - `<input value="Hello ${val}" />` - mixed dynamic string property
  - `onEvent=${}` or `on:event` — event listeners (Not Reactive)
  - `ref=${}` — ref (Not Reactive)
  - `prop:value=${}` — DOM property
  - `attr:class=${}` — string attribute
  - `bool:class=${}` — boolean attribute
  - `...${}` — spread properties
  - `${}` in content — child value
- Components must be registered to be used as tags in templates.
- `children` attribute is used only if the element has no child nodes (JSX-like behavior).
- Component/attribute names are case-sensitive when registered via `sld.define` or `SLD`.

## Built-In Components

- `For` - List iteration
- `Index` - Indexed list iteration
- `Show` - Conditional rendering
- `Match` - Pattern matching
- `Switch` - Conditional switching
- `Suspense` - Async boundary
- `ErrorBoundary` - Error handling

## Advanced: Creating custom SLD instances

`SLD(components)` returns a tagged template bound to the provided component registry. This is useful for scoping or providing non-global components to templates. `SLD` includes the built-in components. Use `createSLD` if you do not want to include the built-in components.

```ts
const My = SLD({ Counter, Router: HashRouter });
My`<Counter />`;

//This can also be inline with self referencing sld property
SLD({ Counter, Router: HashRouter }).sld`<Counter />
```

## New Features and Advanced Usage

### Component Registration and Scoping

Components can be registered in multiple ways to create scoped or global registries:

```ts
import { sld, SLD, createSLD } from "solid-html";

// 1. Extend default instance globally
const App = sld.define({ AppHeader, AppFooter });

// 2. Create scoped instance with built-ins
const Admin = SLD({ AdminPanel, AdminLayout });

// 3. Create scoped instance without built-ins
const Custom = createSLD({ MyComponent });
```

### Dynamic Component Usage

Dynamic components can be used with expression interpolation:

```ts
const MyComponent = (props) => sld`<div>${props.content}</div>`;
const AnotherComponent = (props) => sld`<span>${props.content}</span>`;

// Use dynamic components
const current = MyComponent;
sld`<${current} content="Hello" />`;

// Dynamic tag names
const tagName = "div";
sld`<${tagName}>Dynamic tag</${tagName}>`;
```

### Advanced Reactivity Patterns

The auto-wrapping system provides powerful reactivity with minimal boilerplate:

```ts
// Automatic getter wrapping for zero-arg functions
const [name, setName] = createSignal("World");

sld`<input value=${name} onInput=${(e) => setName(e.target.value)} />`;
sld`<h1>Hello ${() => name()}</h1>`;

// Complex computed values
const fullName = () => `${firstName()} ${lastName()}`;
sld`<div>${fullName}</div>`;

// Prevent auto-wrapping for function props
sld`<Route component={()=>App} path="/" />`;
```

### Mixed Attribute Values

Support for template-like interpolation within attribute values:

```ts
const prefix = "user-";
const id = 123;

sld`<div id="${prefix}${id}">User content</div>`;
sld`<button class="btn btn-${variant}">Click</button>`;
```

### Template Optimization and Caching

The library uses advanced caching for performance:

- Template parsing is cached using `WeakMap` for memory efficiency
- Static HTML is compiled to templates for optimal rendering
- Only dynamic parts are re-evaluated on updates

### TypeScript Integration

Enhanced TypeScript support with proper typing for components and props:

```ts
import { run, FunctionComponent } from "solid-html";

interface ButtonProps {
  onClick: () => void;
  children: JSX.Element;
}

const Button: FunctionComponent<ButtonProps> = (props) => 
  sld`<button onClick=${props.onClick}>${props.children}</button>`;

// Use with run helper for better type inference
export default run(Button);
```

### Error Handling and Validation

The parser includes robust error handling:

- Component not found errors with helpful messages
- Validation for dynamic element names (must be string or component)
- Proper handling of void elements and raw text elements
- Comment parsing support for HTML comments

### HTML5 Compliance

Full support for HTML5 features:

- SVG elements (namespaced automatically)
- Raw text elements (`<script>`, `<style>`, `<textarea>`, `<title>`)
- Void elements (`<img>`, `<br>`, `<input>`, etc.)
- HTML comments (preserved in parsing)
- Proper attribute quoting and escaping

## API Reference

### Functions

- `createSLD<T>(components: T): SLDInstance<T>` - Creates a new SLD instance
- `run<T>(component: T): T` - Helper wrapper for better TypeScript types

### Types

- `FunctionComponent` - Component function type
- `ComponentRegistry` - Registry of available components  
- `SLDInstance<T>` - SLD tagged template instance type
- `MaybeFunction<T>` - Type for values that can be functions or direct values

### Constants

- `defaultComponents` - Object containing all built-in SolidJS components
- `sld` - Default SLD instance with built-in components
- `SLD` - Factory function for creating instances with built-ins

## Installation

```bash
npm install solid-html
# or
yarn add solid-html
```

The library works with any SolidJS project and requires no additional build configuration.

## Reactivity and props

- Props that are functions with zero arguments and not `on` events or `ref` are treated as reactive accessors and are auto-wrapped (so you can pass `() => value` and the runtime will call it for updates).
- For properties that accept a function that are not `on` events. You may need to add ()=> to ensure the function doesn't get wrapped.

```ts
import { sld, once } from "solid-html";

const [count, setCount] = createSignal(0);

sld`<button count=${() => count()}  />`;
//or just
sld`<button count=${count} />`;

//Add ()=> to avoid Counter possibly getting auto-wrapped
sld`<Route component=${()=>Counter} />

```


## Template rules and syntax

- Templates are static: tag names and attribute names must be literal (not dynamic expressions). Use spread and the Dyanmic component if necessary.
- Tags can be self closing (like JSX)
- Attribute binding syntax (Same as solid):
  - `<input value="Hello World" />` - static string property
  - `<input disabled />` - static boolean property
  - `<input value=${val} />` - dynamic property
  - `<input value="Hello ${val}" />` - mixed dynamic string property
  - `onEvent=${}` or `on:event` — event listeners (Not Reactive)
  - `ref=${}` — ref (Not Reactive)
  - `prop:value=${}` — DOM property
  - `attr:class=${}` — string attribute
  - `bool:class=${}` — boolean attribute
  - `...${}` — spread properties
  - `${}` in content — child value
- Components must be registered to be used as tags in templates.
- `children` attribute is used only if the element has no child nodes (JSX-like behavior).
- Component/attribute names are case-sensitive when registered via `sld.define` or `SLD`.

## Built-In Components

- For
- Index
- Show
- Match
- Switch
- Suspense
- ErrorBoundary


## Advanced: Creating custom SLD instances

`SLD(components)` returns a tagged template bound to the provided component registry. This is useful for scoping or providing non-global components to templates. `SLD` includes the built-in components. use `createSLD` if you do not want to include the built-in components.

```ts
const My = SLD({ Counter, Router: HashRouter });
My`<Counter />`;

//This can also be inline with self refercing sld property
SLD({ Counter, Router: HashRouter }).sld`<Counter />


```
