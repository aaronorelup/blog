// What Astro built, as the 3D page first finds it: every attribute in <main>, read once, just before the first scene
// is built (the stage lit by then and the controls the sweep made faint are cleared by stop3D in index.js anyway).
// restore() puts back each attribute a section changed and did not undo (a floor made a tab stop, a pressed button,
// a state word), so the text version that follows the 3D page is the one a fresh load gives. Three are left to the
// text version's own controls: a fact's proof card, the stamp's notes while printing, and pictures loaded for print.
import { $$ } from './dom.js';

const OWN = { 'aria-expanded': '.ail-fact', open: '.ail-disc', name: '.ail-disc', 'data-name': '.ail-disc', loading: 'img' };
let built = null;

export function remember() {
  if (!built) built = new Map($$('#ail-main, #ail-main *').map((el) => [el, [...el.attributes].map((a) => [a.name, a.value])]));
}

// a canvas that takes the place of a used one stands where it stood, with the attributes it had
export function replaced(old, fresh) {
  if (built) built.set(fresh, built.get(old) || []);
}

export function restore() {
  for (const [el, was] of built || []) {
    const now = el.attributes;
    if (!el.isConnected || (now.length === was.length && was.every(([n, v], i) => now[i].name === n && now[i].value === v))) continue;
    const own = (name) => OWN[name] && el.matches(OWN[name]);
    const keep = new Map(was);
    for (const { name } of [...now]) if (!keep.has(name) && !own(name)) el.removeAttribute(name);
    for (const [name, value] of was) if (el.getAttribute(name) !== value && !own(name)) el.setAttribute(name, value);
  }
}
