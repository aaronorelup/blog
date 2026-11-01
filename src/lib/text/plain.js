// A post's Markdown down to plain words (the fallback card's excerpt), and its reading minutes from the extraction's
// main-read word count (text.words): the post header, /ledger/previews.json's card and the ledger row show the same
// number.
const WORDS_PER_MINUTE = 230;

export function plain(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]+/g, '')
    .replace(/&[a-z]+;|&#\d+;/g, ' ');
}

// Folded details, tables, code, captions and number lists aren't the main read (rehype-post-text.mjs), so a post of
// charts and tables reads in the minutes its prose takes. A live notebook that failed to render has no count.
export const readingMinutes = (words = 0) => Math.max(1, Math.round(words / WORDS_PER_MINUTE));
