# For Aaron: what is left for you to run

**Status: this is an index, not the single merged list.** The run was stopped before the ten lanes' lists
were merged into one. The steps themselves are written and were checked by each lane's verifier.

154 entries across the ten lanes have steps for you. Each list names which test clip to use and what to
send back so an agent can count your result the same way as the others.

| Step | Entries with steps | File |
|---|---|---|
| Splitting a song into instruments | 11 | [lanes/source-separation/for-aaron.md](lanes/source-separation/for-aaron.md) |
| Turning sound into notes | 21 | [lanes/audio-to-notes/for-aaron.md](lanes/audio-to-notes/for-aaron.md) |
| Chords, beat, key and tuning | 13 | [lanes/chords-beats-key/for-aaron.md](lanes/chords-beats-key/for-aaron.md) |
| Choosing the string and fret | 8 | [lanes/guitar-tab/for-aaron.md](lanes/guitar-tab/for-aaron.md) |
| Melody, bass and taps from one guitar | 19 | [lanes/fingerstyle-voices-taps/for-aaron.md](lanes/fingerstyle-voices-taps/for-aaron.md) |
| Hands and the fretboard from video | 11 | [lanes/video-hands-fretboard/for-aaron.md](lanes/video-hands-fretboard/for-aaron.md) |
| Tab rendering, editing and playback | 8 | [lanes/web-tab-render/for-aaron.md](lanes/web-tab-render/for-aaron.md) |
| Metronome and sync in the browser | 14 | [lanes/browser-audio-sync/for-aaron.md](lanes/browser-audio-sync/for-aaron.md) and the measuring page [browser-timing-check.html](lanes/browser-audio-sync/for-aaron/browser-timing-check.html) |
| Services an agent can call | 21 | [lanes/hosted-apis/for-aaron.md](lanes/hosted-apis/for-aaron.md) |
| Existing apps | 28 | [lanes/apps-survey/for-aaron.md](lanes/apps-survey/for-aaron.md) |

## The test clips

The 26 clip files (the 17 clips, plus the true stems of S4 and S6taps and the videos' audio) are in your
studio library: project `blog-posts`, run `20261110-225132-vm-7d3107`, items #70897 to #70922, filed as
reference. What each clip is, and its known notes, strings, frets, beats and chords: [inputs/INPUTS.md](inputs/INPUTS.md).

## Sending results back

One folder per test, named by the lane and the tool, holding exactly the files that test's steps list
(usually the exported tab, MIDI or stems, plus a screenshot and a line of notes: time taken, cost, settings).
An agent can then score them with `scripts/gtr-eval` against the clip's truth file.

## Three things only you can decide

1. **Code from cloned repositories.** The cloud box's permission system refused to install or run code from
   cloned repositories and downloaded binaries in most cases (MT3, ADTOF, LarsNet, BTC, gtrsnipe, the
   AnthemScore AppImage and others). The lanes' lists have steps for you. If you would rather an agent ran
   them, that needs a permission rule from you.
2. **Consent boxes.** AnthemScore Web stops at a box confirming you own the rights to the upload. No agent
   ticked it.
3. **Keys and credit.** The Gemini key answered HTTP 402 (no credit), there is no Hugging Face token or fal
   key in the key store, and the hosted separation and transcription services each need an account.
   `lanes/hosted-apis/for-aaron.md` has the first request for each.
