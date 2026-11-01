// Marks the passage a search result or one of Goobie's citations points at: /ledger/<slug>/?hl=<words>&hs=<the
// passage's first words>#<heading>. Within the heading's section (to the next h2; no heading: the opening) it
// marks the sentence that holds hs, or else every word of hl, as <mark class="hl">; opens any <details> around a mark,
// brings the first into view (inside #panel-scroll on a panel page) and clears them all on the next click. Text in
// post components (data-pagefind-ignore) is never marked. Called on the post and notes pages; T2.1 moves the call.
const BLOCK = 'p, li, dd, dt, h2, h3, h4, blockquote, figcaption, td, th, summary';
const WORD = /[\p{L}\p{N}]+/gu;
const GAP = '[^\\p{L}\\p{N}]+';
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function highlight(article, url = new URL(location.href)) {
  const hs = url.searchParams.get('hs');
  const hl = url.searchParams.get('hl');
  if (!hs && !hl) return;
  const { text, nodes } = flatten(section(article, decodeURIComponent(url.hash.slice(1))));
  const ranges = (hs && sentenceOf(text, hs)) || (hl ? wordsOf(text, hl) : []);
  const marks = ranges.reverse().flatMap(([s, e]) => wrap(nodes, s, e)).reverse();
  if (!marks.length) return;
  for (const m of marks) for (let d = m.closest('details'); d; d = d.parentElement.closest('details')) d.open = true;
  // After load: WebKit scrolls to the #heading then, and that must not come after this.
  const show = () => requestAnimationFrame(() => centre(marks[0], article.closest('#panel-scroll')));
  if (document.readyState === 'complete') show(); else addEventListener('load', show, { once: true });
  document.addEventListener('click', () => marks.forEach((m) => {
    const parent = m.parentNode;
    m.replaceWith(...m.childNodes);
    parent.normalize();
  }), { once: true });
}

// Only the panel's own scroller moves: scrollIntoView would also scroll the panel's frame, which clips, not scrolls.
function centre(el, scroller) {
  const r = el.getBoundingClientRect();
  const box = scroller.getBoundingClientRect();
  scroller.scrollTop += r.top - box.top - (box.height - r.height) / 2;
}

// The anchor's heading and what follows it up to the next h2; with no anchor, the opening before the first h2; the
// whole article when the anchor isn't on the page.
function section(article, id) {
  const start = id ? article.querySelector(`[id="${CSS.escape(id)}"]`) : article.querySelector('h2');
  if (!start || (id && !/^H[2-4]$/.test(start.tagName))) return [start || article];
  const parts = id ? [start] : [];
  const from = id ? start.nextElementSibling : start.parentElement.firstElementChild;
  for (let n = from; n && n.tagName !== 'H2'; n = n.nextElementSibling) parts.push(n);
  return parts;
}

// The section's text as one string, a line break between blocks, with where each text node starts in it.
function flatten(parts) {
  let text = '';
  let block = null;
  const nodes = [];
  for (const part of parts) {
    const walk = document.createTreeWalker(part, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest('[data-pagefind-ignore], script, style')
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const b = n.parentElement.closest(BLOCK);
      if (b !== block && text) text += '\n';
      block = b;
      nodes.push({ node: n, start: text.length });
      text += n.data;
    }
  }
  return { text, nodes };
}

// The whole sentence that holds the passage's first words, as one range: from the end of the sentence (or block)
// before them to the end of theirs.
function sentenceOf(text, hs) {
  const words = hs.match(WORD);
  const m = words && new RegExp(words.map(escape).join(GAP), 'iu').exec(text);
  if (!m) return null;
  const before = [...text.slice(0, m.index).matchAll(/[.!?]\s+|\n/g)].at(-1);
  const after = /[.!?](?=\s|$)|\n|$/g;
  after.lastIndex = m.index + m[0].length;
  const stop = after.exec(text);
  return [[before ? before.index + before[0].length : 0, stop.index + (/[.!?]/.test(stop[0]) ? 1 : 0)]];
}

// Every word of the section that starts with one of hl's words.
function wordsOf(text, hl) {
  const terms = hl.match(WORD);
  if (!terms) return [];
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${terms.map(escape).join('|')})[\\p{L}\\p{N}]*`, 'giu');
  return [...text.matchAll(re)].map((m) => [m.index, m.index + m[0].length]);
}

// Wraps text [s, e) in marks, one per text node it crosses. Later ranges first, so earlier offsets hold.
function wrap(nodes, s, e) {
  const marks = [];
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const { node, start } = nodes[i];
    const end = start + node.data.length;
    if (end <= s || start >= e || !node.data.trim()) continue;
    let target = node;
    if (Math.min(e, end) - start < node.data.length) target.splitText(Math.min(e, end) - start);
    if (s > start) target = target.splitText(s - start);
    const mark = document.createElement('mark');
    mark.className = 'hl';
    target.replaceWith(mark);
    mark.append(target);
    marks.unshift(mark);
  }
  return marks;
}
