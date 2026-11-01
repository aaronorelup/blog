// Build-time pass over every post's HTML, for the pictures in it.
//
// - Each <img> that points at a file in public/ gets that file's width and height, so the
//   browser keeps its space before the (lazy) file arrives. Without them the text below every
//   picture jumped down as you scrolled into it, and a jump back to a playing video ("Back to
//   it") or to a heading landed somewhere else by the time the pictures above had loaded.
// - If a larger copy sits beside the file as <name>.full.<ext>, the image gets
//   data-full="…": the post shows the light copy and the image viewer loads the large one when
//   the picture is opened (post-components.js, "The image viewer").
// Attributes already written in the post win.
//
// Most pictures in posts are raw HTML (<figure>, <ao-compare>), which Markdown hands to rehype
// as unparsed text, and Astro parses it only after every user plugin has run. So this parses it
// first (rehype-raw, the same parser Astro uses; its own pass later finds nothing left to do).
import fs from 'node:fs';
import path from 'node:path';
import rehypeRaw from 'rehype-raw';
import sharp from 'sharp';

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
    await Promise.all(imgs.map(async (img) => {
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
