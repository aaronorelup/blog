import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    // Sequential ledger id, e.g. "AO-001". Assigned by scripts/new-post.mjs.
    id: z.string(),
    title: z.string(),
    // One-line summary shown in the ledger list and used as the syndication hook.
    summary: z.string(),
    date: z.coerce.date(),
    status: z.enum(['note', 'in-progress', 'shipped']).default('note'),
    tags: z.array(z.string()).default([]),
    // Keys from src/data/series.js. A post can sit in more than one thread.
    series: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const research = defineCollection({
  type: 'content',
  schema: z.object({
    // Sequential research id, e.g. "RE-001" — same convention as the ledger's AO-###,
    // prefix from the root's first two letters. First of its kind gets 001.
    id: z.string(),
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    // One line on how the document was produced — research docs carry their provenance.
    provenance: z.string().optional(),
    // Path to the raw markdown copy served for agents, if one is hosted.
    raw: z.string().optional(),
  }),
});

export const collections = { posts, research };
