// Plates and pictures for the tea room, resized and encoded (2.4, 2.8, 2.9). Never enlarges, never makes one of the
// owner's pictures worse: it only writes smaller copies beside them.
//
// A plate (--kind plate, the default): a painted flat, from its master at the largest size the generator gave.
//   <out>.webp      the smaller width: for windows up to 1920 CSS px at one device pixel (the src of its <img>)
//   <out>-l.webp    the larger: the master's own width, for anything wider or denser
//   and the srcset to paste. --phone: a phone plate (the p composition, made from its d plate): one file,
//   <out>-p.webp, at the master's own size.
// A content picture (--kind picture): the phone copy only, <out>-p.webp, as wide as it is drawn on a 430 px phone
//   at three device pixels (--drawn, CSS px) and never wider than the original; the desktop file stays the post's
//   own, untouched.
// Anything longer than 4096 px on its long side is cut into tiles along it (<out>-t0.webp, ...), as 2.9 asks.
import fs from 'node:fs';
import path from 'node:path';
import { Usage, args, isMain, kb, main } from './lib.mjs';

export const LONG = 4096;
export const SMALL_WINDOW = 1920, LARGE_WINDOW = 2560;
export const PHONE_DPR = 3, PHONE_W = 430;

// What to write for a master of w x h: [{ suffix, width, height }] and notes. Pure.
export function plan({ w, h }, { kind = 'plate', phone = false, small, drawn = PHONE_W } = {}) {
  const notes = [];
  const at = (width) => ({ width, height: Math.round((h * width) / w) });
  let out;
  if (kind === 'picture') {
    const want = Math.round(drawn * PHONE_DPR);
    if (want >= w) notes.push(`the original (${w} px) is not wider than ${want} px: the phone copy keeps its width`);
    out = [{ suffix: '-p', ...at(Math.min(w, want)) }];
  } else if (phone) {
    out = [{ suffix: '-p', ...at(w) }];
  } else {
    let s = small ?? Math.round((w * SMALL_WINDOW) / LARGE_WINDOW);
    if (s > w) { notes.push(`--small ${s} is wider than the master (${w}): kept at ${w}`); s = w; }
    out = [{ suffix: '', ...at(s) }, { suffix: '-l', ...at(w) }];
  }
  return { files: out.map((f) => ({ ...f, tiles: tiles(f.width, f.height) })), notes };
}

// Tiles along the long side, each at most LONG px: [{ left, top, width, height }], or [] when one piece will do.
export function tiles(width, height) {
  const long = Math.max(width, height);
  if (long <= LONG) return [];
  const n = Math.ceil(long / LONG);
  const step = Math.ceil(long / n);
  return Array.from({ length: n }, (_, i) => {
    const a = i * step, len = Math.min(step, long - a);
    return width >= height ? { left: a, top: 0, width: len, height } : { left: 0, top: a, width, height: len };
  });
}

export const srcsetOf = (base, files) => files.filter((f) => f.suffix !== '-p').map((f) => `${base}${f.suffix}.webp ${f.width}w`).join(', ');

if (isMain(import.meta.url)) {
  main(async () => {
    const { values, positionals } = args(process.argv.slice(2), {
      usage: `node scripts/tools/tea/plates.mjs <master> --out <public/tea/scenes/<id>/<name>> [--kind plate|picture] [--phone]
Writes a plate in two widths (<out>.webp at ${SMALL_WINDOW}/${LARGE_WINDOW} of the master's width, <out>-l.webp at the master's own),
a phone plate (--phone: <out>-p.webp), or a content picture's phone copy (--kind picture: <out>-p.webp at
--drawn x ${PHONE_DPR} px, never wider than the original). WebP. Never enlarges. Tiles past ${LONG} px.
  e.g. node scripts/tools/tea/plates.mjs master/room.png --out public/tea/scenes/start/room
       node scripts/tools/tea/plates.mjs public/media/posts/crimson-coil/still.webp --kind picture --out public/tea/scenes/tv/crimson-coil`,
      flags: {
        out: { help: 'the path and name to write, without .webp' },
        kind: { help: 'plate or picture', default: 'plate' },
        phone: { type: 'boolean', help: 'a phone plate: one file, -p, at the master\'s size' },
        small: { help: 'the smaller width in px (a plate)' },
        drawn: { help: 'a picture: how wide it is drawn on a 430 px phone, CSS px', default: String(PHONE_W) },
        quality: { help: 'WebP quality', default: '92' },
        lossless: { type: 'boolean', help: 'lossless WebP (for a picture whose original is lossless)' },
        force: { type: 'boolean', help: 'write over files that exist' },
      },
    });
    const [master] = positionals;
    if (!master || positionals.length > 1) throw new Usage('give one master picture (--help says how)');
    if (!fs.existsSync(master)) throw new Usage(`no such file: ${master}`);
    if (!values.out) throw new Usage('--out <path/name> is needed');
    if (!['plate', 'picture'].includes(values.kind)) throw new Usage('--kind is plate or picture');
    const { default: sharp } = await import('sharp');
    const meta = await sharp(master).metadata();
    const p = plan({ w: meta.width, h: meta.height }, { kind: values.kind, phone: values.phone, small: values.small ? Number(values.small) : undefined, drawn: Number(values.drawn) });
    for (const n of p.notes) console.log(`note: ${n}`);
    fs.mkdirSync(path.dirname(path.resolve(values.out)), { recursive: true });
    const enc = { quality: Number(values.quality), effort: 6, lossless: !!values.lossless, smartSubsample: true };
    console.log(`${master}: ${meta.width}x${meta.height} ${meta.format}, ${kb(fs.statSync(master).size)}`);
    for (const f of p.files) {
      const resized = await sharp(master).resize({ width: f.width, kernel: 'lanczos3' }).toBuffer();
      const parts = f.tiles.length ? f.tiles.map((t, i) => ({ t, file: `${values.out}${f.suffix}-t${i}.webp` })) : [{ t: null, file: `${values.out}${f.suffix}.webp` }];
      for (const { t, file } of parts) {
        if (fs.existsSync(file) && !values.force) throw new Usage(`${file} exists (--force to write over it)`);
        if (!t && f.width === meta.width && meta.format === 'webp') {
          // already a WebP at this width: copied as it is, never encoded a second time
          fs.copyFileSync(master, file);
          console.log(`  ${file}  ${meta.width}x${meta.height}  ${kb(fs.statSync(file).size)}  (the master's own file)`);
          continue;
        }
        const img = t ? sharp(resized).extract(t) : sharp(resized);
        const info = await img.webp(enc).toFile(file);
        console.log(`  ${file}  ${info.width}x${info.height}  ${kb(info.size)}${t ? `  tile at ${t.left},${t.top}` : ''}`);
      }
    }
    const set = srcsetOf(values.out.replace(/^.*?public/, ''), p.files);
    if (set && !p.files.some((f) => f.tiles.length)) console.log(`srcset="${set}"`);
    return 0;
  });
}
