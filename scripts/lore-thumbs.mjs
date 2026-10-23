// Small copies of the lore course's pictures, for its index cards (C-02, /courses/i-love-my-evening-television/).
//
// The lore's pictures (public/courses/i-love-my-evening-television/media/, copied there by the series repo's
// `lore.py publish`) are up to 1280 px wide; an index of 77 character cards on a phone needs them a quarter of
// that. Rather than commit a second copy of every picture, the build writes one: after `astro build`, each file
// under media/ gets a 560 px wide WebP at the same path under thumbs/ in dist/. If sharp can't read a file (or
// isn't there), the original is copied instead, so a card never points at nothing. `astro dev` has no dist/:
// there the thumbs/ path is answered with the original file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const COURSE = 'courses/i-love-my-evening-television';
const WIDTH = 560;

const walk = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]))
    : [];

export default function loreThumbs() {
  return {
    name: 'lore-thumbs',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith(`/${COURSE}/thumbs/`)) req.url = req.url.replace(`/${COURSE}/thumbs/`, `/${COURSE}/media/`);
          next();
        });
      },
      'astro:build:done': async ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const media = path.join(dist, COURSE, 'media');
        const files = walk(media).filter((f) => /\.(webp|png|jpe?g|avif)$/i.test(f));
        if (!files.length) return;
        let sharp = null;
        try {
          sharp = (await import('sharp')).default;
        } catch (e) {
          logger.warn('sharp not available: the lore thumbnails are copies of the originals');
        }
        let made = 0, copied = 0;
        for (let i = 0; i < files.length; i += 8) {
          await Promise.all(
            files.slice(i, i + 8).map(async (f) => {
              const rel = path.relative(media, f);
              const target = path.join(dist, COURSE, 'thumbs', rel); // same name as the original, so a URL swap is enough
              fs.mkdirSync(path.dirname(target), { recursive: true });
              try {
                if (!sharp) throw new Error('no sharp');
                const img = sharp(f);
                const meta = await img.metadata();
                if (!meta.width || meta.width <= WIDTH) throw new Error('small');
                const fmt = path.extname(f).slice(1).toLowerCase().replace('jpg', 'jpeg');
                await img.resize({ width: WIDTH }).toFormat(fmt, { quality: 72 }).toFile(target);
                made++;
              } catch (e) {
                fs.copyFileSync(f, target);
                copied++;
              }
            }),
          );
        }
        logger.info(`lore thumbnails: ${made} made, ${copied} copied as they were`);
      },
    },
  };
}
