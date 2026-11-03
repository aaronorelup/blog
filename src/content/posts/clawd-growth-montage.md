---
id: "AO-020"
title: "A 30-second animated short Claude drew and scored in code"
summary: "From one prompt, Claude made a 30-second animated short of its mascot, every frame and note written as code. What it fixed by looking, the music nobody heard, and a remake with my character Jefrie."
date: 2026-09-26
topic: "3d"
project: ["characters"]
preview:
  verdict: "Good picture, unheard score"
  takeaway: "The picture got good because Claude could look at its own frames, while the music could only be measured and nobody listened to it before it shipped."
  points:
    - "All eight fix passes came from looking at frames. One found a flipped camera sign showing a 3D pagoda from underneath."
    - "The music took 81 s to render 30 s of sound until notes were built just before playing. Now it takes 4.5 s."
    - "With my character Jefrie, the AI video model copied its 3D guide's look. A gray guide plus painted end frames fixed it."
  image: "/media/previews/clawd-growth-montage.webp"
  loop: "/media/previews/clawd-growth-montage.mp4"
  alt: "Clawd, the blocky terracotta Claude Code mascot, standing on a mountain summit in front of a rising sun"
---

I gave Claude one long prompt, and it made a 30-second animated short of Clawd, the little
terracotta mascot of Claude Code, getting better at things. Every frame and every note of music
is written as code. There are no pictures, samples or recordings in it.

**The picture came out good because Claude could save still frames and look at them.** All eight
rounds of fixes came from that. **The music it could only measure, and nobody listened to it
before it shipped.** Next time I'll give it a way to check the part I care about most.

<video controls playsinline preload="metadata" poster="/games/clawd-growth-montage/poster.jpg" src="/games/clawd-growth-montage/clawd-growth-montage.mp4" style="width:100%;border-radius:0"></video>

Clawd starts in a chat window in 2023 and falls over. Then it learns to search, to code and to
build in 3D, and climbs a mountain to the sunrise. It's shaped like a Kung Fu Panda training
montage: fumble, fumble, click, fluid. [Its own page](/games/clawd-growth-montage/) plays it live
from the code in your browser. Have the sound on.

## The quick rundown

- **One prompt, about 40 minutes.** My prompt had the six scenes, the colors, the music rules
  and "render an MP4, look at the frames, fix what's ugly." I didn't touch the code.
- **Eight fix passes, all from looking.** One caught the 3D pagoda being seen from underneath,
  because one sign in the camera math was flipped.
- **The music was slow to render.** The first version took 81 seconds to render 30 seconds of
  sound. A fix got it to 4.5.
- **Nobody heard the music before it shipped.** Claude can't hear, so it only measured it.
- **Someone else's was much better.** So I tried what I guessed was their method on my
  character Jefrie. The AI video model copied the look of its 3D guide until the guide was gray.

<details><summary>Everything looking at the frames caught</summary>

The first frames were mostly right. The misses were the kind you only catch by looking.

- **The pagoda was seen from underneath.** One sign in the camera tilt was flipped, so the roofs
  never got drawn and it looked like a glass box.
- **A math formula came out as scattered symbols** in the climb scene, until Claude rebuilt its
  small raised part piece by piece.
- **The chat bubble sat on top of the tea house.**
- **The caption "5 sources, cited" showed up early,** before the fifth source had landed.
- It checked 36 stills over three passes, then 180 frames laid out in grids to check the motion.

</details>

## The music nobody listened to

Claude checked the score with a loudness table and a spectrogram, a picture of which pitches
play when. That's how it found drum hits at 38 Hz, too low for a phone speaker. Those checks
tell you the music is shaped right. They can't tell you if it's any good.

For the slow first render, the page built about 5,000 little sound pieces at the start and left
every note hooked up after it ended. Live in a browser, that would have stuttered. Now each note
is made just before it plays and unhooked when it ends.

<details><summary>How every frame and note is code</summary>

- No footage or music from Kung Fu Panda is copied, only the shape of its training montage.
- Clawd is rectangles on a canvas, the drawing area of a web page. It's 11 cells wide and 6 tall,
  and the whole block squashes and stretches as it moves.
- The pages that fall like leaves, the tea house, the pagoda and the sun are all drawn by
  functions. The pagoda is real 3D: 54 corners and 32 faces, rotated, put into perspective and
  shaded by its angle to a light.
- The music is made in the browser with Web Audio. The plucked strings are Karplus-Strong, a
  burst of noise ringing in a short delay line. The flute is two oscillators with a breath of
  filtered noise and vibrato that arrives late. The taiko drum is a sine wave dropping in pitch.
- It's in D minor pentatonic until the summit, where it lifts to E-flat major and holds one chord
  while it fades.
- The whole picture is a function of time. `renderFrame(t)` draws the frame for any second you
  ask for, so the same page plays it live and makes the MP4 with no screen recording.
- A browser with no window (headless Chromium) called it 900 times at 1920x1080. The page rendered
  its own score to a WAV file, and ffmpeg put the two together.
- It's one HTML file of 1,558 lines, 92 KB. The render script is 80 lines. The MP4 is 5.2 MB
  (CRF 20, H.264 and AAC). The final render took 155 seconds: 4.5 for the audio, the rest for the
  900 frames.
- About 40 minutes from cloning the repo to pushing the branch.
- The music fix: Claude switched parts off and timed each version. The reverb, the effect that
  makes it sound like a big room, was about half the cost and the dead note chains most of the
  rest. Notes are now created a second and a half before they play and disconnected when they
  finish.

</details>

## Someone else did it better

After this went up I saw [this montage on X](https://x.com/ishuagra02/status/2102788371114246177).
It's far better than mine, much more 3D, with a painterly feel mine doesn't come close to. My
guess is they animated it roughly in Blender, the free 3D program, and had an AI video model paint
over that. I don't know that. It's what it looks like.

## The remake with Jefrie

So I tried that method on Jefrie, my scythe girl with the tail that weighs more than she does.
Same length, same idea, two versions.

**The first is all code, made in Blender.** It reuses her 3D model and moves from
[six days of putting her in 3D](/ledger/jefrie-in-3d/). It's six shots around a yard from her
world, with an oil-paint filter on every frame and a score written in code.

**The second is that film repainted by MiniMax-H3,** the AI video model I run on my laptop. It
makes about six seconds at a time, so it's six clips chained together. Each one follows six
seconds of the Blender film for its motion. The look comes from Blender frames that another AI
model, Qwen, repainted in oil.

<figure>
  <video controls playsinline preload="metadata" poster="/media/jefrie-montage/blender-poster.jpg" src="/media/jefrie-montage/jefrie-montage-blender.mp4" style="width:100%;border-radius:0"></video>
  <figcaption><b>Made only in Blender code</b><span class="ao-meta">six shots, oil-paint filter, score in code</span></figcaption>
</figure>

<figure>
  <video controls playsinline preload="metadata" poster="/media/jefrie-montage/h3-poster.jpg" src="/media/jefrie-montage/jefrie-montage-h3.mp4" style="width:100%;border-radius:0"></video>
  <figcaption><b>The same film repainted by the AI video model</b><span class="ao-meta">six chained clips on my laptop</span></figcaption>
</figure>

**The video model copied the look of its guide.** Following the colored Blender film, it came
back looking like Blender, blob sandbags and all. What worked was a gray copy of the film, so
the motion came from Blender and the color only from the paintings. Every clip also got a painted
end frame.

The six final clips took 30 minutes of the graphics card's time, 54 with the takes I threw away.
Nobody had listened to this score either when the post went up.

<details><summary>How the Jefrie remake was made, and what went wrong</summary>

- **The Blender version** reuses the rigged Jefrie and the physics-driven moves from September
  23rd: the run, the tail jump, the skid stop, the spin and the marionette attack. A 414-line
  Blender script builds the Storm Bell yard around her, with the iron dome, watchtowers, braziers,
  sandbags and a brick town in the mist. It cuts six five-second shots and runs an oil-paint
  filter over every frame.
- **Its score** is 166 lines of Python (numpy): a church bell on every cut, war drums that
  build shot by shot, a string line, and an ending that doesn't resolve. Its levels and frequency balance were
  measured, same as the first one.
- **The H3 version** chains six clips. Each continues from the saved latent of the one before
  (the model's own compressed copy of the last frames), overlapping by a second, and gets the
  matching six seconds of the Blender render as a motion reference. Qwen repainted Blender frames
  in oil using her painted character reference, and those became the start frame, the style
  reference and an end frame for each clip.
- **The first test render was black.** The fog was a world volume, and in EEVEE (Blender's fast
  renderer) that swallowed the sun and the sky. A cheaper mist pass replaced it.
- **The camera flew through a fire.** In shot two the camera's path went straight through a
  brazier flame, and the frame blew out white for half a second.
- **H3 grew a rope.** The prompt for the first take of clip one said the blade "ploughs a
  furrow". Her tail disappeared, and a long rope-like arc lay on the ground instead. Removing that line and saying
  the tail stays attached fixed it.
- **H3 copied the Blender look.** With the colored Blender render as the motion reference, the
  output looked like the Blender render. A gray motion reference plus a painted end frame on every
  clip fixed it.
- **Qwen added people.** One painted end frame had three small figures standing inside the dome.
  In her story she's alone, so it was redone.
- **Whisper heard a voice.** The speech check (Whisper, a speech-to-text model) flagged three
  seconds near the end and wrote them down as "Thanks for watching!". The spectrogram shows boots
  and metal clanks, not speech. Whisper is known for making up that phrase on sound that isn't
  speech.
- **Seven hours on the clock,** mostly waiting in line, because my laptop's GPU is shared between
  several sessions.

</details>

The next day I found the weak part was the Blender moves themselves. The video model copies them,
bad animation included. That's [its own post](/ledger/a-bad-previs/).
