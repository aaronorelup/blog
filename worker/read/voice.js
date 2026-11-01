// The read-aloud cron's ElevenLabs calls (step.js), with the Worker's own restricted key (Text to Speech and User
// read, its monthly credit quota the hard cap). Each has a timeout and no retry; a failure is a null the step counts.
import { alignWords } from '../../src/lib/read/align.js';
import { spoken } from '../../src/lib/read/speak.js';

const API = 'https://api.elevenlabs.io/v1';
const headers = (env) => ({ 'xi-api-key': env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json' });

// The account's credits: { limit, left }, or null when the call fails.
export async function credits(env) {
  const res = await fetch(`${API}/user/subscription`, { headers: headers(env), signal: AbortSignal.timeout(10e3) })
    .catch(() => null);
  if (!res?.ok) return null;
  const { character_limit: limit, character_count: used } = await res.json();
  return { limit, left: limit - used };
}

// One section, with its neighbours' spoken text for a natural run-in and run-out (ElevenLabs bills only the text).
// → { credits, mp3, dur, words } (words: [[j, c0, c1, t0, t1]], j its block in the section), { credits } alone when
// the answer had no usable alignment, or null when the call failed. credits: what the answer says it cost.
export async function voice(env, index, section, before, after) {
  const said = spoken(section.blocks);
  const res = await fetch(`${API}/text-to-speech/${index.voice}/with-timestamps?output_format=${index.format}`, {
    method: 'POST',
    headers: headers(env),
    body: JSON.stringify({ text: said.text, model_id: index.model, voice_settings: index.settings,
                           previous_text: before, next_text: after }),
    signal: AbortSignal.timeout(120e3),
  }).catch(() => null);
  if (!res?.ok) return null;
  const cost = Number(res.headers.get('character-cost')) || Math.ceil(said.text.length / 2);
  const { audio_base64: audio, alignment } = await res.json().catch(() => ({}));
  const words = audio && alignWords(section.blocks, said, alignment);
  if (!words) return { credits: cost };
  const mp3 = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0));
  const dur = Math.round(alignment.character_end_times_seconds.at(-1) * 1000);
  return { credits: cost, mp3, dur, words };
}

// A neighbouring section's spoken text, cut to its last or first 500 characters.
export const context = (section, end) => {
  if (!section) return undefined;
  const { text } = spoken(section.blocks);
  return end === 'tail' ? text.slice(-500) : text.slice(0, 500);
};
