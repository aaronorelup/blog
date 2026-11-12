// The tea room's chapters as the page draws them: the owner's picks (lib/tea-picks.js reads and checks them) turned
// into the rows each shelf shows, with the same row builders the page uses today. Pure over what the caller passes
// in; lib/tea-room.js passes the real site. A draft or unlisted post never comes out, whatever the picks say.
import { isListed } from './posts.js';
import { readPicks } from './tea-picks.js';
import { postRow, projectHref, roman } from './tea.js';

// doc: the picks; registry: TEA_CHAPTERS. posts: post entries (any: only listed ones can show), notes: the notes
// Map, cards: projectsPage's cards, hasMachine(name), warn(message) for what the page shows without failing.
// Returns the visible chapters in page order: [{ id, dom, kind, topic, title, numeral, shelves: [{ id, max, holds,
// auto, count, rows }] }]. The hero has no numeral; the others are numbered I, II, ... as they show.
export function resolveChapters(doc, registry, { posts, notes, cards, hasMachine, warn = () => {} }) {
  const listed = new Map(posts.filter((p) => isListed(p.data)).map((p) => [p.id, p]));
  const byKey = new Map(cards.map((c) => [c.key, c]));
  const { chapters, warnings } = readPicks(doc, registry, { posts, projects: new Set(byKey.keys()), hasMachine });
  warnings.forEach((w) => warn(w));
  const row = {
    post: (slug) => ({ kind: 'post', ...postRow(listed.get(slug), notes) }),
    project: (key) => {
      const card = byKey.get(key);
      const hidden = (card.posts ?? []).find((p) => !listed.has(p.slug));
      if (hidden) throw new Error(`src/data/tea-picks.json: project "${key}" links "${hidden.slug}", which is not a listed post`);
      return { kind: 'project', key, card, ...projectHref(card) };
    },
    machine: (name) => ({ kind: 'machine', key: name, href: `/labs/teardown/${name}/` }),
  };
  let n = 0;
  return chapters.map(({ shelves, ...c }) => ({
    id: c.id, dom: c.dom, kind: c.kind, topic: c.topic ?? null, title: c.title,
    numeral: c.kind === 'hero' ? '' : roman(++n),
    shelves: shelves.map(({ keys, ...s }) => ({ ...s, rows: keys.map((k) => row[s.holds](k)) })),
  }));
}
