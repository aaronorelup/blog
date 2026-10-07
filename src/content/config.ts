import { defineCollection, z } from 'astro:content';
import { PREVIEW_TEXT } from '../data/preview-budget.js';

// The hover card for a post: what a reader who never clicks should leave with. PREVIEWS.md
// at the repo root is the spec (what each field is for, how long, how to make the media).
const cap = (n: number) => z.string().trim().min(1).max(n, `over the ${n}-character cap in PREVIEWS.md`);
const preview = z
  .object({
    verdict: cap(PREVIEW_TEXT.verdict).optional(),
    takeaway: cap(PREVIEW_TEXT.takeaway),
    points: z.array(cap(PREVIEW_TEXT.point)).max(PREVIEW_TEXT.maxPoints).default([]),
    // 640×360, made by scripts/preview-media.mjs. The loop is drawn over the still, so it needs one.
    image: z.string().startsWith('/media/previews/').optional(),
    loop: z.string().startsWith('/media/previews/').optional(),
    alt: z.string().optional(),
  })
  .refine((p) => !p.loop || p.image, { message: 'a preview loop needs an image (its poster)' });

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
    // Soft private: the page still builds and opens by URL, but it is noindex and left out of
    // every list, feed, thread and hand-off. See src/data/listed.js before listing posts.
    unlisted: z.boolean().default(false),
    // Optional so a post without one still builds; it then gets its opening lines as a card,
    // and the build lists it as missing one.
    preview: preview.optional(),
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
