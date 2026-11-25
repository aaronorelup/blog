# Step 3. Melody, bass and percussive taps from one guitar

Agent exp-voices, 2026-11-25. Techniques v-01 (A), v-02, v-03, v-04 (B) of `../experiments.json`, plus `v-01-hint`.
v-05 and v-06 are "C": not run. Every run on the whole song (none needed the 30 s segment), 2 cores through
`gtr-run`. Folders: `/home/user/gtv/experiments/<S>/<exp>/` (`cmd.sh`, `score.sh`, `result.json`). Work folder,
scripts and progress log: `/home/user/gtv/work/exp-voices/`.

What the truth holds for this step (`/home/user/gtv/truth/<S>/<S>.truth.json`):

| song | truth voices (melody / bass / chord) | truth taps (kinds) | scored here |
|---|---|---|---|
| capo | 573 / 202 / 40 | 258 (96 string-slap, 146 thump, 16 body-slap) | voices and taps |
| tuning | 384 / 97 / 147 | 0 (the handwritten tab marks none) | voices only; taps run for the viewer's ear |
| standard | 313 / 274 / 92 | 211 (93 string-slap, 118 thump) | voices and taps |

The truth voices are derived by a rule, not written by the arrangers: per event, the highest note on strings 1-3 is
melody, the lowest on strings 4-6 is bass (`../truth-capo.md` line 83, `../truth-standard.md` line 102). A pitch
threshold is close to that rule, which is part of why v-01 scores high. Voice scores leave the 279 chord-voice notes out.

## Runs

| exp | what ran | input | runs (wall s, 2 cores) |
|---|---|---|---|
| v-01 | `voice_split.py` (gtv copy), B1 threshold MIDI 55 (G3) and B2 lowest note per onset | n-01 Basic Pitch `notes.csv`, no hint | r0937 capo 13.04, r0940 tuning 8.49, r0943 standard 8.45 (whole script, all methods) |
| v-01 extra | the same methods on the truth notes with labels removed (`v-01/truthnotes/`) | truth notes | r0939 6.64, r0942 4.26, r0945 4.77 |
| v-01-hint | B1 with the threshold at open string 3 of the true tuning + capo: capo 58, tuning 53, standard 55 (= no hint) | n-01 notes | r0938 12.13, r0941 8.40, r0944 7.98 |
| v-02 | partitura 1.9.0 `estimate_voices` (P1 poly, P2 mono), same run as v-01; voices mapped without truth: highest mean pitch = melody, rest bass | n-01 notes | as v-01 |
| v-03 | librosa HPSS (default; also margin 3), onsets of the percussive part (`scripts/hpss_perc.py`) | `<S>.wav` | r0965 capo 143.95, r0969 tuning 133.02, r0974 standard 106.90 (both settings) |
| v-04 | Demucs htdemucs_6s, onsets of the drums stem (`onsets_of_stem.py`) | `<S>.wav` | r0980 capo 116.76, r0982 tuning 103.33, r0990 standard 108.10 (Demucs only) |

Changes to the research scripts (copies in `/home/user/gtv/work/exp-voices/scripts/`, marked `gtv:`): truth read from
`/home/user/gtv/truth`; B1 threshold from env `VS_T`; music21 given a fixed 120 bpm instead of the truth tempo.
`hpss_perc.py` is `hpss_run.py` cut down for disk (no harmonic WAV, percussive as 16-bit). Demucs's other five stems
were deleted after the run (sep-01 is the same run). Nothing failed or was refused.

## Voices: share of matched truth notes whose label agrees (fvt_common.voice_accuracy)

Matched = melody/bass truth notes with an estimated note within 50 ms at the same pitch. From `voice_split.json`.

| technique | capo | tuning | standard |
|---|---|---|---|
| v-01 B1 threshold 55 | 703/743 = 0.946 | 320/358 = 0.894 | 504/504 = 1.000 |
| v-01-hint B1 at true string 3 + capo | 710/743 = 0.956 (T58) | 358/358 = 1.000 (T53) | 1.000 (same run as no hint) |
| v-01 B2 lowest note per onset | 0.518 | 0.360 | 0.611 |
| v-02 partitura P1 (P2 identical except standard truth notes) | 0.260 | 0.170 | 0.484 |
| v-01 B1 on the truth notes | 0.947 | 0.888 | 1.000 |
| v-01 B2 on the truth notes | 0.308 | 0.206 | 0.671 |
| v-02 P1 on the truth notes | 0.265 | 0.264 | 0.545 |

B1 errors, capo (no hint): 29 truth bass notes called melody, 11 melody called bass; with T58: 20 and 13. Tuning (no
hint): 38 melody notes called bass, 0 bass called melody; with T53: 0 and 0. Partitura returned 7, 7 and 8 voices on the
transcribed notes (4-5 on the truth notes); after the mapping it labels 2, 1 and 1 notes melody, everything else bass.

## Voices: gtr-eval `notes --voice` on the notes given each label (onset 50 ms, 50 cents)

Recall = truth notes of that voice found among the notes given that label. Precision is low because every extra note
Basic Pitch writes (n-01 precision 0.54 on capo) still gets a label.

| technique | capo melody R / P | capo bass R / P | tuning melody R / P | tuning bass R / P | standard melody R / P | standard bass R / P |
|---|---|---|---|---|---|---|
| v-01 (T55) | 0.942 / 0.621 | 0.807 / 0.278 | 0.674 / 0.651 | 0.629 / 0.156 | 0.831 / 0.557 | 0.891 / 0.407 |
| v-01-hint | 0.939 / 0.631 | 0.851 / 0.285 | 0.773 / 0.628 | 0.629 / 0.194 | as v-01 | as v-01 |
| v-02 P1 | 0.002 / 0.500 | 0.950 / 0.132 | 0.000 / 0.000 | 0.629 / 0.078 | 0.000 / 0.000 | 0.891 / 0.229 |

Eval ids: v-01 e2317 e2318 (capo), e2328 e2330 (tuning), e2335 e2336 (standard); v-01-hint e2320 e2322, e2331 e2332,
e2337 e2338; v-02 e2324 e2326, e2333 e2334, e2339 e2341.

## Taps: gtr-eval `onsets --field taps` (50 ms). Tuning not scored (no truth taps)

| technique | capo F / P / R (n est) | standard F / P / R (n est) | tuning (n onsets, viewer only) |
|---|---|---|---|
| v-03 HPSS percussive onsets | 0.442 / 0.284 / 1.000 (910) | 0.581 / 0.412 / 0.986 (505) | 759 |
| v-03 margin 3 | 0.446 / 0.287 / 1.000 (899) | 0.566 / 0.397 / 0.986 (524) | - |
| v-03 onsets with no transcribed note within 50 ms | 0.260 / 0.452 / 0.182 (104) | 0.202 / 0.349 / 0.142 (86) | - |
| v-04 Demucs drums stem onsets | 0.820 / 0.963 / 0.713 (191) | 0.479 / 0.932 / 0.322 (73) | 1184 |
| v-04 onsets with no transcribed note within 50 ms | 0.305 / 0.940 / 0.182 (50) | 0.179 / 0.875 / 0.100 (24) | - |

Recall by tap kind (`--tap-kind`): v-03 capo string-slap 1.000, thump 1.000, body-slap 1.000; standard string-slap
1.000, thump 0.975. v-04 capo string-slap 0.833, thump 0.603, body-slap 1.000; standard string-slap 0.548, thump 0.144.
Baseline from step 1 (sep-07, onsets of the unseparated mix, capo): F 0.472, P 0.309, R 0.996
(`/home/user/gtv/experiments/capo/sep-07/scores.json`). "No transcribed note" uses sep-07's Basic Pitch notes of the
HPSS harmonic part (rule of `chainB_taps.py`; joins in `chainB.json`). Most truth taps share their moment with a note
(capo: 199 of 258 tap events are tap+note; standard: 23 of 211), so dropping onsets that carry a note loses them.
Eval ids: v-03 capo e2368 e2369 e2372 e2377-e2379, standard e2370 e2371 e2373 e2383 e2384; v-04 capo e2375 e2376
e2380-e2382, standard e2390 e2391 (+ kind runs, in `score_taps_<kind>.log`).

## For the film

Times are seconds of `<S>.wav` (the truth timeline; capo.wav t=0 = video.mkv 17.99 s, as segment t0 12.76 s = 30.75 s in `../truth-capo.md`;
standard.wav t=0 = video.mkv audio 20.992 s, `../truth-standard.md`). Per 20 s windows: `/home/user/gtv/work/exp-voices/windows_<S>.txt`
(voices) and `tapwin_<S>.txt` (taps).

- **v-01 and v-01-hint, threshold split: tuning 40-60 s.** Truth: of 42 matched melody/bass notes, the 55 threshold
  labels 35 right (7 melody notes called bass, in this tuning the open third string is F3 = 53); at the hinted
  threshold 53, 42 of 42. Settled by the truth (numbers above). Show: `tuning/v-01/voices.csv` and
  `tuning/v-01-hint/voices.csv` as a two-colour roll against the truth voices. Play: `tuning/v-01/render.bass.wav`
  then `render.melody.wav`, and `tuning/v-01-hint/render.melody.wav` (cut 40-60 s). Whether the bass alone sounds
  like a bass line is for the viewer's ear.
- **v-01 where the threshold fails with or without the hint: capo 90-110 s.** 55 of 63 labels agree in both runs; the
  capo moves bass notes above G3 (29 bass notes called melody over the song at T55, 20 at T58). Truth-settled.
  Files: `capo/v-01/voices.csv`, `capo/v-01/render.bass.wav`, `render.melody.wav`.
- **v-02 partitura: capo 90-110 s.** 11 of 63 labels agree; the tool returns 7 voices and the mapping leaves 2 notes
  over the whole song labelled melody. Truth-settled. Show `capo/v-02/voices.csv` (or the voice numbers in
  `capo/v-01/raw/P1_partitura_poly.csv`) as a roll. Play: `capo/v-02/render.bass.wav` (it holds nearly every note;
  `render.melody.wav` is almost silent).
- **v-03 HPSS taps: capo 60-80 s.** 32 truth taps, 89 onsets, all 32 hit (57 extra onsets; over the song 526 of the 910 onsets fall on a truth note-only event, `capo/v-03/chainB.json`).
  Truth-settled. Play `capo/v-03/clicks_60-80.wav` (recording with a click per onset) against
  `capo/v-03/clicks_truth_60-80.wav` (a click per truth tap); show `capo/v-03/taps.txt` as ticks on the waveform.
  Hear the stem: `capo/v-03/percussive.wav` (cut 60-80 s).
- **v-04 Demucs drums taps: standard 100-120 s.** 29 truth taps, 5 onsets, 4 hit (thump recall over the song 0.144).
  On capo 60-80 s it hits 23 of 32 with 23 onsets. Truth-settled. Play `standard/v-04/clicks_100-120.wav` against
  `standard/v-04/clicks_truth_100-120.wav` and `standard/v-03/clicks_100-120.wav` (66 onsets, 29 hit); the stem alone:
  `standard/v-04/drums.wav` (cut 100-120 s).
- **Taps on the song with no taps marked: tuning 40-60 s.** Not scored. v-03 gives 87 onsets and v-04 121 onsets in
  these 20 s. For the viewer's ear: `tuning/v-03/clicks_40-60.wav`, `tuning/v-04/clicks_40-60.wav`,
  `tuning/v-04/drums.wav`.
