// What a reader reads in a post, for the build (scripts/build/rehype-post-text.mjs) and the browser (read-aloud)
// alike, so both pick the same words. A rule sees an element as its lowercase tag and attr(name), which returns the
// attribute's value or null. Nothing here rewrites the displayed text.
const SKIP = new Set(['pre', 'table', 'figure', 'figcaption', 'svg', 'iframe', 'video', 'audio', 'details', 'sup']);
const LISTS = new Set(['ul', 'ol', 'dl']);
// Block kinds: h heading, p paragraph, li list item, q quote. A summary is only ever reached inside <details>,
// which reading skips, so only search sees it.
const BLOCKS = new Map([['p', 'p'], ['dt', 'p'], ['dd', 'p'], ['li', 'li'], ['h2', 'h'], ['h3', 'h'], ['h4', 'h'],
  ['summary', 'h']]);

// A subtree nobody reads: code, tables, figures, media, folded text, footnote marks, post components, metadata.
export const skipped = (tag, attr) => SKIP.has(tag) || tag.startsWith('ao-') || attr('aria-hidden') !== null
  || attr('data-noread') !== null || (attr('class') || '').split(/\s+/).includes('ao-meta');

// The block an element starts, or null. A paragraph in a quote reads as the quote, in a list item as the item.
export function blockOf(tag, parentTag) {
  if (tag !== 'p') return BLOCKS.get(tag) || null;
  return parentTag === 'blockquote' ? 'q' : parentTag === 'li' ? 'li' : 'p';
}

// A block's own text leaves these out: they are read as blocks of their own.
export const nested = (tag) => LISTS.has(tag) || BLOCKS.has(tag);

// Inline code is read only when it looks like a plain word ("Pagefind", not "src/lib/x.js").
export const plainCode = (text) => /^[A-Za-z][\w .-]{0,30}$/.test(text);

// A list is skipped when more than half its items are mostly digits (timings, sizes, scores).
export const numberList = (items) => items.filter(mostlyDigits).length > items.length / 2;
const mostlyDigits = (s) => s.replace(/\D/g, '').length > s.replace(/[^\p{L}\p{N}]/gu, '').length / 2;

export const normalize = (s) => s.replace(/\s+/g, ' ').trim();
export const countWords = (s) => s.split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
