---
id: "AO-035"
title: "Eight Claude agents drew my song's whole music video in code, one tool per scene"
summary: "One unattended Opus 5.5 session cut \"Moonlight at the Waterline\" into eight scenes on its bar lines and handed each to an agent with one tool: plain canvas, HyperFrames or Remotion. No image or video model, no Blender. The finished 2:45 video was ready 80 minutes after I asked, every sung word is on screen before it's sung, and the session sent three scenes back before I saw any of them."
date: 2026-10-04
status: "shipped"
tags: ["claude-code", "agents", "animation", "canvas", "lessons"]
series: ["blackwater"]
draft: false
---

Claude made a new music video for "Moonlight at the Waterline", all 2:45 of it, without an image
model, a video model or Blender. Eight agents drew eight scenes in code: three in plain canvas,
three in HyperFrames and two in Remotion. The finished video was ready 80 minutes after I asked.

**The three tools don't show as seams, because before any agent opened one, the session wrote a
single style document and drew a single silhouette of the man, and every scene started from
those.** The tools changed how each scene was built. They didn't change what it looks like.

## What I asked for

Yesterday five Opus 5.5 sessions each made an 18-second lyric moment over this song's chorus, in
plain canvas, HyperFrames and Remotion, with and without each tool's own skills. I liked them, and
asked for the whole song:

> I actually really liked the animations you made for moonlight at the water lines. Could you
> spawn in a new session to generate another music video for moonlight at the waterline using the
> canvas-bare, hyperframes-skills, and the remotions skills. Each scene should pick one. Make it
> Opus 5.5 xhigh thinking it should come up with the whole video itself and should not use comfyui
> or blender mcp at all this time. I want it full in this style. It should post the finished
> product as a new blog.

The new session got the song, the word timings, the lyrics and the story notes I'd given after
the [first two cuts](/ledger/moonlight-two-cuts/): he waits on the jetty, she's the diver,
she's only ever shown as her gear or her lamp, and "I see your oxygen bubbles rise" is the peak.
Everything else, from the scene list to the ending, it decided. It wrote and published this post
too.

<video controls playsinline preload="metadata" poster="/media/moonlight-in-code/poster.webp" src="/media/moonlight-in-code/moonlight_code_mv_720.mp4" style="width:100%;border-radius:8px"></video>

The web copy is 1280×720 and 22 MB. The master is 1080p at 30 fps, with the song muxed
unchanged: its decoded audio is identical, sample for sample, to the file I gave it.

## Who drew what

The song is a 12/8 ballad at 62 beats a minute, so a bar is 3.87 seconds. The session cut the
eight scenes only on bar lines that don't split a sung line between two agents, and inside each
scene the agent could change shots on a beat. Each scene ends with an extra second of picture so the
cuts could be soft dissolves.

| # | Starts | What's sung | Drawn with | Why that tool | Final render |
|---|---|---|---|---|---|
| 1 | 0:00 | The tide… / The evening breeze… / Your empty coat… | HyperFrames | type on the horizon with a rippling reflection | 103 s |
| 2 | 0:27 | I'll watch the silver ripples… to …sigh once more | Remotion | four shots and two dissolves on one clock | 186 s |
| 3 | 0:58 | The bubbles rising… / You're a little late, my love | canvas | hundreds of bubbles, each a formula of time | 162 s |
| 4 | 1:14 | Moonlight at the waterline / I'm keeping vigil… | HyperFrames | the word "waterline" cut in half by the waterline | 55 s |
| 5 | 1:25 | But deep down dark… / So please come back to me | canvas | light in the dark: her lamp's beam reveals things | 279 s |
| 6 | 1:45 | I see your oxygen bubbles rise / Floating up into the starry skies | canvas | bubbles that turn into stars where they are | 152 s |
| 7 | 2:00 | My heart beats double time… / Oh, tell me you're alright | Remotion | the lantern pulsing twice on every beat | 90 s |
| 8 | 2:15 | The water keeps what it likes… / Won't you, my love? | HyperFrames | words that sink through the surface and stay there | 105 s |

The HyperFrames and Remotion agents loaded that tool's own skills and followed them. The canvas
agents had nothing but a browser: one HTML page, the canvas drawing API and the fonts already on
my laptop.

<ao-compare cols="4" aspect="16/9">
<figure><img src="/media/moonlight-in-code/s1.webp" alt="Scene 1: moonlit shore, the lyric The tide is slowly creeping up the sand lit across the water's edge." loading="lazy"><figcaption><b>1 · HyperFrames</b><span class="ao-meta">0:12.9 · the tide</span></figcaption></figure>
<figure><img src="/media/moonlight-in-code/s2.webp" alt="Scene 2: a lighthouse on a headland, its beam sweeping past the words of the lyric set in an arch." loading="lazy"><figcaption><b>2 · Remotion</b><span class="ao-meta">0:43.7 · the beam lights each word as it's sung</span></figcaption></figure>
<figure><img src="/media/moonlight-in-code/s3.webp" alt="Scene 3: cutaway at the waterline, a man by a lantern on the jetty above, rings on the water, You're a little late, my love." loading="lazy"><figcaption><b>3 · canvas</b><span class="ao-meta">1:11.5 · the rings from her bubbles</span></figcaption></figure>
<figure><img src="/media/moonlight-in-code/s4.webp" alt="Scene 4: Moonlight in script on the horizon, waterline lying across the waterline, the guide line running down to a lamp far below." loading="lazy"><figcaption><b>4 · HyperFrames</b><span class="ao-meta">1:19.4 · the chorus</span></figcaption></figure>
<figure><img src="/media/moonlight-in-code/s5.webp" alt="Scene 5: a gloved hand on a guide line in the dark, a lamp beam finding a sunken rowboat and an anchor." loading="lazy"><figcaption><b>5 · canvas</b><span class="ao-meta">1:36.6 · what the water kept</span></figcaption></figure>
<figure><img src="/media/moonlight-in-code/s6.webp" alt="Scene 6: a glowing column of bubbles rising out of the dark, the words bubbles and rise in script beside it." loading="lazy"><figcaption><b>6 · canvas</b><span class="ao-meta">1:50.4 · the peak</span></figcaption></figure>
<figure><img src="/media/moonlight-in-code/s7.webp" alt="Scene 7: an enormous pale moon behind the tiny man on the jetty, the word moonshine arched over its halo." loading="lazy"><figcaption><b>7 · Remotion</b><span class="ao-meta">2:09.6 · under the pale moonshine</span></figcaption></figure>
<figure><img src="/media/moonlight-in-code/s8.webp" alt="Scene 8: the man seated on the jetty by the lantern, a light rising beneath the surface just below him." loading="lazy"><figcaption><b>8 · HyperFrames</b><span class="ao-meta">2:37.6 · two lights, one waterline</span></figcaption></figure>
</ao-compare>

## How it held eight agents to one look

The first 15 minutes went on pulling frames from yesterday's five videos, reading their code and
notes, and writing a director's document every agent had to read first. It fixed the palette down to hex values,
the two typefaces (a Garamond italic and a brush script), the story rules and one rule for the
words: each word has to be on screen and readable two frames before it's sung, then lights up
from left to right while it's held. It also drew the man once, as a path 100 by 400 units, with
the lantern and her coat, so every scene puts the same person on the jetty.

The concept it wrote is two lights. His lantern stays above the waterline, her lamp stays below
it, and the words go wherever the light is. It ends with the two lights almost touching across
the surface, and cuts to black before she comes up. The song leaves that open, and so does the
video.

## The numbers

- **80 minutes from my prompt to the finished master**: 20:20 to 21:40 on 4 October. The eight
  agents ran at the same time, each for 21 to 57 minutes including revisions.
- **17 full renders**, 45 minutes of rendering added up, most of it running side by side on my
  laptop. The final renders took 19 minutes added up. Per second of video, HyperFrames took 3.7
  seconds, Remotion 5.7 and canvas 11.1, mostly because the canvas renderer passes every frame out
  of the browser as a PNG.
- **$101 at API list prices** for the main session and all eight agents, measured from the
  transcripts while this post was being written: 1.5 million output tokens and 245 million cache
  reads, all Opus 5.5 at xhigh. I'm on a flat subscription.
- No ComfyUI, no Blender, no image or video model, no downloaded images. The only file that
  didn't come out of its own code is the song.

## What didn't work

Each agent fixed a list of its own problems before it reported back. The sunken rowboat first
read as a comb, the regulator hoses under her mask made a smiley face, the moon's craters made a
face, and the first big bubbles looked like gulls.

Then the session pulled frames from every render at full size and sent three scenes back before
I saw anything. In scene 1 the tail of the "g" in "Moonlight" cut through "WATERLINE" in the title, and
his hand on the rail read as a robot claw. In scene 2 the hand holding the pocket watch was three
dark blobs. The peak got the longest note: the bubbles were hundreds of identical white outlines
with no light in them, and the line was scattered into the corners of the frame. Its note asked
for clear spheres lit gold by her lamp, a column that glows, a real exhale, and the words kept
together, riding the bubbles up.

<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/moonlight-in-code/peak_v1.webp" alt="The peak as first rendered: scattered white outline bubbles and the words I see your and oxygen pinned to the top corners." loading="lazy"><figcaption><b>The peak, first render</b><span class="ao-meta">1:49.5 · sent back</span></figcaption></figure>
<figure><img src="/media/moonlight-in-code/peak_v2.webp" alt="The peak after the notes: a glowing column of lit bubbles with I see your oxygen and bubbles beside it." loading="lazy"><figcaption><b>After the notes</b><span class="ao-meta">1:49.5 · the version in the video</span></figcaption></figure>
<figure><img src="/media/moonlight-in-code/hand_v1.webp" alt="Scene 1 first render: a hand on the rail drawn as separate blocky fingers with a white cuff." loading="lazy"><figcaption><b>The hand on the rail, first render</b><span class="ao-meta">0:19.5 · "a robot claw"</span></figcaption></figure>
<figure><img src="/media/moonlight-in-code/hand_v2.webp" alt="Scene 1 after the notes: one gloved hand curled over the rail, lit along the knuckles." loading="lazy"><figcaption><b>After the notes</b><span class="ao-meta">0:19.5 · one gloved silhouette</span></figcaption></figure>
</ao-compare>

Some of it is still weak, and the agents' own notes say so. Hands are the hardest thing any of
them drew. Her coat on the bench is the shape the session drew for every agent, and in most
scenes it reads like a loaf of bread; only scene 1 redrew it. The canvas scenes can't load web
fonts, so their script is Brush Script, which is heavier than the Yellowtail the other two tools
use. And at the music's sudden drop at 2:15 he's kneeling in one frame and sitting on the bench
in the next.

## It never heard the song

None of these agents can listen to audio. Everything is placed from the word timings and an
energy curve of the mix, and the peak is the peak because my story note says so. Afterwards the
session measured the finished file: for each of the 148 sung words it tracked the brightness
inside that word's box, frame by frame. Every word is readable between a tenth and a third of a
second before it's sung, and none is late. Two sat on backgrounds too bright to measure, so it
looked at those frames instead.

The [first two cuts of this song](/ledger/moonlight-two-cuts/) took five hours and then three
more, in Blender and Godot, and the first one put the wrong person on the jetty. This one got
the casting right because the first lines of what I gave it say who waits and who dives.

Three tools, and the thing that made the scenes match wasn't any of them. It was a document
written before the first agent started, and a drawing of one man in a hat.
