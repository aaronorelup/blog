// read.step, the 10-minute cron: records the first post by rank in /read/index.json whose recording isn't whole, a
// few sections a run, into R2 (MEDIA) as read/<slug>/<section hash>.mp3 and .json (its words), then the post file
// read/<slug>/<post hash>.json, whose existence means the recording is complete (docs/WORKER.md "Read-aloud").
// Capped by the flag tts_daily_credits, a floor of the account's credit (tts_credit_floor) and the key's own quota.
import { buildJson } from '../lib/build-files.js';
import { flags, NO_CAP, spend } from '../lib/flags.js';
import { ensure } from '../lib/sql.js';
import SCHEMA from './read.sql';
import { context, credits, voice } from './voice.js';

const RUN_CHARS = 10_000; // spoken characters sent in one run at most
const TRIES = 3;          // failed runs at one hash before a post is skipped until its text changes
const JSON_TYPE = { httpMetadata: { contentType: 'application/json' } };

const save = (env, slug, hash, state, tries) => env.DB.prepare(
  'INSERT INTO read_state (slug, hash, state, tries, at) VALUES (?1, ?2, ?3, ?4, ?5) ' +
  'ON CONFLICT (slug) DO UPDATE SET hash = ?2, state = ?3, tries = ?4, at = ?5',
).bind(slug, hash, state, tries, new Date().toISOString()).run();

export async function step(env) {
  const f = await flags(env);
  if (f.tts !== 'on' || !env.ELEVENLABS_API_KEY) return 'off';
  await ensure(env.DB, SCHEMA);
  const index = await buildJson(env, '/read/index.json');
  const { results } = await env.DB.prepare('SELECT slug, hash, state, tries FROM read_state').all();
  const states = new Map(results.map((r) => [r.slug, r]));
  const due = ([slug, { hash }]) => {
    const s = states.get(slug);
    return !s || s.hash !== hash || (s.state !== 'done' && s.tries < TRIES);
  };
  const next = Object.entries(index.posts).sort((a, b) => a[1].rank - b[1].rank).find(due);
  if (!next) return 'idle';
  const [slug, { hash }] = next;
  const was = states.get(slug);
  const tries = was?.hash === hash ? was.tries : 0;
  const doc = await buildJson(env, `/read/${slug}.json`);
  const have = await Promise.all(doc.sections.map((s) => env.MEDIA.head(`read/${slug}/${s.hash}.json`)));
  const missing = doc.sections.filter((_, i) => !have[i]);

  let room = RUN_CHARS;
  const batch = missing.filter((s, i) => (room -= s.chars) >= 0 || i === 0);
  const chars = batch.reduce((n, s) => n + s.chars, 0);
  let used = 0;
  if (batch.length) {
    const estimate = Math.ceil(chars / 2); // 0.5 credit a character at list price
    const account = await credits(env);
    if (!account) return 'stopped: the subscription call failed';
    if (account.left - estimate < f.tts_credit_floor * account.limit) return `stopped: ${account.left} credits left, at the floor`;
    if (!(await spend(env, 'tts_credits', estimate, f.tts_daily_credits))) return 'stopped: tts_daily_credits spent';
    for (const s of batch) {
      const i = doc.sections.indexOf(s);
      const out = await voice(env, index, s, context(doc.sections[i - 1], 'tail'), context(doc.sections[i + 1], 'head'));
      used += out?.credits ?? 0;
      if (!out?.mp3) {
        await spend(env, 'tts_credits', used - estimate, NO_CAP);
        await save(env, slug, hash, 'failed', tries + 1);
        return `${slug}: section ${s.hash} failed (${out ? 'no alignment' : 'no answer'}), ${used} credits`;
      }
      await env.MEDIA.put(`read/${slug}/${s.hash}.mp3`, out.mp3, { httpMetadata: { contentType: 'audio/mpeg' } });
      await env.MEDIA.put(`read/${slug}/${s.hash}.json`, JSON.stringify({ dur: out.dur, words: out.words }), JSON_TYPE);
    }
    await spend(env, 'tts_credits', used - estimate, NO_CAP);
  }
  const voiced = `${batch.length} sections, ${chars} characters, ${used} credits`;
  if (missing.length > batch.length) {
    await save(env, slug, hash, 'partial', tries);
    return `${slug}: ${voiced}, ${missing.length - batch.length} sections to go`;
  }
  // Every section is in R2: the post file, words keyed by the block refs of this build.
  const parts = await Promise.all(doc.sections.map(async (s) => {
    const { dur, words } = await (await env.MEDIA.get(`read/${slug}/${s.hash}.json`)).json();
    return { src: `/read/${slug}/${s.hash}.mp3`, dur, words: words.map(([j, ...w]) => [s.blocks[j][0], ...w]) };
  }));
  await env.MEDIA.put(`read/${slug}/${hash}.json`, JSON.stringify({ v: 1, hash, parts }), JSON_TYPE);
  await save(env, slug, hash, 'done', tries);
  return `${slug}: ${voiced}, recording ${hash} whole`;
}
