// A scene's still as a tiny picture inlined in the page (build time only): what stands under a scene's back plate
// from the first frame, before its still and plates have come, so a jump to a chapter far off shows its room at
// once, blurred, and never the night ground (2.5 "Loading"). 40 px wide, a few hundred bytes. BLANK is what a flat
// holds until its picture has come: a picture with nothing in it, so a flat without its plate draws nothing at all
// (not a broken-picture box), and no stylesheet has to hide it.
import sharp from 'sharp';
import { publicFile } from './paths.js';

export const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
export const PREVIEW_W = 40;

const made = new Map();
export function preview(src) {
  if (!made.has(src)) {
    made.set(src, sharp(publicFile(src)).resize({ width: PREVIEW_W }).webp({ quality: 60 }).toBuffer()
      .then((b) => `data:image/webp;base64,${b.toString('base64')}`));
  }
  return made.get(src);
}

export async function ratioOf(src) {
  const m = await sharp(publicFile(src)).metadata();
  return m.width / m.height;
}
