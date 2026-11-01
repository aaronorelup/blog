// The full making-of of a split post: src/content/notes/<post slug>.md, served at /ledger/<slug>/notes/.
// lib/content.js notesBySlug() checks that `post` is the file name and a built post.
import { z } from 'astro/zod';

export const note = z.object({
  post: z.string(),
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
});
