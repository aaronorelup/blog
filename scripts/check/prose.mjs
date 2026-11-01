// WRITING.md's voice rules that a script can see, on what a reader reads of a post (its body without code, tags,
// attributes or URLs, plus the title, summary and card): no em dash, no spaced en dash, no semicolon, no banned
// phrase, a takeaway of at most two sentences, title and summary within their caps. Errors for posts with a topic
// (v2), warnings for older posts until W4 (frontmatter.mjs warns about their caps). Always warnings: title or summary
// past its target, nested parentheses, inline style= in a post.
import { TEXT } from '../../src/data/limits.js';
import { PHRASES } from '../../src/data/banned-phrases.js';
import { keyLine, liner, readerText, withoutCode } from './text.mjs';

const PHRASE = new RegExp(`\\b(?:${PHRASES.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
const RULES = [
  [/\u2014/g, () => 'an em dash'],
  [/\s\u2013\s/g, () => 'an en dash used as a dash'],
  [/;/g, () => 'a semicolon'],
  [PHRASE, (m) => `the banned phrase "${m.toLowerCase()}"`],
];

// Every rule hit in a text, as Map(what -> [indexes]).
function hits(text) {
  const found = new Map();
  const plain = text.replace(/\u2019/g, "'");
  for (const [re, what] of RULES) {
    for (const m of plain.matchAll(re)) {
      const key = what(m[0]);
      found.set(key, [...(found.get(key) ?? []), m.index]);
    }
  }
  return found;
}

const sentences = (s) => (s.match(/[.!?](?=\s|$)/g) ?? []).length || 1;

export default function prose(repo, report) {
  for (const { file, raw, data } of repo.posts) {
    const level = data.topic === undefined ? 'warn' : 'check';
    const line = liner(raw);

    const body = readerText(raw);
    for (const [what, at] of hits(body)) {
      const lines = [...new Set(at.map(line))];
      report(file, lines[0], `${what}${lines.length > 1 ? ` (lines ${lines.join(', ')})` : ''}`, level);
    }
    const nested = [...body.matchAll(/\([^()]*\([^()]*\)/g)].map((m) => line(m.index));
    if (nested.length) report(file, nested[0], 'nested parentheses', 'warn');
    const styled = [...withoutCode(raw).matchAll(/<[a-z][^>]*\sstyle=/gi)].map((m) => line(m.index));
    if (styled.length) report(file, styled[0], `${styled.length} inline style= (the post page styles posts)`, 'warn');

    const card = data.preview ?? {};
    const fields = [['title', data.title], ['summary', data.summary], ['verdict', card.verdict],
      ['takeaway', card.takeaway], ...(card.points ?? []).map((p) => ['points', p]), ['alt', card.alt]];
    for (const [key, value] of fields.filter(([, v]) => typeof v === 'string')) {
      for (const what of hits(value).keys()) report(file, keyLine(raw, key), `${key}: ${what}`, level);
    }
    for (const [key, target, cap] of [['title', TEXT.titleTarget, TEXT.titleCap], ['summary', TEXT.summaryTarget, TEXT.summaryCap]]) {
      const n = String(data[key] ?? '').trim().length;
      if (n > cap && level === 'check') report(file, keyLine(raw, key), `${key} is ${n} characters, over the ${cap} cap the build refuses`, level);
      else if (n > target && n <= cap) report(file, keyLine(raw, key), `${key} is ${n} characters, past the ${target} target (WRITING.md)`, 'warn');
    }
    if (card.takeaway && sentences(card.takeaway) > 2) {
      report(file, keyLine(raw, 'takeaway'), 'takeaway: one or two short sentences (PREVIEWS.md)', level);
    }
  }
}
