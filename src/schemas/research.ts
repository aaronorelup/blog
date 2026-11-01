// A research document: /research/<file name>/, sequential RE-### ids.
import { z } from 'astro/zod';

export const research = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),           // accepted and ignored
  provenance: z.string().optional(),               // one line on how the document was produced
  raw: z.string().optional(),                      // the raw markdown copy served for agents
});
