// What one question's answer call is given (docs/ASK.md "Context"): in whole mode every post (the one pack) and the
// live notebook after the catalog; in split mode the pack holding most of the focus, then the focus docs outside it
// and the next of R, under ask_extra_tokens and the room the budget leaves. And the user message: how many posts
// matched, how many it was given, the 6 most related, the question. PARAMS are the calls' settings (in PROMPT_V).
import { BUDGET, est, RULES_TOKENS, SLACK, USER_TOKENS } from '../../src/lib/ask/caps.js';
import { USER } from '../../src/lib/ask/words.js';

export const PARAMS = {
  answer: { max_tokens: 600, temperature: 0.2, first: 30e3, total: 60e3 },
  planner: { max_tokens: 300, temperature: 0, total: 8e3 },
};
const fill = (template, slots) => template.replace(/\{(\w+)\}/g, (_, k) => String(slots[k]));

// rank: rank.js ranking(). blind: neither the planner nor the search gave anything. variant 'a': the hint names
// each post's best sections.
export function contextOf(ix, rank, { q, extraTokens, blind = false, variant }) {
  const { m } = ix;
  const total = m.counts.posts;
  let pack = 0;
  let extras = ix.live;
  if (m.mode === 'split') ({ pack, extras } = blind ? { pack: m.packs.length - 1, extras: [] } : splitOf(ix, rank, extraTokens));
  const inPack = m.packs[pack].docs.length;
  const given = m.mode === 'whole' ? total : inPack + extras.length;
  const slots = { total, given, inPack, extra: extras.length, matched: rank.matched.length, q };
  const hint = rank.hint.map((n) => `[${n}] ${ix.doc(n).title}${variant === 'a' ? marksOf(ix, rank.chunks, n) : ''}`).join('; ');
  const head = blind ? [USER[`${m.mode}Blind`]]
    : rank.matched.length ? [USER[m.mode], fill(USER.hint, { hint })] : [USER[`${m.mode}None`], fill(USER.hintNone, { hint })];
  const user = `${head.map((t) => fill(t, slots)).join('\n')}\n\n${fill(USER.question, slots)}`;
  const tokens = RULES_TOKENS + m.packs[pack].tokens + m.catalog.tokens
    + extras.reduce((t, n) => t + ix.doc(n).tokens, 0) + est(user.length);
  const inPrompt = m.mode === 'whole' ? null : new Set([...m.packs[pack].docs, ...extras]);
  return { pack, extras, user, given, of: total, tokens, inPrompt };
}

// The pack with most focus docs (a tie: the one with the best-ranked of them, then the newer); then every focus doc
// outside it while it fits the room, then the next docs of R while under ask_extra_tokens, the live notebook last.
function splitOf(ix, rank, extraTokens) {
  const { m } = ix;
  const at = (n) => ix.doc(n).pack;
  const count = (p) => rank.focus.filter((n) => at(n) === p).length;
  const first = (p) => { const i = rank.focus.findIndex((n) => at(n) === p); return i < 0 ? Infinity : i; };
  let pack = 0;
  for (let p = 1; p < m.packs.length; p++) {
    const [a, b] = [count(p), count(pack)];
    if (a > b || (a === b && first(p) <= first(pack))) pack = p;
  }
  const room = BUDGET - RULES_TOKENS - m.packs[pack].tokens - m.catalog.tokens - USER_TOKENS - SLACK;
  const extras = [];
  let used = 0;
  const add = (n, cap) => {
    if (used + ix.doc(n).tokens > cap) return false;
    extras.push(n);
    used += ix.doc(n).tokens;
    return true;
  };
  for (const n of rank.focus) if (at(n) !== pack) add(n, room);
  for (const n of rank.R.slice(rank.focus.length)) if (at(n) !== pack && !add(n, Math.min(extraTokens, room))) break;
  const live = new Set(ix.live);
  return { pack, extras: [...extras.filter((n) => !live.has(n)), ...extras.filter((n) => live.has(n))] };
}

// " (55.3, 55.N2)": the sections of a hint post's best fused chunks, up to 3 (variant 'a').
function marksOf(ix, chunks, n) {
  const marks = [];
  for (const id of chunks) {
    if (ix.ofId(id) !== n) continue;
    const s = ix.sectionOfChunk(id);
    if (s && !marks.includes(s)) marks.push(s);
    if (marks.length === 3) break;
  }
  return marks.length ? ` (${marks.join(', ')})` : '';
}
