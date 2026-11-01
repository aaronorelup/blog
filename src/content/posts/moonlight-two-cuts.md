---
id: "AO-031"
title: "Two cuts of the music video Claude made for my song"
summary: "From one prompt, Claude made a music video for a song from my game, in Blender and Godot with no AI video. Both cuts side by side, and how one paragraph of my notes fixed the casting it got backwards."
date: 2026-10-03
status: "in-progress"
tags: ["claude-code", "blender", "godot", "gamedev", "lessons"]
series: ["blackwater"]
topic: "video"
project: ["blackwater"]
preview:
  verdict: "Cast backwards, then fixed"
  takeaway: "My prompt never said who was singing, so Claude cast the lovers backwards from a lore draft and built five hours on it. One paragraph of my notes fixed it."
  points:
    - "My vaguest note became a test: each sung word in frame and readable within 0.4 s. 58 of 148 words failed, then none."
    - "Its checks caught cameras inside the woman's body and bare rock, but not the casting. I didn't answer its clay draft."
    - "The second cut took 2 h 54 min. Without being asked, it left the ending open instead of bringing the diver back."
  image: "/media/previews/moonlight-two-cuts.webp"
  loop: "/media/previews/moonlight-two-cuts.mp4"
  alt: "The same jetty shot from both cuts: v1's woman in a long coat on the left, v2's man in a flat cap on the right, both under the moon"
---

Claude made a whole music video for my song "Moonlight at the Waterline" from one prompt, and
cast it backwards. It put a woman waiting on the jetty and a man diving, when in the song it's the
other way round. **My prompt never said who was singing**, so it went with a lore draft it found
in my game's folder and built five careful hours on it. One paragraph of my notes fixed it in
under three hours.

The song is the 1960s ballad on the jukebox in [BLACKWATER](/ledger/blackwater-weekend/), my
cave-diving zombie game. It's about waiting on the shore for a diver who's late. Neither cut uses
AI video or gameplay footage. Claude built new models in Blender, a free 3D program. I'd said to
render there too, but a script rendered every frame inside my remake of the game in Godot, a free
game engine. Claude made the video for the game's other song,
[Still on Shift](/ledger/still-on-shift-music-video/), the same way.

- **The casting came from a lore draft** about a woman who waits. Claude said so in its summary.
  Partway through it sent me a rough clay version of every shot, and I didn't answer until it was done.
- **My vaguest note became a test.** I'd said some lyrics were "slightly out of view". Claude made
  that a rule: every sung word fully in frame and readable within 0.4 seconds. 58 of 148 words
  failed at first, then none.
- **It left the ending open without being asked.** The first cut brings the diver back out of
  the sea. In the second a light rises and dims under the water, and he steps in.
- **Its own checks caught a lot, but not the casting.** Cameras inside the woman's body, a glitch
  in the lighthouse beam, bare cave rock and a creature glowing green all over.

## Both cuts, side by side

The first cut (v1) and the second (v2) share the song's timing. Click a lyric to send both there.

<ao-cues labels="v1 · 27 Sep, 06:05|v2 · 27 Sep, 16:13">
<video controls muted playsinline preload="metadata" poster="/media/moonlight-two-cuts/v1_poster.webp" src="/media/moonlight-two-cuts/v1.mp4"></video>
<video controls muted playsinline preload="metadata" poster="/media/moonlight-two-cuts/v2_poster.webp" src="/media/moonlight-two-cuts/v2.mp4"></video>
<ol>
<li data-t="0:00">(title card: June 1968)</li>
<li data-t="0:06.83">The tide is slowly creeping up the sand</li>
<li data-t="0:14.77">The evening breeze is chilling on my hand</li>
<li data-t="0:22.43">Your empty coat is sitting here with me</li>
<li data-t="0:28.41">I'll watch the silver ripples on the sea</li>
<li data-t="0:33.83">And I'll wait for you</li>
<li data-t="0:37.81">The lighthouse throws its long and lonely beam</li>
<li data-t="0:45.47">While far below you chase an underwater dream</li>
<li data-t="0:53.33">I check my pocket watch and sigh once more</li>
<li data-t="1:00.51">The bubbles rising slowly to the shore</li>
<li data-t="1:08.31">You're a little late, my love</li>
<li data-t="1:14.30">Moonlight at the waterline</li>
<li data-t="1:20.55">I'm keeping vigil by the sea so blue</li>
<li data-t="1:26.33">But deep down dark where secrets stay</li>
<li data-t="1:32.17">The heavy water keeps the things it likes</li>
<li data-t="1:37.89">So please come back to me</li>
<li data-t="1:44.97">I see your oxygen bubbles rise</li>
<li data-t="1:53.33">Floating up into the starry skies</li>
<li data-t="2:01.15">My heart beats double time</li>
<li data-t="2:06.33">Under the pale moonshine</li>
<li data-t="2:11.81">Oh, tell me you're alright</li>
<li data-t="2:21.37">The water keeps what it likes</li>
<li data-t="2:27.89">But you will return</li>
<li data-t="2:32.11">Won't you, my love?</li>
</ol>
<figcaption><b>Moonlight at the Waterline, v1 and v2</b><span class="ao-meta">Both 2:51 at 24 fps on the same bar grid · Blender models, frames rendered in Godot · song by ElevenLabs Music · web copies: letterbox cropped, 1280×536 (masters are 1080p)</span></figcaption>
</ao-cues>

## What I asked for

I typed this just before 1 a.m.:

> Make a music video for moonlight at the waterline. Create brand new scenes and assets and
> render them in the blender, no gameplay capture and no AI video. Transcribe the lyrics and build
> the shot list from them, with every cut on a bar line and include the lyrics in the music video
> in a professional way so that they feel like part of the video instead of just captions.

Five hours later I had a 2:51 video in 41 shots, every cut on the start of a bar of music. No
lyric sits at the bottom like a subtitle. They're written in wet sand, hang along the rope the
diver follows, or show only where the lamp shines.

## My notes, and what they changed

My notes that afternoon flipped the casting. This was in the middle:

> BTW the lover on the surface is the guy, the diver is the girl. Also, whenever you depict the
> diver, I want it to be close up shots of her and her gear, never a full body shot to give the
> feeling of mystery because the lover is unsure.

I also wanted the lyrics fixed, "I see your oxygen bubbles rise" as the peak and the creature
"implied not shown". Four moments from each cut:

<ao-compare cols="2" aspect="2.39/1">
<figure><img src="/media/moonlight-two-cuts/v1_21.webp" alt="v1 at 0:21: a woman in a long coat stands on the jetty, seen from behind, the moon ahead and the words of the lyric floating over the sea." loading="lazy"><figcaption><b>v1 · 0:21</b><span class="ao-meta">"chilling on my hand": the woman waiting</span></figcaption></figure>
<figure><img src="/media/moonlight-two-cuts/v2_21.webp" alt="v2 at 0:21: the same shot with a man in an overcoat and flat cap on the jetty." loading="lazy"><figcaption><b>v2 · 0:21</b><span class="ao-meta">same shot, new model: overcoat, flat cap, scarf</span></figcaption></figure>
<figure><img src="/media/moonlight-two-cuts/v1_90.webp" alt="v1 at 1:30: a lamp far off in a green underwater haze, the lyric fading above it." loading="lazy"><figcaption><b>v1 · 1:30</b><span class="ao-meta">"deep down dark where secrets stay": the diver as a distant light</span></figcaption></figure>
<figure><img src="/media/moonlight-two-cuts/v2_90.webp" alt="v2 at 1:30: a close-up of the diver's face behind a round mask, a helmet lamp above, the lyric beside her." loading="lazy"><figcaption><b>v2 · 1:30</b><span class="ao-meta">the diver now a woman, close-up only, green lights in the dark behind</span></figcaption></figure>
<figure><img src="/media/moonlight-two-cuts/v1_133.webp" alt="v1 at 2:13: a lamp beam on the cave floor and a ridged creature shape in the dark, the words Oh, tell." loading="lazy"><figcaption><b>v1 · 2:13</b><span class="ao-meta">"Oh, tell me you're alright": the creature in frame</span></figcaption></figure>
<figure><img src="/media/moonlight-two-cuts/v2_133.webp" alt="v2 at 2:13: a dropped lamp, a taut guide line and a trail of bubbles; no creature visible." loading="lazy"><figcaption><b>v2 · 2:13</b><span class="ao-meta">implied: the line, the lamp, the bubbles</span></figcaption></figure>
<figure><img src="/media/moonlight-two-cuts/v1_160.webp" alt="v1 at 2:40: the woman on the jetty with a lantern while a diver with green-lit tanks stands in the water below her." loading="lazy"><figcaption><b>v1 · 2:40</b><span class="ao-meta">the diver walks out of the sea to her</span></figcaption></figure>
<figure><img src="/media/moonlight-two-cuts/v2_160.webp" alt="v2 at 2:40: the man alone at the end of the jetty with his lantern at his feet." loading="lazy"><figcaption><b>v2 · 2:40</b><span class="ao-meta">unresolved: a light rises, dims, and he steps into the sea</span></figcaption></figure>
</ao-compare>

## "Out of view" became a test

**The session turned my vaguest note into a number.** Its script logs every word it draws, frame
by frame, and checks it against when the word is sung. Its fixes took the failures from 58 to 8,
then 6, then none.

In v2 the "oxygen bubbles" line became one long take, from her mask up the column of bubbles
until the last one turns into the moon.

<ao-compare cols="3" aspect="2.39/1">
<figure><img src="/media/moonlight-two-cuts/previs_106.webp" alt="Clay previs at 1:46: a clay diver seen from below, the lyric word see beside it, and a burned-in label reading S27 His bubbles rise, bar 27." loading="lazy"><figcaption><b>Clay previs · 1:46</b><span class="ao-meta">v1's rough clay version, with its label still reading "His bubbles rise"</span></figcaption></figure>
<figure><img src="/media/moonlight-two-cuts/v1_106.webp" alt="v1 at 1:46: the diver from below in green haze, rendered with brass gear." loading="lazy"><figcaption><b>v1 · 1:46</b><span class="ao-meta">"I see your oxygen bubbles rise"</span></figcaption></figure>
<figure><img src="/media/moonlight-two-cuts/v2_106.webp" alt="v2 at 1:46: close on the diver's mask from below, gold bubbles rising past her helmet lamp." loading="lazy"><figcaption><b>v2 · 1:46</b><span class="ao-meta">the same bar, rebuilt as one take</span></figcaption></figure>
<figure class="wide"><img src="/media/moonlight-two-cuts/dissolve_check.webp" alt="Five frames across one bar line: bubbles and the lyric rise in the dark; the last bubble sits where the moon appears and becomes it." loading="lazy"><figcaption><b>The session's own dissolve check</b><span class="ao-meta">five frames across the bar line at 1:52.1: her last bubble dissolves into the moon at the same spot · v2, 27 Sep</span></figcaption></figure>
</ao-compare>

## The versions after this one

The same session also tried 30 seconds of the song through MiniMax-H3, an AI video model, and
later I asked for the whole song that way. That cut is in
[five music videos for one song](/ledger/moonlight-five-times/), along with a version
[eight agents drew in code](/ledger/moonlight-in-code/) and a painted one. The brief for the next
one opened with who waits and who dives.

<details><summary>Time, disk space and the technical bits</summary>

- The first cut took 5 hours 6 minutes. The revision took 2 hours 54 minutes.
- Partway through the revision my laptop's main drive filled up completely, and the step that
  joins the shots into one video died. The session deleted about 12 GB of its own old renders,
  all of which its scripts can make again, and made that step clean up after itself.
- The lyrics were transcribed with two Whisper models (speech-to-text AI). Where they disagreed it
  picked by context: "coat" not "cold", "and sigh" not "inside".
- It measured the song at 62.07 beats a minute in 12/8 time, so one bar is 3.87 seconds, and built
  the 41 shots from bar numbers rather than by hand.
- The rest of the prompt asked for a director script (the code that stages and films each shot), a
  clay previs with contact sheets, sound effects from ElevenLabs (an AI audio service) under the
  song, a master at −14 LUFS (a loudness level), a color grade, letterbox (black bars) and title
  cards.
- It modelled a woman, a diver, a pale 16-metre eel with paired green lights down its flanks, and
  a cove with a lighthouse and a flooded cave.
- 43 ElevenLabs sound effects sit on the frames where the director script logged each event.
- More lyrics in the scenes: some are taken by the tide after they're written in the sand, and
  some drift past in a breath.
- My other notes asked for the bubbles line to start on her mask and climb with the bubbles
  without ever showing the surface, and the creature "more ominous than scary".
- The lyric check is a script called `lyric_audit.py`. It compares the log of drawn words with the
  word timings from the transcription, against the wide 2.39:1 cinema frame. The fixes were a
  faster fade-in, a higher minimum brightness for words lit only by the lamp or the lighthouse,
  words that ride with the camera in moving shots, and lines that carry across a cut when a word
  lands right on it.
- The bubble take in full: her mask, gold bubbles bursting as she breathes out, the camera
  climbing with them out of the dark as they turn silver-blue, and the last bubble dissolving into
  the moon before the camera comes down to him on the jetty.
- The H3 test used the Godot frames as a guide for the motion.
- v2's ending in full: a light rises under the water, maybe her lamp, comes closer and dims. He
  sets his lantern down and steps in. The last shot is his lantern, her coat and one ring on still
  water.
- Its own checks went through contact sheets (grids of stills from every shot) before I saw
  either cut. The lighthouse glitch was a ring in the beam. Some things it left and named. The
  faces are crude up close, which is why v1 keeps the woman in silhouette and profile. The lyric
  engraved inside the pocket watch at 0:56 is barely readable in both cuts.

</details>
