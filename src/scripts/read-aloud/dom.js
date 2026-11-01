// A post's read blocks as the reader sees them: each [data-r] element's display text, made with the build's own
// rules (src/lib/text/rules.js), and the way back from a display offset to the text node under it, so a word can be
// marked with a Range or found under a click. Read by index.js.
import { nested, skipped } from '../../lib/text/rules.js';

const SPACE = /\s/;
const attrOf = (el) => (name) => el.getAttribute(name);

// One block: el, its display text (whitespace collapsed, trimmed, as the build makes it), nodes [[textNode, rawStart]]
// and at[i], the raw offset of display character i in the nodes' text run together.
function blockOf(el) {
  const nodes = [];
  let raw = '';
  (function walk(n) {
    for (const c of n.childNodes) {
      if (c.nodeType === Node.TEXT_NODE) { nodes.push([c, raw.length]); raw += c.data; }
      else if (c.nodeType === Node.ELEMENT_NODE && !nested(c.localName) && !skipped(c.localName, attrOf(c))) walk(c);
    }
  })(el);
  let text = '';
  const at = [];
  let gap = -1;
  for (let i = 0; i < raw.length; i++) {
    if (SPACE.test(raw[i])) { if (gap < 0) gap = i; continue; }
    if (gap >= 0 && text) { text += ' '; at.push(gap); }
    gap = -1;
    text += raw[i];
    at.push(i);
  }
  return { el, text, nodes, at };
}

// Every block of root, by its data-r ('t', 's', '0', ...), in reading order.
export const blocksOf = (root) => new Map([...root.querySelectorAll('[data-r]')]
  .map((el) => [el.dataset.r, blockOf(el)]));

// The text node and offset of raw offset `raw` in block b.
function point(b, raw) {
  let lo = 0, hi = b.nodes.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (b.nodes[mid][1] <= raw) lo = mid; else hi = mid - 1;
  }
  const [node, start] = b.nodes[lo];
  return [node, Math.min(raw - start, node.data.length)];
}

// A Range over display characters c0..c1 of block b.
export function rangeOf(b, c0, c1) {
  const range = document.createRange();
  range.setStart(...point(b, b.at[c0]));
  range.setEnd(...point(b, b.at[c1 - 1] + 1));
  return range;
}

// The word at or after display offset c of block b: [c0, c1], or null past its last word.
export function wordAt(b, c) {
  const re = /\S+/g;
  for (let m; (m = re.exec(b.text));) if (m.index + m[0].length > c) return [m.index, m.index + m[0].length];
  return null;
}

// The block and display offset under a point on screen, or null when it isn't the text of a read block.
export function hit(blocks, x, y) {
  const pos = document.caretPositionFromPoint?.(x, y);
  const caret = pos ? [pos.offsetNode, pos.offset] : (() => {
    const r = document.caretRangeFromPoint?.(x, y);
    return r && [r.startContainer, r.startOffset];
  })();
  if (!caret || caret[0].nodeType !== Node.TEXT_NODE) return null;
  const el = caret[0].parentElement.closest('[data-r]');
  const b = el && blocks.get(el.dataset.r);
  const n = b?.nodes.find(([node]) => node === caret[0]);
  if (!n) return null;
  const raw = n[1] + caret[1];
  let c = b.at.findIndex((i) => i >= raw);
  if (c < 0) c = b.text.length - 1;
  return { r: el.dataset.r, c };
}
