import { template as _$template } from "solid-js/web";
import { delegateEvents as _$delegateEvents } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
import { insert as _$insert } from "solid-js/web";
var _tmpl$ = /*#__PURE__*/_$template(`<div class=counter-xml><section><header><h2>XML Counter</h2></header><main><article><p>You have clicked the button:</p><button><span>Click me</span><strong> → <!> times</strong></button></article></main><footer><small>Rendered using <code>xml</code> template`);
import { render } from "solid-js/web";
import { createSignal } from "solid-js";
export function CounterJSX() {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count => count + 1);
  return (() => {
    var _el$ = _tmpl$(),
      _el$2 = _el$.firstChild,
      _el$3 = _el$2.firstChild,
      _el$4 = _el$3.nextSibling,
      _el$5 = _el$4.firstChild,
      _el$6 = _el$5.firstChild,
      _el$7 = _el$6.nextSibling,
      _el$8 = _el$7.firstChild,
      _el$9 = _el$8.nextSibling,
      _el$0 = _el$9.firstChild,
      _el$10 = _el$0.nextSibling,
      _el$1 = _el$10.nextSibling;
    _el$7.$$click = () => setCount(v => v + 1);
    _$insert(_el$9, count, _el$10);
    return _el$;
  })();
}
