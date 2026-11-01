// askBuild(): this build's Ask files and manifest, made once (manifest.js over docs.js's docs and search's chunks).
// Read by src/pages/ask/ and SearchBox.astro's line under the box. ASK_WHOLE_TOKENS and ASK_PACK_TOKENS, build-only
// environment knobs that Workers Builds never sets, shrink the caps for the split-mode drill (docs/ASK.md, G3).
import PINS from '../../data/ask-packs.json';
import { searchDocs } from '../search/docs.js';
import { askDocs } from './docs.js';
import { assemble } from './manifest.js';

let built = null;

export function askBuild() {
  built ??= (async () => assemble(await askDocs(), {
    pins: PINS.starts,
    search: await searchDocs(),
    caps: { ...(process.env.ASK_WHOLE_TOKENS && { WHOLE_CAP: Number(process.env.ASK_WHOLE_TOKENS) }),
      ...(process.env.ASK_PACK_TOKENS && { PACK_CAP: Number(process.env.ASK_PACK_TOKENS) }) },
  }))();
  return built;
}
