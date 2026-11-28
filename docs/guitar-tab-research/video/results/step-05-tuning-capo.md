# Step 5. Tuning and capo: results on the three recordings

Agent `exp-tuning`, 2026-11-25. Experiments `t-01` to `t-08` of `../experiments.json` on the songs `capo` (standard
tuning, capo 3, +2 cents), `tuning` (D2 G2 C3 F3 A3 C4, no capo, -9 cents) and `standard` (standard tuning, no capo,
+6 cents). Every number below comes from `/home/user/gtv/experiments/<S>/<exp>/` (`result.json`, `score_*.json`; eval
ids are gtr-eval 0.12.1 ledger ids). Scripts written for this step: `/home/user/gtv/work/exp-tuning/bin/`.
Truth note: the standard song's +6 cents is in doubt (the truth check measured +3.7 to +4.9);
see `/home/user/gtv/work/exp-tuning/TRUTH-DOUBTS.md`.

## The plain answers, next to the truth

Tuning as six open strings low to high, capo as a fret. "-" = the technique gives no answer of that kind.

| technique | capo (truth: capo 3, std) | tuning (truth: D G C F A C, no capo) | standard (truth: std, no capo) |
|---|---|---|---|
| t-01 librosa tuning offset | +3.0 c (truth +2) | -10.0 c (truth -9) | +3.0 c (truth +6) |
| t-02 lowest recurring note | D#2 A2 D3 G3 B3 E4, capo 0: **wrong** (6th string 1 semitone low; capo 3 missed) | D2 A2 D3 G3 B3 E4 (Drop D), capo 0: tuning **wrong** (5 strings), capo right | E2 A2 D3 G3 B3 E4, capo 0: right |
| t-02-hint (notes with the true range) | E2 A2 D3 G3 B3 E4, capo 2: tuning right, capo **wrong** (2 for 3) | Drop D again: **wrong** | standard, capo 0: right |
| t-03 MiMo, audio, capo question x3 | yes 1 / cannot_tell / yes 1: right 0 of 3 | yes 5 / no / yes 5: right 1 of 3 | no / yes 5 / cannot_tell: right 1 of 3 |
| t-03 MiMo, audio, tuning question x3 | Drop D capo 0 / std capo 3 / std capo 0: tuning right 2 of 3, capo right 1 of 3 | Drop D / std / std, capo 0 x3: tuning right 0 of 3, capo right 3 of 3 | std / std / std, capo 0 x3: tuning right 3 of 3, capo right 3 of 3 |
| t-04 MiMo, 30 frames (B) | capo yes, fret 2: **wrong**; tuning "cannot_tell" | no capo: right; "cannot_tell" | no capo: right; "cannot_tell" |
| t-05 OWLv2 "capo" boxes | present in 6 of 6 frames, fret 3: right (by under 1 px, see below) | present in 6 of 6 frames: **wrong** (boxes off the neck); no fret | absent (top score 0.11): right |
| t-06 SAM 3 (B) | not run | not run | not run |
| t-07 Opus 5.5 looking at frames | capo yes, fret 3: right; tuning guess E A D G B E: right | no capo: right; tuning guess E A D G B E: **wrong** (all six strings) | no capo: right; E A D G B E: right |
| t-08 chord sound - fingered shape (B, oracle shapes) | capo 3: right (84 % of chord time) | capo 0: right (61 %) | capo 0: right (54 %) |

What the wrong ones said instead: t-02 heard 37 notes at D#2 (Eb2) in the capo song, below the lowest note a capo-3
guitar can sound (G2), and read them as a lowered 6th string (`capo/t-02/lowest.json`); on the tuning song it found
the real D2 notes (53) and named Drop D, which gets the 6th string right and misses the five others (+2, +2, +2, +2,
+4 semitones). The tuning question to MiMo never named D G C F A C (Drop D once, standard twice). Opus 5.5 said the
tuning could only partly be told from pictures ("can_tell_from_picture": "partly"; "no" in the first run, which saw the end
card) and gave standard as its guess.

## Score tables (gtr-eval `tuning`)

### Capo fret (`capo_equal`; est = the technique's fret, 0 for "no capo")

| technique | capo | tuning | standard | eval ids |
|---|---|---|---|---|
| t-02 | false (0) | true (0) | true (0) | e2227, e2229, e2231 |
| t-02-hint | false (2) | true (0) | true (0) | e2228, e2230, e2232 |
| t-03 capo question, 3 tries | 0/3 (try 2 cannot_tell, not scored) | 1/3 | 1/3 (try 3 cannot_tell, not scored) | capo e3084/87, tuning e3089/91/93, standard e3095/97 |
| t-03 tuning question, 3 tries | 1/3 | 3/3 | 3/3 | capo e3085/86/88, tuning e3090/92/94, standard e3096/98/99 |
| t-04 (B) | false (2) | true (0) | true (0) | e2283, e2284, e2285 |
| t-05 | true (3) | not scored (said present, no fret) | true (0) | e2286, -, e2287 |
| t-07 | true (3) | true (0) | true (0) | e2272, e3083, e2274 |
| t-08 (B, oracle) | true (3) | true (0) | true (0) | e2288, e2289, e2290 |

### Open strings (`tuning_equal`; per-string difference est - truth, semitones, low string first)

| technique | capo | tuning | standard |
|---|---|---|---|
| t-02 | false [-1,0,0,0,0,0] | false [0,2,2,2,2,4] | true |
| t-02-hint | true | false [0,2,2,2,2,4] | true |
| t-03 tuning question, 3 tries | 2/3 (try 1 Drop D [-2,0,...]) | 0/3 (Drop D [0,2,2,2,2,4]; std [2,2,2,2,2,4] x2) | 3/3 |
| t-07 | true | false [2,2,2,2,2,4] | true |

t-01, t-04, t-05, t-08 give no open-string answer (t-04 answered "cannot_tell" on all three).

### Tuning offset (`difference_cents` = est - truth)

| technique | capo (truth +2) | tuning (truth -9) | standard (truth +6) |
|---|---|---|---|
| t-01 librosa.estimate_tuning, whole song | +1.0 (e2251) | -1.0 (e2252) | -3.0 (e2539) |
| t-03 tuning question, 3 tries | -17, -2, -14 | +9, +9, +9 (said 0 each time) | -12, -6, -8 |

## Runs: scope, time, cost

| exp | scope | time per song (capo / tuning / standard) | where |
|---|---|---|---|
| t-01 | whole song | estimate_tuning 0.53 / 0.64 / 0.57 s; whole librosa_run.py 8.0 / 8.0 / 7.5 s (gtr-run r0923, r0924, r0928, 2 cores) | box |
| t-02, t-02-hint | whole song (n-01 / n-01-hint notes) | under 1 s | box |
| t-03 | 30 s segment (`<S>.seg30.mono.wav`, sent as `clip.wav`) | 6 requests: 62.4 / 60.4 / 57.2 s API wall; USD 0.00049 / 0.00047 / 0.00046 | Vercel AI Gateway |
| t-04 | 30 s segment, 30 frames | 35.8 / 55.4 / 25.7 s; USD 0.0046 / 0.0124 / 0.0052 | Vercel AI Gateway |
| t-05 | 6 frames over the whole video | 62.1 / 47.3 / 45.8 s incl. model load (r0931, r0932, r0933, 2 cores; OWLv2 weights downloaded on the first run) | box |
| t-07 | 2 contact sheets (one frame every 10 s from 10 s) + 3 neck crops (25/50/75 %) | 64.5 / 37.3 / 67.5 s; USD 0.53 / 0.51 / 0.62 (session cost; tuning: the re-run without the end card) | separate Claude Code cloud session, model opus |
| t-08 | whole song | under 1 s | box |

## What failed or was changed, and why

- **t-07 route.** This session has no subagent tool, and `anthropic/claude-opus-5.5` on the Vercel AI Gateway answered
  HTTP 403 "Free tier users do not have access to this model" (`<S>/t-07/look/response.json`). The pictures were put
  on R2 under neutral letters (A = standard, B = capo, C = tuning; `scratch/look-e0e4a93fed89/`, 24 h signed links) and
  three new cloud sessions with model opus were each given one letter's links and `look_prompt.txt`, nothing else.
  Each used curl and Read only (0 web searches, 0 fetches) and its whole answer is in `<S>/t-07/look/session_answer.json`.
  Session A first got the word PLACEHOLDER by mistake and was sent the task as a second message. The tuning video
  shows its title and the player's name until about 6 s, so the contact sheets start at 10 s. In session C's
  pictures the last tile of contact sheet 2 was the video's end card, showing the creator's tab-website name (found by
  audit A); its notes call it "an end card with text that is not related to the capo or the tuning", with 0 web
  searches. The tuning look was re-run without that tile (see After the audit).
- **t-03.** In the first run three of the 18 requests (capo: capo2, tuning2; standard: tuning1) first failed with `requests`
  `ProxyError ... RemoteDisconnected('Remote end closed connection without response')`; sent again, all 18 answered.
  The re-run after the audit (audio named `clip.wav`) answered all 18 at the first try.
- **t-06 (B)** not run: result written by the GPU lane (`<S>/t-06/result.json`): the pod was refused by the
  permission system, and SAM 3 is gated with no Hugging Face token in the key store.
- **t-08 (B)** not run as planned: no tool here reads chord shapes from the video for every chord (w-05 wrote fingertip
  cells for 3 frames of one song; w-06 is a neck mask). Run instead with the truth's string and fret as the shapes,
  i.e. a perfect hand reader; only the chord tool's (c-04 lv-chordia) errors remain. Shape root = lowest shape note,
  so inverted chords vote wrong: capo song Eb:maj at 19.0-26.2 s votes 8.
- **t-05 fret** rests on under 1 px: the best capo box centre is 0.6 rectified px short of the w-05 grid's fret-3
  line (`capo/t-05/capo_answer.json`, grid `capo/w-05/hough/handoff_capo_f0000.json`). Its top capo scores (0.37 to
  0.48 in the capo song) overlap the false ones in the tuning song (0.27 to 0.33).
- **Hints.** Only t-02 takes one (Basic Pitch's frequency range from the true tuning and capo, run n-01-hint by the
  notes lane). The others are asked the very thing a hint would give, so no hint run.
- **t-02 capo reading** (lowest recurring L between 41 and 47 => capo L - 40) is glue added here; the plan's rule
  gives the tuning only.

## For the film

Times are seconds of `<S>.wav` / `<S>.mp4`. E = `/home/user/gtv/experiments`.

- **t-01, tuning song 25.0-45.0 s.** Gets right: -10 c against -9 (1 cent). Show a tuner needle at -10 next to -9;
  play `E/tuning/t-01/render.wav` (the six true open strings at -10 c, then at 0 c, 10 s) after the recording's
  25-45 s. Settled by the truth (a number). What it cannot say: which notes the strings are.
- **t-02, tuning song 57.0-77.0 s** (10 of its 53 D2 notes). Gets right: the low D2 is there. Gets wrong: Drop D,
  five strings off. Show the histogram from `E/tuning/t-02/lowest.json` (D2 53, E2 25, F2 14, G2 59 ...) next to the
  truth D G C F A C; play `E/tuning/t-02/render.wav` (recording left, the picked D2 notes right). Settled by the truth.
  Second stretch for the capo song, 129.0-149.0 s (7 of 37 D#2 notes): `E/capo/t-02/render.wav` plays notes a capo-3
  guitar cannot sound; for the ear.
- **t-03, capo song 12.76-32.76 s** (inside the segment it heard, 12.76-42.76). Same question, same audio, three
  answers: capo 1, cannot tell, capo 1 (`E/capo/t-03/summary.txt`, `capo{1,2,3}/answer.json`). Settled by the truth (0 of 3).
- **t-04, capo song 12.76-32.76 s** (its frames are `E/capo/t-04/frames/f_01..30.jpg` of the segment). Says capo
  at fret 2, citing a "3rd fret marker (two dots)" (`E/capo/t-04/answer.json`). Settled by the truth (wrong by 1).
- **t-05, tuning song, frame at 26.8 s** (show 20.0-40.0 s). Gets wrong: "capo" boxes at 0.27-0.33 in every frame,
  all off the played neck; capo song frame 32.6 s: the real capo boxed at 0.37. Show `E/tuning/t-05/owlv2/frames/f1.webp`
  beside `E/capo/t-05/owlv2/frames/f1.webp`. Settled by the truth.
- **t-07, capo song 50.0-70.0 s** (neck crop at 57.0 s, `E/capo/t-07/pics/neck_00570.jpg`). Gets right: capo 3,
  counted from the inlays with the nut out of frame. Then **tuning song 40.0-60.0 s** (crop `E/tuning/t-07/pics/neck_00468.jpg`):
  no capo right, tuning guessed standard, all six strings wrong. Show its own words from `look/session_answer.json`.
  Settled by the truth.
- **t-08, capo song 19.0-39.0 s.** Eb:maj with the shape's bass not the root votes capo 8 (19.0-26.2 s); the other
  chords vote 3; over the song 3 wins with 84 % of chord time (`E/capo/t-08/capo_votes.json`). Settled by the truth,
  with the caveat on screen that the shapes came from the answer key.

## After the audit

Fixes for `audit-a.md` (2026-11-25, agent audit-fix-a; work folder `/home/user/gtv/work/audit-fix-a/`, `PROGRESS.md`).
- **P1**: t-03's 18 requests sent the audio as `<S>.seg30.mono.wav`. Re-run with the same bytes named `clip.wav`
  (`bin/t03_rerun.sh`, `bin/t03_score.py`; first run in `<S>/t-03/named-file/`). Right of 3, old -> new (capo question;
  tuning question: strings, capo): capo 1; 2, 0 -> 0; 2, 1 (try 2 "cannot_tell"); tuning 2; 0, 2 -> 1; 0, 3; standard 1; 2, 3 ->
  1; 3, 3 (try 3 "cannot_tell"). The gateway counted 314 prompt tokens for every capo question and 403 for every tuning
  question, with either name and on every song (`work/audit-fix-a/prompt_tokens_old_vs_new.json`).
- **P2**: in the first tuning t-07 run the last tile of contact sheet 2 was the video's end card with the creator's
  tab-website name. Re-run with sheet 2 built from 130-170 s only (5 tiles; sheet 1 and the neck crops byte-identical),
  a new neutral R2 prefix and a new cloud session (model opus, `session_01UUo1x38XY4SNcHbcZdGnXC`, archived): Bash (curl) and
  Read only, 0 web searches, 0 fetches, USD 0.509, 37.3 s. Its answer, verbatim in `tuning/t-07/look/answer_raw.txt`: no
  capo (high), E2 A2 D3 G3 B3 E4 ("partly"). Same capo and strings as the first run, so the scores are unchanged (e3083,
  was e2273). First run in `tuning/t-07/endcard-run/`.
- **P7**: offset table, standard t-01: e2253 -> e2539 (current key, same -3.0 cents).
