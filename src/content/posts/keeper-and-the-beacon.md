---
id: "AO-004"
title: "Claude playtested my game and made a narrated recap"
summary: "I had Claude play my AI monster-catching game start to finish, fix the bugs it hit, and narrate a presentation from screenshots it took while playing. Why that beat a written report for me."
date: 2026-08-05
status: "shipped"
tags: ["claude-code", "llm-monster-hunter", "agents", "elevenlabs", "playtesting", "presentations"]
series: ["llm-monster-hunter"]
topic: "agents"
project: ["llm-monster-hunter"]
preview:
  verdict: "Full context in 11 minutes"
  takeaway: "Having the agent take screenshots while it played and narrate them at the end gave me full context on a two-hour session in eleven minutes."
  points:
    - "It found five real bugs by playing and fixed all five. The worst silently ate any message over 500 characters."
    - "The screenshots had to be taken during the work. Asked for afterwards, none of them would exist."
    - "Its review: the story is the strongest system, and the AI referee is too kind. It never once said no to a good speech."
  image: "/media/previews/keeper-and-the-beacon.webp"
  alt: "Luminel Aeterna, the agent's moth-fey companion after evolving, its wings turned into star charts"
---

I had Claude play my AI monster-catching game,
[LLM Monster Hunter](/ledger/monster-hunter-was-my-degree/), start to finish like a real player,
fix whatever bugs it walked into, and then make me a narrated presentation of its playthrough.
**It found and fixed five real bugs.** The presentation mattered more to me. Claude took the
screenshots as it played, so **eleven minutes of watching gave me full context on a two-hour
session** without reading a report.

In my game the code keeps the numbers, and a language model, the kind of AI behind ChatGPT and
Claude, writes the story and plays referee. You type what you try and it decides what happens.
Last month I built tests that play the game with nobody at the keyboard. This time I wanted a real
playthrough, so I told Claude to wipe my save, turn on the AI-painted pictures, and play.

**[Watch the presentation it made.](/presentations/keeper-and-the-beacon/)** It's twelve narrated
sections, about eleven minutes, and every picture in it is a real screenshot Claude took while
playing. Neither of us staged any of it.

- **Ask for the screenshots before the work starts.** If I'd asked for a presentation afterwards,
  none of these pictures would exist.
- **It found five real bugs just by playing.** The worst one silently threw away any message over
  500 characters, including its best in-character speech. It fixed all five.
- **Its review: the game is fair, the story is the strongest part, and the referee is too kind.**
  It never once said no to a good speech, so that's on my tuning list now.
- **A forced Windows restart ended up in the story.** The game turned the lost run into fiction,
  and Claude kept it as a chapter.

## Why the recap mattered more than the bugs

I run a lot of agent sessions at once. Every one that finishes hands me another long written
report, and I have to load the whole project back into my head to work out what it means. So I
skim and I miss things.

This one I just watched. It's one story in the order it happened, with the proof on screen and a
voice reading it to me. After eleven minutes I knew what worked, what broke, what it fixed and what
it thought. I think that's how agent work should be handed back now, and I'm going to start asking
for it on purpose.

## What it played

It made a character I'd never have made. Maren Holt is a lighthouse keeper who hasn't blinked in
twenty years. Her wish is to bring back the ship the sea took, crew and all, and finally let her
lamp go dark. The game painted her from Claude's answers in its character creator.

![Maren's painted portrait, generated from the wizard's appearance brief](/presentations/keeper-and-the-beacon/shots/10_portrait_full.png)

It played her in character for two full expeditions, the game's dungeon runs. It
recruited a vain moth fairy called Luminel by promising to remember it. It won a fight without a
killing blow by talking a worn-out monster to sleep. Then it evolved Luminel at the game's altar
with one whispered line, "let the performer become a keeper of light." The game redrew the same
creature in the same pose, with star charts for wings.

![Luminel Aeterna, the evolved beacon-fey](/presentations/keeper-and-the-beacon/shots/25_evolved_card.png)

Halfway through, Windows forced a restart and killed the run. The game's crash handling turned it
into story: "the last expedition never came home, and the story carries the scar."

![The game after the forced restart, saying the last expedition never came home, with a button to wake at the home base](/presentations/keeper-and-the-beacon/shots/29_scar.png)

The last line of the presentation is its verdict on the game, and I keep thinking about it: "it is
the only game I have played where mercy is a build." A build is the way you set a character up to win.

## The five bugs

It fixed all five bugs it walked into and wrote a regression test, a test that fails if the bug
ever comes back. Then it ran my full set of automatic checks and opened
[a pull request](https://github.com/aaronorelup/LlmMonsterHunter/pull/183), a proposed change I
review before it goes into the game. The 500-character box now shows how much room you have left.

![A conversation with Luminel in the game, with a 63/500 character counter under the reply box](/presentations/keeper-and-the-beacon/shots/41_fix_counter.png)

<details><summary>All five fixes, from the pull request</summary>

- **Long messages died silently.** Anything over 500 characters was refused with no message. Now
  all five text boxes have a visible limit and a counter, and the game shows the real reason when it
  refuses something.
- **The victory token vanished.** After its pickup animation, the token you win from a battle left
  an invisible hole. Now it settles into a keepsake you can see.
- **The narration guessed pronouns.** The prompts now get each party member's description and
  are told never to guess.
- **The referee mixed up its captions.** A weak self-heal got described as "a solid hit", and one
  turn repeated word for word. Now heals and hits get separate captions, and it's told never to
  copy an old turn.
- **The debug tools greeted you first.** The developer panels now start minimized, and the inventory
  tabs lost their "monsters per page" controls.

</details>

<details><summary>How the presentation was made</summary>

- The narration is ElevenLabs, an AI voice service. It's the same setup as the voice lines in
  [Grind & Grimoire](/ledger/grind-and-grimoire/), my one-prompt skateboarding wizard game.
- The player is a few hundred lines of plain JavaScript Claude wrote. It slowly pans and zooms
  across the screenshots in time with the voice.
- Claude also screen-recorded the whole session, 1 hour 53 minutes. That was useful exactly once. It
  settled a bug question the screenshots couldn't, because an animation it thought never played had
  just finished between two screenshots. Then I deleted the recording. The presentation is the thing worth
  keeping.
- If you want to try the game yourself, the
  [plain-English guide](https://github.com/aaronorelup/LlmMonsterHunter/tree/main/LLM-Monster-Hunter-For-Friends)
  walks you through it.

</details>
