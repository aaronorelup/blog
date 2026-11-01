// The projects page's data (src/content/projects/*.yaml, read through lib/content.js): the five sections, each card's
// chip, needs glyph, picture and resolved posts, in order. ProjectsView passes the entries and the listed posts in.
// A card linking a post that isn't listed (a draft, an unlisted post) fails the build.
import hiddenCurriculum from '../data/courses/the-hidden-curriculum.json';
import { courseCounts, fmtMinutes } from '../data/courses.js';
import { iconFor } from './icons.js';
import { countBy } from './posts.js';

// In page order. badge: the card's eyebrow; button: its main link's label unless the file names one.
export const SECTIONS = {
  play: { title: 'Play it here', badge: 'Play in browser', button: 'Play it', glyph: 'browser',
    intro: 'Opens right here, nothing to install. Each card says what it needs, and most of the games want a keyboard.' },
  download: { title: 'Download it', badge: 'Download', button: 'Download', glyph: 'download',
    intro: 'Runs on your own computer. Free. Some need an AI key, which costs cents to a couple of dollars a month.' },
  watch: { title: 'Watch', badge: 'Watch', button: 'Watch', glyph: 'watch',
    intro: 'Films, paintings and videos, most of them made by crews of Claude agents.' },
  read: { title: 'Read about it', badge: 'Read about it', button: 'Read the write-up', glyph: 'read',
    intro: 'These run on my laptop, are private, or aren’t out yet. The write-up is the way in.' },
  stopped: { title: 'Stopped', badge: 'Stopped', button: 'Read why', glyph: 'read',
    intro: 'Things I stopped, and why, and the oldest thing here.' },
};

const MONTH = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const monthOf = (since) => MONTH.format(new Date(`${since}-01T00:00:00Z`));
const CHIP = {
  finished: (m) => `Finished · ${m}`,
  building: (m) => `Still building · ${m}`,
  paused: (m) => `Paused since ${m}`,
  'not-out': () => 'Not out yet',
  stopped: (m) => `Stopped · ${m}`,
};

// What a card takes from data other tools keep current, by file name: the course's publisher rewrites its JSON.
export const DERIVED = {
  'the-hidden-curriculum': () => {
    const c = courseCounts(hiddenCurriculum);
    return { since: hiddenCurriculum.updated.slice(0, 7), note: `${c.watchable} lessons to watch, ${fmtMinutes(c.runtimeSeconds)} in all` };
  },
};

const external = (href) => /^(https?:)?\/\//.test(href);
const link = (l) => ({ ...l, external: external(l.href) });

function cardOf(entry, listed, counts) {
  const p = { ...entry.data, ...DERIVED[entry.id]?.() };
  const section = SECTIONS[p.section];
  const posts = p.posts.map(({ id }) => {
    const post = listed.get(id);
    if (!post) throw new Error(`src/content/projects/${entry.id}.yaml: "${id}" is not a listed post, so no card may link it`);
    return post;
  });
  const icon = posts[0] && iconFor(posts[0]);
  return {
    key: entry.id,
    ...p,
    badge: section.badge,
    chip: CHIP[p.state](monthOf(p.since)),
    glyph: /\bWindows\b/.test(p.needs ?? '') ? 'windows' : section.glyph,
    picture: p.image ? { src: p.image.src, alt: p.image.alt } : icon ? { src: icon.s256, alt: '', icon: true } : null,
    main: p.main && link({ label: p.main.label ?? section.button, href: p.main.href }),
    more: p.more.map(link),
    posts: posts.map((post) => ({ slug: post.id, title: post.data.title })).filter((x) => `/ledger/${x.slug}/` !== p.main?.href),
    postCount: p.project ? counts[p.project] ?? 0 : 0,
  };
}

const byOrder = (a, b) => a.order - b.order || b.since.localeCompare(a.since);

// { sections: [{ key, title, intro, cards }], highlights: cards } for ProjectsView.
export function projectsPage(entries, listedPosts) {
  const listed = new Map(listedPosts.map((post) => [post.id, post]));
  const counts = countBy(listedPosts, 'project');
  const cards = entries.map((e) => cardOf(e, listed, counts)).sort(byOrder);
  return {
    sections: Object.entries(SECTIONS).map(([key, s]) => ({ key, ...s, cards: cards.filter((c) => c.section === key) })),
    highlights: cards.filter((c) => c.highlight).sort((a, b) => a.highlight - b.highlight),
  };
}
