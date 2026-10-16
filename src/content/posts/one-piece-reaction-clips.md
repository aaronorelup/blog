---
id: "AO-051"
title: "Finding one moment in five reaction videos, with and without a transcript API"
summary: "I asked Claude Code to find YouTubers reacting to one specific moment in One Piece and cut their reactions into clips. It got five, checked frame by frame, in 18 minutes. Next I run the same job through Arcmira, a transcript-search MCP, and compare."
date: 2026-10-16
status: "in-progress"
tags: ["claude-code", "video", "ffmpeg", "yt-dlp", "mcp", "arcmira"]
preview:
  verdict: "Five clips, frames did the work"
  takeaway: "Captions get an agent to within a minute or two of a moment in a reaction video. Looking at the frames is what finds it; matching audio didn't work at all."
  points:
    - "5 verified clips from 16 reaction videos, in 17 min 51 s and 35 model requests, about $2.13 at list price."
    - "Audio matching across videos failed every time: about 0.2 correlation, wrong positions, likely altered episode audio."
    - "The \"To Be Continued\" card right after the smile was the most reliable landmark, better than any caption."
---

Arcmira's founder emailed me after reading the [Clawd montage post](/posts/clawd-growth-montage/).
Arcmira indexes podcast and YouTube transcripts and gives an AI agent search over them
through an MCP server. Their pitch was about the gap between *finding* a passage and
*choosing a cut*, which is a real gap. So I picked a job that lives right in it.

The job: find YouTubers reacting to one moment in One Piece, and cut out each person's
reaction to it. The moment is in episode 715, "Senor's Elegy of Love." Senor Pink's wife
Russian has been unresponsive since an accident. He puts on their dead son's baby bonnet,
and she smiles for the first time. It's about ten seconds of anime, and it wrecks people.

This post is the first half: Claude Code doing it with ordinary tools. The second half,
the same job through Arcmira, gets added here when it's done.

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

## Next: the same job through Arcmira

Arcmira's MCP gives an agent transcript search with timestamps, and can order a transcript for a
video it hasn't indexed yet. Going by its docs, the index leans toward podcasts and long-form
interviews, so I don't know if these reaction channels are in it. That's part of what I want to
find out. Step 2 in the list above is the part it should replace. Steps 3 and 4, opening the
video and looking at it, are probably still on the agent.

I'll run the same request through it, measure time and tokens the same way, and add the results here.
