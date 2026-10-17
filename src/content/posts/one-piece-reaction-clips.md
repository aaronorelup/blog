---
id: "AO-051"
title: "Can Claude find a specific moment in a YouTube video, and does Arcmira help?"
summary: "I'd never asked Claude to pull exact moments out of videos or research who said what on YouTube. So I ran four tests, with and without Arcmira, a transcript-search MCP built for exactly that, and had Claude make a short animated video of the results. Every clip is on this page."
date: 2026-10-16
status: "in-progress"
tags: ["claude-code", "video", "research", "yt-dlp", "mcp", "arcmira"]
preview:
  verdict: "Great at one job"
  takeaway: "Claude alone finds and cuts exact moments for $2-3 a job. Arcmira's one real edge: every time a name is said on a podcast, which YouTube search can't see."
  points:
    - "Every Skyebrows mention: search alone found 1,028 videos naming him; Arcmira found 25 spoken mentions. Zero overlap."
    - "Every quote either method found matched YouTube's captions word for word. Their timestamps were up to 19 seconds off."
    - "Arcmira's free plan can't see the last 30 days or anime channels, and one broad search used 580 of its 1,000 monthly credits."
  image: "/media/previews/one-piece-reaction-clips.webp"
  loop: "/media/previews/one-piece-reaction-clips.mp4"
  alt: "The new Tesla Roadster lifting off on rocket thrusters and flying over a line of parked Teslas at night"
---

I'd never used Claude to find a specific moment in a video, or to research who said what on
YouTube. Then Arcmira's founder emailed me after my [Clawd montage post](/posts/clawd-growth-montage/).
Arcmira indexes YouTube and podcast transcripts and lets an AI agent search them through an MCP
server, a plug-in connection for tools like Claude. I wanted two answers, fast:

1. **How good is Claude at this already, with only free tools?**
2. **Is Arcmira useful to me right now, and for what?**

So I gave Claude Code four research jobs. The first three ran twice, at the same time, in fresh
sessions on the same model (Opus 5.5):

- **Claude alone:** web search, plus yt-dlp to search YouTube and read video details and captions.
- **With Arcmira:** Arcmira for everything about the videos. Web search only to confirm what an event was.

Time and tokens come from Claude Code's own logs. Then I had Claude cut every moment either side
found into a clip, so you can check the work without leaving this page.

## Watch: what using the MCP is like

<video id="mcp-explainer" controls playsinline preload="none" poster="/media/arcmira-test/explainer/poster.jpg" style="width:100%"></video>
<script>
(function () {
  var v = document.getElementById("mcp-explainer");
  var src = "/media/arcmira-test/explainer/index.m3u8", mp4 = "/media/arcmira-test/explainer/fallback-540p.mp4";
  if (!v || v.dataset.ready) return; v.dataset.ready = "1";
  function attach() {
    if (window.Hls && Hls.isSupported()) { var h = new Hls(); h.loadSource(src); h.attachMedia(v); }
    else if (v.canPlayType("application/vnd.apple.mpegurl") === "probably") { v.src = src; }
    else { v.src = mp4; }
  }
  if (window.Hls) { attach(); return; }
  var s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js";
  s.onload = attach; s.onerror = function () { v.src = mp4; };
  document.head.appendChild(s);
})();
</script>

A 4-minute-41 walkthrough of test 4, told by Claude, the agent that ran it: what Arcmira is, both
runs, what the credits bought and the verdict. Claude made all of it: the 3D shots in Blender, the
rest in HyperFrames, narration from a Gemini voice, and music synthesized in code.
[Small MP4](/media/arcmira-test/explainer/fallback-540p.mp4) if the player doesn't load.

## The short answer

- **Claude alone is genuinely good at this.** In every test it found the videos, read their
  captions and descriptions, and pinned down quotes word for word. A job took 12 to 26 minutes
  and $2 to $3 of model time.
- **Arcmira searches a different part of YouTube.** On the same SpaceX question, Claude alone
  found space channels: NASASpaceflight, Marcus House, Everyday Astronaut. Arcmira found
  podcasts and finance shows: All-In, Bloomberg, ARK Invest. **Not one video was on both lists.**
- **Arcmira's one real edge: names that are only spoken.** Asked to find every mention of
  Skyebrows, an AI music video maker, Claude alone found 1,028 videos naming him, in 2 minutes 22
  seconds, for free. Arcmira found 25 mentions said out loud in 16 podcast episodes, for 340
  credits. Neither list had a single item from the other. To find spoken mentions alone, Claude
  had to download transcripts one by one, and YouTube blocked it before the first. Arcmira has
  them already pulled.
- **Arcmira has hard limits as it stands.** Its index skips whole genres (anime reaction channels
  weren't in it at all), and the free plan can't see the last 30 days. Credits go fast: I used the
  whole 1,000-credit month in one day, and the last few features I tried hit a `quota_exceeded` wall.
- **Both methods got timestamps wrong**, by up to 19 seconds (Arcmira's passage starts, by up to 49),
  but every quote was real. Re-timed from the captions' word timings, all 47 quotes I tried were found
  word for word.

| | Test 1: anime reactions | | Test 2: yesterday's Tesla reveal | | Test 3: SpaceX, July |  |
|---|---|---|---|---|---|---|
| | **Alone** | **Arcmira** | **Alone** | **Arcmira** | **Alone** | **Arcmira** |
| Videos found | 5 clips | 0 | 18 | 0 (blocked) | 20 | 12 |
| Quotes with timestamps | | | 9 | | 10 | 10 |
| Person mentions found | | | | | 14 (+12 likely) | 15 (of ~32 counted) |
| Time | 17:51 | 2:45 | 11:58 | 5:58 | 25:55 | 7:54 |
| Model cost (list price) | $2.13 | $0.94 | $2.09 | $1.54 | $3.16 | $2.16 |
| Arcmira credits | | 20 | | 56 | | 580 |

Arcmira's free plan gives 1,000 credits a month; extra credits cost $0.002 each, so test 3's 580
would be about $1.16.

## Test 4: every mention of one creator

The job the earlier tests pointed to: find every video and podcast that mentions one person. I
picked [Skyebrows](https://www.youtube.com/@skyebrows), an AI music video maker I enjoy, and had
Claude run it both ways on the same day, with the same instruction to be thorough.

| | Claude alone (free tools) | Claude with Arcmira |
|---|---|---|
| What it did | 35 YouTube searches at 100 results each: every spelling (Skyebrows, Skybrows, Sky Brows), his handle, fan terms, every song title | About 27 transcript searches, plus name lookups and the catalog |
| Time | 2 min 22 s for the searches | About 15 minutes of calls |
| Cost | $0 | 340 credits (the free plan gives 1,000 a month) |
| Videos found that name him or a song in the title | **1,028**, from 266 channels, about 487 hours | 0 |
| Spoken mentions found | 0: YouTube blocked transcript downloads before the first of 595 candidates | **25**, in 16 episodes on 3 channels |
| Overlap | none of Arcmira's 16 episodes | none of the 1,028 videos |

**Why each side missed what the other found:**

- **Arcmira only searches its own index**, which is podcasts and talk shows. None of the 1,028
  reaction, tribute, breakdown and interview videos about him ever showed up in its results, and his
  own channel isn't in it.
- **YouTube's search only reads titles and descriptions.** The 16 episodes where Arcmira heard his
  name don't mention him in either, so 35 searches never surfaced them.
- **Finding spoken mentions alone means reading transcripts.** Claude started pulling transcripts
  for the 595 search results whose titles don't name him. YouTube blocked it before the first one
  (`IpBlocked`, then `HTTP 429: Too Many Requests`), after a day of heavy use, and it was still
  blocked half an hour later. I stopped there: that wall is part of the result. Arcmira's advantage
  is that its transcripts are already pulled and searchable, so it never hits it.

**What the 340 credits bought:** 25 spoken mentions in episodes nobody would think to open, 22 of
them on one podcast (Based Camp with Simone and Malcolm Collins), plus Asmongold and the Endgame
podcast. A search that returns 20 passages costs about 60 credits.

**Was it comprehensive? No.** It only covers Arcmira's index. On the free plan it can't show
anything from the last 30 days without upgrading to a paid tier, and filtering by date range is paid
too, so Claude couldn't page through the year cleanly. Claude's estimate for a thorough sweep of the
index for one name is about 1,500 credits: more than a free month, or under a tenth of the Pro
plan (20,000 credits for $20 a month). No number of credits adds the fan videos it doesn't index, and
their titles already show them.

**Two things it did well, and two catches:**

- Spelled correctly, `resolve("Skyebrows")` found nothing. The way people say it, "Skybrows", it found him.
- Its catalog of tagged mentions had 1 row for him. Searching the transcripts found 25.
- Its search always returns something: his song "Breathing Elon's Musk" came back as Bloomberg calling
  SpaceX "a living, breathing animal". Claude kept only passages that contain the name.
- The quotes are real: 14 of 14 checked against YouTube's own captions matched word for word.

**A correction.** An earlier version of this post and its video said plain YouTube search found only
2 of these podcast episodes and 44 videos about him. Those numbers came from four searches I'd capped
at 10 to 40 results, so they measured my effort, not what YouTube can find. The numbers above replace them.

### What Arcmira found that search didn't

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/skyebrows/k01-basedcamp-feb06-different.jpg" src="/media/arcmira-test/skyebrows/k01-basedcamp-feb06-different.mp4" style="width:100%"></video><figcaption><b>Feb 6</b>, Based Camp: &ldquo;what <b>Skybrows</b> is doing, I mean, not like we&#x27;re ever going to get to that level&rdquo; <a href="https://www.youtube.com/watch?v=LY0ZqhtVId0&t=3059s">50:59</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/skyebrows/k02-basedcamp-feb06-superfun.jpg" src="/media/arcmira-test/skyebrows/k02-basedcamp-feb06-superfun.mp4" style="width:100%"></video><figcaption><b>Feb 6</b>, Based Camp: &ldquo;<b>Sky Brows</b> videos in general are super fun. I love that.&rdquo; <a href="https://www.youtube.com/watch?v=LY0ZqhtVId0&t=3137s">52:17</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/skyebrows/k03-asmongold-mar14.jpg" src="/media/arcmira-test/skyebrows/k03-asmongold-mar14.mp4" style="width:100%"></video><figcaption><b>Mar 14</b>, Asmongold TV: &ldquo;Another video will also be coming where I react to a video that <b>Skybrows</b> made which I am included&rdquo; <a href="https://www.youtube.com/watch?v=XrVrdfURxFg&t=59s">0:59</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/skyebrows/k04-basedcamp-mar24-funlooking.jpg" src="/media/arcmira-test/skyebrows/k04-basedcamp-mar24-funlooking.mp4" style="width:100%"></video><figcaption><b>Mar 24</b>, Based Camp: &ldquo;There is a constant AI witch hunt on the left and the right is just like <b>skybrows</b> like this is fun looking&rdquo; <a href="https://www.youtube.com/watch?v=z-JiZRk6fls&t=2002s">33:22</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/skyebrows/k05-basedcamp-apr02-coolkids.jpg" src="/media/arcmira-test/skyebrows/k05-basedcamp-apr02-coolkids.mp4" style="width:100%"></video><figcaption><b>Apr 2</b>, Based Camp: &ldquo;the <b>Skybrows</b> videos to me the interesting it&#x27;s felt like there&#x27;s a party of cool kids&rdquo; <a href="https://www.youtube.com/watch?v=P1Di8GRFkRI&t=4772s">79:32</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/skyebrows/k06-basedcamp-apr21-platform.jpg" src="/media/arcmira-test/skyebrows/k06-basedcamp-apr21-platform.mp4" style="width:100%"></video><figcaption><b>Apr 21</b>, Based Camp: &ldquo;if you&#x27;re putting together something like a <b>skybrows</b> type video because I want to be the best place to put those together&rdquo; <a href="https://www.youtube.com/watch?v=l3-6iPUF7hY&t=170s">2:50</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/skyebrows/k07-kirsche-jun19-motivation.jpg" src="/media/arcmira-test/skyebrows/k07-kirsche-jun19-motivation.mp4" style="width:100%"></video><figcaption><b>Jun 19</b>, Based Camp, with Kirsche: &ldquo;you obviously were a big motivation for like <b>Skybrows</b> to do some of his early videos&rdquo; <a href="https://www.youtube.com/watch?v=dRAnjMAXYSM&t=2663s">44:23</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/skyebrows/k08-basedcamp-jul08-universe.jpg" src="/media/arcmira-test/skyebrows/k08-basedcamp-jul08-universe.mp4" style="width:100%"></video><figcaption><b>Jul 8</b>, Based Camp: &ldquo;having it called the <b>Skybrows</b> Cinematic Universe, I think makes perfect sense&rdquo; <a href="https://www.youtube.com/watch?v=NljTXtSCUaw&t=1097s">18:17</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/skyebrows/k09-basedcamp-jul08-viral.jpg" src="/media/arcmira-test/skyebrows/k09-basedcamp-jul08-viral.mp4" style="width:100%"></video><figcaption><b>Jul 8</b>, Based Camp: &ldquo;When the first <b>SkyBrows</b> video went viral that went viral, the Elon video&rdquo; <a href="https://www.youtube.com/watch?v=NljTXtSCUaw&t=2172s">36:12</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/skyebrows/k10-basedcamp-jul08-cantmake.jpg" src="/media/arcmira-test/skyebrows/k10-basedcamp-jul08-cantmake.mp4" style="width:100%"></video><figcaption><b>Jul 8</b>, Based Camp: &ldquo;if you look at the <b>Skybrows</b>, <b>Skybrows</b>, and I can&#x27;t make videos like the ones he makes&rdquo; <a href="https://www.youtube.com/watch?v=NljTXtSCUaw&t=2509s">41:49</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/skyebrows/k11-basedcamp-jul22-foxgirl.jpg" src="/media/arcmira-test/skyebrows/k11-basedcamp-jul22-foxgirl.mp4" style="width:100%"></video><figcaption><b>Jul 22</b>, Based Camp: &ldquo;And then compare that to like a fox girl from a <b>Skybrows</b> video&rdquo; <a href="https://www.youtube.com/watch?v=8nevpXypPW4&t=436s">7:16</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/skyebrows/k12-basedcamp-aug24-storyboard.jpg" src="/media/arcmira-test/skyebrows/k12-basedcamp-aug24-storyboard.mp4" style="width:100%"></video><figcaption><b>Aug 24</b>, Based Camp, with Aydin Paladin: &ldquo;bro, I bet if you storyboarded something that <b>SkyBrows</b> team would love to make it&rdquo; <a href="https://www.youtube.com/watch?v=ZJ6bYFdVH3M&t=2830s">47:10</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/skyebrows/k13-basedcamp-sep03-ownvideos.jpg" src="/media/arcmira-test/skyebrows/k13-basedcamp-sep03-ownvideos.mp4" style="width:100%"></video><figcaption><b>Sep 3</b>, Based Camp: &ldquo;working on creating a good one for music video generation so you can create your own <b>SkyBrows</b> videos&rdquo; <a href="https://www.youtube.com/watch?v=Hxt4fDwBBag&t=2757s">45:57</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/skyebrows/k14-endgame-sep09-universe.jpg" src="/media/arcmira-test/skyebrows/k14-endgame-sep09-universe.mp4" style="width:100%"></video><figcaption><b>Sep 9</b>, Endgame with Amanda Cassatt: &ldquo;our cultural sphere are aware of is the <b>Skybrow</b> cinematic universe&rdquo; <a href="https://www.youtube.com/watch?v=nYI7VXAWCLc&t=1423s">23:43</a></figcaption></figure>
</div>

<details>
<summary>All 25 spoken mentions, with links</summary>

Timestamps marked * are Arcmira's passage start (the name is said within the next minute); the
rest are the exact second, from YouTube's captions.

| Date (2026) | Channel | Link | What was said |
|---|---|---|---|
| 02-06 | Based Camp | [50:59](https://www.youtube.com/watch?v=LY0ZqhtVId0&t=3059s) | what Skybrows is doing, I mean, not like we&#x27;re ever going to get to that level |
| 02-06 | Based Camp | [52:17](https://www.youtube.com/watch?v=LY0ZqhtVId0&t=3137s) | Sky Brows videos in general are super fun |
| 03-14 | Asmongold TV | [0:59](https://www.youtube.com/watch?v=XrVrdfURxFg&t=59s) | Another video will also be coming where I react to a video that Skybrows made which I am included |
| 03-24 | Based Camp | [33:22](https://www.youtube.com/watch?v=z-JiZRk6fls&t=2002s) | There is a constant AI witch hunt on the left and the right is just like skybrows like this is fun looking |
| 04-02 | Based Camp | [40:06](https://www.youtube.com/watch?v=P1Di8GRFkRI&t=2406s)* | Like we all watch Skybrows |
| 04-02 | Based Camp | [1:17:44](https://www.youtube.com/watch?v=P1Di8GRFkRI&t=4664s)* | did stuff like skybrows play a role in that or is that not as relevant |
| 04-02 | Based Camp | [1:19:33](https://www.youtube.com/watch?v=P1Di8GRFkRI&t=4773s) | the Skybrows videos to me the interesting it&#x27;s felt like there&#x27;s a party of cool kids |
| 04-08 | Based Camp | [24:29](https://www.youtube.com/watch?v=1__Pq8wMSuo&t=1469s)* | (the name comes up in a passage about VTubers on the right) |
| 04-21 | Based Camp | [2:51](https://www.youtube.com/watch?v=l3-6iPUF7hY&t=171s) | if you&#x27;re putting together something like a skybrows type video because I want to be the best place to put those together too online |
| 04-21 | Based Camp | [14:29](https://www.youtube.com/watch?v=l3-6iPUF7hY&t=869s)* | And meanwhile, we&#x27;ve got like skybrows on our side |
| 05-13 | Based Camp | [37:07](https://www.youtube.com/watch?v=p_o-KIJ-XIY&t=2227s)* | (the name comes up in a list of creators on the right) |
| 05-14 | Based Camp | [27:34](https://www.youtube.com/watch?v=BctZVqV87-c&t=1654s)* | What is coming out of the the Skybrows |
| 06-12 | Based Camp | [33:50](https://www.youtube.com/watch?v=F3aj5KRpLMQ&t=2030s)* | we&#x27;re the ones that have our Skybrows and our, all of these AI music videos and stuff |
| 06-12 | Based Camp | [54:43](https://www.youtube.com/watch?v=F3aj5KRpLMQ&t=3283s)* | I get so excited when I see like Skybrows and stuff like this |
| 06-19 | Based Camp (guest Kirsche) | [44:23](https://www.youtube.com/watch?v=dRAnjMAXYSM&t=2663s) | you obviously were a big motivation for like Skybrows to do some of his early videos |
| 07-08 | Based Camp | [18:17](https://www.youtube.com/watch?v=NljTXtSCUaw&t=1097s) | having it called the Skybrows Cinematic Universe, I think makes perfect sense |
| 07-08 | Based Camp | [36:13](https://www.youtube.com/watch?v=NljTXtSCUaw&t=2173s) | When the first SkyBrows video went viral that went viral, the Elon video |
| 07-08 | Based Camp | [41:50](https://www.youtube.com/watch?v=NljTXtSCUaw&t=2510s) | if you look at the Skybrows, Skybrows, and I can&#x27;t make videos like the ones he makes |
| 07-22 | Based Camp | [7:16](https://www.youtube.com/watch?v=8nevpXypPW4&t=436s) | compare that to like a fox girl from a Skybrows video |
| 07-22 | Based Camp | [42:22](https://www.youtube.com/watch?v=8nevpXypPW4&t=2542s)* | We can give you Skybrows |
| 08-07 | Based Camp | [34:58](https://www.youtube.com/watch?v=ji2zsf20xDA&t=2098s)* | Skybrows, holy ball |
| 08-24 | Based Camp (guest Aydin Paladin) | [47:11](https://www.youtube.com/watch?v=ZJ6bYFdVH3M&t=2831s) | I bet if you storyboarded something that SkyBrows team would love to make it |
| 09-03 | Based Camp | [45:57](https://www.youtube.com/watch?v=Hxt4fDwBBag&t=2757s) | working on creating a good one for music video generation so you can create your own SkyBrows videos |
| 09-09 | Endgame with Amanda Cassatt | [23:44](https://www.youtube.com/watch?v=nYI7VXAWCLc&t=1424s) | our cultural sphere are aware of is the Skybrow cinematic universe |
| 09-09 | Endgame with Amanda Cassatt | [34:33](https://www.youtube.com/watch?v=nYI7VXAWCLc&t=2073s)* | when you look at Skybrows videos, when you look at the videos that are coming out |

</details>

<details>
<summary>What plain search found: the 50 most-viewed of the 1,028 videos</summary>

The [full list of 1,028 is here](/media/arcmira-test/skyebrows/plain-search-1028.json) (JSON, with
channel, views and length).

| Channel | Video | Length | Views |
|---|---|---|---|
| Olympic Games | [The best of Sky Brown 🛹 at the Olympics!](https://www.youtube.com/watch?v=AkXK9ieCrYE) | 4 min | 3,791,086 |
| Foxtale | [What if men got periods…and other thoughts in @swatisachdeva95&#x27;s head \| No Fox Given by Foxtale](https://www.youtube.com/watch?v=gafxuEWvgdQ) | 8 min | 1,697,369 |
| Skyebrows and Carolina Overdrive | [Gonna Be - Carolina Overdrive (A Skyebrows and MommaBrows Collaboration)](https://www.youtube.com/watch?v=m8dMy5_Lox4) | 5 min | 362,134 |
| Therworldtube | [Asmongold reaction to &#x27;One Million Amelias - Skyebrows&#x27;](https://www.youtube.com/watch?v=ax_OLDy-d14) | 6 min | 231,657 |
| nikeskateboarding | [Nike SB \| Sky Brown \| Pogo Plus](https://www.youtube.com/watch?v=jIpogLnGGQs) | 2 min | 99,703 |
| Yukiwaru | [This is the BEST Music Video EVER - Zuckerwars](https://www.youtube.com/watch?v=XvnCdMY1Is8) | 28 min | 76,087 |
| Therworldtube | [Powdur (OG Amelia model) reacts to &#x27;A Million Amelias - Skyebrows&#x27;](https://www.youtube.com/watch?v=5ZhMYqFepbA) | 10 min | 73,157 |
| Powdur | [Skyebrows with CONTEXT \| Powdur Reacts](https://www.youtube.com/watch?v=pb7VmOVr_5M) | 21 min | 72,693 |
| ThatDogFromThatOneAnime | [Winners Win (feat. Asmongold, Skyebrows, Leaflit, Tectone and others)](https://www.youtube.com/watch?v=obIAZdQx0To) | 5 min | 71,708 |
| Dzienny Małżonek | [A MILLION AMELIAS (PL) – Polska Wersja 🇵🇱 \| Dzienny Małżonek Cover](https://www.youtube.com/watch?v=opHOzZyF4nY) | 3 min | 70,693 |
| Pasta | [It hits you harder than a rocket launcher! - Skyebrows AMV (music by BUPAELA)](https://www.youtube.com/watch?v=O82gYwMq9-Y) | 2 min | 61,615 |
| Skyebrows and CyberNuggets | [Zuckerwars Process Breakdown (Featuring CyberNuggets)](https://www.youtube.com/watch?v=fyv-fO-sWhY) | 109 min | 58,022 |
| LouieVerse | [ONE SKYE - A Skyebrows Anthem (Official Music Video) dedicated to @skyebrows and the skyebros](https://www.youtube.com/watch?v=pz9IlGpPaHA) | 5 min | 47,959 |
| TheHolyBall | [Zuckerwars Tribute - HolyBall](https://www.youtube.com/watch?v=4rku-UrlBg4) | 3 min | 46,806 |
| IrishCrutch | [Joe Rogaine discusses Tim and Eric](https://www.youtube.com/watch?v=TRCXktX6LRM) | 5 min | 46,055 |
| Skyebros Updates | [Pipkin Pippa Reacts to Skyebrows](https://www.youtube.com/watch?v=EdZBu6mc3iE) | 5 min | 45,149 |
| Therworldtube | [Kirsche Reaction to &#x27;No Fox Given - Skyebrows&#x27;](https://www.youtube.com/watch?v=QoEe1pjqxmc) | 10 min | 44,978 |
| Bloodrunks | [Nux reacts to Crybrows](https://www.youtube.com/watch?v=-VyXkM36JVY) | 7 min | 41,672 |
| LifuLifu | [WOW I&#x27;m in a Skyebrows video!!!? No Fox Given React](https://www.youtube.com/watch?v=X-3ehiNRXbY) | 17 min | 40,373 |
| Celestium | [I am Part of the ZUCKERWARS - Skyebrows](https://www.youtube.com/watch?v=CHpgoV_qGrg) | 20 min | 38,309 |
| Lusty Lynx | [THIS IS ABSOLUTE CINEMA \| Zuckerwars  \| Skyebrows \| Lustylynx Reacts](https://www.youtube.com/watch?v=kAO024ioQrY) | 18 min | 37,710 |
| Kitsura Nines | [Skyebrows - Zuckerwars React (Kitsura Nines)](https://www.youtube.com/watch?v=dxmYaFrdEAI) | 18 min | 35,520 |
| Cultural Breakdown | [A Million Amelias – Skyebrows Video Reaction \| They Can’t Stop Her](https://www.youtube.com/watch?v=CIZZFX5gceY) | 7 min | 33,759 |
| Lusty Lynx | [I FOUND HER!! &quot;Crybrows&quot; by Skyebrows \| Lustylynx Reacts](https://www.youtube.com/watch?v=6-AD6gSxn4I) | 14 min | 33,369 |
| Kitsura Nines | [Kitsura Nines REACTION to Skyebrows - NO FOX GIVEN](https://www.youtube.com/watch?v=gGLH4cUgOKM) | 7 min | 33,221 |
| Yukiwaru | [These Are the GREATEST AI Songs EVER \| Skyebrows/Powdur Virus [Yukiwaru Reacts]](https://www.youtube.com/watch?v=gMjkYhf6FG0) | 20 min | 32,432 |
| Powdur Clips | [ZUCKERWARS](https://www.youtube.com/watch?v=5ClDyXs3CYs) | 17 min | 32,030 |
| Bloodrunks | [Nux reacts to the Cream of the Slop](https://www.youtube.com/watch?v=rkOrT0NcgMw) | 8 min | 31,752 |
| Bloodrunks | [Nux reacts to Home Stallone II!!!!](https://www.youtube.com/watch?v=hrmh_3Uv4dA) | 8 min | 31,741 |
| Kitsune Mizuki | [It Seems That I&#x27;ve Been Noticed! \| Skyebrows React](https://www.youtube.com/watch?v=zv7meGO_pfc) | 25 min | 29,598 |
| Lord Intellectual | [It&#x27;s not FOR you - An intellectual reacts to Skyebrows &quot;A million Amelias&quot; music video](https://www.youtube.com/watch?v=lXsLTVBChfY) | 25 min | 29,068 |
| Keksi Kuebler | [REACTING to Zuckerwars by Skyebrows (Zuckerborg) \| First Time Hearing~](https://www.youtube.com/watch?v=S6pl-ACHves) | 14 min | 28,755 |
| WHAT IT DO DAVE | [Reacting to Zuckerwars - This Zuckerberg Song is INSANE (Skyebrows)](https://www.youtube.com/watch?v=enN9AlFGCl4) | 25 min | 28,339 |
| Silas Frostrunner and YunaDoesStuff | [Silas &amp; Yuna REACT: Skyebrows&#x27;s Zuckerwars! 👓](https://www.youtube.com/watch?v=Dc0mENDlnq0) | 44 min | 27,565 |
| LifuLifu | [Skybrow : Amelia and Fox Songs \| Reaction](https://www.youtube.com/watch?v=KDJ5p8kuKyU) | 18 min | 26,706 |
| Skyebros Updates | [Kitsunero Reacts to Skyebrows (for real this time)](https://www.youtube.com/watch?v=MwE7ul4tmpw) | 46 min | 26,134 |
| Null FM | [Tiny Campfire Glow / A Thank You to @skyebrows // Null Fm](https://www.youtube.com/watch?v=kf5HyGXdjyQ) | 3 min | 26,085 |
| Bloodrunks | [Nux reacts to Never Lego from Skybrows](https://www.youtube.com/watch?v=jVJC9XOYk7o) | 8 min | 25,760 |
| Ella Rae | [I WAS DRAFTED IN THE ZUCKERWARS \| SKYEBROWS REACTION!!](https://www.youtube.com/watch?v=byfo-Uw-1AY) | 28 min | 25,670 |
| ACE AT | [Skyebrows Just Dropped Zuckerwars.. And Mentioned Me](https://www.youtube.com/watch?v=r6IIL0IR4f0) | 29 min | 25,127 |
| Ember Paradox | [I actually get to show Skyebrows love in his newest banger &quot;Crybrows&quot;!](https://www.youtube.com/watch?v=kcR_N0a2FhU) | 33 min | 24,521 |
| WHAT IT DO DAVE | [WHAT DID I JUST WATCH? \| Breathing Elon&#x27;s Musk (REACTION)](https://www.youtube.com/watch?v=7yj0YiM7TEM) | 12 min | 24,338 |
| Teally | [AI &#x27;SLOP&#x27; IS PEAKING?! \| VTuber Reacts to Skyebrows - Zuckerwars](https://www.youtube.com/watch?v=zY0BCtaG44w) | 26 min | 22,122 |
| Keen_EN | [Absolute Cinema, Again! - Zuckerwars Skyebrows Reaction](https://www.youtube.com/watch?v=Ilzja7syOb8) | 37 min | 21,739 |
| LifuLifu | [Crybrows - Skyebrows React! - WOAH WE ARE IN IT?](https://www.youtube.com/watch?v=atVCjdLGcas) | 31 min | 21,264 |
| Lord Intellectual | [SKYEBROWS PUT ME IN A VIDEO?! \| &quot;Crybrows&quot; Reaction](https://www.youtube.com/watch?v=bz-uMLwEKd8) | 23 min | 21,029 |
| Powdur Clips | [The Zuckerwars needs me!](https://www.youtube.com/watch?v=M7y8q4SCtug) | 6 min | 20,800 |
| Kitsura Nines | [Kitsura Nines intial NO FOX GIVEN - Skyebrows react, live on stream! + an anti argues with me](https://www.youtube.com/watch?v=FJCmAM2r-Uc) | 7 min | 20,294 |
| feeblemind | [A Million Amelias - Reaction](https://www.youtube.com/watch?v=2AdwsE_waIo) | 14 min | 20,234 |
| BananaJuju | [AI got so good \| Reaction to A Million Amelias - Skyebrows](https://www.youtube.com/watch?v=8Apdsort-vk) | 34 min | 20,161 |

</details>

### Every Arcmira call in this test

| Call | What came back |
|---|---|
| `status()` | free plan; can't see the last 30 days without a paid tier |
| `resolve()` x3 | "Skybrows" found; "Skyebrows" and his channel ID not found |
| `mentions()`, `occurrences()` | the catalog: 1 mention, 1 episode |
| `search()`, about 27 programs | the 25 mentions above, plus noise for song titles |
| `status({channelId})` | Based Camp: 678 videos indexed |
| `momentum()`, `recommendations()`, `sponsors()`, `episodes()`, `integrations.slack()` | refused once the month's credits ran out: `quota_exceeded`, "they reset on 2026-11-01" |
| `quote()` | a Premium transcript of one 53-minute episode would cost 1,200 credits, and isn't on the free plan |
| `monitors.list()` | no monitors |

Earlier tests on this page also used `transcript()`, `sponsors()`, `episodes()` and sponsored-only
search. Still untested: momentum, recommendations, Premium transcripts and creating monitors.

## Test 3: a SpaceX question both could see

This is the fair fight, so it goes first. Arcmira's free plan serves nothing newer than 30 days,
so this test only counted videos from June 18 to September 16, which is everything it can see.

1. Where has SpaceX president **Gwynne Shotwell** come up on YouTube and podcasts?
2. Which videos covered **Starship Flight 13** in July (an abort at T-0 on July 16, then a flight
   on July 24 that deployed 20 Starlink satellites, made the ship's softest splashdown yet, and
   hit the water hard with the booster)? For each: sponsors, the creator's main takeaway, and for
   the top 10, the most memorable moment.

### Claude alone: the space channels

It ranked 20 videos by views, from VideoFromSpace's 1.03 million down. These are its top 10
moments, each clip cut to the second the words were said:

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/m01-videofromspace.jpg" src="/media/arcmira-test/starship/m01-videofromspace.mp4" style="width:100%"></video><figcaption><b>VideoFromSpace</b> (1.03M views), SpaceX's webcast: "it didn't look like we lit all 13 engines that we were planning for that initial landing burn." <a href="https://www.youtube.com/watch?v=2TF98WKebD4&t=452s">7:32</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/m02-nsf.jpg" src="/media/arcmira-test/starship/m02-nsf.mp4" style="width:100%"></video><figcaption><b>NASASpaceflight</b> (954K), 4 hours into the stream: "The ship hasn't exploded, but it is on fire." <a href="https://www.youtube.com/watch?v=lC3RDO7tdLc&t=15087s">4:11:27</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/m03-marcushouse.jpg" src="/media/arcmira-test/starship/m03-marcushouse.mp4" style="width:100%"></video><figcaption><b>Marcus House</b> (759K): an incredible mission, booster landing aside. "I suspect flight 14 may not go for the Super Heavy catch like we were hoping." <a href="https://www.youtube.com/watch?v=hF3CHBq56DA&t=525s">8:45</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/m04-ap.jpg" src="/media/arcmira-test/starship/m04-ap.mp4" style="width:100%"></video><figcaption><b>Associated Press</b> (669K), SpaceX's host: "I'm losing my mind right now. We are still getting views from on board the ship with it in the water." <a href="https://www.youtube.com/watch?v=uI6pKTGyNq4&t=6031s">1:40:31</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/m05-everydayastronaut.jpg" src="/media/arcmira-test/starship/m05-everydayastronaut.mp4" style="width:100%"></video><figcaption><b>Everyday Astronaut</b> (660K): "Oh, it didn't blow up. Come on." Tim Dodd expects orbit on flight 14 or 15. <a href="https://www.youtube.com/watch?v=-pR0eOj9hK0&t=9665s">2:41:05</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/m06-nsf-abort.jpg" src="/media/arcmira-test/starship/m06-nsf-abort.mp4" style="width:100%"></video><figcaption><b>NASASpaceflight</b>, the July 16 abort (654K): "We have ignition and we have an abort. Starship is not launching today." <a href="https://www.youtube.com/watch?v=vYpQwwf1XNw&t=10352s">2:52:32</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/m07-whataboutit.jpg" src="/media/arcmira-test/starship/m07-whataboutit.mp4" style="width:100%"></video><figcaption><b>What about it!?</b> (607K): "Ship 40 did a soft splashdown, and soft isn't cutting it." <a href="https://www.youtube.com/watch?v=ixSigvIlLcw&t=1357s">22:37</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/m08-whataboutit-stream.jpg" src="/media/arcmira-test/starship/m08-whataboutit-stream.mp4" style="width:100%"></video><figcaption><b>What about it!?</b> stream (505K): "It didn't even explode. Look at this." <a href="https://www.youtube.com/watch?v=KZDeJv7Ba-8&t=13566s">3:46:06</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/m09-scottmanley.jpg" src="/media/arcmira-test/starship/m09-scottmanley.mp4" style="width:100%"></video><figcaption><b>Scott Manley</b> (475K): the ship was exceptional, the booster wasn't. "We wait for the big kaboom and there is no kaboom." <a href="https://www.youtube.com/watch?v=_EN5Jsl_G0I&t=1191s">19:51</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/m10-marcushouse-preview.jpg" src="/media/arcmira-test/starship/m10-marcushouse-preview.mp4" style="width:100%"></video><figcaption><b>Marcus House</b>, July 11 preview (381K): "here we are with our first more official hints on the target dates for Starship flight 13." <a href="https://www.youtube.com/watch?v=ecG1Hm5sf70&t=53s">0:53</a></figcaption></figure>
</div>

**Sponsors it found, per video:** Outskill, Mammouth AI and Surfshark as ad reads in the captions,
and BlueDot, Abacus AI and Incogni in descriptions. Most live streams and news channels had none.

**Shotwell:** 14 confirmed mentions and about 12 likely ones, mostly from titles and
descriptions: the Starbase Louisiana announcement in August, the Q2 earnings call, Starlink Mobile.
It could only confirm spoken mentions in two videos it already had captions for. It guessed the
real total is 50 to 150, with low confidence, because every new search kept finding more.

<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/s04-spaceflightnow-shotwell.jpg" src="/media/arcmira-test/starship/s04-spaceflightnow-shotwell.mp4" style="width:100%;max-width:560px"></video><figcaption><b>Spaceflight Now</b>, one of its two spoken finds: "with President Gwynne Shotwell saying to CNBC that it might happen as soon as flight 14." <a href="https://www.youtube.com/watch?v=kUxOr5WK_Qs&t=368s">6:08</a></figcaption></figure>

**What slowed it down:** YouTube refused most caption downloads after a burst (HTTP 429), so it
got captions for only 13 of 21 videos. It read 4-to-6-hour live streams by keyword only.

### With Arcmira: the podcasts and finance shows

Arcmira found 12 videos, from different channels entirely: All-In, Bloomberg, Farzad, Limitless, ARK
Invest and live-stream re-broadcasts. It could only rank them roughly: it returns views for a
channel's 25 newest indexed episodes only, so it had view counts for just 4 of the 12. Its top 10
moments:

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/a01-nypost.jpg" src="/media/arcmira-test/starship/a01-nypost.mp4" style="width:100%"></video><figcaption><b>New York Post</b> restream of the abort: "we did trigger a hold on the booster that aborted our liftoff as we were starting to light those Raptor engines." <a href="https://www.youtube.com/watch?v=yXMzm03TQXg&t=1560s">26:00</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/a02-allin.jpg" src="/media/arcmira-test/starship/a02-allin.mp4" style="width:100%"></video><figcaption><b>All-In</b>, David Sacks on Starlink V3: "So over 20 times more capacity per launch. That's the power of it." <a href="https://www.youtube.com/watch?v=muRIXCDw-k0&t=2227s">37:07</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/a03-bloomberg-surveillance.jpg" src="/media/arcmira-test/starship/a03-bloomberg-surveillance.mp4" style="width:100%"></video><figcaption><b>Bloomberg Surveillance</b>, the abort as a stock story: SpaceX "shares are down 3.6% in the premarket after the company scrubbed its latest Starship launch." <a href="https://www.youtube.com/watch?v=bGbORnmy2h0&t=1631s">27:11</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/a04-businessweek-tv.jpg" src="/media/arcmira-test/starship/a04-businessweek-tv.mp4" style="width:100%"></video><figcaption><b>Bloomberg Businessweek Daily</b>: "Starship has actually yet to achieve orbit." <a href="https://www.youtube.com/watch?v=OJkv4b0kecg&t=652s">10:52</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/a05-businessweek-podcast.jpg" src="/media/arcmira-test/starship/a05-businessweek-podcast.mp4" style="width:100%"></video><figcaption><b>Bloomberg Businessweek</b>, podcast feed of the same segment: "relatively successful launch recently. Uh, what are we still waiting for?" <a href="https://www.youtube.com/watch?v=S0nXcQc8RX4&t=639s">10:39</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/a06-farzad-understands.jpg" src="/media/arcmira-test/starship/a06-farzad-understands.mp4" style="width:100%"></video><figcaption><b>Farzad</b> (14K views): the real payoff is Starlink V3, "a satellite that has 10 times the bandwidth of the current Starlink V2 satellites." <a href="https://www.youtube.com/watch?v=g6Xbjo278a4&t=821s">13:41</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/a07-farzad-realizes.jpg" src="/media/arcmira-test/starship/a07-farzad-realizes.mp4" style="width:100%"></video><figcaption><b>Farzad</b> (13K) on the heat shield: "It literally has to dump 700 tons of TNT in a matter of minutes." <a href="https://www.youtube.com/watch?v=TnaJyLkf8Jk&t=230s">3:50</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/a08-limitless.jpg" src="/media/arcmira-test/starship/a08-limitless.mp4" style="width:100%"></video><figcaption><b>Limitless</b> (11K): "do you know how long it takes to build a Starship now? It's two weeks." <a href="https://www.youtube.com/watch?v=nbt7ZI9bW2o&t=1207s">20:07</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/a09-farzad-restream.jpg" src="/media/arcmira-test/starship/a09-farzad-restream.mp4" style="width:100%"></video><figcaption><b>Farzad</b> restream of SpaceX's webcast: "That is the softest splashdown we have ever had with the Starship there in the Indian Ocean." <a href="https://www.youtube.com/watch?v=CwRS6g7Z1Eg&t=2132s">35:32</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/a10-ark.jpg" src="/media/arcmira-test/starship/a10-ark.mp4" style="width:100%"></video><figcaption><b>ARK Invest</b>: "was it a success? Yes. Did they do everything they wanted? No." <a href="https://www.youtube.com/watch?v=XWZWiTKqafs&t=50s">0:50</a></figcaption></figure>
</div>

**Sponsors:** channel-level only, from each channel's sponsor history (All-In: OKX, Circle,
Airwallex, AppLovin; Farzad: Rebellionaire; Limitless: Qualcomm). It couldn't confirm the ad read
in any single video, because the free plan won't let a search end at a date ("The before filter
requires Pro").

**Shotwell is where it shone.** It matched her exactly ("President and COO of SpaceX") and
counted about 32 episodes across 16 channels in the window: All-In 6, Bloomberg Podcasts 4, and
so on. It quoted what people said about her, including in videos that never name her in the
title or description:

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/s01-allin-shotwell.jpg" src="/media/arcmira-test/starship/s01-allin-shotwell.mp4" style="width:100%"></video><figcaption><b>All-In</b>, introducing her as a guest: "she's the glue to the tornado." (Claude alone found this one too.) <a href="https://www.youtube.com/watch?v=iwBOQeFPAwg&t=19s">0:19</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/s02-limitless-shotwell.jpg" src="/media/arcmira-test/starship/s02-limitless-shotwell.mp4" style="width:100%"></video><figcaption><b>Limitless</b>: "Gwynne Shotwell, the COO, the like godsend of SpaceX, basically the effective CEO." <a href="https://www.youtube.com/watch?v=nbt7ZI9bW2o&t=1231s">20:31</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/starship/s03-bloomberg-shotwell.jpg" src="/media/arcmira-test/starship/s03-bloomberg-shotwell.mp4" style="width:100%"></video><figcaption><b>Bloomberg Tech</b>: "I did take notice of Gwen Shotwell, the president of SpaceX, talking about Starlink Mobile." <a href="https://www.youtube.com/watch?v=KbGLVK1Nnk4&t=229s">3:49</a></figcaption></figure>
</div>

Four of its 15 listed mentions came back as "about her" without her name in the returned passage,
and it marked those unverified.

**The credits surprise:** test 3 used 580 credits, more than half the month's free allowance. Two
calls asked for up to 100 mention rows each, and Arcmira charges 4 credits per row after the first 5.
The agent blamed "other agents spending from the same account", which was wrong: I checked, and it
was the only thing using Arcmira at the time.

### Why the lists don't overlap

Arcmira's index barely covers dedicated space channels. It reported one NASASpaceflight video, indexed
through 2025, and Marcus House indexed only to July 11; Everyday Astronaut and Scott Manley didn't
resolve at all. Meanwhile YouTube's search ranks the big space channels first, and never surfaces a
two-hour finance podcast that spends five minutes on Starship. Each method is blind to the other's half.

## Test 2: yesterday's Tesla reveal, and my own name

Tesla revealed the new Roadster on October 15, at SpaceX's test site in McGregor, Texas, and flew it
over a line of other Teslas on rocket thrusters. I asked which videos covered it, their sponsors and
the top 10's best moments. I also asked where my own name has come up, expecting never.

**Arcmira couldn't do the reveal at all.** Its search for anything after September 16 came back
with `freshness_requires_paid`: "Results on this plan stop at 2026-09-16; media published after it
requires Pro." What it could still offer was each channel's sponsor history, with dates running up
to the day of the reveal. That data isn't held back, and nothing free gives it to you.

**Claude alone** found 18 videos in 12 minutes, checked each for sponsors (only two had a paid
one: AG1, and IONNA with Lincoln Electric), and found the best moment in nine of the top ten. The
tenth, YOUCAR, has no captions:

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/roadster/01-tesla.jpg" src="/media/arcmira-test/roadster/01-tesla.mp4" style="width:100%"></video><figcaption><b>Tesla</b> (4.57M views): "Tony Hawk would be proud. We call that the kick flip... I think we could have cleared more than our whole fleet." <a href="https://www.youtube.com/watch?v=qt5p-_tE8d0&t=693s">11:33</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/roadster/02-cnet.jpg" src="/media/arcmira-test/roadster/02-cnet.mp4" style="width:100%"></video><figcaption><b>CNET</b> (4.10M), a supercut: "Well, it worked." <a href="https://www.youtube.com/watch?v=TWHXrLzUKJc&t=138s">2:18</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/roadster/03-videofromspace.jpg" src="/media/arcmira-test/roadster/03-videofromspace.mp4" style="width:100%"></video><figcaption><b>VideoFromSpace</b> (2.55M): "Flying cars are real... instead we got 140 characters. Well, not anymore." <a href="https://www.youtube.com/watch?v=eqOfmtTJD1A&t=82s">1:22</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/roadster/04-carwow.jpg" src="/media/arcmira-test/roadster/04-carwow.mp4" style="width:100%"></video><figcaption><b>carwow</b> (2.29M), impressed but sceptical: "I might have to eat some humble pie." <a href="https://www.youtube.com/watch?v=4bbfRQDC6cs&t=52s">0:52</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/roadster/05-abc.jpg" src="/media/arcmira-test/roadster/05-abc.mp4" style="width:100%"></video><figcaption><b>ABC News</b> (1.70M): "There is skepticism surrounding the announcement." <a href="https://www.youtube.com/watch?v=BYWy6SyJRZo&t=68s">1:08</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/roadster/07-hagerty.jpg" src="/media/arcmira-test/roadster/07-hagerty.mp4" style="width:100%"></video><figcaption><b>Hagerty</b> (1.13M): "It seems almost more real and yet more unreal... I cannot see how that is ever going to go on sale somehow." <a href="https://www.youtube.com/watch?v=22rvpUecLts&t=1602s">26:42</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/roadster/08-dpccars.jpg" src="/media/arcmira-test/roadster/08-dpccars.mp4" style="width:100%"></video><figcaption><b>DPCcars</b> (667K), Musk: "...attempt to jump the Snake River Canyon." <a href="https://www.youtube.com/watch?v=j8lbY_D7xcY&t=1143s">19:03</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/roadster/09-dragtimes.jpg" src="/media/arcmira-test/roadster/09-dragtimes.mp4" style="width:100%"></video><figcaption><b>DragTimes</b> (656K), at the event: "Everyone's been texting me right now. They didn't think it was real." <a href="https://www.youtube.com/watch?v=_lq-DpCE9rU&t=871s">14:31</a></figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/roadster/10-topgear.jpg" src="/media/arcmira-test/roadster/10-topgear.mp4" style="width:100%"></video><figcaption><b>Top Gear</b> (637K): "For me, this feels like a Bugatti Veyron moment..." <a href="https://www.youtube.com/watch?v=JdkIOhFmbKI&t=2925s">48:45</a></figcaption></figure>
</div>

**My name:** both said "never on a podcast", from opposite sides. Claude alone found my own two
uploads, plus a band and a 2018 speech event that list an Aaron Orelup in their descriptions, which
may or may not be me. Arcmira found no "Orelup" in anything said on the shows it indexes. A spoken
mention with no written trace would only show up through Arcmira.

## Test 1: one moment across reaction videos

The first job was the one I actually wanted, and the hardest: find YouTubers filming themselves
watching One Piece episode 715, and cut out their reaction to one ten-second moment. Senor Pink
puts on his dead son's baby bonnet for his wife Russian, who hasn't responded to anything since an
accident, and she smiles for the first time.

**Claude alone** found five, each clip running from the bonnet to just after the smile:

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/onepiece/01-rice-and-ginger.jpg" src="/media/arcmira-test/onepiece/01-rice-and-ginger.mp4" style="width:100%"></video><figcaption><a href="https://www.youtube.com/watch?v=H9fSb0d0OIE&t=1572s">Rice &amp; Ginger</a>, 26:12</figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/onepiece/02-yaboyrocklee.jpg" src="/media/arcmira-test/onepiece/02-yaboyrocklee.mp4" style="width:100%"></video><figcaption><a href="https://www.youtube.com/watch?v=QnamL-G2btY&t=1588s">YaBoyRockLee Reactions</a>, 26:28</figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/onepiece/03-aliciaxlife.jpg" src="/media/arcmira-test/onepiece/03-aliciaxlife.mp4" style="width:100%"></video><figcaption><a href="https://www.youtube.com/watch?v=-S2BDjcmFRY&t=1023s">Aliciaxlife</a> (a VTuber), 17:03</figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/onepiece/04-carlie-and-ange.jpg" src="/media/arcmira-test/onepiece/04-carlie-and-ange.mp4" style="width:100%"></video><figcaption><a href="https://www.youtube.com/watch?v=EPQj0fiJPls&t=1108s">Carlie &amp; Ange</a>, 18:28</figcaption></figure>
<figure style="margin:0"><video controls playsinline preload="none" poster="/media/arcmira-test/onepiece/05-haylo-and-kiss.jpg" src="/media/arcmira-test/onepiece/05-haylo-and-kiss.mp4" style="width:100%"></video><figcaption><a href="https://www.youtube.com/watch?v=wa_w9jMaJIA&t=1380s">Haylo &amp; Kiss</a>, 23:00</figcaption></figure>
</div>

Here, captions weren't enough. People talk about a scene before and after it happens, and for one
channel the first caption match was the same smile remembered in the next episode. So Claude
downloaded a couple of minutes around each match, laid out one frame per second, and looked.
Matching the episode's own audio across videos failed completely: these channels shrink the anime
into a blurred corner and alter its sound, presumably to get past YouTube's copyright matching.

**Arcmira found nothing.** Over 24 searches, its closest hit was one reaction channel 200 episodes
short, for which it holds no searchable videos.

## So is Arcmira useful to me right now?

**What Claude already does well without it:** finding videos on a topic, ranking them by views,
reading each one's captions and description, finding the exact second something was said, checking
sponsors, and cutting the clip. Expect $2 to $3 and 12 to 26 minutes per job like these, plus a few
minutes of scripted cutting if you want clips. It's precise once it has a video's captions, and if
it needs to see something, it can look at the frames.

**What you give up without Arcmira:**

- **Podcasts and finance or business shows.** YouTube search ranks them low for a topic; Arcmira
  finds them. In test 3 that was an entirely different set of 12 videos.
- **Spoken mentions.** A name or company that's said but never written in a title or description.
- **Sponsor histories** for a channel, with counts and dates.
- **Counts.** "About 32 episodes on 16 channels" in one call, where Claude alone could only guess "50 to 150".

**What's harder with Arcmira:**

- **Coverage you can't see in advance.** No anime reaction channels, little dedicated space
  coverage. You only find out by searching.
- **The free plan's 30-day delay**, plus Pro-only filters such as ending a search at a date.
  Recent news, the first thing I'd want, is out.
- **Credits go fast.** One careless call with a large row limit can use half a month's allowance.
- **Setup and rough edges.** In the Claude desktop app, the documented sign-in didn't show up for
  me and an API key set from the terminal didn't reach sessions. Adding it as a custom connector
  worked. Each request is a small JavaScript program with a 30-second limit, and a few timed out.

**My verdict for now:** Claude alone covers most of what I'd do, including the part I cared about
most, finding and cutting exact moments. If a name is in a title, searching alone finds it, free and
across all of YouTube. Arcmira earns its keep on one thing: transcripts already pulled and
searchable, so it hears a name spoken in videos nobody would think to open, without hitting
YouTube's limits on downloading transcripts. For Skyebrows that was 25 moments no title or search
would have shown me, for 340 credits. The best version is both runs, merged. On the free plan, one
thorough name would cost more than the month's credits.
