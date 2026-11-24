#!/usr/bin/env node
// Contact sheet: render chosen frames of one ending and tile them into one labelled PNG.
//
//   node make/contact.mjs --ending main --frames 0,120,1440 --out sheet.png
//   node make/contact.mjs --ending x10 --frames bars:44-72 --width 960 --height 540 --cols 6 --out sheet-x10.png
//
// --frames takes a comma list of: a frame (1440), a range with a step (0-1439/120), or bars:A-B
// (the first frame of every bar from A to B; bar 72 is the last frame, 2159). Each tile is labelled
// with the frame, the programme clock, the bar, the shot and the programme view. The frames are drawn
// by the same film code as make/render.mjs (same browser flags), the sheet is composed in the page.
// --thumb sets a tile's width (default 480). --mount works as in render.mjs.

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, loadPlaywright, startServer, openFilm, PROGRAMME_FRAMES } from './render.mjs';

export function parseFrames(spec) {
  const out = [];
  for (const part of String(spec).split(',').map((s) => s.trim()).filter(Boolean)) {
    let m;
    if ((m = part.match(/^bars:(\d+)-(\d+)$/))) for (let b = +m[1]; b <= +m[2]; b++) out.push(Math.min(PROGRAMME_FRAMES - 1, b * 30));
    else if ((m = part.match(/^(\d+)-(\d+)(?:\/(\d+))?$/))) for (let f = +m[1]; f <= +m[2]; f += +(m[3] || 1)) out.push(f);
    else out.push(+part);
  }
  return out.filter((f) => Number.isInteger(f) && f >= 0 && f < PROGRAMME_FRAMES);
}

export async function contact(opts) {
  const ending = opts.ending || 'main', W = +(opts.width || 960), H = +(opts.height || 540);
  const frames = parseFrames(opts.frames || 'bars:0-72'), cols = +(opts.cols || 6), thumb = +(opts.thumb || 480);
  const out = path.resolve(opts.out || `sheet-${ending}.png`);
  const { chromium } = loadPlaywright();
  const server = await startServer({ mounts: opts.mount || [] });
  let sheet = null;
  server.sinks.set('sheet', async (buf) => { sheet = buf; });
  const w = await openFilm(chromium, server.url, { width: W, height: H, ending, quality: opts.quality || 'final' });
  const t0 = Date.now();
  await w.page.evaluate(async ([frames, cols, thumb, title]) => {
    const QH = window.QH, src = QH.gl.canvas, th = Math.round(thumb * src.height / src.width), lab = 26;
    const rows = Math.ceil(frames.length / cols), c = document.createElement('canvas');
    c.width = cols * thumb; c.height = 40 + rows * (th + lab);
    const x = c.getContext('2d');
    x.fillStyle = '#111'; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#eee'; x.font = '22px "QH Serif"'; x.textBaseline = 'middle'; x.fillText(title, 10, 20);
    const { shotAt } = await import('./src/shots.js'), { clockText } = await import('./src/time.js');
    frames.forEach((f, i) => {
      QH.renderFrame(f);
      const cx = (i % cols) * thumb, cy = 40 + Math.floor(i / cols) * (th + lab);
      x.drawImage(src, cx, cy, thumb, th);                          // same task as the draw: buffer intact
      const s = shotAt(f);
      x.fillStyle = '#ddd'; x.font = '15px "QH Mono"';
      x.fillText(`f${f} ${clockText(f)} bar ${Math.floor(f / 30)} | ${s.index} ${s.name} | ${s.viewName}`, cx + 6, cy + th + lab / 2);
    });
    const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
    await fetch('/frame?chunk=sheet&f=0', { method: 'POST', body: blob });
  }, [frames, cols, thumb, `${opts.title || 'THE QUIET HOUR'} · ending ${ending} · ${W}x${H}`]);
  await w.browser.close(); await server.close();
  fs.writeFileSync(out, sheet);
  console.log(`sheet ${out}: ${frames.length} frames of ${ending} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  contact(parseArgs(process.argv.slice(2))).catch((e) => { console.error(e); process.exit(1); });
}
