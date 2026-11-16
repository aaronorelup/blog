// Small DOM helpers shared by the entry, the scene and the sections: queries, the page's data block, the
// beat switch that lights a section's words, and the live region. Words are always read from the HTML.
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// The one JSON block the page carries: the structure of the five stacks (data/view.js writes it).
export function readData() {
  const node = document.getElementById('ail-data');
  try { return JSON.parse(node.textContent); } catch { return null; }
}

// Light the blocks of `root` whose data-beat lists `name` (data-beat="b c"), and hide the others.
export function setBeat(root, name) {
  if (root.dataset.beatNow === name) return false;
  root.dataset.beatNow = name;
  for (const el of $$('[data-beat]', root)) el.classList.toggle('is-on', el.dataset.beat.split(' ').includes(name));
  return true;
}

export const toggle = (el, on) => { if (el && el.classList.contains('is-on') !== on) el.classList.toggle('is-on', on); };

// Scrubbed opacity for a block that follows the scroll rather than a class.
export function fade(el, opacity, dy = 0) {
  el.style.opacity = opacity.toFixed(3);
  el.style.visibility = opacity < 0.01 ? 'hidden' : 'visible';
  if (dy || el.style.transform) el.style.transform = dy ? `translate3d(0,${dy.toFixed(1)}px,0)` : '';
}

// One sentence to the polite live region, built from data by the caller (SPEC 7.4).
export function announce(text) {
  const live = $('.ail-live');
  if (live && live.textContent !== text) live.textContent = text;
}

// Roving focus for a group of buttons: arrows move, Home and End jump (SPEC 4.7). Returns the unbind function.
export function rove(group, selector = 'button, summary') {
  const onKey = (e) => {
    const items = $$(selector, group).filter((n) => n.offsetParent !== null);
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : step ? (i + step + items.length) % items.length : -1;
    if (next < 0) return;
    e.preventDefault();
    items[next].focus();
  };
  group.addEventListener('keydown', onKey);
  return () => group.removeEventListener('keydown', onKey);
}
