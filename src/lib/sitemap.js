// The parts of /sitemap.xml (pages/sitemap.xml.js) that come from data: the published lessons of each course, read
// from src/data/courses/<slug>.json (another repo writes it; never edited here), with the course's own date, and the
// works under public/ (games, decks, tools, labs) that listed posts link, each dated by its newest such post. A work
// is only ever found through a listed post, so nothing reachable only from a draft or unlisted post is named. Build time.
import fs from 'node:fs';
import path from 'node:path';
import { isLive, isLivePath } from '../data/exempt.js';
import { isoDay } from './dates.js';
import { PUBLIC_DIR } from './paths.js';

const day = (d) => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null);
const newer = (a, b) => (!a ? b : !b ? a : a > b ? a : b);
const slashed = (p) => (p.endsWith('/') ? p : `${p}/`);

// The date a course page goes out with: its course's 'updated', and /courses/ the newest of them. courses: { slug: json }.
export function courseDay(loc, courses) {
  if (loc === '/courses/') return Object.values(courses).map((c) => day(c?.updated)).reduce(newer, null);
  const slug = Object.keys(courses).find((s) => loc.startsWith(`/courses/${s}/`));
  return slug ? day(courses[slug]?.updated) : null;
}

// Every published lesson of every course, in data order: [{ slug (the course's), lesson (its row), loc }]. The course
// repo's 'published' is not trusted alone: a lesson whose page has not landed, or asks not to be indexed, is left out.
// /llms.txt names these too (pages/llms.txt.js).
export function publishedLessons(courses) {
  return Object.entries(courses).flatMap(([slug, c]) => (c?.modules || []).flatMap((m) => m?.lessons || [])
    .filter((l) => l?.status === 'published' && typeof l.url === 'string' && l.url.startsWith('/courses/'))
    .map((lesson) => ({ slug, lesson, loc: slashed(lesson.url.replace(/[?#].*$/, '')) }))
    .filter(({ loc }) => !loc.split('/').includes('..') && shown(loc)));
}

// The sitemap's lessons: each published lesson, dated by its course.
export const courseLessons = (courses) => publishedLessons(courses).map(({ slug, loc }) => ({ loc, lastmod: day(courses[slug].updated) }));

// Same-site links to a hosted work, in a post's Markdown or HTML: [x](/games/a/), href="https://aaronorelup.com/tools/b/".
const WORK = /(?<=^|[\s("'=<])(?:https:\/\/aaronorelup\.com)?(\/(?:games|presentations|tools|labs)\/[^\s"'()<>\]]*)/g;
const KEEP_OUT = /^\/labs\/tea-room\//;     // the tea room's labs: noindex, and in no sitemap (data/tea.js)

// A built page that asks not to be indexed, or only sends the reader on.
const hidden = (html) => (html.match(/<meta\b[^>]*>/gi) || []).some((m) =>
  (/\bname\s*=\s*["']?robots\b/i.test(m) && /noindex/i.test(m)) || /\bhttp-equiv\s*=\s*["']?refresh\b/i.test(m));
// A page under public/ that is built and may be indexed.
function shown(p) {
  const file = path.join(PUBLIC_DIR, p, 'index.html');
  return fs.existsSync(file) && !hidden(fs.readFileSync(file, 'utf8'));
}

function workPage(link) {
  const p = slashed(link.replace(/[?#].*$/, '').replace(/index\.html$/, ''));
  if (p.split('/').includes('..') || isLivePath(p) || KEEP_OUT.test(p)) return null;
  return shown(p) ? p : null;
}

// The hosted works the given (listed) posts link, each once, dated by the newest post that links it. A live
// notebook's links are left alone: other sessions write it (CLAUDE.md).
export function hostedWorks(listed) {
  const works = new Map();
  for (const post of listed) {
    if (isLive(post.id) || isLive(post.data?.id ?? '')) continue;
    for (const [, link] of String(post.body ?? '').matchAll(WORK)) {
      const loc = workPage(link);
      if (loc) works.set(loc, newer(works.get(loc), isoDay(post.data.date)));
    }
  }
  return [...works].sort(([a], [b]) => (a < b ? -1 : 1)).map(([loc, lastmod]) => ({ loc, lastmod }));
}
