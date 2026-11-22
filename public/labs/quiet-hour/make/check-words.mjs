// THE QUIET HOUR: the words check (bible 1.5). The film never shows or says AI, model, network, training, loss,
// learning rate, gradient or neural. Its own words are the box, tunes, a step, the edge, new tunes, lessons.
//
//   node make/check-words.mjs [--out report.json]
//
// Exits 1 on any failure, 2 on a usage error. What it reads, and why:
//   spoken    every line the maker can say: the cues and the dropped lines of all four endings' engines, the texts of
//             data/voice.json, and the line table of src/rules.js run over every number it can be given (shares
//             0..99, step multiples), so a line no ending happens to say is checked too
//   signals   every string any engine.signals(frame) carries, on every frame of every ending, and every subtitle
//             (engine.subtitleAt) to frame 2399: the clock bug, the chalk, the drums, the subtitle text ...
//   drawn     every string literal in the film's drawing code (film.js, src/programme, src/room, src/post.js,
//             src/subtitles.js, src/layout.js, src/shots.js): fillText / strokeText arguments and engraved labels alike.
//             Shader source keeps its words checked, with its own comments dropped and its operators exempt from the
//             punctuation rule. Error messages (new Error(...)) and import paths are not on screen.
//   engine    string literals in src/signals.js, src/rules.js, src/time.js, src/rng.js that are not line texts: x-ray
//             and table wording. The lab page shows them, if anything does: listed as WARN, never failed.
//   data      strings inside data/*.json other than voice.json (provenance, column names): listed as INFO.
// Exempt: the lab page's own text outside the film's frame (index.html, lab.css, src/player.js, src/ui/), and code
// comments.
// Rules: FAIL on a banned word in spoken, signals or drawn text; on an em dash in any of them; on a semicolon inside a
// spoken line; on an exclamation mark in any on-screen or spoken text. fillText / strokeText calls whose text cannot be
// resolved statically are listed (their S fields are covered by the signals scan).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { lex } from './check-honesty.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const ENDINGS = ['main', 'alone', 'x3', 'x10'];

export const BANNED = [
  ['AI', /\bA\.?I\.?(?![\w])/],                 // capitals only: "ai" is not a word here
  ['model', /\bmodel(s|led|ling)?\b/i],
  ['network', /\bnetworks?\b/i],
  ['training', /\btrain(ing|ed|s|er|ers)?\b/i],
  ['loss', /\bloss(es)?\b/i],
  ['learning rate', /\blearning[\s_-]*rates?\b|\blr\b/i],
  ['gradient', /\bgradients?\b/i],
  ['neural', /\bneural\b/i],
];
const EM_DASH = /—/, EN_DASH = /–/;

function args(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const k = argv[i].slice(2), v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    a[k] = k in a ? [].concat(a[k], v) : v;
  }
  return a;
}

const banned = (t) => BANNED.filter(([, re]) => re.test(t)).map(([w]) => w);

function judge(kind, text, where, out, opts = {}) {
  const problems = [];
  const words = banned(text).filter((w) => !(opts.lrOk && w === 'learning rate' && !/learning/i.test(text)));
  if (words.length) problems.push(`banned word: ${words.join(', ')}`);
  if (EM_DASH.test(text)) problems.push('em dash');
  if (kind === 'spoken' && text.includes(';')) problems.push('semicolon in a spoken line');
  if (!opts.noBang && text.includes('!')) problems.push('exclamation mark');
  const warn = EN_DASH.test(text) ? ['en dash (not banned; check it is not standing in for an em dash)'] : [];
  if (problems.length) out.fail.push({ kind, where, text, problems });
  else if (warn.length) out.warn.push({ kind, where, text, problems: warn });
  out.counts[kind] = (out.counts[kind] || 0) + 1;
}

// ---- spoken ------------------------------------------------------------------------------------------------------------
async function spoken(out, mods) {
  const { createEngine, voiceLengths } = mods.signals;
  const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', p), 'utf8'));
  const voice = fs.existsSync(path.join(ROOT, 'data/voice.json')) ? read('voice.json') : null;
  const texts = new Map();
  const put = (t, where) => { if (typeof t === 'string' && t.length) { if (!texts.has(t)) texts.set(t, new Set()); texts.get(t).add(where); } };
  if (voice) {
    for (const l of voice.lines || []) put(l.text, `data/voice.json line ${l.id}${l.variant ? ' ' + l.variant : ''}`);
    for (const k of Object.keys(voice)) if (!['about', 'voice', 'lines'].includes(k)) put(k, 'data/voice.json key');
  }
  const shared = read('shared.json');
  const engines = {};
  for (const e of ENDINGS) {
    const eng = createEngine(shared, read(`ending-${e}.json`), { voiceDurations: voice ? voiceLengths(voice) : undefined });
    engines[e] = eng;
    for (const c of eng.cues) put(c.text, `${e} cue ${c.id} @${c.frame}`);
    for (const d of eng.dropped || []) put(d.text, `${e} dropped ${d.id}`);
  }
  // the line table over every number it can be given
  const R = mods.rules;
  const N = 432, fill = (x) => Array(N).fill(x);
  let swept = 0, sweepErrors = [];
  for (const L of R.LINES || []) {
    if (typeof L.text !== 'function') continue;
    const tries = [];
    for (let k = 0; k <= 99; k++) tries.push({ share: fill(k / 100) });
    for (const n of [1, 0.5, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10, 12, 20, 30, 100]) tries.push({ lrMul: n });
    for (const t of tries) {
      const lr = fill(1); if (t.lrMul) lr[288] = t.lrMul; else lr[288] = 1;
      const c = new Proxy({ lr, ptok: fill(0.97), share: t.share || fill(0.5), heldAcc: t.share || fill(0.5), ratio: fill(0.3), ratioNow: fill(0.3),
        massInKey: fill(0.96), limitNow: fill(2), limit20: 1, breakNote: 288, handsBack: fill(true), share20: 0.6, err: fill(1) },
      { get: (o, k) => (k in o ? o[k] : fill(0.5)) });
      try { put(L.text(300, c), `src/rules.js LINES ${L.id} (swept)`); swept++; } catch (e) { sweepErrors.push(`${L.id}: ${e.message}`); break; }
    }
  }
  // the line table's literal texts, statically (whatever the sweep could not call)
  const rulesSrc = fs.readFileSync(path.join(ROOT, 'src/rules.js'), 'utf8');
  for (const m of rulesSrc.matchAll(/text:\s*\([^)]*\)\s*=>\s*(['"`])((?:\\.|(?!\1).)*)\1/g)) put(m[2].replace(/\\'/g, "'"), 'src/rules.js text literal');
  for (const [t, where] of texts) judge('spoken', t, [...where].slice(0, 3).join('; ') + (where.size > 3 ? ` (+${where.size - 3})` : ''), out);
  out.spoken = { distinct: texts.size, swept, sweepErrors: [...new Set(sweepErrors)] };
  return engines;
}

// ---- signals --------------------------------------------------------------------------------------------------------------
function signalStrings(out, engines) {
  const seen = new Map();
  const walk = (v, keyPath, where) => {
    if (typeof v === 'string') { if (!seen.has(v)) seen.set(v, `${where} ${keyPath}`); return; }
    if (Array.isArray(v)) { for (const x of v) walk(x, keyPath + '[]', where); return; }
    if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, keyPath ? `${keyPath}.${k}` : k, where);
  };
  for (const [e, eng] of Object.entries(engines)) {
    for (let f = 0; f < 2160; f++) walk(eng.signals(f), '', `${e} frame ${f}`);
    for (let f = 0; f < 2400; f++) { const s = eng.subtitleAt(f); if (s) walk(s.text, 'subtitle', `${e} frame ${f}`); }
  }
  // tokName-style values ('A#3', 'HOLD') and kinds are drawn or not; all are checked alike
  for (const [t, where] of seen) judge('signals', t, `first at ${where}`, out);
  out.signals = { distinct: seen.size };
}

// ---- drawn / engine literals ----------------------------------------------------------------------------------------------
const DRAWN = (rel) => /^src\/(programme|room)\//.test(rel) || ['film.js', 'src/post.js', 'src/subtitles.js', 'src/layout.js', 'src/shots.js'].includes(rel);
const ENGINE = (rel) => ['src/signals.js', 'src/rules.js', 'src/time.js', 'src/rng.js'].includes(rel);
const LAB = (rel) => rel === 'src/player.js' || rel.startsWith('src/ui/');
const isGlsl = (t) => /\b(gl_\w+|void\s+main|uniform\s+\w+|varying\s+\w+|vec[234]|texture2D|precision\s+\w+)\b/.test(t);

function fileList() {
  const out = ['film.js'];
  const walk = (d) => { for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) { const r = `${d}/${e.name}`; if (e.isDirectory()) walk(r); else if (/\.m?js$/.test(e.name)) out.push(r); } };
  walk('src');
  return out.sort();
}

function literals(out, planted = new Map()) {
  const calls = [];
  const files = [...fileList(), ...planted.keys()];
  for (const rel of files) {
    if (LAB(rel)) continue;
    const src = fs.readFileSync(planted.get(rel) ?? path.join(ROOT, rel), 'utf8');
    const { strings, code } = lex(src);
    for (const s of strings) {
      const before = src.slice(Math.max(0, s.start - 40), s.start);
      if (/new\s+(Range|Type)?Error\(\s*$/.test(before) || /\b(from|import)\s*\(?\s*$/.test(before) || /console\.\w+\(\s*$/.test(before)) continue;
      let text = s.text;
      const glsl = isGlsl(text);
      if (glsl) text = text.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
      const where = `${rel}:${s.line}`;
      if (DRAWN(rel)) judge('drawn', text, where, out, { noBang: glsl, lrOk: true });
      else if (ENGINE(rel)) {
        if (/^\s*text:\s*\(/.test(src.slice(src.lastIndexOf('\n', s.start) + 1, s.start).replace(/.*?(text:)/, '$1'))) continue;   // a line text: spoken
        const probs = [...banned(text).filter((w) => w !== 'learning rate' || /learning/i.test(text)), ...(EM_DASH.test(text) ? ['em dash'] : []), ...(text.includes('!') ? ['exclamation mark'] : [])];
        if (probs.length) out.warn.push({ kind: 'engine', where, text, problems: probs.map((p) => `${p} (x-ray / table wording, shown by the lab page if at all)`) });
        out.counts.engine = (out.counts.engine || 0) + 1;
      }
    }
    // fillText / strokeText call sites: what is drawn
    if (DRAWN(rel)) {
      for (const m of code.matchAll(/\.(fillText|strokeText)\(\s*/g)) {
        const rest = code.slice(m.index + m[0].length);
        let depth = 0, k = 0;
        for (; k < rest.length; k++) { const c = rest[k]; if ('([{'.includes(c)) depth++; else if (')]}'.includes(c)) { if (depth === 0) break; depth--; } else if (c === ',' && depth === 0) break; }
        const arg = rest.slice(0, k).trim();
        const line = src.slice(0, m.index).split('\n').length;
        let how;
        if (/^(['"`]).*\1$/s.test(arg)) how = 'literal (checked above)';
        else if (/^(S|cue|c)\.\w+$/.test(arg) || /^String\(S\.\w+\)$/.test(arg)) how = 'a signal (checked by the signals scan)';
        else if (/^String\(\w+\)$/.test(arg) || /\.toFixed\(\d\)$/.test(arg)) how = 'a number made text';
        else how = 'unresolved statically';
        calls.push({ where: `${rel}:${line}`, call: m[1], arg, how });
      }
    }
  }
  out.drawCalls = calls;
}

function data(out) {
  for (const f of fs.readdirSync(path.join(ROOT, 'data'))) {
    if (!f.endsWith('.json') || f === 'voice.json') continue;
    const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));
    const walk = (v, p) => {
      if (typeof v === 'string') { const w = banned(v).filter((x) => x !== 'learning rate' || /learning/i.test(v)); if (w.length) out.info.push({ kind: 'data', where: `data/${f} ${p}`, text: v.slice(0, 120), problems: w }); return; }
      if (Array.isArray(v)) { if (v.length && typeof v[0] !== 'object' && typeof v[0] !== 'string') return; v.forEach((x, i) => walk(x, `${p}[${i}]`)); return; }
      if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, p ? `${p}.${k}` : k);
    };
    walk(j, '');
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const a = args(process.argv.slice(2));
  const out = { fail: [], warn: [], info: [], counts: {} };
  try {
    const mods = {
      signals: await import(pathToFileURL(path.join(ROOT, 'src/signals.js')).href),
      rules: await import(pathToFileURL(path.join(ROOT, 'src/rules.js')).href),
    };
    const engines = await spoken(out, mods);
    // --line "<text>": judge an extra spoken line (proves the spoken rules can fail)
    for (const t of [].concat(a.line || [])) if (t !== true) judge('spoken', String(t), '--line (planted)', out);
    signalStrings(out, engines);
  } catch (e) {
    out.fail.push({ kind: 'engine', where: 'src/signals.js', text: '', problems: [`the engine could not be built: ${e.message}`] });
  }
  // --plant <fixture>=<as path>: scan a fixture as if it were a film file (proves the drawn rules can fail)
  const planted = new Map();
  for (const p of [].concat(a.plant || [])) { if (p === true) continue; const [from, as] = String(p).split('='); planted.set(as, path.resolve(from)); }
  literals(out, planted);
  data(out);
  const L = [];
  L.push(`words check: ${Object.entries(out.counts).map(([k, n]) => `${n} ${k}`).join(', ')} strings`);
  if (out.spoken) L.push(`  spoken: ${out.spoken.distinct} distinct lines (${out.spoken.swept} from the line-table sweep)${out.spoken.sweepErrors.length ? `; sweep errors: ${out.spoken.sweepErrors.join('; ')}` : ''}`);
  if (out.signals) L.push(`  signals: ${out.signals.distinct} distinct strings over every frame of every ending`);
  const unres = out.drawCalls.filter((c) => c.how === 'unresolved statically');
  L.push(`  draw calls: ${out.drawCalls.length} fillText / strokeText (${unres.length} unresolved statically)`);
  for (const c of unres) L.push(`    ? ${c.where} ${c.call}(${c.arg.slice(0, 60)})`);
  for (const f of out.fail) L.push(`  FAIL [${f.kind}] ${f.where}: ${f.problems.join('; ')}: "${f.text.slice(0, 90)}"`);
  for (const w of out.warn) L.push(`  WARN [${w.kind}] ${w.where}: ${w.problems.join('; ')}: "${w.text.slice(0, 90)}"`);
  for (const i of out.info) L.push(`  INFO [${i.kind}] ${i.where}: ${i.problems.join(', ')}: "${i.text.slice(0, 90)}"`);
  out.verdict = out.fail.length ? 'FAIL' : 'PASS';
  L.push(`  ${out.verdict}`);
  console.log(L.join('\n'));
  if (a.out) fs.writeFileSync(a.out, JSON.stringify(out, null, 1));
  process.exit(out.fail.length ? 1 : 0);
}
