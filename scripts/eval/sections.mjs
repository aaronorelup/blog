// The text of every section RAG Goobie was given, read back from the build's /ask/ files: { mark: { slug, kind,
// anchor, heading, text } } and a lookup by (slug, kind, anchor). The judge's reference and the report's checks.
import fs from 'node:fs';

const DIST = new URL('../../dist/ask/', import.meta.url);
const LINE = /^\[(\d+)\.(N?\d+)\] (.*)$/;

export function sectionsOf() {
  const m = JSON.parse(fs.readFileSync(new URL('manifest.json', DIST), 'utf8'));
  const out = new Map();
  for (const [n, d] of Object.entries(m.docs)) {
    const text = JSON.parse(`"${fs.readFileSync(new URL(d.file, DIST), 'utf8')}"`);
    const meta = new Map(d.sections.map(([s, kind, anchor, heading]) => [s, { kind, anchor, heading }]));
    let cur = null;
    for (const line of text.split('\n')) {
      const x = LINE.exec(line);
      if (x && x[1] === n && meta.has(x[2])) {
        cur = { mark: `${n}.${x[2]}`, slug: d.slug, ...meta.get(x[2]), lines: [] };
        out.set(cur.mark, cur);
      } else if (/^<\/?(notes|doc)\b/.test(line) || /^\(Sections .* are on its page\.\)$/.test(line)) cur = null;
      else if (cur) cur.lines.push(line);
    }
  }
  for (const s of out.values()) s.text = s.lines.join('\n').trim();
  const at = new Map([...out.values()].map((s) => [`${s.slug}|${s.kind}|${s.anchor}`, s]));
  return { manifest: m, byMark: out, find: (slug, kind, anchor) => at.get(`${slug}|${kind}|${anchor}`) };
}
