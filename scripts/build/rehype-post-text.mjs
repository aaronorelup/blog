// The one pass over a post's rendered HTML that every feature reads (ARCHITECTURE.md "The extraction"). It writes
// `text` into the remark frontmatter (pages: render(entry).remarkPluginFrontmatter.text), stamps data-r="i" on read
// block i, data-noread on inline code that isn't read, data-pagefind-ignore on every <ao-*>, and fails on an <ao-*>
// that isn't a post component (a live notebook only gets a warning). text.full is Ask's text (full-text.mjs). Runs
// after rehype-post-images and rehype-heading-ids. Options: `tags`, the post components; `v` is for Astro's cache.
import path from 'node:path';
import { isLive } from '../../src/data/exempt.js';
import { fullText } from './full-text.mjs';
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
