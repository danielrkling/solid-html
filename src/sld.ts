import { JSX, createComponent, mergeProps } from "solid-js";
import { RootNode, ROOT_NODE, TEXT_NODE, INSERT_NODE, COMMENT_NODE, ELEMENT_NODE, COMPONENT_NODE, ComponentNode, ElementNode, parse, ChildNode } from "./parse";
import { ComponentRegistry } from "./types";
import { createComment, createElement, flat, toArray, isNumber, isString, isBoolean, getValue, isFunction, isObject } from "./util";
import { SVGElements, insert, spread } from "solid-js/web";
import { buildTemplate } from "./template";

const cache = new WeakMap<TemplateStringsArray, RootNode>();

//Walk over text, comment, and element nodes
const walker = document.createTreeWalker(document, 133);

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
        const root = getCachedRoot(strings);
        

        return renderChildren(root, values, components);
    }

    // components = { ...defaultComponents, ...components };
    sld.define = function define<TNew extends ComponentRegistry>(newComponents: TNew) {
        return SLD({ ...components, ...newComponents });
    }
    sld.sld = sld

    Object.entries(components).forEach(([name, value]) => {
        Object.defineProperty(sld, name, {
            get() {
                return (props: any) => createComponent(value, props)
            }
        })
    })

    //@ts-expect-error
    return sld
}

function getCachedRoot(
    strings: TemplateStringsArray,
): RootNode {
    let root = cache.get(strings);
    if (!root) {
        root = parse(strings)
        buildTemplate(root)
        cache.set(strings, root);
    }
    return root;
}

function renderNode(node: ChildNode, values: any[], components: ComponentRegistry): any {
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
                gatherProps(node, values, components),
                SVGElements.has(node.name),
                true,
            );
            return element;
        case COMPONENT_NODE:
            const component = components[node.name]
            if (!component) throw new Error(`${node.name} is not defined`)
            return createComponent(component, gatherProps(node, values, components));
    }
}

function renderChildren(
    node: ComponentNode | RootNode | ElementNode,
    values: any[],
    components: ComponentRegistry
): JSX.Element {
    const template =
        (node.type === ROOT_NODE || node.type === COMPONENT_NODE) && node.template;
    if (!template) {
        return flat(node.children.map((n) => renderNode(n, values, components)));
    }

    const clone = template.content.cloneNode(true);
    walker.currentNode = clone;
    walkNodes(node.children);

    function walkNodes(nodes: ChildNode[]) {
        for (const node of nodes) {
            const domNode = walker.nextNode()!;
            if (node.type === ELEMENT_NODE) {
                const props = gatherProps(node, values, components);
                spread(domNode as Element, props, SVGElements.has(node.name), true);
                walkNodes(node.children);
            } else if (node.type === INSERT_NODE || node.type === COMPONENT_NODE) {
                insert(domNode.parentNode!, renderNode(node, values, components), domNode);
                walker.currentNode = domNode;
            }
        }
    }
    return toArray(clone.childNodes);
}

function gatherProps(node: ElementNode | ComponentNode, values: any[], components: ComponentRegistry, props: Record<string,any> = {} ) {
    for (let [name, parts] of node.props) {
        if (name === "...") {
            if (isNumber(parts)) {
                const spread = values[parts]
                if (!isObject(spread)) throw new Error("Can only spread objects")
                // for (const n in values[parts]){
                //     Object.defineProperty(props, n, {
                //         get() {
                //             return (spread as any)[n]
                //         },
                //         enumerable: true,
                //     });
                // }
                //Or
                props = mergeProps(props,spread)
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
                return renderChildren(node, values, components);
            },
        });
    }
    return props;
}
