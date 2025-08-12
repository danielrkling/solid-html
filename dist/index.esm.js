import { createComponent as ce, Show as j, Switch as Z, Match as v, For as z, Index as J, Suspense as Y, ErrorBoundary as q } from "solid-js";
import { spread as ee, insert as te, SVGElements as ne, effect as $, assign as M, DelegatedEvents as le, addEventListener as fe, delegateEvents as ae, setProperty as P, setBoolAttribute as I, setAttribute as O, dynamicProperty as ue, createComponent as de, NoHydration as pe, Portal as me, Dynamic as he } from "solid-js/web";
function y(e, n, ...t) {
  if (t.length === 1 ? n.children = t[0] : t.length > 1 && (n.children = t), typeof e == "string") {
    const r = document.createElement(e);
    return ee(r, _(n)), r;
  } else if (typeof e == "function")
    return ce(e, _(n));
}
const oe = /* @__PURE__ */ new WeakSet();
function re(e) {
  return oe.add(e), e;
}
function _(e = {}) {
  const n = Object.getOwnPropertyDescriptors(e);
  for (const [t, r] of Object.entries(n))
    if (t !== "ref" && t.slice(0, 2) !== "on" && typeof r.value == "function" && r.value.length === 0 && !oe.has(r.value)) {
      const a = r.value;
      Object.defineProperty(e, t, {
        get() {
          return a();
        },
        enumerable: !0
      });
    }
  return e;
}
function _e(e, n, t) {
  return y(j, {
    when: e,
    children: n,
    fallback: t,
    //@ts-expect-error
    keyed: !1
  });
}
function He(e, n, t) {
  return y(j, {
    when: e,
    //@ts-expect-error
    children: n,
    fallback: t,
    keyed: !0
  });
}
function De(e, ...n) {
  return y(Z, { children: n, fallback: e });
}
function Ve(e, n) {
  return y(v, { when: e, children: n, keyed: !1 });
}
function Fe(e, n) {
  return y(v, { when: e, children: n, keyed: !0 });
}
function We(e, n, t) {
  return y(z, {
    get each() {
      return e();
    },
    children: re(n),
    fallback: t
  });
}
function Be(e, n, t) {
  return y(J, {
    get each() {
      return e();
    },
    children: re(n),
    fallback: t
  });
}
function Ge(e, n) {
  return y(Y, { children: e, fallback: n });
}
function Le(e, n) {
  return y(q, { children: e, fallback: n });
}
function Qe(e, n, t) {
  return y(e.Provider, { value: n, children: t });
}
const se = "$lit$", E = "lit$marker$", ie = "?" + E, ge = `<${ie}>`, H = document, T = `[ 	
\f\r]`, ye = `[^ 	
\f\r"'\`<>=]`, Ee = `[^\\s"'>=/]`, w = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, D = 1, N = 2, Ae = 3, V = /-->/g, F = />/g, x = new RegExp(
  `>|${T}(?:(${Ee}+)(${T}*=${T}*(?:${ye}|("|')|))|$)`,
  "g"
), xe = 0, W = 1, be = 2, B = 3, G = /'/g, L = /"/g, we = /^(?:script|style|textarea|title)$/i;
H.createTreeWalker(
  H,
  129
  /* NodeFilter.SHOW_{ELEMENT|COMMENT} */
);
const $e = (e, n) => {
  const t = e.length - 1, r = [];
  let a = "", d, s = w;
  for (let f = 0; f < t; f++) {
    const u = e[f];
    let o = -1, l, i = 0, c;
    for (; i < u.length && (s.lastIndex = i, c = s.exec(u), c !== null); )
      i = s.lastIndex, s === w ? c[D] === "!--" ? s = V : c[D] !== void 0 ? s = F : c[N] !== void 0 ? (we.test(c[N]) && (d = new RegExp(`</${c[N]}`, "g")), s = x) : c[Ae] !== void 0 && (s = x) : s === x ? c[xe] === ">" ? (s = d ?? w, o = -1) : c[W] === void 0 ? o = -2 : (o = s.lastIndex - c[be].length, l = c[W], s = c[B] === void 0 ? x : c[B] === '"' ? L : G) : s === L || s === G ? s = x : s === V || s === F ? s = w : (s = x, d = void 0);
    const p = s === x && e[f + 1].startsWith("/>") ? " " : "";
    a += s === w ? u + ge : o >= 0 ? (r.push(l), u.slice(0, o) + se + u.slice(o) + E + p) : u + E + (o === -2 ? f : p);
  }
  return [a + (e[t] || "<?>") + "", r];
}, Se = /* @__PURE__ */ new WeakMap();
function Te(e) {
  let n = Se.get(e);
  if (n === void 0) {
    const [t, r] = $e(e), a = document.createElement("template");
    a.innerHTML = t, n = {
      element: a,
      attributes: r
    };
  }
  return n;
}
function R(e, n, t) {
  if (n === `...${E}`) {
    const r = ne.has(e.tagName);
    typeof t == "function" ? $(() => M(e, t(), r, !0)) : M(e, t, r, !0), e.removeAttribute(n);
  } else if (n.startsWith(E))
    typeof t == "function" && t(e), e.removeAttribute(n);
  else if (n[0] === "@") {
    const r = n.slice(1);
    let a = le.has(r);
    fe(e, r, t, a), a && ae([r]), e.removeAttribute(n);
  } else n[0] === "." ? (typeof t == "function" ? $(() => {
    P(e, n.slice(1), t());
  }) : P(e, n.slice(1), t), e.removeAttribute(n)) : n[0] === "?" ? typeof t == "function" ? $(() => I(e, n.slice(1), t())) : I(e, n.slice(1), t) : typeof t == "function" ? $(() => O(e, n, t())) : O(e, n, t);
}
const C = document.createTreeWalker(document, 129);
function Ue(e, ...n) {
  function t() {
    const { element: r, attributes: a } = Te(e), d = r.content.cloneNode(!0);
    let s = 0, m = 0;
    for (C.currentNode = d; C.nextNode(); ) {
      const f = C.currentNode;
      if (f.nodeType === 1)
        for (const u of [...f.attributes])
          if (u.name.endsWith(se)) {
            if (u.value === E)
              R(f, a[m++], n[s++]);
            else {
              const o = u.value.split(E);
              let l = [o[0]];
              for (let i = 1; i < o.length; i++)
                l.push(n[s++], o[i]);
              R(
                f,
                a[m],
                () => l.map((i) => typeof i == "function" ? i() : i).join("")
              );
            }
            f.removeAttribute(u.name);
          } else u.name.includes(E) && R(f, u.name, n[s++]);
      else if (f.nodeType === 8 && f.nodeValue === ie) {
        const u = n[s++], o = f.parentNode;
        o && te(o, u, f);
      }
    }
    return [...d.childNodes];
  }
  return t;
}
const S = Symbol("hyper-element");
function Ne(e) {
  function n() {
    let t = [].slice.call(arguments), r, a = [], d = !1;
    for (; Array.isArray(t[0]); ) t = t[0];
    t[0][S] && t.unshift(n.Fragment), typeof t[0] == "string" && u(t);
    const s = () => {
      for (; t.length; ) m(t.shift());
      return r instanceof Element && a.length && r.classList.add(...a), r;
    };
    return s[S] = !0, s;
    function m(o) {
      const l = typeof o;
      if (o != null) {
        if (l === "string")
          r ? r.appendChild(document.createTextNode(o)) : f(o);
        else if (l === "number" || l === "boolean" || l === "bigint" || l === "symbol" || o instanceof Date || o instanceof RegExp)
          r.appendChild(document.createTextNode(o.toString()));
        else if (Array.isArray(o))
          for (let i = 0; i < o.length; i++) m(o[i]);
        else if (o instanceof Element)
          e.insert(r, o, d ? null : void 0);
        else if (l === "object") {
          let i = !1;
          const c = Object.getOwnPropertyDescriptors(o);
          for (const p in c) {
            if (p === "class" && a.length !== 0) {
              const g = a.join(" "), A = typeof c.class.value == "function" ? () => g + " " + c.class.value() : g + " " + o.class;
              Object.defineProperty(o, "class", {
                ...c[p],
                value: A
              }), a = [];
            }
            p !== "ref" && p.slice(0, 2) !== "on" && typeof c[p].value == "function" ? (e.dynamicProperty(o, p), i = !0) : c[p].get && (i = !0);
          }
          i ? e.spread(r, o, r instanceof SVGElement, !!t.length) : e.assign(r, o, r instanceof SVGElement, !!t.length);
        } else if (l === "function")
          if (r) {
            for (; o[S]; ) o = o();
            e.insert(r, o, d ? null : void 0);
          } else {
            let i, c = t[0];
            (c == null || typeof c == "object" && !Array.isArray(c) && !(c instanceof Element)) && (i = t.shift()), i || (i = {}), t.length && (i.children = t.length > 1 ? t : t[0]);
            const p = Object.getOwnPropertyDescriptors(i);
            for (const g in p)
              if (Array.isArray(p[g].value)) {
                const A = p[g].value;
                i[g] = () => {
                  for (let b = 0; b < A.length; b++)
                    for (; A[b][S]; ) A[b] = A[b]();
                  return A;
                }, e.dynamicProperty(i, g);
              } else typeof p[g].value == "function" && !p[g].value.length && e.dynamicProperty(i, g);
            r = e.createComponent(o, i), t = [];
          }
      }
    }
    function f(o) {
      const l = o.split(/([\.#]?[^\s#.]+)/);
      /^\.|#/.test(l[1]) && (r = document.createElement("div"));
      for (let i = 0; i < l.length; i++) {
        const c = l[i], p = c.substring(1, c.length);
        c && (r ? c[0] === "." ? a.push(p) : c[0] === "#" && r.setAttribute("id", p) : r = e.SVGElements.has(c) ? document.createElementNS("http://www.w3.org/2000/svg", c) : document.createElement(c));
      }
    }
    function u(o) {
      for (let l = 1; l < o.length; l++)
        if (typeof o[l] == "function") {
          d = !0;
          return;
        } else Array.isArray(o[l]) && u(o[l]);
    }
  }
  return n.Fragment = (t) => t.children, n;
}
const Re = Ne({
  spread: ee,
  assign: M,
  insert: te,
  createComponent: de,
  dynamicProperty: ue,
  SVGElements: ne
}), Ce = {
  For: z,
  Index: J,
  Match: v,
  Suspense: Y,
  ErrorBoundary: q,
  Show: j,
  Switch: Z,
  Dynamic: he,
  Portal: me,
  NoHydration: pe
}, ke = ["on", "prop", "bool", "attr"].map((e) => `xmlns:${e}="/"`).join(" "), h = "MARKER46846", k = new RegExp(`(${h})`, "g"), Me = new RegExp(`=${h}`, "g"), Q = /* @__PURE__ */ new WeakMap();
function je(e) {
  let n = Q.get(e);
  if (n === void 0) {
    const t = e.join(h).replace(Me, `="${h}"`);
    n = new DOMParser().parseFromString(
      `<xml ${ke}>${t}</xml>`,
      "text/xml"
    ).firstChild, console.log(n), Q.set(e, n);
  }
  return n.childNodes;
}
const U = (e) => e.length === 1 ? e[0] : e;
function K(e) {
  for (; typeof e == "function"; ) e = e();
  return e;
}
const X = Array.from;
function ve(e, n, t) {
  let r = 0;
  function a(d) {
    if (d.nodeType === 1) {
      const s = d.tagName, m = {};
      for (let { name: u, value: o } of d.attributes) {
        if (o === h)
          o = t[r++];
        else if (o.includes(h)) {
          const l = o.split(k).map((i) => i === h ? t[r++] : i);
          o = () => l.map(K).join("");
        }
        m[u] = o;
      }
      const f = d.childNodes;
      return f.length && (m.children = U(X(f).map(a).filter((u) => u))), /[A-Z]/.test(s) && !e.components[s] && console.warn(`html: Forgot to jsx.define({ ${s} })?`), Re(e.components[s] || s, m);
    } else if (d.nodeType === 3) {
      const s = d.nodeValue;
      return s.trim() === h ? t[r++] : s.includes(h) ? s.split(k).map((m) => m === h ? t[r++] : m) : s;
    } else if (d.nodeType === 8) {
      const s = d.nodeValue;
      if (s.includes(h)) {
        const m = s.split(k).map((f) => f === h ? t[r++] : f);
        return () => document.createComment(m.map(K).join(""));
      } else
        return document.createComment(s);
    } else
      console.error(`jsx: nodeType not supported ${d.nodeType}`);
  }
  return U(X(n).map(a));
}
function Pe() {
  function e(n, ...t) {
    return ve(e, je(n), t);
  }
  return e.components = { ...Ce }, e.define = (n) => {
    for (const t in n)
      e.components[t] = n[t];
  }, e;
}
const Ke = Pe();
export {
  Qe as Context,
  Le as ErrorBoundary,
  We as For,
  Be as Index,
  Pe as JSX,
  He as Keyed,
  Ve as Match,
  Fe as MatchKeyed,
  _e as Show,
  Ge as Suspense,
  De as Switch,
  y as h,
  Ue as html,
  Ke as jsx,
  re as once,
  _ as wrapProps
};
