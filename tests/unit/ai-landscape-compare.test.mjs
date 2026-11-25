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

  test(`${date}: line-up signs: a part no company documents, documents only in part, or that is a preview or announced, is drawn otherwise than a settled part, and a part from outside the five takes the status of the claim its product uses it by (round 3, F3-1)`, async () => {
    // the sign is drawn on a canvas: in node, a context that writes down every call and setting is enough to compare
    globalThis.Path2D ??= class { addPath() {} };
    globalThis.DOMMatrix ??= class {};
    const { drawSign, signKey } = await import(`../../src/scripts/ai-landscape/${date}/scene/sign.js`);
    const record = () => {
      const log = [];
      const g = new Proxy({}, {
        get: (t, k) => (k === 'log' ? log : k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : (...a) => log.push(`${String(k)}(${a.map((x) => (typeof x === 'object' ? '' : x)).join(',')})`)),
        set: (t, k, v) => { log.push(`${String(k)}=${typeof v === 'object' ? 'gradient' : v}`); return true; },
      });
      return g;
    };
    const glass = { anthropic: '#D97757', openai: '#FFFFFF', google: '#4285F4', meta: '#0866FF', xai: '#0A0A0A', you: '#8C929C', outside: '#8C929C' };
    const ownerOf = (id) => ({ glass: glass[id] || '#8C929C' });
    const drawn = (parts) => { const g = record(); drawSign(g, 256, { glyph: 'model', state: 'solid', owner: 'xai', parts }, ownerOf); return g.log.join(';'); };
    const claims = new Map();
    (function index(n) { if (Array.isArray(n)) n.forEach(index); else if (n && typeof n === 'object') { if (n.id && n.text && n.status) claims.set(n.id, n); Object.values(n).forEach(index); } })(raw);
    let unsettled = 0;
    for (const id of ORDER) {
      const p = raw.providers[id];
      const surface = p.surfaces.find((s) => s.id === p.personalAgent.surfaceRef);
      view.client.p[id].stack.forEach((c, i) => c.p.forEach((part, k) => {
        const ref = (surface.stack[i].parts || [])[k].ref;
        const use = ref && ref.startsWith('ext-') && surface.poweredBy.find((m) => m.modelRef === ref);
        if (use) assert.equal(part[1], (claims.get(use.claim.claimRef) || use.claim).status, `${id} floor ${i + 1}: ${ref} carries the status of the claim its product uses it by`);
        if (part[1] === 'released' && (part[2] || 'yes') === 'yes') return;
        unsettled++;
        const settled = [part[0], 'released', 'yes'];
        assert.notEqual(drawn([part]), drawn([settled]), `${id} floor ${i + 1}: ${part.join(' ')} is drawn otherwise than a settled part`);
        assert.notEqual(signKey({ owner: id, glyph: 'model', state: 'solid', parts: [part] }), signKey({ owner: id, glyph: 'model', state: 'solid', parts: [settled] }), 'and its sign is drawn again when only that changes');
      }));
    }
    assert.ok(unsettled >= 5, `the line-up has parts that are not settled (${unsettled}): the two user-installed, the two named by Musk, the announced model`);
  });

  test(`${date}: a guest's core in a stack floor is as settled as its parts there: faint where no company documents them, hatched before release, and the tower builds it so (round 4, F4-1)`, async () => {
    const { createTower } = await import(`../../src/scripts/ai-landscape/${date}/scene/stack.js`);
    const built = [];
    const mat = (o = {}) => ({ transparent: false, depthWrite: true, uniforms: { uFade: { value: 1 }, uHatch: { value: o.hatch ? 1 : 0 } }, dispose() {} });
    const ctx = { mats: { glass: () => ({ uniforms: {}, dispose() {} }), core: (own, o) => { const m = mat(o); built.push(m); return m; }, setOwner() {} } };
    const look = (m) => (m.transparent && !m.depthWrite && m.uniforms.uFade.value < 0.5 ? 'faint' : m.uniforms.uHatch.value ? 'hatch' : 'solid');
    let faint = 0;
    for (const id of ORDER) {
      const p = view.client.p[id];
      for (const stack of [p.stack, ...p.doors.map((d) => d.stack).filter(Boolean)]) stack.forEach((c, i) => {
        const looks = c.k || c.g.map(() => 'solid');
        assert.equal(looks.length, c.g.length, `${id} floor ${i + 1}: one look per guest`);
        c.g.forEach((o, k) => {
          const mine = c.p.filter((q) => q[0] === o);
          const want = mine.length && mine.every((q) => q[2] === 'no') ? 'faint' : mine.length && !mine.some((q) => q[1] === 'released') && mine.some((q) => q[1] === 'preview' || q[1] === 'announced') ? 'hatch' : 'solid';
          if (mine.length) assert.equal(looks[k], want, `${id} floor ${i + 1}: guest ${o} is drawn ${want}`);
          if (looks[k] === 'faint') faint++;
        });
        built.length = 0;
        createTower(ctx, { id, owner: { glass: '#8C929C' }, cells: [...Array(i).fill({ s: 'solid', g: [] }), c], ownerOf: () => ({}) });
        assert.deepEqual(built.map(look), looks.slice(0, 3), `${id} floor ${i + 1}: the tower draws its guests ${looks.join(', ')}`);
      });
    }
    const xai = view.client.p.xai.stack[7];
    assert.deepEqual(xai.g.map((o, k) => `${o} ${(xai.k || [])[k] || 'solid'}`), ['you solid', 'anthropic faint', 'openai faint'], "xAI's Delegation floor: the user-installed Claude Code and Codex are faint, your other Bots solid");
    assert.ok(faint >= 2, `faint guests: ${faint}`);
  });

  test(`${date}: the agents board says a fact's staleAfter may have changed, never that the rule expired (round 4, F4-2)`, { skip: !html }, () => {
    const board = html.slice(html.indexOf('class="ail-ag__'), html.indexOf('</table>', html.indexOf('class="ail-ag__')));
    const marks = [...board.matchAll(/<span class="ail-until[^"]*" data-until="([^"]+)">(.*?)<\/span><\/span>|<span class="ail-until[^"]*" data-until="([^"]+)">(.*?<time[^>]*>[^<]*<\/time>)<\/span>/g)].map((m) => decode(m[2] || m[4] || ''));
    assert.ok(marks.length >= 1, 'the board marks at least one dated access line');
    for (const m of marks) {
      assert.ok(m.includes(COPY.world.freshUntil) && m.includes(COPY.world.staleSince), `the mark reads "${COPY.world.freshUntil}" before its date and "${COPY.world.staleSince}" after: ${m}`);
      assert.ok(!m.includes(`>${COPY.world.expired}<`) && !m.includes(`>${COPY.world.until}<`), `no "until" or "Expired" on the board: ${m}`);
    }
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
