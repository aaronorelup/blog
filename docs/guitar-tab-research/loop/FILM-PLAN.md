# The film: plan

The film for LOOP's post, planned 2026-11-27 07:25 UTC while the last runs finish. Built with AO-082's kit
(`G/production/kit/`, `video/PRODUCTION.md` sections 2, 5, 6 and 6.10) and its narrator (ElevenLabs "Mike", the same
settings). The weekly Claude limit read 0.85 at 06:51 UTC: the script is written now; the voice, chapters and render
wait for the reset (about 2026-12-02 11:00 UTC) unless Aaron says otherwise or at least 8% of the week is left.

Target length 12 to 15 minutes. Every tab heard: the recording, then the answer key, then the attempt, the same bars
through the same SoundFont program (24 nylon, 25 steel), at least 4 s each alone. Verdict colours as AO-082: sky blue
found, gold dashed missed, terracotta hatched made up; a right pitch on another string is a blue outline.

## Chapters

| # | chapter | about | what it shows | data |
|---|---|---|---|---|
| 1 | One bar, written | 1.5 min | the nylon song's bar from the opening: the recording, the pack the writer saw (spectrogram with candidates, the neck with its window), its tab, heard against the key | `G/loop/bw/<l2-nylon>/u0NN/`, L2 nylon tab, key strip |
| 2 | Constraints, not transcription | 1 min | Aaron's direction in his words (DIRECTION.md), the four constraints (tuning, capo, hand, notes), the capo given | DIRECTION.md |
| 3 | Where the hand can reach | 2.5 min | the neck model from two named wires, the window band following the hand (E1's overlay clips), Opus setting anchors and checking them blind; coverage 0.995 / 1.000 / 0.998, places per note 3.4 -> 1.2 to 1.5; the failures (a tap read late, a landmark a fret off) | `G/loop/e1/film/*.mp4`, `HAND.md`, `hand.json` |
| 4 | The tuning, found like a person | 2 min | the nylon 1st string: AO-082 said D4, the fingers say C4 (the G minor grip at 31.8 s; Bb3 ringing with C4); 36 of 36 strings over 6 blind runs; what a wrong tuning costs (the solver 0.801 -> 0.619) | `TUNING.md`, the run's frames, `LADDER.md` |
| 5 | One bar at a time | 2 min | the loop: pack, writer, state, revisits; minutes and tokens a bar falling in the last third; with the key's notes it is perfect (L1 nylon 1.000) | `LOOP-DESIGN.md`, runs' `score/summary.json` |
| 6 | The ladder, heard | 2 min | per song: the plain solver, the loop with and without the hand window, the whole-song session; the capo song's tap passages heard (the loop's open strings against the key's fret 9) | `LADDER.md`, run scores |
| 7 | Bar by bar or whole song | 1.5 min | W2 against L2, cost and time; E6 (state emptied); what "learning" turned out to be | W2, L2, E6 scores |
| 8 | Three new recordings | 1.5 min | Closer (E A D G A D, capo 1), September (open G, capo 2), Boats (a new player): the frozen method, the tuning found, the score | held-out scores |
| 9 | What the app should ask | 1 min | ask for nothing but the capo; check the tuning Opus finds; the notes are what is left; what still fails | all |
| 10 | Credits | 0.5 min | the recordings and players (AO-082's credit block plus the three new ones), the tools, the models | `video/SONGS.md`, NOTES' held-out records |

## Kit needs (before any chapter)

- A fret-window band on footage: E1's overlay clips already draw it (`G/loop/e1/film/`), so footage with no new overlay.
- A per-unit curve (right share by unit, two or three runs on one axis): a small line chart in `barchart`'s style.
- The pack view: the writer's spectrogram and neck picture side by side, as stills, with a caption line.
