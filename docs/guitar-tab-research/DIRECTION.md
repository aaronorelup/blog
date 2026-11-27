# Direction for the guitar tab app (Aaron, 2026-11-27)

Aaron's notes after watching the film at the top of AO-082 ("From a guitar video to a finished tab", 49:35). They set
the direction for the next work. Every later session reads this first. Where a session's plan and this file disagree,
this file wins until Aaron says otherwise.

## The project, narrowed

- **The app:** turn a video recording of **solo fingerstyle guitar** into tablature with AI, with a person there to
  help correct it. The person may already know the tuning and the capo fret, and can correct notes that sound wrong.
- **The target is the tab as it was actually played in the video**, not as the song is "supposed" to be played. A
  separate tool later will quantize it and make the tab the way it is "supposed" to be played.
- **Running assumption:** if the notes are right and the tuning is known, almost everything else can be done well.

## Constraints, not transcription

Assume Opus 5.5 can write new guitar tablature on its own, and treat the job as a **constraints problem**. The
constraints make the result the tab of the song that was played, the way it was played, instead of a plausible tab for
some song. The better the constraints, the better the result:

- the tuning of the guitar;
- where the capo is;
- where the fretting hand is on the neck;
- which notes were played.

Later the user can correct or loosen these constraints, to fix the tab or to turn it into something better than the
original.

## What to work on

1. **The notes (a major goal).** Find better ways to get the notes actually played. Aaron asked: "Can we do a
   diffusion method like AO-087?" In AO-087 (`three-ai-experiments.md`), the music model gives every possible next note
   a probability. Its sound "opens as all the notes at once and thins out as the model makes up its mind". The likely
   meaning is a method that starts from every possible note and refines towards the notes that were played. That could
   be diffusion-based transcription, or an iterative denoising or analysis-by-synthesis loop. The session that takes
   this on says plainly how it read it. The app can run several methods and let the user pick the best one and correct
   what is off.
2. **The tuning.** Sometimes the user knows it; people would also love help finding it. How a person does it:
   - Compare the notes played in a short clip with the notes heard, and from the hand's position work out which notes
     must be open strings. The capo position is already known.
   - Find a moment in the video where a string is clearly played open, and listen for that note.
   - Or find one clear chord shape, listen for the chord, and work out which tuning makes that shape play that chord.
     Where the hand is on the neck is known; AI can do this well, especially with the hand tracker.
   - Then assume that tuning and work through the song one bar at a time. Change the tuning only if what is seen being
     played does not match what is heard.
3. **Hand tracking, used the right way.** It was useful but applied wrong in the film. Use it to see which frets the
   player's hand can reach at each moment of the video, so the tab never gets a note that clearly was not played there.
   **Opus must use the tool and check its output himself.**
4. **The loop, one bar at a time.** The film's experiment ran the loop on the whole song. The AI should work
   iteratively, the way a person does: one bar at a time. What it learns in each bar should improve the bars before it
   and make the next ones more accurate and faster.
5. **The capo is a given.** It is treated as solved, and when it is wrong the user can usually correct it. **Every
   experiment gives the capo from the start.**

## Left out for now

- **Chord identification and song analysis.** Aaron is not sure they help make the tab, so they are left out for now.
  Later they can be a retroactive thing done for fun. The running assumption: having the tab makes the song easy to
  analyse, not the other way around.

## What each session delivers

A blog post with a film each, like AO-082's. Drafts wait for Aaron's OK in his own words before they are listed
(`CLAUDE.md`, "Every post waits for Aaron's OK").

## Aaron's question: why was MiMo tried at all?

Asked 2026-11-27. The orchestrator's answer: in the first research (AO-082's post), Xiaomi's MiMo was the one tool that
named the capo from the sound alone (fret 2 in 2 of 3 tries) when no chord or key tool did. That earned it a place in
the film as the plainest baseline: one general audio model asked for the whole job in one call. It was tried twice in
the film:
- For notes, it got almost none right. Onset F1 was 0.000, 0.000 and 0.026 on the three songs, against 0.78 to 0.99
  for the two guitar note models, guitar-gaps and guitar-fl (`video/RESULTS.md`, step 2, n-08).
- For the capo from the sound, it got the capo song right in 1 of 6 answers. Opus 5.5 looking at frames was right on
  all three songs (`video/RESULTS.md`, findings).

So it shows what a general listener cannot do yet. Under this direction there is no reason to try it again: the capo is
given, and the notes need a real note finder.

## His words

The notes above are ordered and lightly edited from his message of 2026-11-27, which is kept as he wrote it in the
session that made the film (claude.ai session `01UUo1wzpodZueETn2SeiGku`).
