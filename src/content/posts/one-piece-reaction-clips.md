---
id: "AO-051"
title: "Can Claude find a specific moment in a YouTube video, and does Arcmira help?"
summary: "I'd never asked Claude to pull exact moments out of videos or research who said what on YouTube. So I ran three tests, with and without Arcmira, a transcript-search tool built for exactly that. Every clip it found is on this page; judge them yourself."
date: 2026-10-16
status: "in-progress"
tags: ["claude-code", "video", "research", "yt-dlp", "mcp", "arcmira"]
preview:
  verdict: "Claude alone is strong"
  takeaway: "Claude alone found and cut exact moments from YouTube videos for $2-3 a job. Arcmira found a different part of YouTube: podcasts and finance shows."
  points:
    - "On a SpaceX question, the two lists of videos had zero overlap: space channels by hand, podcasts and finance shows via Arcmira."
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

So I gave Claude Code three research jobs and ran each one twice, at the same time, in fresh
sessions on the same model (Opus 5.5):

- **Claude alone:** web search, plus yt-dlp to search YouTube and read video details and captions.
- **With Arcmira:** Arcmira for everything about the videos. Web search only to confirm what an event was.

Time and tokens come from Claude Code's own logs. Then I had Claude cut every moment either side
found into a clip, so you can check the work without leaving this page.

## The short answer

- **Claude alone is genuinely good at this.** In every test it found the videos, read their
  captions and descriptions, and pinned down quotes word for word. A job took 12 to 26 minutes
  and $2 to $3 of model time.
- **Arcmira searches a different part of YouTube.** On the same SpaceX question, Claude alone
  found space channels: NASASpaceflight, Marcus House, Everyday Astronaut. Arcmira found
  podcasts and finance shows: All-In, Bloomberg, ARK Invest. **Not one video was on both lists.**
- **Arcmira hears names that are only spoken.** That's the thing Claude alone can't do, because
  YouTube's search only reads titles and descriptions. For "who's talking about this person or
  company on podcasts", Arcmira was clearly better.
- **Arcmira has hard limits as it stands.** Its index skips whole genres (anime reaction channels
  weren't in it at all), and the free plan can't see the last 30 days. Credits also go fast: one
  test used 580 of the 1,000 a month.
- **Both methods got timestamps wrong by up to 19 seconds**, but every quote was real. When I
  re-timed each clip from the captions' word timings, all 33 quotes I tried were found, word for word.

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
most, finding and cutting exact moments. Arcmira is worth having for one job: tracking what
podcasts and business shows say about a person, company or topic. For that it found things Claude
couldn't, and the useful version is probably two runs side by side, not one tool instead of the other.
