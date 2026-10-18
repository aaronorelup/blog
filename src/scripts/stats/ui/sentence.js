// Answers are sentences built from parts, so a number can roll to its new value when the range
// changes, a hard word can carry its definition, and a kind word can light its pile, all without
// any part of the server's data ever going in as HTML.
//
//   'plain text'
//   {b:'bold text'}
//   {num, key, fmt?, approx?, prov?, cls?, label?}   a number; same key as last time → it tweens
//   {term:'page', label?:'pages'}                    a defined word (ui/term.js)
//   {kind:'person', label:'People'}                  a kind word with glyph and brushing
//   {link:'#/read', label:'What they read'}           a link (hash links are routed)
import { tweenNumber } from '../core/motion.js';
import { num as fmtNum, approx as fmtApprox } from '../core/fmt.js';
import { term, kindWord } from './term.js';
import { bindPop } from './pop.js';

const memory = new WeakMap();   // el -> Map(key -> last value)
const memoryById = new Map();   // id -> Map(key -> last value), survives the element being replaced

/** @param {HTMLElement} el @param {Array} parts */
export function render(el, parts, { id } = {}) {
  if (!el) return;
  const prev = (id ? memoryById.get(id) : memory.get(el)) || new Map();
  const next = new Map();
  const frag = document.createDocumentFragment();
  const tweens = [];
  for (const part of parts || []) {
    if (part == null || part === false) continue;
    if (typeof part === 'string' || typeof part === 'number') { frag.append(String(part)); continue; }
    if ('b' in part) {
      const s = document.createElement('strong');
      s.textContent = part.b;
      frag.append(s);
      continue;
    }
    if ('num' in part) {
      const f = part.fmt || (part.approx ? fmtApprox : fmtNum);
      const node = document.createElement(part.prov ? 'button' : 'span');
      node.className = 'st-num' + (part.prov ? ' st-prov' : '') + (part.cls ? ' ' + part.cls : '');
      if (part.prov) {
        node.type = 'button';
        bindPop(node, part.prov, { label: part.label || 'Where this number comes from' });
      }
      const value = Number(part.num) || 0;
      if (part.key != null) {
        next.set(part.key, value);
        if (prev.has(part.key) && prev.get(part.key) !== value) {
          node.textContent = f(prev.get(part.key));
          tweens.push(() => tweenNumber(node, value, { from: prev.get(part.key), fmt: f }));
        } else node.textContent = f(value);
      } else node.textContent = f(value);
      if (part.label && !part.prov) node.setAttribute('aria-label', part.label);
      frag.append(node);
      continue;
    }
    if ('term' in part) { frag.append(term(part.term, part.label)); continue; }
    if ('kind' in part) { frag.append(kindWord(part.kind, part.label)); continue; }
    if ('link' in part) {
      const a = document.createElement('a');
      a.href = part.link;
      a.className = 'st-link';
      a.textContent = part.label;
      frag.append(a);
      continue;
    }
  }
  el.replaceChildren(frag);
  if (id) memoryById.set(id, next); else memory.set(el, next);
  for (const t of tweens) t();
}
