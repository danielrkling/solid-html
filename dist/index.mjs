import { ErrorBoundary as ErrorBoundary$1, For as For$1, Index as Index$1, Match as Match$1, Show as Show$1, Suspense as Suspense$1, Switch as Switch$1, createComponent } from "solid-js";
import { DelegatedEvents, Dynamic, NoHydration, Portal, SVGElements, addEventListener, assign, delegateEvents, effect, insert, setAttribute, setBoolAttribute, setProperty, spread } from "solid-js/web";

//#region src/util.ts
function isString(value) {
	return typeof value === "string";
}
function isFunction(value) {
	return typeof value === "function";
}
const doc = document;

//#endregion
//#region src/h.ts
/**
* Hyperscript function for Solid-compatible components and elements. Accepts a component or tag name, props, and children.
* Children passed as arguments override `children` in props.
* @example
* h("button", { onClick: () => alert("Hi") }, "Click Me")
* h(MyComponent, { foo: 1 }, html`<span>Child</span>`)
*/
function h(component, props, ...children) {
	if (children.length === 1) props.children = children[0];
	else if (children.length > 1) props.children = children;
	if (isString(component)) {
		const elem = doc.createElement(component);
		spread(elem, props, SVGElements.has(component));
		return elem;
	} else if (isFunction(component)) return createComponent(component, wrapProps(props));
}
const markedOnce = /* @__PURE__ */ new WeakSet();
/**
* Marks a function so it is not wrapped as a getter by h().
* Useful for event handlers or functions that should not be auto-accessed.
* @example
* once(() => doSomething())
*/
function once(fn) {
	markedOnce.add(fn);
	return fn;
}
/**
* Internal: Replaces accessor props with getters for reactivity, except for refs and event handlers.
*/
function wrapProps(props = {}) {
	for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(props))) {
		const value = descriptor.value;
		if (key !== "ref" && key.slice(0, 2) !== "on" && isFunction(value) && value.length === 0 && !markedOnce.has(value)) Object.defineProperty(props, key, {
			get() {
				return value();
			},
			enumerable: true
		});
	}
	return props;
}

//#endregion
//#region src/components.ts
/**
* Solid-compatible Show component. Renders children if `when` is truthy, otherwise renders `fallback`.
* @example
* Show(() => isVisible(), html`<span>Hello</span>`, "Fallback")
*/
function Show(when, children, fallback) {
	return h(Show$1, {
		when,
		children,
		fallback,
		keyed: false
	});
}
/**
* Show component with keyed mode. Renders children with keyed context if `when` is truthy.
* @example
* ShowKeyed(() => user(), user => html`<span>${user.name}</span>`, "No user")
*/
function ShowKeyed(when, children, fallback) {
	return h(Show$1, {
		when,
		children,
		fallback,
		keyed: true
	});
}
/**
* Switch component for conditional rendering. Renders the first matching child, or `fallback` if none match.
* @example
* Switch("No match", Match(() => cond1(), html`A`), Match(() => cond2(), html`B`))
*/
function Switch(fallback, ...children) {
	return h(Switch$1, {
		children,
		fallback
	});
}
/**
* Match component for use inside Switch. Renders children if `when` is truthy.
* @example
* Match(() => value() === 1, html`One`)
*/
function Match(when, children) {
	return h(Match$1, {
		when,
		children,
		keyed: false
	});
}
/**
* Keyed Match component for use inside Switch. Renders children with keyed context if `when` is truthy.
* @example
* MatchKeyed(() => user(), user => html`<span>${user.name}</span>`)
*/
function MatchKeyed(when, children) {
	return h(Match$1, {
		when,
		children,
		keyed: true
	});
}
/**
* For component for iterating over arrays. Renders children for each item in `each`.
* @example
* For(() => items(), (item) => html`<li>${item}</li>`)
*/
function For(each, children, fallback) {
	return h(For$1, {
		get each() {
			return each();
		},
		children: once(children),
		fallback
	});
}
/**
* Index component for iterating over arrays by index. Renders children for each item in `each`.
* @example
* Index(() => items(), (item, i) => html`<li>${item()}</li>`)
*/
function Index(each, children, fallback) {
	return h(Index$1, {
		get each() {
			return each();
		},
		children: once(children),
		fallback
	});
}
/**
* Suspense component for async boundaries. Renders `children` or `fallback` while loading.
* @example
* Suspense(html`<div>Loaded</div>`, html`<div>Loading...</div>`)
*/
function Suspense(children, fallback) {
	return h(Suspense$1, {
		children,
		fallback
	});
}
/**
* ErrorBoundary component. Catches errors in children and renders `fallback` on error.
* @example
* ErrorBoundary(html`<App />`, (err) => html`<div>Error: ${err.message}</div>`)
*/
function ErrorBoundary(children, fallback) {
	return h(ErrorBoundary$1, {
		children,
		fallback
	});
}
/**
* Context provider component. Provides a context value to all children.
* @example
* Context(MyContext, value, () => html`<Child />`)
*/
function Context(context, value, children) {
	return h(context.Provider, {
		value,
		children
	});
}

//#endregion
//#region src/lit-html.ts
const boundAttributeSuffix = "$lit$";
const marker$1 = `lit$marker$`;
const markerMatch = "?" + marker$1;
const nodeMarker = `<${markerMatch}>`;
const SPACE_CHAR = `[ \t\n\f\r]`;
const ATTR_VALUE_CHAR = `[^ \t\n\f\r"'\`<>=]`;
const NAME_CHAR = `[^\\s"'>=/]`;
/**
* End of text is: `<` followed by:
*   (comment start) or (tag) or (dynamic tag binding)
*/
const textEndRegex = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
const COMMENT_START = 1;
const TAG_NAME = 2;
const DYNAMIC_TAG_NAME = 3;
const commentEndRegex = /-->/g;
/**
* Comments not started with <!--, like </{, can be ended by a single `>`
*/
const comment2EndRegex = />/g;
/**
* The tagEnd regex matches the end of the "inside an opening" tag syntax
* position. It either matches a `>`, an attribute-like sequence, or the end
* of the string after a space (attribute-name position ending).
*
* See attributes in the HTML spec:
* https://www.w3.org/TR/html5/syntax.html#elements-attributes
*
* " \t\n\f\r" are HTML space characters:
* https://infra.spec.whatwg.org/#ascii-whitespace
*
* So an attribute is:
*  * The name: any character except a whitespace character, ("), ('), ">",
*    "=", or "/". Note: this is different from the HTML spec which also excludes control characters.
*  * Followed by zero or more space characters
*  * Followed by "="
*  * Followed by zero or more space characters
*  * Followed by:
*    * Any character except space, ('), ("), "<", ">", "=", (`), or
*    * (") then any non-("), or
*    * (') then any non-(')
*/
const tagEndRegex = new RegExp(`>|${SPACE_CHAR}(?:(${NAME_CHAR}+)(${SPACE_CHAR}*=${SPACE_CHAR}*(?:${ATTR_VALUE_CHAR}|("|')|))|$)`, "g");
const ENTIRE_MATCH = 0;
const ATTRIBUTE_NAME = 1;
const SPACES_AND_EQUALS = 2;
const QUOTE_CHAR = 3;
const singleQuoteAttrEndRegex = /'/g;
const doubleQuoteAttrEndRegex = /"/g;
/**
* Matches the raw text elements.
*
* Comments are not parsed within raw text elements, so we need to search their
* text content for marker strings.
*/
const rawTextElement = /^(?:script|style|textarea|title)$/i;
/** TemplateResult types */
const HTML_RESULT = 1;
const SVG_RESULT = 2;
const MATHML_RESULT = 3;
/**
* Returns an HTML string for the given TemplateStringsArray and result type
* (HTML or SVG), along with the case-sensitive bound attribute names in
* template order. The HTML contains comment markers denoting the `ChildPart`s
* and suffixes on bound attributes denoting the `AttributeParts`.
*
* @param strings template strings array
* @param type HTML or SVG
* @return Array containing `[html, attrNames]` (array returned for terseness,
*     to avoid object fields since this code is shared with non-minified SSR
*     code)
*/
const getTemplateHtml = (strings, type) => {
	const l = strings.length - 1;
	const attrNames = [];
	let html$1 = type === SVG_RESULT ? "<svg>" : type === MATHML_RESULT ? "<math>" : "";
	let rawTextEndRegex;
	let regex = textEndRegex;
	for (let i = 0; i < l; i++) {
		const s = strings[i];
		let attrNameEndIndex = -1;
		let attrName;
		let lastIndex = 0;
		let match;
		while (lastIndex < s.length) {
			regex.lastIndex = lastIndex;
			match = regex.exec(s);
			if (match === null) break;
			lastIndex = regex.lastIndex;
			if (regex === textEndRegex) {
				if (match[COMMENT_START] === "!--") regex = commentEndRegex;
				else if (match[COMMENT_START] !== void 0) regex = comment2EndRegex;
				else if (match[TAG_NAME] !== void 0) {
					if (rawTextElement.test(match[TAG_NAME])) rawTextEndRegex = new RegExp(`</${match[TAG_NAME]}`, "g");
					regex = tagEndRegex;
				} else if (match[DYNAMIC_TAG_NAME] !== void 0) regex = tagEndRegex;
			} else if (regex === tagEndRegex) if (match[ENTIRE_MATCH] === ">") {
				regex = rawTextEndRegex ?? textEndRegex;
				attrNameEndIndex = -1;
			} else if (match[ATTRIBUTE_NAME] === void 0) attrNameEndIndex = -2;
			else {
				attrNameEndIndex = regex.lastIndex - match[SPACES_AND_EQUALS].length;
				attrName = match[ATTRIBUTE_NAME];
				regex = match[QUOTE_CHAR] === void 0 ? tagEndRegex : match[QUOTE_CHAR] === "\"" ? doubleQuoteAttrEndRegex : singleQuoteAttrEndRegex;
			}
			else if (regex === doubleQuoteAttrEndRegex || regex === singleQuoteAttrEndRegex) regex = tagEndRegex;
			else if (regex === commentEndRegex || regex === comment2EndRegex) regex = textEndRegex;
			else {
				regex = tagEndRegex;
				rawTextEndRegex = void 0;
			}
		}
		const end = regex === tagEndRegex && strings[i + 1].startsWith("/>") ? " " : "";
		html$1 += regex === textEndRegex ? s + nodeMarker : attrNameEndIndex >= 0 ? (attrNames.push(attrName), s.slice(0, attrNameEndIndex) + boundAttributeSuffix + s.slice(attrNameEndIndex)) + marker$1 + end : s + marker$1 + (attrNameEndIndex === -2 ? i : end);
	}
	const htmlResult = html$1 + (strings[l] || "<?>") + (type === SVG_RESULT ? "</svg>" : type === MATHML_RESULT ? "</math>" : "");
	return [htmlResult, attrNames];
};

//#endregion
//#region src/html.ts
const walker = doc.createTreeWalker(doc, 129);
const templateCache = /* @__PURE__ */ new WeakMap();
/**
* Returns a parsed template and its bound attributes for a given template string and type.
* @internal
*/
function getTemplate(strings, type) {
	let template = templateCache.get(strings);
	if (template === void 0) {
		const [html$1, attributes] = getTemplateHtml(strings, type);
		const element = doc.createElement("template");
		element.innerHTML = html$1;
		template = [element, attributes];
		templateCache.set(strings, template);
	}
	return template;
}
/**
* Assigns a property, attribute, boolean, or event handler to an element, supporting reactivity.
* @internal
*/
function assignAttribute(elem, name, value) {
	if (name[0] === "@") {
		const event = name.slice(1);
		let delegate = DelegatedEvents.has(event);
		addEventListener(elem, event, value, delegate);
		if (delegate) delegateEvents([event]);
		elem.removeAttribute(name);
	} else if (name[0] === ".") {
		if (isFunction(value)) effect(() => {
			setProperty(elem, name.slice(1), value());
		});
		else setProperty(elem, name.slice(1), value);
		elem.removeAttribute(name);
	} else if (name[0] === "?") if (isFunction(value)) effect(() => setBoolAttribute(elem, name.slice(1), value()));
	else setBoolAttribute(elem, name.slice(1), value);
	else if (isFunction(value)) effect(() => setAttribute(elem, name, value()));
	else setAttribute(elem, name, value);
}
/**
* Creates a tagged template function for html/svg/mathml templates with Solid reactivity.
* @internal
*/
function createHtml(type) {
	return function html$1(strings, ...values) {
		function render() {
			const [element, attributes] = getTemplate(strings, type);
			const clone = element.content.cloneNode(true);
			let valueIndex = 0;
			let boundAttributeIndex = 0;
			walker.currentNode = clone;
			while (walker.nextNode()) {
				const node = walker.currentNode;
				if (node.nodeType === 1) {
					for (const attr of [...node.attributes]) if (attr.name.endsWith(boundAttributeSuffix)) {
						if (attr.value === marker$1) assignAttribute(node, attributes[boundAttributeIndex++], values[valueIndex++]);
						else {
							const strings$1 = attr.value.split(marker$1);
							let parts = [strings$1[0]];
							for (let j = 1; j < strings$1.length; j++) parts.push(values[valueIndex++], strings$1[j]);
							assignAttribute(node, attributes[boundAttributeIndex++], () => parts.map((v) => isFunction(v) ? v() : v).join(""));
						}
						node.removeAttribute(attr.name);
					} else if (attr.name === `...${marker$1}`) {
						const isSvg = SVGElements.has(node.tagName);
						const value = values[valueIndex++];
						if (isFunction(value)) effect(() => assign(node, value(), isSvg, true));
						else assign(node, value, isSvg, true);
						node.removeAttribute(attr.name);
					} else if (attr.name.startsWith(marker$1)) {
						const value = values[valueIndex++];
						if (isFunction(value)) value(node);
						node.removeAttribute(attr.name);
					}
				} else if (node.nodeType === 8) {
					if (node.nodeValue === markerMatch) {
						node.nodeValue = marker$1 + valueIndex;
						const value = values[valueIndex++];
						const parent = node.parentNode;
						if (parent) insert(parent, value, node);
					}
				}
			}
			if (type === SVG_RESULT || type === MATHML_RESULT) return [...clone.firstChild.childNodes];
			return [...clone.childNodes];
		}
		return render;
	};
}
/**
* Tagged template for creating reactive HTML templates with Solid. Use for DOM elements only.
*
* @example
* html`<div class="foo">${bar}</div>`
* html`<button @click=${onClick}>Click</button>`
*/
const html = createHtml(HTML_RESULT);
/**
* Tagged template for creating reactive SVG templates with Solid. Use inside <svg> only.
*
* @example
* svg`<circle cx="10" cy="10" r="5" />`
*/
const svg = createHtml(SVG_RESULT);
/**
* Tagged template for creating reactive MathML templates with Solid. Use inside <math> only.
*
* @example
* mathml`<math><mi>x</mi></math>`
*/
const mathml = createHtml(MATHML_RESULT);

//#endregion
//#region src/xml.ts
/**
* Default registry of built-in Solid control flow and utility components for XML templates.
*/
const defaultRegistry = {
	For: For$1,
	Index: Index$1,
	Match: Match$1,
	Suspense: Suspense$1,
	ErrorBoundary: ErrorBoundary$1,
	Show: Show$1,
	Switch: Switch$1,
	Dynamic,
	Portal,
	NoHydration
};
const xmlns = [
	"on",
	"prop",
	"bool",
	"attr"
].map((ns) => `xmlns:${ns}="/"`).join(" ");
const marker = "MARKER46846";
const markerRX = new RegExp(`(${marker})`, "g");
const markerAttr = new RegExp(`=${marker}`, "g");
const xmlCache = /* @__PURE__ */ new WeakMap();
/**
* Parses a template string as XML and returns the child nodes, using a cache for performance.
* @internal
*/
function getXml(strings) {
	let xml$1 = xmlCache.get(strings);
	if (xml$1 === void 0) {
		const contents = strings.join(marker).replace(markerAttr, `="${marker}"`);
		const parser = new DOMParser();
		xml$1 = parser.parseFromString(`<xml ${xmlns}>${contents}</xml>`, "text/xml").firstChild;
		xmlCache.set(strings, xml$1);
	}
	return xml$1.childNodes;
}
const flat = (arr) => arr.length === 1 ? arr[0] : arr;
function getValue(value) {
	while (isFunction(value)) value = value();
	return value;
}
const toArray = Array.from;
/**
* Converts parsed XML nodes and values into Solid hyperscript calls.
* @internal
*/
function toH(jsx, cached, values) {
	let index = 0;
	function nodes(node) {
		if (node.nodeType === 1) {
			const tagName = node.tagName;
			const props = {};
			for (let { name, value } of node.attributes) {
				if (value === marker) value = values[index++];
				else if (value.includes(marker)) {
					const val = value.split(markerRX).map((x) => x === marker ? values[index++] : x);
					value = () => val.map(getValue).join("");
				}
				props[name] = value;
			}
			const childNodes = node.childNodes;
			if (childNodes.length) props.children = () => flat(toArray(childNodes).map(nodes).filter((n) => n));
			/[A-Z]/.test(tagName) && !jsx.components[tagName] && console.warn(`xml: Forgot to jsx.define({ ${tagName} })?`);
			return h(jsx.components[tagName] || tagName, props);
		} else if (node.nodeType === 3) {
			const value = node.nodeValue;
			if (value.trim() === marker) return values[index++];
			return value.includes(marker) ? value.split(markerRX).map((x) => x === marker ? values[index++] : x) : value;
		} else if (node.nodeType === 8) {
			const value = node.nodeValue;
			if (value.includes(marker)) {
				const val = value.split(markerRX).map((x) => x === marker ? values[index++] : x);
				return () => doc.createComment(val.map(getValue).join(""));
			} else return doc.createComment(value);
		} else console.error(`xml: nodeType not supported ${node.nodeType}`);
	}
	return flat(toArray(cached).map(nodes));
}
/**
* Creates an XML template tag function for Solid, supporting custom component registries.
* Use `xml.define({ ... })` to add or override components.
*
* @example
* const xml = XML({ MyComponent })
* xml`<MyComponent foo="bar">${child}</MyComponent>`
*
* @param userComponents Custom components to add to the registry.
* @returns An xml template tag function.
*/
function XML(userComponents = {}) {
	function xml$1(template, ...values) {
		return toH(xml$1, getXml(template), values);
	}
	xml$1.components = { ...defaultRegistry };
	xml$1.define = (userComponents$1) => {
		for (const name in userComponents$1) xml$1.components[name] = userComponents$1[name];
		return xml$1;
	};
	xml$1.define(userComponents);
	return xml$1;
}
/**
* Default XML template tag for Solid, with built-in registry. Use `xml.define` to add components.
*
* @example
* xml`<For each=${list}>${item => xml`<div>${item}</div>`}</For>`
*/
const xml = XML();

//#endregion
export { Context, ErrorBoundary, For, Index, Match, MatchKeyed, Show, ShowKeyed, Suspense, Switch, XML, h, html, mathml, once, svg, xml };
//# sourceMappingURL=index.mjs.map