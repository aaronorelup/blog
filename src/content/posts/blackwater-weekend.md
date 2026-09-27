---
id: "AO-002"
title: "I built a cave-diving zombies game in a weekend"
summary: "Fable 5 wouldn't do the creative work and couldn't fix its own 3D mistakes — but it built me the tools to fix them myself. Plus what two AI-generated songs taught me about who should write the lyrics."
date: 2026-08-02
status: "shipped"
tags: ["claude-code", "three-js", "gamedev", "elevenlabs", "lessons"]
series: ["blackwater"]
---

I had a pile of Claude Code credits about to reset and no plan for them. So I spent them
on an idea I'd been carrying around for a while: Black Ops zombies, except you're cave
diving.

Both halves of that are personal. I watch cave diving videos constantly — the real ones,
the ones that are genuinely terrifying. And Black Ops was the game of my childhood, though
the newer entries have lost me completely; they feel repetitive in a way the originals
never did, and worse in most of the ways I care about.

I'd also seen YouTubers one-shot entire Three.js games from a single prompt, and always
found it a little incredible. I'd never tried it. It felt like a waste of time to build a
throwaway game. Then I flipped it around: if it's genuinely that easy, it'll be that easy
for me too. And if it's hard, that means there's something in there worth learning.

It was hard. Here's what was in there.

[Play it here](https://play.aaronorelup.com). Keyboard and mouse only. The level editor I
spend half this post talking about ships with it, behind the DEVELOPER TOOLS door on the
title screen — if you're a developer, that's probably the more interesting half.

## Fable 5 does not want to do creative work

I front-loaded the whole thing with planning. Design doc, then a full lore bible, before a
single line of gameplay code. I assumed — based on everything I'd watched this model do —
that it would be excellent at the lore.

It wasn't. Not because it can't write, but because it wouldn't *stay*. Give it a
long-horizon creative task and it does about five minutes of work and calls it finished.
I turned on ultrathink expecting it to write lore, analyze how the lore constrained the
gameplay, then revise the lore against that analysis. Even at full reasoning budget it was
lazy in a way I found genuinely surprising, given how far it'll go unprompted on a hard
code problem.

So I drove every beat by hand. *Analyze this — does it actually serve the gameplay? Is this
actually creepy, given it's supposed to be horror? Is this complete?* Left alone it wanted
the most basic possible story, with every piece of the world explained on screen. Which is
exactly wrong for horror. The whole engine of the genre is unanswered questions, and for a
Black Ops-flavored story specifically, what's shown in one game should be a thin slice of
something much larger sitting underneath it.

It got there. It took constant massaging to get there.

**The pattern:** this model volunteers effort for code and rations it for everything else.
Budget your own attention accordingly.

## It can't see what it built

The cave is a graph — nodes at points in 3D space, each one a sphere scaled and stretched
in some direction, with connections running between them.

The failure mode: a connection between two nodes would clip straight through a third node
sitting between them. Obvious to a human, instantly. Invisible to the model, permanently.

And this wasn't a case of it lacking information. I gave it screenshots. I gave it exact
coordinates of the bad spot. It still couldn't fix it, because the bug isn't in any one
decision — it's in the *interaction* between several correct-looking decisions, spread
across the code and the geometry. Holding all of that at once and reasoning about the
composite result was past what it could do, so it never did.

## The actual lesson: it builds better tools than fixes

Here's the part I'll carry into every project after this one.

I stopped asking it to fix the geometry and asked it to build me a level editor instead.

It did that immediately, and it did it well. I now have a full editing system — I can see
everything it generated, move nodes around, adjust connections, and correct anything wrong
in seconds without describing the problem to anyone. Same for the tuning: every knob in the
game is exposed in-panel, so I can retune while playing instead of round-tripping a number
through a conversation.

Everything got easier the moment those existed.

So the rule now: **on any 3D project, the first ask is tests and developer tools.** Not the
game. Tools to inspect what it built, tools to verify its work, and tools to fix the things
it can't fix itself. It is much stronger at building the instrument that covers its
weakness than it is at covering the weakness.

That inverts how I'd been thinking about AI limitations. The limitation isn't the ceiling.
The limitation is the *spec* for the tool you should ask it to build.

## Audio does more work than graphics

The graphics in this thing are bad. Programmer-art bad.

It doesn't matter nearly as much as I expected, because the audio is good. I pointed it at
the ElevenLabs API and it handled sound design, voice lines, and music — all three, well,
without much supervision.

Voice lines especially. Hearing the character speak makes the world feel alive in a way no
amount of shader work would have bought me at this budget. Even when a line isn't quite
congruent, even when it's not exactly what I'd have written, it still lands. If you're
building something small and rough, put the effort into sound before you put it into
visuals. It's the cheapest believability you can buy.

## The lore paid off somewhere I didn't expect

I half-assed the lore, honestly. I tried to get the model to do all of it and it did an
okay job. If I'd put in more of my own work I think the result would have been outstanding.

But because a lore bible *existed*, everything downstream came out coherent. The model kept
reaching back into it, and the game feels like one thing instead of a pile of features.

The clearest example is the jukebox. There's an easter-egg track called **Moonlight at the
Waterline** — a 1960s slow-dance ballad, period-correct for the setting, sitting in a horror
game about a drowned dive site. It's a love song about waiting at the waterline for a diver
who's running late. There's a line in it — *you're a little late, my love* — that is a
genuinely wonderful moment, and the whole song alludes to the game's themes so gracefully
that it startled me when it surfaced. I'd listen to it outside the game.

Which brings me to the thing I got wrong about my own project.

## Who should write the lyrics

There are two songs in this game I actually love, and I made them in opposite ways. Working
out *why* both worked is the most useful thing I took out of the whole project.

**Moonlight at the Waterline** was a brief, not a script. Fable 5 wrote the era, the
instrumentation, the emotional surface, and one instruction about a faintly eerie line
concerning water keeping what it likes. ElevenLabs wrote every word. Including the one I
love.

**Still on Shift** — the game's anthem, and the other track I'd defend — went the other
way. Fable 5 wrote the complete lyrics into the lore bible, and the generation script
literally scrapes them out of the markdown and passes them to ElevenLabs verbatim.

So "always let the music model write the words" is wrong. I believed it for about an hour.
The real split is about **who owns the constraint.**

Still on Shift had to carry canon. Its verses are load-bearing: the crew count that's off by
one, the two instruments that disagree about the depth of the bore, the doctor who timed the
crew's synchronized pulses in their sleep and caught his own wrist doing it, the toys nobody
remembers ordering. Every one of those is a callback to a specific audio tape hidden
somewhere else in the game. A music model cannot invent that, because it has never read my
lore bible. Only the thing holding the canon can write those lines.

Moonlight had to carry a feeling. Period, warmth, a little ache, one cold note underneath.
No facts required. And a model built for songwriting is simply better at rhythm, phrasing,
and making a line sit right in a bar than a language model is — that's the whole job it was
trained for. Handing it the words got me something more singable than I'd have gotten by
specifying them.

**The rule:** write the lyrics yourself when the song has to be *true* to something. Write a
brief and get out of the way when the song only has to *feel* like something.

And there's a quieter thing underneath this that ties back to the top of the post. Fable 5's
real contribution to Still on Shift wasn't creative writing — it was continuity. Cross-
referencing a world bible and threading a dozen established details through a lyric is much
closer to the work it's actually eager to do. That's not an exception to it being bad at
creative work. It's the same finding from a different angle.

## Where it landed

It's playable. It's fun. It needs an enormous amount of work to be a real experience, and
I'm not pretending otherwise.

But it's a proof of concept I built in a weekend — 58 commits across four days — it brings
an idea I'd been carrying for years into something I can actually load and play, and I
learned more from it than from anything else I've built this month. It's up at
[play.aaronorelup.com](https://play.aaronorelup.com) if you want to go down there.

I'm proud of it. I'll come back and play it every so often, for no reason other than that
I like it.
