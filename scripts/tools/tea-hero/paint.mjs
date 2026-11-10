// Paints the hero's stand-in picture (node scripts/tools/tea-hero/paint.mjs): runs paint-scene.js in headless
// Chromium for the far and mid layers, night and dusk, and writes public/tea/hero/bg-<layer>-<mode>.webp with sharp.
// A placeholder until the final painted picture and its cut-outs replace these files in the manifest.
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import sharp from 'sharp';

const OUT = new URL('../../../public/tea/hero/', import.meta.url);
const painter = readFileSync(new URL('./paint-scene.js', import.meta.url), 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<!doctype html><title>paint</title>');
await page.addScriptTag({ content: painter });
for (const layer of ['far', 'mid']) {
  for (const mode of ['night', 'day']) {
    const url = await page.evaluate(([l, m]) => window.paintTeaHouse(l, m), [layer, mode]);
    const png = Buffer.from(url.split(',')[1], 'base64');
    const webp = await sharp(png).webp({ quality: layer === 'far' ? 74 : 78, alphaQuality: 80, effort: 6 }).toBuffer();
    const name = `bg-${layer}-${mode}.webp`;
    writeFileSync(new URL(name, OUT), webp);
    console.log(name, webp.length, 'bytes');
  }
}
await browser.close();
