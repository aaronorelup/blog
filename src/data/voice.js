// The read-aloud voice: the only place it is named. src/lib/read/sections.js hashes all of it into every section, so
// changing any line here re-voices every post. /read/index.json carries it to the Worker (worker/read/), so the
// build and the cron can never disagree. EXTRACT_V and SPEAK_V move when the read rules or the spoken copy change.
export const VOICE = {
  id: 'bIHbv24MWmeRgasZH58o',                 // Will, an ElevenLabs stock voice
  model: 'eleven_v4_turbo',                   // 0.5 credit a character at list price, like Flash v2.5
  format: 'mp3_44100_64',
  settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: 1 },
};
export const EXTRACT_V = 1;
export const SPEAK_V = 1;
