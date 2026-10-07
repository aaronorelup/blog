---
id: "AO-024"
title: "A fighting game with my two characters, and where its 42 hours went"
summary: "One Claude Code session and 130 agents built Storm Bell Fighter, Jefrie against BloodTailor, in Godot. The code, menus, AI, sound and web build ran on stand-in capsules within an evening. The two fighters took another full day of modelling, animation and review before they reached the game. You can play it below."
date: 2026-09-28
status: "shipped"
tags: ["claude-code", "godot", "gamedev", "agents", "blender"]
series: ["characters", "agent-runs"]
draft: false
preview:
  verdict: "The characters took the time"
  takeaway: "A full fight ran on stand-ins 69 minutes after the first commit. The fighters took a day more, one job at a time through the one Blender on my laptop."
  points:
    - "Final QA found 75 problems, 3 of them blockers. One drew particle garbage over the fight while all 40 tests passed."
    - "TRELLIS.2 blurred BloodTailor's grin and welded his cloak to his arms, so an agent scripted him in Blender from scratch."
    - "130 agents, all Opus 5.5, made 12,590 model requests: about $1,730 at API list prices, mostly cached context read again."
  image: "/media/previews/storm-bell-fighter.webp"
  loop: "/media/previews/storm-bell-fighter.mp4"
  alt: "Jefrie swinging her scythe at a crouching BloodTailor in the finished game, a cage dome behind them"
---

One Claude Code session built a complete 1v1 fighting game of my two characters, Jefrie and
BloodTailor, in 42 hours. Everything except the characters was working on stand-in capsules by
the end of the first evening. **The two fighters took the next full day, and they were the only
thing still missing when I asked if I could play it.**

It's called Storm Bell Fighter, after the place Jefrie lives. It's Godot 4.7, three rounds, a CPU
at three difficulties, two-player on one keyboard, training mode and a move list. It's playable
here:

<ao-game src="/games/storm-bell/" poster="/media/storm-bell-fighter/poster.webp" size="about 22 MB" label="Storm Bell Fighter, playable in the browser" note="Keyboard: A / D move, W jump, S crouch, J light, K heavy, L special, K+L super. A gamepad works too. Needs a desktop browser with WebGL 2, and the first visit spends a while preparing graphics."><a href="/games/storm-bell/">Play Storm Bell Fighter</a></ao-game>

## What I asked for

I didn't write the build prompt. I asked Claude to write one for an ultracode session, with this
brief: *"The purposes is to test out what can already be done with my character's and current
pipeline to build a game that would be easy for you to make."* I said I'd play it for about 20
minutes and never develop it further, and told it to aim the graphics at something it could
actually polish. It wrote a 2,600-word prompt: Godot for the game, Blender through the Blender
MCP for the 3D fighters, ComfyUI for the 2D art, no Higgsfield, and cloud sessions for anything
that didn't need my machine. Then I told it to follow its own prompt, and to put the finished game
on this site.

## The same fight, four times

The fight simulation is deterministic, so one command replays the same match: CPU Hard against CPU
Hard, seed 7. The session ran it at each stage of the build to record gameplay. The first three
clips below are those recordings. The fourth is the same command, re-rendered this morning for this
post from the finished build. The first 20 seconds of each, playing together:

<ao-compare cols="2" aspect="16/9" sync>
  <figure>
    <video controls muted loop playsinline preload="metadata" poster="/media/storm-bell-fighter/seed7-a-placeholders.jpg" src="/media/storm-bell-fighter/seed7-a-placeholders.mp4"></video>
    <figcaption><b>Capsule stand-ins, placeholder stage</b><span class="ao-meta">26 Sep 18:11 · 3 h after the first commit · recorded by the CPU-AI agent</span></figcaption>
  </figure>
  <figure>
    <video controls muted loop playsinline preload="metadata" poster="/media/storm-bell-fighter/seed7-b-stage.jpg" src="/media/storm-bell-fighter/seed7-b-stage.mp4"></video>
    <figcaption><b>Capsules on the finished Storm Bell stage</b><span class="ao-meta">26 Sep 22:38 · stage layers Qwen-Image 2.1 · recorded by the stage agent</span></figcaption>
  </figure>
  <figure>
    <video controls muted loop playsinline preload="metadata" poster="/media/storm-bell-fighter/seed7-c-models.jpg" src="/media/storm-bell-fighter/seed7-c-models.mp4"></video>
    <figcaption><b>Both Blender fighters in the game</b><span class="ao-meta">28 Sep 00:22 · recorded by the integration agent</span></figcaption>
  </figure>
  <figure>
    <video controls muted loop playsinline preload="metadata" poster="/media/storm-bell-fighter/seed7-d-v1.jpg" src="/media/storm-bell-fighter/seed7-d-v1.mp4"></video>
    <figcaption><b>The finished build, v1.0</b><span class="ao-meta">28 Sep 09:08 · commit 8468c10 · re-rendered for this post with the same command</span></figcaption>
  </figure>
</ao-compare>

In the first two, six seconds in, the counter reads the same 2 hits for 138 damage. Only the art
changed. By the third, moves had been retuned in between, the same exchange does 165, and the fight starts
to drift.

## Where the time went

<ao-timeline lanes="me:Me|lead:Lead session|code:Code agents|art:Art agents|qa:QA agents">
<ol>
<li data-lane="me"><time>26 Sep 14:50</time><p>Asks for the prompt: <q>do whatever you can in cloud sessions and for what you cannot, do here.</q></p></li>
<li data-lane="lead"><time>26 Sep 15:13</time><p>First commit: a design doc and an art-to-code contract, the bone and animation names both sides would build against.</p></li>
<li data-lane="lead"><time>26 Sep 15:18</time><p>Five "cloud" agents running: core, effects, menus, audio, web export.</p></li>
<li data-lane="code"><time>26 Sep 16:22</time><p>A full fight playable on capsule stand-ins, 69 minutes after the first commit.</p></li>
<li data-lane="lead"><time>26 Sep 16:51</time><p>Notices the "cloud" agents had all run on my laptop. Cloud isolation wasn't available on the account.</p></li>
<li data-lane="me"><time>26 Sep 18:07</time><p><q>game is running slow btw.</q></p></li>
<li data-lane="code"><time>26 Sep 20:07</time><p>Menus batched from 674 draw calls to 36; graphics tiers and a shader warm-up added.</p></li>
<li data-lane="art"><time>26 Sep 21:50</time><p>BloodTailor's third-round model in Blender. Jefrie's animations start 25 minutes later.</p></li>
<li data-lane="code"><time>26 Sep 22:42</time><p>The real stage replaces the placeholder. Last code commit of the day.</p></li>
<li data-lane="me"><time>27 Sep 16:39</time><p><q>is it ready for me to play yet?</q> The answer: playable, <q>but the fighters are still stand-ins.</q></p></li>
<li data-lane="art"><time>27 Sep 21:52</time><p>BloodTailor's finished model goes into the game. Jefrie's follows at 23:43.</p></li>
<li data-lane="art"><time>28 Sep 02:44</time><p>Jefrie's readability pass: her grin, armour and trousers redone so she reads at fight zoom.</p></li>
<li data-lane="qa"><time>28 Sep 05:51</time><p>Final QA: 75 findings, 53 confirmed, fixes committed through 07:45.</p></li>
<li data-lane="lead"><time>28 Sep 09:06</time><p>Last fix pushed. <q>The game is finished.</q></p></li>
</ol>
</ao-timeline>

The code agents were done with nearly everything in one evening. Their notes also account for why
the fighters weren't. Each one went through modelling, three critics, fixes, 39 animations, an
export and then animation critics with their own fix rounds, and all of that ran through the one
Blender instance on my laptop, one job at a time. Jefrie's first animation review found her tail
jumping about 2.3 metres on takeoff and her cape rendering black in the game.

## The two fighters

BloodTailor had no 3D model before this. The art agent tried TRELLIS.2 on the front of his
reference sheet first. It got the cloak's volume and his proportions, blurred the grin into the
texture, made his hair one solid mass and welded the cloak to his arms. The agent kept it only as
a proportion reference and built him from scratch in Blender with Python.

<ao-compare cols="1" aspect="auto">
  <figure class="wide">
    <img src="/media/storm-bell-fighter/bt-trellis-vs-scripted.webp" alt="BloodTailor: the reference crop, the TRELLIS.2 mesh from front, side and head, a 20k-triangle clay decimation, and the hand-scripted Blender build" loading="lazy">
    <figcaption><b>TRELLIS.2 against the scripted build</b><span class="ao-meta">26 Sep 16:50 · TRELLIS.2 (ComfyUI workflow 33): 345 s on the GPU, 681k triangles, no rig · scripted build 16.5k triangles · reference sheet Seedream 5.0 on Higgsfield, 25 Sep</span></figcaption>
  </figure>
  <figure class="wide">
    <img src="/media/storm-bell-fighter/bt-turntable.webp" alt="BloodTailor's finished toon-shaded model from front, three-quarter, side and back, next to his reference sheet" loading="lazy">
    <figcaption><b>BloodTailor, third round, next to his reference</b><span class="ao-meta">26 Sep 21:50 · Blender 5.2 through the Blender MCP · toon shading, red rim light</span></figcaption>
  </figure>
  <figure class="wide">
    <img src="/media/storm-bell-fighter/jefrie-turntable.webp" alt="Jefrie's model in rest pose from four sides with her scythe, next to her reference sheet" loading="lazy">
    <figcaption><b>Jefrie, third round, next to her reference</b><span class="ao-meta">26 Sep 21:18 · rebuilt for the game, starting from the models in <a href="/ledger/jefrie-in-3d/">AO-018</a> · 20,774 triangles, 83 deform bones</span></figcaption>
  </figure>
  <figure class="wide">
    <img src="/media/storm-bell-fighter/jefrie-readability.webp" alt="Jefrie in the fight at 1080p before and after the readability pass, as player 1 and player 2, with body close-ups" loading="lazy">
    <figcaption><b>Jefrie in the fight, before and after the readability pass</b><span class="ao-meta">28 Sep 02:30 · the model in <a href="/ledger/jefrie-in-3d/">AO-018</a> took six days of attempts; this one had a finished game waiting for it</span></figcaption>
  </figure>
</ao-compare>

Two things it left for me: Jefrie's grin (pointed teeth, the hooked mouth line) and how light
BloodTailor's iron plate should be. Both are canon questions, and it treated them as mine.

## The QA pass

Once the session thought the game was done, it ran one more workflow: five critics looking for
problems independently, a skeptic checking each finding, one agent fixing the confirmed ones and a
final regression check. They found 75 problems, 3 of them blockers. Skeptics confirmed all 53 they
checked, and the other 22 were polish that went straight to the fixer. One blocker was particle
effects drawing yellow, white and green garbage over the fight before they had emitted anything.
The automated tests, 40 of them with 317 checks, were all passing with that bug in the build.

<ao-compare cols="1" aspect="auto">
  <figure class="wide">
    <img src="/media/storm-bell-fighter/qa-offpalette.webp" alt="Four frames before the fix with yellow, white and green particle garbage over the fight, and the same four frames after" loading="lazy">
    <figcaption><b>The off-palette particle blocker, before and after</b><span class="ao-meta">28 Sep 07:30 · same match, same ticks · 0 of 39 frames flagged by the palette scan after the fix</span></figcaption>
  </figure>
  <figure class="wide">
    <img src="/media/storm-bell-fighter/qa-ko-wash.webp" alt="Six frames after a K.O. where a white burst covers the whole screen, and the same six frames after the fix where the fighters stay visible" loading="lazy">
    <figcaption><b>A K.O. that whited out the screen, before and after</b><span class="ao-meta">28 Sep 07:32 · frames +0 to +90 after the K.O.</span></figcaption>
  </figure>
</ao-compare>

At the end: 41 tests and 331 checks passing, and Jefrie winning 51.0% of 400 CPU-Hard matches
against BloodTailor. The web build is about 22 MB with every file under Cloudflare's 25 MB limit,
helped by a smaller Godot web template the session compiled from source.

## What it cost

The session made 12,590 model requests across its 130 agents, all Opus 5.5, about $1,730 at API
list prices by the time it called the game finished. Most of the 4.5 billion tokens were cached context being read again. The three
workflows split it roughly as $916 for the 54 agents of the main build, $125 for 5 integration
agents and $288 for the 60 in the QA pass.

I asked for a game I could learn in one sitting and put down. The agents built the game part of
that in an evening. **The part that was mine, the two characters, is still what takes the time**,
even with a finished game waiting for them.
