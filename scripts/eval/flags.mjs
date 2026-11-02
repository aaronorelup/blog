// The report's flags for the hand reading (docs/ASK.md "The eval"), each a list of snippets of one answer: voice, a
// first person outside RAG Goobie's own phrases, quotes and the posts' titles ("my laptop's", "we rendered"), and a
// credit to Aaron to check against the post ("Aaron worked it out"); marks, a cite mark used as a noun (after "read",
// "see", "then", "and" or "with", or starting a sentence or a line); hidden, any talk of hidden, secret, unlisted or
// draft pages or of easter eggs. A flag is a question for a reader, not a verdict.
const near = (s, i, n) => s.slice(Math.max(0, i - 30), i + n + 30).replace(/\s+/g, ' ');
const all = (s, re) => [...s.matchAll(re)].map((m) => near(s, m.index, m[0].length));

// RAG Goobie's own "I": what it found, read or would do, and what it can't.
const OWN = new RegExp((`^I(?:'d|'m|'ll|'ve| won't| would| found| find| can| could| cannot| can't| couldn't| don't| didn't| only|`
  + ` answer| see| have| haven't| checked| looked| searched| read| think| am| will| need| know| suggest| recommend| start| point|`
  + ` wasn't)\\b`).replaceAll("'", "['\u2019]"));
const blank = (s) => ' '.repeat(s.length);
const unquoted = (s) => s.replace(/"[^"\n]*"|“[^”\n]*”/g, blank);
const untitled = (s, titles) => titles.reduce((t, title) => t.replaceAll(title, blank(title)), s);

// titles: the posts' titles, written in Aaron's first person ("...on my 8 GB laptop"), which naming a post repeats.
export function voice(answer, titles = []) {
  const s = untitled(unquoted(answer), titles);
  return [...s.matchAll(/\bI\b|\b(?:[Mm]y|[Mm]e|[Mm]ine|[Ww]e|[Oo]urs?|us)\b/g)]
    .filter((m) => m[0] !== 'I' || !OWN.test(s.slice(m.index)))
    .map((m) => near(answer, m.index, m[0].length));
}

export const marks = (answer) => all(answer, /\b(?:read|see|then|and|with)\s+\[\d+\]|(?:^|[.!?]\s+|\n\s*(?:[-*•]|\d+\.)?\s*)\[\d+\]/gi);

// Aaron, or "he", doing what a post often says he had Claude or an agent do: a credit to check against the post.
export const credit = (answer) => all(answer, /\b(?:Aaron|[Hh]e)\s+(?:has\s+)?(?:worked|built|copied|fixed|tuned|computed|designed|made)\b/g);

export const hidden = (answer) => all(answer,
  /\b(?:hidden|secret|unlisted|draft|unpublished)\s+(?:[\w-]+\s+){0,2}?(?:pages?|posts?|links?|urls?|addresses|frames?)\b|\beaster[- ]?eggs?\b/gi);
