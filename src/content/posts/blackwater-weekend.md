---
id: "AO-002"
title: "I built a cave-diving zombie game with AI in four days"
summary: "I had Claude build a zombie game where you're cave diving. What it would and wouldn't do on its own, why I had it build me a level editor, and who should write a game's song lyrics."
date: 2026-08-02
topic: "games"
project: ["blackwater"]
preview:
  verdict: "Ask for tools, not fixes"
  takeaway: "Claude couldn't fix its own 3D bugs even with screenshots, but it built me an editor to fix them myself, so on 3D projects I now ask for tools and tests first."
  points:
    - "It worked hard on code but rationed effort on the story, so I had to push every beat of the lore by hand."
    - "AI voice lines and music from ElevenLabs made the rough graphics feel alive. On a small game, do sound first."
    - "Lyrics that must match the game's lore should come from the lore document. For a feeling, let the music AI write them."
  image: "/media/previews/blackwater-weekend.webp"
  alt: "A blocky green-faced zombie in a dark flooded cave, a pistol in the foreground"
---

I had Claude build BLACKWATER, a zombie game where you're cave diving, in 58 commits (saved
versions of the code) over four days. You can play it at
[play.aaronorelup.com](https://play.aaronorelup.com) with a keyboard and mouse. It's rough, but
it's playable and it's fun.

Claude couldn't see or fix its own 3D bugs, even with screenshots. But it built me a level editor,
a tool for moving the pieces of the cave by hand, and with it I fixed them in seconds. So on any
3D project my first ask is now tools and tests that check its work.

<figure class="wide">
  <img src="/media/blackwater/card.webp" alt="A blocky green-faced zombie in a dark flooded cave, a pistol in the foreground" loading="lazy">
  <figcaption><b>BLACKWATER</b><span class="ao-meta">A zombie coming at you in the flooded caves · the graphics are placeholder quality, the sound isn't</span></figcaption>
</figure>

What I took from it:

- **Ask for tools, not fixes.** It couldn't fix a tunnel cutting through another part of the cave.
  The editor it built let me fix it myself.
- **It works hard on code and coasts on the story.** I had to push every beat of the lore by hand.
- **Do sound before visuals.** AI voice lines and music made the bad graphics feel alive.
- **Who writes the lyrics depends on the song.** If it has to match the game's story, the words
  come from the lore document. If it only has to carry a feeling, let the music AI write them.

My Claude credits were about to reset, so I spent them on an idea I'd carried around for a
while. Black Ops zombies, the zombies mode from Call of Duty, except you're cave diving. I watch
real cave diving videos constantly, and Black Ops was the game of my childhood.

## Claude couldn't see its own 3D bug

Even with screenshots and the exact coordinates, it couldn't fix it. The cave is built from
nodes, stretched spheres placed in 3D, with tunnels running between them. A tunnel would cut
straight through a third node sitting in its way. I could see it right away, and the model never
could. I think the bug was in how several fine-looking decisions added up, and it couldn't hold
all of that at once.

## So I had it build me a level editor

I stopped asking for fixes and asked for a level editor instead. It built a good one right
away. Now I can move nodes and tunnels and fix anything in seconds without describing the
problem to anyone. Every setting in the game is in a panel too, so I can retune
while playing.

It's much better at building the tool that covers its weakness than at covering the weakness. The
editor ships with the game, behind the DEVELOPER TOOLS door on the title screen.

## It worked hard on code and coasted on the story

On a hard code problem it'll go a long way on its own. On long creative work it does about five
minutes and calls it finished. Left alone it wanted the most basic story, with every piece of the
world explained on screen, which is wrong for horror. It got there, but only because I pushed
every beat.

<details><summary>How I pushed it</summary>

- I planned first. A design doc, then a lore bible (one document with the whole story of the
  world), before a single line of gameplay code. I assumed it would be great at the lore.
- I turned on ultrathink, its longest thinking setting, and asked it to write the lore, check how
  the lore shaped the gameplay, then revise. Even then it was lazy, which surprised me given how
  far it goes unprompted on hard code.
- So I asked every question myself. Does this actually serve the gameplay? Is this actually
  creepy, given it's supposed to be horror? Is this complete?
- Horror runs on unanswered questions. In a Black Ops-style story, what one game shows should be
  a thin slice of something much bigger underneath it. It took constant massaging to get there.

</details>

## Sound did more than the graphics

The graphics are programmer art, the placeholder stuff a coder makes. That mattered less than I
expected. I pointed Claude at ElevenLabs, an AI audio service, and it handled the sound effects,
voice lines and music without much supervision. Hearing the characters speak makes the world
feel alive, even when a line isn't what I'd have written.

## Who should write a song's lyrics

It depends on what the song has to carry. I love two of the game's songs, and they were made in
opposite ways.

**Still on Shift**, the game's anthem, carries facts. Claude wrote its lyrics into the game's lore
document, and they go to ElevenLabs word for word. Its verses point to audio tapes hidden around
the game, things a music AI couldn't know.

<figure class="wide">
  <iframe class="embed" src="/media/still-on-shift/?embed" title="BLACKWATER, Still on Shift" allow="fullscreen" loading="lazy"></iframe>
  <figcaption><b>Still on Shift</b><span class="ao-meta">The song with the music video Claude later made <a href="/ledger/still-on-shift-music-video/">inside a rebuilt version of the game</a> · sound on</span></figcaption>
</figure>

**Moonlight at the Waterline**, a 1960s ballad on the jukebox about waiting for a diver who's
running late, only carries a feeling. Claude wrote a brief and ElevenLabs wrote every word,
including "you're a little late, my love", the line I love. Claude later made it a
[music video](/ledger/moonlight-two-cuts/) too.

<details><summary>What went into each song</summary>

- **Still on Shift.** The script that makes the song copies the lyrics straight out of the lore
  bible and passes them to ElevenLabs. The verses have the crew count that's off by one, the two
  instruments that disagree about the depth of the bore, the doctor who timed the crew's
  synchronized pulses in their sleep and caught his own wrist doing it, and the toys nobody
  remembers ordering. Each one is a callback to a tape hidden elsewhere in the game.
- **Moonlight at the Waterline.** It's an easter egg, a period-correct slow dance sitting in a
  horror game about a drowned dive site. Claude's brief had the era, the instruments, the mood and
  one request, a faintly eerie line about water keeping what it likes. A songwriting model is
  better than Claude at rhythm and at making a line sit right in a bar, so letting it write the
  words got me something more singable than spelling them out would have. I'd listen to it outside
  the game.
- **"Always let the music AI write the words" is wrong.** I believed it for about an hour.
- **The lore paid off even half-done.** I half-assed it, honestly, and Claude did an okay job.
  Because the lore bible existed, Claude kept reaching back into it and the game feels like one
  thing instead of a pile of features.
- **Claude's part in Still on Shift was continuity work.** Threading a dozen details from the lore
  bible through a lyric is a lot closer to the work Claude is eager to do.

</details>

I'll come back and play it every so often, for no reason other than that I like it.
