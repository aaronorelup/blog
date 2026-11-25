# Step 10. Hosted services that do the whole job in one call (`step-10-hosted`)

Run 2026-11-25 by agent `exp-hosted` on the box. Step 10 has no "A" entries. The three "B" entries (h-01, h-02, h-03)
were tried on all three songs. The "C" entries (h-04 to h-08) were not run. Free tiers cap the audio, so every run used
the 30 s segment (`$SEG`, or `$SEGM` for h-03) and was scored against the segment truth
`/home/user/gtv/work/exp-hosted/tr30/<S>.seg30.truth.json` (`crop_truth.py`, t0 = capo 12.76 s, tuning 25.0 s,
standard 0.0 s on the recording's timeline). The truth has no smaller `scored_range` than the whole piece.
Only the segments' sound left the box. No video was sent, and nothing about Aaron.

Per run: `/home/user/gtv/experiments/<S>/<exp>/` holds `result.json`, `cmd.sh`, `score.sh`, the raw output and the
canonical files. Scores are copied from the `gtr-eval` 0.12.1 outputs `score_*.json` in the same folder (eval ids in
`result.json`).

## What ran, and what did not

| exp | service | capo | tuning | standard | cost |
|---|---|---|---|---|---|
| h-01 | Klangio Guitar2Tabs web app, free tier (headless Chromium) | skipped: rights box | skipped: rights box | skipped: rights box | 0 |
| h-02 | Fretwise, guest access (headless Chromium) | failed: HTTP 403 "verify that you are human" | skipped (same block) | skipped (same block) | 0 |
| h-03 | MiMo v2.6 Flash via Vercel AI Gateway, one prompt for the whole tab, no hint | ran | ran | ran | USD 0.003738 |
| h-03-hint | the same with the true tuning and capo given in the prompt | ran (2nd try) | ran | ran | USD 0.010978 (incl. failed 1st try) |
| h-04 to h-08 | Klangio API, Songsterr AI, AnthemScore Web, AAPA AutoTabs, Gemini API | not run (C) | not run (C) | not run (C) | 0 |

Total spent in this step: USD 0.014716 (seven gateway calls; `meta.json` of each run, `cost_usd`).

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

One request per song and variant, to `xiaomi/mimo-v2.6-flash` through the research's `gateway_trial.py`.
The input was the 30 s mono segment, and the answer came back as JSON by schema. Prompt and schema:
`/home/user/gtv/work/exp-hosted/prompts/`. The prompt asks for the open strings, tuning name, cents, capo, key,
tempo, time signature, chord segments, and every note with onset, offset, pitch, string and fret (fret counted from the
capo). The hint variant adds one sentence with the true open strings and capo. `conv_h03.py` writes these files:
`notes.csv` and `chords.lab` on the recording's timeline, and `notes.seg.csv` and `chords.seg.lab` in segment time (these
are scored). Chord labels were converted to Harte, with the slash bass dropped. `render.wav` (FluidSynth, steel program 25)
and `render_mix.wav` (recording left, render right) are made from the notes. The gateway's answer has no beats, so
there is no `beats.txt`, and no GP5 was written. capo/h-03-hint's first try stopped at the 24576-token limit
(`finish_reason` "length", JSON not parsed, USD 0.006979, 87.4 s, kept in `attempt1/`). The result is the one identical
retry.

## Scores (h-03; 30 s segment; truth notes: capo 102, tuning 106, standard 125)

Notes, `gtr-eval notes --chroma` (onset F1 at 50 ms and 50 cents, with precision / recall; chroma = pitch class only):

| run | capo | tuning | standard |
|---|---|---|---|
| h-03 | 0.010 (0.010 / 0.010); chroma 0.040; 100 notes | 0.013 (0.019 / 0.009); chroma 0.038; 52 notes | 0.008 (0.009 / 0.008); chroma 0.034; 113 notes |
| h-03-hint | 0.010 (0.009 / 0.010); chroma 0.057; 108 notes | 0.029 (0.029 / 0.028); chroma 0.048; 104 notes | 0.011 (0.016 / 0.008); chroma 0.032; 64 notes |

Onset+offset F1 was 0.000 in every run except tuning/h-03-hint (0.010).

Tab, `gtr-eval tab` with the model's own tuning and capo: the share of matched notes with the same string and fret, then
the same share of all truth notes, then the share of truth notes matched at all. "order" is `--ignore-time`, which matches
by note order:

| run | capo | tuning | standard |
|---|---|---|---|
| h-03 | 0.000 / 0.000 (matched 0.010); order 0.000 / 0.000 | 0.000 / 0.000 (matched 0.009); order 0.000 / 0.000 | 0.000 / 0.000 (matched 0.008); order 0.000 / 0.000 |
| h-03-hint | 0.000 / 0.000 (matched 0.010); order 0.000 / 0.000 | 0.333 / 0.009 (matched 0.028); order 0.781 / 0.236 | 1.000 / 0.008 (matched 0.008, 1 note); order 0.769 / 0.160 |

Counts in "order" mode: tuning/h-03-hint 25 same string and fret of 32 matched, standard/h-03-hint 20 of 26, and
capo/h-03-hint 0 of 18 (string difference +1 in 17 of them, `string_difference_counts`). Without the hint: tuning 0 of 7, capo 0, standard 0.

Tuning and capo, `gtr-eval tuning` (truth: capo 3 / standard strings / +2 c; tuning 0 / D G C F A C / -9 c; standard
0 / standard / +6 c):

| run | capo | tuning | standard |
|---|---|---|---|
| h-03 | capo 0 (wrong); strings right; 12 c off | capo 3 (wrong); strings wrong (said standard); 9 c off | capo 2 (wrong); strings right; 9 c off |
| h-03-hint | capo 3 (right); strings right; 9 c off | capo 0 (right); strings right; 2 c off | capo 0 (right); strings right; 6 c off |

In the hint runs the capo and strings were given, so "right" there only shows that the model kept them.

Chords (`chords`: root / majmin share of time), key (`key`: mir_eval weighted score), tempo (`tempo`: deviation from
the truth's 76.56 / 65.73 / 76.14 BPM; none was within 4 % at any factor):

| run | capo | tuning | standard |
|---|---|---|---|
| h-03 | 0.103 / 0.103; key 0.0 (C minor vs Bb major); +20.2 % | 0.075 / 0.000; key 0.3 (F major vs D minor); +36.9 % | 0.446 / 0.446; key 1.0; +18.2 % |
| h-03-hint | 0.330 / 0.330; key 0.0 (Eb major); +17.6 % | 0.186 / 0.000; key 0.2 (D major); +27.8 % | 0.512 / 0.512; key 1.0; +26.1 % |

Chord labels returned (raw), against the truth's sequence:
- standard truth: C F C F ... h-03: C G/B alternating. h-03-hint: C F alternating.
- capo truth: Eb Bb Eb Cm ... h-03: Cm Ab Cm. h-03-hint: Eb Bb/D Cm Cm7 Bb Ab ...
- tuning truth: Bb/D C/E Gm Dm ... h-03: F F#dim Fm6 F/A ... h-03-hint: Dmaj7 Gmaj7 Am7 ...

Per 10 s window, the model's notes that have a truth note of the same pitch within 0.05 s, within 0.5 s, and of the same
pitch class within 0.5 s, are in `/home/user/gtv/work/exp-hosted/windows.json` (`windows.py`). For example, standard/h-03,
0-10 s: 36 notes against 46 in the truth. 0 match within 0.05 s, 8 within 0.5 s, and 22 match in pitch class within 0.5 s.

Run time and cost (API wall clock, no local cores; `meta.json`):

| run | capo | tuning | standard |
|---|---|---|---|
| h-03 | 14.1 s, USD 0.001304 | 69.2 s, USD 0.000772 | 91.8 s, USD 0.001662 |
| h-03-hint | 129.4 s, USD 0.001596 (+ failed 1st try 87.4 s, USD 0.006979) | 109.0 s, USD 0.001418 | 71.8 s, USD 0.000985 |

## Not run ("C", reasons copied from `experiments.json`)

- h-04 Klangio API: not possible. A Klangio API key comes after an application form and is not in the key store (T44).
- h-05 Songsterr AI: not possible. It needs an account by e-mail, and full songs need Songsterr Plus (T08).
- h-06 AnthemScore Web: not possible. It has a rights checkbox the permission system refused to tick for Aaron (FOR_AARON
  section 7, row 33).
- h-07 AAPA AutoTabs (tab from a video): not possible. It needs an account sign-up (T11).
- h-08 Gemini API (audio and video in one request): blocked. `GEMINI_API_KEY` is in the store, but its prepaid balance was 0
  (HTTP 402, r0013, r0014). It needs a top-up by Aaron (T55).

`result.json` files with status `skipped` and these reasons exist for each of them and each song.

## For the film

| technique | stretch | show | play | settled by |
|---|---|---|---|---|
| h-03 (no hint) | standard, 0.0-15.0 s of the recording (= segment 0-15 s) | `experiments/standard/h-03/notes.csv` (string, fret) next to the truth `truth/standard/standard.truth.json`; its chords `chords.lab` (C G/B) against the truth's C F | `experiments/standard/h-03/render_mix.wav` 0-15 s (recording left, model right), or `render.wav` then the recording | the truth: onset F1 0.008, same string and fret 0 of 1 matched, chord root 0.446, key exact. How close it sounds is for the viewer's ear |
| h-03-hint (what the hint buys) | tuning, 35.0-45.0 s of the recording (= segment 10-20 s) | `experiments/tuning/h-03-hint/notes.csv` beside `experiments/tuning/h-03/notes.csv` and the truth; the no-hint answer says standard tuning with capo 3, the hint answer keeps D G C F A C | `experiments/tuning/h-03-hint/render_mix.wav` 10-20 s, then `experiments/tuning/h-03/render_mix.wav` 10-20 s | the truth: same string and fret by note order 25 of 32 matched with the hint, 0 of 7 without; onset F1 0.029 vs 0.013. The sound is for the ear |
| h-01 Klangio Guitar2Tabs | none (no output) | `experiments/capo/h-01/klangio_step5_rights_box.png` (the rights box that stopped the run); `klangio_step3_tuning_capo.png` (where tuning and capo would be set) | - | the record: not run |
| h-02 Fretwise | none (no output) | `experiments/capo/h-02/api_transcribe_response.json` (HTTP 403 "Please verify that you are human") | - | the record: not run |

The screenshots are of a third-party web page. Whether they may be shown in the film is for the producer to decide.
