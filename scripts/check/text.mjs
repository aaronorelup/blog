// Text helpers the rules share. Masking blanks a match but keeps every newline, so an index into the masked text
// is still an index into the file and line numbers stay true.
const blank = (m) => m.replace(/[^\n]/g, ' ');
export const mask = (text, ...patterns) => patterns.reduce((t, re) => t.replace(re, blank), text);

export const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/;
export const FENCED = /^[ \t]*(```|~~~)[^\n]*\n[\s\S]*?^[ \t]*\1[^\n]*$/gm;
export const INLINE_CODE = /`[^`\n]+`/g;
export const COMMENT = /<!--[\s\S]*?-->/g;
const SCRIPT_STYLE = /<(script|style)\b[\s\S]*?<\/\1>/gi;
const TAG = /<\/?[A-Za-z][^>]*>/g;
const LINK_TARGET = /\]\([^)]*\)/g;
const URL = /\b(?:https?:\/\/|www\.)[^\s<>)\]"']+/g;
const ENTITY = /&(?:[a-z]+|#\d+|#x[0-9a-f]+);/gi;
const TABLE_RULE = /^[ \t]*\|?[ \t]*:?-{3,}.*$/gm;

// The Markdown body as a reader sees it: no frontmatter, code, comments, tags, attributes, URLs or entities.
export const readerText = (raw) =>
  mask(raw, FRONTMATTER, FENCED, INLINE_CODE, COMMENT, SCRIPT_STYLE, TAG, LINK_TARGET, URL, ENTITY, TABLE_RULE);

// The whole file minus its code, for rules that read markup (links, media paths) but not examples.
export const withoutCode = (raw) => mask(raw, FENCED, INLINE_CODE, COMMENT);

// index -> 1-based line number, by binary search over the line starts.
export function liner(text) {
  const starts = [0];
  for (let i = text.indexOf('\n'); i !== -1; i = text.indexOf('\n', i + 1)) starts.push(i + 1);
  return (index) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

// The line of a frontmatter key (`title:`, or `  takeaway:` under preview), or 1.
export function keyLine(raw, key) {
  const m = new RegExp(`^[ \\t]*${key}:`, 'm').exec(raw);
  return m ? liner(raw)(m.index) : 1;
}
