---
id: "AO-021"
title: "A music video for my game, rendered inside the game"
summary: "Claude Code made a 2:45 music video for BLACKWATER's song \"Still on Shift\" without an AI video model: it wrote a director script that runs inside the Godot game, staged 35 shots with the game's own caves, crew, guns and sounds, rendered them offline at 1080p and cut them to the song."
date: 2026-09-26
status: "shipped"
tags: ["claude-code", "godot", "gamedev", "trailer", "ffmpeg"]
series: ["blackwater"]
---

This is a music video for [BLACKWATER](/ledger/blackwater-weekend/), the cave-diving zombies
game, cut to its jukebox song "Still on Shift". Every frame was rendered by the game engine
from the game's own models, caves, lights and effects, and every sound effect under the song is
one the game plays. There's no gameplay footage in it and no AI video model. Claude Code staged
it, lit it, animated it and edited it from one request.

[Watch it full screen](/media/still-on-shift/). Sound on.

<iframe src="/media/still-on-shift/?embed" title="BLACKWATER — Still on Shift" style="width:100%;aspect-ratio:16/9;border:0" allow="fullscreen" loading="lazy"></iframe>

<ao-compare cols="3" aspect="16/9">
  <figure>
    <img src="/media/still-on-shift/still-03_t33.0.webp" alt="Six drowned crewmen standing in a line in the dark Cathedral" loading="lazy">
    <figcaption><b>The crew, still on shift</b><span class="ao-meta">S09 · six named crew models from the game, posed and rim-lit</span></figcaption>
  </figure>
  <figure>
    <img src="/media/still-on-shift/still-15_t107.5.webp" alt="The red Heart glowing in its apse" loading="lazy">
    <figcaption><b>The Heart</b><span class="ao-meta">S25 · the game's Heart in its real apse, 171 m down</span></figcaption>
  </figure>
  <figure>
    <img src="/media/still-on-shift/still-18_t125.0.webp" alt="A red-lit tunnel with Drowned chasing up it" loading="lazy">
    <figcaption><b>The chase</b><span class="ao-meta">S30 · the stranger's lamp and the Heart's red light, the watch behind</span></figcaption>
  </figure>
</ao-compare>

## What I asked for

My prompt, more or less: make a music video or commercial for the game using the "Still on
Shift" song, as a pre-rendered cinematic trailer. No raw gameplay footage. Use the actual game
assets, make the previs and animate it yourself. Gunfire, zombies and water in the sound, and
render it professionally. Any tool except Higgsfield, because I'm almost out of credits.

## How it was made

**The song told the story.** The session transcribed the lyrics with faster-whisper and found
they already are the game: a crew that went down in the '60s and is still on shift, then "a
stranger swims the morning down, a spool of white unwinds" and "carry out the warm one". That's
the diver, the guide line and the Heart. It cut the 4-minute song to 2:45 by removing the second
verse and chorus: the two choruses match 61.72 seconds apart, so the splice lands on the same
beat and you can't hear it. The edit keeps the intro, verse one, the first chorus, the bridge,
the last chorus and the outro.

**A director inside the game.** Instead of exporting assets to Blender, it wrote one GDScript
file that runs inside the real game through the harness the game already uses for automated
tests. Each of the 35 shots is a few lines: where the camera is on each frame, which Drowned
stand where and how they swim, which lights to add, when a gun fires. The game runs at a fixed
30 frames per second, so time is exact, and the script saves every frame at 1920×1080. The
diver has no body in this game (it's first person), so "the stranger" is only ever his lamp beam
in the silt, his bubbles and the real guide line the game draws, laid point by point as he
swims.

**Previs first.** The same script rendered every shot again in a clay pass, Godot's
lighting-only debug view at 960×540, cut to the music as an animatic. That's where camera
paths, timing and framing got fixed before any real render.

<iframe src="/media/still-on-shift/?v=previs&embed" title="Previs animatic" style="width:100%;aspect-ratio:16/9;border:0" allow="fullscreen" loading="lazy"></iframe>

**Sound from the game.** Every time the script fired a gun, hit a Drowned, woke the Undertow or
grabbed the Heart, it logged a cue with the frame number. The editor laid the game's own samples
on those frames (speargun, flechette, arc projector, pneumatic driver, vortex maw, the moans,
the heartbeat, the shift bell, the undertow surge), put the game's ambience beds under each
shot, ducked the song a little under the loud hits and normalised the mix to −14 LUFS. The game
has no splash sound, so the three water sounds are synthesized: filtered noise plus rising
bubble chirps.

**Finishing.** ffmpeg did a light grade (teal shadows, warm highlights), vignette, film grain, a
2.39:1 letterbox and the title cards. The video on this page is HLS, cut into 4-second pieces,
because the site can't serve one file over 25 MB.

What it measured:

- **35 shots, 4,943 frames** at 1080p30, 2:44.8 long.
- **About 20–40 seconds per shot** to render; a full final pass of all 35 took **11–15 minutes**.
- **One previs pass, two full final passes, then 18 targeted shot re-renders** in four fix rounds, each decided by
  contact sheets of every shot.
- **About 49 minutes of GPU** in total, on a laptop RTX 4070 shared with other agents through a queue. Most of the
  five hours was waiting for a turn.
- **84 sound cues** logged by the director script: 25 gunshots, 25 hits, and the moans, emergences, heartbeats,
  bell and surge.
- **Built from:** the cave (96 rooms), six named Drowned crew models, the Lamp Man, the Angler,
  the Silt Shade, the Guardian, six guns, the Heart, the guide line, and the game's Fx for
  bubbles, muzzle flashes, body hits and emergence.

## What went wrong

**The first final render looked nothing like the game.** Every shot where the camera flew
freely was a flat, bright grey. The script used noclip so the camera could go anywhere, and in
this game noclip also switches the atmosphere to a survey look with the fog off. The fix was to
drop noclip and teleport the player to the camera position every frame instead.

**That exposed the next rule.** Without noclip, the game's rock rescue (it puts you back where
you last swam freely if a teleport leaves you inside a wall) snapped nine shots somewhere else.
The camera had really been inside rock, so the free-flying version had been filming backfaces.
Now the camera checks the cave's own inside-rock test and slides toward what it's looking at
until it's in open water.

**The gun was invisible in the first-person shots**, for the same reason: noclip hides the
viewmodel and stops the trigger.

**Smaller ones.** The clay previs draws the game's transparent light-shaft cards as solid grey
slabs. The machine's disk filled up mid-render and wrote empty frames, so shots now encode to
video as soon as they render. And the GPU queue that other agents share couldn't launch a `.sh`
file on Windows, so one pass sat queued for 45 minutes and then did nothing.

Like the last post, nobody listened to the mix before it shipped. The session can't hear. It
checked loudness and peaks, and placed every effect on the frame where its event happens.

## How to ask for one

What made this work was the prompt naming the constraint (the real assets, no footage) and the
game already having a harness a script could drive. If you want to ask for something like it,
or better, this is what I'd type now:

> Make a {length} trailer for {game} cut to {song}. Pre-rendered in the game engine from the
> game's own assets, no gameplay capture and no AI video. Transcribe the lyrics and build the
> shot list from them, with every cut on a bar line. Write a director script that runs inside
> the game at a fixed frame rate and saves frames: camera path, creature motion, lights and
> effects per shot, and a sound cue logged on the frame of every gunshot and hit. Render a clay
> previs animatic first and show me contact sheets. Don't use noclip or any debug camera that
> changes how the game looks. Mix only the game's own sounds under the song and master to −14
> LUFS. Grade, letterbox, title cards. Check every shot against contact sheets before and after
> each final pass.

To get better than this: give it a diver model for the third-person shots (the stranger is only
a light here), let it use depth of field and motion blur (Godot has both; this pass didn't),
and listen to the mix yourself before it goes out.
