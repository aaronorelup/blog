// Renders public/games/clawd-growth-montage/ to an MP4 + poster, deterministically.
//
//   npm i --no-save playwright && npx playwright install chromium   (once)
//   node scripts/clawd-growth-montage/render.mjs                    full render
//   node scripts/clawd-growth-montage/render.mjs --sample 1,5.5,12  PNG stills only (for review)
//
// Frames come from window.renderFrame(t) at 1920x1080, 30 fps, piped to ffmpeg as PNG.
// Audio comes from the page's own OfflineAudioContext(2, 48000*30, 48000), exported as WAV.
// Needs ffmpeg on PATH. Google Fonts are fetched by the page, so it needs network access.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, statSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(here, '../../public/games/clawd-growth-montage');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const FPS = +opt('--fps', 30), CRF = opt('--crf', '20'), POSTER_T = +opt('--poster', 28.85);
const sample = opt('--sample', null);
const sampleOut = opt('--out', path.join(here, 'frames'));

const t0 = Date.now();
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
page.on('pageerror', e => console.error('[pageerror]', e.message));
await page.goto(pathToFileURL(path.join(dir, 'index.html')).href + '?render');
await page.evaluate(() => window.montageReady);
const DUR = await page.evaluate(() => window.DURATION);

const grab = (t, type = 'image/png', q) => page.evaluate(([t, type, q]) => {
  window.renderFrame(t);
  return document.getElementById('film').toDataURL(type, q).split(',')[1];
}, [t, type, q]);

if (sample) {
  mkdirSync(sampleOut, { recursive: true });
  for (const t of sample.split(',').map(Number)) {
    const f = path.join(sampleOut, `t${t.toFixed(2).padStart(5, '0')}.png`);
    writeFileSync(f, Buffer.from(await grab(t), 'base64'));
    console.log('wrote', f);
  }
  await browser.close();
  process.exit(0);
}

// 1. audio
const ta = Date.now();
const { b64, peak } = await page.evaluate(() => window.renderAudioWavBase64());
const wav = path.join(here, 'score.wav');
writeFileSync(wav, Buffer.from(b64, 'base64'));
console.log(`audio: ${((Date.now() - ta) / 1000).toFixed(1)} s, peak ${peak.toFixed(3)}`);

// 2. poster (the summit shot)
writeFileSync(path.join(dir, 'poster.jpg'), Buffer.from(await grab(POSTER_T, 'image/jpeg', 0.9), 'base64'));

// 3. frames -> ffmpeg
const mp4 = path.join(dir, 'clawd-growth-montage.mp4');
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
  '-i', wav,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF, '-pix_fmt', 'yuv420p', '-tune', 'animation',
  '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))));
const N = Math.round(DUR * FPS);
const tf = Date.now();
for (let i = 0; i < N; i++) {
  const buf = Buffer.from(await grab(i / FPS), 'base64');
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 90 === 0) console.log(`frame ${i}/${N}`);
}
ff.stdin.end();
await done;
await browser.close();
rmSync(wav);
const mb = statSync(mp4).size / 1048576;
console.log(`frames: ${((Date.now() - tf) / 1000).toFixed(1)} s for ${N} frames`);
console.log(`mp4: ${mb.toFixed(2)} MB (crf ${CRF}), total ${((Date.now() - t0) / 1000).toFixed(1)} s`);
