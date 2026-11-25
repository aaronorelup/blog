# The film's script, read as its viewer (script-viewer, 2026-11-25)

Read: `/home/user/gtv/production/SCRIPT.md` (all 18 chapters), `chapters/*/script.md` and `PRODUCTION.md` sections 1
and 2, as a guitarist curious about AI who knows nothing about music information retrieval. The chapter files match
SCRIPT.md exactly: 0 differences in spoken lines or listening windows (`analyze.py`). Times use the script's own
estimate (164 wpm, 0.5 s a line, 1 s a shot). Work files: `/home/user/gtv/work/script-viewer/` (`analysis.txt`, `runs.txt`).

**Verdict: not ready to voice.** The script is honest, sourced and mostly clear. The cold open, ch02's scoring lesson,
ch03's slaps against the steady part, the "for your ear" moments (ch03 s7, ch04 l04, ch06 l06 and l10, ch09 l03, ch15
l09) and ch15's three-way listening all work. But it has five long stretches with no guitar heard, two words with two
meanings, a decisive chapter (ch07) with almost no sound, and a blind-test result that never shows what the AI did.

## 1. Long stretches with no guitar heard (time between listening windows)
| est. | where | what is on screen |
|---|---|---|
| 205 s | ch15 s11 → ch16 s4 | verdict bars, a 6-row grid, delta bars, chapter card, a 56 s list over the map, two grids |
| 194 s | ch07 s2 → ch08 s2 | histogram, MiMo grid, OWLv2 stills, Opus quotes, summary grid, ch08 card, a 39 s bar chart |
| 133 s | ch14 s3 → ch15 s1 | prompt card, kit/bare columns, three caveat cards (52 s), guard rows, minutes bars |
| 102 s | ch01 s7 → ch02 s3 | ch02 card and a 61 s list of the ten steps over one map |
| 92 s | ch12 s3 → ch13 s3 | the 6x5 chain grid, then bars |

Cards change, so no frame freezes, but in a film about guitar sound these are three minutes of voice over text. Fixes:
in ch16 s2 let each recommended station replay 3 to 4 s of what its tool gives (HPSS's steady part, guitar-fl's notes,
Beat This!'s clicks, the per-beat file over the recording). Play the open strings in ch07 (section 3). Cut ch14's
caveats (section 9) and keep the blind video under them at bed level. Add the ch15 shot of what each attempt did (section 5).

## 2. Words used before they are explained, or with two meanings
- **"key" has two meanings.** It means the answer key in 48 spoken lines, and the musical key in ch06 l01 ("the chords
  and the key"), ch06 l11 ("named the keys of the capo song"), ch01 l12 and ch15 l12. That last line uses both senses
  in one sentence ("For its key ... and the key itself is a judgement there"), and "the key's chords" (ch06 l10) sounds
  like the song's key. Fix: say "home key" for the musical key everywhere; keep "the key" for the answer key.
- **"cents" has two meanings.** ch07 l02 defines cents as hundredths of a semitone; about 30 s later l10 says "fifty to
  sixty-two cents" and means money (again in ch16 l07). Fix: "about half a dollar a look".
- **"Opus 5.5"** is never introduced (first heard at ch00 l06). In a film about audio, many will think of the Opus codec.
  Fix: "Claude Opus 5.5, Anthropic's AI model" the first time.
- **Used before explained:** "Basic Pitch" judges the stems in ch03 l01 but is introduced in ch04 l02 (say "a free note
  finder, tested next"). "taps" appears in ch02 l02 and ch05 l01, is defined only in ch05 l04, and guitarists hear
  "tapping" (define it at first use). "the blind test" appears in ch05 l06, long before ch14. The "−9 cents" chip shows
  in ch01 s7, before ch07 l02 explains cents.
- **Never explained:** "contact sheets" (ch07 l08, ch16 l02: "grids of video frames"), "FluidSynth" (ch11 l08, ch14 l03:
  "a software synth"), "harness", "orchestrator's to-do list", "arm" and "effort setting" (ch14 l06 to l08: say "the
  software running the test showed each attempt our own task list"), "majmin" on screen (ch06 s4 and s5, ch16 s2 and
  s4: "MAJOR/MINOR RIGHT").
- **Unclear:** ch01 l08 "timed ... where its pitch rises in the sound" (say "to the moment it starts"). ch01 l07 says "a
  thousand and seven notes", then l09 says the key has 815, with no reason given (truth-capo.md Method: the 1,007 note
  heads include slap and tap marks). ch12 l04 "under a neutral file name" never says what the first name was or why.

## 3. Tabs and note lists: shown but not played, or played to no purpose
- **Tunings are note lists that are never heard:** ch07 s3 (the rule's D2 A2 D3 G3 B3 E4 against the key's D2 G2 C3 F3
  A3 C4), ch07 s7 (Opus's "standard"), ch15 s9 (D4 for C4). Add one window of the six open strings through the same
  SoundFont: the key's tuning, the rule's Drop D, Opus's standard. That is about 15 s of sound in the chapter the thesis
  rests on, which now has 5 s of listening in 2:24.
- **ch05 s4** shows Imagine's taps with no listening window, yet l05 claims the thumps are soft. Add 5 s of clicks.
- **The same sound, played twice:** ch08 s3 (l04 "played back it sounds the same") and ch10 s3 (l04 "the tab sounds the
  same") each spend 12 s on two clips just announced as identical, after ch00 s3 already taught it. Play once (6 s)
  with both cursors running and the place marks lit.
- **Why place matters is never said.** ch00 l04, ch08 l04 and l05, and ch15 l08 call a right pitch on the wrong string
  wrong, right after the viewer heard it sound the same. A guitarist will ask what that costs a player. Add one sentence:
  what the wrong place means for someone playing along with this video, with an example where a record has one.
- **Narration over a parked tab:** about 40 s in ch11 s2 (l02 to l04) and 35 s in ch06 s2 before the first window. Move
  the first window up, after the second line.

## 4. What the film tells the viewer to think
- **ch16 s5,** the last tab, is the one 20 s stretch where the kit arm got 65 of 65. Key and kit sound identical, and it
  is the final impression of a 0.930 / 0.865 / 0.548 result. Say "its best stretch", or close on a typical one.
- **ch10 l06** "Seeing the fingers made the strings worse" contradicts l03, where the pins helped without the capo
  (0.393 to 0.610). Say "once the tuning and capo were right".
- **ch06 l09** "Played one string at a time, fingerstyle chords proved harder to name" states a cause the test did not
  isolate (different clips, synthesized against real). Say "may be harder; this test cannot tell".
- **ch15 l11** "placed it right about equally often" holds on capo (0.966 / 0.977) and Imagine (0.941 / 0.928), not on
  the nylon song (0.798 / 0.690, s12). Add "on the steel-string songs".
- **ch08 l03** "scorify placed no notes on any whole song" plays over scorify bars at 0.679 / 0.852 / 0.591 (10 s
  pieces). Say both.

## 5. The main question (which tools to give an AI, and which make the output work)
- **ch15 gives scores but never shows what each attempt did,** the core of the request ("its own judgement ... also
  without the tool"). BLIND-RESULTS.md "What each round-2 attempt did" has it: the bare arms wrote their own onset and
  pitch pickers (spectral flux, harmonic sum, KL-NMF); the kit arms merged both guitar models with Basic Pitch as referee
  and overruled the lowest-note rule from the picture. Add, per song, a 10 s shot of two HOW.md lines (kit, bare) over
  the footage. That also gives ch15 a new kind of picture.
- **ch15 l11 is rushed.** "The gap came from finding the notes" answers which tools make the output work, in one
  sentence over a 6-row grid. Give it its own chart (note F1 against place-of-found, kit against bare) and a pause.
- **ch00 l07** frames the film as "which tools came closest". Say "which tools to give an AI for this job, and which
  ones make the tab right", so ch16 l01 answers a question the viewer heard at the start.
- **Chapters that end off the question:** ch04 on a post aside (l10), ch09 on run time (l08), ch11 on the film's own
  playback choice (l08). End each step chapter on a one-line verdict for the AI's kit, which ch16 then gathers.
- **ch16 l02** recommends "its own eyes" for tuning and capo, but eyes failed the nylon tuning (ch07 l10: Opus said
  standard). Say "for the capo; for the tuning, eyes and ears together still missed one string".

## 6. Repetition
- The nylon key's caveats (no rhythm, beats by rule, D minor or F major) come at the ch01 card, ch01 l11 to l13, ch06
  l06 and l11, and ch15 l09 and l12. Keep ch01 plus a short reminder where it is not graded.
- The ten-station map is shown in ch00 s5 and again in ch02 s2 about 1.5 min later: keep the ch02 list to names. ch07
  s6 holds Opus's quote 4 s in silence, then l09 reads it aloud: do one or the other.
- Five "the post's test" asides (ch03 l10, ch04 l10, ch06 l09, ch07 l06, ch11 l05), and the viewer may not have read
  the post. Keep each to one sentence, or gather them on one card.

## 7. Chapters with one kind of shot
- **ch06:** s2 to s4 are three lane timelines in a row (about 156 s). Open s2 on the capo footage with the clicks, or
  show the key's chords on paper in s4. **ch14:** s3 to s6 are four text grids, with 6 s of footage in the whole
  chapter; show what an attempt saw or made. (ch09 is all footage overlays, which is acceptable since they differ.)

## 8. Next to the bar (PRODUCTION.md section 1)
- **Pace.** The bar runs at 127 wpm with real pauses. This runs at the voice's 164 wpm with 0.5 s gaps, on lines with
  3 to 6 numbers (ch08 l02 and l03, ch13 l07, ch15 l06 and l10). Add 1 to 1.5 s after such lines. Spoken numbers come in
  mixed forms ("zero point eight six five against zero point seven oh five" in ch15 l06, "eight in ten" in ch08 l02):
  use one spoken form ("87 in 100") and keep decimals on screen.
- **Sound.** The bar has a quiet bed about 18 dB under the voice. This film has none, so section 1's stretches are dry
  voice. Put the recording under the voice at bed level there (the guitar stays the only music).
- **ch14 s3** holds a 57-word prompt for 6 s, to be read in silence: about 15 s of reading. Hold 14 to 15 s, or narrate
  its three parts while they light.

## 9. Length
The estimate is 40:31, against the request's "shoot for 30 minutes in the beginning". The cheapest cuts: ch05 (1:41;
its own l06 says nothing later depends on it, and ch16 lists nothing from it), the ch03 s6 band clip detour (46 s), the
ch02 s2 map that ch00 already previewed (61 s), and the ch14 s5 caveats (52 s; move the round 1 detail to ch15 s13,
where round 1 is shown). These come to 4:20 of estimate before any trimming; the post asides take about 40 s more. Two
places need more time, not less: ch07 (sound) and ch15 l11 (the answer).
