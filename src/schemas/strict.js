// The v2 content rules (WRITING.md): a topic, the title and summary caps, a verdict on every listed post. One
// function, read by src/schemas/post.ts (the build) and scripts/check/frontmatter.mjs (npm run check), on a post's
// frontmatter as parsed or as raw YAML. They never fail a live notebook or a HELD post (src/data/exempt.js): the
// schema skips both, and the checker only warns about them.
import { TEXT } from '../data/limits.js';

// On since 2026-11-04, after a day of clean deploys (W4's rollout): these rules fail the deploy build for every post
// but the exempt ones. false would put them back to failing only npm run check and npm test, and the deploy build
// only printing them for posts without a topic.
export const STRICT = true;

const length = (v) => String(v ?? '').trim().length;

export function v2Rules(p, issue) {
  const title = length(p.title);
  const summary = length(p.summary);
  if (title > TEXT.titleCap) issue('title', `${title} characters, over the ${TEXT.titleCap}-character cap (WRITING.md)`);
  if (summary > TEXT.summaryCap) issue('summary', `${summary} characters, over the ${TEXT.summaryCap}-character cap (WRITING.md)`);
  if (!p.topic) issue('topic', 'topic is required (WRITING.md)');
  if (!p.draft && !p.unlisted && !p.preview?.verdict) issue('preview', 'a listed post needs a verdict (PREVIEWS.md)');
}
