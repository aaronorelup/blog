// A doc's sections numbered as RAG Goobie cites them, and the cuts that keep it under its cap. s '0' is the short
// version (anchor 'short'), then the opening (anchor '') when it has text, then each h2; a notes page's are 'N0' (its
// summary and opening), 'N1'... Cuts fall between sections and keep every mark's number, so cites still resolve:
// a doc over DOC_CAP keeps its top; the live notebooks over LIVE_CAP keep their top half and their newest end.
import { DOC_CAP, est, LIVE_CAP } from './caps.js';
import { docBlock, mark, partText } from './blocks.js';

export function numbered(doc) {
  const parts = [doc.short, ...doc.sections].map((x, i) => ({ s: String(i), kind: 'post', by: doc.by, ...pick(x) }));
  if (doc.notes) {
    const { summary, sections, by } = doc.notes;
    const [first, ...rest] = sections[0]?.anchor === '' ? sections : [{ text: '' }, ...sections];
    const top = { anchor: '', heading: '', text: [summary, first.text].filter(Boolean).join('\n\n') };
    parts.push(...[top, ...rest].map((x, i) => ({ s: `N${i}`, kind: 'notes', by, ...pick(x) })));
  }
  return { ...doc, parts };
}
const pick = ({ anchor, heading, text }) => ({ anchor, heading, text });

// The doc as given: under its cap whole, or cut. tokens is its block's est.
export function sized(doc, liveCap = LIVE_CAP, docCap = DOC_CAP) {
  const whole = { ...doc, tokens: est(docBlock(doc).length) };
  if (doc.live ? whole.tokens <= liveCap : whole.tokens <= docCap) return whole;
  return doc.live ? ends(doc, liveCap) : top(doc, docCap);
}

const sizes = (doc) => doc.parts.map((p) => partText(doc, p).length + 2);   // a part and its "\n\n"

function top(doc, cap) {
  let room = cap * 3.5 - docBlock({ ...doc, parts: [], cut: 'top' }).length;
  const kept = [];
  for (const [i, size] of sizes(doc).entries()) {
    if (size > room) break;
    kept.push(doc.parts[i]);
    room -= size;
  }
  const out = { ...doc, parts: kept, cut: 'top' };
  return { ...out, tokens: est(docBlock(out).length) };
}

// The short version and the top while under half the cap, then the newest sections from the bottom, one line between.
function ends(doc, cap) {
  const size = sizes(doc);
  const gapRoom = 60;   // the gap line
  let room = cap * 3.5 - docBlock({ ...doc, parts: [], cut: 'ends' }).length - gapRoom;
  let head = 0;
  while (head < size.length && (head === 0 || size[head] <= room - cap * 1.75) && size[head] <= room) room -= size[head++];
  let tail = size.length;
  while (tail > head && size[tail - 1] <= room) room -= size[--tail];
  const parts = [...doc.parts.slice(0, head), ...doc.parts.slice(tail)];
  const gap = tail > head ? { at: head, from: mark(doc.n, doc.parts[head].s), to: mark(doc.n, doc.parts[tail - 1].s) } : undefined;
  const out = { ...doc, parts, cut: gap ? 'ends' : undefined, gap };
  return { ...out, tokens: est(docBlock(out).length) };
}
