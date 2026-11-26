// npm run new-post "Title of the post": creates src/content/posts/<slug>.md with the next free AO-### id, today's
// date and the v2 frontmatter to fill in (WRITING.md). The preview stub stays commented out until it's written, so
// a placeholder can never ship as a hover card.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { PROJECT_KEYS, TOPIC_KEYS } from '../../src/data/taxonomy.js';

const POSTS = fileURLToPath(new URL('../../src/content/posts/', import.meta.url));
const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('Usage: npm run new-post "Title of the post"');
  process.exit(1);
}

const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
if (!slug) {
  console.error('The file is named after the title, which needs a letter (a to z) or a digit in it');
  process.exit(1);
}
const file = POSTS + slug + '.md';
if (fs.existsSync(file)) {
  console.error(`Already exists: ${file}`);
  process.exit(1);
}
const last = Math.max(0, ...fs.readdirSync(POSTS).filter((f) => f.endsWith('.md'))
  .map((f) => Number(/^AO-(\d+)$/.exec(matter.read(POSTS + f).data.id ?? '')?.[1] ?? 0)));
const id = `AO-${String(last + 1).padStart(3, '0')}`;

fs.writeFileSync(file, `---
id: "${id}"
title: "${title.replace(/[\\"]/g, '\\$&')}"
summary: "What the post is about, in as few words as possible. No result here: the card gives it. 240 characters at most."
date: ${new Date().toISOString().slice(0, 10)}
topic: ""          # required, one of: ${TOPIC_KEYS.join(', ')}
project: []        # optional, any of: ${PROJECT_KEYS.join(', ')}
draft: true        # until Aaron says it's good, in his own words
credits:           # who made this post, shown under the summary (WRITING.md "Credits")
  owner: ""        # who had the idea: Aaron, or the agent that picked it, by the name he calls it (Gages, Duet)
  worker: ""       # the model that did the work, with its effort: "Opus 5.5 xhigh", "Opus 5.5 fleet"
  # orchestrator: ""   # only if one agent ran other agents or sessions for it: its model
  # writer: ""         # only if another agent than the worker wrote the post
  # cost: 0            # what the work would cost at API prices, in dollars, only if measured
# The hover card: write it once the post is finished. PREVIEWS.md is the spec.
# preview:
#   verdict: "2 to 5 words: the outcome"
#   takeaway: "The main conclusion in one or two short sentences, with its number."
#   points:
#     - "A finding the takeaway doesn't say. 120 characters at most."
#   image: "/media/previews/${slug}.webp"   # node scripts/tools/preview-media.mjs ${slug} <source>
#   alt: "What the picture shows"
---

Start writing here.
`);
console.log(`Created src/content/posts/${slug}.md as ${id}`);
