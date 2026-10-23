// /courses/i-love-my-evening-television/lore.js: the published lore for the lesson player, which draws every
// scene from it at play time (COURSE_DESIGN §2): window.LORE is src/data/lore/lore.json as lore.py publish wrote
// it, window.LORE_STAMP says which copy (the lessons show it, bottom left). The lessons load it as ../../lore.js.
import { createHash } from 'node:crypto';
import { LORE } from '../../../lib/lore.js';

export function GET() {
  const raw = JSON.stringify(LORE);
  const stamp = {
    date: (LORE.built?.at ? String(LORE.built.at) : new Date().toISOString()).slice(0, 10),
    hash: createHash('sha1').update(raw).digest('hex').slice(0, 8),
    ...(LORE.built?.commit ? { commit: String(LORE.built.commit).slice(0, 7) } : {}),
  };
  // </script> can't close anything here (it's a script file), but keep < out of strings anyway for inlining
  const body = `window.LORE = ${raw.replace(/</g, '\\u003c')};\nwindow.LORE_STAMP = ${JSON.stringify(stamp)};\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
}
