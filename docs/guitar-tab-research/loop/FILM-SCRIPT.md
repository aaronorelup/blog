# FILM-SCRIPT: Where the hand can reach

The film for LOOP's post, written 2026-11-27 from `RESULTS.md`, `results.json`, `HAND.md`, `TUNING.md`, `LADDER.md`,
`STATE.md` and the runs in `G/loop/` (G = `/home/user/gtv`). Narration and shot list. The film lane wires each shot to its
files with AO-082's kit (`G/production/kit/`, `../video/PRODUCTION.md` sections 2, 5, 6 and 6.10) after the weekly reset.

- **Title:** Where the hand can reach
- **One sentence:** Given which frets the hand can reach and a tuning it found by itself, Opus 5.5 wrote closer tabs
  than a plain solver on every song, best in one whole-song session, but scored lower on three recordings it had never
  seen.
- **Voice:** ElevenLabs "Mike", AO-082's settings (`VOICE.md`). A neutral narrator: it never says "I" and never speaks
  for Aaron.
- **Colours** as AO-082: sky blue = right string and fret, blue outline = right note, other place, gold dashed =
  missed, terracotta hatched = made up. Every tab is heard: the recording, then the key, then the attempt, the same
  seconds through the same SoundFont program (24 nylon, 25 steel), at least 4 s each, alone.
- **Length:** about 10:15: narration 1,077 words at 164 wpm = 6:34, 20 listening windows of 4 to 5 s with their gaps
  1:50, holds and cards 1:00, line gaps and scene changes 0:50. Shorter than FILM-PLAN's 12 to 15 minutes: the findings
  are fewer and plainer than planned, and no line is padded.
- **Never shown:** Aaron's own recordings, anything of AO-078, the players' tab pages, a held-out key file.

## ch01 · One bar, written (1:40)

Shots: (s1) title card, finished on frame one: "Where the hand can reach" / "Opus 5.5, the hand's reach and a tuning it
found by itself". (s2) the capo song's footage 53.0 to 57.0 s with the window band (E1's
overlay clip; frets 6 to 11 lit). (s3) tabplayer stack 53.29 to 56.45 s: key on cream, the loop with the hand off (L4)
below, then the loop with it (L2). Verdict marks after the windows.

Listen: the recording 53.3 to 57.3 s; the key's tab, same seconds; L4's tab; L2's tab.

- `l01` [s2] Gareth Evans plays Steal My Girl, capo on the third fret. Over the neck, a band: the frets his hand can
  reach at this moment, six to eleven.
- `l02` [s3] Above, the answer key, read from his own tab. Below, two tabs written by Claude Opus 5.5, one bar at a
  time, from the same detected notes.
- `l03` [s3] The first never saw the band. It put this riff at the second and third frets: the right notes, all five in
  the wrong place.
- `l04` [s3] The second was shown where the hand was. All five land where he played them, at the seventh, eighth and twelfth.
- `l05` [s3] This film is about those constraints: what the hand can reach, how the guitar is tuned, and how much an
  AI gains by being held to them.

Data: footage `G/songs/capo/capo.mp4`; window `hand/capo/hand_window.csv`; key `G/truth/capo/capo.truth.json`; L4
`G/loop/runs/l4-capo/answer.json` (s5f3 s3f2 s4f2 s5f3 s4f2); L2 `G/loop/runs/l2-capo/answer.json` (s6f8 s4f7 s5f7 s6f8
s6f12); units.csv unit 17: L2 5 of 5, L4 0 of 5.

## ch02 · Constraints, not transcription (1:00)

Shots: (s1) Aaron's direction as text cards (DIRECTION.md, his words, quoted). (s2) four tiles: TUNING, CAPO, HAND,
NOTES, the capo tile marked GIVEN.

- `l06` [s1] The last film, AO-082, chained the best tool at each step and found that reading the tuning and capo
  decided whether a tab came out right.
- `l07` [s1] So this time the job was set as a constraints problem. A note can only be played where the tuning puts
  that pitch, above the capo, and within reach of the fretting hand.
- `l08` [s2] The capo is given: a person filming knows where it is. The tuning is found. The hand's reach is read from
  the video. And the notes come from the best note models AO-082 measured.
- `l09` [s2] Chords and song analysis are left out.

## ch03 · Where the hand can reach (2:30)

Shots: (s1) one frame of the capo song with fret wires lettered by `wire_candidates.py`, two named by Opus. (s2) the
neck model: every other fret from twelve-tone spacing, drawn over the frame. (s3) the overlay clip, 10 s, band
following the hand (E1 film clip, `G/loop/e1/film/`). (s4) the check: a keyframe with Opus's accept / correct marks. (s5)
stat tiles: coverage 0.995 / 1.000 / 0.998; places per note 3.46 to 1.53, 3.62 to 1.45, 3.24 to 1.24. (s6) one failure:
a tap read late, or a landmark a fret off (HAND.md failures list).

- `l10` [s1] The hand tracker finds the fingertips in every frame. On its own, it cannot say which fret a fingertip is
  on.
- `l11` [s1] So Opus looks at a frame, finds the fret wires, and names a few of them, counting from the nut or reading
  the inlays.
- `l12` [s2] Every other fret follows from the way frets are spaced, so no fret line has to be detected. The model of
  the neck is then carried through the video as the guitar moves.
- `l13` [s3] The band is the frets under the fingertips, one fret either side, counted from the capo. Open strings are
  always allowed. When the hand is lost, there is no band, and no constraint.
- `l14` [s4] Then a second Opus, which never saw the first one's reasoning, checks the band on the overlay every ten
  seconds, and wherever it looks unsure, and accepts or corrects it.
- `l15` [s5] Against the three answer keys, the band holds nearly every fretted note: ninety-nine and a half in a
  hundred, all of them, and ninety-nine point eight.
- `l16` [s5] And it narrows the choice. A note that could be played in three or four places can now be played in one
  or two.
- `l17` [s6] It fails where the hand does something odd: a note tapped by the picking hand, read late; a fingertip
  placed a fret off.

## ch04 · The tuning, found like a person (1:50)

Shots: (s1) the nylon song at 31.8 s: the G minor grip, fingertips on the overlay. (s2) AO-082's answer for the 1st
string, D4, against the fingers' C4: the fourth finger at string 1 fret 2 at 31.82 s (`fingers.py`) as D4 sounds. (s3) grid: 18 of 18 strings, both Opus conditions; held out
18 of 18 (E A D G A D, D G D G B D, E A D G B E). (s4) barchart: the solver on the nylon song with the true tuning 0.801,
with AO-082's wrong one 0.619.

Listen: the nylon recording 31.0 to 35.0 s.

- `l18` [s1] A person finds a tuning by looking and listening: which strings ring open, one clear chord shape, which
  notes the hand can reach.
- `l19` [s2] On the nylon song, AO-082's tools said the first string was a D. The fingers say C. In this G minor grip a fourth
  finger presses the first string at the second fret just as a D sounds. On a D string that would be an E, and no E is
  ever heard.
- `l20` [s3] Shown the video, the notes and the hand's band, Opus named all eighteen strings of the three songs. Later,
  on three recordings it had never seen, two of them in tunings it was never tried on, it named all eighteen again.
- `l21` [s4] The tuning matters. With the nylon song's tuning wrong by one string, the same solver falls from eighty in
  a hundred notes in place to sixty-two.

## ch05 · One bar at a time (1:50)

Listen: the capo song's bar 39 (121.9 to 125.9 s): the key, then L2's tab (5 of 5 right).

Shots: (s1) the loop as a diagram: pack (spectrogram with candidates, neck picture with the band, solver proposal,
similar bars, notes so far) -> writer -> checks -> state -> revisits. (s2) the pack view for one bar (still, two panels).
(s3) per-bar line chart: right share by bar, L2 on the three songs. (s4) L1 nylon, all 628 right.

- `l22` [s1] The loop gives a fresh Opus one bar at a time. It sees the bar's sound, every note any model heard there,
  the neck with the hand's band, what a plain solver would write, and lessons carried from the bars before.
- `l23` [s2] It decides which notes were played, and where. Its answer is checked, kept, and the loop moves on. Now and
  then it goes back to an earlier bar.
- `l24` [s3] Across the three songs, its tabs put eighty-six, eighty-seven and eighty-four in a hundred key notes in the
  right place.
- `l25` [s4] Given the key's own notes instead, it placed all six hundred and twenty-eight of the nylon song right. With
  the right notes, placing them is close to solved. What is left is finding the notes, and one kind of mistake.

## ch06 · The ladder, heard (2:00)

Shots: (s1) barchart per song: plain solver, loop with the hand off, loop with the hand, one whole-song session. (s2)
tabplayer on the capo song 25.2 to 28.2 s: key, the loop (open strings), the whole-song session (string 4, frets 7
and 9). Verdict marks.

Listen: recording 25.0 to 29.0 s; key; L2; W2.

- `l26` [s1] Each rung adds one thing. A plain solver, with the same notes, tuning and band, puts eighty-three,
  eighty-five and eighty in a hundred in place.
- `l27` [s1] Opus, one bar at a time but without the band: seventy-eight on the capo song. With the band: eighty-six. On
  the nylon song, played near the nut, the band adds almost nothing.
- `l28` [s1] And one Opus session given the whole song at once: ninety-five, eighty-eight and eighty-three.
- `l29` [s2] Here the gap is heard. He plays this phrase high on the fourth string. The bar-by-bar loop wrote the same
  pitches down by the nut, one of them on an open string, which is always allowed. The whole-song session put them where he played them.

## ch07 · Bar by bar, or the whole song (1:40)

Shots: (s1) two columns: L2 and W2 per song, score, cost, minutes. (s2) E6: three bars (L2, E6, L4) on units 0 to 37.
(s3) per-bar line: no slope.

- `l30` [s1] The whole-song session matched the loop on two songs and beat it by nine points on the capo song, at a
  fifth of the cost: eight to eleven
  dollars and about half an hour, against thirty to fifty-five dollars and two to three and a half hours.
- `l31` [s2] Does the loop learn as it goes? A copy that forgot everything before each bar did no worse on the first
  half of the capo song: eighty-four in a hundred against eighty-two.
- `l32` [s3] And no song got better bar by bar. On these songs, one bar at a time is just cutting the work into pieces,
  not learning.

## ch08 · Three new recordings (1:50)

Shots: (s1) three cards with footage: Closer (Gareth Evans, E A D G A D, capo 1), September (Evan Handyside, open G,
capo 2), Three Little Boats (Culture Vannin, a traditional Manx tune). (s2) "frozen at commit 497b3524" stamp. (s3)
barchart: W2 on the three songs against the three new ones. (s4) tabplayer on September: key s2f3 against the open first
string.

Listen: each new recording 4 s on its card (s1), then W2's tab of the same seconds (3 x 2 windows); in s4 a September
passage with s2f3 (pick from `w2-ho-september` wrong places): the recording, the key, W2.

- `l33` [s1] Everything was then frozen and run on three recordings it had never seen: a new tuning, an open tuning,
  and a third player.
- `l34` [s3] The notes were found well. Three Little Boats, a folk tune where each note has one sensible place, scored
  ninety-four in a hundred. September, eighty-two. Closer, in its new tuning, seventy. On the first three songs it was
  eighty-eight and a half. The method does not carry over to every new song yet.
- `l35` [s4] Most of the drop is one mistake. The player frets a note, and the same pitch is also an open string.
  The band cannot rule the open string out, so the tab says open.

## ch09 · What the app should ask (1:00)

Shots: (s1) one card, four lines: ask for the capo; find the tuning; one whole-song session; next: the fingers.

- `l36` [s1] So the app asks the person one thing: where the capo is. It finds the tuning itself, reads the hand's
  reach, and gives one Opus session the whole song.
- `l37` [s1] What is left is the fingers: telling an open string from the same note fretted. The hand tracker's
  fingertips are about a string off, so that is the next constraint to get right.

## ch10 · Credits (0:35)

The recordings and players as `../video/songs.json` has them (AO-082's three), plus: *Closer*, fingerstyle arrangement
and performance by Gareth Evans (archive.org mirror); *Wake Me Up When September Ends (Jonathan's Version)*, Evan
Handyside (Vimeo); *Three Little Boats*, traditional Manx tune, guitar lesson by Culture Vannin, CC BY 3.0 (Wikimedia
Commons). Keys built by the NOTES session from the players' own tabs. The tools and models by name as on the tool tags
(MediaPipe hand landmarks, gaps-paper and the other note models, gtr-eval 0.12.1, FluidSynth FluidR3_GM). Written,
run and checked by Claude Opus 5.5 at max effort.

## For the film lane

- Kit needs: a fret-window band on footage (E1's overlay clips, no new overlay); a per-bar line chart in `barchart`'s
  style; the pack view (two stills side by side with a caption).
- Every listening window rendered again from the tab's notes at 48 kHz, as AO-082.
- Numbers the narration says, with their sources: l15 HAND.md; l20 TUNING.md and results.json heldout_tuning; l21
  LADDER.md nylon rows; l24, l26 to l28, l30 RESULTS.md tables; l31 results.json e6; l34 results.json heldout.
