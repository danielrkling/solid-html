import { createComponent as N, Show as k, Switch as T, Match as b, For as x, Index as C, Suspense as L, ErrorBoundary as O } from "solid-js";
import { spread as P, insert as j, SVGElements as B, effect as u, assign as l, DelegatedEvents as V, addEventListener as F, delegateEvents as H, setProperty as h, setBoolAttribute as p, setAttribute as y } from "solid-js/web";
function o(t, e, ...r) {
  if (r.length === 1 ? e.children = r[0] : r.length > 1 && (e.children = r), typeof t == "string") {
    const n = document.createElement(t);
    return P(n, $(e)), n;
  } else if (typeof t == "function")
    return N(t, $(e));
}
const w = /* @__PURE__ */ new WeakSet();
function S(t) {
  return w.add(t), t;
}
function $(t = {}) {
  const e = Object.getOwnPropertyDescriptors(t);
  for (const [r, n] of Object.entries(e))
    if (r !== "ref" && r.slice(0, 2) !== "on" && typeof n.value == "function" && n.value.length === 0 && !w.has(n.value)) {
      const i = n.value;
      Object.defineProperty(t, r, {
        get() {
          return i();
        },
        enumerable: !0
      });
    }
  return t;
}
function G(t, e, r) {
  return o(k, {
    when: t,
    children: e,
    fallback: r,
    //@ts-expect-error
    keyed: !1
  });
}
function q(t, e, r) {
  return o(k, {
    when: t,
    //@ts-expect-error
    children: e,
    fallback: r,
    keyed: !0
  });
}
function z(t, ...e) {
  return o(T, { children: e, fallback: t });
}
function J(t, e) {
  return o(b, { when: t, children: e, keyed: !1 });
}
function Q(t, e) {
  return o(b, { when: t, children: e, keyed: !0 });
}
function R(t, e, r) {
  return o(x, {
    get each() {
      return t();
    },
    children: S(e),
    fallback: r
  });
}
function U(t, e, r) {
  return o(C, {
    get each() {
      return t();
    },
    children: S(e),
    fallback: r
  });
}
function X(t, e) {
  return o(L, { children: t, fallback: e });
}
function Y(t, e) {
  return o(O, { children: t, fallback: e });
}
function Z(t, e, r) {
  return o(t.Provider, { value: e, children: r });
}
const f = "$Marker$", M = "$Attribute$", A = "$Child$", I = `<!--${A}-->`, E = `...${f.toLowerCase()}`, g = /* @__PURE__ */ new WeakMap();
function W(t) {
  let e = g.get(t);
  if (e === void 0) {
    e = document.createElement("template"), e.innerHTML = t.join(f);
    let r = e.innerHTML;
    r = r.replaceAll(`"${f}"`, `"${M}"`), r = r.replaceAll(f, I), e.innerHTML = r, g.set(t, e);
  }
  return e;
}
function v(t, e, r) {
  if (e === E) {
    const n = B.has(t.tagName);
    typeof r == "function" ? u(() => l(t, r(), n, !0)) : l(t, r, n, !0), t.removeAttribute(e);
  } else if (e === "$ref")
    typeof r == "function" && r(t), t.removeAttribute(e);
  else if (e[0] === "@") {
    const n = e.slice(1);
    let i = V.has(n);
    F(t, n, r, i), i && H([n]), t.removeAttribute(e);
  } else e[0] === "." ? (typeof r == "function" ? u(() => {
    h(t, e.slice(1), r());
  }) : h(t, e.slice(1), r), t.removeAttribute(e)) : e[0] === "?" ? typeof r == "function" ? u(() => p(t, e.slice(1), r())) : p(t, e.slice(1), r) : typeof r == "function" ? u(() => y(t, e, r())) : y(t, e, r);
}
const d = document.createTreeWalker(document, 129);
function _(t, ...e) {
  function r() {
    const n = W(t).content.cloneNode(!0);
    let i = 0;
    for (d.currentNode = n; d.nextNode(); ) {
      const c = d.currentNode;
      if (c.nodeType === 1)
        for (const s of [...c.attributes])
          (s.value === M || s.name === E) && v(c, s.name, e[i++]);
      else if (c.nodeType === 8 && c.nodeValue === A) {
        c.nodeValue = i.toString();
        const s = e[i++], a = c.parentNode;
        a && j(a, s, c);
      }
    }
    return [...n.childNodes];
  }
  return r;
}
export {
  Z as Context,
  Y as ErrorBoundary,
  R as For,
  U as Index,
  q as Keyed,
  J as Match,
  Q as MatchKeyed,
  G as Show,
  X as Suspense,
  z as Switch,
  o as h,
  _ as html,
  S as once,
  $ as wrapProps
};
