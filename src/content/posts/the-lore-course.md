---
id: "AO-064"
title: "A course on the world of my AI-made TV series"
summary: "I had agents build a companion course for my AI TV series: character sheets, a timeline, a map of its easter eggs and nine narrated lessons, all from one set of files that tags how settled each fact is."
date: 2026-10-23
topic: "learning"
project: ["evening-television"]
preview:
  verdict: "One source, nine lessons"
  takeaway: "The whole world of my AI series now lives in one set of files, and each line is tagged by how settled it is, from 'set in steel' to open question."
  points:
    - "Only 402 of 8,338 lines are set in steel (my calls). The rest, from on-screen facts to open questions, can change."
    - "Nine narrated lessons, 50 min. Code draws their pictures from the lore as they play, so new dates need no re-recording."
    - "About 20,000 ElevenLabs credits and $3.90 of image generation. No GPUs: the lessons render in a browser on CPUs."
  image: "/media/previews/the-lore-course.webp"
  alt: "The course page: the title I Love My Evening Television beside four tiles, one for each episode"
---

I had four crews of Claude agents spend two days building a companion course for my AI-made TV
series, [I Love My Evening Television](/courses/i-love-my-evening-television/). It has a
character sheet for all 77 characters in the series, a timeline, a map of the easter eggs and
nine narrated lessons, about 50 minutes in all.

**Everything on it comes from one set of plain text files, and every line in them is tagged by
how settled it is.** Only 402 of the 8,338 lines are "set in steel", which means I signed off on
them. Everything else is free to change.

<img src="/media/the-lore-course/hero.webp" alt="The course page on a desktop screen: the title, counts of 4 episodes, 77 characters, 72 things, 8,338 lines of lore and 402 set in steel, and a tile for each of the four episodes" style="width:100%;border-radius:8px">

The series is made of half-hour episodes, and there were four when the course went up:
[Crimson Coil](/ledger/crimson-coil/), [Earthlight](/ledger/earthlight/),
[Context Window](/ledger/context-window/) and [Touch Move](/ledger/touch-move/). Every cast is
new, but they share one world. Rosie is nine in the first episode and about seventy by the time
the story reaches the Moon. Details planted in one episode come back in the next, and I call
those eggs. All of that was scattered through the crews' notes. I wanted it in one place, with
what I've agreed to kept apart from what the agents are only assuming.

What makes it work:

- **Every line wears one of six tiers,** a tag that runs from set in steel down to open question.
- **The lessons draw their own pictures.** Code draws them from the lore while a lesson plays,
  so a new date or picture needs no new recording.
- **Every spoken sentence cites its line and has to say how sure it is.** A checker refuses any
  sentence that states a guess as fact.
- **It cost about 20,000 voice credits and $3.90 of pictures.** The credits are on ElevenLabs
  (an AI voice service). No GPUs were used (the pricey graphics cards AI usually runs on).

## The six tiers

Only steel is a commitment. The rest is there so nobody starts from nothing, and the crews are
expected to change it when they see something better.

| Tier | What it means | Lines |
|---|---|---|
| Set in steel | I agreed to it, and only I change it | 402 |
| On screen | Shown, said or written in a finished episode | 3,859 |
| Egg | Planted. The object is on screen, what it means is only implied | 780 |
| Running | The crews' current reading: notes, inferences, timeline math | 1,870 |
| Idea | A proposal, not adopted | 923 |
| Open | Left unanswered on purpose | 504 |

The [steel page](/courses/i-love-my-evening-television/steel/) is what the agents and I check
before building anything.

<img src="/media/the-lore-course/phones.webp" alt="Three phone screenshots: the six tiers with their line counts, Rosie's character sheet, and the egg atlas" style="width:100%;border-radius:8px">

## What's on the course

- **[77 character sheets](/courses/i-love-my-evening-television/characters/) and
  [72 things](/courses/i-love-my-evening-television/things/).** Every line shows its source, like
  `{E2 14:07.5}` for Episode 2 at 14 minutes 7 seconds.
- **A [timeline](/courses/i-love-my-evening-television/timeline/)** of 18 lives, with each
  person's age in each episode.
- **An [egg atlas](/courses/i-love-my-evening-television/eggs/)** of 53 families of planted
  details and what each might mean.
- **[Threads](/courses/i-love-my-evening-television/threads/) and
  [open questions](/courses/i-love-my-evening-television/questions/).**
- **[All four episodes](/courses/i-love-my-evening-television/episodes/) in full,** even the two
  not on YouTube yet.

## The nine lessons

Each lesson is 5 to 6 minutes: the world, one per episode, Rosie's life, the Moon, threads
and eggs, and what's steel and what's still a guess. Each has captions, chapters and a
transcript you can tap to jump. This is [the first one](/courses/i-love-my-evening-television/lessons/01-the-world/).

<video controls playsinline preload="metadata" poster="/courses/i-love-my-evening-television/lessons/01-the-world/poster.jpg" src="/courses/i-love-my-evening-television/lessons/01-the-world/lesson.mp4" style="width:100%;border-radius:8px"></video>

The narrator is a voice the agents designed in ElevenLabs and picked in a blind audition. Every
recorded line was transcribed back, and the misheard ones were redone. "It is Aaron's to settle"
had come out as "has errands to settle".

## Placeholder pictures

Every picture on the course says what it is. 276 are marked used, mostly frames from the
episodes, and 3 are steel, looks I approved. 25 are placeholders, quick references so a
character nobody has seen yet still has a face to argue about. Those are free to change, and
nobody should copy one into an episode just because it exists.

<img src="/media/the-lore-course/pictures.webp" alt="Two picture panels from the course: the park from Episode 4 marked USED above a generated location sheet marked PLACEHOLDER, and a placeholder sheet of the hammer fox" style="width:100%;border-radius:8px">

## How it updates

I can change a fact by telling any of my agents ("Rosie is Amara's mother, set in steel") or by
editing the line. One command rebuilds every page and lesson, and only the sentences whose words
changed get voiced again. If a line's tier moves under a sentence that's already recorded, the
lesson shows a flag like "now Steel (was Open)" until that sentence is rewritten. The first
change came that same night. My [Touch Move](/ledger/touch-move/) post went live, and its lore
lines were updated to say so.

<details><summary>How the narrator was picked</summary>

- Fifteen voices read the same passage: six new designs, eight narrators from ElevenLabs'
  library and the first design.
- Each reading was transcribed back and measured, and three of Google's Gemini models ranked
  them blind.
- The first designed voice came last. It had almost nothing above 3.7 kHz, the high end of the
  sound, which is why it was muffled on a phone.
- "Tier" was another misheard word. It had come out as "tear".

</details>

<details><summary>What the course holds, in numbers</summary>

- 158 lore files, one per character, thing or episode plus the world, the timeline, the eggs,
  the threads and the open questions. They hold 8,339 lines. One is marked private, so 8,338
  are public.
- 153 pages for an episode, character or thing, and every one has at least one picture.
- 421 dated lines on the timeline, where year zero is the night of Episode 1.
- The course shows each tier by its shape, not by color alone.
- 372 egg appearances across the four episodes, in 53 families.
- 40 threads and the open questions, each with the answers on the table.
- Nine lessons of 5 to 6 minutes, each with captions, chapters, a transcript and a 720p MP4.

</details>

<details><summary>What it cost</summary>

- **ElevenLabs: about 20,000 credits.** 5,048 went on the audition and 393 on the first
  prototype. The nine lessons came to about 14,500 with their re-recordings. The quiet music
  under the lessons was made once with Eleven Music, ElevenLabs' music maker, and isn't counted
  separately.
- **Nano Banana Pro, Google's image model: $3.90** for 19 of the placeholder pictures, 29 takes
  at $0.134 each. Two more were drawn in code.
- **No GPUs.** Every lesson was rendered in a web browser running with no screen, on a cloud
  computer with four ordinary processors.

</details>

<details><summary>What wasn't finished when it went up</summary>

- No person had listened to the narrator yet, me included. Changing her later means recording
  all nine lessons again.
- Each lesson's MP4 download was drawn from the lore as it stood when that lesson was built. The
  lessons on the page draw today's lore. The next rebuild re-renders the MP4s.
- The link on each line points into the series' private code, so for everyone else the source
  in braces is the record of where a line came from.

</details>

*Written up from the crews' own notes. The course, the lessons and the first write-up were by Claude agents.*
