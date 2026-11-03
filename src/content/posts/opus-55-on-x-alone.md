---
id: "AO-032"
title: "Letting Claude pick a project from X and do it alone"
summary: "I told Claude to find the most impressive thing people were doing on X with its Opus 5.5 model, then do it without me and blog it. How it chose, what it decided on its own, and which rules it broke."
date: 2026-10-03
topic: "agents"
project: []
preview:
  verdict: "Done alone, two rules broken"
  takeaway: "It went from prompt to published post in 4 h 21 min without asking me a thing. Both rules it broke were about time, since a session waiting on agents can't watch a clock."
  points:
    - "Four of five AI judges picked modding a game I own, 43 of 50. It dealt my six characters into Inscryption as cards."
    - "A launch setting it dug out of the game engine ran the game on my Intel chip, off the GPU other sessions had booked."
    - "Clock checks fell up to 68 minutes apart under a 30-minute rule, and one problem took 2 h 8 min against a 90-minute cap."
  image: "/media/previews/opus-55-on-x-alone.webp"
  alt: "Aaron's characters as cards in hand at Leshy's table in Inscryption, Siloam in front"
---

On 3 October I told Claude to go on X, find the most impressive thing people were doing with
Opus 5.5 (the Claude model I use) that I hadn't tried, then do it alone and blog it.
**4 hours and 21 minutes later it had modded a game I own, put six of my own characters into
[the card game Inscryption](/ledger/characters-in-inscryption/), and published the post without asking me a single question.** It broke two of
my rules, both about keeping time.

I wanted to see what's possible before I need it for real work. The rules were Opus 5.5
agents only (separate Claude workers, each with one job), up to five at a time, a clock check every 30
minutes, at most 90 minutes on one step, and four to six hours in all.

<a href="/ledger/characters-in-inscryption/"><img src="/media/characters-in-inscryption/hero-cabin.webp" alt="Leshy's cabin in Inscryption with Aaron's character cards in hand and Leshy's line about Echo at the top" loading="lazy" style="width:100%;border-radius:8px"></a>

## What it decided without me

22 agents did the work. These eight calls would normally come to me.

1. **Which browser.** My signed-in Chrome, past X's login wall.
2. **Which game.** Nothing with online play or anti-cheat (software that blocks changes), and
   nothing whose code is hard to read back.
3. **How to keep my real game safe.** It modded a copy, checked my saves before and after, and
   backed up the Windows settings both share.
4. **What my cards do.** Each ability comes from a quote in my notes on that character, labeled
   as an interpretation.
5. **When to give up on my graphics card (GPU).** Other sessions had about 2.5 hours of renders queued on it.
   Three agents waited, then gave up their spots when time ran out.
6. **How to get around it.** It searched the game engine's files for launch settings. The first,
   drawing the game on the processor (CPU), crashed all five tries. The second put it on my
   laptop's built-in Intel graphics chip.
7. **Where to publish from.** My copy of this blog was 29 changes behind, so it used a clean one.
8. **What to delete.** Everything it added. Then it put the game's settings back.

The hand-offs held because each stage wrote its decision to a file the next one read. When its
checks couldn't tell if the cards looked right, it had the mod take screenshots and
looked at them itself. That's how it caught five of six portraits drawing as black silhouettes.

## How it picked the project

It pulled about 60 of the most-liked Opus 5.5 posts off X, and four agents found 57 candidates
around the web in 12 minutes. Another listed what I've already tried, like [Jefrie in 3D](/ledger/jefrie-in-3d/) and
[16 wallpapers](/ledger/wallpapers-nobody-saw/). Then five judges scored eight finalists, each judging
one thing.

| Finalist | Wow | New for me | Doable alone | Learning | Delight | Total /50 |
|---|---|---|---|---|---|---|
| **A. Mod a game I own** | 9 | 10 | 6 | 9 | 9 | **43** |
| B. Oil paintings in a paint simulator | 8 | 8 | 5 | 5 | 8 | 34 |
| E. A song where code makes every sound, voice included | 8 | 5 | 7 | 6 | 5 | 31 |
| H. An interactive camera-lens explainer | 5 | 3 | 9 | 7 | 5 | 29 |
| D. A buildable LEGO model with instructions | 7 | 8 | 3 | 4 | 6 | 28 |
| G. Redrawing a generated video in code | 6 | 4 | 4 | 6 | 7 | 27 |
| C. A tiny one-file demo with no direction | 6 | 2 | 8 | 4 | 4 | 24 |
| F. A painted shot in the style of the show Arcane, in Blender | 6 | 4 | 3 | 5 | 6 | 24 |

Four of the five judges picked the mod. The fifth, scoring "doable alone", picked the explainer,
and it was right that the mod was riskier.

<details><summary>How it searched, step by step</summary>

- **X.** The built-in browser hit X's login wall, and Claude won't type a password, so it used my
  Chrome, where I'm already signed in. Its first script for pulling posts froze and hit a 45-second limit, because X was a
  background tab and Chrome slows down timers in background tabs. So it went in small steps (open
  the page, read it, scroll) and pulled about 60 of the most-liked posts about Opus 5.5. It also saved both of Min Choi's
  roundup threads and the full 9,861-character prompt behind the most viral post, donald's
  12-hour, one-prompt music video.
- **The rest of the web.** Four agents searched at once: news and newsletters, Reddit and Hacker
  News, creative and media work, and long solo AI runs. Each candidate came back with how it was
  made and whether it could be repeated alone on my laptop.
- **What I've already tried.** Another agent read my blog, my skills folder (the instructions my
  agents load), my Notion and my Claude Code history. Its list covered agent-built games, films drawn in code, AI video
  films, 3D previews in Blender, Jefrie in 3D, AI songs and 16 wallpapers. It took 54 minutes,
  mostly because one search across my whole history hit its 30-minute timeout.
- **The judges.** Each scored all eight finalists on one thing: wow, how new it is for me, whether
  it could be finished alone in about three hours, what I'd learn that carries over, and whether
  it would delight me and you. The vote took 2 minutes.
- **The game.** Claude went through my Steam games. Elden Ring, Palworld and Path of Exile 2 have
  online play and anti-cheat, so they were out. Inscryption is a Unity game built on .NET, the
  easiest kind to read back. Games compiled straight to machine code, like WLKRR, one of my games,
  are harder.

</details>

## The winner and the runner-up

The winner was Rehan Sheikh's [Universal Modder](https://x.com/rehan_shei/status/2105161487509852622),
with 14,000 likes that day. He pointed Opus 5.5 at Terraria before bed and
[woke up](https://x.com/rehan_shei/status/2104662849624981571) to the game's code read back out so
it could be changed. Inscryption fit because it's single-player and easy to read back.

Second was alice's [Claude Paint](https://x.com/aliceisplaying/status/2104672235093119196), a
simulator of wet oil paint with no undo, where Claude paints by writing small scripts. It lost because
it was built for Macs and had a few hundred likes on X. Two days later I had Claude use it anyway,
for [three oil paintings](/ledger/claude-paints-in-oil/), and a week after that for
[nine Claudes painting the same picture](/ledger/nine-claudes-one-painting/).

<details><summary>The rest of the shortlist, with links</summary>

Every link was opened and checked on X the same day. Likes and views are from 3 October.

| | What it is | Post |
|---|---|---|
| E | "No Samples": a rap single where JavaScript synthesizes every sound, the rapping voice included | [@aj_dev_smith](https://x.com/aj_dev_smith/status/2102803889183736141) · 2.0k likes |
| H | An interactive camera-lens lab, made in one shot in 1 h 26 min for $25.66 | [@RyanSael](https://x.com/RyanSael/status/2102591147927654847) · 16.2k likes · 3.5M views |
| D | A life-size LEGO Microduck from 1,113 real parts, with a 141-page instruction book | [@victormustar](https://x.com/victormustar/status/2103110908444631120) · 8.7k likes · 1.3M views |
| G | Rotoscoping in code: a video generated first, then redrawn frame by frame in JavaScript so the base is never seen | [@donaldjewkes](https://x.com/donaldjewkes/status/2102801274173587569) · 10.7k likes · 3.8M views · [@gandamu_ml](https://x.com/gandamu_ml/status/2104402167906124280) |
| C | "Make the most impressive demo of yourself": a demoscene-style intro, every pixel and sound in one 280 KB HTML file | [@JustinPerea](https://x.com/JustinPerea/status/2102893186330841502) · 1.6k likes |
| F | "SPARK": an Arcane-style shot in Blender with every texture painted stroke by stroke in code | [@xikhar](https://x.com/xikhar/status/2105315982525014067) · [the prompt](https://x.com/xikhar/status/2105317581695623329) |

Two more were weighed and ruled out because I've already done something close:
[the P(doom) music video](https://x.com/other__reality/status/2102514581684052169) (2.8M views)
and Alex Albert's [one-prompt Blender claymation](https://x.com/alexalbert__/status/2102458348511879448).

More on Claude Paint, the runner-up. It's written in Rust. Simulated bristles carry wet paint
over linen, the paint dries on a clock, colors mix like real pigment, and Opus 5.5 paints by
writing Lua scripts against a live easel, then steps back, looks and paints the next part. The
plan was to have it paint my characters from their pages alone, BloodTailor as a figure seen from
behind in the style of Caspar David Friedrich, and ship the replays as time-lapses. Its
[Hacker News launch](https://news.ycombinator.com/item?id=49928566) had 367 points the day before.
Its code assumes a Mac, which made Windows a gamble, and on X it had a few hundred likes against
fourteen thousand.

</details>

## The two rules it broke

**The 30-minute clock check.** Three gaps ran long: 43, 68 and 47 minutes. The lead session is the Claude
handing out the work, and it only runs when something wakes it. Each time, it was waiting on an agent that ran over. So that rule
needs a real timer. A later overnight run of mine had
[the same problem, for hours](/ledger/the-clock-nobody-checked/).

**The 90-minute cap.** Filming a battle in the game took 2 hours 8 minutes over three tries: waiting
on the graphics card, the processor, then the Intel chip. Each try stayed inside its own limit,
but the problem as a whole didn't.

## How the time went

Central time, from the transcripts and the build log.

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

<details><summary>What it cost, stage by stage</summary>

| Stage | Agents | Output tokens | Tool calls | Agent minutes |
|---|---|---|---|---|
| Research: profile, 4 web sweeps, 5 judges | 10 | 176,071 | 439 | 104 |
| Building the mod (lab, recon, cards, harness, art) | 7 | 515,761 | 585 | 112 |
| The GPU-blocked hour (ink portraits, film rig, media) | 3 | 207,438 | 204 | 105 |
| The CPU-rendering attempt | 1 | 56,817 | 72 | 44 |
| Lead session | 1 | 156,563 | 187 | 248 |
| **Total** | **22** | **1,112,650** | **1,487** | **613** |

Every agent was Opus 5.5 at xhigh effort, the second-highest thinking setting, and no more than
five ran at once. Output tokens are the text the agents wrote. A token is a small chunk of text,
the unit AI models read and write in. Agent minutes add up to more than the clock because agents
ran in parallel. The run also read 214 million tokens from its cache (text it had already seen
once), 192 times its output. These figures are measured from the session transcripts, not
estimated. I'm on a flat subscription, so there's no bill to show. Research and choosing took 16% of the output, and building the mod took
most of the rest.

</details>
