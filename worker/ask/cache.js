// RAG Goobie's answer cache (ask.sql): a finished answer kept 7 days under sha256(model | PROMPT_V | the manifest's
// v | ask_extra_tokens | the question), so it goes stale with any word of the prompt, any stable post or the listed
// set. An answer that drew on a live notebook keeps that notebook's hash, and a later push to it makes it a miss.
import { ensure } from '../lib/sql.js';
import { sha256 } from '../lib/text.js';
import { MODEL } from './deepseek.js';
import { promptV } from './prompt.js';
import SCHEMA from './ask.sql';

const KEEP_FOR = 7 * 864e5;

export const keyOf = async (m, f, q, variant) => sha256([MODEL, await promptV(variant), m.v, f.ask_extra_tokens, q].join('|'));

export async function cached(env, key, m) {
  await ensure(env.DB, SCHEMA);
  const hit = await env.DB.prepare('SELECT body FROM ask_cache WHERE key = ?1 AND at > ?2')
    .bind(key, new Date(Date.now() - KEEP_FOR).toISOString()).first('body');
  if (!hit) return null;
  const body = JSON.parse(hit);
  return Object.entries(body.live ?? {}).every(([n, h]) => m.live[n] === h) ? body : null;
}

export const keep = (env, key, body) => env.DB.prepare('INSERT OR REPLACE INTO ask_cache (key, body, at) VALUES (?1, ?2, ?3)')
  .bind(key, JSON.stringify(body), new Date().toISOString()).run();
