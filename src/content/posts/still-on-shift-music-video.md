---
id: "AO-021"
title: "A music video for my game, made by Claude inside the game"
summary: "Claude made a music video for my cave-diving game's song from the game's own models, caves and sounds, with no AI video. How it worked, what broke, and the prompt I'd use to ask for one."
date: 2026-09-26
topic: "video"
project: ["blackwater"]
preview:
  verdict: "Worked from one request"
  takeaway: "A script Claude wrote to run inside my game made a 2:45 music video with no footage or AI video. It worked because the game already had test tools a script could drive."
  points:
    - "Free-flying shots came out flat gray because free-fly mode turns off the fog. Dropping it showed nine cameras in rock."
    - "Gunshots, hits and moans are the game's own sounds, each on its frame. Nobody listened to the mix before it shipped."
    - "About 49 minutes on my laptop's graphics card. Most of the five hours went to waiting for a turn on it."
  image: "/media/previews/still-on-shift-music-video.webp"
  loop: "/media/previews/still-on-shift-music-video.mp4"
  alt: "The game's red Heart glowing in its apse, the lyric \"Something still beats at the bottom\" beneath it"
---

This is a music video for [BLACKWATER](/ledger/blackwater-weekend/), my cave-diving zombie game,
cut to its jukebox song "Still on Shift". Claude made it from one request, with no gameplay
footage and no AI video. It wrote a script that runs inside the game and filmed every shot with
the game's own models, caves and lights. That only worked because the game already had testing
tools a script could drive.

[Watch it full screen](/media/still-on-shift/). Sound on.

<iframe src="/media/still-on-shift/?embed" title="BLACKWATER, Still on Shift" style="width:100%;aspect-ratio:16/9;border:0" allow="fullscreen" loading="lazy"></iframe>

- **The lyrics became the shot list.** They already tell the game's story.
- **Free-fly mode broke the look.** It turned off the fog, and dropping it showed nine cameras
  inside rock.
- **The gunshots, hits and moans are the game's own sounds**, each on its frame. Nobody listened
  to the mix before it shipped.
- **About 49 minutes on my laptop's graphics card.** Most of the five hours went to waiting for a
  turn, because my other agents share it.

<ao-compare cols="3" aspect="16/9">
  <figure>
    <img src="/media/still-on-shift/still-03_t33.0.webp" alt="Six drowned crewmen standing in a line in the dark Cathedral" loading="lazy">
    <figcaption><b>The crew, still on shift</b><span class="ao-meta">Shot 9 · six of the game's crew models, posed and lit from behind</span></figcaption>
  </figure>
  <figure>
    <img src="/media/still-on-shift/still-15_t107.5.webp" alt="The red Heart glowing in its apse" loading="lazy">
    <figcaption><b>The Heart</b><span class="ao-meta">Shot 25 · the Heart where it really sits in the game, 171 m down</span></figcaption>
  </figure>
  <figure>
    <img src="/media/still-on-shift/still-18_t125.0.webp" alt="A red-lit tunnel with Drowned chasing up it" loading="lazy">
    <figcaption><b>The chase</b><span class="ao-meta">Shot 30 · the diver's lamp and the Heart's red light, the crew coming up behind</span></figcaption>
  </figure>
</ao-compare>

## What I asked for

My request, more or less: a pre-rendered cinematic trailer for the game, cut to "Still on
Shift". No raw gameplay footage. Use the real game assets, make a rough draft and animate it
yourself. Gunfire, zombies and water in the sound. Any tool except Higgsfield, an AI video service.

## How Claude made it

**The song gave it the story.** It's about a crew that went down in the '60s and is still on
shift. Then "a stranger swims the morning down, a spool of white unwinds", and later "carry out
the warm one". That's the diver, his guide line and the Heart at the bottom of the cave. Claude
cut the song from 4 minutes to 2:45 with the splice where two choruses match, so you can't hear it.

**A director script inside the game.** This is my rebuild of BLACKWATER in Godot, a free game
engine. Claude's script runs inside it through the tool the game uses for automated tests. Each shot is a few lines: where the camera is on every frame, where the zombies
swim, the lights, when a gun fires. The diver has no body in this first-person game, so he's only
ever a lamp beam, bubbles and the guide line.

**A rough draft first.** The same script rendered every shot in a plain clay look, cut to the
music. That draft, called previs, is where the camera moves and timing got fixed.

<iframe src="/media/still-on-shift/?v=previs&embed" title="Previs animatic" style="width:100%;aspect-ratio:16/9;border:0" allow="fullscreen" loading="lazy"></iframe>

**Sound and finish.** The game's own sounds went on the frames the script logged, with three
water sounds made from scratch because the game has no splash sound. A free video tool called
ffmpeg added the color grade, film grain, black bars and titles.

<details><summary>The numbers</summary>

- **35 shots, 4,943 frames** at 1080p and 30 frames a second, 2:44.8 long. The game runs at a
  fixed frame rate, so the timing is exact.
- **About 20 to 40 seconds per shot** to render. A full final pass of all 35 took 11 to 15 minutes.
- **One previs pass, two full final passes, then 18 shot re-renders** in four rounds of fixes.
  Each round was decided by contact sheets, one picture with frames from every shot.
- **About 49 minutes of GPU time** in total, on my laptop's RTX 4070, which my agents share
  through a queue. Most of the five hours was waiting for a turn.
- **84 sound cues** logged by the script: 25 gunshots, 25 hits, and the moans, zombies rising,
  heartbeats, the shift bell and the undertow surge.
- **The sounds:** the game's guns (speargun, flechette, arc projector, pneumatic driver, vortex
  maw), the moans, the heartbeat, the shift bell, the undertow surge, and the game's background
  sound under each shot. The song dips a little under the loud hits. The mix is set to -14
  LUFS, the loudness streaming sites play at.
- **The water sounds** are filtered noise plus rising bubble chirps.
- **The song edit** drops the second verse and chorus. The two choruses match 61.72 seconds
  apart, so the splice lands on the same beat. It keeps the intro, verse one, the first chorus,
  the bridge, the last chorus and the outro.
- **The lyrics** were transcribed with faster-whisper, a free speech-to-text model.
- **The previs** used Godot's lighting-only view at 960 by 540.
- **The finish** is teal shadows and warm highlights, a vignette, film grain and a 2.39:1
  letterbox.
- **Built from:** the cave (96 rooms), six named drowned crew models, the Lamp Man, the Angler,
  the Silt Shade, the Guardian, six guns, the Heart, the guide line, and the game's effects for
  bubbles, muzzle flashes, body hits and zombies rising.

</details>

## What went wrong

**The first final render looked nothing like the game.** The script used noclip, a cheat mode
that lets the camera fly through walls. In this game it also turns off the fog, so every
free-flying shot came out flat gray. Claude dropped it and moved the player to the camera's spot
every frame instead.

**That showed nine cameras were inside rock.** If you end up inside a wall, the game puts you
back where you last swam freely, and that moved nine shots. In the free-flying version those
cameras had been filming the rock from the inside. Now each camera slides toward what it's
looking at until it's in open water.

**The gun was invisible** in the first-person shots. Noclip hides it too.

**Nobody listened to the mix**, same as with
[my film of Clawd, the Claude Code mascot](/ledger/clawd-growth-montage/), from the same day. Claude
can't hear, so it checked loudness and peaks and put every sound on its frame.

<details><summary>Smaller problems</summary>

- The clay previs draws the game's see-through light-shaft cards as solid gray slabs.
- The disk filled up mid-render and wrote empty frames, so now each shot is turned into video as
  soon as it renders.
- The GPU queue my agents share couldn't launch a `.sh` file on Windows, so one pass sat in line
  for 45 minutes and then did nothing.

</details>

## How to ask for one

This is what I'd type now, with the fixes built in.

<details><summary>The prompt I'd type now</summary>

> Make a {length} trailer for {game} cut to {song}. Pre-rendered in the game engine from the
> game's own assets, no gameplay capture and no AI video. Transcribe the lyrics and build the
> shot list from them, with every cut on a bar line. Write a director script that runs inside
> the game at a fixed frame rate and saves frames: camera path, creature motion, lights and
> effects per shot, and a sound cue logged on the frame of every gunshot and hit. Render a clay
> previs animatic first and show me contact sheets. Don't use noclip or any debug camera that
> changes how the game looks. Mix only the game's own sounds under the song and master to -14
> LUFS. Grade, letterbox, title cards. Check every shot against contact sheets before and after
> each final pass.

</details>

To get better than this, give it a diver model for the shots where you'd see him, and let it
use depth of field and motion blur. Godot has both and this one didn't use them. And listen to
the mix yourself before it goes out.

Claude has since made two more videos for this song in other ways. I'm not happy with any of the
three yet, and [that post](/ledger/still-on-shift-concept/) says why.
