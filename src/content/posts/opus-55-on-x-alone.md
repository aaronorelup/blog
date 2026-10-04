---
id: "AO-032"
title: "I told Claude to find the best Opus 5.5 trick on X and do it without me"
summary: "One prompt: go on X, find the most incredible thing people are doing with Opus 5.5 that I haven't tried, do it alone, and blog it. 4 hours 21 minutes and 22 agents later it had picked, built and published. How it chose, what it would have done instead, and the two rules it didn't keep."
date: 2026-10-03
status: "shipped"
tags: ["claude-code", "agents", "autonomy", "research"]
series: ["agent-runs"]
---

On 3 October I sent Claude one prompt and left it alone:

> Go on x and see what people are doing with opus 5.5. Find the most incredible one that I
> haven't tried yet and that you can do on your own [...] and try it out using what you know
> about me and what I'm doing. Once you're finished create a blog post about it on my website so
> that they can see everything you did and judge the results themselves.

The rules: Opus 5.5 agents only, no more than five at a time, a clock check every 30 minutes,
nothing stuck on one step for more than an hour and a half, and four to six hours in total. It
could install whatever it wanted as long as it removed it afterwards. The goal was to find out
what's possible, what it takes and what results to expect, before I need any of it for a real
project.

It picked Rehan Sheikh's Universal Modder: Opus 5.5 reverse-engineering a game you own. It
pointed that at Inscryption, a game I own, and dealt my six characters onto Leshy's table as
playable cards. The mod is in [its own post](/ledger/characters-in-inscryption/). This one is
about the run that produced it: how it chose, and what "on your own" turned out to mean.

<a href="/ledger/characters-in-inscryption/"><img src="/media/characters-in-inscryption/hero-cabin.webp" alt="Leshy's cabin in Inscryption with Aaron's character cards in hand and Leshy's line about Echo at the top" loading="lazy" style="width:100%;border-radius:8px"></a>

**From prompt to published post took 4 hours 21 minutes, and I wasn't asked a single question.
It made eight calls I'd normally be asked about, and the one that saved the run came from
reading a game engine's DLL for strings. It also broke two of my rules, both for the same
reason.**

## How it chose

**X first.** The in-app browser hit X's login wall, and Claude won't type a password, so it
used my Chrome, where I'm already signed in. Its first scraping script froze. X was a
background tab, and Chrome throttles timers in background tabs, so the call hit a 45-second
limit and died. It switched to small steps (navigate, read the page, scroll) and pulled about
60 of the most-liked posts that mention Opus 5.5, both of Min Choi's roundup threads, and the
full 9,861-character prompt behind the most viral one, donald's 12-hour one-prompt music
video.

**Then the rest of the web.** Four agents searched in parallel: press and newsletters, Reddit
and Hacker News, creative and media work, and long autonomous runs. In 12 minutes they came
back with 57 candidates, each with how it was made and whether it could be repeated alone on
my laptop.

**Then me.** A sixth agent read my blog, my skills folder, my Notion and my Claude Code history,
and listed everything I've already tried: agent-built games, code-drawn films, H3 films,
Blender previs, Jefrie in 3D, ElevenLabs songs, 16 wallpapers. That list is what "haven't tried
yet" was checked against. It took 54 minutes, mostly because one search across my whole
history hit its 30-minute timeout.

**Then a vote.** Eight finalists went to five judges, and each judge scored all eight on one
thing only: wow, novelty for me, whether it could be finished alone in about three hours, what
I'd learn that carries over, and whether it would delight me and you. Four of the five picked
the same one.

| Finalist | Wow | Novelty | Feasible alone | Learning | Delight | Total /50 |
|---|---|---|---|---|---|---|
| **A. Mod a game I own** | 9 | 10 | 6 | 9 | 9 | **43** |
| B. Oil paintings in a paint simulator | 8 | 8 | 5 | 5 | 8 | 34 |
| E. A song where code synthesizes every sound, voice included | 8 | 5 | 7 | 6 | 5 | 31 |
| H. Interactive explainer (the Lens Lab) | 5 | 3 | 9 | 7 | 5 | 29 |
| D. A buildable LEGO model with instructions | 7 | 8 | 3 | 4 | 6 | 28 |
| G. Rotoscoping a generated video in code | 6 | 4 | 4 | 6 | 7 | 27 |
| C. Zero-direction demoscene intro | 6 | 2 | 8 | 4 | 4 | 24 |
| F. Arcane-style painted shot in Blender | 6 | 4 | 3 | 5 | 6 | 24 |

The feasibility judge voted for H, the explainer, and it was right that the mod was the riskier
pick.

The winner was Rehan Sheikh's [Universal Modder](https://x.com/rehan_shei/status/2105161487509852622),
which has 14,000 likes and 3.6 million views. He pointed Opus 5.5 at Terraria before bed and
[woke up](https://x.com/rehan_shei/status/2104662849624981571) to a reverse-engineered game.
Claude then checked my Steam folder for a game it could do the same to. Elden Ring, Palworld and
Path of Exile 2 have online play and anti-cheat, so they were ruled out. Inscryption is
single-player and a Unity game compiled to .NET, the easiest kind to read.

## What I'd have done instead

Second place was **[Claude Paint](https://x.com/aliceisplaying/status/2104672235093119196)**, by
alice. It's a physics simulator for oil paint, written in Rust. Simulated bristles carry wet
paint over linen, the paint dries on a clock, colours mix like real pigment, and there's no
undo. Opus 5.5 paints by writing Lua against a live easel, then steps back, looks at the canvas
and paints the next passage. Its [Show HN](https://news.ycombinator.com/item?id=49928566) had 367
points the day before. The plan was to have it paint my characters from their canon pages alone,
BloodTailor as a figure seen from behind in the style of Caspar David Friedrich, and ship the
replays as time-lapses. It lost on two counts. The repo assumes macOS (launchd and bash
scripts), so Windows was a gamble. And on X it had a few hundred likes against fourteen
thousand.

The rest of the shortlist, every link opened and checked on X the same day:

| | What it is | Post |
|---|---|---|
| E | "No Samples": a rap single where JavaScript synthesizes every sound, the rapping voice included | [@aj_dev_smith](https://x.com/aj_dev_smith/status/2102803889183736141) · 2.0k likes |
| H | An interactive camera-lens lab, made in one shot in 1 h 26 min for $25.66 | [@RyanSael](https://x.com/RyanSael/status/2102591147927654847) · 16.2k likes · 3.5M views |
| D | A life-size LEGO Microduck from 1,113 real parts, with a 141-page instruction book | [@victormustar](https://x.com/victormustar/status/2103110908444631120) · 8.7k likes · 1.3M views |
| G | Rotoscoping in code: a video generated first, then redrawn frame by frame in JavaScript so the base is never seen | [@donaldjewkes](https://x.com/donaldjewkes/status/2102801274173587569) · 10.7k likes · 3.8M views; [@gandamu_ml](https://x.com/gandamu_ml/status/2104402167906124280) |
| C | "Make the most impressive demo of yourself": a demoscene intro with every pixel and sound in one 280 KB HTML file | [@JustinPerea](https://x.com/JustinPerea/status/2102893186330841502) · 1.6k likes |
| F | "SPARK": an Arcane-style shot in Blender with every texture painted stroke by stroke in code | [@xikhar](https://x.com/xikhar/status/2105315982525014067) · [the prompt](https://x.com/xikhar/status/2105317581695623329) |

Two more were weighed and ruled out because I've already done something close:
[the P(doom) music video](https://x.com/other__reality/status/2102514581684052169) (2.8M views)
and Alex Albert's [one-prompt Blender claymation](https://x.com/alexalbert__/status/2102458348511879448).

## What it decided without me

These are the decisions I'd normally be asked about, in order:

- **Which browser.** It moved from the built-in browser to my signed-in Chrome rather than stop
  at the login wall.
- **Which game.** It ruled out anything with online play or anti-cheat, and anything compiled
  to native code (one of my games, WLKRR, is IL2CPP).
- **How to keep my real game safe.** It modded only a copy, hashed my real save before and after,
  and exported the game's registry settings before the first launch. That export turned out to
  matter: the copy and the real install share those settings.
- **What my characters' cards do.** Every mechanic comes from a quote on that character's Notion
  page, and it labelled the mechanics as interpretations, not canon.
- **When to give up on my GPU.** I share one RTX 4070 between sessions through a queue. Other
  sessions had about 2.5 hours of ComfyUI work booked. Three agents waited on it, and when the
  waits passed their time limits they cancelled their tickets instead of holding the line.
- **How to get around it.** The lead searched the game engine's DLL for command-line flags. The
  first one it tried, rendering on the CPU, crashed five times out of five. The second put the
  game on the laptop's Intel graphics chip, so it never touched the GPU the other sessions were
  queued for.
- **Where to publish from.** My local copy of this blog was 29 commits behind, with another
  session's unfinished work in it. It published from a clean copy of the live branch instead,
  and left mine alone.
- **What to delete.** The game copy, the mod loader, the decompiled code and every tool it
  installed. It also restored the game's registry settings and checked my real save files
  against their hashes.

Not one of those needed me. The one thing it couldn't judge on its own was whether the cards
looked right. For that it had the mod take screenshots of the real game and looked at them
itself, and that's how it found the worst bug of the day: five of the six portraits rendered as
black silhouettes. That story is in [the mod post](/ledger/characters-in-inscryption/).

## The two rules it didn't keep

**The 30-minute clock.** It read the clock at 15:50, 15:53, 16:36, 17:05, 17:35, 18:43,
19:30 and then every few minutes to the end. Three gaps ran past 30 minutes: 43, 68 and 47
minutes. The lead session only runs when something wakes it, and in each of those gaps it was
waiting on a background agent that took longer than planned. The 30-minute rule needs a timer, not a promise.

**The 90-minute rule.** Getting the in-game film took 2 hours 8 minutes across three approaches:
waiting on the GPU, the CPU renderer, then the Intel chip. Each attempt stayed inside its own
time limit, but the problem as a whole didn't.

## How the time went

Times are Central, from the session transcript and the build log.

<ao-timeline lanes="lead:Lead session|research:Research agents|build:Build agents|game:In the game">
<ol>
<li data-lane="lead"><time>15:41</time><p>My prompt.</p></li>
<li data-lane="research"><time>15:43</time><p>The profile agent starts on my blog, skills, Notion and history. 54 minutes.</p></li>
<li data-lane="lead"><time>15:45</time><p>X's login wall, then my Chrome. The first scraper freezes in a background tab.</p></li>
<li data-lane="research"><time>15:47</time><p>Four web-sweep agents. 12 minutes, 57 candidates.</p></li>
<li data-lane="research"><time>16:38</time><p>Five judges, 2 minutes. Modding a game I own: 43 of 50.</p></li>
<li data-lane="build"><time>16:42</time><p>Lab copy of Inscryption, mod loader, and the game's code decompiled. 6 minutes.</p></li>
<li data-lane="build"><time>17:06</time><p>The cards plugin, the self-playing test harness and the art fixes, in parallel.</p></li>
<li data-lane="game"><time>17:32</time><p>The first full battle: every check passes, and five portraits are black silhouettes.</p></li>
<li data-lane="build"><time>17:34</time><p>Fixes get built. The GPU queue is full, so none of them can run.</p></li>
<li data-lane="lead"><time>18:46</time><p>A search of the engine DLL finds two flags: one renders on the CPU, the other picks the GPU.</p></li>
<li data-lane="game"><time>19:00</time><p>Five CPU-rendered launches, five out-of-memory crashes.</p></li>
<li data-lane="game"><time>19:36</time><p>On the Intel chip: the 101-second film, with the game's own audio.</p></li>
<li data-lane="lead"><time>19:50</time><p>Cleanup, then the post. Live at 20:02.</p></li>
</ol>
</ao-timeline>

## What it cost

| Stage | Agents | Output tokens | Tool calls | Agent minutes |
|---|---|---|---|---|
| Research: profile, 4 web sweeps, 5 judges | 10 | 176,071 | 439 | 104 |
| Building the mod (lab, recon, cards, harness, art) | 7 | 515,761 | 585 | 112 |
| The GPU-blocked hour (ink portraits, film rig, media) | 3 | 207,438 | 204 | 105 |
| The CPU-rendering attempt | 1 | 56,817 | 72 | 44 |
| Lead session | 1 | 156,563 | 187 | 248 |
| **Total** | **22** | **1,112,650** | **1,487** | **613** |

Every agent was Opus 5.5 at xhigh effort, and no more than five ran at once. Agent minutes add
up to more than the clock because agents ran in parallel. The run also read 214 million tokens
of cached context, 192 times its output. These figures are measured from the session
transcripts, not estimated, and I'm on a flat subscription, so there's no bill to show.
Research and choosing took 16% of the output, and building the mod took most of the rest.

The hand-offs held. Each stage wrote its decision to a file the next one read: the finalists,
the scores, a spec for the build, the engine notes, the card designs. Nothing drifted between
what was chosen and what got built. What went wrong was the two rules above, both about time,
and both broken while the lead was waiting on an agent. Everything that needed a decision got
one. What needed a clock didn't have one.
