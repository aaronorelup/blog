// The planner (docs/ASK.md "The planner"): one bounded JSON call that reads the catalog and the question and writes
// up to 4 search queries, the topics and up to 8 picked posts. Its picks can only be listed slugs and its topics
// only TOPIC_KEYS; its queries are only ever embedded, never shown, logged or sent to the answer call (a question can
// make the planner copy an injected request into them). A blank, non-JSON or late reply is no plan.
import { TOPIC_KEYS } from '../../src/data/taxonomy.js';
import { plannerBody } from './body.js';
import { PARAMS } from './context.js';
import { call } from './deepseek.js';

const MAX = { queries: 4, query: 200, picks: 8 };

export async function plan(env, ix, q) {
  const at = Date.now();
  const r = await call(env, await plannerBody(env, ix, q), { total: PARAMS.planner.total });
  return { ...r, at, plan: r.status === 200 ? validPlan(r.text, ix) : null };
}

function validPlan(text, ix) {
  let j;
  try { j = JSON.parse(text); } catch { return null; }
  if (!j || typeof j !== 'object' || Array.isArray(j)) return null;
  const list = (x) => (Array.isArray(x) ? x.filter((s) => typeof s === 'string') : []);
  return {
    queries: list(j.queries).map((s) => s.trim().slice(0, MAX.query)).filter(Boolean).slice(0, MAX.queries),
    topics: [...new Set(list(j.topics).filter((t) => TOPIC_KEYS.includes(t)))],
    picks: [...new Set(list(j.picks).filter((s) => ix.n(s) !== undefined))].slice(0, MAX.picks),
  };
}
