---
id: "AO-051"
title: "Testing a transcript-search MCP against doing it by hand"
summary: "I gave Claude Code the same research jobs twice, once with ordinary tools and once through Arcmira, a YouTube and podcast transcript-search MCP: anime reaction clips, then my own name and yesterday's Tesla Roadster reveal. Every number and result is here so you can judge it yourself."
date: 2026-10-16
status: "in-progress"
tags: ["claude-code", "video", "ffmpeg", "yt-dlp", "mcp", "arcmira"]
preview:
  verdict: "By hand found more, twice"
  takeaway: "Arcmira was faster and cheaper both times but found less: its index skips anime reaction channels, and the free plan can't see the newest 30 days."
  points:
    - "Reaction clips: by hand 5 verified clips in 17 min 51 s ($2.13). Arcmira 0 in 2 min 45 s ($0.94 + 20 credits)."
    - "Roadster reveal: by hand 18 videos, sponsors and 9 quoted moments in 12 min ($2.09). Arcmira: blocked by the 30-day delay."
    - "Arcmira's channel sponsor lists weren't delayed: sponsors last seen the day of the reveal, which YouTube search can't give you."
---

Arcmira's founder emailed me after reading the [Clawd montage post](/posts/clawd-growth-montage/).
Arcmira indexes podcast and YouTube transcripts and gives an AI agent search over them
through an MCP server. Their pitch was about the gap between *finding* a passage and
*choosing a cut*, which is a real gap. So I picked a job that lives right in it.

The job: find YouTubers reacting to one moment in One Piece, and cut out each person's
reaction to it. The moment is in episode 715, "Senor's Elegy of Love." Senor Pink's wife
Russian has been unresponsive since an accident. He puts on their dead son's baby bonnet,
and she smiles for the first time. It's about ten seconds of anime, and it wrecks people.

I ran it twice. First Claude Code did it with ordinary tools. Then a fresh Claude Code session
did the same job with Arcmira doing the finding. The [comparison](#the-same-job-through-arcmira)
is further down, with the time, tokens and results of both.

That first job turned out to be a bad fit for Arcmira, so I ran a second test closer to what
it's built for: [where my name comes up, and who covered yesterday's Tesla Roadster
reveal](#test-2-my-name-and-the-tesla-roadster-reveal). A third test, on a SpaceX story old
enough for Arcmira's free plan to see, is next. I'm giving every result and number so you can
draw your own conclusions.

## What it did

Everything ran locally with yt-dlp, ffmpeg and Python, which I already had installed.

1. **Search.** Two YouTube searches through yt-dlp ("one piece episode 715 reaction" and a
   variant) returned about 30 videos. It skipped the mashups, which stitch many reactors
   together, and kept 16 videos from individual channels.
2. **Captions.** It pulled YouTube's English auto-captions for all 16 and searched them for
   "bonnet", "smile" and "the hat". That got hits in most of them, things like "She smiled
   dude" or "oh that's a pink Bonnet".
3. **Download a window.** For 8 videos it downloaded only 2.5 minutes around the caption hit,
   not the whole 40-minute video.
4. **Look.** It built contact sheets, one frame every 2 to 3 seconds with a timestamp burned in,
   and read them. Then it built one-frame-per-second sheets around the moment to set the
   in and out points.
5. **Cut.** ffmpeg cut each clip from the bonnet reveal to just after the "To Be Continued"
   card, and wrote a manifest with the source links and timestamps.

## The clips

Here's what it found. The links jump to the start of each clip on YouTube, so you can check
them yourself.

| Channel | Source timestamps | Length | What's in it |
|---|---|---|---|
| [Rice & Ginger](https://www.youtube.com/watch?v=H9fSb0d0OIE&t=1572s) | 26:12–26:46 | 34 s | Bonnet, smile, card |
| [YaBoyRockLee Reactions](https://www.youtube.com/watch?v=QnamL-G2btY&t=1588s) | 26:28–27:07 | 39 s | Bonnet, smile, card |
| [Aliciaxlife](https://www.youtube.com/watch?v=-S2BDjcmFRY&t=1023s) | 17:03–17:37 | 34 s | Bonnet, smile, card (a VTuber, so it's an avatar reacting) |
| [Carlie & Ange](https://www.youtube.com/watch?v=EPQj0fiJPls&t=1108s) | 18:28–19:04 | 36 s | Bonnet, smile; the episode overlay is very faint |
| [Haylo & Kiss](https://www.youtube.com/watch?v=wa_w9jMaJIA&t=1380s) | 23:00–23:22 | 22 s | Bonnet, smile; their edit cuts the card |

I'm not rehosting the clips. They're other people's videos with other people's faces in them.

Three more didn't make it. For Into The Void and TGL Reacts the first window landed after
the moment, and the retry download stalled at zero bytes, so it stopped them. For Haylo &
Kiss the first wider window found a different smile: Senor Pink remembering it during the
next episode's fight. That's the same visual, said in the same words, and it's the wrong
moment. Only the frames told them apart.

## What didn't work

**Matching audio.** The plan was to take the episode audio of the moment from one video and
find it in all the others by cross-correlation. The episode is the same in every reaction,
so it should line up no matter where each person paused. It didn't. The reference matched
itself at 0.99. Every other video scored around 0.2 and landed in the wrong place, including
when it tried small pitch shifts. I'd guess these channels alter the episode audio to get past
YouTube's copyright matching, but that's a guess, not something we checked.

**Matching the picture** was never going to work either. Most of these channels shrink the
episode into a small blurred bubble in a corner for the same reason.

**Captions put it in the right minute, not the right second.** People talk about a moment
before it happens ("is that what made her smile?") and long after it. The first window for
three of the eight videos missed the moment entirely.

What actually worked was the "To Be Continued" card. In episode 715 the smile is the last
beat before the card, and the card is big red text on black. Even blurred into a bubble,
you can see it on a contact sheet. Thirty seconds before the card covers the bonnet, the
smile and the reaction.

## What it cost

Measured from Claude Code's own session log, not estimated:

| | Manual method |
|---|---|
| Wall-clock time | 17 min 51 s |
| Model requests | 35 |
| Output tokens | 22K |
| Cache writes / cache reads | 79K / 5.3M |
| List-price cost | $2.13 |
| Videos searched / clips verified | 16 / 5 |

Most of the cache reads are the contact sheets. Every one of those images stays in context
and gets re-read on each later request.

## The same job through Arcmira

Arcmira's MCP server gives an agent four tools. The one that does the work, `arcmira_execute_read`,
runs a short JavaScript program against their API: search transcripts, resolve a name to an
entity, list a channel's episodes, fetch one video's captions with timestamps. I'm on the free
plan: 1,000 credits a month, and the newest 30 days of video held back, which doesn't matter for
reactions posted years ago.

The rules for the second run were simple. Arcmira does all the finding and locating, so no
YouTube search and no YouTube captions. Once it names a video and a timestamp, the agent can
download a short window to check the frames and cut the clip, the same as the first run. It ran
in a fresh session, so its token count doesn't include anything from the first run.

It found nothing. Over 8 tool calls it ran 24 transcript searches and 9 name lookups: the
episode number, "Senor Pink bonnet", "Russian smile", "Gimlet", the auto-caption spelling
"Senior Pink", the Dressrosa arc, and a date window covering 2015 to 2020, when these reactions
went up. "One Piece" resolves only as a product mentioned in passing on talk shows and TEDx
talks. Senor Pink and Doflamingo don't resolve at all. The searches came back with Talk Python
and Y Combinator, matching words like "piece" and "episode".

The closest it got was a real reaction channel, Studio Gek, reacting to episodes 511 to 516,
200 episodes too early. Asked about that channel directly, Arcmira reports 0 searchable videos.
It had surfaced one passage from it and indexed nothing else. Two One Piece podcast channels also
show 0.

So Arcmira's index doesn't have these videos. Going by what came back, it covers podcasts and
talk and news shows, mostly from 2024 on, and anime reaction channels aren't in it. That isn't a bug, and it isn't the
free plan's delay. It's a different slice of YouTube from the one I needed. The session sent
Arcmira one feedback note about the gap.

## Side by side

Both measured from Claude Code's own session logs. The Arcmira column leaves out a first
attempt that stopped after about 15 seconds because the tools hadn't loaded yet.

| | Manual (yt-dlp + captions + frames) | Arcmira |
|---|---|---|
| Wall-clock time | 17 min 51 s | 2 min 45 s |
| Model requests | 35 | 14 |
| Output tokens | 22K | 12.7K |
| Cache writes / cache reads | 79K / 5.3M | 41K / 1.8M |
| List-price model cost | $2.13 | about $0.94 |
| Arcmira credits | none | 20 of 1,000 |
| Candidate videos found | 16 | 0 (1 reaction channel, wrong episode) |
| Clips verified | 5 | 0 |

The Arcmira run was faster and cheaper because it stopped early: once the index came back empty,
there was nothing to download or look at. A fair comparison would need a job where both methods
can find something.

Connecting it took longer than running it. The Claude desktop app didn't pass my API key to
sessions, so the first attempt saw the tools as "needs authentication" even though the key
worked from a terminal. It ran through a small Python client that calls the same MCP server directly,
and I later added Arcmira as a custom connector, which worked. That's maybe twenty minutes of
setup on top of the table.

What I take from it: a search index is only as good as what's in it, and you can't tell that
from the outside. Arcmira's own docs say it covers podcasts and long-form interviews, and that's
exactly where it stopped. For "what did podcasters say about this company last month" it's
probably the right tool. For "find me thirty strangers crying at the same anime scene", YouTube's
own search and some contact sheets still win. Either way, the step that actually found the
moment was looking at the frames, and neither method skips that.

## Test 2: my name, and the Tesla Roadster reveal

The anime test was unfair to Arcmira, since its index doesn't cover anime reaction channels.
So the second test asked the kind of thing it's sold for:

- **Part A.** Where and when has "Aaron Orelup" come up on YouTube or in podcasts? I expected nothing.
- **Part B.** Tesla revealed the new Roadster yesterday (October 15) and showed it jumping over a
  line of other cars. List the YouTube videos that covered it, with each one's sponsors, and for
  the top 10, the creator's main takeaway and the most memorable moment, with a timestamped link.

Both runs got the same written task, ran at the same time as fresh subagents on the same model
(Opus 5.5), and were told to stop after about 25 minutes of effort and say honestly how far they
got.

- **By hand:** web search, yt-dlp (YouTube search, video metadata and descriptions) and
  YouTube's auto-captions. No Arcmira.
- **Arcmira:** Arcmira for everything about the videos (finding them, sponsors, quotes,
  timestamps). Web search was allowed only to confirm what the event was. Free plan, captions
  only, a 300-credit cap.

One thing everyone should know before the results: **Arcmira's free plan withholds the newest
30 days of video.** On the day of the test it served media only through September 16. A reveal
from yesterday is outside that, and I knew it would be. I ran it anyway, because "can I find out
what people said about yesterday's news" is a fair thing to want from a tool like this, and the
answer on the free plan is part of the result.

### Results side by side

| | By hand | Arcmira (free plan) |
|---|---|---|
| Wall-clock time | 11 min 58 s | 5 min 58 s |
| Model requests | 29 | 24 |
| Output tokens | 32K | 26K |
| Cache writes / cache reads | 164K / 3.2M | 99K / 2.6M |
| List-price model cost | $2.09 | $1.54 |
| Arcmira credits | none | 56 (980 to 924) |
| Part A: "Aaron Orelup" | 10 videos with the name in a title, channel name or description; spoken mentions can't be searched | Not in the index; 0 passages for "Orelup" |
| Part B: event confirmed | Yes: Oct 15 evening, SpaceX's McGregor, Texas site | Yes: same |
| Part B: videos found | 18, with views | 0: blocked by the 30-day delay |
| Part B: sponsors | Checked for all 18 (descriptions and captions) | Channel-level lists for 6 likely channels, not per video |
| Part B: top-10 takeaways / quoted moments | 10 / 9 (one video has no captions) | 0 / 0 |

The Arcmira time includes a short second pass: partway through I told it to stop chasing the
reveal once the block was confirmed, and to record what it could still offer instead. Both runs'
numbers come from Claude Code's session logs. I checked the by-hand run's views, titles and
dates against the metadata it downloaded, and its sponsor finds and quotes against the captions
and descriptions. They match.

### Part A: my name

**By hand** found the name only where it's written down, never spoken, because YouTube's search
doesn't look inside captions. Two hits are my own uploads ([Ep 1: Crimson Coil](https://www.youtube.com/watch?v=7TusXDOgV4Y)
and [Ep 2: Earthlight](https://www.youtube.com/watch?v=URjg8hSlzz8), posted two days ago). There
were also three videos from a local band's channel that list "Aaron Orelup on Bass" in the
description, and five videos of a 2018 speech event that list an Aaron Orelup as speaker 6. It
didn't check whether either of those is me. A search for "Aaron Orelup podcast" returned nothing.

**Arcmira** searched speech, which is the part YouTube search can't do. The name isn't an entity
in its index. A passage search for "Aaron Orelup" returned 5 passages, all about other people
called Aaron or Aron (a caller named "Aaron from Ann Arbor" on The Dave Chang Show, for one).
"Orelup" alone returned 0. That covers the shows Arcmira indexes, through September 16.

Both answers come to "never on a podcast", which is what I expected. They get there from opposite
sides: one looks at titles and descriptions, the other at what people said out loud.

### Part B: what happened

Both runs confirmed it from news coverage. On the evening of October 15, at SpaceX's test site in
McGregor, Texas, after a weather delay from October 1, Tesla showed the new Roadster:

- It drove upside down on an inverted ramp, held on by an underbody fan.
- It used SpaceX cold-gas thrusters to jump over a line of Teslas: a Cybercab, Cybertruck, Semi,
  Model Y and Model 3, per [TechCrunch](https://techcrunch.com/2026/10/15/tesla-reveals-spacex-powered-roadster-that-flies-and-falls-with-style/).
  Gizmodo called it a corkscrew over "the entire Tesla vehicle fleet".
- It ran 0-60 mph in 0.81 seconds, live.
- Musk said production starts in 2028. No final price was given.

The two runs named the versions differently. The by-hand run had Performance, Thrust and an
invite-only single-seat flying model, with reservations of $50k and $250k. The Arcmira run, from
other articles, had Performance, Thrust and Rocket. I'm leaving both as each run reported them.

### Part B, by hand: the videos

Ranked by views on October 16 around 4 pm Central. Tesla's three short promo clips are left out.
"None found" means it checked both the description and the captions.

| # | Channel (subscribers) | Video | Views | Sponsors (where found) |
|---|---|---|---|---|
| 1 | Tesla (3.04M) | [Roadster Event](https://www.youtube.com/watch?v=qt5p-_tE8d0) | 4,573,564 | none; official stream |
| 2 | CNET (4.1M) | [Everything That Happened in 10 Minutes](https://www.youtube.com/watch?v=TWHXrLzUKJc) | 4,096,441 | none found |
| 3 | VideoFromSpace (2.16M) | [Tesla Unveils 'Flying' Roadster](https://www.youtube.com/watch?v=eqOfmtTJD1A) | 2,549,873 | none found |
| 4 | carwow (11.1M) | [New Tesla Roadster is here, and it's INSANE!](https://www.youtube.com/watch?v=4bbfRQDC6cs) | 2,288,009 | none found |
| 5 | ABC News (19.9M) | [Elon Musk unveils Tesla's new Roadster](https://www.youtube.com/watch?v=BYWy6SyJRZo) | 1,700,086 | none found |
| 6 | YOUCAR (2.67M) | [NEW TESLA ROADSTER - It Can Fly!!!](https://www.youtube.com/watch?v=Fdhwkap2DFU) | 1,520,329 | none in description; no captions, so an ad read can't be ruled out |
| 7 | Hagerty (3.87M) | [The FLYING Tesla Roadster explained...](https://www.youtube.com/watch?v=22rvpUecLts) | 1,130,426 | Hagerty's own insurance (ad read ~2:20, description) |
| 8 | DPCcars (428K) | [Tesla Roadster Finally Unveiled](https://www.youtube.com/watch?v=j8lbY_D7xcY) | 666,668 | none found |
| 9 | DragTimes (564K) | [INSIDE LOOK! I saw the Flying Tesla Roadster](https://www.youtube.com/watch?v=_lq-DpCE9rU) | 656,395 | no ad read; one dealer link, relationship unknown |
| 10 | Top Gear (9.55M) | [New Tesla Roadster: SpaceX Thrusters...](https://www.youtube.com/watch?v=JdkIOhFmbKI) | 636,809 | none found |
| 11 | news.com.au (1.39M) | [Tesla's new Roadster can FLY](https://www.youtube.com/watch?v=aN6strasoHA) | 571,446 | none found |
| 12 | 7NEWS Australia (2.26M) | [Elon Musk unveils flying Tesla Roadster](https://www.youtube.com/watch?v=_iRhJ1JBRrg) | 554,362 | none in description; no captions |
| 13 | REC Anything (314K) | [All New 2028 Tesla Roadster can Fly](https://www.youtube.com/watch?v=d2jH2x1HWxE) | 458,368 | none found |
| 14 | Valuetainment (7.16M) | [Elon Musk Just Changed Cars Forever](https://www.youtube.com/watch?v=GwffNnmuqfk) | 430,805 | no ad read; a Kalshi link in the description, sponsorship unconfirmed |
| 15 | Solving The Money Problem (304K) | [Tesla Roadster Literally Flies](https://www.youtube.com/watch?v=OhKR-klyTHw) | 273,486 | **AG1** (ad read ~9:40, description) |
| 16 | NDTV (16.1M) | [Musk Unveils New Flying Car](https://www.youtube.com/watch?v=8B52ozuefgU) | 256,637 | none found |
| 17 | Ryan Shaw (347K) | [Tesla's Roadster Just Launched](https://www.youtube.com/watch?v=A2SpqBtHvOs) | 240,667 | no ad read; affiliate and referral links only |
| 18 | Out of Spec Reviews (328K) | [I Went To The Tesla Roadster Unveil!](https://www.youtube.com/watch?v=7oFL2ObpM08) | 183,778 | **IONNA, Lincoln Electric** (ad read near the start, description) |

Only two of the 18 had a paid third-party sponsor. Most of the top videos are news outlets and
event re-uploads, which don't carry ad reads.

**The top 10's takeaways and most memorable moments.** Quotes are YouTube's auto-captions word for
word. Each timestamp is the start of a 20-second caption window, so it can be up to 20 seconds early.

1. **Tesla:** pitched as "the last best driver's car" that also flies, production in 2028.
   [11:20](https://www.youtube.com/watch?v=qt5p-_tE8d0&t=680): "Tony Hawk would be proud. We call
   that the kick flip... I think we could have cleared more than our whole fleet."
2. **CNET:** a supercut of the event, no commentary of its own.
   [2:00](https://www.youtube.com/watch?v=TWHXrLzUKJc&t=120): "Well, it worked."
3. **VideoFromSpace:** event footage, no commentary.
   [1:20](https://www.youtube.com/watch?v=eqOfmtTJD1A&t=80): "Flying cars are real... the future
   promised us flying cars, but instead we got 140 characters. Well, not anymore."
4. **carwow:** impressed but sceptical. The 0.81 s run is unverified, the demo cars looked
   lightened, and 2028 deserves "a fairly big pinch of salt".
   [0:40](https://www.youtube.com/watch?v=4bbfRQDC6cs&t=40): "I didn't really believe it. But
   after last night's event, I might have to eat some humble pie."
5. **ABC News:** the trims and prices, and a reminder of the 2017 deposits for a car never delivered.
   [1:00](https://www.youtube.com/watch?v=BYWy6SyJRZo&t=60): "There is skepticism surrounding the announcement."
6. **YOUCAR:** an upbeat spec rundown, taken from the description only because there are no
   captions, so it's unverified. No moment.
7. **Hagerty:** a technical walk-round with Tesla's Lars Moravy, recorded before the reveal, with
   a postscript after it. [26:40](https://www.youtube.com/watch?v=22rvpUecLts&t=1600): "It seems
   almost more real and yet more unreal. I I cannot see how that is ever going to go on sale somehow."
8. **DPCcars:** a re-upload of the full event.
   [19:00](https://www.youtube.com/watch?v=j8lbY_D7xcY&t=1140): "...attempt to jump the Snake River
   Canyon. >> Oh yeah, >> let's give it another shot."
9. **DragTimes:** a thrilled in-person walkaround; you "can't buy the one that flies".
   [14:20](https://www.youtube.com/watch?v=_lq-DpCE9rU&t=860): "Everyone's been texting me right
   now. They didn't think it was real."
10. **Top Gear:** a design deep-dive recorded before the reveal; it might be a game-changer.
    [48:40](https://www.youtube.com/watch?v=JdkIOhFmbKI&t=2920): "For me, this feels like a Bugatti
    Veyron moment where the top brass set absolutely impossible ideals..."

What slowed it down: YouTube rate-limited the caption downloads (HTTP 429), so it had to retry
with delays. Two videos have no captions, and one news site blocked fetching.

### Part B, Arcmira: what it could and couldn't do

Its search for videos from October 14 onward came back with a gate:
`freshness_requires_paid`, "Results on this plan stop at 2026-09-16; media published after it
requires Pro," and a link to start a Pro trial. It didn't try to get around it, so it has no
reveal videos, views, takeaways or moments.

Here's what it could still add from inside the served window. None of it is about the reveal itself.

**Channels that talked about the Tesla Roadster before**, counting indexed episodes through
September 16 that mention it: WVFRM Podcast (10), TBPN (8), John Coogan (4), The Iced Coffee Hour
(4), Bloomberg Podcasts (3), then Core Memory, Eli the Computer Guy, etn. and Doug DeMuro (2 each).
Searches for Marques Brownlee, Out of Spec Reviews, Fully Charged Show and Donut by name found nothing.

**Those channels' recurring sponsors**, with ad-read counts and the date each was last seen:

| Channel | Top recurring sponsors |
|---|---|
| WVFRM Podcast | Shopify (71, last Oct 2), Framer (32, Oct 9), Netsuite (25), Coda (19), Visible (14) |
| TBPN | Ramp (313, Oct 14), Figma (220, Oct 8), Public (198, Oct 14), Vanta (167), AdQuick (151, lapsed) |
| Doug DeMuro | DeleteMe (7, Sep 11), Cars & Bids (6, Oct 15), Shopify (5), Warby Parker (5, Oct 9), Mothers (4, Oct 15) |
| The Iced Coffee Hour | Shopify (19, Oct 11), Netsuite (7), Upwork (5), Gusto (4), Opus Clip (4) |
| John Coogan | Ramp (33), Figma (24), Public (22), Vanta (18), Restream (17) |
| Bloomberg Podcasts | OpenAI (62), Bloomberg (49), Comcast Business (21), ChatGPT (18), Cincinnati Insurance (17) |

Those last-seen dates run up to October 15, so sponsor data isn't held back the way video search
is. Nothing in the by-hand toolkit gives you a channel's sponsor history like that. You'd have to
read every description yourself.

**Pre-event chatter** it found: John Coogan and Bloomberg Podcasts on August 14 about leaked plans
for a flying Roadster demo, a passing "there will be the Roadster" on 20VC on September 12, and TBPN
on September 15 ("Because he's coming out with the Roadster." / "But that's in October, right?").

None of the six channels Arcmira ranked highest for Roadster talk showed up in the by-hand top 18.
They're podcasts and talk shows, while the by-hand list is car channels, news outlets and
re-uploads. That's two different slices of YouTube.

### What I'd take from test 2

On the free plan, Arcmira can't answer questions about the last month, and "who covered
yesterday's news" is exactly that. Doing it by hand worked better than I expected: 18 videos,
sponsors checked, nine quoted moments, in 12 minutes for about two dollars. What by hand can't do
is search what people *said*. My name test shows that from the other side: YouTube search only
found me where I'm written down. Test 3 asks a SpaceX question old enough for the free plan to
see, so both methods are working with the same videos.
