// A 100% bar split into parts (computer / phone / tablet, the bot purposes), with each part's
// name and share under its own segment. A segment too narrow for its label (measured in the
// label's own font, not a fixed 40px, which cut "SEO tools" to "SEO t…") has its label moved into
// a line after the others instead of being squeezed.
import { pct, num } from '../core/fmt.js';

const OPACITY = [1, 0.72, 0.52, 0.38, 0.28, 0.22];

// Width of a label in .st-split-label b (600 12px Karla), measured once per text.
let measureCtx = null;
const widths = new Map();
function labelWidth(text) {
  if (widths.has(text)) return widths.get(text);
  if (!measureCtx) {
    try { measureCtx = document.createElement('canvas').getContext('2d'); } catch (e) { measureCtx = null; }
  }
  let w = text.length * 6.6; // a fallback near Karla's average at 12px
  if (measureCtx) { measureCtx.font = '600 12px Karla, system-ui, sans-serif'; w = measureCtx.measureText(text).width; }
  widths.set(text, w);
  return w;
}

/**
 * @param {HTMLElement} el
 * @param {{parts:Array<{key:string,label:string,value:number,color?:string,opacity?:number}>, unit?:string, height?:number, other?:boolean, label?:string}} opts
 */
export function splitBar(el, opts) {
  let o = { height: 12, other: true, ...opts };
  const wrap = document.createElement('div');
  wrap.className = 'st-split';
  const bar = document.createElement('div');
  bar.className = 'st-split-bar';
  bar.setAttribute('aria-hidden', 'true');
  const labels = document.createElement('div');
  labels.className = 'st-split-labels';
  labels.setAttribute('aria-hidden', 'true');
  const rest = document.createElement('p');
  rest.className = 'st-split-rest';
  rest.setAttribute('aria-hidden', 'true');
  const sr = document.createElement('p');
  sr.className = 'st-sr';
  wrap.append(bar, labels, rest, sr);
  el.replaceChildren(wrap);

  let parts = [];
  function prepare() {
    let p = (o.parts || []).filter((x) => x.value > 0);
    // more than five parts: keep the four largest and fold the rest into "Other"
    if (o.other && p.length > 5) {
      const sorted = [...p].sort((a, b) => b.value - a.value);
      const keep = sorted.slice(0, 4);
      const restV = sorted.slice(4).reduce((s, x) => s + x.value, 0);
      p = [...keep, { key: 'other', label: 'Other', value: restV }];
    }
    parts = p;
  }

  function layout() {
    const total = parts.reduce((s, x) => s + x.value, 0);
    const W = bar.clientWidth || el.clientWidth || 300;
    const gaps = Math.max(0, parts.length - 1) * 2;
    bar.style.height = o.height + 'px';
    bar.replaceChildren();
    labels.replaceChildren();
    const small = [];
    parts.forEach((p, i) => {
      const share = total ? p.value / total : 0;
      const seg = document.createElement('span');
      seg.className = 'st-split-seg';
      const isOther = p.key === 'other';
      seg.style.background = p.color || (isOther ? 'var(--pc-quiet)' : 'var(--st-person)');
      seg.style.opacity = String(p.opacity ?? (isOther ? 0.5 : OPACITY[Math.min(i, OPACITY.length - 1)]));
      seg.style.flex = `${share} 1 0`;
      bar.append(seg);
      const px = share * (W - gaps);
      const lab = document.createElement('span');
      lab.className = 'st-split-label';
      lab.style.flex = `${share} 1 0`;
      if (px >= Math.max(40, labelWidth(String(p.label)) + 8)) {
        const n = document.createElement('b');
        n.textContent = p.label;
        const s = document.createElement('span');
        s.textContent = pct(share);
        lab.append(n, s);
      } else small.push(`${p.label} ${pct(share)}`);
      labels.append(lab);
    });
    rest.textContent = small.length ? small.join(' · ') : '';
    rest.hidden = !small.length;
    sr.textContent = (o.label ? o.label + ': ' : '') + parts.map((p) => `${p.label} ${num(p.value)}${o.unit ? ' ' + o.unit : ''}, ${pct(total ? p.value / total : 0).replace('%', ' percent')}`).join('; ');
  }

  prepare();
  layout();
  let ro = null;
  if (typeof ResizeObserver === 'function') {
    let lastW = 0;
    ro = new ResizeObserver(() => { const w = bar.clientWidth; if (w && w !== lastW) { lastW = w; layout(); } });
    ro.observe(bar);
  }
  return {
    update(next) { o = { ...o, ...next }; prepare(); layout(); },
    destroy() { ro?.disconnect(); el.replaceChildren(); },
  };
}
