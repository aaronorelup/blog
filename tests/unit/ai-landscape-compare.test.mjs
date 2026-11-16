// The four row sections of /ai-landscape (line-up, agents, links, best at) against the frozen data of every snapshot in
// the registry: every one of the 45 cells draws its gap as the right state, the five keep the owner's order, every link
// across an owner's line is drawn once, and best at never shows more certainty than its cell holds. With a dist/, the
// built HTML of each dated page agrees.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { SNAPSHOTS } from '../../src/data/ai-landscape.js';

const decode = (s) => s.replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"');

for (const { date } of SNAPSHOTS) {
  const raw = JSON.parse(fs.readFileSync(`src/data/ai-landscape/${date}.json`, 'utf8'));
  const dir = `../../src/components/ai-landscape/${date}/data`;
  const { COPY } = await import(`${dir}/copy.js`);
  const { agents, best, HEIGHT, links, MAX_WORDS } = await import(`${dir}/compare.js`);
  const { ORDER, view } = await import(`${dir}/view.js`);
  const DIST = `dist/ai-landscape/${date}/index.html`;
  const html = fs.existsSync(DIST) ? fs.readFileSync(DIST, 'utf8') : null;
  const WANT = { undisclosed: ['frost', COPY.state.undisclosed], 'not-found': ['dotted', COPY.state.notFound], absent: ['hollow', COPY.state.absent], 'not-applicable': ['hollow', COPY.state.absent] };

  test(`${date}: line-up: each of the 45 cells draws its gap as Not said, Not found or Doesn\'t have it`, () => {
    let cells = 0, empty = 0;
    for (const id of ORDER) {
      const p = raw.providers[id];
      const stack = p.surfaces.find((s) => s.id === p.personalAgent.surfaceRef).stack;
      const v = view.provider(id);
      assert.equal(stack.length, 9, `${id} has nine layers`);
      stack.forEach((layer, i) => {
        cells++;
        const c = v.stack[i];
        assert.equal(view.client.p[id].stack[i].s, c.state, `${id} floor ${i + 1}: the 3D state is the table's`);
        if (layer.name) return;
        empty++;
        const [state, word] = WANT[layer.gap] || WANT.absent;
        assert.equal(c.state, state, `${id} floor ${i + 1} (${layer.gap})`);
        assert.equal(c.word, word, `${id} floor ${i + 1} (${layer.gap})`);
        assert.ok(c.reason, `${id} floor ${i + 1} carries its reason`);
      });
    }
    assert.equal(cells, 45);
    assert.ok(empty > 0);
  });

  test(`${date}: line-up in the built page: the table cells carry the same states and words`, { skip: !html && 'no dist/' }, () => {
    const tds = [...html.matchAll(/<td class="ail-lu__cell" data-p="([a-z]+)" data-state="([a-z]+)"[^>]*>[\s\S]*?<span class="ail-lu__ans"[^>]*>([^<]*)</g)];
    assert.equal(tds.length, 45);
    tds.forEach(([, id, state, ans], n) => {
      const c = view.provider(id).stack[Math.floor(n / 5)];
      assert.equal(id, ORDER[n % 5], 'columns in the owner\'s order');
      assert.equal(state, c.state);
      assert.equal(decode(ans), c.name || c.word);
    });
  });

  test(`${date}: the order Anthropic, OpenAI, Google, Meta, xAI holds in the data, the table, the minimap and the worlds`, () => {
    assert.deepEqual(view.client.order, ORDER);
    assert.deepEqual(view.providers.map((p) => p.id), ORDER);
    assert.deepEqual(agents.map((a) => a.id), ORDER);
    if (!html) return;
    const ids = (re) => [...html.matchAll(re)].map((m) => m[1]);
    assert.deepEqual(ids(/<th scope="col" class="ail-lu__co[^"]*" data-p="([a-z]+)"/g), ORDER);
    assert.deepEqual(ids(/<a class="ail-map__col" href="#[a-z]+" data-p="([a-z]+)"/g), ORDER);
    assert.deepEqual(ids(/<section id="([a-z]+)" class="ail-sec ail-world"/g), ORDER);
    assert.deepEqual(ids(/<tr class="ail-ag__row" data-p="([a-z]+)"/g), ORDER);
  });

  test(`${date}: agents: the always-on lamp reads personalAgent.alwaysOn, and xAI\'s is partial`, () => {
    for (const a of agents) assert.equal(a.lamps.alwaysOn, raw.providers[a.id].personalAgent.alwaysOn.value || 'unknown');
    assert.equal(agents.find((a) => a.id === 'xai').lamps.alwaysOn, 'partial');
    assert.ok(agents.some((a) => a.you.length), 'some part needs your own machine');
  });

  test(`${date}: links: exactly one arc for each entry whose two ends have different owners`, () => {
    const own = (ref) => ORDER.find((p) => ref.startsWith(`${p}-`)) || (ref === 'ext-your-computer' ? 'you' : 'outside');
    let n = 0;
    for (const id of ORDER) {
      const p = raw.providers[id];
      for (const s of p.surfaces) n += s.poweredBy.filter((m) => own(m.modelRef) !== id).length;
      n += p.personalAgent.delegatesTo.filter((d) => d.toOwner !== id).length;
      n += (p.interop || []).filter((x) => own(x.fromRef) !== own(x.toRef)).length;
    }
    assert.equal(links.length, n);
    for (const l of links) assert.notEqual(l.from.owner, l.to.owner);
    if (!html) return;
    const items = [...html.matchAll(/<li class="ail-ln__item"[^>]*data-official="([a-z]+)"[\s\S]*?<\/li>/g)];
    assert.equal(items.length, n);
    for (const [li, official] of items) assert.equal(li.includes(`>${COPY.links.unofficial}<`), official === 'no', 'an unofficial link says so');
    const announced = links.filter((l) => l.fact.status === 'announced').length;
    assert.equal(items.filter(([li]) => li.includes(`data-status="announced">${COPY.state.announced}<`)).length, announced, 'a link that was only announced says so');
  });

  test(`${date}: a catch plate says what happens to its product, never the day the page's own claim goes stale (round 2, V-1)`, () => {
    for (const p of view.providers) {
      const said = `${p.tension.fact.text} ${p.tension.line}`;
      for (const it of p.catch) {
        assert.equal('until' in it, false, `${p.id}: the plate of ${it.text} carries no expiry day`);
        if (it.kind === 'closing') assert.ok(it.note && it.fact && said.includes(it.text), `${p.id}: ${it.text} is closing in the catch's own claim, and its plate says how`);
        assert.ok(it.fact == null || !it.fact.staleAfter || it.kind === 'closing', `${p.id}: ${it.text} is on the board only for its claim's expiry date`);
      }
    }
    if (html) assert.ok(!/class="ail-catch__item"[^>]*data-until/.test(html) && !html.includes('ail-catch__until'), 'no plate in the page prints "until" or "Expired"');
  });

  test(`${date}: best at: never more certain than the cell holds`, () => {
    const caps = raw.bestAt.capabilities;
    assert.equal(best.caps.length, 22);
    for (const c of caps) {
      const b = best.caps.find((x) => x.id === c.id);
      const inside = b.places.filter((x) => x.provider !== 'outside');
      assert.equal(b.asOf, c.asOf, `${c.id} shows its date`);
      if (c.verdict === 'contested') assert.ok(b.places.every((x) => x.h === HEIGHT.contested && x.step === 'hatch' && x.place === 0), `${c.id}: nobody above anybody`);
      if (c.verdict === 'tie') assert.ok(b.places.every((x) => x.h === HEIGHT.tie && x.step === 'hatch'), `${c.id}: one low shared step`);
      if (c.verdict === 'unknown') assert.equal(b.places.length, 0, `${c.id}: nobody rises`);
      if (c.verdict === 'clear') {
        assert.equal(b.places[0].label, c.leader.label, `${c.id}: the label names the product that leads`);
        assert.equal(b.places[0].provider, c.leader.provider);
        if (b.places[1]) assert.ok(b.places[1].h < b.places[0].h);
      }
      for (const x of inside) assert.ok(c.leader?.label === x.label || c.runnerUp?.label === x.label || c.contenders.some((k) => k.label === x.label));
      for (const e of b.empty) assert.ok(e.reason && e.word && !b.places.some((x) => x.provider === e.id), `${c.id}: ${e.id} shows its empty state and reason, never a rank`);
      // an absence mark never falls on a company whose agent the capability's own evidence scores (round 2, F2-1)
      for (const e of b.empty) assert.ok(!c.evidence.some((row) => `${row.subject} ${row.note || ''}`.includes(view.provider(e.id).agent.name)), `${c.id}: ${e.id} is marked empty, yet its evidence names ${view.provider(e.id).agent.name}`);
      if (c.verdict === 'unknown') assert.equal(b.empty.length, 0, `${c.id}: where nobody knows, nobody is singled out`);
      assert.equal(b.reason.status, '', `${c.id}: a ranking's card prints no product status`);
      assert.ok(b.words <= MAX_WORDS, `${c.id}: ${b.words} words at first depth`);
    }
    assert.ok(best.caps.some((b) => b.places.some((x) => x.provider === 'outside')), 'a leader outside the five takes the plinth');
    assert.deepEqual(best.tour.slice(0, 4).map((k) => best.caps[k].id), raw.bestAt.ownerGuesses.map((g) => g.capabilityRef));
    if (html) assert.equal((html.match(/class="ail-ba__cap"/g) || []).length, 22);
  });
}
