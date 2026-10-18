// A tiny element builder for the machines chapter. Every string the server sent (bot names,
// program labels, door paths) goes in as a text node, never as HTML, so a crafted name can only
// ever print as itself.

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
  }
  append(el, kids);
  return el;
}

export function append(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false || k === '') continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
  return el;
}

// Sentence parts: plain strings, {b:'bold'}, {mono:'/path'}, {q:'quiet'} or nodes.
export function prose(cls, parts) {
  const p = h('p', { class: cls });
  for (const part of [parts].flat(Infinity)) {
    if (part == null || part === false || part === '') continue;
    if (typeof part === 'string' || typeof part === 'number') p.append(String(part));
    else if (part instanceof Node) p.append(part);
    else if ('b' in part) p.append(h('strong', null, part.b));
    else if ('mono' in part) p.append(h('code', { class: 'st-mach-mono' }, part.mono));
    else if ('q' in part) p.append(h('span', { class: 'st-mach-quietword' }, part.q));
  }
  return p;
}

export const clear = (el) => { while (el.firstChild) el.firstChild.remove(); return el; };

// WAAPI, but nothing at all under reduced motion; resolves when done either way.
export function animate(el, frames, opts, reduced) {
  if (reduced || !el || !el.animate) return Promise.resolve();
  try { return el.animate(frames, { fill: 'none', ...opts }).finished.catch(() => {}); } catch (e) { return Promise.resolve(); }
}

// A path with break chances after each slash and before each dot or dash, so a long door like
// /wp-admin/setup-config.php wraps between its parts instead of in the middle of a word.
export function pathNode(path) {
  const frag = document.createDocumentFragment();
  String(path).split(/(?<=\/)|(?=[.-])/).filter(Boolean).forEach((bit, i) => {
    if (i) frag.append(document.createElement('wbr'));
    frag.append(bit);
  });
  return frag;
}
