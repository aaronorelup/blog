// One dated snapshot of the Now page: src/content/now/<YYYY-MM-DD>.md. The file name is its date and its address,
// /now/<date>/, and the newest is /now as well (lib/content.js nowSnapshots() checks the names and orders them).
import { z } from 'astro/zod';

export const now = z.object({
  summary: z.string().trim().min(1).max(160),      // the gist in a line: its row under History, its page's description
  draft: z.boolean().default(false),               // true: not built until Aaron OKs it, as with a post
});
