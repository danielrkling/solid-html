import { JSX, createComponent, mergeProps } from "solid-js/dist/solid.js";
import { SVGElements, insert, spread } from "solid-js/web/dist/web.js";
import {
  parse,
  RootNode,
  ChildNode,
  TEXT_NODE,
  EXPRESSION_NODE,
  ELEMENT_NODE,
  ElementNode,
  ROOT_NODE,
  BOOLEAN_PROP,
  STATIC_PROP,
  EXPRESSION_PROP,
  MIXED_PROP,
  SPREAD_PROP,
} from "./parse";
import { buildTemplate } from "./template";
import { ComponentRegistry, SLDInstance } from "./types";
import {
  createComment,
  createElement,
  flat,
  getValue,
  isComponentNode,
  isFunction,
  isNumber,
  isObject,
  toArray,
  rawTextElements,
  voidElements
} from "./util";
import { tokenize } from "./tokenize";

const cache = new WeakMap<TemplateStringsArray, RootNode>();

//Walk over text, comment, and element nodes
const walker = document.createTreeWalker(document, 133);



//Factory function to create new SLD instances.
export function createSLD<T extends ComponentRegistry>(
  components: T,
): SLDInstance<T> {
  function sld(strings: TemplateStringsArray, ...values: any[]) {
    const root = getCachedRoot(strings);

    return renderChildren(root, values, components);
  }
  sld.components = components;
  sld.sld = sld;
  sld.define = function define<TNew extends ComponentRegistry>(
    newComponents: TNew,
  ) {
    return createSLD({ ...components, ...newComponents });
  };

  return sld as SLDInstance<T>;
}

function getCachedRoot(strings: TemplateStringsArray): RootNode {
  let root = cache.get(strings);
  if (!root) {
    root = parse(tokenize(strings, rawTextElements), voidElements);
    console.log(root)
    buildTemplate(root);
    cache.set(strings, root);
    // console.log(root)
  }
  return root;
}

function renderNode(
  node: ChildNode,
  values: any[],
  components: ComponentRegistry,
): any {
  switch (node.type) {
    case TEXT_NODE:
      return node.value;
    case EXPRESSION_NODE:
      return values[node.value];
    case ELEMENT_NODE:
      let component: any;
      
      // 1. Resolve the component/tag name
      if (typeof node.name === 'number') {
        // Dynamic Tag: <${MyComp}>
        component = values[node.name];
      } else {
        // Static Tag: <div /> or <MyComp />
        component = components[node.name];
      }

      // 2. Render as Component if resolved, otherwise as standard HTML
      if (component) {
        return createComponent(
          component,
          gatherProps(node, values, components),
        );
      }

      // 3. Standard HTML Element (node.name is guaranteed string here)
      const element = createElement(node.name as string);
      const props = gatherProps(node, values, components);
      
      spread(
        element,
        props,
        SVGElements.has(node.name as string),
        true,
      );
      
      return element;
  }
}

function renderChildren(
  node: RootNode | ElementNode,
  values: any[],
  components: ComponentRegistry,
): JSX.Element {
  if (!("template" in node)) {
    return flat(node.children.map((n) => renderNode(n, values, components)));
  }

  const clone = node.template.content.cloneNode(true);
  walker.currentNode = clone;
  walkNodes(node.children);

function walkNodes(nodes: ChildNode[]) {
  for (const node of nodes) {
    const domNode = walker.nextNode()!;
    
    if (node.type === ELEMENT_NODE) {
      // Check if it's a component (either by registry name or by being a number index)
      const isDynamicOrRegistered = 
        typeof node.name === 'number' || components[node.name];

      if (isDynamicOrRegistered) {
        insert(
          domNode.parentNode!,
          renderNode(node, values, components),
          domNode,
        );
        walker.currentNode = domNode;
        continue;
      }
      
      // Standard Element path...
      if (node.props.length) {
        const props = gatherProps(node, values, components);
        spread(domNode as Element, props, SVGElements.has(node.name as string), true);
      }

      walkNodes(node.children);
    } else if (node.type === EXPRESSION_NODE) {
      insert(
        domNode.parentNode!,
        renderNode(node, values, components),
        domNode,
      );
      walker.currentNode = domNode;
    }
  }
}
  return toArray(clone.childNodes);
}

function gatherProps(
  node: ElementNode,
  values: any[],
  components: ComponentRegistry,
  props: Record<string, any> = {},
) {
  for (const prop of node.props) {
    switch (prop.type) {
      case BOOLEAN_PROP:
        props[prop.name] = true;
        break;
      case STATIC_PROP:
        props[prop.name] = prop.value;
        break;
      case EXPRESSION_PROP:
        applyGetter(props, prop.name, values[prop.value]);
        break;
      case MIXED_PROP:
        const value = () =>
          prop.value
            .map((v) => (isNumber(v) ? getValue(values[v]) : v))
            .join("");
        applyGetter(props, prop.name, value);
        break;
      case SPREAD_PROP:
        const spread = values[prop.value];
        if (!isObject(spread)) throw new Error("Can only spread objects");
        props = mergeProps(props, spread);
        break;
    }
  }

  // children - childNodes overwrites any props.children
  if (node.children.length) {
    Object.defineProperty(props, "children", {
      get() {
        return renderChildren(node, values, components);
      },
    });
  }
  return props;
}

function applyGetter(props: Record<string, any>, name: string, value: any) {
  if (
    isFunction(value) &&
    value.length === 0 &&
    name !== "ref" &&
    !name.startsWith("on")
  ) {
    Object.defineProperty(props, name, {
      get() {
        return value();
      },
      enumerable: true,
    });
  } else {
    props[name] = value;
  }
}
