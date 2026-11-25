# Fact-check of the film's script, before voicing

Agent `script-factcheck`, 2026-11-25. Checked `/home/user/gtv/production/SCRIPT.md` and the 18 chapter folders
`/home/user/gtv/production/chapters/chNN-*/` (`script.md`, `brief.json`) against the experiments' `result.json` files,
[RESULTS.md](../RESULTS.md), [BLIND-RESULTS.md](../BLIND-RESULTS.md) (round 2), [BLIND.md](../BLIND.md),
[audit-blind.md](audit-blind.md), the step records, the truth records, [truth-doubts.md](truth-doubts.md), songs.json and
the post. I did not write the script and changed nothing in it. Work folder, scripts and logs:
`/home/user/gtv/work/script-factcheck/` (`PROGRESS.md`, `problems.md`).

**Verdict: not ready to voice.** Every number on screen and in the narration has a source and matches it (rounding as
said), the four points the film must say are there, round 2 carries the blind result, and every data file named in a
brief exists. But three narrated sentences are wrong, three claims leave out a caveat their source states, one point
contradicts the post, and seven shots show tools without their version. Fixes below; all are one-line edits.

## How it was checked

| check | script (in `.../script-factcheck/bin/`) | result |
|---|---|---|
| SCRIPT.md = chapter `script.md` = `brief.json` (lines, shots, frames, on-screen, tags, windows, data) | `parse.py`, `consistency.py` | 159 narrated lines, 96 shots, 75 listening windows: 0 differences |
| every path named in a brief exists | `paths.py` | 235 paths (and every `strip.NN.png` pattern): 0 missing |
| every number said or on screen, listed and looked up | `numbers.py` -> `numbers.csv` | 1,470 numbers (329 said, 837 in frames, 304 in on-screen lines): 1,464 found in the shot's own screen or cited sources or the records; 6 not found = 2,122 and 1,889 (sums, checked by hand: 815+628+679, 761+556+572 from the truth records) and one window bound |
| each on-screen line against the source it cites | `onscreen.py`, `locate.py` | 115 lines: 91 matched automatically; the other 24 (sources written as `<S>`, `work/...`, or none) checked by hand |
| meaning of every number and claim | by hand, chapter by chapter | the problems below; the rest holds |

The script finds a number in a source; it cannot tell whether it is the right field. The meaning of each number was
checked by hand against the field or table row it comes from (e.g. `labels.json` per note for ch04 l06).

## Problems to fix before voicing (most serious first)

1. **ch04 l06, wrong.** "Here it missed twenty-one notes, two of them notes the key's own checkers doubted." In
   `/home/user/gtv/experiments/tuning/n-02/labels.json` only #397 (113.192 s, C4) of the 21 misses in 111-131 s is a
   doubted note; #435 (123.745 s, D2) is `hit` (30 ms early). **Fix:** "one of them a note the key's own checkers
   doubted" (and no '?' miss mark on #435 in s4).
2. **ch08 l04, wrong.** "Each keeps its pitch on another string, so played back it sounds the same." In 49-64 s tuttut
   without the tuning has 37 on another string, 15 on the same string at another fret and 4 unmatched: four low D2s
   written an octave up, since standard tuning has no D2 ([step-06](step-06-string-fret.md) "Notes below the lowest
   open string": 37 such notes in the song; `tuning/f-01/labels_tab.json`). The listening window lets the viewer hear
   them. **Fix:** "Fifty-two of the fifty-six keep their pitch in another place; four low Ds come out an octave higher."
3. **ch14 l09, s5 card 3 and the ch14 finding, wrong.** "The audits found they used none of them" / "None was used".
   [BLIND.md](../BLIND.md) section 7, round 2: "the attempts used ToolSearch twice and TaskStop once, to stop their own
   background command"; [audit-blind.md](audit-blind.md) R2.3 and R2.4. **Fix:** "The audits found no web, MCP, skill
   or helper-agent call; two attempts used ToolSearch, and one stopped its own command with TaskStop."
4. **ch08 l03, s2 and the ch08 finding, caveat missing.** Guitab's 0.780 / 0 / 0.839 are matched by note order: its
   GP5 runs on its own beat grid, and by time only 69 of 815, 24 of 628 and 11 of 679 notes match
   ([step-06](step-06-string-fret.md) "How to read"; RESULTS.md step 6). ch02 l10 defines the film's score "at the
   right time", and s2 sets Guitab beside time-matched bars. **Fix:** label the Guitab bars "matched by note order; by
   time 69 of 815" and say so in l03.
5. **ch10 s4 against ch09 l07, contradiction.** ch09 says the nylon guitar has "no cells at all"; ch10 s4 then shows
   pinned runs on the nylon song (0.967 -> 0.914 and -> 0.713). RESULTS.md step 8: "The tuning song has no step-7 grid,
   so its rows use a grid scaled with the truth maker's fret count: not tool-only." **Fix:** mark the nylon bars "grid
   from the key maker's fret count, not tool-only" (or drop them; "12 of 12" then needs the same note). Same source
   for chain-3 on the nylon song (ch13 l02 "blind too"; no effect on its score, 0.081 = chain-1).
6. **ch16 l03 and s2 station 1, caveat missing.** HPSS is recommended "where the player slaps the strings" next to the
   guitar-trained models of l04, but in front of those models it lowered F1: capo 0.920 -> 0.914, Imagine
   0.892 -> 0.876 (`capo/n-03-sep07`, `standard/n-03-sep07`; [step-09](step-09-tabs-and-chains.md) chain table;
   RESULTS.md "For someone choosing tools" row 1; BLIND.md section 1). The 0.689 -> 0.783 shown is Basic Pitch's.
   **Fix:** "HPSS helps a general note model like Basic Pitch on slapped strings; in front of the guitar-trained
   models it changed nothing."
7. **ch08 (Guitab) against the post, contradiction.** The post says of Guitab 1.2.0: installing it "was refused" and
   "its browser page was fetched but not run". The film shows Guitab results (f-07, headless Chromium, model E25).
   **Fix:** one clause in ch08 l03 ("Guitab, which the post's survey could not run, ran here in its browser page"),
   or the post's sentence that EMBED.md item 2 asks for.
8. **Tools shown without a version or the setting that matters** (the film's own rule: a tag every time a tool is
   shown; versions from each `result.json`):
   - ch03 s5: six separators, no tag (Demucs 4.1.0 htdemucs_6s weights 5c90dfd2 / htdemucs 955717e8; guitar fine-tune
     HF 9d3ade8 via Demucs 4.1.0; ElevenLabs six_stems_v1; librosa 0.11.0 HPSS default; scored by Basic Pitch 0.4.0).
     s6 shows the fine-tune's 6.10 dB without its tag.
   - ch04 s2: guitar-fl.pth and guitar-gaps.pth rows lack their runner, piano-transcription-inference 0.0.6.
   - ch05 s2: partitura's 7 / 7 / 8 voices, no tag (partitura 1.9.0).
   - ch06 s5: lv-chordia is shown and named (l08, best on Imagine) but has a tag nowhere in the film (lv-chordia 1.1.0).
   - ch09 s4: Imagine grid and fingertip cells, no tag (repeat s3's: OpenCV contrib 5.0.0.93 LSD/Hough, 12-TET fit).
   - ch10 s2: the y-02 tag names neither the hand tracker nor the grid (MediaPipe 1.2.2 + the w-05 Hough grid).
   - ch16 s2: the recommended tools carry no versions, in the chapter a reader would act on (guitar-fl.pth via
     piano-transcription-inference 0.0.6, Beat This! 1.1.0 final0, madmom 0.16.1, lv-chordia 1.1.0, tuttut 0.0.7,
     LilyPond 2.24.3, alphaTab 1.9.0, FluidSynth 2.3.4, librosa 0.11.0, ElevenLabs six_stems_v1).
9. **ch03 s6, source.** "6,268 credits, $1.379: E/capo/sep-06/result.json": not in that file. They are in
   `capo/sep-06/api.log` (`credits_used_measured` 6268, `cost_usd_counted` 1.37896) and `record/record.json`.
   **Fix:** cite `api.log`.

## Small points (fix if cheap)

- ch00 s1 / title card: "The tuning and the capo decided the rest" is not a measured statement and reads oddly next to
  ch15 l11 (the arms' gap came from finding the notes). Suggest "Reading the tuning and capo mattered most."
- ch03 s7: frame says "no score shown" but its source line shows "segment F1 0.763 vs 0.745". Drop one.
- Basic Pitch on Imagine, whole song: 0.664 in ch03 s5 (`standard/sep-00`) and 0.663 in ch04 s2 (`standard/n-01`),
  two runs. Use one value or say they are two runs.
- ch07 l10: "fifty to sixty-two cents" for $0.51-0.62 (RESULTS.md step 5): "fifty-one to sixty-two".
- ch09 s3 and s4: the readouts ("2 of 50 here", "EXACT 0 of 67") count 12.76-32.76 s and 107-127 s while the shots
  show 17-23 s and 107-117 s. Name the 20 s window in the readout.
- ch12 l01: "each offered thirty seconds of each song": Klangio uploaded nothing and Fretwise got only the capo segment
  (RESULTS.md step 10). Say "offered the thirty-second segments".
- ch14 s6: "FILE WATCH ... : none". The watch logged none on truth, songs, experiments and work, but it did log
  directory listings of this records folder and one read of PRODUCTION.md, all by the orchestrator's hooks and the
  harness (audit R2.5). Say "none by an attempt".
- ch15 l11: "both arms placed it right about equally often" holds for capo (0.966 / 0.977) and Imagine (0.941 / 0.928),
  not for the nylon song (0.798 / 0.690), which s12 shows. BLIND-RESULTS.md says the same as the film; suggest "on the
  steel-string songs".

## Notes for the records (not errors in the film)

- The nylon song's key: the film calls D minor against F major a judgement (ch06 l11, ch15 l12, s12), as
  truth-tuning.md ("Key `D minor` (a judgement)") and RESULTS.md Limits do. BLIND-RESULTS.md "Across the three songs"
  counts the bare arm's F major as a miss ("the key on all but one"), and truth-doubts.md does not list the key. Add
  it to truth-doubts.md or reword that line, so the records agree with the film.
- The film does not mention audit R2.6's first setup problem (the blind videos are hard links of the named recordings;
  no attempt looked). Optional: one clause in ch14 l10.
- The credit lines (ch00 s2, ch01 s2-s4, ch17) are songs.json's `credit` strings in full; they name the original song
  artists in brackets. That fits "credited as songs.json says"; if only performers and tab authors may be named, drop
  the brackets.
- ch11 s4 plays alphaTab's own export, which clips 11.7-13.7 % of its samples (RESULTS.md step 9): an audio quality
  point for the editor, not a fact.

## What holds

- **Numbers.** Every on-screen and narrated number matches its source: the round-2 blind tables (0.930 / 0.865 / 0.548
  against 0.816 / 0.705 / 0.347, right / wrong / missed / invented per arm and chain, the three 20 s windows, minutes),
  round 1 only in ch15 s13 marked "to-do list visible", the chain tables and loss per step, steps 1-10 (separators,
  note tools, voices and taps, beats and chords, tuning and capo, string choosers, video, pins, file writers, hosted
  calls), the truth counts (815 / 628 / 679; 761 / 556 / 572; 997 of 1,007; 853 of 853; 134 of 134) and every time
  and cost range.
- **Must say.** Round 2 is the result and why round 1 was re-run (ch14 l06-l07, s5 card 1, 13 to 18 attachments, 103
  empty reminders); the kit was picked and measured on these recordings (ch14 l08, card 2, BLIND.md section 7); the
  tool list was not enforced (ch14 l09, card 3, 55 tools and 540 deferred: but see problem 3); doubtful keys are
  listened to, not graded (rule ch01 l13; nylon beats ch06 s3 and ch15 s10, shifted F only with its shift named; the
  Imagine cents ch07 l02; sevenths ch06 l10, majmin only).
- **Post.** The five places where the film's numbers differ from the post's (SCRIPT.md table) each give their reason
  on screen (ch03 l10, ch04 l10, ch06 l09, ch07 l06, ch11 l05), and the post's figures quoted match it (lone
  synthesized guitar in Demucs' piano track 2 of 2; 87 to 137 notes for 90; 18.8 to 23.2 of 24 s; MiMo fret 2 in
  2 of 3; four readers keep all 90 notes). Only problem 7 contradicts it.
- **Tool tags.** All 42 distinct tags match the `version` field of their experiments (Transkun 2.0.1, Basic Pitch 0.4.0
  tflite, librosa 0.11.0, Demucs 4.1.0, msst 0.1.0, YourMT3+ Space bd69fbac, madmom 0.16.1, Beat This! 1.1.0 final0,
  chord-extractor 0.1.3, OWLv2 base-patch16-ensemble with transformers 5.22.2, tuttut 0.0.7, LilyPond 2.24.3, scorify
  0.4.0, tabsynth 1.0.6, TabCNN Zenodo 11406378, Guitab 1.2.0 E25, MediaPipe 1.2.2, rtmlib 0.0.16, OpenCV contrib
  5.0.0.93, CoTracker3 82e02e8 on torch 2.15.0, SAM 2.1 hiera-tiny, alphaTab 1.9.0, Opus 5.5 effort max). The credits'
  FluidSynth 2.3.4, audio-separator 0.48.0, HyperFrames 0.9.91 and eleven_multilingual_v2 check out.
- **Privacy.** The only people named are Gareth Evans and Evan Handyside, credited as songs.json says. No footage or
  sound of the job's owner: the sounds are the three songs.json recordings, renders of tabs and S4, a band clip the
  post says was synthesized. The earlier test appears once, as the allowed sentence (ch15 l13), with no number. No
  key-like string in the script or briefs; nothing private on screen.
