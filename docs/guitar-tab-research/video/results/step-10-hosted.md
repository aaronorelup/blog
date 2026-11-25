# Step 10. Hosted services that do the whole job in one call (`step-10-hosted`)

Run 2026-11-25 by agent `exp-hosted` on the box. Step 10 has no "A" entries. The three "B" entries (h-01, h-02, h-03)
were tried on all three songs. The "C" entries (h-04 to h-08) were not run. Free tiers cap the audio, so every run used
the 30 s segment (`$SEG`, or `$SEGM` for h-03) and was scored against the segment truth
`/home/user/gtv/work/exp-hosted/tr30/<S>.seg30.truth.json` (`crop_truth.py`, t0 = capo 12.76 s, tuning 25.0 s,
standard 0.0 s on the recording's timeline). The truth has no smaller `scored_range` than the whole piece.
Only the segments' sound left the box, for the h-03 results below (run 2) under the name `clip.wav` (run 1 sent
`<S>.seg30.mono.wav`: "After the audit"). No video was sent, and nothing about Aaron.

Per run: `/home/user/gtv/experiments/<S>/<exp>/` holds `result.json`, `cmd.sh`, `score.sh`, the raw output and the
canonical files. Scores are copied from the `gtr-eval` 0.12.1 outputs `score_*.json` in the same folder (eval ids in
`result.json`).

## What ran, and what did not

| exp | service | capo | tuning | standard | cost |
|---|---|---|---|---|---|
| h-01 | Klangio Guitar2Tabs web app, free tier (headless Chromium) | skipped: rights box | skipped: rights box | skipped: rights box | 0 |
| h-02 | Fretwise, guest access (headless Chromium) | failed: HTTP 403 "verify that you are human" | skipped (same block) | skipped (same block) | 0 |
| h-03 | MiMo v2.6 Flash via Vercel AI Gateway, one prompt for the whole tab, no hint | ran | ran | ran | USD 0.002645 (run 2) |
| h-03-hint | the same with the true tuning and capo given in the prompt | ran | ran (2nd try) | ran | USD 0.012404 (run 2, incl. failed 1st try) |
| h-04 to h-08 | Klangio API, Songsterr AI, AnthemScore Web, AAPA AutoTabs, Gemini API | not run (C) | not run (C) | not run (C) | 0 |

Total spent in this step: USD 0.029765 in fourteen gateway calls: run 1 USD 0.014716 (seven calls, now in
`run1-slotname/`) and run 2 USD 0.015049 (seven calls); `meta.json` of each call, `cost_usd`.

### h-01 Klangio Guitar2Tabs: stopped at the rights box

The free-tier wizard was driven to its last page with the capo segment (`cmd.sh` and `klang_step.cjs` in
`experiments/capo/h-01/`). The pages were: mode (Single-Instrument), instrument (acoustic guitar), guitar settings, advanced
(the default is "No, Klangio should automatically detect additional options for me"), then title and composer. On the
guitar settings page the defaults are Finger Picking, "Standard (EADGBE)" and "No Capo used" ticked. Those defaults are the
no-hint run. The tuning dropdown and the capo grid (frets 1-12) are where a hint would go. Step 5 has a checkbox
that must be ticked before "Start demo":
"I assure that the title and composer of the piece of music are entered correctly and that I have the rights to create
digital and modified versions of this piece of music. The Klangio Terms and conditions apply." The plan says to stop at
any rights or consent box, so it was not ticked and nothing was transcribed. The network log shows no upload request
before that page (only `ai2notes.klang.io/api/Auth/cookie` and `/api/Users/info`). Screenshots:
`experiments/capo/h-01/klangio_step{3,4,5}_*.png`. Route: Aaron's manual test T06.

### h-02 Fretwise: human-verification challenge

`GET /api/usage` answered `{"canTranscribe":true,"usedCount":0,"limit":3,"remainingCount":3,"subject":"guest"}`.
The capo segment was uploaded (presigned PUT to Fretwise's storage, HTTP 200). Then `POST https://fretwise.ai/api/transcribe`
answered HTTP 403 `{"message":"Please verify that you are human","code":"challenge_failed"}`
(`experiments/capo/h-02/api_transcribe_response.json`). An agent does not get past a human check, so it was tried
once and the other two songs were not sent. The upload page offers only instrument hints ("Acoustic Guitar" and others),
with no tuning or capo. Route: Aaron's manual test T18.

### h-03 MiMo v2.6 Flash, one prompt

One request per song and variant (run 2, the blind re-send of 09:16-09:30 UTC; "After the audit"), to
`xiaomi/mimo-v2.6-flash` through the research's `gateway_trial.py`.
The input was the 30 s mono segment, and the answer came back as JSON by schema. Prompt and schema:
`/home/user/gtv/work/exp-hosted/prompts/`. The prompt asks for the open strings, tuning name, cents, capo, key,
tempo, time signature, chord segments, and every note with onset, offset, pitch, string and fret (fret counted from the
capo). The hint variant adds one sentence with the true open strings and capo. `conv_h03.py` writes these files:
`notes.csv` and `chords.lab` on the recording's timeline, and `notes.seg.csv` and `chords.seg.lab` in segment time (these
are scored). Chord labels were converted to Harte, with the slash bass dropped. `render.wav` (FluidSynth, steel program 25)
and `render_mix.wav` (recording left, render right) are made from `notes.csv` on the recording's timeline (t0 s
first). The gateway's answer has no beats, so
there is no `beats.txt`, and no GP5 was written. In run 2, tuning/h-03-hint's first try stopped at the 24576-token limit
(`finish_reason` "length", JSON not parsed, USD 0.006978, 200.8 s, kept in `attempt1/`). The result is the one identical
retry. (In run 1 the same happened to capo/h-03-hint: USD 0.006979, 87.4 s.)

## Scores (h-03 run 2; 30 s segment; truth notes: capo 102, tuning 106, standard 125)

Notes, `gtr-eval notes --chroma` (onset F1 at 50 ms and 50 cents, with precision / recall; chroma = pitch class only):

| run | capo | tuning | standard |
|---|---|---|---|
| h-03 | 0.000 (0.000 / 0.000); chroma 0.034; 73 notes | 0.052 (0.082 / 0.038); chroma 0.052; 49 notes | 0.021 (0.030 / 0.016); chroma 0.021; 66 notes |
| h-03-hint | 0.000 (0.000 / 0.000); chroma 0.030; 96 notes | 0.023 (0.029 / 0.019); chroma 0.045; 70 notes | 0.024 (0.044 / 0.016); chroma 0.059; 45 notes |

Onset+offset F1 was 0.000 in every run except tuning/h-03 (0.013) and tuning/h-03-hint (0.011).

Tab, `gtr-eval tab` with the model's own tuning and capo: the share of matched notes with the same string and fret, then
the same share of all truth notes, then the share of truth notes matched at all. "order" is `--ignore-time`, which matches
by note order:

| run | capo | tuning | standard |
|---|---|---|---|
| h-03 | - / 0.000 (matched 0.000); order 0.000 / 0.000 | 0.000 / 0.000 (matched 0.038, 4 notes); order 0.000 / 0.000 | 1.000 / 0.016 (matched 0.016, 2 notes); order 1.000 / 0.296 |
| h-03-hint | - / 0.000 (matched 0.000); order 0.000 / 0.000 | 1.000 / 0.019 (matched 0.019, 2 notes); order 1.000 / 0.321 | 0.000 / 0.000 (matched 0.016, 2 notes); order 0.737 / 0.112 |

Counts in "order" mode: tuning/h-03-hint 34 same string and fret of 34 matched, standard/h-03-hint 14 of 19 (string
+1 in the other 5), capo/h-03-hint 0 of 8 (4 on the same string 9 frets off, 4 one string off;
`string_difference_counts`, `fret_difference_counts_when_same_string`). Without the hint: standard 37 of 37, tuning
0 of 30 (12 on the same string 2 frets off), capo 0 of 18.

Tuning and capo, `gtr-eval tuning` (truth: capo 3 / standard strings / +2 c; tuning 0 / D G C F A C / -9 c; standard
0 / standard / +6 c):

| run | capo | tuning | standard |
|---|---|---|---|
| h-03 | capo 3 (right); strings right; 15 c off | capo 0 (right); strings wrong (said standard); 9 c off | capo 0 (right); strings right; 6 c off |
| h-03-hint | capo 3 (right); strings right; 2 c off | capo 0 (right); strings right; 9 c off | capo 0 (right); strings right; 6 c off |

In the hint runs the capo and strings were given, so "right" there only shows that the model kept them.

Chords (`chords`: root / majmin share of time), key (`key`: mir_eval weighted score), tempo (`tempo`: deviation from
the truth's 76.56 / 65.73 / 76.14 BPM; none was within 4 % at any factor):

| run | capo | tuning | standard |
|---|---|---|---|
| h-03 | 0.282 / 0.282; key 0.0 (Eb major vs Bb major); +11.0 % | 0.591 / 0.638; key 0.5 (A minor vs D minor); -23.9 % | 0.530 / 0.530; key 1.0; +73.4 % |
| h-03-hint | 0.015 / 0.000; key 0.0 (G major); +17.6 % | 0.050 / 0.054; key 1.0; +9.5 % | 0.383 / 0.383; key 1.0; -13.3 % |

Chord labels returned (raw), against the truth's sequence:
- standard truth: C F C F ... h-03: one C for the whole segment. h-03-hint: C F C F Am E Am E Am.
- capo truth: Eb Bb Eb Cm ... h-03: Eb Ab/Eb Bb Eb Bb Eb Bb Eb ... (19 labels). h-03-hint: G Em C D, four times.
- tuning truth: Bb/D C/E Gm Dm ... h-03: Am Gm Dm7 Gm Bb Gm Dm7. h-03-hint: Dm Bb F C Gm A7 Dm.

Per 10 s window, the model's notes that have a truth note of the same pitch within 0.05 s, within 0.5 s, and of the same
pitch class within 0.5 s, are in `/home/user/gtv/work/audit-fix-b/p5/windows.json` (run 2; counted as `work/exp-hosted/windows.py` counts, by
`work/audit-fix-b/bin/step10_rows.py`). For example, standard/h-03, 0-10 s: 24 notes against 45 in the truth. 0 match
within 0.05 s, 10 within 0.5 s, and 16 match in pitch class within 0.5 s.

Run time and cost (API wall clock, no local cores; `meta.json`):

| run | capo | tuning | standard |
|---|---|---|---|
| h-03 | 91.9 s, USD 0.001079 | 49.5 s, USD 0.000715 | 57.7 s, USD 0.000851 |
| h-03-hint | 102.9 s, USD 0.001346 | 97.0 s, USD 0.003394 (+ failed 1st try 200.8 s, USD 0.006978) | 50.3 s, USD 0.000686 |

## Not run ("C", reasons copied from `experiments.json`)

- h-04 Klangio API: not possible. A Klangio API key comes after an application form and is not in the key store (T44).
- h-05 Songsterr AI: not possible. It needs an account by e-mail, and full songs need Songsterr Plus (T08).
- h-06 AnthemScore Web: not possible. It has a rights checkbox the permission system refused to tick for Aaron (FOR_AARON
  section 7, row 33).
- h-07 AAPA AutoTabs (tab from a video): not possible. It needs an account sign-up (T11).
- h-08 Gemini API (audio and video in one request): blocked. `GEMINI_API_KEY` is in the store, but its prepaid balance was 0
  (HTTP 402, r0013, r0014). It needs a paid top-up (T55).

`result.json` files with status `skipped` and these reasons exist for each of them and each song.

## For the film

| technique | stretch | show | play | settled by |
|---|---|---|---|---|
| h-03 (no hint) | standard, 0.0-15.0 s of the recording (= segment 0-15 s) | `experiments/standard/h-03/notes.csv` (string, fret) next to the truth `truth/standard/standard.truth.json`; its chords `chords.lab` (one C) against the truth's C F | `experiments/standard/h-03/render_mix.wav` 0-15 s (recording left, model right), or `render.wav` then the recording | the truth: onset F1 0.021, same string and fret 2 of 2 matched (by note order 37 of 37), chord root 0.530, key exact. How close it sounds is for the viewer's ear |
| h-03-hint (what the hint buys) | tuning, 35.0-45.0 s of the recording (= segment 10-20 s) | `experiments/tuning/h-03-hint/notes.csv` beside `experiments/tuning/h-03/notes.csv` and the truth; the no-hint answer says standard tuning with capo 0, the hint answer keeps D G C F A C | `experiments/tuning/h-03-hint/render_mix.wav` 35-45 s, then `experiments/tuning/h-03/render_mix.wav` 35-45 s (recording time) | the truth: same string and fret by note order 34 of 34 matched with the hint, 0 of 30 without; onset F1 0.023 with the hint, 0.052 without. The sound is for the ear |
| h-01 Klangio Guitar2Tabs | none (no output) | `experiments/capo/h-01/klangio_step5_rights_box.png` (the rights box that stopped the run); `klangio_step3_tuning_capo.png` (where tuning and capo would be set) | - | the record: not run |
| h-02 Fretwise | none (no output) | `experiments/capo/h-02/api_transcribe_response.json` (HTTP 403 "Please verify that you are human") | - | the record: not run |

The screenshots are of a third-party web page. Whether they may be shown in the film is for the producer to decide.

## After the audit (audit A, wording only)

- `audit-a.md` (2026-11-25) asked for neutral wording where this record spoke of a paid account's state: the h-08 line
  now reads "It needs a paid top-up (T55)." (agent audit-fix-a). No number changes. Audit B's fixes to this record are
  separate.

## After the audit (audit B)

Fixes by agent audit-fix-b, 2026-11-25, for `audit-b.md` problems 5 and 6.
- Problem 5. `gateway_trial.py` sends the media file's base name with the audio. In run 1 that name was
  `<S>.seg30.mono.wav`, which names the song's slot. All six calls were sent again (run 2) under the name `clip.wav`,
  with the same audio bytes (sha256 equal), prompt and schema (`request.json` of each run). Run 1 is kept in
  `<S>/<run>/run1-slotname/` (its two renders were deleted for disk: they can be re-made from its `notes.seg.csv`).
  The provider counted the same prompt tokens for all four names (624 without the hint, 695 / 688 / 691 with it;
  `meta.json` `usage`), so the name did not enter the model's input as text. The tables above are run 2; chain-4
  (step 9) was rebuilt from it. Two runs of the same request differ:

| run 1 -> run 2 | capo | tuning | standard |
|---|---|---|---|
| h-03: capo answered | 0 -> 3 | 3 -> 0 | 2 -> 0 |
| h-03: onset F1 | 0.010 -> 0.000 | 0.013 -> 0.052 | 0.008 -> 0.021 |
| h-03: same string and fret by note order, share of truth notes | 0.000 -> 0.000 | 0.000 -> 0.000 | 0.000 -> 0.296 |
| h-03-hint: onset F1 | 0.010 -> 0.000 | 0.029 -> 0.023 | 0.011 -> 0.024 |
| h-03-hint: same string and fret by note order, share of truth notes | 0.000 -> 0.000 | 0.236 -> 0.321 | 0.160 -> 0.112 |

- Problem 6. Run 1's `render.wav` and `render_mix.wav` were 30 s files in segment time while `notes.csv` is on the
  recording's timeline. Run 2's renders are made from `notes.csv` on the recording's timeline: 42.76 s (capo), 55.0 s
  (tuning) and 30.0 s (standard) long, the first t0 s silent in `render.wav` and recording-only in `render_mix.wav`
  (`render.log`: first onset 12.76 / 25.0 / 0.0 s). The film rows above give recording times.
- The per-window counts were made again for run 2 against today's segment truths. `work/exp-hosted/windows.json`
  (05:39) predates the standard segment truth of 07:59, which has 45 notes in 0-10 s, not 46.

