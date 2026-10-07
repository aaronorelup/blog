// Small DOM helpers shared by the modes.

export function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) e.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return e;
}

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// A token shown as code, with its leading space made visible as a faint dot.
export function tokHTML(t) {
  const s = String(t).replace(/\n/g, '⏎');
  return `<span class="tk">${esc(s)}</span>`;
}

// Radio group of buttons with roving tabindex and arrow keys.
// items: [{value, label, title?}], onChange(value)
export function radios({ items, value, onChange, cls = 'seg', label, render }) {
  const box = h('div', { class: cls, role: 'radiogroup', 'aria-label': label });
  const btns = items.map((it) => {
    const b = h('button', { type: 'button', role: 'radio', title: it.title, 'aria-label': it.aria });
    if (render) render(b, it); else b.textContent = it.label;
    b.addEventListener('click', () => { set(it.value); onChange(it.value); });
    box.append(b);
    return b;
  });
  box.addEventListener('keydown', (e) => {
    const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    const i = items.findIndex((it) => it.value === box._value);
    const j = (i + dir + items.length) % items.length;
    set(items[j].value); onChange(items[j].value); btns[j].focus();
  });
  function set(v) {
    box._value = v;
    items.forEach((it, i) => {
      const on = it.value === v;
      btns[i].setAttribute('aria-checked', on ? 'true' : 'false');
      btns[i].tabIndex = on ? 0 : -1;
    });
    if (!items.some((it) => it.value === v) && btns[0]) btns[0].tabIndex = 0;
  }
  set(value);
  box.set = set;
  return box;
}

export function switchEl({ label, desc, checked, onChange, swatch }) {
  const input = h('input', { type: 'checkbox', role: 'switch' });
  input.checked = !!checked;
  input.addEventListener('change', () => onChange(input.checked));
  const lab = h('label', { class: 'switch' }, input,
    h('span', {}, h('span', { class: 'sw-t' }, swatch ? h('span', { class: 'sw-sw', style: { background: swatch } }) : null, label), desc ? h('span', { class: 'sw-d' }, desc) : null));
  lab.input = input;
  return lab;
}

// Bring `el` into view by scrolling `container` only. Never scrollIntoView: inside the post's
// iframe that also scrolls the blog page around the embed. Like block:'nearest', but it never
// pushes the element's top out of view to show its bottom. When the container doesn't scroll
// (phones, where the page itself scrolls), this document is scrolled instead, below whatever
// is stuck to the top of it (the header and the grid).
export function revealIn(container, el, { smooth = false, pad = 8 } = {}) {
  if (!container || !el || !el.isConnected) return;
  const oy = getComputedStyle(container).overflowY;
  const scroller = oy === 'auto' || oy === 'scroll' ? container : document.scrollingElement;
  if (!scroller) return;
  let top, bottom;
  if (scroller === container) {
    const c = container.getBoundingClientRect();
    top = c.top; bottom = c.bottom;
  } else {
    top = 0; bottom = innerHeight;
    for (const s of document.querySelectorAll('.top, .stage')) {
      if (getComputedStyle(s).position === 'sticky') top = Math.max(top, s.getBoundingClientRect().bottom);
    }
  }
  const r = el.getBoundingClientRect();
  // client px -> this scroller's px (the app is CSS-zoomed on big screens)
  const k = scroller === container && container.offsetHeight ? container.getBoundingClientRect().height / container.offsetHeight : 1;
  let d = 0;
  if (r.bottom > bottom - pad) d = Math.min(r.bottom - bottom + pad, r.top - top - pad);
  else if (r.top < top + pad) d = r.top - top - pad;
  if (Math.abs(d) < 1) return;
  scroller.scrollTo({ top: scroller.scrollTop + d / (k || 1), behavior: smooth ? 'smooth' : 'auto' });
}

export const fmt = (n) => Number(n).toLocaleString('en-US');
export const pct = (x) => (x >= 0.995 ? '100%' : x < 0.005 ? (x > 0 ? '<1%' : '0%') : Math.round(x * 100) + '%');
