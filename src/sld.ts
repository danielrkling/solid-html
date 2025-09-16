import { RootNode, parseNode, ROOT_NODE, TEXT_NODE, INSERT_NODE, COMMENT_NODE, ELEMENT_NODE, COMPONENT_NODE, ComponentNode, ElementNode } from "./parse";
import { ComponentRegistry } from "./types";
import { createComment, createElement, flat, toArray, isNumber, isString, isBoolean, getValue, isFunction } from "./util";

export type SLD<T extends ComponentRegistry> = {
    (strings: TemplateStringsArray, ...values: any[]): JSX.Element
    sld(strings: TemplateStringsArray, ...values: any[]): JSX.Element;
    define<TNew extends ComponentRegistry>(
      components: TNew,
    ): SLD<T & TNew>;
  } & T;
  
  export function SLD<T extends ComponentRegistry>(
    components: T,
  ): SLD<T> {
    function sld(strings: TemplateStringsArray, ...values: any[]) {
      const root = getCachedRoot(strings, components);
  
      return renderChildren(root, values);
    }
  
    // components = { ...defaultComponents, ...components };
    sld.define = function define<TNew extends ComponentRegistry>(newComponents: TNew) {
      return SLD({ ...components, ...newComponents });
    }
    sld.sld = sld
    
    Object.entries(components).forEach(([name,value])=>{
      Object.defineProperty(sld,name,{get(){
        return (props: any)=>createComponent(value,props)
      }})
    })
  
    
    return sld
  }
  
  function getCachedRoot(
    strings: TemplateStringsArray,
    components: ComponentRegistry,
  ): RootNode {
    let root = cache.get(strings);
    if (!root) {
      //join string with markers and index
      const ast = parse(
        strings
          .slice(1)
          .reduce(
            (prev, current, index) => prev + marker + index + marker + current,
            strings[0],
          ),
      );
  
      const children = ast.flatMap((n) => parseNode(n, components));
  
      const template = buildTemplate(children);
      root = {
        type: ROOT_NODE,
        children,
        template,
      };
  
      cache.set(strings, root);
    }
    return root;
  }
  
  function renderNode(node: ChildNode, values: any[]): any {
    switch (node.type) {
      case TEXT_NODE:
        return node.value;
      case INSERT_NODE:
        return values[node.value];
      case COMMENT_NODE:
        return createComment(node.value);
      case ELEMENT_NODE:
        const element = createElement(node.name);
        spread(
          element,
          gatherProps(node, values),
          SVGElements.has(node.name),
          true,
        );
        return element;
      case COMPONENT_NODE:
        return createComponent(node.component, gatherProps(node, values));
    }
  }
  
  function renderChildren(
    node: ComponentNode | RootNode | ElementNode,
    values: any[],
  ): JSX.Element {
    const template =
      (node.type === ROOT_NODE || node.type === COMPONENT_NODE) && node.template;
    if (!template) {
      return flat(node.children.map((n) => renderNode(n, values)));
    }
  
    const clone = template.content.cloneNode(true);
    walker.currentNode = clone;
    walkNodes(node.children);
  
    function walkNodes(nodes: ChildNode[]) {
      for (const node of nodes) {
        const domNode = walker.nextNode()!;
        if (node.type === ELEMENT_NODE) {
          const props = gatherProps(node, values);
          spread(domNode as Element, props, SVGElements.has(node.name), true);
          walkNodes(node.children);
        } else if (node.type === INSERT_NODE || node.type === COMPONENT_NODE) {
          insert(domNode.parentNode!, renderNode(node, values), domNode);
          walker.currentNode = domNode;
        }
      }
    }
    return toArray(clone.childNodes);
  }
  
  function gatherProps(node: ElementNode | ComponentNode, values: any[]) {
    let props = {} as Record<string, any>;
  
    for (let [name, parts] of node.props) {
      if (name === "...") {
        if (isNumber(parts)){
          props = mergeProps(props,values[parts])
        }
      } else {
        const value =
          isString(parts) || isBoolean(parts)
            ? parts
            : isNumber(parts)
              ? values[parts]
              : () =>
                  parts
                    .map((v) => (isNumber(v) ? getValue(values[v]) : v))
                    .join("");
  
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
    }
  
    // children - childNodes overwrites any props.children
    if (node.children.length) {
      Object.defineProperty(props, "children", {
        get() {
          return renderChildren(node, values);
        },
      });
    }
    return props;
  }