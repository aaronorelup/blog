// The byte length of every video and audio file in public/, for worker/media.js. A 206 has to
// state the file's length, and inside a Worker the asset binding doesn't give it (no
// Content-Length on what it returns), so the build writes it down. Regenerated on every build
// from the files themselves, so it can't drift from them.
import fs from 'node:fs';
import path from 'node:path';

const MEDIA = /\.(mp4|m4v|webm|mov|mp3|m4a|aac|wav|ogg|oga|opus|flac)$/i;

export async function GET() {
  // The dev server is often started from the folder above with --root blog.
  const pub = [path.resolve('public'), path.resolve('blog', 'public')].find((d) => fs.existsSync(d));
  const sizes = {};
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (MEDIA.test(e.name)) sizes['/' + path.relative(pub, p).split(path.sep).join('/')] = fs.statSync(p).size;
    }
  };
  if (pub) walk(pub);
  return new Response(JSON.stringify(sizes), { headers: { 'Content-Type': 'application/json' } });
}
