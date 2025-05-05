import {
  type Component,
  type ComponentProps,
  createComponent,
  For as _For,
  Index as _Index,
  type JSX,
  Show as _Show,
  Suspense as _Suspense,
  type ValidComponent,
  Match as _Match,
  Switch as _Switch,
  mapArray,
  Accessor,
} from "solid-js";
import {
  addEventListener,
  effect,
  insert,
  setAttribute,
  setBoolAttribute,
  setProperty,
  DelegatedEvents,
  assign,
  SVGElements,
  createDynamic,
  delegateEvents,
  Portal as _Portal,
  spread,

} from "solid-js/web";

//These could probably be more unique
const marker = "$Marker$";
const attributeMarker = `$Attribute$`;
const childNodeValue = `$Child$`
const childMarker = `<!--${childNodeValue}-->`;

const templateCache = new WeakMap<TemplateStringsArray, any>();

const walker = document.createTreeWalker(document, 129);

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
    templateCache.set(strings, template)
  }
  return template;
}

function assignAttribute(elem: Element, name: string, value: any) {
  if (name === "...") {
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
    // elem.removeAttribute(name);
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
          if (attr.value === attributeMarker) {
            const value = values[i++];
            assignAttribute(node as Element, attr.name, value);
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
  return render as unknown as JSX.Element;
}

export type PossibleFunction<T extends Record<string, any>> = {
  [K in keyof T]: K extends `on${string}` | "ref" ? T[K] : T[K] | (() => T[K]);
};

export function h<T extends ValidComponent>(
  component: T,
  props: PossibleFunction<ComponentProps<T>>
): JSX.Element {
  if (typeof component === "string") {
    const elem = document.createElement(component)
    spread(elem, wrapProps(props))
    return elem
  } else
    if (typeof component === "function") {
      return createComponent(component, wrapProps(props))
    }
}

export function w<T extends ValidComponent>(
  component: T,
  props: PossibleFunction<ComponentProps<T>>
): JSX.Element {
  return (()=>h(component,props)) as unknown as JSX.Element
}

//Reaplces Accessor props with getters
export function wrapProps<
  TComponent extends ValidComponent,
  TProps extends PossibleFunction<ComponentProps<TComponent>>
>(props: TProps = {} as TProps): ComponentProps<TComponent> {
  const descriptors = Object.getOwnPropertyDescriptors(props);
  for (const key in descriptors) {
    if (
      key !== "ref" &&
      key.slice(0, 2) !== "on" &&
      typeof descriptors[key].value === "function" &&
      descriptors[key].value.length === 0
    ) {
      const src = props[key] as () => any;
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
  children: JSX.Element,
  fallback?: JSX.Element
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
export function Keyed<T, TRenderFunction extends (item: NonNullable<T>) => JSX.Element>(
  when: () => T,
  children: JSX.Element | TRenderFunction,
  fallback?: JSX.Element
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
export function For<T extends readonly any[]>(
  each: () => T | false | null | undefined,
  children: (item: T[number], index: () => number) => JSX.Element,
  fallback?: JSX.Element
) {
  return createComponent(_For, {
    get each() {
      return each();
    },
    children: children,
    fallback,
  });
}

//Wrapper function for Index
export function Index<T extends readonly any[]>(
  each: () => T | false | null | undefined,
  children: (item: () => T[number], index: number) => JSX.Element,
  fallback?: JSX.Element
) {
  return createComponent(_Index, {
    get each() {
      return each();
    },
    children,
    fallback,
  });
}

//Wrapper function for Suspsense
export function Suspense(children: JSX.Element, fallback?: JSX.Element) {
  return createComponent(_Suspense, { children, fallback });
}




// const match = Symbol("Match")
// //Wrapper function for Suspsense
// export function Switch(...children: JSX.Element[]) {
//   const fallback = children.find(c => c && !c[match])
//   const _children = children.filter(c => c && c[match])
//   return createComponent(_Switch, { children: _children, fallback });
// }

// export function Match<T>(when: () => (T | undefined | null | false),
//   children: JSX.Element | ((item: T) => JSX.Element)) {
//   var comp = createComponent(_Match, { when, children })
//   comp[match] = true
//   return comp;
// }