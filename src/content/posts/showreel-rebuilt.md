---
id: "AO-047"
title: "I asked for my showreel to be made in Blender. The first cut only used Blender to glue the old one together"
summary: "Claude rebuilt my 30-second showreel with ElevenLabs music and a Blender render, and the first cut was live in 22 minutes: the September animation with new content, stitched in Blender's sequencer. After I said so, the second cut was a real 3D scene of 655 objects, and to render it Claude had to borrow the laptop's one GPU from another session, twice."
date: 2026-10-14
status: "shipped"
tags: ["claude-code", "blender", "elevenlabs", "animation", "agents"]
series: ["agent-runs"]
preview:
  verdict: "Second cut was the real one"
  takeaway: "Asked to use a tool, Claude used the least of it that met the words. Naming the opportunity it skipped got a different reel in 98 minutes."
  points:
    - "v2: the old canvas animation re-rendered with new content; Blender only joined the frames to the music."
    - "v3: 655 objects, 900 frames, a cut on every downbeat of a 112 BPM score, the camera whipping between stations."
    - "The other session refused one GPU hand-over: its batch would have hit an 8 GB card at the same time as Blender."
  image: "/media/previews/showreel-rebuilt.webp"
  alt: "The Wallpaper Breaker shot from both cuts: a flat full-screen card on the left, a 3D monitor in a dark space on the right"
---

On Monday I asked Claude to update the showreel on my Projects page, and to render it with the
Blender MCP. Twenty-two minutes later a new reel was live. It had new content and new
ElevenLabs music, and Blender had rendered it, but every frame was still drawn by the canvas
code that made the September reel. Blender had only joined those frames to the music.

**Asked to use a tool, Claude used the least of it that met the words.** I pointed at what it
had skipped, and an hour and a half later there was a different reel: a 3D scene built in
Blender, one station per project, with the camera whipping between them on the beat.

Both cuts are below, with the shots laid out under each so you can jump around and compare
them yourself.

## What I asked for

At 14:14 on 12 October I typed:

> Could you update the highlight reel on my website and github. I want to it be on what I am
> currently working on [...] Also, could you use elevenlabs for the music and render it using
> the blender mcp.

I also asked it to leave out a few personal things, and told it what to do if another session
was holding the GPU: say this is high priority and won't take long, do the work, then tell them
when it's finished.

## The first cut

<ao-shots>
<video controls playsinline preload="metadata" poster="/media/showreel-rebuilt/v2-poster.webp" src="/media/showreel-rebuilt/reel-v2.mp4"></video>
<ol>
<li data-t="0:00"><img src="/media/showreel-rebuilt/v2-s01.webp" alt="Title card" loading="lazy">Title</li>
<li data-t="0:04"><img src="/media/showreel-rebuilt/v2-s02.webp" alt="The Hidden Curriculum card" loading="lazy">The course</li>
<li data-t="0:06"><img src="/media/showreel-rebuilt/v2-s03.webp" alt="Agent counter card" loading="lazy">Agents</li>
<li data-t="0:08"><img src="/media/showreel-rebuilt/v2-s04.webp" alt="Oil paintings card" loading="lazy">Oil paintings</li>
<li data-t="0:11"><img src="/media/showreel-rebuilt/v2-s05.webp" alt="Storm Bell Fighter card" loading="lazy">Storm Bell Fighter</li>
<li data-t="0:13"><img src="/media/showreel-rebuilt/v2-s06.webp" alt="Wallpaper Breaker card" loading="lazy">Wallpaper Breaker</li>
<li data-t="0:15"><img src="/media/showreel-rebuilt/v2-s07.webp" alt="Explainers card" loading="lazy">Explainers</li>
<li data-t="0:17"><img src="/media/showreel-rebuilt/v2-s08.webp" alt="Laptop GPU image wall" loading="lazy">Image wall</li>
<li data-t="0:19"><img src="/media/showreel-rebuilt/v2-s09.webp" alt="Characters card" loading="lazy">Characters</li>
<li data-t="0:21"><img src="/media/showreel-rebuilt/v2-s10.webp" alt="Playback Lens card" loading="lazy">Playback Lens</li>
<li data-t="0:23"><img src="/media/showreel-rebuilt/v2-s11.webp" alt="The ledger card" loading="lazy">The ledger</li>
<li data-t="0:25"><img src="/media/showreel-rebuilt/v2-s12.webp" alt="Number cards" loading="lazy">Numbers</li>
<li data-t="0:27"><img src="/media/showreel-rebuilt/v2-s13.webp" alt="Tea house outro" loading="lazy">Outro</li>
</ol>
<figcaption><b>v2 · live 14:36, 12 Oct</b><span class="ao-meta">canvas frames from the September reel's code, joined to an ElevenLabs track in Blender's sequencer · 30 s, re-encoded to 720p for this post, one panel blurred at 0:21</span></figcaption>
</ao-shots>

It's tidy. Thirteen shots, the course rebuild, the oil paintings, the fighting game, the
ledger, number cards at the end. Claude's own report said exactly how it was made:

> the animation is still drawn by the existing showreel code. Blender, driven through the
> Blender MCP, combined those frames with the music and rendered the final videos.

So nothing was hidden. It even caught one of its own numbers: the first render said 46 posts,
the live site listed 45 (the 46th file was another session's unpublished draft), and it
re-rendered and pushed again. The music had a problem of its own: asked for 30 seconds,
ElevenLabs sent back 84, and the track was rebuilt section by section to fit.

At 14:58 I answered:

> This is good but it has too much of Jefrie and Bloodtailor and the music sucks. also, I think
> you copied the graphics from the original when the blender MCP opened a lot of opportunity to
> you.

I also asked for one oil painting instead of three: the courtroom master study from
[AO-038](/ledger/claude-paints-in-oil/).

## The second cut

<ao-shots>
<video controls playsinline preload="metadata" poster="/media/showreel-rebuilt/v3-poster.webp" src="/media/showreel-rebuilt/reel-v3.mp4"></video>
<ol>
<li data-t="0:00"><img src="/media/showreel-rebuilt/v3-s01.webp" alt="Title in 3D" loading="lazy">Title</li>
<li data-t="0:05.38"><img src="/media/showreel-rebuilt/v3-s02.webp" alt="Course map on a framed screen" loading="lazy">The course</li>
<li data-t="0:07.52"><img src="/media/showreel-rebuilt/v3-s03.webp" alt="76 agent orbs in rings" loading="lazy">Agents</li>
<li data-t="0:09.67"><img src="/media/showreel-rebuilt/v3-s04.webp" alt="Courtroom study on a framed canvas" loading="lazy">Oil painting</li>
<li data-t="0:11.81"><img src="/media/showreel-rebuilt/v3-s05.webp" alt="Wallpaper Breaker on a 3D monitor" loading="lazy">Wallpaper Breaker</li>
<li data-t="0:13.95"><img src="/media/showreel-rebuilt/v3-s06.webp" alt="Two explainers on tilted screens" loading="lazy">Explainers</li>
<li data-t="0:16.09"><img src="/media/showreel-rebuilt/v3-s07.webp" alt="Playback Lens timeline with hits lighting up" loading="lazy">Playback Lens</li>
<li data-t="0:18.24"><img src="/media/showreel-rebuilt/v3-s08.webp" alt="BloodTailor title card" loading="lazy">BloodTailor</li>
<li data-t="0:20.38"><img src="/media/showreel-rebuilt/v3-s09.webp" alt="Jefrie title card" loading="lazy">Jefrie</li>
<li data-t="0:22.52"><img src="/media/showreel-rebuilt/v3-s10.webp" alt="The ledger as falling cards" loading="lazy">The ledger</li>
<li data-t="0:24.67"><img src="/media/showreel-rebuilt/v3-s11.webp" alt="Tea house outro with petals" loading="lazy">Outro</li>
</ol>
<figcaption><b>v3 · live 16:32, 12 Oct</b><span class="ao-meta">one Blender scene, 655 objects, 900 frames at 30 fps, built by an 827-line script through the Blender MCP · the file on the Projects page, unchanged</span></figcaption>
</ao-shots>

This time the script built the whole thing in Blender: every project gets a station in one dark
space, and the camera whips from one to the next with motion blur and glow. Claude picked a
112 BPM score and let it set the edit: a 5.4-second title, nine project shots of one bar each
(2.14 seconds), and a 5.3-second outro.

Two of the same subjects, side by side:

<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/showreel-rebuilt/v2-oil.webp" alt="v2 oil shot: a full-screen painting of BloodTailor and Jefrie with a title over it" loading="lazy"><figcaption><b>v2 · oil paintings</b><span class="ao-meta">0:09.5 · canvas card over the nine-Claudes painting</span></figcaption></figure>
<figure><img src="/media/showreel-rebuilt/v3-oil.webp" alt="v3 oil shot: the courtroom study on a framed canvas lit in a dark space" loading="lazy"><figcaption><b>v3 · oil painting</b><span class="ao-meta">0:10.9 · the courtroom study on a framed canvas, its time-lapse playing</span></figcaption></figure>
<figure><img src="/media/showreel-rebuilt/v2-wallpaper.webp" alt="v2 Wallpaper Breaker shot: a full-screen wallpaper with a title card" loading="lazy"><figcaption><b>v2 · Wallpaper Breaker</b><span class="ao-meta">0:14 · full-frame image, title in the corner</span></figcaption></figure>
<figure><img src="/media/showreel-rebuilt/v3-wallpaper.webp" alt="v3 Wallpaper Breaker shot: a wallpaper on a 3D monitor beside the title" loading="lazy"><figcaption><b>v3 · Wallpaper Breaker</b><span class="ao-meta">0:12.9 · the wallpaper on a monitor in the scene, rain falling in front of it</span></figcaption></figure>
</ao-compare>

Two things went wrong on the way, and Claude reported both. The first full render dipped to
black at every cut: mid-whip, the camera was looking at empty space between stations. It moved
the stations closer, so a whip smears past the next project instead, and rendered again; a few
dark frames remain at the fade-in and at two cuts. And it overwrote the first music take, the
one the cuts were timed to, while generating music for the 15-second version. ElevenLabs doesn't
keep generated music in its history, so it made new takes and used the one that fit the cuts
best once shifted by 1.09 seconds.

Claude can't hear, which it said itself, so here are both soundtracks, matched in loudness:

<ao-listen ref="v2">
<figure data-id="v2"><audio controls preload="none" src="/media/showreel-rebuilt/score-v2.mp3"></audio><img src="/media/showreel-rebuilt/score-v2.webp" alt="Spectrogram of the v2 soundtrack" loading="lazy"><figcaption><b>v2 · first cut's score</b><span class="ao-meta">ElevenLabs music, rebuilt section by section to 30 s</span></figcaption></figure>
<figure data-id="v3"><audio controls preload="none" src="/media/showreel-rebuilt/score-v3.mp3"></audio><img src="/media/showreel-rebuilt/score-v3.webp" alt="Spectrogram of the v3 soundtrack" loading="lazy"><figcaption><b>v3 · second cut's score</b><span class="ao-meta">ElevenLabs, cinematic electronic, 112 BPM, shifted 1.09 s to the cuts</span></figcaption></figure>
<figcaption><b>The two reels' soundtracks</b><span class="ao-meta">taken from the published videos, both normalised to -16 LUFS (as published: -12.5 and -11.7)</span></figcaption>
</ao-listen>

## Borrowing the GPU

The laptop has one 8 GB GPU, and another session was using it: a long run making the second
episode of a show I'm working on. The two sessions have a queue for it, and they talked through
messages. Both transcripts recorded the conversation, so here it is from both sides.

<ao-timeline lanes="a:Me|r:Showreel session|e:Episode session">
<ol>
<li data-lane="a"><time>12 Oct 14:58</time><p>Ask for less of my characters, different music, and the Blender scene it skipped.</p></li>
<li data-lane="r"><time>15:08</time><p>Scene built. Test stills need the GPU; queued about 24 minutes behind a 25-minute render. Sends: <q>Aaron asked me to tell you that his showreel render is HIGH PRIORITY and won't take long.</q></p></li>
<li data-lane="e"><time>15:09</time><p><q>agreed, you go next. I won't interrupt or extend lease #673.</q> Its own render finishes first.</p></li>
<li data-lane="r"><time>15:27</time><p>Gets the GPU. Test stills, fixes, then the full 900 frames in background Blender.</p></li>
<li data-lane="r"><time>15:45</time><p>All 900 frames done, under a second each. Releases the GPU and says so. Then finds the dips to black.</p></li>
<li data-lane="r"><time>15:49</time><p>Asks again: one re-render, 13 to 16 minutes. Could the other session release its lease after the current image edit?</p></li>
<li data-lane="e"><time>15:50</time><p>No: the lease belongs to a background agent running a script of 8 to 12 image edits. Released from outside, the script would keep sending jobs to the GPU during the Blender render, <q>and on 8 GB that's likely to OOM one or both.</q> The showreel stays next in line.</p></li>
<li data-lane="r"><time>16:07</time><p>Gets the GPU and starts the re-render.</p></li>
<li data-lane="r"><time>16:18</time><p>Render slowed to about 2.5 s a frame. Sees two more Blender processes started at 16:17 and 7.4 of 8 GB of video memory in use; asks the other session to hold them.</p></li>
<li data-lane="e"><time>16:19</time><p><q>those two are Cycles CPU renders, not GPU.</q> Drops them to idle priority. The only other Blender on the GPU is <q>an interactive Blender GUI open since 14:24, which isn't mine.</q> The CPU is at 100% with about eight of its crews working, which it thinks is the slowdown.</p></li>
<li data-lane="r"><time>16:26</time><p>Re-render done. Releases the GPU and tells the other session.</p></li>
<li data-lane="r"><time>16:32</time><p>v3 pushed to the site.</p></li>
<li data-lane="a"><time>16:40</time><p>Ask whether it told the other session the GPU and CPU are free now. Answer: <q>Partly.</q> It had said the GPU, not the CPU, and was still encoding at the time. It sends a follow-up.</p></li>
</ol>
</ao-timeline>

The Blender window open since 14:24 was the showreel session's own: that is the minute it
opened Blender on my desktop, because the MCP's background mode couldn't find the program. Its
report to me at the end said the other session had started two renders "anyway, which slowed
mine down". The slowdown was real, but the renders it blamed were on the CPU, and the other
Blender on the GPU was its own.

The session ran 2 hours 25 minutes from my first prompt to the follow-up, on Opus 5.5, with no
subagents: $14.36 at API list prices.

## What I take from it

The first cut wasn't lazy, and it wasn't hiding anything. It answered the request with the
smallest change that satisfied it, and described that change honestly. "Render it using the
Blender MCP" was satisfied by a render. What I meant was "now that you have a 3D program, make
something you couldn't make in a canvas", and I only said that the second time.

**When I name a tool, I should name what I want the tool for.** The second prompt was the same
length as the first. It just said what the opportunity was.
