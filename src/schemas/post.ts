// A ledger post. The base object holds types only, so nothing a live notebook (src/data/exempt.js) writes can
// fail it short of broken YAML; every rule is in the refinement, which skips live notebooks for good.
// Unknown keys are stripped, never refused, so a post written ahead of the code still builds.
import { z } from 'astro/zod';
import { TOPIC_KEYS, PROJECT_KEYS, SERIES_TO_PROJECT } from '../data/taxonomy.js';
import { TEXT } from '../data/limits.js';
import { isLive } from '../data/exempt.js';
import { preview, checkPreview } from './preview';

export const STRICT = false;   // W4 sets true: the v2 rules then hold for every post, not only those with a topic.

export const post = z.object({
  id: z.string(),                                  // AO-###, assigned by npm run new-post
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  date: z.coerce.date(),
  topic: z.string().optional(),
  project: z.preprocess((v) => (typeof v === 'string' ? [v] : v), z.array(z.string())).optional(),
  preview: preview.optional(),
  icon: z.string().optional(),                     // overrides /media/icons/<id>.webp
  voice: z.string().optional(),                    // 'claude' where Claude tells its own story; absent means Aaron's
  draft: z.boolean().default(false),               // not built at all
  unlisted: z.boolean().default(false),            // built at its URL with noindex, and in no list (lib/posts.js)
  // v1 fields: PostView's threads and RSS categories read them until T2.1; W4 strips them.
  series: z.array(z.string()).default([]),
  status: z.string().default('note'),
  tags: z.array(z.string()).default([]),
})
.superRefine((p, ctx) => {
  if (isLive(p.id)) return;
  const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: path.split('.'), message });
  // Rules every post meets today: errors on v1 and v2 posts alike.
  if (!/^AO-\d{3,}$/.test(p.id)) issue('id', 'ids look like AO-001; npm run new-post picks the next one');
  if (p.preview) checkPreview(p.preview, issue);
  if (p.topic !== undefined && !TOPIC_KEYS.includes(p.topic)) issue('topic', `one of ${TOPIC_KEYS.join(', ')}`);
  for (const k of p.project ?? []) if (!PROJECT_KEYS.includes(k)) issue('project', `"${k}" is not a project key`);
  if (p.project && new Set(p.project).size !== p.project.length) issue('project', 'a project is listed twice');
  if (p.icon && !/^\/media\/icons\/[A-Za-z0-9-]+\.webp$/.test(p.icon)) issue('icon', 'icons live in /media/icons/');
  if (p.voice !== undefined && p.voice !== 'claude') issue('voice', "only 'claude'; leave it out for Aaron's voice");
  // v2 rules: errors on posts that have a topic now, on every post once STRICT. v1 posts only get warnings.
  if (!STRICT && p.topic === undefined) return;
  if (p.title.length > TEXT.titleCap) issue('title', `over the ${TEXT.titleCap}-character cap (WRITING.md)`);
  if (p.summary.length > TEXT.summaryCap) issue('summary', `over the ${TEXT.summaryCap}-character cap (WRITING.md)`);
  if (!p.topic) issue('topic', 'topic is required (WRITING.md)');
  if (STRICT && !p.draft && !p.unlisted && !p.preview?.verdict) issue('preview', 'a listed post needs a verdict');
})
.transform((p) => ({
  ...p,
  topic: TOPIC_KEYS.includes(p.topic as string) ? (p.topic as string) : 'agents',
  project: [...new Set(p.project ?? p.series.map((s) => SERIES_TO_PROJECT[s as keyof typeof SERIES_TO_PROJECT]))]
    .filter((k) => PROJECT_KEYS.includes(k)),
}));
