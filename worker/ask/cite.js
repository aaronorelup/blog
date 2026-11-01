// RAG Goobie's marks, made readers' cites: [45.2] (a section), [45.N3] (a notes section), [45] (a post known from
// its catalog line), in runs like [45.2, 12.1], [45.2; 12.1] or [45.2][12.1]. Each mark resolves to a listed
// section or is dropped with the space before it; the distinct ones are numbered [1], [2] in order of first use, and
// each em dash becomes ", ". cite() does a whole text; citer() the same as the text streams in, holding back only
// what the next delta could still change. The cites keep the shape the page has always read (T2.2c's cited()).
const MARK = String.raw`\d+(?:\.N?\d+)?`;
const RUN = new RegExp(String.raw`(\s*)((?:\[${MARK}(?:\s*[,;]\s*${MARK})*\])+)`, 'g');
const GROUP = String.raw`\[${MARK}(?:\s*[,;]\s*${MARK})*\]`;
// What a later delta could still change: trailing space and dashes, a run of marks, an unclosed one (80 chars at most).
const HOLD = new RegExp(String.raw`(?:\s|—|${GROUP})*(?:\[[\d.N,;\s]{0,79})?$`);

// resolve(mark) -> { slug, kind, anchor, heading, title } or null.
function transform(text, resolve, seen) {
  const cites = [];
  const out = text.replace(RUN, (_, space, run) => {
    const ks = run.match(new RegExp(MARK, 'g')).map((m) => {
      const c = resolve(m);
      if (!c) return null;
      const key = `${c.slug}|${c.kind}|${c.anchor}`;
      if (!seen.has(key)) {
        seen.set(key, seen.size + 1);
        cites.push({ n: seen.size, ...c });
      }
      return seen.get(key);
    }).filter(Boolean);
    return ks.length ? space + ks.map((k) => `[${k}]`).join('') : '';
  }).replace(/\s*—\s*/g, ', ');
  return { text: out, cites };
}

export function cite(text, resolve) {
  const { text: answer, cites } = transform(text, resolve, new Map());
  return { answer: answer.trim(), cites: cites.map(shape) };
}
const shape = ({ n, slug, kind, anchor, heading, title }) => ({ n, slug, kind, anchor, heading, title });

// push(delta) and end() each return { text, cites }: the cites new in this text, to go out before it. Joined, the
// texts are cite(whole).answer and the cites cite(whole).cites.
export function citer(resolve) {
  const seen = new Map();
  let pending = '';
  let started = false;
  const emit = (raw, last) => {
    let { text, cites } = transform(raw, resolve, seen);
    if (!started) text = text.trimStart();
    if (last) text = text.trimEnd();
    if (text) started = true;
    return { text, cites: cites.map(shape) };
  };
  return {
    push(delta) {
      pending += delta;
      const cut = pending.length - HOLD.exec(pending)[0].length;
      const ready = pending.slice(0, cut);
      pending = pending.slice(cut);
      return emit(ready, false);
    },
    end() {
      const rest = pending;
      pending = '';
      return emit(rest, true);
    },
  };
}
