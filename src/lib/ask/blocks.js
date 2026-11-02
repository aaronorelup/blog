// The text RAG Goobie is given, built once a build: a doc's block (<doc> with every section marked [n.s], its notes
// page inside it as [n.Ns]), the catalog (one line a post) and fragment(), the body of a JSON string without its
// quotes, which is how /ask/*.txt hold them so the Worker sends their bytes without parsing them (docs/ASK.md).
import { CATALOG_CAP, est } from './caps.js';
import { catalogHeader, CLAUDE_MARK, CUT, gapLine, LIVE_LINE, LIVE_NOTE } from './words.js';

export const fragment = (s) => JSON.stringify(s).slice(1, -1);
const attr = (s) => String(s).replace(/"/g, '&quot;');
export const mark = (n, s) => `${n}.${s}`;

// One section: "[45.2] Its heading (Claude's own account)" and its text.
export function partText(doc, p) {
  const name = p.heading || (p.anchor === 'short' ? 'The short version' : '(opening)');
  const head = `[${mark(doc.n, p.s)}] ${name}${p.by === 'Claude' ? CLAUDE_MARK : ''}`;
  return p.text ? `${head}\n${p.text}` : head;
}

// A notes page's wrapper inside its post's doc: the lines before its first section and after its last.
export const notesOpen = (notes) => `<notes title="${attr(notes.title)}" url="${notes.url}" by="${notes.by}">`;
export const NOTES_CLOSE = '</notes>';

// doc: { n, url, title, topic, by, live, cut?, gap?: { at, from, to }, notes, parts } (corpus.js).
export function docBlock(doc) {
  const out = [`<doc n="${doc.n}" url="${doc.url}" title="${attr(doc.title)}" topic="${doc.topic}" by="${doc.by}"`
    + `${doc.live ? ` live="${LIVE_NOTE}"` : ''}${doc.cut ? ` cut="${CUT[doc.cut]}"` : ''}>`];
  let inNotes = false;
  doc.parts.forEach((p, i) => {
    if (doc.gap?.at === i) out.push(gapLine(doc.gap.from, doc.gap.to));
    if (p.kind === 'notes' && !inNotes) {
      inNotes = true;
      out.push(notesOpen(doc.notes));
    }
    out.push(partText(doc, p));
  });
  if (inNotes) out.push(NOTES_CLOSE);
  out.push('</doc>');
  return out.join('\n\n');
}

export const documents = (blocks) => `<documents>\n${blocks.join('\n\n')}\n</documents>`;

// The catalog: the header line (counts by topic), then "[n] slug | topic | title | takeaway" in AO order, " | by
// Claude" on Claude's. A live notebook's line holds nothing its fleet writes but its topic. Over CATALOG_CAP the
// oldest lines lose their takeaway first.
export function catalogText(docs, counts) {
  const lines = docs.map((d) => (d.live ? [`[${d.n}] ${d.slug} | ${d.topic} | ${LIVE_LINE}`]
    : [`[${d.n}] ${d.slug} | ${d.topic} | ${d.title}`, d.takeaway ? ` | ${d.takeaway}` : '', d.by === 'Claude' ? ' | by Claude' : '']));
  const text = () => `<catalog>\n${catalogHeader(counts)}\n${lines.map((l) => l.join('')).join('\n')}\n</catalog>`;
  let chars = text().length;
  for (let i = 0; i < lines.length && est(chars) > CATALOG_CAP; i++) {
    chars -= lines[i][1]?.length ?? 0;
    if (lines[i].length > 1) lines[i][1] = '';
  }
  return text();
}
