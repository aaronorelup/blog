#!/usr/bin/env node
// Makes the media for a post's hover preview: one small still, and optionally a short silent
// loop that plays over it. The rules these files have to meet are in PREVIEWS.md.
//
//   node scripts/preview-media.mjs <slug> <source> [options]
//
// <source> is a path under public/ (as the post references it, e.g. /media/<slug>/x.webp) or
// any path on disk. An image gives a still. A video (or an animated GIF) gives a still plus a
// loop, unless --still.
//
//   --at <s>        where in the video to start (seconds, default 0)
//   --dur <s>       loop length in seconds (default 3, at most 4)
//   --still         from a video, make only the still (frame at --at)
//   --fit cover     fill the 16:9 frame, cropping the overflow (default)
//   --fit blur      fit the whole picture inside the frame on a blurred copy of itself; for
//                   portraits, character sheets, anything a 16:9 crop would cut a head off
//   --focus <f>     which part survives a cover crop: center (default), top, bottom, left,
//                   right, or two fractions "x,y" (0,0 = top-left)
//   --crop w:h:x:y  cut this region out of the source first, in source pixels (ffmpeg crop)
//
// Writes public/media/previews/<slug>.webp (and .mp4), squeezing quality until each file is
// under its target size, and prints the frontmatter lines to paste. Needs ffmpeg on PATH.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PREVIEW_MEDIA } from '../src/data/preview-budget.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT_DIR = path.join(ROOT, 'public', 'media', 'previews');
const { width: W, height: H, stillTarget, loopTarget, maxLoopSeconds, fps: maxFps } = PREVIEW_MEDIA;

const args = process.argv.slice(2);
const opts = { at: 0, dur: 3, still: false, fit: 'cover', focus: 'center', crop: null };
const pos = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--still') opts.still = true;
  else if (a === '--at') opts.at = parseFloat(args[++i]);
  else if (a === '--dur') opts.dur = parseFloat(args[++i]);
  else if (a === '--fit') opts.fit = args[++i];
  else if (a === '--focus') opts.focus = args[++i];
  else if (a === '--crop') opts.crop = args[++i];
  else if (a.startsWith('--')) die(`Unknown option ${a}`);
  else pos.push(a);
}
const [slug, source] = pos;
if (!slug || !source) die('Usage: node scripts/preview-media.mjs <slug> <source> [--at s] [--dur s] [--still] [--fit cover|blur] [--focus center|top|bottom|left|right|x,y] [--crop w:h:x:y]');
if (!/^[a-z0-9-]+$/.test(slug)) die(`"${slug}" doesn't look like a post slug`);
if (!fs.existsSync(path.join(ROOT, 'src', 'content', 'posts', `${slug}.md`))) die(`No post src/content/posts/${slug}.md`);
if (!(opts.dur > 0 && opts.dur <= maxLoopSeconds)) die(`--dur must be between 0 and ${maxLoopSeconds} seconds`);
if (!['cover', 'blur'].includes(opts.fit)) die('--fit is cover or blur');

const src = resolveSource(source);
const probe = ffprobe(src);
// An animated GIF counts as a video (ffmpeg reads it like one); a WebP, PNG or JPEG is a still.
const isVideo = probe.duration > 0.5 && probe.codec !== 'webp' && !/\.(webp|png|jpe?g|avif)$/i.test(src);
fs.mkdirSync(OUT_DIR, { recursive: true });

const stillPath = path.join(OUT_DIR, `${slug}.webp`);
const loopPath = path.join(OUT_DIR, `${slug}.mp4`);
const frame = frameFilter();

// The still. For a loop it is also the poster, so it is taken from the loop's first frame and
// the swap from poster to playing video doesn't jump.
const seek = isVideo ? ['-ss', String(opts.at)] : [];
const stillBytes = squeeze([75, 68, 60, 52, 45, 38], stillTarget, (q) =>
  ffmpeg([...seek, '-i', src, '-frames:v', '1', '-vf', frame, '-c:v', 'libwebp', '-quality', String(q),
    '-compression_level', '6', '-map_metadata', '-1', stillPath]),
  stillPath, 'still');

let loopBytes = 0;
if (isVideo && !opts.still) {
  if (opts.at + opts.dur > probe.duration + 0.05) die(`The clip ends at ${probe.duration.toFixed(2)} s; --at ${opts.at} --dur ${opts.dur} runs past it`);
  const fps = Math.min(maxFps, Math.round(probe.fps) || maxFps);
  loopBytes = squeeze([27, 29, 31, 33, 35, 37], loopTarget, (crf) =>
    ffmpeg(['-ss', String(opts.at), '-t', String(opts.dur), '-i', src, '-vf', `${frame},fps=${fps}`, '-an',
      '-c:v', 'libx264', '-preset', 'veryslow', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-crf', String(crf),
      '-g', '999', '-movflags', '+faststart', '-map_metadata', '-1', loopPath]),
    loopPath, 'loop');
} else if (fs.existsSync(loopPath)) {
  fs.unlinkSync(loopPath);
  console.log(`Removed the old loop ${rel(loopPath)}; this preview is a still now.`);
}

console.log('');
console.log(`still  ${rel(stillPath)}  ${kb(stillBytes)} (target ${kb(stillTarget)})`);
if (loopBytes) console.log(`loop   ${rel(loopPath)}  ${kb(loopBytes)} (target ${kb(loopTarget)}), ${opts.dur} s from ${opts.at} s`);
console.log('\nIn the post\'s preview: block:\n');
console.log(`  image: "/media/previews/${slug}.webp"`);
if (loopBytes) console.log(`  loop: "/media/previews/${slug}.mp4"`);
console.log(`  alt: "…what the picture shows…"`);

// ---------------------------------------------------------------------------------------

function frameFilter() {
  const pre = opts.crop ? `crop=${opts.crop},` : '';
  if (opts.fit === 'blur') {
    return `${pre}split[a][b];` +
      `[a]scale=${W}:${H}:force_original_aspect_ratio=increase:flags=bicubic,crop=${W}:${H},boxblur=18:2,eq=brightness=-0.10:saturation=0.85[bg];` +
      `[b]scale=${W}:${H}:force_original_aspect_ratio=decrease:flags=lanczos[fg];` +
      `[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1`;
  }
  const named = { center: [0.5, 0.5], top: [0.5, 0], bottom: [0.5, 1], left: [0, 0.5], right: [1, 0.5] };
  const [fx, fy] = named[opts.focus] || opts.focus.split(',').map(Number);
  if (![fx, fy].every((v) => v >= 0 && v <= 1)) die(`--focus "${opts.focus}" isn't a name or "x,y" fractions`);
  return `${pre}scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,` +
    `crop=${W}:${H}:(iw-${W})*${fx}:(ih-${H})*${fy},setsar=1`;
}

// Encode at each setting in turn until the file fits; the last setting is kept regardless and
// reported, since the build is what refuses an oversized file.
function squeeze(settings, target, encode, file, what) {
  let bytes = 0;
  for (const s of settings) {
    encode(s);
    bytes = fs.statSync(file).size;
    if (bytes <= target) return bytes;
  }
  console.warn(`! The ${what} is ${kb(bytes)} at the lowest quality, over its ${kb(target)} target. ` +
    'Pick a calmer moment (less motion, less fine detail), a shorter --dur, or a tighter --crop.');
  return bytes;
}

function resolveSource(s) {
  const candidates = [s, path.join(ROOT, 'public', s.replace(/^\/+/, ''))];
  const hit = candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
  if (!hit) die(`Can't find ${s} (tried it as a path and under public/)`);
  return hit;
}

function ffprobe(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'stream=codec_name,r_frame_rate:format=duration', '-of', 'json', file], { encoding: 'utf8' });
  if (r.error) die('ffprobe not found; install ffmpeg and put it on PATH');
  if (r.status !== 0) die(`ffprobe failed on ${file}:\n${r.stderr}`);
  const j = JSON.parse(r.stdout);
  const st = (j.streams || [])[0] || {};
  const [n, d] = String(st.r_frame_rate || '0/1').split('/').map(Number);
  return { codec: st.codec_name, fps: d ? n / d : 0, duration: parseFloat(j.format?.duration) || 0 };
}

function ffmpeg(a) {
  const r = spawnSync('ffmpeg', ['-y', '-v', 'error', ...a], { encoding: 'utf8' });
  if (r.error) die('ffmpeg not found; install it and put it on PATH');
  if (r.status !== 0) die(`ffmpeg failed:\n${r.stderr}`);
}

function rel(p) { return path.relative(ROOT, p).replace(/\\/g, '/'); }
function kb(n) { return `${(n / 1024).toFixed(1)} KB`; }
function die(msg) { console.error(msg); process.exit(1); }
