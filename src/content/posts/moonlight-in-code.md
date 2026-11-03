---
id: "AO-035"
title: "A music video for my song, animated in code by eight agents"
summary: "Claude split my song into eight scenes and had an agent animate each one in code, with no AI image or video model. How the scenes ended up matching, and what's still weak."
date: 2026-10-04
draft: false
topic: "video"
project: ["blackwater"]
preview:
  verdict: "80 minutes, no visible seams"
  takeaway: "Eight agents with three different tools made scenes that match, because the session wrote one style guide and drew the man once before any of them started."
  points:
    - "It cast the lovers right this time, because the first lines of my notes said who waits on the jetty and who dives."
    - "None of the agents can hear audio. Words were placed from the timings, and every one shows up just before it's sung."
    - "Weak spots are the hands, a coat that reads like a loaf of bread, and the man jumping from kneeling to sitting at 2:15."
  image: "/media/previews/moonlight-in-code.webp"
  loop: "/media/previews/moonlight-in-code.mp4"
  alt: "The man on the jetty by his lantern under the moon, Moonlight lettered across the sky and her lamp glowing far below on the guide line"
---

Claude made a full music video for my song "Moonlight at the Waterline" without any AI image or
video model. It's the love song from [BLACKWATER](/ledger/blackwater-weekend/), the cave-diving
zombie game I built in four days. One Claude session split the 2:45 song into eight scenes and
gave each to its own agent, which animated it in code with one of three tools. They all worked at
the same time, and it was done 80 minutes after I asked.

**The scenes don't look like three different tools.** Before any agent started, the session wrote
one style guide and drew the man on the jetty once, and every scene started from those.

<video controls playsinline preload="metadata" poster="/media/moonlight-in-code/poster.webp" src="/media/moonlight-in-code/moonlight_code_mv_720.mp4" style="width:100%;border-radius:8px"></video>

My [first two versions](/ledger/moonlight-two-cuts/) were made in Blender and Godot (a 3D program
and a game engine), and the first one cast the lovers the wrong way round. He's meant to wait on
the jetty while she dives. This one got it right because my notes now said so. I've since made
[another version](/ledger/moonlight-five-times/), and this one might still be the better video.

What came out of it:

- **One tool per scene.** Three scenes are plain canvas, the drawing code built into every web
  browser. Three are HyperFrames and two are Remotion, tools that turn animated web pages into
  video.
- **It reviewed its own work** and sent three scenes back before I saw anything.
- **It never heard the song**, but every sung word shows up just before it's sung.
- **It would have cost $101** at Claude's pay-as-you-go prices. I'm on a flat subscription, so I
  didn't pay that.
- **Some of it is still weak**, like the hands, her coat and a jump at 2:15.

## What I asked for

I'd liked five short chorus animations Claude made the day before, so I asked for the whole song.
It got the song, the lyrics, the word timings and my story notes, and decided everything else.

<details><summary>My prompt, word for word</summary>

> I actually really liked the animations you made for moonlight at the water lines. Could you
> spawn in a new session to generate another music video for moonlight at the waterline using the
> canvas-bare, hyperframes-skills, and the remotions skills. Each scene should pick one. Make it
> Opus 5.5 xhigh thinking it should come up with the whole video itself and should not use comfyui
> or blender mcp at all this time. I want it full in this style. It should post the finished
> product as a new blog.

Opus 5.5 is a Claude model, and xhigh is its extra-high thinking setting. ComfyUI is what I
normally run AI image and video models in, and Blender MCP lets Claude drive Blender. Each scene
picking one tool was my idea. Everything else, from the scene list to the ending, the session
decided.

The story notes were the ones I'd written after the first two versions. He waits on the jetty,
she's the diver, she only ever shows up as her gear or her lamp, and "I see your oxygen bubbles
rise" is the peak.

</details>

## Three tools that don't look different

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

The HyperFrames and Remotion agents loaded that tool's skills, instruction files that teach
Claude to use it. The canvas agents had only a browser and the fonts on my laptop.

<details><summary>Who drew what, scene by scene</summary>

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

- The session cut the song only where no sung line would be split between two agents. Inside
  each scene the agent could change shots on a beat.
- Each scene ends with an extra second of picture, so one scene could dissolve into the next
  instead of cutting hard.
- The eight agents ran at the same time, each for 21 to 57 minutes including revisions.
- 17 full renders, 45 minutes of rendering added up, most of it running side by side on my
  laptop. The final renders took 19 minutes added up.
- Per second of finished video, HyperFrames took 3.7 seconds to render, Remotion 5.7 and canvas
  11.1. Canvas was slowest mostly because its renderer passes every frame out of the browser as a
  separate picture.
- The $101 is at API list prices. It covers the main session and all eight agents, all Opus 5.5
  at xhigh, measured from their transcripts.
- No ComfyUI, no Blender, no image or video model, no downloaded images. The only file that
  didn't come out of the session's own code is the song.

</details>

## How it kept eight agents to one look

The session spent its first 15 minutes writing a style guide that every agent had to read. It
set the colors, two typefaces, the story rules and one rule for the words. Each word is readable
two frames before it's sung, then lights up left to right while it's held. It also drew the man once,
with his lantern and her coat, for every scene to use.

Its idea is two lights. His lantern stays above the waterline, her lamp below it, and the words go
wherever the light is. It ends with the lights almost touching and cuts to black before she comes
up. The song leaves that open, and so does the video.

<details><summary>What the style guide fixed</summary>

- Before writing it, the session pulled frames from the five chorus animations and read their
  code and notes.
- The palette, down to exact color codes.
- Two typefaces, a Garamond italic and a brush script.
- The man drawn once as one outline shape, 100 by 400 units, with the lantern and her coat, for
  every agent to reuse.

</details>

## It sent three scenes back

Each agent fixed its own problems first, like a sunken rowboat that looked like a comb. Then the
session checked full-size frames and sent three scenes back. One hand looked like a robot claw,
another was three dark blobs, and the bubbles at the peak were flat white outlines.

<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/moonlight-in-code/peak_v1.webp" alt="The peak as first rendered: scattered white outline bubbles and the words I see your and oxygen pinned to the top corners." loading="lazy"><figcaption><b>The peak, first render</b><span class="ao-meta">1:49.5 · sent back</span></figcaption></figure>
<figure><img src="/media/moonlight-in-code/peak_v2.webp" alt="The peak after the notes: a glowing column of lit bubbles with I see your oxygen and bubbles beside it." loading="lazy"><figcaption><b>After the notes</b><span class="ao-meta">1:49.5 · the version in the video</span></figcaption></figure>
<figure><img src="/media/moonlight-in-code/hand_v1.webp" alt="Scene 1 first render: a hand on the rail drawn as separate blocky fingers with a white cuff." loading="lazy"><figcaption><b>The hand on the rail, first render</b><span class="ao-meta">0:19.5 · "a robot claw"</span></figcaption></figure>
<figure><img src="/media/moonlight-in-code/hand_v2.webp" alt="Scene 1 after the notes: one gloved hand curled over the rail, lit along the knuckles." loading="lazy"><figcaption><b>After the notes</b><span class="ao-meta">0:19.5 · one gloved silhouette</span></figcaption></figure>
</ao-compare>

<details><summary>Everything it fixed or sent back</summary>

- The agents' own fixes: the sunken rowboat read as a comb, the hoses under her mask made a
  smiley face, the moon's craters made a face, and the first big bubbles looked like gulls.
- Scene 1: the tail of the "g" in "Moonlight" cut through "WATERLINE" in the title, and his hand
  on the rail read as a robot claw.
- Scene 2: the hand holding the pocket watch was three dark blobs.
- The peak got the longest note. The bubbles were hundreds of identical white outlines with no
  light in them, and the line was scattered into the corners of the frame. The note asked for
  clear bubbles lit gold by her lamp, a column that glows, a real exhale, and the words kept
  together, riding the bubbles up.

</details>

## It never heard the song

None of these agents can listen to audio, so everything is placed from the word timings and a
curve of how loud the music gets. Afterwards the session tracked how bright each of the 148 sung
words got on screen. Every one is readable a tenth to a third of a second before it's sung, and
none is late. Two sat on backgrounds too bright to measure, so it looked at those frames instead.

## What's still weak

Hands were the hardest thing any agent drew. Her coat on the bench comes from the one drawing
every agent shared, and in most scenes it looks like a loaf of bread. Only scene 1 redrew it. The
canvas scenes couldn't load web fonts, so their lettering uses a heavier script. And at the song's
sudden drop at 2:15 he's kneeling in one frame and sitting in the next.

*The session that made the video wrote the first version of this post.*
