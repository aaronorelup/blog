// Every post picture that points into public/ gets its file's width and height (no text jumping as pictures load)
// and data-full="<name>.full.<ext>" when a larger copy sits beside it (the image viewer opens that one); every one but
// the first (it may be the page's largest paint) loads lazily, except in a live notebook. Attributes written in the post
// win. It first parses the raw HTML (rehype-raw, as Astro does): Markdown hands <figure> and <ao-*> over as text.
import fs from 'node:fs';
import path from 'node:path';
import rehypeRaw from 'rehype-raw';
import sharp from 'sharp';
import { isLive } from '../../src/data/exempt.js';

const FULL_EXTS = ['.webp', '.png', '.jpg', '.jpeg', '.avif'];

// `publicDir` is astro.config.mjs's own public/ path.
export default function rehypePostImages({ publicDir: pub }) {
  const parse = rehypeRaw();
  const sizes = new Map();
  const sizeOf = (file) => {
    if (!sizes.has(file)) {
      sizes.set(file, sharp(file).metadata()
        .then((m) => (m.width && m.height ? { w: m.width, h: m.height } : null))
        .catch(() => null)); // no such file, or not an image sharp reads: leave the tag as written
    }
    return sizes.get(file);
  };

  return async (tree, file) => {
    const root = parse(tree, file) || tree;
    const imgs = [];
    (function walk(node) {
      if (node.type === 'element' && node.tagName === 'img') imgs.push(node);
      for (const child of node.children || []) walk(child);
      // <template> content lives apart from children
      if (node.content) walk(node.content);
    })(root);
    const live = isLive(path.basename(file.path || '', '.md'));
    await Promise.all(imgs.map(async (img, i) => {
      const p = img.properties || (img.properties = {});
      const src = typeof p.src === 'string' ? p.src : '';
      if (!src.startsWith('/') || src.startsWith('//')) return;
      const rel = decodeURIComponent(src.split(/[?#]/)[0]);
      const onDisk = path.join(pub, rel);
      if (!onDisk.startsWith(pub)) return;
      if (p.width == null && p.height == null) {
        const size = await sizeOf(onDisk);
        if (size) { p.width = size.w; p.height = size.h; }
      }
      if (p.decoding == null) p.decoding = 'async';
      if (i > 0 && !live && p.loading == null) p.loading = 'lazy';
      if (p.dataFull == null) {
        const ext = path.extname(rel);
        const stem = rel.slice(0, rel.length - ext.length);
        for (const e of FULL_EXTS) {
          if (fs.existsSync(path.join(pub, stem + '.full' + e))) { p.dataFull = stem + '.full' + e; break; }
        }
      }
    }));
    return root;
  };
}
