// SynthID-Text, small enough to watch, for AO-040 (claude-text-watermark): <ao-demo name="synthid" part="…">
// mounts one of five parts, tournament, certain, detect, edit or book (each its own file; the maths is model.js).
// The post calls the paper's g-values "round assignments" (1 = +, 0 = −) and its layers "rounds".
import { h } from '../../../_lib/dom.js';
import { partBook } from './book.js';
import { partCertain } from './certain.js';
import { partDetect } from './detect.js';
import { partEdit } from './edit.js';
import { partTournament } from './tournament.js';

const PARTS = { tournament: partTournament, certain: partCertain, detect: partDetect, edit: partEdit, book: partBook };

export function mount(host, part) {
  const fn = PARTS[part];
  if (!fn) return null;
  const root = h('div', { class: 'sid' });
  host.replaceChildren(root);
  return fn(root) || {};
}
