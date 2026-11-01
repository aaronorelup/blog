// The Markdown plugins in their order, for astro.config.mjs and the unit tests. `v` hashes the code they run: Astro's
// content cache keys on the config, where a function counts for nothing, so without it a changed plugin would leave
// every unchanged post with its cached HTML.
import fs from 'node:fs';
import { sha256hex, short } from '../../src/lib/text/hash.js';
import rehypeHeadingIds from './rehype-heading-ids.mjs';
import rehypePostImages from './rehype-post-images.mjs';
import rehypePostText from './rehype-post-text.mjs';

// The post components (T1.2: the src/elements/ folders).
const TAGS = ['ao-ask', 'ao-bars', 'ao-blind', 'ao-calc', 'ao-compare', 'ao-cues', 'ao-demo', 'ao-diff', 'ao-fetch',
  'ao-frames', 'ao-funnel', 'ao-game', 'ao-listen', 'ao-matrix', 'ao-model', 'ao-pan', 'ao-runs', 'ao-series',
  'ao-shots', 'ao-slider', 'ao-timeline', 'ao-transcript', 'ao-treemap'];

const CODE = ['rehype-heading-ids.mjs', 'rehype-post-images.mjs', 'rehype-post-text.mjs', '../../src/lib/text/rules.js',
  '../../src/data/exempt.js'];
const v = short(sha256hex(CODE.map((f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8')).join('\0')));

export const rehypePlugins = ({ publicDir }) => [
  [rehypePostImages, { publicDir }],
  rehypeHeadingIds,
  [rehypePostText, { tags: TAGS, v }],
];
