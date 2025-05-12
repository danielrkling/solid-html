import {
  For as _For,
  Index as _Index,
  Match as _Match,
  Show as _Show,
  Suspense as _Suspense,
  Switch as _Switch,
  ErrorBoundary as _ErrorBoundary,
  createComponent,
  type ComponentProps,
  type JSX,
  type ValidComponent,
  Context
} from "solid-js";
import {
  DelegatedEvents,
  SVGElements,
  addEventListener,
  assign,
  delegateEvents,
  effect,
  insert,
  setAttribute,
  setBoolAttribute,
  setProperty,
  spread
} from "solid-js/web";

//These could probably be more unique
const marker = "$Marker$";
const attributeMarker = `$Attribute$`;
const childNodeValue = `$Child$`
const childMarker = `<!--${childNodeValue}-->`;
const spreadMarker = `...${marker.toLowerCase()}`


const templateCache = new WeakMap<TemplateStringsArray, any>();
function getTemplate(strings: TemplateStringsArray): HTMLTemplateElement {
  let template = templateCache.get(strings);
  if (template === undefined) {
    template = document.createElement("template");
    template.innerHTML = strings.join(marker);

    let html = template.innerHTML;
    //The markers placed at attributes will get quotes sourrounding it so we can replace those without touching the child markers
    html = html.replaceAll(`"${marker}"`, `"${attributeMarker}"`);
    //turn remaining markers into comments
    html = html.replaceAll(marker, childMarker);
    template.innerHTML = html;
    // console.log(html)
    templateCache.set(strings, template)
  }
  return template;
}

function assignAttribute(elem: Element, name: string, value: any) {
  if (name === spreadMarker) {
    const isSvg = SVGElements.has(elem.tagName);
    if (typeof value === "function") {
      effect(() => assign(elem, value(), isSvg, true));
    } else {
      assign(elem, value, isSvg, true);
    }
    elem.removeAttribute(name);
  } else if (name === "$ref") {
    if (typeof value === "function") {
      value(elem);
    }
    elem.removeAttribute(name);
  } else if (name[0] === "@") {
    const event = name.slice(1)
    let delegate = DelegatedEvents.has(event)
    addEventListener(elem, event, value, delegate);
    if (delegate) delegateEvents([event])
    elem.removeAttribute(name);
  } else if (name[0] === ".") {
    if (typeof value === "function") {
      effect(() => {
        setProperty(elem, name.slice(1), value());
      });
    } else {
      setProperty(elem, name.slice(1), value);
    }
    elem.removeAttribute(name);
  } else if (name[0] === "?") {
    if (typeof value === "function") {
      effect(() => setBoolAttribute(elem, name.slice(1), value()));
    } else {
      setBoolAttribute(elem, name.slice(1), value);
    }
  } else {
    if (typeof value === "function") {
      effect(() => setAttribute(elem, name, value()));
    } else {
      setAttribute(elem, name, value);
    }
  }
}

const walker = document.createTreeWalker(document, 129);
export function html(
  strings: TemplateStringsArray,
  ...values: any[]
): JSX.Element {
  function render() {
    const clone = getTemplate(strings).content.cloneNode(true);

    let i = 0;
    walker.currentNode = clone;

    while (walker.nextNode()) {

      const node = walker.currentNode;
      if (node.nodeType === 1) {
        for (const attr of [...(node as Element).attributes]) {
          if (attr.value === attributeMarker || attr.name === spreadMarker) {
            assignAttribute(node as Element, attr.name, values[i++]);
          }

        }
      } else if (node.nodeType === 8) {
        if (node.nodeValue === childNodeValue) {
          node.nodeValue = i.toString()
          const value = values[i++];
          const parent = node.parentNode;
          if (parent) insert(parent, value, node);
        }
      }
    }
    return [...clone.childNodes];
  }
  return (render) as unknown as JSX.Element
}

export type MaybeFunction<T> = T | (()=>T)

export type MaybeFunctionProps<T extends Record<string, any>> = {
  [K in keyof T]: K extends `on${string}` | "ref" ? T[K] : MaybeFunction<T[K]>;
};

export function h<T extends ValidComponent>(
  component: T,
  props: MaybeFunctionProps<ComponentProps<T>>,
  ...children: JSX.Element[]
): JSX.Element {
  if (children.length === 1){
    //@ts-expect-error
    props.children = children[0]
  }else if (children.length >1){
    //@ts-expect-error
    props.children = children
  }

  if (typeof component === "string") {
    const elem = document.createElement(component)
    spread(elem, wrapProps(props))
    return elem
  } else if (typeof component === "function") {
    return createComponent(component, wrapProps(props))
  }
}



const ONCE = Symbol("ONCE")
export function once<T extends (...args: any[]) => any>(fn: T): T {
  fn[ONCE] = true
  return fn
}


//Reaplces Accessor props with getters
export function wrapProps<
  TComponent extends ValidComponent,
  TProps extends MaybeFunctionProps<ComponentProps<TComponent>>
>(props: TProps = {} as TProps): ComponentProps<TComponent> {
  const descriptors = Object.getOwnPropertyDescriptors(props);
  for (const [key, descriptor] of Object.entries(descriptors)) {
    // console.log(key,descriptor)
    if (
      key !== "ref" &&
      key.slice(0, 2) !== "on" &&
      typeof descriptor.value === "function" &&
      (descriptor.value.length === 0) &&
      !descriptor.value[ONCE]
    ) {
      const src = descriptor.value;
      Object.defineProperty(props, key, {
        get() {
          return src();
        },
        enumerable: true,
      });


    }
  }
  return props as ComponentProps<TComponent>;
}

//Wrapper function to correct types
export function Show(
  when: () => boolean,
  children:  MaybeFunction<JSX.Element>,
  fallback?: MaybeFunction<JSX.Element>
) {
  return h(_Show, ({
    when,
    children,
    fallback,
    //@ts-expect-error
    keyed: false
  }));
}

//Wrapper function for keyed show
export function Keyed<T>(
  when: () => T,
  children: JSX.Element | ((item: NonNullable<T>) => JSX.Element),
  fallback?: MaybeFunction<JSX.Element>
) {
  return h(_Show, {
    when,
    //@ts-expect-error
    children,
    fallback,
    keyed: true
  });
}

//Wrapper function for For



export function Switch(fallback: MaybeFunction<JSX.Element>, ...children: JSX.Element[]) {
  return h(_Switch, { children, fallback });
}

export function Match<T>(when: () => (T | undefined | null | false),
  children: JSX.Element | ((item: T) => JSX.Element)) {
  //@ts-expect-error
  return h(_Match, { when, children, keyed: false })
}

export function MatchKeyed<T>(when: () => (T | undefined | null | false),
  children: JSX.Element | ((item: T) => JSX.Element)) {
  //@ts-expect-error
  return h(_Match, { when, children, keyed: true })
}

export function For<T extends readonly any[]>(
  each: () => T | false | null | undefined,
  children: (item: T[number], index: () => number) => JSX.Element,
  fallback?: MaybeFunction<JSX.Element>
) {
  return h(_For, {
    get each() {
      return each();
    },
    children: once(children),
    fallback,
  });
}

//Wrapper function for Index
export function Index<T extends readonly any[]>(
  each: () => T | false | null | undefined,
  children: (item: () => T[number], index: number) => JSX.Element,
  fallback?: MaybeFunction<JSX.Element>
) {
  return h(_Index, {
    get each() {
      return each();
    },
    children: once(children),
    fallback,
  });
}

//Wrapper function for Suspsense
export function Suspense(children: MaybeFunction<JSX.Element>, fallback?: MaybeFunction<JSX.Element>) {
  return h(_Suspense, { children, fallback });
}

export function ErrorBoundary(
  children: MaybeFunction<JSX.Element>,
  fallback: MaybeFunction<JSX.Element> | ((err: any, reset: () => void) => JSX.Element)
): JSX.Element {
  return h(_ErrorBoundary, { children, fallback })
}

//Context must have lazy children
export function Context<T>(context: Context<T>, value: T | (() => T), children: ()=>JSX.Element) {
  return h(context.Provider, { value, children })
}