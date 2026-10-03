---
id: "AO-031"
title: "Claude made a music video for my song and cast the lovers the wrong way round"
summary: "From one prompt, Claude built a 2:51 music video for BLACKWATER's love song in Blender and Godot, with no AI video: new models, 41 shots cut on bar lines, the lyrics set inside the scenes. It put the wrong person on the shore. Both cuts are below, playing in lockstep, with the one paragraph of notes that turned the first into the second."
date: 2026-10-03
status: "in-progress"
tags: ["claude-code", "blender", "godot", "gamedev", "lessons"]
series: ["blackwater"]
---

Claude made a whole music video for "Moonlight at the Waterline" from one prompt, and cast it
backwards: a woman waiting on the jetty, a man diving below. In the song it's the other way round.
**Five hours of careful work built on a casting choice nobody had asked it to make**, and the
second cut, three hours later, came from one paragraph of my notes.

The song is the slow 1960s ballad on the jukebox in [BLACKWATER](/ledger/blackwater-weekend/),
the one about waiting at the waterline for a diver who is late. Both cuts below were made in one
Claude Code session on 27 September. Neither uses AI video or gameplay footage: every model was
built new in Blender, and every frame was rendered by a script running inside the Godot game at a
fixed 24 frames a second.

## The prompt

This is what I typed, a little before one in the morning:

> Make a music video for moonlight at the waterline. Create brand new scenes and assets and
> render them in the blender, no gameplay capture and no AI video. Transcribe the lyrics and build
> the shot list from them, with every cut on a bar line and include the lyrics in the music video
> in a professional way so that they feel like part of the video instead of just captions.

It went on to ask for a director script, a clay previs with contact sheets, ElevenLabs sound
effects under the song, a −14 LUFS master, grade, letterbox and title cards.

Five hours later the session handed back a 2:51 video. It had transcribed the song with two
Whisper models and fixed the words they disagreed on by context ("coat" not "cold", "and sigh" not
"inside"). It measured the song at 62.07 BPM in 12/8, so a bar is 3.87 seconds, and built 41 shots
from bar numbers rather than by hand. It modelled a woman, a diver, a pale 16-metre eel with
paired green lights down its flanks, a cove with a lighthouse and a flooded cave. It placed 43
ElevenLabs effects on the frames where the director script logged them.

The lyrics never sit at the bottom of the frame. They get written in wet sand and taken by the
tide, hang along the guide line, show only where the diver's lamp shines, drift in a breath.

And the woman on the jetty came from a lore draft in the game's folder about a woman who waits.
The session said so in its summary. The clay previs came to me partway through. I didn't answer
until the finished cut.

## Both cuts, in lockstep

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

Both cuts share the song and the bar grid, so the same second is the same lyric in each. Clicking
a line sends both there.

## The notes

My reply, at 13:41 the same day, started with "Incredible!" and then listed what was wrong. The
line that mattered most was in the middle:

> BTW the lover on the surface is the guy, the diver is the girl. Also, whenever you depict the
> diver, I want it to be close up shots of her and her gear, never a full body shot to give the
> feeling of mystery because the lover is unsure.

The rest asked for the lyrics that "appear slightly out of view or do not appear when the singer
sings them" to be fixed, for "I see your oxygen bubbles rise" to be the peak of the song, starting
on her mask and climbing with the bubbles without ever showing the surface, and for the creature
to be "implied not shown", "more ominous than scary".

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

One change I hadn't asked for: v1's ending brought the diver back out of the sea, and v2's leaves
it open. In v2 a light rises under the water, maybe her lamp, comes closer, and
dims. He sets his lantern down and steps in. The last shot is his lantern, her coat, and one ring
on still water.

## "Out of view" became a test

**The note I expected to be the vaguest was the one that got fixed most completely, because the
session turned it into a number.** It added a check to the director script: when each word is
sung, it has to be fully inside the 2.39:1 frame and readable within 0.4 seconds. The script logs
every word it draws, frame by frame, and `lyric_audit.py` compares that against the word timings
from the transcription.

The first render of the revision failed 58 of the 148 sung words. The fixes were a faster fade-in,
a higher minimum brightness for words lit only by the lamp or the lighthouse, words that ride with
the camera in moving shots, and lines that carry across a cut when a word lands right on it. The
next renders failed 8, then 6, then none.

The bubble line got the most work. In v2 it's one continuous take: her mask, gold bubbles bursting
as she breathes out, the camera climbing with the column out of the dark as they turn silver-blue,
and the last bubble dissolving into the moon before the camera comes down to him on the jetty.

<ao-compare cols="3" aspect="2.39/1">
<figure><img src="/media/moonlight-two-cuts/previs_106.webp" alt="Clay previs at 1:46: a clay diver seen from below, the lyric word see beside it, and a burned-in label reading S27 His bubbles rise, bar 27." loading="lazy"><figcaption><b>Clay previs · 1:46</b><span class="ao-meta">v1's animatic; its burned-in label still reads "His bubbles rise"</span></figcaption></figure>
<figure><img src="/media/moonlight-two-cuts/v1_106.webp" alt="v1 at 1:46: the diver from below in green haze, rendered with brass gear." loading="lazy"><figcaption><b>v1 · 1:46</b><span class="ao-meta">"I see your oxygen bubbles rise"</span></figcaption></figure>
<figure><img src="/media/moonlight-two-cuts/v2_106.webp" alt="v2 at 1:46: close on the diver's mask from below, gold bubbles rising past her helmet lamp." loading="lazy"><figcaption><b>v2 · 1:46</b><span class="ao-meta">the same bar, rebuilt as one take</span></figcaption></figure>
<figure class="wide"><img src="/media/moonlight-two-cuts/dissolve_check.webp" alt="Five frames across one bar line: bubbles and the lyric rise in the dark; the last bubble sits where the moon appears and becomes it." loading="lazy"><figcaption><b>The session's own dissolve check</b><span class="ao-meta">five frames across the bar line at 1:52.1: her last bubble dissolves into the moon at the same spot · v2, 27 Sep</span></figcaption></figure>
</ao-compare>

It caught other things on its own contact sheets before I saw either cut: cameras sitting inside
the woman's body, a ring artifact from the lighthouse beam, untextured cave rock, the creature
glowing green all over. Some it left and named: the faces are crude up close, which is why v1
keeps her in silhouette and profile, and the lyric engraved inside the pocket watch at 0:56 is
barely legible in both.

## What it cost, and what came after

The first cut took 5 hours 6 minutes. The revision took 2 hours 54 minutes, and partway through
it the laptop's C: drive filled to zero and the assembly died. The session deleted about 12 GB of
its own superseded renders, all regenerable from its scripts, and made the assembler clean up
after itself.

The same turn also ran a 30-second test of the song through MiniMax-H3, a local video model, using
the Godot frames as a motion reference; I asked for the whole song that way afterwards. None of
that is shown here: H3's licence excludes the United States, for the model and its output.

Early this morning I started a fourth version. The brief I pasted calls v2 and the H3 cut "the
bar to beat, not the ceiling", and its story section opens: "He waits on the shore; she is the
diver. The singer is the man waiting."

**The first prompt asked for every cut on a bar line and every lyric inside the world, and left
out who was singing.** The session filled that gap from the nearest note it could find, and
built five careful hours on it. Now it's the first line of the brief.
