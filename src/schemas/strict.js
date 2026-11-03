// The v2 content rules (WRITING.md): a topic, the title and summary caps, a verdict on every listed post. One
// function, read by src/schemas/post.ts (the build) and scripts/check/frontmatter.mjs (npm run check), on a post's
// frontmatter as parsed or as raw YAML. Live notebooks and HELD posts (src/data/exempt.js) never get them.
import { TEXT } from '../data/limits.js';

// W4's rollout switch, the one line to flip after a day of clean deploys. false: these rules fail npm run check and
// npm test, and the deploy build only prints them for posts without a topic (posts with one have failed the build
// on the caps since T0.2). true: they fail the deploy build too, for every post.
export const STRICT = false;

const length = (v) => String(v ?? '').trim().length;

export function v2Rules(p, issue) {
  const title = length(p.title);
  const summary = length(p.summary);
  if (title > TEXT.titleCap) issue('title', `${title} characters, over the ${TEXT.titleCap}-character cap (WRITING.md)`);
  if (summary > TEXT.summaryCap) issue('summary', `${summary} characters, over the ${TEXT.summaryCap}-character cap (WRITING.md)`);
  if (!p.topic) issue('topic', 'topic is required (WRITING.md)');
  if (!p.draft && !p.unlisted && !p.preview?.verdict) issue('preview', 'a listed post needs a verdict (PREVIEWS.md)');
}
