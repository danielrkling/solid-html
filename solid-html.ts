import {
    type Component,
    type ComponentProps,
    createComponent,
    For,
    Index,
    type JSX,
    Show,
    Suspense,
    type ValidComponent,
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
  } from "solid-js/web";
   
  const marker = "$Child$";
  const attrMarker = `$Attribute$`;
  const comment = `<!--${marker}-->`;
   
  const templateCache = new WeakMap<TemplateStringsArray, any>();
   
  const walker = document.createTreeWalker(document, 129);
   
  function getTemplate(strings: TemplateStringsArray): HTMLTemplateElement {
    let template = templateCache.get(strings);
    if (template === undefined) {
      template = document.createElement("template");
      template.innerHTML = strings.join(marker);
      let html = template.innerHTML;
      html = html.replaceAll(`"${marker}"`, `"${attrMarker}"`);
      html = html.replaceAll(marker, comment);
      template.innerHTML = html;
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
      // const delegate = DelegatedEvents.has(name.slice(1))
      addEventListener(elem, name.slice(1), value, false);
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
            if (attr.value === attrMarker) {
              const value = values[i++];
              assignAttribute(node as Element, attr.name, value);
            }
          }
        } else if (node.nodeType === 8) {
          if (node.nodeValue === marker) {
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
    return createDynamic(() => component, wrapProps(props));
  }
   
  export function create(component: () => JSX.Element): () => JSX.Element;
  export function create<T extends Record<string, any>>(
    component: (props: T) => JSX.Element
  ): (props: PossibleFunction<T>) => JSX.Element;
  export function create<T extends Component>(component: T) {
    return (props: PossibleFunction<ComponentProps<T>>) =>
      createComponent(component, wrapProps(props));
  }
   
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
   
  export function show(
    when: () => boolean,
    children: JSX.Element,
    fallback?: JSX.Element
  ) {
    //@ts-expect-error
    return createComponent(Show, { when, children, fallback, keyed: false });
  }
   
  export function keyed<T>(
    when: () => T,
    children: (value: NonNullable<T>) => JSX.Element,
    fallback?: JSX.Element
  ) {
    //@ts-expect-error
    return createComponent(Show, { when, children, fallback, keyed: true });
  }
   
  export function forEach<T extends readonly any[]>(
    each: () => T | false | null | undefined,
    children: (item: T[number], index: () => number) => JSX.Element,
    fallback?: JSX.Element
  ) {
    return createComponent(For, {
      get each() {
        return each();
      },
      children: children,
      fallback,
    });
  }
   
  export function index<T extends readonly any[]>(
    each: () => T | false | null | undefined,
    children: (item: () => T[number], index: number) => JSX.Element,
    fallback?: JSX.Element
  ) {
    return createComponent(Index, {
      get each() {
        return each();
      },
      children,
      fallback,
    });
  }
   
  export function suspense(children: JSX.Element, fallback?: JSX.Element) {
    return createComponent(Suspense, { children, fallback });
  }