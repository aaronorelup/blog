// THE QUIET HOUR: the honesty audit (bible sections 1.2, 1.4, 9 and 10). The film's promise: nothing the viewer sees
// or hears is keyed to film time or to the ending's name, except the FORMAT list in bible section 9.
//
//   node make/check-honesty.mjs [--out report.json] [--static-only | --no-test-engine] [--allow make/honesty-allow.json]
//                               [--runs <runs-dir>]   (passed to make/test-engine.mjs; else QH_RUNS; without it the
//                                                      engine test skips its checks against the run files, a WARN here)
//                               [--plant <fixture.js>=<as path>]   (scan a fixture as a film file: proves the scan can fail)
//
// Exits 1 if anything fails, 2 on a usage error. Two halves:
//
// (a) STATIC. Every .js file of the film (film.js, src/**) is lexed (comments dropped, strings kept apart), then:
//     clock     Date, performance.now, setTimeout, setInterval, requestAnimationFrame, Math.random in the render path
//     ending    a string literal that is an ending's name ('main', 'alone', 'x3', 'x10'), or any use of a variable
//               named ending outside film.js (the loader)
//     compare   a comparison whose one side holds a frame / note / bar / time variable and whose other side is only
//               numbers and named constants (f >= R.CHALK_FRAME, nf === 0, g > c.breakNote ...)
//     literal   a bare number that is a FORMAT frame, note or programme second (1440, 1410, 2135, 288 ...), or a
//               'MM:SS' string
//     format    a use of a FORMAT time constant or helper by name (CHALK_FRAME, BREAK_NOTE, chalkBusy ...)
//     reads     an art file (src/programme, src/room, src/post.js, src/subtitles.js, film.js) reading a frame-keyed
//               signal (S.frame, S.clock, S.crankAngle, S.titleSlide, S.chalk ...) or a variable named frame
//     Every hit must match an entry of make/honesty-allow.json (file, rule, a piece of the line's text, and the bible's
//     reason). Anything not allowed fails. Entries that match nothing are listed (stale) but do not fail.
//     The lab page's own controls (src/player.js, src/ui/) are outside the film's frame: they are scanned and listed,
//     never failed.
// (b) DYNAMIC, with the engine in Node:
//     1. make/test-engine.mjs is run as it is (it already proves: main's data relabelled as every other ending gives
//        identical signals, cues, events; frames 0..1439 identical in all endings; FORMAT events at FORMAT frames; a
//        flat log keeps every non-FORMAT event at note 0). Its sections 2, 5 and 8 must have no FAIL.
//     2. For each ending, every event in engine.events is either FORMAT or carries log values that caused it: each
//        value it carries is matched against the raw log row (engine.note) and the event's condition is re-checked
//        from that row. An event that carries no log value at all fails.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const ENDING_NAMES = ['main', 'alone', 'x3', 'x10'];

function args(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    a[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  }
  return a;
}

// ---- a small JavaScript lexer: comments out, strings apart, line numbers kept --------------------------------------
const KEYWORDS_BEFORE_REGEX = new Set(['return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'throw', 'new', 'else', 'do', 'yield', 'await']);
export function lex(src) {
  const code = src.split('');          // comments blanked
  const bare = src.split('');          // comments and string contents blanked
  const strings = [];
  const blank = (arr, a, b) => { for (let k = a; k < b; k++) if (arr[k] !== '\n') arr[k] = ' '; };
  const lineAt = (() => { const starts = [0]; for (let k = 0; k < src.length; k++) if (src[k] === '\n') starts.push(k + 1); return (pos) => { let lo = 0, hi = starts.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (starts[m] <= pos) lo = m; else hi = m - 1; } return lo + 1; }; })();
  let lastSig = '';                    // last significant token (for regex detection)
  function scan(i, stopAtBrace) {
    let depth = 0;
    while (i < src.length) {
      const c = src[i], d = src[i + 1];
      if (c === '/' && d === '/') { const e = src.indexOf('\n', i); const end = e < 0 ? src.length : e; blank(code, i, end); blank(bare, i, end); i = end; continue; }
      if (c === '/' && d === '*') { const e = src.indexOf('*/', i + 2); const end = e < 0 ? src.length : e + 2; blank(code, i, end); blank(bare, i, end); i = end; continue; }
      if (c === '"' || c === "'") {
        let j = i + 1, text = '';
        while (j < src.length && src[j] !== c && src[j] !== '\n') { if (src[j] === '\\') { text += src[j + 1]; j += 2; } else text += src[j++]; }
        strings.push({ line: lineAt(i), text, quote: c, start: i, end: j + 1 });
        blank(bare, i + 1, j); i = j + 1; lastSig = 'str'; continue;
      }
      if (c === '`') { i = template(i); lastSig = 'str'; continue; }
      if (c === '/') {
        const prevWord = /[A-Za-z_$][\w$]*$/.exec(src.slice(Math.max(0, i - 20), i).trimEnd());
        const regexOk = lastSig === '' || /[(,=:[!&|?{};+\-*%<>~^]$/.test(lastSig) || (prevWord && KEYWORDS_BEFORE_REGEX.has(prevWord[0]) && lastSig === prevWord[0]);
        if (regexOk) {
          let j = i + 1, cls = false;
          while (j < src.length && src[j] !== '\n') { if (src[j] === '\\') { j += 2; continue; } if (src[j] === '[') cls = true; else if (src[j] === ']') cls = false; else if (src[j] === '/' && !cls) break; j++; }
          j++; while (/[a-z]/.test(src[j] || '')) j++;
          blank(bare, i + 1, j - 1); i = j; lastSig = 'regex'; continue;
        }
      }
      if (stopAtBrace) { if (c === '{') depth++; else if (c === '}') { if (depth === 0) return i; depth--; } }
      if (!/\s/.test(c)) {
        const w = /^[A-Za-z_$][\w$]*/.exec(src.slice(i, i + 64));
        if (w) { lastSig = w[0]; i += w[0].length; continue; }
        lastSig = c;
      }
      i++;
    }
    return i;
  }
  function template(i) {
    let j = i + 1, text = '';
    const start = i;
    while (j < src.length && src[j] !== '`') {
      if (src[j] === '\\') { text += src[j + 1]; j += 2; continue; }
      if (src[j] === '$' && src[j + 1] === '{') {
        blank(bare, i + 1, j);                                  // the static part so far
        const e = scan(j + 2, true);
        text += '${}'; j = e + 1; i = e; continue;
      }
      text += src[j++];
    }
    blank(bare, i + 1, j);
    strings.push({ line: lineAt(start), text, quote: '`', start, end: j + 1, template: true });
    return j + 1;
  }
  scan(0, false);
  return { code: code.join(''), bare: bare.join(''), strings, lineAt };
}

// ---- the static rules -------------------------------------------------------------------------------------------------
const ART = (rel) => /^src\/(programme|room)\//.test(rel) || ['src/post.js', 'src/subtitles.js', 'film.js'].includes(rel);
const LAB_PAGE = (rel) => rel === 'src/player.js' || rel.startsWith('src/ui/');
const TIMEISH = /^(f|f0|fr|g|nf|cs|frame|frames?|note|bar)$|(Frame|Note|Bar|Clock|Seconds|Minutes|Phase)$|^(frame|note|bar|clock|seconds|minutes|phase)[A-Z]/;
const NOT_TIMEISH = /^(NOTE_FRAMES|BAR_FRAMES|NOTES|NOTES_PER_BAR|noteAt|noteFrame|frameAtClock)$/;
// FORMAT time constants and helpers by name (bible 9), and the film's ends
const FORMAT_NAME = /^(BREAK_(NOTE|FRAME)|L\d+A?_FRAME|GN_FRAME|CHALK_(?!TEXT)\w+|CARD_\w+|LID_\w+|DIAL_TAP_\w+|FORMAT_FRAMES|TOTAL_FRAMES|CODA_FRAMES|BLACK_FRAME|breakNote|frameAtClock|chalk(Busy|Progress|Tick\w*)|cardSlide)$/;
const FRAME_SIGNALS = ['frame', 'note', 'noteFrame', 'phase', 'bar', 'barFrame', 'barPhase', 'isNoteStart', 'isBarLine',
  'clockSeconds', 'clock', 'filmSeconds', 'crankAngle', 'wallMinutes', 'wallClock', 'minuteAngle', 'hourAngle',
  'titleSlide', 'titleVisible', 'chalk', 'flagsT', 'punch', 'lidClosed', 'subtitleStart'];
// FORMAT frames and their notes, the programme seconds of the taps and the turn, the film's ends
const NUMS = new Set([360, 720, 1080, 1800, 1410, 1440, 1445, 1450, 2130, 2135, 2160, 2159, 2399, 2400, 1439,
  72, 144, 216, 282, 288, 287, 289, 426, 427, 431, 432, 300, 600, 900, 1200, 1500]);

function operand(line, pos, dir) {
  // the operand next to a comparison operator at pos (dir -1: to the left, +1: to the right), at bracket depth 0
  let depth = 0, k = pos, out = '';
  const stop = dir < 0 ? /[,;?:{}]/ : /[,;?:{}]/;
  while (k >= 0 && k < line.length) {
    const c = line[k];
    const two = dir < 0 ? line.slice(k - 1, k + 1) : line.slice(k, k + 2);
    if (depth === 0 && (two === '&&' || two === '||' || two === '??')) break;
    if (depth === 0 && stop.test(c)) break;
    if (dir < 0 && depth === 0 && c === '=' && !/[=!<>]/.test(line[k - 1] || '') && line[k + 1] !== '=') break;
    if (dir < 0 && depth === 0 && c === '>' && line[k - 1] === '=') break;                 // an arrow: =>
    if (dir > 0 && depth === 0 && /[<>=!]/.test(c) && /^(===|!==|==|!=|<=|>=|<|>)/.test(line.slice(k)) && line[k + 1] !== '>' && line[k - 1] !== '=') break;
    if ('([{'.includes(c)) { if (dir > 0) depth++; else { if (depth === 0) break; depth--; } }
    if (')]}'.includes(c)) { if (dir < 0) depth++; else { if (depth === 0) break; depth--; } }
    if (dir < 0 && depth === 0 && /\breturn$/.test(line.slice(0, k + 1))) { out = out.replace(/^eturn/, ''); break; }
    out = dir < 0 ? c + out : out + c;
    k += dir;
  }
  return out.trim();
}
const idents = (s) => (s.match(/[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*/g) || []);
const lastSeg = (p) => p.split('.').at(-1);
const isConstExpr = (s) => s.length > 0 && !/['"`]/.test(s) && idents(s).every((p) => {
  const l = lastSeg(p);
  return /^[A-Z][A-Z0-9_]*$/.test(l) || l === 'breakNote' || l === 'Math' || l === 'PI' || /^(Math\.\w+)$/.test(p);
}) && !/\(\s*[a-z]/.test(s.replace(/Math\.\w+\(/g, '('));
// the operand's own top level: an index [..] or a call's arguments (other than Math.*) are a lookup, not the operand
function topLevel(s) {
  let out = '', i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '[' || (c === '(' && /[\w$]\s*$/.test(out) && !/Math\.\w+\s*$/.test(out))) {
      const open = c, close = c === '[' ? ']' : ')';
      let d = 0, j = i;
      for (; j < s.length; j++) { if (s[j] === open) d++; else if (s[j] === close && --d === 0) break; }
      out += open + close; i = j + 1; continue;
    }
    out += c; i++;
  }
  return out;
}
const hasTime = (s) => idents(topLevel(s)).some((p) => { const l = lastSeg(p); return TIMEISH.test(l) && !NOT_TIMEISH.test(l) && !/^[A-Z][A-Z0-9_]*$/.test(l); });

export function scanFile(rel, src) {
  const { code, bare, strings } = lex(src);
  const lines = bare.split('\n'), srcLines = src.split('\n');
  const hits = [];
  const add = (rule, line, detail) => hits.push({ file: rel, line, rule, detail, text: srcLines[line - 1].trim() });
  const renderPath = !LAB_PAGE(rel);
  lines.forEach((ln, i) => {
    const n = i + 1;
    if (renderPath) {
      for (const m of ln.matchAll(/\bDate\b|performance\s*\.\s*now|\bsetTimeout\b|\bsetInterval\b|\brequestAnimationFrame\b|Math\s*\.\s*random/g)) add('clock', n, m[0]);
    }
    // comparisons
    for (const m of ln.matchAll(/===|!==|==|!=|<=|>=|(?<![<=])<(?![<=])|(?<![>=])>(?![>=])/g)) {
      const at = m.index, op = m[0];
      if (op === '>' && ln[at - 1] === '=') continue;                 // =>
      const L = operand(ln, at - 1, -1), R = operand(ln, at + op.length, 1);
      if (!L || !R) continue;
      if ((hasTime(L) && isConstExpr(R)) || (hasTime(R) && isConstExpr(L))) add('compare', n, `${L} ${op} ${R}`);
    }
    for (const m of ln.matchAll(/(?<![\w$.])(\d+)(?![\w$.])/g)) {
      if (!NUMS.has(Number(m[1]))) continue;
      const before = ln.slice(0, m.index);
      if (/\b(x|y|w|h|r|dx|dy|len|rot|width|height|size|exitX)\s*:\s*-?$/.test(before)) continue;      // geometry, not time
      if (/\b(height|width)\s*[/*]\s*$/.test(before) || /^\s*[/*]\s*(height|width)\b/.test(ln.slice(m.index + m[1].length))) continue; // a resolution scale
      add('literal', n, m[1]);
    }
    for (const m of ln.matchAll(/(?<![\w$])[A-Za-z_$][\w$]*/g)) if (FORMAT_NAME.test(m[0])) add('format', n, m[0]);
    if (rel !== 'film.js') for (const m of ln.matchAll(/(?<![\w$])(ending|endingName|endingData\.ending|meta\.ending)(?![\w$])/g)) add('ending', n, m[1]);
    if (ART(rel)) {
      for (const m of ln.matchAll(/\b(?:S|signals|s)\s*\.\s*([A-Za-z_$][\w$]*)/g)) if (FRAME_SIGNALS.includes(m[1])) add('reads', n, `S.${m[1]}`);
      for (const m of ln.matchAll(/(?<![\w$.])frame(?![\w$])/g)) add('reads', n, 'frame');
    }
  });
  for (const s of strings) {
    if (ENDING_NAMES.includes(s.text)) add('ending', s.line, `'${s.text}'`);
    if (/^\d\d:\d\d$/.test(s.text)) add('literal', s.line, `'${s.text}'`);
  }
  void code;
  return hits;
}

function listFiles() {
  const out = ['film.js'];
  const walk = (d) => { for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) { const r = `${d}/${e.name}`; if (e.isDirectory()) walk(r); else if (/\.(m?js)$/.test(e.name)) out.push(r); } };
  walk('src');
  return out.sort();
}

function matchAllow(hit, allow) {
  for (const a of allow) {
    const fileOk = a.file === '*' || a.file === hit.file || (a.file.endsWith('/') && hit.file.startsWith(a.file));
    if (!fileOk || (a.rule !== '*' && a.rule !== hit.rule)) continue;
    if (a.detail && !new RegExp(a.detail).test(hit.detail)) continue;
    if (a.regex ? new RegExp(a.regex).test(hit.text) : a.match === undefined || hit.text.includes(a.match)) return a;
  }
  return null;
}

// ---- dynamic: the engine's events against the raw log -------------------------------------------------------------------
function dynamic(skipTestEngine, runs) {
  const res = { testEngine: null, events: {} , failures: [], warnings: [] };
  if (skipTestEngine) { res.testEngine = { exit: null, summary: 'skipped (--no-test-engine)' }; res.warnings.push('make/test-engine.mjs was not run (--no-test-engine)'); return res; }
  // 1. the engine's own test, as it is
  const runsDir = runs ? path.resolve(runs) : (process.env.QH_RUNS || null);
  if (runsDir && !fs.existsSync(runsDir)) { res.failures.push(`runs folder not found: ${runsDir}`); return res; }
  if (!runsDir) res.warnings.push('no --runs <dir> (or QH_RUNS): make/test-engine.mjs skipped its checks against the run files');
  const t = spawnSync('nice', ['-n', '5', process.execPath, path.join(HERE, 'test-engine.mjs'), ...(runsDir ? [runsDir] : [])], { encoding: 'utf8', maxBuffer: 64 << 20 });
  const out = (t.stdout || '') + (t.stderr || '');
  let section = '?';
  const bySection = {};
  for (const line of out.split('\n')) {
    const s = /^-- (\S+)/.exec(line);
    if (s) { section = s[1]; continue; }
    if (/^FAIL /.test(line)) (bySection[section] ||= []).push(line.slice(5));
  }
  const summary = /(\d+) checks, (\d+) failed/.exec(out);
  res.testEngine = { runs: runsDir, exit: t.status, summary: summary ? summary[0] : out.trim().split('\n').slice(-3).join(' | '), failsBySection: bySection };
  for (const sec of ['2', '5', '8']) for (const f of bySection[sec] || []) res.failures.push(`test-engine section ${sec}: ${f}`);
  if (summary && t.status !== 0 && !Object.keys(bySection).length) res.failures.push(`test-engine exited ${t.status}`);
  if (!summary) res.failures.push(`test-engine did not finish: ${out.trim().split('\n').slice(-4).join(' | ')}`);
  for (const [sec, fs_] of Object.entries(bySection)) if (!['2', '5', '8'].includes(sec)) res.warnings.push(`test-engine section ${sec} (not an honesty section): ${fs_.length} FAIL, first: ${fs_[0]}`);
  return res;
}

const LN32 = Math.log(32);
const fin = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const same = (v, x) => {
  if (v === null || v === undefined || typeof v === 'string') return fin(x) === null || String(v) === String(x);
  if (typeof v === 'boolean') return v === x;
  if (fin(x) === null) return false;
  return Math.abs(v - x) <= 2e-5 * Math.max(1, Math.abs(x));
};

/** Every value an event carries, matched against the log. Returns { matched: [keys], mismatched: [..], other: [..] } */
function matchValues(ev, eng, ctx) {
  const n = (g) => (g >= 0 && g < 432 ? eng.note(g) : null);
  const g = ev.triggerNote ?? ev.note;
  const row = n(g);
  const field = { err: 'held', share: 'heldAcc', sharp: 'sharp', ratio: 'ratio', lr: 'lr', ptok: 'ptok', pick: 'tok', entropy: 'entropy', massInKey: 'massInKey', train: 'train', held: 'held', heldAcc: 'heldAcc' };
  const matched = [], mismatched = [], other = [];
  for (const [k, v] of Object.entries(ev.values || {})) {
    let want;
    const last = /^(\w+?)Last(\d+)$/.exec(k);
    if (field[k] && row) want = row[field[k]];
    else if (last && field[last[1]]) {
      const N = Number(last[2]);
      want = Array.from({ length: N }, (_, i) => n(g - N + 1 + i)?.[field[last[1]]]);
      const okArr = Array.isArray(v) && v.length === want.length && v.every((x, i) => same(x, want[i]));
      (okArr ? matched : mismatched).push(`${k}`); continue;
    }
    else if (k === 'lrBefore') want = n(g - 1)?.lr;
    else if (/^lr(\d+)$/.test(k)) want = n(Number(k.slice(2)))?.lr;
    else if (k === 'share20') want = n(288)?.heldAcc;
    else if (k === 'err20') want = n(288)?.held;
    else if (k === 'limit20' || k === 'chalk') want = eng.meta.limit20;
    else if (k === 'limitNow' || k === 'limit') want = ctx.limitNow(g, eng);
    else if (k === 'median3') want = ctx.median3(g, eng);
    else if (k === 'ratioNow') want = ctx.ratioNow(g, eng);
    else if (k === 'err6') want = mean(Array.from({ length: 6 }, (_, i) => n(g - 5 + i)?.held));
    else if (k === 'meanVel6') want = mean(Array.from({ length: 6 }, (_, i) => { const r = n(g - 5 + i); return r && r.pluckVel !== null ? r.pluckVel : 0; }));
    else if (ev.kind === 'knob-turn' && k === 'to') want = row?.lr;
    else if (ev.kind === 'knob-turn' && k === 'from') { want = [...Array(g).keys()].reverse().map((j) => n(j).lr).find((x) => !same(x, row.lr)); }
    else if (k === 'times' && ev.id === 'L6b') want = n(288).lr / eng.meta.limit20;
    else if (k === 'times' && ev.id === 'L8') want = ctx.limitNow(g, eng) / eng.meta.limit20;
    else { other.push(k); continue; }
    (same(v, want) ? matched : mismatched).push(`${k}=${JSON.stringify(v)}${same(v, want) ? '' : ` (log: ${want})`}`);
  }
  return { matched, mismatched, other };
}
const mean = (a) => (a.some((x) => fin(x) === null) ? NaN : a.reduce((s, x) => s + x, 0) / a.length);

/** The event's own condition, re-checked from the raw log row(s). null = no check written for this kind. */
function condition(ev, eng, ctx) {
  const n = (g) => eng.note(g), g = ev.triggerNote ?? ev.note, r = n(g);
  const worse = (e) => !(e <= LN32 + 1e-9);
  const lastN = (N, k) => Array.from({ length: N }, (_, i) => (g - N + 1 + i >= 0 ? n(g - N + 1 + i)[k] : NaN));
  switch (ev.kind) {
    case 'hands-out': case 'window-dark': return worse(r.held);
    // (v1.1) the window and the hands share one switch: back after 6 notes in a row at or below ln 32
    case 'hands-back': case 'window-lit': return g >= 5 && lastN(6, 'held').every((e) => !worse(e));
    case 'hum-off': return g > 0 && n(g - 1).lr !== r.lr;
    case 'hum-on': return lastN(7, 'lr').every((x, i, a) => x === a[0]);
    case 'hairlines-on': return ctx.ratioNow(g, eng) !== null && ctx.ratioNow(g, eng) > 1;
    case 'hairlines-off': return !(ctx.ratioNow(g, eng) > 1);
    case 'tears-on': case 'tears-off': {
      let best = Infinity; for (let j = 0; j <= g; j++) if (n(j).held < best) best = n(j).held;
      const amt = Number.isFinite(r.held) ? Math.min(1, Math.max(0, Math.log(r.held / best) / Math.log(250))) : 1;
      return (Math.floor(8 * amt) >= 1) === (ev.kind === 'tears-on');
    }
    case 'spoon-on': case 'spoon-off': {
      const v = mean(Array.from({ length: 6 }, (_, i) => (g - 5 + i >= 0 && n(g - 5 + i).pluckVel !== null ? n(g - 5 + i).pluckVel : 0)));
      return (v >= 0.95) === (ev.kind === 'spoon-on');
    }
    case 'warmth-full': case 'warmth-zero': {
      let best20 = Infinity; for (let j = 0; j <= 288; j++) if (n(j).held < best20) best20 = n(j).held;
      const e6 = mean(lastN(6, 'held'));
      const k = Number.isFinite(e6) ? Math.min(1, Math.max(0, (LN32 - e6) / (LN32 - best20))) : 0;
      return ev.kind === 'warmth-full' ? k === 1 : k === 0;
    }
    case 'blocks-on': return !(r.held <= 10 * LN32);
    case 'blocks-off': return r.held <= 10 * LN32;
    case 'hatch-gone': return g > 288 ? !(r.sharp > 0) : !(ctx.limitNow(g, eng) > 0);   // (v1.1) a reading after 20:00
    case 'hatch-back': return ctx.limitNow(g, eng) > 0;
    case 'pick-out-of-key': return eng.meta.tokens[r.tok]?.inKey === false;
    case 'first-certain': return r.ptok === 1;
    case 'flags': return Math.round(10 * r.heldAcc) !== Math.round(10 * n(g - 6).heldAcc);
    case 'knob-turn': return true;                                     // its value match is the check
    case 'line': case 'line-dropped': {
      switch (ev.id) {
        case 'L3': return r.massInKey >= 0.95;
        case 'L4': return r.heldAcc >= 0.5;
        case 'YES': return r.ptok >= 0.95;
        case 'L5': return ctx.ratioNow(g, eng) >= 0.25;
        case 'L6b': return true;
        case 'L7': return g > 288 && r.heldAcc <= n(288).heldAcc - 0.05 + 1e-12 && r.heldAcc >= n(288).heldAcc / 2;
        case 'L8': return g > 288 && ctx.limitNow(g, eng) >= 1.8 * eng.meta.limit20 - 1e-12;
        case 'L9': return g > 288 && r.heldAcc < n(288).heldAcc / 2;
        case 'L10': return lastN(6, 'held').every((e) => !worse(e));
        default: return null;
      }
    }
    default: return null;
  }
}

async function eventsAudit(res) {
  const { createEngine, voiceLengths } = await import(pathToFileURL(path.join(ROOT, 'src/signals.js')).href);
  const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', p), 'utf8'));
  const shared = read('shared.json');
  const voiceDurations = fs.existsSync(path.join(ROOT, 'data/voice.json')) ? voiceLengths(read('voice.json')) : undefined;
  // the limit right now, recomputed here from the raw sharpness readings by bible 3 v1.1: 2 / the median of the last 3
  // readings; gone for good from the first reading after 20:00 that is zero, negative or not a number
  const median = (a) => { const b = [...a].sort((x, y) => x - y); return b[(b.length - 1) >> 1]; };
  const ctx = {
    median3(g, eng) {
      const a = [0, 1, 2].map((i) => (g - 2 + i >= 0 ? eng.note(g - 2 + i).sharp : NaN)).filter((x, i) => g - 2 + i >= 0);
      return a.every((x) => Number.isFinite(x)) ? median(a) : NaN;
    },
    lost(g, eng) { for (let j = 289; j <= g; j++) if (!(eng.note(j).sharp > 0)) return true; return false; },
    limitNow(g, eng) { if (ctx.lost(g, eng)) return null; const m = ctx.median3(g, eng); return m > 0 ? 2 / m : null; },
    ratioNow(g, eng) { const L = ctx.limitNow(g, eng); return L === null ? null : eng.note(g).lr / L; },
  };
  for (const name of ENDING_NAMES) {
    const eng = createEngine(shared, read(`ending-${name}.json`), { voiceDurations });
    const rows = [];
    for (const ev of eng.events) {
      if (ev.format) { rows.push({ ev, status: 'FORMAT' }); continue; }
      const mv = matchValues(ev, eng, ctx);
      let cond = null;
      try { cond = condition(ev, eng, ctx); } catch (e) { cond = `error: ${e.message}`; }
      let status = 'ok', why = '';
      if (mv.mismatched.length) { status = 'FAIL'; why = `values do not match the log: ${mv.mismatched.join(', ')}`; }
      else if (!mv.matched.length) { status = 'FAIL'; why = `carries no log value (values: ${JSON.stringify(ev.values)})`; }
      else if (cond === false) { status = 'FAIL'; why = 'its condition does not hold on the log row'; }
      else if (typeof cond === 'string') { status = 'FAIL'; why = cond; }
      else if (cond === null) { status = 'ok-unchecked'; why = 'values match the log; no condition check written for this kind'; }
      rows.push({ ev, status, why, matched: mv.matched });
    }
    const fails = rows.filter((r) => r.status === 'FAIL');
    const byKind = {};
    for (const r of rows) { const k = `${r.ev.kind}${r.ev.id ? ':' + r.ev.id : ''}`; (byKind[k] ||= { n: 0, status: {} }).n++; byKind[k].status[r.status] = (byKind[k].status[r.status] || 0) + 1; }
    res.events[name] = { total: rows.length, format: rows.filter((r) => r.status === 'FORMAT').length, failed: fails.length,
      unchecked: rows.filter((r) => r.status === 'ok-unchecked').map((r) => r.ev.kind).filter((v, i, a) => a.indexOf(v) === i),
      byKind, failures: fails.map((r) => ({ kind: r.ev.kind, id: r.ev.id ?? null, frame: r.ev.frame, note: r.ev.note, why: r.why })) };
    // group the failures by kind for the summary
    const grouped = {};
    for (const f of fails) { const k = `${f.ev.kind}${f.ev.id ? ':' + f.ev.id : ''}: ${f.why.replace(/\(values: .*\)/, '').replace(/=.*?(,|$)/g, '$1')}`; (grouped[k] ||= []).push(f.ev.frame); }
    for (const [k, frames] of Object.entries(grouped)) res.failures.push(`${name}: event ${k} (${frames.length}x, frames ${frames.slice(0, 6).join(' ')}${frames.length > 6 ? ' ...' : ''})`);
  }
}

// ---- main ------------------------------------------------------------------------------------------------------------
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const a = args(process.argv.slice(2));
  const allowFile = path.resolve(a.allow || path.join(HERE, 'honesty-allow.json'));
  let allow = [];
  try { allow = JSON.parse(fs.readFileSync(allowFile, 'utf8')).allow; } catch (e) { console.error(`check-honesty: cannot read ${allowFile}: ${e.message}`); process.exit(2); }
  // --plant <fixture>=<as path>: scan a fixture file as if it were a film file (proves the scan can fail)
  const planted = new Map();
  for (const p of [].concat(a.plant || [])) { if (p === true) continue; const [from, as] = String(p).split('='); planted.set(as, path.resolve(from)); }
  const files = [...listFiles(), ...planted.keys()];
  const digests = {};
  const hits = [];
  for (const rel of files) {
    const src = fs.readFileSync(planted.get(rel) ?? path.join(ROOT, rel), 'utf8');
    digests[rel] = (await import('node:crypto')).createHash('sha256').update(src).digest('hex').slice(0, 16);
    hits.push(...scanFile(rel, src));
  }
  const used = new Map();
  const failing = [], allowed = [], lab = [];
  for (const h of hits) {
    if (LAB_PAGE(h.file)) { lab.push(h); continue; }
    const m = matchAllow(h, allow);
    if (m) { allowed.push({ ...h, reason: m.reason }); used.set(m, (used.get(m) || 0) + 1); } else failing.push(h);
  }
  const stale = allow.filter((x) => !used.has(x));
  const report = { files: digests, static: { hits: hits.length, failing, allowed: allowed.length, labPage: lab, stale, allowCounts: allow.map((x) => ({ ...x, hits: used.get(x) || 0 })) } };
  const L = [];
  L.push(`honesty audit: ${files.length} files (${files.filter(LAB_PAGE).length} lab-page files listed, not failed)`);
  L.push(`  static: ${hits.length} hits, ${allowed.length} allowed by ${allow.length - stale.length} of ${allow.length} allowlist entries, ${failing.length} NOT allowed, ${lab.length} in the lab page`);
  for (const h of failing) L.push(`    FAIL ${h.file}:${h.line} [${h.rule}] ${h.detail}    | ${h.text.slice(0, 110)}`);
  for (const s of stale) L.push(`    stale allow entry (matches nothing now): ${s.file} [${s.rule}] ${s.detail ? 'detail /' + s.detail + '/ ' : ''}"${s.match ?? s.regex ?? ''}"`);
  let dyn = { failures: [], warnings: [] };
  if (!a['static-only']) {
    dyn = dynamic(a['no-test-engine'], typeof a.runs === 'string' ? a.runs : null);
    try { await eventsAudit(dyn); } catch (e) { dyn.failures.push(`the engine could not be built or audited: ${e.message}`); }
    L.push(`  dynamic: test-engine.mjs: ${dyn.testEngine.summary} (exit ${dyn.testEngine.exit})`);
    for (const [name, r] of Object.entries(dyn.events)) L.push(`    ${name}: ${r.total} events, ${r.format} FORMAT, ${r.failed} failed${r.unchecked.length ? `; values matched but no condition check for: ${r.unchecked.join(', ')}` : ''}`);
    for (const f of dyn.failures) L.push(`    FAIL ${f}`);
    for (const w of dyn.warnings) L.push(`    WARN ${w}`);
    report.dynamic = dyn;
  }
  const failed = failing.length + dyn.failures.length;
  report.verdict = failed ? 'FAIL' : 'PASS';
  L.push(`  ${report.verdict}`);
  console.log(L.join('\n'));
  if (a.out) fs.writeFileSync(a.out, JSON.stringify(report, null, 1));
  process.exit(failed ? 1 : 0);
}
