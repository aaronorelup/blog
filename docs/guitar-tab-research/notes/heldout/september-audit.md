# Audit of the held-out key `september` (*Wake Me Up When September Ends*, Evan Handyside, open G + capo 2)

Audited 2026-11-27 by lane H's audit agent. This agent built neither the key, nor the check, nor the repair. Nothing in
`/home/user/gtv/truth/september/` or `/home/user/gtv/songs/september/` was changed.

- **Key audited:** `september.truth.json`, SHA-256 `8bba0443bdcb...` (417 notes), the repaired key that
  `september.md` describes in [Repairs](september.md#repairs). A snapshot is in the work folder
  (`out/september.truth.audited.json`). The first build (`orig/september.truth.json`, `892d95c0cdb0...`) was used only
  to check the record's "before" numbers.
- **Work folder** (not in git): `/home/user/gtv/work/heldout-september/audit/` (`bin/`, `logs/`, `out/`, `frames/`,
  `render/`, `PROGRESS.md`). Every number below comes from a file named next to it.
- **Heavy runs** (`gtr-run`, lane notes-heldout, 2 cores each): r1505 (render), r1506 (time 0 and WAV offsets), r1510
  (the closer audit's 40-note script), r1513 (partial features of all 417 notes and 1,668 null samples).
- **Scripts:** some are copied from the closer audit (`../heldout-closer/audit/bin/`) and adapted to this song; the
  copies say so in their first lines. The originals were not edited.

**No note transcriber was run at any step of this audit.** The evidence is:
- onset envelopes and peak picking on the raw recording;
- FluidSynth renderings of the key (nylon and steel);
- STFT energy at each note's own partials and at its semitone neighbours, at its key time;
- CQT pictures, frames of the video, and my eyes.

## Verdict

| item | result |
|---|---|
| 1. Files exist and match the schema (`gtr-eval check-truth`) | **PASS** |
| 2. The WAV's time 0 and the key's time 0 agree | **PASS** |
| 3. Tuning and capo | **PASS** |
| 4. 40 random notes heard at their partials | **PASS** |
| 5. No note transcriber's output was used | **PASS** |
| 6. The record states counts that the files reproduce | **FAIL** (three numbers; everything else reproduces) |
| 7. Rights note and credit line present | **PASS** |
| 8. Nothing private in the repo record | **PASS** |

**The key is fit for scoring.** The fixes are in the record only:
- `september.md` line 120 (Method 1): "the same marks on the same 7 origin events". Both readings have **9 marked
  events** (6 figures). The builder's own list in the merge block names 6 figures.
- `september.md` line 338 (Repairs): "in the other three chords the gap is 108-124 ms". The key gives **104.5-115.9 ms**.
- `september.md` line 230 (Checks): "F 0.836 (P 0.970, R 0.734)". **No file holds these numbers.** The first build's
  file gives F 0.838 (P 0.972, R 0.736); the repaired key's file gives F 0.837 (P 0.968, R 0.738).

Item 6 gives the details and two smaller wording fixes. Item 4 lists two doubts at the 50 ms edge; neither changes a
fact the scoring relies on.

## 1. Files and schema: PASS

- **`gtr-eval check-truth`** (0.12.1): **4,325 checks, 0 mismatches** on the installed file
  (`out/check_truth_september.json`).
  - Counts: notes 417 (melody 254, bass 131, chord 32), 192 beats, 48 downbeats, 62 chords, 2 taps.
  - The first build also gives 4,325 / 0 (`out/check_truth_orig.json`), with 0 taps.
  - The snapshot outside the truth folder gives one mismatch, "audio file september.wav not found next to the truth
    file". That is expected, because the snapshot has no WAV beside it.
- **Schema against `capo.truth.json`:** my own script (`bin/schema_audit.py`, `out/schema_audit.json`) passes every
  check but one, which is not a fault.
  - The top-level keys and types are capo's, and every capo `derivation` key is present.
  - `source` has one key capo lacks: `tab_url`. AO-082's `tuning` key and the `boats` key carry it too, and
    `check-truth` ignores it.
  - Every note has capo's 8 note keys. The only extra key is `legato` (h 14, p 8, slide 4).
  - Pitch = `tuning_midi[6 - string]` + capo + fret holds for all 417 notes. Strings are 1-6, frets 0-7.
  - Notes are sorted and inside the audio, with no duplicate (onset, pitch) and no overlap on a string. They last
    0.020-6.000 s.
    - The two shorter than 30 ms, #26 and #108, are hammer-on origins on string 2.
    - #31's 20 ms note of the first build is gone.
  - `conf` counts equal `derivation.conf_counts` (377 / 38 / 2).
  - Beats rise strictly and the downbeats are every 4th beat.
  - The chords cover 0-153.5295 s with no gap.
  - The taps are two `string-slap`s.
  - `scored_range` is [0, 153.529501], `audio` is `september.wav`, 44,100 Hz, 2 channels.
- **Side files** scored against the JSON (`--no-ledger`, `out/side_*.json`):

  | file | result |
  |---|---|
  | `september.notes.csv` | onset and onset+offset F1 1.0 |
  | `september.mid` | onset F1 1.0, onset+offset 0.954 |
  | `september.beats.txt` | beats F 1.0 (192 of 192) |
  | `september.tab.txt` (`tab --ignore-time`) | 410 of 417 matched by order, all same string and fret |
  | `september.notes.csv` as a tab | 417 of 417 same string and fret |
  | `beats.txt`, `chords.lab`, `notes.csv` | equal the JSON row by row |
  | `september.tab.txt` note heads | 417, one per note |

- **Audio and video** (`ffprobe`):

  | file | what it is | SHA-256 prefix |
  |---|---|---|
  | `september.wav` | PCM s16le, 44.1 kHz, stereo, 6,770,651 samples = 153.5295 s | `86963b418c21` |
  | `september.mono.wav` | the same length; equal to the mean of the stereo channels within 0.5 LSB | `31b7e69707c1` |
  | `september.mp4` | H.264 1920x1080, 29.97 fps, 4,601 frames; AAC 48 kHz stereo | `6b446a67af1e` |
  | `september.full.mp4` | the same without the box | `acd764f293df` |

  - The tags of both mp4s carry only encoder and handler names: no title, no URL, no description.
  - **Title box.** Frames 72-74 of `september.mp4`, picked by frame number, are black over the title box and have
    0 near-white pixels in the title area. `september.full.mp4` has about 43,200 of them in the same frames. Frame 75
    is clean in both files (`logs/title_box.log`).
  - **Contact sheet** (`frames/mp4_contact.png`): frames from 0.5 to 153.4 s show only the player, the guitar and the
    room. No tab is ever on screen (the tab is a PDF), and there is no end card. The source's end card ("Guitar TAB and
    blog") appears only after the cut, at 157.5 s of `video.mp4`.

## 2. Time 0: PASS

**The rendering.** I rendered the key with FluidSynth (`tools/bin/notes2wav.py`, nylon program 24 and steel program
25, on the key's own timeline, r1505). The same onset envelope (log-mel flux, hop 128 = 2.9 ms) and the same peak
picker then ran on the rendering and on `september.wav` (`bin/timezero.py`, r1506, `out/timezero_p24.json`, `_p25.json`).

| measure | result (nylon) |
|---|---|
| whole-song cross-correlation of the two envelopes | recording **30.6 ms before** the rendering (correlation 0.69) |
| FluidSynth's own attack: rendering detections minus key onsets | median **+20.3 ms** (IQR +17.4..+20.4) |
| so the recording against the key's clock | **-10.3 ms** (steel: -12.8 ms) |
| per onset group (406 groups): nearest recording detection minus key onset | median **-11.7 ms**, IQR -17.4..-10.1, p10-p90 -20.3..-8.7; 97.5 % within 50 ms and 94.4 % within 30 ms of the 394 with a detection within 100 ms |
| the same per quarter of the song | -11.6 / -14.5 / -11.6 / -14.5 ms |
| the cross-correlation in 14 windows of 20 s | -32.1 to -29.2 ms (median -30.7); drift -0.44 ms per 100 s |
| a shift scan, -150 to +150 ms | a flat top from -28 to 0 ms (0.904-0.916 of groups have a recording onset within 25 ms; 0.904 at 0) |
| recording minus rendering, per group | MAD 2.9 ms; 11 of 385 more than 30 ms from the median, 6 more than 50 ms |

**Reading.** The constant -11.7 ms is the key's onset convention, which the record states: the key marks the 1 kHz+
transient peak, and this detector marks the earlier low-band rise. It does not drift, and it is the same on all four
quarters.

The same detector on the other keys (`bin/conv_context.py`, `logs/conv_context.log`) gives a median of:
- **-11.6 ms** on AO-082's `tuning` key, Evan Handyside's other nylon key and this key's model;
- -2.9 ms on `capo` and `closer`;
- +16.5 ms on `standard`.

So this key follows its model key's convention.

**The 11 groups more than 30 ms off** (`logs/tz_outliers_p24.log`):
- Five are hammer, pull and slide targets, which have no pluck of their own: 18.234, 80.353, 83.249, 104.171 and
  142.855 s.
- 117.139 s is #310 (E3, `tab`). Item 4 shows it has no E3 attack, as `tab` says.
- 61.359 s: the rendering's detection paired with a neighbour.
- 95.190 s is #253 (`tab`).
- Three are open-A3 re-plucks in the intro and the second verse where the recording fires about 20 ms after the key
  (4.110, 8.644 and 119.606 s = #7, #16, #319). The record already lists these three among the notes 26-38 ms from
  the convention (Repairs, "Flagged and not moved"). They are inside the tolerance (item 4).

**The WAV and the video** (`bin/wav_offset.py`, `out/wav_offset.json`, `logs/frame_map.log`):
- `september.wav` sample 0 = **2.502494 s of the `video.mp4` audio** (decoded to 44.1 kHz), the same at 1, 40, 80,
  120 and 150 s (correlation 0.9998-0.9999). That is the record's value (110,360 samples).
- The audio of `september.mp4` and of `september.full.mp4`, decoded to 44.1 kHz, equals `september.wav` at offset 0
  (correlation 1.000 at 1, 75 and 150 s). It has the same length, 153.529501 s.
- Frames 100, 3,000 and 4,599 of `september.full.mp4` match `video.mp4` frames 175, 3,075 and 4,674. The mean grey
  difference is 0.38-0.66, against 1.16-3.83 for the neighbouring frames. That is the record's mapping, frame N to
  frame N + 75.

## 3. Tuning and capo: PASS

- **Stated:** `post.txt` reads "This piece is played in an Open G tuning with a capo on the 2nd fret ... D G D G B D".
  The key has `tuning_midi` 38 43 50 55 59 62 and `capo` 2.
- **Seen:** at 60 s and 120 s of `september.mp4` (`frames/capo_zoom_60.png`, `capo_zoom_120.png`) the capo bar sits
  just behind the second fret wire. One fret wire lies between it and the nut, and the nut is in frame.
- **Heard, at the key's own note times.**
  - **My first test** was the closer audit's added-power test (`bin/tuning_capo.py`). It is too weak here:
    - the key's pitch wins 0.84-0.88 against capo 1, 3 and 0;
    - string 5 gets only 31 of 52 against capo 1.

    The reason is that most notes re-pluck a string that is still ringing, so little power is added.
  - **So I used the power present instead** (`bin/tuning_capo2.py`, `out/tuning_capo2.json`):
    - an 8,192-point frame from onset + 30 ms, so semitones are resolved down to D2;
    - partials 1-6 of the key's pitch, against the pitch each other reading gives for the same string and fret;
    - an alternative is compared only when neither its pitch class nor a pitch whose partials fall on its first two
      partials is sounding in the key.

  | the key's reading against | key pitch louder |
  |---|---|
  | capo 1 (every pitch -1) | **98.9 %** (355 of 359) |
  | capo 3 (+1) | **100 %** (347 of 347) |
  | open G without a capo (-2) | **98.1 %** (356 of 363) |
  | standard tuning on string 1, 5 or 6 (+2) | **100 %** (7 of 7, 44 of 44, 8 of 8) |
  | open D on string 3 (-2) | **96.8 %** (122 of 126) |

- **Cents** (`out/tuning_capo.json`): the 377 `tab+audio` notes give a median of **+3.2 cents** (IQR -0.4..+5.8),
  measured at the peak of partials 1-4.
  - Per string: s1 +0.3, s2 +5.2, s3 +4.8, s4 -1.3, s5 -0.5, s6 +5.8.
  - The key's `tuning_offset_cents` is +5 (librosa over the whole cut) and the check's partial median +3.2. These
    agree.

## 4. 40 random notes: PASS

**The draw:** seed 5,309, 40 notes. That is a different seed from the repair's second pass (20,261,127) and from the
closer audit. The sample holds 37 `tab+audio` notes (2 of them hammer targets) and 3 `tab` notes. I added 23 named
notes:
- the 14 moved notes;
- #292;
- the A3s at the time-0 outliers (#7, #16, #319, #153);
- the `tab` notes #310, #253, #13 and #357.

**The rule.** The closer audit's script (r1510, `out/notes40.json`) relies on a "margin" against the neighbouring
semitones. It fails on this song: open strings ring through everything and most partials are shared. So I built and
calibrated a pitch-specific rule of my own (`bin/feat_calib.py` r1513, `bin/presence.py`, `bin/rule_grid.py`,
`logs/rule_grid.log`, `logs/presence.log`). Its measures:
- **rise:** each partial's level over +25..+70 ms against -70..-25 ms, 2,048-point frames;
- **contrast:** that rise minus the rise of the same partial of the semitone neighbours, only where the window resolves
  them (≥ 700 Hz);
- **presence:** the partial's peak against the neighbours' peaks in an 8,192-point frame after the onset.

A partial is left out when it falls within 40 cents of a partial of another note struck within 60 ms (for presence,
of another note sounding). **Heard** = at least 2 partials with rise ≥ 6 dB and contrast ≥ 3 dB (median contrast ≥ 2
dB), or at least 2 partials with rise ≥ 6 dB and presence ≥ 6 dB.

**Calibration.** For the null samples, each key note's pitch was tested at 4 other key events where that pitch class
does not sound.

| | passes |
|---|---|
| all 377 `tab+audio` notes | **0.851** |
| the 38 `tab` notes | 0.474 |
| the 2 `audio` notes | 2 of 2 |
| 1,668 null samples | **0.029** |

**The random 40.**
- **32 of 37 `tab+audio` notes pass the rule.**
- The other five are heard in the pictures (`frames/spec_f1.png`, `spec_f2.png`, `zoom_142.png`):
  - #26 (C#4, 12.098 s): every partial rises 30 dB at the key. Its hammer target 35 ms later shares the partials the
    rule needs.
  - #46 (E4 hammer target, 18.234 s): E4 h1 rises 20 dB at the hammer.
  - #142 (A3 in a rolled F#m chord, 58.114 s): h2-h4 rise 15-28 dB at the key time.
  - #324 and #375 (A3 re-plucks): h1 rises 12-18 dB after a damping dip.
- **The 3 `tab` notes:**
  - #349 passes the rule. So that `tab` note may be heard; that errs on the safe side for heard-only recall.
  - #182 and #310 do not pass. In `frames/zoom_310.png` E3 h1 is flat through the key time and through the strong
    attack at 117.175 s, as the repair's per-note file says. `tab` is right.

**Timing** (`bin/ptrace40_v2.py`, `out/ptrace40_v2.json`, `logs/timing40.log`). The attack is the steepest 20 ms step
of the summed usable partials in a 1,024-point STFT, hop 1.45 ms.
- 36 of the 37 `tab+audio` notes have a clear step (≥ 3 dB).
- Their median attack is **-19.6 ms** against the key, p10-p90 -28.3..-10.9. That is the key's convention: the record
  measures the steepest rise + 17.0 ms.
- **34 of 36 lie within 25 ms of that median, and all 36 within 50 ms.**
- **Doubt, not a fault:** #7 (4.110 s) and #142 (58.114 s) step 36 and 42 ms after the median. Both re-pluck an open A3
  that is still ringing.
  - In the 4,096-point traces (`frames/zoom_7.png`, `zoom_142.png`), #142's h2-h4 rise at the key time; the
    1,024-point sum is pulled by the decaying h1.
  - #7's rise centres at about 0 to +15 ms.
  - The record already lists #7, with #16 and #319, among the notes 26-38 ms from the convention. Both are inside the
    50 ms tolerance. #4 (1.933 s, also an A3 re-pluck) has no clear step, but its h2, h4 and h5 rise 14-20 dB at the
    key time (`frames/zoom_4.png`).

**The 14 moved notes and #292.** Every one is heard at its new time.
- Ten pass the rule. #103, #136 and #255 were looked at in `frames/zoom_103.png`, `zoom_136.png` and `zoom_255.png`:
  their h1-h3 rise 20-40 dB within about 20 ms before the key. #150 passes through the presence rule.
- **Timing:** 12 of the 14 step within 9 ms of the median above.
- **#376 and #377** (the fourth chorus D chord) step earlier by the 1,024-point measure, because the A3 pluck 52 ms
  before shares their window. In `frames/zoom_376.png` the F#4 rises at the key time.
  - In `zoom_377.png` the E4 rises from about 90 ms before the key to 20 ms after it.
  - Its centre may be 10-15 ms earlier than the convention puts it. That is inside the tolerance, and the record
    already calls #377 weak.
- **#292** (F4, 108.170 s): in `frames/zoom_292.png` F4 h1 rises about 20 dB into the key time, and the E4 line starts
  about 100 ms later. That is the repair's account.

**Other named notes.**
- #153 (A3 after the G#3 #152, 61.359 s) is heard: h2-h6 step at about -20 ms (`frames/zoom_153.png`).
- #13 and #357 (A3, `tab`) do not pass the rule, consistent with `tab`.

## 5. No note transcriber: PASS

- **Names:** every script, log, JSON, Markdown, text, TSV and CSV file in `/home/user/gtv/work/heldout-september/`
  (outside `audit/`, 237 files) was searched for transcriber names. The names were Basic Pitch, Transkun, YourMT3 /
  MT3, Noise2Fret, Riley / guitar-fl / guitar-gaps, the kit's `notes_guitar`, Onsets and Frames,
  piano_transcription, CREPE, pYIN, Omnizart, TabCNN and Demucs, with any spelling. The only hits:
  - the key's own `no_transcriber` derivation string, which `key/bin/build.py` and `fix/bin/build_fix.py` write;
  - a Spotify link in the downloaded post (`dl/post.json`).
- **Imports:** across the 91 Python scripts (fetch, readers, builder, check, repair) the imports are:
  - `numpy`, `scipy`, `librosa`, `soundfile`, `PIL` and `matplotlib`, plus standard-library modules;
  - `pretty_midi`, for the MIDI side file and FluidSynth input;
  - `mir_eval`, only for onset F-measure in `key/bin/check_render.py`;
  - the research's `gtr_common` writers;
  - the agents' own modules (`common`, `near`, `heard`, `conv`, `reading`).
- **Subprocesses:** the scripts call `ffmpeg`, `curl` (the fetch), `tools/bin/notes2wav.py` (FluidSynth) and
  `gtr-eval`.
- **Interpreters:** the research's `venv-torch` (Python 3.11) and the system Python 3.13 (reader B's `reading.py`).
  No compiled file comes from `venv-bp`, the Basic Pitch venv.
- **The `gtr-run` ledger** (`/home/user/gtr/ledger/runs.jsonl`, 1,518 runs):
  - 15 runs mention september: the encode (r1317), the check (r1324-r1337), the repair (r1476-r1479) and this audit.
    None is a transcriber.
  - None of the 439 transcriber-like runs mentions september.
- **Elsewhere on the box:** no file named after the song exists outside its own folders, the blog records and the
  scouts' selector pictures. No script outside the slot's work folder reads `songs/september/`.
- **The repair's copies of the check's scripts** (`fix/c1/bin/`) equal the originals, except `verdicts.py`. There only
  the output path changed and the check's re-timing table was removed. The rule is unchanged.

## 6. Counts in the record: FAIL (three numbers)

Recomputed from the files (`bin/counts_audit.py` → `out/counts_audit.json`, `logs/counts_audit.log`). The first build
is `orig/september.truth.json`.

**Wrong:**
1. **Line 120 (Method 1):** "the same marks on the same 7 origin events".
   - `read-A.json` and `read-B.json` each have **9 marked events**, the same 9:
     - bar 2 ev 5 h, ev 14 h, ev 15 p;
     - bar 3 ev 5 h, ev 14 h, ev 15 p;
     - bar 11 ev 8 slide;
     - bar 12 ev 0 h, ev 1 p.
   - The builder's merge note (`september.tab-merged.json`, `merge.decisions`) names these as **6 figures**.
   - Played through the form they give the key's 26 legato targets exactly (h 14, p 8, slide 4).
   - Fix: "the same marks on the same 9 events (6 figures)".
2. **Line 338 (Repairs):** "After the repair the E4 follows the F#4 by 92 ms; in the other three chords the gap is
   108-124 ms."
   - The key gives 115.9 ms (#164 → #165), 104.5 ms (#205 → #206) and 105.5 ms (#335 → #336). The 91.8 ms of #376 →
     #377 is right.
   - Fix: "104-116 ms".
3. **Line 230 (Checks, "the same detector on the rendering against the recording"):** "F 0.836 (P 0.970, R 0.734)".
   - No file holds these numbers:
     - `key/check/render_nylon.json` (first build): F 0.838, P 0.972, R 0.736;
     - `fix/check/render_nylon.json` (repaired key): F 0.837, P 0.968, R 0.738.
   - The 34.8 ms and 23.2 ms in that row are right.
   - Fix: give the repaired key's numbers, with the first build's in brackets.

**Wording, line 229 (Checks, the mel-detector row):**
- "(per 10 s 0.93-1.00)" sits in the "before the repair" part. The first build's file gives 0.94-1.00; 0.93 is the
  repaired key's lowest window.
- "it misses 40.196, 64.563 and 100.478 s" names the 3 new misses. The detector misses 12 of the 406 events: the 9 of
  the first build plus these 3. Say "it also misses".

**Stale after this audit:**
- Line 17: "Whether another agent re-checks the repair is the orchestrator's call".
- Lines 263-264: "The repair has been re-checked only by its own second pass so far".

Point both at this record.

**Reproduced exactly:**
- **Notes:**
  - 417 (melody 254, bass 131, chord 32); `conf` 377 / 38 / 2, before 351 / 64 / 2.
  - 26 legato (h 14, p 8, slide 4), of which 23 are `tab+audio` (22 before).
  - First onset 0.308 s, last 151.412 s. The two `audio` notes are G#4 s2 f7 at 84.695 and 144.312 s.
- **The 38 `tab` notes:**
  - by string s3 19, s4 15, s2 4; by voice melody 23, bass 11, chord 4; 3 legato targets;
  - #13 at 7.518 s and #357 at 131.106 s are A3.
- **The first build's 64 `tab` notes:**
  - by string s4 29, s3 27, s2 6, s5 1, s6 1;
  - 37 re-plucks of a pitch in the 3 events before, 16 other single notes on strings 3-6, 7 chord notes, 4 legato
    targets (my own grouping over `key/out/built_detail.json`).
- **Beats and form:**
  - 192 beats, 48 downbeats; tempo 78.01 bpm, 60 / the median beat (77.71 before).
  - Beats: median 0.769 s, IQR 0.749-0.813, range 0.685-1.056. Before: median 0.772, shortest 0.586.
  - 62 chord segments (A:maj 19, E:maj 16, F#:min 10, D:maj 7, D:min 3, G#:min 2, G#:maj 1, N 4), with the same labels
    as the first build. Key A major.
- **Events and readers:**
  - 364 events with 415 tab notes; 15 four-note chords and 6 dyads, so 51 notes above the lowest.
  - 348 of 364 events on a flux peak; the 16 skipped are all hammer or pull targets (`key/out/align4b.json`).
  - The readers: 164 events and 188 notes each, all 164 events the same string, fret and marks; x positions within
    18 px.
  - The ten section starts (0.308 ... 145.850 s).
- **Repairs:**
  - All 14 before / after times and shifts of the table, and its steepest-rise and SuperFlux columns
    (`fix/logs/moves.log`). Pitch, string and fret are unchanged for every note.
  - 14 offsets changed; #31's offset 13.1044 → 14.1341.
  - 7 beats and 4 downbeats moved, at the record's times. No other note, beat or chord label changed.
  - `conf`: 31 up and 5 down (#253, #310, #327, #355, #357). That is the check's 30 up plus #150, which is the only
    note where the key differs from `check1.json` (376 / 39 / 2).
  - Notes under 30 ms: #26 and #108 (before also #31). `september-repairs.csv` has 60 rows.
  - The two scans flag 38 notes = the 14 moved + the 24 kept, with the same four groups as the record.
  - The F#4 of the D chords follows the A3 by 46.7-52.3 ms ("40-55 ms").
  - The problem-1 rises (+6.3 → +9.7 dB, and the rest).
- **Convention, onsets and the check's rules:**
  - The convention: 249 clean notes; SuperFlux + 8.7 ms (IQR 5.8-11.6); steepest rise + 17.0 ms (IQR 12.7-19.9).
  - SuperFlux 0.978 of 406 within 50 ms and 0.968 within 30 ms (0.978 / 0.963 of 402 before).
  - Own-pitch estimate: 0.898 of 383 within 25 ms and 0.932 within 40 ms (0.872 / 0.909 before).
  - `ponset`: 0.962 of 289 within 30 ms, 1 later than 35 ms (0.937 of 287, 5 before).
  - The check's two rules: 0.818 (0.813 before).
- **Self-checks:**
  - Chroma: nylon 0.818 / 0.523 and steel 0.875 / 0.615 (0.817 / 0.524 and 0.874 / 0.615 before).
  - Mel detector: 0.970 of 406, median -11.6 ms (p10-p90 -17.4..-5.8). Early / late 1 / 6 after the repair and 1 / 4
    before.
  - Before the repair: 0.749 of 526 detections near a key onset; of the other 133, 88 lie 50-150 ms before a pluck
    and 15 after.
  - The conf calibration: 0.851 after, controls 0.061-0.077; 0.846 before, controls 0.056-0.071.
- **Taps and the second pass:**
  - SuperFlux 1.36 at 120.227 s and 0.61 at 132.804 s; the five clicks 0.60-1.63.
  - The second pass: 27 heard, 3 `tab` (#28, #85, #310), the numeric rule agrees on 39 of 40 (not #46).
- **Fetch:**
  - Chroma 0.854 at the stated tuning, 0.870 for standard + capo 2.
  - The open 5th string's A2 at +13.7 to +19.6 dB.
  - +5.0 cents (four windows +5 to +6).
  - r1317: 1,116 s on 2 cores.
- **`check-truth` of the first build:** 4,325 checks, 0 mismatches.

**One claim checked and kept:** "none shows a clearly better pitch rise at its estimate than at the key" (What remains
uncertain).
- In `fix/logs/residual_repaired.txt`, 4 notes rise at least 3 dB more at the estimate than at the key: #85, #180 and
  #197 (all `tab`) and #265 (+23.8 against +27.1 dB, 26 ms apart).
- The three `tab` notes show no rise at either time (#85: `frames/zoom_85.png`, a beating A3).
- So the claim holds. The sentence before it, "The ones further off are re-plucks of ringing open strings", is not true
  of all of them: #58 and #121 are fretted F4. Their own pitch rises 23-27 dB at the key and about 0 dB at the
  estimate, so the key is right there too.

## 7. Rights note and credit line: PASS

- **`september.md`, "Source and credit" and "Rights note":**
  - the source: the Vimeo video through the player, and the Intellimusica post and its handwritten PDF;
  - the licence as stated: none. The site footer is quoted, and the post's "Feel free to share" is read correctly as
    an invitation to share, not a licence;
  - that the composition is Green Day's and the arrangement Evan Handyside's;
  - the tab's access: a public upload reached through the site's public API behind a subscribe gate. No account was
    made and nothing was bought, and a free account or a word with the player is needed before the film shows the tab;
  - the care the memorial post asks for in public use;
  - the credit line.
- **The key JSON:** `source.license`, `license_quote` and `attribution` carry the same licence and credit line, in the
  same form as `capo.truth.json`. The credit line also heads `september.tab.txt`.
- **Open item, not part of this item:** the training-set check of the NOTES brief (section 5: GuitarSet, GAPS train,
  the Leduc set, GOAT).
  - The record (lines 49-50 and 265-267) argues it away: GuitarSet predates the 2023 video, and a Vimeo-only pop
    arrangement is unlikely in the others.
  - The record says itself that this is "not proven". The check is still owed, as for `closer`.

## 8. Nothing private in the repo record: PASS

- **The never-publish scan** (the `scripts/check/never-publish.mjs` keys against `src/data/never-publish.json`, as in
  EMBED.md 2.4) finds **0 hits** in `september.md` and `september-check.md`. This record was scanned the same way after
  writing.
- **Links and hosts:**
  - Neither record has a URL. The only host names are `vimeo.com`, `player.vimeo.com` and `intellimusica.com`, all
    public.
  - A search for signed-link parameters (the AWS signature, expiry, token and hmac query fields), CDN hosts, the
    project's hosting and storage domains, session links, key-tool names and personal paths finds nothing.
  - The only file paths are the research box's `/home/user/gtv/` folders.
  - The player config with its signed links stays in the work folder (`dl/`), with the links dropped, as the record
    says.
- **The per-note files** are kept out of git: `notes/.gitignore` has `heldout/*.csv` and `heldout/*.json`.
- **The record is committed:** the committed `september.md` (14705f01) equals the working copy.
