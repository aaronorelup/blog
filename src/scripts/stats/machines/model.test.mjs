// node --test src/scripts/stats/machines/
// The machines chapter's pure parts. Nothing imports this file, so it never reaches the bundle.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appositive, ownersFor, topOwner, programRows, staleRows, doorWall, middleTruncate, answerModel,
  purposeTotals, ownerSlug, kindsByPages, comparedTo, statusSplit, topPlaces, purposeTotalsFor, isSitePath,
} from './model.js';

const bot = (name, owner, category, purpose, files, pages, show = true) => ({ name, owner, category, purpose, files, pages, daysSeen: 3, show });

test('appositive turns a blurb into a few words that fit after a name', () => {
  assert.equal(appositive('The crawler for Exa, an AI search engine that other AI tools call.'), 'the crawler for Exa');
  assert.equal(appositive("Google's search crawler: reads pages so they can show up in Google."), "Google's search crawler");
  assert.equal(appositive('Fetches a page right then, because someone asked ChatGPT something.'), 'which fetches a page right then');
  assert.equal(appositive('A command-line tool for fetching one page; Aaron’s agents use it.'), 'a command-line tool for fetching one page');
  assert.equal(appositive('Sent a name nobody recognises.'), 'which sent a name nobody recognises');
  assert.equal(appositive(''), '');
  assert.equal(appositive(undefined), '');
});

test('ownersFor groups by company, folds hidden bots, keeps Unknown last', () => {
  const bots = [
    bot('ExaSearchBot', 'Exa', 'Search Engine Crawler', 'search', 900, 670),
    bot('ExaUser', 'Exa', 'Search Engine Crawler', 'search', 90, 67),
    bot('ChatGPT-User', 'OpenAI', 'AI Assistant', 'ai', 500, 357),
    bot('GPTBot', 'OpenAI', 'AI Crawler', 'ai', 100, 78),
    bot('Unnamed AI Assistant', 'Unknown', 'AI Assistant', 'ai', 900, 800),
    bot('MadeUpBot', 'Unknown', 'AI Crawler', 'ai', 4, 2, false),
    bot('Other bots', 'Unknown', 'Other', 'other', 20, 16),
  ];
  const all = ownersFor(bots, 'all');
  assert.deepEqual(all.owners.map((o) => o.owner), ['Exa', 'OpenAI', 'Unknown']);
  assert.equal(all.owners[0].pages, 737);
  assert.equal(all.owners[0].slug, 'exa');
  assert.deepEqual(all.hidden, { pages: 18, files: 24, n: 2 });
  assert.equal(topOwner(all.owners).owner, 'Exa');
  const ai = ownersFor(bots, 'ai');
  assert.deepEqual(ai.owners.map((o) => o.owner), ['OpenAI', 'Unknown']);
  assert.equal(ai.hidden.pages, 2);
  // the filter's rows plus its hidden part add up to the purpose's total
  const t = purposeTotals(bots);
  assert.equal(ai.owners.reduce((s, o) => s + o.pages, 0) + ai.hidden.pages, t.ai.pages);
  assert.equal(t.all.pages, 670 + 67 + 357 + 78 + 800 + 2 + 16);
});

test('ownerSlug matches the route grammar', () => {
  assert.equal(ownerSlug('Common Crawl'), 'common-crawl');
  assert.equal(ownerSlug('OpenAI'), 'openai');
});

test('programRows folds names under the display threshold into Other programs', () => {
  const rows = programRows([
    { label: 'curl', n: 2530, show: true },
    { label: 'Claude desktop app', n: 2731, show: true },
    { label: 'NoMoreVibe', n: 3, show: false },
    { label: 'Other programs', n: 10, show: true },
  ]);
  assert.deepEqual(rows.map((r) => r.label), ['Claude desktop app', 'curl', 'Other programs']);
  assert.equal(rows[2].n, 13);
  assert.equal(rows[2].folded, true);
});

test('staleRows keeps Other old browsers last', () => {
  const rows = staleRows([{ label: 'Other old browsers', n: 900 }, { label: 'Chrome 124', n: 502 }, { label: 'Safari on iOS 13', n: 803 }]);
  assert.deepEqual(rows.map((r) => r.label), ['Safari on iOS 13', 'Chrome 124', 'Other old browsers']);
});

test('doorWall groups by family, orders families by knocks, rounds the remainder', () => {
  const fam = (p) => (/wp-/.test(p) ? { key: 'wordpress', name: 'WordPress' } : /favicon/.test(p) ? { key: 'habit', name: 'Browser habits' } : { key: 'secrets', name: 'Password and settings files' });
  const probes = { rows: [
    { path: '/wp-admin/install.php', n: 441 }, { path: '/favicon.ico', n: 415 }, { path: '/.env', n: 346 },
    { path: '/.git/config', n: 0 }, { path: '/.aws/credentials', n: 233 }, { path: '/wp-login.php', n: 28 },
  ] };
  const w = doorWall(probes, 1600, fam, 24);
  assert.deepEqual(w.groups.map((g) => g.fam.key), ['secrets', 'wordpress', 'habit']);
  assert.equal(w.top, 441);
  assert.equal(w.shown, 441 + 415 + 346 + 233 + 28);
  assert.equal(w.remainder, 140); // 1600 − 1463 = 137 → 140
  const w2 = doorWall(probes, 1600, fam, 2);
  assert.equal(w2.count, 2);
  // the closing line leaves out what the family headings already hold (wp-login.php's 28)
  assert.equal(w2.remainder, 740); // 1600 − 856 drawn
  assert.equal(w2.beyond, 720);    // 1600 − (469 + 415) in the two families drawn
  assert.equal(w.beyond, 140);
  assert.equal(doorWall({ rows: [] }, 0, fam).remainder, 0);
});

test('middleTruncate keeps both ends', () => {
  const s = middleTruncate('/wp-content/plugins/html404/xccc.php', 30);
  assert.equal(s.length, 30);
  assert.ok(s.startsWith('/wp-content'));
  assert.ok(s.endsWith('xccc.php'));
  assert.equal(middleTruncate('/.env'), '/.env');
});

test('answerModel names the largest kind and its busiest member', () => {
  const words = { botBlurb: (n) => (n === 'ExaSearchBot' ? 'The crawler for Exa, an AI search engine.' : ''), programBlurb: () => 'A command-line tool.' };
  const view = {
    pages: { bot: 3996, scanner: 326, agent: 1914, stale: 3370, person: 1767 },
    bots: [bot('ExaSearchBot', 'Exa', 'Search Engine Crawler', 'search', 900, 670), bot('Other bots', 'Unknown', 'Other', 'other', 9999, 9999)],
    agents: [], stale: [], probes: { rows: [] },
  };
  const a = answerModel(view, { words, ageOf: () => null, famOf: () => null });
  assert.equal(a.kind, 'bot');
  assert.equal(a.tab, 'bots');
  assert.equal(a.n, 3996);
  assert.deepEqual(a.member, { name: 'ExaSearchBot', say: 'the crawler for Exa', n: 670, unit: 'pages' });
  assert.ok(a.share < 0.5);

  const stale = answerModel({ ...view, pages: { bot: 1, scanner: 0, agent: 0, stale: 9 }, stale: [{ label: 'Safari on iOS 13', n: 8 }] },
    { words, ageOf: () => ({ year: 2019 }), famOf: () => null });
  assert.deepEqual(stale.member, { name: 'Safari on iOS 13', say: 'a browser from about 2019', n: 8, unit: 'pages' });

  const agent = answerModel({ ...view, pages: { bot: 1, scanner: 0, agent: 9, stale: 0 }, agents: [{ label: 'Claude desktop app', n: 300, show: true }] },
    { words, ageOf: () => null, famOf: () => null });
  assert.equal(agent.member.name, 'the Claude desktop app');
  assert.equal(agent.member.unit, 'files');
  assert.equal(agent.member.of, 0);          // no files total in the view: nothing to measure against

  // a member counted in files or knocks carries its kind's total in that same unit
  const agentFiles = answerModel({ ...view, pages: { bot: 1, scanner: 0, agent: 9, stale: 0 }, files: { agent: 812 }, agents: [{ label: 'Claude desktop app', n: 199, show: true }] },
    { words, ageOf: () => null, famOf: () => null });
  assert.equal(agentFiles.member.of, 812);
  const doors = answerModel({ ...view, pages: { bot: 1, scanner: 47, agent: 0, stale: 0 }, files: { scanner: 4159 }, probes: { rows: [{ path: '/.aws/credentials', n: 144 }] } },
    { words, ageOf: () => null, famOf: () => ({ key: 'secrets' }) });
  assert.deepEqual([doors.member.unit, doors.member.n, doors.member.of], ['knocks', 144, 4159]);

  assert.equal(answerModel({ pages: { bot: 0, scanner: 0, agent: 0, stale: 0, person: 4 } }, { words }), null);
});

test('kindsByPages keeps station order on ties', () => {
  assert.deepEqual(kindsByPages({ bot: 1, scanner: 1, agent: 1, stale: 1 }).map((k) => k.kind), ['bot', 'scanner', 'agent', 'stale']);
});

test('comparedTo phrases the AI vs search ratio', () => {
  const times = (r) => (r >= 1.75 && r < 1.9 ? 'nearly twice' : r.toFixed(1) + ' times');
  assert.equal(comparedTo(2234 / 1225, times), 'nearly twice what');
  assert.equal(comparedTo(1.02, times), 'about the same as');
  assert.equal(comparedTo(0.2, times), 'less than half what');
  assert.equal(comparedTo(0.7, times), '70% of what');
  assert.equal(comparedTo(Infinity, times), null);
});

test('statusSplit and topPlaces', () => {
  assert.deepEqual(statusSplit([{ code: '404', n: 10 }, { code: 403, n: 2 }, { code: '499', n: 1 }]), { n404: 10, n403: 2, other: 1 });
  assert.deepEqual(topPlaces([{ code: 'XX', n: 99 }, { code: 'US', n: 5 }, { code: 'T1', n: 4 }, { code: 'DE', n: 3 }]).map((r) => r.code), ['US', 'DE']);
});

test('purposeTotalsFor puts the unnamed bots under Other, so the pills add up to pages.bot', () => {
  const bots = [bot('GPTBot', 'OpenAI', 'AI Crawler', 'ai', 10, 60), bot('Googlebot', 'Google', 'Search Engine Crawler', 'search', 5, 30), bot('UptimeRobot', 'UptimeRobot', 'Monitoring & Analytics', 'other', 1, 2, false)];
  const t = purposeTotalsFor(bots, 100);
  assert.equal(t.all.pages, 100);
  assert.equal(t.other.pages, 10);
  assert.equal(t.unlisted, 8);
  assert.equal(t.ai.pages + t.search.pages + t.seo.pages + t.preview.pages + t.other.pages, t.all.pages);
  assert.equal(purposeTotalsFor(bots, 50).all.pages, 92); // never below what the bots hold
});

test('staleRows with a total ends in the gap the labels leave', () => {
  const rows = staleRows([{ label: 'Chrome 124', n: 50 }, { label: 'Safari on iOS 13', n: 80 }], 142);
  assert.deepEqual(rows.map((r) => [r.label, r.n]), [['Safari on iOS 13', 80], ['Chrome 124', 50], ['Other old browsers', 12]]);
  assert.equal(staleRows([{ label: 'Chrome 124', n: 50 }], 50).length, 1);
});

test('isSitePath knows the files and pages this site really has', () => {
  const build = { labels: { '/about/': 'About' }, bySlug: new Map([['hello', {}]]) };
  assert.equal(isSitePath('/sitemap.xml', build), true);
  assert.equal(isSitePath('/about', build), true);
  assert.equal(isSitePath('/ledger/hello/', build), true);
  assert.equal(isSitePath('/ledger/nope/', build), false);
  assert.equal(isSitePath('/.env', build), false);
  assert.equal(isSitePath('/favicon.ico', build), true);   // served since 17 Oct 2026
  assert.equal(isSitePath('/apple-touch-icon.png', build), false);
});
