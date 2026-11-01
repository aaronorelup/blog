// A post's read-aloud sections, for /read/<slug>.json, /read/index.json and the post page's data-read-hash: the title,
// the summary and the opening, then one per h2, any over 2,500 spoken characters split between blocks. A section is
// named by the hash of everything that shapes its audio, so an unchanged one is never voiced again; the post's hash
// names the recording of the whole. Block refs: 't' the title, 's' the summary, i the element stamped data-r="i".
import { EXTRACT_V, SPEAK_V, VOICE } from '../../data/voice.js';
import { sha256hex, short } from '../text/hash.js';
import { normalize } from '../text/rules.js';
import { spoken } from './speak.js';

const MAX = 2500;
const KEY = [EXTRACT_V, SPEAK_V, VOICE.id, VOICE.model, VOICE.format, JSON.stringify(VOICE.settings)].join('|');
const sizeOf = (blocks) => spoken(blocks).text.length;

// Which read blocks are h2s. text.headings lists every h2 and h3 in order (folded ones too), the read blocks every
// unfolded h2 to h4, so each heading block takes the depth of the next heading with its text (none: an h4).
function h2s({ read, headings }) {
  const out = new Set();
  let from = 0;
  read.blocks.forEach(([kind, text], i) => {
    const n = kind === 'h' ? headings.findIndex((h, at) => at >= from && h.text === text) : -1;
    if (n < 0) return;
    from = n + 1;
    if (headings[n].depth === 2) out.add(i);
  });
  return out;
}

// Greedy, at block boundaries: a block longer than MAX is a section of its own.
function split(blocks) {
  const parts = [[]];
  let n = 0;
  for (const b of blocks) {
    const len = sizeOf([b]) + 2;
    if (n && n + len > MAX) { parts.push([]); n = 0; }
    parts.at(-1).push(b);
    n += len;
  }
  return parts;
}

// text: the extraction, which a live notebook that failed to render doesn't have.
export function sectionsOf({ title, summary }, text) {
  const groups = [[['t', 'h', normalize(title)], ['s', 'p', normalize(summary)]]];
  const top = text ? h2s(text) : new Set();
  (text?.read.blocks ?? []).forEach(([kind, s], i) => {
    if (top.has(i)) groups.push([]);
    groups.at(-1).push([i, kind, s]);
  });
  return groups.flatMap(split).map((blocks) => ({
    hash: short(sha256hex(KEY + '|' + JSON.stringify(blocks.map(([, kind, s]) => [kind, s])))),
    chars: sizeOf(blocks),
    blocks,
  }));
}

export const postHash = (sections) => short(sha256hex(sections.map((s) => s.hash).join('|')));
