// What /api/stats may show (worker/stats/shape.js): an unlisted post never surfaces by its slug, in a path, a probe,
// a bot's or program's name, a referring host or a read count, however the request spelled it; a bare address is
// nobody's site name; and what is shown can't carry markup. A made-up site, with one post nobody may see.
import assert from 'node:assert/strict';
import test from 'node:test';
import { assembleDay, makeSite, mentionsUnlisted, refHost, safeHost, safeLabel, safePath, scrubDay } from '../../worker/stats/shape.js';

const HIDDEN = 'secret-unlisted-post';
const site = makeSite(['# every public page', '/', '/ledger/', '/ledger/earthlight/', '/ledger/the-missing-map/',
  '/ledger/the-missing-map/notes/', '/projects/', '/about/', '/courses/the-hidden-curriculum/', 'not a path'].join('\n'));
const cards = makeSite(JSON.stringify({ posts: { earthlight: { id: 'AO-001', title: 'Earthlight' } } }));
const probe = (path, s = site) => safePath(path, s, { probe: true });

test('makeSite: the listed posts are the /ledger/<slug>/ lines of stats-pages.txt, or the keys of previews.json', () => {
  assert.deepEqual([...site.listed].sort(), ['earthlight', 'the-missing-map']);
  assert.deepEqual([...site.pages.keys()].sort(), ['/', '/about/', '/courses/the-hidden-curriculum/', '/ledger/', '/ledger/earthlight/',
    '/ledger/the-missing-map/', '/ledger/the-missing-map/notes/', '/projects/']);
  assert.deepEqual([...cards.listed], ['earthlight']);
  assert.equal(cards.pages, null);
  // Nothing to go on is an error, never a site where every path may be shown.
  assert.throws(() => makeSite('/\n/about/\n'), /names no posts/);
  assert.throws(() => makeSite(''), /names no posts/);
  assert.throws(() => makeSite('{"posts":{}}'), /lists no posts/);
});

test('a page that answered is shown only if it is a public page, by its own address', () => {
  for (const asked of ['/ledger/earthlight/', '/ledger/earthlight', '/LEDGER/Earthlight/', '/ledger//earthlight/', '/ledger/%65arthlight/']) {
    assert.equal(safePath(asked, site), '/ledger/earthlight/', asked);
  }
  assert.equal(safePath('/', site), '/');
  assert.equal(safePath('/ledger', site), '/ledger/');
  assert.equal(safePath('/ledger/the-missing-map/notes', site), '/ledger/the-missing-map/notes/');
  for (const asked of [`/ledger/${HIDDEN}/`, `/ledger/${HIDDEN}`, `/LEDGER/${HIDDEN.toUpperCase()}/`, `/ledger/${HIDDEN}/notes/`,
    `/ledger%2F${HIDDEN}/`, `/ledger/earthlight/../${HIDDEN}/`, '/ledger/earthlight/notes/', '/not-a-page/']) {
    assert.equal(safePath(asked, site), null, asked);
  }
});

test('a path that is not printable ASCII, not a path, too long or badly encoded is never shown', () => {
  for (const asked of [undefined, null, 7, '', 'ledger/earthlight/', '/ledger/earth light/', '/ledger/é/', '/ledger/earthlight/\n',
    '/' + 'a'.repeat(160), '/ledger/%zz', '/a%252525b', '/a%5Cb', '/a\\b']) {
    assert.equal(safePath(asked, site), null, String(asked));
    assert.equal(probe(asked), null, String(asked));
  }
});

test('with previews.json alone, a listed post is shown and nothing named like another', () => {
  assert.equal(safePath('/ledger/earthlight', cards), '/ledger/earthlight/');
  assert.equal(safePath('/ledger/earthlight/', ['earthlight']), '/ledger/earthlight/');
  assert.equal(safePath(`/ledger/${HIDDEN}/`, cards), null);
  assert.equal(safePath(`/somewhere/${HIDDEN}/`, cards), null);
  // /posts/ and /course/ are redirects, never a page anyone read.
  assert.equal(safePath('/posts/earthlight/', cards), null);
});

test('a probe is quoted as asked, unless it names a post or a page the site does not show', () => {
  for (const asked of ['/.git/config', '/wp-login.php', '/.env', '/ledger/earthlight/', '/ledger/earthlight.html', '/media/previews/earthlight.webp',
    '/media/earthlight/clip.mp4', '/courses/the-hidden-curriculum/x.php']) assert.equal(probe(asked), asked, asked);
  for (const asked of [`/ledger/${HIDDEN}/`, `/ledger/${HIDDEN}.html`, `/posts/${HIDDEN}`, `/ledger%2F${HIDDEN}`, `/ledger%252F${HIDDEN}`,
    `/media/${HIDDEN}/clip.mp4`, `/media/previews/${HIDDEN}.webp`, `/media/previews/${HIDDEN}-loop.mp4`, `/backup/${HIDDEN}.zip`,
    `/x?post=${HIDDEN}`, `/-${HIDDEN}-/`, '/courses/a-course-not-out/', '/courses/other/']) assert.equal(probe(asked), null, asked);
  for (const asked of [`/ledger/${HIDDEN}/`, `/posts/${HIDDEN}`, `/media/${HIDDEN}/clip.mp4`, `/backup/${HIDDEN}.zip`]) assert.equal(probe(asked, cards), null, asked);
});

test('an unlisted post with a one-word or two-word slug is no more shown than a long one', () => {
  // A slug of three words or more is also caught as a word the site does not use. A short one is caught only by
  // asking whether the post under /ledger/, /posts/ or /media/ is listed.
  for (const slug of ['hidden', 'two-words', 'x', 'earthlightx', 'the-missing']) {
    for (const asked of [`/ledger/${slug}/`, `/ledger/${slug}`, `/ledger/${slug}.html`, `/ledger/${slug}/notes/`, `/posts/${slug}/`, `/LEDGER/${slug.toUpperCase()}/`,
      `/ledger%2F${slug}`, `/media/${slug}/clip.mp4`, `/media/previews/${slug}.webp`]) {
      assert.equal(probe(asked), null, asked);
      assert.equal(probe(asked, cards), null, asked);
      assert.equal(safePath(asked, site), null, asked);
      assert.equal(safePath(asked, cards), null, asked);
    }
  }
  assert.equal(mentionsUnlisted(JSON.stringify({ probes: [['/ledger/hidden/', 1]] }), site), true);
  assert.deepEqual(scrubDay({ probes: [['/ledger/hidden/', 1], ['/media/hidden/clip.mp4', 1], ['/.env', 1]], reads: [['hidden', 4]] }, site).probes, [['/.env', 1]]);
});

test('a path is shown with every character that means something in HTML percent-encoded', () => {
  assert.equal(probe('/<script>alert(1)</script>'), '/%3Cscript%3Ealert(1)%3C/script%3E');
  assert.equal(probe('/a"b\'c&d<e>'), '/a%22b%27c%26d%3Ce%3E');
  assert.equal(probe('/a%22b%3Cc'), '/a%22b%3Cc');
});

test('a bot or program name is shown only if no word of it is shaped like a post the site does not list', () => {
  for (const name of ['GPTBot', 'GPTBot (unverified)', 'Go-http-client', 'SomeBot/1.0', 'A reader of the-missing-map', 'two-words']) {
    assert.equal(safeLabel(name, site, 'fallback'), name);
  }
  for (const name of [HIDDEN, `${HIDDEN}-bot`, `Fetcher (${HIDDEN.toUpperCase()})`, `x/${HIDDEN}/1.0`, `-${HIDDEN}-`]) {
    assert.equal(safeLabel(name, site, 'fallback'), 'fallback', name);
  }
});

test('safeHost: a plain host name, lower case and without www; a bare address is nobody’s site name', () => {
  assert.equal(safeHost('WWW.Example.COM.'), 'example.com');
  assert.equal(safeHost(' news.ycombinator.com '), 'news.ycombinator.com');
  assert.equal(safeHost(''), '');
  assert.equal(safeHost(null), '');
  for (const host of ['203.0.113.7', '127.0.0.1', '[2001:db8::1]', '2001:db8::1', 'localhost', 'exa mple.com', 'a_b.com', 'example.com/x',
    'user@example.com', '<b>.com', `${'a'.repeat(100)}.com`]) assert.equal(safeHost(host), null, host);
});

test('refHost: never this site, a private network, a preview host, an address or a host named like an unlisted post', () => {
  assert.equal(refHost('', site), '');
  assert.equal(refHost('news.ycombinator.com', site), 'news.ycombinator.com');
  assert.equal(refHost('www.t.co', site), 't.co');
  assert.equal(refHost('com.google.android.gm', site), 'com.google.android.gm');
  // A machine on someone's network is cut to the site it belongs to.
  assert.equal(refHost('jira.eng.corp.acme.com', site), 'acme.com');
  assert.equal(refHost('a.b.example.co.uk', site), 'example.co.uk');
  for (const host of ['aaronorelup.com', 'www.aaronorelup.com', 'preview.aaronorelup.com', 'my-dash.someone.workers.dev', 'branch.site.pages.dev',
    'wiki.corp', 'printer.local', 'box.internal', '203.0.113.7', `${HIDDEN}.example.org`, `${HIDDEN}.vercel.app`]) assert.equal(refHost(host, site), null, host);
});

const day = {
  d: '2026-11-10',
  bots: [['GPTBot', 'OpenAI', 'AI crawler', 5, 2], [`${HIDDEN}-bot`, `${HIDDEN} inc`, 'Other', 1, 1]],
  agents: [['curl', 4], [`fetch-${HIDDEN}`, 2], ['Unknown program', 1]],
  probes: [['/.git/config', 3], [`/ledger/${HIDDEN}/`, 1], [`/ledger%2F${HIDDEN}`, 1]],
  people: { total: 9, paths: [['/ledger/earthlight/', 5], [`/ledger/${HIDDEN}/`, 2]] },
  rum: { visits: 6, paths: [['/about/', 2], [`/ledger/${HIDDEN}/notes/`, 1]],
    referrers: [['', 4], ['news.ycombinator.com', 2], ['my-dash.someone.workers.dev', 1], ['203.0.113.7', 1], [`${HIDDEN}.example.org`, 1]] },
  reads: [['earthlight', 3], [HIDDEN, 1]],
};

test('scrubDay: a stored day loses every row that names a post no longer listed, and keeps the rest', () => {
  assert.deepEqual(scrubDay(day, site), {
    d: '2026-11-10',
    bots: [['GPTBot', 'OpenAI', 'AI crawler', 5, 2], ['Unnamed Other', 'Unknown', 'Other', 1, 1]],
    agents: [['curl', 4], ['Unknown program', 3]],
    probes: [['/.git/config', 3]],
    people: { total: 9, paths: [['/ledger/earthlight/', 5]] },
    rum: { visits: 6, paths: [['/about/', 2]], referrers: [['', 4], ['news.ycombinator.com', 2]] },
    reads: [['earthlight', 3]],
  });
  // A post unlisted after the day was stored: scrubbed against the site without it, its rows go too.
  const later = makeSite('/\n/ledger/the-missing-map/\n/about/\n');
  const scrubbed = scrubDay(scrubDay(day, site), later);
  assert.deepEqual(scrubbed.people.paths, []);
  assert.deepEqual(scrubbed.reads, []);
  assert.ok(!JSON.stringify(scrubbed).includes('earthlight'));
});

test('mentionsUnlisted: finds a post that is not listed in a stored day, however its path is spelled', () => {
  assert.equal(mentionsUnlisted(JSON.stringify(day), site), true);
  assert.equal(mentionsUnlisted(JSON.stringify(scrubDay(day, site)), site), false);
  const text = (paths, reads = []) => JSON.stringify({ people: { paths: paths.map((p) => [p, 1]) }, reads });
  assert.equal(mentionsUnlisted(text(['/', '/ledger/', '/ledger/earthlight/', '/media/previews/earthlight.webp', '/media/earthlight/clip.mp4'], [['earthlight', 2]]), site), false);
  for (const path of [`/ledger/${HIDDEN}/`, `/LEDGER/${HIDDEN.toUpperCase()}`, `/posts/${HIDDEN}`, `/ledger%2F${HIDDEN}`, `/media/${HIDDEN}/clip.mp4`,
    `/media/previews/${HIDDEN}.webp`]) assert.equal(mentionsUnlisted(text([path]), site), true, path);
  assert.equal(mentionsUnlisted(text([], [['earthlight', 2], [HIDDEN, 1]]), site), true);
});

test('assembleDay: a day is put together from listed posts only, whatever the steps fetched before a post was unlisted', () => {
  const hours = (at, n) => Object.assign(new Array(24).fill(0), { [at]: n });
  const core = {
    d: '2026-11-10', req: { person: 9 }, pages: { person: 4, stale: 0, agent: 0 }, bytes: { person: 100 }, bots: [], agents: [], stale: [],
    probes: [['/.git/config', 2], [`/ledger/${HIDDEN}/`, 1], ['/ledger/hidden/', 1]], probeStatus: {}, probeCountries: {}, botCountries: {},
    rum: { loads: 3, visits: 2, paths: [['/about/', 2], ['/ledger/hidden/', 1]] },
  };
  const windows = [
    { countries: { NZ: 2 }, devices: { desktop: 2 }, paths: { '/ledger/earthlight/': 2, '/ledger/hidden/': 1 }, hours: hours(3, 3) },
    { countries: { NZ: 1, US: 1 }, devices: { mobile: 2 }, paths: { '/ledger/earthlight/': 1, [`/ledger/${HIDDEN}/`]: 1 }, hours: hours(4, 2) },
  ];
  const reads = [{ slug: 'earthlight', n: 3 }, { slug: 'hidden', n: 9 }, { slug: HIDDEN, n: 2 }, { slug: 'the-missing-map', n: 5 }, { slug: 'the-missing-map-2', n: 1 }];
  const day = assembleDay(core, windows, reads, site);
  // The reads of a post that is not listed (any more) are left out, the rest most read first.
  assert.deepEqual(day.reads, [['the-missing-map', 5], ['earthlight', 3]]);
  assert.deepEqual(day.people.paths, [['/ledger/earthlight/', 3]]);
  assert.deepEqual(day.probes, [['/.git/config', 2]]);
  assert.deepEqual(day.rum, { loads: 3, visits: 2, paths: [['/about/', 2]] });
  assert.deepEqual(day.people.countries, { NZ: 3, US: 1 });
  assert.deepEqual(day.people.hours, hours(3, 3).map((n, h) => n + hours(4, 2)[h]));
  assert.equal(mentionsUnlisted(JSON.stringify(day), site), false);
  assert.ok(!JSON.stringify(day).includes('hidden') && !JSON.stringify(day).includes(HIDDEN));
  // A count of nothing is no row, and no reads at all is an empty list.
  assert.deepEqual(assembleDay(core, [], [{ slug: 'earthlight', n: 0 }], site).reads, []);
  assert.deepEqual(assembleDay(core, [], null, site).reads, []);
});
