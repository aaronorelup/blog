// The byte length of every video and audio file in public/ (only public/courses/ keeps any; the
// rest is in R2, which knows its own lengths), for worker/media/serve.js. A 206 has to
// state the file's length, and inside a Worker the asset binding doesn't give it (no
// Content-Length on what it returns), so the build writes it down. Regenerated on every build
// from the files themselves, so it can't drift from them.
import fs from 'node:fs';
import path from 'node:path';
import { PUBLIC_DIR } from '../lib/paths.js';

const MEDIA = /\.(mp4|m4v|webm|mov|mp3|m4a|aac|wav|ogg|oga|opus|flac)$/i;

export async function GET() {
  const sizes = {};
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (MEDIA.test(e.name)) sizes['/' + path.relative(PUBLIC_DIR, p).split(path.sep).join('/')] = fs.statSync(p).size;
    }
  };
  walk(PUBLIC_DIR);
  return new Response(JSON.stringify(sizes), { headers: { 'Content-Type': 'application/json' } });
}
