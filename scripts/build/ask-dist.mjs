// The checks on dist/ask (RAG Goobie's prompt files, src/lib/ask/) and the lines every build prints about them
// (docs/ASK.md "The build"). askCheck(dist, listed, prev) -> { problems, warnings, lines }; verify-dist fails the
// deploy on a problem. A live notebook never makes a problem, only a warning. Budget sums are checked on the caps,
// never the content, so no post can fail them.
import fs from 'node:fs';
import path from 'node:path';
import { isLive } from '../../src/data/exempt.js';
import { BUDGET, DOC_CAP, RE_GATE, RULES_TOKENS, USER_TOKENS, sums } from '../../src/lib/ask/caps.js';
import { PRICES } from '../../src/lib/ask/price.js';

const MAX_FILE = 25 * 1024 * 1024;
const IN_FLIGHT = 10;   // reservations the suggested ask_daily_usd leaves room for
const k = (t) => `${Math.round(t / 1000)}k`;
const dollars = (micro) => `$${(micro / 1e6).toFixed(micro < 1e4 ? 4 : 2)}`;

export function askCheck(dist, listed, prev = null) {
  const problems = [];
  const warnings = [];
  const dir = path.join(dist, 'ask');
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  const live = (slug) => isLive(slug) || Object.values(m.docs).some((d) => d.slug === slug && d.live);
  const flag = (slug, msg) => (live(slug) ? warnings : problems).push(`ask: ${msg}`);

  for (const [n, d] of Object.entries(m.docs)) {
    if (!listed.has(d.slug)) flag(d.slug, `doc ${n} (${d.slug}) is not a listed post`);
    if (!d.live && d.tokens > DOC_CAP) problems.push(`ask: doc ${n} is ${d.tokens} est. tokens, over DOC_CAP`);
    for (const [s, kind, anchor] of d.sections) {
      if (!anchor) continue;
      const page = path.join(dist, 'ledger', d.slug, kind === 'notes' ? 'notes' : '', 'index.html');
      if (!fs.existsSync(page) || !fs.readFileSync(page, 'utf8').includes(`id="${anchor}"`)) {
        flag(d.slug, `${n}.${s} links to #${anchor}, which /ledger/${d.slug}/ doesn't have`);
      }
    }
  }
  for (const slug of listed) if (!Object.values(m.docs).some((d) => d.slug === slug)) flag(slug, `${slug} is listed but not in the manifest`);

  const files = [m.catalog.file, ...m.packs.map((p) => p.file), ...Object.values(m.docs).map((d) => d.file)];
  for (const file of files) {
    const at = path.join(dir, file);
    if (!fs.existsSync(at)) { problems.push(`ask: ${file} is in the manifest but not built`); continue; }
    if (fs.statSync(at).size > MAX_FILE) problems.push(`ask: ${file} is over 25 MiB`);
    const body = fs.readFileSync(at, 'utf8');
    let text = null;
    try { text = JSON.parse(`"${body}"`); } catch { problems.push(`ask: ${file} is not a JSON string's body`); continue; }
    if (JSON.stringify(text).slice(1, -1) !== body) problems.push(`ask: ${file} doesn't round-trip through JSON`);
    for (const [, n, slug] of text.matchAll(/<doc n="(\d+)" url="\/ledger\/([^/"]+)\/"/g)) {
      if (!listed.has(slug)) flag(slug, `${file} holds doc ${n} (${slug}), which is not listed`);
    }
  }

  const s = sums({ WHOLE_CAP: m.caps.whole, PACK_CAP: m.caps.pack, DOC_CAP: m.caps.doc, LIVE_CAP: m.caps.live,
    CATALOG_CAP: m.caps.catalog });
  if (s.whole > BUDGET) problems.push(`ask: whole mode's caps sum to ${s.whole}, over the ${BUDGET} budget`);
  if (s.room < s.focus) problems.push(`ask: split mode leaves ${s.room} est. tokens, under the ${s.focus} that 6 focus docs need`);

  return { problems, warnings, lines: linesOf(m, prev) };
}

function linesOf(m, prev) {
  const live = Object.keys(m.live).reduce((t, n) => t + m.docs[n].tokens, 0);
  const pack = Math.max(...m.packs.map((p) => p.tokens));
  const prompt = RULES_TOKENS + pack + m.catalog.tokens + (m.mode === 'whole' ? live : 0) + USER_TOKENS;
  const reserve = m.reserve.plan + m.reserve.answer;
  const unpinned = m.starts.filter((s, i) => s !== m.pins[i]).length + Math.abs(m.starts.length - m.pins.length);
  const lines = [`ask: ${m.mode}, ${m.packs.length} pack${m.packs.length > 1 ? 's' : ''}, ${m.counts.posts} posts + `
    + `${m.counts.notes} notes, ${k(prompt)} est. tokens (${Math.round((100 * prompt) / m.caps.whole)}% of WHOLE_CAP), `
    + `live ${k(live)}/${k(m.caps.live)} est., worst-case reservation ${dollars(reserve)}, ask_daily_usd should be >= `
    + `$${(Math.ceil((IN_FLIGHT * reserve) / 1e4) / 100).toFixed(2)} (${IN_FLIGHT} reservations in flight); pins: `
    + (unpinned ? 'not pinned' : 'ok')];
  if (unpinned) lines.push(`ask: ${unpinned} unpinned pack boundaries: run npm run ask:pin and commit src/data/ask-packs.json`);
  if (pack >= RE_GATE) {
    lines.push(`ask: RE-GATE: the pack is ${k(pack)} est.; long-context quality is measured only up to 304k: re-run G2 `
      + '(docs/ASK.md) and lower WHOLE_CAP in src/lib/ask/caps.js if it fails');
  }
  if (prev) lines.push(...editCost(prev, m));
  return lines;
}

// What this build's first questions re-read, against the build before it: from the first changed doc of each
// changed pack to the end of the prompt's stable part.
function editCost(prev, m) {
  const out = [];
  m.packs.forEach((p, i) => {
    const old = prev.packs[i];
    if (!old || old.file === p.file) return;
    const at = p.docs.findIndex((n) => prev.docs[n]?.file !== m.docs[n].file);
    const from = at < 0 ? p.docs.length : at;
    const tokens = p.docs.slice(from).reduce((t, n) => t + m.docs[n].tokens, 0) + m.catalog.tokens;
    out.push(`ask: pack ${i} changed at doc ${p.docs[from] ?? 'its end'}: ~${k(tokens)} tokens re-read once `
      + `(${dollars(Math.ceil(tokens * PRICES.peak.miss))} peak)`);
  });
  return out;
}
