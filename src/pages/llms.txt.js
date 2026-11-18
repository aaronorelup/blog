// /llms.txt (llmstxt.org): the site's index for agents (lib/agent-text.js llmsTxt): every listed post, notes page and
// research document by its Markdown twin, the courses and their published lessons, Now, About, the projects, the
// machine endpoints, and /llms-full.txt with its size. contracts.mjs checks every link resolves.
import { cardOf } from '../lib/cards.js';
import { listedPosts, notesBySlug, nowSnapshots, projects, research } from '../lib/content.js';
import { llmsTxt } from '../lib/agent-text.js';
import { corpusBytes } from '../lib/agent-corpus.js';
import { projectsPage } from '../lib/projects.js';
import { publishedLessons } from '../lib/sitemap.js';
import { COURSES, courseCounts, fmtDuration, fmtMinutes } from '../data/courses.js';
import { PAGES } from '../data/pages.js';
import { SOCIAL } from '../data/site.js';

// A course as llmsTxt takes it: its counts as its page gives them, and each published lesson whose page is built,
// once (a slot a legacy lesson covers is that lesson, not another video), a legacy row by the number its page shows.
function courseOf(c) {
  const counts = courseCounts(c.data);
  const seen = new Set();
  const lessons = publishedLessons({ [c.slug]: c.data })
    .filter(({ lesson, loc }) => !lesson.coveredBy && !seen.has(loc) && seen.add(loc))
    .map(({ lesson: l, loc }) => ({ id: (l.legacy && l.legacyId) || l.id, title: l.title, loc, legacy: Boolean(l.legacy),
      duration: l.duration ? fmtDuration(l.duration) : null, text: l.summary || l.idea }));
  return { code: c.code, title: c.title, tagline: c.tagline, href: c.href, counts, minutes: fmtMinutes(counts.runtimeSeconds), lessons };
}

export async function GET() {
  const posts = await listedPosts();
  const [snap] = await nowSnapshots();
  const text = llmsTxt({
    posts, notes: await notesBySlug(), research: await research(), cardOf,
    courses: COURSES.map(courseOf),
    now: snap ? { date: snap.id, summary: snap.data.summary } : null,
    about: { description: PAGES['/about/'].description, social: SOCIAL },
    projects: projectsPage(await projects(), posts).sections.flatMap((s) => s.cards)
      .map((c) => ({ name: c.name, line: c.line, href: c.main?.href, chip: c.chip })),
    fullBytes: await corpusBytes(),
  });
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
