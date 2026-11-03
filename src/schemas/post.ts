// A ledger post. The base object holds types only, so nothing a live notebook (src/data/exempt.js) writes can
// fail it short of broken YAML; every rule is in the refinement, which skips live notebooks for good.
// Unknown keys are stripped, never refused, so a post written ahead of the code still builds.
import { z } from 'astro/zod';
import { TOPIC_KEYS, PROJECT_KEYS } from '../data/taxonomy.js';
import { isHeld, isLive, LIVE_NOTEBOOKS } from '../data/exempt.js';
import { preview, checkPreview } from './preview';
import { STRICT, v2Rules } from './strict.js';

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
})
.superRefine((p, ctx) => {
  if (isLive(p.id)) return;
  const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: path.split('.'), message });
  if (!/^AO-\d{3,}$/.test(p.id)) issue('id', 'ids look like AO-001; npm run new-post picks the next one');
  if (p.preview) checkPreview(p.preview, issue);
  if (p.topic !== undefined && !TOPIC_KEYS.includes(p.topic)) issue('topic', `one of ${TOPIC_KEYS.join(', ')}`);
  for (const k of p.project ?? []) if (!PROJECT_KEYS.includes(k)) issue('project', `"${k}" is not a project key`);
  if (p.project && new Set(p.project).size !== p.project.length) issue('project', 'a project is listed twice');
  if (p.icon && !/^\/media\/icons\/[A-Za-z0-9-]+\.webp$/.test(p.icon)) issue('icon', 'icons live in /media/icons/');
  if (p.voice !== undefined && p.voice !== 'claude') issue('voice', "only 'claude'; leave it out for Aaron's voice");
  if (isHeld(p.id)) return;
  // Until STRICT, a post without a topic gets the v2 rules only from check/frontmatter.mjs, and the verdict rule
  // waits too: the deploy build prints them instead of failing (strict.js).
  if (STRICT) v2Rules(p, issue);
  else if (p.topic !== undefined) v2Rules(p, (path, message) => path !== 'preview' && issue(path, message));
})
.transform((p) => ({
  ...p,
  topic: TOPIC_KEYS.includes(p.topic as string) ? (p.topic as string) : 'agents',
  project: (p.project ?? (LIVE_NOTEBOOKS as Record<string, { project?: string[] }>)[p.id]?.project ?? [])
    .filter((k) => PROJECT_KEYS.includes(k)),
}));
