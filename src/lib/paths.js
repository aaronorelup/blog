// The one way to find public/: astro.config.mjs defines __PUBLIC_DIR__ from Astro's own publicDir (a path
// from import.meta.url would resolve under dist/ inside a prerendered chunk). Build time only.
import fs from 'node:fs';
import path from 'node:path';

export const PUBLIC_DIR = __PUBLIC_DIR__;
export const publicFile = (src) => path.join(PUBLIC_DIR, src);
export const inPublic = (src) => fs.existsSync(publicFile(src));
