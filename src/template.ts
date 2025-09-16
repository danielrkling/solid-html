import { COMMENT_NODE, COMPONENT_NODE, ELEMENT_NODE, INSERT_NODE, TEXT_NODE, ChildNode, RootNode, ComponentNode, ROOT_NODE } from "./parse";
import { createComment, createElement, isString } from "./util";




//build template element with same exact shape as tree so they can be walked through in sync
export function buildTemplate(node: RootNode | ChildNode): void {
    if (node.type === ROOT_NODE || node.type === COMPONENT_NODE) {
        //Criteria for using template is component or root has at least 1 element. May be be a more optimal condition.
        if (node.children.some((v) => v.type === ELEMENT_NODE)) {
            const template = document.createElement("template");
            // buildNodes(nodes, template.content);
            template.innerHTML = node.children.map(buildHTML).join("");
            node.template = template
        }
        node.children.forEach(buildTemplate)
    }
    if (node.type === ELEMENT_NODE) {
        node.children.forEach(buildTemplate)
    }
}


//Lets browser handle svg,mathml, and html encoding
function buildHTML(node: ChildNode): string {
    switch (node.type) {
        case TEXT_NODE:
            return node.value;
        case COMMENT_NODE:
            return `<!--${node.value}-->`;
        case INSERT_NODE:
            return `<!--+-->`;
        case COMPONENT_NODE:
            return `<!--${node.name}-->`;
        case ELEMENT_NODE:
            const staticAttributes = node.props.filter(
                ([name, value]) => isString(value) || value === true,
            );
            const attributeHTML = staticAttributes
                .map(([p, v]) => `${p}="${v}"`)
                .join(" ");

            return `<${node.name} ${attributeHTML}>${node.children.map(buildHTML).join("")}</${node.name}>`;
    }
}

//Building manually requires checking for MathML, SVG tags as well as html encoded chars
function buildNodes(nodes: ChildNode[], parent: Node) {
    for (const node of nodes) {
        switch (node.type) {
            case TEXT_NODE:
                parent.appendChild(document.createTextNode(node.value));
                break;
            case COMMENT_NODE:
                parent.appendChild(createComment(node.value));
                break;
            case INSERT_NODE:
                parent.appendChild(createComment("+"));
                break;
            case COMPONENT_NODE:
                parent.appendChild(createComment(node.name));
                break;
            case ELEMENT_NODE:
                const elem = createElement(node.name);
                parent.appendChild(elem);

                //set static attributes only and remove from props
                node.props = node.props.filter(([name, value]) => {
                    if (isString(value)) {
                        elem.setAttribute(name, value);
                        return;
                    } else if (value === true) {
                        elem.setAttribute(name, ""); //boolean attribute
                        return;
                    }
                    return true;
                });
                buildNodes(node.children, elem);
                break;
        }
    }
}

