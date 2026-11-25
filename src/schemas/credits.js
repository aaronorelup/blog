// Who made a post (WRITING.md "Credits"): the quiet line under a post's summary, "Owner: Gages · Worker: Opus 5.5
// xhigh $15". One place for what the `credits:` block may hold: creditsOf() is what the schema hands the page (it
// never fails a build: a value it cannot read is left out), creditParts() is the line, creditRules() is what
// scripts/check/frontmatter.mjs and tests/unit/credits.test.mjs hold a post to, on frontmatter as parsed or as raw
// YAML. The rules fail npm run check and npm test, never the deploy build, so a post written by an agent that has
// not read them yet cannot stop the site from deploying.

// Posts dated from this day on need an owner and a worker. Older posts carry the block where it is known.
export const CREDITS_FROM = '2026-11-27';
export const ROLES = ['owner', 'worker', 'orchestrator', 'writer'];
export const ROLE_CAP = 40;

const LABELS = { owner: 'Owner', worker: 'Worker', orchestrator: 'Orchestrator', writer: 'Writer' };
const NEVER = [
  [/@/, 'no email address or @handle'],
  [/:\/\/|www\./i, 'no link'],
  [/session[_-]?[0-9a-z]{6,}/i, 'no session id'],
  [/[\r\n]/, 'one line'],
  [/[—–;]/, 'no dash or semicolon'],
];

const isBlock = (c) => c !== null && typeof c === 'object' && !Array.isArray(c);
const text = (v) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');
const dayOf = (d) => (d instanceof Date ? d.toISOString() : String(d ?? '')).slice(0, 10);

// Dollars as a number, from 15, "15", "$15" or "$14.82". null when it is no amount.
export function costOf(v) {
  if (typeof v === 'number') return Number.isFinite(v) && v >= 0 ? v : null;
  const m = /^\$?\s*(\d+(?:\.\d+)?)$/.exec(text(v));
  return m ? Number(m[1]) : null;
}

// What the page shows: { owner, worker, orchestrator, writer, cost }, only the keys that hold something it can
// print, or undefined when none does.
export function creditsOf(c) {
  if (!isBlock(c)) return undefined;
  const out = {};
  for (const role of ROLES) {
    const value = text(c[role]);
    if (value && value.length <= ROLE_CAP && !NEVER.some(([re]) => re.test(value))) out[role] = value;
  }
  const cost = costOf(c.cost);
  if (cost !== null && cost > 0 && out.worker) out.cost = cost;
  return Object.keys(out).length ? out : undefined;
}

// A cost as the line prints it: whole dollars, since it is an estimate.
export const costLabel = (cost) => (cost < 1 ? 'under $1' : `$${Math.round(cost).toLocaleString('en-US')}`);

// The line's parts in reading order, from creditsOf()'s value: [['Owner', 'Gages'], ['Worker', 'Opus 5.5 xhigh $15']].
export function creditParts(credits) {
  if (!credits) return [];
  return ['owner', 'worker', 'orchestrator', 'writer'].filter((role) => credits[role]).map((role) =>
    [LABELS[role], role === 'worker' && credits.cost ? `${credits[role]} ${costLabel(credits.cost)}` : credits[role]]);
}

const MISSING = 'say who made this post (WRITING.md "Credits"): credits.owner is who had the idea (Aaron, or the '
  + 'agent that picked it, by the name he calls it) and credits.worker is the model that did the work, with its '
  + 'effort ("Opus 5.5 xhigh", "Opus 5.5 fleet"). If the run was measured, credits.cost is its dollars at API prices '
  + '(the "API-equivalent" line of cc_project.py report-self --post)';

// issue(key, message), as src/schemas/strict.js's v2Rules: every problem in a post's credits block, and a missing
// owner or worker on a post dated CREDITS_FROM or later.
export function creditRules(p, issue) {
  const c = p.credits;
  if (c !== undefined && c !== null && !isBlock(c)) {
    issue('credits', 'a block of owner, worker and, where they apply, orchestrator, writer and cost (WRITING.md "Credits")');
    return;
  }
  for (const role of ROLES) {
    const raw = c?.[role];
    if (raw === undefined || raw === null || raw === '') continue;
    const value = text(raw);
    if (typeof raw !== 'string') issue(role, 'a short name in quotes, like "Opus 5.5 xhigh"');
    else if (value.length > ROLE_CAP) issue(role, `${value.length} characters, over the ${ROLE_CAP}-character cap: the model or the name, nothing more`);
    else for (const [re, why] of NEVER) if (re.test(value)) issue(role, `${why} in a credit`);
  }
  if (c?.cost !== undefined && c.cost !== null && c.cost !== '') {
    if (costOf(c.cost) === null) issue('cost', 'dollars as a number, like 15 or 14.82: what the run would cost at API prices. Not measured: leave it out');
    else if (!text(c.worker)) issue('cost', 'the cost is the worker\'s: it needs credits.worker');
  }
  if (dayOf(p.date) >= CREDITS_FROM && (!text(c?.owner) || !text(c?.worker))) issue('credits', MISSING);
}
