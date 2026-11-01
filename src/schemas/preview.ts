// The hover card and the short-version box (PREVIEWS.md is the spec). Types only: checkPreview() holds the
// rules and runs from post.ts's refinement, which skips live notebooks.
import { z } from 'astro/zod';
import { TEXT } from '../data/limits.js';

const text = z.string().trim();
export const preview = z.object({
  verdict: text.optional(),
  takeaway: text.optional(),
  points: z.array(text).default([]),
  image: z.string().optional(),     // 640×360 stills and loops made by scripts/tools/preview-media.mjs
  loop: z.string().optional(),
  alt: z.string().optional(),
});

type Preview = z.infer<typeof preview>;
type Issue = (path: string, message: string) => void;

export function checkPreview(p: Preview, issue: Issue) {
  const cap = (k: string, v: string | undefined, n: number) =>
    v && v.length > n && issue(`preview.${k}`, `over the ${n}-character cap in PREVIEWS.md`);
  if (!p.takeaway) issue('preview.takeaway', 'a preview needs a takeaway');
  cap('verdict', p.verdict, TEXT.verdict);
  cap('takeaway', p.takeaway, TEXT.takeaway);
  p.points.forEach((x, i) => cap(`points.${i}`, x, TEXT.point));
  if (p.points.length > TEXT.maxPoints) issue('preview.points', `at most ${TEXT.maxPoints} points`);
  for (const k of ['image', 'loop'] as const)
    if (p[k] && !p[k].startsWith('/media/previews/')) issue(`preview.${k}`, 'make it with scripts/tools/preview-media.mjs (PREVIEWS.md)');
  if (p.loop && !p.image) issue('preview.loop', 'a preview loop needs its still');
}
