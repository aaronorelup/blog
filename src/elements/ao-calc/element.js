// <ao-calc>: a calculator the reader can turn, for a post whose numbers depend on choices (how many minutes, how many
// takes per keeper, which size). Children: a <ul> of inputs (sliders, option buttons), an <ol> of results (formulas
// over the inputs: + - * / ^, parentheses, min max round ceil floor abs), an optional <figcaption>. Without JS the
// labels stay as two plain lists. The data-* attributes: docs/COMPONENTS.md.
import { h } from '../_lib/dom.js';

const calcFns = { min: Math.min, max: Math.max, round: Math.round, ceil: Math.ceil, floor: Math.floor, abs: Math.abs };
function calcCompile(src) {
  const toks = String(src).match(/\d+\.?\d*|\.\d+|[A-Za-z_]\w*|[-+*/^(),]/g) || [];
  let i = 0;
  const peek = () => toks[i];
  const eat = (t) => { if (toks[i] !== t) throw new Error('ao-calc: expected ' + t + ' in ' + src); i++; };
  const primary = () => {
    const t = toks[i++];
    if (t === undefined) throw new Error('ao-calc: unexpected end of ' + src);
    if (t === '(') { const e = expr(); eat(')'); return e; }
    if (t === '-') { const e = power(); return (v) => -e(v); }
    if (/^[\d.]/.test(t)) { const n = parseFloat(t); return () => n; }
    if (calcFns[t] && peek() === '(') {
      eat('(');
      const args = [expr()];
      while (peek() === ',') { i++; args.push(expr()); }
      eat(')');
      return (v) => calcFns[t](...args.map((a) => a(v)));
    }
    if (/^[A-Za-z_]/.test(t)) return (v) => (t in v ? v[t] : NaN);
    throw new Error('ao-calc: unexpected ' + t + ' in ' + src);
  };
  const power = () => {
    const b = primary();
    if (peek() !== '^') return b;
    i++;
    const e = power();
    return (v) => Math.pow(b(v), e(v));
  };
  const term = () => {
    let a = power();
    while (peek() === '*' || peek() === '/') {
      const op = toks[i++], l = a, r = power();
      a = op === '*' ? (v) => l(v) * r(v) : (v) => l(v) / r(v);
    }
    return a;
  };
  const expr = () => {
    let a = term();
    while (peek() === '+' || peek() === '-') {
      const op = toks[i++], l = a, r = term();
      a = op === '+' ? (v) => l(v) + r(v) : (v) => l(v) - r(v);
    }
    return a;
  };
  const f = expr();
  if (i < toks.length) throw new Error('ao-calc: unexpected ' + toks[i] + ' in ' + src);
  return f;
}
const calcFmt = (n, digits) => !Number.isFinite(n) ? '–'
  : n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
class AoCalc extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const inputs = [...this.querySelectorAll(':scope > ul > li[data-var]')];
    const outs = [...this.querySelectorAll(':scope > ol > li[data-f]')];
    if (!inputs.length || !outs.length) return;
    this._ready = true;
    const vars = {};
    const box = h('div', { class: 'ao-calc-box' });
    const controls = h('div', { class: 'ao-calc-inputs' });
    const results = h('div', { class: 'ao-calc-results', 'aria-live': 'polite' });
    const update = [];
    const run = () => update.forEach((u) => u());

    inputs.forEach((li, n) => {
      const name = li.dataset.var;
      const label = li.textContent.trim();
      const row = h('div', { class: 'ao-calc-input' });
      const id = 'aocalc-' + Math.random().toString(36).slice(2, 8) + n;
      if (li.dataset.options) {
        const opts = li.dataset.options.split('|').map((o) => {
          const k = o.lastIndexOf(':');
          return { label: o.slice(0, k).trim(), value: parseFloat(o.slice(k + 1)) };
        });
        const cap = h('span', { class: 'ao-calc-label', id, text: label });
        const group = h('div', { class: 'ao-calc-opts', role: 'group', 'aria-labelledby': id });
        const start = opts.find((o) => o.label === li.dataset.value) || opts[0];
        vars[name] = start.value;
        for (const o of opts) {
          const b = h('button', { type: 'button', text: o.label, 'aria-pressed': String(o === start), onclick: () => {
            vars[name] = o.value;
            for (const x of group.children) x.setAttribute('aria-pressed', String(x === b));
            run();
          } });
          group.append(b);
        }
        row.append(cap, group);
      } else {
        const min = parseFloat(li.dataset.min ?? 0), max = parseFloat(li.dataset.max ?? 100);
        const step = li.dataset.step || 'any';
        const unit = li.dataset.unit || '';
        const cap = h('label', { class: 'ao-calc-label', for: id, text: label });
        const val = h('output', { class: 'ao-calc-val' });
        const range = h('input', { type: 'range', id, min, max, step });
        range.value = li.dataset.value ?? min;
        const show = () => {
          vars[name] = parseFloat(range.value);
          val.textContent = range.value + (unit ? ' ' + unit : '');
        };
        show();
        range.addEventListener('input', () => { show(); run(); });
        row.append(cap, val, range);
      }
      controls.append(row);
    });

    for (const li of outs) {
      let f;
      try { f = calcCompile(li.dataset.f); } catch (e) { console.warn(e.message); f = () => NaN; }
      const digits = parseInt(li.dataset.digits ?? '0', 10);
      const prefix = li.dataset.prefix || '';
      const unit = li.dataset.unit || '';
      const num = h('span', { class: 'ao-calc-num' });
      results.append(h('div', { class: 'ao-calc-out' }, h('span', { class: 'ao-calc-label', text: li.textContent.trim() }), num));
      update.push(() => {
        const v = f(vars);
        num.textContent = prefix + calcFmt(v, digits) + (unit ? ' ' + unit : '');
      });
    }
    run();
    box.append(controls, results);
    this.querySelector(':scope > ul').before(box);
    this.classList.add('ao-calc-ready');
  }
}

customElements.define('ao-calc', AoCalc);
