# Shared test inputs: manifest

Built 2026-11-10 (UTC) by the `inputs-builder` agent; R3b and R3c were added the same day (20:52 to 21:35 UTC) by the
`inputs-video` agent. Audio and video live in `/home/user/gtr/inputs/<id>/`. The manifest, the scripts and every
small truth file (.json .mid .csv .txt .lab .gp5) are copied to `docs/guitar-tab-research/inputs/<id>/` in the blog
repo; no audio or video is copied there.

Scripts (in `docs/guitar-tab-research/inputs/scripts/`): `make_synth.py` (S1 to S7), `make_guitarset.py` (R1a to R1c),
`make_r2.py` (R2, R2full), `make_r3.py` (R3a), `make_r3bc.py` (R3b, R3c truth files), `encode_r3_excerpt.sh` (the
R3b and R3c excerpt encodes, R3a's settings), `check_r3bc.py` (R3b, R3c read-back), `make_manifest.py` (this file),
`gtr_common.py` (shared writers), `inputs_notes.md` (the hand-written part of this file). Check reports:
`_checks/synth_checks.json`, `_checks/guitarset_checks.json`, `_checks/r2_checks.json`, `_checks/r3bc_checks.json`.

Run ledger (`/home/user/gtr/ledger/runs.jsonl`, lane `inputs`): r0007 first synth render (superseded by r0008, same
script before three fixes), r0008 final synth render (wall 28.55 s), r0010 R3a encodes (wall 19.3 s), r0011 R3a
scene-cut scan (wall 32.5 s), r0056 R3b-source scene-cut scan (wall 87.3 s), r0142, r0146 and r0152 R3c-source
scene-cut scans over 200-270 s (r0152 used; wall 32.7 s), r0169 R3b encodes (wall 237.7 s, 143.4 CPU s), r0175 R3c
encodes (wall 183.6 s, 105.4 CPU s), r0183 R3b/R3c read-back (`check_r3bc.py`, wall 10.0 s). The R3c scans,
the R3b/R3c encodes and the read-back ran with `--nolock` (no CPU slot, not pinned) because about 17 runs of other
lanes were queued for the two slots at 21:16 UTC; the encodes were limited to 2 threads (`FF_THREADS=2`). Their wall
times are not comparable with slot runs. The GuitarSet, R2 and R3 truth scripts are light file conversions and were
not run through `gtr-run`.

## Clips

<!-- TABLE -->

Missing clips: none since R3b and R3c were added. The first build had left them out because every download from
upload.wikimedia.org between 19:59 and 20:26 UTC was answered with HTTP 429 ("Too many requests"). On the second
attempt the Commons API answered 429 twice between 20:52 and 20:56 UTC (Retry-After 26 s) and then answered again,
and upload.wikimedia.org answered 429 (Retry-After 600 s) to the uploaded original of "Manx Guitar Lesson- Three
Little Boats 2019.webm" at 20:56 and again at 21:06 UTC; Commons' own VP9 1080p transcode of that file was served at
21:08 UTC (HTTP 200) and is the R3c source. R3b comes from archive.org, which answered normally. Looked at and not
used: the five "Fingerpicking pattern ..." files by Elenaf (Commons, CC BY-SA 3.0) are 480x360, below R3a's 640x480,
and 15.8 to 24.7 s long (not downloaded); archive.org item RhythmGuitarLesson (CC BY-SA 3.0, 1280x720 WebM) is a
lesson on keeping "a rhythm with a good steady beat" (its description; not downloaded); two of Larry Heyl's guitar
videos on archive.org (delta_cotton, major_ninth, CC BY 3.0) have 320x240 originals; archive.org item
8.3-scales-cham-burstein (CC0, 1920x1080, 101 s, "Guitar Scale Practice Exercise") was not looked at further;
archive.org items whose license field says CC BY or public domain but which are covers of copyrighted songs, YouTube
re-uploads by third parties or commercial instructional videos were skipped, because the uploader is unlikely to
hold the rights. The "Didldu ..." and "Sharon Isbin ..." Commons files named by the first build were not checked. A
freely licensed video with a capo on the neck or with percussive body taps was not found in the time spent (20:52 to
21:35 UTC); R3c is the "both hands visible" variant. No NonCommercial or NoDerivatives file was used, no non-free
video was substituted, and nothing was downloaded from YouTube.

## Truth schema and conventions

One `<id>.truth.json` per clip, exactly this shape (fields that do not apply are `null` or `[]`):

```
{"id", "title", "what", "audio", "duration_s", "sample_rate", "channels", "tempo_bpm", "time_signature", "key",
 "tuning_midi", "capo", "tuning_offset_cents",
 "notes": [{"onset", "offset", "pitch", "velocity", "voice", "string", "fret"}],
 "beats": [...], "downbeats": [...], "chords": [{"start", "end", "label"}], "taps": [{"time", "kind"}],
 "stems": {name: relative path}, "source": {"kind", "url", "license", "license_quote", "attribution"}}
```

- Times are seconds from the first sample of the clip's audio file. `pitch` is the sounding MIDI note number.
- `tuning_midi` lists the open strings low to high (string 6 to string 1) without a capo. String 1 is the highest.
  `fret` is counted from the capo: sounding pitch = `tuning_midi[6 - string] + capo + fret`.
- `voice` is one of melody, bass, chord, lead, drums. Chords are Harte labels (mir_eval.chord); `N` = no chord.
  `key` is "<tonic> major" or "<tonic> minor". `source.kind` is synthesized, dataset, recording or video.
- Side files per clip: `<id>.notes.csv` (onset,offset,pitch,velocity,voice,string,fret), `<id>.beats.txt` (beat
  time, tab, beat number in the bar), `<id>.chords.lab` (start, tab, end, tab, label), `<id>.tab.txt` (ASCII tab:
  six lines, string 1 on top, labelled with the open-string pitch, one column per 16th note, bar lines, the start
  time of each bar printed above it), `<id>.mid`, `<id>.mono.wav` ((L+R)/2).

Conventions specific to these files:

- **Count-in.** Every synthesized clip starts with one bar of count-in, so no note sits at sample 0 and the MIDI
  bar lines line up with the music. It is silent in S1, S2n, S2s, S3, S5capo2, S5dropd, S6taps and S7flat30 (the
  first note is at 4 beats). S4 has one silent bar, then a count-in bar of four side-stick clicks (GM key 37), then
  the song. `beats` and `downbeats` start at the first sounding bar (the count-in bar of S4 is included because it
  is audible); the silent count-in bar has no beats. In the MIDI files the count-in is bar 0.
- **Chords** cover the whole file: `N` over the count-in, then the chords, and the last chord runs to the end of
  the file (its decay). S1 is a single-note melody: `chords` is `[]` and `S1.chords.lab` is empty. In S2n, S2s,
  S5capo2, S5dropd and S6taps nothing is strummed; their chord labels are the harmony the bass and melody of the
  arrangement were written to (one label per half bar, merged when repeated).
- **Voices.** S2-family: melody / bass. S3, S7flat30: chord. S4: drums, bass (electric bass), chord (strummed
  guitar) and melody (the lead line, GM program 53 Voice Oohs, standing in for a singer, = `stems/lead.wav`). R1a and
  R1c (GuitarSet "comp" takes): chord; R1b ("solo" take): lead. The R1 voice comes from the take type, not from a
  per-note annotation.
- **Non-guitar notes.** In S4, bass, melody and drums notes have `string` and `fret` = null. For `voice` = drums,
  `pitch` is the General MIDI percussion key (36 kick, 37 side stick, 38 snare, 42 closed hi-hat, 49 crash), not a
  sounding pitch, and `offset` is the MIDI note-off (0.25 beat after the onset); the drum samples play to their own
  end.
- **Velocity** is the MIDI velocity for synthesized clips and `null` (empty in the CSV) for GuitarSet, which does
  not annotate it. The R1 MIDI files use a fixed velocity of 80.
- **Note offsets** in synthesized clips: written length minus 10 ms; a strummed string ends 10 ms before that
  string is struck again or before the next strum of a different chord; the last chord rings to the end of the
  last bar. The lead line (S4) ends 60 ms before its written length.
- **Strums** (S3, S4, S7flat30): down strums hit every string of the shape from low to high, spread over 25 ms;
  up strums hit strings 1 to 3 from high to low over 20 ms. Each string's onset in `notes` is its own time; the
  beat grid and the tab use the strum's nominal beat (its first string).
- **S6taps taps:** `kind` "slap" = GM key 37 (Side Stick), velocity 78, on beats 2 and 4 of bars 1 to 12 (24 hits,
  each together with a bass note); `kind` "thump" = GM key 35 (Acoustic Bass Drum), velocity 88, on beat 1 of bars
  1, 5 and 9 (with a bass note) and on the "and" of beat 4 of bars 2, 4, 6, 8 and 10 (between notes): 32 taps.
  `stems/guitar.wav` is the guitar alone, `stems/taps.wav` the percussion alone, at the mix's gain.
- **S5dropd** is not the same note list as S2: the melody is unchanged, G2 moves from string 6 fret 3 to string 6
  fret 5, and the D-chord root moves down an octave from D3 (string 4 open) to D2 (string 6 open, 4 notes), so the
  audio contains notes below E2.
- **S5capo2** has the same strings and frets as S2n, with `capo` 2; every pitch is 2 semitones higher (A major).
- **S7flat30** has the S3 notes with their nominal (equal-tempered) pitch numbers and `tuning_offset_cents` -30.
- **GuitarSet (R1).** `string` = 6 - data_source of the JAMS note_midi annotation (data_source 0 is the low E
  string); `pitch` = the annotated MIDI value rounded; `fret` = pitch - open-string pitch (standard tuning). No
  negative frets resulted. The excerpt is [0, t1) where t1 is the last annotated downbeat at or before 30 s; notes
  starting before t1 are kept with offsets clipped to t1 (R1a drops 46 notes that start later, R1b 4, R1c 21).
  `chords` is the JAMS chord annotation without a data_source (the lead-sheet chords the player was given);
  `<id>.chords_performed.lab` is the second chord annotation, whose data_source reads "Semi-automatic chord
  transcription with manual verification". `tempo_bpm`, `key` and the beat grid are the JAMS tempo, key_mode and
  beat_position annotations. In the tab, positions are rounded to the nearest 16th of the annotated beat grid
  (R1b has 4 notes that fell on an occupied string and column and are not drawn; the truth JSON has all of them).
- **R2, R2full, R3a, R3b, R3c** have no ground truth: notes, beats, chords are empty and tempo, key, tuning and capo
  are null. For the R3 videos, `what` says what is in frame and where the camera cuts are (a visible capo or its
  absence is stated there, not in `capo`).

## How the synthesized clips were made and checked (`_checks/synth_checks.json`)

- Rendering: `fluidsynth -ni -q -T wav -O float -r 44100 -g 0.5 -R 1 -C 0 -o synth.polyphony=1024 -F out.wav
  /usr/share/sounds/sf2/FluidR3_GM.sf2 in.mid` (FluidSynth 2.3.4, Debian package fluid-soundfont-gm 3.1-5.3).
  Every channel gets CC7 100, CC11 127, CC91 (reverb send) 30, CC93 (chorus) 0. The float render is cut to the
  exact clip length (last bar end + 1.5 s), scaled so the mix peak is -1.0 dBFS, and written as 16-bit PCM; stems
  get the mix's gain. MIDI: type 1, 960 ticks per quarter, one tempo; truth times are the MIDI tick times.
- Read back: every WAV has the expected sample count, peak -1.0 dBFS, 0 samples at full scale; RMS from -20.07
  dBFS (S7flat30) to -14.98 dBFS (S5dropd).
- Renderer timing: 17 renders of one nylon G3 note. With the note-on at tick 0 the first output sample above 1e-6
  comes 71 samples (1.6 ms) after it; with note-ons at 960, 962 ... 990 ticks it comes 78.5 to 140.6 samples after
  them, rising and falling back in a 64-sample cycle, which is FluidSynth starting each note on its 64-sample
  block. No constant delay beyond that was found, so the truth times were not shifted. (The float output carries
  about 1e-8 of reverb DC/noise when silent, so "silent" means below 1e-6.)
- Truth against audio: for every clip a MIDI rebuilt from the truth JSON alone (seconds to ticks) was rendered
  again and cross-correlated with the clip's render: best lag 0 samples for all nine clips; the two renders are
  identical except S4 (largest sample difference 1.1 % of the peak, lag 0).
- Onsets: `librosa.onset.onset_detect(hop_length=128)` on the mono mix, matched to truth onsets (a strum counted
  once): the detected onsets come a median 12.6 ms (S6taps) to 20.4 ms (S7flat30) after the truth onsets; matched
  62/62 (S1), 46/48 (S2n, S5capo2, S5dropd), 48/48 (S2s), 29/43 (S3), 31/43 (S7flat30), 81/127 (S4), 53/53
  (S6taps). This is the detector's own lag plus each sample's attack; it is a sanity check, not a correction.
- Stems: the sum of the S4 stems differs from the S4 mix by at most 1.1 % of the mix peak (S6taps: 0.08 %). Stem
  levels (RMS dBFS): S4 drums -28.7, bass -23.6, guitar -21.69, lead -21.99; S6taps guitar -18.22, taps -31.8.
- Detune: on the final G chord (20.3 to 22.3 s) the strongest peak near G4 is 391.824 Hz in S3 and 384.913 Hz in
  S7flat30, -30.81 cents; near G3 195.677 Hz and 192.330 Hz, -29.87 cents. Pitch-bend value -1229 of 8192 with a
  2-semitone range is -30.005 cents nominal. S3's own G4 peak is 0.76 cents below 391.995 Hz.
- Guitar Pro 5: S2n.gp5, S5capo2.gp5 and S5dropd.gp5 were written with PyGuitarPro 0.11 (melody in voice 1, bass in
  voice 2, capo as the track offset, tuning as the track strings) and re-opened: 90 of 90 notes match the truth
  (position, string, fret, pitch); capo read back 0 / 2 / 0; tuning read back [40,45,50,55,59,64] /
  [40,45,50,55,59,64] / [38,45,50,55,59,64].
- Fingerings: S1 second position (A4 at string 1 fret 5 is the widest reach); S2 family first position with the
  thumb on strings 4 to 6 and the melody on strings 1 to 3; S3 and S4 open-position chord shapes (Bm is the x24432
  barre).

## Sources, licenses and attribution

**The music in the synthesized clips.** S1: the "Ode to Joy" theme from Beethoven's Symphony No. 9 (1824);
Beethoven died in 1827, so it is in the public domain. S2n, S2s, S5capo2, S5dropd, S6taps: the melody of "Ah! vous
dirai-je, maman" (the tune of "Twinkle, Twinkle, Little Star"), an anonymous 18th-century French melody (Mozart's
variations on it, K. 265, date from the early 1780s), public domain because of its age; the two-voice guitar
arrangement was written for this test set. S3, S7flat30 and S4: chord progressions, strum patterns, bass line, lead
melody and drum part written for this test set.

**The SoundFont.** `/usr/share/doc/fluid-soundfont-gm/copyright` (read 2026-11-10) says:

> Upstream Author: Frank Wen [e-mail address omitted here]
> Copyright © 2000-2002, 2008 Frank Wen; Copyright © 2008 Toby Smithe
>
> License: From README: "I hereby release Fluid under the MIT license, as described in COPYING."
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
> documentation files (the "Software"), to deal in the Software without restriction, including without limitation
> the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
> to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of
> the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
> THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
> CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
> IN THE SOFTWARE.

The same file says the SoundFont was "constructed in part from samples found in the public domain" and from the
author's own recordings, and that the Debian packaging is GPL-2+.

**GuitarSet (R1a, R1b, R1c).** Zenodo record 3371780, GuitarSet v1.1.0, published 2019-08-20, doi
10.5281/zenodo.3371780 (https://zenodo.org/records/3371780, read 2026-11-10). The record's "Rights / License" box
shows "Creative Commons Attribution 4.0 International" and "The Creative Commons Attribution license allows
re-distribution and re-use of a licensed work on the condition that the creator is appropriately credited." The
record asks: "If you make use of GuitarSet for academic purposes, please cite the following publication: Q. Xi, R.
Bittner, J. Pauwels, X. Ye, and J. P. Bello, "Guitarset: A Dataset for Guitar Transcription", in 19th International
Society for Music Information Retrieval Conference, Paris, France, Sept. 2018." The record also lists two known
errors (incorrect timings in two annotations, GitHub issue 5; a duplicated note in one MIDI annotation, issue 4);
which files they concern was not checked. Files were pulled one by one from `annotation.zip` and
`audio_mono-mic.zip` with remotezip (HTTP range requests). Excerpts: R1a = `02_SS2-107-Ab_comp` (player 02,
Singer-Songwriter progression 2, comp, file name 107 BPM / Ab, JAMS key Ab minor), 0 to 29.159 s; R1b =
`04_Rock1-90-C#_solo` (player 04, Rock progression 1, solo, 90 BPM, JAMS key C# major), 0 to 29.333 s; R1c =
`00_BN3-119-G_comp` (player 00, Bossa Nova progression 3, comp, 119 BPM, JAMS key G major), 0 to 28.235 s. GuitarSet
has no fingerstyle label; R1c was picked because bossa nova comping is the style in the set closest to fingerstyle
(thumb bass under chords), which the dataset does not state for this take. Audio is the mono microphone recording,
copied sample for sample (R1a peaks at -0.01 dBFS with 1 sample at 32767/-32768).

**R2 and R2full.** Josh Woodward, "I Want to Destroy Something Beautiful", album Dirty Wings (2007; the page says
"Released Oct 30, 2006"). Song page https://www.joshwoodward.com/song/IWantToDestroySomethingBeautiful (read
2026-11-10): "This work is licensed under a Creative Commons Attribution 4.0 License". The artist's FAQ
https://www.joshwoodward.com/faq (read 2026-11-10): "All songs licensed under a Creative Commons Attribution 4.0
License." and "Yes! I have no restrictions about using my music in commercial projects as long as proper
attribution is given." Attribution line: "I Want to Destroy Something Beautiful" by Josh Woodward,
https://www.joshwoodward.com/, CC BY 4.0. Files: the song FLAC
(`/flac/2007-DirtyWings/JoshWoodward-DW-01-IWantToDestroySomethingBeautiful.flac`) and the instrumental FLAC
(`/flac/NoVox/files/JoshWoodward-DW-NoVox-01-IWantToDestroySomethingBeautiful.flac`), both linked from the song
page, 16-bit 44.1 kHz stereo, 10,076,073 samples each (228.482 s), kept in `R2full/original/`. The two files line
up at lag 0; in 54 of the 228 whole seconds they differ by at most 2 LSB (no singing there), so
`stems/vocals_derived.wav` = song - instrumental is the vocal part as mixed (211 samples of the difference exceeded
16 bits and were clipped). The artist publishes no free stems; the FAQ says stems of some newer songs are in a paid
bundle. The page lists the tags Guitar, Hard, Popular, Rated PG, Regret, Rock, Sad, Slow and "Key: D# Minor,
Tempo: 72 bpm, Meter: 4/4 Swing, Length: 3:49"; it does not list the instruments. That the song has bass and drums
is UNVERIFIED (not stated by the source, not checked by listening; an HPSS split of the instrumental's first 60 s
put 9.3 % of the energy in the percussive part and 25 % of the spectrum energy lies between 40 and 120 Hz; the
source-separation lane's stems would settle it). R2 is samples 1,411,200 to 2,998,800 of R2full (32.000 to
68.000 s), chosen because the song-minus-instrumental energy shows singing over 32-40 s and 43-68 s.

**R3a.** archive.org item https://archive.org/details/scm-422828-crescendo313-drh-meredithconn, "Crescendo 313 -
DRH - Meredith Connie Solo Classical Guitar - Part II", creator field Mark Andersen, publisher field Seattle
Community Media, date 2014-08-24 (read 2026-11-10). The item page shows "Usage: Attribution-ShareAlike 4.0
International" linking to https://creativecommons.org/licenses/by-sa/4.0/. Attribution line: "Crescendo 313 - DRH -
Meredith Connie Solo Classical Guitar - Part II" by Mark Andersen / Seattle Community Media, CC BY-SA 4.0, excerpt
400-418 s, re-encoded. Kept original: `R3a/original/crescendo313_2014_09_04_0.mp4`, which is archive.org's h.264
derivative (640x480, 30000/1001 fps progressive, AAC 44.1 kHz stereo, 1680.03 s); the item's original 1.33 GB
MPEG-2 file was not downloaded. Excerpt files: `R3a.mp4` (H.264 yuv420p, 640x480, 30000/1001 fps, AAC 192 kb/s),
`R3a.webm` (VP9 yuv420p, 640x480, 30000/1001 fps, Opus 128 kb/s at 48 kHz, since Opus runs at 48 kHz), `R3a.wav`
(16-bit 44.1 kHz stereo), `R3a.mono.wav`. Camera and what is visible: see the table; contact sheets were looked at
for 400-418 s and 800-818 s, and both contain cuts between a medium shot, a wide shot and (at 800 s) a frontal
close shot of the neck. There is no ground truth for R3a.

**R3b.** archive.org item https://archive.org/details/BrylieChristopherOxleyGuitar20181006, "Brylie Christopher Oxley
Guitar 2018-10-06", creator field Brylie Christopher Oxley, date 2018-10-06, description "Yamaha C-40 nylon string
guitar recordings.", topics guitar, classical guitar, music (read 2026-11-10). The item page shows "Usage: CC0 1.0
Universal" linking to http://creativecommons.org/publicdomain/zero/1.0/. CC0 needs no attribution; the line used anyway:
"Brylie Christopher Oxley Guitar 2018-10-06" by Brylie Christopher Oxley, archive.org, CC0 1.0, excerpt 200-218 s,
re-encoded. Kept original: `R3b/original/BrylieChristopherOxley-guitar-2018-10-06.mp4`, the item's original upload
(archive.org lists it as source "original"; 229,070,359 bytes, and its md5 bce85d67e2c61a40877c112e1db435f6 matches the
item's file list): H.264 High, 1920x1080, 25 fps progressive, AAC 48 kHz stereo, 580.52 s. ffmpeg cropdetect puts the
picture in the left 1438 columns; the other 482 are black. The scene scan (score > 0.12, r0056) finds one cut, at 287.08
s, where a second take starts with the camera re-framed. The audio level shows playing over about 5-275 s and 325-520 s
(every 5 s mean RMS between -42 and -27 dBFS there, quieter stretches at about 280-325 s and 525-540 s); the whole file
peaks at -12.4 dBFS. Excerpt 200.000-218.000 s, chosen because the nut stays in frame (in the second take it is cut off
at the top edge). Excerpt files: `R3b.mp4` (H.264 yuv420p 1920x1080 25 fps, 450 frames, AAC 192 kb/s at 48 kHz, the
source's rate), `R3b.webm` (VP9 yuv420p 1920x1080 25 fps, Opus 128 kb/s at 48 kHz), `R3b.wav` (16-bit 44.1 kHz stereo),
`R3b.mono.wav`; the black band is kept, nothing is cropped or scaled. Frames looked at: one every 3 s over 200-218 s and
440-458 s, one each at 5, 60, 150, 250, 285, 290, 330, 420, 520 and 575 s, and the full frame at 209 s (fret count in
the table). The first 2 s of `R3b.mp4` match the source at 200.00 s (PSNR 51.6 dB, against 42.6 to 42.7 dB one frame
earlier or later). Read-back (`_checks/r3bc_checks.json`, r0183): 793,800 samples (18.000 s) in each WAV; `R3b.wav`
peaks at -13.06 dBFS, RMS -30.97 dBFS, no sample at full scale; its two channels are the same signal (correlation
1.0000, left minus right -117.7 dBFS RMS), so the recording is mono stored as stereo; `R3b.mono.wav` equals (L+R)/2
within 0.5 LSB; no cut inside `R3b.mp4` (scene score > 0.12). The pieces played are not named in the item. There is no
ground truth for R3b.

**R3c.** Wikimedia Commons file https://commons.wikimedia.org/wiki/File:Manx_Guitar_Lesson-_Three_Little_Boats_2019.webm
(read 2026-11-10). Description: "A guitar tutorial of how to play the traditional Manx tune, 'Three Little Boats'" ...
"This film is presented by Pete Lumb. It is produced by Culture Vannin, in order to promote and support Manx music. This
film was produced by Culture Vannin in 2019." Author: Culture Vannin. Source: YouTube video If24Iy2uKRg, imported to
Commons on 19 October 2026. The Licensing section says: "This file is licensed under the Creative Commons Attribution
3.0 Unported license. Attribution: Culture Vannin", and its license review says: "This file, which was originally posted
to https://www.youtube.com/watch?v=If24Iy2uKRg , was reviewed on 19 October 2026 by reviewer Gone Postal , who confirmed
that it was available there under the stated license on that date. On 19 October 2026 the licence was CC-BY 4.0." (The
same section notes that YouTube's Creative Commons option was CC BY 3.0 until July 31, 2025 and 4.0 from August 1.) Both
versions allow reuse and derivatives with attribution. Attribution line: "Manx Guitar Lesson: Three Little Boats" (2019)
by Culture Vannin, presented by Pete Lumb, via Wikimedia Commons, CC BY 3.0
(https://creativecommons.org/licenses/by/3.0/), excerpt 222-240 s, re-encoded. Kept original:
`R3c/original/Manx_Guitar_Lesson-_Three_Little_Boats_2019.webm.1080p.vp9.webm`, Commons' own VP9 1080p transcode
(upload.wikimedia.org `transcoded/` path, 51,075,480 bytes, Last-Modified 23 Oct 2026): VP9 1920x1080, 25 fps
progressive, Opus 48 kHz stereo, 292.84 s. The uploaded original (AV1/Opus, 34.09 MB per the file page) could not be
downloaded (HTTP 429). The video is a multi-camera edit: title card, wide shot of the room, a medium shot from the
front, side close-ups of the fretting hand and of the picking hand, captions "Lesson", "Slow play-through" and
"Full-speed performance", end card from about 281 s. Cuts between 200 and 270 s (scene score > 0.12, r0152, decoded from
0 s; r0146 found the same five within 0.01 s with input seeking; r0142 used -copyts, stopped early and is superseded):
207.93, 213.97, 259.45, 263.41, 268.65 and 270.69 s; the rest of the video was not scanned (frames one every 10 s show
the other shots). The excerpt lies in the medium shot from 213.97 to 259.45 s, in the "Slow play-through" section, after
its caption has gone (the frame is clean from 221.2 s); over 215-255 s the audio level stays above -27 dBFS (0.5 s RMS)
and the player is playing in every frame looked at. Excerpt files as for R3b: `R3c.mp4`, `R3c.webm` (both 1920x1080 25
fps), `R3c.wav`, `R3c.mono.wav`. Frames looked at: one every 10 s over the whole video, one every second over 205-284 s,
and the full frame at 232 s. `R3c.mp4` has AAC at 48 kHz like R3b's. Read-back (r0183): 793,800 samples (18.000 s) in
each WAV; `R3c.wav` peaks at -2.14 dBFS, RMS -17.83 dBFS, no sample at full scale; its two channels are the same signal
apart from a residue at -67.1 dBFS RMS (correlation 1.0000), so it is effectively mono; `R3c.mono.wav` equals (L+R)/2
within 0.5 LSB; no cut inside `R3c.mp4`. The file description says "Tab available here:" and links a PDF on
culturevannin.im; it was not downloaded, its license was not checked, and whether it matches what is played was not
checked. There is no ground truth for R3c.

## Caveats

- SoundFont-rendered guitar is a much cleaner signal than a microphone recording: no room, no fret or finger noise,
  no string buzz, identical repeated notes, exact timing and tuning. Results on S clips do not carry over to R
  clips as they are.
- FluidR3_GM's guitar programs are sample sets that ignore which string a note is played on: the same pitch sounds
  the same on every string, so the S clips carry no timbral cue for string and fret. The string and fret in the
  truth are the tab the piece was written with.
- The percussion in S6taps is a stand-in: General MIDI drum-kit samples (side stick, acoustic bass drum) mixed in,
  not recordings of hands on a guitar body.
- The S4 lead line is a General MIDI "Voice Oohs" sample, not singing; it has no words or consonants.
- S2n and S2s carry identical notes; S5capo2, S5dropd and S6taps are variants of the same arrangement, so they
  are not independent test pieces.
- GuitarSet annotations come from a hexaphonic pickup and semi-automatic processing; they are the dataset's
  annotation, not a hand-checked score, and the record lists two known annotation errors.
- R2's vocal stem is derived by subtraction from two published mixes, not a stem the artist published.
- R3a is a concert video with camera cuts every few seconds and partial occlusion of the picking hand by a
  microphone stand and a music stand.
- R3b is a home recording: the right quarter of its frame is black, the picking hand is partly outside the picture
  at the left edge, and the audio is quiet (the whole file peaks at -12.4 dBFS).
- R3c's source is Commons' VP9 transcode of an AV1 file that was itself imported from YouTube, so the R3c excerpt
  files have been through at least three lossy video encodes. The room is backlit by a window, and sheet music on a
  stand covers the lower bout of the guitar.
- R3a, R3b and R3c are all nylon-string guitars played with the fingers. No capo is visible in R3b or R3c, and no
  body taps were seen in the frames looked at; S5capo2 and S6taps (synthesized audio, no video) remain the only capo
  and tap clips. Whether anyone speaks during the R3b and R3c excerpts was not checked by listening.
