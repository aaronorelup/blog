// The empty-frame sweep (1.12, 5.2): is a frame a picture, or nearly all dark, or does it leave a band dark and flat?
// A frame is judged from a small copy of it (96 px wide, RGB). Its floors, measured on look B and not guessed
// (tests/unit/fixtures/tea/sweep/ keeps the frames; the numbers are here):
//   BRIGHT: the share of pixels brighter than 40 (of 255). B's dead stretch on a desktop (y 0.82, 0.83, 0.84) is 0.21,
//     0.12 and 0.10; its dark but good frames (0.58, 0.66) are 0.39 and 0.50. Under 0.3 fails.
//   BAND: a band a quarter of the frame tall whose mean is under 30 and whose spread (standard deviation) is under 8
//     is dark and flat; the darkest band of B's good desktop frames has a spread of 20 or more. On a phone the lower
//     40% is read row by row, and fails when more than half its rows are dark and flat: B's phone frames from 0.45
//     have a lower 40% of mean 13.1 and spread 1.5, and at 0.58 and 0.66, where an episode's slip lies across part
//     of it, 61% and 62% of its rows are still dark and flat.
//   REGION and LOWER (piece 1's calibration, docs/TEA_ROOM.md): the frame in 6 px cells of the copy, a cell dark and
//     flat by the band's two numbers. REGION: the largest such area joined edge to edge. B's dead frame at 0.86
//     (the film garden sliding in at the right of the dark) is 0.54 of the frame; B's dark good frames 0.56 to 0.69
//     (night sky over the city, the watch dial) are 0.30 to 0.44. Over 0.49 fails. LOWER (phone): the share of the
//     lower 40% that is dark and flat, paper or none: B's television chapter from 0.40 to 0.84 is 0.29 to 1.00 (0.48,
//     0.52 and 0.62, where an episode's card lies across it, are 0.43, 0.36 and 0.29); every other B phone frame is
//     0.11 or less. Over 0.2 fails.
//   node scripts/tools/tea/sweep.mjs [address] [--phone] [--n 240] [--from] [--to]   (prints the failures; exit 1 on any)
export const FLOORS = Object.freeze({ lum: 40, bright: 0.3, bandMean: 30, bandSpread: 8, rows: 0.5, region: 0.49, lower: 0.2 });
export const CELL = 6; // px of the 96 px copy: a desktop frame is 16 x 10 cells, a phone frame 16 x 34

// Dark flat cells (mean under bandMean, spread under bandSpread) of a frame's luminance L (w x h): the largest
// region of them joined edge to edge, as a share of the frame (the bar's "no flat dark area larger than a quarter
// of the frame"), and their share of the lower 40% (the phone's "nothing empty in the lower 40%"), where paper
// lying across part of it does not make the dark beside and under it a picture. Pure.
export function darkCells(L, w, h) {
  const cw = Math.floor(w / CELL), ch = Math.floor(h / CELL);
  const dark = new Uint8Array(cw * ch);
  for (let cy = 0; cy < ch; cy++) for (let cx = 0; cx < cw; cx++) {
    let s = 0, s2 = 0;
    for (let y = cy * CELL; y < (cy + 1) * CELL; y++) for (let x = cx * CELL; x < (cx + 1) * CELL; x++) { const v = L[y * w + x]; s += v; s2 += v * v; }
    const n = CELL * CELL, mean = s / n, spread = Math.sqrt(Math.max(0, s2 / n - mean * mean));
    dark[cy * cw + cx] = mean < FLOORS.bandMean && spread < FLOORS.bandSpread ? 1 : 0;
  }
  const seen = new Uint8Array(cw * ch);
  let region = 0;
  for (let i = 0; i < dark.length; i++) {
    if (!dark[i] || seen[i]) continue;
    let size = 0;
    const stack = [i];
    seen[i] = 1;
    while (stack.length) {
      const j = stack.pop();
      size++;
      const x = j % cw, y = (j - x) / cw;
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        const k = ny * cw + nx;
        if (nx >= 0 && ny >= 0 && nx < cw && ny < ch && dark[k] && !seen[k]) { seen[k] = 1; stack.push(k); }
      }
    }
    region = Math.max(region, size);
  }
  const from = Math.floor(ch * 0.6);
  let low = 0;
  for (let i = from * cw; i < dark.length; i++) low += dark[i];
  return { region: region / dark.length, lower: low / Math.max(1, (ch - from) * cw) };
}

const lumOf = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];

// rgb: raw RGB bytes of a w x h frame. Returns { ok, bright, worst: { mean, spread, at }, why }.
export function judge(rgb, w, h, { phone = false } = {}) {
  const L = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) L[i] = lumOf(rgb, i * 3);
  const bright = L.reduce((n, v) => n + (v > FLOORS.lum ? 1 : 0), 0) / L.length;
  const band = (y0, y1) => {
    let s = 0, s2 = 0, n = 0;
    for (let y = y0; y < y1; y++) for (let x = 0; x < w; x++) { const v = L[y * w + x]; s += v; s2 += v * v; n++; }
    const mean = s / n;
    return { mean, spread: Math.sqrt(Math.max(0, s2 / n - mean * mean)), at: y0 / h };
  };
  const bands = phone ? [band(Math.floor(h * 0.6), h)]
    : Array.from({ length: 7 }, (_, i) => band(Math.floor((i * h) / 8), Math.floor((i * h) / 8) + Math.floor(h / 4)));
  const dark = (b) => b.mean < FLOORS.bandMean && b.spread < FLOORS.bandSpread;
  // on a phone, the lower 40% row by row: a slip lying across part of it does not make the dark under it a picture
  const rows = phone ? Array.from({ length: h - Math.floor(h * 0.6) }, (_, i) => band(Math.floor(h * 0.6) + i, Math.floor(h * 0.6) + i + 1)) : [];
  const deadRows = rows.filter(dark).length / Math.max(1, rows.length);
  const flat = phone ? (deadRows > FLOORS.rows ? [{ ...bands[0], mean: bands[0].mean, at: 0.6 }] : []) : bands.filter(dark);
  const worst = bands.reduce((a, b) => (b.mean + b.spread < a.mean + a.spread ? b : a));
  const cells = darkCells(L, w, h);
  const why = bright < FLOORS.bright ? `nearly all dark (${bright.toFixed(2)} of it brighter than ${FLOORS.lum})`
    : flat.length ? (phone ? `${Math.round(deadRows * 100)}% of the lower 40% is dark and flat`
      : `a band at ${(flat[0].at * 100).toFixed(0)}% down is dark and flat (mean ${flat[0].mean.toFixed(1)}, spread ${flat[0].spread.toFixed(1)})`)
      : cells.region > FLOORS.region ? `a dark flat area of ${Math.round(cells.region * 100)}% of the frame`
        : phone && cells.lower > FLOORS.lower ? `${Math.round(cells.lower * 100)}% of the lower 40% is dark and flat, beside or under the paper`
          : null;
  return { ok: !why, bright, worst, why, ...cells };
}

// A frame (a PNG or any picture sharp reads) judged at 96 px wide.
export async function judgePicture(buf, opts) {
  const { default: sharp } = await import('sharp');
  const meta = await sharp(buf).metadata();
  const h = Math.max(1, Math.round((96 * meta.height) / meta.width));
  const { data, info } = await sharp(buf).resize(96, h, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return judge(data, info.width, info.height, opts);
}

// The pages the sweep reads: frames at n even places from --from to --to, each loaded directly at ?y=&still=1 (so
// a look, which has no settled() of its own, is read exactly as frames.mjs shows it). On the room the house closing
// and the frames that are half footer are counted and not judged, as tea-engine.spec.mjs does.
async function sweepPage(address, { phone, n, from, to, size }) {
  const lib = await import('./lib.mjs');
  const srv = await lib.server();
  const b = await lib.browser();
  const bad = [];
  let skipped = 0;
  try {
    const sz = size ? lib.sizeOf(size) : phone ? { ...lib.PHONE } : { ...lib.DESKTOP };
    const isP = lib.isPhone(sz);
    const probe = await lib.openPage(b, lib.urlOf(srv.base, lib.withQuery(address, { still: 1 })), sz);
    const M = await lib.measure(probe);
    await probe.context().close();
    const [a, z] = [lib.placeOf(from, M), lib.placeOf(to, M)];
    for (let i = 0; i < n; i++) {
      const y = n === 1 ? a : a + ((z - a) * i) / (n - 1);
      const page = await lib.openPage(b, lib.urlOf(srv.base, lib.withQuery(address, { still: 1, y: y.toFixed(6) })), sz);
      const closed = await page.evaluate(() => !!window.__room && (document.querySelector('.room-end')?.getBoundingClientRect().top < innerHeight / 2
        || (window.__room.frame?.screens.into === -1 && window.__room.frame?.screens.shut === 1)));
      const shot = await page.screenshot();
      await page.context().close();
      if (closed) { skipped++; continue; }
      const r = await judgePicture(shot, { phone: isP });
      if (!r.ok) { bad.push(y); console.log(`  FAIL  y=${y.toFixed(3)}  ${r.why}`); }
    }
    console.log(`${address} at ${lib.sizeName(sz)}: ${n - bad.length - skipped} of ${n} frames are pictures${skipped ? `, ${skipped} at the house closing or the footer not judged` : ''}${bad.length ? `, ${bad.length} dead` : ''}`);
  } finally {
    await b.close();
    await srv.stop();
  }
  return bad.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === `file://${(await import('node:path')).resolve(process.argv[1])}`) {
  const lib = await import('./lib.mjs');
  lib.main(async () => {
    const { values, positionals } = lib.args(process.argv.slice(2), {
      usage: `node scripts/tools/tea/sweep.mjs [address] [--phone] [--n 240] [--from 0] [--to 1]
The empty-frame sweep: n frames evenly spaced, each with ?still=1, judged at 96 px wide. A frame fails when less
than ${FLOORS.bright * 100}% of it is brighter than ${FLOORS.lum} of 255, or (desktop) a band a quarter of the frame tall has a mean
under ${FLOORS.bandMean} and a spread under ${FLOORS.bandSpread}, or (phone) more than ${FLOORS.rows * 100}% of the rows of its lower 40% are
dark and flat. The floors were measured on look B (docs/TEA_ROOM.md). The address defaults to /tea-next/.
  e.g. node scripts/tools/tea/sweep.mjs --phone --from tv --to film`,
      flags: {
        phone: { type: 'boolean', help: 'at 390x844 (else 1440x900)' },
        size: { help: 'another window size, e.g. 430x932' },
        n: { help: 'frames (default 240, 200 on a phone)' },
        from: { help: 'first place (a share or a chapter)', default: '0' },
        to: { help: 'last place', default: '1' },
      },
    });
    const n = Number(values.n ?? (values.phone ? 200 : 240));
    if (!(n >= 1)) throw new lib.Usage('--n takes a number from 1');
    return sweepPage(positionals[0] ?? lib.DEFAULT_PAGE, { phone: values.phone, n, from: values.from, to: values.to, size: values.size });
  });
}
