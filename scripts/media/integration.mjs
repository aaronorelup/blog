// The build's side of media in R2 (docs/MEDIA.md).
//
// On `astro build`: stop if a file under public/ is over Cloudflare's 25 MiB static-asset cap
// (one such file fails the whole deploy), or if video or audio sits under public/ outside
// the folders files.mjs keeps in git (it belongs in R2, and git would carry it for ever).
// On `astro dev`: a file in the manifest that isn't on disk is sent to the live site, which serves
// it from R2, so the posts' players work locally too.
import fs from 'node:fs';
import path from 'node:path';
import { localMedia, publicFiles, readManifest, SITE, typeOf } from './files.mjs';

const CAP = 25 * 1024 * 1024;
const HOW = 'Video and audio go to R2 with npm run media:push (docs/MEDIA.md).';

export default function media() {
  return {
    name: 'media-in-r2',
    hooks: {
      'astro:build:start': () => {
        const big = publicFiles().filter(([, file]) => fs.statSync(file).size > CAP).map(([url]) => url);
        if (big.length) throw new Error(`Over the 25 MiB a static file may be, which fails the deploy: ${big.join(', ')}. ${HOW}`);
        const stray = localMedia().map(([url]) => url);
        if (stray.length) throw new Error(`Video or audio in public/: ${stray.join(', ')}. ${HOW}`);
      },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          const url = decodeURIComponent((req.url || '').split('?')[0]);
          if (!typeOf(url) || !readManifest()[url] || fs.existsSync(path.join(server.config.publicDir, url))) return next();
          res.writeHead(302, { Location: SITE + url }).end();
        });
      },
    },
  };
}
