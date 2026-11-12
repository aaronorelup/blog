// The goobie-lab demo's shared pieces: the question picker, the window meter (how full the model's context is), the
// blog map (every post, shaded by how much of it the model saw), the stats line, the answer with its citations as
// links (numbered by post, as RAG Goobie's are) and the grade line. Read by context.js, rag.js and agent.js.
import { h } from '../../../_lib/dom.js';

export const fmt = (n) => Math.round(n).toLocaleString('en-US');
export const secs = (ms) => (ms < 10e3 ? `${(ms / 1e3).toFixed(1)}\u00a0s` : `${Math.round(ms / 1e3)}\u00a0s`);
export const usd = (x) => (x < 0.00005 ? 'under $0.0001' : x < 0.01 ? `$${x.toFixed(4)}` : `$${x.toFixed(3)}`);
// A share as a percentage; above 99% it keeps one decimal and stops at 99.9% unless it is all of it.
export const pct = (x) => (x < 0.001 ? `${(x * 100).toFixed(2)}%` : x < 0.1 ? `${(x * 100).toFixed(1)}%`
  : x >= 1 ? '100%' : x > 0.99 ? `${Math.min(99.9, Math.floor(x * 1000) / 10)}%` : `${Math.round(x * 100)}%`);
export const NAMES = { context: 'In-context', rag: 'Classic RAG', agent: 'Agentic search' };
export const est = (chars) => Math.ceil(chars / 3.5);

// What one recorded tool call let the model see of each post, in characters: grep's matching lines (each "slug
// [mark] line"), read's text. Adds to `into`, a Map(slug -> characters), and returns it.
const LINE = /^([a-z0-9-]+) \[\d+\.N?\d+\] (.*)$/;
export function seenBy(c, into) {
  if (c.name === 'grep') {
    for (const l of c.result.split('\n')) {
      const x = LINE.exec(l);
      if (x) into.set(x[1], (into.get(x[1]) ?? 0) + x[2].length);
    }
  }
  if (c.name === 'read' && c.args?.slug && !/^No post/.test(c.result)) into.set(c.args.slug, (into.get(c.args.slug) ?? 0) + c.result.length);
  return into;
}
// The posts a recorded list_posts call listed, one line each ("AO-014 2026-09-01 agents by Aaron slug ..."): their
// dates and titles, none of their text. Adds their slugs to `into`, a Set, and returns it.
const ROW = /^AO-\d+ \d{4}-\d{2}-\d{2} \S+ by \S+ ([a-z0-9-]+)/;
export function listedBy(c, into) {
  if (c.name === 'list_posts') for (const l of c.result.split('\n')) { const x = ROW.exec(l); if (x) into.add(x[1]); }
  return into;
}

// Buttons for the questions, one pressed. pick(i) is called on a press, and once for the first.
export function picker(runs, pick, label = 'Pick a question') {
  const row = h('div', { class: 'gl-qs', role: 'group', 'aria-label': label });
  const buttons = runs.map((r, i) => h('button', { type: 'button', class: 'gl-q', 'aria-pressed': String(i === 0),
    onclick: () => {
      buttons.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
      pick(i);
    } }, r.q));
  row.append(...buttons);
  return row;
}

// The model's window as a bar: used tokens of `window`, the cached share drawn darker.
export function meter(window) {
  const fill = h('span', { class: 'gl-fill' });
  const hit = h('span', { class: 'gl-cached' });
  const text = h('p', { class: 'gl-meter-text' });
  const bar = h('div', { class: 'gl-bar', role: 'img' }, fill, hit);
  const el = h('div', { class: 'gl-meter' }, h('p', { class: 'gl-label', text: 'How full the model\'s context window is' }), bar, text);
  return {
    el,
    set(used, cached = 0, note = '') {
      const w = Math.min(1, used / window);
      fill.style.width = `max(${w > 0 ? 2 : 0}px, ${w * 100}%)`;
      hit.style.width = `${Math.min(1, cached / window) * 100}%`;
      const words = `${fmt(used)} of ${fmt(window)} tokens, ${pct(used / window)}`;
      bar.setAttribute('aria-label', words);
      text.textContent = `${words}${cached ? `, ${pct(cached / Math.max(1, used))} of it from the cache` : ''}${note ? `. ${note}` : ''}`;
    },
  };
}

// Every post of the blog as a block sized by its length; shade(seen) shades each by the share of it the model saw.
// seen: Map(slug -> characters seen), or 'all'. note replaces the caption; listed (a Set of slugs) marks the posts the
// model saw only a list line of, and says so after the caption.
export function blogMap(blog) {
  const total = blog.posts.reduce((t, p) => t + p[6], 0);
  const cells = new Map();
  const grid = h('div', { class: 'gl-map', role: 'img' });
  for (const [n, slug, title, date, , , chars] of blog.posts) {
    const shade = h('i', { class: 'gl-seen' });
    const cell = h('span', { class: 'gl-post', title: `AO-${String(n).padStart(3, '0')}, ${date}: ${title}` }, shade);
    cell.style.flexGrow = String(chars / total * 1000);
    cells.set(slug, { cell, shade, chars });
    grid.append(cell);
  }
  const caption = h('p', { class: 'gl-map-text' });
  const el = h('div', { class: 'gl-mapbox' }, h('p', { class: 'gl-label', text: `What the model saw of the ${blog.posts.length} posts` }), grid, caption);
  return {
    el,
    shade(seen, { note, listed } = {}) {
      let chars = 0;
      let posts = 0;
      for (const [slug, c] of cells) {
        const s = seen === 'all' ? c.chars : Math.min(c.chars, seen.get(slug) ?? 0);
        c.shade.style.width = `${(s / c.chars) * 100}%`;
        c.cell.classList.toggle('is-seen', s > 0);
        c.cell.classList.toggle('is-listed', !!listed?.has(slug));
        chars += s;
        posts += s > 0 ? 1 : 0;
      }
      const words = (note ?? `${fmt(chars)} of ${fmt(total)} characters (${pct(chars / total)}), from ${posts} ${posts === 1 ? 'post' : 'posts'}`)
        + (listed?.size ? `. It also read the post list, a line for each of ${listed.size} ${listed.size === 1 ? 'post' : 'posts'}` : '');
      grid.setAttribute('aria-label', words);
      caption.textContent = words;
    },
  };
}

// The figures of a run as a definition list: [[term, value], ...].
export const stats = (rows) => h('dl', { class: 'gl-stats' }, rows.flatMap(([k, v]) => [h('dt', { text: k }), h('dd', { text: v })]));

const pagePath = (slug, kind) => `/ledger/${slug}/${kind === 'notes' ? 'notes/' : ''}`;
const where = (c) => {
  const w = c.anchor === 'short' ? 'the short version' : c.heading || 'the opening';
  return c.kind === 'notes' ? `${w}, in the full making-of` : w;
};
const inline = (text, link) => text.split(/(\*\*[^*]+\*\*|\[\d+\])/).filter(Boolean).map((part) => {
  if (/^\*\*[^*]+\*\*$/.test(part)) return h('b', { text: part.slice(2, -2) });
  return /^\[\d+\]$/.test(part) ? link(part) : part;
});

// The answer as text: paragraphs and "- " lists (a run of "- " lines is a list, the lines around it paragraphs), **bold**,
// and each [n] a link to its passage. A reader counts posts, so each [n] shows its post's place among those cited, in
// order of first mention (RAG Goobie's numbering).
const ITEM = /^\s*[-*] /;
export function answer({ text, cites }) {
  const byN = new Map(cites.map((c) => [`[${c.n}]`, c]));
  const posts = [];
  const link = (mark) => {
    const c = byN.get(mark);
    if (!c) return mark;
    if (!posts.includes(c.slug)) posts.push(c.slug);
    const n = posts.indexOf(c.slug) + 1;
    return h('a', { class: 'gl-cite', href: `${pagePath(c.slug, c.kind)}${c.anchor ? `#${c.anchor}` : ''}`,
      'aria-label': `Source ${n}: ${c.title}, ${where(c)}`, 'data-card-line': `Cited: ${where(c)}` }, `[${n}]`);
  };
  const el = h('div', { class: 'gl-answer' });
  for (const block of text.split(/\n{2,}/)) {
    const lines = block.split('\n').filter((l) => l.trim());
    for (let i = 0; i < lines.length;) {
      const list = ITEM.test(lines[i]);
      const run = [];
      while (i < lines.length && ITEM.test(lines[i]) === list) run.push(lines[i++]);
      el.append(list ? h('ul', {}, run.map((l) => h('li', {}, inline(l.replace(ITEM, ''), link))))
        : h('p', {}, inline(run.join(' '), link)));
    }
  }
  return el;
}

// The judge's grade, and in one line the other two methods on the same question.
export function grade(run) {
  const g = run.grade;
  const others = Object.entries(run.others).map(([m, o]) => `${NAMES[m]} ${o.must} of ${o.of} in ${secs(o.ms)}`);
  return h('div', { class: 'gl-grade' },
    h('p', {}, h('b', { text: `Got ${g.must} of the ${g.of} key facts` }), `, scored ${g.score} out of 10 by the same model in a separate grading pass that read the posts`),
    others.length ? h('p', { class: 'gl-others', text: `Same question, the other two ways: ${others.join(', ')}.` }) : null);
}

export const eyebrow = (method) => h('p', { class: 'gl-eyebrow' }, NAMES[method], h('span', { class: 'gl-rec', text: 'recorded run' }));
// The live notebook is left out of the recording and of every live run (corpus.js), so a count here is one under the
// ledger's: the foot says so for both.
export const foot = (blog) => h('p', { class: 'gl-foot', text: `Recorded on ${blog.recorded} against the ${blog.posts.length} posts `
  + 'listed then, all but the live notebook other agents write, which every live run leaves out too. The model\'s words '
  + 'are replayed from that run, not written in your browser.' });
