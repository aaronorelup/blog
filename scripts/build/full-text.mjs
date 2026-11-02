// text.full, Ask's text (src/lib/ask/), for rehype-post-text.mjs: the sections text.sections has, split at the same
// h2s, each holding everything a reader sees in document order: paragraphs, list items (numbered lists too), quotes,
// h3/h4 lines, table rows as "cell | cell", code blocks verbatim (cut at CODE_CAP), captions, folded text, and the
// words a post component shows (COMPONENT, below). Pictures, players, svg, aria-hidden text, footnote marks, scripts,
// styles and the components' data attributes are left out.
import { normalize } from '../../src/lib/text/rules.js';

const CODE_CAP = 2000;
const OUT = new Set(['img', 'picture', 'video', 'audio', 'iframe', 'svg', 'script', 'style', 'sup', 'source', 'track',
  'button', 'input', 'select', 'template', 'noscript']);
const INLINE = new Set(['a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'del', 'dfn', 'em', 'i', 'ins',
  'kbd', 'label', 'mark', 'q', 's', 'samp', 'small', 'span', 'strong', 'sub', 'time', 'u', 'var', 'wbr']);
const LINES = new Set(['p', 'dt', 'dd', 'h1', 'h3', 'h4', 'h5', 'h6', 'summary', 'caption', 'h2']);
const elementsOf = (el) => el.children.filter((c) => c.type === 'element');
const isComponent = (el) => el.tagName.startsWith('ao-');
const isMeta = (el) => (el.properties.className ?? []).includes('ao-meta');
const out = (el) => OUT.has(el.tagName) || el.properties.ariaHidden === 'true' || el.properties.ariaHidden === true;
const list = (s) => (s ? String(s).split('|').map((x) => x.trim()).filter(Boolean) : []);
// All the text under a node, the left-out subtrees and components skipped; br is a space, a quote keeps its marks.
const deep = (node) => (node.type === 'text' ? node.value : node.type !== 'element' || out(node) || isComponent(node) ? ''
  : node.tagName === 'br' ? ' ' : node.tagName === 'q' ? `"${node.children.map(deep).join('')}"`
    : node.children.map(deep).join(''));
const verbatim = (node) => (node.type === 'text' ? node.value : node.type === 'element' ? node.children.map(verbatim).join('') : '');

// A caption's lines: its words, then each .ao-meta (a block of its own on the page) on a line after them.
function caption(fc) {
  const lines = [''];
  for (const c of fc.children) {
    if (c.type === 'element' && isMeta(c)) lines.push(deep(c), '');
    else lines[lines.length - 1] += deep(c);
  }
  return lines.map(normalize).filter(Boolean);
}

// The blocks of a flow of content, each one string: an inline run, a line, a caption, a list ("- item" / "1. item"
// lines), a table's rows, a code block or what a post component shows.
function blocks(node) {
  const got = [];
  let run = '';
  const flush = () => { const t = normalize(run); if (t) got.push(t); run = ''; };
  for (const c of node.children) {
    if (c.type === 'text') { run += c.value; continue; }
    if (c.type !== 'element' || out(c)) continue;
    const tag = c.tagName;
    if (INLINE.has(tag) && !isMeta(c)) { run += deep(c); continue; }
    flush();
    const t = isComponent(c) ? (COMPONENT[tag] ?? captions)(c).join('\n\n')
      : tag === 'figcaption' ? caption(c).join('\n')
        : LINES.has(tag) || isMeta(c) ? normalize(deep(c))
          : tag === 'ul' || tag === 'ol' ? items(c).join('\n')
            : tag === 'table' ? rows(c).join('\n')
              : tag === 'pre' ? code(c) : null;
    if (t === null) got.push(...blocks(c));
    else if (t) got.push(t);
  }
  flush();
  return got;
}
function code(pre) {
  const s = verbatim(pre).replace(/^\n+|\s+$/g, '');
  return s.length > CODE_CAP ? `${s.slice(0, CODE_CAP)} (cut)` : s;
}
function items(el) {
  const start = Number(el.properties.start) || 1;
  return elementsOf(el).filter((li) => li.tagName === 'li').flatMap((li, i) => {
    const [first = '', ...rest] = blocks(li).flatMap((b) => b.split('\n'));
    return [`${el.tagName === 'ol' ? `${start + i}.` : '-'} ${first}`.trimEnd(), ...rest];
  });
}
const cellsOf = (tr) => elementsOf(tr).filter((c) => c.tagName === 'td' || c.tagName === 'th').map((c) => normalize(deep(c)));
function rows(table) {
  const all = [];
  (function walk(n) { for (const c of elementsOf(n)) (c.tagName === 'tr' ? all.push(c) : walk(c)); })(table);
  const title = elementsOf(table).filter((c) => c.tagName === 'caption').map((c) => normalize(deep(c))).filter(Boolean);
  return [...title, ...all.map(cellsOf).filter((r) => r.some(Boolean)).map((r) => r.join(' | '))];
}

// What a post component shows a reader as words, by tag (docs/COMPONENTS.md has their markup). Any other component
// gives its captions and .ao-meta lines, in order.
const COMPONENT = {
  // Its inputs' and results' labels as the two lists a reader without JS sees, then its caption (the worked example).
  'ao-calc': blocks,
  // The chart's table, which holds every label and value it draws, then its caption.
  'ao-bars': blocks,
  // The view buttons, the column headings, a row a line ("label (note) | cell | cell"), then the set's caption.
  'ao-matrix': (el) => {
    const cell = (f) => {
      const fc = elementsOf(f).find((c) => c.tagName === 'figcaption');
      return fc ? caption(fc).join(' · ') : normalize(deep(f));
    };
    const grid = elementsOf(el).filter((r) => r.properties.dataRow).map((r) => {
      const [label, note] = list(r.properties.dataRow);
      return [note ? `${label} (${note})` : label, ...elementsOf(r).filter((f) => f.tagName === 'figure').map(cell)].join(' | ');
    });
    const head = ['', ...list(el.properties.cols)].join(' | ').trim();
    return [list(el.properties.views).join(' | '), [head, ...grid].join('\n'), ...captions(el, false)].filter(Boolean);
  },
  // The view and stop buttons' labels (a stop without one shows its place as a percentage), then the caption.
  'ao-pan': (el) => [list(el.properties.views).join(' | '), list(el.properties.stops)
    .map((s) => (s.includes(':') ? s.slice(s.indexOf(':') + 1).trim() : `${Math.round(parseFloat(s) * 100)}%`)).join(' | '),
  ...captions(el)].filter(Boolean),
  // One line an event: its time, its lane's name, what happened.
  'ao-timeline': (el) => {
    const lanes = new Map(list(el.properties.lanes).map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]));
    return elementsOf(el).filter((c) => c.tagName === 'ol').map((ol) => elementsOf(ol).map((li) => {
      const time = li.children.find((c) => c.type === 'element' && c.tagName === 'time');
      const said = blocks({ children: li.children.filter((c) => c !== time) }).join(' ');
      return `${time ? `${normalize(deep(time))} ` : ''}${lanes.get(li.properties.dataLane) ?? ''}: ${said}`.trim();
    }).join('\n'));
  },
};
// Every caption and .ao-meta under a component (deep: descendants too), in document order.
function captions(el, deeply = true) {
  return elementsOf(el).flatMap((c) => (out(c) ? [] : c.tagName === 'figcaption' ? [caption(c).join('\n')]
    : isMeta(c) ? [normalize(deep(c))] : isComponent(c) ? (COMPONENT[c.tagName] ?? captions)(c)
      : deeply ? captions(c) : [])).filter(Boolean);
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
