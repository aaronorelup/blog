// Bindings for the four row sections (SPEC 2.3, 2.6, 2.7, 2.8): the personal agents, the links that cross an
// owner's line, and best at. Built at build time from the view model, like view.js, and read by the sections
// and the unit test. Every word is data or COPY. The only page configuration is where each kind of link lands.
import { COPY } from './copy.js';
import { words } from './limits.js';
import { fact, ORDER, ownerOf, stateOf, tagOf, thing, view } from './view.js';

const D = view.data;
const fail = (msg) => { throw new Error(`ai-landscape compare: ${msg}`); };
const price = (usd) => `$${Number.isInteger(usd) ? usd : usd.toFixed(2)}`;
// Words a visitor sees at first depth in every state of these sections, counted as the e2e helper counts them.
// The chrome (title, stamp chip, sources chip) is always on screen too.
export const CHROME_WORDS = words(`${COPY.frame.title} ${COPY.frame.snapshot} ${view.snapshot.date} ${COPY.stamp.sources} ${view.counts.sources}`);
export const MAX_WORDS = 60;

// ---- 2.6 personal agents: the cheapest plan that includes the agent, how many computers, the lamps
export const agents = ORDER.map((id) => {
  const p = D.providers[id];
  const v = view.provider(id);
  const plan = p.plans.consumer.filter((x) => x.includesAgent && typeof x.usdPerMonth === 'number').sort((a, b) => a.usdPerMonth - b.usdPerMonth)[0] || fail(`${id}: no plan includes the agent`);
  const comp = p.cloudComputers.find((c) => c.primary) || null;
  const scope = comp && comp.scope;
  const per = scope && scope.value === 'per-user' ? COPY.agents.perUser : scope && scope.value === 'per-agent' ? COPY.agents.perAgent : stateOf('none', (scope && scope.gap) || 'undisclosed').word;
  return {
    id, name: v.name, agent: v.agent.name, status: v.agent.status, tag: v.agent.tag, access: v.agent.access,
    plan: { name: plan.name, price: price(plan.usdPerMonth), fact: fact(plan.claim) },
    per, perFact: scope && scope.claim ? fact(scope.claim) : null, perReason: scope && !scope.claim ? scope.reason : null,
    computer: comp ? { name: comp.name, fact: fact(comp.machine && comp.machine.claim) } : null,
    lamps: v.lamps, alwaysOn: fact(p.personalAgent.alwaysOn.claim), approvals: fact(p.personalAgent.approvals),
    // floors (0-8) where a part needs your own machine: what "Close your laptop" darkens
    you: v.stack.map((c, i) => (c.guests.includes('you') || c.parts.some((q) => q.owner === 'you') ? i : -1)).filter((i) => i >= 0),
  };
});

// ---- 2.7 cross-provider links: every poweredBy, delegatesTo and interop entry whose two ends have different owners
export const LINK_KINDS = ['thinks', 'hands', 'reads', 'inside', 'sold'];
const KIND = { 'runs-on': 'thinks', drives: 'hands', 'hands-off': 'hands', spawns: 'hands', 'reads-config-of': 'reads', 'imports-from': 'reads', 'model-runs-inside': 'inside', 'sold-through': 'sold' };
// where each kind leaves and lands (floor numbers, SPEC 3.4): a model thinks with a model, an agent's delegation floor
// hands work to another's harness, a harness reads another's setup, a model runs inside a harness or is sold through a shop
export const LINK_FLOORS = { thinks: [5, 5], hands: [8, 4], reads: [4, 4], inside: [5, 4], sold: [5, 5] };
const end = (ref, name, owner) => { const t = ref ? thing(ref) : null; return { ref: ref || null, name: (t && t.name) || name || fail(`no name for ${ref}`), owner: owner || (t && t.owner) || ownerOf(ref) }; };

function linkList() {
  const out = [];
  const add = (kind, from, to, official, claim, id) => {
    if (from.owner === to.owner) return;
    const [f, t] = LINK_FLOORS[kind];
    out.push({ id, kind, official: official || 'yes', from: { ...from, floor: f }, to: { ...to, floor: to.owner === 'you' ? 7 : t }, fact: fact(claim) || fail(`${id}: no claim`) });
  };
  for (const id of ORDER) {
    const p = D.providers[id];
    for (const s of p.surfaces) {
      s.poweredBy.forEach((m, k) => add('thinks', end(s.id, s.name, id), end(m.modelRef), m.official, m.claim || s.poweredByNote || s.claim, `${s.id}:pb${k}`));
    }
    const agent = end(p.personalAgent.surfaceRef, p.personalAgent.name, id);
    p.personalAgent.delegatesTo.forEach((d, k) => add(KIND[d.relation] || 'hands', agent, end(d.toRef, d.toName, d.toOwner), d.official, d.claim, `${id}:dt${k}`));
    for (const x of p.interop || []) add(KIND[x.relation] || fail(`${x.id}: unknown relation ${x.relation}`), end(x.fromRef), end(x.toRef), x.official, x.claim, x.id);
  }
  return out;
}
export const links = linkList();

// ---- 2.8 best at
export const GROUPS = ['code', 'act', 'search', 'voice', 'media', 'think', 'platform'];
// which floor lights for each capability (SPEC 2.8, page configuration, not data)
export const BEST_FLOOR = {
  'best-agentic-coding': 5, 'best-reasoning': 5, 'best-writing': 5, 'best-multimodal': 5, 'best-context': 5, 'best-image': 5, 'best-video': 5, 'best-value': 5, 'best-open-weights': 5,
  'best-coding-agent': 4, 'best-computer-use': 6, 'best-browser-agents': 6, 'best-web-search': 6, 'best-deep-research': 6, 'best-x-search': 6, 'best-ecosystem': 6,
  'best-voice-conversation': 2, 'best-voice-agents': 2, 'best-long-running': 3, 'best-personal-agent': 3, 'best-cloud-computer': 7, 'best-distribution': 1,
};
// the job's own cell where the data has one: an image or video model. Elsewhere the agent stack's lit floor
const MEDIA = { 'best-image': 'image', 'best-video': 'video' };
// how high a stack stands (SPEC 2.8). A narrow lead keeps the runner-up close, so no step claims more than the cell
export const HEIGHT = { first: 1.7, second: { wide: 0.35, narrow: 1.15 }, contested: 1.0, tie: 0.5 };
const STAMP = { clear: COPY.best.clear, contested: COPY.best.contested, tie: COPY.best.tie, unknown: COPY.best.unknown };
const OUTCOME = { upheld: COPY.best.upheld, partly: COPY.best.partly, 'not-supported': COPY.best.notSupported, unknown: COPY.best.cantTell };

function capability(c) {
  const b = D.bestAt;
  const floor = BEST_FLOOR[c.id] || fail(`no floor for ${c.id}`);
  const guess = b.ownerGuesses.find((g) => g.capabilityRef === c.id) || null;
  let places = [];
  if (c.verdict === 'clear') places = [[c.leader, 1, HEIGHT.first], [c.runnerUp, 2, HEIGHT.second[c.margin || 'wide']]].filter(([x]) => x).map(([x, place, h]) => ({ ...x, place, h, step: 'solid' }));
  else if (c.verdict === 'contested') places = c.contenders.map((x) => ({ ...x, place: 0, h: HEIGHT.contested, step: 'hatch' }));
  else if (c.verdict === 'tie') places = c.contenders.map((x) => ({ ...x, place: 0, h: HEIGHT.tie, step: 'hatch' }));
  if (c.verdict === 'clear' && !c.leader) fail(`${c.id}: clear with no leader`);
  if ((c.verdict === 'contested' || c.verdict === 'tie') && places.length < 2) fail(`${c.id}: ${c.verdict} needs two contenders`);
  // a company that appears in the ranking or the evidence has something for the job. One that does not, and whose
  // cell for the job is empty, shows that empty state and its reason (never a low rank)
  const rated = new Set([...places.map((x) => x.provider), ...c.evidence.map((e) => ownerOf(e.subjectRef)).filter(Boolean)]);
  const empty = ORDER.filter((id) => !rated.has(id)).map((id) => {
    const m = MEDIA[c.id] && D.providers[id].media[MEDIA[c.id]];
    if (m) return m.primaryRef ? null : { id, ...stateOf('none', m.gap), reason: m.reason };
    const cell = view.provider(id).stack[floor - 1];
    return cell.fact ? null : { id, state: cell.state, word: cell.word, reason: cell.reason };
  }).filter(Boolean);
  const lead = c.evidence[0] || null;
  // a clear call whose strongest source was read after the snapshot day rests on that one reading: say which, and when
  const thin = c.verdict === 'clear' && lead && lead.readOn && lead.readOn > c.asOf ? { by: lead.ranBy, on: lead.readOn } : null;
  const stamp = [STAMP[c.verdict], c.verdict === 'clear' && c.margin ? COPY.best[c.margin] : null].filter(Boolean);
  const fixed = words(`${COPY.best.title} ${GROUPS.map((g) => COPY.best[g]).join(' ')} ${c.name} ${stamp.join(' ')} ${COPY.best.asOf} ${c.asOf}`)
    + places.reduce((n, x) => n + words(x.label), 0) + empty.reduce((n, x) => n + words(x.reason), 0) + (thin ? words(`${thin.by} ${thin.on}`) : 0)
    + (guess ? words(`${COPY.best.myGuess} ${guess.quote} ${OUTCOME[guess.outcome]}`) : 0);
  // first depth keeps to 60 words with the chrome: the reason moves one tap away (to the stamp) when it would pass
  const why = !guess && CHROME_WORDS + fixed + words(c.reason) <= MAX_WORDS;
  return {
    id: c.id, name: c.name, question: c.question, group: c.group, floor, verdict: c.verdict, margin: c.margin, stamp, asOf: c.asOf,
    places, empty, thin, why, words: CHROME_WORDS + fixed + (why ? words(c.reason) : 0),
    reason: { id: c.id, text: c.reason, short: c.name, asOf: c.asOf, status: 'released', confidence: c.confidence, sources: [...new Set(c.evidence.map((e) => e.src).filter(Boolean))], gap: null },
    guess: guess ? { quote: guess.quote, outcome: guess.outcome, stamp: OUTCOME[guess.outcome], reason: guess.reason } : null,
    evidence: c.evidence.map((e) => ({ what: e.what, score: e.score, subject: e.subject, by: e.ranBy, date: e.date, readOn: e.readOn || null, note: e.note || null, basis: e.basis, confidence: e.confidence, src: e.src || null })),
    notYetRated: c.notYetRated, leadsOn: places.filter((x) => x.leadsOn).map((x) => ({ provider: x.provider, label: x.label, leadsOn: x.leadsOn })),
  };
}

export const best = (() => {
  const caps = D.bestAt.capabilities.map(capability);
  // the tour starts with the owner's four guesses, in his order
  const tour = [...D.bestAt.ownerGuesses.map((g) => caps.findIndex((c) => c.id === g.capabilityRef)), ...caps.map((_, k) => k)].filter((k, i, all) => k >= 0 && all.indexOf(k) === i);
  return {
    groups: GROUPS.map((g) => ({ id: g, name: COPY.best[g], caps: caps.filter((c) => c.group === g).map((c) => c.id) })),
    caps, tour, caveats: D.bestAt.caveats.map(fact),
  };
})();
if (best.caps.some((c) => !GROUPS.includes(c.group))) fail('a capability is in no group');
export { tagOf };
