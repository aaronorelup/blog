// The one pass over a post's rendered HTML that every feature reads (ARCHITECTURE.md "The extraction"). It writes
// `text` into the remark frontmatter (pages: render(entry).remarkPluginFrontmatter.text), stamps data-r="i" on read
// block i, data-noread on inline code that isn't read, data-pagefind-ignore on every <ao-*>, and fails on an <ao-*>
// that isn't a post component (a live notebook only gets a warning). text.full is Ask's text (fullText, below). Runs
// after rehype-post-images and rehype-heading-ids. Options: `tags`, the post components; `v` is for Astro's cache.
import path from 'node:path';
import { isLive } from '../../src/data/exempt.js';
import { blockOf, countWords, nested, normalize, numberList, plainCode, skipped } from '../../src/lib/text/rules.js';

const attrOf = (el) => (name) => {
  const v = el.properties[name === 'class' ? 'className' : name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())];
  return v === undefined || v === null || v === false ? null : Array.isArray(v) ? v.join(' ') : String(v);
};
const elementsOf = (el) => el.children.filter((c) => c.type === 'element');
const numbers = (el) => (el.tagName === 'ul' || el.tagName === 'ol')
  && numberList(elementsOf(el).map((li) => normalize(ownText(li))));

// An element's own text: nested blocks, nested lists and skipped subtrees left out. Inline code that isn't read goes
// into `noread`, for the caller to stamp.
function ownText(el, noread = []) {
  let s = '';
  for (const c of el.children) {
    if (c.type === 'text') s += c.value;
    if (c.type !== 'element' || nested(c.tagName) || skipped(c.tagName, attrOf(c))) continue;
    if (c.tagName === 'code' && !plainCode(normalize(ownText(c)))) noread.push(c);
    else s += ownText(c, noread);
  }
  return s;
}

export default function rehypePostText({ tags }) {
  const known = new Set(tags);
  return (tree, file) => {
    const slug = path.basename(file.path, '.md');
    const blocks = [];
    const headings = [];
    const elements = new Set();
    const links = new Set();
    let words = 0;
    let section = { anchor: '', heading: '', parts: [], folded: false };   // the opening, before the first h2
    const sections = [section];
    const splits = new Map();   // the h2s that start a section, and their headings, for text.full

    const component = (el) => {
      const tag = el.tagName;
      if (!known.has(tag)) {
        const where = `${path.basename(path.dirname(file.path))}/${slug}.md`;
        if (!isLive(slug)) throw new Error(`${where}: <${tag}> is not a post component (a typo, or one that doesn't exist yet)`);
        console.warn(`[post-text] ${where}: <${tag}> is not a post component; left as written (live notebook)`);
        return;
      }
      el.properties.dataPagefindIgnore = '';
      elements.add(tag === 'ao-demo' ? `${tag}/${el.properties.name}` : tag);
    };

    const block = (el, kind, folded) => {
      const noread = [];
      const text = normalize(ownText(el, noread));
      for (const c of noread) c.properties.dataNoread = '';
      if (!text) return;
      if (el.tagName === 'h2') {
        sections.push(section = { anchor: el.properties.id, heading: text, parts: [], folded });
        splits.set(el, text);
      }
      else section.parts.push(text);
      if (/^h[23]$/.test(el.tagName)) headings.push({ depth: Number(el.tagName[1]), id: el.properties.id, text });
      if (folded) { section.folded = true; return; }
      el.properties.dataR = String(blocks.length);
      blocks.push([kind, text]);
      words += countWords(text);
    };

    // Reading skips <details>; search keeps its text, as folded. A skipped subtree is still walked for its
    // components and links.
    (function walk(node, skip, folded) {
      for (const el of elementsOf(node)) {
        const tag = el.tagName;
        if (tag.startsWith('ao-')) component(el);
        if (tag === 'a' && /^\/(?!\/)/.test(el.properties.href)) links.add(el.properties.href);
        const fold = folded || tag === 'details';
        const off = skip || (tag !== 'details' && (skipped(tag, attrOf(el)) || numbers(el)));
        const kind = !off && blockOf(tag, node.tagName);
        if (kind) block(el, kind, fold);
        walk(el, off, fold);
      }
    })(tree, false, false);

    file.data.astro.frontmatter.text = {
      words,
      headings,
      sections: sections.filter((x) => x.heading || x.parts.length)
        .map(({ anchor, heading, parts, folded }) => ({ anchor, heading, text: parts.join('\n\n'), folded })),
      read: { blocks },
      full: fullText(tree, splits),
      elements: [...elements].sort(),
      links: [...links],
    };
  };
}

// text.full, Ask's text (src/lib/ask/): the sections text.sections has, split at the same h2s, each holding everything a
// reader sees in document order: paragraphs, list items (numbered lists too), quotes, h3/h4 lines, table rows as
// "cell | cell", code blocks verbatim (cut at CODE_CAP), captions and folded text. Pictures, players, svg, the
// insides of post components, aria-hidden text, footnote marks, scripts and styles are left out.
const CODE_CAP = 2000;
const OUT = new Set(['img', 'picture', 'video', 'audio', 'iframe', 'svg', 'script', 'style', 'sup', 'source', 'track',
  'button', 'input', 'select', 'template', 'noscript']);
const INLINE = new Set(['a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'del', 'dfn', 'em', 'i', 'ins',
  'kbd', 'label', 'mark', 'q', 's', 'samp', 'small', 'span', 'strong', 'sub', 'time', 'u', 'var', 'wbr']);
const LINES = new Set(['p', 'dt', 'dd', 'h1', 'h3', 'h4', 'h5', 'h6', 'summary', 'figcaption', 'caption', 'h2']);
const out = (el) => OUT.has(el.tagName) || el.tagName.startsWith('ao-') || el.properties.ariaHidden === 'true'
  || el.properties.ariaHidden === true;
// All the text under a node, the left-out subtrees skipped; br is a space.
const deep = (node) => (node.type === 'text' ? node.value : node.type !== 'element' || out(node) ? ''
  : node.tagName === 'br' ? ' ' : node.children.map(deep).join(''));
const verbatim = (node) => (node.type === 'text' ? node.value : node.type === 'element' ? node.children.map(verbatim).join('') : '');

// The blocks of a flow of content, each one string: an inline run, a line, a list ("- item" / "1. item" lines), a
// table's rows or a code block.
function blocks(node) {
  const got = [];
  let run = '';
  const flush = () => { const t = normalize(run); if (t) got.push(t); run = ''; };
  for (const c of node.children) {
    if (c.type === 'text') { run += c.value; continue; }
    if (c.type !== 'element' || out(c)) continue;
    const tag = c.tagName;
    if (INLINE.has(tag)) { run += deep(c); continue; }
    flush();
    if (LINES.has(tag)) { const t = normalize(deep(c)); if (t) got.push(t); }
    else if (tag === 'ul' || tag === 'ol') { const t = items(c).join('\n'); if (t) got.push(t); }
    else if (tag === 'table') { const t = rows(c).join('\n'); if (t) got.push(t); }
    else if (tag === 'pre') {
      const code = verbatim(c).replace(/^\n+|\s+$/g, '');
      if (code) got.push(code.length > CODE_CAP ? `${code.slice(0, CODE_CAP)} (cut)` : code);
    } else got.push(...blocks(c));
  }
  flush();
  return got;
}
function items(list) {
  const start = Number(list.properties.start) || 1;
  return elementsOf(list).filter((li) => li.tagName === 'li').flatMap((li, i) => {
    const [first = '', ...rest] = blocks(li).flatMap((b) => b.split('\n'));
    return [`${list.tagName === 'ol' ? `${start + i}.` : '-'} ${first}`.trimEnd(), ...rest];
  });
}
const cellsOf = (tr) => elementsOf(tr).filter((c) => c.tagName === 'td' || c.tagName === 'th').map((c) => normalize(deep(c)));
function rows(table) {
  const all = [];
  (function walk(n) { for (const c of elementsOf(n)) (c.tagName === 'tr' ? all.push(c) : walk(c)); })(table);
  const caption = elementsOf(table).filter((c) => c.tagName === 'caption').map((c) => normalize(deep(c))).filter(Boolean);
  return [...caption, ...all.map(cellsOf).filter((r) => r.some(Boolean)).map((r) => r.join(' | '))];
}

// The tree's sections at the h2s in `splits` (those text.sections starts at, with its headings), the opening first.
export function fullText(tree, splits) {
  const sections = [{ anchor: '', heading: '', parts: [] }];
  (function walk(node) {
    let flow = [];
    const flush = () => {
      if (flow.length) sections.at(-1).parts.push(...blocks({ children: flow }));
      flow = [];
    };
    for (const c of node.children) {
      if (c.type === 'element' && splits.has(c)) {
        flush();
        sections.push({ anchor: c.properties.id, heading: splits.get(c), parts: [] });
      } else if (c.type === 'element' && holds(c, splits)) {
        flush();
        walk(c);
      } else flow.push(c);
    }
    flush();
  })(tree);
  return sections.filter((x) => x.heading || x.parts.length)
    .map(({ anchor, heading, parts }) => ({ anchor, heading, text: parts.join('\n\n') }));
}
const holds = (el, splits) => el.children.some((c) => c.type === 'element' && (splits.has(c) || holds(c, splits)));
