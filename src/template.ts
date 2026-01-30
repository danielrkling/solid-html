import { BOOLEAN_PROP, ChildNode, ELEMENT_NODE, EXPRESSION_NODE, ROOT_NODE, RootNode, STATIC_PROP, TEXT_NODE } from "./parse";
import { createComment, createElement, isComponentNode, isElementNode, isHtmlElementNode, isString } from "./util";


//build template element with same exact shape as tree so they can be walked through in sync
export function buildTemplate(node: RootNode | ChildNode): void {
    if (node.type === ROOT_NODE || isComponentNode(node)) {
        //Criteria for using template is component or root has at least 1 element. May be be a more optimal condition.
        if (node.children.some(isHtmlElementNode)) {
            const template = document.createElement("template");
            // buildNodes(node.children, template.content);
            template.innerHTML = node.children.map(buildHTML).join("");
            node.template = template
        }
        node.children.forEach(buildTemplate)
    } else
    if (isHtmlElementNode(node)) {
        node.children.forEach(buildTemplate)
    }
}


//Lets browser handle svg,mathml, and html encoding
function buildHTML(node: ChildNode): string {
    switch (node.type) {
        case TEXT_NODE:
            return node.value;
        // case COMMENT_NODE:
        //     return `<!--${node.value}-->`;
        case EXPRESSION_NODE:
            return `<!--+-->`;
        // case COMPONENT_NODE:
        //     return `<!--${node.name}-->`;
        case ELEMENT_NODE:
            let attributeHTML=""
            node.props = node.props.filter((prop) => {
                if (prop.type === STATIC_PROP) {
                    attributeHTML+=` ${prop.name}="${prop.value}"`
                    return;
                } else if (prop.type===BOOLEAN_PROP) {
                    attributeHTML+=` ${prop.name}`
                    return;
                }
                return true;
            });


            return `<${node.name}${attributeHTML}>${node.children.map(buildHTML).join("")}</${node.name}>`;
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
                node.props = node.props.filter((prop) => {
                    if (prop.type === STRING_PROPERTY) {
                        elem.setAttribute(prop.name, prop.value);
                        return;
                    } else if (prop.type===BOOLEAN_PROPERTY) {
                        elem.setAttribute(prop.name, ""); //boolean attribute
                        return;
                    }
                    return true;
                });
                buildNodes(node.children, elem);
                break;
        }
    }
}

