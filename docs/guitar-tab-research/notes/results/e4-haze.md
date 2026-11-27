# N-E4: the haze, the intent reading of "Can we do a diffusion method like AO-087?"

Written 2026-11-27 by the N-E4 helper of the NOTES session (branch `research/guitar-notes`). Work folder, with every
script, run, score and log: `/home/user/notes/runs/e4/` (`PROGRESS.md`, `bin/`, `e4.json` with every number below,
`analysis.json`, `calib/`, `out/`, `referee/`, `templates/`, `logs/`). Film material:
`/home/user/notes/runs/<S>/haze/`. Handoff: `/home/user/gtv/notes/<S>/e4-haze/`. Nothing was downloaded or installed;
all code is new numpy, scipy, librosa and numba code in `bin/`.

## In short

- **The haze runs, and it is fast.** It starts at every candidate onset with every pitch the tuning and capo allow
  (24,622 to 38,006 candidates a song) and removes, round by round, what the recording does not support. A whole song
  takes 31 to 44 CPU seconds on 2 cores, plus 31 to 43 s once per song to fit the templates. It settles in 8 to 11
  rounds.
- **As a transcriber it loses to every guitar model, as the brief expected.** From every note (flat start, learned
  templates, range and strings rules, thresholds chosen leave-one-song-out): onset F1 **0.853 / 0.652 / 0.743**
  (capo / tuning / standard). It beats the bare KL-NMF arm of AO-082 (0.822 / 0.564 / 0.697) on all three songs. The
  best single tool scores 0.954 / 0.830 / 0.8955.
- **As the last note stage it does not earn its place.** Started from the 2-of-3 vote of fl, gaps-paper and Transkun
  (refinement only), it scores **0.9572 / 0.8142 / 0.9145** against the vote's 0.9572 / 0.8123 / 0.9209: +0.000,
  +0.002, -0.006. The gate was +0.01 with no song lower. Even thresholds picked on each song itself (an oracle) reach
  only +0.000, +0.004, -0.006.
- **The residual is no use as a per-bar picker or a referee.** Picking, per bar, the tool whose notes leave the least
  residual: 0.919 / 0.829 / 0.897. That is below the best single tool on capo and level elsewhere, while the per-bar
  oracle of the same four tools reaches 0.968 / 0.861 / 0.933. Its picks agree with the oracle's on 30, 40 and 33 % of
  bars (chance with four tools: 25 %). As a referee (keep a vote note only if removing it raises the residual), the
  leave-one-song-out choices keep every vote note on capo and tuning and lose 0.001 to 0.010 on standard: never better
  than the vote.
- **The calibration test fails, and the reason is structural.** The key's notes leave less residual than every
  tool's on at most 12 % (capo), 28 % (tuning) and 14 % (standard) of bars, not 90 %. Gains are fitted, so a list with
  extra notes can always explain a little more; a list equal to the key in a bar ties. What the templates can do is
  hear a missing note: where a tool misses a key note heard in the audio and invents nothing in that bar, the key's
  residual is lower on **93 % / 97 % / 84 %** of those bars. Where the missed note is tab-only, the residual mostly
  agrees with the tool (standard: the key wins 1 of 12 such bars).
- **The film has its centre.** For each 30 s segment: every round's candidates and weights, the first round in 2-update
  steps, a picture per round and per step, and FluidSynth renders where each candidate is as loud as its weight. The
  viewer sees a wall of 4,195 to 5,347 candidates thin to about 200 in two rounds, then settle; the segment scores
  0.874 / 0.681 / 0.855 at the end.

## Aaron's question, and this reading of it

In AO-087 a model's pad "opens as all the notes at once and thins out as the model makes up its mind", and another
model "never sees the notes, only the sound of the target tune", learning a volume per note by gradient descent on the
gap between its sound and the tune's. Here that becomes analysis by synthesis: every note the guitar could sound at
each moment starts on; a volume per note is fitted so the notes' sound matches the recording's; notes the recording
does not support fade out and are removed; notes the remaining gap asks for come back. Pitch and onset never move by
gradient (spectral losses give no useful onset or pitch gradient); notes are kept or removed as whole decisions, and
only volumes are fitted continuously. The app could show the candidates still standing after any round, and the user
could stop it and correct it there.

## How the haze works

**The picture it compares.** A constant-Q spectrogram of the recording: 16 kHz, 10 ms frames (the Riley rolls' grid),
36 bins an octave from C2 for 6.5 octaves (234 bins). `filter_scale` 0.5 keeps the bass windows near 0.4 s. The lowest
bin is moved by the song's tuning offset (capo +2, tuning -9, standard +6 cents). Magnitudes are compared with the KL
divergence D(V | Vhat), the usual NMF cost. `bin/common.py`.

**A note's sound (templates).** For each MIDI pitch 33 to 92: an event part of 38 frames (80 ms before the onset, for
the bass windows' smear, to 300 ms after) and a tail (one spectrum decaying by a fixed factor each frame, up to 2 s
more). Two sets:

- *FluidSynth* (`bin/templates.py`): each pitch rendered alone with FluidR3_GM (program 25 steel, 24 nylon;
  velocities 60, 90 and 115 averaged; reverb and chorus off), cut from the render's own CQT.
- *Learned* (`bin/learn.py`): the FluidSynth templates kept only near each partial (partials 1 to 30, +-2 bins), then
  fitted to the recording. Confident notes: fl and gaps-paper both have the note (same pitch within 50 ms) and their
  onset rolls average 0.6 or more. The model holds the 2-of-3 vote of fl, gaps-paper and Transkun, so the other notes'
  energy is explained, but only the confident notes update the templates. Each note's onset is first moved to the peak
  of its pitch's harmonic onset function within +-40 ms, so the templates are not tied to one tool's timing. No key is
  read.

| song | confident notes (fl and gaps-paper agree) | model notes | pitches fitted (4+ confident notes) | KL / sum V, start to end | CPU s | run |
|---|---|---|---|---|---|---|
| capo | 753 (of 805) | 821 | 10 (46 to 67) | 0.554 to 0.162 | 43.4 | r1520 |
| tuning | 364 (of 502) | 571 | 12 (38 to 62) | 0.591 to 0.173 | 31.0 | r1519 |
| standard | 528 (of 608) | 648 | 12 (43 to 64) | 1.662 to 0.317 | 32.6 | r1517 |

A pitch within 3 semitones of a fitted one borrows it, shifted 3 bins a semitone (16 to 19 pitches a song); the rest
(29 to 32, mostly above the songs' range) keep the masked FluidSynth template.

**The model** (`bin/model.py`). Each candidate k (a pitch at an onset frame) adds gain a_k times its event template and
b_k times its tail. Six smooth bands over log frequency, which cannot form a harmonic comb, take slaps; their
activations are allowed only within 50 ms of the v-03 HPSS percussive onsets. Smooth bands below the lowest playable
note take the body's rumble. Gains are fitted by KL multiplicative updates with the templates fixed. A zero gain stays
zero, so a removed candidate stays removed unless the add step brings it back. A sparsity term lam: a candidate keeps a
gain only where the recording holds about (1 + lam) times what the others already explain under its template.

**A candidate's weight.** The share of the recording's energy under the candidate's template that the fit gives to it,
from 0 to 1. It does not depend on loudness: a quiet melody note and a loud bass note can both reach 1, and a ghost an
octave above a real note gets only what the real note's template leaves.

**Candidates** (`bin/haze.py`). Onsets of fl, gaps, gaps-paper and Transkun plus librosa spectral-flux onsets on the
recording, merged within 30 ms. At each onset, every pitch the tuning and capo allow (capo 43 to 84: 42 pitches; tuning
38 to 80: 43; standard 40 to 84: 45), or 36 to 88 (53) in the condition without the range rule. Each candidate's frame
moves to the peak of its pitch's harmonic onset function within +-40 ms; two candidates of a pitch that then fall within
30 ms become one.

| song | onset clusters | of them flux only | flux onsets | candidates (range rule) | without range rule |
|---|---|---|---|---|---|
| capo, whole | 1,237 | 392 | 754 | 38,006 | 47,846 |
| tuning, whole | 966 | 288 | 498 | 30,721 | 37,732 |
| standard, whole | 751 | 198 | 391 | 24,622 | 28,936 |
| capo, 30 s | 163 | 48 | 101 | 5,271 | 6,633 |
| tuning, 30 s | 167 | 51 | 92 | 5,347 | 6,567 |
| standard, 30 s | 138 | 48 | 78 | 4,195 | 4,931 |

**Rounds.** Each round: 20 gain updates; then the weights; then removals. A standing candidate whose weight is under
0.15 goes. In round 1 a candidate goes if its partials hold no more energy in the 40 ms from its onset than in the 60
ms ending 20 ms before it (the attack rule: a note that only keeps ringing). With the strings rule, at each onset,
while the standing pitches cannot be played at once on distinct strings (frets from the capo to 20), the weakest goes.
Then the add test: a candidate not standing, with an attack, whose template-weighted mean of V/Vhat exceeds 1 +
lam_add (default 1.0), comes back, each at most once. A candidate ends the ringing tail of the same pitch before it
only once its weight has reached 0.3, so an unproven re-attack cannot take a ringing note's energy. The rounds stop
when one drops and adds nothing (at most 15); one more fit gives the final weights. The answer: candidates whose final
weight is at least theta.

**Starts.** *Flat*: every candidate the same gain. *Weighted*: gain by (votes + 4 x mean onset roll) / 8 + 0.01, votes
of the four tools at that pitch and onset, rolls of fl, gaps and gaps-paper. *Refine*: only the 2-of-3 vote of fl,
gaps-paper and Transkun starts on (the vote's notes are spared the attack rule); everything else starts at zero and can
enter only through the add test. The vote's own notes and the added ones get separate final thresholds.

**Fitting rule.** Each condition's free choices are lam (0.1 or 0.3) and its final threshold(s) (theta from 0.20 to
0.95 in steps of 0.05; for refine starts a keep threshold 0 to 0.6 and an add threshold 0.30 to 0.95 or never). For
each song they are chosen on the other two songs (best mean onset F1) and then applied to it. Every number of record
below is gtr-eval 0.12.1 `notes --no-ledger` on the notes so chosen (the per-song files are in `e4/loso/`). The 30 s
segments are scored from their own runs with the same choices.

**Not fitted, and how they were set.** Five structural rules came from reading the errors of early runs on the three
songs, not from any threshold search: the tail cut only by established candidates, the merging of same-pitch
duplicates, the share as the weight, the onset refinement, and the attack rule. The capo segment showed the first
three (most invented notes were second candidates of a ringing note, or duplicates 25 ms apart splitting one note's
weight). The attack rule came from a whole-song flat run on standard, where 211 of 324 invented notes were the same
pitch as a key note still sounding. Its threshold is 1.0 (no rise at all), not a fitted value. These rules were seen
working on the songs they are scored on, so the haze numbers are slightly optimistic. The ablation without the attack
rule is in the conditions table.

## 1. Calibration: does the key leave less residual than every tool?

`bin/calib.py`. For each note list (the key, the key's heard notes only, fl, gaps, gaps-paper, Transkun, YourMT3+,
Basic Pitch, and the vote of fl, gaps-paper and Transkun), its notes are the model's only candidates. Gains are fitted
(100 updates, sparsity lam). A bar's residual is D(V | Vhat) over its frames divided by its sum of V. Bars are the
keys' downbeats (73, 50 and 57 windows with the pickup). Runs: r1504, r1500, r1499 (first FluidSynth pass), r1524
(capo), r1522 (tuning), r1529 (standard).

**Share of bars where the key's residual is below every one of the six tools'** (the brief's test: 90 % needed):

| templates, sparsity, onsets | capo | tuning | standard |
|---|---|---|---|
| FluidSynth, lam 0, as listed | 0.000 | 0.080 | 0.000 |
| FluidSynth, lam 0.2, refined +-40 ms | 0.000 | 0.080 | 0.000 |
| learned at the tools' onsets, lam 0.2 | 0.000 | 0.020 | 0.140 |
| learned (refined onsets), lam 0 | 0.027 | **0.280** | 0.088 |
| learned, lam 0.2 | 0.041 | 0.260 | 0.088 |
| learned, lam 1.0 | **0.123** | 0.180 | **0.140** |

Every improvement to the templates helped: learning them from the recording, then freeing them from the tools'
timing. Neither got near 90 %, and the reason is in the test, not only the templates. Split each tool's bars by how its
notes differ from the key's there (gtr-eval's one-to-one matching), and pool the six tools (learned templates, lam 0;
`calib/why.learned-lam0-ref4.json`):

| kind of bar | capo: bars, key lower | tuning | standard |
|---|---|---|---|
| tool equal to the key | 90, 61 % | 7, 86 % | 50, 68 % |
| tool only adds notes | 159, 23 % | 5, 40 % | 60, 53 % |
| tool only misses key notes, at least one heard | 29, **93 %** | 30, **97 %** | 49, **84 %** |
| tool only misses tab-only key notes | 7, 86 % | 1, 0 % | 12, 8 % |

- **Equal bars are coin flips.** The residuals then differ only by onset timing details, so "lower than every tool"
  fails wherever one tool is right.
- **Extra notes always help a fitted model.** With lam 0 a superset of the key cannot leave more residual. Sparsity
  (lam 1.0) lets the key win more of those bars (capo 48 %), but it then loses some bars it should win (only-missed: 64
  % on capo).
- **A missing heard note is seen.** On bars where a tool misses heard key notes and adds nothing, the key wins 93 % and
  97 % on the steel capo song and the nylon song, 84 % on standard.
- **The residual agrees with the keys' doubts.** On standard, where the tool misses only tab-only notes, it sides with
  the tool on 11 of 12 bars. It also flags capo bars 26, 48 and 64 (one repeated phrase). There gaps-paper hears a
  chord 0.58 s before the key places it, and its residual is lower by 0.058 to 0.059 of the bar's energy (key 0.215 to
  0.221). That is a lead for the ear check, not a finding.

So the test cannot pass with fitted gains, whatever the templates. The haze below uses the learned templates.

## 2. Results

Onset F1, gtr-eval 0.12.1, thresholds chosen leave-one-song-out (LOSO); "30 s" is the film segment from its own run.

| method | capo | tuning | standard | mean | 30 s: capo / tuning / standard |
|---|---|---|---|---|---|
| best single tool (gaps-paper, gaps, gaps-paper; part 1) | 0.954 | 0.830 | 0.8955 | 0.893 | 0.946 / 0.807 / 0.996 |
| 2-of-3 vote fl, gaps, Transkun (part 1) | 0.953 | 0.818 | 0.925 | 0.899 | 0.976 / 0.825 / 1.000 |
| 2-of-3 vote fl, gaps-paper, Transkun (the refine start) | 0.9572 | 0.8123 | 0.9209 | 0.897 | 0.955 / 0.816 / 0.996 |
| AO-082 bare arm's KL-NMF (brief) | 0.822 | 0.564 | 0.697 | 0.694 | |
| **haze, flat start**, learned, strings | **0.8532** | **0.6516** | **0.7433** | 0.749 | 0.874 / 0.681 / 0.855 |
| haze, weighted start, learned, strings | 0.8705 | 0.6704 | 0.7588 | 0.767 | 0.882 / 0.707 / 0.859 |
| **haze, refine start**, learned, strings | **0.9572** | **0.8142** | **0.9145** | 0.895 | 0.955 / 0.822 / 0.992 |

Every condition (gtr-eval, LOSO):

| start, templates, rules | capo | tuning | standard | mean | chosen lam, theta (capo, tuning, standard) |
|---|---|---|---|---|---|
| flat, FluidSynth, strings | 0.6166 | 0.4290 | 0.3270 | 0.458 | 0.1; 0.55, 0.5, 0.5 |
| weighted, FluidSynth, strings | 0.6736 | 0.4988 | 0.3474 | 0.507 | 0.1; 0.55, 0.5, 0.55 |
| refine, FluidSynth, strings | 0.9367 | 0.7884 | 0.7746 | 0.833 | 0.1; keep 0, add 0.9 / 0.95 |
| flat, learned, no range or strings rule | 0.8484 | 0.6604 | 0.7242 | 0.744 | 0.3; 0.55, 0.55, 0.5 |
| flat, learned, range rule | 0.8537 | 0.6673 | 0.7430 | 0.755 | 0.3; 0.5 |
| flat, learned, range and strings | 0.8532 | 0.6516 | 0.7433 | 0.749 | 0.3; 0.5, 0.55, 0.5 |
| flat, learned, range and strings, no attack rule | 0.8087 | 0.6336 | 0.6830 | 0.708 | 0.3; 0.5, 0.55, 0.5 |
| weighted, learned, strings | 0.8705 | 0.6704 | 0.7588 | 0.767 | 0.3; 0.5, 0.55, 0.5 |
| refine, learned, no range or strings rule | 0.9538 | 0.8143 | 0.9040 | 0.891 | 0.1 |
| refine, learned, range rule | 0.9572 | 0.8136 | 0.9134 | 0.895 | 0.1 |
| refine, learned, strings, add at 1 + 0.5 | 0.9520 | 0.8130 | 0.9040 | 0.890 | 0.3 |
| refine, learned, strings, add at 1 + 1.0 | 0.9572 | 0.8142 | 0.9145 | 0.895 | 0.1; keep 0, add 0.95 |
| refine, learned, strings, add at 1 + 2.0 | 0.9552 | 0.8123 | 0.9135 | 0.894 | 0.3 |
| refine, learned, strings, no add | 0.9553 | 0.8143 | 0.9135 | 0.894 | 0.3; keep 0.2, 0, 0.2 |

What the table says:

- **Templates matter most.** Fitted to the recording, the flat haze rises from 0.458 to 0.749 mean; FluidSynth's
  guitar is too far from these guitars.
- **The attack rule is worth 0.04** (0.708 to 0.749 mean). Without it most invented notes are a ringing note
  re-attacked at a later onset.
- **The range rule helps a little** (0.744 to 0.755 flat, 0.891 to 0.895 refine). **The strings rule adds nothing**
  over it (0.749 flat, 0.895 refine, both tied or 0.006 lower). At these candidate onsets, chords that cannot be
  played are rarely what survives.
- **Starting weights help the haze but not past the tools.** Weighted beats flat by 0.018. Refine is the vote again:
  LOSO picks "keep every vote note the rounds kept, add almost nothing" (add threshold 0.95: 0 notes added on any
  song).
- **What refinement removes is not mostly wrong.** In round 1 the refine start dropped 3 vote notes on standard (all 3
  had a key note there) and 14 on tuning (7 had). The vote alone is the better list.
- **The flat haze's weak side is the nylon song, as for every tool.** Recall 0.553 on tuning (0.874 capo, 0.753
  standard). Below E3 it finds 46 % of the key's notes, above 59 %. Its invented notes at the chosen theta: capo 142
  (51 the same pitch as a key note still sounding, 46 a fifth or fourth, 27 an octave or twelfth of a key note);
  tuning 90 (69 still sounding); standard 185 (74 still sounding, 55 octave or twelfth). From `bin/diag.py`.

### Per round

Flat start, learned templates, range and strings rules, lam 0.3, theta as chosen LOSO (capo 0.5, tuning 0.55,
standard 0.5). "Dropped" and "added" count candidates; "right" means the key has a note of that pitch within 50 ms (a
count, not gtr-eval's one-to-one matching). F1 is of the candidates standing at or above theta after that round's fit.

| round | capo: standing, F1, dropped (right), added (right) | tuning | standard |
|---|---|---|---|
| 0 | 38,006, 0.042 | 30,721, 0.038 | 24,622, 0.052 |
| 1 | 38,006, 0.711, -36,525 (71) | 30,721, 0.416, -29,909 (237) | 24,622, 0.673, -23,438 (130) |
| 2 | 1,481, 0.842, -168 (9), +460 (6) | 812, 0.634, -109 (18), +1,146 (45) | 1,184, 0.753, -114 (6), +606 (18) |
| 3 | 1,773, 0.854, -329 (4), +168 (0) | 1,849, 0.636, -916 (13), +341 (4) | 1,676, 0.751, -320 (7), +90 (2) |
| 4 | 1,612, 0.854, -131 (1), +31 (0) | 1,274, 0.646, -264 (4), +62 (0) | 1,446, 0.745, -63 (1), +14 (0) |
| 5 | 1,512, 0.854, -30 (2), +10 (0) | 1,072, 0.647, -59 (0), +17 (0) | 1,397, 0.744, -14 (1), +5 (0) |
| 6 to the end | 1,478, 0.853 (round 9) | 1,005, 0.652 (round 12) | 1,388, 0.743 (round 10) |

Almost everything happens in round 1: 95 to 97 % of the candidates go, among them 71, 237 and 130 that had a key note. The
add test then brings back 460 to 1,146 candidates, of which 6, 45 and 18 had a key note; later rounds remove most of
them again. On the nylon song round 1 removes 237 candidates with a key note, which is most of what its recall lacks.

On the 30 s segments (the film's runs): F1 by round 0.038, 0.616, 0.827, **0.877**, 0.874 ... 0.874 (capo); 0.036,
0.417, **0.693**, 0.674, 0.678, 0.681 ... 0.681 (tuning); 0.058, 0.769, 0.859, **0.864**, 0.854, 0.855 ... 0.855
(standard). Each settles one round after its best.

Refine start (lam 0.1, keep 0, add 0.95), whole songs: F1 stays 0.957 on capo every round. Tuning goes 0.815, 0.815,
0.813, 0.814 ... 0.814; standard 0.918, 0.918, 0.915, 0.914 ... 0.914. Round 1 adds 931, 759 and 848 candidates, of
which 8, 9 and 18 had a key note. Every per-round table for five conditions is in `e4.json` under `curves`.

## 3. The residual as a picker and as a referee

**Picker** (`bin/analyze.py`, residuals from `calib/`). Per bar, the tool whose notes leave the least residual; the
residual's configuration is chosen LOSO (it chose learned, lam 1.0 for every song). The oracle picks, per bar, the tool
with the most found minus invented notes (it reads the key).

| tools to pick from | capo | tuning | standard | bars where the pick equals the oracle's |
|---|---|---|---|---|
| fl, gaps, gaps-paper, Transkun: residual pick | 0.9194 | 0.8293 | 0.8968 | 30 / 40 / 33 % |
| the same: per-bar oracle | 0.9675 | 0.8614 | 0.9330 | |
| the five step-2 tools: residual pick | 0.8415 | 0.7943 | 0.7997 | 23 / 34 / 19 % |
| the same: per-bar oracle | 0.9529 | 0.8569 | 0.9247 | |
| the four tools and the vote: residual pick | 0.9188 | 0.8253 | 0.9001 | 19 / 32 / 28 % |
| the same: per-bar oracle | 0.9687 | 0.8614 | 0.9373 | |

The oracle's gain over the best of the four tools is +0.014 / +0.032 / +0.038; the residual pick captures -0.034 /
-0.001 / +0.001 of it. Among the five step-2 tools it picks Basic Pitch in 19, 4 and 15 bars: more notes, less
residual. For E3: a residual shown to Opus will favour lists with more notes; it can show where a heard note is
missing, not which list is right.

**Referee** (`bin/referee.py`, runs r1531, r1540, r1541). One fit of every note any of fl, gaps-paper and Transkun has
(E0's clustering, k = 1). For each note: its removal cost (the rise of D(V | Vhat) when only it is taken out, per unit
of its predicted mass) and its share. Rules: keep a vote note (2 or 3 tools) if its cost or share is above x; also add a
1-tool note if above y. x and y chosen LOSO.

| referee (x, y as chosen for that song) | capo | tuning | standard |
|---|---|---|---|
| the vote it starts from | 0.9572 | 0.8123 | 0.9209 |
| cost, learned templates, lam 0, remove only | 0.9572 (x 0) | 0.8123 (keep all) | 0.9176 (x 0.1) |
| cost, learned, lam 0, remove and add | 0.9572 | 0.8123 | 0.9148 (x 0.1, y 2.4) |
| cost, learned, lam 0.3, remove only | 0.9572 (x 0.1) | 0.8123 | 0.9201 (x 0.1) |
| cost, learned, lam 0.3, remove and add | 0.9572 | 0.8123 | 0.9166 (y 2.8) |
| cost, FluidSynth, lam 0, either rule | 0.9572 | 0.8123 | 0.9209 (keep all, add none) |
| share, any templates, remove only | 0.9572 | 0.8123 | 0.9209 (keep all) |
| share, any templates, remove and add | 0.9572 | 0.8123 | 0.9113 to 0.9202 (adds above 0.85 to 0.95) |

No referee rule lifts any song. Notes outside the template range (MIDI 29 and 96 among Transkun's) are kept if they
are vote notes and never added. The removal cost and the share separate right from wrong among 1-tool notes on the
capo segment (median share 0.84 for right notes, 0.48 for wrong), but not well enough to add any on whole songs.

## 4. CPU

All timed jobs ran through `gtr-run --lane notes` on one 2-core slot; the box was shared (load 3.9 to 5.9).

| job | per song | runs |
|---|---|---|
| CQT of a whole song | about 1 s | |
| templates fitted to the song (12 loops) | 31 to 43 CPU s | r1517, r1519, r1520 |
| haze, flat start, whole song | 31 to 44 CPU s (18 to 25 s wall), 8 to 11 rounds | in r1539, r1542, r1549 |
| haze, refine start, whole song | 26 to 29 CPU s | same |
| haze, 30 s segment | 9 to 17 CPU s | in r1534, r1535, r1544 |
| calibration, nine lists, one configuration | 72 to 125 CPU s | r1522, r1524, r1529 |
| all 25 haze conditions, whole song | 833 to 1,058 CPU s | r1539, r1542, r1549 |

So one haze run costs about 1 to 1.5 CPU minutes a song, with the templates. The tools' rolls it reads are from part 1.

## 5. For the film

The film's runs: flat start, learned templates, range and strings rules, lam 0.3 (the LOSO choice), on each 30 s
segment (capo from 12.76 s, tuning from 25.0 s, standard from 0.0 s), saved again with `--snap 2` (identical weights,
checked). `bin/film.py`. In `/home/user/notes/runs/<S>/haze/`:

- `rounds.npz`: `onset` (s, 0 = segment start), `pitch` (MIDI), `weight` (rounds x candidates; row 0 the start, then
  each round's weights before its removals, the last row the final fit), `weight_steps` (round 1 after every 2 of its
  20 updates) with `step_iter`, `theta`, `f1_at_theta` per round.
- `round_<k>.png` for every round and `step_<n>.png` for round 1 after n updates: pitch by time over the recording's
  CQT, each candidate a short bar whose opacity is its weight.
- `round_<k>.wav` for rounds 0, 1, 2, the middle and the last; `step_04.wav` and `step_10.wav`: FluidR3_GM (program 25
  steel, 24 nylon) at 48 kHz stereo, 24-bit, on the segment's clock. Every standing candidate sounds at its onset at its
  weight times the note's amplitude, until the next standing candidate of its pitch or 1.2 s. Each file is scaled to a
  -1 dBFS peak; the scale is in `film.json` (round 0 needs 0.60 to 0.73, the last round 2.6 to 3.7, so on one scale the
  final round is 12 to 14 dB quieter than the start).

| segment | candidates | rows (start, rounds, final fit) | weight above 0.01 after 0, 4, 10, 20 updates of round 1 | standing in rows 1, 2 and the last (row 1 is before round 1's removals) | at or above theta, last row | F1 by row |
|---|---|---|---|---|---|---|
| capo | 5,271 | 8 | 5,271, 3,142, 1,674, 993 | 5,271, 197, 201 | 104 | 0.04, 0.62, 0.83, 0.88, then 0.874 |
| tuning | 5,347 | 10 | 5,347, 2,827, 1,365, 785 | 5,347, 142, 172 | 76 | 0.04, 0.42, 0.69, 0.67, then 0.681 |
| standard | 4,195 | 10 | 4,195, 2,614, 1,398, 907 | 4,195, 231, 263 | 130 | 0.06, 0.77, 0.86, 0.86, then 0.855 |

**What a viewer would see.** Round 0 is a solid wall: every pitch from the lowest open string to fret 20 lit at every
onset, about 160 columns in 30 s. Through round 1's twenty updates the wall goes transparent from the top and the
middle. By 4 updates (capo) 3,142 candidates are still visible, by 10 updates 1,674. The bars that stay dark sit on the
dark lines of the recording's spectrogram: the bass notes and the melody, with fainter columns where slaps hit.
After round 1's removals about 200 bars are left; round 2 adds back a scatter of faint bars, mostly a fifth or octave
above real notes, and round 3 takes most of them away again. From then on the picture hardly moves. On the nylon song
some of the long bass notes the spectrogram plainly shows stay pale or vanish: the method's weak spot, in plain view.

**What a viewer would hear.** Round 0 is a dense cluster chord on every onset, all pitches at once, in the song's
rhythm. Round 1 is the same rhythm with a soft cloud in which the loudest notes already outline the bass and the tune.
By round 2 it is recognisably the piece, with stray fifths and octaves and some re-struck notes. The last round is the
piece with a few wrong notes and, on the nylon song, missing bass.

## Handoff for LOOP

`/home/user/gtv/notes/<S>/e4-haze/notes.csv` (onset, offset, pitch, support, conf) and `source.json`, from the best
condition by mean LOSO F1: refine start, learned templates, range and strings rules, thresholds chosen on the other two
songs. `support`: how many of fl, gaps, gaps-paper and Transkun have the pitch in the candidate's onset cluster (0 to
4). `conf`: the final weight (0 to 1). In plain terms it is the 2-of-3 vote of fl, gaps-paper and Transkun with the
notes the haze dropped removed (2, 18 and 6) and nothing added: 819 / 551 / 642 notes, F1 0.9572 / 0.8142 / 0.9145.
The vote itself scores higher on standard, so LOOP should treat this list as the vote with a confidence per note, not
as a better list. `conf` is the useful part: low values mark the vote notes the recording supports least.

## What is uncertain

- **Three songs, one fitting rule.** Thresholds were chosen LOSO, but the structural rules (section "Not fitted")
  were found on these songs' errors. A held-out song could do worse.
- **The templates.** Only 10 to 12 pitches a song had enough confident notes to be fitted; the rest borrow or keep
  FluidSynth's. The tail decay is FluidSynth's, the same for every song. A better note model (per-string templates,
  fitted decay, inharmonicity) might lift the flat haze; nothing here suggests it would lift the refinement past the
  vote, since even thresholds chosen on each song itself do not.
- **The calibration's 90 % test** compares fitted explanations, where more notes always help. A test with fixed
  per-note gains, or a per-note cost set on other material, would be fairer. It was not run.
- **"Right" in the per-round counts** means a key note of that pitch within 50 ms, not gtr-eval's one-to-one match.
  Tab-only key notes count as right.
- **The keys' own doubts** (tab-only notes; the tuning song's onsets about 30 ms after every tool's) limit any
  residual test. The capo bars 26, 48 and 64 are worth an ear check.
- **Small things.** Two whole-song referee runs (r1532, r1533) failed on notes outside the template range (MIDI 29 and
  96) and were rerun (r1540, r1541) with such notes kept as they are; the wrapper reported exit 0 for the failed runs.
  The refine start's candidate times are the tools' median per pitch in the 30 ms cluster, not the vote's own times,
  which costs the vote 0.003 on standard before any round.

## Files

| path | what |
|---|---|
| `/home/user/notes/runs/e4/bin/` | `common.py`, `templates.py`, `learn.py`, `model.py`, `calib.py`, `calib_why.py`, `haze.py`, `grid_haze.sh`, `referee.py`, `analyze.py`, `collect.py`, `film.py`, `handoff.py`, `diag.py`, `jump.py`, `evalr.py` |
| `/home/user/notes/runs/e4/e4.json` | every number here: calibration, every condition with gtr-eval of record, per-round curves, picker, referee, gtr-run ledger rows, film and handoff facts |
| `/home/user/notes/runs/e4/analysis.json` | the LOSO choices and grids |
| `/home/user/notes/runs/e4/out/<S>[.seg30]/<condition>/` | each run: `rounds.npz` (onset, frame, pitch, votes, roll, weight per round, jump, first_live), `meta.json` |
| `/home/user/notes/runs/e4/out/v1-nojump/`, `out/dev/` | development runs before the attack rule (not of record) |
| `/home/user/notes/runs/e4/templates/` | `fs-steel.npz`, `fs-nylon.npz`, `learned-<S>.npz` and `.json` |
| `/home/user/notes/runs/e4/calib/` | per-bar residuals per list and configuration; `why.*.json`, `why-heard.*.json` |
| `/home/user/notes/runs/e4/loso/`, `picker/`, `referee/out/` | the scored note lists of record |
| `/home/user/notes/runs/<S>/haze/` | film: `rounds.npz`, `round_<k>.png/.wav`, `step_<n>.png/.wav`, `film.json` |
| `/home/user/gtv/notes/<S>/e4-haze/` | handoff for LOOP |

## Checker

An independent check, 2026-11-27, by the check-e4 helper of the NOTES session. Own code in
`/home/user/notes/runs/check-e4/` (`bin/score.py`, `bin/myvote.py`, `bin/refit.py`, `bin/picker.py`); every number
below is in `check-e4.json` there. Scoring: my own mir_eval call (onset only, 50 ms, 50 cents, offsets ignored). The
segment keys were cropped again with `crop_truth.py` and equal the job's.

**What holds.**

| check | result |
|---|---|
| all 42 whole-song LOSO lists (14 conditions x 3 songs), rescored | every F1 equals gtr-eval's to 4 decimals |
| the 42 segment lists | equal to the 30 s figures in the results table (flat 0.874 / 0.681 / 0.855, weighted 0.882 / 0.707 / 0.859, refine 0.955 / 0.822 / 0.992) |
| LOSO choice redone from the runs' final weights (flat, learned, strings; refine, learned, strings, add 1.0) | same lam and thresholds on every song, same F1 |
| "thresholds picked on each song itself" | an oracle, labelled; reproduced: +0.000 / +0.004 / -0.006 over the vote |
| per-round F1 and candidates standing (flat, whole songs) | equal; round 1 drops 36,525 / 29,909 / 23,438, of them 71 / 237 / 130 with a key note |
| calibration shares from the per-bar residuals | equal (best 0.123 / 0.280 / 0.140) |
| residual picker and per-bar oracle (my own oracle code, same bar windows) | 0.9194 / 0.8293 / 0.8968 and 0.9675 / 0.8614 / 0.9330: equal; LOSO again picks learned, lam 1.0 |
| run ids | all 20 in the gtr-run ledger, lane notes, exit 0; CPU seconds match |
| handoff | three `notes.csv` with onset, offset, pitch, support, conf; equal to the LOSO refine lists; conf 0.15 to 1.00, no gaps; `source.json` present |
| film | `rounds.npz` weights equal the run of record; renders 48 kHz stereo 24-bit, 30 s |
| this file | numbers only: no note rows, tab text, links, hosts or keys; the never-publish scan finds nothing |
| key use in the method | none: the key's notes are read only for scoring and the "right" counts |

**Corrected in this file.** The CPU table said "8 to 12 rounds"; the runs settle in 8, 11 and 9 rounds (capo, tuning,
standard). The per-round table's "round 9 / 12 / 10" counts rows: the last row is the extra final fit.

**Read with care.**

- **The refine gain on tuning is within the vote's own noise.** My own 2-of-3 vote of fl, gaps-paper and Transkun
  (nearest same-pitch note of each other tool within 50 ms, mean onset) scores 0.9572 / 0.8140 / 0.9209. Against it the
  refine start's +0.002 on tuning becomes +0.000. On heard notes only (key notes not marked tab-only): refine 0.9316 /
  0.8275 / 0.8816, my vote 0.9317 / 0.8252 / 0.8855. The verdict stands: no gain.
- **Handoff counts.** On tuning the refine start has 569 candidates, not the vote's 571: 2 same-pitch notes merged
  before any round. Then 18 are dropped, giving 551. Capo drops 2 (819); standard drops 6 (642). Nothing is added.
- **"Captures -0.034 / -0.001 / +0.001"** are F1 differences between the residual pick and the best of the four tools.
  As shares of the oracle's gain (+0.014 / +0.032 / +0.038) that is -2.4 / -0.03 / +0.03: none.
- **Choices made on all three songs, not LOSO.** Thresholds and lam are LOSO. These are not: which condition is the
  headline and which is the handoff (best mean LOSO F1 across the three songs); the add-rule variant (1 + 0.5, 1.0,
  2.0); fixed constants (20 updates a round, the drop at 0.15, the tail-cut weight 0.3, the merge at 30 ms, the
  weighted start's (votes + 4 x roll) / 8). None were tuned against the key, but they were chosen while looking at these
  songs. The differences between those variants are 0.001 to 0.005 mean F1, too small to change any verdict.
- **Song facts read from the key file.** The bars for the picker and the calibration are the key's downbeats, and the
  constant-Q grid is moved by the key file's cents offset (+2 / -9 / +6). The app would get both from LOOP (beats,
  tuning finder). They place the grid; they choose no notes.
- **Calibration on heard notes only.** With the key's tab-only notes removed, the key wins at most 0.205 / 0.200 /
  0.228 of bars: still far from 90 %. The record's reading holds.
- **CPU.** "About 1 to 1.5 CPU minutes a song" is the haze alone. Its candidate onsets and the weighted start need fl,
  gaps, gaps-paper and Transkun first: 100 to 185 s wall each on 2 cores (step 2).
- **Segment baselines.** The 30 s "best single tool" row is cropped from whole-song runs. gaps run on the tuning
  segment alone scores 0.815, not 0.807. The haze segment numbers come from segment runs.
