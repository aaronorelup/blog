// The hub of the lore hidden pages: a post's <div data-hidden-pages="attached"> (or "not yet attached", or empty for
// every page) is filled at build time from src/data/hidden-pages.json, so a page added to the list shows up with no
// edit to the post. Each page gets a heading, its address (rel="nofollow", the one sanctioned link to it), its episode
// from the lore, where the episode shows it, what is on it and how it ties in. scripts/check/hidden.mjs keeps the list
// true. Runs after rehype-post-images (raw HTML parsed) and before rehype-heading-ids (the headings get their ids).
import fs from 'node:fs';

const read = (rel) => JSON.parse(fs.readFileSync(new URL(rel, import.meta.url), 'utf8'));

const text = (value) => ({ type: 'text', value });
const h = (tagName, properties, ...children) => ({
  type: 'element', tagName, properties: properties ?? {},
  children: children.flat().filter((c) => c != null && c !== false).map((c) => (typeof c === 'string' ? text(c) : c)),
});

// E2 -> { name: 'Episode 2', title: 'Earthlight', post: '/ledger/earthlight/' }, from the lore's episode headers.
function episodesOf(lore) {
  return new Map((lore.episodes ?? []).map((e) => [e.id, {
    name: `Episode ${e.id.replace(/^E/, '')}`,
    title: e.title,
    post: /\/ledger\/[\w-]+\//.exec(e.header?.blog ?? '')?.[0] ?? null,
  }]));
}

// One page of the list, as a heading and its paragraphs.
function entry(p, episodes) {
  const ep = episodes.get(p.episode) ?? { name: p.episode, title: p.episode, post: null };
  const epText = `${ep.title}, ${ep.name}`;
  const lead = (label, body) => h('p', null, h('strong', null, label), ' ', body);
  return [
    h('h3', null, p.title),
    h('p', null,
      h('a', { href: p.address, rel: ['nofollow'] }, `aaronorelup.com${p.address}`), h('br'),
      ep.post ? h('a', { href: ep.post }, epText) : epText,
      p.status === 'attached' ? ` · attached${p.id ? ` as ${p.id}` : ''}` : ' · not attached yet, so not canon',
      p.lore ? [' · ', h('a', { href: p.lore }, 'lore entry')] : null),
    p.status === 'attached' && p.attached
      ? lead('Where the episode shows it.', `${p.attached.how} At ${p.attached.at}${p.attached.frames ? `, frames ${p.attached.frames}` : ''}.`)
      : null,
    lead('On the page.', p.page),
    lead('In the story.', p.story),
  ];
}

export default function rehypeHiddenPages() {
  const { pages } = read('../../src/data/hidden-pages.json');
  const episodes = episodesOf(read('../../src/data/lore/lore.json'));
  return (tree) => {
    (function walk(node) {
      for (const el of node.children || []) {
        if (el.type !== 'element') continue;
        const which = el.properties?.dataHiddenPages;
        if (which === undefined) {
          walk(el);
          continue;
        }
        const pick = pages.filter((p) => !which || p.status === which);
        el.properties.className = ['hidden-pages'];
        el.children = pick.flatMap((p) => entry(p, episodes)).filter(Boolean);
      }
    })(tree);
  };
}
