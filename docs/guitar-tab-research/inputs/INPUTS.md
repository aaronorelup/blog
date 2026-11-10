# Shared test inputs: manifest

Built 2026-11-10 (UTC) by the `inputs-builder` agent. Audio and video live in `/home/user/gtr/inputs/<id>/`. The
manifest, the scripts and every small truth file (.json .mid .csv .txt .lab .gp5) are copied to
`docs/guitar-tab-research/inputs/<id>/` in the blog repo; no audio or video is copied there.

Scripts (in `docs/guitar-tab-research/inputs/scripts/`): `make_synth.py` (S1 to S7), `make_guitarset.py` (R1a to R1c),
`make_r2.py` (R2, R2full), `make_r3.py` (R3a), `make_manifest.py` (this file), `gtr_common.py` (shared writers),
`inputs_notes.md` (the hand-written part of this file). Check reports: `_checks/synth_checks.json`,
`_checks/guitarset_checks.json`, `_checks/r2_checks.json`.

Run ledger (`/home/user/gtr/ledger/runs.jsonl`, lane `inputs`): r0007 first synth render (superseded by r0008, same
script before three fixes), r0008 final synth render (wall 28.55 s), r0010 R3a encodes (wall 19.3 s), r0011 R3a
scene-cut scan (wall 32.5 s). The GuitarSet, R2 and R3a-truth scripts are light file conversions and were not run
through `gtr-run`.

## Clips

| id | files (in /home/user/gtr/inputs/&lt;id&gt;/) | duration | sample rate / channels | what it is | truth | source URL | license (quoted clause) | attribution |
|---|---|---|---|---|---|---|---|---|
| S1 | `S1.mono.wav`<br>`S1.wav`<br>`S1.beats.txt`<br>`S1.chords.lab`<br>`S1.mid`<br>`S1.notes.csv`<br>`S1.tab.txt`<br>`S1.truth.json` | 29.833 s | 44100 Hz / 2 ch | Synthesized single-note melody, no chords: the 16-bar 'Ode to Joy' theme in D major on nylon guitar (GM program 24), 144 BPM, after one silent count-in bar. | 62 notes, 64 beats | synthesized here (no URL) | Melody: 'Ode to Joy' theme from Ludwig van Beethoven's Symphony No. 9 (1824); Beethoven died in 1827, so the composition is in the public domain. Audio rendered from MIDI for this test set with FluidSynth 2.3.4 and FluidR3_GM.sf2 (MIT license).: "I hereby release Fluid under the MIT license, as described in COPYING." | Rendered with the FluidR3_GM SoundFont by Frank Wen (MIT license). |
| S2n | `S2n.mono.wav`<br>`S2n.wav`<br>`S2n.beats.txt`<br>`S2n.chords.lab`<br>`S2n.gp5`<br>`S2n.mid`<br>`S2n.notes.csv`<br>`S2n.tab.txt`<br>`S2n.truth.json` | 29.357 s | 44100 Hz / 2 ch | Synthesized fingerstyle: alternating thumb bass plus a melody on top, one guitar, standard tuning, no capo, G major, 112 BPM, nylon guitar (GM program 24). Same notes as S2s. | 90 notes, 48 beats, 22 chord segments | synthesized here (no URL) | Melody: 'Ah! vous dirai-je, maman' (the tune of 'Twinkle, Twinkle, Little Star'), an anonymous 18th-century French melody (Mozart's variations on it, K. 265, date from the early 1780s); public domain because of its age. Two-voice guitar arrangement written for this test set. Audio rendered from MIDI for this test set with FluidSynth 2.3.4 and FluidR3_GM.sf2 (MIT license).: "I hereby release Fluid under the MIT license, as described in COPYING." | Rendered with the FluidR3_GM SoundFont by Frank Wen (MIT license). |
| S2s | `S2s.mono.wav`<br>`S2s.wav`<br>`S2s.beats.txt`<br>`S2s.chords.lab`<br>`S2s.mid`<br>`S2s.notes.csv`<br>`S2s.tab.txt`<br>`S2s.truth.json` | 29.357 s | 44100 Hz / 2 ch | Synthesized fingerstyle: the S2n notes rendered with steel-string guitar (GM program 25). | 90 notes, 48 beats, 22 chord segments | synthesized here (no URL) | Melody: 'Ah! vous dirai-je, maman' (the tune of 'Twinkle, Twinkle, Little Star'), an anonymous 18th-century French melody (Mozart's variations on it, K. 265, date from the early 1780s); public domain because of its age. Two-voice guitar arrangement written for this test set. Audio rendered from MIDI for this test set with FluidSynth 2.3.4 and FluidR3_GM.sf2 (MIT license).: "I hereby release Fluid under the MIT license, as described in COPYING." | Rendered with the FluidR3_GM SoundFont by Frank Wen (MIT license). |
| S3 | `S3.mono.wav`<br>`S3.wav`<br>`S3.beats.txt`<br>`S3.chords.lab`<br>`S3.mid`<br>`S3.notes.csv`<br>`S3.tab.txt`<br>`S3.truth.json` | 24.000 s | 44100 Hz / 2 ch | Synthesized strummed chords, 8 bars, steel guitar (GM program 25), 96 BPM, G major; each down strum spreads low-to-high over 25 ms, each up strum (top three strings) high-to-low over 20 ms. | 182 notes, 32 beats, 10 chord segments | synthesized here (no URL) | Chord progression and strum pattern written for this test set. Audio rendered from MIDI for this test set with FluidSynth 2.3.4 and FluidR3_GM.sf2 (MIT license).: "I hereby release Fluid under the MIT license, as described in COPYING." | Rendered with the FluidR3_GM SoundFont by Frank Wen (MIT license). |
| S4 | `S4.mono.wav`<br>`S4.wav`<br>`stems/bass.wav`<br>`stems/drums.wav`<br>`stems/guitar.wav`<br>`stems/lead.wav`<br>`S4.beats.txt`<br>`S4.chords.lab`<br>`S4.mid`<br>`S4.notes.csv`<br>`S4.tab.txt`<br>`S4.truth.json` | 38.741 s | 44100 Hz / 2 ch | Synthesized band, D major, 116 BPM: one silent bar, one side-stick count-in bar, then 16 bars of drums (channel 10), electric bass (GM program 33), strummed steel guitar (program 25), lead line on Voice Oohs (program 53) standing in for a singer. Mix plus each stem alone under stems/. | 661 notes, 68 beats, 18 chord segments, stems: drums, bass, guitar, lead | synthesized here (no URL) | Song (chords, bass line, lead melody, drum part) written for this test set. Audio rendered from MIDI for this test set with FluidSynth 2.3.4 and FluidR3_GM.sf2 (MIT license).: "I hereby release Fluid under the MIT license, as described in COPYING." | Rendered with the FluidR3_GM SoundFont by Frank Wen (MIT license). |
| S5capo2 | `S5capo2.mono.wav`<br>`S5capo2.wav`<br>`S5capo2.beats.txt`<br>`S5capo2.chords.lab`<br>`S5capo2.gp5`<br>`S5capo2.mid`<br>`S5capo2.notes.csv`<br>`S5capo2.tab.txt`<br>`S5capo2.truth.json` | 29.357 s | 44100 Hz / 2 ch | Synthesized: the S2 tab played with a capo on fret 2 (same strings and frets counted from the capo, sounds 2 semitones higher, A major), nylon guitar (program 24), 112 BPM. | 90 notes, 48 beats, 22 chord segments | synthesized here (no URL) | Melody: 'Ah! vous dirai-je, maman' (the tune of 'Twinkle, Twinkle, Little Star'), an anonymous 18th-century French melody (Mozart's variations on it, K. 265, date from the early 1780s); public domain because of its age. Two-voice guitar arrangement written for this test set. Audio rendered from MIDI for this test set with FluidSynth 2.3.4 and FluidR3_GM.sf2 (MIT license).: "I hereby release Fluid under the MIT license, as described in COPYING." | Rendered with the FluidR3_GM SoundFont by Frank Wen (MIT license). |
| S5dropd | `S5dropd.mono.wav`<br>`S5dropd.wav`<br>`S5dropd.beats.txt`<br>`S5dropd.chords.lab`<br>`S5dropd.gp5`<br>`S5dropd.mid`<br>`S5dropd.notes.csv`<br>`S5dropd.tab.txt`<br>`S5dropd.truth.json` | 29.357 s | 44100 Hz / 2 ch | Synthesized: the S2 piece in Drop D (D2 A2 D3 G3 B3 E4), nylon (program 24), 112 BPM. Melody unchanged; bass re-fingered: G2 moves to string 6 fret 5, and the D-chord root moves down an octave from D3 (string 4 open) to D2 (string 6 open). | 90 notes, 48 beats, 22 chord segments | synthesized here (no URL) | Melody: 'Ah! vous dirai-je, maman' (the tune of 'Twinkle, Twinkle, Little Star'), an anonymous 18th-century French melody (Mozart's variations on it, K. 265, date from the early 1780s); public domain because of its age. Two-voice guitar arrangement written for this test set. Audio rendered from MIDI for this test set with FluidSynth 2.3.4 and FluidR3_GM.sf2 (MIT license).: "I hereby release Fluid under the MIT license, as described in COPYING." | Rendered with the FluidR3_GM SoundFont by Frank Wen (MIT license). |
| S6taps | `S6taps.mono.wav`<br>`S6taps.wav`<br>`stems/guitar.wav`<br>`stems/taps.wav`<br>`S6taps.beats.txt`<br>`S6taps.chords.lab`<br>`S6taps.mid`<br>`S6taps.notes.csv`<br>`S6taps.tab.txt`<br>`S6taps.truth.json` | 29.357 s | 44100 Hz / 2 ch | Synthesized: the S2s notes (steel, program 25) plus General MIDI percussion standing in for body taps: kind 'slap' = GM key 37 Side Stick (beats 2 and 4, bars 1-12), kind 'thump' = GM key 35 Acoustic Bass Drum (beat 1 of bars 1, 5, 9 and the 'and' of beat 4 in bars 2, 4, 6, 8, 10). | 90 notes, 48 beats, 22 chord segments, 32 taps, stems: guitar, taps | synthesized here (no URL) | Melody: 'Ah! vous dirai-je, maman' (the tune of 'Twinkle, Twinkle, Little Star'), an anonymous 18th-century French melody (Mozart's variations on it, K. 265, date from the early 1780s); public domain because of its age. Two-voice guitar arrangement written for this test set. Audio rendered from MIDI for this test set with FluidSynth 2.3.4 and FluidR3_GM.sf2 (MIT license).: "I hereby release Fluid under the MIT license, as described in COPYING." | Rendered with the FluidR3_GM SoundFont by Frank Wen (MIT license). |
| S7flat30 | `S7flat30.mono.wav`<br>`S7flat30.wav`<br>`S7flat30.beats.txt`<br>`S7flat30.chords.lab`<br>`S7flat30.mid`<br>`S7flat30.notes.csv`<br>`S7flat30.tab.txt`<br>`S7flat30.truth.json` | 24.000 s | 44100 Hz / 2 ch | Synthesized: the S3 notes rendered 30 cents flat with a MIDI pitch bend of -1229 (bend range 2 semitones, set with RPN 0) on the guitar channel from time 0; no tempo change. | 182 notes, 32 beats, 10 chord segments | synthesized here (no URL) | Chord progression and strum pattern written for this test set. Audio rendered from MIDI for this test set with FluidSynth 2.3.4 and FluidR3_GM.sf2 (MIT license).: "I hereby release Fluid under the MIT license, as described in COPYING." | Rendered with the FluidR3_GM SoundFont by Frank Wen (MIT license). |
| R1a | `R1a.mono.wav`<br>`R1a.wav`<br>`R1a.beats.txt`<br>`R1a.chords.lab`<br>`R1a.chords_performed.lab`<br>`R1a.mid`<br>`R1a.notes.csv`<br>`R1a.tab.txt`<br>`R1a.truth.json` | 29.159 s | 44100 Hz / 1 ch | GuitarSet excerpt: player 02, Singer-Songwriter progression 2, 'comp' take (accompaniment), 107 BPM, key Ab; mic recording, first 29.159 s of 02_SS2-107-Ab_comp_mic.wav. | 189 notes, 53 beats, 13 chord segments | https://zenodo.org/records/3371780 | CC BY 4.0 (Creative Commons Attribution 4.0 International): ""Creative Commons Attribution 4.0 International" / "The Creative Commons Attribution license allows re-distribution and re-use of a licensed work on the condition that the creator is appropriately credited." (Rights / License box of the Zenodo record, read 2026-11-10)" | GuitarSet (Xi, Bittner, Pauwels, Ye, Bello, ISMIR 2018), file 02_SS2-107-Ab_comp, CC BY 4.0. Excerpt 0-29.159 s. Q. Xi, R. Bittner, J. Pauwels, X. Ye, and J. P. Bello, "GuitarSet: A Dataset for Guitar Transcription", in 19th International Society for Music Information Retrieval Conference, Paris, France, Sept. 2018. Data: GuitarSet v1.1.0, Zenodo, doi:10.5281/zenodo.3371780. |
| R1b | `R1b.mono.wav`<br>`R1b.wav`<br>`R1b.beats.txt`<br>`R1b.chords.lab`<br>`R1b.chords_performed.lab`<br>`R1b.mid`<br>`R1b.notes.csv`<br>`R1b.tab.txt`<br>`R1b.truth.json` | 29.333 s | 44100 Hz / 1 ch | GuitarSet excerpt: player 04, Rock progression 1, 'solo' take (single-note solo), 90 BPM, key C#; mic recording, first 29.333 s of 04_Rock1-90-C#_solo_mic.wav. | 70 notes, 44 beats, 6 chord segments | https://zenodo.org/records/3371780 | CC BY 4.0 (Creative Commons Attribution 4.0 International): ""Creative Commons Attribution 4.0 International" / "The Creative Commons Attribution license allows re-distribution and re-use of a licensed work on the condition that the creator is appropriately credited." (Rights / License box of the Zenodo record, read 2026-11-10)" | GuitarSet (Xi, Bittner, Pauwels, Ye, Bello, ISMIR 2018), file 04_Rock1-90-C#_solo, CC BY 4.0. Excerpt 0-29.333 s. Q. Xi, R. Bittner, J. Pauwels, X. Ye, and J. P. Bello, "GuitarSet: A Dataset for Guitar Transcription", in 19th International Society for Music Information Retrieval Conference, Paris, France, Sept. 2018. Data: GuitarSet v1.1.0, Zenodo, doi:10.5281/zenodo.3371780. |
| R1c | `R1c.mono.wav`<br>`R1c.wav`<br>`R1c.beats.txt`<br>`R1c.chords.lab`<br>`R1c.chords_performed.lab`<br>`R1c.mid`<br>`R1c.notes.csv`<br>`R1c.tab.txt`<br>`R1c.truth.json` | 28.235 s | 44100 Hz / 1 ch | GuitarSet excerpt: player 00, Bossa Nova progression 3, 'comp' take (accompaniment), 119 BPM, key G; mic recording, first 28.235 s of 00_BN3-119-G_comp_mic.wav. | 148 notes, 56 beats, 14 chord segments | https://zenodo.org/records/3371780 | CC BY 4.0 (Creative Commons Attribution 4.0 International): ""Creative Commons Attribution 4.0 International" / "The Creative Commons Attribution license allows re-distribution and re-use of a licensed work on the condition that the creator is appropriately credited." (Rights / License box of the Zenodo record, read 2026-11-10)" | GuitarSet (Xi, Bittner, Pauwels, Ye, Bello, ISMIR 2018), file 00_BN3-119-G_comp, CC BY 4.0. Excerpt 0-28.235 s. Q. Xi, R. Bittner, J. Pauwels, X. Ye, and J. P. Bello, "GuitarSet: A Dataset for Guitar Transcription", in 19th International Society for Music Information Retrieval Conference, Paris, France, Sept. 2018. Data: GuitarSet v1.1.0, Zenodo, doi:10.5281/zenodo.3371780. |
| R2 | `R2.mono.wav`<br>`R2.wav`<br>`stems/instrumental.wav`<br>`stems/vocals_derived.wav`<br>`R2.truth.json` | 36.000 s | 44100 Hz / 2 ch | Real full-band song with singing: Josh Woodward, 'I Want to Destroy Something Beautiful' (album Dirty Wings), excerpt 32.000-68.000 s of the song (R2full). No ground truth. The artist's song page lists Key D# minor, Tempo 72 bpm, Meter 4/4 Swing (artist's metadata, not checked here). stems/instrumental.wav is the artist's own instrumental version; stems/vocals_derived.wav = song minus instrumental, computed here. | stems: instrumental, vocals_derived | https://www.joshwoodward.com/song/IWantToDestroySomethingBeautiful | CC BY 4.0: "This work is licensed under a Creative Commons Attribution 4.0 License" | "I Want to Destroy Something Beautiful" by Josh Woodward (album Dirty Wings), https://www.joshwoodward.com/, licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). |
| R2full | `R2full.mono.wav`<br>`R2full.wav`<br>`original/JoshWoodward-DW-01-IWantToDestroySomethingBeautiful.flac`<br>`original/JoshWoodward-DW-NoVox-01-IWantToDestroySomethingBeautiful.flac`<br>`stems/instrumental.wav`<br>`stems/vocals_derived.wav`<br>`R2full.truth.json` | 228.482 s | 44100 Hz / 2 ch | Real full-band song with singing: Josh Woodward, 'I Want to Destroy Something Beautiful' (album Dirty Wings), the whole song. No ground truth. The artist's song page lists Key D# minor, Tempo 72 bpm, Meter 4/4 Swing (artist's metadata, not checked here). stems/instrumental.wav is the artist's own instrumental version; stems/vocals_derived.wav = song minus instrumental, computed here. | stems: instrumental, vocals_derived | https://www.joshwoodward.com/song/IWantToDestroySomethingBeautiful | CC BY 4.0: "This work is licensed under a Creative Commons Attribution 4.0 License" | "I Want to Destroy Something Beautiful" by Josh Woodward (album Dirty Wings), https://www.joshwoodward.com/, licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). |
| R3a | `R3a.mono.wav`<br>`R3a.mp4`<br>`R3a.wav`<br>`R3a.webm`<br>`original/crescendo313_2014_09_04_0.mp4`<br>`R3a.truth.json` | 18.000 s | 44100 Hz / 2 ch | Real classical guitar performance video (nylon strings, played with the fingers), 18 s excerpt (400-418 s) of a 28-minute concert recording; 640x480, 30000/1001 fps, progressive. Multi-camera edit: medium shot of the seated player from the front at a slight angle (guitar neck and fretting hand at the upper right of the player, picking hand at the sound hole partly behind a microphone stand) from 0 to 7.27 s, a wide shot of the stage (player small in frame, a music stand in front of the lower guitar body) from 7.27 to 14.65 s, and the medium shot again from 14.65 s to the end (cut times from ffmpeg scene score > 0.12). The piece played is not identified in the item's metadata. No ground truth. | none (no ground truth) | https://archive.org/details/scm-422828-crescendo313-drh-meredithconn | CC BY-SA 4.0: "Usage: Attribution-ShareAlike 4.0 International (https://creativecommons.org/licenses/by-sa/4.0/)" | "Crescendo 313 - DRH - Meredith Connie Solo Classical Guitar - Part II", Mark Andersen / Seattle Community Media, archive.org item scm-422828-crescendo313-drh-meredithconn, CC BY-SA 4.0; excerpt 400-418 s, re-encoded. |

Clips present: 15 (S1, S2n, S2s, S3, S4, S5capo2, S5dropd, S6taps, S7flat30, R1a, R1b, R1c, R2, R2full, R3a). Not present: R3b, R3c (reasons below).

Missing clips: **R3b and R3c** were not obtained. Wikimedia Commons file searches (API, 2026-11-10) found freely
licensed guitar videos (for example "Fingerpicking pattern 1 pimami chitarra.webm" and four sibling files by Elenaf,
CC BY-SA 3.0; "Manx Guitar Lesson- Three Little Boats 2019.webm", Culture Vannin, CC BY 3.0; "Didldu © Schule
Gitarre - Alle Vögel sind schon da.webm", marked public domain; "20091104 Sharon Isbin - Isaac Albéniz's
Asturias.ogv", marked public domain), but every download from upload.wikimedia.org between 19:59 and 20:26 UTC was
answered with HTTP 429 ("Too many requests"), so none of them could be inspected or used. On archive.org the only
other candidates with an allowed license were an iMovie trailer ("FREE Fingerstyle Guitar Videos!", R Cox Music,
Public Domain Mark 1.0; its contact sheet shows short cuts and title cards, not one continuous performance; not used)
and items whose license is NonCommercial or NoDerivatives (not allowed). No non-free video was substituted and
nothing was downloaded from YouTube. A video with a capo or with percussive body taps was not found.

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
- **R2, R2full, R3a** have no ground truth: notes, beats, chords are empty and tempo, key and tuning are null.

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
  microphone stand and a music stand; it is the only R3 clip.

## sha256 of every audio and video file

| file | bytes | sha256 |
|---|---|---|
| `S1/S1.mono.wav` | 2631344 | `91ecaac14ca73c1bba28e4a1f861ceef211e11de200ebdf3bf8fba5e2073b39d` |
| `S1/S1.wav` | 5262644 | `e8447556a84750f1c56936241d23d0f23a8a068b919db3a6068b7ced532004d5` |
| `S2n/S2n.mono.wav` | 2589344 | `9a8b2ba2c54d00d9c108df14c44bf3761513929ec638debcd3424adc3480618f` |
| `S2n/S2n.wav` | 5178644 | `c6cb0f5f5f8e3d74534a11243ff1d135d616df900b7a0269c9fe81694f813ece` |
| `S2s/S2s.mono.wav` | 2589344 | `6645b01cf21b8eaa54e2ab3a05fcadde5f890bcb387f76851386af685b3685a7` |
| `S2s/S2s.wav` | 5178644 | `a35ba375e30f4f4d964ec16bce2a68889968675ac67b3c948f18a28788252704` |
| `S3/S3.mono.wav` | 2116844 | `92f5740a02860ee7e450f1a7da9ee8e3b6fad44b29ee11ddb98f913519265c2a` |
| `S3/S3.wav` | 4233644 | `9dd82f6fe4f61ab901932616f240d68e19fe97d9362f4b79cb028172c27af8d0` |
| `S4/S4.mono.wav` | 3417034 | `cbba3bc7366df1fd1f580c4785b1f653a542a021918a7c5834634f2f547b2580` |
| `S4/S4.wav` | 6834024 | `1aacf23f6f235aac8a9c627f9f6efbdaffd5ceee94f6f5da14af486803705b8a` |
| `S4/stems/bass.wav` | 6834024 | `cbe7371d978df67297d5abb3e9139bcd44cecc008d0d92b2dbbee60be61eb200` |
| `S4/stems/drums.wav` | 6834024 | `7e061d0e3c762ad14ba6ce723407b8bb9646cb272ad9bc5265cfde98b88d7e68` |
| `S4/stems/guitar.wav` | 6834024 | `9b9a49b7fdecc49555365362570dc88080286ff64377fd06a967e8f769ee3474` |
| `S4/stems/lead.wav` | 6834024 | `1b3fd2a5aaf2bd86613a151d8e694cfc00633316695f52a32b16fcd4cbfc7dd3` |
| `S5capo2/S5capo2.mono.wav` | 2589344 | `34fdfcf5b5e8493e4dc7844fafe605a2de19a440b6f19accf649c57c7142885d` |
| `S5capo2/S5capo2.wav` | 5178644 | `305c0fac9a51dc218e24a536b8a25ea3dbb1c5c124bca1238ca124527401969c` |
| `S5dropd/S5dropd.mono.wav` | 2589344 | `86b036a0191cac2714e77d47c0596e33e804d86d67d2038ba5f5b61084e9aeb7` |
| `S5dropd/S5dropd.wav` | 5178644 | `cf9b6e16f92a7cb374d91e43fe21179247b05382e02d0a75552c8faef4b2e6b6` |
| `S6taps/S6taps.mono.wav` | 2589344 | `e3d01123a446cb37e7cc008b75a5faeae1384cd0ce5bdc0c20e8b7194e5e283b` |
| `S6taps/S6taps.wav` | 5178644 | `002921688d975fea51087bc360730bd9d56da70b2448f874168eabf4af6a389d` |
| `S6taps/stems/guitar.wav` | 5178644 | `203ce9286d7d9b8fccdbaf72354a454cb8d3175b4720120b45b3e014c9a31240` |
| `S6taps/stems/taps.wav` | 5178644 | `5fee75333cc2d696939719a4a38dfeedfed30d5b28801a003fb568fd7eb14080` |
| `S7flat30/S7flat30.mono.wav` | 2116844 | `9db353eaa57207c2089767e5f413e04bfc7e749b101621b887c70e995ab8fce4` |
| `S7flat30/S7flat30.wav` | 4233644 | `6caa284fd6761f611f14972cac051ed1107185995a3054552c1b48f2c208363c` |
| `R1a/R1a.mono.wav` | 2571858 | `1e36c5b0b04d898993ebc45d09b6c64f93c27807e24b06f1ecfbecf2512aa40a` |
| `R1a/R1a.wav` | 2571858 | `1e36c5b0b04d898993ebc45d09b6c64f93c27807e24b06f1ecfbecf2512aa40a` |
| `R1b/R1b.mono.wav` | 2587244 | `d82cbc2e83552eb63f0dc3611a62e9186b70a5dbaf53210969af67b1f75d5719` |
| `R1b/R1b.wav` | 2587244 | `d82cbc2e83552eb63f0dc3611a62e9186b70a5dbaf53210969af67b1f75d5719` |
| `R1c/R1c.mono.wav` | 2490396 | `842028a71cdec41a2197d90467095692af34ff44c7498b4df7a2cfd4e1fe2f83` |
| `R1c/R1c.wav` | 2490396 | `842028a71cdec41a2197d90467095692af34ff44c7498b4df7a2cfd4e1fe2f83` |
| `R2/R2.mono.wav` | 3175244 | `2427789733580838f45a6b1f3f3994e577a26ebaff6b74c20f7d6aa561efc2b2` |
| `R2/R2.wav` | 6350444 | `ea09b5bd29eaabdd7c502b47112ce5b81d84643f8eee248ec62138c7a1ae5f8f` |
| `R2/stems/instrumental.wav` | 6350444 | `f4145bdcbfee55f66ab3419cfd83cf608120f7e2fdafb33190385e1631f2ab60` |
| `R2/stems/vocals_derived.wav` | 6350444 | `db1e6f48337d48405e5f2041b32d6d1c811f997d2fefa452f03f3eb4fbe373ab` |
| `R2full/R2full.mono.wav` | 20152190 | `b7a4a30c2813712cc0b7af3b654308ecd24086937a5e798e7c2643573b60ea94` |
| `R2full/R2full.wav` | 40304336 | `1393e02289c87ecc180ad8d7c246da50bb7bccb59008b1d7a2c4f6e992513b07` |
| `R2full/original/JoshWoodward-DW-01-IWantToDestroySomethingBeautiful.flac` | 22454931 | `2ba981b6eb865a8b3c96d661628520477a644b7f444b98d4cb6e2365fa1854a2` |
| `R2full/original/JoshWoodward-DW-NoVox-01-IWantToDestroySomethingBeautiful.flac` | 20875619 | `577517771a151cd3718db776c0eeb173058954fc84969fae2a593a52456c5575` |
| `R2full/stems/instrumental.wav` | 40304336 | `1a00c9a7d223036e0df376b2770f6f9fd0419b17c6f1e1153656ecef1f24b4b9` |
| `R2full/stems/vocals_derived.wav` | 40304336 | `e06aa9d8b4378965d64ceea2e5deb5d31d61382809baa4859652a8d33f264703` |
| `R3a/R3a.mono.wav` | 1587856 | `5d6107c5cf9de3136833471c3aa1f57619d9ad5ad3c3d54ec1aa60b969d251e4` |
| `R3a/R3a.mp4` | 2368626 | `9badbd52c96536733b8bcfe6ab896f43f765f9b691dc53fcac9d9e00efb0a31d` |
| `R3a/R3a.wav` | 3175416 | `2484f4b799507f52489a543468a286c1fa1c2a47bb7997f0f71480d3fa7aede9` |
| `R3a/R3a.webm` | 964471 | `9b4123d6fea41f0d001b26e0b5ddd267444374ac82ad2fdbc954dd4ec7545dab` |
| `R3a/original/crescendo313_2014_09_04_0.mp4` | 175074292 | `54c16427e5e026de6cdc2f840ad9830b99cd63d87e2c7e7bfac28d6fe066b41f` |
