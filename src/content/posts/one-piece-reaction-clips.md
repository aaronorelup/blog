---
id: "AO-051"
title: "Finding one moment in five reaction videos, with and without a transcript API"
summary: "I asked Claude Code to find YouTubers reacting to one specific moment in One Piece and cut their reactions into clips, once with ordinary tools and once through Arcmira, a transcript-search MCP. One way got five clips. The other was faster and cheaper, and found nothing."
date: 2026-10-16
status: "in-progress"
tags: ["claude-code", "video", "ffmpeg", "yt-dlp", "mcp", "arcmira"]
preview:
  verdict: "Manual: 5 clips. Arcmira: 0"
  takeaway: "A transcript index only helps if the videos you want are in it. Arcmira covers podcasts and talk shows, not anime reaction channels, so plain YouTube search won."
  points:
    - "Manual: 5 verified clips in 17 min 51 s, 35 requests, about $2.13. Captions found the minute; frames found the moment."
    - "Arcmira: 24 searches in 2 min 45 s, 14 requests, about $0.94 plus 20 credits. No reaction to episode 715 in its index."
    - "Matching the episode's audio across videos failed every time, about 0.2 correlation, likely because reactors alter it."
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
is at the end, with the time, tokens and results of both.

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
