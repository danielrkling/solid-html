import { JSX, createComponent, mergeProps } from "solid-js";
import { SVGElements, insert, spread } from "solid-js/web";
import {
  BOOLEAN_PROP,
  ChildNode,
  ELEMENT_NODE,
  EXPRESSION_NODE,
  EXPRESSION_PROP,
  ElementNode,
  MIXED_PROP,
  RootNode,
  SPREAD_PROP,
  STATIC_PROP,
  TEXT_NODE,
  parse,
} from "./parse";
import { buildTemplate } from "./template";
import { tokenize } from "./tokenize";
import { ComponentRegistry, SLDInstance } from "./types";
import {
  flat,
  getValue,
  isComponentNode,
  rawTextElements,
  voidElements,
} from "./util";

const cache = new WeakMap<TemplateStringsArray, RootNode>();

//Walk over text, comment, and element nodes
const walker = document.createTreeWalker(document, 129);

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
    buildTemplate(root);
    cache.set(strings, root);
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
      let name = node.name;

      if (isComponentNode(node)) {
        // Registered Component by static name
        const component = components[name];
        if (component) {
          return createComponent(
            component,
            gatherProps(node, values, components),
          );
        } else {
          throw new Error(`Component "${name}" not found in registry`);
        }
      }

      const isSvg = SVGElements.has(name);
      // 3. Standard HTML Element (node.name is guaranteed string here)
      const element = isSvg
        ? document.createElementNS("http://www.w3.org/2000/svg", name)
        : document.createElement(name);
      const props = gatherProps(node, values, components);

      spread(element, props, isSvg, true);

      return element;
  }
}

function renderChildren(
  node: RootNode | ElementNode,
  values: any[],
  components: ComponentRegistry,
): JSX.Element {
  if (!node.template) {
    return flat(node.children.map((n) => renderNode(n, values, components)));
  }

  const clone = node.template.content.cloneNode(true);
  walker.currentNode = clone;
  walkNodes(node.children);

  function walkNodes(nodes: ChildNode[]) {
    for (const node of nodes) {      
      if (node.type === ELEMENT_NODE || node.type === EXPRESSION_NODE) {
        const domNode = walker.nextNode()!;
        if (node.type === EXPRESSION_NODE || isComponentNode(node)) {
          insert(
            domNode.parentNode!,
            renderNode(node, values, components),
            domNode,
          );
          walker.currentNode = domNode;
        } else {
          // Standard Element path...
          if (node.props.length) {
            const props = gatherProps(node, values, components);
            spread(
              domNode as Element,
              props,
              SVGElements.has(node.name as string),
              true,
            );
          }
          walkNodes(node.children);
        }
      }
    }
  }
  return Array.from(clone.childNodes);
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
            .map((v) => (typeof v === "number" ? getValue(values[v]) : v))
            .join("");
        applyGetter(props, prop.name, value);
        break;
      case SPREAD_PROP:
        const spread = values[prop.value];
        if (!spread || typeof spread !== "object")
          throw new Error("Can only spread objects");
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
    typeof value === "function" &&
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
