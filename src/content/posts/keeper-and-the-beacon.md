---
id: "AO-004"
title: "I asked my agent to play my game. It handed back a documentary."
summary: "Claude played LLM Monster Hunter start to finish as a real player — then delivered a voiced, animated presentation of its own playthrough, built from screenshots it captured while playing. The presentation might be the bigger finding."
date: 2026-08-05
status: "shipped"
tags: ["claude-code", "llm-monster-hunter", "agents", "elevenlabs", "playtesting", "presentations"]
series: ["llm-monster-hunter"]
preview:
  verdict: "Played it, fixed five bugs"
  takeaway: "Have the agent capture evidence as it works and narrate it at the end: eleven minutes gave me full context on a two-hour session, no cold boot."
  points:
    - "It found five real bugs by playing, the worst silently eating any message over 500 characters, and fixed all five."
    - "Capture has to happen during the work: asked for afterwards, none of those screenshots would exist."
    - "Its review: the story is the strongest system and the referee is too kind. It never once said no to a good speech."
  image: "/media/previews/keeper-and-the-beacon.webp"
  alt: "Luminel Aeterna, the agent's moth-fey companion after evolving, its wings turned into star charts"
---

I've been building an AI-native monster-catching RPG for a while now — the code manages
state and numbers, a language model does the storytelling and refereeing. Last month I
built a whole test suite so the game could be playtested *without* anyone playing it,
because a human at the keyboard is the slowest part of the project.

This week I did the opposite. I told Claude: wipe my save, turn image generation on, and
play the game yourself, start to finish, like a real player. Fix any bugs you walk into.
And when you're done, make me a voiced presentation of your playthrough.

**[Watch the presentation it made.](/presentations/keeper-and-the-beacon/)** Twelve
narrated sections, about eleven minutes. Every image in it is a real screenshot the agent
captured while it was playing. I didn't stage any of it, and neither did it.

## What it played

It rolled a character I would never have rolled: Maren Holt, a lighthouse keeper who
hasn't blinked in twenty years, whose wish is to bring back the ship the sea took —
crew and all — and finally let her lamp go dark.

![Maren's painted portrait, generated from the wizard's appearance brief](/presentations/keeper-and-the-beacon/shots/10_portrait_full.png)

Then it played her *in character* for two full expeditions. It recruited a vain moth-fey
by promising to remember it. It won a battle without a killing blow by talking an
exhausted monster to sleep. It evolved its companion at the altar with a whispered
direction — "let the performer become a keeper of light" — and the art regeneration kept
the same creature, same pose, and turned its wings into star charts.

![Luminel Aeterna, the evolved beacon-fey](/presentations/keeper-and-the-beacon/shots/25_evolved_card.png)

Halfway through, Windows forced a restart and killed everything mid-run. The game's crash
handling turned the lost expedition into fiction — "the last expedition never came home,
and the story carries the scar" — which the agent then folded into its presentation as a
chapter. Even the disaster became part of the story.

It also did the job I actually assigned: it found five real bugs by walking into them
(the worst one silently ate any message over 500 characters — its best in-character
speech died in that box), fixed all five, wrote a regression test, ran my full CI
gauntlet, and opened [the PR](https://github.com/Bloodtailor/LlmMonsterHunter/pull/183).
Its honest review: the game is fair, the story is the strongest system, and the referee
is too kind — it never once said no to a good speech. That last note is now on my tuning
list.

## Why the presentation is the actual finding

Here's the thing I keep chewing on. The playthrough was good. The *presentation of the
playthrough* changed how I work.

I manage a lot of agent sessions in parallel, and the tax I pay all day is context
switching: every session that finishes hands me its fiftieth markdown report of the day,
and my brain has to cold-boot the entire project to figure out what the wall of text
means. I skim, I miss things, I lose the thread.

This was different in kind. Because the agent built the presentation *while acting* — it
captured every screenshot in the moment, as part of doing the work — the deliverable is
one coherent story in the order it actually happened, with the evidence inline. If I had
asked for a presentation retroactively, none of those assets would exist; you can't
screenshot a moment that's already gone. The narration means I don't even have to read.
I pressed play, watched eleven minutes, and had *full* context on a two-hour session —
what worked, what broke, what it fixed, what it thought — without cold-booting anything.

Pair the action with the presentation, and the long-horizon task stops being a wall of
text and starts being something you can absorb at the end of the day with a coffee. I
think this is just how agent work should be reported now, and I'm going to start asking
for it deliberately: don't tell me what you did, *show me the story of what you did*,
with the receipts you collected while doing it.

The narration is ElevenLabs again (same pipeline as the
[Grind & Grimoire](/ledger/grind-and-grimoire/) voice lines — that API keeps earning its
keep). The player is a few hundred lines of vanilla JS the agent wrote to Ken Burns its
own screenshots in sync with the audio.

The agent also screen-recorded the entire 1h53m session, which turned out to be useful
exactly once — reviewing it settled a bug question its screenshots couldn't (an animation
it thought never played had simply finished between captures) — and then I deleted it.
The presentation is the artifact worth keeping. It ends with a line I didn't write and
can't stop thinking about — its verdict on the game: *"it is the only game I have played
where mercy is a build."*
