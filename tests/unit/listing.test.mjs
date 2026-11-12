// What a reader may be shown: a draft or an unlisted post is in no list, feed, card or recording (lib/posts.js's
// isListed is the one gate), lists follow ledger order, and the card shape carries only what the post wrote. Made-up
// posts throughout, so no real post can break this.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { byMonth, countBy, isListed, ledgerOrder, olderNewer, related } from '../../src/lib/posts.js';
import { cardOf } from '../../src/lib/cards.js';
import { ranked, recordable } from '../../src/lib/read/posts.js';
import { START_HERE } from '../../src/data/picks.js';
import { listedSlugs, previewsProblems, rssProblems, statsPagesProblems } from '../../scripts/build/contracts.mjs';

const post = (slug, id, day, more = {}) => ({ id: slug, data: { id, title: slug, date: new Date(`${day}T00:00:00Z`), topic: 'agents', project: [], ...more } });
const slugs = (posts) => posts.map((p) => p?.id);

test('isListed: only a post that is neither a draft nor unlisted', () => {
  assert.equal(isListed({}), true);
  assert.equal(isListed({ draft: false, unlisted: false }), true);
  assert.equal(isListed({ draft: true }), false);
  assert.equal(isListed({ unlisted: true }), false);
  assert.equal(isListed({ draft: true, unlisted: true }), false);
});

test('ledger order: newest date first, then the highest id, counted as a number', () => {
  const posts = [post('a', 'AO-009', '2026-10-01'), post('b', 'AO-100', '2026-10-01'), post('c', 'AO-099', '2026-10-01'),
    post('d', 'AO-001', '2026-11-02'), post('e', 'AO-050', '2026-09-30')];
  const before = slugs(posts);
  assert.deepEqual(slugs(ledgerOrder(posts)), ['d', 'b', 'c', 'a', 'e']);
  assert.deepEqual(slugs(posts), before, 'the list it was given is left as it was');
});

test('byMonth: months newest first, each in ledger order, split on the UTC month', () => {
  const months = byMonth([post('a', 'AO-001', '2026-09-30'), post('b', 'AO-002', '2026-10-01'), post('c', 'AO-003', '2026-10-31')]);
  assert.deepEqual(months.map((m) => [m.month, slugs(m.posts)]), [['October 2026', ['c', 'b']], ['September 2026', ['a']]]);
  assert.deepEqual(byMonth([]), []);
});

test('countBy: one count a topic, and one for each project of a post', () => {
  const posts = [post('a', 'AO-001', '2026-10-01', { project: ['x', 'y'] }), post('b', 'AO-002', '2026-10-02', { topic: 'tools', project: ['x'] })];
  assert.deepEqual(countBy(posts, 'topic'), { agents: 1, tools: 1 });
  assert.deepEqual(countBy(posts, 'project'), { x: 2, y: 1 });
});

test('olderNewer: the neighbours in ledger order, for a post that is or is not in the list', () => {
  const [a, b, c] = [post('a', 'AO-001', '2026-10-01'), post('b', 'AO-002', '2026-10-02'), post('c', 'AO-003', '2026-10-03')];
  assert.deepEqual(slugs(Object.values(olderNewer(b, [a, b, c]))), ['c', 'a']);
  assert.deepEqual(olderNewer(c, [a, b, c]), { newer: undefined, older: b });
  assert.deepEqual(olderNewer(a, [a, b, c]), { newer: b, older: undefined });
  // An unlisted post is not among the listed ones, and still gets its place between them.
  const hidden = post('h', 'AO-009', '2026-10-02', { unlisted: true });
  assert.deepEqual(olderNewer(hidden, [a, b, c]), { newer: c, older: b });
});

test('related: never the post itself, only from the posts passed in, a shared project before a shared topic', () => {
  const me = post('me', 'AO-010', '2026-10-10', { project: ['x'] });
  const sameProject = post('p', 'AO-001', '2026-01-01', { topic: 'tools', project: ['x'] });
  const sameTopic = post('t', 'AO-011', '2026-10-11');
  const near = post('n', 'AO-012', '2026-10-12', { topic: 'tools' });
  const far = post('f', 'AO-002', '2026-02-01', { topic: 'tools' });
  assert.deepEqual(slugs(related(me, [far, near, sameTopic, me, sameProject])), ['p', 't', 'n']);
  assert.deepEqual(slugs(related(me, [far, near, sameTopic, sameProject], 4)), ['p', 't', 'n', 'f']);
  assert.deepEqual(related(me, [me]), []);
});

test('cardOf: only an id and a title without a preview, and no empty field with one', () => {
  assert.deepEqual(cardOf({ data: { id: 'AO-001', title: 'A', summary: 'never in a card' } }), { id: 'AO-001', title: 'A' });
  const bare = { takeaway: 'It ran.', points: [] };
  assert.deepEqual(cardOf({ data: { id: 'AO-001', title: 'A', preview: bare } }), { id: 'AO-001', title: 'A', takeaway: 'It ran.' });
  const full = { verdict: 'It works', takeaway: 'It ran.', points: ['One.'], image: '/media/previews/a.webp', loop: '/media/previews/a.mp4' };
  assert.deepEqual(cardOf({ data: { id: 'AO-001', title: 'A', preview: full } }),
    { id: 'AO-001', title: 'A', verdict: 'It works', takeaway: 'It ran.', points: ['One.'], image: '/media/previews/a.webp', alt: '', loop: '/media/previews/a.mp4' });
  // alt is the picture's: without a picture there is none.
  assert.deepEqual(cardOf({ data: { id: 'AO-001', title: 'A', preview: { ...bare, alt: 'A lamp' } } }), { id: 'AO-001', title: 'A', takeaway: 'It ran.' });
});

test('read-aloud records listed posts only, never a live notebook, Start here first', () => {
  const listed = post('listed', 'AO-001', '2026-10-01');
  assert.equal(recordable(listed), true);
  assert.equal(recordable(post('d', 'AO-002', '2026-10-02', { draft: true })), false);
  assert.equal(recordable(post('u', 'AO-003', '2026-10-03', { unlisted: true })), false);
  assert.equal(recordable(post('teardown-lab', 'AO-073', '2026-10-04')), false);
  const newer = post('newer', 'AO-004', '2026-10-05');
  const all = [listed, newer, post('u', 'AO-003', '2026-10-06', { unlisted: true }), post('teardown-lab', 'AO-073', '2026-10-07')];
  assert.deepEqual(slugs(ranked(all)), ['newer', 'listed']);
  if (START_HERE.length > 1) {
    const picks = [post(START_HERE[1], 'AO-005', '2026-01-01'), post(START_HERE[0], 'AO-006', '2026-01-02')];
    assert.deepEqual(slugs(ranked([...all, ...picks])), [START_HERE[0], START_HERE[1], 'newer', 'listed']);
  }
});

test('listedSlugs reads the posts folder and leaves out every draft and unlisted post', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'listed-'));
  t.after(() => fs.rmSync(dir, { recursive: true }));
  const put = (name, extra = '') => fs.writeFileSync(path.join(dir, name), `---\nid: "AO-500"\ntitle: "T"${extra}\n---\n\nText.\n`);
  put('shown.md');
  put('also-shown.md', '\ndraft: false\nunlisted: false');
  put('a-draft.md', '\ndraft: true');
  put('hidden.md', '\nunlisted: true');
  put('both.md', '\ndraft: true\nunlisted: true');
  fs.writeFileSync(path.join(dir, 'notes.txt'), 'not a post');
  assert.deepEqual([...listedSlugs(dir)].sort(), ['also-shown', 'shown']);
});

test('a draft or unlisted post in the cards, the feed or the stats page list is a contract problem', () => {
  const listed = new Set(['shown']);
  const card = { id: 'AO-001', title: 'A' };
  const guid = (s) => `<guid isPermaLink="true">https://aaronorelup.com/ledger/${s}/</guid>`;
  assert.deepEqual(previewsProblems({ posts: { shown: card, hidden: card } }, listed), ['previews.json: hidden should not be there']);
  assert.deepEqual(rssProblems(guid('shown') + guid('hidden'), listed), ['rss.xml: hidden should not be there']);
  assert.deepEqual(statsPagesProblems('/ledger/shown/\n/ledger/hidden/', listed), ['stats-pages.txt: /ledger/hidden/ is not a listed post']);
  assert.deepEqual(statsPagesProblems('/ledger/hidden/notes/', listed), ['stats-pages.txt: /ledger/hidden/notes/ is not a listed post']);
});
