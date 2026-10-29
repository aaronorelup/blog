---
id: "AO-020"
title: "A 30-second film with no assets, and a score nobody listened to"
summary: "One prompt got me a 30-second training montage starring Clawd, the Claude Code mascot, with every frame and note written as code. It came out good. The first version of the music also took 81 seconds to render 30 seconds of sound, and no one heard it before it shipped."
date: 2026-09-26
status: "shipped"
tags: ["claude-code", "animation", "web-audio", "canvas"]
preview:
  verdict: "Good picture, unheard score"
  takeaway: "The picture got good because the session could look at its own frames; the score could only be measured. Give the agent a way to check what you care about most."
  points:
    - "The score built about 5,000 audio nodes at once and left them connected. Fixing that cut its render from 81 s to 4.5."
    - "Eight fix passes came from looking at frames. One caught a 3D pagoda seen from underneath: a camera sign was flipped."
    - "In the Jefrie follow-up, H3 copied the look of a coloured Blender reference. A grey one plus painted end frames worked."
  image: "/media/previews/clawd-growth-montage.webp"
  loop: "/media/previews/clawd-growth-montage.mp4"
  alt: "Clawd, the blocky terracotta Claude Code mascot, standing on a mountain summit in front of a rising sun"
---

This is a 30-second animated short about Clawd, the little terracotta Claude Code mascot,
getting better at things. It starts in a chat window in 2023 and falls over. It learns to
search, to write code, to build in 3D, climbs a mountain of hard problems and stands on the
top at sunrise. The shape is a Kung Fu Panda training montage: fumble, fumble, click, fluid.
No footage or music is copied, only the structure.

[Watch it here](/games/clawd-growth-montage/). Press play, and have the sound on.

<video controls playsinline preload="metadata" poster="/games/clawd-growth-montage/poster.jpg" src="/games/clawd-growth-montage/clawd-growth-montage.mp4" style="width:100%;border-radius:0"></video>

## Everything is code

There are no images in it, no samples and no recordings. Clawd is rectangles on a canvas,
eleven cells wide and six tall, with squash and stretch applied to the whole block. The
pages that fall like leaves, the tea house, the pagoda and the sun are all drawn by
functions. The pagoda is real 3D: 54 vertices and 32 faces, rotated, projected with a
perspective divide and shaded by the angle to a light.

The music is synthesized in the browser with Web Audio. The plucked strings are
Karplus-Strong: a burst of noise ringing in a short delay line. The flute is two oscillators with a breath of filtered noise and vibrato that arrives
late. The taiko is a sine wave dropping in pitch. It's in D minor pentatonic until the
summit, where it lifts to E-flat major and holds one chord while it fades.

The whole picture is a pure function of time. `renderFrame(t)` draws the frame for any
second you ask for, so the same page plays it live and renders the MP4 with no screen
capture involved. A headless Chromium called it 900 times at 1920x1080, the page rendered its
own score offline to a WAV, and ffmpeg put the two together.

## One prompt

I wrote one long prompt: the six scenes with their timings, the palette, the fonts, the
rules for the music, the file layout, "render an MP4, look at the frames, fix what's ugly".
A single Claude Code session built the page, the score, the render script and this post from
it. I didn't touch the code.

What it measured, not what it guessed:

- **1,558 lines** in one HTML file, 92 KB. The render script is 80 lines.
- **5.2 MB** MP4 at CRF 20, H.264 and AAC, well under the 20 MB limit.
- **155 seconds** for the final render: 4.5 for the audio, the rest for 900 frames.
- **About 40 minutes** from cloning the repo to pushing the branch.
- **8 fix passes**, each one decided by looking at rendered frames: 36 stills across three
  passes, then 180 frames in contact sheets to check the motion.

## What went wrong

The first frames were mostly right, and the misses were the kind you'd
only catch by looking. The 3D pagoda was being viewed from underneath, because one sign in the
camera tilt was flipped, so every roof got culled and it looked like a glass box. The integral
in the climb scene rendered as scattered glyphs until the superscript was rebuilt piece by piece.
The chat bubble sat on top of the tea house. The caption "5 sources, cited" appeared before the
fifth source had landed.

The real problem was the music. The first full render took 81 seconds to produce 30 seconds of
audio. That's fine for an MP4, but in a browser it would have stuttered, because the page was
building all of roughly 5,000 audio nodes at the start and leaving every note's output chain
connected after the note had ended. The session split the cost apart by turning parts off and
timing each version. The reverb cost about half, the dead note chains most of the rest. Notes
are now created a second and a half before they play and disconnected when they finish, and the
same 30 seconds renders in 4.5.

The other thing I want to be straight about: nobody listened to the score before it shipped.
The session can't hear. It checked the music with a loudness table per second and a spectrogram,
and that's how it found the big drum hits bottoming out at 38 Hz, below what a phone speaker can
play. Those checks can tell you the music is shaped right. They can't tell you if it's any good.

## Someone else did it better

After this went up, I saw [this one on X](https://x.com/ishuagra02/status/2102788371114246177),
and it is far better than mine. It's much more 3D, and it has a clear, high-quality painterly
feel that mine doesn't come close to. My guess is they made a previs in Blender, animated it,
and then handed that animation to a video generation model. I don't know that, it's what it
looks like.

The comment on it says it was a back and forth of two messages. Mine was one prompt, so maybe
if I kept working on this one I could get it to that level. But I'd rather try the idea on a
different video than polish this one, so that's what I'm doing next.

## The different video: Jefrie

So I tried the guessed-at pipeline on [Jefrie](/ledger/jefrie-in-3d/), my scythe girl with the
tail that weighs more than she does. Same length, same idea, a training montage, but made the
way I think that post was made: a Blender animation first, then a video model painting over it.
I asked for two versions, and here are both.

The first one is still all code. It reuses the rigged Jefrie and the six physics-driven moves
from September 23rd: the run, the tail jump, the skid stop, the spin and the marionette attack.
A 414-line Blender script builds the Storm Bell yard around her, with the iron dome, watchtowers,
braziers, sandbags and a brick town in the mist. It cuts six five-second shots and runs an
oil-paint filter over every frame. The score is 166 lines of numpy: a church bell on every cut,
war drums that build shot by shot, a string line, and an ending that doesn't resolve.

<video controls playsinline preload="metadata" poster="/media/jefrie-montage/blender-poster.jpg" src="/media/jefrie-montage/jefrie-montage-blender.mp4" style="width:100%;border-radius:0"></video>

The second one is that Blender film handed to MiniMax-H3, running locally on my laptop. H3 makes
about six seconds at a time, so the film is six clips chained together. Each clip continues from
the saved latent of the one before, overlapping by a second, and each one gets the matching six
seconds of the Blender render as a motion reference. The look comes from paintings: Qwen repainted
Blender frames in oil, using her painted character reference, and those became the start frame,
the style reference and an end frame for each clip.

<video controls playsinline preload="metadata" poster="/media/jefrie-montage/h3-poster.jpg" src="/media/jefrie-montage/jefrie-montage-h3.mp4" style="width:100%;border-radius:0"></video>

The final six clips took 30 minutes of GPU time. Counting the takes I threw away, it was 54. On
the clock it took seven hours, because this laptop's GPU is shared between several sessions and
most of that night was spent waiting in line.

What went wrong, in order:

- **The first test render was black.** The fog was a world volume, and in EEVEE that swallowed
  the sun and the sky. A cheaper mist pass replaced it.
- **The camera flew through a fire.** In shot two the camera's path went straight through a
  brazier flame, and the frame blew out white for half a second.
- **H3 grew a rope.** The first take of clip one said the blade "ploughs a furrow". Her tail
  disappeared, and a long rope-like arc lay on the ground instead. Removing that line and saying
  the tail stays attached fixed it.
- **H3 copied the Blender look.** When the motion reference was the coloured Blender render, the
  output came back looking like the Blender render, blob sandbags and all. What worked was a grey
  motion reference, so the motion comes from Blender and the colour and brushwork only from the
  paintings, plus a painted end frame on every clip.
- **Qwen added people.** One painted end frame had three small figures standing inside the dome.
  In her story she's alone, so it was redone.
- **Whisper heard a voice.** The speech check flagged three seconds near the end and transcribed
  them as "Thanks for watching!". The spectrogram shows boots and metal clanks, not speech. That
  phrase is a hallucination Whisper is known for on sound that isn't speech.

Nobody has listened to this score yet either. Its levels and frequency balance were measured, same
as the first one.

## What I take from it

The picture got good because the session could see it. Every fix above came from rendering a
frame and looking at it. The music had no equivalent, so it got checked for what can be measured:
level, pitch, timing, cost. The difference between those two halves is the difference between
"verified" and "verifiable", and it belongs in the prompt next time. Give the agent
a way to look at the part you care about most, or it will only check the parts it can see.
