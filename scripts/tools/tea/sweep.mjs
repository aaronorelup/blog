// The empty-frame sweep (1.12, 5.2): is a frame a picture, or nearly all dark, or does it leave a band dark and flat?
// A frame is judged from a small copy of it (96 px wide, RGB). Two floors, measured on look B and not guessed
// (tests/unit/fixtures/tea/sweep/ keeps the frames; the numbers are here):
//   BRIGHT: the share of pixels brighter than 40 (of 255). B's dead stretch on a desktop (y 0.82, 0.83, 0.84) is 0.21,
//     0.12 and 0.10; its dark but good frames (0.58, 0.66) are 0.39 and 0.50. Under 0.3 fails.
//   BAND: a band a quarter of the frame tall whose mean is under 30 and whose spread (standard deviation) is under 8
//     is dark and flat; the darkest band of B's good desktop frames has a spread of 20 or more. On a phone the lower
//     40% is read row by row, and fails when more than half its rows are dark and flat: B's phone frames from 0.45
//     have a lower 40% of mean 13.1 and spread 1.5, and at 0.58 and 0.66, where an episode's slip lies across part
//     of it, 61% and 62% of its rows are still dark and flat.
//   node scripts/tools/tea/sweep.mjs <address> [--phone] [--n 240]   (against a running server; prints the failures)
export const FLOORS = Object.freeze({ lum: 40, bright: 0.3, bandMean: 30, bandSpread: 8, rows: 0.5 });

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
  const why = bright < FLOORS.bright ? `nearly all dark (${bright.toFixed(2)} of it brighter than ${FLOORS.lum})`
    : flat.length ? (phone ? `${Math.round(deadRows * 100)}% of the lower 40% is dark and flat`
      : `a band at ${(flat[0].at * 100).toFixed(0)}% down is dark and flat (mean ${flat[0].mean.toFixed(1)}, spread ${flat[0].spread.toFixed(1)})`)
      : null;
  return { ok: !why, bright, worst, why };
}

// A frame (a PNG or any picture sharp reads) judged at 96 px wide.
export async function judgePicture(buf, opts) {
  const { default: sharp } = await import('sharp');
  const meta = await sharp(buf).metadata();
  const h = Math.max(1, Math.round((96 * meta.height) / meta.width));
  const { data, info } = await sharp(buf).resize(96, h, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return judge(data, info.width, info.height, opts);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [address, ...rest] = process.argv.slice(2);
  const phone = rest.includes('--phone');
  const n = Number(rest[rest.indexOf('--n') + 1]) || (phone ? 200 : 240);
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 } });
  const sep = address.includes('?') ? '&' : '?';
  await page.goto(`${address}${sep}still=1`);
  await page.waitForFunction(() => !window.__room || window.__room.settled());
  let bad = 0;
  for (let i = 0; i < n; i++) {
    const y = i / (n - 1);
    await page.evaluate((y) => scrollTo(0, Math.round(y * (document.documentElement.scrollHeight - innerHeight))), y);
    await page.waitForFunction(() => !window.__room || window.__room.settled());
    const r = await judgePicture(await page.screenshot(), { phone });
    if (!r.ok) { bad++; console.log(`${y.toFixed(3)}: ${r.why}`); }
  }
  console.log(`${n - bad} of ${n} frames are pictures`);
  await browser.close();
}
