// One card on the projects page: src/content/projects/<name>.yaml, one file each so parallel edits never collide.
import { z } from 'astro/zod';
import { reference } from 'astro:content';
import { PROJECT_KEYS } from '../data/taxonomy.js';

const link = z.object({ label: z.string().max(40), href: z.string() });

export const project = z.object({
  name: z.string().max(60),
  line: z.string().max(160),                                   // what it is, in plain words
  section: z.enum(['play', 'download', 'watch', 'read', 'stopped']),
  state: z.enum(['finished', 'building', 'paused', 'not-out', 'stopped']),
  since: z.string().regex(/^\d{4}-\d{2}$/),                    // shown as "Finished · Sep 2026"
  needs: z.string().max(90).optional(),                        // "Desktop browser and a keyboard"
  image: z.object({ src: z.string().regex(/^\/media\/projects\/[a-z0-9-]+\.webp$/), alt: z.string() }).optional(),
  main: link.partial({ label: true }).optional(),              // the one button; label: its section's (lib/projects.js)
  more: z.array(link).max(2).default([]),                      // "How it was made", "Source on GitHub"
  posts: z.array(reference('posts')).max(4).default([]),
  project: z.enum(PROJECT_KEYS as [string, ...string[]]).optional(),   // its ledger chip
  private: z.boolean().default(false),                         // a "Behind the scenes" card
  highlight: z.number().int().min(1).max(4).optional(),        // position in Highlights
  order: z.number().int().default(100),
  credit: z.string().max(120).optional(),
})
.refine((p) => !p.private || [p.main, ...p.more].every((l) => !l || l.href.startsWith('/')),
  'a private project links only to pages of this site')
.refine((p) => !['play', 'download'].includes(p.section) || !!p.needs, 'play and download cards say what you need');
