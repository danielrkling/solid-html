import {
    SyntaxKind,
    type INode,
    type IText
} from "html5parser";

import {
    type Component
} from "solid-js";
import { ComponentRegistry } from "./types";
import { isString } from "./util";
//AST Node types

//Non reactive text
export const TEXT_NODE = 1;
export type TextNode = {
    type: typeof TEXT_NODE;
    value: string;
};

//Non reactive Comment Node <!--value-->
export const COMMENT_NODE = 2;
export type CommentNode = {
    type: typeof COMMENT_NODE;
    value: string;
};

//Reactive Hole
export const INSERT_NODE = 3;
export type InsertNode = {
    type: typeof INSERT_NODE;
    value: number; //index of hole
};

export const ELEMENT_NODE = 4;
export type ElementNode = {
    type: typeof ELEMENT_NODE;
    name: string;
    props: Property[];
    children: ChildNode[];
};

export const COMPONENT_NODE = 5;
export type ComponentNode = {
    type: typeof COMPONENT_NODE;
    name: string;
    component: Component;
    props: Property[];
    children: ChildNode[];
    template?: HTMLTemplateElement; //will have template if any of children are elements
};

export const ROOT_NODE = 6;
export type RootNode = {
    type: typeof ROOT_NODE;
    children: ChildNode[];
    template?: HTMLTemplateElement; //will have template if any of children are elements
};

export type ChildNode =
    | TextNode
    | ComponentNode
    | ElementNode
    | InsertNode
    | CommentNode;

export type Property = [name: string, value: ValueParts];

//string or boolean means static, number means hole and is index, array means mix of string and holes
export type ValueParts = string | boolean | number | Array<string | number>;

//Parse html5parser result for what we care about
export function parseNode(
    node: INode,
    components: ComponentRegistry,
): ChildNode | ChildNode[] {
    //Text nodes are either static text or holes to insert in
    if (node.type === SyntaxKind.Text) {
        const parts = getParts(node.value);
        return parts.map((value) => {
            const type = isString(value) ? TEXT_NODE : INSERT_NODE;
            return {
                type,
                value,
            } as InsertNode | TextNode;
        });
    }

    //html5parser represents comments as type tag with name "!" or ""
    if (node.name[0] === "!" || node.name === "") {
        return {
            type: COMMENT_NODE,
            value: (node.body as IText[])[0].value,
        } as CommentNode;
    }

    const props = node.attributes.map((v) => {
        const nameParts = getParts(v.name.value);

        if (nameParts.length === 1) {
            const part = nameParts[0];
            if (isString(part)) {
                const valueParts = getParts(v.value?.value);
                if (valueParts.length === 0) {
                    //boolean attribute <input disabled>
                    return [part, true] as Property;
                } else if (valueParts.length === 1) {
                    //static or dynamic attribute <input value="text"> or <input value=${}>
                    return [part, valueParts[0]] as Property;
                } else {
                    //mixed static and dynamic attribute <input value="text ${} text ${} px">
                    return [part, valueParts] as Property;
                }
            } else {
                //name is hole <input ${}> or <input ${}="anything">. No dynamic names, treat as ref
                return ["ref", part] as Property;
            }
        } else {
            //name is mixed static and dynamic. We assume something like ...${} but could also be class${} or style${}. Value gets ignored in this case.
            return [nameParts[0], nameParts[1]];
        }
    }) as Property[];

    const children = node.body?.flatMap((n) => parseNode(n, components)) ?? [];
    const name = node.rawName as string;
    const component = components[name];
    //component if name starts with capital letter
    if (component) {
        return {
            type: COMPONENT_NODE,
            name,
            component,
            props,
            children,
            template: buildTemplate(children),
        } as ComponentNode;
    }

    if (/^[A-Z]/.test(name)) {
        throw new Error(`${name} is not defined`);
    }

    return {
        type: ELEMENT_NODE,
        name,
        props,
        children,
    } as ElementNode;
}

function getParts(value: string = ""): Array<string | number> {
    return value
        .split(match)
        .map((v, i) => (i % 2 === 1 ? Number(v) : v))
        .filter((v) => isNumber(v) || v.trim());
}