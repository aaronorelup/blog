// A post's icon: /media/icons/<AO-###>.webp (256 px) and <AO-###>-96.webp, keyed by id because slugs get
// renamed; `icon:` overrides the path. No file is a normal case: the caller draws the topic glyph.
import { inPublic } from './paths.js';

export function iconFor(post) {
  const s256 = post.data.icon ?? `/media/icons/${post.data.id}.webp`;
  return inPublic(s256) ? { s256, s96: s256.replace(/\.webp$/, '-96.webp') } : null;
}
