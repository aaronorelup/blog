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
import { fileURLToPath } from 'node:url';
import rehypeRaw from 'rehype-raw';

const FULL_EXTS = ['.webp', '.png', '.jpg', '.jpeg', '.avif'];

export default function rehypePostImages() {
  const parse = rehypeRaw();
  const sizes = new Map();
  let sharp;
  const sizeOf = async (file) => {
    if (!sizes.has(file)) {
      sizes.set(file, (async () => {
        try {
          sharp = sharp || (await import('sharp')).default;
          const m = await sharp(file).metadata();
          return m.width && m.height ? { w: m.width, h: m.height } : null;
        } catch (e) {
          return null; // no sharp, or not an image it can read: leave the tag as written
        }
      })());
    }
    return sizes.get(file);
  };

  return async (tree, file) => {
    const root = parse(tree, file) || tree;
    const pub = publicDir(file);
    if (!pub) return root;
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

// public/ for the project the Markdown file belongs to: walk up from the file to the folder
// that holds both src/ and public/. The dev server is often started from the folder above
// (--root blog), so the working directory can't be trusted.
const roots = new Map();
function publicDir(file) {
  let dir = file?.path ? path.dirname(typeof file.path === 'string' ? file.path : fileURLToPath(file.path)) : process.cwd();
  if (roots.has(dir)) return roots.get(dir);
  const start = dir;
  let found = null;
  for (let i = 0; i < 8 && dir; i++) {
    if (fs.existsSync(path.join(dir, 'public')) && fs.existsSync(path.join(dir, 'src'))) { found = path.join(dir, 'public'); break; }
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  roots.set(start, found);
  return found;
}
