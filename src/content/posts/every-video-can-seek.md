---
id: "AO-042"
title: "For two months no video on my site could skip ahead, and the agent that noticed wrote a workaround"
summary: "Cloudflare's asset server answers a request for part of a file with the whole file, so no video here could jump past what it had already downloaded. This blog's daily agent measured that on 3 October, worked around it and wrote a warning, then built the next seeking feature on the same workaround. A 154-line Worker fixed it on 7 October."
date: 2026-10-08
status: "shipped"
tags: ["claude-code", "agents", "cloudflare", "debugging", "blog"]
series: ["agent-runs"]
preview:
  verdict: "Worked around, then fixed"
  takeaway: "When an agent finds a problem below the thing it was asked to build, it patches its own piece and leaves a note, so check the layer underneath."
  points:
    - "Asked for 1,000 bytes of a picture, the asset server still sends all 123 KB. Until 7 Oct it did that to every video."
    - "The fix sends media through a 154-line Worker. Jumping 24 MB into the largest lesson took 0.67 s."
    - "The audit also kept two synced videos in step by nudging speed instead of re-seeking, which had frozen the second cut."
  image: "/media/previews/every-video-can-seek.webp"
  alt: "The fighting game embedded in a post, dimmed behind a Resume button and the words Paused when you scrolled away"
---

From the first video on this site in August until 7 October, you could not skip ahead in any of
them. A browser jumps around in a video by asking the server for one piece of the file, and the
server that hosts this site answered every such request with the whole file instead, so a seek
bar only worked inside what had already downloaded. Drag past that and playback went back to 0.

**The agent that writes this blog every morning found the problem on 3 October, wrote a
workaround for its own component and a warning in the rules file, and the next morning built
another component on the same workaround.** I found it broken on the 7th. The fix was 154 lines.

You can check the server's behaviour yourself. Both requests below ask for a small piece of a
file. The first goes through the fix; the second is a picture, which still goes straight to the
asset server, which still does what it did to every video.

<ao-fetch>
<ol>
<li data-url="/courses/the-hidden-curriculum/lessons/00-05-how-llms-work-just-enough/lesson.mp4" data-range="bytes=24000000-24000999">1,000 bytes from 24 MB into a 25.1 MB lesson video</li>
<li data-url="/media/every-ai-film-so-far/bw-v2.webp" data-range="bytes=1000-1999">1,000 bytes of a 123 KB picture from another post</li>
</ol>
<figcaption><b>Sent from your browser when you press the button</b><span class="ao-meta">a 206 answer is the piece you asked for; a 200 is the whole file, Range ignored. The same two with curl on 8 Oct, while this was written: 206, 1,000 bytes, and 200, 123,380 bytes</span></figcaption>
</ao-fetch>

## The order it happened in

<ao-timeline lanes="s:The site|d:Daily post agent|a:Me|f:Audit session">
<ol>
<li data-lane="s"><time>2 Aug</time><p>The site starts serving from Cloudflare Workers static assets (commit bb433d4).</p></li>
<li data-lane="s"><time>7 Aug</time><p>The first video goes up, in AO-006.</p></li>
<li data-lane="d"><time>3 Oct 09:14</time><p>AO-031 ships <code>&lt;ao-cues&gt;</code>: two cuts of a music video play in lockstep beside the lyrics, and clicking a lyric sends both there.</p></li>
<li data-lane="d"><time>3 Oct 09:27</time><p>While checking it live, the agent measures a request for part of a video coming back <code>200</code> with the whole file. It makes <code>&lt;ao-cues&gt;</code> download both cuts in full before a long jump, and adds to the rules: <q>fix it at the host (a Worker route that answers ranges) before building anything else that jumps around in a long video.</q></p></li>
<li data-lane="d"><time>4 Oct 09:15</time><p>AO-034 ships <code>&lt;ao-transcript&gt;</code>: click a line of a lesson's transcript and the video plays from there. Its four videos are 8.3 to 25.1 MB. Same workaround: fetch the whole file, then jump.</p></li>
<li data-lane="a"><time>7 Oct 00:06</time><p>I ask for every special feature to be checked: <q>for 3 of the four videos in the post, the button doesn't work, not only that you cannot navigate through the videos at all</q>.</p></li>
<li data-lane="f"><time>7 Oct 01:04</time><p>Three commits on a branch: the Worker, one player at a time across every post, and a remuxed clip. Tested against a local copy of the real deploy.</p></li>
<li data-lane="a"><time>7 Oct 02:33</time><p><q>yes push it</q></p></li>
<li data-lane="f"><time>7 Oct 02:36</time><p>Live: part-of-a-file requests answer <code>206</code>, the bytes match the files exactly, and a jump 24 MB into the largest lesson answers in 0.67 s.</p></li>
</ol>
</ao-timeline>

The workaround was a reasonable patch for one music video of a few megabytes. For a 25 MB lesson it
meant a reader who clicked a transcript line had to wait for the whole file before anything
moved, and for three of the four videos in AO-034, when I clicked, nothing did. The rule the
agent wrote was right. It was addressed to whoever came next, and the next run was the same job
with a post due that morning. It starts every day with no memory except the rules file. It read
the warning, and its commit message says it used the workaround because the host ignores ranges.

**An agent asked to build a feature fixes the feature. The thing underneath it gets a comment.**

## The fix

The asset server ignores the `Range` header (the "send me bytes X to Y" part of a request), and
there's no setting to change that. So the audit session put a small Worker in front of the media
files only: `.mp4`, `.mp3` and the other audio and video extensions go to it first, and pictures
and pages never touch it. It asks the asset server for the file, skips the bytes before the range,
stops after the last one, and answers `206` with the piece.

A `206` has to state the file's full length, and inside a Worker the asset server doesn't say. So
the build now writes every media file's length into `/media-sizes.json`, and the Worker reads it
once. The first version kept whole files in Cloudflare's cache instead; the session replaced it
before shipping, because a page of several 20 MB videos could have run a Worker past its 128 MB of
memory.

You can try it on a real lesson here. Click a line near the end and the video should start there
within a second or so, without downloading the 25 MB before it:

<ao-transcript find="agent|cloud|cache">
<figure><video controls playsinline preload="none" poster="/media/lessons-sent-back/v2-0005.webp" src="/courses/the-hidden-curriculum/lessons/00-05-how-llms-work-just-enough/lesson.mp4"><track kind="captions" srclang="en" label="English" src="/courses/the-hidden-curriculum/lessons/00-05-how-llms-work-just-enough/captions.vtt"></video><figcaption><b>Lesson 00.05 · How AI models work today</b><span class="ao-meta">19:54 · 25.1 MB · the same file as in AO-034 and on the course page</span></figcaption></figure>
</ao-transcript>

## What else the audit found

I'd listed six posts that misbehaved. The seek problem explained most of them, and the rest were
the kind of thing you only notice reading the blog as a reader rather than as the agent who built
one piece of it:

- **Two videos meant to play in step drifted apart, then froze.** `<ao-cues>` corrected the
  second video by seeking it to the first several times a second. Each seek made the browser
  throw away what it had buffered, so the second cut stalled for good. It now nudges the second
  video's speed by up to 8% until they line up (within 0.04 s in testing), and only seeks when
  they're more than 0.6 s apart. One more bug turned up in the rewrite: if both stalled at once,
  each waited for the other to start playing, and neither ever did.
- **Several videos could play at once.** Now starting any player pauses every other one on the
  page. A silent loop pauses when you scroll past it and resumes when you come back; anything with
  sound keeps playing, with a bar at the bottom of the window that says what it is.
- **The fighting game in AO-024 kept running after you scrolled away**, music included, with no way
  to stop it short of leaving the page. It now pauses when scrolled away, when the tab is hidden or
  when anything else plays, and a Stop game button unloads it.
- **I wanted to click a contact sheet, zoom into it and page through its group.** Every picture
  in every post now opens in a viewer that zooms, pans and pages through the post's other
  pictures in reading order.

<ao-compare cols="3" aspect="4/3">
<figure><img src="/media/every-video-can-seek/now-playing-bar.webp" alt="A post scrolled past its video, with a bar at the bottom of the window naming the lesson still playing, its time, and Back to it and close buttons" loading="lazy"><figcaption><b>Sound keeps playing, and says so</b><span class="ao-meta">AO-034 · 12:15 into the 19:54 lesson</span></figcaption></figure>
<figure><img src="/media/every-video-can-seek/game-paused.webp" alt="The Storm Bell fighting game embedded in a post, dimmed, with the words Paused when you scrolled away and a Resume button, and Fullscreen and Stop game buttons under it" loading="lazy"><figcaption><b>The game, paused by scrolling</b><span class="ao-meta">AO-024 · frames and audio held, not restarted</span></figcaption></figure>
<figure><img src="/media/every-video-can-seek/two-cuts-in-step.webp" alt="Two cuts of the Moonlight at the Waterline music video side by side above a scrolling list of timed lyrics, with one Play button and a Sound button for each cut" loading="lazy"><figcaption><b>Two cuts, one clock</b><span class="ao-meta">AO-031 · one Play, sound from one cut at a time</span></figcaption></figure>
</ao-compare>

Those three are the audit session's own screenshots from 7 October, taken in Claude's browser
pane on a local copy of the site running the real Worker. The session took 2 hours 30 minutes
and 334 tool calls, $35 at API list prices; I'm on a flat subscription.

## Why the earlier checks passed

Every one of these components was checked in a browser before it shipped. The audit session left
two notes in the rules file about why that wasn't enough. The local dev server answers range
requests by itself, so a seek tested there works and hides the problem; media have to be tested
against the built site with the real Worker. And Claude's browser pane only draws the page when
it's being shown or screenshotted, so in between, animation frames don't run and the browser
never reports what's on screen: a video you've just scrolled to still counts as off screen. A
component can pass every check there and fail for a person, or the other way round.

**Testing in the environment you have isn't the same as testing in the one your reader has**,
and for this site the difference was one header that no test looked at. This post adds
`<ao-fetch>`, the box at the top, to the site, so the next claim about what a server does can be
checked by whoever reads it, from wherever they are.
