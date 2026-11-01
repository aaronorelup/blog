#!/usr/bin/env node
// Every resize-to-a-cap job: a post's hover-card still and loop (PREVIEWS.md), and any one still into a path, a
// size and a byte cap (post icons, project pictures; docs/MEDIA.md). Needs ffmpeg on PATH; the build doesn't.
//   node scripts/tools/preview-media.mjs <slug> <source> [options]          public/media/previews/<slug>.webp (+ .mp4)
//   node scripts/tools/preview-media.mjs <source> --out <file.webp> --size 640x360|256 --cap 60k [options]
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PREVIEW_MEDIA } from '../../src/data/limits.js';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const { stillTarget, loopTarget, maxLoopSeconds, fps: maxFps } = PREVIEW_MEDIA;
const USAGE = `Usage:
  node scripts/tools/preview-media.mjs <slug> <source> [--at s] [--dur s] [--still] [options]
  node scripts/tools/preview-media.mjs <source> --out <file.webp> [--size WxH|N] [--cap 60k] [--at s] [options]
Options: --fit cover|blur, --focus center|top|bottom|left|right|x,y, --crop w:h:x:y`;

// <source> is a path under public/ (as a page references it, /media/<folder>/x.webp) or any path on disk. An image
// gives a still; a video (or an animated GIF) gives a still plus a loop in the post form, unless --still.
//   --at <s>        where in the video to start (seconds, default 0)
//   --dur <s>       loop length in seconds (default 3, at most 4)
//   --still         from a video, make only the still (frame at --at)
//   --fit cover     fill the frame, cropping the overflow (default)
//   --fit blur      fit the whole picture inside the frame on a blurred copy of itself; for portraits, character
//                   sheets, anything a crop would cut a head off
//   --focus <f>     which part survives a cover crop: center (default), top, bottom, left, right, or "x,y" (0,0 = top-left)
//   --crop w:h:x:y  cut this region out of the source first, in source pixels (ffmpeg crop)
//   --out <file>    write one WebP still here instead of a post's preview
//   --size WxH|N    its frame (default 640x360; one number is a square)
//   --cap <n>[k]    its byte cap: quality is squeezed until it fits, and the script fails if it can't
const opts = { at: 0, dur: 3, still: false, fit: 'cover', focus: 'center', crop: null, out: null, size: null, cap: null };
const pos = [];
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  const value = () => args[++i];
  if (a === '--still') opts.still = true;
  else if (a === '--at') opts.at = parseFloat(value());
  else if (a === '--dur') opts.dur = parseFloat(value());
  else if (['--fit', '--focus', '--crop', '--out', '--size', '--cap'].includes(a)) opts[a.slice(2)] = value();
  else if (a.startsWith('--')) die(`Unknown option ${a}\n${USAGE}`);
  else pos.push(a);
}
if (!['cover', 'blur'].includes(opts.fit)) die('--fit is cover or blur');
if (!opts.out && (opts.size || opts.cap)) die(`--size and --cap go with --out: a post's preview is always ${PREVIEW_MEDIA.width}x${PREVIEW_MEDIA.height}, under the targets in PREVIEWS.md`);

const [W, H] = parseSize(opts.size);
if (opts.out) await onePicture(pos[0]);
else await postPreview(pos[0], pos[1]);

// One still into --out, within --cap.
async function onePicture(source) {
  if (!source || pos.length !== 1 || !opts.out.endsWith('.webp')) die(USAGE);
  const cap = opts.cap ? parseBytes(opts.cap) : Infinity;
  const src = await resolveSource(source);
  const out = path.resolve(opts.out);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const seek = isVideo(src, ffprobe(src)) ? ['-ss', String(opts.at)] : [];
  const bytes = squeeze([82, 75, 68, 60, 52, 45, 38, 30], cap, (q) => encodeStill(seek, src, q, out), out);
  if (bytes > cap) die(`${rel(out)} is ${kb(bytes)} at the lowest quality, over its ${kb(cap)} cap: pick a calmer source or a tighter --crop`);
  console.log(`${rel(out)}  ${W}x${H}  ${kb(bytes)}${cap < Infinity ? ` (cap ${kb(cap)})` : ''}`);
}

// A post's hover-card still, and a loop when the source moves, each squeezed under its target (PREVIEWS.md). The
// last setting is kept even when over its target, since the build is what refuses an oversized file.
async function postPreview(slug, source) {
  if (!slug || !source) die(USAGE);
  if (!/^[a-z0-9-]+$/.test(slug)) die(`"${slug}" doesn't look like a post slug`);
  if (!fs.existsSync(path.join(ROOT, 'src', 'content', 'posts', `${slug}.md`))) die(`No post src/content/posts/${slug}.md`);
  if (!(opts.dur > 0 && opts.dur <= maxLoopSeconds)) die(`--dur must be between 0 and ${maxLoopSeconds} seconds`);
  const outDir = path.join(ROOT, 'public', 'media', 'previews');
  const src = await resolveSource(source);
  const probe = ffprobe(src);
  const video = isVideo(src, probe);
  fs.mkdirSync(outDir, { recursive: true });
  const stillPath = path.join(outDir, `${slug}.webp`);
  const loopPath = path.join(outDir, `${slug}.mp4`);

  // For a loop the still is also the poster, so it is the loop's first frame and the swap doesn't jump.
  const seek = video ? ['-ss', String(opts.at)] : [];
  const stillBytes = squeeze([75, 68, 60, 52, 45, 38], stillTarget, (q) => encodeStill(seek, src, q, stillPath), stillPath);
  if (stillBytes > stillTarget) warnOver('still', stillBytes, stillTarget);

  let loopBytes = 0;
  if (video && !opts.still) {
    if (opts.at + opts.dur > probe.duration + 0.05) die(`The clip ends at ${probe.duration.toFixed(2)} s; --at ${opts.at} --dur ${opts.dur} runs past it`);
    const fps = Math.min(maxFps, Math.round(probe.fps) || maxFps);
    loopBytes = squeeze([27, 29, 31, 33, 35, 37], loopTarget, (crf) =>
      ffmpeg(['-ss', String(opts.at), '-t', String(opts.dur), '-i', src, '-vf', `${frameFilter()},fps=${fps}`, '-an',
        '-c:v', 'libx264', '-preset', 'veryslow', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-crf', String(crf),
        '-g', '999', '-movflags', '+faststart', '-map_metadata', '-1', loopPath]), loopPath);
    if (loopBytes > loopTarget) warnOver('loop', loopBytes, loopTarget);
  } else if (fs.existsSync(loopPath)) {
    fs.unlinkSync(loopPath);
    console.log(`Removed the old loop ${rel(loopPath)}; this preview is a still now.`);
  }

  console.log(`\nstill  ${rel(stillPath)}  ${kb(stillBytes)} (target ${kb(stillTarget)})`);
  if (loopBytes) console.log(`loop   ${rel(loopPath)}  ${kb(loopBytes)} (target ${kb(loopTarget)}), ${opts.dur} s from ${opts.at} s; npm run media:push puts it in R2`);
  console.log('\nIn the post\'s preview: block:\n');
  console.log(`  image: "/media/previews/${slug}.webp"`);
  if (loopBytes) console.log(`  loop: "/media/previews/${slug}.mp4"`);
  console.log('  alt: "…what the picture shows…"');
}

function encodeStill(seek, src, q, out) {
  ffmpeg([...seek, '-i', src, '-frames:v', '1', '-vf', frameFilter(), '-c:v', 'libwebp', '-quality', String(q),
    '-compression_level', '6', '-map_metadata', '-1', out]);
}

function frameFilter() {
  const pre = opts.crop ? `crop=${opts.crop},` : '';
  if (opts.fit === 'blur') {
    return `${pre}split[a][b];` +
      `[a]scale=${W}:${H}:force_original_aspect_ratio=increase:flags=bicubic,crop=${W}:${H},boxblur=18:2,eq=brightness=-0.10:saturation=0.85[bg];` +
      `[b]scale=${W}:${H}:force_original_aspect_ratio=decrease:flags=lanczos[fg];` +
      '[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1';
  }
  const named = { center: [0.5, 0.5], top: [0.5, 0], bottom: [0.5, 1], left: [0, 0.5], right: [1, 0.5] };
  const [fx, fy] = named[opts.focus] || opts.focus.split(',').map(Number);
  if (![fx, fy].every((v) => v >= 0 && v <= 1)) die(`--focus "${opts.focus}" isn't a name or "x,y" fractions`);
  return `${pre}scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,` +
    `crop=${W}:${H}:(iw-${W})*${fx}:(ih-${H})*${fy},setsar=1`;
}

// Encode at each setting in turn until the file fits; returns the size of the last one made.
function squeeze(settings, limit, encode, file) {
  let bytes = 0;
  for (const s of settings) {
    encode(s);
    bytes = fs.statSync(file).size;
    if (bytes <= limit) break;
  }
  return bytes;
}

function warnOver(what, bytes, target) {
  console.warn(`! The ${what} is ${kb(bytes)} at the lowest quality, over its ${kb(target)} target. ` +
    'Pick a calmer moment (less motion, less fine detail), a shorter --dur, or a tighter --crop.');
}

function parseSize(s) {
  if (!s) return [PREVIEW_MEDIA.width, PREVIEW_MEDIA.height];
  const m = /^(\d+)(?:x(\d+))?$/.exec(s);
  if (!m) die(`--size is WxH or one number, not "${s}"`);
  return [Number(m[1]), Number(m[2] ?? m[1])];
}

function parseBytes(s) {
  const m = /^(\d+(?:\.\d+)?)(k?)$/i.exec(s);
  if (!m) die(`--cap is bytes or kilobytes ("60k"), not "${s}"`);
  return Math.floor(Number(m[1]) * (m[2] ? 1024 : 1));
}

// An animated GIF counts as a video (ffmpeg reads it like one); a WebP, PNG or JPEG is a still.
function isVideo(src, probe) {
  return probe.duration > 0.5 && probe.codec !== 'webp' && !/\.(webp|png|jpe?g|avif)$/i.test(src);
}

// A path on disk, a file under public/, or a site path whose file is in R2 (docs/MEDIA.md), which is downloaded from
// the live site to a temporary file.
async function resolveSource(s) {
  if (!s) die(USAGE);
  const candidates = [s, path.join(ROOT, 'public', s.replace(/^\/+/, ''))];
  const hit = candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile());
  if (hit) return hit;
  if (!s.startsWith('/')) die(`Can't find ${s} (tried it as a path and under public/)`);
  const res = await fetch(`https://aaronorelup.com${s}`);
  if (!res.ok) die(`Can't find ${s} on disk, under public/ or on the live site (${res.status})`);
  const tmp = path.join(os.tmpdir(), `preview-source-${process.pid}${path.extname(s)}`);
  fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
  return tmp;
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
