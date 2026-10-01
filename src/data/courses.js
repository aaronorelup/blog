// Courses, as listed on /courses and in the homepage's panel. Each course's lessons, modules and
// publish state come from its data file, which the course's own publish tool regenerates every
// time a lesson is filed (My Projects/Courses/<course>/tools/publish.py) — never edit those by hand.
// Courses come out one at a time; the locked slot stands for whatever comes next, with no title
// until there is a real one.
import hiddenCurriculum from './courses/the-hidden-curriculum.json';

export const COURSES = [
  {
    code: 'C-01',
    slug: 'the-hidden-curriculum',
    href: '/courses/the-hidden-curriculum/',
    title: 'The Hidden Curriculum',
    tagline: 'What nobody taught you about building with AI',
    summary:
      'Terminals, files, git, API keys, OAuth, hosting, Docker, licenses: the layer of everyday tools that school rarely teaches, drawn as a map you can keep in your head. Short narrated lessons, each one a mental model rather than a set of steps.',
    card: '/media/the-hidden-curriculum/card.webp',
    data: hiddenCurriculum,
  },
];

export const NEXT_COURSE = {
  code: 'C-02',
  title: 'The next course',
  summary: 'Not announced yet. When it is, its title goes here, and it opens a lesson at a time like C-01.',
  card: '/courses/the-hidden-curriculum/engine/assets/teahouse-night.jpg',
};

// same rounding as the lesson player (whole seconds, rounded down), so the two never disagree
export const fmtDuration = (s) => {
  const t = Math.floor(s);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};

export const fmtMinutes = (s) => `${Math.max(1, Math.round(s / 60))} min`;
