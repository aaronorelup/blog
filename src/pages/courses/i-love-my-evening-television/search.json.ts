// /courses/i-love-my-evening-television/search.json: the course page's search index, fetched the first time
// someone types in its box. Every page (url, title, other names, kind) and every line (plain text, tier, the
// index of the page it is shown on, its line number: the link is that page's url + #L<line>), so a lookup needs
// no service.
import { EPISODES, CHARACTERS, THINGS, LORE, KIND_LABEL, plain, allBullets, urlOf, DOC_TITLES, BASE } from '../../../lib/lore.js';

export function GET() {
  const e: [string, string, string, string][] = [];
  const b: [string, string, number, number][] = [];
  const add = (url: string, title: string, aka: string, kind: string) => e.push([url, title, aka, kind]) - 1;
  for (const ep of EPISODES) {
    const i = add(urlOf(ep.id)!, `${ep.id} ${ep.title}`, plain(ep.header.logline || ''), 'Episode');
    for (const x of allBullets(ep)) b.push([plain(x.text), x.tier, i, x.line]);
  }
  for (const [list, kind] of [[CHARACTERS, 'character'], [THINGS, 'thing']] as const) {
    for (const c of list) {
      const i = add(urlOf(c.id)!, c.title, plain(c.header.aka || ''), KIND_LABEL[c.kind] || kind);
      for (const x of allBullets(c)) b.push([plain(x.text), x.tier, i, x.line]);
    }
  }
  for (const w of LORE.world || []) {
    const i = add(`${BASE}/world/`, 'The world', '', 'Page');
    for (const x of allBullets(w)) b.push([plain(x.text), x.tier, i, x.line]);
  }
  for (const t of LORE.timeline_docs || []) {
    const i = add(`${BASE}/timeline/`, 'Timeline', '', 'Page');
    for (const x of allBullets(t)) b.push([plain(x.text), x.tier, i, x.line]);
  }
  for (const key of ['eggs', 'threads', 'questions'] as const) {
    const i = add(`${BASE}/${key}/`, DOC_TITLES[key], '', 'Page');
    for (const s of LORE[key] || []) for (const x of s.bullets) b.push([plain(x.text), x.tier, i, x.line]);
  }
  return new Response(JSON.stringify({ e, b }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
