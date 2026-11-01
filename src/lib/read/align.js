// The voice's character times → the words on screen (worker/read/voice.js, after each ElevenLabs answer). Each word
// of each block's display text takes the earliest start and latest end of the spoken characters that came from it.
import { toDisplay } from './speak.js';

// blocks: a section's [[r, kind, text]]; said: spoken(blocks); alignment: ElevenLabs' character alignment of
// said.text. → [[j, c0, c1, t0, t1]]: block j of the section, display offsets c0..c1, milliseconds. null when the
// alignment is missing or isn't of the text that was sent.
export function alignWords(blocks, said, alignment) {
  const { characters: ch, character_start_times_seconds: t0, character_end_times_seconds: t1 } = alignment ?? {};
  if (!ch || ch.join('') !== said.text) return null;
  const words = blocks.map(([, , text]) => [...text.matchAll(/\S+/g)]
    .map((m) => [m.index, m.index + m[0].length, Infinity, -1])); // [c0, c1, t0, t1]
  const next = blocks.map(() => 0);
  for (let k = 0; k < ch.length; k++) {
    const at = !/\s/.test(ch[k]) && toDisplay(said.map, k);
    if (!at) continue;
    const [j, d] = at;
    const list = words[j];
    while (next[j] < list.length - 1 && d >= list[next[j]][1]) next[j]++;
    const w = list[next[j]];
    if (!w) continue;
    w[2] = Math.min(w[2], t0[k]);
    w[3] = Math.max(w[3], t1[k]);
  }
  return words.flatMap((list, j) => list.filter((w) => w[3] >= 0)
    .map(([c0, c1, a, b]) => [j, c0, c1, Math.round(a * 1000), Math.round(b * 1000)]));
}
