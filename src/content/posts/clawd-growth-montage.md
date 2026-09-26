---
id: "AO-020"
title: "A 30-second film with no assets, and a score nobody listened to"
summary: "One prompt got me a 30-second training montage starring Clawd, the Claude Code mascot, with every frame and note written as code. It came out good. The first version of the music also took 81 seconds to render 30 seconds of sound, and no one heard it before it shipped."
date: 2026-09-26
status: "shipped"
tags: ["claude-code", "animation", "web-audio", "canvas"]
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

## What I take from it

The picture got good because the session could see it. Every fix above came from rendering a
frame and looking at it. The music had no equivalent, so it got checked for what can be measured:
level, pitch, timing, cost. The difference between those two halves is the difference between
"verified" and "verifiable", and it belongs in the prompt next time. Give the agent
a way to look at the part you care about most, or it will only check the parts it can see.
