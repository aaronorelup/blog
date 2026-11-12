// The tea room (/tea/): the long view of the whole site on one page. Every word of its own copy lives here, inside the
// never-publish scan. Lists and counts never live here: they come from the same helpers the main site uses (lib/tea.js).
// TEA_SEO is the one switch for how /tea/ meets search engines; teaSeo() turns it into what the layout and the sitemap
// read. Policy is Aaron's call, not made yet: 'pending' ships, which is what any new page gets.
export const TEA_BASE = '/tea';
export const TEA_SEO = 'pending';   // 'pending' | 'canonical-main' | 'noindex' | 'index'
export const TEA_CANONICAL_TWIN = '/';

// { noindex, canonical, inSitemap }: canonical is a site path to name instead of the page itself, or null for the default.
export function teaSeo(policy = TEA_SEO, twin = TEA_CANONICAL_TWIN) {
  switch (policy) {
    case 'pending': return { noindex: false, canonical: null, inSitemap: false };
    case 'canonical-main': return { noindex: false, canonical: twin, inSitemap: false };
    case 'noindex': return { noindex: true, canonical: null, inSitemap: false };
    case 'index': return { noindex: false, canonical: null, inSitemap: true };
    default: throw new Error(`src/data/tea.js: TEA_SEO "${policy}" is not one of pending, canonical-main, noindex, index`);
  }
}

export const TEA_PAGE = {
  title: "Aaron Orelup · the tea room",
  description: 'Every post, project and course from my tea house on one long page.',
};

// The chapters, in page order. id is the anchor; word is the giant heading; lede sits under it.
export const CHAPTERS = [
  { id: 'start', label: 'Start here', word: 'Start here', lede: 'The posts I\'d hand someone first.' },
  { id: 'ledger', label: 'The ledger', word: 'The ledger', lede: 'Everything I\'ve written about learning AI, sorted by topic.' },
  { id: 'projects', label: 'Projects', word: 'Projects', lede: 'Everything I\'ve made or am making, sorted by what you can do with it.' },
  { id: 'courses', label: 'Courses', word: 'Courses', lede: 'One on building with AI, one on the world of my TV series.' },
  { id: 'now', label: 'Now', word: 'Now', lede: 'What I\'m working on this month, and the setup I use.' },
  { id: 'about', label: 'About', word: 'About', lede: 'Who I am and where to find me.' },
];

export const COPY = {
  kicker: 'The tea room',
  title: 'Everything on one page',
  statement: 'Every post, project and course from my tea house, laid out on one long page so you can see it all at once.',
  skip: 'Skip to the chapters',
  toMain: 'Go to the main site',
  railTitle: 'Aaron\'s tea room',
  railBack: 'Main site',
  chaptersLabel: 'Chapters',
  contentsLabel: 'Contents',
  // the counter line's words, after their computed numbers
  counter: { posts: ['post', 'posts'], projects: ['project', 'projects'], courses: ['course', 'courses'] },
  // The ledger
  topicsLabel: 'Topics',
  postCount: ['post', 'posts'],
  projectCount: ['project', 'projects'],
  notes: 'Notes',
  notesTitle: 'The full making-of',
  readAll: 'Open the ledger',
  // Projects
  sectionsLabel: 'Sections',
  projectsPage: 'Open the projects page',
  writeUp: 'Write-up',
  // Courses
  openCourse: 'Open the course',
  lessonsOut: (out, all) => `${out} of ${all} lessons out`,
  lessonsComing: (n) => `${n} lessons coming`,
  runtime: (m) => `${m} in all`,
  loreFacts: (chars, eps) => [`${chars} character sheets`, `${eps} episodes`],
  lessonsToWatch: (n) => `${n} ${n === 1 ? 'lesson' : 'lessons'} to watch`,
  hubLabel: 'Inside the lore',
  hub: {
    world: 'The world',
    timeline: 'Timeline',
    episodes: 'Episodes',
    characters: 'Characters',
    things: 'Things',
    eggs: 'Easter eggs',
    threads: 'Threads',
    questions: 'Open questions',
    steel: 'Set in steel',
  },
  nextLocked: 'Not announced yet',
  coursesPage: 'All courses',
  // Now
  updated: 'Updated',
  olderSnapshots: 'Older snapshots',
  nowPage: 'Open the Now page',
  researchTitle: 'Research notes',
  researchLede: 'Longer reading I did for my own projects, kept as documents.',
  // Utilities and footer
  utilitiesLabel: 'Around the site',
  utilities: [
    { label: 'Search the ledger', line: 'Words and meaning, on the ledger page.', href: '/ledger/' },
    { label: 'Ask RAG Goobie', line: 'Ask my posts a question. It reads them first.', href: '/ledger/' },
    { label: 'Stats', line: 'What people read here, by the numbers.', href: '/stats' },
    { label: 'RSS', line: 'New posts in any reader app.', href: '/rss.xml' },
  ],
  footerLine: 'This is the long view of aaronorelup.com. The tea house is the front door.',
  backToTop: 'Back to the top',
  mainNavLabel: 'The main site',
  elsewhere: 'Elsewhere',
  copyright: (year) => `© ${year} Aaron Orelup.`,
  // The chapter titles of the page being rebuilt (src/data/tea-chapters.js), as the picker shows them; the topic
  // chapters and the series take theirs from src/data/taxonomy.js
  chapterTitles: { hero: 'The garden', start: 'Start here', projects: 'Projects', courses: 'Courses', now: 'Now', about: 'About' },
};
