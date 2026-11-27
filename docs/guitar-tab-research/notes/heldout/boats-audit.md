# Audit of the held-out key `boats` (slot `newplayer`: *Three Little Boats*, Pete Lumb, standard tuning, no capo)

Audited 2026-11-27 by lane H's audit agent of the NOTES session. This agent built neither the key, nor the check, nor
the repair. Nothing in `/home/user/gtv/truth/boats/`, `/home/user/gtv/songs/boats/` or the other agents' work folders
was changed.

- **Key audited:** `boats.truth.json`, SHA-256 `5bdcbfad3ea9...` (232 notes), the repaired key that `boats.md`
  describes in [Repairs](boats.md#repairs). A snapshot is in the work folder (`out/boats.truth.audited.json`). The
  first build (`heldout-newplayer/orig/`, `16516a204c9c...`, 221 notes) was used only to recompute the record's counts.
- **Work folder** (not in git): `/home/user/gtv/work/heldout-newplayer/audit/` (`bin/`, `logs/`, `out/`, `frames/`,
  `render/`, `PROGRESS.md`). Every number below comes from a file named next to it. Scripts copied from the closer
  audit or from the repair are marked as copies in their first line; no original was edited.
- **Heavy runs** (`gtr-run`, lane notes-heldout, 2 cores each): r1514 (render), r1515 (time 0), r1516 (tuning and
  capo), r1518 (random notes), r1526 (the repair's render check, re-run), r1530 (WAV and video offsets).

**No note transcriber was run at any step of this audit.** The evidence is:
- onset envelopes, my own high-band attack detector and peak picking on the raw recording;
- a FluidSynth rendering of the key (program 24, nylon);
- STFT energy at each note's own partials and at its semitone neighbours, at its key time;
- band-level traces, CQT pictures, frames of the video, and my eyes.

## Verdict

| item | result |
|---|---|
| 1. Files exist and match the schema (`gtr-eval check-truth`) | **PASS** |
| 2. The WAV's time 0 and the key's time 0 agree | **PASS** |
| 3. Tuning and capo | **PASS** |
| 4. 40 random notes heard at their partials | **PASS** |
| 5. No note transcriber's output was used | **PASS** |
| 6. The record states counts the files reproduce | **FAIL** (one stale hash; every count reproduces) |
| 7. Rights note and credit line present | **PASS** |
| 8. Nothing private in the repo record | **PASS** |

**The key is fit for scoring.** One fix is needed, in the record only:
- `boats.md` line 44 (the Files table) gives `/home/user/gtv/truth/boats/boats.truth.json` the SHA-256
  `16516a204c9c...`. That is the first build, now in `orig/`. The installed file is **`5bdcbfad3ea9...`**.
- Fix: put `5bdcbfad3ea9...` there and name `16516a204c9c...` as the first build, as Repairs already does (line 245).
  Also point line 237-238 ("An audit by an agent that did neither is still to come") at this record.

Nits and doubts are listed under items 4 and 6. None changes a pitch or moves an onset beyond 30 ms.

## 1. Files and schema: PASS

- **`gtr-eval check-truth`** (0.12.1): **2,449 checks, 0 mismatches** (`out/check_truth_installed.json`). Notes 232
  (melody 136, bass 78, chord 18), 64 beats, 32 downbeats, 49 chords, 0 taps. The first build gives 2,339 / 0
  (`out/check_truth_orig.json`).
- **Schema against `capo.truth.json`** (`bin/schema_audit_boats.py`, the closer audit's script adapted to 6/8 and this
  key's side files; `out/schema_audit.json`, whose one flag is `tab_url`):
  - The same top-level keys and types. `source` has capo's keys plus `tab_url`, as the september and tuning keys do.
    `derivation` has every key of capo's plus `record`, `no_transcriber`, `key` and `repairs`.
  - Every note has capo's 8 note keys. The extras are `legato` (28: `p` 20, `h` 8) and `grace` (2); `check-truth`
    ignores them.
  - Pitch = `tuning_midi[6 - string]` + capo + fret holds for 232 of 232 notes.
  - Notes are sorted and inside the audio. They last 0.073-6.000 s.
  - No duplicate (onset, pitch), and no overlap on a string.
  - `conf` counts equal `derivation.conf_counts` (212 / 8 / 12).
  - Beats rise strictly; the downbeats are every 2nd beat (6/8 in two). Every beat sits on a note onset, and none on
    an onset that holds only `audio` notes (the repair's rule).
  - The chords cover 0-67.094 s with no gap. `scored_range` is [0, 67.094014], `audio` is `boats.wav`, 44,100 Hz,
    2 channels.
- **Side files** scored against the JSON with `gtr-eval` (`--no-ledger`, `out/side/*.json`):

  | file | result |
  |---|---|
  | `boats.notes.csv` | onset and onset+offset F1 1.0 (232 matched) |
  | `boats.mid` | onset and onset+offset F1 1.0; onsets within 1.3 ms |
  | `boats.beats.txt` (`--downbeat-col 2`) | beats F 1.0, downbeats F 1.0 |
  | `boats.chords.lab` | root, majmin, sevenths 1.0 |
  | `boats.tab.txt` (`tab --ignore-time`) | 229 matched, all on the same string and fret: 229 of the 230 drawn notes |
  | `boats.notes.csv` as a tab | 232 of 232 same string and fret |
  | `boats.tab.txt` note heads | 230 = 232 less the 2 grace G3s, as its header says |
  | `boats.lefthand-heard.json` | 13 rows; one (B3 46.608) lies within 50 ms of a key B3, which the row itself says |

- **Bar 5 of `tab.txt`** now draws the hammered A3's `2` on string 3 at beat 1 in both passes, as the header says
  (check Problem 5).
- **Audio and video** (`ffprobe`). The SHA-256 prefixes equal those in `newplayer.md`.

  | file | what it is |
  |---|---|
  | `boats.wav` | PCM s16le, 44.1 kHz, stereo, 2,958,846 samples = 67.094 s |
  | `boats.mono.wav` | the same length; equal to the mean of the stereo channels within 0.5 LSB |
  | `boats.mp4` | H.264 1920x1080, 25 fps, 1,677 frames; Opus audio |
  | `boats.full.mp4` | the same, without the boxes |

  - The tags of both mp4s carry only encoder and handler names: no title, no URL, no description.
- **No tab or title shows in `boats.mp4`** (`frames/mp4_contact.png`, 17 frames from 0.5 to 66.5 s).
  - It is not cropped. Black boxes cover the two section captions and the end card's logo, for the reason
    `newplayer.md` gives: a crop would cut off the hands.
  - The caption area's edge density (`bin/caption_edges.py`, `logs/caption_edges.log`): `boats.mp4` is black there
    on every frame of 0-7.28 s and 44.60-51.92 s. On the frames just outside the boxes it is as clean as a frame with
    no caption (0.54-0.57 against 0.62). In `boats.full.mp4` the caption shows (5.44 at 6.0 s).
  - The pass-2 caption, seen in `boats.full.mp4` at 47.0 and 50.0 s, lies inside the box in `boats.mp4`
    (`frames/pass2_caption_full_vs_box.png`).
  - From 64.76 s a box covers the logo, which first shows faintly at 65.04 s.
  - The music stand's sheets are seen only from behind (`frames/mp4_stand_60.png`, `mp4_stand_20.png`): a faint,
    mirrored show-through of notation that cannot be read.

## 2. Time 0: PASS

The key was rendered with FluidSynth (`tools/bin/notes2wav.py`, program 24, on the key's own timeline, r1514). The
rendering equals the repair's own rendering byte for byte (SHA-256 `1cdd36e38daf...`). Then `bin/timezero_boats.py`
(r1515, `out/timezero_p24.json`) compared it with `boats.wav`.

**What I expected.** The key puts every onset on the physical attack (the record's "Read this first"). An onset
envelope peaks after the attack. So the recording's envelope peaks should sit a little after the key's onsets, by the
same amount everywhere.

| measure | result |
|---|---|
| whole-file cross-correlation of the two mel onset envelopes (hop 128 = 2.9 ms) | recording **8.6 ms before** the rendering (correlation 0.74) |
| FluidSynth's own delay: rendering detections minus key onsets | median **+20.3 ms** (IQR +18.9..+21.7) |
| so the recording's envelope peaks against the key's clock | **+11.8 ms**: the stated convention (the record gives +14.1 / +14.6 ms for the AO-082 detector at hop 256) |
| per onset group (165 groups that are not `audio` only): nearest recording detection minus key onset | median **+12.4 ms**, IQR +10.3..+14.7, p10-p90 +7.9..+17.4; 154 have a detection within 100 ms, 99.4 % of them within 50 ms |
| the cross-correlation in 12 windows of 10 s | -9.1 to -6.9 ms (median -8.5, IQR -8.6..-8.1); drift +0.12 ms per 10 s; the slow and the full-speed pass agree |
| recording minus rendering, per group | median -8.7 ms, MAD 2.9 ms; 4 groups more than 30 ms from the median, 3 more than 50 |

**My own attack detector**, written for this audit (not the builder's or the check's):
- the band above 2 kHz (4th-order Butterworth, zero phase), RMS in 128-sample frames at a 1 ms hop;
- an attack = a local maximum of the 5 ms rise, at least 6 dB; its time = the half-rise point.

| measure | result |
|---|---|
| attack minus key onset, per group with an attack within 50 ms (142 of 165) | median **0.0 ms**, MAD 0.6 ms, p10-p90 -2.0..+3.0 |
| within 5 / 10 / 25 ms | 122 / 132 / 138 |
| per pass | median 0.0 ms in both |
| shift scan, -100..+100 ms: share of groups with an attack within 10 ms | 0.800 at 0 ms; the best, 0.800 at -4 ms, is no better |

- **The 23 groups with no attack within 50 ms** are the kinds the record says have none: pull-off targets, soft inner
  notes and re-plucks of ringing strings in the full-speed pass.
- **The 6 groups with an attack 15-50 ms away** (`logs/attacks_list.log`, `frames/pt_A.png`, `frames/ev_62b.png`):
  - 10.557 s (E2, -18.5 ms): a touch before the pluck; the E2's 5th partial steps at the key time.
  - 47.885 s (A2, `tab`, -18.7 ms): a re-pluck of the ringing A2. It is `tab`.
  - 49.816 and 49.992 s (+45 / +47 ms): both `tab`; the nearest attack is the next event.
  - 54.561 s (+43 ms): a pull-off target; the nearest attack is the next pluck.
  - 62.595 s (A2, -27 ms): my detector misses this soft attack. The A2's fundamental band rises at 62.598 s
    (2,048-point STFT read at the window's leading edge), so the key is on time.

**The WAV and the video** (`bin/wav_offset_boats.py`, r1530, `out/wav_offset.json`):
- `boats.wav` sample 0 = **213.959501 s of `audio.wav`** (the whole audio of `video.webm`), the same at 1, 20, 45
  and 60 s (correlation 0.99999). That is the record's value.
- The audio of `boats.mp4` and of `boats.full.mp4`, decoded to 44.1 kHz, equals `boats.wav` at offset 0
  (correlation 1.000 at 1, 30 and 60 s). It has the same length, 67.094014 s.
- Frame 500 of `boats.mp4` matches `video.webm` at 213.96 + 0.04 × 500 s (mean grey-level difference 0.07, against
  0.40 or more for the neighbouring frames; `logs/caption_edges.log`). That is the record's frame mapping.

## 3. Tuning and capo: PASS

- **Stated:** the tab sheet prints no tuning and no capo, but its notation fixes every open string (`newplayer.md`).
  The key has `tuning_midi` 40 45 50 55 59 64, `capo` 0 and `tuning_offset_cents` 0.
- **Seen:** at 45.88 s of `boats.mp4` (`frames/nut_45.88_zoom.png`), in the fretting-hand close-up, the nut is clear
  and nothing lies across the neck. The first finger is just past the nut.
- **Heard, at the key's own note times** (`bin/tuning_capo_boats.py`, a copy of the closer audit's script with this
  song's alternatives; r1516, `out/tuning_capo.json`). For each note I measured the power added at partials 1-6 of its
  pitch, against the pitch each other reading would give for the same string and fret. An alternative is compared
  only when its pitch class is not sounding in the key.

  | the key's reading against | key pitch louder |
  |---|---|
  | every string a semitone lower | **92.5 %** (209 of 226; string 5: 31 of 40) |
  | capo 1 (+1) | **96.2 %** (202 of 210) |
  | capo 2 (+2) | **96.9 %** (187 of 193) |
  | D A D G A D on strings 1-2 (-2) | **100 %** (65 of 65) |
  | drop D (string 6 -2) | **100 %** (21 of 21) |

  The A-string basses are the weakest, as the record says (weak fundamentals, shared partials).
- **Cents** over the 212 `tab+audio` notes: median **-1.8 cents** (IQR -4.3..+0.4). Per string from s1 to s6: -1.9,
  +0.3, +0.7, -4.9, -3.9, -3.5. Open strings -1.1, fretted -2.3. The key says 0 and the check -2.5. The difference
  is too small to matter at 50 cents.

## 4. 40 random notes: PASS

- **The draw:** seed 5127, 40 notes of the installed key. This is a different seed from the repair's second pass
  (20261127). The sample holds 34 `tab+audio`, 4 `audio` (#52, #98, #136, #166) and 2 `tab` notes (#145, #146).
- **Two independent rules:**
  - `bin/notes40_boats.py` (the closer audit's rule, unchanged; r1518, `out/notes40.json`, `frames/notes40.png`):
    own-partial rise ≥ 3 dB and a margin ≥ 0 dB over the free semitone neighbours.
  - `bin/specrise.py` (my own, `out/specrise_all.json`): the rise of the note's own partials across its onset minus
    the larger rise of its semitone neighbours at the same partials. Partials shared with a note plucked within -30 to
    +60 ms are left out.
    - On all 232 notes, the second-best partial clears 6 dB at 0.857 of the `tab+audio` and `audio` notes.
    - At the same notes moved 0.25 s later or earlier (where no note of that pitch class starts), it clears 6 dB at
      0.114 and 0.184.

**Every pitch is present at its time.**
- **`tab+audio`: 34 of 34 heard.** 33 pass one rule or both.
  - The 34th, #19 (A2, 8.015 s), was judged from traces (`frames/pt_A.png`): its 5th partial rises 38 dB at the key
    time against 9 dB for the neighbours, and its fundamental rises there too. The automatic rules fail it only on a
    neighbour's leakage at the fundamental.
- **`audio`: 4 of 4 heard.** #52, #98 and #166 pass both rules.
  - #136 (B2, 48.446 s) fails both on the long windows. The B2's 3rd partial, F#4, ends about 10 dB over both
    neighbours (`frames/ev_48.png`).
  - **Doubt:** F#4 rises with the E2/B3 pluck at 48.462 s, 16 ms after the key time. That is at the edge of the
    ±15 ms the record gives for these sounds. The check had timed it at 48.461.
- **`tab`: both show some rise of their own** (#145: 3.7 dB, #146: 2.8 dB by my rule; both pass the weaker closer
  rule). As in the closer audit, that errs on the safe side for heard-only recall and is not a fault.

**Timing.** For the 38 notes with a clear own-partial step (≥ 3 dB), the step's median is +0.4 ms (p10-p90 -9.5 to
+9.5 ms). Four lie beyond 25 ms:
- #166 (C4 hammer, +77 ms) is the following pluck. The C4 itself is confirmed before that pluck (below).
- #145 is a `tab` note.
- #228 (A2, -47.5 ms) is a 3.5 dB step at the C4 hammer. The A2's fundamental band rises at the key time (item 2).
- #128 (B3, 46.642 s, +29 ms on its 8th partial). Its 4th partial rises within 10 ms of the key time
  (`frames/ev_46.png`); the B3 already sounds from the C4 pull-off at 46.608. Inside 30 ms either way.

**The repair's added and moved notes**, all 15 (`out/specrise_all.json`, `out/gapspec.json`, `frames/ev_*.png`):
- **The 4 moved notes** are heard at their new times: specific rise 23.9 dB for #152 (C4, 50.781), 9.9 for #158
  (A2, 51.977), 16.1 for #159 (E4, 51.977) and 21.5 for #229 (A3, 62.638).
  - My attacks fall at 50.7810, 51.9783 and 62.6381 s.
  - The nail touch at 51.9244 has +36 dB in the high band but only +1.8 dB broadband, as the record says.
- **The left-hand sounds timed before a pluck** (`bin/gapspec.py`): short spectra between the sound's key time and
  the next pluck, against the 40 ms before it. The own pitch should rise and the previous pitch fall ("swap"). The
  control is the same test 60 ms earlier.

  | sound | swap at the key time | control |
  |---|---|---|
  | C4 19.319 | **+15.5 dB** | -0.3 |
  | G3 34.935 | **+10.9 dB** | +1.0 |
  | C4 53.073 | **+7.8 dB** | -0.4 |
  | G3 15.213 | +5.0 dB | -1.1 |
  | D3 59.129 | +3.9 dB (partials 13-15: +17 to +21 dB) | +1.5 |
  | G3 8.994 | +2.9 dB | 0.0 |
  | C4 62.541 | +2.6 dB (partials 10-12: +14 to +25 dB) | -3.5 |

  - So the C4 of 53.073 does sound 64 ms before the pluck the check timed it at, as the repair found.
  - So do, more weakly, the C4 of 62.541 and the D3 of 59.129.
  - Nothing contradicts the repair's times.
- **Weakest** by my rule:
  - #193 (E3, 57.415): 3.3 dB. The gap test cannot run there, because the C3/E4 pluck at 57.390 falls in its
    "before" window.
  - #203 (D3, 59.129): its long windows hold the pluck 51 ms later; the gap test above supports it.
  - #214 (the first build's G3, 60.703): 5.7 dB.

  The check and the repair both heard these three. Suggested: name #193 beside #136 under "What remains uncertain
  after the repair".

## 5. No note transcriber: PASS

- **Names:** every file in `/home/user/gtv/work/heldout-boats/` (builder) and `/home/user/gtv/work/heldout-newplayer/`
  (prep, readers, check, repair; outside `audit/`) was searched for any tool name, in any spelling. The names were:
  Basic Pitch, Transkun, Riley / guitar-fl / guitar-gaps, YourMT3 / MT3, Noise2Fret, the kit's `notes_guitar`, Onsets
  and Frames, piano_transcription, CREPE, pYIN, Omnizart and TabCNN.
  - The only hits are the `no_transcriber` sentence that `build.py` and `build_fix.py` write into the key, and the
    same sentence in the installed and first-build keys.
- **Imports** across the 83 Python scripts:
  - `numpy`, `scipy`, `librosa`, `soundfile`, `matplotlib` and `PIL`, plus standard-library modules;
  - `pretty_midi`, for the MIDI side file;
  - `mir_eval`, the check's and the render check's scoring;
  - the research's `gtr_common`, whose only imports are `csv` and `json` (writers);
  - the agents' own modules (`common`, `bcommon`, `fx`, `sal`, `roll`).
- **Subprocesses:** only `ffmpeg` (the prep's frame and spectrogram tools); the shell scripts call `curl` (the Commons
  fetch) and `ffmpeg`/`ffprobe`.
- **Inputs:** the scripts name only `songs/boats/`, `truth/boats/`, the two work folders and the blog's
  `docs/guitar-tab-research/` (the `gtr_common` writers and the record).
- **Feature files:** the builder's `feat/*.npz` hold a CQT, flux and RMS envelopes, an STFT, a high-band envelope and
  an attack list: no note list. The `.mid` files are the key's own side files (`orig/`, `fix1/out/truth/`).
- **The `gtr-run` ledger** (`/home/user/gtr/ledger/runs.jsonl`, 1,533 runs when read):
  - Every run that names the boats files, the `newplayer` slot or R3c was listed.
  - This lane's runs are ffmpeg (r1318, r1319), the repair's scans and renders (r1492-r1503) and this audit's; none
    is a transcriber.
  - AO-082's runs on its clip R3c (boats 8.0-26.0 s; for example Basic Pitch r0264 and chain D r0533) are from that
    research, before this key. No script in the key's folders reads their outputs; the record states the overlap
    ("Not unseen").

## 6. Counts in the record: FAIL (one stale hash)

Recomputed from the files (`bin/counts_audit_boats.py` → `out/counts_audit.json`; first build = `orig/`). The repair's
own self-check scripts were re-run from copies (`bin/repair_copy/`, r1526): `out/check_render_repro.json`,
`out/pitch_check_repro.json`, `logs/onsetagree_repro.log`.

**Wrong:**
- `boats.md` line 44, the Files row for `/home/user/gtv/truth/boats/boats.truth.json`: "SHA-256 `16516a204c9c...`".
  - The file at that path is `5bdcbfad3ea92a54...`. `16516a204c9c...` is the first build in `orig/`.
  - The header's rule ("the numbers above Repairs describe the first build") does not cover it: the row names the
    installed path, and the same table already lists the repair's `boats.lefthand-heard.json`.
  - The side files in the next row changed too (`notes.csv`, `.mid`, `.tab.txt`, `.beats.txt`, `.chords.lab`).
- Fix: give the installed hash there, and the first build's as "first build, `orig/`".

**Nits (not failures):**
- The Krumhansl-Kessler second key changed from A major (first build, line 132) to E minor
  (`derivation.key`). Repairs does not list it, though the header says Repairs gives every number that changed.
- Problem 4's table numbers notes as in the first build and the check (#205 the soft D4). The second pass numbers
  the installed key (#215, the same D4). Say which numbering each uses.
- Line 237-238 still says the audit is to come.

**Reproduced exactly, Repairs:**
- **Notes and `conf`:** 232 notes, `tab+audio` 212, `tab` 8, `audio` 12. Pass 1: 114 (109 / 1 / 4). Pass 2: 118
  (103 / 7 / 8). Voices: melody 136, bass 78, chord 18. Legato: `p` 20, `h` 8.
- **The 4 moved notes:** C4 50.745 → 50.781 (+35.9 ms); A2 and E4 51.925 → 51.977 (+51.9 ms); A3 62.595 → 62.638
  (+42.9 ms). Each went `tab` → `tab+audio`.
- **The 8 `conf` changes**, in first-build numbering: #29, #43, #146, #152, #153, #168 and #218 to `tab+audio`; #205
  to `tab`.
- **The 11 added notes** at the listed times, strings, frets and legato marks. All are `audio`, voice `chord`.
- The G3 at 60.703 now carries `legato: "p"`; nothing else about it changed.
- **Unchanged:** pitch, string, fret and voice of every matched note. No first-build note is lost.
- **Beats, downbeats and chords:** one beat and one downbeat moved (51.9254 → 51.9773), and one chord boundary
  (C:maj / A:min) moved with them. Every other beat, downbeat and chord is unchanged.
- **Offsets:** 15 changed. The C3/E4 before the bar move to 51.967. Twelve more now end 10 ms before an added or moved
  note on the same string, by the builder's let-ring rule. The moved A3's own end moves by 2 ms (65.480 → 65.483).
- **Tempo:** `tempo_bpm` 69.42 → 69.86. The per-pass tempi are unchanged at 47.06 and 100.94, and the median over
  both passes' beat intervals gives exactly 69.86.
- **`check-truth`:** 2,449 / 0. `tab.txt` has 230 note heads; 229 of the 230 match.
- **The repair's self-checks**, re-run from copies, give identical files:
  - render chroma 0.842 (pass 1 0.837, pass 2 0.852; shifted one bar 0.492);
  - the AO-082 detector: 0.9769 = 169 of 173 key events, +14.6 ms; detections near a key event 0.725; missed 49.679,
    50.781, 53.073 and 60.703;
  - pitch check: present 0.875, median +9.1 dB, `tab+audio` 0.892 (first build 0.883). The 3 `audio` notes under
    1 dB are 8.994 (0.6), 59.129 (0.4) and 60.703 (0.8);
  - the check's attacks within 50 / 5 ms: 138 / 128 of 165 (first build 136 / 126 of 163).
- **The left-hand levels:** -1.2 to -5.6 dB for the eleven, and -7.6 dB for the first build's G3 (`fix1/logs/lh.log`,
  `lh_more.log`).
- **The octave pairs:** 5 of 8 within 17 ms, 38.765 and 53.138 s explained by a ringing A2, and A3 +43.5 ms at 62.595
  (`fix1/logs/octpair.log`).
- **The second pass** (`fix1/out/pass2.json`): 30 random + 10 changed notes, 40 of 40 agree, 7 marked weak, and the
  two `tab` notes are #144 and #215.

**Reproduced, first build ("The key"):**
- Notes: 221 notes, 206 / 14 / 1. Pass 1: 110 (107 / 3 / 0). Pass 2: 111 (99 / 11 / 1).
- Voices and marks: melody 136, bass 78, chord 7; legato `p` 14, `h` 2; 2 grace notes.
- Beats and form: 64 beats, 32 downbeats, 49 chords, tempo 69.42, A minor, 0 taps.
- Range: notes 0.465-40.165 s and 44.697-63.226 s.
- `check-truth` 2,339 / 0. The `tab.txt` had 219 heads.
- The onset-method counts sum to 221. The installed key's `derivation.onsets` counts sum to 232.

## 7. Rights note and credit line: PASS

- **`newplayer.md`, "Source and credit" and "Rights note":**
  - the source: the Commons file page and the tab PDF's two public pages;
  - the licence: CC BY 3.0 on the Commons page, with a licence review noting 4.0, attribution Culture Vannin;
  - the composition, traditional; the arrangement, James Franklin's;
  - the tab's terms: a free download, no licence stated; no account made, nothing bought;
  - the credit line.
- **Checked against the downloaded Commons record** (`songs/boats/commons_api_info.json`,
  `commons_file_description.wikitext`): `LicenseShortName` "CC BY 3.0", `UsageTerms` "Creative Commons Attribution
  3.0", `Attribution` "Culture Vannin", `{{YouTube CC-BY|Culture Vannin}}`, and a licence review of 2026-10-19 with
  `licence=CC-BY 4.0`. These match the record.
- **`boats.md`, "Source and credit"** repeats the licence and the same credit line.
- **The key JSON:** `source.license`, `license_quote` and `attribution` carry the same licence and credit line, in the
  form of `capo.truth.json`.
- **Open item, not part of this item:** the training-set check (GuitarSet, GAPS, the Leduc set, GOAT) that NOTES.md
  section 5 asks for is still not done. `boats.md` says so plainly under "What remains uncertain".

## 8. Nothing private in the repo record: PASS

- **The never-publish scan:** the blog's own matcher (`scripts/check/never-publish.mjs` against
  `src/data/never-publish.json`, run by `bin/np_scan.mjs`) finds **0 hits** in `boats.md`, `boats-check.md`,
  `newplayer.md`, the installed key, `boats.lefthand-heard.json` and `fix1/out/boats-repairs.csv`. This record was
  scanned the same way after writing.
- **Links and hosts:** the only URL in the three records is the public Commons file page; the text also names Culture
  Vannin's public site.
  - A search for signed-link parameters (the AWS signature, expiry, token and `sig` fields), storage and worker hosts,
    the command centre's host, session links, key tools and names, personal paths and local hosts finds nothing.
  - The only file paths are the research box's `/home/user/gtv/` and `/home/user/gtr/` folders.
- **The CSV and JSON per-note files** stay out of git: `notes/.gitignore` has `heldout/*.csv` and `heldout/*.json`.
- **`boats.md` is committed** (6227343c) and the working copy equals it.
