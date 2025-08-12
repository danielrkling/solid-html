import { createComponent as fe, Show as P, Switch as q, Match as _, For as J, Index as ee, Suspense as te, ErrorBoundary as ne } from "solid-js";
import { spread as oe, SVGElements as re, effect as T, assign as k, insert as se, DelegatedEvents as ue, addEventListener as de, delegateEvents as me, setProperty as I, setBoolAttribute as H, setAttribute as O, dynamicProperty as pe, createComponent as he, NoHydration as ge, Portal as ye, Dynamic as Ee } from "solid-js/web";
function y(e, n, ...t) {
  if (t.length === 1 ? n.children = t[0] : t.length > 1 && (n.children = t), typeof e == "string") {
    const r = document.createElement(e);
    return oe(r, L(n)), r;
  } else if (typeof e == "function")
    return fe(e, L(n));
}
const ie = /* @__PURE__ */ new WeakSet();
function ce(e) {
  return ie.add(e), e;
}
function L(e = {}) {
  const n = Object.getOwnPropertyDescriptors(e);
  for (const [t, r] of Object.entries(n))
    if (t !== "ref" && t.slice(0, 2) !== "on" && typeof r.value == "function" && r.value.length === 0 && !ie.has(r.value)) {
      const u = r.value;
      Object.defineProperty(e, t, {
        get() {
          return u();
        },
        enumerable: !0
      });
    }
  return e;
}
function De(e, n, t) {
  return y(P, {
    when: e,
    children: n,
    fallback: t,
    //@ts-expect-error
    keyed: !1
  });
}
function Fe(e, n, t) {
  return y(P, {
    when: e,
    //@ts-expect-error
    children: n,
    fallback: t,
    keyed: !0
  });
}
function We(e, ...n) {
  return y(q, { children: n, fallback: e });
}
function Ge(e, n) {
  return y(_, { when: e, children: n, keyed: !1 });
}
function Ue(e, n) {
  return y(_, { when: e, children: n, keyed: !0 });
}
function Be(e, n, t) {
  return y(J, {
    get each() {
      return e();
    },
    children: ce(n),
    fallback: t
  });
}
function Qe(e, n, t) {
  return y(ee, {
    get each() {
      return e();
    },
    children: ce(n),
    fallback: t
  });
}
function Ke(e, n) {
  return y(te, { children: e, fallback: n });
}
function Xe(e, n) {
  return y(ne, { children: e, fallback: n });
}
function Ze(e, n, t) {
  return y(e.Provider, { value: n, children: t });
}
const le = "$lit$", E = "lit$marker$", ae = "?" + E, Ae = `<${ae}>`, V = document, R = `[ 	
\f\r]`, xe = `[^ 	
\f\r"'\`<>=]`, $e = `[^\\s"'>=/]`, b = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, D = 1, v = 2, be = 3, F = /-->/g, W = />/g, x = new RegExp(
  `>|${R}(?:(${$e}+)(${R}*=${R}*(?:${xe}|("|')|))|$)`,
  "g"
), we = 0, G = 1, Te = 2, U = 3, B = /'/g, Q = /"/g, Se = /^(?:script|style|textarea|title)$/i, Ne = 1, S = 2, N = 3;
V.createTreeWalker(
  V,
  129
  /* NodeFilter.SHOW_{ELEMENT|COMMENT} */
);
const Re = (e, n) => {
  const t = e.length - 1, r = [];
  let u = n === S ? "<svg>" : n === N ? "<math>" : "", f, s = b;
  for (let d = 0; d < t; d++) {
    const p = e[d];
    let o = -1, l, c = 0, i;
    for (; c < p.length && (s.lastIndex = c, i = s.exec(p), i !== null); )
      c = s.lastIndex, s === b ? i[D] === "!--" ? s = F : i[D] !== void 0 ? s = W : i[v] !== void 0 ? (Se.test(i[v]) && (f = new RegExp(`</${i[v]}`, "g")), s = x) : i[be] !== void 0 && (s = x) : s === x ? i[we] === ">" ? (s = f ?? b, o = -1) : i[G] === void 0 ? o = -2 : (o = s.lastIndex - i[Te].length, l = i[G], s = i[U] === void 0 ? x : i[U] === '"' ? Q : B) : s === Q || s === B ? s = x : s === F || s === W ? s = b : (s = x, f = void 0);
    const a = s === x && e[d + 1].startsWith("/>") ? " " : "";
    u += s === b ? p + Ae : o >= 0 ? (r.push(l), p.slice(0, o) + le + p.slice(o) + E + a) : p + E + (o === -2 ? d : a);
  }
  return [u + (e[t] || "<?>") + (n === S ? "</svg>" : n === N ? "</math>" : ""), r];
}, M = document.createTreeWalker(document, 129), ve = /* @__PURE__ */ new WeakMap();
function Me(e, n) {
  let t = ve.get(e);
  if (t === void 0) {
    const [r, u] = Re(e, n), f = document.createElement("template");
    f.innerHTML = r, t = {
      element: f,
      attributes: u
    };
  }
  return t;
}
function K(e, n, t) {
  if (n[0] === "@") {
    const r = n.slice(1);
    let u = ue.has(r);
    de(e, r, t, u), u && me([r]), e.removeAttribute(n);
  } else n[0] === "." ? (typeof t == "function" ? T(() => {
    I(e, n.slice(1), t());
  }) : I(e, n.slice(1), t), e.removeAttribute(n)) : n[0] === "?" ? typeof t == "function" ? T(() => H(e, n.slice(1), t())) : H(e, n.slice(1), t) : typeof t == "function" ? T(() => O(e, n, t())) : O(e, n, t);
}
function j(e) {
  return function(t, ...r) {
    function u() {
      const { element: f, attributes: s } = Me(t, e), m = f.content.cloneNode(!0);
      let d = 0, p = 0;
      for (M.currentNode = m; M.nextNode(); ) {
        const o = M.currentNode;
        if (o.nodeType === 1) {
          for (const l of [...o.attributes])
            if (l.name.endsWith(le)) {
              if (l.value === E)
                K(o, s[p++], r[d++]);
              else {
                const c = l.value.split(E);
                let i = [c[0]];
                for (let a = 1; a < c.length; a++)
                  i.push(r[d++], c[a]);
                K(
                  o,
                  s[p++],
                  () => i.map((a) => typeof a == "function" ? a() : a).join("")
                );
              }
              o.removeAttribute(l.name);
            } else if (l.name === `...${E}`) {
              const c = re.has(o.tagName), i = r[d++];
              typeof i == "function" ? T(() => k(o, i(), c, !0)) : k(o, i, c, !0), o.removeAttribute(l.name);
            } else if (l.name.startsWith(E)) {
              const c = r[d++];
              typeof c == "function" && c(o), o.removeAttribute(l.name);
            }
        } else if (o.nodeType === 8 && o.nodeValue === ae) {
          o.nodeValue = `${E}${d}`;
          const l = r[d++], c = o.parentNode;
          c && se(c, l, o);
        }
      }
      return e === S || e === N ? [...m.firstChild.childNodes] : [...m.childNodes];
    }
    return u;
  };
}
const ze = j(Ne), Ye = j(S), qe = j(N), w = Symbol("hyper-element");
function Ce(e) {
  function n() {
    let t = [].slice.call(arguments), r, u = [], f = !1;
    for (; Array.isArray(t[0]); ) t = t[0];
    t[0][w] && t.unshift(n.Fragment), typeof t[0] == "string" && p(t);
    const s = () => {
      for (; t.length; ) m(t.shift());
      return r instanceof Element && u.length && r.classList.add(...u), r;
    };
    return s[w] = !0, s;
    function m(o) {
      const l = typeof o;
      if (o != null) {
        if (l === "string")
          r ? r.appendChild(document.createTextNode(o)) : d(o);
        else if (l === "number" || l === "boolean" || l === "bigint" || l === "symbol" || o instanceof Date || o instanceof RegExp)
          r.appendChild(document.createTextNode(o.toString()));
        else if (Array.isArray(o))
          for (let c = 0; c < o.length; c++) m(o[c]);
        else if (o instanceof Element)
          e.insert(r, o, f ? null : void 0);
        else if (l === "object") {
          let c = !1;
          const i = Object.getOwnPropertyDescriptors(o);
          for (const a in i) {
            if (a === "class" && u.length !== 0) {
              const g = u.join(" "), A = typeof i.class.value == "function" ? () => g + " " + i.class.value() : g + " " + o.class;
              Object.defineProperty(o, "class", {
                ...i[a],
                value: A
              }), u = [];
            }
            a !== "ref" && a.slice(0, 2) !== "on" && typeof i[a].value == "function" ? (e.dynamicProperty(o, a), c = !0) : i[a].get && (c = !0);
          }
          c ? e.spread(r, o, r instanceof SVGElement, !!t.length) : e.assign(r, o, r instanceof SVGElement, !!t.length);
        } else if (l === "function")
          if (r) {
            for (; o[w]; ) o = o();
            e.insert(r, o, f ? null : void 0);
          } else {
            let c, i = t[0];
            (i == null || typeof i == "object" && !Array.isArray(i) && !(i instanceof Element)) && (c = t.shift()), c || (c = {}), t.length && (c.children = t.length > 1 ? t : t[0]);
            const a = Object.getOwnPropertyDescriptors(c);
            for (const g in a)
              if (Array.isArray(a[g].value)) {
                const A = a[g].value;
                c[g] = () => {
                  for (let $ = 0; $ < A.length; $++)
                    for (; A[$][w]; ) A[$] = A[$]();
                  return A;
                }, e.dynamicProperty(c, g);
              } else typeof a[g].value == "function" && !a[g].value.length && e.dynamicProperty(c, g);
            r = e.createComponent(o, c), t = [];
          }
      }
    }
    function d(o) {
      const l = o.split(/([\.#]?[^\s#.]+)/);
      /^\.|#/.test(l[1]) && (r = document.createElement("div"));
      for (let c = 0; c < l.length; c++) {
        const i = l[c], a = i.substring(1, i.length);
        i && (r ? i[0] === "." ? u.push(a) : i[0] === "#" && r.setAttribute("id", a) : r = e.SVGElements.has(i) ? document.createElementNS("http://www.w3.org/2000/svg", i) : document.createElement(i));
      }
    }
    function p(o) {
      for (let l = 1; l < o.length; l++)
        if (typeof o[l] == "function") {
          f = !0;
          return;
        } else Array.isArray(o[l]) && p(o[l]);
    }
  }
  return n.Fragment = (t) => t.children, n;
}
const ke = Ce({
  spread: oe,
  assign: k,
  insert: se,
  createComponent: he,
  dynamicProperty: pe,
  SVGElements: re
}), Pe = {
  For: J,
  Index: ee,
  Match: _,
  Suspense: te,
  ErrorBoundary: ne,
  Show: P,
  Switch: q,
  Dynamic: Ee,
  Portal: ye,
  NoHydration: ge
}, _e = ["on", "prop", "bool", "attr"].map((e) => `xmlns:${e}="/"`).join(" "), h = "MARKER46846", C = new RegExp(`(${h})`, "g"), je = new RegExp(`=${h}`, "g"), X = /* @__PURE__ */ new WeakMap();
function Ie(e) {
  let n = X.get(e);
  if (n === void 0) {
    const t = e.join(h).replace(je, `="${h}"`);
    n = new DOMParser().parseFromString(
      `<xml ${_e}>${t}</xml>`,
      "text/xml"
    ).firstChild, console.log(n), X.set(e, n);
  }
  return n.childNodes;
}
const Z = (e) => e.length === 1 ? e[0] : e;
function z(e) {
  for (; typeof e == "function"; ) e = e();
  return e;
}
const Y = Array.from;
function He(e, n, t) {
  let r = 0;
  function u(f) {
    if (f.nodeType === 1) {
      const s = f.tagName, m = {};
      for (let { name: p, value: o } of f.attributes) {
        if (o === h)
          o = t[r++];
        else if (o.includes(h)) {
          const l = o.split(C).map((c) => c === h ? t[r++] : c);
          o = () => l.map(z).join("");
        }
        m[p] = o;
      }
      const d = f.childNodes;
      return d.length && (m.children = Z(Y(d).map(u).filter((p) => p))), /[A-Z]/.test(s) && !e.components[s] && console.warn(`xml: Forgot to jsx.define({ ${s} })?`), ke(e.components[s] || s, m);
    } else if (f.nodeType === 3) {
      const s = f.nodeValue;
      return s.trim() === h ? t[r++] : s.includes(h) ? s.split(C).map((m) => m === h ? t[r++] : m) : s;
    } else if (f.nodeType === 8) {
      const s = f.nodeValue;
      if (s.includes(h)) {
        const m = s.split(C).map((d) => d === h ? t[r++] : d);
        return () => document.createComment(m.map(z).join(""));
      } else
        return document.createComment(s);
    } else
      console.error(`xml: nodeType not supported ${f.nodeType}`);
  }
  return Z(Y(n).map(u));
}
function Oe() {
  function e(n, ...t) {
    return He(e, Ie(n), t);
  }
  return e.components = { ...Pe }, e.define = (n) => {
    for (const t in n)
      e.components[t] = n[t];
  }, e;
}
const Je = Oe();
export {
  Ze as Context,
  Xe as ErrorBoundary,
  Be as For,
  Qe as Index,
  Fe as Keyed,
  Ge as Match,
  Ue as MatchKeyed,
  De as Show,
  Ke as Suspense,
  We as Switch,
  Oe as XML,
  y as h,
  ze as html,
  qe as mathml,
  ce as once,
  Ye as svg,
  L as wrapProps,
  Je as xml
};
