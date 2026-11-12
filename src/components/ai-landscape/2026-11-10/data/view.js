// The view model (SPEC 6.2): the frozen data file with every claimRef resolved, shaped for the components, plus
// the one small JSON the browser gets. Runs at build time (Astro frontmatter) and in plain Node. It throws, and
// so fails the build, on a claimRef that points nowhere, a string over its word limit, or a client JSON over 60 KB.
import raw from '../../../../data/ai-landscape/2026-11-10.json' with { type: 'json' };
import { COPY } from './copy.js';
import { misses, printable } from './limits.js';

export const ORDER = ['anthropic', 'openai', 'google', 'meta', 'xai'];
export const DOOR_KINDS = ['personal-agent', 'chat-app', 'coding-agent', 'task-agent', 'voice', 'search', 'browser', 'creative-tool'];
const FACTS = { providers: raw.providers, bestAt: raw.bestAt, architecture: raw.architecture, aaron: raw.aaron };
const fail = (msg) => { throw new Error(`ai-landscape view: ${msg}`); };

// ---- claims: one index, every reference resolved
const claims = new Map();
const things = new Map();
(function index(node) {
  if (Array.isArray(node)) return node.forEach(index);
  if (!node || typeof node !== 'object') return;
  if (node.id && node.text && node.status && node.asOf) claims.set(node.id, node);
  Object.values(node).forEach(index);
})(FACTS);
const resolve = (c) => {
  if (!c || !c.claimRef) return c || null;
  return claims.get(c.claimRef) || fail(`claimRef "${c.claimRef}" points at nothing`);
};
let refCount = 0;
(function check(node) {
  if (Array.isArray(node)) return node.forEach(check);
  if (!node || typeof node !== 'object') return;
  if (typeof node.claimRef === 'string') { refCount++; resolve(node); }
  Object.values(node).forEach(check);
})(FACTS);

// A displayed fact: what a proof card needs. null for an empty cell or a missing claim.
export function fact(c) {
  c = resolve(c);
  if (!c || !c.text) return null;
  return { id: c.id, text: c.text, short: c.short, asOf: c.asOf, status: c.status, confidence: c.confidence,
    sources: c.sources || [], gap: c.gap || null, staleAfter: c.staleAfter || null, quote: c.quote || null, quoteBy: c.quoteBy || null };
}

// ---- things: any id to its printed name, its owner and its status
export const ownerOf = (ref) => (!ref ? null : ORDER.find((p) => ref.startsWith(`${p}-`)) || (ref === 'ext-your-computer' ? 'you' : 'outside'));
for (const id of ORDER) {
  const p = raw.providers[id];
  const add = (list, kind) => (list || []).forEach((t) => things.set(t.id, { id: t.id, name: t.name, owner: id, kind: t.kind || kind, status: (resolve(t.claim) || {}).status || 'released' }));
  add(p.models, 'model'); add(p.surfaces, 'surface'); add(p.cloudComputers, 'computer'); add(p.voice.conversation, 'voice');
}
raw.architecture.externals.forEach((e) => things.set(e.id, { id: e.id, name: e.name, owner: ownerOf(e.id), kind: e.kind, status: 'released' }));
export const thing = (ref) => things.get(ref) || (ref ? { id: ref, name: null, owner: ownerOf(ref), kind: 'other', status: 'released' } : null);

// ---- the five glass states of SPEC 3.4, from a status or a gap
const GAP = { undisclosed: ['frost', COPY.state.undisclosed], 'not-found': ['dotted', COPY.state.notFound], absent: ['hollow', COPY.state.absent], 'not-applicable': ['hollow', COPY.state.absent] };
const TAG = { preview: COPY.state.preview, announced: COPY.state.announced, 'shut-down': COPY.state.shutDown };
export const tagOf = (status) => TAG[status] || null;
export function stateOf(status, gap) {
  if (status === 'released') return { state: 'solid', word: COPY.state.released };
  if (status === 'preview' || status === 'announced') return { state: 'hatch', word: TAG[status] };
  if (status === 'shut-down') return { state: 'hollow', word: TAG[status] };
  const [state, word] = GAP[gap || 'absent'];
  return { state, word };
}
// A Flag or Fact value as a lamp: yes, partial, no, or unknown (not said).
export const lamp = (f) => (f && f.value ? f.value : 'unknown');

export const layers = raw.architecture.stackLayers.map((l) => ({ id: l.id, n: String(l.order).padStart(2, '0'), name: l.name, sentence: l.sentence, without: l.without }));

// One floor of one product: its state, its words, its parts and whose they are.
function cell(layer, i, provider) {
  const base = { layer: layer.layer, n: layers[i].n, label: layers[i].name };
  if (!layer.name) {
    const s = stateOf('none', layer.gap);
    return { ...base, ...s, name: null, reason: layer.reason, fact: null, tag: null, parts: [], guests: [] };
  }
  const f = fact(layer.claim);
  const s = stateOf(f ? f.status : 'released', f && f.gap);
  const parts = (layer.parts || []).slice(0, 6).map((p) => {
    const t = thing(p.ref);
    return { name: p.name, owner: t ? t.owner : provider, status: t ? t.status : 'released', official: p.official || 'yes' };
  });
  const guests = [...new Set((layer.refs || []).map(ownerOf).filter((o) => o && o !== provider))];
  return { ...base, ...s, name: layer.name, reason: null, fact: f, tag: f ? tagOf(f.status) : null, parts, guests };
}

const THINKS = ['default', 'option', 'route', 'fallback'];
function door(s, provider, agentId) {
  const f = fact(s.claim);
  return {
    id: s.id, name: s.name, kind: s.kind, agent: s.id === agentId, status: f.status, tag: tagOf(f.status), access: s.access, fact: f,
    stack: s.stack ? s.stack.map((l, i) => cell(l, i, provider)) : null,
    models: s.poweredBy.filter((m) => THINKS.includes(m.role)).map((m) => ({ ...thing(m.modelRef), role: m.role })),
  };
}

// ---- the text version of each signature moment (SPEC 2.5.1 to 2.5.5): short lists built only from data
const YESNO = { yes: COPY.architecture.yes, partial: COPY.best.partly, no: COPY.architecture.no, unknown: COPY.state.undisclosed };
const OFFICIAL = { yes: COPY.links.official, partial: COPY.links.partial, no: COPY.links.unofficial };
const mediaItem = (m) => (m.primaryRef ? { text: thing(m.primaryRef).name, fact: fact(m.claim) } : { text: m.reason, tag: stateOf('none', m.gap).word });
const SIGNATURE = {
  anthropic: (p) => [
    { title: p.extensibility.standards.filter((s) => s.role === 'created').map((s) => s.name).join(', '),
      items: ORDER.filter((o) => o !== 'anthropic').map((o) => {
        const e = raw.providers[o].extensibility;
        return { text: raw.providers[o].identity.name, note: [e.connectors.name, e.skills.name].filter(Boolean).join(', '), owner: o, tag: YESNO[lamp(e.mcp)], fact: fact(e.mcp.claim) };
      }) },
    { title: p.tension.line, items: ['image', 'video', 'audio'].map((k) => mediaItem(p.media[k])) },
  ],
  openai: (p) => [
    { title: p.voice.conversation[0].name,
      items: p.voice.conversation.slice(0, 2).map((v) => ({ text: v.name, note: (fact(v.callsTools.claim) || fact(v.claim)).short, tag: v.modelRef ? null : COPY.state.undisclosed, fact: fact(v.claim) })) },
    { title: COPY.links.hands, items: p.personalAgent.delegatesTo.map((d) => ({ text: d.toName, owner: d.toOwner, fact: fact(d.claim) })) },
  ],
  google: (p) => [
    { title: p.search.dataMoat.line,
      items: ['google-gemini-app', 'google-ai-mode'].map((id) => p.surfaces.find((s) => s.id === id)).filter(Boolean)
        .map((s) => ({ text: s.name, note: s.poweredBy.filter((m) => m.role === 'option').map((m) => thing(m.modelRef).name).join(', '), fact: fact(s.claim) })) },
  ],
  meta: (p, stack) => [
    { title: stack[3].name || stack[3].word, ordered: true,
      items: [{ text: stack[0].name, fact: stack[0].fact }, { text: stack[3].fact.text, fact: stack[3].fact }, { text: fact(p.personalAgent.approvals).text, fact: fact(p.personalAgent.approvals) }] },
  ],
  xai: (p, stack) => [
    { title: COPY.links.thinks, items: stack[4].parts.map((q) => ({ text: q.name, owner: q.owner, tag: tagOf(q.status) })) },
    { title: COPY.links.hands,
      items: p.personalAgent.delegatesTo.filter((d) => d.kind === 'coding-agent').map((d) => ({ text: d.toName, owner: d.toOwner, tag: d.official === 'yes' ? null : OFFICIAL[d.official], dashed: d.official !== 'yes', fact: fact(d.claim) })) },
  ],
};

function provider(id) {
  const p = raw.providers[id];
  const pa = p.personalAgent;
  const surface = p.surfaces.find((s) => s.id === pa.surfaceRef) || fail(`${id}: no surface for the personal agent`);
  const stack = surface.stack.map((l, i) => cell(l, i, id));
  const access = fact(pa.access);
  const fl = raw.bestAt.flagships.find((f) => f.provider === id);
  const computer = p.cloudComputers.find((c) => c.primary) || null;
  return {
    id, name: p.identity.name, nameNote: p.identity.nameNote, brand: p.identity.assistantBrand, homepage: p.identity.homepage,
    signature: { line: p.signature.line, fact: fact(p.signature.claim) },
    tension: { line: p.tension.line, fact: fact(p.tension.claim) },
    agent: { id: pa.surfaceRef, name: pa.name, status: access.status, tag: tagOf(access.status), access },
    flagship: { name: fl.name, released: fl.released, access: fl.access, fact: fact(fl.claim),
      price: fl.priceIn == null ? null : `$${fl.priceIn} / $${fl.priceOut} ${COPY.world.perMillion}` },
    stack,
    doors: p.surfaces.filter((s) => DOOR_KINDS.includes(s.kind)).slice(0, 7).map((s) => door(s, id, pa.surfaceRef)),
    myths: p.misconceptions.map((m) => ({ id: m.id, myth: m.myth, truth: fact(m.truth) })),
    delegates: pa.delegatesTo.map((d) => ({ name: d.toName, owner: d.toOwner, kind: d.kind, relation: d.relation, official: d.official, fact: fact(d.claim) })),
    lamps: { terminal: lamp(computer && computer.terminal), browser: lamp(computer && computer.browser), screen: lamp(computer && computer.guiDesktop), alwaysOn: lamp(pa.alwaysOn), scope: lamp(computer && computer.scope) },
    ext: { mcp: lamp(p.extensibility.mcp), skills: !!p.extensibility.skills.name },
    media: ['image', 'video', 'audio'].map((k) => (p.media[k].primaryRef ? stateOf(fact(p.media[k].claim).status).state : stateOf('none', p.media[k].gap).state)),
    voice: p.voice.conversation.slice(0, 3).map((v) => ({ tools: lamp(v.callsTools), agents: lamp(v.startsAgents), named: !!v.modelRef })),
    lists: SIGNATURE[id](p, stack),
  };
}

// The same data with every { claimRef } swapped for its claim, for sections that pick their own fields.
function resolved(node) {
  if (Array.isArray(node)) return node.map(resolved);
  if (!node || typeof node !== 'object') return node;
  if (typeof node.claimRef === 'string') return resolve(node);
  return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, resolved(v)]));
}

// ---- what the browser gets: structure only. Words stay in the HTML, where they also read without JavaScript.
const cellCode = (c) => ({ s: c.state, g: c.guests, p: c.parts.map((q) => [q.owner, q.status, q.official]) });
const clientOf = (p) => ({
  agent: p.agent.id, status: p.agent.status, stack: p.stack.map(cellCode),
  doors: p.doors.map((d) => ({ id: d.id, kind: d.kind, status: d.status, stack: d.stack ? d.stack.map(cellCode) : null, m: d.models.map((m) => [m.owner, m.status, m.role]) })),
  to: p.delegates.map((d) => [d.owner, d.official, d.kind, d.relation]),
  lamps: p.lamps, ext: p.ext, media: p.media, voice: p.voice,
});

function build() {
  const over = misses(FACTS);
  if (over.length) fail(`${over.length} strings over their word limit, first: ${over[0].path} (${over[0].count} of ${over[0].limit})`);
  const providers = ORDER.map(provider);
  const client = { date: raw.snapshot.date, sources: raw.sources.length, order: ORDER, layers: layers.map((l) => l.id), p: Object.fromEntries(providers.map((p) => [p.id, clientOf(p)])) };
  const json = JSON.stringify(client).replace(/</g, '\\u003c');
  if (json.length > 60000) fail(`the client JSON is ${json.length} bytes, over 60 KB`);
  if (!printable(json)) fail('the client JSON holds a character the page fonts lack');
  return {
    snapshot: raw.snapshot, layers, providers, client, json,
    counts: { sources: raw.sources.length, claims: claims.size, claimRefs: refCount, unverified: raw.unverifiedCount, conflicts: raw.conflicts.length },
    data: resolved({ ...FACTS, sources: raw.sources, sinceSnapshot: raw.sinceSnapshot, expiring: raw.expiring, conflicts: raw.conflicts }),
    provider: (id) => providers.find((p) => p.id === id) || fail(`no provider "${id}"`),
    source: (n) => raw.sources[n - 1] || null,
  };
}

export const view = build();
