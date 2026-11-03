---
id: "AO-047"
title: "Claude rebuilds my 30-second showreel in Blender"
summary: "I asked Claude to remake the 30-second showreel on my Projects page in Blender, a 3D program. Both cuts side by side, why the first barely used Blender, and how two Claude sessions shared one GPU."
date: 2026-10-14
topic: "agents"
project: []
preview:
  verdict: "Took my words literally"
  takeaway: "Asked to render it in Blender, Claude only used Blender to add new music to frames drawn by the old reel's code. Saying what Blender was for got a real 3D reel."
  points:
    - "Claude's own report said the first cut was still drawn by the old reel's code. Nothing was hidden."
    - "It shared the laptop's one GPU with another Claude session making my AI TV series. That one said yes once and no once."
    - "It blamed the other session's renders for a slowdown. They ran on the CPU, and the other Blender on the GPU was its own."
  image: "/media/previews/showreel-rebuilt.webp"
  alt: "The Wallpaper Breaker shot from both cuts: a flat full-screen card on the left, a 3D monitor in a dark space on the right"
---

On 12 October I asked Claude to update the 30-second showreel at the top of my
[Projects page](/projects/), with AI music from ElevenLabs, and to render it in Blender, the
free 3D program. The first cut was live 22 minutes later. Its frames came from the same flat 2D
animation code as my September reel, and Blender only joined them to the music.

When I pointed at what it had skipped, it built a real 3D scene in Blender, live about an hour
and a half later. **So when I name a tool, I should say what I want the tool for.**

- **The first cut took my words literally.** I said render it in Blender, and a render is what I
  got. Claude's own report said so.
- **Saying what Blender was for fixed it.** My second message was the same length as the first.
  The next cut was one 3D scene of 655 objects, cut to the beat.
- **Two Claude sessions shared one graphics card.** The other one, making my TV series, let the
  showreel go next once, and said no once so neither job ran out of memory.
- **Claude blamed the wrong renders for a slowdown.** The ones it named ran on the processor,
  and the other Blender on the card was its own.

## The first cut

At 14:14 I typed:

> Could you update the highlight reel on my website and github. I want to it be on what I am
> currently working on [...] Also, could you use elevenlabs for the music and render it using
> the blender mcp.

The Blender MCP is a connector that lets Claude drive Blender. I also told it what to do if
another session had the graphics card (the GPU). It should say this is high priority and won't
take long, do the work, then tell them when it's done.

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
<figcaption><b>First cut · live 14:36, 12 Oct</b><span class="ao-meta">frames drawn by the September reel's code, joined to new ElevenLabs music in Blender · 30 s, shrunk to 720p for this post, one panel blurred at 0:21</span></figcaption>
</ao-shots>

It's tidy. Thirteen shots of what I'm working on, including
[my course on building with AI](/courses/the-hidden-curriculum/),
[my fighting game](/ledger/storm-bell-fighter/) and [my wallpaper app](/ledger/wallpapers-nobody-saw/).
Claude's report said exactly how it was made:

> the animation is still drawn by the existing showreel code. Blender, driven through the
> Blender MCP, combined those frames with the music and rendered the final videos.

It even caught a wrong number in its first render, 46 blog posts where my site listed 45, and
pushed a fix.

## What I said back

At 14:58 I answered:

> This is good but it has too much of Jefrie and Bloodtailor and the music sucks. also, I think
> you copied the graphics from the original when the blender MCP opened a lot of opportunity to
> you.

Jefrie and BloodTailor are my original characters. I also asked for one oil painting instead of
three, Claude's copy of a courtroom painting from [its oil-painting test](/ledger/claude-paints-in-oil/).

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
<figcaption><b>Second cut · live 16:32, 12 Oct</b><span class="ao-meta">one Blender scene of 655 objects, 900 frames at 30 a second, built by an 827-line script through the Blender MCP · the same file as the reel on my Projects page</span></figcaption>
</ao-shots>

This time the whole thing is built in Blender. Every project gets its own spot in one dark 3D
space, and the camera whips between them with motion blur and glow. Claude picked a track at 112
beats a minute and gave each project shot one bar of it, four beats or 2.14 seconds.

<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/showreel-rebuilt/v2-oil.webp" alt="v2 oil shot: a full-screen painting of BloodTailor and Jefrie with a title over it" loading="lazy"><figcaption><b>First cut · oil paintings</b><span class="ao-meta">0:09.5 · a flat card over the painting nine Claudes made</span></figcaption></figure>
<figure><img src="/media/showreel-rebuilt/v3-oil.webp" alt="v3 oil shot: the courtroom study on a framed canvas lit in a dark space" loading="lazy"><figcaption><b>Second cut · oil painting</b><span class="ao-meta">0:10.9 · the courtroom copy on a framed canvas, its time-lapse playing</span></figcaption></figure>
<figure><img src="/media/showreel-rebuilt/v2-wallpaper.webp" alt="v2 Wallpaper Breaker shot: a full-screen wallpaper with a title card" loading="lazy"><figcaption><b>First cut · Wallpaper Breaker</b><span class="ao-meta">0:14 · the picture fills the frame, title in the corner</span></figcaption></figure>
<figure><img src="/media/showreel-rebuilt/v3-wallpaper.webp" alt="v3 Wallpaper Breaker shot: a wallpaper on a 3D monitor beside the title" loading="lazy"><figcaption><b>Second cut · Wallpaper Breaker</b><span class="ao-meta">0:12.9 · the wallpaper on a monitor in the scene, rain falling in front of it</span></figcaption></figure>
</ao-compare>

Two things went wrong, and Claude reported both. The first render went black at every cut,
because mid-whip the camera saw empty space. It moved the projects closer, and a few dark frames
are left. It also wrote over the music the cuts were timed to, so it made new tracks and used the
one that fit best.

Claude can't hear, and it said so. Here are both soundtracks at the same loudness:

<ao-listen ref="v2">
<figure data-id="v2"><audio controls preload="none" src="/media/showreel-rebuilt/score-v2.mp3"></audio><img src="/media/showreel-rebuilt/score-v2.webp" alt="Spectrogram of the v2 soundtrack" loading="lazy"><figcaption><b>First cut's music</b><span class="ao-meta">ElevenLabs, rebuilt section by section to 30 s</span></figcaption></figure>
<figure data-id="v3"><audio controls preload="none" src="/media/showreel-rebuilt/score-v3.mp3"></audio><img src="/media/showreel-rebuilt/score-v3.webp" alt="Spectrogram of the v3 soundtrack" loading="lazy"><figcaption><b>Second cut's music</b><span class="ao-meta">ElevenLabs, cinematic electronic, 112 beats a minute, shifted 1.09 s to line up with the cuts</span></figcaption></figure>
<figcaption><b>The two reels' soundtracks</b><span class="ao-meta">taken from the published videos and set to the same loudness. As published, the second one was slightly louder.</span></figcaption>
</ao-listen>

## Sharing the GPU with another session

My laptop has one 8 GB graphics card, and my Claude sessions book it through a queue. The other
session was making [Earthlight](/ledger/earthlight/), Episode 2 of
[my AI TV series](/courses/i-love-my-evening-television/). It let the showreel go next once. The
second time it said no. Its own image jobs would have kept hitting the card during the Blender
render, and the card could have run out of memory.

<details><summary>The GPU hand-over, minute by minute</summary>

Both transcripts recorded the conversation, so here it is from both sides. A lease is a
session's booking of the GPU in the queue.

<ao-timeline lanes="a:Me|r:Showreel session|e:Episode session">
<ol>
<li data-lane="a"><time>12 Oct 14:58</time><p>Ask for less of my characters, different music, and the Blender scene it skipped.</p></li>
<li data-lane="r"><time>15:08</time><p>Scene built. Test stills need the GPU, and the queue puts it about 24 minutes behind a 25-minute render. Sends: <q>Aaron asked me to tell you that his showreel render is HIGH PRIORITY and won't take long.</q></p></li>
<li data-lane="e"><time>15:09</time><p><q>agreed, you go next. I won't interrupt or extend lease #673.</q> Its own render finishes first.</p></li>
<li data-lane="r"><time>15:27</time><p>Gets the GPU. Test stills, fixes, then the full 900 frames in Blender in the background.</p></li>
<li data-lane="r"><time>15:45</time><p>All 900 frames done, under a second each. Releases the GPU and says so. Then finds the dips to black.</p></li>
<li data-lane="r"><time>15:49</time><p>Asks again. One re-render, 13 to 16 minutes. Could the other session release its lease after the current image edit?</p></li>
<li data-lane="e"><time>15:50</time><p>No. The lease belongs to a background agent running a script of 8 to 12 image edits. Released from outside, the script would keep sending jobs to the GPU during the Blender render, <q>and on 8 GB that's likely to OOM one or both.</q> OOM means run out of memory. The showreel stays next in line.</p></li>
<li data-lane="r"><time>16:07</time><p>Gets the GPU and starts the re-render.</p></li>
<li data-lane="r"><time>16:18</time><p>The render slows to about 2.5 s a frame. Sees two more Blender processes started at 16:17 and 7.4 of 8 GB of video memory in use, and asks the other session to hold them.</p></li>
<li data-lane="e"><time>16:19</time><p><q>those two are Cycles CPU renders, not GPU.</q> That means Blender rendering on the processor. Drops them to idle priority. The only other Blender on the GPU is <q>an interactive Blender GUI open since 14:24, which isn't mine.</q> The CPU is at 100% with about eight of its crews working, which it thinks is the slowdown.</p></li>
<li data-lane="r"><time>16:26</time><p>Re-render done. Releases the GPU and tells the other session.</p></li>
<li data-lane="r"><time>16:32</time><p>Second cut pushed to the site.</p></li>
<li data-lane="a"><time>16:40</time><p>Ask whether it told the other session the GPU and CPU are free now. Answer: <q>Partly.</q> It had said the GPU, not the CPU, and was still encoding at the time. It sends a follow-up.</p></li>
</ol>
</ao-timeline>

Claude's final report to me said the other session had started two renders "anyway, which
slowed mine down". The slowdown was real, but those renders ran on the processor. The Blender
window open since 14:24 was the showreel session's own. That's the minute it opened Blender on
my desktop, because the Blender MCP's background mode couldn't find the program.
[The Earthlight post](/ledger/earthlight/) tells the same wait from the other session's side.

</details>

The whole session took 2 hours 25 minutes on one Claude agent (Opus 5.5), $14.36 at Anthropic's
pay-per-use prices.
