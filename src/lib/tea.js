// The tea room's shaping (pages/tea/index.astro): the main site's own lists turned into the rows and cards the long
// page shows. Pure over what the caller passes in (listed posts only, notes, project cards, course data), so every
// count is computed at build and the page follows the main site on the next deploy.
import { TOPICS } from '../data/taxonomy.js';
import { cardOf } from './cards.js';
import { dayOf, isoDay, shortDate } from './dates.js';
import { iconFor } from './icons.js';
import { countBy, ledgerOrder } from './posts.js';

const NUMERALS = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
export function roman(n) {
  let out = '';
  for (const [v, s] of NUMERALS) while (n >= v) { out += s; n -= v; }
  return out;
}

export const plural = (n, [one, many]) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;

// The hero's one counter line: "73 posts · 41 projects · 2 courses".
export const counterLine = (counts, words) =>
  Object.entries(counts).map(([k, n]) => plural(n, words[k])).join(' · ');

// One post as the page shows it everywhere: never anything but a listed post (the caller passes listedPosts()).
export function postRow(post, notes) {
  const { id, title, summary, date, topic } = post.data;
  const card = cardOf(post);
  const icon = iconFor(post);
  return {
    slug: post.id,
    id,
    title,
    summary,
    href: `/ledger/${post.id}/`,
    notesHref: notes?.has(post.id) ? `/ledger/${post.id}/notes/` : null,
    day: dayOf(date),
    date: shortDate(date),
    iso: isoDay(date),
    topic,
    topicLabel: TOPICS[topic]?.label ?? topic,
    glyph: TOPICS[topic]?.glyph ?? 'book',
    verdict: card.verdict ?? null,
    image: card.image ? { src: card.image, alt: card.alt ?? '' } : null,
    icon,
  };
}

// The ledger by topic: biggest topic first (ties keep taxonomy order), posts in ledger order. The first `features`
// posts with a preview picture become half cards; every other post is an index row, so each post shows once.
export function ledgerByTopic(posts, notes, features = 2) {
  const counts = countBy(posts, 'topic');
  const keys = Object.keys(TOPICS).filter((k) => counts[k]);
  keys.sort((a, b) => counts[b] - counts[a]);
  return keys.map((key) => {
    const rows = ledgerOrder(posts.filter((p) => p.data.topic === key)).map((p) => postRow(p, notes));
    const feat = rows.filter((r) => r.image).slice(0, features);
    return {
      key,
      anchor: `topic-${key}`,
      label: TOPICS[key].label,
      glyph: TOPICS[key].glyph,
      count: rows.length,
      features: feat,
      rows: rows.filter((r) => !feat.includes(r)),
    };
  });
}

// The lore hub's sections with what each holds, from the lore data the course pages read.
export function loreHub(lore, base, labels) {
  const n = (k) => (lore[k] || []).length;
  const counts = {
    world: null,
    timeline: n('timeline'),
    episodes: n('episodes'),
    characters: n('characters'),
    things: n('things'),
    eggs: n('eggs'),
    threads: n('threads'),
    questions: n('questions'),
    steel: null,
  };
  return Object.entries(labels).map(([key, label]) => ({ key, label, href: `${base}/${key}/`, count: counts[key] ?? null }));
}

// A project card's one link on the tea page: its main link, else its first write-up, else its section on /projects/.
export function projectHref(card) {
  if (card.main) return { href: card.main.href, external: card.main.external };
  if (card.posts?.length) return { href: `/ledger/${card.posts[0].slug}/`, external: false };
  return { href: `/projects/#proj-${card.section}`, external: false };
}
