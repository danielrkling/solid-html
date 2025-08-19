import { ErrorBoundary as ErrorBoundary$1, For as For$1, Index as Index$1, Match as Match$1, Show as Show$1, Suspense as Suspense$1, Switch as Switch$1, createComponent } from "solid-js";
import { DelegatedEvents, Dynamic, ErrorBoundary as ErrorBoundary$2, For as For$2, Index as Index$2, Match as Match$2, NoHydration, Portal, SVGElements, Show as Show$2, Suspense as Suspense$2, Switch as Switch$2, addEventListener, delegateEvents, effect, insert } from "solid-js/web";

//#region src/components.ts
function getValue(value) {
	if (typeof value === "function") return value();
	else return value;
}
/**
* Solid-compatible Show component. Renders children if `when` is truthy, otherwise renders `fallback`.
* @example
* Show(() => isVisible(), html`<span>Hello</span>`, "Fallback")
*/
function Show(when, children, fallback) {
	return createComponent(Show$1, {
		get when() {
			return when();
		},
		get children() {
			return getValue(children);
		},
		get fallback() {
			return getValue(fallback);
		},
		keyed: false
	});
}
/**
* Show component with keyed mode. Renders children with keyed context if `when` is truthy.
* @example
* ShowKeyed(() => user(), user => html`<span>${user.name}</span>`, "No user")
*/
function ShowKeyed(when, children, fallback) {
	return createComponent(Show$1, {
		get when() {
			return when();
		},
		get children() {
			return getValue(children);
		},
		get fallback() {
			return getValue(fallback);
		},
		keyed: true
	});
}
/**
* Switch component for conditional rendering. Renders the first matching child, or `fallback` if none match.
* @example
* Switch("No match", Match(() => cond1(), html`A`), Match(() => cond2(), html`B`))
*/
function Switch(fallback, ...children) {
	return createComponent(Switch$1, {
		get children() {
			return getValue(children);
		},
		get fallback() {
			return getValue(fallback);
		}
	});
}
/**
* Match component for use inside Switch. Renders children if `when` is truthy.
* @example
* Match(() => value() === 1, html`One`)
*/
function Match(when, children) {
	return createComponent(Match$1, {
		get when() {
			return when();
		},
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
	return createComponent(Match$1, {
		get when() {
			return when();
		},
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
	return createComponent(For$1, {
		get each() {
			return each();
		},
		children,
		get fallback() {
			return getValue(fallback);
		}
	});
}
/**
* Index component for iterating over arrays by index. Renders children for each item in `each`.
* @example
* Index(() => items(), (item, i) => html`<li>${item()}</li>`)
*/
function Index(each, children, fallback) {
	return createComponent(Index$1, {
		get each() {
			return each();
		},
		children,
		get fallback() {
			return getValue(fallback);
		}
	});
}
/**
* Suspense component for async boundaries. Renders `children` or `fallback` while loading.
* @example
* Suspense(html`<div>Loaded</div>`, html`<div>Loading...</div>`)
*/
function Suspense(children, fallback) {
	return createComponent(Suspense$1, {
		get children() {
			return getValue(children);
		},
		get fallback() {
			return getValue(fallback);
		}
	});
}
/**
* ErrorBoundary component. Catches errors in children and renders `fallback` on error.
* @example
* ErrorBoundary(html`<App />`, (err) => html`<div>Error: ${err.message}</div>`)
*/
function ErrorBoundary(children, fallback) {
	return createComponent(ErrorBoundary$1, {
		get children() {
			return getValue(children);
		},
		get fallback() {
			return getValue(fallback);
		}
	});
}
/**
* Context provider component. Provides a context value to all children.
* @example
* Context(MyContext, value, () => html`<Child />`)
*/
function Context(context, value, children) {
	return createComponent(context.Provider, {
		get children() {
			return getValue(children);
		},
		get value() {
			return getValue(value);
		}
	});
}

//#endregion
//#region src/util.ts
function isString(value) {
	return typeof value === "string";
}
function isFunction(value) {
	return typeof value === "function";
}
const doc = document;

//#endregion
//#region src/assign.ts
function assignEvent(node, name, value, prev) {
	prev && node.removeEventListener(name, prev);
	value && node.addEventListener(name, value);
	return value;
}
function assignDelegatedEvent(node, name, value, prev) {
	name = name.toLowerCase();
	let delegate = DelegatedEvents.has(name);
	addEventListener(node, name, value, delegate);
	if (delegate) delegateEvents([name]);
	return value;
}
function assignProperty(node, name, value, prev) {
	node[name] = value;
	return value;
}
function assignBooleanAttribute(node, name, value, prev) {
	if (value) node.setAttribute(name, "");
	else node.removeAttribute(name);
	return value;
}
function assignAttribute(node, name, value, prev) {
	if (value === null || value === void 0) {
		node.removeAttribute(name);
		return value;
	}
	node.setAttribute(name, value);
	return value;
}
function assignAttributeNS(namespace, node, name, value, prev) {
	if (value === null || value === void 0) {
		node.removeAttributeNS(namespace, name);
		return value;
	}
	node.setAttributeNS(namespace, name, value);
	return value;
}
function assignClass(node, name, value, prev) {
	node.classList.toggle(name, !!value);
	return value;
}
function assignStyle(node, name, value, prev) {
	node.style[name] = value ? value : "";
	return value;
}
function assignRef(node, name, value, prev) {
	if (isFunction(value)) value(node);
}
function assign(rules, elem, name, value, prev) {
	if (value === prev) return value;
	if (name === "children") return insert(elem, value);
	for (const rule of rules) {
		const { filter, assign: assign$1, isReactive = true } = rule;
		if (isString(filter) && name.startsWith(filter)) name = name.slice(filter.length);
		else if (isFunction(filter)) name = filter(elem, name, value, prev);
		else continue;
		if (name) {
			if (isFunction(value) && isReactive) effect(() => prev = assign$1(elem, name, value(), prev));
			else assign$1(elem, name, value, prev);
			return prev;
		}
	}
}
function spread(rules, elem, props, prev = {}) {
	if (isFunction(props)) effect(() => {
		for (const [name, value] of Object.entries(props())) prev[name] = assign(rules, elem, name, value, prev[name]);
	});
	else for (const [name, value] of Object.entries(props)) prev[name] = assign(rules, elem, name, value, prev[name]);
	return prev;
}

//#endregion
//#region src/xml.ts
const xmlns = [
	"on",
	"prop",
	"bool",
	"attr",
	"ref",
	"style",
	"class",
	"xlink"
].map((ns) => `xmlns:${ns}="/"`).join(" ");
const marker$1 = "MARKER46846";
const markerRX = new RegExp(`(${marker$1})`, "g");
const markerAttr = new RegExp(`=${marker$1}`, "g");
const xmlCache = /* @__PURE__ */ new WeakMap();
/**
* Parses a template string as XML and returns the child nodes, using a cache for performance.
* @internal
*/
function getXml(strings) {
	let xml$1 = xmlCache.get(strings);
	if (xml$1 === void 0) {
		const contents = strings.join(marker$1).replace(markerAttr, `="${marker$1}"`);
		const parser = new DOMParser();
		xml$1 = parser.parseFromString(`<xml ${xmlns}>${contents}</xml>`, "text/xml").firstChild;
		xmlCache.set(strings, xml$1);
	}
	return xml$1.childNodes;
}
const flat = (arr) => arr.length === 1 ? arr[0] : arr;
function getValue$1(value) {
	while (isFunction(value)) value = value();
	return value;
}
const toArray = Array.from;
function XML(components = {}, rules = []) {
	function xml$1(template, ...values) {
		const cached = getXml(template);
		let index = 0;
		function nodes(node) {
			if (node.nodeType === 1) {
				const tagName = node.tagName;
				const props = {};
				for (let { name, value } of node.attributes) {
					if (value === marker$1) value = values[index++];
					else if (value.includes(marker$1)) {
						const val = value.split(markerRX).map((x) => x === marker$1 ? values[index++] : x);
						value = () => val.map(getValue$1).join("");
					}
					props[name] = value;
				}
				const childNodes = node.childNodes;
				if (childNodes.length) Object.defineProperty(props, "children", {
					get() {
						return flat(toArray(childNodes).map(nodes).filter((n) => n));
					},
					enumerable: true
				});
				return xml$1.h(tagName, props);
			} else if (node.nodeType === 3) {
				const value = node.nodeValue;
				if (value.trim() === marker$1) return values[index++];
				return value.includes(marker$1) ? value.split(markerRX).map((x) => x === marker$1 ? values[index++] : x) : value;
			} else if (node.nodeType === 8) {
				const value = node.nodeValue;
				if (value.includes(marker$1)) {
					const val = value.split(markerRX).map((x) => x === marker$1 ? values[index++] : x);
					return () => doc.createComment(val.map(getValue$1).join(""));
				} else return doc.createComment(value);
			} else console.error(`xml: nodeType not supported ${node.nodeType}`);
		}
		return flat(toArray(cached).map(nodes));
	}
	xml$1.h = H(components, rules);
	return xml$1;
}

//#endregion
//#region src/lit-html.ts
const boundAttributeSuffix = "$lit$";
const marker = `lit$marker$`;
const markerMatch = "?" + marker;
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
		html$1 += regex === textEndRegex ? s + nodeMarker : attrNameEndIndex >= 0 ? (attrNames.push(attrName), s.slice(0, attrNameEndIndex) + boundAttributeSuffix + s.slice(attrNameEndIndex)) + marker + end : s + marker + (attrNameEndIndex === -2 ? i : end);
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
* Creates a tagged template function for html/svg/mathml templates with Solid reactivity.
* @internal
*/
function HTML(type = 1, rules = []) {
	function html$1(strings, ...values) {
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
						let value;
						if (attr.value === marker) value = values[valueIndex++];
						else {
							const strings$1 = attr.value.split(marker);
							let parts = [strings$1[0]];
							for (let j = 1; j < strings$1.length; j++) parts.push(values[valueIndex++], strings$1[j]);
							value = () => parts.map((v) => isFunction(v) ? v() : v).join("");
						}
						assign(rules, node, attributes[boundAttributeIndex++], value);
						node.removeAttribute(attr.name);
					} else if (attr.name === `...${marker}`) {
						SVGElements.has(node.tagName);
						const value = values[valueIndex++];
						if (isFunction(value)) effect(() => spread(rules, node, value()));
						else spread(rules, node, value);
						node.removeAttribute(attr.name);
					} else if (attr.name.startsWith(marker)) {
						const value = values[valueIndex++];
						if (isFunction(value)) value(node);
						node.removeAttribute(attr.name);
					}
				} else if (node.nodeType === 8) {
					if (node.nodeValue === markerMatch) {
						node.nodeValue = marker + valueIndex;
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
	}
	html$1.rules = [...rules, ...defaultRules];
	return html$1;
}

//#endregion
//#region src/defaults.ts
const defaultRules = [
	{
		filter: "on:",
		assign: assignEvent,
		isReactive: false
	},
	{
		filter: "on",
		assign: assignDelegatedEvent,
		isReactive: false
	},
	{
		filter: "prop:",
		assign: assignProperty
	},
	{
		filter: "bool:",
		assign: assignBooleanAttribute
	},
	{
		filter: "attr:",
		assign: assignAttribute
	},
	{
		filter: "ref:",
		assign: assignRef,
		isReactive: false
	},
	{
		filter: "class:",
		assign: assignClass
	},
	{
		filter: "style:",
		assign: assignStyle
	},
	{
		filter: "@",
		assign: assignDelegatedEvent
	},
	{
		filter: ".",
		assign: assignProperty
	},
	{
		filter: "?",
		assign: assignBooleanAttribute
	},
	{
		filter: "",
		assign: assignAttribute
	}
];
const defaultComponents = {
	For: For$2,
	Index: Index$2,
	Match: Match$2,
	Suspense: Suspense$2,
	ErrorBoundary: ErrorBoundary$2,
	Show: Show$2,
	Switch: Switch$2,
	Dynamic,
	Portal,
	NoHydration
};
const h = H();
const xml = XML();
const html = HTML(HTML_RESULT);
const svg = HTML(SVG_RESULT);
const mathml = HTML(MATHML_RESULT);

//#endregion
//#region src/h.ts
function H(components = {}, rules = []) {
	function h$1(component, props, ...children) {
		if (children.length === 1) props.children = children[0];
		else if (children.length > 1) props.children = children;
		if (isString(component)) {
			if (/[A-Z]/.test(component)) {
				const componentFunction = h$1.components[component];
				if (componentFunction) return createComponent(componentFunction, wrapProps(props));
				console.warn(`Forgot to define ${componentFunction}`);
			}
			const elem = SVGElements.has(component) ? doc.createElementNS("http://www.w3.org/2000/svg", component) : doc.createElement(component);
			spread(h$1.rules, elem, props);
			return elem;
		} else if (isFunction(component)) return createComponent(component, wrapProps(props));
	}
	h$1.components = {
		...defaultComponents,
		...components
	};
	h$1.define = (components$1) => {
		Object.assign(h$1.components, components$1);
	};
	h$1.rules = [...rules, ...defaultRules];
	return h$1;
}
const markedOnce = /* @__PURE__ */ new WeakSet();
/**
* Marks a function so it is not wrapped as a getter by h().
* Useful for event handlers or functions that should not be auto-accessed.
* @example
* once(() => doSomething())
*/
function once(fn) {
	if (isFunction(fn)) markedOnce.add(fn);
	return fn;
}
/**
* Internal: Replaces accessor props with getters for reactivity, except for refs and event handlers.
*/
function wrapProps(props = {}) {
	for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(props))) {
		const value = descriptor.value;
		if (isFunction(value) && value.length === 0 && !markedOnce.has(value)) Object.defineProperty(props, key, {
			get() {
				return value();
			},
			enumerable: true
		});
	}
	return props;
}

//#endregion
export { Context, ErrorBoundary, For, H, HTML, Index, Match, MatchKeyed, Show, ShowKeyed, Suspense, Switch, XML, assign, assignAttribute, assignAttributeNS, assignBooleanAttribute, assignClass, assignDelegatedEvent, assignEvent, assignProperty, assignRef, assignStyle, defaultComponents, defaultRules, getValue, h, html, markedOnce, mathml, once, spread, svg, xml };
//# sourceMappingURL=index.mjs.map