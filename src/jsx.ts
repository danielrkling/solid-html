
import {
    ErrorBoundary,
    For,
    Index,
    Match,
    Show,
    Suspense,
    Switch,
} from 'solid-js'
import h from 'solid-js/h'
import { Dynamic, NoHydration, Portal } from 'solid-js/web'



const defaultRegistry = {

    For,
    Index,
    Match,
    Suspense,
    ErrorBoundary,
    Show,
    Switch,
    Dynamic,
    Portal,
    NoHydration
}

const xmlns = ['on', 'prop', 'bool', 'attr']
    .map(ns => `xmlns:${ns}="/"`)
    .join(' ')

const marker = 'MARKER46846'
const markerRX = new RegExp(`(${marker})`, 'g')
const markerAttr = new RegExp(`=${marker}`, 'g')


const xmlCache = new WeakMap<TemplateStringsArray, Node>();
function getXml(strings: TemplateStringsArray) {
    let xml = xmlCache.get(strings);
    if (xml === undefined) {
        const contents = strings.join(marker).replace(markerAttr, `="${marker}"`)
        const parser = new DOMParser();
        xml = parser.parseFromString(
            `<xml ${xmlns}>${contents}</xml>`,
            'text/xml',
        ).firstChild!;
        console.log(xml)
        xmlCache.set(strings, xml)
    }
    return xml.childNodes;
}

const flat = (arr: any) => (arr.length === 1 ? arr[0] : arr)
function getValue(value: any) {
    while (typeof value === 'function') value = value()
    return value
}
const toArray = Array.from

function toH(jsx: ReturnType<typeof JSX>, cached: NodeList, values: any[]) {
    let index = 0
    function nodes(node: any) {
        // console.log(node)
        if (node.nodeType === 1) {
            // element
            const tagName = node.tagName

            // gather props
            const props = {} as Record<string, any>
            for (let { name, value } of node.attributes) {
                if (value === marker) {
                    value = values[index++]
                } else if (value.includes(marker)) {
                    const val = value
                        .split(markerRX)
                        .map((x: string) => (x === marker ? values[index++] : x))

                    value = () => val.map(getValue).join('')
                }
                props[name] = value
            }


            // gather children
            const childNodes = node.childNodes
            if (childNodes.length) {
                props.children = flat(toArray(childNodes).map(nodes).filter(n => n))
            }

            ; /[A-Z]/.test(tagName) &&
                !jsx.components[tagName] &&
                console.warn(`html: Forgot to jsx.define({ ${tagName} })?`)

            return h(jsx.components[tagName] || tagName, props)
        } else if (node.nodeType === 3) {
            // text

            const value = node.nodeValue
            if (value.trim() === marker) {
                return (values[index++])
            }
            return value.includes(marker)
                ? value
                    .split(markerRX)
                    .map((x: string) => (x === marker ? values[index++] : x))
                : value
        } else if (node.nodeType === 8) {
            // comment
            const value = node.nodeValue
            if (value.includes(marker)) {
                const val = value
                    .split(markerRX)
                    .map((x: string) => (x === marker ? values[index++] : x))
                return () => document.createComment(val.map(getValue).join(''))
            } else {
                return document.createComment(value)
            }
        } else {
            console.error(`jsx: nodeType not supported ${node.nodeType}`)
        }
    }

    return flat(toArray(cached).map(nodes))
}


export function JSX() {

    function jsx(template: TemplateStringsArray, ...values: any[]) {
        return toH(jsx, getXml(template), values)
    }

    jsx.components = { ...defaultRegistry }
    jsx.define = (userComponents: Record<string, any>) => {
        for (const name in userComponents) {
            jsx.components[name] = userComponents[name]
        }
    }

    return jsx
}

export const jsx = JSX()