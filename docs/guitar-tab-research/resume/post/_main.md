I want to build a web app that turns a song, or a video of someone playing guitar, into tabs. Tabs are guitar music written as fret numbers on six lines, one per string. Before building anything I had a team of Claude agents list every tool they could find for each step, run the ones that would run, and read each license. **Their ten lists hold 797 tools, apps, models and file formats, and 162 of those entries gave output** on a rented cloud computer with no graphics card. Some tools are on more than one list. 154 entries have steps written for me instead, because they need a graphics card, an account or my own hands. I asked for facts only: what went in and what came out, with no grades and no picks.

This is where the work stood when I stopped it. The run used up most of my weekly Claude limit, so eight of the eleven sections below are complete and went through two fact-checking agents each, and three are short for now.

The app would work in steps, with a person correcting it along the way. Split the song into instruments. Turn the guitar into notes. Find the chords and the beat. Choose a string and a fret for each note. Show the tab, play it back against a metronome, and run the analysis again when the person says there's a capo on fret 2. A capo is a clamp across the strings that raises every note. For a fingerstyle video it would also watch the hands. I'd already had three AI passes turn ten of my own guitar videos into tabs. This time each tool gets looked at by itself.

## The quick rundown

{{RUNDOWN}}

## How the tests worked

Everything ran on one rented cloud computer with 4 processor cores, 15 GB of memory and no graphics card. I call it the cloud box. Most of these tools are built for a graphics card, so the times here are what a plain processor gives.

The agents worked in ten groups, one per step. My notes call each group a lane. In each lane one agent installed and ran tools, one read the docs and the licenses, and two more checked that work against the saved files and the source pages. Then a critic listed 52 gaps, and more agents went back for them. An eleventh group ran tools from different lanes in a chain.

Every tool got the same 17 test clips. Nine are synthesized, so every note, string, fret, beat and chord in them is known. Three are real solo guitar recordings that come with their notes written down. One is a real band song with singing, short and whole. Three are real videos of people playing classical guitar. When a section says a tool found 84 of 90 notes, the 90 are a clip's known notes, and a note counts as found when the tool put the same pitch within 50 milliseconds of it.

Each run went through one wrapper that logged the exact command, the input file and the time. It logged 722 runs. 246 of them had 2 of the box's 4 cores to themselves, 4 had all four, and the rest ran next to other jobs. Each section says which. 46 runs ended in an error. The counts against the known answers came from one counting tool, which logged 1,836 runs of its own.

Claude's permission system on the cloud box refused to install or run code copied from other people's repositories in most cases, and it wouldn't tick a consent box for me. That kept research models such as MT3, ADTOF and LarsNet from running here. They're on my list instead.

{{FILE:_clips.md}}

## What it cost

The run took about six hours and 139 agents: 118 on Claude Opus 5.5, 20 on Sonnet 5.5 and one on Fable 5.2 directing them. Together they wrote 20.8 million tokens of output and re-read 5.9 billion tokens of their own context from cache. At Anthropic's list prices for API use that comes to about $1,950 to $2,170. The range is there because writing to the cache has two prices and my logs don't say which one applied.

I didn't pay that. It ran on my Claude subscription, where this run and one other session used about 90% of a week's limit. Outside services came to $0.96 in total, most of it ElevenLabs credits at an estimated price, because ElevenLabs doesn't publish a price per credit. No graphics card was rented.

<details><summary>The token counts by model</summary>

These come from the agents' own transcripts on the cloud box, read when I stopped the run. Prices are from Anthropic's pricing page on 2026-11-11, per million tokens.

| Model | Agents | Output tokens | Cache reads | Cache writes | Price for output | Price for a cache read |
|---|---|---|---|---|---|---|
| Claude Opus 5.5 | 118 | 19,233,670 | 5,810,628,216 | 68,164,105 | $20 | $0.20 |
| Claude Sonnet 5.5 | 20 | 1,245,797 | 79,691,320 | 4,493,297 | $10 | $0.10 |
| Claude Fable 5.2 | 1 | 333,899 | 56,093,186 | 672,600 | $40 | $0.20 |

A cache write costs $5 or $8 per million tokens on Opus 5.5, $2.50 or $4 on Sonnet 5.5 and $10 or $16 on Fable 5.2, by how long the cache is kept. Input that wasn't cached was 34,505 tokens in all. The measured file is in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/costs).

</details>

## What plugs into what

The part of this I most wanted is which tool's output fits which tool's input. My agents ran five chains across the lanes to find out, and the section called "Tools handing off to each other" below has every joint with what had to be converted between the two tools. One chain went from a full band mix to a drawn tab: a separated guitar track, then notes, then a string and fret for each note, then a Guitar Pro file, then a picture of the tab. Each tool's entry in the other sections also has a "Hands off to" line.

The full map across all the tools isn't drawn yet. That was the next job when I stopped.

## What I still have to run myself

154 entries have steps written for me, because they need a graphics card, an account, a desktop or phone app, or a click the cloud box wouldn't make. The steps name which test clip to use and what to send back, so an agent can count my result the same way as the others. They're in ten files, one per step, and [one page lists them](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/FOR_AARON.md). I haven't done any of them yet.

<details><summary>The ten lists of steps</summary>

| Step | Entries with steps for me | The steps |
|---|---|---|
| Splitting a song into instruments | 11 | [for-aaron.md](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/source-separation/for-aaron.md) |
| Turning sound into notes | 21 | [for-aaron.md](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/audio-to-notes/for-aaron.md) |
| Chords, beat, key and tuning | 13 | [for-aaron.md](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/chords-beats-key/for-aaron.md) |
| Choosing the string and fret | 8 | [for-aaron.md](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/guitar-tab/for-aaron.md) |
| Melody, bass and taps from one guitar | 19 | [for-aaron.md](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/fingerstyle-voices-taps/for-aaron.md) |
| Reading hands and the fretboard from video | 11 | [for-aaron.md](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/video-hands-fretboard/for-aaron.md) |
| Showing, editing and playing a tab in the browser | 8 | [for-aaron.md](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/web-tab-render/for-aaron.md) |
| Metronome and sync in the browser | 14 | [for-aaron.md](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/browser-audio-sync/for-aaron.md) |
| Services an agent can call over the internet | 21 | [for-aaron.md](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/hosted-apis/for-aaron.md) |
| Apps that already do some of this | 28 | [for-aaron.md](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/apps-survey/for-aaron.md) |

The browser list also has a page I can open in my own browser to repeat the metronome timing test and one model test, since the cloud box has no sound card and no graphics card.

</details>

{{SECTIONS}}

## Sound and video still to upload

The separated tracks, playback recordings and hand-tracking videos my agents made aren't on this site yet. The test clips are filed in my media library. The outputs are listed here by the section that made them, as the agents wrote the lists.

{{FILE:_pending.md}}

*Researched, run and checked by a team of Claude agents on 2026-11-10 and 11: Fable 5.2 directing, Opus 5.5 and Sonnet 5.5 doing the work. I haven't run any of these tools myself yet. Every run, quote and count is in [the research folder](https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research).*
