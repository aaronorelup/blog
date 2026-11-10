// POST /api/ask/hear, header X-AO-Session, body: one recording (audio/webm, audio/mp4 or audio/ogg, at most 1 MB):
// Ask by voice. Workers AI's Whisper turns it into { text }, which the page puts in the box and asks through
// /api/ask like typed words. The audio and the text are never stored or logged; usage_day counts 'hear' calls only.
// Before the paid call: origin, type, size, token, the switches, two limiters, the day's cap. Bare statuses.
import { flags, spend } from '../lib/flags.js';
import { json, sameOrigin, status } from '../lib/http.js';
import { verify } from '../lib/session.js';

export const MODEL = '@cf/openai/whisper-large-v3-turbo';
export const MAX_AUDIO = 1 << 20;   // bytes: 30 s of opus is about 120 KB, of AAC about 500 KB
const MIN_AUDIO = 1024;             // bytes: less is no speech
const TIMEOUT = 20e3;               // ms for the model's answer
const MAX_TEXT = 300;               // characters, what /api/ask takes
const TYPE = /^audio\/(?:webm|mp4|ogg|x-m4a|aac)(?:;|$)/i;

function within(ms, p) {
  let t;
  return Promise.race([p, new Promise((_, no) => { t = setTimeout(() => no(new Error(`${ms} ms`)), ms); })]).finally(() => clearTimeout(t));
}

// The body's bytes, or null when they pass max (the declared length is checked first, then what came).
async function bytes(request, max) {
  if (Number(request.headers.get('Content-Length')) > max) return null;
  const buf = new Uint8Array(await request.arrayBuffer());
  return buf.length > max ? null : buf;
}

function base64(buf) {
  let s = '';
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
}

export async function serve(request, env) {
  if (!sameOrigin(request)) return status(403);
  if (!TYPE.test(request.headers.get('Content-Type') ?? '')) return status(415);
  if (Number(request.headers.get('Content-Length')) > MAX_AUDIO) return status(413);
  const session = await verify(env, request.headers.get('X-AO-Session'));
  if (!session) return status(401);
  const f = await flags(env);
  if (f.ask !== 'on' || f.ask_voice !== 'on') return status(503);
  const [one, all] = await Promise.all([env.HEAR_LIMIT.limit({ key: session.s }), env.HEAR_ALL.limit({ key: 'all' })]);
  if (!one.success || !all.success) return status(429);
  const audio = await bytes(request, MAX_AUDIO);
  if (!audio) return status(413);
  if (audio.length < MIN_AUDIO) return status(400);
  if (!(await spend(env, 'hear', 1, f.hear_daily))) return status(503);
  let r;
  try {
    r = await within(TIMEOUT, env.AI.run(MODEL, { audio: base64(audio), task: 'transcribe', language: 'en', vad_filter: true }));
  } catch (e) {
    console.log('ask.hear failed', e.name);   // never the audio, never the text
    return status(502);
  }
  if (typeof r?.text !== 'string') return status(502);
  return json({ text: r.text.replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT) });
}
