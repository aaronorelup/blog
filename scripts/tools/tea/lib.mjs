// What the tea room's tools share (docs/TEA_ROOM.md, "The tools"): their flags and --help, the server they look at,
// opening a page at a size and waiting until its frame is drawn, places on the page by share or by chapter, contact
// sheets, and where their pictures go. The pure parts are tested in tests/unit/tea-tools.test.mjs.
//
// An address is a path on the last build (/labs/tea-room/engine/, /labs/tea-room/b/) or a whole URL. For a path the tools use
// TEA_BASE if it is set, else a server already answering on this checkout's own tools port, else they start
// `astro preview` on that port themselves and stop it when they finish. Exit codes, the same for every tool:
// 0 the check passed (or there was nothing to check), 1 it failed, 2 the tool could not run (a wrong flag, no build,
// no server).
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import zlib from 'node:zlib';

export const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
export const DEFAULT_PAGE = '/labs/tea-room/engine/';
export const DESKTOP = Object.freeze({ width: 1440, height: 900 });
export const PHONE = Object.freeze({ width: 390, height: 844 });
// Port of this checkout's own (as the e2e config does, but a different range, so a tool never takes the suite's).
export const PORT = 5400 + (createHash('sha1').update(ROOT).digest().readUInt16BE(0) % 1000);

export class Usage extends Error {}

// Flags: { name: { type: 'string' | 'boolean', short?, default?, help } }. Returns { values, positionals }, or prints
// the usage and exits 0 on --help, 2 on a wrong flag.
export function args(argv, { usage, flags }) {
  const options = { help: { type: 'boolean', short: 'h' } };
  for (const [k, f] of Object.entries(flags)) options[k] = { type: f.type ?? 'string', ...(f.short ? { short: f.short } : {}), ...(f.multiple ? { multiple: true } : {}) };
  const text = () => [usage.trim(), '', ...Object.entries(flags).map(([k, f]) =>
    `  --${k}${f.type === 'boolean' ? '' : ' <v>'}`.padEnd(22) + f.help + (f.default !== undefined ? ` (default ${f.default})` : '')),
  '  --help'.padEnd(22) + 'this text', '', 'Exit codes: 0 passed, 1 failed, 2 could not run.'].join('\n');
  let parsed;
  try {
    parsed = parseArgs({ args: argv, options, allowPositionals: true, strict: true });
  } catch (e) {
    console.error(`${e.message}\n\n${text()}`);
    process.exit(2);
  }
  if (parsed.values.help) { console.log(text()); process.exit(0); }
  for (const [k, f] of Object.entries(flags)) if (parsed.values[k] === undefined && f.default !== undefined) parsed.values[k] = f.default;
  return parsed;
}

// "1440x900" -> { width, height }; "phone" and "desktop" are the two sizes the brief names.
export function sizeOf(s) {
  if (s === 'phone') return { ...PHONE };
  if (s === 'desktop') return { ...DESKTOP };
  const m = /^(\d+)x(\d+)$/.exec(String(s ?? ''));
  if (!m) throw new Usage(`not a size: "${s}" (write 1440x900, desktop or phone)`);
  return { width: Number(m[1]), height: Number(m[2]) };
}
export const sizesOf = (s) => String(s).split(',').filter(Boolean).map(sizeOf);
export const isPhone = (size) => size.height > size.width;
export const sizeName = (size) => `${size.width}x${size.height}`;

// A list of numbers "0.1,0.5" or a range "0:1:0.25" (from:to:step, both ends kept).
export function numbers(s) {
  const t = String(s ?? '').trim();
  const r = /^([\d.]+):([\d.]+):([\d.]+)$/.exec(t);
  if (r) {
    const [a, b, step] = r.slice(1).map(Number);
    if (!(step > 0)) throw new Usage(`a range needs a step above 0: "${s}"`);
    const out = [];
    for (let i = 0; a + i * step <= b + 1e-9; i++) out.push(Math.round((a + i * step) * 1e6) / 1e6);
    return out;
  }
  const out = t.split(',').filter(Boolean).map(Number);
  if (!out.length || out.some((n) => !Number.isFinite(n))) throw new Usage(`not a list of numbers: "${s}"`);
  return out;
}

// Appends query parameters to an address, keeping its own.
export function withQuery(address, params) {
  const u = new URL(address, 'http://x');
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== false) u.searchParams.set(k, String(v));
  return /^https?:/.test(address) ? u.href : `${u.pathname}${u.search}${u.hash}`;
}

// The kind of page an address is: the rebuilt room (window.__room), a look (A or B), or anything else.
export function pageKind(address) {
  const p = new URL(address, 'http://x').pathname;
  if (/\/labs\/tea-room\/a\/?/.test(p)) return 'look-a';
  if (/\/labs\/tea-room\/b\/?/.test(p)) return 'look-b';
  return 'room';
}

const answers = async (url) => {
  try { return (await fetch(url, { signal: AbortSignal.timeout(1500) })).ok; } catch { return false; }
};

// The server: { base, stop }. stop() ends only a server this call started.
export async function server({ quiet = false } = {}) {
  if (process.env.TEA_BASE) return { base: process.env.TEA_BASE.replace(/\/$/, ''), stop: async () => {} };
  const base = `http://localhost:${PORT}`;
  if (await answers(`${base}/version.json`)) return { base, stop: async () => {} };
  if (!fs.existsSync(path.join(ROOT, 'dist', 'index.html'))) throw new Usage('there is no build to serve: run npm run build first (or set TEA_BASE)');
  const child = spawn('npx', ['astro', 'preview', '--port', String(PORT), '--ignore-lock'], { cwd: ROOT, detached: true, stdio: 'ignore' });
  const stop = async () => { try { process.kill(-child.pid, 'SIGTERM'); } catch {} };
  process.once('exit', () => { try { process.kill(-child.pid, 'SIGTERM'); } catch {} });
  for (const sig of ['SIGINT', 'SIGTERM']) process.once(sig, () => { stop(); process.exit(2); });
  for (let i = 0; i < 120; i++) {
    if (await answers(`${base}/version.json`)) {
      if (!quiet) console.error(`(serving the last build at ${base}; stopped when this tool ends)`);
      return { base, stop };
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  await stop();
  throw new Usage(`astro preview did not answer on port ${PORT} within a minute`);
}
export const urlOf = (base, address) => (/^https?:/.test(address) ? address : `${base}${address.startsWith('/') ? '' : '/'}${address}`);

export async function browser() {
  const { chromium } = await import('@playwright/test');
  return chromium.launch();
}

// A page at a size. A phone size is a touch device, as the e2e phone project is (in Chromium here). dpr 1 unless
// asked, so a frame's pixels are CSS pixels.
export async function openPage(b, url, size, { dpr = 1, reducedMotion } = {}) {
  const phone = isPhone(size);
  const ctx = await b.newContext({ viewport: size, deviceScaleFactor: dpr, isMobile: phone, hasTouch: phone, ...(reducedMotion ? { reducedMotion } : {}) });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load' });
  await ready(page);
  return page;
}

// The frame is drawn: the room's settled(), look B's __ready, look A's data-ready; any other page after load.
export async function ready(page, timeout = 45_000) {
  await page.waitForFunction(() => {
    if (window.__room) return !!window.__room.settled?.();
    return window.__ready === true || document.documentElement.dataset.ready === '1' || !document.querySelector('[data-track], .chapter');
  }, null, { timeout });
  // the looks draw on the next animation frames after a scroll; two of them, then the browser's own paint
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

// Text hidden on a page that has no ?words=0 of its own (the looks): every glyph made transparent, the paper and
// the pictures kept, as the room's ?words=0 does.
export const HIDE_WORDS_CSS = 'body *, body *::before, body *::after { color: transparent !important; text-shadow: none !important; -webkit-text-stroke: 0 !important; text-decoration-color: transparent !important; caret-color: transparent !important }';
export async function hideWords(page) {
  if (await page.evaluate(() => !!window.__room)) return; // the room hides them itself with ?words=0
  await page.addStyleTag({ content: HIDE_WORDS_CSS });
}

// The page's sections: [{ id, top, height }] in px, and the page's vh and scroll range.
export const measure = (page) => page.evaluate(() => {
  const vh = document.querySelector('.room-lvh')?.getBoundingClientRect().height || innerHeight;
  const room = !!window.__room;
  const els = room ? [...document.querySelectorAll('[data-room-chapter]')] : [...document.querySelectorAll('main section[id], body > section[id], section[id]')];
  const seen = new Set();
  const sections = els.filter((s) => !seen.has(s) && seen.add(s)).map((s) => {
    const r = s.getBoundingClientRect();
    return { id: room ? s.dataset.roomChapter : s.id, dom: room ? s.querySelector('.room-anchor')?.id : s.id, top: r.top + scrollY, height: r.height };
  });
  return { vh, max: document.documentElement.scrollHeight - innerHeight, sections };
});

// A place on the page, as a share of the scroll range: "0.37" (a share), "tv" (the chapter's opening frame: where
// its anchor lands), "tv+1.5" (1.5 vh into its section), "tv:end" (its last frame). M is measure()'s answer.
export function placeOf(spec, M) {
  const s = String(spec).trim();
  if (/^-?[\d.]+$/.test(s)) return clamp01(Number(s));
  const m = /^([a-z0-9-]+)(?:([+-][\d.]+)|:(end|top))?$/i.exec(s);
  const sec = m && M.sections.find((x) => x.id === m[1] || x.dom === m[1]);
  if (!sec) throw new Usage(`no chapter or section "${s}" on this page (it has ${M.sections.map((x) => x.id).join(', ')})`);
  let px;
  if (m[3] === 'end') px = sec.top + sec.height - M.vh;
  else if (m[3] === 'top') px = sec.top;
  else if (m[2]) px = sec.top + Number(m[2]) * M.vh;
  else px = sec.top + anchorShare(sec, M) * M.vh;
  return M.max > 0 ? clamp01(px / M.max) : 0;
}
// Where a chapter's anchor lands, in vh into its section: 0.5 and a hair (where the screens are open), except the
// first section and the one entered through the door, whose anchors are at their tops (2.2).
function anchorShare(sec, M) {
  const i = M.sections.indexOf(sec);
  return i <= 1 ? 0 : 0.5 + 2 / M.vh;
}
export const clamp01 = (x) => Math.min(1, Math.max(0, x));

export async function scrollToShare(page, s) {
  await page.evaluate((s) => scrollTo(0, Math.round(Math.min(1, Math.max(0, s)) * (document.documentElement.scrollHeight - innerHeight))), s);
  await ready(page);
}

// Where a tool writes its pictures: captures/tea/<tool>/<name>/ (captures/ is ignored by git).
export function outDir(tool, name, given) {
  const dir = given ? path.resolve(given) : path.join(ROOT, 'captures', 'tea', tool, name);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// A contact sheet: frames [{ buf, label }] laid out in columns, each cell w px wide, its label in a corner. JPEG.
export async function contactSheet(frames, { cols = 4, w = 480, gap = 6, quality = 86 } = {}) {
  const { default: sharp } = await import('sharp');
  const cells = await Promise.all(frames.map(async (f) => {
    const img = sharp(f.buf).resize({ width: w });
    const { data, info } = await img.png().toBuffer({ resolveWithObject: true });
    const label = Buffer.from(`<svg width="${info.width}" height="22"><rect width="${Math.min(info.width, 12 + 7.2 * String(f.label).length)}" height="22" fill="#000" fill-opacity="0.72"/><text x="6" y="16" font-family="monospace" font-size="13" fill="#fff">${esc(f.label)}</text></svg>`);
    return { data: await sharp(data).composite([{ input: label, top: 0, left: 0 }]).png().toBuffer(), h: info.height, w: info.width };
  }));
  const rows = Math.ceil(cells.length / cols);
  const ch = Math.max(...cells.map((c) => c.h));
  const W = cols * w + (cols + 1) * gap, H = rows * ch + (rows + 1) * gap;
  return sharp({ create: { width: W, height: H, channels: 3, background: '#16161c' } })
    .composite(cells.map((c, i) => ({ input: c.data, left: gap + (i % cols) * (w + gap), top: gap + Math.floor(i / cols) * (ch + gap) })))
    .jpeg({ quality }).toBuffer();
}

export const gzipSize = (buf) => zlib.gzipSync(buf, { level: 9 }).length;
export const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
export const pad = (s, n) => String(s).padEnd(n);
export const lpad = (s, n) => String(s).padStart(n);

// Runs a tool's main: a Usage error exits 2 with its message; anything else exits 2 with its stack.
export async function main(fn) {
  try {
    const code = await fn();
    process.exitCode = code ?? 0;
  } catch (e) {
    console.error(e instanceof Usage ? e.message : e.stack ?? String(e));
    process.exitCode = 2;
  }
}
export const isMain = (url) => process.argv[1] && fileURLToPath(url) === path.resolve(process.argv[1]);
