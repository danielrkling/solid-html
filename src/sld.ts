import { JSX, createComponent, mergeProps } from "solid-js";
import { SVGElements, insert, spread } from "solid-js/web";
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
} from "./util";
import { tokenize } from "./tokenize";

const cache = new WeakMap<TemplateStringsArray, RootNode>();

//Walk over text, comment, and element nodes
const walker = document.createTreeWalker(document, 133);

export const voidElements = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

export const rawTextElements = new Set([
  "script",
  "style",
  "textarea",
  "title",
]);

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
      const component = components[node.name];
      if (component) {
        return createComponent(
          component,
          gatherProps(node, values, components),
        );
      }
      const element = createElement(node.name);
      spread(
        element,
        gatherProps(node, values, components),
        SVGElements.has(node.name),
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
        if (isComponentNode(node)) {
          insert(
            domNode.parentNode!,
            renderNode(node, values, components),
            domNode,
          );
          walker.currentNode = domNode;
          continue;
        }
        if (node.props.length) {
          //Assigning props to element via assign prop w/effect may be better for performance.
          const props = gatherProps(node, values, components);
          spread(domNode as Element, props, SVGElements.has(node.name), true);
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
