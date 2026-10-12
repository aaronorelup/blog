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
      "Anyone can build almost anything with AI now. What stops people is the small gaps nobody teaches: where the agent actually works, what its “done” is worth, which keys are public, what runs while you're away. Short narrated lessons, each one a mental model rather than a set of steps, on a curriculum rebuilt from dated outside sources as the gaps move.",
    // the course's painted plate, with no chips: card.webp and og.jpg still show the old 00.01 title card and its
    // retired topics; export new ones from the rebuilt 00.01's title card once it exists
    card: '/courses/the-hidden-curriculum/engine/assets/teahouse-night.jpg',
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

// What a course's data adds up to. Since the 2026-10-12 rebuild a module lists two kinds of rows: the course's
// own lessons (slots, published or locked) and legacy lessons, made before the rebuild, that stand in for the
// slots they cover ("covers") and stay listed after those are remade. A slot covered by a legacy lesson listed
// in another module ("coveredBy") is a lesson of the course, not another video. totalLessons counts every row, so the
// number of lessons is the set of slot IDs: the own rows' plus the ones only a legacy row stands for.
// Data from before the rebuild has no legacy rows, and this returns what it always said.
export const isLegacyRow = (l) => Boolean(l.legacy && !l.coveredBy);

export const courseCounts = (data, inModule = null) => {
  const rows = (inModule ? [inModule] : data.modules).flatMap((m) => m.lessons);
  const slots = new Set();
  const ai = new Set();
  for (const l of rows) {
    if (!isLegacyRow(l)) {
      slots.add(l.id);
      if (l.lantern) ai.add(l.id);
      continue;
    }
    const covers = (l.covers || []).filter((id) => !inModule || id.split('.')[0] === inModule.n);
    covers.forEach((id) => slots.add(id));
    if (l.lantern && l.covers?.length === 1 && covers.length === 1) ai.add(covers[0]);
  }
  const watchable = rows.filter((l) => l.status === 'published' && !l.coveredBy);
  return {
    lessons: slots.size,
    out: rows.filter((l) => l.status === 'published' && !l.legacy).length,
    legacy: rows.filter(isLegacyRow).length,
    watchable: watchable.length,
    ai: ai.size,
    runtimeSeconds: watchable.reduce((n, l) => n + (l.duration || 0), 0),
  };
};
