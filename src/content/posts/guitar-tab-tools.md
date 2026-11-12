---
id: "AO-082"
title: "Testing the tools a guitar tab web app would need"
summary: "I had Claude agents list every tool they could find for turning songs and guitar videos into tabs, run what they could on test clips and read each license. What went in, what came out, what it cost."
date: 2026-11-10
topic: "agents"
project: []
unlisted: true     # live at its URL only for now: listing it needs npm run ask:pin (docs/ASK.md) and starts the read-aloud
preview:
  verdict: "138 of 575 tools ran"
  takeaway: "My agents' ten lists come to 575 tools for a guitar tab web app. 138 of them ran, 128 on a cloud computer with no graphics card."
  points:
    - "One chain turned a full band mix into a drawn tab, by way of a guitar track, notes, strings and frets, and a tab file."
    - "With a capo on fret 2, no chord tool named it or the G and C shapes played. Xiaomi's MiMo said fret 2 in 2 of 3 tries."
    - "It took 183 agents in two sittings. At API list prices that's about $2,430 to $2,700 of tokens."
  image: "/media/previews/guitar-tab-tools.webp"
  alt: "Four fingertips on a straightened close-up of a guitar neck, each with a green dot and the string and fret a program gave it (index s4 f3, middle s5 f4, ring s2 f5, pinky s2 f5), magenta lines where it found fret-like lines and cyan fret numbers 0 to 6 along the top"
---

I want to build a web app that turns a song, or a video of someone playing guitar, into tabs. Tabs are guitar music written as fret numbers on six lines, one per string. Before building anything I had a team of Claude agents list every tool they could find for each step, run the ones they could in the time they had, and read each license. **Their ten lists come to 575 tools, and 138 of them ran**: 128 on a cloud computer with no graphics card, which I call the cloud box, and 10 more through a public demo page or a service an agent can call, counting two helpers those calls went through. 116 others have steps written for me instead, because they need a graphics card, an account or my own hands, or because Claude's permission system wouldn't let my agents install or run them. I asked for facts only: what went in and what came out, with no grades and no picks.

The app would work in steps, with a person correcting it along the way. Split the song into instruments. Turn the guitar into notes. Find the chords and the beat. Choose a string and a fret for each note. Show the tab, play it back against a metronome, and run the analysis again when the person says there's a capo on fret 2. A capo is a clamp across the strings that raises every note. For a fingerstyle video, a guitar played with the fingers, it would also watch the hands. I'd already had three AI passes turn ten of my own guitar videos into tabs. This time each tool gets looked at by itself.

## The quick rundown

- **My agents listed 60 tools for splitting songs into instruments, and 16 ran on the cloud box.** Four models that ran write a guitar track. The six-track model of the separator Demucs put a lone synthesized steel-string guitar in its piano track in 2 of 2 runs.
- **15 of the 68 tools, apps and services my agents listed for turning sound into notes ran on the cloud box.** Four write MIDI, a list of notes, straight from the audio. On a 90-note clip I synthesized they returned 87 to 137 notes, with 79 to 90 of the real ones among them.
- **For chords, beat, key and tuning, 20 of 71 listed tools ran, and none reports a capo or the notes the strings are tuned to.** On a 24-second strummed clip, seven chord recognizers had the right chord, or none over its silent start, for 18.8 to 23.2 seconds, counting a played D7 as D.
- **My agents listed 95 tools, models, papers, apps and datasets for choosing the string and fret, and 13 ran on the cloud box.** Given a synthesized clip's 90 notes, the six tools that turn notes into tab put 14 to 90 on the known string and fret.
- **For one guitar's melody, bass and taps, 13 of 52 listed tools, apps and research projects ran. No onset detector's output said which sounds were taps.** With 32 drum-kit hits as taps, 23 of 25 detector settings marked all 53 moments a note or tap starts.
- **Hands and frets from video: of 75 tools, papers and datasets, 17 tools gave output, all of them on the cloud box.** In a wide concert shot, Google's MediaPipe hand tracker put a second "hand" on the sheet music in 215 of 221 frames.
- **My agents listed 80 tools, formats and sound banks for showing, editing and playing a tab, and 18 ran on the cloud box.** Of the six that read my synthesized test piece's tab file, alphaTab, guitarpro-parser, PyGuitarPro and TuxGuitar kept all 90 notes on the known string and fret.
- **My agents tried 36 of the 101 entries they listed for a click track, sync and playback in the browser.** With the page kept busy, an AudioWorklet, code inside the audio stream, put 0 of 122 clicks off the beat, and a look-ahead loop that books clicks early put 11 off.
- **My agents linked 15 tools from the other lanes into five chains, running 8 of them and reusing files the other 7 had already made.** On S4, a band mix I synthesized, Demucs, Basic Pitch and tuttut together found 233 of the 369 guitar notes.
- **Of the 76 entries on my agents' list of services an agent can call online, 10 sent back results.** On a 90-note clip I synthesized, Xiaomi's MiMo returned 29 notes (1 of the 90 among them), Meta's Muse Spark Open none and YourMT3 126 (79 among them).
- **My agents listed 60 existing apps and related projects, and none ran to a result in the apps tests.** Six ran in other sections. AnthemScore Web stopped at a box confirming I own the audio or have the rights, which Claude's permission system wouldn't let an agent tick.

## How the tests worked

Everything my agents ran themselves ran on the cloud box, one cloud computer with 4 processor cores, 15 GiB of memory and no graphics card. The demo pages and online services ran on their own machines. With no graphics card here, the times are what a plain processor gives.

The agents worked in ten groups, one per step, and my notes call each group a lane. The lanes shared one set of 17 test clips, and each tool's entry says which ones it got. A few lanes added inputs of their own. Nine of the 17 are synthesized, so every note, string, fret, beat and chord in them is known. Three are real solo guitar recordings that come with their notes written down. One is a real band song with singing, short and whole. Three are real videos of people playing classical guitar. When a section says Transkun found 88 of 90 notes on S2n, the 90 are that clip's known notes, and a note counts as found when the tool put the same pitch within 50 milliseconds of it.

<details><summary>Who did the work, the run log and the refused installs</summary>

In each lane one agent installed and ran tools, one read the docs and the licenses, and two more checked that work against the saved files and the source pages. A fifth turned their reports into the lane's list of tools. Then a critic listed 52 gaps, more agents went back for them, and other agents checked what those added. An eleventh group ran tools from different lanes in a chain.

Each run went through one wrapper that logged the exact command, the input file and the time. It logged 730 runs, the first of them its own self-test. 253 had 2 of the box's 4 cores to themselves, 5 had all four, and 471 ran next to other jobs. Each section says which. 46 runs ended in an error. Most of the counts against the known answers came from one counting tool, which logged 1,856 runs of its own.

Claude's permission system on the cloud box refused, in most cases, to install or run code from other people's repositories and downloaded programs. It also wouldn't tick a consent box for me or let an agent get past a site's bot check. That kept research models such as MT3, ADTOF and LarsNet from running here. They're on my list instead.

</details>

<details><summary>The ten lists in numbers</summary>

An entry is one tool, app, model, dataset or file format on one lane's list. "Marked as run" and "with steps for me" are the two marks my agents kept on each entry.

| Step | Entries | Marked as run | With steps for me |
|---|---|---|---|
| Splitting a song into instruments | 64 | 16 | 11 |
| Turning sound into notes | 99 | 16 | 21 |
| Chords, beat, key and tuning | 85 | 20 | 18 |
| Choosing the string and fret | 95 | 13 | 8 |
| Melody, bass and taps from one guitar | 65 | 14 | 19 |
| Reading hands and the fretboard from video | 75 | 17 | 11 |
| Showing, editing and playing a tab in the browser | 80 | 18 | 8 |
| Metronome and sync in the browser | 101 | 36 | 14 |
| Services an agent can call over the internet | 76 | 13 | 21 |
| Apps that already do some of this | 60 | 0 | 28 |
| All ten | 800 | 163 | 159 |

96 of the 800 entries are datasets, and some tools are on more than one list. A script merged the other 704 entries into 575 tools and gave each one status: 128 ran on the cloud box, 10 ran only on a public demo page or through a service, two of them helpers the calls went through, 116 didn't run and have steps for me, and 321 didn't run and have nothing for me to run. 29 of the tools that ran also have steps for me. The sections below count their own way, so a section's numbers can be smaller than its row here: a helper library or a dataset used as a test clip is an entry too.

</details>

<details><summary>The 17 test clips</summary>

"Synthesized" means a program played the clip from a list of notes with sampled instrument sounds, a guitar in all of them, plus drums, a bass and a voice in S4 and drum-kit hits in S6taps. So there is no room, no finger noise and no doubt about what was played. That makes them a much cleaner signal than a microphone recording, and results on them don't carry over to the real clips as they are. The sampled guitar sounds the same on every string, so nothing in the sound says which string a note was on.

| Clip | What it is | Length | What's known about it |
|---|---|---|---|
| S1 | One melody, one note at a time, on nylon strings. It's the "Ode to Joy" theme | 30 s | all 62 notes with their string and fret, and 64 beats |
| S2n and S2s | Fingerstyle, a thumb bass under a melody. The same 90 notes on nylon strings and on steel strings | 29 s | every note with its string and fret, 48 beats and the chords |
| S3 | Strummed chords, 8 bars, steel strings | 24 s | 182 notes, the chords and 32 beats |
| S4 | A four-part band: drums, bass, strummed guitar and a lead line | 39 s | 661 notes, the chords, 68 beats and each instrument's track alone |
| S5capo2 | The S2 piece with a capo on fret 2 | 29 s | the same as S2, plus the capo |
| S5dropd | The S2 piece in Drop D, with the lowest string tuned down to D | 29 s | the same as S2, plus the tuning |
| S6taps | The S2 piece on steel strings with 32 drum-kit hits mixed in, standing in for taps on the guitar's body | 29 s | the notes and the 32 tap times |
| S7flat30 | The S3 chords tuned 30 cents flat. A cent is a hundredth of the step between two frets | 24 s | the same as S3, plus the offset |
| R1a, R1b and R1c | Real solo guitar from GuitarSet, a research dataset: a singer-songwriter accompaniment, a rock solo and a bossa nova accompaniment | 28 to 29 s each | the dataset's own notes with their strings: 189, 70 and 148 of them |
| R2 and R2full | A real band song with singing, as a 36-second piece and whole | 36 s and 3 min 48 s | the artist's own instrumental version, and a vocal track made by subtracting it from the song |
| R3a | A classical guitar concert filmed from the front, 640 by 480 pixels | 18 s | nothing |
| R3b | A close view of a fretboard and the fretting hand, 1920 by 1080 pixels | 18 s | no notes, only a written description that says no capo |
| R3c | A guitar lesson with both hands in view, 1920 by 1080 pixels | 18 s | no notes, only a written description that says no capo |

Where the real clips come from: GuitarSet is by Xi, Bittner, Pauwels, Ye and Bello and is under CC BY 4.0. The song is "I Want to Destroy Something Beautiful" by [Josh Woodward](https://www.joshwoodward.com/), CC BY 4.0. R3a is from "Crescendo 313 - DRH - Meredith Connie Solo Classical Guitar - Part II" by Mark Andersen and Seattle Community Media, CC BY-SA 4.0. R3b is a recording by Brylie Christopher Oxley, CC0. R3c is "Manx Guitar Lesson: Three Little Boats" by Culture Vannin, presented by Pete Lumb, CC BY 3.0. The synthesized clips use the FluidR3_GM sound bank by Frank Wen, under the MIT license. The notes, strings, frets and license quotes for every clip are in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/inputs).

</details>

## What it cost

The run took two sittings and 183 agents. The first sitting was about six hours and 139 agents. I stopped it when it and one other session had used about 90% of my weekly Claude limit. I picked it up again a day later, and the second sitting took about four hours and 44 more agents. Together they wrote 26.6 million tokens, the word pieces a model reads and writes, and re-read 7.3 billion tokens of their own context from a cache, a stored copy that's cheaper to read. At Anthropic's list prices for its API, the pay-per-token way programs use Claude, that comes to about $2,430 to $2,700. The range is there because writing to the cache has two prices and my logs don't say which one applied.

I didn't pay that. It ran on my Claude subscription. Outside services came to $0.96 in total, most of it ElevenLabs credits at an estimated price, because ElevenLabs doesn't publish a price per credit. No graphics card was rented.

<details><summary>The token counts by sitting and model</summary>

These come from the agents' own transcripts on the cloud box. Prices are from Anthropic's pricing page on 2026-11-11, per million tokens. In both sittings one Fable 5.2 agent directed the others. The second count starts where the first one ended, so it also holds that agent's last stretch of the first sitting, when it put the post together and published it.

| Sitting | Model | Agents | Output tokens | Cache reads | Cache writes |
|---|---|---|---|---|---|
| First, 2026-11-10 and 11 | Claude Opus 5.5 | 118 | 19,233,670 | 5,810,628,216 | 68,164,105 |
| First | Claude Sonnet 5.5 | 20 | 1,245,797 | 79,691,320 | 4,493,297 |
| First | Claude Fable 5.2 | 1 | 333,899 | 56,093,186 | 672,600 |
| Second | Claude Opus 5.5 | 40 | 5,562,232 | 1,283,599,814 | 17,266,799 |
| Second | Claude Sonnet 5.5 | 4 | 76,056 | 10,779,527 | 780,437 |
| Second | Claude Fable 5.2 | the same 1 | 159,944 | 43,784,394 | 414,346 |

| Model | Input | Output | Cache read | Cache write |
|---|---|---|---|---|
| Claude Opus 5.5 | $4 | $20 | $0.20 | $5 or $8 |
| Claude Sonnet 5.5 | $2 | $10 | $0.10 | $2.50 or $4 |
| Claude Fable 5.2 | $8 | $40 | $0.20 | $10 or $16 |

A cache write has two prices by how long the cache is kept. Input that wasn't cached was 42,341 tokens in all. The first count alone comes to about $1,950 to $2,170 and the second to about $480 to $530. The measured files are in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/costs).

</details>

## What plugs into what

I also asked which tool's output fits which tool's input. My agents wrote that down as [one map](https://github.com/aaronorelup/blog/blob/research/guitar-tab-tools/docs/guitar-tab-research/HANDOFFS.md): the 575 tools sorted into the app's steps, 61 of them hosts, runtimes and other tools that aren't a step of their own, with 292 handoffs between them. 83 of the handoffs were tested. In 64 of those the second tool read the first tool's real output, in 7 one tool ran the other itself, and in 2 the two tools' outputs were lined up by time. In the other 10 a tool read or wrote a file in the other tool's format, made from a clip's known notes. The remaining 209 handoffs come from what the two tools' documentation says they write and read.

<ao-compare cols="1" aspect="16/5">
<figure><img src="/media/guitar-tab-tools/handoffs-overview.webp" width="1400" height="429" alt="Eleven rounded boxes in a row, one per step from Input and Source separation through to Metronome and sync and User corrections, and a twelfth above them for hosts, runtimes and other tools that aren't a step of their own, joined by many curved lines. Each box gives its number of tools and how many ran here, ran elsewhere, have steps for me or didn't run. Some lines are solid and dark, others dashed and grey, and each carries two small counts."><figcaption><b>The handoffs between the app's steps</b><span class="ao-meta">Each box is a step, or at the top the tools that aren't one, with its tool count and how many ran, have steps for me or didn't run. A solid line means at least one handoff between those two steps was tested, a dashed line means documentation only. The numbers on a line are how many of each.</span></figcaption></figure>
</ao-compare>

<details><summary>The chains, and what else the map lists</summary>

The section called "Tools handing off to each other" below has the five chains my agents ran across the lanes, with what had to be converted at every joint. One chain went from a full band mix to a drawn tab: a separated guitar track, then notes, then a string and fret for each note, then a Guitar Pro file, the format of the Guitar Pro tab program, then a picture of the tab. Each tool's entry in the other sections also has a "Hands off to" line. The map also lists which tools take a capo, a tuning or a pinned fret as a hint, and the joints where nothing connects without conversion.

</details>

## What I still have to run myself

My agents wrote steps for what needs a graphics card, an account, a desktop or phone app, a click the cloud box wouldn't make, or an install the permission system refused. For 12 more tools too little was recorded to write steps. The steps are in [one list of 120 numbered tests](https://github.com/aaronorelup/blog/blob/research/guitar-tab-tools/docs/guitar-tab-research/FOR_AARON.md): 41 on web apps, public demo pages and online notebooks, 17 that start with an account or an API key, 37 for my laptop, 20 with desktop and phone apps, 4 with my own videos and recordings, and one page I open in my own browser to repeat the metronome timing test and run one model. Each test that uses a clip names it, and most say what to send back, so an agent can count my result the same way as the others. I haven't done any of them yet.

The same list has a table of the 37 steps the permission system refused, with the test that covers each one where there is one, and the 63 tools that didn't run and that I can't run either, with the reason for each.

## Splitting a song into instruments

An app can split a song into stems, one instrument's track each, to get the guitar on its own. Of the 60 tools my agents listed, 16 ran on the cloud box, and 4 models that ran write a guitar stem. The six-stem model of the separator Demucs put a lone synthesized steel-string guitar in its piano stem in 2 of 2 runs.

<details><summary>Every tool that ran, what went in and what came out</summary>

Sixteen entries from the list, A to Z. Every run was on the cloud box, on 2 of its 4 processor cores unless the entry says otherwise, with about 20 agents sharing the machine. Each time is from a single run. None of it cost money beyond the cloud session. Every input was a 16-bit WAV at 44.1 kHz in stereo, and every output is a WAV at 44.1 kHz in stereo unless an entry says otherwise. Each tool's options are at their defaults unless the entry names them. The verifier is one of the agents that checked every run, and some runs it repeated are below. Where my agents wrote me steps to run something myself, the entry gives the item number in `for-aaron.md` in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/source-separation).

The clips. S4 is 38.7 seconds of a band I synthesized. It has drums, an electric bass, a strummed steel-string guitar and a lead line standing in for a singer. The lead is played on Voice Oohs, a sound from General MIDI's standard list of instruments. Each instrument's true track is saved. Some runs used its first 10.0 seconds. S6taps is 29.4 seconds of a fingerstyle piece I synthesized on a steel-string sound, with 32 drum-kit hits standing in for taps on the guitar's body. Its true guitar and taps tracks are saved too. S2s is the same guitar playing alone, without the taps. It has no true tracks. R2 is 36 seconds of a real band song with singing, and R2full is the whole 228.5-second song. For R2 there's the artist's own instrumental version, and my agents made a vocal track by subtracting it from the song. R3a, R3b and R3c are the sound of three real 18-second videos of a nylon-string guitar played with the fingers, with no true tracks.

The measurements:

- SI-SDR (scale-invariant signal-to-distortion ratio), in decibels (dB). It compares the part of a stem that copies the true track with everything else in the stem, other instruments and sound the tool added. A higher number means less of everything else. Tools without a guitar stem had `other` compared with the true guitar and `vocals` with the lead line. On R2, every stem but `vocals` was summed and compared with the artist's instrumental, and `vocals` with the subtracted vocal track.
- Where a sound went: the share of a true track found in an output stem, 1 being all of it.
- Levels: how loud a file is on average (its RMS level), in dBFS, decibels below the loudest sound a WAV file can hold. A peak is a file's loudest single sample, given in dBFS or as a share of the most a WAV file can hold.

Every stem here is a WAV file, except the four MP3 files from a check of Demucs's `--mp3` option. Basic Pitch, the note transcriber my audio-to-notes agents ran, takes a WAV file's path as its input.

**adityalakhani/htdemucs-6s-guitar-ft** ([link](https://huggingface.co/adityalakhani/htdemucs-6s-guitar-ft)). Demucs's six-stem model, htdemucs_6s, fine-tuned for guitar. Fine-tuning a model means training it further. It's shared by the user adityalakhani on Hugging Face, a site that hosts AI models. The file is a training snapshot from epoch 60, an epoch being one pass through the training data. It has 27,414,996 parameters, or weights, the numbers a model learns. That's the same count as the stock model.

- In: S4, R2, S6taps and S2s.
- Command or settings: my agents read the repository's `inference.py` and ran its steps in their own script. It used Demucs 4.1.0 in place of the `demucs==4.0.1` that the repository's `requirements.txt` pins. The steps are `get_model("htdemucs_6s")`, the snapshot's weights, then `apply_model(..., shifts=1, segment=7.8, overlap=0.25)`. The output was clamped to [-1, 1], which cuts off anything past the loudest value a WAV file can hold, and written as 24-bit WAV. Python's random generator was seeded with 0, and the script also seeds torch with `torch.manual_seed`. The stock htdemucs_6s ran through the same script as a control.
- Out: six stems, drums, bass, other, vocals, guitar and piano, where the repository's script writes only the guitar. On S4 its guitar stem measured 6.10 dB SI-SDR against the true guitar, and the stock model's 1.73 dB through the same script. The guitar stem held 0.898 of the true guitar, along with 0.121 of the true bass, 0.147 of the true drums and 0.161 of the lead line. The stock model put 0.345 of the guitar in `guitar` and 0.218 in `piano`. With the fine-tune the true bass was 0.312 in `bass` (stock 0.7555) and the true drums 0.477 in `drums` (stock 0.890). On S6taps, 0.5465 of the true guitar was in `guitar` and 0.177 in `piano` (stock 0.0635 and 0.755). On S2s, `piano` was at -24.55 dBFS and `guitar` at -36.63 dBFS, with the mix at -18.23 dBFS. On R2 the summed instrumental measured 6.78 dB and `vocals` 13.21 dB. 40 of the 3,175,200 samples in its R2 `vocals.wav` sit at full scale, from the clamp. The verifier's repeat of r0636 was refused by the session's permission policy, with `Reason: [Code from External]`, and nothing ran. Instead it worked out every level and share above from the saved stems again, with its own code (r0722), and ran the SI-SDR measurements again (r0717). All of them matched.
- Time: S4 25.98 s, peak memory 1,606.5 MB (r0636). R2 31.66 s (r0637), S6taps 22.45 s (r0640), S2s 22.28 s (r0642). The stock control took 32.37 s on S4 (r0638).
- Takes as a hint: none of capo, tuning, note range, tempo or key. The repository's script takes `--checkpoint`, `--device auto|cuda|cpu`, `--shifts` and `--overlap`.
- Hands off to: not tried here. Steps for me to run the repository's own script on a GPU are item 5.

**audio-separator 0.48.0** ([link](https://github.com/nomadkaraoke/python-audio-separator)). A command-line tool and Python package that runs the model families of Ultimate Vocal Remover (UVR), a desktop app for splitting songs, and downloads their files. Six models ran through it. VR Architecture, MDX-Net, MDX23C and BS-RoFormer-SW have their own entries, and the other two are here.

- In: S4, its first 10.0 s, and R2.
- Command or settings: `audio-separator -m <model> --model_file_dir models/uvr --output_dir <out> --output_format WAV --custom_output_names '<lower-case names>' <clip>.wav`, everything else at its defaults, among them `--normalization 0.9`. Its model list (`audio-separator -l --list_format json`) held 169 models: VR 29, MDX 39, Demucs 4 and MDXC 97, the last being MDX23C and the RoFormers. Two of them name a guitar: `htdemucs_6s.yaml` in the list, and `BS-Roformer-SW.ckpt` in its YAML.
- Out: one 16-bit WAV per stem. Demucs htdemucs_6s through it on S4 measured drums 9.05, bass 7.28, guitar 1.56 and lead 7.96 dB SI-SDR, with 0.329 of the true guitar in `guitar` and 0.228 in `piano` (r0490). Its default model, the BS-RoFormer `model_bs_roformer_ep_317_sdr_12.9755.ckpt`, wrote an instrumental and vocals for the first 10 s of S4 (r0498). The instrumental measured 3.16 dB against drums, bass and guitar together. Its `vocals.wav` is all zeros, 441,000 x 2 samples. The audio measuring library mir_eval, which my agents used next to their own SI-SDR code, stopped on it with `All the estimated sources should be non-silent ...`. The `--normalization 0.9` default scales a file down only when its peak is above 0.9. R2 peaks at 0.989 and its stems came out peaking at 0.90, while S4 and its stems weren't scaled.
- Time: htdemucs_6s on S4 68.34 s, peak 1,723.9 MB (r0490). The BS-RoFormer on the 10 s, 170.47 s, peak 2,227.5 MB (r0498). In a straight line that rate comes to 3,895 s for the 228.5-second song, my agents' extrapolation, not a measurement.
- Takes as a hint: none of capo, tuning, note range, tempo or key. It takes `-m` (model), `--single_stem`, ensembles of several models, `--chunk_duration`, settings per model family, and `--mdxc_pitch_shift`, which shifts the audio's pitch while it works.
- Hands off to: not tried here. From the command line it writes FLAC by default, which Basic Pitch also takes. Whole-song runs of three of its models on a GPU are in the steps for me (item 4).

**barvarvara/demucs-guitar-lora** ([link](https://huggingface.co/barvarvara/demucs-guitar-lora)). A LoRA adapter, a small file that adjusts a trained model, for Demucs's htdemucs. Its model card, the page that describes a model, is in Russian. In my agents' translation it says `Demucs v4 (htdemucs) fine-tuned with LoRA to extract acoustic guitar.` It doesn't name its training data or say which of the four stems carries the guitar.

- In: S4 and S2s.
- Command or settings: my agents' script follows the card: `PeftModel.from_pretrained(get_model('htdemucs').models[0], adapter)`, then `merge_and_unload()` and `demucs.apply.apply_model` with the command line's defaults, shifts 1 and overlap 0.25. The adapter is 1,974,280 bytes.
- Out: drums, bass, other and vocals, 16-bit. On S4: drums 7.80, bass 7.86, guitar (`other`) 1.94 and lead (`vocals`) 0.93 dB SI-SDR (e1416). The true guitar was 0.864 in `other`, 0.052 in `vocals` and 0.042 in `drums`, against 0.883, 0.056 and 0.015 for htdemucs without the adapter (r0019). On S2s the `drums` stem was at -48.43 dBFS with the adapter and -77.25 dBFS without it (r0060). The verifier's second run of S4 measured guitar 2.40 dB (r0529). Demucs shifts the audio by a random amount on each run, so two runs of one command differ.
- Time: S4 54.93 s, peak 1,363.8 MB (r0467). S2s 71.50 s (r0470). The second S4 run took 34.82 s (r0529).
- Takes as a hint: Demucs's options. The adapter only changes weights.
- Hands off to: not tried here.

**becruily Mel-Band RoFormer guitar** ([link](https://huggingface.co/becruily/mel-band-roformer-guitar)). A community-trained checkpoint, a file of trained weights, for the Mel-Band RoFormer design. It writes one stem, the guitar. It's 45,142,183 bytes, and its page has no model card.

- In: S4, its first 10.0 s, and S2s, through MSST (its own entry below).
- Command or settings: `msst-inference --model_type <type> --config_path <yaml> --start_check_point <ckpt> --input_folder <dir with one clip> --store_dir <out> --force_cpu --disable_detailed_pbar` with `mel_band_roformer`, `config_guitar_becruily.yaml` and `becruily_guitar.ckpt`.
- Out: `Guitar.wav`, 32-bit float. On S4 it's at -39.19 dBFS against -17.37 dBFS for the mix, holds 0.0773 of the true guitar and measures -2.65 dB SI-SDR (e1425). On the first 10 s it's at -51.18 dBFS and holds 0.0209 of the guitar. On S2s it's at -49.83 dBFS against -18.23 dBFS for the mix. It wasn't run on R3a to R3c, for lack of time.
- Time: S4 289.53 s, peak 1,818.9 MB (r0491). The 10 s took 87.16 s (r0473) and S2s 211.79 s (r0480). The verifier's re-run of the 10 s took 67.64 s and wrote the same samples (r0547).
- Takes as a hint: none. Its config sets a 485,100-sample chunk and an overlap of 2.
- Hands off to: the agents that ran tools in a chain gave its S4 `Guitar.wav` to Basic Pitch (r0511). It returned 406 notes, and 229 of the 369 strummed-guitar notes were among them (e1447). A note counts when its start is within 50 ms and its pitch within 50 cents, half the step between two frets.

**BS-RoFormer-SW** ([link](https://huggingface.co/enerjazzer/BS-ROFO-SW-Fixed)). A community-trained six-stem checkpoint for the BS-RoFormer design, 699,412,152 bytes. The cards my agents read don't name who trained it.

- In: the first 10.0 s of S4, through audio-separator and through MSST.
- Command or settings: `audio-separator -m BS-Roformer-SW.ckpt` with the settings in that entry (r0489), and `msst-inference` with `--model_type bs_roformer`, `BS-Roformer-SW.yaml` and the same checkpoint (r0492).
- Out: bass, drums, other, vocals, guitar and piano, 16-bit from audio-separator and 32-bit float from MSST. Through audio-separator: drums 14.06, bass 14.59 and guitar 13.60 dB SI-SDR (e1420), with 0.939 of the true guitar in `guitar`. The lead line went to `other`, 0.923 of it, measuring 14.77 dB there, and `vocals` held 0 of it, at -111.73 dBFS. Through MSST: drums 13.63, bass 14.17, guitar 12.36 and lead (`other`) 13.59 dB (e1427), with 0.910 of the lead in `other` and 0.925 of the guitar in `guitar`. In the four stems that carry sound (bass, drums, guitar and other), the difference between the two runs is 22.70 to 23.21 dB quieter than audio-separator's files. `piano` and `vocals` are near silent in both. What causes the difference wasn't isolated.
- Time: 110.34 s for the 10 s through audio-separator, peak 2,354.6 MB (r0489), and 156.64 s through MSST, peak 2,734.0 MB (r0492). In a straight line, r0489's rate comes to 2,521 s for the 228.5-second song, an extrapolation, not a measurement.
- Takes as a hint: none. Chunk size and overlap come from its YAML.
- Hands off to: not tried here. A whole-song run on a GPU is in the steps for me (item 4).

**Demucs 4.1.0** ([link](https://github.com/adefossez/demucs)). A source separator first made at Meta, in the version from its author's own repository. Four of its models ran. htdemucs, htdemucs_ft (a set of four fine-tuned htdemucs, one per stem) and mdx_extra (four models of the older version 3) write drums, bass, other and vocals. htdemucs_6s adds guitar and piano.

- In: S4, S6taps, S2s, R2, R2full, R3a, R3b and R3c, and the first 10 s of S4 for checks of its options.
- Command or settings: `demucs -n <model> -d cpu -o out <clip>.wav`, everything else at its defaults (`--shifts 1`, `--overlap 0.25`, 16-bit WAV, `--clip-mode rescale`). After `uv pip install demucs==4.1.0` the first `demucs --help` stopped with `ModuleNotFoundError: No module named 'numpy'`, because the package lists numpy only for macOS on x86_64. Installing numpy fixed it.
- Out: one 16-bit WAV per stem, as long as the input. On S4, htdemucs measured drums 9.09, bass 7.65, guitar (`other`) 2.45 and lead (`vocals`) 1.79 dB SI-SDR (e0073). htdemucs_ft measured 9.78, 8.51, 4.65 and 4.97 dB (e0074), mdx_extra 8.91, 5.67, 3.69 and 6.58 dB (e0075), and htdemucs_6s, with its own guitar stem, 8.99, 7.40, 1.89 and 7.94 dB (e0095). `other` held 0.883 of the true guitar with htdemucs, 0.897 with htdemucs_ft and 0.870 with mdx_extra. htdemucs_6s put 0.358 of it in `guitar`, 0.232 in `piano`, 0.093 in `vocals` and 0.001 in `other`. `vocals` held 0.522 of the lead line with htdemucs, 0.648 with htdemucs_ft, 0.650 with mdx_extra and 0.837 with htdemucs_6s. On S2s, htdemucs_6s put the guitar in `piano` at -19.06 dBFS, with `guitar` at -42.15 dBFS and the mix at -18.23 dBFS (r0099), and the verifier's re-run gave -19.07 and -41.72 dBFS (r0525). htdemucs put it in `other`, at -18.24 dBFS (r0060). On R3a, R3b and R3c, htdemucs_6s put the sound in `guitar`, within 0.4 dB of the mix level (r0410, r0413, r0418). On S6taps, htdemucs_6s put 0.767 of the true guitar in `piano` and 0.056 in `guitar`, and 0.790 of the taps in `drums` (r0054). htdemucs put the guitar in `other`, at 20.72 dB against the true guitar, and 0.741 of the taps in `drums`, at 5.67 dB against the true taps (r0053). On R2 the summed instrumental measured 11.41 dB with htdemucs, 10.81 with htdemucs_ft, 11.26 with mdx_extra and 10.77 with htdemucs_6s, and `vocals` 13.42, 13.57, 13.47 and 13.42 dB (e1398 to e1401).

  Checks of its options: two runs of one command give different files, because Demucs shifts the audio by a random amount by default. The verifier's re-run of htdemucs on S4 measured guitar 2.77 and lead 2.54 dB, against 2.45 and 1.79 the first time (r0524). `--two-stems guitar` with htdemucs_6s wrote `guitar.wav` and `no_guitar.wav`, and that guitar measured 1.61 dB (r0450). `--segment 10` stopped with `Cannot use a Transformer model with a longer segment than it was trained for. Maximum segment is: 7.8` (r0460, and again in r0527). With `--mp3`, each stem decodes to 1,368 more frames than the input, a frame being one sample per channel, and their sum lines up with the mix 1105 samples late (r0462). On R2 and R2full the `drums` and `vocals` stems of every model peak at exactly -0.09 dBFS. That's `--clip-mode rescale`, which scales a whole stem down when it would clip and so changes its level next to the other stems.

- Time: on S4, htdemucs 38.86 s with peak memory 1,253.6 MB (r0019), htdemucs_6s 36.37 s and 1,349.6 MB (r0021), htdemucs_ft 131.84 s and 1,825.4 MB (r0029), mdx_extra 114.44 s and 3,909.8 MB (r0049). The whole 228.5-second song took 255.55 s with htdemucs, peak 1,798.0 MB (r0472), and 163.00 s with htdemucs_6s, peak 2,163.8 MB (r0477). In a later round my agents ran the whole song on all 4 cores. htdemucs_6s took 109.55 s (r0660). htdemucs took 263.90 s and 363.56 s in two 4-core runs (r0659, r0669) and 277.63 s in a second 2-core run (r0677). During r0669 and r0677 other processes on the box used an average of 1.7 and 2.5 CPUs. With 4 cores htdemucs used about twice the CPU time of the 2-core runs, and why wasn't isolated. On 2026-11-12 the verifier ran htdemucs_6s on the whole song again, 81.49 s on 4 cores while other processes used 14.1 CPU seconds (r0725), then 123.26 s on 2 cores while another lane's jobs held the other 2 (r0728). Those two runs used 276.2 and 233.5 seconds of CPU time.
- Takes as a hint: none of capo, tuning, note range, tempo or key. It takes `-n` (model), `--two-stems STEM` (one stem and the rest), `--segment` (at most 7.8 s for the version 4 models), `--shifts`, `--overlap` and the output format.
- Hands off to: librosa, a Python audio library, has an onset detector that marks where each sound starts. On the S6taps `drums` stems it returned 34 onsets with htdemucs, with 31 of the 32 taps within 50 ms of one (e0919). With htdemucs_6s it returned 32, one within 50 ms of each of the 32 taps (e0928). My audio-to-notes agents gave the htdemucs_6s guitar stems to Basic Pitch (r0243). From S4's it returned 342 notes, with 233 of the 369 strummed-guitar notes among them, start within 50 ms and pitch within 50 cents (e0652). From S6taps's it returned 96, with 41 of the 90 played notes among them (e0660). My fingerstyle agents compared the S2s and S6taps stems with the bass line, the melody and the taps alone (e0161 to e0170). What they found is in the section on melody, bass and taps from one guitar.

**demucs-onnx 0.3.4** ([link](https://github.com/StemSplit/demucs-onnx)). StemSplit's package that runs Demucs as ONNX, an open file format for trained models, through ONNX Runtime. It doesn't need PyTorch, the machine-learning library Demucs runs on.

- In: S4.
- Command or settings: `demucs-onnx separate S4.wav out --model htdemucs_6s --small --providers cpu -v` (r0471), which used the 136,428,532-byte `htdemucs_6s_fp16weights.onnx`.
- Out: bass, drums, guitar, other, piano and vocals, 16-bit, 6,834,024 bytes each. On S4: drums 8.91, bass 7.48, guitar 1.04 and lead 6.87 dB SI-SDR (e1417), with 0.303 of the true guitar in `guitar`, 0.273 in `piano` and 0.091 in `vocals`. It has no random shift, and every re-run wrote the same samples (r0548, r0610, r0612, r0718, r0719).
- Time: ONNX Runtime picks its own number of threads, parts of a program that run at the same time. With that default it ran worker threads on cores outside the job's 2-core slot (r0610), so the first time, 56.27 s (r0471), isn't a 2-core figure. With 2 threads set, S4 took 61.33 s (r0612). The verifier re-ran both with a probe, a small script of its own that recorded which cores each thread ran on. They took 29.12 s with the default, which again ran worker threads outside the slot (r0718), and 36.10 s with 2 threads (r0719). Peak memory was 6,204.5 MB (r0471), where PyTorch Demucs with htdemucs_6s peaked at 1,349.6 MB on the same clip (r0021).
- Takes as a hint: none. `--model`, `--stem` or `--stems`, `--precision fp32|fp16weights` and `--providers auto|cpu|coreml|cuda|dml|wasm`.
- Hands off to: not tried here. Its `browser.py` writes a demo for onnxruntime-web, ONNX Runtime in a browser, which wasn't tested.

**demucs.cpp** ([link](https://github.com/sevagh/demucs.cpp)), commit `4edae49`, the saved version of its code my agents used. A C++ program that runs Demucs without PyTorch, from weights converted to ggml, a model file format that C++ programs read.

- In: S4 and its first 10 s.
- Command or settings: built with CMake, a C++ build tool. The first build stopped in its bundled Eigen library with `Eigen/src/Core/arch/AVX512/PacketMathFP16.h:116:25: error: invalid 'static_cast' from type 'const Eigen::half' to type '_Float16'` (r0466). The project builds with `-march=native`, which on this box turns on `-mavx512fp16`. A one-line compiler wrapper adding `-mno-avx512fp16` got the second build through in 113.27 s (r0507). Then `demucs_mt.cpp.main <ggml-model-htdemucs-6s-f16.bin> <clip>.wav <out dir> 2`, 2 threads, with the ready-converted 54,855,129-byte weights.
- Out: `target_0_drums.wav` to `target_5_piano.wav`, 32-bit float. On S4: drums 8.91, bass 7.16, guitar 0.02 and lead 8.06 dB SI-SDR (e1446), with 0.286 of the true guitar in `guitar`, 0.277 in `piano` and 0.093 in `vocals`. A second run of the 10 s wrote the same samples (r0541).
- Time: S4 132.69 s, peak 3,596.6 MB (r0509), and the 10 s 66.36 s (r0508). PyTorch Demucs took 36.37 s and 1,349.6 MB on S4 (r0021).
- Takes as a hint: none. The model file and the thread count.
- Hands off to: not tried here.

**librosa 1.0.0, HPSS** ([link](https://github.com/librosa/librosa)). librosa is a Python audio library. Its HPSS splits a recording into a harmonic part (held, pitched sound) and a percussive part (short hits), with no trained model. It does that by filtering the spectrogram, a picture of how loud each pitch is over time.

- In: S6taps and S2s.
- Command or settings: `librosa.effects.hpss(y)` at its defaults (`kernel_size` 31, `power` 2.0, `margin` 1.0), then with `margin=3.0` and with `margin=(1.0, 5.0)`, followed by `librosa.onset.onset_detect` at its defaults on the percussive part.
- Out: `harmonic.wav` and `percussive.wav`, 32-bit float, and a text file of onset times in seconds. On S6taps the harmonic part measured 15.53 dB SI-SDR against the true guitar at the default and with margin (1.0, 5.0), and 8.62 dB with margin 3. The percussive part measured 0.34, 3.86 and 3.21 dB against the true taps, in the order default, margin 3, margin (1.0, 5.0). At margin 1 the two parts add up to the input. The onset detector returned 53 onsets in the percussive part at all three settings, with all 32 taps within 50 ms of one (e0815, e0862, e0896). On S2s, which has no taps, it returned 48 onsets at every setting, from the guitar notes.
- Time: the first runs were single-threaded outside the 2-core slots on a busy box, 72.47 s for S6taps (r0262) and 53.56 s for S2s (r0268). The verifier's re-run of S6taps in a 2-core slot took 19.60 s, peak 559.2 MB, and wrote the same samples (r0530).
- Takes as a hint: none musical. `margin`, `kernel_size`, `power`, `mask`, `n_fft` and `hop_length`.
- Hands off to: the onset lists above. The agents that ran tools in a chain gave the harmonic parts of S6taps and S2s to Basic Pitch (r0511) and joined the S6taps notes with the percussive onsets (r0540).

**MDX-Net, `UVR-MDX-NET-Inst_HQ_3.onnx`** ([link](https://github.com/kuielab/mdx-net)). UVR's MDX-Net models build on KUIELab's MDX 2021 code. This one writes an instrumental and vocals. It's 66,759,214 bytes and ran through audio-separator.

- In: S4 and R2.
- Command or settings: `audio-separator -m UVR-MDX-NET-Inst_HQ_3.onnx` with the settings in that entry.
- Out: `instrumental.wav` and `vocals.wav`, 16-bit. On S4 the instrumental measured 3.18 dB SI-SDR against drums, bass and guitar together, and `vocals` -3.16 dB against the lead line (e1422). `vocals` held 0.169 of the lead and the instrumental 0.808. On R2: instrumental 12.58 and vocals 14.40 dB (e1439).
- Time: it runs through ONNX Runtime with no thread count set, so the first times, 86.42 s on S4 (r0487) and 76.06 s on R2 (r0503), aren't 2-core figures. With 2 threads set, S4 took 66.38 s, peak 3,166.6 MB (r0619). The verifier's re-run with the default, watched by its own probe, took 36.65 s, again with worker threads outside the slot, and wrote the same samples (r0713).
- Takes as a hint: none. `--mdx_segment_size` and `--mdx_overlap`.
- Hands off to: not tried here.

**MDX23C, `MDX23C-8KFFT-InstVoc_HQ.ckpt`** ([link](https://github.com/kuielab/sdx23)). KUIELab's TFC-TDF-Net v3 design from the SDX 2023 challenge, with weights that UVR's README credits to ZFTurbo. This one writes an instrumental and vocals. It's 448,101,203 bytes and ran through audio-separator.

- In: the first 10.0 s of S4.
- Command or settings: `audio-separator -m MDX23C-8KFFT-InstVoc_HQ.ckpt` with the settings in that entry.
- Out: `instrumental.wav` and `vocals.wav`, 16-bit. The instrumental measured 3.17 dB SI-SDR against drums, bass and guitar together, and `vocals` -10.35 dB against the lead line (e1429). `vocals` held 0.0019 of the lead, at -67.52 dBFS.
- Time: 502.83 s for the 10 s, peak 2,230.6 MB (r0496). In a straight line that rate comes to 11,490 s, about 3.2 hours on 2 cores, for the 228.5-second song. That's an extrapolation, not a measurement.
- Takes as a hint: none. audio-separator's options.
- Hands off to: not tried here.

**MSST, Music-Source-Separation-Training (PyPI `msst` 0.1.0)** ([link](https://github.com/ZFTurbo/Music-Source-Separation-Training)). ZFTurbo's code for training and running many separation designs, behind many community checkpoints. Three checkpoints ran through it, becruily's guitar model, BS-RoFormer-SW and SCNet Small, each with its own entry.

- In: S4, its first 10.0 s, S2s and S6taps.
- Command or settings: `msst-inference --model_type <type> --config_path <yaml> --start_check_point <ckpt> --input_folder <dir with one clip> --store_dir <out> --force_cpu --disable_detailed_pbar`, everything else at its defaults. The agent that ran the tools here reports that running the repository's `inference.py` from a clone was refused by its session's permission check, with no log kept. So my agents installed the package from PyPI, Python's package index, with `--no-deps` next to torch 2.15.0, outside its declared `torch<2.12,>=2.0.1`.
- Out: one 32-bit float WAV per instrument, as `<store_dir>/<input file stem>/<instrument>.wav`.
- Time: in the three model entries.
- Takes as a hint: none musical. `--model_type`, `--config_path` (chunk size, overlap and instruments are in the YAML), `--extract_instrumental`, `--use_tta` and LoRA weights.
- Hands off to: its Python `Separator` returns a NumPy array per stem, which librosa's HPSS takes. That's documented, not run.

**Open-Unmix 1.3.0, models umxhq and umxl** ([link](https://github.com/sigsep/open-unmix-pytorch)). A separator from Inria and sigsep with one network per stem: vocals, drums, bass and other.

- In: S4, R2 and S6taps.
- Command or settings: `umx --model <umxhq|umxl> --no-cuda --outdir out/<model> <clip>.wav`, everything else at its defaults. The first run stopped with `ImportError: TorchCodec is required for load_with_torchcodec. Please install torchcodec to use this function.` (r0051), because torchaudio 2.11 reads and writes audio through torchcodec. Installing torchcodec fixed it.
- Out: `vocals.wav`, `drums.wav`, `bass.wav` and `other.wav`, 16-bit. On S4, umxhq measured drums 3.58, bass 2.58, guitar (`other`) -1.99 and lead (`vocals`) -39.95 dB SI-SDR (e0076), and umxl 4.31, 5.02, -0.88 and -27.53 dB (e0371). Both put the lead line in `other`, 0.9805 of it with umxhq and 0.9053 with umxl, and 0.0001 and 0.0008 of it in `vocals`, which sat at -66.97 and -55.89 dBFS. `other` held 0.8502 and 0.8886 of the true guitar. On S6taps, umxhq measured guitar 17.89 dB and taps 2.71 dB (e0389). On R2: instrumental 9.72 (umxhq) and 10.76 dB (umxl), vocals 11.76 and 12.73 dB (e0397, e0398).
- Time: on S4, umxhq 28.82 s, peak 1,617.1 MB (r0085), and umxl 127.36 s, peak 1,991.2 MB (r0101). The verifier's re-run of r0085 took 19.54 s and wrote the same samples (r0539).
- Takes as a hint: none musical. `--targets`, `--residual`, `--niter` (how many filter passes), `--start` and `--duration`.
- Hands off to: librosa's onset detector on umxhq's S6taps `drums` stem returned 82 onsets, with all 32 taps within 50 ms of one (e0934). My fingerstyle agents compared its S6taps stems with the bass line, the melody and the taps (e0950, e0965). What they found is in the section on melody, bass and taps from one guitar.

**SCNet Small, MUSDB18 checkpoint** ([link](https://github.com/starrytong/SCNet)). SCNet is a four-stem separator design from an ICASSP 2024 paper. This checkpoint, `scnet_checkpoint_musdb18.ckpt` (42,434,986 bytes), is from MSST's list, and the verifier ran it through MSST. MUSDB18 is a set of 150 songs, each with four stems.

- In: S4 and S6taps.
- Command or settings: `msst-inference --model_type scnet --config_path config_musdb18_scnet.yaml --start_check_point scnet_checkpoint_musdb18.ckpt --input_folder <dir with one clip> --store_dir verify/out/msst-scnet-musdb18 --force_cpu --disable_detailed_pbar`.
- Out: drums, bass, other and vocals, 32-bit float. On S4: drums 9.61, bass 7.27, guitar (`other`) 2.23 and lead (`vocals`) 2.45 dB SI-SDR (e1596). The lead was 0.504 in `other` and 0.470 in `vocals`, and the guitar 0.884 in `other`. On S6taps: guitar 21.73 and taps 7.57 dB (e1597). Each run printed two torch warnings, `A window was not provided. A rectangular window will be applied ...`.
- Time: S4 109.10 s, peak 3,372.2 MB (r0559), and S6taps 98.94 s (r0560).
- Takes as a hint: none musical. MSST's options, with `chunk_size: 485100` and `num_overlap: 4` in its YAML.
- Hands off to: librosa's onset detector on its S6taps `drums` stem returned 47 onsets, with all 32 taps within 50 ms of one (e1595).

**Spleeter 2.4.2, 4stems model** ([link](https://github.com/deezer/spleeter)). Deezer's separator, built on the machine-learning library TensorFlow, with ready-made 2-, 4- and 5-stem models. The 5-stem one adds piano, and none has a guitar stem.

- In: S4, S6taps and R2.
- Command or settings: `MODEL_PATH=models/spleeter spleeter separate -p spleeter:4stems -o out/spleeter-4stems <clip>.wav`, everything else at its defaults. Spleeter 2.4.2 pins `tensorflow==2.12.1`, whose Linux install file (a wheel) is 585.9 MB, so my agents installed `tensorflow-cpu==2.12.1` in its place. By default it separates only the first 600 s of a file.
- Out: `vocals.wav`, `drums.wav`, `bass.wav` and `other.wav`, 16-bit. On S4: drums 3.75, bass 2.74, guitar (`other`) -1.40 and lead (`vocals`) -8.20 dB SI-SDR (e1394). The lead was 0.8668 in `other` and 0.1115 in `vocals`, and the guitar 0.8571 in `other`. On S6taps: guitar 21.79 and taps 7.93 dB (e1395). On R2: instrumental 10.62 and vocals 12.54 dB (e1396).
- Time: S4 21.46 s, peak 1,808.9 MB (r0419). S6taps 14.47 s (r0421) and R2 12.88 s (r0422). The verifier didn't re-run it, and re-read the saved outputs instead. Reinstalling TensorFlow was over a 200 MB download limit in force then, set by the agent running the whole project.
- Takes as a hint: none musical. `-p spleeter:2stems|4stems|5stems`, `--mwf` (an extra filtering step), and `-s` and `-d` (offset and duration).
- Hands off to: librosa's onset detector on its S6taps `drums` stem returned 75 onsets, with all 32 taps within 50 ms of one (e1397).

**VR Architecture, `1_HP-UVR.pth`** ([link](https://github.com/tsurumeso/vocal-remover)). UVR's VR models build on tsurumeso's vocal remover code. This one writes an instrumental and vocals. It's 126,792,647 bytes and ran through audio-separator.

- In: S4 and R2.
- Command or settings: `audio-separator -m 1_HP-UVR.pth` with the settings in that entry.
- Out: `instrumental.wav` and `vocals.wav`, 16-bit, 463 frames shorter than the input on S4 (1,708,032 against 1,708,495) and 400 frames shorter on R2, still lined up with the mix at the start. On S4 the instrumental measured 7.54 dB SI-SDR and `vocals` 4.72 dB against the lead line (e1421). `vocals` held 0.516 of the lead and the instrumental 0.470. On R2: instrumental 10.96 and vocals 12.98 dB (e1435).
- Time: S4 109.83 s, peak 2,198.2 MB (r0481), and R2 88.22 s (r0502). The verifier's re-run on S4 took 84.6 s and wrote the same samples (r0531).
- Takes as a hint: none. `--vr_window_size`, `--vr_aggression` and `--vr_enable_tta`.
- Hands off to: not tried here.

The full record, every run and every quote, is in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/source-separation).

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

44 of the 60 tools on the list didn't run here, and none of the 4 datasets was downloaded. Two limits come up. In the first round the shared disk had 6.2 to 7.2 GB free. The orchestrator, the agent running the whole project, asked every agent to start no download or install over 200 MB unless its work couldn't finish without it. In a later round to fill gaps, the session's permission policy refused two steps that used a cloned repository's code, with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External].` An item number is the place in `for-aaron.md`, in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/source-separation), where my agents wrote me steps to run the tool myself, and "No steps" means they wrote none.

- **asteroid.** A separation toolkit whose README model list points to example training setups for speech. Whether it runs here wasn't checked. No steps.
- **AudioSep.** A model that pulls out a sound described in words. Its two checkpoint files are 1.26 GB and 2.35 GB. In the first round that was over the 200 MB limit. In the later round the download would have left about 3,950 MB free, under the 4 GB that round had to keep, and its route runs a cloned repository's code. At the end of that round 7,695 MB were free, so it would have left about 4,245 MB. That's above 4 GB but under the 4,500 MB below which the box's `env.sh` script prints `DISK CRITICAL ... No download over 100 MB`. Nothing was downloaded. Steps for me: item 2.
- **AudioShake.** A hosted service, left to my agents that surveyed online services. No steps.
- **Band-Split RNN (BSRNN).** It appears only as a row in the Demucs README's comparison table, and no code was looked for. No steps.
- **Banquet (query-bandit).** A separator that picks which stem to pull out from a short example clip, the query clip. Running the README's `python train.py inference_byoq` from the cloned repository was refused by the session's permission policy, and no weights were downloaded. Its smallest checkpoint is 552 MB, plus a 342 MB model for the query clip. Steps for me: item 3.
- **BS PolarFormer.** A checkpoint listed in MSST, not run, with no reason recorded. No steps.
- **BS-Mamba2.** A design listed in MSST, not run, with no reason recorded. No steps.
- **BS-RoFormer and Mel-Band RoFormer code (lucidrains).** Architecture code with no weights. The two designs ran here with community checkpoints. No steps.
- **bs-roformer-infer and melband-roformer-infer (OpenMIRLab).** Repackagings of models already run here through audio-separator and MSST, not tried, to keep the CPU slots for other tools. No steps.
- **BS-RoFormer-SW ONNX (elicwhite).** A conversion of BS-RoFormer-SW, not run, with no reason recorded. No steps.
- **BSRoformer.cpp.** A C++ runner for RoFormer checkpoints, not run, with no reason recorded. No steps.
- **demucs-infer (OpenMIRLab).** A repackaging of Demucs, not tried, to keep the CPU slots for other tools. No steps.
- **demucs-rs.** Demucs rewritten in the Rust programming language. The box has no GPU, and its README names Metal, Vulkan and WebGPU back ends only: `A GPU with Metal (macOS), Vulkan (Linux/Windows), or WebGPU (browser) support`. Steps for me: item 6, its browser demo.
- **demucs.onnx (sevagh).** No run recorded. The survey lists it as runnable after compiling. No steps.
- **DTTNet.** A design listed in MSST, not run, with no reason recorded. No steps.
- **Dynamic Band Splitting.** A separator design that MSST lists as a model type. No music-stem checkpoint is named. Its released checkpoints return `music, sfx, speech`. No steps.
- **free-music-demixer.** An in-browser Demucs demo. Its README says `It is provided as-is and is no longer maintained.` and `Model weights are not included.` No steps.
- **Gaborformer.** A four-stem separator (vocals, drums, bass and other) with no guitar stem. It has no PyPI package, and installing the cloned repository was refused by the session's permission policy. Its weights weren't downloaded. Steps for me: item 8.
- **guitar_source_separation (LukeSutor).** Its README and `LICENSE` file are Open-Unmix's, and it names no guitar weights. No steps.
- **LALAL.AI.** A hosted service, left to my agents that surveyed online services. No steps.
- **Mini-BS-RoFormer-V2.5-46.2M.** A four-stem model the verifier found in a last search, looked at only as far as its model card. No steps.
- **mlx-audio-separator.** It's built on MLX, which targets Apple Silicon, so it can't run on this Linux box. No steps.
- **Moises / Music.AI.** A hosted service, left to my agents that surveyed online services and apps. No steps.
- **Moises-Light.** Architecture code, with no weights named in its README. No steps.
- **MuS3D.** A research separator that finds a song's stems itself, with no fixed list. Its checkpoint repository is 19.2 GB, and its README says `The DiT needs about 10 GB of free memory`. Not run, for disk. Steps for me: item 7.
- **musdb (Python package).** A reader for the MUSDB18 datasets, not run. No steps.
- **Music Source Restoration systems.** Research on getting unprocessed stems back from finished, mastered songs. Code and weights weren't looked for. No steps.
- **MVSEP.** A hosted service, left to my agents that surveyed online services. No steps.
- **MVSEP-MDX23 ensemble.** No run recorded. No steps.
- **nussl.** A sound separation library. Its README says `NUSSL IS DEPRECATED`. Whether it runs here wasn't checked. No steps.
- **PolUVR.** A fork of audio-separator, meaning a copy of it that someone else develops. It wasn't tried, to keep the CPU slots for other tools. No steps.
- **SAM 2.** A video model that marks an object's outline in each frame, called a mask. It appears in the survey only as a possible source of video masks for SAM Audio. No steps.
- **SAM Audio.** Meta's model for pulling one sound out of a mix, picked by text, a video mask or a time span. Its weights are gated on Hugging Face (`gated: manual`, so a Hugging Face account and a request that Meta approves), and the smallest model repository is 5.1 GB. Steps for me: item 1.
- **`Score-Informed-SS-on-Guitars`.** Code for a paper on separating two guitars with help from the written music. Only its README was read, and its tree has no `LICENSE` file. No steps.
- **SepGen.** An audio and video separation model, a LoRA on a model called LTX-2.5 22B, looked at only as far as its paper and card. No steps.
- **Spleeter Pro.** Deezer's commercial version of Spleeter. Its terms weren't read, and no other section's list has it. No steps.
- **StemDeck.** A desktop app that a web-search result says uses htdemucs_6s. The page wasn't opened, and no other section's list has it. No steps.
- **STEMMA.** A music reasoning model, audio in and text out, listed only because its name matched a search for stem. No steps.
- **StemSplit (hosted service).** A hosted service, left to my agents that surveyed online services. Its separate open package, demucs-onnx, ran. No steps.
- **SubRoformer.** A design listed in MSST, not run, with no reason recorded. No steps.
- **torchaudio HDEMUCS pipelines.** Demucs version 3 inside torchaudio, four stems, no guitar. Whether they run here wasn't checked. No steps.
- **Ultimate Vocal Remover GUI (UVR5).** A desktop app. Its model families ran here through audio-separator. No steps.
- **ZeroSep.** It runs text-guided diffusion models (AudioLDM, AudioLDM2 or Tango, per its README). Not run, for disk. Steps for me: item 7.
- **ZFTurbo open-source 53-stem model.** Not run. Its release page refuses the box's requests (HTTP 403), so its full file list and any license note weren't read. Its checkpoint is 1,368,919,887 bytes. No steps.

Datasets, none downloaded:

- **GuitarDuets.** Real and synthesized classical guitar duets, from a paper that adapts Demucs to separate two guitars that sound alike. No steps.
- **MoisesDB.** 240 songs from 47 artists, with stems beyond the usual four. No steps.
- **MUSDB18.** 150 songs with four stems, drums, bass, other and vocals, compressed. No steps.
- **MUSDB18-HQ.** The same 150 songs as uncompressed WAV. No steps.

</details>

<details><summary>Licenses of the tools that ran</summary>

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| adityalakhani/htdemucs-6s-guitar-ft | ran in my agents' script on Demucs 4.1.0 (MIT) | Apache-2.0 (model card). The card calls the base htdemucs_6s weights MIT, while Demucs's maintainer writes that their license isn't clear | MoisesDB v0.1, 216 songs for training and 24 for validation. MoisesDB's loader repository is under CC BY-NC-SA 4.0, a Creative Commons license for non-commercial use, and its download page says `MoisesDB is offered free of charge for non-commercial research use only and includes baseline performance results for two publicly available source separation methods.` ([source](https://music.ai/research/)) |
| audio-separator | MIT | no license per model in its lists. UVR's README says `For all third-party application developers who wish to use our models, please honor the MIT license by providing credit to UVR and its developers.` ([source](https://raw.githubusercontent.com/Anjok07/ultimatevocalremovergui/master/README.md)) | not stated per model |
| barvarvara/demucs-guitar-lora | loaded by Demucs's code (MIT) | MIT (model card) | not stated on the card |
| becruily Mel-Band RoFormer guitar | ran in MSST (MIT) | no license tag and no model card | not stated |
| BS-RoFormer-SW | ran in audio-separator and MSST (MIT) | none stated. Its current host's card says `license: unknown`, and copies carry `unknown`, `mit` or `other`. The bs-roformer-infer README says `Do not treat this package's MIT code license as a grant for commercial use of this checkpoint.` ([source](https://github.com/openmirlab/bs-roformer-infer)) | not stated |
| Demucs | MIT | Its maintainer's README says `The license of the weights is not clear: MusDB contains some data that were only usable for research purpose.` and `The 6 source variant of htdemucs was trained only on Meta internal dataset, which likely means CC-NC-BY license is applicable, as it was the case for all models released by FAIR.` ([source](https://raw.githubusercontent.com/adefossez/demucs/main/README.md)) | htdemucs: MUSDB HQ plus 800 more songs. MUSDB18-HQ's terms: `MUSDBHQ: is provided for educational purposes only and the material contained in them should not be used for any commercial purpose without the express permission of the copyright holders:` ([source](https://zenodo.org/records/3338373)). htdemucs_6s: Meta's internal dataset |
| demucs-onnx | MIT | StemSplit's ONNX copies are tagged `license:mit`, the converter's statement. The weights are Meta's, as for Demucs | as Demucs htdemucs_6s |
| demucs.cpp | MIT | the ggml file's host, `Retrobear/demucs.cpp`, is tagged `license: mit`. The weights are Meta's, as for Demucs | as Demucs htdemucs_6s |
| librosa | ISC | none, no trained model | none |
| MDX-Net | MIT (KUIELab's mdx-net) | trained by UVR's developers, no license per model | not stated |
| MDX23C | MIT (KUIELab's sdx23) | weights by ZFTurbo per UVR's README, no license per model | not stated |
| MSST | MIT | no license per checkpoint in its list | named for some checkpoints only |
| Open-Unmix | MIT | umxhq: MIT (Zenodo license id). umxl: `__Note, that the weights are only licensed for non-commercial use (CC BY-NC-SA 4.0).__` ([source](https://raw.githubusercontent.com/sigsep/open-unmix-pytorch/master/README.md)) | umxhq: MUSDB18-HQ, under the terms quoted for Demucs. umxl: a private dataset of compressed stems |
| SCNet Small | MIT (SCNet and MSST) | not stated in MSST's list, not verified | MUSDB18-HQ only, per the note over the part of MSST's list that holds this checkpoint (the row itself doesn't say), under the terms quoted for Demucs. Its file names say `musdb18` |
| Spleeter | MIT | MIT, per its paper | Deezer's internal datasets, not released |
| VR Architecture | MIT (tsurumeso's vocal-remover) | trained by UVR's developers, no license per model | not stated |

Every clause, quoted with its link and the date it was read, is in [`survey.md`](https://github.com/aaronorelup/blog/blob/research/guitar-tab-tools/docs/guitar-tab-research/lanes/source-separation/survey.md).

</details>

## Turning sound into notes

This step writes down a recording's notes, with pitch, start and end. 15 of the 68 tools, apps and services my agents listed for it ran on the cloud box, and four write MIDI (a list of notes) straight from the audio. On R1c, a real bossa nova guitar recording, those four returned 87 to 173 notes, with 63 to 120 of its 148 notes among them.

<ao-compare cols="2" aspect="25/9">
<figure><img src="/media/guitar-tab-tools/audio-to-notes-basic-pitch-s2n.webp" alt="Piano roll, a chart of notes as bars with time across and MIDI pitch up, titled Basic Pitch 0.4.0 on S2n, estimate in red over truth in grey. Red bars cover the grey bars of the low and high lines from about 2 to 28 seconds. Four short red notes sit alone near MIDI pitch 83 to 87, and one sits near pitch 24 at the very start."><figcaption><b>Basic Pitch on S2n</b><span class="ao-meta">Synthesized fingerstyle. 137 notes returned, 90 of 90 found.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/audio-to-notes-transkun-s2n.webp" alt="Piano roll titled Transkun 2.0.1, piano-trained, on S2n, estimate in red over truth in grey. Red bars sit on the grey bars between MIDI pitch 43 and 64. All 48 bass notes and 40 of the 42 melody notes were found. A red note at pitch 67 runs from about 2.1 to 3.8 seconds with no grey under it, and thin red marks sit near pitch 70."><figcaption><b>Transkun on S2n</b><span class="ao-meta">Piano-trained model, same clip. 99 returned, 88 of 90 found.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/audio-to-notes-basic-pitch-r1c.webp" alt="Piano roll titled Basic Pitch 0.4.0 on R1c, estimate in red over truth in grey. Grey bars spread between MIDI pitch 40 and 69 over 28 seconds, with red lines along them, and 120 of the 148 real notes were found. Some grey bars have no red, and some red notes have no grey under them, the highest near pitch 94 at the start."><figcaption><b>Basic Pitch on R1c</b><span class="ao-meta">Real bossa nova guitar from GuitarSet. 156 returned, 120 of 148 found.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/audio-to-notes-transkun-r1c.webp" alt="Piano roll titled Transkun 2.0.1, piano-trained, on R1c, estimate in red over truth in grey. Red bars sit on grey bars between MIDI pitch 40 and 69, and 111 of the 148 real notes were found. Other grey bars have no red, and a thin red line at pitch 50 runs through the last seconds of the clip with no grey under it."><figcaption><b>Transkun on R1c</b><span class="ao-meta">Same real clip. 119 returned, 111 of 148 found.</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

The clips, by id. S1 is a 30-second single-note melody I synthesized (62 notes). S2n is the fingerstyle clip above, 29 seconds of a bass line under a melody (90 notes), synthesized so every note is known. S2s is the same 90 notes on steel strings. S3 is 24 seconds of strummed chords (182 notes). S4 is a band mix of bass, drums, strummed guitar and a lead line (467 notes besides the drums), and S4guitar and S4lead are its guitar and lead tracks on their own. S5capo2 is S2n played on the same strings and frets with a capo on fret 2 (a capo is a clamp across the strings that raises every note), so every note sounds two frets higher. S5dropd is the same piece in Drop D, with the lowest string tuned down to D, so four bass notes sit below the usual lowest note. S6taps is S2s with 32 drum-kit hits mixed in, standing in for taps on the guitar body. S7flat30 is S3 rendered 30 cents flat (a cent is a hundredth of the step between two frets). R1a, R1b and R1c are real guitar recordings from GuitarSet: R1a is an accompaniment part (189 notes), R1b a single-note solo (70 notes) and R1c the bossa nova clip above (28 seconds, 148 notes). R2 is a real band song with singing, and R3a, R3b and R3c are real guitar videos. Those four have no known answer. The 17th clip, R2full, is the whole song R2 is cut from, and no tool here ran on it. Basic Pitch ran on the other 16.

Four of the tools write MIDI straight from the audio. Three of them were trained on piano: ByteDance's model, Onsets and Frames, and Transkun. The fourth is Basic Pitch. Of the rest, SoX only prepared a test file, and the others track pitch over time or turn a tracked pitch into notes. A real note counts as found when a returned note starts within 50 ms of it and is within 50 cents (half the step between two frets) of its pitch, and each returned note can match one real note at most. The pitch trackers write one pitch per short slice of time, so for them the count is in 10 ms slices. It's how many of the slices where the melody plays had the tracker's pitch within 50 cents of the melody. S2n has a melody and a bass line at once, and these trackers follow one pitch at a time, so my agents also checked their pitch against the bass line, in S2n's 2,523 bass slices. It was within 50 cents of the bass in 989 of them for aubio, 0 for Essentia's Melodia and 1,135 for its PitchCREPE with CREPE's small `tiny` model, 1,605 for FCPE, 1,266 for librosa `pyin`, 958 for PESTO, 495 for RMVPE, 1,754 for SwiftF0, and 40 and 310 for torchcrepe's small `tiny` and big `full` models. Essentia's PitchYinProbabilistic has no bass count. A MIDI pitch is a note's number, one step per fret, where 69 is the A at 440 Hz (hertz, vibrations per second). Velocity is how hard a note is played, the program is the instrument a MIDI file asks for, ticks per quarter note is the file's time grid, and a pitch bend is a slide in pitch inside a note. A confidence is a tracker's own number for how sure it is of a pitch. Times are wall-clock seconds on 2 CPU cores unless the line says the run was unpinned, which means it shared the CPU with other jobs. Local runs cost nothing beyond the cloud session itself. Every run and source is in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/audio-to-notes).

**aubio 0.4.9** ([repository](https://github.com/aubio/aubio)). A C library whose command-line programs track pitch and cut notes, from the Ubuntu package `aubio-tools` 0.4.9-4.4build1 that was already on the box.

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a as WAV files.
- Command: `aubiopitch -i <wav>` and `aubionotes -i <wav>`, with the defaults (pitch method `yinfft`, note-start method `hfc`).
- Out: `aubiopitch` writes `time_s pitch_hz` lines every 5.805 ms, 0 Hz in silence, with no confidence. Its pitch was within 50 cents in 2,511 of S1's 2,624 melody slices, 1,242 of S2n's 2,529 and 1,585 of R1b's 1,823. `aubionotes` writes `midi_pitch onset_s offset_s` lines. On S1 it returned 62 notes, and 3 of the 62 real ones were found within 50 ms. With a 100 ms window 61 of 62 were found, and those started a median 56.2 ms after the real notes. On S2n it returned 43 notes. None of the 90 real notes was found within 50 ms, and with a 100 ms window 38 were, 30 of them melody notes. On R1b it returned 169 notes with 52 of the 70 real ones among them.
- Time: 4.23 s for all 8 clips and both programs, peak memory 35.2 MB, run r0130. Unpinned and single-threaded. Per clip 0.14 to 0.30 s for `aubiopitch` and 0.19 to 0.42 s for `aubionotes`.
- Takes as a hint: `-p` sets the pitch method, `-l` the tolerance, `-s` the silence setting, `-B` and `-H` the analysis window and the step between windows, `-r` the sample rate and `-u` the unit. For notes it also takes `-O`, `-t`, `-M` and `-d`. No note range, tuning or key input.
- Hands off to: my agents turned its note lists into MIDI files with their own script (one track, program 24, velocity 80, 120 beats per minute). MuseScore 4, a notation app, was named as the next step for the MIDI and not run.

**Basic Pitch 0.4.0** ([repository](https://github.com/spotify/basic-pitch)). Spotify's note transcriber. Its makers' paper is titled `A Lightweight Instrument-Agnostic Model for Polyphonic Note Transcription and Multipitch Estimation`. Its model file, `nmp.tflite`, is 204,448 bytes and ships inside the package.

- In: 16 WAV files, S1, S2n, S2s, S3, S4, S4guitar, S4lead, S5capo2, S5dropd, S6taps, S7flat30, R1a, R1b, R1c, R2 and R3a. Also R3a's MP4 video file as it was, and R3b and R3c (run r0264).
- Command: `basic_pitch.inference.predict(path, Model(nmp.tflite))` with the defaults, and the command line `basic-pitch --save-midi --save-model-outputs --save-note-events <outdir> S1.wav`, which gave the same 64 notes on S1.
- Out: a MIDI file (one instrument, program 4, Electric Piano 1, 220 ticks per quarter note, tempo 120, with pitch bends), a note list with the header `start_time_s,end_time_s,pitch_midi,velocity,pitch_bend`, and the model's raw output as an `.npz` file. The counts per clip are in the table below. R3a's video file gave 108 notes against 105 from its WAV, R3b gave 129, R3c 87 and R2 334. The first S2n notes, as start-end in seconds, MIDI pitch and velocity (the first one sits inside the silent count-in bar):

  ```text
  0.000-0.150 24 49
  2.150-2.684 55 93
  2.161-2.927 43 71
  2.684-3.218 50 98
  2.684-3.218 55 98
  2.695-2.927 83 39
  ```

- Time: 62.37 s for the 16 files, peak memory 393 MB, run r0234. Per clip 0.87 s (R3a, 18 s long) to 3.71 s (S4, 38.7 s long), and 20.36 s for S1, the first call in the process.
- Takes as a hint: note range through `minimum_frequency` and `maximum_frequency` in Hz, plus `onset_threshold`, `frame_threshold`, `minimum_note_length` and `midi_tempo`. No tuning, capo, key or instrument input. With the range set to 82.4 to 1319.0 Hz (E2 to about E6, the guitar's range), it found 44 of S5dropd's 48 bass notes, because the four D2 notes (73.4 Hz) lie below that floor. With the floor at 73.4 Hz all 48 were found again (run r0349).
- Hands off to: its MIDI files went on to music21's key finders in the section on chords, beat, key and tuning (r0237) and to the tab writers in the section on choosing the string and fret (r0240). MuseScore 4 was named as a next step and not run. Two handoffs into Basic Pitch were tried. On the stems the source-separation agents made from S4 with Demucs `htdemucs_6s` (a stem is one instrument's track pulled out of a mix), the guitar stem gave 342 notes with 233 of the 369 real guitar notes among them. The true guitar track gave 386 notes with 302 among them. From the full mix's 461 notes, 249 guitar notes were found when counted against the guitar part alone. The table below counts the same mix against all three parts at once, and there the guitar share is 243. The bass stem gave 142 notes with 46 of the 61 real ones (run r0243). The second handoff stood in for a user saying the guitar is 30 cents flat. SoX shifted S7flat30 up 30 cents, and on that file Basic Pitch returned 265 notes with 139 of the 182 real ones among them (run r0319). On the clip as it was it returned 112, with 83 among them (run r0234).

| clip | notes returned | real notes found |
|---|---|---|
| S1 | 64 | 61 of 62 |
| S2n | 137 | 90 of 90 (42 of 42 melody, 48 of 48 bass) |
| S2s | 199 | 90 of 90 |
| S3 | 197 | 150 of 182 |
| S4 | 461 | 293 of 467 (bass 26 of 61, guitar 243 of 369, lead 24 of 37) |
| S4guitar | 386 | 302 of 369 |
| S4lead | 39 | 27 of 37 |
| S5capo2 | 139 | 90 of 90 |
| S5dropd | 130 | 90 of 90 |
| S6taps | 196 | 90 of 90 |
| S7flat30 | 112 | 83 of 182 |
| R1a | 196 | 137 of 189 |
| R1b | 76 | 57 of 70 |
| R1c | 156 | 120 of 148 |

**ByteDance piano transcription 0.0.6** (`piano_transcription_inference`, [repository](https://github.com/qiuqiangkong/piano_transcription_inference)). A piano transcription package. Its weights, the numbers the model learned in training (171,966,578 bytes, from the research archive Zenodo), were trained on piano, and here they ran on guitar.

- In: S2n and R1c, read with `librosa.load(path, sr=16000, mono=True)`. The package's own loader stopped with `AttributeError: No librosa.core attribute audio` under librosa 0.11, so my agents loaded the audio themselves.
- Command: `PianoTranscription(model_type="Note_pedal", device="cpu", checkpoint_path=...).transcribe(audio, out.mid)`
- Out: a MIDI file (384 ticks per quarter note, tempo 120, program 0, sustain pedal as CC64 events, 18 of them in S2n's file, no pitch bends). S2n: 87 notes returned, 79 of 90 found (all 48 bass notes, 31 of 42 melody notes). R1c: 87 returned, 63 of 148 found.
- Time: 159.3 s for both clips (model setup 8.6 s, S2n 75.8 s, R1c 73.7 s), peak memory 998.8 MB, run r0401, unpinned, with PyTorch, the machine-learning library it runs on, set to 2 threads. A re-run of S2n on 2 cores took 27.8 s (run r0464).
- Takes as a hint: none for pitch range, tuning or instrument. Its settings are `model_type`, `checkpoint_path` and `device`.
- Hands off to: MIDI, not fed further.

**CREPE Notes 0.2.0** ([repository](https://github.com/xavriley/crepe_notes)). Its makers call it `Post-processing for the CREPE pitch tracker to turn f0 pitch estimates into discrete notes (MIDI)`. Here it turned torchcrepe's pitch into notes. It cuts a note where the confidence dips and the pitch changes, and splits repeated notes where madmom, a music analysis library, detects a note start. The copy of madmom came from another agent's build on the box.

- In: torchcrepe's pitch file for S1, R1b and S4lead (10 ms per row), plus each clip's WAV. The pitch came in three versions, from torchcrepe's big `full` model, from its small `tiny` one, and from `full` with every slice set to 0 Hz where its periodicity (the model's 0-to-1 probability for the pitch it picked) is below 0.21.
- Command: `crepe_notes --f0 <clip>.f0in.csv --use-cwd --output-label <cfg> <clip>.wav`
- Out: one MIDI file per call (type 1, 220 ticks per quarter note, program 0, tempo 120, velocities 7 to 127, no pitch bends). It also prints the tuning it estimated, `Tuning offset: 6.000000000000005 cents` on S1, and takes it off before rounding to notes. In the order `full`, `tiny`, and `full` with the low-periodicity slices set to 0 Hz, S1 gave 62, 62 and 61 notes, with 61, 62 and 59 of its 62 found. R1b gave 94, 95 and 97 notes, with 29, 25 and 28 of its 70 found. S4lead gave 38, 38 and 40 notes, with 28, 33 and 27 of its 37 found. In R1b's `full` and `tiny` files, 48 and 52 notes sit at MIDI pitch 90 or above, carried over from torchcrepe's slices at 1,500 Hz or above.
- Time: 35.19 s for 9 calls (3 clips times 3 pitch versions), peak memory 570.9 MB, run r0616. Each call took 3.17 to 4.44 s, which includes running madmom's note-start detector on the audio. A re-run of the same nine calls, also on 2 cores, took 75.6 s, 6.12 to 22.33 s per call (22.33 s for the first), and wrote the same nine MIDI files byte for byte (run r0694).
- Takes as a hint: `--tuning-offset` (cents), `--min-duration`, `--min-velocity` and `--sensitivity`. No pitch range, capo or string input.
- Hands off to: it reads a pitch CSV with `frequency` and `confidence` columns at 10 ms per row, torchcrepe's here, and writes MIDI.

**Essentia 2.1b6.dev1389** ([repository](https://github.com/MTG/essentia)). An audio analysis library in C++ with Python wrappers, installed from the `essentia-tensorflow` package. Several of its algorithms ran.

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a as mono audio loaded at 44.1 kHz, or 16 kHz for CREPE. The two multi-pitch algorithms ran on S2n, S2s, S3, S4guitar, R1a and R1c.
- Command: all with their defaults.

  ```text
  EqualLoudness -> PredominantPitchMelodia() -> PitchContourSegmentation(hopSize=128)
  PitchYinProbabilistic()
  PitchCREPE(graphFilename=crepe-tiny-1.pb, hopSize=10)
  PitchCREPE(graphFilename=crepe-full-1.pb, hopSize=10)
  EqualLoudness -> MultiPitchKlapuri() or MultiPitchMelodia()
  ```

- Out:
  - Melodia writes a pitch and a confidence every 2.9 ms, 0 Hz where it judges there's no melody. Within 50 cents in 1,818 of S1's 2,624 slices, 1,590 of S2n's 2,529 and 1,318 of R1b's 1,823.
  - PitchContourSegmentation cuts that line into notes (start, length and MIDI number). S1: 37 notes returned, all 37 matching real notes, so 37 of 62 found. S2n: 32 returned, 31 of 90 found, all of them melody notes. R1b: 106 returned, 48 of 70 found.
  - Every pitch PitchYinProbabilistic wrote sat on a whole MIDI note, because its first stage rounds its candidates to whole notes. That rounding was read in Essentia's source code, and whether the installed build was made from that code wasn't checked, though it behaves the same. On test tones it read 110 Hz as 103.826 Hz and 440 Hz as 293.665 Hz, and why it lands below the tone was not settled. Within 50 cents in 1,298 of S1's 2,624 slices, 0 of S2n's 2,529 and 42 of R1b's 1,823.
  - PitchCREPE writes a pitch and a confidence every 10 ms. With the `tiny` model, within 50 cents in 2,578 of S1's 2,624 slices, 1,282 of S2n's 2,529 and 1,552 of R1b's 1,823. With `full`, 2,597 of S1's and 1,602 of R1b's.
  - MultiPitchKlapuri and MultiPitchMelodia write a list of pitches every 2.9 ms and no notes. Klapuri gave at most 2 pitches in any slice and a pitch in every slice, the silent count-in included. MultiPitchMelodia gave up to 4 pitches in a slice on S3.
- Time: in batch r0321, on 2 cores, Melodia with note cutting took 38.90 s for 8 clips and peaked at 250 MB of memory. PitchYinProbabilistic took 11.31 s and 255 MB, PitchCREPE `tiny` 124.72 s and 367 MB, and `full` 453.93 s and 599 MB for 3 clips. MultiPitchKlapuri took 51.38 s and MultiPitchMelodia 11.42 s for 6 clips, both unpinned (runs r0345 and r0346).
- Takes as a hint: Melodia's `minFrequency` and `maxFrequency`. PitchContourSegmentation takes `tuningFrequency` in Hz, a tuning input (default 440). `Audio2Midi`, which didn't run, has `transpositionAmount` and `tuningFrequency`.
- Hands off to: PitchContourSegmentation also took other trackers' pitch lines (run r0341). On S1, FCPE's line gave 48 notes with 48 of 62 found, PESTO's 62 with 47, PitchCREPE `tiny`'s 65 with 43 and torchcrepe `full`'s 48 with 47. My agents also wrote MIDI files from Melodia's notes.

**FCPE, `torchfcpe` 0.0.4** ([repository](https://github.com/CNChTu/FCPE)). A pitch tracker built on PyTorch. Its name stands for `Fast Context-based Pitch Estimation`, and its 43,363,260-byte model ships inside the package.

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a, resampled to 16 kHz.
- Command: `spawn_bundled_infer_model(device="cpu").infer(x, sr=16000, decoder_mode="local_argmax", threshold=0.006, f0_min=80, f0_max=880, interp_uv=False)`, the settings of the example in its README, the repository's front page.
- Out: a pitch in Hz every 10 ms, 0 where it judged there's no note, with no confidence. Within 50 cents in 2,598 of S1's 2,624 slices, 704 of S2n's 2,529 and 1,622 of R1b's 1,823.
- Time: 32.57 s for 8 clips (model setup 9.13 s), peak memory 636 MB, batch r0321.
- Takes as a hint: `f0_min` and `f0_max` (its built-in help text says `Use in post-processing`), `threshold` and `decoder_mode`.
- Hands off to: Essentia's PitchContourSegmentation (run r0341). S1 gave 48 notes with 48 of 62 found. R1b gave 87 notes with 56 of 70 found, after 7 notes with no pitch were dropped.

**librosa 1.0.0 `pyin`** ([repository](https://github.com/librosa/librosa)). Probabilistic YIN, a pitch tracker with no trained weights.

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a, loaded at 22,050 Hz.
- Command: `librosa.pyin(y, sr=22050, fmin=65.406 (C2), fmax=2093.005 (C7), frame_length=2048, hop_length=512)`
- Out: a pitch in Hz every 23.2 ms (NaN, a not-a-number marker, where it hears no note), a yes-or-no flag for whether a slice has a pitch, and the probability that it does, no notes. Within 50 cents in 2,515 of S1's 2,624 slices, 116 of S2n's 2,529 and 1,552 of R1b's 1,823.
- Time: 31.75 s for 8 clips, peak memory 485 MB, batch r0321. S1, the first clip, took 13.18 s and the others 1.39 to 3.46 s.
- Takes as a hint: note range through `fmin` and `fmax`, both required. Its other settings, such as `max_transition_rate`, shape the tracking itself.
- Hands off to: none was tried.

**Onsets and Frames, Magenta's MAESTRO checkpoint** (`magenta` 2.1.4, [repository](https://github.com/magenta/magenta)). Google Magenta's transcription model. The checkpoint, its saved trained model, was trained on piano recordings, and here it ran on guitar. It needed Python 3.7 or 3.8 (3.8 was used) and TensorFlow 2.9.1, another machine-learning library, and its install took 2.0 GB of disk.

- In: S1, S2n and R1c as mono WAV, and S4guitar.
- Command: `onsets_frames_transcription_transcribe --model_dir=<checkpoint>/train S1.wav S2n.wav R1c.wav S4guitar.wav`
- Out: one MIDI file per input (type 1, 220 ticks per quarter note, tempo 120, program 0, no pedal, no pitch bends). S1: 65 returned, 62 of 62 found. S2n: 91 returned, 88 of 90 found (all 48 bass, 40 of 42 melody). R1c: 173 returned, 105 of 148 found, with the found notes starting a median 33.7 ms early. With a 100 ms window R1c gave 119 of 148. S4guitar: 372 returned, 299 of 369 found.
- Time: 39.57 s for the 4 files, peak memory 1,151.0 MB, run r0545. The first file started about 20 s in, after TensorFlow's start-up, and then each file took 4.07 to 5.30 s.
- Takes as a hint: none for pitch range, tuning, instrument or tempo.
- Hands off to: MIDI, not fed further.

**PESTO, `pesto-pitch` 2.0.1** ([repository](https://github.com/SonyCSLParis/pesto)). A pitch tracker from Sony CSL Paris. Its default model file is 534,664 bytes and ships inside the package.

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a at 44.1 kHz.
- Command: `pesto.predict(torch.from_numpy(y), 44100, step_size=10.0)`
- Out: time, pitch in Hz and a confidence from 0 to 1 every 10 ms, with a pitch on every slice and no decision on whether a slice has a pitch. Within 50 cents in 2,590 of S1's 2,624 slices, 1,534 of S2n's 2,529 and 1,599 of R1b's 1,823.
- Time: 49.59 s for 8 clips (setup 4.38 s), peak memory 1,044 MB, batch r0321.
- Takes as a hint: `step_size`, `model_name`, `reduction` and `num_chunks`. No range or tuning input.
- Hands off to: Essentia's PitchContourSegmentation (run r0341). S1 gave 62 notes with 47 of 62 found. R1b gave 169 notes with 43 of 70 found.

**RMVPE through `rmvpe-onnx` 0.2.3** ([RMVPE](https://github.com/Dream-High/RMVPE), [rmvpe-onnx](https://github.com/NewComer00/rmvpe-onnx)). RMVPE is a pitch model for the singing voice. `rmvpe-onnx` is a third-party wrapper that runs its 361,688,443-byte model file on ONNX Runtime, a program that runs model files. My agents' record lists the model and the wrapper as two entries, with the same runs.

- In: S1, S2n, S2s, S4, R1b, R2 and R3a as mono WAV, and S4lead.
- Command: `RMVPE(model_path=..., device="cpu").predict(audio, sr)`, and the command line `rmvpe-onnx predict S1.wav --model rmvpe.onnx --device cpu --csv S1.csv`.
- Out: time, pitch in Hz and a confidence from 0 to 1 every 10 ms, plus the model's raw values for 360 pitch steps, with a pitch on every slice and no notes. At its default threshold of 0.03 the command line marked 498 of all 2,984 slices in S1 as having a pitch. Within 50 cents in 1,710 of S1's 2,624 melody slices, 1,051 of S2n's 2,529, 2,667 of S4lead's 2,780 and 1,544 of R1b's 1,823.
- Time: 34.68 s for 8 clips, peak memory 1,198.7 MB, run r0516. `predict()` took 16.05 s on S1, the first call, and 1.13 to 2.44 s on the others. `rmvpe-onnx` sets no thread count. A later probe with the same ONNX Runtime version and settings, held to CPUs 0 and 1, saw ONNX Runtime's worker threads run on CPUs 1, 2 and 3 (run r0666). So the 2 cores of this run are the slot it was given, not where all its threads ran. That wasn't measured in this run itself.
- Takes as a hint: `model_path`, `device`, and `--confidence-threshold` on the command line. No frequency range, tuning or key input.
- Hands off to: none was tried.

**SoX 14.4.2** ([source](https://sourceforge.net/p/sox/code/)). An audio command-line tool, not a transcriber. It made the input for the tuning test, and the same command ran again later to log it and to compare outputs.

- In: S7flat30 as a WAV file.
- Command: `sox S7flat30.wav S7flat30.plus30c.wav pitch 30`
- Out: a WAV file 24.00 s long (44.1 kHz, 2 channels, 16-bit), 30 cents higher. Runs of the same command gave files that differ by at most 2 in 16-bit units, from the dither, a little noise SoX adds by default. With `-R`, two runs came out identical.
- Time: 0.26 s, peak memory 9.7 MB, run r0602, unpinned.
- Takes as a hint: the shift in cents, as the argument of its `pitch` effect. Also the switches `-R`, a repeatable mode, and `-D`, which turns off the automatic dither.
- Hands off to: Basic Pitch read the shifted file (run r0319, in the Basic Pitch entry).

**SwiftF0 0.3.0** ([repository](https://github.com/lars76/swift-f0)). A pitch tracker for one voice or instrument at a time, with its own note cutter and MIDI export. Its 135,090-byte ONNX model ships inside the package.

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a as WAV through `detect_file`, resampled to 16 kHz.
- Command: `SwiftF0(threads=2).detect_file(path)`, then `segment_notes(result)` with `pitch_hold_ms=80`.
- Out: a pitch and a confidence every 16 ms (a slice counts as having a pitch at confidence 0.5 or more, its built-in help text says), and notes as `Note(start, end, pitch_hz)`. Within 50 cents in 2,522 of S1's 2,624 slices, 567 of S2n's 2,529 and 1,555 of R1b's 1,823. Notes: S1 48 returned with 46 of 62 found, S2n 55 returned with 27 of 90 (18 bass, 9 melody), R1b 60 returned with 50 of 70. S1's real melody starts with F#4 at 1.667 s and F#4 again at 2.083 s. SwiftF0's first notes on S1, as start-end in seconds, MIDI pitch and fitted pitch:

  ```text
  1.680-2.512 66 (369.994 Hz)
  2.512-2.944 67 (391.769 Hz)
  2.944-3.776 69
  ```

  The two F#4 notes came out as one.
- Time: 4.39 s for 8 clips (model setup 0.12 s, 0.22 to 0.80 s per clip), peak memory 282 MB, batch r0321.
- Takes as a hint: `fmin` and `fmax` (clamped to 46.875 to 2093.75 Hz), and `pitch_hold_ms` for the note cutter. No tuning, key, tempo or instrument input. With 82.4 to 1319.0 Hz set (run r0131, unpinned), the note lists came out with the same counts and the same number of matched notes on the six clips with a known answer.
- Hands off to: its own `segment_notes`. My agents also wrote MIDI files from the note lists.

**torchcrepe 0.0.24** ([repository](https://github.com/maxrmorrison/torchcrepe)). A PyTorch version of the CREPE pitch tracker with CREPE's weights converted, `tiny` (1,962,363 bytes) and `full` (88,991,291 bytes).

- In: S1, S2n, S2s, S4, S4lead, R1b, R2 and R3a, resampled to 16 kHz.
- Command: `torchcrepe.predict(x, 16000, hop_length=160, fmin=50.0, fmax=2006.0, model=<tiny|full>, return_periodicity=True, batch_size=512, device="cpu")`
- Out: a pitch in Hz and a periodicity from 0 to 1 every 10 ms, with a pitch on every slice. Within 50 cents in 2,576 (`tiny`) and 2,586 (`full`) of S1's 2,624 slices, 175 and 358 of S2n's 2,529, and 809 and 872 of R1b's 1,823. With the default Viterbi decoder, the step that picks one pitch per slice from the model's output, 890 (`tiny`) and 838 (`full`) of R1b's 1,823 melody slices came out at 1,500 Hz or above. With the `weighted_argmax` decoder, `tiny` was within 50 cents in 1,546 of R1b's 1,823 (run r0287). It adds random noise to every pitch, so a re-run gave a different pitch in all 2,934 slices of R1b, a median 8.1 cents apart.
- Time: batch r0321, `tiny` 160.58 s for 8 clips (peak 833 MB) and `full` 1,786.71 s (peak 1,947 MB, 116.2 to 354.5 s per clip).
- Takes as a hint: `fmin`, `fmax`, `model`, `decoder` and `hop_length`, plus threshold and filter helpers.
- Hands off to: Essentia's PitchContourSegmentation (run r0341, `full` with slices below periodicity 0.21 set to 0 Hz). S1 gave 48 notes with 47 of 62 found, R1b 38 notes with 27 of 70. And CREPE Notes (run r0616, above).

**Transkun 2.0.1** ([repository](https://github.com/Yujia-Yan/Transkun)). A piano transcription model. The 56,408,978-byte weights in the package were trained on piano, and here they ran on guitar.

- In: S1, S2n, S3, R1a, R1b and R1c as WAV.
- Command: `transkun <clip>.wav <clip>.mid --device cpu`
- Out: a MIDI file (960 ticks per quarter note, tempo 120, program 0, velocities, sustain pedal as CC64 events, 24 in S2n's file, no pitch bends). S1: 63 returned, 62 of 62 found. S2n: 99 returned, 88 of 90 found (all 48 bass, 40 of 42 melody). S3: 171 returned, 167 of 182. R1a: 134 returned, 112 of 189. R1b: 52 returned, 49 of 70. R1c: 119 returned, 111 of 148.
- Time: 814.45 s for the 6 clips, peak memory 1,490 MB, run r0216. It loads the model again for every clip, and each clip took 83.7 s (S1) to 172.5 s (R1a), loading included. A re-run of S1, also on 2 cores but under a different load on the box, took 40.6 s (run r0464).
- Takes as a hint: `--weight`, `--conf`, `--device`, `--segmentHopSize` and `--segmentSize`. No pitch range, tuning, instrument or tempo input.
- Hands off to: MIDI, not fed further.

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

Several were stopped by the cloud session's permission system. It refused some commands with the reason `[Code from External]`, among them installing or running code cloned from other people's repositories and running two packages installed from the Python package index. Where my agents wrote steps for me to try a tool myself, the line names the section of [`for-aaron.md`](https://github.com/aaronorelup/blog/blob/research/guitar-tab-tools/docs/guitar-tab-research/lanes/audio-to-notes/for-aaron.md).

- **Ableton Live "Convert to MIDI"**: my agents didn't read up on it for this step, and neither the apps list nor the services list has it. My fingerstyle agents list its drum command, and test T115 in my list of 120 tests covers both.
- **[alphaTab](https://alphatab.net/docs/introduction)**: a notation library whose importers include MusicXML and Guitar Pro files, named as a later step for the notes and not run in this step. Version 1.9.0 ran in three other sections: showing a tab in the browser, metronome and sync, and tools handing off to each other. No steps.
- **AnthemScore**: my agents didn't read up on it for this step. The apps and hosted-services research covers it. No steps.
- **[Aria-AMT](https://github.com/EleutherAI/aria-amt)**: a piano transcription model, not attempted. In their first round my agents gave the reason that two piano models, ByteDance's and Transkun, had already run. Onsets and Frames, the third, ran in a later round. As shipped, its transcribe step begins with `assert cuda_is_available(), "CUDA device not found"`, so it stops on a machine without a graphics card. Steps for me: test T73 in my list of 120 tests.
- **Audacity**: named as a host for Vamp plugins (a plugin format for audio analysis) and not read. No steps.
- **[audio_to_midi_melodia](https://github.com/justinsalamon/audio_to_midi_melodia)**: a script made to turn MELODIA's melody into MIDI. It needs the MELODIA plugin, whose download page refused the box (HTTP 403). No steps.
- **[basicpitch.io](https://basicpitch.io)**: Basic Pitch's demo site. The page was read and the app was not run. No steps.
- **[CREPE](https://github.com/marl/crepe)**, the original TensorFlow package `crepe` 0.0.16: building it stopped with `ModuleNotFoundError: No module named 'pkg_resources'`, and with the build constraint `setuptools<81` it stopped with `urllib.error.HTTPError: HTTP Error 403: Forbidden` while fetching its weights from github.com. Installing it with the weights put in place was refused by the permission system. Its weights ran here through torchcrepe and Essentia. Steps: section 4.
- **[Deep Salience](https://github.com/rabitt/ismir2017-deepsalience)**: pitch and melody models from a 2017 paper, with no package from their authors, so they run from a clone of their repository. Running its script was refused by the permission system, and no setup of TensorFlow or Keras, another machine-learning library, was on the box. Steps: section 13.
- **[Demucs](https://github.com/adefossez/demucs)**: splits a mix into stems. The source-separation agents ran it, and its stems went into Basic Pitch here. No steps.
- **[GAME](https://github.com/openvpi/GAME)** (openvpi): its makers describe it as `designed for transcribing singing voice into music scores`. My agents skipped it to save time and disk space. Steps for me: test T73 in my list of 120 tests.
- **[Harmonica](https://arxiv.org/abs/2609.04640)**: a paper on transcription models, found late and not surveyed in full. It names no code or weights. No steps.
- **[hFT-Transformer](https://github.com/sony/hFT-Transformer)**: a piano transcription model from Sony. Not attempted. Its README lists machines with graphics cards, and its checkpoint runs through the repository's own scripts. Running Timbre-Trap's cloned code had been refused earlier, the agent that tried Timbre-Trap reports. No file on the box records that refusal, so it is not verified. Steps: section 10.
- **Klangio**: my agents didn't read up on it for this step. The apps and hosted-services research covers it. No steps.
- **[madmom](https://github.com/CPJKU/madmom)**: a music analysis library, not run on its own here. Its note-start detector ran inside CREPE Notes, and my chord and fingerstyle agents ran madmom itself (r0063, r0247). No steps.
- **[MELODIA](https://www.upf.edu/web/mtg/melodia)** Vamp plugin: its download page refused the box (HTTP 403), and the download sits behind a form. The same method ran inside Essentia as Melodia. Steps: section 5.
- **[melodyExtraction_JDC](https://github.com/keums/melodyExtraction_JDC)**: a singing-melody model in Keras with no package from its authors, so it runs from a clone of its repository. The permission system refused running the Deep Salience clone, and no TensorFlow or Keras setup was on the box. This one wasn't attempted after that refusal. Steps: section 13.
- **[melodyExtraction_SSL](https://github.com/keums/melodyExtraction_SSL)**: a melody extraction model in Keras by the same author, not run for the same reason and not attempted after that refusal either. Steps: section 13.
- **Melodyne**: my agents didn't read up on it for this step. The apps and hosted-services research covers it. No steps.
- **[MIROS](https://arxiv.org/abs/2603.27528)**: a transcription system that extends YourMT3+, found late and not surveyed in full. The paper gives no code or weights link. No steps.
- **[MR-MT3](https://github.com/gudgud96/MR-MT3)**: a multi-instrument transcription model. Not attempted. It runs from a clone of its repository. Minutes earlier the permission system had refused cloned code twice, for MT3 and mt3-pytorch. Its `inference.py` also calls `self.model.cuda()` with no device check, so a run without a graphics card needs a code change. Later the package `mt3-infer` installed. Its `mr_mt3` model pairs MR-MT3's code with MR-MT3's `mt3.pth` checkpoint. Running the package was refused (its own entry). Steps: section 10.
- **[MT3](https://github.com/magenta/mt3)** (Magenta): Google's multi-instrument transcription model. Installing its cloned repository the way its notebook does was refused by the permission system. Later my agents installed the package `mt3-infer`, which carries code for a PyTorch version of MT3 and two related models. Running it was refused too (its own entry). Steps: section 2.
- **[mt3-infer](https://github.com/openmirlab/mt3-infer)** 0.2.0: a third-party package around MT3-family models. It installed, but running its command line was refused by the permission system, so no model was downloaded. Steps: section 14.
- **[mt3-pytorch](https://github.com/kunato/mt3-pytorch)**: a PyTorch version of MT3. Its requirements can't all be installed on the box, because `ddsp` needs `crepe` and `crepe`'s build fails. Running its clone was refused by the permission system too. Steps: section 10.
- **[MTANet](https://github.com/Annmixiu/MTANet)**: a singing-melody model with no trained weights published. No steps.
- **[MuScriptor](https://github.com/muscriptor/muscriptor)** (Kyutai and Mirelo): a multi-instrument transcription model. Its weights are gated on Hugging Face, a site that hosts AI models, behind a sign-in and an acceptance step, and no Hugging Face access key was on the box. The 411,888,600-byte file was also over the 200 MB download limit in force that day. Steps: section 11.
- **[MuScriptor's hosted page](https://muscriptor.kyutai.org)**: the page needs JavaScript and the app wasn't run. Steps: section 11.
- **[MuseScore 4](https://musescore.org/en/handbook/4/command-line-usage)**: a notation app whose command line converts MIDI, named as a later step and not run. No steps.
- **Music.AI**: my agents didn't read up on it for this step. The apps and hosted-services research covers it. No steps.
- **[music21](https://www.music21.org/)**: a music library whose converter reads MIDI, named as a later step for MIDI and not run in this step. My chord and beat agents ran music21 10.5.2's key finders on Basic Pitch's notes from this section (r0237). No steps.
- **[NeuralNote](https://github.com/DamRsn/NeuralNote)**: a desktop plugin and app for audio to MIDI. Its README describes no command-line use, and it wasn't attempted. Steps: section 3.
- **[Omnizart](https://github.com/Music-and-Culture-Technology-Lab/omnizart)**: a transcription library for instruments, vocals, chords, drums and beats. One install attempt, version 0.5.0 on Python 3.8, stopped while building `vamp` 1.1.0 with `ModuleNotFoundError: No module named 'numpy'`. Steps: section 7.
- **[Onsets and Velocities](https://github.com/andres-fr/iamusica_training)**: a piano model. My agents skipped it to save time and disk space. Steps for me: test T73 in my list of 120 tests.
- **[onsets-and-frames](https://github.com/jongwook/onsets-and-frames)** (PyTorch version): publishes no trained checkpoint, so Magenta's own checkpoint ran instead. No steps.
- **[PENN](https://github.com/interactiveaudiolab/penn)** 1.0.0: a pitch tracker. It installed, but `import penn` stopped with `Could not find any lib files matching version pt215cpu`, because its decoder package has compiled files for PyTorch 2.6 to 2.11 and the box had PyTorch 2.15 (runs r0399 and r0423). A second PyTorch version in its own environment was ruled out by the disk limit at the time. Steps: section 12.
- **[pitch-core](https://crates.io/crates/pitch-core)**: a pitch tracker in Rust, found late and not surveyed in full. No steps.
- **[praat-parselmouth](https://github.com/YannickJadoul/Parselmouth)**: Praat's pitch analysis for Python, found late and not surveyed in full. No steps.
- **[pYIN Vamp plugin](https://github.com/c4dm/pyin)**: pYIN as a plugin, with a notes output. The agent that tried it reports that building it was refused by the session's permission settings. No file on the box records that refusal, so it is not verified. Steps: section 6, through Tony.
- **[pyworld](https://github.com/JeremyCCHsu/Python-Wrapper-for-World-Vocoder)**: the WORLD vocoder's pitch trackers for Python, found late and not surveyed in full. No steps.
- **[ROSVOT](https://github.com/RickyL-2000/ROSVOT)**: a research model built to turn singing into MIDI. Its README installs a version of PyTorch made for graphics cards. My agents skipped it to save time and disk space. Steps for me: test T73 in my list of 120 tests.
- **[Self-supervised F0 and voicing for monophonic music](https://arxiv.org/abs/2601.11768)** (Bitra and Beigi): a 2026 paper with no code or weights linked. A web search for its code couldn't be made, because the session's search budget was used up. No steps.
- **[Sheet Sage](https://github.com/chrisdonahue/sheetsage)**: its makers say it `transcribes your favorite pop song into a lead sheet containing the melody and chords`. Its README asks to `ensure you are running Linux and have Docker installed`, and its one-time setup downloads `a ~4GB Docker container`. The box has no Docker, a system that ships a program with everything it needs to run. Steps: section 8.
- **[SOME](https://github.com/openvpi/SOME)** (openvpi): its makers' README says `SOME is a MIDI extractor that can convert singing voice to MIDI sequence`. My agents skipped it to save time and disk space. Steps for me: test T73 in my list of 120 tests.
- **Sonic Annotator**: a command-line host for Vamp plugins, named and not read. No steps.
- **[Sonic Visualiser](https://www.sonicvisualiser.org/)**: a desktop host for Vamp plugins, named and not run. No steps.
- **[SPICE](https://arxiv.org/abs/1910.11664)**: Google's self-supervised pitch model, found late and not surveyed in full. No steps.
- **Spleeter 2-stem ONNX**: a source-separation model that Omnizart's vocal mode downloads. Not run here, since the source-separation research covers Spleeter. No steps.
- **[Timbre-Trap](https://github.com/sony/timbre-trap)**: a multi-pitch model. Its code was cloned and its 11,353,410-byte checkpoint downloaded, and the agent that tried it reports that running the cloned code and loading the checkpoint was refused by the session's permission settings. No file on the box records that refusal, so it is not verified. Its Hugging Face demo reported `RUNTIME_ERROR`. Steps: section 10.
- **[Tony](https://www.sonicvisualiser.org/tony/)**: a desktop app built on pYIN that shows the pitch and the notes. Not run here, since the pYIN plugin build was reported refused. Steps: section 6.
- **vamp-simple-host**: a command-line host for Vamp plugins that is on the box, but no Vamp plugin could be run (MELODIA's download page refused the box and the pYIN build was reported refused). No steps.
- **[VocalParse](https://github.com/pymaster17/VocalParse)**: a model built to turn singing into lyrics, notes and tempo, on top of Qwen3-ASR, a speech-recognition model. Its README installs a version of PyTorch made for graphics cards and doesn't describe use without one. My agents skipped it to save time and disk space. Steps for me: test T73 in my list of 120 tests.
- **[VOCANO](https://github.com/B05901022/VOCANO)**: a model made to turn singing into MIDI, found late and not surveyed in full. No steps.
- **[yourmt3](https://pypi.org/project/yourmt3/)** 0.1.4: a third-party package of YourMT3 models, with weights from a third party's Hugging Face repository. It installed and a 121,781,787-byte checkpoint downloaded, but the run was refused by the permission system. Steps: section 14.
- **[YourMT3+](https://huggingface.co/spaces/mimbres/YourMT3)**: a multi-instrument transcription model with a demo on Hugging Face. My agents' one call to the demo from this step was refused for lack of graphics-card time. The answer was `You have exceeded your ZeroGPU quota (90s requested vs. 79s left).` The hosted-services research ran the demo itself on S2n (r0112) and its CPU copy, `mimbres/YourMT3-cpu`, on S2n, R1c and an ElevenLabs guitar stem of S4 (r0164, r0245, r0231). My agents didn't try a local run. Its code has no package from its authors and sits in the demo's repository, and running cloned code had been refused. Later two third-party packages that carry YourMT3 models, `yourmt3` and `mt3-infer`, installed. Running them was refused too (their own entries). Steps: section 1.

</details>

<details><summary>Licenses of the tools that ran</summary>

Besides the 68 tools, apps and services, my agents' record lists 30 datasets. Most were used to train models. Molina and Phenicx were used only to test Basic Pitch, ComMU to evaluate MR-MT3, and Vocadito's audio sits in Basic Pitch's tests. The table names the datasets behind the models that ran.

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| aubio | [GPL-3.0-or-later](https://raw.githubusercontent.com/aubio/aubio/master/COPYING) | no model | no training data |
| Basic Pitch | [Apache-2.0](https://raw.githubusercontent.com/spotify/basic-pitch/main/LICENSE) | inside the package, no separate license file found | GuitarSet ([CC BY 4.0](https://zenodo.org/records/3371780)), MAESTRO (`Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0)`, [source](https://magenta.tensorflow.org/datasets/maestro)), Slakh2100 ([CC BY 4.0](https://zenodo.org/records/4599666)), iKala (no license on its Zenodo backup copy, original terms not read), MedleyDB (`for non-commercial research use only`, [source](https://zenodo.org/records/1715175)) |
| ByteDance piano transcription | MIT by its `setup.py` classifier, no license file in the [repository](https://github.com/qiuqiangkong/piano_transcription_inference) | [CC BY 4.0](https://zenodo.org/records/4034264) | MAESTRO v2.0.0 (`Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0)`, [source](https://magenta.tensorflow.org/datasets/maestro)) |
| CREPE Notes | [GPL-3.0](https://raw.githubusercontent.com/xavriley/crepe_notes/main/LICENSE), and the madmom code it calls is BSD-2-Clause ([madmom LICENSE](https://raw.githubusercontent.com/CPJKU/madmom/main/LICENSE)) | runs madmom's note-start model, `All model and data files are distributed under the following license: Creative Commons Attribution-NonCommercial-ShareAlike 4.0` ([madmom LICENSE](https://raw.githubusercontent.com/CPJKU/madmom/main/LICENSE)), and the installed madmom's `madmom/models/LICENSE` says `All files in this repository are distributed under the following license: Creative Commons Attribution-NonCommercial-ShareAlike 4.0`. Its input pitch here came from torchcrepe, run separately (see torchcrepe) | not stated in the record |
| Essentia | [AGPL-3.0](https://raw.githubusercontent.com/MTG/essentia/master/Essentia%20Licensing.txt), and its site says `Essentia is available under an open licence, Affero GPLv3, for non-commercial applications` ([licensing page](https://essentia.upf.edu/licensing_information.html)) | the sources disagree: `All the models are available under the CC BY-NC-SA 4.0 license for non-commercial use` ([licensing page](https://essentia.upf.edu/licensing_information.html)) and `Creative Commons Attribution-NonCommercial-NoDerivatives 4.0` ([models LICENSE](https://essentia.upf.edu/models/LICENSE)) | CREPE models, per Essentia's models page and `crepe-full-1.json`: RWC-synth (license not read) and MDB-stem-synth (`Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)`, [source](https://zenodo.org/records/1481172)) |
| FCPE | [MIT](https://raw.githubusercontent.com/CNChTu/FCPE/main/LICENSE) | inside the package, no separate license found, and my agents' record reads it as under the repository's MIT | per its paper, M4Singer (`We agree to the dataset license: CC BY-NC-SA 4.0`, [source](https://raw.githubusercontent.com/M4Singer/M4Singer/master/dataset_license.md)) and VCTK ([CC BY 4.0](https://datashare.ed.ac.uk/handle/10283/3443)), re-synthesized |
| librosa `pyin` | [ISC](https://raw.githubusercontent.com/librosa/librosa/main/LICENSE.md) | no model | no training data |
| Onsets and Frames | [Apache-2.0](https://raw.githubusercontent.com/magenta/magenta/main/LICENSE) | `maestro_checkpoint.zip`, no license statement found | MAESTRO (`Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0)`, [source](https://magenta.tensorflow.org/datasets/maestro)) |
| PESTO | [LGPL-3.0](https://raw.githubusercontent.com/SonyCSLParis/pesto/master/LICENSE.md) | inside the repository, no separate license found | MIR-1K (no license on its Zenodo backup copy, original terms not read), going by the file names `mir-1k.ckpt` and `mir-1k_g7.ckpt`, not verified |
| RMVPE via rmvpe-onnx | RMVPE [Apache-2.0](https://raw.githubusercontent.com/Dream-High/RMVPE/main/LICENSE), rmvpe-onnx [MIT](https://raw.githubusercontent.com/NewComer00/rmvpe-onnx/HEAD/LICENSE) | `rmvpe.onnx`, card tag `license: mit` ([card](https://huggingface.co/lj1995/VoiceConversionWebUI/raw/main/README.md)), and which training run made it is not verified | per its paper, MDB-stem-synth (`Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)`, [source](https://zenodo.org/records/1481172)), MIR-1K (no license on its Zenodo backup copy, original terms not read), Cmedia and MIR-ST500 (licenses not read) |
| SoX | GPL-2.0-or-later for the `sox` program and LGPL-2.1-or-later for libsox, `sox.c, and thus SoX-the user application, is distributed under the GPL, while the files that make up libsox are licensed under the less restrictive LGPL.` ([COPYING](https://sourceforge.net/p/sox/code/ci/master/tree/COPYING?format=raw)), which goes on `Note that some of the external packages that can be linked into libsox are GPLed and/or may have licensing problems, so they can be disabled at configure time with the relevant--with-* options. If libsox is built with such libraries, it must be distributed under the GPL.` | no model | no training data |
| SwiftF0 | [MIT](https://raw.githubusercontent.com/lars76/swift-f0/main/LICENSE) | `model.onnx` inside the package, no separate license found | pitch-benchmark, card license tag `cc-by-nc-sa-4.0` ([card](https://huggingface.co/api/datasets/lars1234/pitch-benchmark)) |
| torchcrepe | [MIT](https://raw.githubusercontent.com/maxrmorrison/torchcrepe/master/LICENSE) | CREPE's weights converted, inside the repository, no separate license found | CREPE's data: MIR-1K (no license on its Zenodo backup copy, original terms not read), Bach10 and RWC-synth (licenses not read), MedleyDB (`for non-commercial research use only`, [source](https://zenodo.org/records/1715175)), MDB-stem-synth (`Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)`, [source](https://zenodo.org/records/1481172)), NSynth ([CC BY 4.0](https://magenta.tensorflow.org/datasets/nsynth)) |
| Transkun | [MIT](https://raw.githubusercontent.com/Yujia-Yan/Transkun/main/LICENSE) | `2.0.pt` inside the package, no separate license found | MAESTRO v3.0.0 (`Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0)`, [source](https://magenta.tensorflow.org/datasets/maestro)) |

Every clause in full is in [`survey.md`](https://github.com/aaronorelup/blog/blob/research/guitar-tab-tools/docs/guitar-tab-research/lanes/audio-to-notes/survey.md) in the research folder.

</details>

## Chords, beat, key and tuning

To line a tab up with a song, an app needs its chords, beats, bars (groups of beats), key (the notes it's built on) and tuning. My agents listed 71 tools, apps and research projects for that and ran 20. On S3, a 24-second strummed clip, seven chord recognizers had the right chord, or none over its silent first bar, for 18.8 to 23.2 seconds, counting a played D7 as D.

<ao-compare cols="1" aspect="16/9">
<figure><img src="/media/guitar-tab-tools/chords-beats-key-s3-chords.webp" alt="Eight rows of labeled boxes over 24 seconds. The top row, played, reads none, G, Em, Am7, D7, G, Em, C, D7, G. Below it are rows for autochord, Chordino, CREMA, Essentia TonalExtractor, lv-chordia, madmom CNN + CRF and madmom deep chroma. The lv-chordia row has the same ten labels as the played row. Chordino's row starts with a none box too thin for a label, then G from 0.46 s, while the played row says none. Essentia's row starts with Am there. autochord, Essentia and both madmom rows have Am where the played row has Am7, and D under the first D7. CREMA has D under the first D7 and C/E across the played C and the second D7. The madmom CNN row has a none box near 22 seconds."><figcaption><b>Chord labels on S3</b><span class="ao-meta">seven chord recognizers on a 24-second strummed clip I synthesized, under the chords played (my agents' runs r0063, r0088, r0215, r0337 and r0398)</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/chords-beats-key-s2n-bar-starts.webp" alt="Five rows of tick marks over 29 seconds, with the first 2.1 seconds shaded as a silent count-in. Tall ticks mark the first beat of a bar. The played row has 48 beats and 12 tall ticks. All-In-One's row has 47 beats with its 12 tall ticks under the played ones. The Beat This! and BeatNet rows each have 3 beats in the count-in before a beat on the first played one, and 26 and 27 tall ticks, BeatNet's on every other beat. madmom's row has 48 beats and 12 tall ticks, each one beat after a played bar start."><figcaption><b>Bar starts on S2n</b><span class="ao-meta">beats and bar starts from All-In-One (r0563), <code>Beat This!</code> final0 (r0397), BeatNet offline (r0361) and madmom's bar tracker (r0100) on a 29-second fingerstyle clip I synthesized, under the 48 beats and 12 bar starts played</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/chords-beats-key-s7flat30-tuning.webp" alt="Four rows of labeled boxes over 24 seconds. The played row reads none, G, Em, Am7, D7, G, Em, C, D7, G. Essentia on S3 at its default 440 Hz reads Am, G, Em, Am, D, G, Em, C, a narrow box with no label, then G. On S7flat30 at 440 Hz it reads Am, a sliver of G, then F#, Ebm, Abm, B, Abm, C#, F#, Ebm, B, F#. On S7flat30 told 432.45 Hz it reads Am, G, Em, Am, C, Am, D, G, Em, C, G."><figcaption><b>Telling Essentia the tuning</b><span class="ao-meta">Essentia TonalExtractor's chords on S3 (r0088), and on S7flat30, the same chords 30 cents flat, with its default tuning of A at 440 Hz (r0267) and told A is at 432.45 Hz, 30 cents lower (r0324)</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

Seventeen entries, A to Z. The other three of the 20 are inside other entries. chord-extractor 0.1.3 and vamp 1.1.0 are the Python wrappers my agents ran Chordino through, so they're in its entry. NATTEN 0.17.3 is a library whose functions All-In-One's networks import, so it's in All-In-One's. Every tool with an entry except music21 was pointed at the clips' 44.1 kHz 16-bit WAV files, stereo except the mono R1 clips. music21 reads MIDI, a list of notes with start times. The clips, with the S ones synthesized so every answer is known:

- S3 is a 24-second clip of strummed chords on a steel-string sound, at 96 beats per minute (BPM) in G major. Its first 2.5 seconds are a silent count-in bar. S7flat30 is the same notes rendered 30 cents flat.
- S4 is a 39-second band mix in D major at 116 BPM, with drums, bass, strummed guitar and a lead line. Its first two bars are a silent bar and a count-in bar.
- S2n is a 29-second clip of one nylon-string guitar playing a tune over a thumb bass, at 112 BPM in G major. Its first bar is a silent count-in. S2s is the same notes on a steel-string sound. S6taps is S2s plus drum-kit hits standing in for taps on the guitar body. S5capo2 is the same tab with a capo on fret 2, so it sounds in A major. S5dropd is the piece in Drop D, a tuning with the lowest string lowered from E to D.
- R1a, R1b and R1c are the first 28 to 29 seconds of three real takes from GuitarSet, with its annotations. R1a is an accompaniment in Ab minor at 107 BPM, R1b a single-note solo in C# major at 90 BPM and R1c a bossa nova accompaniment in G major at 119 BPM. Their chord answer is GuitarSet's lead-sheet chords, the chords each player was given, not a transcription of what they played.
- R2 and R2full are 36 seconds and all 228.5 seconds of a real band song with singing, with no answer key. The artist's page lists `Key: D# Minor, Tempo: 72 bpm`, which my agents didn't check.
- R3a, R3b and R3c are the sound of three real 18-second nylon-string guitar videos, with no answer key.

How I count. A beat counts when it's within 70 ms of a played beat, each played beat used once, and bar starts (the first beat of each bar) are counted the same way. For chords I give the seconds where a tool's label had the right root note (the note a chord is named after) and the right major or minor. A "none" over silence counts as right. "Sevenths too" means a played D7 also had to be called D7. On the R1 clips I give seconds with the right root only, because R1a's answer has a chord that's neither major nor minor. Tuning is in cents, hundredths of a fret.

Times are real elapsed seconds on the shared box. It had two slots, each two of its four processor cores reserved for one job. Runs marked "on 2 cores" had a slot. The others ran outside the slots while other agents' jobs shared the box, some limited to one thread (one stream of work at a time), so their times include that sharing. Nothing here cost money beyond the cloud session.

The agent that checked the first round re-ran each of its tools on two to 13 clips and got byte-identical files, the same down to the last byte, every time. It also re-ran all 509 of that round's comparisons with the answer keys and got the same results. All-In-One, tempo-cnn and S-KEY ran in a second round, which also put autochord, CREMA and lv-chordia on S5capo2. The agent that checked that round re-ran its 121 comparisons with the same results. It re-ran S-KEY, which gave the same 11 labels and the same 24 numbers per clip to the last bit. It also re-ran All-In-One on S3 and lv-chordia on S5capo2, which wrote byte-identical files. It didn't re-run tempo-cnn or the later autochord and CREMA runs, because their TensorFlow versions had left the box's shared cache and a disk rule allowed no new download over 200 MB. Their numbers were checked from the saved files only. The LiveChord beat refiner ran in a third round. The agent that checked it re-ran that round's 20 comparisons with the same results, and re-ran the refiner on S3 and R1b, which wrote byte-identical files. Every run, command and output is in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/chords-beats-key).

**All-In-One 1.1.0** ([link](https://github.com/mir-aidj/all-in-one)). A music structure analyzer from a 2023 paper by Taejun Kim and Juhan Nam. It first splits the song into four instrument tracks with Demucs, then finds the beats, bar starts, a tempo and the song's sections.

- In: S3, S7flat30, S4, S2n, S5capo2, S5dropd, R1a, R1b, R1c and R2full.
- Command or settings: the package's own steps, in the order and with the defaults of `allin1.analyze()`, model `harmonix-all` (eight networks averaged), device `cpu`. Once, on S4, my agents ran the published command, `allin1 /home/user/gtr/inputs/S4/S4.wav -o <dir> -d cpu --demix-dir <dir>/demix --spec-dir <dir>/spec`. It gave the same tempo, beats and bar starts as the steps above, and one section boundary at 20.70 s instead of 20.69 s. Installing it took NATTEN 0.17.3, built for the processor only from its source on PyPI, the public index of Python packages. That build took 97.45 s on 2 cores (r0518). NATTEN 0.17.4 built too but didn't import on Python 3.9, with `TypeError: unsupported operand type(s) for |: 'type' and '_GenericAlias'`.
- Out: a JSON file with `bpm` (a whole number), `beats` and `downbeats` in seconds on a 0.01 s grid, `beat_positions` and `segments` (start, end, label). No confidence. Within 70 ms: S3 29 of 32 beats and 8 of 8 bar starts, S4 65 of 68 and 17 of 17, S2n 47 of 48 and 12 of 12, S5capo2 46 of 48 and 12 of 12, S5dropd 47 of 48 and 12 of 12. On those five it returned no other beats. On R1a and R1c its beats ran at the played tempo but sat between the played ones, a median 0.267 s early on R1a and 0.223 s late on R1c. So 0 of 53 and 0 of 56 beats were within 70 ms, and 0 of 14 bar starts on each. R1b: 25 of 44 beats from 35 returned, 1 of 11 bar starts from 8. Tempo, with the played one in brackets: S3 95 (96), S4 115 (116), S2n 111 (112), R1a 107 (107), R1b 91 (90), R1c 120 (119). Sections on S3: `start` 0 to 2.50, `intro` 2.50 to 23.99, `start` 23.99 to 24.00. On R2full: tempo 71, 264 beats, 66 bar starts and ten sections, `start`, `verse`, `verse`, `chorus`, `verse`, `chorus`, `solo`, `chorus`, `chorus`, `outro`. No clip here has an answer for sections.
- Time: S3 took 103.5 s on 2 cores. Demucs took 31.4 s of that, loading the networks 1.2 s and running them 67.6 s, and the peak memory was 1,552.6 MB (r0521). R2full took 777.8 s on 2 cores, Demucs 186.9 s of it and the networks 581.6 s, with a 2,038.5 MB peak (r0563, 1,854.58 s for its nine clips). The agent that checked the second round re-ran S3 on 2 cores in 142.7 s with more of the box busy, and it wrote a byte-identical file (r0693).
- Takes as a hint: the model (`harmonix-all` or one of `harmonix-fold0` to `harmonix-fold7`) and the device. No tempo range, tempo or meter (beats per bar). Its bar tracker allows 3 or 4 beats per bar, fixed in its code as `beats_per_bar=[3, 4]`.
- Hands off to: its own `allin1.sonify(result)`, which its README says `will mix metronome clicks for beats and downbeats`, a click track on the song. Not run here.

**aubio 0.4.9** ([link](https://github.com/aubio/aubio)). A C library and command-line tools that mark beats and give one tempo. It was already on the box as Ubuntu's `aubio-tools 0.4.9-4.4build1`.

- In: S2n, S2s, S3, S4, S5capo2, S5dropd, S6taps, S7flat30, R1a, R1b, R1c, R2 and R2full, then R3a, R3b and R3c.
- Command or settings: `python3.12 /usr/bin/aubio tempo <wav>`, `python3.12 /usr/bin/aubio beat <wav>` and `aubiotrack -i <wav>`, with the defaults (buffer 1024, hop 512). Under the box's default Python 3.13 the `aubio` command stopped with `ModuleNotFoundError: No module named 'aubio._aubio'`, so my agents ran it with Python 3.12.
- Out: `aubio tempo` prints one line, `<bpm> bpm`. The two beat commands print one time in seconds per line, and they gave the same number of beats on every clip, at most 8 microseconds apart. No bar starts, no confidence. Beats within 70 ms, from `aubiotrack`: S3 32 of 32 with 40 returned, S4 65 of 68 with 71, S2n 47 of 48 with 51, R1a 22 of 53 with 47, R1b 13 of 44 with 65, R1c 2 of 56 with 49. The first five on S3, where the played beats start at 2.5, 3.125 and 3.75 s:

  ```text
  2.514558
  2.872381
  3.140204
  3.443379
  3.746553
  ```

  Tempo, with the played one in brackets: S3 121.24 (96), S4 117.09 (116), S2n 115.35 (112), R1a 105.59 (107), R1b 155.34 (90), R1c 113.92 (119). R2full: 539 beats, tempo 144.61. R3a, R3b and R3c: 133.22, 150.84 and 125.73.
- Time: 20.8 s for all 13 clips and all three commands, outside the slots, 9.2 s of processor time, peak 64.2 MB (r0200). On S3: `aubio tempo` 0.80 s, `aubio beat` 0.58 s, `aubiotrack` 0.22 s.
- Takes as a hint: buffer size `-B`, hop size `-H` and sample rate `-r`, and for `aubiotrack` the onset method `-O`, threshold `-t`, minimum gap `-M` and silence level `-s`. No tempo range, tempo or meter.
- Hands off to: a plain list of seconds.

**autochord 0.1.4** ([link](https://github.com/cjbayron/autochord)). A Python chord recognizer. It runs the NNLS Chroma plugin (see Chordino below) to measure how much of each of the 12 notes the sound holds, then a TensorFlow network picks one of 25 labels: 12 major chords, 12 minor chords or no chord.

- In: S3, S7flat30, S4, S2n, R1a, R1b, R1c, R2 and R2full. S5capo2 in the second round.
- Command or settings: `autochord.recognize(path, lab_fn=...)`. On its first import it downloaded its model, `chroma-seq-bilstm-crf-v1`, from Google Drive.
- Out: a list of (start, end, label) and a tab-separated `.lab` file with unrounded times. Labels are `<root>:maj`, `<root>:min` and `N`, with roots spelled with flats (`Gb:maj`). No confidence. The last segment can end after the file does, at 36.037 s on the 36.000-second R2. S3: 11 segments, the right root and major or minor for 22.1 of 24 s, sevenths too for 16.8 s. S4: 34.5 of 38.7 s. S2n: 16 segments against 22 played, 20.1 of 29.4 s. S5capo2: 15 segments, 19.0 of 29.4 s. The right root on R1a for 26.3 of 29.2 s, R1b 0.1 of 29.3 s and R1c 17.2 of 28.2 s. Its first S3 chord:

  ```text
  2.2291156462585033	4.96907029478458	G:maj
  ```

- Time: S3 25.9 s on 2 cores, of which loading 7.8 s and recognizing 16.2 s, the other 24 to 39-second clips 10.5 to 11.6 s, R2full 15.7 s, peak 951 to 1,068 MB per clip (r0337, a batch shared with CREMA). S5capo2 9.28 s on 2 cores (r0605).
- Takes as a hint: none. `autochord.recognize(audio_fn, lab_fn)` has no key, tuning or chord-list argument.
- Hands off to: its `.lab` file, the file its own JavaScript chord viewer loads. Its README says the file `follows the MIREX chord label format`. MIREX is a contest for music analysis tools. Not run here.

**`Beat This!` 1.1.0** ([link](https://github.com/CPJKU/beat_this)). A beat and bar tracker from JKU Linz and a 2024 paper, installed from PyPI as `beat-this`.

- In: final0, the larger model, on S3, S7flat30, S4, S2n, S2s, S6taps, R1a, R1b, R1c, R2 and R2full. small0, the smaller one, on seven of them. It resamples to 22050 Hz itself.
- Command or settings: `beat_this.inference.File2Beats(checkpoint_path=<final0|small0>, device="cpu", float16=False, dbn=False)(path)`, its default peak picking.
- Out: two lists of seconds on a 20 ms grid, beats and bar starts, the bar starts always among the beats. No tempo, no confidence. final0, within 70 ms: S3 29 of 32 beats and 8 of 8 bar starts, from 32 beats and 9 bar starts returned, the first three beats inside the silent count-in. S4 65 of 68 and 17 of 17, from 68 and 18. S2n 48 of 48 and 8 of 12, from 54 and 26. R1a 52 of 53 and 13 of 14, from 52 and 13. R1b 28 of 44 and 7 of 11, from 43 and 21. R1c 56 of 56 and 14 of 14, from 56 and 14. small0 on S2n: 23 of 48 and 9 of 12, from 39 and 22. Its makers' list of training annotations names GuitarSet, where the R1 clips come from, and its README says `the results may be unfairly good if you run inference on any file from the training datasets`. R2: 43 beats, a median gap that works out to 71.43 BPM, and 11 bar starts with both models. R2full: 266 beats.
- Time: outside the slots on one thread, with both slots held by other agents' long jobs. final0 4.1 to 6.8 s per 24 to 39-second clip (S3: import 2.1 s, loading the model 0.36 s, running it 2.25 s), R2full 22.1 s. small0 3.0 to 5.4 s, R2full 15.0 s. Peak 625 MB for the batch (r0397).
- Takes as a hint: the model, the device and `dbn`, madmom's bar tracker after the network, which needs madmom and wasn't used. No tempo range, meter or tempo.
- Hands off to: its `.beats` file, where `each line has a time in seconds, a tab, and a beat number (1 = downbeat)`, which its README names for importing into Sonic Visualiser. Not tried here. Its final0 beats and bar starts went into the LiveChord beat refiner, see that entry.

**BeatNet 1.1.3** ([link](https://github.com/mjhydri/BeatNet)). A beat and bar tracker built on a neural network. Offline, madmom's bar tracker reads the network's output for the whole file. Online, a particle filter reads it as it goes. That's a guess-and-update method that only uses what it has already heard, as a live app would.

- In: S3, S7flat30, S4, S2n, S2s, S6taps, R1a, R1b, R1c, R2 and R2full. It resamples to 22050 Hz itself.
- Command or settings: `BeatNet(1, mode='offline', inference_model='DBN', plot=[], thread=False, device='cpu').process(path)`, and the same with `mode='online', inference_model='PF'`, with numpy's random seed, the starting number for its random choices, set to 0 before each. Model 1 of its 3. It ran after a one-line edit to the installed madmom so that it imports on Python 3.11, `from collections import MutableSequence` changed to `from collections.abc import MutableSequence`.
- Out: rows of seconds and a position, on a 20 ms grid. Offline, the position is the beat's number in the bar, 1 for a bar start. Online, 1 is a bar start and 2 any other beat. No tempo or meter field. Offline, within 70 ms: S3 0 of 32 beats and 0 of 8 bar starts, from 38 beats and 10 bar starts. S4 68 of 68 and 17 of 17, from 75 and 19. S2n 48 of 48 and 0 of 12, from 54 and 27, its positions going 1, 2, 1, 2. R1a 30 of 53 and 8 of 14. R1b 27 of 44 and 2 of 11. R1c 0 of 56 and 0 of 14. Online: S3 5 of 32 and 2 of 8, from 30 and 7. S4 64 of 68 and 16 of 17, from 65 and 16. S2n 35 of 48 and 1 of 12, from 36 and 11. Its first offline rows on S3, where the played beats start at 2.5 s and come every 0.625 s:

  ```text
  0.340	4
  0.980	1
  1.580	2
  2.220	3
  2.840	4
  3.440	1
  ```

- Time: outside the slots on one thread. S3, the first clip, 27.6 s (offline 19.9 s, online 3.9 s), the other 24 to 39-second clips 6.2 to 11.0 s, R2full 68.4 s (offline 5.6 s, online 57.4 s). Peak 802 MB for the batch (r0361).
- Takes as a hint: the model (1 to 3), the mode, the method and the device. No tempo range or meter. The offline bar tracker allows 2, 3 or 4 beats per bar, fixed in its code.
- Hands off to: its offline mode is itself a chain, madmom's bar tracker reading BeatNet's network, which its README describes as `we added madmom's DBN beat/downbeat inference model for the offline usages`.

**Chordino, NNLS Chroma and NNLS Tuning** ([link](https://github.com/c4dm/nnls-chroma)), run through **chord-extractor 0.1.3** ([link](https://github.com/ohollo/chord-extractor)) and **vamp 1.1.0** ([link](https://github.com/c4dm/vampy-host)). Three plugins by Matthias Mauch in the Vamp format, a plugin format for audio analysis programs. Chordino names chords, NNLS Chroma measures the 12 notes and Tuning measures the concert pitch, the frequency in Hz the music treats as A (440 Hz is standard). chord-extractor ships a compiled copy of the plugins, and the `vamp` module hosts them in Python.

- In: the same 13 clips as aubio, loaded by chord-extractor with `librosa.load(file)` at 22050 Hz mono, then R3a, R3b and R3c.
- Command or settings: `Chordino()` with chord-extractor's defaults (`useNNLS=1`, `rollon=1`, `tuningmode=0` global, `whitening=1`, `s=0.7`, `boostn=0.1`), the same with `tuningmode=1` local, and `vamp.collect(data, rate, 'nnls-chroma:tuning')`. The install was `uv pip install --no-build-isolation chord-extractor==0.1.3` after numpy, setuptools and wheel, and it needed `setuptools<81` for `pkg_resources`.
- Out: a list of `ChordChange(chord, timestamp)`, a label and a start time with no end time and no confidence, on a 0.0929 s grid. The labels go past major and minor, for example `Am7`, `D7`, `Abmaj7`, `Bbm7b5/Ab`, `F#6` and `Bdim`. Every clip's list started with `N` at 0.372 s. S3:

  ```text
  0.372 N, 0.464 G, 4.923 Em, 7.523 Am7, 9.938 D7, 12.446 G, 14.954 Em, 17.461 C, 19.226 D7, 19.876 G
  ```

  That's the played sequence, with G starting over the silent count-in. The right root and major or minor, sevenths too, for 21.1 of 24 s. S4 34.3 of 38.7 s. S2n 19 segments against 22 played, 22.5 of 29.4 s. S5capo2 22.9 of 29.4 s. The right root on R1a for 27.6 of 29.2 s, R1b 15.4 of 29.3 s and R1c 11.5 of 28.2 s. Local tuning mode gave the same chords as global on S3. The Tuning plugin returned the label `431.9 Hz` for S7flat30, 431.863 Hz unrounded, which is 32.316 cents flat where 30 were played, and 0.167 cents flat for S3, played at 0.
- Time: 97.5 s for the 13 clips and all three calls, outside the slots, 60.5 s of processor time, peak 389 MB (r0215). S3, the first clip, 25.9 s, the other 24 to 39-second clips 3.3 to 6.4 s, R2full 16.6 s. The agent that checked the first round traced most of the first clip's extra time to numba, a compiler librosa uses, which compiles once per new Python environment. S3 took 3.3 s with numba's cache files and 17.9 s without them (r0468).
- Takes as a hint: `use_nnls`, `roll_on`, `tuning_mode` (global or local), `spectral_whitening`, `spectral_shape`, `boost_n_likelihood` and any other plugin setting by name, plus a chord list file, `chord.dict`. No key, capo or tuning input. The plugin measures the tuning itself.
- Hands off to: NNLS Chroma's 24-value `bothchroma` output is what autochord runs and feeds its network. The Tuning plugin's value in Hz is the kind of number Essentia's key finder takes as `tuningFrequency`, a chain my agents didn't run.

**CREMA 0.2.0** ([link](https://github.com/bmcfee/crema)). Brian McFee's chord model package. It returns a JAMS document, a JSON format for music annotations, with a confidence for each chord.

- In: S3, S7flat30, S4, S2n, R1a, R1b, R1c, R2 and R2full. S5capo2 in the second round.
- Command or settings: `crema.analyze.analyze(filename=path)`, in the same TensorFlow 2.12.1 environment as autochord.
- Out: a JAMS `chord` annotation with a time, duration, value and confidence for each chord. Labels include `A:min7`, `C:maj/3` (C major with its third, E, in the bass), `B:maj7`, `A#:7`, `D:dim7` and `D#:min/5`. Confidences ran from 0.21 to 0.97 over the nine clips. Its chord output, `chord_tag`, has 170 classes, 12 roots times 14 chord types plus two special labels, `N` and `X`, per its paper and the model file in the 0.2.0 package. A separate bass output gives the inversions, like `C:maj/3`. S3, 9 segments:

  ```text
  N 0-2.32, G:maj, E:min, A:min7, D:maj, G:maj, E:min, C:maj/3, G:maj
  ```

  Against the played chords, it has `D:maj` where the first D7 was played, and `C:maj/3` across the played C and the second D7. The right root and major or minor for 22.3 of 24 s, sevenths too for 19.9 s. S4: 38.0 of 38.7 s. S2n: 7 segments against 22 played, 19.2 of 29.4 s. S5capo2: 7 segments, 18.7 of 29.4 s. The right root on R1a for 27.5 of 29.2 s, R1b 11.9 of 29.3 s and R1c 16.8 of 28.2 s.
- Time: S3 14.4 s on 2 cores, 10.4 s of it analyzing, the other clips 7.1 to 8.0 s, R2full 8.5 s, peak 696 to 760 MB per clip (r0337, shared with autochord). S5capo2 6.95 s on 2 cores (r0605).
- Takes as a hint: none. `crema.analyze.analyze(filename, y, sr)` has no key, tuning or chord-list argument.
- Hands off to: JAMS, the same container tempo-cnn writes with `--jams`.

**DeepRhythm 0.0.13** ([link](https://github.com/bleugreen/deeprhythm)). A neural network that gives one tempo for a whole file, with a confidence.

- In: S3, S7flat30, S4, S2n, S2s, R1a, R1b, R1c, R2 and R2full.
- Command or settings: `DeepRhythmPredictor(device="cpu", quiet=True).predict(path, include_confidence=True)`, with its weights, `deeprhythm-0.7.pth`, fetched by my agents from raw.githubusercontent.com.
- Out: one tempo, whole numbers in these runs, and a confidence, the largest of its per-tempo probabilities averaged over the 8-second pieces it cuts the audio into. No beat times. Tempo, with the played one in brackets, then the confidence: S3 95 (96) 0.648, S7flat30 95 (96) 0.612, S4 116 (116) 0.788, S2n 112 (112) 0.731, S2s 112 (112), R1a 107 (107) 0.967, R1b 89 (90) 0.457, R1c 120 (119) 0.467. R2 143 at 0.537 and R2full 143 at 0.619, where the artist's page lists 72.
- Time: outside the slots on one thread. S3, the first clip, 26.7 s (import 6.1 s, predicting 18.8 s), the others 4.8 to 6.6 s, R2full 7.8 s. Peak 773 MB for the batch (r0351).
- Takes as a hint: none besides `include_confidence`. Its batch tool takes a device and a confidence flag.
- Hands off to: one number per file.

**Demucs 4.0.1**, model `htdemucs`. A model that splits a song into four instrument tracks, called stems. My source-separation agents covered it on its own. Here it ran only as the first step of every All-In-One call, so this entry is its part of those runs.

- In: the WAV files of the clips All-In-One got, S3, S7flat30, S4, S2n, S5capo2, S5dropd, R1a, R1b, R1c and R2full, passed on by All-In-One.
- Command or settings: the command All-In-One runs for it, `<python> -m demucs.separate --out <dir> --name htdemucs --device cpu <file>`, with the weights file `955717e8-8726e21a.th`, 84,141,911 bytes, fetched before the timed runs. PyPI has demucs 4.0.1 only as source code, and the box's package manager installed a copy it had built and cached earlier.
- Out: four 44.1 kHz stereo stems per clip, which All-In-One read and then deleted at the end of each run, as it does by default.
- Time: S3 31.4 s (r0521), the other 24 to 39-second clips 36.1 to 62.6 s and R2full 186.9 s (r0563), all on 2 cores, each inside its All-In-One job. In the checker's re-run of S3, on 2 cores with more of the box busy, it took 50.4 s (r0693).
- Takes as a hint: All-In-One passes only the model name, the device and the output folder. Demucs's `--shifts` option defaults to 1 (`Number of random shifts for equivariant stabilization.`), and the input is then shifted `by a random amount between 0 and 0.5 sec`. All-In-One passes no shift or seed, so two runs on one file need not give identical stems.
- Hands off to: All-In-One, which makes spectrograms of the four stems for its networks.

**Essentia 2.1-beta6-dev** ([link](https://github.com/MTG/essentia)). The Music Technology Group's C++ audio library with Python bindings, from Universitat Pompeu Fabra, installed as `essentia-tensorflow==2.1b6.dev1389`. My agents ran its beat tracker, its key finder with five key profiles, its tuning meter, the chord labels from `TonalExtractor`, and `TempoCNN` with two tempo models.

- In: the same 13 clips as aubio, plus R3a, R3b and R3c, loaded at 44100 Hz, and at 11025 Hz for TempoCNN.
- Command or settings: `RhythmExtractor2013` with the methods `multifeature` and `degara`, `KeyExtractor` with the profiles `bgate`, `krumhansl`, `temperley`, `edma` and `shaath`, `TuningFrequencyExtractor`, `TonalExtractor(frameSize=4096, hopSize=2048, tuningFrequency=440)`, and `TempoCNN` with `deeptemp-k16-3.pb` and `deeptemp-k4-3.pb`. Then `KeyExtractor` and `TonalExtractor` again on S7flat30 and S3 with `tuningFrequency=432.45`, which is 440 Hz lowered by 30 cents.
- Out: a tempo, beat times and a confidence (from `multifeature` only), a key with major or minor and a strength, a tuning in Hz, and one chord label per 46.4 ms from 24 major and minor chords. There's no "no chord" label, so S3's silent count-in came out `Am`. No bar starts.
  - Beats within 70 ms, `multifeature`: S3 30 of 32 from 37, S4 67 of 68 from 74, S2n 48 of 48 from 54, R1a 51 of 53 from 51, R1b 37 of 44 from 87, R1c 3 of 56 from 55.
  - Tempo, with the played one in brackets, `multifeature`: S3 95.557 (96), S4 115.605 (116), S2n 111.807 (112), R1a 106.992 (107), R1b 178.206 (90), R1c 117.309 (119). TempoCNN, the two models: S3 96 and 96, S4 116 and 116, S2n 111 and 112, R1a 108 and 108, R1b 92 and 90, R1c 120 and 120.
  - Key: 47 of the 55 profile and clip pairs named the played key. All five profiles said G major on S3, S7flat30, S2n, S2s, S5dropd, S6taps and R1c, D major on S4 and A major on S5capo2. On R1a, played in Ab minor, four said F# major and `edma` said C# major. On R1b, played in C# major, `bgate`, `temperley` and `edma` said C# minor. Told 432.45 Hz, all five said G major on S7flat30 and S3, as they did at 440 Hz. Its key finder's `averageDetuningCorrection` is on by default.
  - Tuning: S7flat30 31 cents flat, where 30 were played, and S3 2 cents sharp. On R1a its last frame said 50 cents sharp, where the answer file states 0 without saying it was measured. Its reference page gives the range as `between -35 to 65 cents`.
  - Chords: S3 10 segments, the right root and major or minor for 18.8 of 24 s, sevenths too for 14.8 s. On S7flat30 at 440 Hz, 0 of 24 s. Where S3's output said G, Em, Am, D and C, the S7flat30 output had roots a semitone, one fret, lower, except one B from 8.13 to 10.17 s where S3's said Am. S3's short D at 19.88 s has no counterpart. Both start with Am over the silent count-in, and S7flat30's then has a G from 1.58 to 1.63 s. Told 432.45 Hz, 16.2 of 24 s, sevenths too for 14.3 s. S4: 33 segments against 18 played, 28.1 of 38.7 s. S2n: 23 segments, 19.6 of 29.4 s. S5capo2: 29 segments, 16.7 of 29.4 s. The right root on R1a for 19.5 of 29.2 s, R1b 11.5 of 29.3 s and R1c 7.1 of 28.2 s.
- Time: S3 2.35 s, S4 3.17 s and S7flat30 2.65 s, each on 2 cores (r0088, r0097, r0148), with a 274 MB peak on S3. The other clips ran outside the slots, 4.9 to 8.8 s per 24 to 39-second clip, and R2full 25.8 s with 9.2 s of processor time and a 394 MB peak (r0267). The 432.45 Hz calls took 2.4 s per clip (r0324).
- Takes as a hint: `RhythmExtractor2013(minTempo=40, maxTempo=208, method)`, `KeyExtractor(profileType, tuningFrequency=440, pcpThreshold, hpcpSize, minFrequency=25, maxFrequency=3500, averageDetuningCorrection=True, ...)` and `TonalExtractor(frameSize, hopSize, tuningFrequency)`. The tuning frequency is the hint my agents tried.
- Hands off to: its own `TuningFrequency` gives a value in Hz that `KeyExtractor` takes as `tuningFrequency`, a chain its reference pages describe. The 432.45 here came from the known 30 cents, not from the tuning meter.

**librosa 1.0.0** ([link](https://github.com/librosa/librosa)). A Python audio library with a beat tracker, a tempo estimate and a tuning estimate. It has no key finder, so my agents wrote one for this test. It averages librosa's chroma, how much of each of the 12 notes the sound holds, over the whole file. Then it compares that with Krumhansl and Kessler's 24 key profiles, one for each major and minor key, and gives the key whose profile is closest. My agents' notes call it the `lane-written baseline`.

- In: the same 13 clips as aubio, plus R3a, R3b and R3c, loaded with `librosa.load(path, sr=22050, mono=True)`.
- Command or settings: `librosa.beat.beat_track(y=y, sr=sr, units='time')`, `librosa.feature.tempo(y=y, sr=sr)` and `librosa.estimate_tuning(y=y, sr=sr)` with their defaults, and the key baseline.
- Out: a tempo and beat times in seconds, and a tuning offset in whole cents. No bar starts, no confidence. Beats within 70 ms: S3 25 of 32 from 29, S4 65 of 68 from 65, S2n 45 of 48 from 45, R1a 49 of 53 from 52, R1b 26 of 44 from 45, R1c 4 of 56 from 52. Tempo, with the played one in brackets: S3 95.703 (96), S4 117.454 (116), S2n 112.347 (112), R1a 107.666 (107), R1b 95.703 (90), R1c 117.454 (119). Tuning: S7flat30 31 cents flat, where 30 were played, S3 1 sharp and R1a 13 sharp. The key baseline named the played key on 10 of 11 clips, all but R1b, where it said C# minor for C# major. On R2 and R2full it said Eb minor, and the artist's page lists D# minor, the same notes spelled with sharps.
- Time: S3 16.05 s on 2 cores, peak 343 MB, 12.2 s of it in `beat_track` (r0069). The agent that checked the first round traced the extra to numba compiling librosa's functions once per new environment, 3.1 s with its cache files and 11.5 s without (r0468). The other first-round clips took 3.12 to 3.78 s each on 2 cores. R1b, R1c, R2 and R2full ran outside the slots, R2full in 23.1 s with a 625 MB peak (r0267).
- Takes as a hint: `beat_track(bpm=...)`, which fixes the tempo and sets `start_bpm` aside, plus `start_bpm`, `tightness` and `prior`. `chroma_cqt(tuning=...)` takes a tuning offset, and `estimate_tuning(resolution, bins_per_octave)`.
- Hands off to: `librosa.load` gives the decoded audio array that the `vamp` host takes, which is how chord-extractor feeds Chordino.

**LiveChord beat refiner 0.1.0** ([link](https://pypi.org/project/livechord-beat-refiner/)). A network that takes a song's audio plus another beat tracker's beats and bar starts, and returns new beats and bar starts. Its PyPI summary calls it a `Bidirectional Transformer beat / downbeat / chord-boundary refiner`. It's installed from PyPI as `livechord-beat-refiner`, with its weights from Hugging Face, both from 2026-05-09. Its README says the LiveChord app is released separately and `This package is the standalone inference release.` It also says its training labels were `Beat This!` final0's output, filtered.

- In: S3, S4, R1a, R1b, R1c and R2full, the WAV files as they are. Each went in with two sets of beats and bar starts read from this lane's first-round files, with nothing re-run. One set was `Beat This!` final0's (r0397). The other was the rows of madmom's bar tracker (r0063, r0072, r0316), every row a beat and every position 1 a bar start.
- Command or settings: the lane script `scripts/gap2/livechord_run.py`, which calls `refine(audio, beats, downbeats, checkpoint_path=...)` with the package defaults, `threshold` 0.5, `min_distance_beat` 2 and `min_distance_downbeat` 4. Once, on S3 with `Beat This!`'s beats, my agents ran the package's own command line, `python -I -m livechord_beat_refiner.infer --audio S3.wav --beats <the 32 Beat This! final0 beats of S3> --downbeats <its 9 downbeats> --checkpoint model.safetensors`. It printed the same 33 beats and 9 bar starts as the script, and the same first 8 beats and 4 bar starts to its 3 decimals. The install was `uv pip install "livechord-beat-refiner==0.1.0" "torch==2.15.0" soundfile` on Python 3.11.15. The weights, `model.safetensors`, 12,767,108 bytes, were fetched from one fixed revision on Hugging Face before the timed runs, so no run downloaded anything.
- Out: a set of named fields, `refined_beats` and `refined_downbeats` as lists of seconds, `applied`, `reason`, the counts in and out, and `elapsed_sec`. No tempo, meter, position in the bar or confidence, and its third output, chord boundaries, isn't returned by `refine()`. Every time is a whole number of its 92.88 ms frames (2048 / 22050 s), rounded to 4 decimals. The bar starts were among the beats in all 12 outputs. Every job returned `applied: True` and `reason: "ok"`. The script stops with an error otherwise, because `refine()` hands its input back unchanged with `applied: False` instead of failing. Its command line on S3, where the played beats start at 2.5 s and come every 0.625 s, kept the three beats `Beat This!` had put in the silent count-in:

  ```text
  first 8 beats   in : 0.640, 1.280, 1.900, 2.520, 3.160, 3.780, 4.400, 5.020
  first 8 beats   out: 0.650, 1.300, 1.858, 2.508, 3.158, 3.808, 4.365, 5.016
  ```

  - Within 70 ms, before and after, with `Beat This!`'s beats: S3 29 of 32 beats from 32 returned, then 29 from 33, and 8 of 8 bar starts from 9 both times. S4 65 of 68 from 68, then 67 from 70, and 17 of 17 bar starts from 18 both times. R1a 52 of 53 from 52, then 51 from 51, and 13 of 14 bar starts, then 12, from 13. R1b 28 of 44 from 43, then 28 from 44, and 7 of 11 bar starts from 21, then 4 from 14. R1c 56 of 56 from 56, then 54 from 61, and 14 of 14 bar starts, then 13, from 14.
  - With madmom's: S3 29 of 32 from 29, then 30 from 30, and 8 of 8 bar starts both times. S4 65 of 68 from 65, then 67 from 67, and 17 of 17 both times. R1a 0 of 53 beats and 0 of 14 bar starts both times, its beats sitting between the played ones before and after. R1b 36 of 44 from 44, then 33 from 43, and 0 of 11 bar starts both times. R1c 10 of 56 beats and 2 of 14 bar starts both times.
  - R2full, with no answer key: with `Beat This!`'s, 266 beats and 71 bar starts went in and 305 and 70 came out. With madmom's, 265 and 67 went in and 313 and 69 came out. The median gap between refined beats works out to 71.78 BPM with both, where the artist's page lists 72.
- Time: all on 2 cores. The ten jobs, S3, S4, R1a, R1b and R1c with each set of beats, took 37.8 s in all, 3.65 to 3.92 s each (import 1.12 to 1.22 s, loading the model 0.031 to 0.057 s, `refine()` 1.69 to 1.89 s for 24.0 to 38.7 s of audio), with a peak of 473.5 to 478.0 MB per job (r0727). R2full's two jobs took 10.69 s in all, `refine()` 3.24 s and 3.49 s, peak 689 and 692 MB (r0729). The command-line run took 40.23 s with a 585.8 MB peak, 26.2 s of it inside `refine()`, against 1.80 s for the same call in the batch. It was the first run in a new environment, and what the extra time went to wasn't isolated (r0726). The checker's re-run in a fresh environment showed the same pattern, `refine()` 19.70 s in its first job, then 1.97 s and 1.75 s (r0730).
- Takes as a hint: `threshold`, `min_distance_beat`, `min_distance_downbeat` and `checkpoint_path`, and on the command line `--chord-json`, which reads the beats and bar starts from a LiveChord chord file, and `--threshold`. No tempo range, meter or tempo.
- Hands off to: nothing further here. It's the end of a chain that ran, `Beat This!`'s or madmom's beats and bar starts into the refiner, which its README describes as `Run any beat tracker (beat_this, madmom, librosa, ...)` and then `Pass them to refine() together with the audio file`. Its output is two plain lists of seconds.

**lv-chordia 1.1.0** ([link](https://github.com/music-x-lab/ISMIR2019-Large-Vocabulary-Chord-Recognition)). A PyPI package that runs, but can't train, the large-vocabulary chord model from Music X Lab's ISMIR 2019 paper: five networks, then a decoder that can only output chords from a list.

- In: S3, S7flat30, S4, S2n, R1a, R1b, R1c, R2 and R2full. S5capo2 in the second round.
- Command or settings: `lv_chordia.chord_recognition.chord_recognition(path, chord_dict_name=<dict>)` with `submission`, the package default, and `ismir2017`.
- Out: a JSON list of `{"start_time", "end_time", "chord"}` with times to 0.01 s and labels with flats and inversions, like `Bb:7`, `B:maj/3` and `Bb:maj/b7`. No confidence. S3, the same with both chord lists:

  ```text
  N 0-2.48, G:maj 2.48-5.02, E:min 5.02-7.52, A:min7 7.52-10.03, D:7 10.03-12.54, G:maj, E:min, C:maj, D:7, G:maj 20.04-24.01
  ```

  That's the played sequence, the right root and major or minor, sevenths too, for 23.2 of 24 s. S7flat30: 11 segments, 21.1 of 24 s, sevenths too for 17.9 s. S4: 38.3 of 38.7 s. S2n: 23 segments against 22 played, 28.0 of 29.4 s. S5capo2: 23 segments, 27.8 of 29.4 s. The right root on R1a for 28.3 of 29.2 s. R1b, the single-note solo, came back as one segment, `N` from 0 to 29.35 s, so 0 s. R1c 19.6 of 28.2 s with `submission` and 21.1 with `ismir2017`.
- Time: outside the slots on one thread. S3, the first clip, 30.3 s (`submission` 25.1 s, then `ismir2017` 2.1 s on the same file), the others 9.2 to 13.0 s, R2full 68.4 s. Peak 1,084 MB for the batch (r0398). S5capo2 9.14 s on 2 cores (r0605).
- Takes as a hint: `chord_dict_name`, one of `submission`, `ismir2017` or `full`. The chord lists are plain text files that limit what the decoder can output. No key, tuning or capo argument.
- Hands off to: JSON whose labels its PyPI page calls `Chord label in JAMS format`.

**madmom 0.16.1** ([link](https://github.com/CPJKU/madmom)). A Python audio library from JKU Linz with trained models for beats, bar starts, tempo, two chord recognizers and a key finder.

- In: the same 13 clips as aubio.
- Command or settings: `RNNBeatProcessor` into `DBNBeatTrackingProcessor(fps=100)`, `TempoEstimationProcessor(fps=100)`, `RNNDownBeatProcessor` into `DBNDownBeatTrackingProcessor(beats_per_bar=[3, 4], fps=100)`, `CNNChordFeatureProcessor` into `CRFChordRecognitionProcessor`, `DeepChromaProcessor` into `DeepChromaChordRecognitionProcessor`, and `CNNKeyRecognitionProcessor`. This lane's build of the GitHub version from a clone was refused by the session's permission policy (`Code from External`). My fingerstyle agents' install of the same GitHub code, 0.17.dev0 at commit 27f032e8, went through (r0247). PyPI's 0.16.1 built on Python 3.11 but didn't import, with `ImportError: cannot import name 'MutableSequence' from 'collections'`. It ran on Python 3.9 with numpy 1.23.5.
- Out: beats on a 10 ms grid, bar tracker rows of seconds and position in the bar, tempo candidates with strengths, chords on a 0.1 s grid from 25 labels (12 major, 12 minor, no chord), and a key with a probability for each of the 24 keys. No confidence per beat or chord.
  - Beats within 70 ms: S3 30 of 32 from 37, S4 68 of 68 from 74, S2n 48 of 48 from 55, R1a 52 of 53 from 104, R1b 39 of 44 from 45, R1c 0 of 56 from 56.
  - Bar starts within 70 ms: S3 8 of 8, S4 17 of 17 and S6taps 12 of 12. On S2n, S2s, S5capo2 and S5dropd, 0 of 12. On S2n each of its 12 came one beat late, 0.536 to 0.544 s after a played bar start. R1a 0 of 14, R1b 0 of 11, R1c 2 of 14.
  - Tempo, the candidate with the largest strength value, with the played one in brackets: S3 95.238 (96), S4 115.385 (116), S2n 111.111 (112), R1a 107.143 (107), R1b 181.818 (90), R1c 120.000 (119). R2 and R2full 72.289, where the artist's page lists 72.
  - Chords, the CNN recognizer and then the deep chroma one, the right root and major or minor: S3 20.55 and 22.05 of 24 s, sevenths too 15.35 and 17.05 s. S4 37.2 and 36.3 of 38.7 s. S2n 25.5 and 25.8 of 29.4 s. S5capo2 21.2 and 25.2 of 29.4 s. The right root on R1a for 27.9 and 27.8 of 29.2 s, R1b 2.4 and 4.4 of 29.3 s, and R1c 16.9 and 15.7 of 28.2 s.
  - Key: the played key on 7 of 11 clips. On S2n, played in G major, it said D major, with D major 0.384, E minor 0.306 and G major 0.158 as its top three. It said E major on S5capo2, played in A major, and F# major on R1a and R1b, played in Ab minor and C# major.
- Time: S3 20.9 s and S4 35.1 s, each on 2 cores, with peaks of 212 MB and 316 MB (r0063, r0072). R2full 190.2 s on 2 cores, with 146.9 s of processor time and a 1,383.7 MB peak (r0316). Inside S3's run: beats 3.61 s, the bar network 3.41 s, CNN chords 10.23 s, deep chroma chords 0.06 s, key 2.21 s.
- Takes as a hint: `DBNBeatTrackingProcessor(min_bpm, max_bpm, num_tempi, transition_lambda, observation_lambda, correct, threshold, fps)`, `DBNDownBeatTrackingProcessor(beats_per_bar, min_bpm, max_bpm, ...)` with the meter as a list of allowed beats per bar, `TempoEstimationProcessor(method, min_bpm, max_bpm, act_smooth, hist_smooth, fps)` and `DeepChromaProcessor(fmin=65, fmax=2100, unique_filters=True, models=None)`. The chord and key processors take no key, tuning or capo input.
- Hands off to: its bar tracker is the last step inside All-In-One and BeatNet's offline mode, and an option in `Beat This!`. The bar tracker's beats and bar starts also went into the LiveChord beat refiner here, see that entry.

**music21 10.5.2** ([link](https://github.com/cuthbertLab/music21)). A Python toolkit for written music. Its key finders read notes, not audio.

- In: for 11 clips, two note lists as MIDI files, the exact notes from my test set and the notes Basic Pitch 0.4.0 wrote from each clip's audio in my audio-to-notes agents' run r0234.
- Command or settings: `Stream.analyze(<method>)` with `key` (Aarden-Essen's weights in 10.5.2), `key.krumhansl`, `key.simple`, `key.bellman` and `key.temperley`.
- Out: a `music21.key.Key` (its home note, and major or minor) with a `correlationCoefficient` and the other 23 keys ranked. 76 of the 110 results named the played key, 35 of 55 from the exact notes and 41 of 55 from Basic Pitch's notes. On S3's exact notes, four methods said E minor, which has the same notes as G major, and `key.bellman` said C major. On Basic Pitch's S3 notes, three said G major. All ten said D major on S4, G major on S2n, S5dropd and R1c, and A major on S5capo2. None said Ab minor on R1a or C# major on R1b. The pitch bend that makes S7flat30 flat isn't read from MIDI, so its exact notes gave the same keys as S3's.
- Time: 13.2 s for all 110 results, outside the slots, 4.3 s of processor time, peak 70 MB (r0237), 0.29 to 1.14 s per MIDI file.
- Takes as a hint: the method, and a stream can be cut to a time range or one part first. No tuning input.
- Hands off to: nothing further. It's the end of a chain that ran, Basic Pitch's MIDI into music21's key finder.

**S-KEY**, through the ONNX export `aaatmy/skey-onnx` ([link](https://github.com/deezer/skey), [ONNX export](https://huggingface.co/aaatmy/skey-onnx)). Deezer's model that names one key for a whole recording, from an ICASSP 2025 paper. Deezer's own code installs from its repository, the kind of step the permission policy refused here. So my agents ran a community conversion of its weights to ONNX, a portable model format, with onnxruntime 1.31.1 and 83 lines of their own code around it, `scripts/skey_onnx_run.py`. The conversion's manifest names Deezer's `skey.pt` as its source, with the same SHA-256 fingerprint as the `skey.pt` in Deezer's repository. Whether it gives the same labels as Deezer's own code wasn't checked. The conversion's card calls it `a community conversion of the upstream checkpoint, not a newly trained model or an official Deezer release`.

- In: S3, S7flat30, S4, S2n, S5capo2, S5dropd, R1a, R1b, R1c, R2 and R2full, decoded with soundfile, resampled to 22050 Hz with `torchaudio.transforms.Resample(orig_freq=44100, new_freq=22050)` and averaged to mono.
- Command or settings: my agents' script follows Deezer's `skey/key_detection.py`. The float32 audio goes into the graph, and the label is the one with the largest of its 24 outputs.
- Out: 24 numbers, one per key, that a last step called softmax makes add up to 1. The largest names the file's one key. The card says `its softmax scores are not calibrated confidence`, meaning they aren't meant as the chance that a key is right. It named the played key on 8 of the 9 clips that have one. It said G major on S3, with a top value of 0.815, and on S7flat30, with 0.774. It said D major on S4, A major on S5capo2, and G major on S2n, S5dropd and R1c. R1b C# major at 0.258, with C# minor next at 0.244. R1a F# major at 0.571, with G# minor next at 0.114, which is the played Ab minor spelled with a sharp. R2 and R2full: D# minor, the key the artist's page lists.
- Time: 22.29 s for all 11 clips on 2 cores, 28.5 s of processor time, peak 1,158.8 MB (r0588). 1.6 to 2.0 s per clip, S3 first at 3.56 s, R2full 2.65 s. The network itself took 0.05 to 0.30 s per clip and 0.48 s on R2full.
- Takes as a hint: none. The graph takes only the audio.
- Hands off to: the card says the same file runs in a browser, `Browser inference uses ONNX Runtime Web WASM CPU`. Not run here.

**tempo-cnn 0.0.8** ([link](https://github.com/hendriks73/tempo-cnn)). Hendrik Schreiber's tempo networks, installed as `tempocnn`: one tempo per file from each of eight models, and a meter model that returns a number of beats per bar. The package has no key model.

- In: S3, S7flat30, S4, S2n, S5capo2, S5dropd, R1a, R1b, R1c and R2full.
- Command or settings: `read_features(file)` once, then for each of `fcn` (the `tempo` command's default), `cnn`, `ismir2018`, `fma2018`, `deeptemp`, `deepsquare`, `shallowtemp` and `mazurka`, `TempoClassifier(model).estimate_tempo(features, interpolate=False)`, which is what `tempo -m <model> -i <file>` prints. Then `MeterClassifier('fma2018-meter').estimate_meter(read_features(file, frames=512))`, what `meter -i <file>` prints.
- Out: one tempo per model, whole numbers except from `fma2018`, a pair of two tempos and a strength in MIREX's format, and a meter number. No beat times. `fcn`, with the played tempo in brackets: S3 96 (96), S4 116 (116), S2n 112 (112), S5capo2 112 (112), S5dropd 112 (112), R1a 108 (107), R1b 90 (90), R1c 119 (119). Over the eight models and the nine clips with an answer, 48 of the 72 tempos were the played one to the whole BPM. `mazurka` gave 190 on S3, 211 on R1a and 171 on R1b, and `fma2018` gave 192.82 on S3. The meter model said 4 on S4, S2n, S5capo2 and S5dropd, 3 on S3, S7flat30 and R1c, 9 on R1a and 5 on R1b, and all nine are in 4/4, four beats per bar. R2full: 72 from `fcn`, `cnn`, `ismir2018` and `deepsquare`, and meter 9, where the artist's page lists `72 bpm` and `4/4 Swing`.
- Time: 140.95 s for the ten clips on 2 cores, 147.4 s of processor time, peak 1,249.9 MB (r0584). S3, the first, 26.98 s, 16.49 s of it in `read_features`, which loads the audio and computes the features all eight models read. That step took 1.17 to 1.57 s on every other clip. The other 24 to 39-second clips took 11.1 to 12.3 s each in all, and R2full 20.58 s. Each model took 0.05 to 0.46 s to load and 0.11 to 1.31 s to run on a 24 to 39-second clip.
- Takes as a hint: the model and `interpolate`. No tempo range or tempo.
- Hands off to: plain numbers, or JAMS with `--jams`, the container CREMA writes.

With a capo, the first four chords of S5capo2 are played with the finger shapes of G and C chords and sound as A and D. These are the labels each chord recognizer gave at the middle of each of those four chords, written short:

| | 3.21 s | 4.82 s | 5.89 s | 6.96 s |
|---|---|---|---|---|
| Shape played | G | C | G | C |
| Sounds as | A | D | A | D |
| autochord | A | D | D | D |
| Chordino | A | D | D | D |
| CREMA | A | D | D | D |
| Essentia | A | Bm | A | D |
| lv-chordia | A | D | A | D |
| madmom CNN | A | D | D | D |
| madmom deep chroma | A | D | A | D |

None of the 20 tools reports a capo or the notes the strings are tuned to, like Drop D. My agents counted the lowest notes in Basic Pitch's MIDI for S2n, S5capo2 and S5dropd instead. Each of the three holds one C1 that wasn't played. Above it, S2n's lowest note is G2 and S5capo2's is A2. S5dropd's holds 4 notes at D2, the low D that Drop D adds below standard tuning's lowest string, E2. The exact notes hold the same 4, starting 12 to 24 ms earlier.

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

Of the 71 tools, apps and research projects on the list, 51 didn't run here. Two limits come up again and again. The session's permission policy refused builds and runs of code from cloned repositories, a Go module and one Omnizart install, with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]`. And hosted services need an account or a key, so they and the consumer apps were left to my other agents. Where my agents wrote me steps to run one myself, the section number points into [`for-aaron.md`](https://github.com/aaronorelup/blog/blob/research/guitar-tab-tools/docs/guitar-tab-research/lanes/chords-beats-key/for-aaron.md). It also has steps for four tools that did run: Chordino in Sonic Visualiser (section 1), Deezer's own S-KEY code (section 3), a timing of All-In-One on a graphics card (section 5) and tempo-cnn on Windows (section 6).

- **A Machine Learning Approach for MIDI to Guitar Tablature Conversion (arXiv 2510.10619).** A paper returned by the second round's arXiv search for `all:"guitar tuning"`. It takes MIDI, not audio, and doesn't find a tuning or capo from sound, so nothing was run. No steps.
- **ACR_seq2seq.** An ICASSP 2026 chord paper's repository with no checkpoints in it, so nothing to run. No steps.
- **AudioEstimate.** A Hugging Face model for the key and the tempo, per its card. Its files need an access request the author approves by hand, a consent step my agents don't take for me, and no public code to run it was found. Steps for me: section 13.
- **BACHI.** Chord recognition from written notes, not audio. Its files weren't read. No steps.
- **Basic Pitch.** My audio-to-notes agents ran it (their run r0234). Here my agents only read its MIDI files, for music21 and the lowest-note count. No steps.
- **BEAST.** An evaluation script and a Google Drive model, with no documented way to run it on new audio. No steps.
- **Beat Transformer.** Repository code that first splits the song with Spleeter, and running repository code was refused here twice, so it wasn't attempted. Steps for me: section 8, its Google Colab notebook.
- **BeatNet+.** Added by the agent that checked the survey. Not attempted: it has no PyPI package and installs from its cloned repository with `pip install -e .`, the kind of step the permission policy refused here before. Steps for me: section 12, with a run script my agents wrote and didn't run.
- **BMACE.** A paper, with no code found. No steps.
- **BTC.** Only a GitHub repository, no package. My agents cloned it, built its environment and wrote `scripts/btc_run.py`, and then the run was refused with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]`. The clone was deleted. Steps for me: section 2.
- **Capo, the Mac and iOS app.** A consumer app, left to my apps agents. No steps.
- **Chord ai.** Named in search results only and left to my apps agents. No steps.
- **Chord Recognition with Deep Learning (Pierre Mackenzie).** An arXiv paper with no code link in its abstract. No steps.
- **ChordCoT.** Its repository is a placeholder, and its README says `Note: The code is currently being organized and cleaned up. Updates will be pushed soon.` No steps.
- **ChordFormer.** A paper, with no code found. No steps.
- **Chordify.** Named in search results only and left to my apps agents. No steps.
- **ChordMini.** The full app needs Firebase and Gemini keys. No steps.
- **Cyanite.** Named in search results only. My services agents list it as Cyanite API, not read as its own API, and the apps list doesn't have it. No steps.
- **essentia.js.** A browser library, left to my browser-audio agents. No steps.
- **Fretting-Transformer.** A paper's model that turns MIDI into tab with the tuning and capo given as inputs, found by the second round's arXiv search for `all:capo AND all:guitar`. It takes MIDI, not audio, and doesn't find a tuning or capo from sound, so nothing was run. No steps.
- **GetSongBPM API.** A hosted service that needs an account or a key, only pointed to here. A search summary says it looks tempo and key up by song title instead of listening to audio, which my agents couldn't check because its page refused them with HTTP 403. No steps.
- **Guitar open-string tuning classifier (Hulme et al.).** Repository code with TensorFlow models on Google Drive and no license file, not attempted. A later search of the web, arXiv, Hugging Face and PyPI for any open-string tuning or capo detector from audio with published weights or a package found none. Steps for me: section 9.
- **Harmony Transformer v1 and v2.** Training scripts only, no released weights. No steps.
- **InceptionKeyNet.** Found by the agent that checked the survey and not looked at in depth. No steps.
- **Jangdan as Downbeats.** A paper on traditional Korean music, with no code link on its author page. No steps.
- **key-cnn.** Added by the agent that checked the survey. Not attempted. It has no PyPI package and installs from its cloned repository with `setup.py install`, the kind of step refused here before. It also requires exactly TensorFlow 1.15.2, which PyPI has for Python 3.5 to 3.7 only. Steps for me: section 11.
- **Klangio.** A hosted service that needs an account, left to my hosted-services agents. No steps.
- **libKeyFinder and keyfinder-cli.** No Ubuntu, Debian or conda-forge package, and PyPI's `keyfinder` needs the library installed first. A build of a cloned 2.2.8 was refused with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]`. Steps for me: section 4, through Mixxx or a build in WSL.
- **libqm-dsp.** The library the QM Vamp Plugins are built on, not the plugins, in Ubuntu's packages. Not tried: a program my agents would write around its key and tempo code would have to re-create the plugins' own wrapper code, so its output wouldn't be the plugins' output. No steps.
- **magnjorg/ast-finetuned-guitar.** A Hugging Face model named in a search result. Its labels are guitar effects, like overdrive, chorus and reverb, not a tuning or capo, so nothing was run. No steps.
- **mixedkey.** A Go library that names the key from mono audio samples, with no trained model. Go 1.24.7 is on the box, but the `go get` and `go build` of the module, with the program my agents wrote to call it, were refused before they ran, with the same `Reason: [Code from External]`. Nothing was built. Steps for me: section 14.
- **Mixxx.** A desktop DJ program whose key analysis can use libKeyFinder, a step for me on Windows. Steps for me: section 4.
- **Music.AI (Moises).** A hosted service that needs an account, left to my hosted-services agents. No steps.
- **Omnizart, chord mode.** The agent that checked the first round tried a chord-only install, and it was refused with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]`. A later try with the 0.5.0 wheel on Python 3.8 stopped while building madmom, with `madmom/ml/nn/layers.c:38:6: error: #error Cython requires Python 3.9+.`, from a file an earlier build had left in the shared cache. Steps for me: section 7, its Docker image.
- **pyace.** Read, not run, since the third round's task for it was one README read. Its PyPI package, 0.1.1 from 2017, is Python 2.7 code. A copy of its file layout failed to import under Python 3 with `ImportError: cannot import name 'simpleace' from 'pyace'`, and the package's main file doesn't parse under Python 3. Its two deep modes need Keras models from a Dropbox zip. No steps.
- **QM Vamp Plugins (key finder, beat and bar trackers).** No package for Linux, and the plugin download site reset the connection. The Linux plugin pack's image holds no plugin file, and the text inside its desktop installer program names the QM plugins. That the plugins are inside the installer wasn't verified, because the installer wasn't run on a box with no screen. Steps for me: section 1, Sonic Visualiser with the Vamp Plugin Pack on Windows.
- **realtime-bpm-analyzer.** A browser library, left to my browser-audio agents. No steps.
- **Replicate-hosted All-In-One and chord models.** Hosted, with an account needed, left to my hosted-services agents. No steps.
- **Rochester ECE 477, "Guitar Tuning Detection" (2023).** A student report with no code link in its text. No steps.
- **Rochester ECE 477, "Guitar Tuning Identification" (2019).** Not read. No steps.
- **Sonic Annotator.** No Ubuntu package, and cloning its repository asked for a login. No steps.
- **Sonic Visualiser.** A desktop program, a step for me on Windows. Steps for me: section 1.
- **Spleeter.** Left to my source-separation agents. No steps.
- **Spotify Web API, audio features and audio analysis.** A hosted service that needs an account or a key, only pointed to here. Spotify's announcement of 2024-11-27 closed its audio features and audio analysis to `new Web API use cases`, and names new apps and existing apps in development mode without a pending extension request. No steps.
- **STONE.** Added by the agent that checked the survey. Deezer's key model from before S-KEY. Not attempted. It has no PyPI package and installs from its cloned repository with Poetry or Docker, the kind of step refused here before. And the TensorFlow 2.12.1 download its fixed versions call for, 585,912,145 bytes, is over the disk rule's 200 MB by itself. Steps for me: section 10.
- **Tunebat.** Named in search results only, and no other section's list has it. No steps.
- **Vamp Plugin Pack.** The Windows installer for the plugins, a step for me. Its Linux installer was downloaded and its contents listed, not run, since it's a desktop installer program and the box has no screen. Steps for me: section 1.
- **Vamp plugin SDK.** Only its Ubuntu package listing was checked. No steps.
- **WaveBeat.** Its checkpoint folder holds only a note saying to download one. No steps.
- **web-audio-beat-detector.** A browser library, left to my browser-audio agents. No steps.
- **Yamaha Chord Tracker.** Named in search results only and left to my apps agents. No steps.

The list also names 10 datasets, 3 file formats and one browser standard, with nothing to run. GuitarSet is where R1a, R1b and R1c come from.

</details>

<details><summary>Licenses of the tools that ran</summary>

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| All-In-One | MIT | MIT, per the Hugging Face card's `license: mit` ([source](https://huggingface.co/taejunkim/allinone/raw/main/README.md)) | the Harmonix Set, per its README, `The models are trained on the Harmonix Set with 8-fold cross-validation.` ([source](https://raw.githubusercontent.com/mir-aidj/all-in-one/main/README.md)). Its annotations are MIT and its audio isn't distributed. Each call also runs Demucs, whose weights' license is in my source-separation agents' record |
| aubio | GPL-3.0-or-later, `c) You must license the entire work, as a whole, under this License to anyone who comes into possession of a copy. This License will therefore apply, along with any applicable section 7 additional terms, to the whole of the work, and all its parts, regardless of how they are packaged.` ([source](https://raw.githubusercontent.com/aubio/aubio/master/COPYING)) | none | none |
| autochord | Apache-2.0 in the repository's `LICENSE`, MIT in its PyPI classifier. It bundles the NNLS Chroma plugin, GPL-2.0-or-later (see Chordino) | downloaded from Google Drive, with no license statement found | McGill Billboard chord annotations, CC0, read by its training code from `data/McGill-Billboard`. Their audio isn't distributed |
| `Beat This!` | MIT | MIT, with the README's note `Note that some of the training files are fully copyrighted or under limited Creative Commons licenses, and it is up to the user to assess whether this may impact their use case.` ([source](https://raw.githubusercontent.com/CPJKU/beat_this/main/README.md)) | annotations of 16 datasets, per its makers' list, all but GTZAN for the final0 to final2 models, GuitarSet (CC BY 4.0) among them. Most of their licenses weren't read, and the RWC page didn't load |
| BeatNet | CC BY 4.0 in the repository's `LICENSE` file. PyPI 1.1.3 lists no license | in the repository, with no separate statement | GTZAN, Ballroom and Rock Corpus, one per weight file per its README. Their licenses weren't read |
| chord-extractor | GPL-2.0, `b) You must cause any work that you distribute or publish, that in whole or in part contains or is derived from the Program or any part thereof, to be licensed as a whole at no charge to all third parties under the terms of this License.` ([source](https://raw.githubusercontent.com/ohollo/chord-extractor/master/LICENSE)). It ships the compiled Chordino | none | none |
| Chordino, NNLS Chroma and Tuning | GPL-2.0-or-later. For copies of the compiled plugin, `You may copy and distribute the Program (or a work based on it, under Section 2) in object code or executable form under the terms of Sections 1 and 2 above provided that you also do one of the following: a) Accompany it with the complete corresponding machine-readable source code, ...` ([source](https://raw.githubusercontent.com/c4dm/nnls-chroma/master/COPYING)) | none, its chord templates are built in | none stated |
| CREMA | BSD-2-Clause in `LICENSE.md`, ISC on PyPI | inside the package, with no separate license found | 1217 tracks from four collections, per its paper, `For evaluation, we used the dataset provided by Humphrey and Bello [11], which includes 1217 tracks from the Isophonics, Billboard, RWC Pop, and MARL collections.` ([source](https://archives.ismir.net/ismir2017/paper/000077.pdf)). The released model's training list holds 973 of them and its test list the other 244. McGill Billboard's annotations are CC0 with the audio not distributed, the Isophonics page has no license statement, the RWC page didn't connect and MARL's terms weren't found |
| DeepRhythm | AGPL-3.0, whose section 13 says `Notwithstanding any other provision of this License, if you modify the Program, your modified version must prominently offer all users interacting with it remotely through a computer network (if your version supports such interaction) an opportunity to receive the Corresponding Source of your version by providing access to the Corresponding Source from a network server at no charge, through some standard or customary means of facilitating copying of software.` ([source](https://raw.githubusercontent.com/bleugreen/deeprhythm/main/LICENSE)) | `deeprhythm-0.7.pth` comes from the same AGPL repository, the only license text found for it | not stated in its README. The author's project page says `For training data, I used giantsteps, ballroom, slakh2100, and a small subset of fma.` ([source](https://bleu.green/deeprhythm)), without saying which weights file that describes. Slakh2100 is CC BY 4.0, FMA's metadata is CC BY 4.0 and its audio is under the license each artist chose, the GiantSteps READMEs have no license statement, and the Ballroom page answered HTTP 403 |
| Demucs | not read in this lane | not read in this lane, my source-separation agents' record has the weights' license | not read in this lane |
| Essentia | AGPL-3.0 with the same section 13 ([source](https://raw.githubusercontent.com/MTG/essentia/master/COPYING.txt)), and its licensing page says `Essentia is available under an open licence, Affero GPLv3, for non-commercial applications, thus it is possible to test the library before deciding to licence it under a comercial licence. Contact Music Technology Group (UPF) for more information about licensing conditions ...` ([source](https://essentia.upf.edu/licensing_information.html)) | the TempoCNN models, `All the models are available under the CC BY-NC-SA 4.0 license for non-commercial use, and are also available under a proprietary license upon request.` ([source](https://essentia.upf.edu/licensing_information.html)). The models folder's own LICENSE file, read by my audio-to-notes agents, says `Creative Commons Attribution-NonCommercial-NoDerivatives 4.0` ([models LICENSE](https://essentia.upf.edu/models/LICENSE)). The other parts run here have no trained weights | TempoCNN, per its models page `trained on the Extended Ballroom, LMDTempo, and MTGTempo datasets` ([source](https://essentia.upf.edu/models.html)), whose licenses weren't read |
| librosa | ISC | none | none |
| LiveChord beat refiner | Apache-2.0, per its README's License line, `[Apache License 2.0](LICENSE)`, followed by `code AND weights.` ([source](https://huggingface.co/livechord-music/livechord-beat-refiner/raw/main/README.md)). The LiveChord app it comes from is a separate AGPL-3.0 release, per the same README, `The LiveChord product (full FastAPI server, frontend, and AI pipeline) is released separately under AGPL v3` | Apache-2.0, per that README line and the Hugging Face tag `license:apache-2.0` | per its README, `13,017 songs from a personal music library, predominantly East Asian pop, Western pop / rock / R&B, jazz standards, and a smaller classical / folk tail.`, labeled with `Beat This!` final0's output, filtered. The README names no dataset or dataset license and says `The training data is not redistributed` |
| lv-chordia | MIT | in the wheel, with no separate license found | 1217 songs, per its paper, `We use 1217 songs from Isophonics, Billboard and MARL collections collected by Humphrey and Bello [11, 20] to form the dataset.` ([source](https://archives.ismir.net/ismir2019/paper/000078.pdf)), the same tracks CREMA's paper names. Their license lines are as in CREMA's row |
| madmom | BSD-2-Clause | `All model and data files are distributed under the following license: Creative Commons Attribution-NonCommercial-ShareAlike 4.0`, with `NonCommercial: You must not use the material for commercial purposes.` and `If you want to include any of these files (or a variation or modification thereof) or technology which utilises them in a commercial product, please contact Gerhard Widmer [...]. Please note that pickled Processors (i.e. saved models) fall into this category.` ([source](https://raw.githubusercontent.com/CPJKU/madmom/main/LICENSE)) | Per the papers its code cites, the beat network was trained on 120 files from the Ballroom set, the MIREX 2006 contest and Bello's set. The bar tracker's network was trained on ten datasets, among them Ballroom, Beatles and RWC Popular. The two chord models were trained on Isophonics, RWC Popular and Robbie Williams songs. The key model was trained on GiantSteps MTG Key, McGill Billboard and 1504 classical pieces from the authors' `internal database` ([source](https://arxiv.org/abs/1808.05340)). The papers name no dataset license, and whether each shipped file is its paper's exact model isn't stated. Of those sets, McGill Billboard's annotations are CC0, the Isophonics page and the GiantSteps READMEs have no license statement, the RWC page didn't connect, the Ballroom page answered HTTP 403, and the other sets' terms weren't read. Second-hand, the S-KEY paper says madmom's key model was `trained on a varied corpus (electronic dance music, pop/rock, and classical music)` ([source](https://arxiv.org/html/2501.12907v2)) |
| music21 | BSD-3-Clause | none | none |
| NATTEN | MIT, `Copyright (c) 2022 - 2026 Ali Hassani.` ([source](https://raw.githubusercontent.com/SHI-Labs/NATTEN/main/LICENSE)) | none | none |
| S-KEY | MIT, `The code of SKEY is MIT-licensed.` | `The MIT license does not apply to the model weights in skey.pt. You may use the model weights only for non-commercial research purposes.` ([source](https://raw.githubusercontent.com/deezer/skey/main/README.md)). The README at the commit the ONNX file was converted from says only that the code is MIT-licensed, the weights file is the same, and the ONNX card gives the weights no new license | songs from the Deezer catalog, per the paper, `STONE was trained on a corpus of 60k songs from the Deezer catalog. To offer a fair comparison, we begin by training S-KEY on the exact same dataset`, then a version trained on 1M songs. Which one `skey.pt` is isn't stated ([source](https://arxiv.org/html/2501.12907v2)) |
| tempo-cnn | AGPL-3.0, `Source code and models can be licensed under the GNU AFFERO GENERAL PUBLIC LICENSE v3. For details, please see the LICENSE file.` ([source](https://raw.githubusercontent.com/hendriks73/tempo-cnn/main/README.rst)), with the same section 13 as DeepRhythm | the same AGPL-3.0 | not read |
| vamp | MIT-style | none | none |

The clauses, with their links and the dates they were read, are in [`survey.md`](https://github.com/aaronorelup/blog/blob/research/guitar-tab-tools/docs/guitar-tab-research/lanes/chords-beats-key/survey.md) and [`tools.json`](https://github.com/aaronorelup/blog/blob/research/guitar-tab-tools/docs/guitar-tab-research/lanes/chords-beats-key/tools.json).

</details>

## Choosing the string and fret

Since the same note can be played in more than one place, this step picks a string and fret (a metal strip on the neck) for each note. My agents listed 95 tools, models, papers, apps and datasets and ran 13 on the cloud box. Given a synthesized clip's 90 notes, the six note-to-tab tools put 14 to 90 on the known string and fret.

<ao-compare cols="1" aspect="9/1">
<figure><img src="/media/guitar-tab-tools/guitar-tab-lilypond-s2n.webp" alt="One line of guitar tab: six horizontal lines with a TAB sign at the left and fret numbers from 0 to 3 along them, with only 3s on the bottom line."><figcaption><b>S2n in standard tuning</b><span class="ao-meta">LilyPond 2.24.3 on S2n's exact notes with its default settings, which use standard tuning, the usual E A D G B E (r0145). All 90 notes on the known string and fret. The tab is spaced by note order, not rhythm, and the whole clip is on this one line.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/guitar-tab-lilypond-s5dropd.webp" alt="The same kind of line of tab, with fret numbers from 0 to 3 on the upper five lines and 5s and 0s on the bottom line."><figcaption><b>S5dropd, told it's Drop D</b><span class="ao-meta">The same piece in Drop D (the lowest string tuned down to D), with LilyPond given that tuning (r0145). All 90 notes on the known string and fret. The bass G (G2, the 2 is the octave) sits at fret 5 of the lowest string, and the low D is that string played open, with no finger on it.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/guitar-tab-lilypond-r3a.webp" alt="A line of tab with fret numbers from 0 to 10 on all six lines, some of them stacked in columns."><figcaption><b>R3a, a real concert video</b><span class="ao-meta">LilyPond on the 105 notes that Basic Pitch, a tool that writes down the notes it hears, wrote from R3a's audio (r0301). It placed all 105. There's no known answer to count them against.</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

Thirteen ran on the cloud box, at no cost beyond the session itself. Six of them turn a list of notes into tab (LilyPond, scorify, tabsynth, tayuya, tutts and tuttut). Four are trained models, or sets of them, that start from audio. The Riley et al. guitar models give notes only, and the SynthTab TabCNN checkpoints (saved, trained model files) give a string and fret per note. So do a TabCNN file on Zenodo, a site for research data, and two TabCNN files from an account called cstr on Hugging Face, a site for AI models. amt-tools and piano-transcription-inference were the code that loaded three of those, and PyGuitarPro wrote files for the Guitar Pro tab program from the results. cstr's two are ONNX files, a format for trained models, and ONNX Runtime 1.31.1 ran them. One agent, the trial agent, ran the trials. A second one, the checking agent, re-ran all 199 runs of the counting tool that the trial agent cited (r0456). It got the same results as the ledger, the log where each one was recorded. It also repeated some of the runs and filled a few gaps. Later a critic agent listed gaps in the research, and another agent, the gap agent, worked through this step's. It ran the Zenodo file, cstr's files and scorify, and ran the PyGuitarPro conversions again through the timing wrapper. Another agent, the second checker, checked that round. It re-ran all 57 of its counts with the same results, and repeated some of its runs with the same output.

The clips. S1 is a single-note melody. S2n is a 29-second fingerstyle clip my agents synthesized, so every note is known. S2s has the S2n notes on a steel-string sound, and S3 is strummed chords. S5capo2 is the S2n piece with a capo (a clamp across the strings that raises every note) on fret 2. S5dropd is the same piece in Drop D, with the lowest string tuned down to D, and 4 of its bass notes go down to that low D. All of those are synthesized. R1a and R1c are chord accompaniments and R1b is a single-note solo, real recordings from GuitarSet of 28 to 29 seconds. GuitarSet is a research set of recordings with each note's string and fret logged. R3a, R3b and R3c are 18-second excerpts of real guitar videos, with no known answer.

How the counting works. A note counts as found when it starts within 50 ms of a known note and has the same pitch, each known note counted once. Then its string and fret are compared with the known ones. For the synthesized clips the known string and fret are the tab each piece was written with, and for R1a, R1b and R1c they're the ones GuitarSet logged. "Exact notes" means the clip's own MIDI (a list of notes with start times), with its tracks merged into one because some tools read only one track. "Basic Pitch's notes" means the MIDI that Basic Pitch 0.4.0, a tool that writes down the notes it hears, made from the clip's audio in the audio-to-notes part of this research. That was run r0234 there, and r0264 for R3b and R3c. For S2n it wrote 137 notes and found all 90 real ones, and for R1c it wrote 156 and found 120 of 148 (e0559, e0577). "Shared" means a light job run without one of the box's two 2-core slots, so it wasn't pinned to its own cores and other jobs ran beside it. Peak memory is the run ledger's figure.

**amt-tools 0.3.2** ([link](https://github.com/cwitkowitz/amt-tools)). Frank Cwitkowitz's Python library for music transcription models, with a TabCNN re-implementation in it. Here it loaded and ran the SynthTab checkpoints and the TabCNN file from Zenodo, and its decoding turned the frets from cstr's files into notes.

- In: the audio of S2n, S2s, S3, S5capo2, S5dropd, R1a, R1b and R1c, each clip's mono WAV, a one-channel audio file, resampled to 22050 Hz by its `load_normalize_audio`.
- Command or settings: `CQT(sample_rate=22050, hop_length=512, n_bins=192, bins_per_octave=24)`, then `run_offline` with `ComboEstimator([TablatureWrapper, StackedNoteTranscriber])`, settings copied from SynthTab's `demo_embedding/evaluate.py`. My agents' loader, `scripts/run_synthtab_tabcnn.py`, opened each checkpoint with `torch.load(weights_only=True)` and a list of the classes it names. Two earlier tries stopped, one with `ModuleNotFoundError: No module named 'resampy'` and one with `Unsupported global: GLOBAL numpy.core.multiarray.scalar`, until resampy was installed and the loader mapped numpy's old module name.
- Out: the checkpoint's frets frame by frame, turned into a list of notes per string (MIDI pitch, start and end in seconds). The counts are under the SynthTab entry, and for the gap agent's TabCNN files under the TabCNN + GuitarProFX and cstr/tabcnn-onnx entries.
- Time: the two SynthTab runs, r0139 and r0274, and the Zenodo file's run, r0592.
- Takes as a hint: `GuitarProfile(tuning=None, num_frets=None)`, but these checkpoints were trained for one profile, standard tuning with 19 frets.
- Hands off to: its `write_stacked_notes_jams` writes the per-string notes as JAMS (a JSON format for music annotations). Not run here. It has no writer for Guitar Pro or for MusicXML, a file format for sheet music.

**cstr/tabcnn-onnx** ([link](https://huggingface.co/cstr/tabcnn-onnx)), revision `886ead7` of the model repository, created 2026-07-20 and last changed 2026-08-02. Two ONNX files of TabCNN, the model described under the SynthTab entry, from the Hugging Face account cstr. The model card, the model's description page, says `Vanilla: trained here on **GuitarSet** (CC BY 4.0).` for `tabcnn.onnx`, and `GuitarProFX: weights from **Zenodo 11406378**` for `tabcnn-gpfx.onnx`. That Zenodo file has its own entry, TabCNN + GuitarProFX weights. The export scripts are in the GitHub repository CrispStrobe/onnx_runtime_dart. GGUF copies, another model file format, sit in a second repository, cstr/tabcnn-GGUF, and weren't run.

- In: the mono WAV of S2n, S2s, S3, S5capo2, S5dropd, R1a, R1b and R1c, resampled to 22050 Hz.
- Command or settings: ONNX Runtime 1.31.1 on the CPU, with `intra_op_num_threads` set to the slot's 2 cores and `inter_op_num_threads` to 1, in my agents' script `scripts/gap2_run_tabcnn.py`. Each file got the audio preparation its card gives. Both start from a CQT, a map of how loud each pitch band is over time, with the same settings. For `tabcnn-gpfx.onnx` that's `|librosa.cqt(y, sr=22050, hop_length=512, n_bins=192, bins_per_octave=24)|`, then `amplitude_to_db(ref=np.max)` and a rescale to 0 to 1. For `tabcnn.onnx` it's the plain CQT, with no decibels or rescale, after `librosa.util.normalize(y)`. The script fed the model windows of 9 frames, took the top class on each string and passed the frets through the same amt-tools decoding as the SynthTab runs.
- Out: for each 23.2 ms frame and each string, 21 numbers, one per class. Class 0 is a silent string, and classes 1 to 20 are the open string up to fret 19. The card gives the shape as `float32[N, 6, 21]`. The frets were decoded into notes per string, as for the SynthTab files. The counts for `tabcnn.onnx` are in the table after this list.
  - `tabcnn-gpfx.onnx` gave the same fret or silence as the Zenodo file on every string of every frame, 58,980 of 58,980 string-and-frame pairs over the 9,830 frames of the 8 clips. That held with the card's audio preparation (r0591) and with amt-tools' (r0595). The decoded notes matched too, so its counts are the Zenodo file's, under that entry.
  - `tabcnn.onnx` with the training repository's order of steps, which first scales the 44.1 kHz audio so its loudest point is at full volume and then resamples it (r0601), differed from the card's order in 58 of the 9,830 frames. That run wasn't counted.
  - Neither file has a capo or tuning input. On S5capo2, 40 of the 58 notes `tabcnn.onnx` found sit on the known string at the same fret counted from the top of the neck, and none at the fret counted from the capo. On S5dropd the 4 D2 notes can't come out, because the lowest note these files know is E2.
  - The export repository's README gives `EPOCHS=4 VAL_GUITARIST=5 python train.py features/ tabcnn.onnx` as the command that trains `tabcnn.onnx`, and `train.py` trains on every GuitarSet player but player 5. That takes in the players of all three R1 clips. Whether the file on Hugging Face is the one that command made isn't verified.
- Time: on 2 cores. `tabcnn.onnx` took 62.01 s wall for the 8 clips, 1001.7 MB peak (r0594). Wall time is time on the clock, start to finish. Each clip, 24.0 to 29.4 s long, took 5.84 to 11.65 s with Python start-up, and 0.75 to 1.90 s of that was the audio preparation, the model and the decoding. The run started while other lanes' jobs ran, and its first two clips took longest, S2n 10.92 s and S2s 11.65 s. `tabcnn-gpfx.onnx` took 47.11 s wall, 1009.8 MB peak, 5.68 to 6.17 s per clip and 0.66 to 0.84 s inside (r0591). In both, ONNX Runtime split the work into 6 threads, all held to the slot's two cores. The second checker's re-run of S2n and R1c gave byte-identical frames and notes (r0674).
- Takes as a hint: none. Standard tuning and 19 frets are fixed by training. The GGUF card says `Turning them into a playable fingering needs a constrained decoder (one note per string, fret range, capo, hand span).` My agents built no such step. Their script took the top class on each string, frame by frame.
- Hands off to: nothing downstream. The files take `float32[N, 192, 9, 1]` and give `float32[N, 6, 21]`, so the audio preparation, the windows, the choice of class and the decoding are the caller's own code, here my agents' script.

Each cell is notes out, real notes found, and found notes on the known string and fret (e1739, e1742, e1745, e1748, e1751, e1754, e1757, e1760):

| Clip | `tabcnn.onnx` |
|---|---|
| S2n, 90 notes | 223, 72, 62 |
| S2s, 90 notes | 189, 43, 43 |
| S3, 182 notes | 106, 40, 40 |
| S5capo2, 90 notes | 182, 58, 0 |
| S5dropd, 90 notes | 224, 67, 54 |
| R1a, 189 notes | 120, 56, 55 |
| R1b, 70 notes | 90, 64, 62 |
| R1c, 148 notes | 151, 107, 103 |

**LilyPond 2.24.3** ([link](https://lilypond.org/index.html)). A music engraving program, the kind that typesets sheet music. Its tab staff picks a string and fret for each note by a fixed rule, not a trained model. Its manual says `By default pitches are assigned to the lowest playing position on the fretboard (first position). Open strings are automatically preferred.`

- In: the exact notes of S1, S2n, S3, S5capo2, S5dropd, R1a, R1b and R1c. Also Basic Pitch's notes for the same clips and for R3a, R3b and R3c, and the Riley et al. models' notes. LilyPond reads its own `.ly` text, not MIDI. So my agents' script `scripts/run_lilypond_tab.py` wrote the notes on a `TabStaff` in order, with no rhythm. Notes starting within 30 ms of a group's first note became one chord.
- Command or settings: `lilypond --loglevel=WARNING -dno-print-pages`, and `--png -dresolution=70` for the pictures above. A `tablatureFormat` hook logged each note's string and fret to a TSV file, a plain-text table. Settings tried: `stringTunings`, `minimumFret`, `restrainOpenStrings` and a string number on one note (`g\4`).
- Out: a PDF, PNG or SVG of the tab, with no text or JSON export. On the exact notes, on the known string and fret: S1 62 of 62, S2n 90 of 90, S3 182 of 182, R1a 104 of 189, R1b 32 of 70, R1c 129 of 148 (e0175 to e0177, e0182 to e0184).
  - On R1a it left one note out with a `No string for pitch` warning, an A#2 at 10.668 s, which my agents traced to the default `maximumFretStretch` of 4.
  - S5capo2: 0 of 90 with no capo given, 90 of 90 with `stringTunings` raised 2 semitones, which is 2 frets (e0178, e0179).
  - S5dropd: in standard tuning it left out the 4 D2 notes with `No string for pitch #<Pitch d, > (given frets (2))` and put 72 of 90 on the known string and fret. With `\stringTuning <d, a, d g b e'>`, 90 of 90 (e0180, e0181).
  - `minimumFret`, the lowest fret it may use: at 5 on S1, 22 of 62. At 3 on S2n, 66 of 90. At 5 on R1b, 29 of 70. At 3 on R1c, 83 of 148, with 2 notes left out (e0185, e0190, e0188, e0187). `restrainOpenStrings` alone changed nothing on S2n, and with `minimumFret` at 1 the 40 open-string notes moved one string down, 50 of 90 (e0186, e0189).
  - The string number `g\4` on S2n's first G3 put it on string 4 fret 5, and the other 89 notes stayed as they were (r0155).
  - On Basic Pitch's notes: S2n 88 of 90, R1c 94 of 148 (e0663, e0729). With no fret limit given it wrote frets up to 30, and it left out notes it couldn't place, like the C1 Basic Pitch wrote in S2n. With the tuning raised 2 semitones for the capo, 86 of 90 on S5capo2, and with the Drop D tuning given, 90 of 90 on S5dropd (e0739, e0740). On R3a it placed all 105 notes in 67 chord groups with no warnings (r0301).
  - The start of its S2n log (position in whole notes, string, fret):

  ```text
  0 6 3
  0 3 0
  1/16 4 0
  1/16 3 0
  1/8 6 3
  ```

- Time: shared, 36.04 s wall for 14 runs and 78.7 MB peak (r0145). The `lilypond` program itself took 2.05 to 2.88 s per run.
- Takes as a hint: the tuning through `stringTunings` and the lowest fret to use through `minimumFret`. Also `restrainOpenStrings`, `maximumFretStretch`, left at its default of 4, and a string number per note. My agents found no capo setting for its automatic string choice.
- Hands off to: the logged strings and frets went through PyGuitarPro into a Guitar Pro 5 file, and S5dropd with Drop D read back 90 of 90 (e0433).

**piano-transcription-inference 0.0.6** ([link](https://pypi.org/project/piano-transcription-inference/)). Kong et al.'s Python package for their piano transcription model. The Riley et al. guitar checkpoints are fine-tuned copies of that model, meaning copies trained further on guitar, so here it ran them.

- In: the mono WAV of S2n and R1c, and in the checking agent's runs S3 and R1b too, loaded at 16 kHz and cut into 10 s pieces.
- Command or settings: the package's `transcribe()` from PyPI, the public store for Python packages, behind a few lines of my agents' own loader (`scripts/run_hfmt_guitar.py`, `torch.load(weights_only=True)`). The loader was there because the package's own setup downloads its piano model again when the checkpoint file is under 160 MB. Thresholds as fixed in 0.0.6: onset 0.3, offset 0.3, frame 0.1. Those are the model's cut-offs for a note's start, its end and each frame where it sounds.
- Out: a MIDI file of notes with their loudness (velocity). The counts are under Riley et al.
- Time: the Riley et al. runs, r0331, r0494, r0499 and r0505.
- Takes as a hint: only those thresholds, which xavriley's fork, a changed copy of the package's code, turns into settings.
- Hands off to: the MIDI went into tuttut and LilyPond, under Riley et al.

**PyGuitarPro 0.11** ([link](https://github.com/Perlence/PyGuitarPro)). A Python package whose README says `PyGuitarPro is a package to read, write and manipulate GP3, GP4 and GP5 files.` Those are files of the Guitar Pro tab program. My agents used its GP5 writer in about 50 lines of their own, `scripts/gtreval_to_gp5.py`, to turn string and fret lists into `.gp5` files, and its reader to read them back.

- In: tuttut's lists for S2n, for S5capo2 with the tuning raised for the capo and for S5dropd with Drop D, and LilyPond's for S5dropd with Drop D, all at 112 BPM (beats per minute). Also three whole chains from audio, Basic Pitch's notes into tuttut into this glue, for S2n, S5capo2 with the tuning raised for the capo, and R1c.
- Command or settings: one 6-string track, `Track.strings` from the tuning, the capo as `Track.offset`, each note's start snapped to a 16th-note grid at the given tempo, 4/4 bars. String, fret and order are kept, and the note lengths aren't the played ones.
- Out: `.gp5` files, 3,158 to 3,170 bytes each for the four made from the exact notes. Read back, tuttut's S2n had 90 of 90 on the known string and fret, S5capo2 90 of 90 with the capo read back as 2, S5dropd 88 of 90 with the tuning read back as `[38, 45, 50, 55, 59, 64]`, and LilyPond's S5dropd 90 of 90 (e0430 to e0433). The chains from audio: S2n 89 of 90, with 136 of tuttut's 137 notes written (one fell on a string already used in the same 16th slot, and the glue keeps the first). S5capo2 90 of 90. R1c, at the recording's tempo of 119 BPM, 90 of 148, with 151 of 153 notes written. There the fixed 16th grid moved some note starts more than 50 ms (e1088, e1090, e1092). R3a's tuttut list at an assumed 120 BPM kept 102 of 105 notes.
- Time: the first conversions weren't timed or run through the timing wrapper. The gap agent ran all eight again through it, shared, 0.77 s wall for all eight with eight Python start-ups and 21.1 MB peak (r0586). The new files hold the same notes, tuning, capo and tempo as the old ones, with no song title, and the seven with a known answer read back to the same counts.
- Takes as a hint: tuning, capo and tempo, which it writes into the file.
- Hands off to: `gtr-eval`, my agents' counting tool, read the files back with PyGuitarPro's reader. Opening them in a tab program wasn't tried in this part of the research.

**Riley et al. guitar note models** ([link](https://huggingface.co/xavriley/midi-transcription-models)), `guitar-fl.pth` and `guitar-gaps.pth` from a model repository last changed 2026-08-22. Two trained models from Queen Mary University of London that turn guitar audio into notes (pitch, start, end and loudness), with no string or fret. The string and fret come from a note-to-tab tool afterwards.

- In: mono WAV. `guitar-fl.pth` on S2n and R1c. `guitar-gaps.pth` on S2n, S3, R1b and R1c, run by the checking agent after two of the trial agent's runs waited about 30 and 37 minutes for a CPU slot and were cancelled, by the trial agent's account.
- Command or settings: through piano-transcription-inference 0.0.6 and my agents' loader (above), not the authors' own `midi_transcription` command, whose install was refused (next block).
- Out: a MIDI file per clip, 384 ticks per beat, which my agents' script also wrote out as a CSV of `onset,offset,pitch,velocity`.
  - `guitar-fl.pth`: S2n 90 notes out, 89 of the 90 real notes found, 1 extra. R1c 133 out, 125 of 148 found, 8 extra (e1224, e1274).
  - `guitar-gaps.pth`: S2n 90 out, all 90 found. S3 208 out, 172 of 182 found, 36 extra. R1b 69 out, 61 of 70 found, 8 extra. R1c 130 out, 121 of 148 found, 9 extra (e1428, e1436 to e1438).
  - Into tuttut and LilyPond with defaults, on the known string and fret. From `guitar-fl.pth`, S2n 89 of 90 with both, and R1c 104 of 148 with tuttut and 109 with LilyPond (e1225, e1275, e1344, e1345). From `guitar-gaps.pth`, S2n 90 of 90, S3 172 of 182 and R1b 25 of 70 with both, and R1c 106 of 148 with tuttut and 108 with LilyPond (e1430, e1432, e1440 to e1445).
  - Neither the model card nor the code says which training run each file is, so whether they heard GuitarSet, and with it the R1 takes, isn't verified.
  - The first rows of the R1c CSV:

  ```text
  onset,offset,pitch,velocity
  4.029094,4.580000,40,100
  4.585752,5.290000,40,99
  ```

- Time: on 2 cores. `guitar-fl.pth` took 400.85 s wall for both clips, 943.9 MB peak, 216.80 s of it transcribing S2n and 165.55 s R1c (r0331). The checking agent ran R1c again and the transcription took 22.87 s, with a byte-identical MIDI file (r0494). What else was running on r0331's cores wasn't recorded. `guitar-gaps.pth` took 15.03 s to transcribe S2n, 21.28 s wall, 919.1 MB peak (r0499), and 87.17 s wall for S3, R1b and R1c together, 948.0 MB peak (r0505).
- Takes as a hint: none for tuning, capo or range. Only the onset, offset and frame thresholds.
- Hands off to: MIDI, into tuttut and LilyPond (above). Before that, the tracks were merged into one. These files end each note with a note-on message at velocity 0, and those were rewritten as note-offs, the usual MIDI message for a note's end.

**scorify 0.4.0** ([link](https://github.com/kyr0/scorify)). Aron Homberg's JavaScript library, published 2026-10-31 on npm, the public store for JavaScript packages. Its README calls it `Instrument-aware music arrangement, transposition, and fingering constraints for vanilla JavaScript.` It places each note on a string and fret, with the finger that presses it, by searching over a model of the hand. Its README names three ways to search, `exhaustive reference, exact dynamic programming, or bounded beam search`.

- In: the exact notes of S1, S2n, S3, S5capo2, S5dropd, R1a, R1b and R1c. The package reads no files, and its README's list of first-release limitations says `audio/MIDI/MusicXML import ... remain future work.` So my agents' script `scripts/gap2_run_scorify.py` wrote each note as a scorify note, with its start and length as exact fractions of a quarter note and its name spelled with sharps (`parsePitch("C#4")`), plus the MIDI's tempo map and first time signature.
- Command or settings: scorify's `arrange` with `mode: "exact"`, in Node v22.23.4, which runs JavaScript outside a browser, from `scripts/gap2_run_scorify.mjs`, with `classicalGuitar()` (E2 A2 D3 G3 B3 E4, 19 frets), `classicalGuitar({capoFret: 2})` for the capo or `classicalGuitar({tuning: ["D2", "A2", "D3", "G3", "B3", "E4"]})` for Drop D. The default player, `compilePlayer({})`, is level "maestro". Its limits include the widest stretch in frets (`maxFretSpan` 9), the most notes plucked in a second (`maxAttacksPerSecond` 32) and the shortest note (`minDuration` 1/64 quarter). The default search keeps 64 partial answers at a time, tries 128 candidates per step and stops after 500,000 expansions, that is, after extending a partial answer 500,000 times. Variations: larger search limits (512, 512 and 5,000,000), `mode: "adaptive"` with held notes allowed to be cut short or notes moved by an octave, level "amateur", `minDuration` 1/256 quarter, `maxAttacksPerSecond` 64, `rightHand: "strum"` and a pinned note.
- Out: a status, and on success each note's string, its fret counted from the capo and a finger, 0 for an open string and 1 to 4 for the fingers, plus a cost and a difficulty summary. Times come in quarter notes, not seconds. It's the only note-to-tab tool here that gives a finger. The package declares no writer for ASCII tab, Guitar Pro or MusicXML. On the known string and fret: S1 62 of 62, S2n 90 of 90, S3 182 of 182, R1c 127 of 148 (e1808, e1810, e1812, e1814).
  - R1a and R1b gave no tab with the defaults. The status was `search-exhausted`, with `No valid path within the declared candidate and mechanics model`, and 0 notes were placed. Its README says `No partial prefix is emitted as a successful arrangement.` Larger search limits gave the same, and the `adaptive` mode stopped with `Expansion budget exceeded`.
  - R1a's 188th note, a D#3 at 29.152 s, is cut to 7 ms by the end of the excerpt, under the default `minDuration`. With `minDuration` at 1/256 quarter, all 189 notes were placed, 101 of 189 on the known string and fret (e1829).
  - R1b stops at its 56th note, a B4 that starts 18.3 ms after an F#4 that's still sounding. `maxAttacksPerSecond` at 64 and `rightHand: "strum"` gave the same status. scorify's `limitsExceeded` check names no limit for R1b at the default level, so which part of its model turns it down isn't known.
  - S5capo2 with no capo given: `search-exhausted`, with `Expansion budget exceeded`. With the larger search limits it placed all 90, none on the known string and fret counted from the capo and 54 on the known string at the same fret counted from the top of the neck (e1828). With `classicalGuitar({capoFret: 2})`, 89 of 90 (e1816).
  - S5dropd with no tuning given: `search-exhausted` with the defaults, with the larger limits and in the `adaptive` mode. With the Drop D tuning, 82 of 90 (e1818). The other 8 are four C3s at string 6 fret 10 instead of string 5 fret 3, and four C4s at string 4 fret 10 instead of string 2 fret 1.
  - R1c at level "amateur" came back `infeasible` after 44 ms. The `limitsExceeded` check lists `up to 11 string attacks in one second` where that level allows 7, and `up to 15 picked notes in one bar, some together` where it allows 4 unless each sounds alone.
  - A pinned note. scorify's notes have no string field. Its README offers a cost hook instead and says `It cannot override hard validity or the musical-fidelity priority.` My agents' hook added a cost of 1000 to any choice that put S2n's first G3, at 2.143 s, on a string other than 4. That G3 went to string 4 fret 5, finger 3. The other 89 notes kept their strings and frets, and 35 of the 90 got a different finger (e1830). So the pin is a cost, not a hard rule. LilyPond's string number made the same move (r0155).
- Time: on 2 cores. The first batch, the 8 clips plus the capo and Drop D runs, took 19.73 s wall, 175.7 MB peak, after 20.0 s waiting for a slot (r0621). `arrange` itself took 0.80 to 2.70 s per run. The second batch, 9 runs, took 48.26 s wall, 345.3 MB peak (r0623), and its larger search on S5capo2 ran 16,546 ms inside `arrange`. The second checker's re-run of seven of the runs gave the same status and the same string, fret and finger for every note (r0680).
- Takes as a hint: a tuning per string, a capo for the whole instrument or per string (`capoFret`), a fret count per string (not varied here), the player's level and single limits like `minDuration`, `maxAttacksPerSecond` and `rightHand`, and the search limits. A string for one note goes in only through the cost hook. Its `songs` part also declares a `suggestCapo` function, not tried.
- Hands off to: nothing downstream was tried. The package can also render WAV audio (`renderPerformance`, `encodeWav`), not tried. Its README says a separate agent skill in the repository, `skills/score-import/`, `converts MusicXML, MXL, ABC and MIDI into scorify Score JSON`, also not tried.

**SynthTab TabCNN checkpoints** ([link](https://github.com/yongyizang/SynthTab)), repository commit 6136f79 of 2024-12-05. TabCNN is a model that reads audio and gives, for every 23.2 ms frame of it, a fret for each of the six strings or a mark that the string is silent. The SynthTab researchers trained it on SynthTab, guitar audio they rendered from DadaGP tabs, and fine-tuned copies on real recordings. Two of their files ran, `finetuned/GuitarSet.pt` and `SynthTab-Pretrained.pt`. Going by its name and the paper, the second was trained on SynthTab alone.

- In: the mono WAV of S2n, S2s, S3, S5capo2, S5dropd, R1a, R1b and R1c, resampled to 22050 Hz.
- Command or settings: loaded with amt-tools 0.3.2 (above) instead of SynthTab's own scripts, whose README says `The code is still being cleaned up. You would probably need to change directories paths and datasets in the code to make it work`. `finetuned/GuitarSet.pt` ran in r0139 and `SynthTab-Pretrained.pt` in r0274.
- Out: a fret or -1 (silent) per string for each frame, decoded into notes per string with pitch, start and end. The counts are in the table after this list.
  - Neither file has a capo input, so on S5capo2 the frets come out counted from the top of the neck by the tuning pegs, not from the capo. On S5dropd the 4 D2 notes can't come out, because the lowest note these files know is E2.
  - `finetuned/GuitarSet.pt` was fine-tuned on GuitarSet, and with the repository's own fine-tuning script every GuitarSet player would be in its training, so it may have heard the R1 takes. `SynthTab-Pretrained.pt` wasn't trained on GuitarSet, going by its name and the paper (not otherwise verified).
  - The first decoded notes of S2n from `finetuned/GuitarSet.pt` (start in seconds, MIDI pitch, string, fret). The known tab starts with G2 on string 6 fret 3 and G3 on the open third string at 2.1429 s.

  ```text
  (2.1595, 55, 4, 5), (2.1827, 43, 6, 3), (2.4613, 43, 6, 3), (2.5310, 43, 6, 3), (2.6935, 50, 5, 5)
  ```

- Time: on 2 cores. `finetuned/GuitarSet.pt` took 185.81 s wall for the 8 clips, 3798.2 MB peak (r0139). Each clip, 24 to 29.4 s long, took 18.36 to 32.91 s with Python start-up. The checking agent's re-run of R1c took 21.15 s wall, 3647.2 MB peak, and gave the same 141 notes (r0501). `SynthTab-Pretrained.pt` took 517.17 s wall, 3797.4 MB peak (r0274). Its wall time was 2.4 times its CPU time, which counts only the time the processors spent working on it. In r0139 it was 0.9 times. Whether other jobs shared its cores wasn't measured. Its CPU time for the batch was 211.74 s, against 205.69 s in r0139.
- Takes as a hint: none. The tuning `[40, 45, 50, 55, 59, 64]` and 19 frets are fixed in each checkpoint.
- Hands off to: nothing downstream. There's no Guitar Pro or MusicXML writer in this pipeline. My agents saved the frames as CSV and the notes as JSON to count them.

Each cell is notes out, real notes found, and found notes on the known string and fret (e0198 to e0205, and e0863, e0866, e0869, e0873, e0875, e0879, e0881, e0883):

| Clip | `finetuned/GuitarSet.pt` | `SynthTab-Pretrained.pt` |
|---|---|---|
| S2n, 90 notes | 260, 67, 41 | 163, 67, 60 |
| S2s, 90 notes | 395, 59, 46 | 334, 49, 49 |
| S3, 182 notes | 169, 48, 42 | 86, 32, 31 |
| S5capo2, 90 notes | 235, 64, 0 | 156, 70, 0 |
| S5dropd, 90 notes | 263, 67, 38 | 152, 66, 53 |
| R1a, 189 notes | 77, 69, 68 | 178, 68, 51 |
| R1b, 70 notes | 96, 64, 59 | 114, 50, 31 |
| R1c, 148 notes | 141, 129, 127 | 180, 82, 61 |

**TabCNN + GuitarProFX weights** ([link](https://zenodo.org/api/records/11406378)), the file `best_TabCNN_tablature_trancription_model` in Zenodo record 11406378, published 2024-06-01. TabCNN in amt-tools' version, trained by Pedroza, Abreu, Corey and Roman for a DAFx 2024 paper, on GuitarSet plus GuitarProFX by that paper's account. Their paper says GuitarProFX `comprises 360 randomly-chosen solo performance tracks from DadaGP`, which they rendered with guitar tones from EGFxSet and their own recordings. The file is a PyTorch archive (PyTorch is a Python library for trained models) holding a whole amt-tools `TabCNN` object under `model-2500`, with its weights saved on a graphics card (`cuda:0`).

- In: the mono WAV of S2n, S2s, S3, S5capo2, S5dropd, R1a, R1b and R1c, read by amt-tools' `load_normalize_audio(path, 22050)`.
- Command or settings: `torch.load(weights_only=True)` with a list of the classes the file names. Those are amt-tools' own, so none had to be mapped as for SynthTab, and only numpy's old `numpy.core.multiarray.scalar` path was mapped to numpy 2's. Then amt-tools 0.3.2, `amt_tools.features.CQT(sample_rate=22050, hop_length=512, n_bins=192, bins_per_octave=24)`, `run_offline` and the same decoding as the SynthTab runs, in my agents' script `scripts/gap2_run_tabcnn.py`.
- Out: a fret or silence per string for each 23.2 ms frame, decoded into notes per string. The counts are in the table after this list.
  - On S5capo2 the frets come out counted from the top of the neck. Of the 77 notes it found, 39 sit on the known string at the same fret counted that way, and none at the fret counted from the capo.
  - On S5dropd the 4 D2 notes can't come out, because the lowest note the file knows is E2.
  - The training script trains six models, called folds, each tested on one GuitarSet player, and the record doesn't say which fold the file is. If it was trained as the paper describes, five of GuitarSet's six players were in its training data, so at least two of the three R1 players. The training script itself takes its training tracks only from its own GuitarProFX folder, and whether that folder held GuitarSet tracks isn't in the repository.
  - The first decoded notes of S2n (start in seconds, MIDI pitch, string, fret). The known tab starts with G2 on string 6 fret 3 and G3 on the open third string at 2.1429 s.

  ```text
  (2.1362, 55, 4, 5), (2.1827, 43, 6, 3), (2.6703, 50, 5, 5), (2.7632, 55, 3, 0), (2.9257, 55, 3, 0)
  ```

- Time: on 2 cores, 64.44 s wall for the 8 clips, 1364.9 MB peak (r0592). Each clip took 7.46 to 8.86 s with Python start-up, and 2.22 to 3.57 s of that was the audio preparation, the model and the decoding. The second checker's re-run of S2n and R1c gave byte-identical frames and notes (r0674).
- Takes as a hint: none. The tuning E2 A2 D3 G3 B3 E4 and 19 frets are fixed in the saved file.
- Hands off to: nothing downstream. cstr's `tabcnn-gpfx.onnx` is this file as ONNX, by its card, and it gave the same output (cstr/tabcnn-onnx entry).

Each cell is notes out, real notes found, and found notes on the known string and fret (e1715, e1718, e1721, e1724, e1727, e1730, e1733, e1736):

| Clip | Zenodo file, and `tabcnn-gpfx.onnx` |
|---|---|
| S2n, 90 notes | 220, 76, 49 |
| S2s, 90 notes | 262, 61, 56 |
| S3, 182 notes | 106, 33, 32 |
| S5capo2, 90 notes | 225, 77, 0 |
| S5dropd, 90 notes | 226, 74, 40 |
| R1a, 189 notes | 100, 56, 54 |
| R1b, 70 notes | 90, 65, 64 |
| R1c, 148 notes | 135, 119, 119 |

**tabsynth 1.0.6** ([link](https://pypi.org/project/tabsynth/)). A Python package whose PyPI summary reads `Convert musical events to playable guitar tablature via DP optimization`. It gives each possible position a cost for hand position, string changes, stretch and barres, where one finger holds down several strings. Then it picks the path through them with the lowest total cost by dynamic programming, a method that finds that total one step at a time. It matches chords against 63 built-in chord shapes. PyPI lists no author or project page for it.

- In: the exact notes of the 8 clips, turned into tabsynth's Python events in Hz and seconds (it has no file reader), in two modes: `notes`, each note on its own, and `groups`, notes starting within 30 ms as one chord, the way its own demo, `demo-mixed`, does. Also Basic Pitch's notes.
- Command or settings: `tabsynth.pipeline.events_to_tablature(events, output_format="ascii"|"json", max_fret=15, tolerance_cents=50)`, and once with `max_fret=5` on R1b.
- Out: a list of states in JSON (`start`, `duration`, `strings`, `frets`, `chord_id` and more) or ASCII tab, which is tab typed as plain text. In `notes` mode, on the known string and fret: S1 50 of 62, S2n 68 of 90, S3 147 of 182, R1a 109 of 189, R1b 55 of 70, R1c 115 of 148 (e0370, e0373, e0377, e0384, e0386, e0388).
  - In `groups` mode a chord becomes a whole chord shape from its list. The G2 and G3 that open S2n came out as a six-note `Em7_open`, so S2n gave 238 tab notes for 90 played, 54 of them on the known string and fret (e0375). R1c gave 238 out and 76 of 148 (e0390).
  - It drops notes it has no position for, without a message. In `notes` mode it dropped the 4 D2 notes of S5dropd and put 50 of 90 on the known string and fret. With `max_fret=5` it dropped 1 note of R1b and put 32 of 70 there (e0382, e0394).
  - S5capo2: 0 of 90 with no capo given (e0380). With the notes moved down 2 semitones and the frets read from capo 2, 68 of 90, the same positions as for S2n (e0392).
  - On Basic Pitch's notes in `notes` mode: S2n 71 of 90 from 132 notes out, R1c 81 of 148 (e0665, e0730).
  - The first state of S2n in `groups` mode:

  ```text
  {"index": 0, "start": 2.142856, "duration": 0.5256693625, "kind": "chord", "strings": [1, 2, 3, 4, 5, 6], "frets": {"1": 0, "2": 0, "3": 0, "4": 0, "5": 2, "6": 0}, "mean_fret": 0.33, "min_fret": 0, "max_fret": 2, "requires_barre": false, "chord_id": "Em7_open"}
  ```

- Time: shared, 8.73 s wall for all 19 runs, 37.0 MB peak (r0186). Its own time per clip wasn't logged.
- Takes as a hint: `max_fret`, `tolerance_cents` and `templates`. `tolerance_cents` is how far off pitch a note may be, and it wasn't varied. `templates` is the list of chord shapes. No tuning or capo. Standard tuning is used whenever no fretboard is passed, and its pipeline passes none.
- Hands off to: nothing downstream was tried. A transcriber's notes come as MIDI numbers, so they need turning into Hz first.

**tayuya 0.0.4** ([link](https://github.com/vipul-sharma20/tayuya)). Vipul Sharma's Python library from 2019 that turns one MIDI track into tab. It detects the key, then puts each note at the spot in a fixed table nearest the previous note's fret. Its README says `Works only for guitar solos. Implementation for determination and rendering of chords is not done yet.` and `Works only for standard tuning (E A D G B E)`.

- In: the exact notes of the 8 clips, and Basic Pitch's notes.
- Command or settings: as its README shows, `MIDIParser(path, track=0)`, then `Tabs(notes=mid.notes_played(), key=mid.get_key()).generate_notes()` and `render_tabs()`. It returns no times, so my agents' script gave each returned note the start of the matching MIDI note.
- Out: a list of `(note name, string, fret)` and ASCII tab. On the known string and fret: S1 0 of 62, S2n 14 of 90, S3 33 of 182, R1a 79 of 189, R1b 29 of 70, R1c 26 of 148 (e0124, e0125, e0127, e0135, e0137, e0139).
  - Its position table has no fret 0, so it never writes an open string (a string played with no finger on it). The known tabs have open strings for 16 of S1's 62 notes, 40 of S2n's 90, 100 of S3's 182 and 49 of R1c's 148.
  - Notes below its table are looked up an octave higher but keep their name, so the position it gives sounds an octave above the note it names. It placed E2 where E3 sounds, 7 times in R1c and 6 times in S3, and D2 at string 6 fret 10, 4 times in S5dropd.
  - On Basic Pitch's notes it counted the velocity-0 `note_on` messages that mean note-off as notes, so twice as many came out (128 for the 64 notes Basic Pitch wrote for S1). It stopped with `UnboundLocalError: cannot access local variable 'note_info' where it is not associated with a value` on S2n, S5dropd and R1c, whose files hold notes above D6, the top of its table.
  - The first 10 entries for S2n:

  ```text
  ('G3', 5, 10), ('G2', 6, 3), ('G3', 5, 10), ('D3', 6, 10), ('D4', 4, 12), ('G2', 6, 3), ('D4', 4, 12), ('D3', 6, 10), ('E4', 3, 9), ('C3', 6, 8)
  ```

- Time: on 2 cores, 7.35 s wall for all 9 runs with Python start-ups, 72.6 MB peak, after 459.5 s waiting for a slot. Inside tayuya, 0.02 to 0.06 s per clip (r0117).
- Takes as a hint: none. A capo can only be given by moving the notes down, and on S5capo2 that gave the same 14 of 90 as S2n (e0131).
- Hands off to: nothing downstream. Its output has no times.

**tutts 0.1.0** ([link](https://github.com/madisonrickert/tutts)). Madison Rickert's TypeScript port of tuttut, on npm. Its npm description reads `Renderer-neutral MIDI to guitar-tab fingering engine (TypeScript port of tuttut).` Its README says `The core is pure (zero runtime dependencies), ESM-only`. My agents ran it in Node, and installing it with npm printed `added 1 package`.

- In: the exact notes of the 8 clips, turned into its note format `{midi, startBeats, durationBeats}` because it has no file reader, and Basic Pitch's notes.
- Command or settings: `generateTab({notes, tuning: new Tuning([names thin->thick], nfrets), tempo, timeSignatures, quantizeGrid?})` from `scripts/run_tutts.mjs`. Variations: `new Tuning(["E4","B3","G3","D3","A2","D2"], 20)` for Drop D, a tuning 2 semitones higher with 18 frets for capo 2, and `quantizeGrid: "1/16"` on R1c.
- Out: `tab.data` JSON, where each note has its string, fret, MIDI pitch and length in beats, and ASCII from `toAscii`. On the exact notes it matched tuttut 0.0.7 note for note on all 8 clips and on the capo and Drop D runs. On the known string and fret: S1 62 of 62, S2n 90 of 90, S3 182 of 182, R1a 100 of 189, R1b 31 of 70, R1c 120 of 148 (e0401 to e0403, e0406 to e0408).
  - S5capo2: 0 of 90 with no capo given, 90 of 90 with the raised tuning (e0404, e0409).
  - S5dropd: in standard tuning it wrote the 4 D2 notes an octave up, 72 of 90. With Drop D, 88 of 90 (e0405, e0410).
  - With `quantizeGrid: "1/16"` on R1c, 145 of 148 notes came out, because three grid points each got two B3s and it keeps each pitch once per chord. 114 were on the known string and fret (e0411).
  - On Basic Pitch's notes: S2n 89 of 90, R1c 93 of 148, with the tuning raised for capo 2, 90 of 90, and with the Drop D tuning, 86 of 90 (e0661, e0728, e0735, e0737). On S3, two chords it couldn't finger held 14 notes, and it wrote none of them.
- Time: shared, 7.59 s wall for 11 runs with Python and Node start-ups, 62.1 MB peak (r0205). The checking agent's re-run printed 151.6 ms for `generateTab` on R1c with the grid and 43.6 ms on S5dropd with Drop D (r0469).
- Takes as a hint: `tuning`, any set of strings with a fret count, `nfrets`. Also `quantizeGrid`, `tempo`, `timeSignatures` and `weights`. `tempo` only adds a `seconds` field. No capo, hand span, position or pinned note.
- Hands off to: its README calls `tab.data` `the renderer-neutral result`, meant for `a thin adapter` to a tab renderer, and the repository has a `packages/alphatab` folder. Not tried here.

**tuttut 0.0.7** ([link](https://github.com/natecdr/tuttut)). Nathan Candre's Python package that turns a MIDI file into tab. Its README describes the method as a hidden Markov model decoded with the Viterbi algorithm. That picks one fingering for each note or chord across the whole piece, using a difficulty measure. The README also says `It can handle any tuning for any number of strings, and will do the arrangement accordingly.`

- In: the exact notes of S1, S2n, S3, S5capo2, S5dropd, R1a, R1b and R1c. Also Basic Pitch's notes for the same clips and for R3a, R3b and R3c, and the Riley et al. models' notes.
- Command or settings: `tuttut-cli <song>.mid <output_dir>` always uses standard tuning, so my agents' script `scripts/run_tuttut.py` called the library, `Tuning(strings=[note names, thinnest first], nfrets=20)` and `Tab(...)`, then `to_ascii()` and `to_json()`. Variations: the tuning `E4 B3 G3 D3 A2 D2` for Drop D, `F#4 C#4 A3 E3 B2 F#2` with 18 frets for capo 2, `nfrets` 12 on R1c and 3 on S2n, and the module constant `MAX_FRET_SPAN` (the widest hand stretch, default 5) at 3, 6 and 7 on R1c.
- Out: ASCII tab, one line per string, and JSON with each note's string, fret and time in seconds, but no MIDI pitch or length. On the known string and fret: S1 62 of 62, S2n 90 of 90, S3 182 of 182, R1a 100 of 189, R1b 31 of 70, R1c 120 of 148 (e0042 to e0044, e0049, e0050, e0052).
  - S5capo2: 0 of 90 with no capo given, with 54 on the known string at the same fret counted from the top of the neck. With the raised tuning, 90 of 90 (e0045, e0046).
  - S5dropd: in standard tuning it moved the 4 D2 notes up an octave, 72 of 90. With Drop D, 88 of 90. The other two are G3s written at string 4 fret 5 instead of the open third string (e0047, e0048).
  - `nfrets` 12 and `MAX_FRET_SPAN` 3 and 6 gave the same notes as the default on R1c. At 7 it stopped with `AssertionError` at `assert 0 <= span <= 1`.
  - On Basic Pitch's notes: S2n 89 of 90, R1c 93 of 148, with the tuning raised for capo 2, 90 of 90, and with the Drop D tuning, 86 of 90 (e0658, e0727, e0732, e0733). It moved notes outside the guitar's range by octaves, so the C1 Basic Pitch wrote in S2n came out as C3, and it left out notes of chords it couldn't finger. On S3, of the 14 notes in two such chords it kept 3.
  - On the real videos, which have no known answer: all 105 notes of R3a, 31 of them on open strings, highest fret 10 (r0301). The same string and fret as LilyPond for all 129 notes of R3b and for 84 of R3c's 87 (r0479).
  - Its README says `Slides, Hammer-on, Pull-offs and other advanced techniques are not modeled.`
  - The start of its S2n tab:

  ```text
  E |||--------------------|0----0--------------|
  B |||----------3----3----|----------3---------|
  G |||0----0--------------|--------------------|
  D |||-----0---------0----|-----2---------0----|
  A |||--------------------|3-------------------|
  E |||3---------3---------|----------3---------|
  ```

- Time: on 2 cores, 3.74 s wall for 15 runs including 15 Python start-ups, 37.1 MB peak (r0048). S2n on its own took 0.37 s and 40.5 MB (r0027). Inside the script, 0.01 to 0.10 s per run.
- Takes as a hint: tuning and fret count (`Tuning(strings, nfrets)`, from Python only), the hand-span constant and difficulty weights. No capo setting, no preferred position and no way to pin a note to a string.
- Hands off to: its string and fret lists went through PyGuitarPro into `.gp5` files (above).

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

The list has 95 entries: 78 tools, models, papers, apps and services, and 17 datasets. Besides the 13 above, here's each one and why it didn't run. Where my agents wrote steps for me to try it myself, the line gives the section number in `for-aaron.md` in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/guitar-tab). A number after arXiv is the paper's id on arXiv, a site for research papers. Several lines go back to one event. By the trial agent's account, Claude's permission system twice refused to install code straight from a GitHub repository. The first time was Riley et al.'s own command and the second was Guitab. The message was `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]`. After that no tool that installs only that way was tried, until an agent in a later round, the gap agent, tried gtrsnipe and got the same message, by its own account. No log of the refusals was kept, so they're not verified.

- **A Graph Engine for Guitar Chord-Tone Soloing Education** (arXiv 2510.19666): read as a title only. No steps.
- **Algomus bend-prediction and rhythm-guitar-detection repositories**: linked next to the chord-diagram code, not examined. No steps.
- **alphaTab**: not run in this part of the research. It's covered in the section on showing tab in the browser. No steps.
- **AnthemScore**: a commercial app, a pointer only, covered in the apps part of the research. No steps.
- **Asmar, Séoud and Bilodeau's RGB-D video work** (Polytechnique Montréal): RGB-D means color video plus depth. It's known only from search-result summaries, because `publications.polymtl.ca` reset the connection. Not verified. No steps.
- **audio2chart** (arXiv 2511.03337): read as a title only. It makes Guitar Hero charts, not tab. No steps.
- **Audio2Tab** (Jackson Loth): no trained model found. Its README's checkpoint section reads `We will host a checkpoint here soon!` No steps.
- **Basic Pitch 0.4.0**: this part's own run waited about 19 minutes for a CPU slot and was cancelled once the audio-to-notes part's MIDI files existed, so it made nothing. Those files were used instead (above). No steps.
- **`Beat This!`**: not run in this part of the research, where it's only the beat tracker inside Guitab, which didn't run. My chord and beat agents ran `Beat This!` 1.1.0 on its own (r0397). No steps.
- **Chieppa, Brutti and Paiva** (IEEE Access 2025): no code or data link in the paper. No steps.
- **CrispASR's `--tab` mode**: named on a model card, not examined. No steps.
- **DadaGP encoder and decoder** (`dadagp.py`): no run recorded. No steps.
- **Enumerating Left Hand Forms for Guitar Tablatures** (Gen Hori, TENOR 2023): read as a title only, code not checked. No steps.
- **Exploring Procedural Data Generation for Automatic Acoustic Guitar Fingerpicking Transcription** (Murgul and Heizmann): its linked repository was empty. No steps.
- **Expressive Guitar Synthesis via Controllable Latent Flow Matching** (arXiv 2610.36786): read as a title only. No steps.
- **Fretiq** (arXiv 2607.18303): no code found. No steps.
- **FretNet**: no trained model found. Its example loads `model-2000.pt` from a `Downloads` folder, a file neither the README nor the repository links to. Whether one is published elsewhere wasn't verified. No steps.
- **FretPath** (a plugin for MuseScore Studio 4.4 or later): it runs inside MuseScore Studio, and the box has MuseScore 3.2.3. Steps for me: section 5, including a step that marks one note with a string number. Its README says it `respects existing finger-number and string-number annotations as hard constraints`.
- **Fretting-Transformer** (ICMC 2025): no code or model found in the paper or by web search. No steps.
- **From MIDI to Rich Tablatures** (Bontempi et al.): no code found. The authors ran it in IBM's CPLEX optimizer. No steps.
- **gtrsnipe 0.8.3**: not on PyPI, and its README installs it from a GitHub clone with `pip install -e .`. The gap agent tried to install it straight from its repository, and the permission system refused with the message above, by that agent's account. Steps for me: section 4, including a step where I move one note to another string by hand and run the tab through gtrsnipe again with the default settings, `--no-refinger` and `--refinger`.
- **GuiFiR** (IEEE Access 2026): its repository holds dataset preparation only, no model code or weights. No steps.
- **Guitab 1.2.0** (its README says it turns a recording of a solo guitar into a `.gp5` tab, with a `--capo N` option): installing it from its GitHub clone was refused, and the `guitab` on PyPI is a different project. Its browser page was fetched but not run. Steps for me: section 1, in the browser or installed.
- **Guitar Chord Diagram Suggestion** (d'Hooge et al., SMC 2024): added when the survey was checked, no run recorded. No steps.
- **Guitar Pro 8**: a commercial desktop app, not run. No steps.
- **Guitar-Transcription-CNN-MTL**: its weights are published under MIT, as six copies of the model, each tested on one GuitarSet player. The model code lives in its GitHub repository, which would have had to be installed. Its README runs the copies one at a time over prepared GuitarSet features, not on one file. Section 3 says so, with no run steps.
- **guitar-transcription-with-inhibition**: no trained model found. Its README trains one. No steps.
- **GuitarFlow** (arXiv 2510.21872): read as a title only. It goes from tab to audio. No steps.
- **GuitarTab** (Hsu et al.): no trained model found. Its README loads `outputs/<exp_dir>/best_model.pt` from your own training run. No steps.
- **hf_midi_transcription**, Riley et al.'s own command: not on PyPI, although its README says `pip install hf-midi-transcription`, and installing the clone was refused. Their models ran another way (above). Steps for me: section 2.
- **@hidechae/eztab-mcp** (npm): found in a search, not examined. No steps.
- **IBM ILOG CPLEX Optimization Studio**: named only as the solver Bontempi et al. used. No steps.
- **Joint Transcription of Acoustic Guitar Strumming Directions and Chords** (ISMIR 2025): no code link in the paper. No steps.
- **keyjockey** (npm): found in a search, not examined. No steps.
- **kk9293/guitar-tab-omr, guitar-tab-transformer and vldsavelyev/guitar_tab_gpt2** (Hugging Face models): found in a search, not examined. No steps.
- **Klangio API**: a hosted service, a pointer only, covered in the hosted services part. No steps.
- **Klangio Guitar2Tabs**: a commercial app, a pointer only. No steps.
- **MIDI-to-Tab** (ISMIR 2024): no code found. No steps.
- **midi2tab_Deconvolutions**: no trained model in its repository. No steps.
- **MuseScore**: version 3.2.3 is on the box, but no command-line conversion that picks strings was tried here. It ran from the command line on Guitar Pro and MusicXML files in the section on showing a tab in the browser (r0120). Steps for me: section 5, in MuseScore 4 with the FretPath plugin.
- **Music.AI**: a hosted service, a pointer only. No steps.
- **music21 10.5.2's tablature module**: it maps strings and frets to pitches, not the other way round, and `getFretNotesFromFigure()` is a stub, an empty placeholder that returns nothing, so there was nothing to run. No steps.
- **Noise2Fret**: its weights are published under CC BY 4.0 on Zenodo, a site that stores research data. Its README's only way to run them is through its training scripts over prepared dataset folders. That means running the repository's own code, which wasn't tried after the refusals. Section 3 has no run steps, only a question for the authors.
- **Note-level Automatic Guitar Transcription Using Attention Mechanism** (EUSIPCO 2022): a search result, not examined. No steps.
- **Note2Tabs**: a commercial app, a pointer only. No steps.
- **nylon-amt**: no trained model in its repository. No steps.
- **openai/whisper-small**: Audio2Tab's base model, not run. No steps.
- **Paleari, Huet, Schutz and Slock** (2008): no code in the paper. No steps.
- **PolyMap** (arXiv 2608.27522): read as a title only. No steps.
- **polytab**: a search result, not examined. No steps.
- **Rhythm Guitar Tablature Continuation through Picking Pattern Generation**: its data record is restricted, not run. No steps.
- **Songscription**: a commercial app, a pointer only. No steps.
- **Songsterr**: a commercial app, a pointer only. No steps.
- **string-fingerings** (npm): found in a search, not examined. No steps.
- **STRUM** (arXiv 2605.12135): read as a title only. It makes rhythm-game charts. No steps.
- **Synchronize Dual Hands for Physics-Based Dexterous Guitar Playing** (SIGGRAPH Asia 2024): it goes the other way, from tab to simulated hand motion. No steps.
- **TabCNN, the original code** (ISMIR 2019): no trained model in its repository, which trains one on GuitarSet, and it wasn't trained here on the CPU box. Copies of TabCNN trained by other people did run (above). No steps.
- **Taming the Shotgun** (a bachelor thesis in Swedish, Lund University, 2026): no code or data link in its PDF or on its record page. Its method runs Basic Pitch with its shortest note lowered to 40 ms, filters the notes by rules, then picks a string and fret for each. No steps.
- **TapToTab**: no code link found. No steps.
- **TART**: no code or model link in either paper. No steps.
- **Tone-informed Transformer and EGDB-PG** (Chen et al.): no code link on the project page. No steps.
- **TPMNet**: a search result, not examined. No steps.
- **Transcribing Rhythmic Patterns of the Guitar Track in Polyphonic Music**: read as a title only. No steps.
- **TuxGuitar 1.5.6**, its own string choice: on the box, but the program wasn't opened and no conversion that picks strings was tried here. Its file plugins ran in the section on showing a tab in the browser (r0221). Steps for me: section 5.
- **Velocity Prediction in Automatic Guitar Transcription** (EUSIPCO 2026): no code link in the paper. No steps.
- **Visual Guitar Tab Comparison**: an interface for comparing tabs, not a transcriber. No steps.
- **The 17 datasets** (AnimeTAB, Chordonomicon, DadaGP, EGDB, EGFxSet, EGSet12, François Leduc, GAPS, GOAT, Guitar-TECHS, guitar_style_dataset, GuitarDuets, GuitarSet, IDMT-SMT-Guitar, mySongBook, SCORE-SET, SynthTab): data, not tools, so there's nothing to run. GuitarSet supplied R1a, R1b and R1c. No steps.

</details>

<details><summary>Licenses of the tools that ran</summary>

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| amt-tools 0.3.2 | MIT | none | none |
| cstr/tabcnn-onnx | MIT by the export scripts' repository, whose LICENSE begins `MIT License / Copyright (c) 2024-2026 CrispStrobe` ([repository](https://github.com/CrispStrobe/onnx_runtime_dart)) | `license: cc-by-4.0` on the model card ([card](https://huggingface.co/cstr/tabcnn-onnx/raw/main/README.md)) and on the GGUF card. The export README says `Derived weights redistributable **with attribution**.` | `tabcnn.onnx`: GuitarSet. The card says `Vanilla: trained here on **GuitarSet** (CC BY 4.0). Attribution to GuitarSet required.`, and the export README names the 1.1.0 record, `cc-by-4.0`. `tabcnn-gpfx.onnx`: the Zenodo file's data, in the TabCNN + GuitarProFX row |
| LilyPond 2.24.3 | GPL-3.0-or-later. Its COPYING begins `GNU GENERAL PUBLIC LICENSE / Version 3, 29 June 2007` ([COPYING](https://gitlab.com/lilypond/lilypond/-/raw/master/COPYING)) | none | none |
| piano-transcription-inference 0.0.6 | MIT, by the PyPI classifier `License :: OSI Approved :: MIT License` ([PyPI](https://pypi.org/pypi/piano-transcription-inference/json)). xavriley's fork has no LICENSE file | none of its own here | none |
| PyGuitarPro 0.11 | LGPL-3.0-only. Its LICENSE says `This version of the GNU Lesser General Public License incorporates the terms and conditions of version 3 of the GNU General Public License, supplemented by the additional permissions listed below.` ([repository](https://github.com/Perlence/PyGuitarPro)) | none | none |
| Riley et al. guitar models | MIT by the code's README, `This project is licensed under the MIT License - see the LICENSE file for details.`, though no LICENSE file is in the repository ([repository](https://github.com/xavriley/hf_midi_transcription)) | MIT, model card `license: mit` ([card](https://huggingface.co/xavriley/midi-transcription-models/raw/main/README.md)) | `guitar-gaps.pth`: GAPS, `cc-by-nc-sa-4.0` on Zenodo, and its project page says `GAPS may be used only for non-commercial research purposes.` ([GAPS](https://aim-qmul.github.io/GAPS/)). `guitar-fl.pth`: the François Leduc dataset, whose Zenodo record says `For copyright reasons this dataset is made available by request only, for use in research projects.` ([Zenodo](https://zenodo.org/api/records/10984521)). The newer Hugging Face copies of both datasets say `license: mit` |
| scorify 0.4.0 | MIT. Its LICENSE begins `MIT License / Copyright (c) 2026 Aron Homberg`, and its `THIRD-PARTY-LICENSES.txt` lists 9 bundled `@tonaljs/*` modules, each `License: MIT` ([npm](https://registry.npmjs.org/scorify)) | none | none |
| SynthTab TabCNN checkpoints | CC BY 4.0 by the repository's LICENSE file, which begins `Creative Commons Attribution 4.0 International` ([LICENSE](https://raw.githubusercontent.com/yongyizang/SynthTab/main/LICENSE)) | kept in the same repository, whose README says `SynthTab is released with CC BY-NC 4.0 license` ([README](https://raw.githubusercontent.com/yongyizang/SynthTab/main/README.md)), which differs from the LICENSE file. CC BY-NC 4.0 says `NonCommercial means not primarily intended for or directed towards commercial advantage or monetary compensation.` ([legal code](https://creativecommons.org/licenses/by-nc/4.0/legalcode.en)) | SynthTab, rendered from DadaGP tabs, and DadaGP's README asks people to contact its makers `to request access to the dataset for research purposes.` ([DadaGP](https://github.com/dada-bots/dadaGP)). `finetuned/GuitarSet.pt` also GuitarSet, `cc-by-4.0` in version 1.1.0 and `cc-by-nc-4.0` in 1.0.1, and the SynthTab README names no version ([Zenodo](https://zenodo.org/api/records/3371780)) |
| TabCNN + GuitarProFX weights | Its training code's repository is CC0 1.0 at the root, whose LICENSE begins `Creative Commons Legal Code / CC0 1.0 Universal`, and MIT in its AMT-Tools folder, `MIT License / Copyright (c) 2023 Frank Cwitkowitz` ([repository](https://github.com/robust-guitar-tabs/code)). It ran here through amt-tools 0.3.2 | `cc-by-4.0`, the Zenodo record's license id ([Zenodo](https://zenodo.org/api/records/11406378)) | GuitarSet, `cc-by-4.0` in version 1.1.0 and `cc-by-nc-4.0` in 1.0.1, with no version stated. GuitarProFX, DadaGP tracks the authors rendered, and DadaGP's README asks people to contact its makers `to request access to the dataset for research purposes.` The training code's README says `This repository includes 16 Guitar Pro examples. For a full dataset, request access from DadaGP`. EGFxSet's license wasn't read |
| tabsynth 1.0.6 | MIT by its PyPI classifier and its README, `MIT License - see LICENSE file for details.`, though the package holds no LICENSE file ([PyPI](https://pypi.org/pypi/tabsynth/json)) | none | none |
| tayuya 0.0.4 | MIT | none | none |
| tutts 0.1.0 | MIT | none | none |
| tuttut 0.0.7 | MIT | none | none |

For LilyPond and PyGuitarPro, `survey.md` quotes only the opening of the GPL and LGPL texts and says it doesn't interpret the GPL. Every clause with its source, for these and the tools that didn't run, is in `survey.md` in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/guitar-tab).

</details>

## Melody, bass and taps from one guitar

In fingerstyle, one guitar played with the fingers carries the tune, the bass and sometimes body taps, and this step is about telling them apart. My agents listed 52 tools, apps and research projects, and 13 ran on the cloud box. On a clip with 32 drum-kit hits as taps, 23 of 25 onset detector settings found all 53 note and tap starts, and none labeled the taps.

<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/guitar-tab-tools/fingerstyle-voices-taps-s2n-pitch-tracks.webp" alt="Pitch against time over the 29-second clip S2n. Outlined boxes mark the 90 played notes, melody notes in an upper band around C4 and bass notes in a lower band around C3. A blue line labelled Essentia Melodia lies on the melody notes, with gaps. An orange line labelled low-pass + pyin lies on the bass notes, with short bends between notes, a short mark at C2 near 0 seconds and a rise above the bass band after the last note."><figcaption><b>Pitch tracks on S2n</b><span class="ao-meta">Essentia's melody tracker (r0220) and a 150 Hz low-pass plus librosa's pyin (r0235), drawn over the 90 played notes</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/fingerstyle-voices-taps-s6taps-onsets.webp" alt="Six rows of tick marks from 1.8 to 11 seconds of the clip S6taps. The top two rows mark when the 12 taps and the 17 note starts in that stretch were played. The four rows below, for librosa on the percussive part and for aubio hfc, Essentia complex and madmom CNN on the mix, each hold 19 blue ticks, one under every played tap and every note start. Shaded columns mark the 7 note starts with no tap, and every detector row has a tick in each of them."><figcaption><b>Onsets on S6taps, 1.8 to 11 s</b><span class="ao-meta">librosa on the percussive part at margin 4 (r0031), and aubio hfc (r0079), Essentia complex (r0090) and madmom CNNOnsetDetector (r0247) on the mix, under the 12 taps and 17 note starts played in that stretch</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

Thirteen tools, A to Z. Most runs used two clips I synthesized so every note is known. S2n is 29 seconds of a tune over a bass line, and S6taps is the same piece with 32 drum-kit hits standing in for body taps. Times are real elapsed seconds on the shared box. The box had two slots, each two of its four processor cores reserved for one job. Three of my agents' first runs here had a slot (r0031, r0079, r0090). So did four of the later RT1 runs (r0542, r0551, r0554, r0556), four runs of a second round to fill gaps (r0620, r0643, r0670, r0672), three re-runs by the agents that checked the work (r0571, r0706, r0707), and the Demucs and Open-Unmix runs my source-separation agents made on the synthesized clips. The rest ran outside the slots while other agents' jobs shared the box, most of them limited to one thread, one stream of work at a time. A later check found Basic Pitch's command running four threads, two of them on cores it wasn't pinned to (see its entry). A few light runs, the voice-splitting ones among them, had no thread limit. Where the processor (CPU) time differs a lot from the clock time, I give both. Nothing here cost money beyond the cloud session. None of the thirteen takes a capo (a clamp across the strings that raises every note) or a tuning directly. Basic Pitch, Essentia's melody tracker and librosa's pyin take a note range, which a known tuning could set. In a later round to fill gaps, my agents ran librosa, aubio, Essentia, madmom and Demucs on RT1. It's a real 233.5-second recording from archive.org, "With A New Tuning, You Can Fly" by Chris Smuck (2007). It's under CC BY 3.0, a license that lets anyone reuse it with credit. Its keywords are `Acoustic, Tapping, Fingerstyle`. It has no answer key, so its numbers are counts and levels only, and whether it has hits on the guitar body wasn't checked by listening. In a second round to fill gaps, they ran libfmp on S6taps and `eguitar_ircam.ts` on S6taps, S2s and R3c, and ran Basic Pitch again while reading which cores its threads used.

**aubio 0.4.9, Ubuntu package `aubio-tools 0.4.9-4.4build1`** ([link](https://github.com/aubio/aubio)). A C library and command-line tool that marks where sounds start, with eight methods to pick from. It was already on the box.

- In: S6taps, the synthesized fingerstyle clip with 32 drum-kit taps, as `S6taps.mono.wav` (44.1 kHz mono WAV). Later, hfc, complex and specflux ran on RT1 and on R1c, a 28-second excerpt of a real bossa nova accompaniment from the GuitarSet dataset, with its 148 notes annotated. The hfc method alone ran on the sound of R3a, R3b and R3c, three real 18-second nylon-string guitar videos with no answer key.
- Command or settings: `aubioonset -i <wav> -O <method>` for `energy`, `hfc`, `complex`, `phase`, `specdiff`, `kl`, `mkl` and `specflux`, every other setting at its default. The Python front end of the same package didn't start, with `ModuleNotFoundError: No module named 'aubio._aubio'`. The command-line tool worked.
- Out: plain text, one onset time in seconds per line, with nothing saying what kind of sound it is. On S6taps each method returned 53 to 62 onsets, and all eight put one on each of the 53 starts: 27 where a tap and a note start together, 21 notes with no tap and 5 taps with no note. The others landed on neither a note nor a tap: 1 for complex, 6 for energy, 0 for hfc, 9 for kl, 1 for mkl, 7 for phase, 1 for specdiff and 5 for specflux. On R1c, hfc returned 101 onsets with 58 of the 139 distinct note starts within 50 ms, complex 104 with 60 and specflux 180 with 66. On R3a, R3b and R3c, hfc returned 61, 87 and 47 onsets. On RT1, hfc returned 1,112, complex 558 and specflux 1,349. The first three from hfc on S6taps, where a tap and a note start at 2.143 s and at 2.679 s and a note with no tap starts at 3.214 s:

  ```text
  2.148254
  2.681905
  3.223061
  ```

- Time: 0.93 s for all eight methods on 2 cores, peak memory 35.1 MB (r0079). On RT1, six detectors from aubio, madmom and Essentia took 13.99 s together on 2 cores, peak 983.2 MB (r0542).
- Takes as a hint: `-t` threshold, `-M` minimum gap between onsets, `-s` silence level, `-B` and `-H` buffer and hop size. Nothing musical, so no tuning, capo or tempo.
- Hands off to: a list of seconds. The Inverse Drum Machine documents an input that takes onset times per drum class (`onsets={'KD': [...], 'SD': [...], ...}`), not run.

**Basic Pitch 0.4.0, ONNX model** ([link](https://github.com/spotify/basic-pitch)). An audio-to-notes transcriber that writes MIDI (a list of notes with start times and pitches), run here with the model file that ships in the package in the ONNX format, an open file format for trained models. It's the tool my audio-to-notes agents used, run here to feed the voice splitters.

- In: S2n, S2s (the same notes on a steel-string guitar sound), S6taps and S5dropd (the same piece in Drop D, a tuning with the lowest string lowered to D) as mono WAVs, plus the sound of R3a.
- Command or settings: `basic-pitch --model-serialization onnx --save-midi --save-note-events <out> S2n.mono.wav S2s.mono.wav S6taps.mono.wav S5dropd.mono.wav R3a.mono.wav`, defaults otherwise. A second run on the four synthesized clips added a note range for standard tuning, `--minimum-frequency 77.78 --maximum-frequency 1396.91` (D#2 to F6).
- Out: a MIDI file with pitch bends and a CSV (a plain-text table) per clip, header `start_time_s,end_time_s,pitch_midi,velocity,pitch_bend`, rows not in time order. It wrote 137 notes for S2n, 201 for S2s, 196 for S6taps, 130 for S5dropd and 106 for R3a. These are from the mono files. On the stereo files my audio-to-notes agents got 199 notes for S2s and 105 for R3a (r0234). On each synthesized clip all 90 played notes were among them (start within 50 ms, pitch within half a semitone), so 47, 111, 106 and 40 of its notes matched nothing played. The matched notes started a median 7.5 to 9.2 ms late. On S2n its pitches ran from MIDI note 23 to 87, where the piece spans 43 to 64. MIDI note numbers go up by one per semitone, one fret. With the standard-tuning range, S5dropd came out with 125 notes and 86 of the 90 played ones. The four not among them were the four D2 bass notes Drop D adds (at 8.571, 13.929, 18.214 and 25.714 s), which the run without a range had found. The first S2n notes in time order, as my agents listed them, with start and end in seconds, MIDI pitch and velocity (how hard the note is played):

  ```text
  0.012-0.151 23 49 (inside the silent count-in), 2.149-2.683 55 93, 2.161-2.927 43 71, 2.683-3.217 55 98, 2.683-3.217 50 98, 2.695-2.939 83 40, 3.217-3.391 67 43, 3.217-3.763 62 71
  ```

- Time: 74.95 s for the five clips, started outside the slots with `taskset -c 1` to pin it to one core, 28.2 s of CPU, peak 393.9 MB (r0252). The verifier, one of the agents that checked every run, re-ran it in 33.63 s (r0416). The run with the range took 29.81 s for four clips (r0325). In the second round to fill gaps, my agents ran r0252's command again (r0673, 13.14 s) while a separate script read which cores each of its threads was allowed on. The process was held to core 1, but two of its four threads were set to core 2 and core 3 instead, and spent 5.64 of its 12.4 s of CPU there. The verifier's two re-runs of that command also had threads on cores 2 and 3 (r0710, r0712). So r0252, r0325 and r0416, started the same way and not watched, aren't one-core timings. ONNX Runtime, the library that runs the model, says in its documentation that a session with no thread count gets `extra threads per additional physical core`, each `affinitized to that core`, and the box has 4 physical cores. Which library started the two threads wasn't read. With no thread variables set, the same command took 25.69 s (r0668). In a 2-core slot, with ONNX Runtime's thread count set to 2 by a wrapper my agents wrote, `scripts/gap2_basicpitch_ort_threads.py`, every thread stayed on the slot's two cores (r0670, 5.95 s, 8.2 s of CPU). In a slot on cores 0 and 1 with the defaults, three of its six threads were set to core 1, core 2 and core 3, one each, and 2.31 of its 10.2 s of CPU went to cores 2 and 3 (r0672, 5.15 s). All four of these runs wrote files byte-identical to r0252's. The box's load differed each time.
- Takes as a hint: `--minimum-frequency` and `--maximum-frequency` in Hz, a note range. The range set for standard tuning dropped the notes Drop D adds.
- Hands off to: its CSV went into partitura and music21 (below). Its S2n and S5dropd notes were also rewritten as MIDI for MidiBERT-Piano, which didn't run (r0656). After the install, the command-line tool first stopped with `ModuleNotFoundError: No module named 'pkg_resources'`, and it ran once `setuptools<81` was installed (my trial agent's note, not reproduced by the verifier). My audio-to-notes agents' first runs, r0033 among them, stopped with `File .../nmp.tflite cannot be loaded into either TensorFlow, CoreML, TFLite or ONNX`.

**Demucs 4.1.0, models htdemucs and htdemucs_6s** ([link](https://github.com/adefossez/demucs)). A source separator. It splits a recording into stems (one instrument's track each), drums, bass, other and vocals, and htdemucs_6s adds guitar and piano. My source-separation agents ran it on the synthesized clips, and my agents here checked their stems and ran it on the three real videos.

- In: S2s and S6taps as stereo WAVs. R3a, R3b and R3c as stereo WAVs. RT1 as a stereo WAV.
- Command or settings: `demucs -n htdemucs -d cpu` and `demucs -n htdemucs_6s -d cpu` on S2s and S6taps. On the real clips, `demucs -n htdemucs_6s -d cpu -j 1 -o <out> R3a.wav R3b.wav R3c.wav` and the same with `-n htdemucs`. On RT1, `demucs -n htdemucs_6s -d cpu -o <out> RT1.wav` and the same with `-n htdemucs`.
- Out: one 44.1 kHz stereo WAV per stem. On S6taps, librosa's onset detector on the htdemucs_6s drums stem returned 32 onsets, one on each of the 32 taps (27 with a note, 5 alone) and none on the 21 notes with no tap. On the htdemucs drums stem it returned 34, on 31 of the 32 taps, on no note without a tap and 3 on neither. Against the true taps track, the drums stem measured 5.67 dB with htdemucs and 6.98 dB with htdemucs_6s. That's SI-SDR, a figure that weighs the part of a stem matching the true track against everything else in it. A higher number means less of anything else. My agents also measured the spectral centroid, where a sound's energy sits on average in Hz, over the 50 ms after each onset on the htdemucs_6s stem. It ran from 233 to 817 Hz for the 8 bass-drum thumps and from 3,715 to 5,079 Hz for the 24 side-stick slaps. On this clip the two ranges didn't overlap. It's a measurement, not a classifier. On S2s and S6taps the bass stems were 58 to 63 dB below the mix, and against the bass part alone (rendered by my agents from the clip's own MIDI) they measured -17.03 to -6.54 dB SI-SDR. htdemucs put 0.998 (S2s) and 0.961 (S6taps) of the mix's energy into `other`, and htdemucs_6s put 0.826 and 0.623 into `piano` and 0.0041 and 0.0217 into `guitar`. On the real clips, where no body taps were seen in the video frames, htdemucs_6s put the guitar into `guitar` (0.1 to 0.3 dB below the mix). Their bass stems were 16.2 dB (htdemucs_6s) and 15.1 dB (htdemucs) below the mix on R3b, and 50.5 to 71.5 dB below on R3a and R3c. Their drums stems were 42 to 65 dB below the mix, and librosa's onset detector returned 55 to 226 onsets on them. By default, `normalize=True`, it scales its onset curve to run from 0 to 1 before picking peaks. A minimum loudness for an onset wasn't tested. Demucs shifts the audio by a random amount by default (`--shifts` defaults to 1), so runs differ. On R3a's htdemucs_6s drums stem the onset count was 226, 180 and 208 in three runs. On RT1, htdemucs_6s put -2.5 dB of the mix into `other`, -8.1 dB into `guitar`, -13.8 dB into `bass` and -40.0 dB into `drums` (r0554), and librosa returned 351 onsets on its drums stem. The verifier ran the same command again (r0571). That run put -2.6 dB into `other`, -7.7 dB into `guitar`, -13.5 dB into `bass` and -37.3 dB into `drums`, and librosa returned 23 onsets on its drums stem. htdemucs put -0.2 dB into `other`, -17.6 dB into `bass` and -41.4 dB into `drums`, with 1,078 onsets on its drums stem (r0556). That run wasn't repeated. My agents also took the peaks of each drums stem, at least 1 s apart. On the first htdemucs_6s stem, 5 of 181 were above -40 dBFS, a level 40 dB below the loudest a file can hold, at 0:31.8, 1:05.8, 1:08.4, 1:10.4 and 3:25.8. On the second, 7 of 180 were, at 0:31.8, 1:05.8, 1:08.3, 1:10.4, 2:00.8, 2:18.8 and 3:25.8, and each of the first run's five times was within 0.07 s of one of these seven. On the htdemucs stem 1 of 181 was, at 0:49.9. The two models' loudest moments came at different times. How far these figures move beyond those runs wasn't checked, and what sound is at those times wasn't checked by listening.
- Time: on 2 cores, S6taps took 45.63 s with htdemucs (peak 1,199.7 MB, r0053) and 29.74 s with htdemucs_6s (1,292.5 MB, r0054). S2s took 36.81 s (1,240.4 MB, r0060) and 73.43 s (1,317.2 MB, r0099). The three 18-second real clips together, pinned to one core outside the slots, took 139.41 s with htdemucs_6s (74.2 s of CPU, peak 1,354.1 MB, r0327) and 126.16 s with htdemucs (r0330). The verifier's re-run on R3a alone took 30.36 s (r0420). RT1, 233.5 s long, took 173.64 s with htdemucs_6s (261.5 s of CPU, peak 2,142.2 MB, r0554) and 171.41 s with htdemucs (r0556), each on 2 cores. The verifier's second htdemucs_6s run took 137.4 s (r0571).
- Takes as a hint: `-n` model, `-d` device, `-j` jobs, `--shifts`. Nothing musical.
- Hands off to: the drums stem, loaded as mono, went into `librosa.onset.onset_detect` (run). The guitar stem is an audio file that librosa's harmonic-percussive split and the onset detectors take (not run here).

**`eguitar_ircam.ts`, Hugging Face `nbrochec/ipt_models` at `2fdaf42`** ([link](https://huggingface.co/nbrochec/ipt_models)). IRCAM's trained model, a 14,090,320-byte file, that takes 896 ms of sound and returns a value for each of 14 electric-guitar playing techniques. They include `palmstrike`, `scratch`, `legato` and `bottleneck`, and none of the 14 is a hit on the guitar body. It was trained on the EG-IPT dataset, `isolated single-note performances` on an electric guitar. It's the model that ipt~ (an add-on for the music program Max/MSP), the C library libipt and the IPT Vamp plugin run. Those three weren't built or run here. In the second round to fill gaps, my agents loaded the file in Python with `torch.jit.load` under torch 2.15.0+cpu, the processor-only build of PyTorch, a Python library for trained models. The model's own documents don't describe loading it that way.

- In: S6taps, S2s (the same notes with no taps) and the sound of R3c, a real nylon-string guitar lesson video with no answer key, as mono WAVs resampled from 44,100 to 8,000 Hz, the model's rate.
- Command or settings: `scripts/gap2_ipt_classify.py`, windows of 7,168 samples (896 ms) ending every 0.1 s from 0.896 s on, all of a clip's windows in one batch, then softmax, which turns the model's 14 raw outputs into probabilities that add up to 1. libipt's energy gate, a loudness threshold, and a host's smoothing over time weren't applied. The session's permission policy didn't stop the `torch.jit.load` call.
- Out: for each window, the 14 probabilities and the top class, one CSV row per window. The top classes in S6taps' 285 windows were bottleneck 214, scratch 27, palmstrike 26, legato 17 and sustained 1. In S2s' 285 they were bottleneck 216, legato 24, palmstrike 20, scratch 16, trill 8 and sustained 1. In R3c's 172 they were legato 91, bottleneck 28, trill 19, sustained 12, bend 11, palmstrike 9 and vibrato 2. The 13 windows of the near-silent count-in came out scratch in both S6taps and S2s. The two clips differ only by the taps, and 233 of their 285 windows got the same top class. Of the 52 that differ, 6 have a true tap in their last 0.2 s. Of the 26 S6taps windows with palmstrike on top, 5 do. Over the 64 S6taps windows with a true tap in their last 0.2 s, the mean probability was 0.0642 for palmstrike and 0.019 for scratch, against 0.1008 and 0.0659 over the other 208 windows at or above -60 dBFS. No clip has an answer key for playing techniques, so these are counts only. The header and the two S6taps windows that end just after the first tap and note, at 2.143 s:

  ```text
  t_end_s,rms_dbfs,top_class,top_prob,behind-nut,bend,bottleneck,glissando,legato,muted,palmstrike,scratch,snap-pizz,staccato,sustained,tremolo,trill,vibrato,tap_in_last_0.2s
  2.196,-23.95,sustained,0.9726,0.0142,0.0056,0.0010,0.0001,0.0007,0.0001,0.0008,0.0041,0.0001,0.0000,0.9726,0.0001,0.0002,0.0003,1
  2.296,-20.75,scratch,0.9282,0.0063,0.0009,0.0109,0.0014,0.0028,0.0002,0.0003,0.9282,0.0004,0.0000,0.0358,0.0007,0.0117,0.0006,1
  ```

- Time: 13.41 s on 2 cores for the three clips, 18.1 s of CPU, peak 985.0 MB (r0643). Loading the model took 0.069 s and each window 9.6 to 12.0 ms. The model card gives `3.7 ms (Apple Silicon, CPU, 1 thread)`. The verifier's re-run took 11.82 s (r0707) and wrote the same CSV files byte for byte.
- Takes as a hint: nothing. The model has no settings, and a host picks the window step, the energy gate and the smoothing. Nothing musical.
- Hands off to: the CSV of window probabilities, which nothing downstream took. PyTorch printed two warnings, one saying `torch.jit.load` is deprecated.

**Essentia 2.1-beta6-dev, `essentia==2.1b6.dev1389`** ([link](https://github.com/MTG/essentia)). An open-source C++ audio analysis library with Python bindings, from the Music Technology Group at UPF. Used here for its onset algorithms and its melody tracker, `PredominantPitchMelodia`.

- In: S6taps as `S6taps.mono.wav`, loaded at 44.1 kHz. For the melody tracker, S2n, S2s, S6taps and S5dropd as mono WAVs. `OnsetRate()` also ran on R1c and RT1.
- Command or settings: for onsets, `MonoLoader` at 44.1 kHz, frames of 1024 with hop 512, Hann window, FFT, `CartesianToPolar`, then `OnsetDetection(method=m)` for m in `hfc`, `complex`, `complex_phase`, `flux`, `melflux` and `rms`, each followed by `Onsets()`, plus `OnsetRate()` and `SuperFluxExtractor()` with defaults. For melody, `MonoLoader(sampleRate=44100)` then `EqualLoudness()` then `PredominantPitchMelodia()` with defaults (hop 128 samples, 2.9 ms).
- Out: onset times in seconds, with no label. On S6taps, complex, complex_phase, flux, melflux, rms and `OnsetRate` put an onset on all 53 starts, with 0, 26, 6, 8, 104 and 0 more on neither. hfc returned 52, on every start but one, a tap with no note. `SuperFluxExtractor`, with its default threshold and no other tried, returned 19 onsets on the 29.4-second clip, on 18 of the 53 starts. `OnsetRate` on R1c returned 86 onsets with 64 of the 139 note starts within 50 ms, and 981 on RT1. The melody tracker writes a pitch in Hz per 2.9 ms frame (0 where it hears no melody) and a confidence per frame. Checked on 10 ms slices, it came within half a semitone of the melody in 1,590 of the 2,529 slices where a melody note sounds on S2n (nylon), 2,012 on S2s (steel), 2,008 on S6taps and 1,588 on S5dropd. Against the bass it came within half a semitone in 0 of 2,523 slices on every clip. Essentia has no harmonic-percussive separation (HPSS) algorithm, so the Essentia HPSS item on my agents' starting list had nothing to run.
- Time: the onset runs took 2.12 s for all eight on 2 cores, peak 165.5 MB (r0090). The melody tracker took 10.14 s for the four clips with one thread outside the slots, peak 177.1 MB (r0220). The RT1 run is under aubio (r0542).
- Takes as a hint: `OnsetDetection(method, sampleRate)`, `Onsets(alpha, delay, frameRate, silenceThreshold)`, `SuperFluxExtractor(frameSize, hopSize, threshold, ratioThreshold, combine)`. The melody tracker takes `minFrequency` and `maxFrequency` (a note range), `voicingTolerance`, `guessUnvoiced`, `frameSize`, `hopSize` and `magnitudeThreshold`. No tuning, capo or key input.
- Hands off to: onsets as a list of seconds. The melody tracker's CSV (`time_s,f0_hz,confidence`) went to the checking script, which stopped with `IndexError: index 5654 is out of bounds for axis 0 with size 5654` on S2n while frames with no pitch were empty cells, and worked with 0 Hz in them. The number in that message is each clip's count of frames with a pitch. Its output is a pitch per frame, not a list of notes.

**libfmp 1.3.0** ([link](https://github.com/meinardmueller/libfmp)). The Python library of the FMP notebooks, short for Fundamentals of Music Processing, from the International Audio Laboratories Erlangen. Used here for `hps`, which splits a recording into a sustained (harmonic) part and a part with the sharp attacks (percussive), and `hrps`, which adds a third, residual part. The verifier added it to the list, and my agents ran it in the second round to fill gaps.

- In: S6taps as `S6taps.mono.wav`, loaded at 22,050 Hz the way libfmp's own experiment functions load audio.
- Command or settings: `scripts/gap2_libfmp_hrps.py` with the FMP notebooks' settings, frames of 1,024 samples, one every 256 samples (`N` and `H`), and `L_h` = 0.2 s and `L_p` = 500 Hz (the lengths of its two median filters, one along time and one along frequency). `hps` ran with its default binary mask and with `mask='soft'`. `hrps` ran with the `C8S1_HRPS` notebook's list, beta 1.1, 2, 4 and 32. Beta sets how many times stronger the harmonic or the percussive side has to be for a piece of the sound to go to that part, and the rest goes to the residual. Then librosa's onset detector, with defaults, on each percussive and residual part and on the mix. No answer key used. The verifier found that the function the HRPS notebook calls, `experiment_hrps_parameter`, runs `hrps` with a step of 512 whatever its list says, so these HRPS parts used 256 where the notebook's own used 512.
- Out: float32 mono WAVs at 22,050 Hz, 29.357 s each, harmonic and percussive for `hps` and the residual too for `hrps`. The parts add back up to the mix. The percussive part held 0.041 and 0.045 of the mix's energy with the binary and the soft mask, and 0.038, 0.028, 0.020 and 0.0049 at beta 1.1, 2, 4 and 32, where the residual held 0.0028, 0.032, 0.090 and 0.453. Against the true taps track the percussive parts measured -2.01 dB SI-SDR (binary), -2.64 dB (soft) and -1.83, -1.61, -2.36 and -8.31 dB at beta 1.1, 2, 4 and 32. Against the true guitar track the harmonic parts measured 14.64, 14.62, 14.26, 12.28, 9.65 and 1.24 dB in the same order. librosa's onset detector returned 53 onsets on each of the six percussive parts, one on each of the 53 starts, taps and plain notes alike. On the residual parts it returned 102 at beta 1.1 (on 26 tap-and-note starts, all 21 note-only starts, 4 of the 5 tap-only starts and 51 on neither) and 53 at beta 2, 4 and 32, the same as on the percussive parts. The onsets matched to the 32 taps came a median 11.7 to 23.7 ms late on the percussive parts, against 34.1 ms on the mix at 22,050 Hz and 18.3 ms on the mix at 44.1 kHz (r0031). In the 50 ms after each start, the note-only starts louder than the quietest tap numbered 1, 0, 0, 15, 21 and 21 of 21 in the six percussive parts, in the order above, and 21 of 21 in the residual parts at beta 2 and 32. The first three onsets on the beta 2 percussive part, where a tap and a note start at 2.143 s and at 2.679 s and a note with no tap starts at 3.214 s:

  ```text
  2.159456
  2.693515
  3.227574
  ```

- Time: 34.08 s on 2 cores for all six settings and their onsets, 31.4 s of CPU, peak 612.0 MB (r0620). By the script's own timer each split took 0.95 to 1.10 s, the first 3.69 s. The verifier's re-run took 30.99 s and wrote the same audio and onset lists (r0706).
- Takes as a hint: `N`, `H`, `L_h` and `L_p` (in seconds and Hz, or in frames and bins with `L_unit='indices'`), `mask` for `hps` and `beta` for `hrps`. Nothing musical. `hps(..., mask='soft')` sets `eps = 0.00001` inside the function whatever `eps` is passed.
- Hands off to: the percussive and residual parts went into librosa's onset detector (run). It got a Python environment of its own, since libfmp 1.3.0 asks for music21 below 10.0.0 and the main one held music21 10.5.2.

**libnmfd 1.0.0** ([link](https://github.com/groupmm/libnmfd)). A toolbox from AudioLabs Erlangen for music uses of nonnegative matrix factorization (NMF), with a drum-extraction demo. NMF breaks a spectrogram, a map of how loud each frequency is over time, into a few repeating sound patterns and when each one plays.

- In: S6taps as `S6taps.mono.wav`.
- Command or settings: the package's demo notebook `demo_drum_extraction_kam_nmf_perc_threshold.ipynb`, copied step by step into a script. STFT 2048 with hop 512, `hpss_kam_fitzgerald(num_iter=30, kern_dim=13)`, then `nmfd(num_comp=30, num_iter=60, num_template_frames=1, func_preprocess=drum_specific_soft_constraints_nmf, decay=0.75)`, a percussiveness estimate per component, and every component above 0.25 counted as percussive. No answer key used.
- Out: four float32 mono WAVs, the percussive and harmonic parts after the KAM step (the package's harmonic-percussive split, `hpss_kam_fitzgerald`) and after the NMFD step. 3 of the 30 components came out above the 0.25 line (0.661, 0.510 and 0.370). Against the true taps track the percussive parts measured -1.95 dB SI-SDR (KAM) and -1.81 dB (KAM plus NMFD). librosa's onset detector returned 53 onsets on each percussive part, one on each of the 53 starts, taps and plain notes alike. In the 50 ms after each start, no note-only start was louder than the quietest tap in either part, with gaps of 0.07 dB (KAM) and 0.23 dB (NMF) between the loudest note-only start and the quietest tap.
- Time: 186.68 s with one thread outside the slots on a fully loaded box, 43.3 s of CPU, peak 1,778.8 MB (r0238). The verifier's re-run took 42.47 s, peak 1,780.9 MB (r0415).
- Takes as a hint: KAM `num_iter` and `kern_dim`, NMFD `num_comp`, `num_iter`, `num_template_frames`, `init_W` and `init_H`, `fix_W` and `fix_H` (they keep given templates fixed during the fit), and the percussiveness threshold. Nothing musical.
- Hands off to: the percussive WAV went into librosa's onset detector (run). It pins `numpy<2.0.0` and `pandas<2.0.0`, so it got a Python environment of its own.

**librosa 0.11.0** ([link](https://github.com/librosa/librosa)). A Python library for audio and music analysis. Used here for harmonic-percussive separation (HPSS, which splits a recording into a sustained part and a part with the sharp attacks), its onset detector, and pyin, a pitch tracker that follows one note at a time. Its NMF wrapper is under scikit-learn below.

- In: S6taps as `S6taps.mono.wav` (44.1 kHz mono). S2n and S5dropd as mono audio for the bass. R1c, RT1 and the sound of R3a, R3b and R3c as mono WAVs for onsets. The drums stems from Demucs and Open-Unmix, loaded as mono.
- Command or settings: `librosa.effects.hpss` with `margin` 1, 2, 4, 8 and 16, everything else default, then `librosa.onset.onset_detect(y=..., sr=..., units='time')` with defaults on each percussive part and on the mix. For the bass, a zero-phase 4th-order Butterworth low-pass at 150, 200 or 250 Hz, a filter that turns down everything above that frequency, then `librosa.pyin(fmin=C2 65.4 Hz, fmax=C4 261.6 Hz, frame_length=4096, hop_length=441)`, then a step my agents wrote that turns a run of frames on the same MIDI note, at least 50 ms long, into one note.
- Out: HPSS gives two waveforms the length of the input. On S6taps the onset detector returned 53 onsets at every margin and on the mix, on all 53 starts, so every tap was in the list and so was every note with no tap. Against the true taps track the percussive parts measured 0.37, 3.43, 3.68, 1.89 and -0.64 dB SI-SDR at margins 1, 2, 4, 8 and 16. That's librosa 0.11.0, this lane's version, on the mono file. My source-separation agents' split of the stereo file with librosa 1.0.0 measured 0.34 dB at the default margin, 1. In the 50 ms after each start, no note-only start was louder than the quietest tap in the percussive parts at margins 1, 4 and 16, while in the mix all 21 were. On R1c, 90 onsets with 64 of the 139 note starts within 50 ms. On R3a, R3b and R3c, 81, 112 and 54 onsets on the mix and 86, 138 and 71 on the percussive part (margin 4), which held 0.0009, 0.0005 and 0.0018 of the mix's energy, against 0.022 on S6taps. On RT1, 931 onsets on the mix and 1,231, 1,192 and 946 on the percussive parts at margins 1, 4 and 16, which held 0.0254, 0.0048 and 0.0009 of its energy. pyin writes a pitch per 10 ms frame and a voiced probability. With the 150 Hz low-pass on S2n it came within half a semitone of the bass in 2,018 of the 2,523 slices where a bass note sounds (1,207 at 200 Hz, 984 at 250 Hz). The notes step made 71 notes at every cutoff. At 150 Hz, 11 of the 48 bass notes were among them (start within 50 ms, pitch within half a semitone) and none of the 42 melody notes. At 200 Hz it was 6 bass notes and 4 melody notes, and at 250 Hz 8 bass notes and 4 melody notes. With a 150 ms window, 37 of 48 matched at 150 Hz, a median 80 ms late. On S5dropd at 150 Hz, 1,980 of 2,523 slices and 11 of 48 notes. On S2n the bass is played at 2.143, 2.679, 3.214 and 3.750 s, on MIDI notes 43, 50, 43 and 50. The first notes at 150 Hz, where the first row falls inside the silent count-in:

  ```text
  onset,offset,pitch
  0.1300,0.2400,36
  2.2100,2.6600,43
  2.8000,3.1500,51
  3.2200,3.2700,50
  3.3300,3.7300,43
  3.7900,4.2800,50
  ```

- Time: the HPSS sweep with onsets took 39.91 s on 2 cores for all five margins, start-up included, peak 651.6 MB (r0031). pyin with the three cutoffs took 103.91 s on S2n (r0235) and 101.22 s on S5dropd (r0233) with one thread on a fully loaded box, 14.8 s of CPU each, peak 605 MB. The verifier's re-run on S2n took 16.26 s (r0444). The R3 onsets took 14.79 s for the three clips (r0292). RT1 took 79.7 s on 2 cores, peak 1,597.9 MB (r0551).
- Takes as a hint: `margin`, `kernel_size`, `power` and `mask` for HPSS. `hop_length`, `backtrack` and the peak-picking settings `delta`, `wait`, `pre_max` and `post_max` for onsets. `fmin` and `fmax` for pyin, a note range a known tuning could set (S5dropd's lowest bass note, D2 at 73.4 Hz, sits inside C2 to C4). No tuning, capo or tempo input.
- Hands off to: the percussive part went into the onset detector (run). The harmonic part as a WAV is a file Basic Pitch takes (not run on it). pyin's frames went into the notes step written here.

**madmom 0.17.dev0, git commit 27f032e8** ([link](https://github.com/CPJKU/madmom)). CPJKU's audio library, with eight onset programs: CNN, RNN offline and online, SuperFlux, SuperFlux with neural peak picking, ComplexFlux, LogFiltSpecFlux and SpectralOnsetDetection.

- In: S6taps as `S6taps.mono.wav`. CNNOnsetDetector and SuperFlux also on R1c and RT1, and CNNOnsetDetector on R3a, R3b and R3c.
- Command or settings: `<Program> single <wav> -o <out>.txt` with defaults, for each of the eight programs.
- Out: text, one onset time in seconds per line, in 10 ms steps for six programs and 5 ms steps for ComplexFlux and SuperFlux. On S6taps all eight put an onset on all 53 starts, with 0 or 1 more (53 or 54 onsets). No output says whether an onset is a tap or a plucked note. The 32 matched taps came a median 3.2 ms late with CNNOnsetDetector (largest 9.3 ms) and 2.1 ms early with SuperFlux (largest 5.0 ms). On R1c, CNNOnsetDetector returned 97 onsets with 71 of the 139 note starts within 50 ms, and SuperFlux 94 with 66. On R3a, R3b and R3c, CNNOnsetDetector returned 64, 102 and 57. On RT1, CNNOnsetDetector returned 1,124 and SuperFlux 1,095. Its first three on S6taps:

  ```text
  2.150
  2.680
  3.220
  ```

- Time: 30.88 s for all eight programs with one thread outside the slots on a fully loaded box, 2.6 to 5.4 s each, peak 281.2 MB (r0247). The verifier's re-run took 17.92 s (r0443). The RT1 run is under aubio (r0542).
- Takes as a hint: `--threshold`, `--smooth`, `--pre_max` and `--post_max`, `--combine`, `--delay`, `--fps`, and online or offline mode. Nothing musical.
- Hands off to: a list of seconds, the kind of input the Inverse Drum Machine's onset override takes (not run).

**music21 10.5.2** ([link](https://github.com/cuthbertLab/music21)). A toolkit for computer-aided music analysis that reads and writes MIDI and MusicXML, a file format for sheet music. Its MIDI import puts overlapping notes of different lengths into separate Voice objects, and it has no function that labels melody and bass. So my agents wrote a rule on top: a chord's lowest note is bass and its other notes melody, a single note in the Voice with the highest mean pitch in its bar is melody, and any other single note is bass.

- In: notes as a single-track MIDI file written with pretty_midi at the clip's tempo. Two sets of notes, the 90 played notes of S2n and S5dropd with only start, end and pitch kept, and Basic Pitch's notes for S2n, S2s, S6taps and S5dropd.
- Command or settings: `music21.converter.parse` on the MIDI file, then the rule above. The MIDI file uses the clip's tempo read from the answer key (112 BPM), so this method used that one piece of the answer.
- Out: a Stream, music21's tree of parts, measures, voices, notes and chords, with times in quarter notes. On S2n's played notes, 1 part, 36 Chords, 18 single Notes and 12 Voice objects. With the rule, 90 of 90 played notes got their right voice on S2n and on S5dropd. On Basic Pitch's notes, of the 90 that matched a played note, 83 got the right voice on S2n, 79 on S2s, 77 on S6taps and 81 on S5dropd, and on S2n it labelled 62 notes melody and 75 bass. It also wrote S2n's played notes as `S2n_truth_merged_single_track.musicxml`. In these clips every melody note is higher than every bass note. The melody runs from MIDI 55 to 64 and the bass from 43 to 52, or 38 to 52 in Drop D. So a pitch line my agents wrote, melody from MIDI 55 up, also gave 90 of 90, on played notes and on Basic Pitch's matched notes. On played notes a line at 53 or 54 did too.
- Time: 0.198 s on S2n and 0.265 s on S5dropd to parse and label, inside light runs of the whole voice-splitting script outside the slots (4.49 s for S2n's played notes with every method, peak 159.2 MB, r0184, and 6.2 to 7.8 s for each clip's Basic Pitch notes, r0258 to r0265).
- Takes as a hint: parsing options (quantization) only. No note range, tuning or capo.
- Hands off to: the MusicXML file is ready as the input for Cluster and Separate (not run). `Stream.voicesToParts()` turns voices into parts (not run).

**Open-Unmix 1.3.0, model umxhq**. A music source separator that writes bass, drums, other and vocals stems. My source-separation agents ran it, and my agents here checked the stems. My agents' files here don't hold its link or license.

- In: S6taps as `S6taps.wav` (stereo).
- Command or settings: `umx --model umxhq --no-cuda --outdir <out> S6taps.wav`.
- Out: four WAVs. The drums stem held 0.0366 of the mix's energy (-14.4 dB) and `other` held 0.924. Against the true taps track the drums stem measured 2.71 dB SI-SDR. librosa's onset detector on it returned 82 onsets, on all 32 taps, on all 21 notes with no tap and 29 on neither. In the 50 ms after each start, 10 of the 21 note-only starts were louder than the quietest tap. Its bass stem measured -31.96 dB SI-SDR against the bass part alone.
- Time: 96.63 s on 2 cores, peak 1,401.6 MB (r0147).
- Takes as a hint: none recorded in my agents' files here.
- Hands off to: the drums stem went into librosa's onset detector (run).

**partitura 1.9.0** ([link](https://github.com/CPJKU/partitura)). A Python package for written music as data. Its `estimate_voices` gives each note a voice number. Its documentation in the code cites Chew and Wu's 2004 paper, `Separating Voices in Polyphonic Music: A Contig Mapping Approach`.

- In: the same notes as music21 above, as a structured array with `onset_sec`, `duration_sec`, `pitch` and `id`.
- Command or settings: `estimate_voices(note_array, monophonic_voices=False)` and `estimate_voices(note_array, monophonic_voices=True)`. A rule my agents wrote then called the voice with the highest mean pitch melody and every other voice bass.
- Out: a numpy array with one voice number per note, starting at 1. On S2n's played notes, `monophonic_voices=False` made 2 voices of 10 and 80 notes and 54 of 90 notes got the right voice, since it puts notes with the same start and length into one voice. `True` made 2 voices of 42 and 48 notes, 90 of 90. S5dropd gave the same counts. On Basic Pitch's notes it made 5 to 8 voices, where the piece has 2. On S2n with `True` it made 6 voices, of 1, 8, 33, 18, 35 and 42 notes, and the rule labelled the 8 melody. With `False` the rule labelled 4 notes melody on S2n. Across the four clips, 48 to 55 of the 90 matched notes got the right voice. In these clips every played melody note is higher than every bass note (see music21 above).
- Time: 0.022 to 0.033 s per call on the played notes, inside the voice-splitting runs listed under music21 (r0184, r0185, r0258 to r0265).
- Takes as a hint: `monophonic_voices` only. No number of voices, note range, tuning or capo. In 1.9.0 the signature's default is `True` while the docstring says `Defaults to False`.
- Hands off to: voice numbers per note, which my agents' script wrote out as per-voice CSV files (`onset,offset,pitch`). A MIDI file per voice, the kind tuttut (my guitar-tab agents' tool) takes, would be an extra step that partitura doesn't document (not run).

**scikit-learn 1.9.1, NMF**. The `sklearn.decomposition.NMF` class, which librosa's `decompose.decompose` calls by default. My agents' files here give no home page for it, only its record on PyPI, the Python package index.

- In: the magnitude spectrogram of S6taps (STFT 2048, hop 512), through `librosa.decompose.decompose`.
- Command or settings: `decompose(S, n_components=k, sort=True, random_state=0)` for k = 8 and 16. NMF doesn't say which part is a tap, so my agents grouped the parts with the answer key: a part went to taps when its sound matched the true taps track more than the true guitar track. These numbers use the answer key and don't describe a method that could run on a new recording.
- Out: k components and their activations, with no labels. With k = 8, 1 component went to taps, and with k = 16, 3 did. Grouped that way, the taps measured 1.46 dB (k = 8) and 4.10 dB (k = 16) SI-SDR and the guitar 17.34 and 18.64 dB. librosa's onset detector on the taps group returned 59 onsets (k = 8) and 70 (k = 16), on all 53 starts each time plus 6 and 17 on neither. scikit-learn warned `ConvergenceWarning: Maximum number of iterations 200 reached`.
- Time: 8.85 s with one thread outside the slots, peak 515.3 MB, of which the fits took 2.3 s for k = 8 and 3.1 s for k = 16 (r0296).
- Takes as a hint: `n_components`, `beta_loss`, `max_iter`, `init`. librosa's wrapper also takes a transformer fitted beforehand, with `fit=False` (not tried).
- Hands off to: the grouped parts as WAVs went into librosa's onset detector (run).

Every run, command, output file and check is in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/fingerstyle-voices-taps).

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

Of the 52 tools, apps and research projects on the list, 39 didn't run here. Of the 13 datasets and recordings, 12 weren't downloaded, and the thirteenth is RT1. Two limits come up again and again. One is the session's permission policy. It refused the verifier, one of the agents that checked every run, when that agent tried to compile McLeod and Steedman's voice splitter. By my trial agent's account it also refused two ADTOF-pytorch steps, installing the cloned code and running it. Those left no line in the run log, and the verifier didn't see that session's transcript. In a later round it refused the ADTOF, Omnizart, ADT_STR and Cluster and Separate installs, LarsNet's own script and the drumsep run. Those six left no line in the run log either, but the agent that checked that round read each refusal and its command in that session's transcript. The other limit is a disk-space notice the box printed for agents in the first round, `start no new download or install over 200 MB unless your lane cannot finish without it ... never install a second torch or tensorflow version if an existing venv can be reused`. Where my agents wrote me steps to run a tool myself, the list number points into [`for-aaron.md`](https://github.com/aaronorelup/blog/blob/research/guitar-tab-tools/docs/guitar-tab-research/lanes/fingerstyle-voices-taps/for-aaron.md).

- **Ableton Live, Convert Drums to New MIDI Track.** A command in a commercial desktop program. My agents here didn't run it, and no reason beyond that is recorded. Steps for me: test T115 in my list of 120 tests.
- **ADT_STR.** At first its `pyproject.toml` pins of `torch==2.8.0` and `torchaudio==2.8.0` (a second torch version) ran into the disk notice, and so did its checkpoint, the trained model file, on Hugging Face (`setting-tau-0.8`, 289,134,056 bytes). In the later round, the README's two install lines (a Python 3.12 environment, then its PyPI dependencies from `pyproject.toml`) were refused before they ran, with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External].` The checkpoint wasn't downloaded. Steps for me: list 6.
- **ADTLib.** A drum transcriber from 2018 that writes kick, snare and hi-hat onset times and a drum tab as a PDF. Its README says it needs madmom and TensorFlow. Its code imports `tensorflow.contrib`, which only TensorFlow 1.x has, and the last TensorFlow 1.x on PyPI, 1.15.5, has wheels, ready-built install files, only for Python 3.6 and 3.7. The oldest Python `uv` offers on the box is 3.8.20, and its `setup.py` lists only Python 2.7. Nothing was installed. Steps for me: list 15.
- **ADTOF, the original Keras and TensorFlow version.** At first its `setup.py`, which asks for `tensorflow>=2.13.0`, met only `tensorflow-cpu` 2.12.1 on the box (installed by two other groups of my agents), and the disk notice ruled out another install. In the later round, with the disk free again, one install from its repository on Python 3.10 with `tensorflow==2.15.1` was refused before it ran, with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External].` Nothing was installed. Steps for me: list 2.
- **ADTOF-pytorch 0.1.0.** My trial agent reported that the permission policy refused both installing the cloned repository and running its command-line tool from a copy of its five reviewed `.py` files, with `Permission for this action was denied by the Claude Code auto mode classifier ... judged this action dangerous (it gave no explanation)`. The verifier couldn't check the refusals, since neither left a line in the run log. Its dependencies had installed. Steps for me: list 1.
- **Cluster and Separate (piano_svsep).** At first not attempted: its `setup.py` pins `torch==2.8.0`, the box has 2.15.0+cpu, the disk notice ruled out a second torch, and it isn't on PyPI. In the later round, the README's `pip install .` of the cloned repository, with the CPU build of the PyG wheel index, was refused before it ran, with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External].` Its input file is ready (`S2n_truth_merged_single_track.musicxml`). Steps for me: list 4.
- **Deep Salience.** Its `replicate.yaml` pins Python 2.7.15 and TensorFlow 1.12.0, and the box has no Python 2.7. Steps for me: list 11.
- **drumsep.** At first not attempted, for time and disk (its weights come from Google Drive through gdown). In the later round its Demucs environment installed and its checkpoint downloaded. That's `49469ca8.th`, 167,400,043 bytes, a Hybrid Demucs model with four sources, `bombo`, `redoblante`, `platillos` and `toms`. Then the run on the taps stem and the Demucs drums stem of S6taps was refused before it started, with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External].` Steps for me: list 10.
- **EngravingGNN.** A paper, with no code link found in its PDF. No steps.
- **ExpressiveGuitar-TechniqueClassifier.** It takes pre-computed feature vectors, the feature extractor isn't in the repository, and neither are the trained models (the four `.tflite` entries are links to paths on the author's machine). No steps.
- **Guitar string separation (deep-guitar-separation).** No trained weights in the repository, so a user trains it first, and its README commands pass `--cuda`. No steps.
- **Hi-Drum.** No code, weights or paper link on its project page. No steps.
- **Inverse Drum Machine.** Its code comes only as a cloned repository, and running one was refused for ADTOF-pytorch. It needs Python 3.10+ and Poetry. Its README documents passing onset times by hand to override its own transcription. Steps for me: list 7.
- **Joint Transcription of Acoustic Guitar Strumming Directions and Chords.** A paper about strumming, not fingerstyle, not checked further. No steps.
- **Klangio Drum2Notes.** A hosted commercial service. My agents here didn't run it, and no reason beyond that is recorded. Steps for me: test T31 in my list of 120 tests.
- **LarsNet.** At first its checkpoint, 562 MB according to its README, was above the disk notice's 200 MB limit. In the later round its PyPI dependencies installed, but the first call of the repository's own script, `separate.py --help`, was refused with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External].` So the checkpoint wasn't downloaded and nothing was separated. Steps for me: list 9.
- **Magenta Onsets and Frames, drums checkpoint.** It needs the Magenta package, whose repository says `currently inactive (archived, read only)` and whose last PyPI release, 2.1.4, pins `tensorflow==2.9.1` and `numba==0.49.1`. No environment on the box has TensorFlow 2.9.1. Steps for me: list 12.
- **Martelloni, McPherson and Barthet's percussive guitar classifiers (PercCNN, PercVAE, TablaCNN).** No code, weights or data released, and their dataset, GPercRep, is `currently not public`. No steps.
- **McLeod and Steedman HMM voice separation.** Building it means compiling a cloned repository. The verifier tried `make` and the permission classifier refused it, with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External]`. Steps for me: list 5.
- **MDX23C DrumSep.** A drum-splitting model that my source-separation agents' survey names only in its lists of models, as `MDX23C-DrumSep-aufr33-jarredou.ckpt`. No lane ran it. No steps here.
- **MERTech.** A paper. Which instruments it covers, its code and its licenses weren't checked. No steps.
- **MidiBERT-Piano melody extraction.** A model that takes a MIDI file and saves `the predicted melody midi file`, trained on the POP909 dataset's melody, bridge and accompaniment. There's no checkpoint its published code can load. The README's Google Drive folder answered HTTP 404, while another Drive page answered 200 through the same proxy in the same minute. In the repository's issue #18 the owner re-uploaded two checkpoints in June 2026 and wrote on 2026-10-12 `it appears the original model checkpoint has been lost.` The re-uploaded melody checkpoint, 1,340,894,149 bytes, has six token tables and an input layer of shape (768, 1536), where the published code builds four tables, one each for bar, position, pitch and duration, and 1,024 inputs. My agents read that from the first 131,072 bytes of the file without loading it, so the failed load is read from shapes and code, not seen in a run. At 1.34 GB it's also above the disk notice's 200 MB limit, and it wasn't downloaded. My agents wrote its inputs, S2n's and S5dropd's 90 notes and Basic Pitch's notes for both, as MIDI on the timing grid its code assumes, 480 ticks per beat (r0656). They also wrote a script that counts the notes it would put in the right voice, and tried it on made-up output (r0658). Steps for me: list 13.
- **MT3 and YourMT3+.** Left to my audio-to-notes agents. No steps here.
- **Noise-to-Notes (N2N).** A paper, with no code link found in its PDF. No steps.
- **nussl.** No reason recorded in the trials. Its README says it's deprecated. No steps.
- **Omnizart drum mode.** It needs TensorFlow (`tensorflow>=2.5.0` in its PyPI requirements, which the `tensorflow-cpu` build other agents installed doesn't satisfy). None was on the box when my agents here first checked, and the disk notice ruled out a new install. In the later round, one install of `omnizart==0.6.3` with `tensorflow==2.15.1` and `tf-keras==2.15.1` on Python 3.10 was refused before it ran, with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: The server-side auto mode classifier judged this action dangerous (it gave no explanation).` Steps for me: list 3.
- **Procedural fingerpicking data (Murgul and Heizmann).** No code found. The linked repository returned no refs, and its `README.md` and `LICENSE` answered 404. No steps.
- **QM Vamp Plugins, note onset detector.** A plugin from Queen Mary's Centre for Digital Music in the Vamp format, a plugin format for audio analysis programs, so it needs a Vamp host to run it. Its documentation describes the output as `The detected note onset times, returned as a single feature with timestamp but no value for each detected note.` Like the other onset detectors here, it carries no label. No built QM plugin was on the box. A search of the whole disk found only source copies and saved web pages, though Vamp hosts were there. My chords-beats-key agents couldn't get the plugins in their first round to fill gaps either, with no Ubuntu, Debian or PyPI package, a download site that reset the connection and a Linux plugin pack whose installer program names them. Whether they're inside it wasn't verified, since the installer wasn't run. Building them from the cloned repository wasn't tried. The verifier later found the Vamp SDK's example plugins on the box, among them `Simple Percussion Onset Detector`, outside the host's default search path. None of them was run on my clips. Steps for me: list 14.
- **Riley and Dixon, drum transcription with drum stem separation.** A paper, with no code located. No steps.
- **Separate-and-Detect.** A 2026 research model that splits a drum recording into five drum tracks, kick, snare, toms, hi-hats and cymbals, then runs madmom's CNN onset detector on each. The survey lists two conda environments, a manual patch to madmom, MusicLDM parts from Zenodo and commands that set `CUDA_VISIBLE_DEVICES`. One checkpoint plus the two MusicLDM parts it needs come to about 6.4 GB, against 6.5 to 7.9 GB of free disk shared by all my agents during the second round to fill gaps and the disk notice's 200 MB limit. Its single-audio settings file sets `accelerator: "gpu"`, its separation environment pins `torch==1.13.1+cu116`, a PyTorch build for NVIDIA graphics cards, and the box has no graphics card. It runs as scripts in a cloned repository, which the permission policy refused every time my agents here tried to run one. Whether it runs on a CPU wasn't tried. Steps for me: list 16.
- **SoloLa (TENT).** Found by the verifier, and its files and license weren't read. No steps.
- **Sonic Annotator.** No reason recorded, and its files and license weren't read. No steps.
- **SpectroFusionNet.** A paper, with no code link found in its page. No steps.
- **STRUM.** A paper. The code link in its arXiv record is a placeholder, `https://github.com/<your-github-username>/autocharter`. No steps.
- **SuperFlux reference implementation.** No reason recorded. The same algorithm ran inside madmom (`SuperFlux`) and Essentia (`SuperFluxExtractor`). No steps.
- **TART.** A paper, with no repository link in either of its PDFs. No steps.
- **torchnmf.** No reason recorded in the trials, only a survey entry. No steps.
- **tuttut.** My guitar-tab agents' tool. Not run here, and no steps.
- **vocsep_ijcai2023.** No reason recorded in the trials. The survey says the repository has no pretrained weights and the code needs a WANDB account. No steps.

Datasets and recordings not downloaded:

- **AG-PT-set.** A dataset, not downloaded. No steps.
- **archive.org, `DavidDrewLongey-MusicFromAModernCave2005`.** CC BY 3.0. Not downloaded, because the item doesn't say which tracks have guitar. No steps.
- **archive.org, Racer Sessions (Danny Godinez).** A steel-string acoustic set whose description mentions `imaginative fingerstyle and percussive textures`. Not downloaded, because its license is the Public Domain Mark 1.0, not CC0 or CC BY, the two licenses my agents were asked to use in that round. Steps for me: list 8.
- **EG-IPT dataset.** Not downloaded. No steps.
- **Freesound sound 674811, "guitar body kick".** `curl` from the box got HTTP 403, and the download link needs a login. In the later round the page and a preview address both answered HTTP 403 again, and whether that came from Freesound or from the box's proxy wasn't verified. Steps for me: list 8.
- **GOAT.** Access is restricted, by request. No steps.
- **Guitar-TECHS.** Not downloaded. No steps.
- **guitar_style_dataset (Magcil).** Not downloaded (14,251,969,884 bytes). No steps.
- **IDMT-SMT-Chords.** Not downloaded. No steps.
- **IDMT-SMT-Guitar.** Not downloaded. No steps.
- **Wikimedia Commons, `Am7 Percussive Bass Tapping.webm`.** A bass, not a guitar, not obtained. No steps.
- **Wikimedia Commons, `Erik Mongrain-AirTap.ogv`.** One download attempt got HTTP 429 (not re-checked). Its description names lap-tapping and doesn't mention hits on the body, and whether the video has any wasn't checked. Steps for me: list 8.

</details>

<details><summary>Licenses of the tools that ran</summary>

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| aubio | GPL-3.0-or-later, `either version 3 of the License, or (at your option) any later version.` ([source](https://aubio.org/manual/latest/cli.html)) | none | none |
| Basic Pitch | not recorded in my agents' files here | `nmp.onnx` ships in the package, license not recorded here | not recorded here |
| Demucs | not recorded in my agents' files here | HTDemucs and HTDemucs-6s weights, license not recorded here | not recorded here |
| `eguitar_ircam.ts` | only the model file ran here. ipt~: CC-BY-NC-4.0, `This project is released under a CC-BY-NC-4.0 license.` ([source](https://github.com/nbrochec/ipt_tilde)). libipt: `libipt is distributed under CC BY-NC 4.0, inherited from ipt_tilde, which it incorporates. Commercial use is not permitted.` ([source](https://github.com/nbrochec/libipt)). The IPT Vamp plugin: no license file in its top-level listing and no license text in its README | CC-BY-NC-4.0, `## License CC-BY-NC-4.0.` ([source](https://huggingface.co/nbrochec/ipt_models)) | the EG-IPT dataset, `cc-by-4.0` in its Zenodo record's license field ([source](https://zenodo.org/records/15205644)) |
| Essentia | AGPL-3.0, `Essentia is available under an open licence, Affero GPLv3, for non-commercial applications, thus it is possible to test the library before deciding to licence it under a comercial licence.` ([source](https://essentia.upf.edu/licensing_information.html)) | none in the onset algorithms. For Essentia's separate models, `All the models are available under the CC BY-NC-SA 4.0 license for non-commercial use, and are also available under a proprietary license upon request.` ([source](https://essentia.upf.edu/licensing_information.html)). The models folder's own LICENSE file, read by my audio-to-notes agents, says `Creative Commons Attribution-NonCommercial-NoDerivatives 4.0` ([models LICENSE](https://essentia.upf.edu/models/LICENSE)) | none recorded |
| libfmp | MIT | none | none |
| libnmfd | MIT | none | none |
| librosa | ISC | none | no model. Its docs say its peak-picking `parameters were chosen by large-scale hyper-parameter optimization over the dataset provided by` CPJKU's onset_db, where my agents found no license file |
| madmom | BSD-2-Clause | CC BY-NC-SA 4.0, loaded by the CNN and RNN programs, `All model and data files are distributed under the following license: Creative Commons Attribution-NonCommercial-ShareAlike 4.0` and `If you want to include any of these files (or a variation or modification thereof) or technology which utilises them in a commercial product, please contact Gerhard Widmer` ([source](https://github.com/CPJKU/madmom)) | not stated. Which audio its onset models learned from is unverified |
| music21 | BSD-3-Clause | none | none |
| Open-Unmix | not recorded in my agents' files here | not recorded here | not recorded here |
| partitura | Apache-2.0 | none | none |
| scikit-learn | BSD-3-Clause | none | none |

Every clause, quoted with its link and the date it was read, is in [`survey.md`](https://github.com/aaronorelup/blog/blob/research/guitar-tab-tools/docs/guitar-tab-research/lanes/fingerstyle-voices-taps/survey.md).

</details>

## Reading hands and the fretboard from video

This step watches the player's hands, so the app can tell which string and fret each finger presses. My agents looked at 75 tools, papers and datasets, and 17 tools gave an output on the cloud box. On a close shot with only the hand on the neck in view, Google's MediaPipe hand tracker returned one hand in all 300 frames.

<ao-compare cols="2" aspect="4/3">
<figure><img src="/media/guitar-tab-tools/video-hands-fretboard-mediapipe-close.webp" alt="A classical guitarist seen from the chest up, the guitar neck rising to the right. Green lines and white dots trace the fingers of the hand on the neck, labelled Left 1.00."><figcaption><b>One hand, 21 points</b><span class="ao-meta">MediaPipe Hand Landmarker on R3a_cu, frame 150. Video by Mark Andersen / Seattle Community Media, CC BY-SA 4.0</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/video-hands-fretboard-mediapipe-sheet-music.webp" alt="A seated guitarist on a stage behind a black music stand. Green and white hand points sit on her hand on the guitar neck, labelled Left 1.00, and a second set sits on white sheet music hanging from the stand, labelled Left 0.54."><figcaption><b>A second "hand" on the sheet music</b><span class="ao-meta">the same tool on R3a's wide shot, frame 300, enlarged detail. Video by Mark Andersen / Seattle Community Media, CC BY-SA 4.0</span></figcaption></figure>
<figure class="wide"><img src="/media/guitar-tab-tools/video-hands-fretboard-fingertips-r3a-cu.webp" alt="A straightened close-up of a guitar neck with four fingers pressing strings. Magenta vertical lines mark frets, cyan ticks along the top count frets 0 to 11, and green dots on the fingertips read index s4 f2, middle s6 f4, ring s4 f4, pinky s2 f4 and thumb s1 f3."><figcaption><b>Fingertips to string and fret, R3a_cu</b><span class="ao-meta">frame 150, the neck straightened from four corners set by hand. Magenta: frets found by OpenCV, a library of image functions. Cyan: fret numbers from a spacing formula fitted to them. Video by Mark Andersen / Seattle Community Media, CC BY-SA 4.0</span></figcaption></figure>
<figure class="wide"><img src="/media/guitar-tab-tools/video-hands-fretboard-fingertips-r3b.webp" alt="A straightened close-up of another guitar neck with four fingertips marked by green dots: index s4 f3, middle s5 f4, ring s2 f5, pinky s2 f5. Magenta lines mark the fret-like lines OpenCV found: one at the nut, one along the edge of a finger at the ring fingertip, and the frets right of the hand. Cyan ticks count frets 0 to 19, and two pale fret wires left of the fingers have no magenta line."><figcaption><b>Fingertips to string and fret, R3b</b><span class="ao-meta">frame 225, same steps. Counting the metal fret wires by eye from the nut, where the fretboard ends by the tuning pegs, gives one fret lower for each finger. Which count is right isn't known. Video CC0, from archive.org</span></figcaption></figure>
<figure class="wide"><img src="/media/guitar-tab-tools/video-hands-fretboard-owlv2-capo.webp" alt="A close-up of a guitar fretboard from the front. Two fret wires run across it, and a black capo bar is clamped across all six strings between them, with its clamp at the right edge. A thick red box labelled capo surrounds the bar and the clamp, and two more red boxes surround the clamp. Thin colored lines are edges of boxes for the other words."><figcaption><b>Boxes for the word "capo"</b><span class="ao-meta">OWLv2, Google's detector that draws boxes for words you give it, on its public demo page. A still photo of a capo on a guitar, shown from fret wire 1 to fret wire 2 and enlarged. A fourth "capo" box sat on a tuning knob, outside this crop. Photo "Kapodaster an Westerngitarre", copyright Anil Öztas, CC BY-SA 4.0</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

The tools ran on four real videos of nylon-string guitar played with the fingers. R3a is an 18-second excerpt of a concert. R3a_cu is a 10-second close shot from the same concert with only the fretting hand in view, the hand that presses the strings. R3b and R3c are 18-second clips of two other players, filmed closer up, and R3c shows both hands. None of these videos has a known answer, so every figure here is a count, a rate or a time. Each video was turned into still frames once with ffmpeg, a command-line video tool, to PNG for R3a and R3a_cu (`ffmpeg -i <clip>.mp4 -vsync 0 <dir>/%04d.png`) and to JPEG at `-q:v 2` for R3b and R3c. R3a is 540 frames at 640x480 with camera cuts at frames 218 and 439, so it has 319 medium-shot frames and 221 wide-shot frames. R3a_cu is 300 frames at 640x480. R3b and R3c are 450 frames each at 1920x1080. "Crop" means a fixed box around both hands enlarged 3 times on R3a, or the whole R3a_cu frame enlarged 2 times.

A later round added C1, a still photo for questions about the capo, a clamp across the strings that raises every note. The photo shows the end of a steel-string guitar's neck from the front: the headstock, the end that holds the tuning pegs, then the first two frets, with a capo clamped across the strings between fret wires 1 and 2 and no hands. It's "Kapodaster an Westerngitarre", copyright Anil Öztas, CC BY-SA 4.0, used at 960x1706 pixels. Where the capo sits was read by eye, and nothing else in it is labelled. Grounding DINO, OWLv2, YOLO-World and YOLOE-26s each got the same ten pictures on the box: C1 whole, a crop of its lower part from the bottom of the headstock, about 55 px above the nut, to the bottom edge (not enlarged), and the eight R3a and R3a_cu stills listed under YOLOE-26s. My agents found no freely licensed video of someone playing with a capo, so they wrote me steps to film two short clips of my own, with and without one ([section 10](https://github.com/aaronorelup/blog/blob/research/guitar-tab-tools/docs/guitar-tab-research/lanes/video-hands-fretboard/for-aaron.md)).

Timed runs had 2 of the box's 4 CPU cores unless the entry says otherwise. The four that ran through rtmlib are the exception. The engine under rtmlib, ONNX Runtime, put some of its work on cores outside the 2 it was given. In one step it used 2.31 seconds of processor time for each second on the clock, more than 2 cores can give. So their times aren't 2-core times. "Wall" is time on the clock. Many runs went through one shared job, a group run, so several entries carry that job's run id. Local runs cost nothing beyond the cloud session itself.

A second agent, the checking agent, re-ran at least one run that gave output for 13 of these 17 tools, all but Grounding DINO, RTMW, ViTPose and YOLO-World, with the same commands. The outputs came out the same and the times didn't. CoTracker3 took 0.74 s a frame in the re-run, against 1.47 s the first time. Other jobs shared the box both times. Partway through the work my agents were given a 200 MB cap on new downloads and installs, to save space on the shared disk. The disk note said `start no new download or install over 200 MB unless your lane cannot finish without it`. Their notes put its start at about 21:12 UTC, a time the checking agent couldn't confirm. The RTMW file below is dated 21:06 UTC. Whether the MobileCLIP2 file, dated 21:14:08 UTC, came before the cap isn't verified. In the later round my agents downloaded the OWLv2 and Grounding DINO model files and the CLIP file YOLO-World needs, each over 200 MB, one at a time, and deleted each after its run. The checking agent didn't re-run those three runs, because each needs a new download over 200 MB.

**CoTracker3, offline model, commit 82e02e8** ([repo](https://github.com/facebookresearch/co-tracker)). Meta's point tracker. It follows chosen points through a video.
- In: R3a_cu frames 150 to 239 (90 frames, 3.0 s) as one block of color values, shape `(1, 90, 3, 480, 640)`. Eight points set by hand on frame 150, four on the neck and four on the hand.
- Command or settings: `CoTrackerPredictor(checkpoint=..., offline=True, window_len=60)`, with the points as `(t, x, y)` queries. The checkpoint, the trained model file, is `scaled_offline.pth` (101,890,938 bytes). The README's `torch.hub.load` route needs api.github.com, which the box's proxy refuses, so the clone went on `sys.path` instead.
- Out: `pred_tracks` (x and y in pixels, per frame and point) and `pred_visibility` (true or false). CoTracker3 marked the four neck points visible in 90 of 90 frames, and the farthest it moved each one from its start was 3.77 to 4.34 px. It marked the wrist and index knuckle visible in 90 of 90 and moved them up to 98.17 and 66.43 px from their starts. It marked the index fingertip visible in 16 of 90 frames and the middle fingertip in 73. Nothing records where these points really were. By eye on frame 239 the neck points are still on the neck and the wrist and knuckle points are on the hand.
- Time: 136.52 s wall, 132.43 s of it tracking (1.47 s a frame), peak memory 8,813,832 kB (8.4 GiB). Step `cotracker3-offline_R3a_cu_f150_90` of group run r0448.
- Takes as a hint: the points to follow (`queries`), a `grid_size`, or a `segm_mask`, a black-and-white picture that marks an area, to keep the grid inside it. Nothing about the guitar.
- Hands off to: not tried. Its tracks, set against the same points on the first frame, give the point pairs OpenCV's `findHomography` takes. My agents' notes say that would keep the fretboard map in place as the camera or the guitar moves. Nobody ran it.

**DWPose-l, through rtmlib 0.0.16** ([repo](https://github.com/IDEA-Research/DWPose)). IDEA Research's whole-body model with 133 points: body, feet, face and 21 per hand.
- In: every 6th frame of R3a (90 frames, full and crop) and every 5th frame of R3a_cu (60 frames), as numpy BGR arrays. A YOLOX person detector found the player first.
- Command or settings: `scripts/run_rtmlib.py <clip> <full|crop> <hand|rtmw|dwpose|vitpose> <outdir> [step]` with `dwpose` and the model `rtmpose-l_simcc-ucoco_dw-ucoco_270e-384x288-2438fd99_20230728.onnx` (134,399,323 bytes). A hand counts when the mean of its 21 point values in `scores` is 0.3 or more.
- Out: `keypoints` (people x 133 x 2, in pixels) and `scores` (people x 133). The hands are points 91-111 and 112-132. On R3a full it gave two hands in 90 of 90 frames, the wide shot included, where the picking hand, the one that plucks the strings, is behind the music stand. On R3a_cu, where the picking hand is out of the picture, the right-hand slot passed the 0.3 rule in 15 of 60 frames.
- Time: R3a full 124.90 s wall, 577.2 MiB peak, 1340.44 ms a frame. R3a_cu 62.18 s, 575.2 MiB. Steps of group run r0448. Not 2-core times.
- Takes as a hint: person boxes (`bboxes`), `backend`, `device`. No handedness or guitar setting.
- Hands off to: not tried.

**Grounding DINO tiny, through `transformers` 5.22.2** ([repo](https://github.com/IDEA-Research/GroundingDINO)). IDEA Research's text-prompted detector: it draws boxes around whatever words you give it. It ran in the later round, in `transformers`, a Python library that runs published AI models.
- In: the ten pictures listed above, C1 whole, C1's lower part and the eight R3a and R3a_cu stills.
- Command or settings: model `IDEA-Research/grounding-dino-tiny`, whose 689,359,096-byte `model.safetensors` was downloaded for this run and deleted after it. `proc(images=..., text="guitar. guitar neck. fretboard. headstock. capo. hand.")`, then `proc.post_process_grounded_object_detection(outputs, input_ids, threshold=0.2, text_threshold=0.2, target_sizes=[(h, w)])`. Its public demo page, merve/Grounding_DINO_demo, couldn't be called from the box. Every call failed with `ValueError('Unknown protocol: ws')`, in the first try (r0193), in the checking agent's re-run (r0488), in the later round (r0629) and in the checking agent's re-run of that (r0690).
- Out: per box a confidence value, a box in pixels given by two corners (xyxy), and a label made of the parts of the prompt whose value passed the text threshold. So labels outside the prompt list came back: `guitar guitar` and `neck` on all ten pictures, `##tock`, a piece of the word headstock, on two, and `heads` on one. C1 whole: 5 boxes, among them "guitar neck" at 0.3558 around all of the guitar in the picture and at 0.3448 around the headstock, and no "capo" label. C1's lower part: 6 boxes, among them "guitar neck" at 0.3298 from the nut to the capo and `##tock` at 0.2105 where the capo bar is, and no "capo" label. On the eight stills with no capo: "hand" boxes on all eight, with top values from 0.334 to 0.6231, and one "capo" box, 0.2653, on the R3a frame-100 crop.
- Time: 107.72 s wall, 2455.4 MiB peak, 3.72 s to load the model and 7.39-11.86 s a picture (r0648).
- Takes as a hint: the text prompt, with phrases separated by periods, and the box and text thresholds.
- Hands off to: not tried. The Grounded-SAM-2 repository has scripts that pass its boxes as box prompts to the video predictor of SAM 2, Meta's model that cuts an object out of a picture or a video (see Segment Anything 2.1).

**MediaPipe Hand Landmarker 1.2.2** ([docs](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker)). Google's palm detector plus a 21-point hand model.
- In: R3a (full and crop), R3a_cu (full and 2x), R3b and R3c, one `mp.Image` (SRGB, uint8) per frame.
- Command or settings: `running_mode=VIDEO`, `num_hands=2`, `min_hand_detection_confidence=0.5`, `min_hand_presence_confidence=0.5`, `min_tracking_confidence=0.5`, model `hand_landmarker.task` (7,819,105 bytes), script `scripts/run_mediapipe_hands.py <clip> <full|crop> <model> <outdir>`.
- Out: per hand a `handedness` label (Left or Right, with a `score`), 21 `hand_landmarks` (x and y as fractions of the frame's width and height) and 21 `hand_world_landmarks` in meters. R3a_cu: one hand in 300 of 300 frames, full and 2x, labelled Left every time. R3b: one hand, the fretting hand, in 445 of 450 frames and none in 5. The picking-hand fingers at the left edge weren't found in any frame. R3c: two hands in 450 of 450 frames, the "Left" ones at the neck on average and the "Right" ones at the sound hole. R3a full: 0, 1 and 2 hands in 1, 267 and 272 frames. In the medium shot a hand landed in the fretting-hand area in 318 of 319 frames and in the picking-hand area in 54. In the wide shot, 215 frames also had a "hand" in one 20-px square that on frame 300 is the sheet music hanging from the music stand. In crop mode, 9 wide-shot frames had a detection outside the fretting-hand area, in the square just above it. The R3a_cu frame 150 record, as my agents summed it up:

  ```text
  label Left, score 0.9985, wrist normalized (0.85115, 0.6729), index fingertip (landmark 8) (0.75431, 0.38754) = pixel (482.8, 186.0)
  ```

- Time: R3a_cu 14.29 s wall, 211.3 MiB peak, 32.56 ms a frame (r0078). R3a 27.83 s, 224.6 MiB (r0071). R3b 22.43 s, 254.9 MiB, and R3c 21.53 s, 258.3 MiB (steps of group run r0408).
- Takes as a hint: `num_hands`, the three confidence thresholds and `running_mode`. There's no option to look at only part of the picture, so the crops were made outside it. Nothing about the guitar. About the Left and Right labels, its docs say `Passing a horizontally mirrored image will invert these outputs.`
- Hands off to: OpenCV, as fingertip pixels shaped `(N, 1, 2)` for `cv2.perspectiveTransform` (runs r0172, r0218 and r0402, in the OpenCV entry). Its hand boxes also went to the OpenPose hand model.
  - In the later round its R3c points went to a measurement script my agents wrote (`scripts/gap-round-2/picking_hand_onsets.py`, r0609), with the 87 notes that Basic Pitch, Spotify's note transcriber, wrote from R3c's sound (run r0264). A note start within 30 ms of the last one kept was merged into it, which left 63. MediaPipe's "Right" hand, the picking hand, is in all 450 frames. The script put frame n at n / 25 s, and the sound in the video file lined up with R3c's separate sound file at a lag of 0 samples. Whether picture and sound were in sync in the original recording wasn't checked. Then it measured how many pixels the wrist and fingertips moved from one frame to the next, within 40 ms of a note start and at all other times. For the wrist and the thumb, index, middle and ring fingertips, the median speed near a note start was higher than at other times, by 0.29 to 1.00 pixels a frame. Measured against the wrist, the four fingertips had a speed peak, a local high in the top quarter of their speeds, within 40 ms of 17 to 23 of the 63 note starts, a share of 0.270 to 0.365. For note starts at random times that share would be 0.305 to 0.323, the part of the clip that lies within 40 ms of a peak. Nobody checked which finger or string sounded each note. R3a and R3b weren't measured, because their picking hand is out of the picture, hidden or not found. 27.09 s wall, 407.3 MiB peak.

**MediaPipe Holistic Landmarker 1.2.2** ([docs](https://ai.google.dev/edge/mediapipe/solutions/vision/holistic_landmarker)). Body (33 points), face (478) and both hands (21 each) in one model.
- In: R3a full and crop, R3a_cu full and R3c, as `mp.Image` frames.
- Command or settings: default options in VIDEO mode, model `holistic_landmarker.task` (13,683,609 bytes), script `scripts/run_mediapipe_pose_holistic.py`.
- Out: `pose_landmarks`, `face_landmarks`, `left_hand_landmarks` and `right_hand_landmarks` (21 each, empty when not found), with no handedness value. R3a full: a body in 540 of 540 frames, and 0, 1 and 2 hands in 13, 439 and 88. In the wide shot the left hand came up in 220 of 221 frames, the right hand in none, and nothing landed on the sheet music. R3a_cu: the left hand in 300 of 300 frames. R3c: the left hand in 450 frames, the right in 440. On the R3a crops it stopped at frame 218, where the crop size changes at the camera cut:

  ```text
  RET_CHECK failure (third_party/mediapipe/calculators/image/segmentation_smoothing_calculator.cc:207) current_mat->rows == previous_mat->rows (660 vs. 720)
  ```

- Time: R3a full 31.57 s wall, 307.2 MiB, 48.24 ms a frame. R3a_cu 18.53 s, 308.6 MiB. R3c 39.31 s, 405.5 MiB. The crop run ended after 15.14 s with exit code 1. Steps of group run r0408.
- Takes as a hint: the run left every option at its default. In VIDEO mode it needs the same frame size on every frame.
- Hands off to: not tried. Its hands use the same 21-point layout as the Hand Landmarker.

**MediaPipe legacy Hands API, mediapipe 0.10.21** ([repo](https://github.com/google-ai-edge/mediapipe)). The older Python API, `mp.solutions.hands.Hands`. It's in 0.10.21 and in none of the releases from 0.10.30 to 1.2.2 that the checking agent looked at.
- In: R3a full and crop, R3a_cu, R3b and R3c, as RGB frames.
- Command or settings: `Hands(static_image_mode=False, max_num_hands=2, model_complexity=1, min_detection_confidence=0.5, min_tracking_confidence=0.5)`. All five are the constructor's defaults. It was installed with `uv pip install --python venv-mp-legacy/bin/python mediapipe==0.10.21`.
- Out: `multi_hand_landmarks` (21 points per hand), `multi_handedness` (`label` and `score`) and `multi_hand_world_landmarks`. R3a_cu: one hand in 300 of 300 frames. R3b: 0, 1 and 2 hands in 5, 439 and 6 frames. In those 6 frames both detections sit in the fretting-hand area, and whether one is a second copy of the same hand wasn't checked. R3c: two hands in 450 of 450. R3a full: 0, 1 and 2 hands in 1, 296 and 243 frames, with 135 wide-shot frames that had a "hand" on the same sheet-music spot. This API assumes a mirrored selfie picture and these videos weren't flipped, so the fretting hand came out "Right" on R3a_cu, R3b and R3c, where the newer API says "Left".
- Time: R3a_cu 11.39 s wall, 270.0 MiB. R3a full 23.20 s, 279.9 MiB. R3c 21.80 s, 306.8 MiB. Steps of group run r0408.
- Takes as a hint: the constructor arguments above. The note in its code says `If that is not the case, use, for instance, cv2.flip(image, 1) to flip the image first for a correct handedness output.`
- Hands off to: not tried. Same 21-point order as the newer API.

**MediaPipe Pose Landmarker (heavy) 1.2.2** ([docs](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker)). 33 body points per person, with three points per hand (pinky, index, thumb) and no finger joints.
- In: R3a full and crop, as `mp.Image` frames.
- Command or settings: VIDEO mode, `num_poses=1`, detection, presence and tracking confidence 0.5, model `pose_landmarker_heavy.task` (30,664,242 bytes). A wrist counts as a hand when its `visibility` is 0.5 or more.
- Out: `pose_landmarks` (33 points with x, y, z, `visibility` and `presence`) and `pose_world_landmarks` in meters. R3a full: a body in 540 of 540 frames, a left-wrist `visibility` of 0.5 or more in 532 and a right-wrist one in 399. In the wide shot, where the picking hand is behind the music stand, the right wrist reached 0.5 in 80 of 221 frames.
- Time: R3a full 43.65 s wall, 316.7 MiB, 69.27 ms a frame. Crop 44.33 s, 325.5 MiB. Steps of group run r0408.
- Takes as a hint: `num_poses` and the confidence thresholds. Nothing about the guitar.
- Hands off to: not tried.

**OpenCV 5.0.0, `opencv-contrib-python` 5.0.0.93** ([repo](https://github.com/opencv/opencv)). Edge, line and perspective functions written as fixed rules, with no trained model.
- In: R3a_cu frames 150, 0 and 280 (640x480) and R3b frames 225, 0 and 449 (1920x1080). The four corners of the neck were set by hand on one frame of each clip and reused on the other two. In the later round, the capo photo C1 as well, with its corners set by hand from the nut to the bottom edge of the photo (r0652).
- Command or settings: `Canny(50, 150)` for edges, then two line finders. Hough is `HoughLinesP(rho=1, theta=pi/180, threshold=30, minLineLength=20, maxLineGap=5)`. LSD, OpenCV's line segment detector, ran with default parameters. Both ran before and after `getPerspectiveTransform` and `warpPerspective` straighten the neck into an 800x116 rectangle (R3a_cu) or a 1200x130 one (R3b). For R3b: `run_opencv_lines.py <outdir> --clip R3b --frames 225,0,449 --quad 1262,25,1340,130,290,765,245,635 --size 1200,130`. C1 went through the same script unchanged, inside a wrapper that loads a still photo instead of a video frame (`scripts/gap-round-2/run_opencv_lines_image.py`), and was straightened into 610x270.
- Out: line segments as x1, y1, x2, y2 in pixels, a 3x3 matrix that straightens the neck, and the counts and clusters of "string-like" and "fret-like" lines in `opencv_lines.json`. In OpenCV 5 `HoughLinesP` returns shape `(N, 4)`, where 4.x returned `(N, 1, 4)`. On straightened R3a_cu frame 150, LSD gave 11 fret clusters and Hough 6, and none fell where the hand covers the neck. LSD gave 4 string clusters and Hough 3, not 6. On straightened R3b frame 225, LSD gave 16 fret clusters and 7 string clusters, Hough 13 and 4. By eye on the overlay, one LSD fret cluster sits on the edge of a finger, and the fret wires about 120 and 228 px from the nut in the straightened picture, left of the fingers, weren't counted as frets. On straightened C1, Hough gave fret clusters at 1.0, 412.0 and 452.0 px from the nut and LSD at 380.1 and 394.3. By eye, Hough's are the nut's lower edge, the lower edge of the capo bar and fret wire 2, and both of LSD's sit on the shine along the capo bar. Neither counted fret wire 1, at about 232-237 px, because the strings cut it into pieces shorter than 40 % of the fretboard's width. Hough gave 16 string clusters and LSD 9, and by eye the photo has six strings. Nothing in the method names a line as a capo.
- Time: R3a_cu 1.91 s wall for all three frames, 94.1 MiB peak (r0149). R3b 3.96 s, 164.4 MiB (r0214). C1 1.10 s, 116.5 MiB (r0652). These light runs had no CPU slot or core pinning (`--nolock`).
- Takes as a hint: the four corners and every threshold above.
- Hands off to: the fingertip step, run on one frame of each clip. My agents' script fitted the standard fret spacing to the fret lines right of the hand. That spacing is 12-TET, where each fret is one semitone, one piano key, higher. The script split the neck into six equal string lanes, with string 6, the thickest, on top. Then it put each MediaPipe fingertip in a cell. The string rule was an assumption, not checked against string thickness. The fit's RMS residual, the typical gap between fitted and found frets, was 5.04 px on R3a_cu and 3.52 px on R3b.
  - R3a_cu frame 150 (r0218, 0.39 s): index string 4 fret 2, middle string 6 fret 4, ring string 4 fret 4, pinky string 2 fret 4. The thumb landed on the neck's bottom edge at string 1 fret 3. My agents noted that a classical player's thumb is normally behind the neck, so that cell isn't a pressed note. Nobody checked it.
  - R3b frame 225 (r0402, 0.8 s): index string 4 fret 3, middle string 5 fret 4, ring and pinky string 2 fret 5. The thumb landed outside the fretboard. Counting the fret wires from the nut by eye puts each finger one fret lower. With no answer to check against, which count is right is open.

**OpenPose hand model, PyTorch port pytorch-openpose at commit 5ee71dc** ([repo](https://github.com/Hzzone/pytorch-openpose)). OpenPose's 21-point hand network, converted from CMU's Caffe model to PyTorch.
- In: 30 hands from every 10th frame of R3a_cu, 10 from every 30th frame of R3a_cu and 21 from every 30th frame of R3a. Each is a square cut around MediaPipe's 21 points, with a side 1.5 times the longer side of their box.
- Command or settings: each crop scaled to a 368-px box at scales 0.5, 1.0, 1.5 and 2.0, stride 8, heatmap threshold 0.05 after a Gaussian blur with sigma 3, script `scripts/run_openpose_hand.py`. The weights, the trained model file, are `hand_pose_model.pth` (147,341,049 bytes). OpenPose's own C++ mirrors left-hand crops (in `handExtractorCaffe.cpp`) and the port doesn't, so the later runs used `--mirror-left`.
- Out: per hand 21 points as x, y and a peak value, in frame pixels and MediaPipe's order. Not mirrored (r0336): 13.4 of 21 points found per hand on average, and a median distance of 52.52 px from MediaPipe's point for the same joint. Mirrored, R3a_cu: 19.5 of 21 found, 4.68 px. R3a, with the left-hand crops mirrored (20 of the 21 hands): 9.29 of 21 found, 2.74 px, and 3 of the 21 hands with no point found. The R3a hand boxes were 41-93 px wide.
- Time: r0336 took 519.06 s wall for 30 hands and 1088.1 MiB peak, after waiting 1800.7 s for a free slot. The model averaged 17.161 s a hand. Mirrored R3a_cu 202.43 s for 10 hands, 1101.3 MiB (step of group run r0448).
- Takes as a hint: hand boxes from another detector, and `--mirror-left`. Nothing about the guitar.
- Hands off to: it took MediaPipe's boxes in. Its points weren't fed further.

**OWLv2 base, on a public demo page and on the cloud box** ([model](https://huggingface.co/google/owlv2-base-patch16-ensemble)). Google's open-vocabulary detector: it draws boxes around whatever words you give it. The demo page is merve/owlv2 on Hugging Face, a site that hosts AI models. In the later round the same model also ran on the box itself, through `transformers` 5.22.2.
- In: three 640x480 PNG stills, R3a_cu frame 150 and R3a frames 100 (medium shot) and 300 (wide shot), sent with `gradio_client` 2.7.2. The model ran on Hugging Face's machine because its 619,918,824-byte weights were over the 200 MB cap. In the later round C1 whole went to the same demo page (r0629), and the ten pictures listed above went to the model on the box (r0639). The demo page gives no confidence values, so the weights were downloaded for that run and deleted after it.
- Command or settings: `text_queries="guitar neck, fretboard, headstock, capo, hand"`, `score_threshold=0.1`. On the box: `Owlv2Processor` and `Owlv2ForObjectDetection`, each prompt sent as `a photo of a <prompt>`, for guitar, guitar neck, fretboard, headstock, capo and hand, and boxes kept at 0.1 or more. The first two tries on the box failed. r0632 stopped after 5.23 s with exit code 1. My agents' notes say it couldn't load the image processor offline, and no log of it was kept. r0634 stopped with `AttributeError: 'Owlv2Processor' object has no attribute 'post_process_object_detection'. Did you mean: 'post_process_grounded_object_detection'?`, so the script then called the image processor's own `post_process_object_detection` (r0639).
- Out: an `AnnotatedImage`, one mask image and one label per box, with no `score` field. Boxes for guitar neck, fretboard, headstock, capo and hand: R3a_cu frame 150 gave 4, 2, 0, 2 and 1. R3a frame 100 gave 2, 2, 0, 3 and 0. R3a frame 300 gave 5, 1, 0, 10 and 0. There's no capo on the guitar in these frames. On R3a_cu frame 150 the "hand" box is (417,170)-(565,345), and MediaPipe's 21 fretting-hand points there span x 423.57-546.70, y 177.72-322.99. On C1 whole the demo page gave 28 boxes: fretboard 13, guitar neck 6, headstock 5 and capo 4. By eye, one "capo" box covers the capo bar with its clamp, two cover the clamp and one sits on a tuning knob at the left of the headstock (picture above). On the box the model gives each box a prompt, a confidence value and xyxy corners. C1 whole: 22 boxes, guitar 1 at 0.4838, guitar neck 11 (top 0.2092), fretboard 8 (top 0.2837), capo 2 (top 0.2539), headstock 0 and hand 0. By eye both "capo" boxes sit on the clamp at the neck's right edge, and neither spans the bar across the strings. C1's lower part: 4 boxes, capo at 0.2154 and 0.1475 on the clamp, fretboard at 0.1821 and guitar at 0.1536. On the eight stills with no capo: "capo" boxes at 0.1 or more on every one, 2 to 11 of them, with top values from 0.1919 to 0.3682, 4 of the 8 above C1's 0.2539. "hand" reached 0.2355 at most on them. The demo page's two clamp boxes lie within 5 px of the box run's two "capo" boxes.
- Time: 19.67, 18.54 and 25.30 s per image, network included, not the box's CPU (r0193). It needed no login. C1 on the demo page: 31.3 s for the call (r0629). On the box: 87.19 s wall for the ten pictures, 1244.5 MiB peak, 3.16 s to load the model and 7.07-10.03 s a picture (r0639). The two failed tries took 5.23 s (r0632) and 12.73 s (r0634).
- Takes as a hint: the text queries and `score_threshold`.
- Hands off to: not tried. The `transformers` version returns boxes as `(xmin, ymin, xmax, ymax)`, the xyxy format rtmlib takes as `bboxes`.

**rtmlib 0.0.16 with RTMPose hand** ([repo](https://github.com/Tau-J/rtmlib)). A small library that runs OpenMMLab's RTMPose models through ONNX Runtime 1.31.1. Its hand setup is an RTMDet-nano hand detector plus the RTMPose-m 21-point hand model.
- In: R3a full and crop, R3a_cu full and 2x, R3b and R3c, as numpy BGR frames.
- Command or settings: `rtmdet_nano_8xb32-300e_hand-267f9c8f.onnx` (4,010,667 bytes), then `rtmpose-m_simcc-hand5_pt-aic-coco_210e-256x256-74fb594_20230320.onnx` (55,080,248 bytes), called as `model.det_model(img)` and then `model.pose_model(img, bboxes=...)` through the same script with `hand`. A hand counts when the mean of its 21 values in `scores` is 0.3 or more.
- Out: `keypoints` (hands x 21 x 2, in pixels) and `scores` (hands x 21), with no left or right label. R3a full: the detector gave a box in 148 of 540 frames (147 of 319 medium, 1 of 221 wide), and 0, 1 and 2 hands came out in 465, 75 and 0 frames. R3a crop: boxes in 536 of 540 frames, and 350, 150 and 40. R3a_cu: 32, 231 and 37. R3b: 25, 413 and 12. R3c: 22, 392 and 35, plus 1 frame with more than 2.
- Time: R3a full 77.00 s wall, 237.5 MiB, 127.07 ms a frame. R3c 80.83 s, 256.8 MiB. Steps of group run r0408. Not 2-core times.
- Takes as a hint: boxes (`bboxes`), `det_input_size`, `pose_input_size`, `backend`, `device`. When the detector finds no box, rtmlib uses the whole image as the box. Those outputs weren't counted.
- Hands off to: not tried. Its keypoints reshaped to `(21, 1, 2)` are what `cv2.perspectiveTransform` takes.

**RTMW-x-l, through rtmlib 0.0.16** ([project](https://github.com/open-mmlab/mmpose/tree/main/projects/rtmpose)). OpenMMLab's 133-point whole-body model, which its README says was `trained on 14 public datasets`.
- In: every 6th frame of R3a (90 frames, full and crop) and every 5th of R3a_cu (60), as numpy BGR frames, after the YOLOX person detector `yolox_m_8xb8-300e_humanart-c2c7a14a.onnx` (101,400,344 bytes).
- Command or settings: rtmlib `Wholebody(mode="performance")` with `rtmw-dw-x-l_simcc-cocktail14_270e-384x288_20231122.onnx` (229,320,930 bytes), the same script with `rtmw`.
- Out: `keypoints` (people x 133 x 2) and `scores`. Its hand values run above 1 (per-hand means 0.96 to 8.76), so every RTMW hand passed the 0.3 rule. R3a full: two hands in 90 of 90 frames. R3a_cu: the right-hand slot passed in 60 of 60 frames, with the picking hand out of the picture.
- Time: R3a full 150.89 s wall, 800.5 MiB, 1622.84 ms a frame. R3a_cu 90.68 s, 790.1 MiB. Steps of group run r0448. Not 2-core times.
- Takes as a hint: `mode` and person boxes (`bboxes`).
- Hands off to: not tried.

**Segment Anything 2.1 tiny, through ultralytics 8.4.209** ([repo](https://github.com/facebookresearch/sam2)). Meta's model that cuts an object out of a picture or a video from a click.
- In: three 640x480 stills, R3a_cu frame 150 and R3a frames 100 and 300, each with 1 to 3 points set by hand. On R3a_cu they sit on the fretboard between the body and the hand. For video mode, R3a_cu frames 150-179 as a 30-frame MP4.
- Command or settings: `ultralytics.SAM` for stills and `ultralytics.models.sam.SAM2VideoPredictor` for video, checkpoint `sam2.1_t.pt` (78,105,722 bytes), points labelled 1 (foreground), video at `imgsz=1024` and `conf=0.25`, script `scripts/run_sam2.py`.
- Out: one mask per point (`results[0].masks.data`, true or false for each pixel) with a `conf` value each. R3a_cu frame 150 with 3 points: 3 masks at 0.8678, 0.8827 and 0.8729, together 27,394 px. By eye they cover the neck from the body to the headstock, broken by the hand, plus specks on the guitar body. R3a frame 100 with 2 points: the visible neck. R3a frame 300 (wide shot) with 2 points: 0.3479 and 0.8135, covering the player from head to feet and part of the guitar, not only the neck. Video mode: 3 masks on every frame, together 25,041 to 26,913 px.
- Time: 668.34 s wall and 1726.3 MiB peak for all six still calls plus the 30-frame video (step of group run r0448). Each still took 5.105-6.068 s. The video took 629.95 s for 30 frames, about 0.05 frames a second.
- Takes as a hint: points (label 1 or 0), boxes (`bboxes=`), `imgsz` and `conf`. No text prompt.
- Hands off to: OpenCV (r0400). The mask's largest piece, turned into a rectangle, became a second neck outline. That piece stops at the hand, so the straightened image starts at the hand, not the nut. LSD then found 13 fret-like and 50 string-like segments in it.

**Ultralytics YOLO26 pose, ultralytics 8.4.209** ([docs](https://docs.ultralytics.com/tasks/pose/)). A person detector with 17 body points per person and no finger points.
- In: R3a full and crop, R3a_cu, R3b and R3c frames. Ultralytics resizes every input to 640 px.
- Command or settings: `model.predict(frame, imgsz=640, conf=0.25, device="cpu")` with `yolo26n-pose.pt` (7,878,574 bytes) or `yolo26s-pose.pt` (24,151,790 bytes). A wrist counts as a hand when its confidence is 0.5 or more.
- Out: `results[0].keypoints.xy` (people x 17 x 2, in pixels), `.keypoints.conf` and `results[0].boxes`. The hands are the two wrist points. yolo26n on R3a full: both wrists in 540 of 540 frames. On wide-shot frame 300 it put the right wrist at (181, 204) with confidence 0.83, on the top edge of the music stand, where the picking hand is hidden. R3a_cu: the left wrist in 300 of 300 frames and the right in 36, with the picking hand out of the picture. R3b: left 450, right 199. R3c: both in 450 of 450.
- Time: yolo26n on R3a full 70.78 s wall, 463.3 MiB, 117.02 ms a frame. yolo26s on R3a full 167.16 s, 538.2 MiB, 292.67 ms a frame. Steps of group run r0448.
- Takes as a hint: `imgsz`, `conf`, `iou`, `classes`, `max_det` and `device`. Nothing about hands or guitars.
- Hands off to: not tried.

**ViTPose-s whole body, through rtmlib 0.0.16** ([repo](https://github.com/ViTAE-Transformer/ViTPose)). A transformer pose model with 133 whole-body points.
- In: every 6th frame of R3a (90 frames, full and crop), every 10th of R3b (45) and every 5th of R3a_cu (60), after the YOLOX person detector.
- Command or settings: `vitpose-s-wholebody.onnx` (97,427,067 bytes) from [easy_ViTPose](https://huggingface.co/JunkyByte/easy_ViTPose) on Hugging Face, the same script with `vitpose`.
- Out: `keypoints` (people x 133 x 2) and `scores`. R3a full: two hands in 90 of 90 frames. R3a_cu: the right-hand slot passed the 0.3 rule in 3 of 60 frames. R3b: 0, 1 and 2 hands in 0, 19 and 26 frames.
- Time: R3a full 112.09 s wall, 498.6 MiB, 1199.29 ms a frame (step of group run r0448). Not 2-core times.
- Takes as a hint: person boxes (`bboxes`), `backend`, `device`.
- Hands off to: not tried.

**YOLO-World v2 small, ultralytics 8.4.209** ([repo](https://github.com/AILab-CVC/YOLO-World)). AILab-CVC's open-vocabulary detector, here the copy that ships inside Ultralytics, with its text prompts read by OpenAI's CLIP ViT-B/32 text encoder. It ran in the later round.
- In: the ten pictures listed above, C1 whole, C1's lower part and the eight R3a and R3a_cu stills.
- Command or settings: `YOLOWorld("yolov8s-worldv2.pt")`, then `set_classes` with guitar, guitar neck, fretboard, headstock, capo and hand, and `conf` 0.05. Files `yolov8s-worldv2.pt` (25,923,032 bytes) and the CLIP file `ViT-B-32.pt` (353,976,522 bytes), downloaded for this run and deleted after it. Ultralytics saves the CLIP file in a `weights` folder inside whatever folder the program runs from.
- Out: `boxes` (xyxy, `conf` and which prompt), with no masks. On C1 whole and C1's lower part, nothing at 0.05 or more for any of the six prompts. On the eight earlier stills: "guitar" on all eight, with top values from 0.5267 to 0.8554, one "hand" box at 0.0767 on the R3a frame-100 crop, and nothing for guitar neck, fretboard, headstock or capo.
- Time: 10.63 s wall, 1793.4 MiB peak, 5.16 s setup and 0.19-0.31 s a picture (r0650).
- Takes as a hint: the prompt list (`set_classes`) and `conf`.
- Hands off to: not tried. Its xyxy boxes are the format rtmlib takes as `bboxes`.

**YOLOE-26s, ultralytics 8.4.209** ([docs](https://docs.ultralytics.com/models/yoloe/)). An open-vocabulary detector that also outlines each object, with its text prompts read by Apple's MobileCLIP2 text encoder.
- In: eight stills: R3a frames 100, 300 and 500, R3a crop frames 100 and 300, and R3a_cu frames 0, 150 and 280. In the later round, C1 whole and C1's lower part as well, with the same eight stills again (r0628).
- Command or settings: `model.set_classes(PROMPTS, model.get_text_pe(PROMPTS))` with `PROMPTS = guitar, guitar neck, fretboard, headstock, capo, hand`, then `predict(conf=0.05)`. Files `yoloe-26s-seg.pt` (31,072,171 bytes) and `mobileclip2_b.ts` (253,794,476 bytes). The first try failed with `ModuleNotFoundError: No module named 'pkg_resources'`, and installing `setuptools<81` fixed it.
- Out: `results[0].boxes` (xyxy, `conf` and which prompt) and `results[0].masks`, one mask per box. "guitar": 1 box at 0.25 or more on each of the 8 images, with top values from 0.339 to 0.877. "guitar neck", "headstock" and "capo": nothing at 0.05 or more on any image. "fretboard": 0.091 and 0.097 on the two crops. "hand": 0.071 and 0.096 on R3a_cu frames 0 and 150. Those four values are all below 0.25. On C1 it returned one box on each picture, both "fretboard": 0.051 on C1 whole, by its corners from the right part of the headstock down to the nut, and 0.0512 on the lower part, from the nut to the capo. No "capo", "guitar neck", "headstock" or "guitar" box on C1 reached 0.05. The eight stills gave the same boxes and values as the first run.
- Time: 16.00 s wall and 733.5 MiB, of which 7.52 s was setup and 0.33-0.81 s each image (step of group run r0448). The C1 run: 9.70 s wall, 727.3 MiB, 3.43 s setup and 0.23-0.41 s a picture (r0628).
- Takes as a hint: the prompt list (`set_classes`), `conf`, `imgsz`, and visual prompts (not used).
- Hands off to: not tried.

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

"Steps" means my agents wrote me steps to run it somewhere else, and the section numbers point into [for-aaron.md](https://github.com/aaronorelup/blog/blob/research/guitar-tab-tools/docs/guitar-tab-research/lanes/video-hands-fretboard/for-aaron.md). "Survey only" means they read its docs and didn't run it.

- **AllTracker** ([repo](https://github.com/aharley/alltracker)): survey only, and its README doesn't state CPU use. No steps.
- **AnyHand** ([repo](https://github.com/chen-si-cs/AnyHand)): found by the checking agent's web search, README not read. No steps.
- **CLIP ViT-B/32**, the OpenAI text encoder YOLO-World uses in Ultralytics: not run on its own. Its 353,976,522-byte file was over the 200 MB cap on new downloads. In the later round it was downloaded for YOLO-World's one run, as its text encoder, and deleted after it (see the YOLO-World entry). No steps of its own.
- **EgoHand v1** ([repo](https://github.com/NVIDIA/IsaacCapture)): survey only. Its README lists an NVIDIA GPU (`NVIDIA RTX 6000 Ada, L40, L20, or RTX PRO 6000 Blackwell`) and doesn't state CPU use. No steps.
- **FAH** ([repo](https://github.com/noahcao/FAH)): survey only, added by the checking agent. No steps.
- **Grounded-SAM-2** ([repo](https://github.com/IDEA-Research/Grounded-SAM-2)): survey only. No steps.
- **Hamba** ([repo](https://github.com/humansensinglab/Hamba)): needs the MANO hand model, a 3D model of the hand that these tools fit to the picture, which needs a registered account. Its weights are a Google Drive file. Its install sample is for CUDA 11.7, Nvidia's toolkit for graphics cards, and CPU use isn't stated. Steps: yes, section 2 step 4.
- **HaMeR** ([repo](https://github.com/geopavlakos/hamer)): needs MANO, and the MANO download page redirected the box to a login page. Its README's install example is for CUDA. The demo weights are a Google Drive file or a utexas.edu link, and the box's secure-connection check (TLS) failed on that link. Its web demo showed `BUILD_ERROR` on 2026-11-10. Steps: yes, section 2.
- **HaWoR** ([repo](https://github.com/ThunderVVV/HaWoR)): survey only. It needs MANO left and right, DROID-SLAM and Metric3D weights. Its README says it was tested `with PyTorch 1.13 and CUDA 11.7`. No steps.
- **HOPformer** ([model](https://huggingface.co/Sid2697/HOPformer)): found by the checking agent's web search. It's gated, meaning its page asks you to share your contact details before you can get it, and it wasn't read. No steps.
- **MANO hand model** ([site](https://mano.is.tue.mpg.de)): downloads need a registered account, and the box couldn't log in (`download.php` redirected to `login.php`). Steps: yes, section 2 step 1.
- **manopth** ([repo](https://github.com/hassony2/manopth)): survey only. No steps.
- **manotorch** ([repo](https://github.com/lixiny/manotorch)): survey only. No steps.
- **MediaPipe legacy JS solutions** ([package](https://www.npmjs.com/package/@mediapipe/hands)), `@mediapipe/hands` and `@mediapipe/holistic`: survey only. No steps.
- **ml5.js handPose** ([repo](https://github.com/ml5js/ml5-next-gen)): survey only. No steps.
- **MMPose 1.x** ([repo](https://github.com/open-mmlab/mmpose)): it needs a helper package, mmcv. OpenMMLab's ready-built CPU copies of mmcv were listed for PyTorch 2.4 and 2.1, and the page for PyTorch 2.15 answered 404, not found. My agents' setup had PyTorch 2.15.0+cpu, so MMPose would have needed a second, older PyTorch or a build of mmcv from source. The same disk note that set the 200 MB cap said `never install a second torch or tensorflow version if an existing venv can be reused`. Its `requirements/mminstall.txt` also requires `mmdet<3.3.0`. The same RTMPose, RTMW and DWPose models ran through rtmlib instead. No steps.
- **MobileCLIP2-B** ([card](https://huggingface.co/apple/MobileCLIP2-B)): not run on its own. It ran as YOLOE-26's text encoder. No steps.
- **ONNX Runtime 1.31.1** ([docs](https://onnxruntime.ai/docs/performance/tune-performance/threading.html)): not run on its own, only as rtmlib's backend. `onnxruntime-web` wasn't run by my video agents, and whether the RTMPose and RTMW files run in it wasn't checked. ONNX Runtime Web 1.31.1 ran other models in the section on metronome and sync (r0270, r0597). No steps.
- **OpenPose, the full CMU program** ([repo](https://github.com/CMU-Perceptual-Computing-Lab/openpose)): not built. Its body model, `body_pose_model.pth` at 209,267,595 bytes, was over the 200 MB cap, so only the hand network ran, through the PyTorch port. Steps: yes, section 8.
- **OV-DEIM** ([repo](https://gitee.com/lsreback/OV-DEIM)): found by the checking agent's web search, not read. No steps.
- **RF-DETR** ([repo](https://github.com/roboflow/rf-detr)): found by the checking agent's web search. README, weights and per-model terms not read. No steps.
- **Roboflow Inference** ([repo](https://github.com/roboflow/inference)): survey only. No steps.
- **Roboflow Universe guitar-neck and fret projects** ([one of them](https://universe.roboflow.com/code-and-chords/guitar-necks-detector-ogacd)): every Universe page answered HTTP 403 with a Cloudflare challenge page, the API answered 401 with `This method requires your API key.`, and my agents had no Roboflow key. Steps: yes, section 7.
- **SAM 3D Body** ([repo](https://github.com/facebookresearch/sam-3d-body)): survey only. Its weights are gated. No steps.
- **Sapiens** ([repo](https://github.com/facebookresearch/sapiens)): survey only, CPU use not stated. No steps.
- **Sapiens2** ([repo](https://github.com/facebookresearch/sapiens2)): survey only, added by the checking agent. Its README says it needs Python 3.12 or newer and PyTorch 2.7 or newer, and CPU use isn't stated. No steps.
- **Segment Anything 1** ([repo](https://github.com/facebookresearch/segment-anything)): survey only. No steps.
- **Segment Anything 3 and 3.1** ([repo](https://github.com/facebookresearch/sam3)): the model files on Hugging Face are gated with manual approval, requests without a login got HTTP 401, and my agents had no Hugging Face token. The README also lists a CUDA GPU. Steps: yes, section 3, through a demo page that needs no model access.
- **TAPIP3D** ([repo](https://github.com/zbw001/TAPIP3D)): found by the checking agent's web search, README not read. No steps.
- **TAPIR, BootsTAPIR, TAPNext and TAPNext++** ([repo](https://github.com/google-deepmind/tapnet)): the two BootsTAPIR model files, 218,886,140 and 218,887,028 bytes, and the TAPNext file, 776,980,182 bytes, were over the 200 MB cap. The TAPIR file, 124,348,474 bytes, was under it. The checking agent tried a 4-frame test of it, and the session's permission check, the rule on what code my agents may run, stopped it before it started. CoTracker3 ran as the point tracker instead. Steps: yes, section 6, in Google Colab.
- **TensorFlow.js hand-pose-detection** ([repo](https://github.com/tensorflow/tfjs-models)): survey only. No steps.
- **WeDetect** ([repo](https://github.com/wechatcv/WeDetect)): found by the checking agent's web search, README not read. No steps.
- **WiLoR** ([repo](https://github.com/rolpotamias/WiLoR)): tried, no output. The 3D hand mesh needs MANO, which needs a login. Its hand detector, loaded through Ultralytics, stopped with `ModuleNotFoundError: No module named 'dill'`. Installing `dill` to load the downloaded file was refused by the session's permission check. Steps: yes, section 1, in its Hugging Face demo.
- **WiLoR-mini** ([repo](https://github.com/warmshao/WiLoR-mini)): survey only. The `MANO_RIGHT.pkl` its code downloads from Hugging Face wasn't used, because of the MANO license's `No Distribution` clause. No steps.
- **YOLOE, THU-MIG repository** ([repo](https://github.com/THU-MIG/yoloe)): survey only. YOLOE-26 inside Ultralytics ran instead. No steps.
- **Papers and a talk with nothing to run**, no steps for any:
  - Bae, Kwon and Park, UIST Adjunct 2025: no code or data link in the PDF.
  - Burns and Wanderley, NIME 2006: no code link in the text read.
  - Goldstein and Moses, BMVC 2018: the code page reads `Code will be available soon.`
  - GuiFiR, IEEE Access 2026: no model code or weights found. The lab's link titled "Code" goes to its dataset's repository, which holds only data-preparation scripts and metadata, 13 files.
  - Paleari, Huet, Schutz and Slock, 2008: no code link found.
  - TapToTab, arXiv 2409.08618 (arXiv is a research-paper site): no code, data or weights link on its arXiv page.
  - You Just Play / Tabbers, a PyData Tel Aviv 2025 talk: a product described in the talk's abstract, with no code release mentioned. My apps agents found no product page, app or code for it.
- **Papers named in search results but not read**, no steps for any:
  - Asmar, Séoud and Bilodeau, 2021.
  - Canales and Jörg, year and venue not verified.
  - Duke and Salgian, year and venue not verified.
  - Hrybyk and Kim, year and venue not verified.
  - Kerdvibulvech and Saito, year and venue not verified.
  - "Monocular Biomechanical Tracking of Fingers", arXiv 2605.09258.
  - Scarr and Green, year and venue not verified.
- **Datasets, none of their videos or images downloaded**, no steps for any:
  - Ego-Exo4D needs signed licenses. Its site says `Sign the Ego-Exo4D Licenses, this will take 2 days to be approved`.
  - GAPS.
  - GigaHands ([project](https://ivl.cs.brown.edu/research/gigahands.html)), Brown University's set of two-hand activities filmed from 51 camera views, with 3D hand poses. Its videos, 1.06 TB, weren't downloaded. Two of its files were fetched to count its ukulele activity: its activity script has a "Playing the Ukulele" activity and no guitar, and 119 of the 13,787 rows of its text labels mention a ukulele. The larger file was deleted after counting. Its README says it's `released under the Creative Commons Attribution-NonCommercial 4.0 International License.`
  - Goldstein and Moses' 2018 GoPro clips.
  - GuiFiR-Synth and GuiFiR-Vid ([repo](https://github.com/kmu-ee-ailab/guifir_dataset)): not downloaded. The archive is a Google Drive file and the clips come from YouTube links. Its README lists per-frame labels that include the fret on each string and the capo position. Its terms say `The dataset assets are provided for non-commercial research, education, and reproducibility of the GuiFiR work.`
  - Guitar-TECHS: no video in its release.
  - PianoVAM: named in search results, not read.
  - The Ultralytics Hand Keypoints dataset.
  - WHIM.

</details>

<details><summary>Licenses of the tools that ran</summary>

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| CoTracker3 | CC BY-NC 4.0: `Attribution-NonCommercial 4.0 International` ([LICENSE.md](https://raw.githubusercontent.com/facebookresearch/co-tracker/main/LICENSE.md)) | CC BY-NC 4.0, card tag `license:cc-by-nc-4.0` ([card](https://huggingface.co/facebook/cotracker3)) | Kubric, license not recorded |
| DWPose-l | Apache-2.0 | Apache-2.0 on the Hugging Face card yzd-v/DWPose. The run used the ONNX file from download.openmmlab.com, where no separate weights license was found | COCO-WholeBody: `COCO-WholeBody dataset is **ONLY** for research and non-commercial use.` ([README](https://raw.githubusercontent.com/jin-s13/COCO-WholeBody/master/README.md)). UBody: the terms of its download form weren't read |
| Grounding DINO tiny | Apache-2.0 (IDEA Research's repository) | `license: apache-2.0` on the Hugging Face card of `IDEA-Research/grounding-dino-tiny`, where the run's model file came from | the README lists `O365,GoldG,Cap4M` as the pre-training data of its SwinT-OGC model, their licenses not read |
| MediaPipe Hand Landmarker | Apache-2.0 | Apache 2.0 (model card) | Google's hand page says `The model was trained on approximately 30K real-world images, as well as several rendered synthetic hand models imposed over various backgrounds.` No public dataset or dataset license is named |
| MediaPipe Holistic Landmarker | Apache-2.0 | Apache 2.0 on all three of its model cards: BlazePose GHUM 3D for the body, Face Mesh V2 for the face and the hand card | no public dataset or dataset license named on its model cards |
| MediaPipe legacy Hands 0.10.21 | Apache-2.0 | bundled in the wheel, no separate license read | not recorded by my agents |
| MediaPipe Pose Landmarker (heavy) | Apache-2.0 | Apache 2.0 (BlazePose GHUM 3D model card) | no public dataset or dataset license named on its model card |
| OpenCV 5.0.0 | Apache-2.0 (the contrib modules weren't checked one by one) | none | none |
| OpenPose hand model, PyTorch port | the port has no license file at commit 5ee71dc, and its README doesn't mention one. GitHub's own license field wasn't read. OpenPose's license is titled `SOFTWARE LICENSE AGREEMENT ACADEMIC OR NON-PROFIT ORGANIZATION NONCOMMERCIAL RESEARCH USE ONLY` ([LICENSE](https://raw.githubusercontent.com/CMU-Perceptual-Computing-Lab/openpose/master/LICENSE)) | card tag `license: other` on Hugging Face `lllyasviel/Annotators`, with no license text. The same account's code that downloads this file, in `lllyasviel/ControlNet-v1-1-nightly`, has CMU's OpenPose license in its folder ([LICENSE](https://raw.githubusercontent.com/lllyasviel/ControlNet-v1-1-nightly/main/annotator/openpose/LICENSE)). Whether OpenPose's license covers these converted weights isn't stated in the text read | the image sets named in the hand paper OpenPose cites, their licenses not read. Which of the paper's models this file is isn't stated |
| OWLv2 base | Apache-2.0 (scenic) | Apache-2.0. The card says `The model is intended as a research output for research communities.` ([card](https://huggingface.co/google/owlv2-base-patch16-ensemble)) | the card's data lines name OWL-ViT and end `(to be updated for v2)`. They say `The CLIP backbone of the model was trained on publicly available image-caption data.` and name COCO and OpenImages for fine-tuning. Their licenses aren't stated on the card |
| rtmlib, RTMPose hand | Apache-2.0 (rtmlib and MMPose) | no separate license found on the README or the download links | COCO-WholeBody `**ONLY** for research and non-commercial use` ([README](https://raw.githubusercontent.com/jin-s13/COCO-WholeBody/master/README.md)), OneHand10K `ONLY for research and non-commercial use` ([page](https://www.yangangwang.com/papers/WANG-MCC-2018-10.html)), FreiHAND and RHD `Any commercial use is prohibited.` ([FreiHAND](https://raw.githubusercontent.com/lmb-freiburg/freihand/master/README.md), [RHD](https://lmb.informatik.uni-freiburg.de/resources/datasets/RenderedHandposeDataset.en.html)), Halpe-FullBody with no license found |
| RTMW-x-l | Apache-2.0 (MMPose) | no separate license found | its hand sets include the ones in the row above, plus InterHand2.6M, `Attribution-NonCommercial 4.0 International` ([LICENSE](https://raw.githubusercontent.com/facebookresearch/InterHand2.6M/main/LICENSE)), and UBody, whose form terms weren't read |
| Segment Anything 2.1 tiny | Apache 2.0 (Meta's SAM 2 code). The run called it through the Ultralytics package, AGPL-3.0 (YOLO26 row) | Apache-2.0 on Meta's Hugging Face cards. The run used Ultralytics' copy, `sam2.1_t.pt` | SA-V, CC BY 4.0 |
| Ultralytics YOLO26 pose | AGPL-3.0, section 13: `if you modify the Program, your modified version must prominently offer all users interacting with it remotely through a computer network (if your version supports such interaction) an opportunity to receive the Corresponding Source of your version` ([LICENSE](https://raw.githubusercontent.com/ultralytics/ultralytics/main/LICENSE)) | no separate weights license file. Ultralytics' license page: `An Enterprise License is required if you want to use Ultralytics YOLO without open-sourcing your entire project.` Its listed triggers include `SaaS platforms, APIs, or cloud systems that use YOLO behind the scenes` ([page](https://www.ultralytics.com/license)). No price is published | COCO-Pose, the COCO terms weren't quoted |
| ViTPose-s whole body | Apache-2.0 | ONNX file from easy_ViTPose on Hugging Face. Its card's metadata has no license field, and its License section says `Refer to official https://github.com/ViTAE-Transformer/ViTPose/blob/main/LICENSE for model license`, which is the Apache-2.0 license | not stated for this file. ViTPose's README lists one small whole-body model, ViTPose++-S, trained on `COCO+AIC+MPII+AP10K+APT36K+WholeBody`, COCO-WholeBody among them. That this file was converted from it isn't stated |
| YOLO-World v2 small | GPL-3.0: `GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007` ([repo](https://github.com/AILab-CVC/YOLO-World)). Its README says `For business licensing and other related inquiries, don't hesitate to contact` and gives a Tencent address. The run used the copy inside the Ultralytics package, AGPL-3.0, with the same Ultralytics terms as the YOLO26 row | `yolov8s-worldv2.pt` came from the `ultralytics/assets` release v8.4.0, and that repository's LICENSE is AGPL-3.0 ([LICENSE](https://raw.githubusercontent.com/ultralytics/assets/main/LICENSE)). Whether it covers the release files isn't verified. The terms of the CLIP ViT-B/32 file weren't read | not recorded by my agents |
| YOLOE-26s | AGPL-3.0, the same Ultralytics terms as the YOLO26 row | `yoloe-26s-seg.pt` came from the same `ultralytics/assets` release v8.4.0, whose repository LICENSE is AGPL-3.0, and whether that covers the release files isn't verified either. YOLOE-26 reads its prompts with Ultralytics' own export of Apple's MobileCLIP2-B, whose license grants use `exclusively for Research Purposes.` and says `“Research Purposes” does not include any commercial exploitation, product development or use in any commercial product or service.` ([LICENSE](https://huggingface.co/apple/MobileCLIP2-B/raw/main/LICENSE)). Which terms Ultralytics applies to its own export of it is unverified | the datasets named on Ultralytics' YOLOE page and in the YOLOE-26 paper, their licenses not read |

Every clause, quoted in full with its link and the date it was read, is in [survey.md](https://github.com/aaronorelup/blog/blob/research/guitar-tab-tools/docs/guitar-tab-research/lanes/video-hands-fretboard/survey.md), in [my agents' research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/video-hands-fretboard).

</details>

## Showing, editing and playing a tab in the browser

The app's tab screen would draw the tab, play it and let you fix a wrong string or fret. My agents listed 80 entries for it, and 18 ran on the cloud box, fed known tabs instead of audio. In abcjs and VexTab, typing over one note's text changed that one fret number and none of the other 89.

<ao-compare cols="2" aspect="4/3">
<figure><img src="/media/guitar-tab-tools/web-tab-render-abcjs-sounding-pitch.webp" alt="Music drawn by abcjs under a title: three rows of four bars, low notes hanging on ledger lines below the staff, and under each row a tab staff where many of the fret numbers are question marks."><figcaption><b>abcjs 6.7.2, ABC at sounding pitch</b><span class="ao-meta">S2n's known notes written in ABC, a text notation for tunes, at the pitch they sound. 42 of the 90 tab positions came out as question marks. First 12 of 13 bars.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/web-tab-render-abcjs-written-pitch.webp" alt="The same music drawn by abcjs from ABC one octave higher: three rows of four bars with the notes sitting on the staff, and a fret number at every position on the tab staff below each row."><figcaption><b>abcjs 6.7.2, ABC an octave up</b><span class="ao-meta">The same notes written an octave higher, the way guitar music is notated. All 90 tab positions came out as fret numbers. First 12 of 13 bars.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/web-tab-render-alphatab-s2n.webp" alt="Guitar music drawn by alphaTab: 13 bars in three rows, each a notation staff above a six-line tab staff with fret numbers, the bass notes in grey, a tempo mark of 112 at the top left and a small alphaTab.net mark at the top right."><figcaption><b>alphaTab 1.9.0</b><span class="ao-meta"><code>S2n.gp5</code>, the known tab as a Guitar Pro file, drawn in Chrome running with no window. Notation over tab, all 13 bars.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/web-tab-render-alphatab-monaco-edit.webp" alt="A code editor full of alphaTex, numbered lines of numbers such as 3.2.4, with line 11 reading 2.3.4 5.4.4 3.2.4 3.2.4. Below it, alphaTab's drawing of the first 6 bars, notation over a six-line tab staff, with a 2 and a 5 in the first bar of music and a small alphaTab.net mark at the top right."><figcaption><b>@coderline/alphatab-monaco 1.9.0</b><span class="ao-meta">S2n's known tab as alphaTex, alphaTab's text format, in the Monaco code editor, after a new fret and a new string were typed on line 11. Below, the first 6 of the 13 bars as alphaTab redrew them. The new 5 is drawn over the bass's 0 on the same string.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/web-tab-render-musescore3-s2n.webp" alt="The first page MuseScore 3.2.3 made from the same Guitar Pro file: a title, then 13 bars of standard notation on one staff in two rows, and no tab staff."><figcaption><b>MuseScore 3.2.3</b><span class="ao-meta">The same <code>S2n.gp5</code> opened from the command line. Page 1 has no tab staff, the six lines with fret numbers. The saved file also holds a part named Guitar, the music for one instrument on its own, and that part has a tab staff.</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

Every tool here got files made from the known answers, never audio, so each count is against a known tab (guitar music written as fret numbers on six lines). Mostly that was S2n, a 29-second fingerstyle clip I synthesized so every note is known. S5capo2 is the same piece with a capo (a clamp across the strings that raises every note) on fret 2. S5dropd is the same piece in Drop D, with the low string tuned down to D and the bass re-fingered. A note is matched when it starts within 50 ms of a known note with the same pitch. "Shared" means the run wasn't pinned to 2 of the box's 4 cores, so it ran while up to two timed jobs of other lanes used the processor. Wall time is start to finish on the clock. Peak memory is the most memory the run used at once, from my agents' log of every run. Everything ran on the box, at no cost beyond the cloud session.

**abcjs 6.7.2** ([link](https://github.com/paulrosen/abcjs)). A JavaScript library that draws ABC, a text notation for tunes, as sheet music, and can add a tab line under it.

- In: the known notes of S2n, S5capo2 and S5dropd, written as ABC text by my agents' script `truth_to_abc.py`. ABC has no string or fret, so abcjs picks them.
- Command or settings: `ABCJS.renderAbc(div, abc, {add_classes: true, staffwidth: 1150, tablature: [...]})` in headless Chrome (a browser running with no window), with `capo: 2` for S5capo2 and `tuning: ['D,', 'A,', 'D', 'G', 'B', 'e']` for S5dropd. For editing, `new ABCJS.Editor('abc', {canvas_id, abcjsParams: {tablature: [...]}})` on a text box.
- Out: SVG, a drawing format for web pages, with notation and a tab line. With the ABC at the pitch the notes sound, 42 of the 90 tab positions were drawn as `?` (r0239). Written one octave up, all 90 were fret numbers. Read back from the SVG, all 90 had the known string and fret in S2n, in S5capo2 with capo 2 and in S5dropd (e1332, e1333, e1334). The first count of the S2n read-back gave 88 of 90 (e0638) because of how the read-back timed the notes, not because of the strings abcjs chose. Editing: typing `A4` over the first melody note `G4` in the text box changed the first tab number from 0 to 2, and the other 89 stayed the same (r0312). Clicking and dragging on the drawing were tried later, with `dragging: true` and a `clickListener` (r0598). A click on a note head or on its tab number passed the page that note's place in the ABC text. A drag moved only the drawing, in steps of 3.875 px, and passed the page a step count. Dragging a tab number down to the next line of the tab passed the page 3 of those steps. The ABC text and all 90 tab numbers stayed the same. With `selectTypes` set, ArrowUp and Enter on a clicked note head did the same as a drag up. abcjs's docs say `The underlying music is not changed to reflect the user's action. The clickListener function should modify the ABC string and rerender if the user has made a change.` When the page's own code rewrote the ABC from the steps of three drags, 3 of the 90 tab numbers changed. Read back and compared by note order, 87 of 90 matched, since the three moved notes have new pitches, and all 87 were on the known string and fret (e1763). In the `ABCJS.Editor` page, clicking a tab number selected that note's ABC in the text box, and typing over two notes changed 2 of the 90. Compared the same way, 88 of 90 matched, all 88 on the known string and fret (e1764). Dragging up gave a negative step, and the docs say `A negative number means that the note was dragged flatter`. Where an edit made an F sharp, abcjs put it on string 4, fret 4, where the bass's open D also starts at that moment, and drew the two numbers on top of each other.
- Time: shared, 2.2 s wall for the whole run with Chrome's start, 123.6 MB peak, and 141 ms for the drawing inside the page (r0241). The click and drag run, five fresh pages in one browser, took 12.63 s wall on 2 cores, 141.6 MB peak (r0598).
- Takes as a hint: `tablature[].tuning` (the open strings, played with no finger down, lowest first) and `tablature[].capo`. Its options also include `highestNote`, which wasn't tried. ABC has no way to say which string a note is on, and whether abcjs can be made to use a given string was not verified. In its 6.7.2 source, my agents found no input for a note's string: a single note goes on the highest-pitched string whose open pitch is at or below the note. For editing on the drawing it takes `dragging`, a `clickListener` and `selectTypes`.
- Hands off to: the edited ABC text is the saved file. My agents read the fret numbers back from the SVG's `text.abcjs-tab-number` elements to count them. Its player wasn't tried.

**alphaTab 1.9.0** ([link](https://github.com/CoderLine/alphaTab)). A library for web pages that reads Guitar Pro, MusicXML (a sheet-music file format) and its own text format alphaTex, draws notation and tab, and plays them with its own synthesizer.

- In: `S2n.gp5`, `S5capo2.gp5` and `S5dropd.gp5`, the known tabs as Guitar Pro 5 files (the format of the Guitar Pro tab program), written with PyGuitarPro when the clips were made. Also alphaTex and MusicXML with a tab staff that my agents wrote from the same known tabs, and files the other tools wrote.
- Command or settings: in Node.js (JavaScript outside a browser), `alphaTab.importer.ScoreLoader.loadScoreFromBytes()`, then `exporter.Gp7Exporter` and `exporter.AlphaTexExporter`, then both files opened again. In headless Chrome, the player with `player.enablePlayer: true`, `playerMode: EnabledSynthesizer` and the bundled `sonivox.sf2`, then `api.play()` and `api.exportAudio()`. Metronome click (a tick on every beat) and count-in (one bar of ticks before the song starts): `api.metronomeVolume = 1` and `api.countInVolume = 1`.
- Out:
  - Reading: 90 of 90 notes on the known string and fret in each of the three files, with capo 2 and the Drop D tuning read (e0004, e0008, e0012). Saved as a Guitar Pro 7 `.gp` file and opened again, 90 of 90 each (e0005, e0009, e0015). Saved as alphaTex and opened again, 90 of 90 each (e0006, e0010, e0016). alphaTex and MusicXML written from the known tabs, 90 of 90 each (e0024, e0026, e0028, e0843, e0847, e0852). Each note in its data has `string`, `fret` and `realValue` (the sounding pitch), and its string numbers run the other way from the files, with 1 the lowest string.
  - Drawing: notation above a six-line tab, 13 bars in three rows, no errors in the browser's log (r0059). For S5capo2 it printed `Capo. fret 2` above the first bar, the tab counted frets from the capo and the notation showed the sounding pitches (r0066). Every drawing of these 13-bar pieces has a small `alphaTab.net` mark at the top right.
  - MIDI, a list of notes with start times: 90 notes, all 90 matched (e0007).
  - Playing S2n (r0128): 90 note events, 52 metronome events (13 bars of 4 beats, sent even with the metronome's volume at 0), and `playerFinished` 27,994 ms after `play()`. Each note event came 121.9 to 139.1 ms after its place in the song, median 130.8 ms. These are event times in a browser with no sound card, not sound at a speaker. A rerun that wasn't pinned to 2 cores had a median of 99.6 ms (r0406). With the count-in and the metronome on, 4 extra metronome ticks came first, and alphaTab's first report of where it was in the song came 2,287.9 ms after `play()` (r0317). The exported audio file, a WAV, is 27.858 s long.
  - Transposing moves every note up or down by the same number of semitones, and one fret is one semitone. After `api.changeTrackTranspositionPitch(tracks, 2)` the first melody note of the exported audio still measured 195.78 Hz. With the export option `trackTranspositionPitches` set to 2 it measured 219.75 Hz, two semitones up (r0328). At `api.playbackSpeed = 2.0` the play-through ended 14,053.7 ms after `play()` (r0317). Whether the live sound followed `api.playbackSpeed = 2.0` and `api.changeTrackTranspositionPitch(tracks, 2)` wasn't checked, since the box has no sound card.
  - Editing: a mouse click on a drawn note gave one `beatMouseDown` event once the player was ready, and no `noteMouseDown` (r0134). Setting the first melody note's `fret` from 0 to 2 in its data and calling `api.render()` redrew the tab, and the saved `.gp` had that note on string 3, fret 2 (r0132). Setting the second melody note's `string` and `fret` the same way moved its G from string 3, fret 0 to string 4, fret 5, counted from the top, where the bass's open D also starts at that moment. alphaTab drew and saved both, with nothing in the browser's log. The saved `.gp` read back with 90 of 90 matched and 89 of 90 on the known string and fret (r0624, e1826). No editor screen was found in the package alphaTab puts on npm, the public store for JavaScript libraries. Its makers' separate alphaTex editor packages ran too (@coderline/alphatab-monaco, below).
  - The melody of the first bar after the file's silent count-in bar, from its alphaTex export, each note as fret, string and length:

  ```text
        |
          0.3.4
          0.3.4
          3.2.4
          3.2.4
        |
  ```

- Time: reading, saving and reopening S2n took 0.30 s wall on 2 cores, 83.1 MB peak (r0020). Drawing S2n, shared, took 703 ms from the start of the driver script to the finished drawing, Chrome's start included (r0059). Playing it through with the audio export took 53.81 s wall on 2 cores, 28 s of it playback, 737.8 MB peak (r0128). The string change took 1.10 s wall on 2 cores, 138.8 MB peak (r0624).
- Takes as a hint: capo (`Staff.capo`, or `\capo` in alphaTex), tuning and string count (`Staff.stringTuning`, `\tuning`), and each note's `string` and `fret`. In alphaTex, tempo is `\tempo` and the time signature (beats per bar) is `\ts`. The player takes `api.playbackSpeed`, `api.metronomeVolume`, `api.countInVolume` and `api.changeTrackTranspositionPitch()`. alphaTab also has `api.playbackRange`, `api.isLooping` and, in its docs, sync points to a recording (`FlatSyncPoint`). None of those three were tried.
- Hands off to: its `.gp` file opened in TuxGuitar with 90 of 90 (e0477) and in webmscore (r0290). MuseScore 3.2.3 refused it with `unknown file suffix <gp>` (r0178) and guitarpro-parser with `GuitarProError: Cannot read this Guitar Pro 7+ (.gp) file (track 1): staff 1 of track 0 has a FretCount property without <Number>.` (r0298). It has no exporter for MusicXML or for MEI, another sheet-music file format.

**ChordSheetJS 18.0.0** ([link](https://github.com/martijnversluis/ChordSheetJS)). A JavaScript library that reads and writes chord sheets, chord names over lyrics, and transposes them.

- In: a ChordPro sheet, a text format for chords over lyrics, written from the chord labels of S3, a synthesized strummed-chord clip (`S3.chordpro`).
- Command or settings: `ChordProParser`, `TextFormatter`, `HtmlDivFormatter`, `song.transpose(2)` then `ChordProFormatter`, and `ChordsOverWordsParser`.
- Out: it read the title, key `G`, tempo `96`, capo `0` and the 9 chords `G Em Am D7 G Em C D7 G` (my agents' converter had written the A minor 7 as `Am`). `HtmlDivFormatter` gave 919 characters of HTML. Transposed up 2 it gave `{key: A}` and this line:

  ```text
  [A]la [F#m]la [Bm]la [E7]la [A]la [F#m]la [D]la [E7]la [A]la
  ```

- Time: shared, 1.24 s wall for the run it shared with Tonal, 88.1 MB peak (r0251).
- Takes as a hint: ChordPro's `{capo}`, `{key}` and `{tempo}`, and `transpose(n)`.
- Hands off to: nothing was fed from it. ChordPro's makers say of a `{start_of_tab}` block, the format's section for guitar tab, `The lines will not be folded or changed.` No tab block was tried with ChordSheetJS.

**@coderline/alphatab-monaco 1.9.0 and @coderline/alphatab-language-server 1.9.0** ([link](https://github.com/CoderLine/alphaTab)). Two packages from the alphaTab project for typing alphaTex in Monaco, a code editor that runs in a web page. The language server is the helper behind the editor. It checks the text with alphaTab's own alphaTex reader, `AlphaTexImporter`, marks errors and suggests what to type. The Monaco package carries its own copy of the language server's code. The Monaco package's README says `This package is still in a very experimental stage.`

- In: S2n's known tab as alphaTex, `S2n.truth.atex` (864 bytes), which my agents wrote from the known answers. Every edit was made in the editor with the mouse and the keyboard, by a script.
- Command or settings: `npm install --no-audit --no-fund --ignore-scripts @coderline/alphatab-monaco@1.9.0` added 14 packages, 125 MB, 105 MB of it `monaco-editor` 0.57.0. esbuild 0.25.12 packed them into files a web page can load (r0604). The page wires the editor with `registerAlphaTexGrammar`, `addTextMateGrammarSupport` and `basicEditorLspIntegration` with `diagnosticsDelay: 150`, the way the source of the alphatab.net playground, alphaTab's own test page, does. Under the editor, alphaTab 1.9.0 draws the editor's text with `api.tex(text)` 250 ms after the last change. Nothing in the package draws music or connects the editor to alphaTab, so that redraw is the page's own code, as it is in the playground's.
- Out (r0614):
  - A fret: double-clicking the `0` of the first melody note on line 11 and typing `2` gave `2.3.4 0.3.4 3.2.4 3.2.4 |`, and alphaTab drew string 3, fret 2. alphaTex writes each note as fret, string and length, with string 1 the highest.
  - A string: on the second note, typing `5` over the fret and `4` over the string gave `2.3.4 5.4.4 3.2.4 3.2.4 |`. alphaTab drew the same G on string 4, fret 5, where the bass's open D also starts at that moment. The language server reported nothing, the `5` was drawn over the bass's grey `0`, and the saved `.gp` kept both notes on string 4.
  - String 7: typing `7` as a bass note's string got a red underline and the language server's message `Note string is out of range. Available range: 1-6`, code `AT208`. alphaTab didn't redraw and kept the drawing from before. Control+Z put the text back, and alphaTab redrew it.
  - A capo: typing `\ca` on a new line under the `\tuning` line opened a list of 12 suggestions, the first `\capo, Set the capo fret, Function`. While `\ca` stood in the text, alphaTab reported `Error AT204(7,1)->(7,4): Unrecognized metadata 'ca'.` and kept the previous drawing. Finished as `\capo 2`, the tab was drawn with capo 2, the same frets and strings, and the first two notes sounding at MIDI notes 59 and 57 instead of 57 and 55.
  - Saved by the page and read back under Node.js (r0618): after the string edit, the Guitar Pro 7 `.gp` (4,691 bytes) and the editor's own text each gave 89 of 90 matched, since the first note is now an A, not the known G, and 88 of those 89 on the known string and fret. The other one is the moved note (e1780, e1782). After the capo edit, the `.gp` checked against S5capo2 gave 89 of 90 matched and 88 of 89, with capo 2 in the file as in the known tab (e1784).
  - A rerun with the page served from the bundles, after every installed package but `vscode-oniguruma` was deleted, gave byte-identical files and the same notes and error markers at every step (r0663).
- Time: the bundles took 1.25 s wall on 2 cores, 384.6 MB peak, to build (r0604), and come to 8.2 MB, 6,287,979 bytes of it `editor.js`. The run with every edit took 12.84 s wall on 2 cores, 144.8 MB peak. In the page, the language server was ready in 327.6 ms and alphaTab's first drawing was done at 656.0 ms (r0614). Two reruns gave 180.0 and 448.9 ms (r0663) and 348.7 and 674.1 ms (r0678).
- Takes as a hint: whatever alphaTex alphaTab accepts, such as `\capo` and `\tuning` lines and each note's fret and string. A string outside 1 to 6 was refused with `AT208`.
- Hands off to: alphaTab, which drew the edited alphaTex and saved it as `.gp` and alphaTex (r0614, r0618). Whether the edits behave the same in the live alphatab.net playground wasn't checked.

**guitarpro-parser 2.0.0** ([link](https://github.com/emilienbev/guitarpro-parser)). A TypeScript library that reads Guitar Pro files and computes when each note plays, in milliseconds.

- In: `S2n.gp5`, `S5capo2.gp5`, `S5dropd.gp5`, TuxGuitar's GP3 of S2n, and alphaTab's `.gp` of S2n.
- Command or settings: `parseGuitarPro(bytes)`, `buildTimeline(song)` and `scheduleTrack(song, track, timeline)` in Node.js.
- Out: a note list with `string` (0 is the highest string), `fret`, `midi`, `startMs`, `endMs` and playing marks such as `palmMute` and `letRing`. Each of the four Guitar Pro 3 and 5 files gave 90 notes, all 90 on the known string and fret, with tuning and capo read (e1101, e1103, e1105, e1110). alphaTab's `.gp` was refused (r0298):

  ```text
  GuitarProError: Cannot read this Guitar Pro 7+ (.gp) file (track 1): staff 1 of track 0 has a FretCount property without <Number>.
  ```

- Time: shared, 0.15 s wall, 54.4 MB peak, with 21.6 ms for the parse itself (r0294).
- Takes as a hint: none.
- Hands off to: my agents wrote its notes to JSON for counting. No writer was named in the parts of its README my agents read, and whether it can write a file was not verified.

**LilyPond 2.24.3** ([link](https://lilypond.org/)). A program that turns a text file into printed music. Its `TabStaff` draws tab and picks the string for each note itself when the file doesn't say.

- In: the known notes, without strings, written as `.ly` text by `truth_to_lilypond.py`. The synthesized clips were S1 (a single-note melody), S2n, S5capo2 and S5dropd. The real ones were R1a, R1b and R1c, solo guitar recordings from the GuitarSet dataset, which marks the string of every note. TabStaff has no capo setting, so for S5capo2 the tuning was raised 2 semitones instead.
- Command or settings: `lilypond --png -dresolution=100 -o <out> <in>.ly`
- Out: PNG and MIDI. The strings LilyPond picked, against the known tab: S1 62 of 62 notes on the same string and fret (e0413), S2n 90 of 90 (e0399), S5capo2 90 of 90 (e0415), S5dropd 90 of 90 (e0414). For the three real clips, matched by note order: R1a 104 of 188 (e0416), R1b 33 of 70 (e0417), R1c 127 of 145 (e0418). The rest of the matched notes in those three sat on a higher-pitched string than the one GuitarSet marks, one string up (R1a 64, R1b 37, R1c 18) or two (R1a 20). In R1a LilyPond left out one of the 189 notes with `warning: No string for pitch #<Pitch ais, > (given frets (4 1))`, and in R1c my agents' input script had merged 3 of the 148. My string-and-fret agents ran the same LilyPond on the same notes with their own script and matched them by time: R1a 104 of 189, R1b 32 of 70, R1c 129 of 148 (e0182 to e0184). The MIDI holds every note twice, once per staff, so 180 notes for S2n (e0400).
- Time: S2n, shared, 4.76 s wall, 2.25 s CPU, 82 MB peak (r0197).
- Takes as a hint: `stringTunings` (any tuning), a string number on a note (for example `g4\3`), and `minimumFret`, `maximumFretStretch` and `restrainOpenStrings`, which weren't tried in this step. My string-and-fret agents tried `minimumFret`, `restrainOpenStrings` and a string number on one note (r0155). No capo setting for tab.
- Hands off to: my agents read the picked strings from its log into the tool they used to count notes against the known tab. It writes PDF, PNG, SVG and MIDI.

**MuseScore 3.2.3** ([link](https://github.com/musescore/MuseScore)). The open-source MuseScore notation program, run from its command line with no window. This is the Ubuntu package `musescore3`. The current MuseScore Studio 4.7.6 wasn't run.

- In: `S2n.gp5`, `S5capo2.gp5`, `S5dropd.gp5`, alphaTab's `.gp` of S2n, MusicXML with a tab staff written from the known tabs of S2n and S5capo2, and music21's tab-only MusicXML.
- Command or settings: `mscore3 -o <out.ext> <in>`, with `QT_QPA_PLATFORM=offscreen` set. Without that setting it stopped with `This application failed to start because no Qt platform plugin could be initialized.` (r0403).
- Out: from a Guitar Pro 5 file it made one notation staff and no tab staff, and that is what its exports hold. The saved `.mscx` file also holds a part named "Guitar" with a linked six-line tab staff. The MusicXML has no string, fret, tuning or tab clef, and my agents' counting tool refused it with `MusicXML has no part with <string>/<fret> technical marks` (e0141). The MIDI: 90 of 90 matched (e0145). From `S5capo2.gp5` the capo became the text `Capo. fret 2` and the MIDI came out 2 semitones low, 0 of 90 matched, and 90 of 90 with 2 semitones added (e0374, e0376). S5dropd's MIDI: 90 of 90 (e0378). alphaTab's `.gp`: refused with `unknown file suffix <gp>` (r0178). From MusicXML with a tab staff, it kept the tab staff, the tuning and all 90 strings and frets (e0367). From the S5capo2 MusicXML, the `<capo>` was gone and 0 of 90 notes kept the known string and fret. 54 stayed on their string, with the fret counted from the nut (the end of the neck where the strings start) instead of from the capo, so 2 higher. 36 moved to the next higher-pitched string (e0368). From music21's file, which has no tuning, it logged `no instrument found for part`, wrote all six tuning lines as `C-1` (MIDI note 0), and 4 of 90 notes kept their string and fret (e0369).
- Time: `S2n.gp5` to MusicXML, shared, 0.47 s wall, 79.3 MB peak (r0120).
- Takes as a hint: none for string, fret, capo or tuning on the command line.
- Hands off to: its MusicXML of `S2n.gp5` drew with no tab staff in OpenSheetMusicDisplay (r0163) and Verovio (r0168), and opened in alphaTab with no string or fret on any of its 90 notes (e0792).

**music21 10.5.2** ([link](https://github.com/cuthbertLab/music21)). A Python toolkit that reads and writes music files.

- In: S2n's known tab, built into a music21 `stream.Score` by `music21_truth_to_musicxml.py`.
- Command or settings: each note with `articulations.StringIndication(string)` and `articulations.FretIndication(fret)`, then `score.write('musicxml')` and `converter.parse()`. The tab-only version used `clef.TabClef()` and `layout.StaffLayout(staffLines=6)`.
- Out: MusicXML 4.0 with `<string>` and `<fret>` on all 90 notes, read back with 90 of 90 on the known string and fret (e0191, e0193). The file has no `<staff-tuning>` and no `<capo>`, and the writer's source has the comments `# TODO: staff-tuning` and `# TODO: capo` at that spot.
- Time: shared, 1.64 s wall, 1.3 s CPU, 69.9 MB peak (r0153).
- Takes as a hint: string and fret on each note. It doesn't write tuning or capo.
- Hands off to: OpenSheetMusicDisplay drew its tab-only file with string and fret (r0161). alphaTab opened it with no string or fret (e0908). MuseScore 3.2.3 wrote its tuning as `C-1` (e0369, above).

**OpenSheetMusicDisplay 2.3.0** ([link](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay)). A library for web pages that draws MusicXML, built on VexFlow.

- In: MusicXML with a tab staff written from the known tabs of S2n (notation plus tab, and tab only) and S5capo2, music21's tab-only MusicXML, and MuseScore 3.2.3's MusicXML of `S2n.gp5`.
- Command or settings: `new OpenSheetMusicDisplay(div, {backend: 'svg', drawTitle: true})`, `load(xmlString)` and `render()` in headless Chrome.
- Out: SVG. S2n notation plus tab: both staves, 180 notes, 90 of them with string and fret on the tab staff (r0158). S5capo2: the same, with three sharps on the notation staff and no capo text anywhere (r0159). S2n tab only: 90 of 90 with string and fret (r0160). music21's file: 90 of 90 (r0161). MuseScore 3.2.3's file: notation only, 90 notes, 0 with string and fret (r0163). Bar numbers start at 0.
- Time: shared, 2.56 s wall, 123.5 MB peak, with 80.5 ms to load and 205.5 ms in all inside the page (r0158).
- Takes as a hint: none for string, fret, capo or tuning. It draws what the file says.
- Hands off to: drawing only. Its README says `OSMD on its own does not support playback`, and playback wasn't tried.

**PyGuitarPro 0.11** ([link](https://github.com/Perlence/PyGuitarPro)). A Python library that reads and writes Guitar Pro 3, 4 and 5 files.

- In: `S2n.gp5`.
- Command or settings: `guitarpro.parse` and `guitarpro.write` in `pyguitarpro_trial.py`.
- Out: tempo 112, tuning `[(1, 64), (2, 59), (3, 55), (4, 50), (5, 45), (6, 40)]` with string 1 the highest, capo (`offset`) 0, and 90 notes with `string` and `value` (the fret). Saved as GP5, 90 of 90 on the known string and fret (e0574). Saved as GP4 or GP3, 42 notes, only the first voice (the melody), with the bass voice missing (e0578, e0581). A test edit like a user's correction moved the first melody note to string 4, fret 5, set the capo to 1 and tuned the low string to D, and alphaTab opened the saved GP5 with those three changes.
- Time: shared, 0.61 s wall, 23.1 MB peak, with 0.011 s for the read (r0236).
- Takes as a hint: `Track.offset` (capo), `Track.strings` (tuning), `Note.string` and `Note.value` (fret).
- Hands off to: its GP3 opened in alphaTab with the same 42 of 90 (e0805). Its README names GP3, GP4 and GP5 only. No Guitar Pro 6 to 8 file was tried with it.

**svguitar 2.10.1** ([link](https://github.com/omnibrain/svguitar)). A JavaScript library that draws chord boxes, the small grids that show where the fingers go for a chord.

- In: two chord shapes from the known tabs, G from S3 and B minor from S4, a synthesized four-instrument band mix. Written as one fret number per string, lowest string first, with x for a muted string, they're 320003 and x24432.
- Command or settings: `new svguitar.SVGuitarChord(el).configure({strings: 6, frets: 4, position, tuning}).chord({fingers: [[string, fret]...], barres: [{fromString, toString, fret}]}).draw()`
- Out: 2 SVG chord boxes with the dots on the strings and frets given, and the B minor barre, one finger pressing across several strings, with a `2fr` position label (r0253).
- Time: shared, 2.83 s wall for a page with both chord libraries, 123.6 MB peak (r0253).
- Takes as a hint: `strings`, `frets`, `position` and `tuning`.
- Hands off to: drawing only.

**Tonal 6.5.1** ([link](https://github.com/tonaljs/tonal)). A JavaScript music-theory library for notes, intervals, chords and keys.

- In: for each of the 9 chord stretches in S3's known answer, the names of the notes sounding inside it, lowest first.
- Command or settings: `Chord.detect()`
- Out: the first name it returned had the known chord's root (the note the chord is named after) and type in 8 of 9 stretches, 1.4 ms for all 9. The other stretch, the D7 from 18.75 to 20.0 s, came back as `C69#11`. Notes of the C chord before it were still ringing, and the way my agents picked each stretch's notes took them in.
- Time: shared, 1.24 s wall for the run it shared with ChordSheetJS, 88.1 MB peak (r0251).
- Takes as a hint: none.
- Hands off to: nothing was fed from it.

**TuxGuitar 1.5.6** ([link](https://github.com/helge17/tuxguitar)). An open-source desktop tab editor and player written in Java. Only its file plugins ran here, called from a small Java program my agents wrote. Its window was never opened.

- In: `S2n.gp5`, `S5capo2.gp5`, `S5dropd.gp5` and alphaTab's `.gp` of S2n.
- Command or settings: `java -Djava.awt.headless=true` running `TGConvert.java`, which calls the plugins' readers and writers (`GP5InputStream`, `gpx.v7.GPXInputStream`, `GP5OutputStream`, `GP4OutputStream`, `GP3OutputStream`, `MusicXMLSongWriter`, `ASCIISongWriter`, `LilypondSongWriter`, `MidiSongWriter`).
- Out: from each file, GP5, GP4, GP3, MusicXML, ASCII tab (tab as plain text), LilyPond and MIDI. GP5, GP4 and GP3: 90 of 90 on the known string and fret, with capo and tuning (e0457 to e0459, e0464 to e0466, e0471 to e0473). ASCII tab: 90 of 90 by note order (e0461), with no capo or tuning field and the strings labelled by letter only. MusicXML: pitches and tuning one octave high, both voices merged into one, no capo element, and 16 of 90 notes matched by pitch with 0 of those 16 on the known string and fret (e0460). MIDI: 90 of 90 matched (e0462). The LilyPond file is written for LilyPond 2.14.0. LilyPond 2.24.3 reported errors on it, still wrote a PNG and ended with `fatal error: failed files` (r0230), and after `convert-ly -e` updated the file it compiled (r0232). alphaTab's `.gp` was read with 90 of 90 (e0477). The start of the ASCII tab:

  ```text
  E|--------|---------------------|-0----0--------------|---------------------|---------------------|
  B|--------|-----------3----3----|-----------3---------|-1----1----0----0----|---------------------|
  G|--------|-0----0--------------|---------------------|---------------------|-2----2----0---------|
  D|--------|------0---------0----|------2---------0----|------2---------0----|-0--------------0----|
  A|--------|---------------------|-3-------------------|-3-------------------|------0--------------|
  E|--------|-3---------3---------|-----------3---------|-----------3---------|-----------3---------|
  ```

- Time: S2n, shared, 0.91 s wall, 65.9 MB peak (r0221).
- Takes as a hint: none in the plugins, which take capo and tuning from the file. The desktop program's command line takes a file to open and `-h`, `-v`, `-i` and `-D<name>=<value>`, with no export option.
- Hands off to: its GP3 and GP4 opened in alphaTab with 90 of 90 (e0799, e0802) and its GP3 in guitarpro-parser with 90 of 90 (e1110). Its MusicXML opened in alphaTab with the tuning an octave high, 7 of 90 notes matched by pitch and 0 of those 7 on the known string and fret (e0860).

**Verovio 6.4.1** ([link](https://github.com/rism-digital/verovio)). A library that lays out sheet music from MEI, the Music Encoding Initiative's file format, which has a tablature module. It's compiled to WebAssembly, code that runs inside a browser or Node.js. It also reads MusicXML.

- In: MEI tab my agents wrote from S2n's known tab (`truth_to_mei.py`), MusicXML with a tab staff for S2n (notation plus tab, and tab only) and S5capo2, and MuseScore 3.2.3's MusicXML of `S2n.gp5`.
- Command or settings: `verovio/wasm` and `verovio/esm` in Node.js, with the options `pageWidth` 2100, `scale` 40 and `adjustPageHeight`. For editing, the toolkit's `edit()` with `set` actions on a note's `tab.fret` and `tab.course`, then `getMEI()` and `renderToSVG(1)`.
- Out: SVG, MEI, MIDI and a timemap, a list of when each note starts and stops in ms. The MEI tab my agents wrote read back with 90 of 90 on the known string and fret (e0361), and so did Verovio's MEI export of it (e0362). MusicXML with a tab staff converted to MEI: 90 of 90 (e0363, e0364). S5capo2: the capo didn't carry into the MEI. Read without it, all 90 pitches came out 2 semitones low and 0 of 90 matched (e0365). With the capo added by hand, 90 of 90 matched, all on the known string and fret (e0366). MIDI from the MEI tab: 90 notes, all 90 matched, and 50 of those 90 also ended within 20 percent of the known note's length or 50 ms of its end, whichever is larger (e0307). MIDI from the notation-plus-tab MusicXML: 180 notes, every note twice because both staves play (e0324). MuseScore 3.2.3's MusicXML came out with no tab staff (r0168). Editing the MEI tab (r0626): `set` changed note 1's `tab.fret` to 2, then note 2's `tab.course`, the string, to 4 and its `tab.fret` to 5. Each call returned true, `getMEI()` then held the new value, and the drawn fret numbers became 2 and 5. Which line the moved note was drawn on wasn't measured. One `undo` put all three back. The edited MEI read back with 89 of 90 matched and 88 of those 89 on the known string and fret, the other being the moved note (e1827). The edited MEI holds two notes starting together on string 4, the moved G and the bass's open D. `edit()` returned true for that change, and Verovio's own log wasn't read.
- Time: the MEI tab of S2n, shared, 1.85 s wall, 175.1 MB peak, with 656 ms to start the WebAssembly and 156 ms to draw (r0165). The edit run took 0.54 s wall on 2 cores, 195.0 MB peak (r0626).
- Takes as a hint: tuning (`<tuning>` with one `<course>` per string). MEI's tab chapter has no capo element. Through `edit()`, a note's `tab.fret` and `tab.course`.
- Hands off to: my agents read its MEI back for counting. The timemap carries `qstamp`, `tstamp` (ms) and the ids of the notes switched on and off, which the survey lists as position data for a playback cursor.

**vexchords 1.2.0** ([link](https://github.com/0xfe/vexchords)). A JavaScript library that draws chord boxes.

- In: the same G and B minor shapes as svguitar.
- Command or settings: `draw(el, {chord: [[string, fret]...], position, barres}, {width, height})`
- Out: the npm package's `dist/vexchords.js` stopped with `TypeError: A[e] is not a constructor` (r0253, r0254, r0255). Loading its source files directly stopped on two imports with no file extension (r0256). Bundled from its source with esbuild 0.25.12, it drew both chord boxes (r0259).
- Time: the bundled page, shared, 2.41 s wall, 123.8 MB peak (r0259).
- Takes as a hint: `numStrings`, `numFrets`, `position` and `barres`.
- Hands off to: drawing only.

**VexFlow 5.0.0** ([link](https://github.com/vexflow/vexflow)). A JavaScript library that draws notation and tab from code. It has no file reader.

- In: S2n's known tab as JSON, turned into drawing calls by a test page.
- Command or settings: one `TabStave` per bar, two `Voice`s of `TabNote`s with `positions: [{str, fret}]`, `Formatter.joinVoices().format()`, SVG output.
- Out: SVG with 13 bars and 90 fret numbers on six-line tab staves with a `TAB` clef. No notation, which wasn't asked for, and no stems, title or tempo (r0110).
- Time: shared, 2.05 s wall, 125.8 MB peak, with 274.7 ms inside the drawing code (r0110).
- Takes as a hint: the number of lines on a `TabStave`. The program gives every string and fret.
- Hands off to: OpenSheetMusicDisplay and VexTab draw with it.

**VexTab 4.0.5** ([link](https://github.com/0xfe/vextab)). A text language for notation and tab, drawn with VexFlow.

- In: S2n's and S5dropd's known tabs written as VexTab text by `truth_to_vextab.py`, 1,072 bytes for S2n.
- Command or settings: `new VexTab(new Artist(10, 10, 1200)).parse()` and `artist.render()`. For editing, a `div.vextab-auto` with `editor="true"`, which adds a text box. Going by its source (`src/div.ts`), it redraws 250 ms after a key is released.
- Out: SVG with notation and a G major key signature above each tab staff, 13 bars on 4 lines (r0109). S5dropd drew with `tuning=dropd` (r0144). Editing, run by the checking agent (r0407): typing `:q 2/3` over the first `:q 0/3` changed the first of the 90 drawn numbers from 0 to 2 and no other. Later, typing `:q 5/4` over the second `:q 0/3` moved that note from 0 on string 3 to 5 on string 4, the same pitch, and no other number changed (r0625). That `5` was drawn over the bass's `0` on string 4, which starts at the same moment, with no error text. The start of the S2n text:

  ```text
  options space=20 tab-stems=false
  tabstave notation=true tablature=true tuning=standard key=G time=4/4
  voice
  notes :w ## | :q 0/3 :q 0/3 :q 3/2 :q 3/2 | :q 0/1 :q 0/1 :h 3/2 | :q 1/2 :q 1/2 :q 0/2 :q 0/2 |
  ```

- Time: shared, 2.85 s wall, 126.2 MB peak, with 149.6 ms inside parse and draw (r0109). The string change took 2.24 s wall on 2 cores, 131.1 MB peak (r0625).
- Takes as a hint: `tuning=` with `standard`, `dropd`, `eb` or a list of notes. No capo option.
- Hands off to: drawing only. Its source has a player, `player.ts`, which wasn't tried.

**webmscore 1.2.1** ([link](https://github.com/LibreScore/webmscore)). MuseScore 3's engine compiled to WebAssembly, for web pages and Node.js.

- In: `S2n.gp5`, `S5capo2.gp5`, alphaTab's `.gp` of S2n, and the S2n MusicXML with notation and a tab staff.
- Command or settings: `webmscore_trial.cjs` with `--shim-navigator --no-fetch`. In Node.js 22.23.4 it first stopped with `TypeError: Cannot set property navigator of #<Object> which has only a getter` and then with `TypeError: Failed to parse URL from .../webmscore.lib.wasm`. Making `globalThis.navigator` writable and deleting `globalThis.fetch` before loading got past both.
- Out: MusicXML, MIDI, SVG, PNG, PDF and `.mscz`. From the Guitar Pro files the MusicXML had no tab staff and no string or fret, and the counting tool refused it (e0990, e0995, e1002). The MIDI: 90 of 90 matched, the capo file included (e0992, e0999, e1006). alphaTab's `.gp` opened (r0290). From the MusicXML with a tab staff, the tab staff stayed, the tuning was written an octave high, and 0 of 90 notes kept the known string and fret (e1009).
- Time: S2n, shared, 4.0 s wall, 218.7 MB peak (r0288).
- Takes as a hint: none for string, fret, capo or tuning. The methods of its package load, set excerpts, read metadata, save and synthesize, and none edits a note. Whether string and fret written in a MuseScore `.mscz` or `.mscx` file come through wasn't tried.
- Hands off to: MusicXML and MIDI, as above.

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

The list has 80 entries: 65 programs, libraries and web services, 8 file formats and 7 data sets (6 sound banks and a chord-shape database). Besides the 18 above, here's each of the other 62, plus the parts of the tools above that didn't run, and why. Where my agents wrote steps for me to try it myself, the line gives the item number in `for-aaron.md` in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/web-tab-render).

- **abc2svg**: not tried for lack of time. Its npm package, version 1.22.1 from 2022, is marked deprecated with `Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.`, and the project lives on chiselapp.com. No steps.
- **abjad and python-ly** (Python tools that write LilyPond text): no trial recorded, they're only in the survey's list. No steps.
- **aibandtab**: seen in the npm search and not looked at further. No steps.
- **ApolloTab** (a Python Guitar Pro reader, drawer and player): not tried for lack of time. It needs Qt to draw. No steps.
- **ascii-tabs**: found in the checking agent's npm search, not run. No steps.
- **Autostrum** (a web tab player and editor): not tried for lack of time, and whether it runs on the box was not verified. No steps.
- **ChordPro reference program** (Perl): not tried for lack of time. No steps.
- **chords-db and react-chords** (a chord-shape database and React chord boxes): not tried for lack of time. No steps.
- **@coderline/alphaskia** (the engine alphaTab uses for PNG output outside a browser): named in alphaTab's docs, not tried. No steps.
- **@coderline/alphatab-react and @coderline/alphatab-ui** (React bindings, and the player and alphaTex editor of alphaTab's website): marked private and not on npm, where the registry answered 404. The alphatab-ui source was read, not run. Steps for me: item 7 has me use the alphatab.net playground, which imports alphatab-ui, for a listening check.
- **@danzw777/tab-score**: found in the checking agent's npm search, not run. No steps.
- **dart_gp_tab_reader, parsegp and PhilPotter/gp_parser**: named by a web search and not read, so not verified. No steps.
- **expo-alphatab**: found in the checking agent's npm search, not run. No steps.
- **File formats** (ABC, alphaTex, ASCII tab, ChordPro, Guitar Pro, MEI, MNX, MusicXML): formats, not programs, so there's nothing to run. All but MNX went through the tools above. No tool here used MNX, a new music format a W3C community group is developing, and whether it can hold tab was not checked. No steps.
- **Flat.io embed and API**: a hosted service that needs an account and an app ID. Steps for me: item 4.
- **fretboard.js**: not tried for lack of time. No steps.
- **@fretfall/player**: found in the checking agent's npm search, not run. No steps.
- **Guitar** (1j01/guitar, a web guitar that plays pasted tab): not tried for lack of time. No steps.
- **Guitar Pro 8**: a paid desktop program, not on the box. Steps for me: item 6.
- **guitar-pro-api**: seen in the npm search and not looked at further. No steps.
- **guitarpro** (Rust crates): not tried for lack of time. It needs the Rust toolchain. No steps.
- **HAYA-TAB** (a desktop program that keeps a library of tab files and shows and plays them with alphaTab 1.8.1): not run. My agents were asked only to describe it. The files of its release v3.1.8 can be downloaded from the box, but its Linux build is linked against the WebKitGTK 4.1, JavaScriptCoreGTK 4.1 and libsoup 3.0 libraries, which the box doesn't have. My agents didn't try installing them, running a virtual display or starting the program. In the `frontend/src` folder of its source, they found no code that sets a note's string or fret and no call to alphaTab's file exporters. Its edit dialog changes library details such as the title and artist. Steps for me: item 8.
- **@hidechae/eztab-mcp**: found in the checking agent's npm search, not run. Its repository wasn't public. No steps.
- **@holm/asciitabs-to-gp**: found in the checking agent's npm search, not run. No steps.
- **It's MyTabs** (a self-hosted tab viewer and player built on alphaTab): not tried for lack of time. It needs Deno or Docker. No steps.
- **iText 5.5.13.3** (the PDF library in TuxGuitar's PDF export): not run, since TuxGuitar's PDF export wasn't tried. No steps.
- **jTab**: not tried for lack of time. No steps.
- **keyjockey**: seen in the npm search and not looked at further. No steps.
- **Listening**: the box has no sound card, so none of the playback was heard. Steps for me: item 7, a listening check of alphaTab's player.
- **MuseScore Studio 4.7.6**: its 192,616,952-byte Linux AppImage, a program packed into one file, wasn't downloaded. A notice on the shared box asked lanes to `start no new download or install over 200 MB unless your lane cannot finish without it` while less than 9,000 MB was free, and the checking agent saw 4.9 to 5.9 GB free. The box also has no FUSE tools, which an AppImage needs to run without unpacking. So it would have had to be unpacked first, to a size my agents didn't measure, or FUSE installed. MuseScore 3.2.3 and webmscore ran instead. Steps for me: item 1.
- **@musicbird/gp-parser**: seen in the npm search and not looked at further. No steps.
- **@musicbird/gpx-parser**: not tried for lack of time. No steps.
- **muzart** (a browser tab editor): cloned, but this session's permission check refused its install step, `pnpm install --frozen-lockfile`, according to the trial agent. No log of that was saved, so the refusal is not verified. Steps for me: item 2, using its online demo.
- **osmd-audio-player**: not tried for lack of time. No steps.
- **Power Tab Editor 2.0**: a desktop program, not tried for lack of time. No steps.
- **react-guitar**: not tried for lack of time. No steps.
- **score-parser** (`@jbfullstack/score-parser`): not tried for lack of time. No steps.
- **SLiMTAB** (an Electron desktop tab editor): no trial recorded, it's only in the survey's list. No steps.
- **Songshed**: not tried for lack of time. No steps.
- **Sound banks** (files of recorded instrument samples a player uses to make sound): SONiVOX ran inside alphaTab's player (r0128). The MIDI.js sets that abcjs loads by default, FluidR3_GM (used to make the test clips), GeneralUser GS, MuseScore's MS Basic and TuxGuitar's Magic Sound Font weren't run on their own. No steps.
- **soundfont-player**: no trial in this step, where it's only in the survey's list. Version 0.12.0 ran in the section on metronome and sync (r0229). No steps.
- **Soundslice**: a hosted service that needs an account. Steps for me: item 3.
- **SuNett**: found in the checking agent's npm search, not run. No steps.
- **Tab Flow** (alphaTab inside the Obsidian notes app): no trial recorded, it's only in the survey's list. No steps.
- **tab-editor** (calesce): not tried for lack of time. No steps.
- **tabkit**: found in the checking agent's npm search, not run. No steps.
- **tonal-guitar**: seen in the npm search and not looked at further. No steps.
- **tuitar** (a tab editor in the terminal): not tried for lack of time. No steps.
- **tutts and tutts-alphatab**: found in the checking agent's npm search and not run in this step. tutts 0.1.0 ran in the section on choosing the string and fret (r0205). tutts-alphatab wasn't run. No steps.
- **TuxGuitar's desktop window**: never opened. `/usr/bin/tuxguitar` only starts the window, so only the file plugins ran (above). Its PDF, SVG and image exports and its Power Tab and TablEdit readers weren't tried either. Steps for me: item 5.
- **@ukegeeks/song-formatter**: seen in the npm search and not looked at further. No steps.
- **Verovio's Python and C++ builds**: not tried for lack of time. No steps.
- **vexflow-react-native-svg**: seen in the npm search and not looked at further. No steps.
- **vexflow_smoosic**: seen in the npm search and not looked at further. No steps.

</details>

<details><summary>Licenses of the tools that ran</summary>

None of these tools uses a trained model, so the last two columns say none for all of them.

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| abcjs 6.7.2 | MIT | none | none |
| alphaTab 1.9.0 | MPL-2.0, section 3.2: `If You distribute Covered Software in Executable Form then: (a) such Covered Software must also be made available in Source Code Form, as described in Section 3.1, and You must inform recipients of the Executable Form how they can obtain a copy of such Source Code Form by reasonable means in a timely manner` ([LICENSE](https://raw.githubusercontent.com/CoderLine/alphaTab/develop/LICENSE)). On the mark, a music note followed by alphaTab.net, which every drawing of these 13-bar pieces shows, its license header says the attribution `in rendered scores must stay visible in the rendered output. Removing, hiding, covering or cropping it requires permission from the alphaTab maintainers: https://alphatab.net/docs/attribution` ([LICENSE.header](https://raw.githubusercontent.com/CoderLine/alphaTab/develop/packages/alphatab/LICENSE.header)). A planned change: `A future release of alphaTab will move from MPL-2.0 to an open-source license with an attribution clause.` and, under that license, `Offering an app over a network counts as distribution. Changes you make to alphaTab's own files must be made available, also when they only run on your server or in your web app.` ([attribution page](https://alphatab.net/docs/attribution)). Its bundled SONiVOX sound bank is under the Apache License 2.0. | none | none |
| ChordSheetJS 18.0.0 | GPL-2.0-only. Its LICENSE begins `GNU GENERAL PUBLIC LICENSE Version 2, June 1991` ([repository](https://github.com/martijnversluis/ChordSheetJS)) | none | none |
| @coderline/alphatab-monaco 1.9.0 and @coderline/alphatab-language-server 1.9.0 | MPL-2.0. The two LICENSE files begin `alphaTab Monaco is licensed under MPL-2.0.` and `alphaTab Language Server is licensed under MPL-2.0.` ([the Monaco package's LICENSE](https://raw.githubusercontent.com/CoderLine/alphaTab/develop/packages/monaco/LICENSE)). Of the 14 packages the install added, the registry license field is `MPL-2.0` for the three @coderline packages, `(MPL-2.0 OR Apache-2.0)` for dompurify and `MIT` for the other ten, `monaco-editor` among them. | none | none |
| guitarpro-parser 2.0.0 | Apache-2.0 | none | none |
| LilyPond 2.24.3 | GPL-3.0-or-later: `GNU LilyPond is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.` ([LICENSE](https://gitlab.com/lilypond/lilypond/-/raw/master/LICENSE), read from the current source, not from the 2.24.3 package) | none | none |
| MuseScore 3.2.3 | GPL-3.0: `you can redistribute it and/or modify it under the terms of the GNU General Public License version 3 as published by the Free Software Foundation.` (`LICENSE.txt` in the [current repository](https://github.com/musescore/MuseScore), not the 3.2.3 package) | none | none |
| music21 10.5.2 | BSD-3-Clause | none | none |
| OpenSheetMusicDisplay 2.3.0 | BSD-3-Clause | none | none |
| PyGuitarPro 0.11 | LGPL-3.0-only. Its LICENSE begins `GNU LESSER GENERAL PUBLIC LICENSE Version 3, 29 June 2007` ([repository](https://github.com/Perlence/PyGuitarPro)) | none | none |
| svguitar 2.10.1 | MIT | none | none |
| Tonal 6.5.1 | MIT | none | none |
| TuxGuitar 1.5.6 | LGPL-2.1: `TuxGuitar is released under the GNU Lesser General Public License.` ([README](https://github.com/helge17/tuxguitar), README of the current repository, not the 1.5.6 package). Its PDF export, not tried here, uses iText 5.5.13.3, whose Maven file names `GNU Affero General Public License v3` ([pom](https://repo1.maven.org/maven2/com/itextpdf/itextpdf/5.5.13.3/itextpdf-5.5.13.3.pom)). No license text was found for its bundled Magic Sound Font. | none | none |
| Verovio 6.4.1 | LGPL-3.0-only, section 4: `You may convey a Combined Work under terms of your choice that, taken together, effectively do not restrict modification of the portions of the Library contained in the Combined Work and reverse engineering for debugging such modifications, if you also do each of the following:` ([COPYING.LESSER](https://raw.githubusercontent.com/rism-digital/verovio/develop/COPYING.LESSER)) | none | none |
| vexchords 1.2.0 | MIT | none | none |
| VexFlow 5.0.0 | MIT | none | none |
| VexTab 4.0.5 | its own text, npm field `LicenseRef-LICENSE`: `It is freely available complete and uncrippled for non-commercial use.` and `If you would like to use this code on commercial websites, products, blogs, plugins, or tools, please get in touch with me. (I'm very reasonable.)` ([LICENSE](https://raw.githubusercontent.com/0xfe/vextab/master/LICENSE)) | none | none |
| webmscore 1.2.1 | GPL v3, npm field `GPL`: `you can redistribute it and/or modify it under the terms of the GNU General Public License version 3 as published by the Free Software Foundation.` (`LICENSE.GPL` in the [repository](https://github.com/LibreScore/webmscore)) | none | none |

Every clause with its source, for these and the tools that didn't run, is in `survey.md` in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/web-tab-render).

</details>

## Metronome and sync in the browser

This step keeps the click, the song or video and the tab's cursor on one beat. My agents listed 101 entries for it and tried 36 in Chrome on a cloud box with no sound card. With the page kept busy, an AudioWorklet, code in the audio stream, put 0 of 122 clicks off the beat, and a look-ahead loop put 11 off.

<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/guitar-tab-tools/browser-audio-sync-metronome-idle.webp" alt="Four rows of blue dots across 60 seconds, labelled AudioWorklet, look-ahead loop, setInterval and Tone.js. In three rows every dot sits on the zero line. In the setInterval row the dots sit just above the line and five stand higher, the highest labelled 42.630 ms."><figcaption><b>Metronome, page idle</b><span class="ao-meta">122 clicks at 120 BPM (beats per minute) with no clip, timed four ways in headless Chrome, a copy of Chrome with no window. Each dot is one click's distance from the beat grid, the times the clicks should land on. For setInterval the grid starts at its own first click (r0199).</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/browser-audio-sync-metronome-busy.webp" alt="The same four rows with the page busy. The AudioWorklet dots all sit on the zero line. The look-ahead row has two dots just under the 50 ms line, one near 11 ms and the rest on or just above the zero line. The setInterval dots are scattered above and below the line, up to the labelled 91.202 ms. The Tone.js dots sit on the line with a few barely above it."><figcaption><b>Metronome, page busy</b><span class="ao-meta">The same test with the page's own code kept busy 100 ms at a time. Tone.js is shown after correcting a 2.902 ms slip in my agents' recorder (r0199).</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

Everything here ran in headless Chrome 153, a copy of Chrome with no window, on the cloud box, apart from the Python reference runs in the htdemucs_6s and OpenCV.js entries. The exact build was Google Chrome for Testing 153.0.8010.12, driven from a script by Playwright 1.63.0. The box has no sound card and no graphics card, so WebGL, the way a page draws with the graphics card, ran in software. My agents' recorder caught the sound inside the page, so every time below is a position in the browser's audio stream, not the moment a speaker would play it. The browser probe is a page that checks what the browser supports. Its two runs (r0042, r0050) and two short click tests (r0095, r0103) ran pinned to 2 of the box's 4 cores. My agents ran htdemucs_6s and OpenCV.js later, in a gap round after a critic listed what was missing. Those runs were pinned to 2 cores too, apart from the few the htdemucs_6s entry marks. Every other run is marked shared, which means it wasn't pinned and ran next to my other agents' jobs, so its times are what that busy box gave right then. The run ledger's peak memory leaves out some of Chrome's processes, so no browser figure of it is given here. In the htdemucs_6s and OpenCV.js entries, peak memory is the renderer's, the Chrome process that runs the page, read from Linux's `/proc`, where the system reports what each process uses, or the ledger's for a Python run. Nothing cost money beyond the cloud session.

The clips were four I synthesized with known answers, two real recordings and three real guitar videos from the shared test set, plus a close shot from the same concert as one of the videos:

- S1, a single-note melody I synthesized, the Ode to Joy theme on nylon guitar at 144 BPM (beats per minute) with 62 known notes.
- S2n, a 29-second two-voice fingerstyle clip I synthesized so every note is known, 90 notes at 112 BPM, with its tab as a Guitar Pro file, `S2n.gp5`.
- S3, strummed chords I synthesized at 96 BPM in G major, with 32 known beats.
- S4, a four-instrument band mix I synthesized with its true stems (each instrument's own track), 116 BPM in D major, with 68 known beats. S4_10s is a 10-second cut of it from the first beat after the count-in.
- R1b, a real 29-second guitar solo from GuitarSet, a public set of guitar recordings with every note annotated, 70 notes.
- R2, a real band song with singing, a 36-second excerpt with no known answer. R2full is the whole song, 228.5 seconds.
- R3a, 18 seconds of a real classical-guitar concert video with camera cuts, as `R3a.mp4` (H.264) and `R3a.webm` (VP9).
- R3a_cu, a 10-second close shot from later in the same concert, 682 to 692 seconds into the recording, at 640x480. The agents researching *Reading hands and the fretboard from video* cut it for their own tests (r0015).
- R3b and R3c, 18 seconds each of two real classical-guitar videos at 1920x1080 with the whole fretboard in frame.

**alphaTab 1.9.0** ([link](https://alphatab.net)). A library that reads tabs and sheet music, draws them and plays them with its own synthesizer. This section covers only its timing features. *Showing, editing and playing a tab in the browser* covers the rest.

- In: `S2n.gp5`, which alphaTab read as tempo 112, one track named Guitar and 13 bars of 4/4, one silent count-in bar and 12 bars of music. It read the strings as `[64, 59, 55, 50, 45, 40]`, the note numbers of standard tuning with the high string first, and the capo as 0. A capo is a clamp across the strings that raises every note, and 0 means none. For the modes where alphaTab follows a recording, the input was `S2n.wav`. It played in an `<audio>` element, the browser's built-in player, or its 5,178,644 bytes were loaded as a backing track.
- Command or settings: the click alone through `api.exportAudio(options)` with `sampleRate` 44100, `metronomeVolume` 1, `useSyncPoints` `false` and `trackVolume` `{0: 0}`. The count-in while playing, with `countInVolume` 1, `metronomeVolume` 1 and the guitar muted with `changeTrackMute`. Following an `<audio>` element with `PlayerMode.EnabledExternalMedia`, the page calling `api.player.output.updatePosition(audio.currentTime * 1000)` on every animation frame. The checking agent set a backing track in code with `score.backingTrack = new model.BackingTrack()` and `rawAudioFile` set to the WAV. It added 13 sync points through `score.applyFlatSyncPoints()` and played with `PlayerMode.EnabledBackingTrack`. A sync point ties a bar to a time in the recording. These were one per bar, 2142.857 ms apart, shifted by 0 or 1000 ms.
- Out:
  - The export is a 27.858-second WAV with 52 clicks, 13 bars of 4. Each click came 0 to 1.429 ms before its beat, 0.711 ms before on average, and the clicks were 535.51 or 536.96 ms apart, whole multiples of 64 samples. A comment in alphaTab's own code says `the synthesizer internally uses a fixed block size of 64 samples for synthesizing audio`. A repeat had the same first 10 click times and the same statistics (r0329), and the checking agent's rerun wrote byte-identical files (r0451).
  - The count-in while playing (r0269): 15 clicks in the 8 seconds after `play()`, the first 8.7 ms after it, with 11 of the 14 gaps 535.51 ms and the others 552.93, 536.96 and 550.02 ms. alphaTab plays through its own AudioContext, a separate audio engine in the page, and connects its output only after the first `play()`. Two earlier tries recorded nothing (r0257) and silence (r0266), which isn't verified because their files were overwritten. The checking agent's rerun had 15 clicks, the first 11.6 ms after `play()` (r0441).
  - Following the `<audio>` element (r0261): alphaTab called the page with `seekTo(0.558 ms)` then `play()` on `api.play()`, `seekTo(20000)` when the page set `api.timePosition = 20000`, and `seekTo(20892.857)` and `pause()` on `api.pause()`. In this mode alphaTab reports the media time the page passes in as its own position, and it did so in 504 of 504 position events checked. The rerun checked 562 of 562 (r0441).
  - The backing track (r0453): `exportFlatSyncPoints()` returned the 13 points, and the player was an `AudioElementBackingTrackSynthOutput` playing a `blob:` URL. In the 131 position events checked at each offset, alphaTab's time minus the element's was 0 ms with no offset and -1000 ms with the 1000 ms offset. When it reaches a speaker wasn't measured. alphaTab's guide says `At this point alphaTab cannot mix the synthesized audio and a backing track together, therefore only either audio will be heard.`
- Time: shared. Loading the file took 616 ms. Exporting the click took 103 ms and the guitar 85 ms (r0195). In the repeat those were 377, 196 and 76 ms (r0329). With the backing track, `playerReady` fired after 243 ms and 141 ms (r0453). The playing modes run in real time.
- Takes as a hint: `playbackSpeed`, `countInVolume`, `metronomeVolume`, per-track mute, volume and transposition, a playback range and loop, and sync points (`applyFlatSyncPoints`, `updateSyncPoints()`). Tempo, tuning and capo come from the Guitar Pro file.
- Hands off to: position events in milliseconds, which a waveform view takes as `setTime(ms / 1000)`. Not tried here. MIDI, a list of notes with start times, isn't among its documented inputs. So notes from a transcriber, a tool that turns audio into notes, have to become Guitar Pro, MusicXML, Capella or alphaTex first.

**aubiojs 0.2.1** ([link](https://github.com/qiuxiang/aubiojs)). The aubio library, which finds pitch and beats, compiled to WebAssembly (code built to run inside a browser).

- In: S1 and R1b for pitch, S3, S4 and R2 for tempo, decoded at 44.1 kHz.
- Command or settings: `new Pitch('yinfft', 2048, 441, 44100)` fed 441-sample hops, and `new Tempo(1024, 512, 44100)` fed 512-sample hops, then `getBpm()`. esbuild, a tool that packs a library into one file for a page, could bundle its browser build only with `path`, `fs` and `crypto` marked external.
- Out: a frequency in Hz per hop (0 for none), a non-zero value at each beat, and a BPM. Pitch is counted in 10 ms frames. A cent is a hundredth of a semitone, and a semitone is one fret. On S1 its frequency was within 50 cents of the known note in 2,485 of the 2,624 frames where a note sounds, and it gave a pitch in 60 of the 360 frames where none does (e1226). On R1b that was 1,586 of 1,823, and 755 of 1,111 (e1227). Tempo was 97.33 BPM for S3, a 96 BPM clip, with 40 beats returned and 32 of the 32 known beats within 70 ms of one, a median 19.4 ms late (e1230, e1231). For S4, a 116 BPM clip, 117.79 BPM, with 71 beats and 66 of 68 within 70 ms, a median 8.2 ms late (e1233, e1234). For R2, with no known answer, 147.80 BPM and 84 beats.
- Time: shared (r0329). Pitch took 516 ms for S1 and 498 ms for R1b inside the page, tempo 334 to 469 ms per clip.
- Takes as a hint: none, only the method and window sizes.
- Hands off to: nothing here.

**AudioWorklet, Web Audio API 1.1 in Chrome 153** ([link](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet)). A browser feature that runs a page's own code on the audio thread, one block of 128 samples at a time.

- In: no clip. A click, a 10 ms 2 kHz tone that fades out, at 120 BPM for 122 clicks (61 s).
- Command or settings: a processor that writes the click samples itself at frame positions it counts from `currentFrame`. Run once with the page idle and once busy, with the page's own code kept busy 100 ms at a time for the whole run.
- Out: a mono 32-bit float recording of the clicks. 0 of 122 clicks were off the beat grid, the times the clicks should land on, idle and busy (r0199). In the 15-second runs of my measuring page, 0 ms off too (r0271). Right after a worklet node was created, Chrome skipped its `process()` call for a few blocks and `currentFrame` jumped by 384 to 1408 frames, which my agents found while building their recorder. MDN, Mozilla's web documentation, says the method is called `once for each block`.
- Time: real time, 61 s a run, shared (r0199, 548.5 s for all 8 metronome runs).
- Takes as a hint: none. Tempo and click pattern are whatever the code computes.
- Hands off to: nothing here. The clicks are audio in the page's audio graph, the chain of sound sources and processors the page wires up.

**Basic Pitch for the browser, `@spotify/basic-pitch` 1.0.1** ([link](https://github.com/spotify/basic-pitch-ts)). Spotify's note transcription model (audio in, a list of notes out) in TypeScript, running its model in TensorFlow.js inside the page.

- In: S1 and S2n as WAV, decoded by the browser and resampled to 22,050 Hz mono, since the package throws an error otherwise.
- Command or settings: `evaluateModel` on TensorFlow.js 3.21.0 with three of its backends, the engines it runs a model on: `webgl` (in software here), `cpu` and `wasm`. Then `outputToNotesPoly`, `addPitchBendsToNoteEvents` and `noteFramesToTime` with two settings. One is the Python package's defaults, onset 0.5, frame 0.3 and at least 11 frames. The other is the example in the README of the npm package, 0.25, 0.25 and 5. npm is the public registry of JavaScript packages.
- Out: note events with `startTimeSeconds`, `durationSeconds`, `pitchMidi`, `amplitude` and `pitchBends`, written as CSV. A note counts as found when it starts within 50 ms of a known note with a pitch within 50 cents.
  - S1 with the defaults: 64 notes, 61 of the 62 real notes among them and 3 that matched no known note (e0669). With the README settings, 115 notes, 60 of 62 and 55 extra (e0671).
  - S2n with the defaults: 136 notes, 90 of the 90 real notes among them, 42 of 42 melody and 48 of 48 bass, and 46 extra (e0840). With the README settings, 267 notes, 90 of 90 and 177 extra (e0844).
  - Found notes started a median 10.4 ms after the known ones on S1 and 8.1 ms on S2n.
  - The `wasm` backend failed on both clips with `Error: Unknown dtype undefined`. `webgl` and `cpu` gave the same notes.
  - The package's MIDI writer, `generateFileData`, isn't exported from its entry (esbuild said `No matching export`).
  - The first rows on S1, where the known first notes are 66, 66 and 67 at 1.667, 2.083 and 2.500 s:

```text
start_time_s,end_time_s,pitch_midi,amplitude
1.683447,2.091080,66,0.7792
2.091080,2.509039,66,0.7456
2.509039,2.950218,67,0.7066
```

- Time: shared, on a heavily loaded box (r0270). Inference, the model's run over the clip, took 160.6 s on `webgl` and 103.1 s on `cpu` for S1, and 157.7 s on `webgl` for S2n, after a model load of 34 to 62 ms. The checking agent's rerun on `cpu` took 72.3 s (r0451).
- Takes as a hint: `onsetThresh`, `frameThresh`, `minNoteLen`, and a note range through `minFreq` and `maxFreq`. A tuning, capo or string count isn't an input.
- Hands off to: nothing here. A MIDI file or note list is what the tools in *Choosing the string and fret* take. MIDI isn't among alphaTab's documented inputs.

**Basic Pitch ONNX model, `nmp.onnx`, in ONNX Runtime Web 1.31.1** ([link](https://github.com/spotify/basic-pitch)). The same Basic Pitch model exported to ONNX, a file format for AI models, from Spotify's Python repository. It ran on WebAssembly with the npm package's note step.

- In: S1 and S2n at 22,050 Hz mono, in windows of 43,844 samples cut the way the TypeScript package cuts them. The model file is 230,444 bytes.
- Command or settings: `onnxruntime-web` 1.31.1 (`ort.wasm.min.mjs`) on the wasm execution provider, ONNX Runtime Web's WebAssembly engine. It ran with `numThreads` 1 or 2, with and without cross-origin isolation (`?coi=0`), and the same two note settings.
- Out: note lists identical to TensorFlow.js in start, end and pitch on both clips with both settings, amplitudes differing in the fourth decimal in 4 cells. S1 with the defaults: 64 notes, 61 of 62 (e0808). S2n: 136 notes, 90 of 90 (e0828).
- Time: shared (r0270). For S1 with 1 thread, loading the model took 1.93 s and inference 7.86 s. With 2 threads it was 1.84 s and 9.92 s. With 2 threads asked and no isolation it was 2.08 s and 6.31 s. For S2n it was 3.11 s and 8.36 s with 1 thread, and 1.22 s and 6.53 s with 2. The checking agent's rerun with 1 thread on S1: 1.23 s and 4.40 s (r0451).
- Takes as a hint: the same as the TensorFlow.js version.
- Hands off to: the same as the TensorFlow.js version.

**`browser-timing-check.html`, my agents' measuring page** ([link](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/browser-audio-sync)). One HTML file my agents wrote for me to open in my own Chrome. It repeats the metronome test, runs Basic Pitch on a melody it makes itself, and prints JSON to paste back.

- In: no clip. It synthesizes the 62 notes of S1 itself, each a tone plus 4 harmonics at 22,050 Hz.
- Command or settings: its buttons `Run metronome test` (15 or 61 s per run), `Run model test` and `Run ONNX test`, clicked by `scripts/test_foraaron.mjs` in headless Chrome. The files it loads came from a local copy: 23 from jsDelivr, a public site that serves code libraries, for the first two parts (r0271), and 21 from jsDelivr and raw.githubusercontent.com for the ONNX part (r0313).
- Out: JSON. In the metronome part (15 s, 30 clicks a run), with the page idle, AudioWorklet and the look-ahead loop were 0 ms off, setInterval up to 9.57 ms and Tone.js 0 ms. With the page busy, AudioWorklet was 0 ms off and the look-ahead loop had 3 late clicks, the largest 9.52 ms. With setInterval the mean was 40.68 ms and the largest 102.63 ms, and Tone.js had 3 late, the largest 29.84 ms (r0271). Basic Pitch on `webgl` returned 62 notes, 62 of 62 matched by the page's own check (start within 50 ms, same pitch). The ONNX part matched 62 of 62 and skipped WebGPU, the newer way a page runs work on the graphics card, with `navigator.gpu.requestAdapter() gave no adapter` (r0313). Its first try failed because a file wasn't in the local copy yet, per my agents, and that isn't verified (r0310).
- Time: shared, 272.2 s for both parts (r0271), with Basic Pitch inference 139.4 s on `webgl`. The ONNX part took 3.70 s to start and 6.08 s to run (r0313).
- Takes as a hint: its run length, an `audible` checkbox and an `also run the CPU backend (slower)` checkbox.
- Hands off to: me. Its steps are item 1 of `for-aaron.md`. It wasn't tested over the real jsDelivr site or from a `file://` address.

**Cross-origin isolation** ([link](https://developer.mozilla.org/en-US/docs/Web/API/Window/crossOriginIsolated)). Two HTTP headers a page needs before the browser lets WebAssembly use several threads.

- In: my agents' local server sent `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`, or neither for `?coi=0`.
- Command or settings: `scripts/serve.mjs`.
- Out: `crossOriginIsolated` was `true` and SharedArrayBuffer, memory that several threads can share, was present (r0042). With isolation, ONNX Runtime Web kept the 1 or 2 threads asked for. Without it, ONNX Runtime Web set the thread count to 1 after creating the session (r0270). ffmpeg.wasm's multi-thread core ran in an isolated page (r0314).
- Time: none of its own.
- Takes as a hint: none.
- Hands off to: every file a page loads from another site has to allow it, or the page sends the `Cross-Origin-Embedder-Policy` header as `credentialless` instead. Whether a YouTube embed works under it isn't verified.

**demucs-web 1.0.2** ([link](https://github.com/timcsy/demucs-web)). Meta's HTDemucs model, which splits a mix into stems (one track per instrument), as an ONNX file run by ONNX Runtime Web in the page.

- In: S4_10s, stereo at 44.1 kHz. The model, `htdemucs_embedded.onnx`, is 180,534,758 bytes.
- Command or settings: `separate(left, right)` with `executionProviders: ['wasm']`, since the box has no WebGPU, and `ort.env.wasm.numThreads` 2 or 4 in a cross-origin isolated page.
- Out: four stereo stems, `drums`, `bass`, `other` and `vocals`, 441,000 samples each. My agents paired its `other` stem with S4's guitar and its `vocals` stem with the lead line, a synthesizer sound named Voice Oohs standing in for a singer. SI-SDR is in dB on a scale where a higher number means the stem is closer to the true one. Against S4's true stems it was 8.92 dB for drums, 6.25 for bass, 5.25 for guitar and 6.40 for the lead. Their SIR was 22.28, 21.03, 8.73 and 13.57 dB, on a scale where a higher number means less of the other instruments leaked in (e1223).
- Time: shared (r0329). With 2 threads the model loaded in 3.23 s and separation took 55.6 s for the 10 s clip. With 4 threads, 3.93 s and 117.1 s, on a box shared with my other agents' jobs. That the two runs' stems were identical was stated by the agent that ran the trials and isn't verified.
- Takes as a hint: none for the music. Segment length and overlap are fixed in its code.
- Hands off to: nothing here. Basic Pitch takes a stem only after it's mixed to mono and resampled to 22,050 Hz. This 4-stem model has no guitar stem of its own.

**essentia.js 0.1.3** ([link](https://mtg.github.io/essentia.js/)). The Essentia audio analysis library from MTG-UPF in Barcelona, compiled to WebAssembly, for beats, tempo, key, chords and melody.

- In: S3, S4 and S1, mixed to mono at 44.1 kHz.
- Command or settings: `RhythmExtractor2013(signal, 208, 'multifeature', 40)`, `KeyExtractor(signal)`, `TonalExtractor(signal, 4096, 2048, 440)` and `PitchMelodia(signal)`.
- Out: beat times, a BPM, a key, a chord label per frame (written as a `.lab` file) and a pitch track.
  - Beats: for S3, 37 beats with 30 of the 32 known beats within 70 ms of one, a median 38.7 ms late (e0906). For S4, 74 beats and 67 of 68, a median 28.5 ms late (e0920). For S1, 70 beats and 64 of 64, a median 7.8 ms late (e0936).
  - Tempo: 95.61 BPM for S3, a 96 BPM clip, 115.61 for S4 at 116 and 143.87 for S1 at 144 (e0910, e0923, e0933).
  - Key: G major for S3 and D major for S4 and S1, the known keys (e0913, e0926, e0931). TonalExtractor's own key field said C major for S3.
  - Chords: the same root note as the known chord for 18.8 of S3's 24 seconds (e0916) and 28.8 of S4's 38.7 seconds (e0929). The root is the note a chord is named after.
  - PitchMelodia on S1: within 50 cents of the known note in 2,312 of the 2,624 frames where a note sounds, and a pitch in 24 of the 360 frames where none does (e0938). These counts place each of its frames at the frame's start time. Whether a frame belongs there or half a frame later wasn't checked.
  - The first chord lines for S3, start, end and label:

```text
0.000000	1.578957	Am
1.578957	4.922630	G
4.922630	7.941224	Em
```

- Time: shared (r0314). S3 took 2.90 s in all: 197 ms to start the WebAssembly, 2.15 s for the rhythm step, 69 ms for the key and 148 ms for the chords. S4 took 4.44 s. S1 took 10.62 s, 6.87 s of it for PitchMelodia. The checking agent's rerun: S3 1.92 s and S1 6.21 s, with byte-identical output files (r0451).
- Takes as a hint: `minTempo`, `maxTempo` and `method` for the rhythm step, `tuningFrequency` for the chord and key steps, where a known tuning offset goes in as a reference frequency, and `profileType`, `minFrequency` and `maxFrequency` for the key. No capo or string inputs.
- Hands off to: nothing here. Its beat times are seconds, the kind of list the S4 sync test booked clicks from.

**ffmpeg.wasm 0.12.15** ([link](https://github.com/ffmpegwasm/ffmpeg.wasm)). FFmpeg, a command-line program that converts audio and video, compiled to WebAssembly, with FFmpeg 5.1.4 inside.

- In: `R3a.mp4` (AAC audio, 2,368,626 bytes) and `R3a.webm` (Opus audio).
- Command or settings: `-hide_banner -i in -vn -map 0:a:0 -c:a pcm_s16le out.wav`, with the single-thread core `@ffmpeg/core` 0.12.10 and the multi-thread core `@ffmpeg/core-mt` 0.12.10.
- Out: 16-bit WAV. From the MP4, 3,178,792 bytes at 44.1 kHz stereo, 794,624 frames. From the WebM, 3,456,208 bytes at 48 kHz stereo, 863,978 frames. Against native ffmpeg 6.1.1 with the same arguments, the frame counts were the same and no sample differed by more than 1, the smallest step a 16-bit file can hold. The share of samples that were identical was 99.990 % for the MP4 and 99.989 % for the WebM. The single-thread and multi-thread outputs were identical.
- Time: shared (r0314). MP4 on one thread, 357 ms to load and 494 ms to run. WebM, 427 ms and 426 ms. MP4 on the multi-thread core, 1,396 ms and 373 ms. The checking agent's rerun of the single-thread MP4 took 516 ms and wrote a byte-identical file (r0451).
- Takes as a hint: none, it converts files.
- Hands off to: nothing here. With `-ac 1 -ar 22050` it writes the mono 22,050 Hz audio Basic Pitch needs. Not tried.

**htdemucs_6s ONNX export, `StemSplitio/htdemucs-6s-onnx`, in ONNX Runtime Web 1.31.1** ([link](https://huggingface.co/StemSplitio/htdemucs-6s-onnx)). StemSplit's ONNX export of `htdemucs_6s`, the six-stem version of Meta's Demucs model, which splits a mix into drums, bass, other, vocals, guitar and piano. My agents ran it in the page on WebAssembly in the gap round, for a guitar stem in the browser.

- In: S4_10s, stereo at 44.1 kHz, decoded in the page with `decodeAudioData`. The model file with 16-bit weights, `htdemucs_6s_fp16weights.onnx`, is 136,428,532 bytes. Its card gives the input as `Stereo, 44.1 kHz, 7.8 s segment. Values in [-1, 1].`, so the page cut the clip into 2 pieces of 343,980 samples, the last one padded with silence, that overlap by 85,995 samples, and blended them back together. That part is a line-by-line port of the Python package demucs-onnx 0.3.4. The model turns the sound into frequencies and back inside the file, so the page passes waveforms in and gets waveforms out.
  - Chrome's `decodeAudioData` turned the file's 16-bit samples into floats as `x / 32768` for negative samples and `x * float32(1/32767)` for positive ones. soundfile, the Python reader demucs-onnx uses, does `x / 32768` for every sample. So the clip's 445,024 positive samples were 32768/32767 times larger in the browser (r0608). The checking agent's rerun decoded the same bytes (r0701).
- Command or settings: `ort.InferenceSession.create(modelBytes, SESSION_OPTS)` with `executionProviders: ['wasm']` and `graphOptimizationLevel`, a setting for how much ONNX Runtime rewrites the model before running it. The levels tried were `all` (the level demucs-onnx uses), `basic`, `all` with `enableCpuMemArena: false`, which turns off ONNX Runtime's CPU memory arena, a pool it keeps memory in, and `disabled`. `ort.env.wasm.numThreads` was 1, 2 or 4, in a cross-origin isolated page. Each piece went through `session.run({ mix: new ort.Tensor('float32', buf, [1, CH, N]) })`.
- Out:
  - At `all`, at `basic` and at `all` without the memory arena, `InferenceSession.create` stopped with `Can't create a session. ERROR_CODE: 6, ERROR_MESSAGE: std::bad_alloc`, the C++ error for a failed memory request, after 9.9, 6.5 and 8.2 s (r0593, r0606, r0617). The renderer's peak memory was 4,384.0, 4,386.2 and 4,381.4 MB, where an MB is 1,048,576 bytes. ONNX Runtime Web's docs say `WebAssembly has a memory limit of 4GB.` The checking agent's rerun at `all` stopped the same way after 6.7 s (r0716). Not tried: the `extended` level, the memory setting `enableMemPattern: false`, the model's 258,159,781-byte file with 32-bit weights, and ONNX Runtime Web's proxy worker, which moves the heavy work to a separate background thread. The WebGPU and WebNN providers, the routes through the graphics card and through the browser's Web Neural Network API, weren't tried either, with no adapter on the box.
  - At `disabled` it ran (r0597): six stems, each 441,000 samples on 2 channels, written as float32 WAV at 44.1 kHz. With 4 threads and with 1 the stems were sample-identical to these (r0607, r0613), and the checking agent's rerun wrote byte-identical files (r0687).
  - Each stem's loudest sample, then its RMS level, an average loudness in dBFS, decibels below the loudest a file can hold: drums 0.391 and -28.88, bass 0.284 and -24.68, other 0.0019 and -80.25, vocals 0.401 and -21.88, guitar 0.216 and -31.37, piano 0.324 and -27.77. The six stems added up, minus the mix, came to -12.93 dB against the mix.
  - Against S4's true stems, pairing guitar with `guitar` and the lead line with `vocals`, with the same two measures as demucs-web above: SI-SDR 8.76 dB for drums, 6.90 for bass, -0.35 for guitar and 7.31 for the lead, and SIR 21.10, 19.54, 15.11 and 13.06 dB (e1765). The native run's guitar figures were -0.38 and 15.13 dB (e1766).
  - How much of S4's true guitar track each stem holds, measured by projection, where 1 is the whole track: drums 0.0220, bass 0.0249, other 0.0007, vocals 0.1265, guitar 0.2146 and piano 0.3507, 0.7394 in all. For demucs-web's four stems on the same cut it was drums 0.0164, bass 0.0142, other 0.8696 and vocals 0.0885, 0.9887 in all.
  - With the same input samples and the same level, the browser's stems differed from native ONNX Runtime 1.31.1's by -41.4 dB for guitar to -61.4 dB for bass, the energy of the difference against the native stem's own (r0597 against r0611). Which parts of the WebAssembly build cause that wasn't looked into.
- Time: each browser run had 2 of the box's 4 cores to itself, apart from the decode check (r0608), which ran shared. With 2 threads, creating the session took 15.65 s and splitting the 10-second clip 29.09 s, 13.95 and 15.04 s for the two pieces. With 4 threads it was 16.65 s and 30.25 s, and with 1 thread 16.89 s and 52.73 s. The checking agent's rerun with 2 threads took 15.21 s and 30.97 s (r0687). The renderer's peak memory was 1,319.1, 1,216.1 and 1,204.3 MB (r0597, r0607, r0613). Natively, demucs-onnx's own Python code with ONNX Runtime 1.31.1, held to 2 cores by the checking agent, split the clip in 9.24 s with the optimizations off and 8.38 s with them on, peaking at 1,794.8 and 7,862.5 MB (r0697, r0700). The trial agent's own native runs (r0596, r0603, r0611) left ONNX Runtime's thread count at its default, which in the checking agent's rerun of one of them put worker threads on cores outside the 2 given (r0696), so their times aren't 2-core figures.
- Takes as a hint: none for the music. The piece length is fixed inside the model, as the demucs-onnx browser guide says: `The exported ONNX graph bakes the segment length in`. The settings are ONNX Runtime's session options and the thread count.
- Hands off to: nothing here. Its guitar row, a `Float32Array` of samples at 44.1 kHz, is what Basic Pitch would take after mixing to mono and resampling to 22,050 Hz, and what a waveform view would draw. Not run as a chain.

**js-synthesizer 1.13.0** ([link](https://github.com/jet2jet/js-synthesizer)). FluidSynth, a synthesizer that plays notes with a sound bank of recorded instrument samples, compiled to WebAssembly and run in an AudioWorklet.

- In: `S2n.mid`, S2n's 90 known notes as a MIDI file, and `FluidR3_GM.sf2`, the 148,398,306-byte sound bank that made the test clips.
- Command or settings: `AudioWorkletNodeSynthesizer` with `libfluidsynth-2.4.6.js`, then `loadSFont`, `addSMFDataToPlayer(S2n.mid)` and `playPlayer()`.
- Out: audio inside the page's graph, recorded as a 2-channel float WAV. A note-start detector from librosa, a Python audio library, returned 46 starts in it, 46 of the 48 known ones among them, with notes that start together counted once (e0428). The same detector finds 46 of 48 on the original clip (e0429). Its own MIDI player set the start, so the timing was lined up afterwards. Against the original FluidSynth 2.3.4 render of S2n, its recording had a normalized cross-correlation peak of 0.99908, on a scale where 1 means the same waveform.
- Time: real time, shared (r0225). It loaded in 2.18 s, and 1.26 s in the checking agent's rerun (r0441).
- Takes as a hint: none. A tab's string, fret, tuning and capo reach it only as the MIDI pitch.
- Hands off to: it takes a Standard MIDI File or MIDI events.

**Mediabunny 1.65.2** ([link](https://mediabunny.dev)). A library that reads and writes media files and decodes them with the browser's WebCodecs.

- In: `R3a.webm` (VP9, 539 frames) and `R3a.mp4` (H.264, 540 frames).
- Command or settings: `Input` with `UrlSource` and `ALL_FORMATS`, `VideoSampleSink.samples()` for every frame and `getSample(t)` for 12 times.
- Out: `VideoSample` objects with a timestamp and duration in seconds, in `I420`. All 539 and all 540 decoded frames had a brightness plane bit-identical to ffmpeg 6.1.1's decode of the same frame. Asked for 12 frames by their start times, `getSample` returned that frame in 12 of 12 for the MP4, and for the WebM the frame with the last time at or before the target in 12 of 12. At the same 12 MP4 times the `<video>` element showed the frame before in 10.
- Time: shared (r0314). Decoding every frame took 712.8 ms for the WebM (1.32 ms a frame) and 1,078.7 ms for the MP4 (2.00 ms a frame). `getSample` took 7 to 337 ms a call. The checking agent's rerun decoded the MP4 in 809 ms (r0451).
- Takes as a hint: none. It decodes whatever the browser's WebCodecs decodes.
- Hands off to: each frame went to MediaPipe as a `VideoFrame` with `Math.round(timestamp * 1000)` (r0314, r0329).

**MediaPipe Tasks Vision 1.2.2, HandLandmarker** ([link](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js)). Google's hand tracker for web pages. It finds 21 points on each hand in a video frame.

- In: R3a, R3b and R3c decoded by Mediabunny, and the model `hand_landmarker.task` (float16, 7,819,105 bytes).
- Command or settings: `HandLandmarker.createFromOptions` with `runningMode` `"VIDEO"`, `numHands` 2 and `delegate`, the processor it runs on, set to `"CPU"` or `"GPU"`. Then `detectForVideo(frame, timestampMs)` for each frame.
- Out: for each frame, `landmarks` (21 points per hand, x and y as fractions of the picture, z as relative depth), `worldLandmarks` and `handedness`.
  - R3a on the CPU, all 539 frames: no hand in 1, one hand in 420 and two in 118. Alone, the hand was labelled `Left` in all 420. Pairs were labelled `Left` and `Left` in 62 and `Left` and `Right` in 56.
  - R3a on the `"GPU"` delegate, which ran on WebGL in software here, the first 60 frames: one hand in 53, two in 7. It found the same number of hands as the CPU in 52 of the 60.
  - R3b on the CPU, 150 frames: no hand in 5 and one in 145, all labelled `Left`.
  - R3c on the CPU, 150 frames: two hands in 150 of 150, labelled `Left` and `Right`.
  - The labels weren't checked against the videos. In the R3a runs the page sent one request each to `https://odml.pa.googleapis.com/v1/log`, which my agents' driver blocked (r0314). The R3b and R3c runs sent none (r0329).
- Time: shared, mean per frame. R3a on the CPU 293.5 ms, on the `"GPU"` delegate 3,480.7 ms, R3b 198.7 ms and R3c 148.1 ms. The checking agent's rerun of R3c: 192.7 ms, with the same landmarks to the 4 saved decimals (r0451).
- Takes as a hint: `numHands`, `minHandDetectionConfidence`, `minHandPresenceConfidence` and `minTrackingConfidence`. Nothing about guitars.
- Hands off to: the section *Reading hands and the fretboard from video*, which maps these points to frets and strings.

**ONNX Runtime Web 1.31.1** ([link](https://onnxruntime.ai/docs/tutorials/web/)). Microsoft's library for running ONNX model files in a web page, on WebAssembly or a graphics card.

- In: `nmp.onnx` (Basic Pitch), `htdemucs_embedded.onnx` (demucs-web) and `htdemucs_6s_fp16weights.onnx` (htdemucs_6s), in their own entries.
- Command or settings: the wasm execution provider with `ort.env.wasm.numThreads` 1, 2 or 4, and for htdemucs_6s the `graphOptimizationLevel` session option. Its WebGPU provider is in my measuring page and was skipped here for lack of an adapter.
- Out: tensors (arrays of numbers) for the three models. With cross-origin isolation the thread count stayed as asked. Without it, ONNX Runtime Web set it to 1. With htdemucs_6s, creating the session at the `all` and `basic` levels stopped with `std::bad_alloc`, and `disabled` ran (its entry).
  - In the gap round my agents read Linux's `/proc` every 500 ms to see where its threads ran. In each 2-core run, every Chrome process and every renderer thread that used CPU time was allowed only on those 2 cores, and each of those threads last ran on one of them at every sample (r0597, r0607, r0613). The page saw `navigator.hardwareConcurrency`, the number of cores the browser reports, as 2. With 4 threads asked, ONNX Runtime Web kept `numThreads` at 4, and the renderer had 3 worker threads besides its main thread and used 1.929 seconds of processor time per second while splitting. With 2 threads that was 1 worker thread and 1.656, and with 1 thread no worker thread used processor time and it was 0.823. The checking agent's rerun with 2 threads gave the same picture, at 1.582 (r0687).
- Time: in the Basic Pitch ONNX, demucs-web and htdemucs_6s entries.
- Takes as a hint: none of its own.
- Hands off to: the page code that turns the tensors into notes or stems.

**OpenCV.js 5.0.0, `@techstark/opencv-js` 5.0.0-release.1** ([link](https://github.com/TechStark/opencv-js)). OpenCV, a library of image functions, compiled to WebAssembly and packed into one JavaScript file. In the gap round my agents ran the video lane's steps for finding string and fret lines with it, in the page. The video lane is the agents researching *Reading hands and the fretboard from video*.

- In: still frames with the neck's four corners set by hand: R3a_cu frames 150, 0 and 280 as 640x480 PNG, and R3b frames 225, 0 and 449 as 1920x1080 JPEG. R3a_cu frame 150 also ran with corners taken from a mask of the neck made with SAM 2.1, a model that outlines objects. These are the frames and corners of the video lane's OpenCV runs (r0149, r0214, r0400). The checking agent added R3c frames 225, 0 and 449, with corners set by hand for *Tools handing off to each other* (r0532). The page took each frame either as the RGB bytes OpenCV-Python's `cv2.imread` decoded or as the PNG or JPEG file for Chrome to decode.
- Command or settings: the video lane's Python steps, ported to JavaScript with the same settings. On the frame, `cv.cvtColor` to gray, `cv.fillConvexPoly` to mask the neck, `cv.Canny(gray, edges, 50, 150)` to find edges and `cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 30, 20, 5)` to find straight segments, then each segment inside the neck sorted as string-like or fret-like by its angle and length. Then `cv.getPerspectiveTransform` and `cv.warpPerspective` with `cv.INTER_CUBIC` to straighten the neck into an 800x116 picture (R3a_cu) or 1200x130 (R3b, R3c), the same edge and line steps on it, and the fret and string lines grouped into clusters. Each frame ran 3 times (r0651, r0654).
- Out:
  - For each frame and set of corners: the segments, each as its two end points, their counts, the 3x3 homography (the transform that straightens the neck) and the straightened picture. On R3a_cu frame 150 with the hand-set corners, 142 segments on the frame, 70 of them inside the neck, 37 string-like and 27 fret-like, and 113 on the straightened neck, 31 string-like and 8 fret-like. R3b's frames gave 310 to 375 segments and R3c's 378 to 433. For R3a_cu and R3b these are the video lane's own counts.
  - On all 10 frame and corner pairs the segment lists were identical to OpenCV-Python 5.0.0's, in the same order, and so were the homographies, the counts, the edge-pixel and mask-pixel counts and the clusters. The straightened pictures differed from Python's in 0 to 3 bytes of 278,400 or 468,000, by at most 1 on a byte's 0 to 255 scale (r0651, r0654, r0703, r0704). The Python side's output (r0646, r0653, r0702) equalled the video lane's saved output apart from the times, and for R3c that of the chain run in *Tools handing off to each other* (r0532).
  - Chrome decoded the 3 PNG and 6 JPEG frames to the same RGB bytes as `cv2.imread`, with 0 bytes different.
  - `HoughLinesP` writes a Mat, OpenCV's array type, with 1 row, N columns and 4 channels, `type()` 100, where OpenCV-Python returns an N by 4 array. The first page read one segment per row and so got 1 segment per frame, by the trial agent's account, which isn't verified because its result file was overwritten (r0649).
  - This build has no `createLineSegmentDetector`, `LineSegmentDetector` or `goodFeaturesToTrack`, though the package's type file `imgproc_feature.d.ts` declares `createLineSegmentDetector`. So the video lane's other line finder, LSD, couldn't be ported. Its build information says `Parallel framework: none`, so it runs on one thread.
- Time: each run had 2 of the box's 4 cores to itself. In r0651 and r0654 the 13,298,869-byte file, with its WebAssembly inside, loaded in 272 to 305 ms and was ready in 360 to 418 ms. In their second and third passes the step on the frame took 9.4 to 19.6 ms on R3a_cu's 640x480 frames and 38.9 to 68.8 ms on R3b's 1920x1080 ones, and the step on the straightened neck 9.8 to 20.5 ms and 15.3 to 23.7 ms. The page's times also include sorting the segments, and on the straightened neck grouping the lines into clusters. OpenCV-Python with 2 threads on the same cores took 4.2 to 9.7 and 15.4 to 24.6 ms, and 3.8 to 7.2 and 5.1 to 8.7 ms (r0653). On R3c the page took 46.7 to 67.4 ms and 16.4 to 25.1 ms (r0703, r0704). Chrome took 18.4 to 30.7 ms to decode each PNG and 47.3 to 53.0 ms for each R3b JPEG (r0654), and 47.1 to 52.7 ms for each R3c JPEG (r0704). The renderer's peak memory was 253.4 and 308.2 MB (r0651, r0654).
- Takes as a hint: the four corners, the size of the straightened picture, and the edge and line thresholds. Nothing is learned.
- Hands off to: the homography and the fret positions in the straightened picture, which the fingertip-to-fret step in *Reading hands and the fretboard from video* takes. That step wasn't run from the page.

**Output latency figures, Web Audio API 1.1 in Chrome 153** ([link](https://www.w3.org/TR/webaudio-1.1/)). Numbers the browser reports about the delay between its audio clock and the sound card.

- In: none. The probe page and the sync pages read them.
- Command or settings: an `AudioContext` with the default `latencyHint` and with `playback`.
- Out: `baseLatency` 0.01 s and `outputLatency` 0.032 s after 3 s of running (r0042). Read right after `resume()`, `outputLatency` was 0 (r0143, r0150). With `playback` they were 0.02322 s and 0.072 s, and `playbackStats` gave an average latency of 0.031183 s (r0042). They come from a browser with no sound device, so they don't describe anyone's speakers. `getOutputTimestamp()` was read by the probe (r0042) and logged every 50 ms by both S4 sync pages (r0143, r0150).
- Time: none of its own (the probe, r0042, took 7.53 s pinned to 2 cores).
- Takes as a hint: `latencyHint`. MDN says `the browser may ignore the option`.
- Hands off to: nothing here.

**peaks.js 4.0.0** ([link](https://codeberg.org/chrisn/peaks.js)). A waveform view from BBC R&D, a drawing of the audio a person can click on and mark.

- In: S4 (38.7 s) and R2full, as WAV.
- Command or settings: `Peaks.init({zoomview, overview, mediaElement, webAudio: {audioContext, scale: 128, multiChannel: false}})`.
- Out: waveform data at scale 512, though the page asked for 128, with 3,337 points for S4 and 19,680 for R2full, 44,100 Hz, 1 channel. The checking agent's rerun gave the same (r0451).
- Time: shared (r0329). Ready after 325 ms for S4 and 1,398 ms for R2full.
- Takes as a hint: none. Point and segment markers are its own notes on the waveform.
- Hands off to: nothing here.

**pitchfinder 2.3.4** ([link](https://github.com/peterkhayes/pitchfinder)). A JavaScript set of pitch detectors. Its YIN detector ran.

- In: S1 and R1b, in 2048-sample frames every 441 samples (10 ms).
- Command or settings: `YIN({sampleRate: 44100})`.
- Out: a frequency in Hz or `null` per frame, with `null` counted as 0. On S1 its frequency was within 50 cents of the known note in 2,196 of the 2,624 frames where a note sounds, and it gave a pitch in 359 of the 360 frames where none does (e1228). On R1b, 550 of 1,823, and 1,104 of 1,111 (e1229). Its first rows on S1, where the clip is silent:

```text
time_s,frequency_hz
0.023220,17640.001
0.033220,17640.000
```

- Time: shared (r0329). 6.97 s for S1 and 7.58 s for R1b.
- Takes as a hint: none.
- Hands off to: nothing here.

**pitchy 4.1.0** ([link](https://github.com/ianprime0509/pitchy)). A JavaScript pitch detector that uses the McLeod pitch method.

- In: S1 and R1b, in 2048-sample frames every 10 ms.
- Command or settings: `PitchDetector.forFloat32Array(2048)` and `findPitch(frame, 44100)`.
- Out: a frequency and a `clarity` value from 0 to 1 per frame. It returned 0 Hz for some frames, such as the first ones of S1, before the first note. On S1 with no threshold, it gave a pitch in all 2,624 frames where a note sounds, within 50 cents of the known note in 2,458 of them, and a pitch in 168 of the 360 frames where none does (e1192). With frames under clarity 0.9 counted as silent, 2,333 of the 2,624 note frames still had a pitch, and 119 of the 360 silent frames did (e1200). On R1b, 1,418 of 1,823, with a pitch in 843 of the 1,111 silent frames, or 175 with the clarity cut (e1201, e1202).
- Time: shared (r0329). 1.09 s for S1 (2,979 frames) and 0.68 s for R1b.
- Takes as a hint: the frame size and the clarity threshold the caller applies.
- Hands off to: nothing here. An open string's measured frequency against its expected one gives the tuning offset in cents. Not tried.

**playbackRate and preservesPitch, HTML Living Standard, in Chrome 153** ([link](https://html.spec.whatwg.org/multipage/media.html)). The browser's own slow-down for `<audio>` and `<video>`, with or without keeping the pitch.

- In: S1 in an `<audio>` element, recorded from the page's audio graph.
- Command or settings: `playbackRate` 0.5 and 0.75 with `preservesPitch` `true`, and 0.75 with `preservesPitch` `false`.
- Out: audio. At 0.5x the music lasted 1.99978 times as long, its first note moved -1.13 cents, and 62 of 62 notes were within 50 cents of their written pitch. At 0.75x, 1.33276 times as long, -1.16 cents and 62 of 62. At 0.75x without `preservesPitch`, 1.33333 times as long, -498.05 cents and 0 of 62 (a median of -499.36 cents). The note pitches were read with pyin, a pitch reader in librosa, and that column wasn't rechecked. The checking agent's rerun at 0.75x gave the same length of sound (r0441).
- Time: real time, 59.629 s and 39.761 s from `play()` to `ended` (r0225, shared).
- Takes as a hint: `playbackRate` and `preservesPitch`. A click booked on the audio clock doesn't slow down with it, so its times have to be worked out for the slower tempo.
- Hands off to: nothing here. alphaTab can follow an element like this as outside media.

**realtime-bpm-analyzer 5.6.1** ([link](https://www.realtime-bpm-analyzer.com)). A TypeScript library that guesses the BPM of a file or live audio.

- In: S3, S4 and R2.
- Command or settings: `analyzeFullBuffer(audioBuffer)`.
- Out: a list of `{tempo, count, confidence}` guesses. For S3, a 96 BPM clip, its top guess was 96, with count 9 and confidence 0.206, then 97 and 110 (e1232). For S4, a 116 BPM clip, its top guess was 116, with count 36 and confidence 0.257, then 155 and 93 (e1235). For R2, with no known tempo, its top guess was 144, with count 11, then 96 and 143.
- Time: shared (r0329). 77 to 179 ms per clip.
- Takes as a hint: none.
- Hands off to: nothing here.

**requestVideoFrameCallback, a WICG draft, in Chrome 153** ([link](https://wicg.github.io/video-rvfc/)). A browser feature that calls the page once for each video frame shown, with that frame's time in the video.

- In: `R3a.mp4` and `R3a.webm`, played muted at normal speed.
- Command or settings: `requestVideoFrameCallback`, registered again from inside each callback. Each frame shown was copied with `new VideoFrame(video)` and identified by a hash of its brightness plane, checked against ffmpeg's decode.
- Out: for the MP4, 539 callbacks for 540 frames, with `presentedFrames` up by 1 each time, and 539 of 539 frames shown were the frame whose time is the last at or before `mediaTime` plus 0.5 ms. For the WebM, 536 callbacks in the first pass, where `presentedFrames` stepped by 2 twice, and 537 in the second, with 537 of 537 matching the same way. Seeking the WebM showed the frame whose time is the last at or before the target in 24 of 24. Seeking the MP4 to a frame's exact start time showed that frame in 2 of 12 and the one before in 10 of 12, and to the middle of a frame showed it in 12 of 12. The checking agent's rerun of the MP4 gave 539 of 539 and the same 24 seek frames (r0433).
- Time: real time, shared (r0157 for the MP4, r0156 for the WebM). Callbacks came a mean 33.46 ms apart for the MP4, and identifying a frame took 1.27 ms on average.
- Takes as a hint: none.
- Hands off to: nothing here. `mediaTime` times 1000 is the timestamp MediaPipe's `detectForVideo` takes. The hand runs used Mediabunny's frames instead.

**rubberband-wasm 3.3.0** ([link](https://github.com/Daninet/rubberband-wasm)). The Rubber Band time-stretch library compiled to WebAssembly.

- In: S1.
- Command or settings: `rubberband_new(44100, 2, 0, 1/rate, 1.0)`, a `study` pass, then `process` and `retrieve` in 1024-sample blocks, all ahead of time rather than while playing.
- Out: one float array per channel, exactly the input length divided by the rate. At 0.5x the music lasted 2.00004 times as long, the first note moved +0.09 cents, and 62 of 62 notes were within 50 cents. At 0.75x, 1.33361, +0.05 cents and 61 of 62, where pyin read one note 1199.36 cents off. The note pitches were read with pyin, and that column wasn't rechecked. Its loudest sample was 0.855 and 0.886, against 0.891 in the input.
- Time: shared (r0314). 2,959 ms at 0.5x and 2,163 ms at 0.75x, plus 17 and 13 ms to start the WebAssembly. The checking agent's rerun at 0.5x took 3,761 ms and wrote a byte-identical file (r0451).
- Takes as a hint: rate and pitch scale. Its option flags were left at 0.
- Hands off to: nothing here.

**Signalsmith Stretch 1.3.2** ([link](https://github.com/Signalsmith-Audio/signalsmith-stretch)). Signalsmith Audio's time-stretch and pitch-shift library, as WebAssembly inside an AudioWorklet.

- In: S1.
- Command or settings: in an OfflineAudioContext, `addBuffers` and `schedule({active: true, input: 0, rate, output})` sent during `suspend(256 frames)`, then `resume()`. Sent before `startRendering()` instead, the first try rendered silence (r0170), which isn't verified because its files are gone.
- Out: audio from an AudioNode, rendered ahead of time. At 0.5x the music lasted 2.00483 times as long, the first note moved +3.28 cents, and 62 of 62 notes were within 50 cents. At 0.75x, 1.33396, +2.68 cents and 62 of 62. The note pitches were read with pyin, and that column wasn't rechecked. Its loudest sample was 1.105 and 1.185 in float, above 1.0, against 0.891 in the input.
- Time: shared (r0314). 2,112 ms at 0.5x and 1,357 ms at 0.75x. The checking agent's rerun at 0.5x took 2,439 ms and wrote a byte-identical file (r0451).
- Takes as a hint: `rate`, `semitones`, `tonalityHz`, `formantSemitones` and loop points. Its README says `time-stretching sounds best for more modest changes (between 0.75x and 1.5x)`.
- Hands off to: nothing here. Its `schedule` takes audio-clock times, the clock a metronome uses.

**smplr 1.2.0** ([link](https://github.com/danigb/smplr)). Sampled instruments for Web Audio: recorded notes played back at the pitch asked for.

- In: S2n's 90 known notes as MIDI note numbers with times, and the FluidR3_GM nylon guitar sounds from gleitz's MIDI.js sound fonts (`acoustic_guitar_nylon-ogg.js`, 2,158,023 bytes).
- Command or settings: `Soundfont(ctx,{instrument:'acoustic_guitar_nylon',kit:'FluidR3_GM'})` and `start({note, velocity, time, duration})` for each note, booked ahead on the audio clock, imported from `dist/index.mjs`. The first try imported `dist/index.js` and failed with `module is not defined`, an error text that isn't verified because its file was overwritten.
- Out: audio in the page's graph. The detector returned 46 note starts, 46 of the 48 known ones among them (e0533), a median 14.75 ms after the known time, where it gives 14.67 ms on the original clip. Against the original render, its recording had a normalized cross-correlation peak of 0.650. The checking agent's rerun returned 48 starts, the 2 extra where the recorder logged repeated frames (r0441).
- Time: it loaded in 0.74 s and plays in real time (r0229, shared).
- Takes as a hint: none beyond the MIDI pitch.
- Hands off to: it takes MIDI note numbers with times.

**soundfont-player 0.12.0** ([link](https://github.com/danigb/soundfont-player)). The older sample player by smplr's author.

- In: S2n's 90 notes and the FluidR3_GM nylon guitar sounds as MP3 (`acoustic_guitar_nylon-mp3.js`, 1,837,439 bytes).
- Command or settings: `Soundfont.instrument(ctx,'acoustic_guitar_nylon',{soundfont:'FluidR3_GM'})` and `play(note, time, {duration, gain: velocity/127})`. The first try failed with `Network Error` because my agents' driver blocked the download before the file was cached, an error text that isn't verified.
- Out: 49 note starts returned, all 48 known ones among them (e0540), a median 14.74 ms after the known time. Against the original render, its recording had a normalized cross-correlation peak of 0.648.
- Time: it loaded in 1.47 s and plays in real time (r0229, shared).
- Takes as a hint: none.
- Hands off to: it takes MIDI note numbers with times.

**SoundTouchJS 0.3.0** ([link](https://github.com/cutterbl/SoundTouchJS)). A JavaScript version of the SoundTouch tempo and pitch library.

- In: S1.
- Command or settings: `SoundTouch` with `tempo` set to the rate and `pitch` 1, then `WebAudioBufferSource` and `SimpleFilter.extract()` until it returns 0, ahead of time.
- Out: stereo float frames. At 0.5x the music lasted 2.00203 times as long, the first note moved -2.12 cents, and 62 of 62 notes were within 50 cents. At 0.75x, 1.33322, -1.08 cents and 62 of 62. The note pitches were read with pyin, and that column wasn't rechecked. It returned 0.41 s and 0.29 s less than the input length divided by the rate.
- Time: shared (r0314). 195 ms at 0.5x and 172 ms at 0.75x. The checking agent's rerun at 0.5x took 283 ms and wrote a byte-identical file (r0451).
- Takes as a hint: tempo and pitch.
- Hands off to: nothing here.

**SpessaSynth 4.4.7** ([link](https://spessasus.github.io/spessasynth_lib)). A sound-bank synthesizer and MIDI player written in TypeScript.

- In: S2n's 90 notes and `FluidR3_GM.sf2`.
- Command or settings: an esbuild bundle of `spessasynth_lib` 4.4.7 and `spessasynth_core` 4.4.9, with `WorkletSynthesizer`, `soundBankManager.addSoundBank(sf, 'main')`, `programChange(0,24)`, `noteOn(0,p,v,{time})` and `noteOff(0,p,{time})`.
- Out: 46 note starts returned, 46 of the 48 known ones among them (e0427), a median 13.80 ms after the known time. Against the original render, its recording had a normalized cross-correlation peak of -0.229, since its waveform differs.
- Time: it loaded in 1.79 s and plays in real time (r0225, shared).
- Takes as a hint: none.
- Hands off to: it takes MIDI.

**TensorFlow.js 3.21.0** ([link](https://www.tensorflow.org/js/guide/platform_environment)). Google's library for running models in a web page. Basic Pitch's npm package pulled in 3.21.0, and the newest on npm is 4.22.0.

- In: Basic Pitch's model, `model/model.json` with one weights file.
- Command or settings: the `webgl` (in software here), `cpu` and `wasm` backends.
- Out: in the Basic Pitch entry. `webgl` and `cpu` gave the same notes. `wasm` failed with `Error: Unknown dtype undefined`, thrown during `evaluateModel`.
- Time: in the Basic Pitch entry.
- Takes as a hint: one backend at a time.
- Hands off to: Basic Pitch's note step.

**Tone.js 15.1.22** ([link](https://github.com/Tonejs/Tone.js)). A music library for Web Audio with a Transport, a timeline that runs at a tempo.

- In: no clip. The same 120 BPM click as the other ways of timing it.
- Command or settings: `Tone.setContext(ctx)`, `Transport.scheduleRepeat(cb, '4n')` and `Transport.start(t0)`, with each callback starting the click at the `time` Tone passes in. Tone reported `lookAhead` 0.1 s, `updateInterval` 0.05 s and `clockSource` `"worker"`.
- Out: with the page idle, 0 of 122 clicks off the beat grid. Busy, 7 of 122 late by 0.227 to 2.268 ms, after correcting a 2.902 ms slip in my agents' recorder. Before that correction, the mean was 2.195 ms and the largest 5.170 ms (r0199). The checking agent's busy rerun had 11 off the grid, the largest 10.249 ms (r0433). In the measuring page's 15-second busy run, 3 late, the largest 29.84 ms (r0271).
- Time: real time, 61 s a run, shared (r0199).
- Takes as a hint: `bpm`, and the Transport's start, stop and loop.
- Hands off to: nothing here.

**wavesurfer.js 8.0.5** ([link](https://wavesurfer.xyz)). A waveform view and player.

- In: S4 and R2full as WAV, and `R3a.webm` as its `media`.
- Command or settings: `WaveSurfer.create({container, url, height: 100, width: 1000})` and `exportPeaks({channels: 1, maxLength: 1000})`.
- Out: peaks as numbers from -1 to 1, 1000 per channel. It decoded the audio at 8000 Hz for the drawing. With the video as its media, `getCurrentTime()` equalled `video.currentTime` in 80 of 80 reads over 8 s. The checking agent's rerun gave the same (r0451).
- Time: shared (r0329). Ready after 704 ms for S4, 1,315 ms for R2full and 215 ms with the video.
- Takes as a hint: its Regions plugin marks a stretch of audio, for picking a loop.
- Hands off to: nothing here. alphaTab's position in milliseconds would go in as `setTime(ms / 1000)`.

**Web Audio clock and look-ahead scheduling, Web Audio API 1.1 in Chrome 153** ([link](https://www.w3.org/TR/webaudio-1.1/)). The browser's audio clock, `AudioContext.currentTime`, and booking a sound for an exact time on it with `start(when)`. The plain `setInterval` timer ran next to it for comparison.

- In: no clip for the metronome. S4 as a WAV for sync.
- Command or settings:
  - Metronome, look-ahead loop: a `setTimeout` loop every 25 ms books each click due in the next 100 ms with `AudioBufferSourceNode.start(when)`. Metronome, `setInterval(500 ms)`: each callback starts a click at once with `start()`. Both idle and busy, 122 clicks each.
  - Sync on the same clock: S4 decoded with `decodeAudioData` and started at an exact frame, with a 10 ms click booked on each of its 68 beats.
  - Sync with an `<audio>` element: S4 played in the element, routed in with `createMediaElementSource`, and the clicks booked from `audio.currentTime` by the same 25 ms and 100 ms loop.
- Out: recordings.
  - Look-ahead loop: idle, 0 of 122 off the beat grid. Busy, 11 of 122 late, the largest 42.132 ms, all 11 booked after their time had already passed (r0199). The checking agent's rerun had 8 late, the largest 61.769 ms on the first click (r0433).
  - setInterval, which has no booked times: idle, 5 of 122 more than 5 ms off the grid of its own first click, the largest 42.630 ms. Busy, a mean of 30.724 ms and a largest of 91.202 ms (r0199).
  - Sync on the same clock: 68 of 68 clicks found, 0 to 0.023 ms (one sample) after their beats, with S4's first sample at exactly the booked frame (r0143). The checking agent's rerun gave the same (r0433).
  - Sync with the `<audio>` element: 68 of 68 clicks found, 0 to 2.789 ms after their beats, a median of 0.023 ms. The element's time minus the audio clock moved by 2.00 ms over 38.29 s (r0150).
- Time: real time, 61 s per metronome run and 44.2 and 46.5 s per sync run, shared (r0199, r0143, r0150).
- Takes as a hint: any list of times. Tempo, count-in and click pattern are whatever the code works out, and the 100 ms look-ahead and 25 ms loop are page settings.
- Hands off to: beat times from a beat tracker go in as `start(when)` times at the song's start plus each beat time, as S4's beat list did here.

**web-audio-beat-detector 8.2.39** ([link](https://github.com/chrisguttandin/web-audio-beat-detector)). A small library that guesses a tempo and the first beat of a decoded clip.

- In: S3, S4 and R2.
- Command or settings: `analyze(audioBuffer)` and `guess(audioBuffer)`. My agents built a beat grid from `guess()` as the offset plus n times 60 over the BPM.
- Out: a tempo as a decimal number, and from `guess()` a whole-number BPM and the time of the first beat, with no list of beats. For S3 (96 BPM), `analyze()` gave 96.650 and `guess()` 97 at 0.1439 s, a grid of 39 beats with 22 of the 32 known beats within 70 ms (e1196, e1197). For S4 (116 BPM), 115.970, and 116 at 0.0278 s, a grid of 75 beats with 68 of 68 within 70 ms, each 27.8 ms late (e1198, e1199). For R2, 143.474, and 143 at 0.0968 s, with no known answer. The artist's page lists 72 bpm, which wasn't checked.
- Time: shared (r0329). 73 to 226 ms per call.
- Takes as a hint: `tempoSettings` with `minTempo` and `maxTempo`, and an `offset` and `duration` to look at part of the clip. Its README says `By default the bpm are expected to be between 90 and 180 bpm.`
- Hands off to: nothing here. A metronome on the audio clock would take it as `start(t0 + offset + n * 60 / bpm)`.

**WebCodecs, W3C Working Draft of 9 November 2026, in Chrome 153** ([link](https://www.w3.org/TR/webcodecs/)). A browser feature that decodes and encodes single audio and video frames. It doesn't open MP4 or WebM files, so something like Mediabunny does that part.

- In: the probe page's list of codec names, and R3a through Mediabunny.
- Command or settings: `VideoDecoder.isConfigSupported` and `AudioDecoder.isConfigSupported`.
- Out: video decoding was supported for H.264, VP8, VP9 and AV1 with `no-preference` and `prefer-software`, for none with `prefer-hardware`, and not for HEVC. Audio decoding was supported for AAC, Opus, MP3, pcm-s16 and pcm-f32, while FLAC and Vorbis threw `description is required` (r0042). The decoded frames are in the Mediabunny entry.
- Time: the probe took 7.53 s pinned to 2 cores (r0042).
- Takes as a hint: none.
- Hands off to: its `VideoFrame`s went to MediaPipe through Mediabunny.

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

The list has 101 entries, and 35 of them gave output above. Here are the other 66 and why each didn't run, including WebGPU, which was tried but found no graphics card. Where my agents wrote steps for me to try it myself, the line gives the item number in `for-aaron.md` in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/browser-audio-sync).

- **abcjs and osmd-audio-player**: players tied to sheet-music drawing, covered under *Showing, editing and playing a tab in the browser*. No steps.
- **@alexanderolsen/libsamplerate-js**: found by the checking agent in the npm registry, not surveyed in depth and not run. No steps.
- **aubio** (the C library inside aubiojs): not run on its own here. Only its license was read, and its command-line tool is in other sections. No steps.
- **audio-decode**: found by the checking agent, not surveyed in depth and not run. No steps.
- **audiomotion-analyzer**: found by the checking agent, not surveyed in depth and not run. No steps.
- **audiowaveform** (a program that precomputes waveform data for peaks.js): not reached in the time available, with no known blocker. No steps.
- **Basic Pitch web demo** (basicpitch.io): it needs a person to drop a file into the page. The same library ran headless above. Steps for me: item 2.
- **`Beat This!`** (the Python beat tracker): covered under *Chords, beat, key and tuning*, not run here. No steps.
- **`Beat This!` ONNX export** (`musetric/beat-this-onnx`): it's packaged for WebGPU, which the box lacks. Its card says the wasm route `also works and gives identical results, at roughly 12× the wall clock`, and that wasn't tried for lack of time, since the page would have had to build the model's input itself. No steps.
- **Bungee** (Parabola Research): not reached in the time available, with no known blocker. No steps.
- **Bungee Pro and the Bungee Pro Web SDK**: they need a commercial agreement, and the price isn't published. No steps.
- **bungee-pitch-shift** (a WebAssembly build of Bungee on npm): not reached in the time available, with no known blocker. No steps.
- **@csound/browser**: found by the checking agent, not surveyed in depth and not run. No steps.
- **Demucs** (Meta's Python original): covered under *Splitting a song into instruments*. No steps.
- **demucs-js** (bakkot): not run, and my agents' notes don't say why. No steps.
- **demucs-rs**: its browser version needs WebGPU, which the box lacks. Steps for me: item 3, its browser demo.
- **demucs-wasm** (bengfarrell): not reached in the time available, with no known blocker. No steps.
- **@echogarden/rubberband-wasm**: not reached in the time available, with no known blocker. No steps.
- **@echogarden/sonic-wasm**: found by the checking agent, not surveyed in depth and not run. No steps.
- **@elemaudio/core**: found by the checking agent, not surveyed in depth and not run. No steps.
- **@elemaudio/web-renderer**: found by the checking agent, not surveyed in depth and not run. No steps.
- **FluidSynth** (the native program): not run as a tool here. Its 2.3.4 render made the test clips, and js-synthesizer's recording was compared with it. No steps.
- **fnaught** (a small pitch model as one ONNX file): found by the checking agent, not surveyed in depth and not run. No steps.
- **free-music-demixer** (sevagh): not run here, and my agents' notes don't say why. The section on splitting a song into instruments quotes its README: it's no longer maintained, and its model weights aren't included. No steps.
- **Ghilda/htdemucs-onnx**: not run, and my agents' notes don't say why. No steps.
- **@grame/faustwasm**: found by the checking agent, not surveyed in depth and not run. No steps.
- **howler**: found by the checking agent, not surveyed in depth and not run. No steps.
- **@ircam/sc-components**: found by the checking agent, not surveyed in depth and not run. No steps.
- **@ircam/sc-scheduling**: not reached in the time available, with no known blocker. No steps.
- **libav.js**: not run, and my agents' notes don't say why. No steps.
- **libavjs-webcodecs-polyfill**: not run, and my agents' notes don't say why. No steps.
- **LiteRT.js**: not reached in the time available, with no known blocker. No steps.
- **Magenta.js** (`@magenta/music`, with the Onsets and Frames transcription model): not reached in the time available, with no known blocker. No steps.
- **MediaPipe Studio hand landmarker demo**: the box has no GPU, and from the box the address went to Google's sign-in page. Steps for me: item 4.
- **Meyda**: not reached in the time available, with no known blocker. No steps.
- **MidiPlayerJS**: not reached in the time available, with no known blocker. No steps.
- **ml5.js**: not reached in the time available, with no known blocker. No steps.
- **monteslu/htdemucs-web-onnx**: it's exported for ONNX Runtime Web on WebGPU, which the box lacks. No steps.
- **mp4box.js**: not reached in the time available, with no known blocker. No steps.
- **node-web-audio-api**: found by the checking agent, not surveyed in depth and not run. No steps.
- **OpenVoicing** (an open-source practice app built on alphaTab and Signalsmith Stretch): not reached in the time available, with no known blocker. No steps.
- **@remotion/media-parser**: found by the checking agent, not surveyed in depth and not run. No steps.
- **@remotion/webcodecs**: found by the checking agent, not surveyed in depth and not run. No steps.
- **@rnbo/js**: found by the checking agent, not surveyed in depth and not run. No steps.
- **Rubber Band Library** (the original): only its license page and the WebAssembly builds' READMEs were read. The library itself ran through rubberband-wasm. No steps.
- **rubberband-web**: not reached in the time available, with no known blocker. No steps.
- **sevagh/demucs.onnx and demucs.cpp**: not run in the browser here, and my agents' notes don't say why. demucs.cpp ran natively, outside a browser, in the section on splitting a song into instruments (r0509). No steps.
- **SoundTouch** (the original C++ library): only its license page was read. No steps.
- **@soundtouchjs/audio-worklet and @soundtouchjs/core** (the newer SoundTouchJS packages): not reached in the time available, with no known blocker. No steps.
- **standardized-audio-context**: not tried. It was only installed as another package's dependency. No steps.
- **Superpowered Web Audio SDK**: not tried. The only reason on record, a license key, came from the agent that ran the trials, and the checking agent struck it as not supported by the sources. Its terms say the evaluation license `is offered for internal, private experimentation and R&D purposes (eg PoC) only and does not allow for public release`, and its pricing page says `Superpowered is sunsetting`. No steps.
- **SwiftF0 browser demo**: found by the checking agent, not surveyed in depth and not run. No steps.
- **@tonejs/midi**: not reached in the time available, with no known blocker. No steps.
- **Transformers.js**: not installed. A notice on the shared box said `start no new download or install over 200 MB unless your lane cannot finish without it`, and per the npm registry its version 4.3.2 depends on `onnxruntime-web` (144,895,056 bytes) and `onnxruntime-node` (301,068,136 bytes). No steps.
- **WAAClock**: not reached in the time available, with no known blocker. No steps.
- **waveform-data.js**: not reached in the time available, with no known blocker. No steps.
- **waveform-playlist**: found by the checking agent, not surveyed in depth and not run. No steps.
- **web-demuxer**: not reached in the time available, with no known blocker. No steps.
- **WebAudioFont**: not reached in the time available, with no known blocker. No steps.
- **@webaudiomodules/api**: found by the checking agent, not surveyed in depth and not run. No steps.
- **WebGPU**: tried, but the box's Chrome found no adapter (`requestAdapter()` returned `null`) and WebGL ran in software. Steps for me: item 1, where my measuring page tries ONNX Runtime Web on WebGPU, and item 3.
- **webmidi**: found by the checking agent, not surveyed in depth and not run. No steps.
- **WebNN**: not tried. Browser support data lists it in Chrome 112 behind a flag only. No steps.
- **webnn/stem-separator**: not tried, and my agents' notes don't say why for the first round. The gap round ran StemSplit's six-stem export instead, for a guitar stem. This tool's model is the four-stem htdemucs. Its card describes it as `running entirely client-side via ONNX Runtime Web with WebNN (NPU/GPU) acceleration, cascading to WebGPU/WASM`, which the checking agent took to mean a WebAssembly run wouldn't need a graphics card. Its weights are about 168 MB. No steps.
- **worker-timers**: not reached in the time available, with no known blocker. No steps.
- **YouTube iframe player API** (as alphaTab's docs use it): not tried, and my agents' notes don't say why. YouTube's own terms are quoted in the notes of the agents researching *Services an agent can call over the internet* (their `survey.md`), not in that section. No steps.

</details>

<details><summary>Licenses of the tools that ran</summary>

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| alphaTab 1.9.0 | MPL-2.0, section 3.2: `If You distribute Covered Software in Executable Form then: (a) such Covered Software must also be made available in Source Code Form` ([LICENSE](https://unpkg.com/@coderline/alphatab@1.9.0/LICENSE)) | none. Its bundled sound bank, `sonivox.sf2`, is Apache-2.0 | none |
| aubiojs 0.2.1 | MIT for the package. The aubio library compiled into it is GPL-3.0-or-later, and its COPYING begins `GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007` ([COPYING](https://raw.githubusercontent.com/aubio/aubio/master/COPYING)) | none | none |
| Basic Pitch for the browser 1.0.1 | Apache-2.0 | the model ships inside the Apache-2.0 package, with no separate license file for it | GuitarSet, MAESTRO, Slakh, iKala and MedleyDB, per the paper. MAESTRO: `The dataset is made available by Google LLC under a Creative Commons Attribution Non-Commercial Share-Alike 4.0 (CC BY-NC-SA 4.0) license.` ([MAESTRO](https://magenta.tensorflow.org/datasets/maestro)). Neither Basic Pitch README says how the training data's licenses bear on the released model. |
| Basic Pitch ONNX model | Apache-2.0, the Python repository's license | `nmp.onnx` ships in that repository, with no separate license for it | the same as above |
| `browser-timing-check.html` | written by my agents for this research, no license stated | none | none |
| demucs-web 1.0.2 | MIT | `htdemucs_embedded.onnx`: no license stated, since its Hugging Face repository has no model card. The maintained Demucs fork says `The license of the weights is not clear: MusDB contains some data that were only usable for research purpose.` ([README](https://raw.githubusercontent.com/adefossez/demucs/main/README.md)) | MUSDB18-HQ and 800 more songs of Meta's. MUSDB18-HQ: `MUSDBHQ: is provided for educational purposes only and the material contained in them should not be used for any commercial purpose without the express permission of the copyright holders` ([Zenodo](https://zenodo.org/api/records/3338373)) |
| essentia.js 0.1.3 | AGPL-3.0, section 13: `if you modify the Program, your modified version must prominently offer all users interacting with it remotely through a computer network` ([LICENSE](https://unpkg.com/essentia.js@0.1.3/LICENSE)). Its makers: `Essentia is available under an open licence, Affero GPLv3, for non-commercial applications, thus it is possible to test the library before deciding to licence it under a comercial licence.` ([licensing](https://essentia.upf.edu/licensing_information.html)) | none used here | none |
| ffmpeg.wasm 0.12.15 | MIT for `@ffmpeg/ffmpeg`, GPL-2.0-or-later for `@ffmpeg/core` and `@ffmpeg/core-mt` per their npm fields, and none of the three ships a license file. Its FAQ: `@ffmpeg/core contains WebAssembly code which is transpiled from original FFmpeg C code with minor modifications, but overall it still following the same licenses as FFmpeg and its external libraries (as each external libraries might have its own license).` ([FAQ](https://ffmpegwasm.netlify.app/docs/faq)). The core here was built with `--enable-gpl`. | none | none |
| htdemucs_6s ONNX export (`StemSplitio/htdemucs-6s-onnx`) | MIT, per its card's license field and the card's `This repo is **MIT-licensed**, matching the original HT-Demucs.` ([card](https://huggingface.co/StemSplitio/htdemucs-6s-onnx/raw/main/README.md)). The page ported its code for cutting and blending the pieces from demucs-onnx 0.3.4, which is MIT too | Meta's `htdemucs_6s` weights converted to ONNX. The MIT statements are the converter's, and none is a license grant from Meta. The Demucs maintainer's README: `The license of the weights is not clear: MusDB contains some data that were only usable for research purpose.` ([README](https://raw.githubusercontent.com/adefossez/demucs/main/README.md)) | Meta's internal dataset, per the same README: `The 6 source variant of htdemucs was trained only on Meta internal dataset, which likely means CC-NC-BY license is applicable, as it was the case for all models released by FAIR.` |
| js-synthesizer 1.13.0 | BSD-3-Clause. On the FluidSynth file inside it, its README says `its license (LGPL v2.1) is different from js-synthesizer's (BSD-3-Clause).` ([repository](https://github.com/jet2jet/js-synthesizer)) | none. The sound bank used, FluidR3_GM, is MIT per its author | none |
| Mediabunny 1.65.2 | MPL-2.0. Its README: `If you modify Mediabunny's licensed source code (e.g. in a fork) and then distribute it, you must publicly publish your modifications under the Mozilla Public License 2.0.` ([README](https://unpkg.com/mediabunny@1.65.2/README.md)) | none | none |
| MediaPipe Tasks Vision 1.2.2 | Apache-2.0 | `hand_landmarker.task`: Apache-2.0 per its model card, which lists as out of scope `Predicting hand landmarks with gloves or occlusions. For example when the hand is holding objects or there is decoration on the hand including jewelry, tattoo and henna.` and says `The model has been trained on limited datasets and is meant for experimental usage.` ([model card](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Hand%20Tracking%20(Lite_Full)%20with%20Fairness%20Oct%202021.pdf)) | Google's hand page, quoted by my video agents for the same `hand_landmarker.task`, says `The model was trained on approximately 30K real-world images, as well as several rendered synthetic hand models imposed over various backgrounds.` No public dataset is named |
| ONNX Runtime Web 1.31.1 | MIT | none of its own | none |
| OpenCV.js 5.0.0 (`@techstark/opencv-js` 5.0.0-release.1) | Apache-2.0, section 2: `Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license` ([LICENSE](https://unpkg.com/@techstark/opencv-js@5.0.0-release.1/LICENSE)) | none | none |
| peaks.js 4.0.0 | LGPL-3.0, section 4: `You may convey a Combined Work under terms of your choice that, taken together, effectively do not restrict modification of the portions of the Library contained in the Combined Work and reverse engineering for debugging such modifications, if you also do each of the following:` ([COPYING](https://unpkg.com/peaks.js@4.0.0/COPYING)) | none | none |
| pitchfinder 2.3.4 | its npm field says `"license": "GNU v3"`, and no license file was found in the package or at the top of its [repository](https://github.com/peterkhayes/pitchfinder) | none | none |
| pitchy 4.1.0 | MIT | none | none |
| realtime-bpm-analyzer 5.6.1 | Apache-2.0 | none | none |
| rubberband-wasm 3.3.0 | GPL-2.0, npm field `GPLv2`. Its README: `Rubber Band Library is open source software under the GNU General Public License. If you want to distribute it in a proprietary commercial application, you need to buy a licence.` ([repository](https://github.com/Daninet/rubberband-wasm)) | none | none |
| Signalsmith Stretch 1.3.2 | MIT | none | none |
| smplr 1.2.0 | MIT, per its `package.json` and README, with no license file | none. The FluidR3_GM sounds used here are CC BY 3.0 per gleitz's README and MIT per the sound bank's author, and neither source refers to the other. smplr's default kit, MusyngKite: `Released under [Creative Commons Attribution Share-Alike 3.0 license](https://creativecommons.org/licenses/by-sa/3.0/)` ([README](https://github.com/gleitz/midi-js-soundfonts)) | none |
| soundfont-player 0.12.0 | MIT | none. The same FluidR3_GM sounds as smplr | none |
| SoundTouchJS 0.3.0 | LGPL-2.1, its LICENSE begins `GNU LESSER GENERAL PUBLIC LICENSE Version 2.1, February 1999` ([LICENSE](https://unpkg.com/soundtouchjs@0.3.0/LICENSE)) | none | none |
| SpessaSynth 4.4.7 | Apache-2.0 | none. The sound bank used, FluidR3_GM, is MIT per its author | none |
| TensorFlow.js 3.21.0 | Apache-2.0 | none of its own | none |
| Tone.js 15.1.22 | MIT | none | none |
| wavesurfer.js 8.0.5 | BSD-3-Clause | none | none |
| Web features: AudioWorklet, cross-origin isolation, output latency figures, playbackRate and preservesPitch, requestVideoFrameCallback, the Web Audio clock, WebCodecs | built into the browser, a web platform API with no license to accept | none | none |
| web-audio-beat-detector 8.2.39 | MIT | none | none |

Every clause with its source, for these and the tools that didn't run, is in `survey.md` in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/browser-audio-sync).

</details>

## Tools handing off to each other

In the app, each step would hand its result to the next. My agents linked 15 tools from the other lanes into five chains, ran 8 of them and used the files the other 7 had already made. On S4, a band mix I synthesized, Demucs, Basic Pitch and tuttut found 233 of the 369 guitar notes, 214 of them on the real string and fret.

<ao-compare cols="2" aspect="62/27">
<figure><img src="/media/guitar-tab-tools/chains-s4-madmom-grid.webp" width="1240" height="540" alt="The first four bars of a tab drawn by alphaTab. A row of five chord diagrams named D, A, Bm, G and Em, each with all six strings marked x, then tempo 116, a 4/4 bar with two notes at fret 1 on the lowest string, a bar of rests, and bars 3 and 4 with the chord names D and A over tab numbers."><figcaption><b>On madmom's beats</b><span class="ao-meta">S4 at the end of the full-song chain. Demucs pulled out the guitar stem, the guitar's own track. Basic Pitch found its notes and tuttut picked a string and fret for each. madmom gave the bars and chord names, PyGuitarPro wrote the file and alphaTab drew it. Bars 1 to 4 of 18.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/chains-s4-beatthis-grid.webp" width="1240" height="540" alt="The first five bars of the same tab on another beat grid. Six chord diagrams named D, A, Bm, G, Em7 and A7, all strings marked x, tempo 116, then a 1/4 bar of rests, a 3/4 bar with the chord name D and two notes at fret 1 on the lowest string, a 4/4 bar of rests, and bars 4 and 5 with tab numbers and the chord name A over bar 5."><figcaption><b>On <code>Beat This!</code> beats</b><span class="ao-meta">The same tab notes on the bars of the <code>Beat This!</code> beat tracker, with chord names from Chordino, a chord recogniser. The file opens with a 1-beat and a 3-beat bar. Bars 1 to 5 of 19.</span></figcaption></figure>
<figure class="wide"><img src="/media/guitar-tab-tools/chains-r3c-fingertip-cells.webp" width="1200" height="260" alt="A guitar neck from a lesson video, warped flat into a wide strip with the strings running left to right. Magenta vertical lines mark the lines OpenCV found, the numbers 1 to 19 along the top mark the fitted frets, and five green dots on the fretting hand are labelled index s2 f2, middle s3 f3, ring s3 f3, thumb s2 f3 and pinky s1 f4."><figcaption><b>Fingertips on fret cells</b><span class="ao-meta">Frame 225 of R3c, a real guitar lesson video. The neck is flattened from an outline set by hand. The magenta lines are the lines found by OpenCV, a computer vision library, and the fret numbers come from a fret model fitted to them. The dots are fingertips from MediaPipe, a hand tracker, marked with string (s) and fret (f). From "Manx Guitar Lesson: Three Little Boats" (2019) by Culture Vannin, presented by Pete Lumb, via <a href="https://commons.wikimedia.org/wiki/File:Manx_Guitar_Lesson-_Three_Little_Boats_2019.webm">Wikimedia Commons</a>, <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>, warped and marked up.</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

In the app, a guitar track pulled out of a song would go to a note finder. Its notes would go to a tab writer that picks a string and fret for each one, and the tab would go to a player. The chains used eight clips: five I synthesized so every note is known, a real band song and two real guitar videos.

The five chains, as my agents named them:

- A, full song to tab, beat grid and chords: S4, a 39-second band mix I synthesized, and R2, 36 seconds of a real band song with singing and no known answer.
- B, fingerstyle audio to melody, bass and taps. Fingerstyle means picking the strings with the fingers. S6taps is a 29-second fingerstyle clip I synthesized: a thumb bass under a melody, with drum-kit hits standing in for 32 taps on the guitar body. S2s has the same steel-string notes without the taps.
- C, a user correction: S5capo2, the same fingerstyle piece with a capo on fret 2, and S5dropd, the piece in Drop D (the lowest string tuned down to D).
- D, video with audio. R3b is 18 seconds of a home video of a classical guitar, a close view with the player's face out of frame and the whole fretboard in view. R3c is 18 seconds of a guitar lesson video with both hands in view. Neither has a known answer.
- E, tab to reference playback with a metronome in the browser: S4.

Found means a note that starts within 50 ms of a real note and is within half a semitone of its pitch, each real note counted once. A semitone is the step from one fret to the next. A beat is found within 70 ms of a real one. Chord seconds are the time the chord label matched the real chord, compared as major or minor. Every tool ran with its defaults or with a setting another lane had already written down, and nothing was tuned. Eight tools ran in this lane. For the other seven, the files their own lanes had made on the same cloud box went into the chains. Lanes go by my notes' short names here: source-separation is *Splitting a song into instruments*, audio-to-notes *Turning sound into notes*, chords-beats-key *Chords, beat, key and tuning*, guitar-tab *Choosing the string and fret*, fingerstyle *Melody, bass and taps from one guitar*, the video lane *Reading hands and the fretboard from video*, web-tab-render *Showing, editing and playing a tab in the browser* and the browser lane *Metronome and sync in the browser*. Times are real elapsed seconds on 2 CPU cores unless the line says otherwise, and local runs cost nothing beyond the cloud session.

One chain took S4 all the way to a Guitar Pro file, the format of the Guitar Pro tab app. It used Demucs to pull out the guitar, Basic Pitch to find its notes and tuttut to pick a string and fret for each. Before the file, that chain found 233 of the 369 real guitar notes, and 214 of them were on the same string and fret as the real part. My agents' three other pairings, with the becruily separator or with LilyPond as the tab writer, found 217 to 229 and put 106 to 199 on the real string and fret. In the Guitar Pro file, 223 of the 369 were found at 116 beats per minute, the clip's real tempo. At 115, the tempo taken from the median gap between the beats a beat tracker marked, 57 were.

A capo is a clamp across the strings that raises every note. The two tab writers, tuttut and LilyPond, have no setting for one. So for the clip played with a capo on fret 2, the capo went in as open strings tuned 2 semitones up. Open strings are the ones played without pressing a fret.

**alphaTab 1.9.0** ([link](https://github.com/CoderLine/alphaTab)). A library that draws tab in a web page and plays it back.

- In: chain A's Guitar Pro 5 files, S4 on the madmom grid (`S4.madmom.span.gp5`, 6,468 bytes), S4 on the `Beat This!` grid and R2 on the madmom grid. alphaTab loads a file by URL (`core.file`), here in headless Chromium, a browser with no window, on the web-tab-render lane's page or a copy of it with one option added.
- Command or settings: screenshots with that lane's `shot.cjs`, once with the page's defaults (r0522) and once with `?lazy=0`, which sets `core.enableLazyLoading = false` (r0523, below). In chain E, `exportAudio` made two renders in chunks of 1,000 ms with `useSyncPoints` off, one with the guitar track at volume 0 and one with the metronome at volume 0 (r0535, below).

```text
bash -c 'for f in S4.madmom.span S4.beatthis.span R2.madmom.span; do node /home/user/blog/docs/guitar-tab-research/lanes/web-tab-render/scripts/shot.cjs '"'"'http://127.0.0.1:8791/cpages/alphatab_chains.html?lazy=0&file=/chains/out/gp5/'"'"'$f'"'"'.gp5'"'"' out/render/$f.nolazy '"'"'window.__rendered === true'"'"' 60000 1240; done'
node /home/user/blog/docs/guitar-tab-research/lanes/browser-audio-sync/scripts/drive.mjs '/cpages/chainE.html?gp=/chains/out/gp5/S4.madmom.span.gp5&beats=/chains/inputs/S4.madmom.downbeats.txt&gp0=-0.01&tag=S4.madmom.span' out/chainE/S4.madmom.span.result.json --port 8791 --timeout 300
```

- Out: the drawn tab, and a `renderFinished` log line with its size. S4 on the madmom grid: 18 bars, tempo 116, 1,200 x 2,353 px. alphaTab's default lazy loading puts off drawing parts of the page. With it on, the full-page screenshot showed bars 1 to 8 and blank space below. With it off, it showed all 18 bars. Chord names sat over their beats, and the header showed one chord diagram per name with every string marked x. S4 on the `Beat This!` grid: 19 bars, 1,200 x 2,381 px, opening with a 1/4 and a 3/4 bar. R2: 12 bars, 1,200 x 2,134 px. Chain E: two 37.76-second stereo float renders at 44.1 kHz. The metronome render held 73 clicks, one for each beat of the file.
- Time: r0522 4.61 s and r0523 4.32 s for the three files, 124.8 MB peak memory. The chain E page, r0535, took 47.71 s and 573.4 MB, not pinned to 2 cores because other lanes' jobs held both slots.
- Takes as a hint: none was given. It took the tempo (116) and the bars from the file.
- Hands off to: the screenshots are the pictures above. In chain E both renders went into one `AudioContext` (the browser's audio clock) with a click scheduled at each of madmom's 65 tracked beats, shifted by the file's start at -0.01 s in the audio. The guitar render started on the exact audio sample it was scheduled for, and all 65 clicks were found on theirs. Each tracked-beat click came 3.88 to 26.53 ms after the nearest alphaTab metronome click (mean 16.38 ms), 52 of 65 within 20 ms and 1 within 5 ms. alphaTab's own clicks inside the span of real beats came 10.07 to 11.45 ms before the real beats (r0538). That range lies within 0.07 ms of the file's -0.01 s start plus the -1.429 to 0 ms the browser lane measured for alphaTab's metronome against its own grid (r0195).

**Basic Pitch 0.4.0** ([link](https://github.com/spotify/basic-pitch)). Spotify's note finder: audio in, a list of notes out.

- In: four WAV files. S4's guitar stem from the becruily model (float32 stereo), R2's guitar stem from Demucs (16-bit stereo), and the harmonic parts of S6taps and S2s from librosa, the sustained sound left once the percussive hits were split off (float32 stereo). Basic Pitch loads each file at 22,050 Hz mono itself, so nothing was converted first.
- Command or settings: `bp_run.py` (36 lines) calls `predict()` with the audio-to-notes lane's defaults: the TFLite version of its model, onset 0.5, frame 0.3, minimum note length 127.70 ms, no frequency limits (r0511).

```text
venv-bp/bin/python /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/bp_run.py out/bp S4becruily-Guitar=/home/user/gtr/lanes/source-separation/out/msst-becruily-guitar/S4/Guitar.wav R2sep6s-guitar=/home/user/gtr/lanes/source-separation/out/htdemucs_6s/R2/guitar.wav S6taps-hpss-harmonic=/home/user/gtr/lanes/source-separation/out/hpss/S6taps/default/harmonic.wav S2s-hpss-harmonic=/home/user/gtr/lanes/source-separation/out/hpss/S2s/default/harmonic.wav
```

- Out: per file a MIDI file (a list of notes with start times) and a note-events CSV in seconds (`start_time_s,end_time_s,pitch_midi,velocity,pitch_bend`). The MIDI has 220 ticks per quarter note and one tempo of 120 BPM (beats per minute), a fixed default and not the clip's tempo, so the seconds are what carries over.
  - S4 becruily stem: 406 notes, 229 of the 369 real guitar notes found (e1447).
  - S6taps harmonic part: 175 notes, 83 of 90 found, bass 41 of 48 and melody 42 of 42 (e1448). 92 had no real note to match. From the whole mix the audio-to-notes lane had 196 notes, 90 of 90 found, 106 with no match (e0512).
  - S2s harmonic part: 174 notes, 86 of 90, bass 44 of 48 and melody 42 of 42 (e1449), 88 with no match. From the whole mix 199 notes, 90 of 90, 109 with no match (e0495).
  - R2 stem: 305 notes from MIDI note 30 to 97, 29 of them below 40, the low E of standard tuning.
  - The four MIDI files hold no pitch-bend messages, though the CSVs carry bend values. With `multiple_pitch_bends` off, Basic Pitch 0.4.0 drops the bends of every note that overlaps another note in time, and every note in these four files overlaps another (runs r0589 and r0590, by the agent that checked this lane's work).
- Time: r0511, 24.68 s for the four files, 383.1 MB peak memory.
- Takes as a hint: a note range, `minimum_frequency` and `maximum_frequency` in Hz. For chain C the audio-to-notes lane ran it on S5dropd with 73.4 Hz and 1319 Hz for Drop D (r0349): 129 notes, 90 of 90 found (e1335). A range set for standard tuning, 82.4 to 1319 Hz, had removed the four D2 notes before any tab writer saw them (r0234: 86 of 90, e0544).
- Hands off to: tuttut as MIDI, and LilyPond as `.ly` text written from that MIDI (chains A and C), the voice split as CSV (chain B), and the taps join as note start times (chain B). The R3b and R3c notes for chain D came from the audio-to-notes lane's run r0264 (129 and 87 notes).

**`Beat This!` 1.1.0** ([link](https://github.com/CPJKU/beat_this)). A beat tracker: it marks each beat and the first beat of each bar, the downbeat.

- In: S4 and R2 audio, in the chords-beats-key lane's run r0397. Not run in this lane.
- Command or settings: the `final0` model.
- Out: two text files, `final0_beats.txt` and `final0_downbeats.txt`, one time in seconds per line. S4: 68 beats from 0.52 s with 65 of the 68 real beats found, and 18 downbeats with all 17 real ones found (e1494). R2: 43 beats and 11 downbeats.
- Time: not timed in this lane (r0397).
- Takes as a hint: not recorded in this lane.
- Hands off to: the Guitar Pro step as its bar grid (see PyGuitarPro). It put 3 beats and a downbeat in S4's silent first bar, so that file opens with a 1-beat and a 3-beat bar.

**becruily Mel-Band RoFormer guitar model, through MSST** ([link](https://huggingface.co/becruily/mel-band-roformer-guitar)). A separation model that pulls a guitar track out of a mix. It ran through MSST, a toolkit that runs separation models.

- In: `S4.wav`, a WAV at 44.1 kHz, 2 channels, 16-bit, 38.741 s, in the source-separation lane's run r0491. Not run in this lane. MSST's `msst-inference` wants a folder holding the file (`--input_folder`), a config and a checkpoint.
- Command or settings: `--model_type mel_band_roformer` with the checkpoint `becruily_guitar.ckpt` and `--force_cpu`.
- Out: one WAV, `Guitar.wav` with a capital G, float32 stereo, the one target the model has.
- Time: 289.53 s in the source-separation lane (r0491).
- Takes as a hint: not recorded in this lane.
- Hands off to: Basic Pitch (r0511, above). Demucs names its file `guitar.wav` and this model `Guitar.wav`, so picking the guitar stem took a rule for each tool.

**Chordino, through chord-extractor 0.1.3 and vamp 1.1.0** ([link](https://github.com/c4dm/nnls-chroma)). A chord recogniser: it names the chord at each moment of a recording. chord-extractor and vamp are the Python packages that run it.

- In: S4 and R2 audio, in the chords-beats-key lane's run r0215. Not run in this lane.
- Command or settings: as that run set them.
- Out: a `.lab` text file, one segment per line with start, end and a plain chord name (`D`, `Bm`). S4: 18 segments, the first (`N`, no chord) starting at 0.372 s, not at 0. The label matched the real chord for 34.34 of S4's 38.74 seconds (e1496). R2: 16 segments, `N F# Ebm Bmaj7 F# Bb7 Ebm B Bb7 Eb F7 F#6 C# Ab Bb Bdim`.
- Time: not timed in this lane (r0215).
- Takes as a hint: not recorded in this lane.
- Hands off to: the Guitar Pro step as chord names (see PyGuitarPro). It spells roots with flats (`Ebm`, `Bb7`), where madmom uses sharps (`D#:min`, `A#:maj`).

**Demucs 4.1.0, `htdemucs_6s` model** ([link](https://github.com/adefossez/demucs)). A separation model that splits a mix into six stems (a stem is one instrument's track pulled out of a mix).

- In: `S4.wav` and `R2.wav`, in the source-separation lane's runs r0021 (S4) and r0428 (R2). Not run in this lane.
- Command or settings: `-n htdemucs_6s -d cpu`, default options.
- Out: six WAVs with lowercase names, `drums.wav`, `bass.wav`, `other.wav`, `vocals.wav`, `guitar.wav` and `piano.wav`, 16-bit stereo. Some of S4's real guitar also landed in `piano.wav`, by that lane's measure.
- Time: 36.37 s for S4 (r0021).
- Takes as a hint: not recorded in this lane.
- Hands off to: Basic Pitch. On S4 the audio-to-notes lane's run r0243 turned the guitar stem into 342 notes with 233 of the 369 real guitar notes found (e0652), and tuttut then placed them (below). R2's guitar stem went through Basic Pitch in this lane (r0511, above).

**librosa 1.0.0, HPSS and onset detection** ([link](https://github.com/librosa/librosa)). HPSS splits audio into a sustained, harmonic part and a percussive part. The onset detector lists the times where new sounds start.

- In: the S6taps and S2s mixes, in the source-separation lane's runs r0262 (S6taps) and r0268 (S2s). Not run in this lane.
- Command or settings: HPSS `default` (margin 1), then `librosa.onset.onset_detect` on S6taps' percussive part.
- Out: `harmonic.wav` and `percussive.wav`, float32 stereo at 44.1 kHz, as long as the input. S6taps' onset list: 53 times in seconds, one per line, with no label. All 32 real taps were among the 53, and the other 21 were guitar-note attacks (e0815).
- Time: not timed in this lane (r0262, r0268).
- Takes as a hint: not recorded in this lane.
- Hands off to: Basic Pitch took the harmonic parts as they were (above). The onset list was joined with Basic Pitch's notes from S6taps' harmonic part by `chainB_taps.py` (54 lines, r0540, 0.03 s, not pinned). 5 onsets had no note within 50 ms, and they were the 5 real taps that fall between notes. The other 48 had a note: 27 were taps played with a bass note and 21 were notes with no tap. Timing alone didn't tell those 27 from those 21.

**LilyPond 2.24.3** ([link](https://lilypond.org/index.html)). A music engraver: it reads a text file and prints tab. The string and fret of each note come out as data through the guitar-tab lane's Scheme add-on, which logs each note's moment, string and fret.

- In: Basic Pitch's MIDI merged into one track, turned into LilyPond's own `.ly` text by the guitar-tab lane's `run_lilypond_tab.py`, which groups notes that start within 30 ms and writes them as 16th-note chords, a 16th note being a quarter of a beat.
- Command or settings: the system binary `/usr/bin/lilypond`, through the guitar-tab lane's scripts, run by `bash /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/batch_tab.sh` (r0514) and `bash /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/batch_chainC.sh` (r0528). Chain C told it Drop D (D2 A2 D3 G3 B3 E4) with `--tuning` and pinned one note with `--pin 1:55:4`.
- Out: an engraved tab and, through the add-on, a list of moment, string and fret. A note it can't place gets a `No string for pitch` warning and is left out.
  - S4, notes from the Demucs stem: 329 written with 13 warnings, 229 found, 199 on the same string and fret as the real part (e1451).
  - S4, notes from the becruily stem: 392 written with 14 warnings, 217 found, 106 on the real string and fret (e1453).
  - R2: 266 written with 39 warnings. No fret limit was given, so it wrote frets up to 33, with 3 notes above fret 19.
  - S5capo2, from the guitar-tab lane's run r0240 and compared note by note here: told nothing, 0 notes on the real string and fret counted from the capo (e0683). Told the capo, 90 found and 86 of them on the real string and fret (e0739). Of 136 paired notes, 95 kept their string and 41 moved.
  - S5dropd, same source: told nothing, 86 found and 72 on the real string and fret, with the 4 D2 notes given no string (e0700). Told Drop D, 90 of 90 found, all 90 on the real string and fret (e0740). All 125 paired notes kept their string, and 16 changed fret on it, the G2 on string 6 going from fret 3 to fret 5.
  - Drop D given to Basic Pitch and LilyPond both (r0528): 90 found, 90 on the real string and fret, no warnings (e1512).
  - The pin: LilyPond reads a string mark on a single note (`note\N`). The guitar-tab lane's `run_lilypond_tab.py` wrote the G3 of chord group 1, counting from 0, as `g\4`, a mark for string 4. Against the same run without the pin, 128 of 129 notes stayed the same. One changed: the G3 at 2.15 s moved from string 3 fret 0 to string 4 fret 5. That left 89 of 90 on the real string and fret (e1513), against 90 in e0740.
- Time: r0514, 9.80 s and 79.8 MB peak memory for the merge, tuttut and LilyPond on three files plus chain B's first tab try. r0528, 4.38 s and 75.8 MB.
- Takes as a hint: the tuning (`stringTunings`), `minimumFret`, `restrainOpenStrings`, `maximumFretStretch`, and a string mark on one note (`note\N`). No capo: the capo went in as open strings raised 2 semitones (`--capo-as-tuning 2`).
- Hands off to: nothing further here. Its add-on gives an order of chord groups and no rhythm, so the Guitar Pro step used tuttut's list.

**madmom 0.16.1** ([link](https://github.com/CPJKU/madmom)). An audio analysis library. Two of its programs went into the chains, the `DBNDownBeatTracker` for beats and bar starts and the CNN chord recogniser, CNN being a kind of neural network.

- In: S4 and R2 audio, in the chords-beats-key lane's runs r0072 (S4) and r0316 (R2). Not run in this lane.
- Command or settings: `DBNDownBeatTracker` and the CNN chord recogniser, as those runs set them.
- Out: `downbeats.txt`, one row per beat, `time<TAB>beat number`, with times on a 10 ms grid. S4: 65 rows from `2.070<TAB>1`, 65 of the 68 real beats found and all 17 downbeats (e1492). R2: 43 rows from `0.600<TAB>4`. The chord file is a `.lab` with start, end and a Harte label, a text form of chord names (`D:maj`, `B:min`). S4: 18 segments from 0.000 s, matching the real chord for 37.16 of 38.74 seconds (e1495). R2: 16 segments, every label major or minor.
- Time: not timed in this lane (r0072, r0316).
- Takes as a hint: not recorded in this lane.
- Hands off to: the Guitar Pro step as bar lines and chord names (see PyGuitarPro). madmom's separate beat tracker (`beats.txt`, another program) starts at 0.52 s with 74 beats, while the downbeat tracker starts at 2.07 s, at S4's count-in, the bar of four side-stick clicks before the song.

**MediaPipe Hand Landmarker 1.2.2** ([link](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker)). A hand tracker: it marks 21 points on each hand it finds in a video frame.

- In: R3b and R3c, 450 frames each at 25 frames a second, in the video lane's group job r0408. Not run in this lane.
- Command or settings: as that job set them.
- Out: JSONL, a text file with one record per line. Here each line is a frame: `n`, `t_s` = n / 25, and per hand `label`, `score`, `index` and 21 landmarks as normalized x, y, z (`lm_norm_view`), as full-frame pixels (`lm_px_full`) and in metres (`world_m`). R3b: a `Left` (fretting) hand in 445 of 450 frames. R3c: both hands in all 450.
- Time: not timed in this lane (r0408).
- Takes as a hint: not recorded in this lane.
- Hands off to: `chainD_join.py` (99 lines, r0533, 0.53 s, not pinned). It mapped fingertips 8, 12, 16 and 20 through frame 225's neck model on every frame (see OpenCV) and matched each Basic Pitch note start to the nearest frame. A fingertip over a cell isn't necessarily pressing that string.
  - Frames with at least one of the four fingertips on a fret cell from 1 to 19: R3b 445 of 450, R3c 444 of 450.
  - Note starts with a frame within 20 ms: 129 of 129 on R3b and 87 of 87 on R3c, and every one of those frames had a fretting hand. With at least one fingertip on a string-and-fret cell: 129 of 129 and 85 of 87.
  - Pitch check, standard tuning and no capo (r0533, r0546). R3b: 65 of the 129 pitches matched an open string and 28 a fingertip cell, 85 one or the other, and 44 neither. With every fret moved by -1 the cell matches were 36, by +1, 27. R3c: 31 of the 85 pitches with cells matched an open string and 6 a fingertip cell, 36 one or the other, and 49 neither. With every fret moved by -1 the cell matches were 17, by +1, 6.
  - The fretting hand is taken as MediaPipe's `Left` label. The video lane found that the older MediaPipe `solutions` API labels the same R3c hand `Right`.

**music21 10.5.2** ([link](https://github.com/cuthbertLab/music21)). A toolkit for working with music as notes. The fingerstyle lane's rule M1 uses its parse to label each note melody or bass.

- In: Basic Pitch's notes of the harmonic parts as the note-events CSV (S6taps 175 notes, S2s 174), read by the fingerstyle lane's `voice_split.py`. M1 writes them into a MIDI file at the real tempo, 112 BPM, for music21 to read.
- Command or settings (r0513, both clips and every rule of the script in one go):

```text
bash -c '/home/user/gtr/lanes/fingerstyle-voices-taps/venv-core/bin/python /home/user/blog/docs/guitar-tab-research/lanes/fingerstyle-voices-taps/scripts/voice_split.py S6taps out/bp/S6taps-hpss-harmonic.notes.csv out/voicesplit/S6taps && /home/user/gtr/lanes/fingerstyle-voices-taps/venv-core/bin/python /home/user/blog/docs/guitar-tab-research/lanes/fingerstyle-voices-taps/scripts/voice_split.py S2s out/bp/S2s-hpss-harmonic.notes.csv out/voicesplit/S2s'
```

- Out: a CSV of `onset, offset, pitch, voice`. S6taps: 77 notes labelled melody and 98 bass, and 64 of the 83 found notes got their real voice. S2s: 23 melody and 151 bass, 51 of 86. On S2s, 122 of the 174 notes couldn't be found again in music21's parse (same pitch within 0.1 s) and got the lane's default label, bass. On S6taps, none.
- Time: r0513, 4.23 s for both clips and every rule, 164.1 MB peak memory.
- Takes as a hint: a tempo, to write M1's MIDI. The real 112 BPM was given.
- Hands off to: tuttut, with the labels carried around it (below).

**OpenCV 5.0.0** ([link](https://github.com/opencv/opencv)). A computer vision library. Its LSD (line segment detector) found lines in a flattened picture of the neck.

- In: R3c frames 225, 0 and 449 as JPEG pictures. My agents set an outline of the neck by hand on frame 225, from three zoomed crops. Its corners are (1655, 335), (1705, 378), (1210, 903) and (1112, 858) in full-frame pixels, and the neck inside it was flattened to 1200 x 130. The video lane's scripts ran unchanged apart from the frame folder.
- Command or settings (r0532):

```text
bash -c '/home/user/gtr/lanes/video-hands-fretboard/venv-mediapipe/bin/python /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/video_lane_copy/run_opencv_lines.py out/chainD/opencv-lines-R3c --clip R3c --frames 225,0,449 --quad 1655,335,1705,378,1210,903,1112,858 --size 1200,130 && /home/user/gtr/lanes/video-hands-fretboard/venv-mediapipe/bin/python /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/video_lane_copy/handoff_fingertip_to_cell.py /home/user/gtr/lanes/video-hands-fretboard/out/mediapipe-hands/R3c_full.jsonl out/chainD/opencv-lines-R3c/opencv_lines_R3c.json out/chainD/handoff R3c 225'
```

- Out: 13 clusters of lines on frame 225. The one at 3.6 px was taken as the nut, the strip at the head end of the neck that the strings rest on. The others sit at 22.2 px, then from 540.8 to 1045.2 px. A 12-TET fret model, the fret spacing of an equal-tempered guitar, was fitted to them. It dropped 540.8 and 615.2 and took the 9 clusters from 685.4 to 1045.2 px as frets 9 to 17. Its fit error was 5.33 px RMS (root mean square) and 8.75 px at most. Fingertip cells on frame 225: index string 2 fret 2, middle string 3 fret 3, ring string 3 fret 3, pinky string 1 fret 4, and the thumb inside the board at string 2 fret 3. For R3b the video lane had fitted frets 8 to 19 the same way (r0214, r0402).
- Time: r0532, 2.22 s, 162.0 MB peak memory.
- Takes as a hint: none. The outline's corners and the flattened size go in on the command line.
- Hands off to: the frame-225 mapping was applied to all 450 frames in chain D's join (see MediaPipe), with the camera taken as fixed and the guitar as not moving, which wasn't tracked. Each string's cell is one of six equal strips across the neck. The fret numbers come from the 12-TET fit, which the video lane found can differ by one fret from counting the wires on R3b. Which numbering matches the guitar was not verified.

**partitura 1.9.0** ([link](https://github.com/CPJKU/partitura)). A package for written music. Its `estimate_voices` splits a list of notes into voices.

- In: the same Basic Pitch notes of the harmonic parts, through `voice_split.py`.
- Command or settings: `estimate_voices` with two settings, the lane's P1 and P2, in the same run as music21 (r0513, above).
- Out: 8 voices on each clip. The lane's labelling rule then marked 1 note melody and the rest bass, so 41 of the 83 found notes got their real voice on S6taps and 44 of 86 on S2s, the same with both settings.
- Time: part of r0513 (4.23 s for the whole run).
- Takes as a hint: not recorded in this lane.
- Hands off to: nothing. The tab writer got the labels of two other rules instead: B1, the fingerstyle lane's pitch threshold at MIDI note 55, and M1, its music21 rule.

**PyGuitarPro 0.11** ([link](https://github.com/Perlence/PyGuitarPro)). A library that reads and writes Guitar Pro files.

- In: three inputs, joined by `tab_beats_to_gp5.py`, a 195-line glue script, meaning a small script my agents wrote to pass one tool's output to the next. They are tuttut's list of notes with a start in seconds, a string and a fret but no lengths or bars, a beat tracker's grid from madmom or `Beat This!`, and the chord labels of madmom's CNN or of Chordino.
- Command or settings: `bash /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/batch_gp5.sh` (r0520). The glue script adds beats at the median beat gap before the first tracked beat, and after the last one until the last note is covered. It starts a bar at each beat within 35 ms of a downbeat. It cuts each beat into four 16th notes and moves each note to the nearest one. It keeps one note per string per 16th and sets the tempo by one of three rules. Median: 60 over the median gap between tracked beats. Span: from the first to the last tracked beat. Per bar: the span tempo plus a tempo change on every bar.
- Out: Guitar Pro 5 (GP5) files, with bars and time signatures, beats with note values at 960 ticks per quarter, one whole-number song tempo and optional tempo changes. 12 files: S4 and R2, each on the madmom and the `Beat This!` grid, with each tempo rule. Read back against S4's real notes:
  - S4 on the madmom grid: 18 bars, 325 of 342 notes written. 17 were dropped as a second note on the same string in the same 16th. Before the GP5, tuttut's list had 233 found and 214 on the real string and fret (e1450).
  - Median rule, 115 BPM. madmom's times sit on a 10 ms grid, so the median gap of a 116 BPM beat (0.5172 s) came out as 0.52 s. 57 of the 369 real guitar notes found, 52 on the real string and fret (e1486). The 16th slots drifted from the tracked beats by up to 0.295 s by the end. Beats where the file plays them: 14 of 68 found, downbeats 4 of 17 (e1488).
  - Span rule, 116 BPM, the clip's real tempo: 223 found, 210 on the real string and fret (e1497), drift at most 0.029 s. Beats 68 of 68 with 73 beats in the file, downbeats 17 of 17 (e1498). The 73 are 4 beats the glue added before the count-in, the 65 tracked beats and 4 added after the last one.
  - Per-bar rule, 115 to 117 BPM: 223 found, 210 on the real string and fret (e1500), beats 68 of 68 (e1501).
  - On the `Beat This!` grid: 53 found and 49 on the real string and fret at the median tempo (e1487), 223 and 210 at the span tempo (e1503).
  - Chord names: 17 of 18 written (the `N` segment has none). madmom's CNN labels in the madmom-grid file matched the real chord for 36.59 s at the span tempo (e1499) and 34.04 s at the median tempo (e1490). Chordino's in the `Beat This!`-grid file: 33.62 s (e1505) and 32.00 s (e1491).
  - A chord with `firstFret` unset made PyGuitarPro raise `GPException: ... got TypeError: int() argument must be a string, a bytes-like object or a real number, not 'NoneType'` (run r0566, by the agent that checked this lane's work). The glue writes the names with `firstFret` 0 and no fingering, and alphaTab then drew an empty diagram for each.
  - R2 on the madmom grid: 72 BPM, the file's time 0 at -0.23 s in the audio, 12 bars of 2, 4 (ten times) and 1 beats, 264 of 298 notes written (34 dropped). On the `Beat This!` grid: 72 BPM, 266 written.
- Time: r0520, 1.99 s for the 12 files, 36.8 MB peak memory.
- Takes as a hint: nothing to analyse, it writes what it's given. A GP5 file holds one whole-number tempo plus tempo changes, and a tuning and a capo per track (the test set's own GP5 files were written that way with PyGuitarPro 0.11). It has no field for where its time 0 sits in the audio, so that offset (-0.01 s for S4 on the madmom grid) had to travel beside the file.
- Hands off to: alphaTab (the pictures above, and chain E).

**tuttut 0.0.7** ([link](https://github.com/natecdr/tuttut)). A MIDI-to-tab program: it picks a string and fret for each note.

- In: one MIDI file. tuttut pools all non-drum notes and takes bars from the MIDI time signatures. The notes came from Basic Pitch, merged into one track by the guitar-tab lane's `merge_midi.py`. Chain B's labelled notes went in through `chainB_voice_tab.py` (113 lines). It writes a MIDI file at 120 BPM and 220 ticks per quarter note. The notes are on instrument 25, steel-string guitar, at velocity 80, the MIDI word for how hard a note is played, and each lasts at least 10 ms. It gives tuttut standard tuning with 20 frets.
- Command or settings: `bash /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/batch_tab.sh` (r0514), `bash /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/batch_chainC.sh` (r0528), and for chain B (r0515):

```text
bash -c 'for clip in S6taps S2s; do for m in B1_threshold_T55 M1_music21; do /home/user/gtr/lanes/guitar-tab/venv-sym/bin/python -I /home/user/blog/docs/guitar-tab-research/lanes/chains/scripts/chainB_voice_tab.py out/voicesplit/$clip/$m.csv out/tab/chainB --name $clip.$m; done; done'
```

- Out: through the guitar-tab lane's `run_tuttut.py`, a list of notes with start time in seconds, string and fret, with no lengths and no bars. It leaves out notes of chords it can't finger and moves notes out of its range by octaves.
  - S4, notes from the Demucs stem: 342 written, 233 found, 214 on the same string and fret as the real part (e1450).
  - S4, notes from the becruily stem: 390 of 406 written, 220 found, 143 on the real string and fret (e1452).
  - R2: 298 of 305 written, 29 on open strings, highest fret 20 (its fret count), notes on strings 1 to 6: 30, 37, 63, 65, 66 and 37.
  - S6taps with the fingerstyle lane's B1 labels (a pitch threshold at MIDI note 55), all notes in one run: 171 of 175 written. Bass 40 of 48 found, 35 on the real string and fret (e1455). Melody 41 of 42 found, 31 on the real string and fret (e1456). 3 collisions, meaning a bass and a melody note on the same string while both sound. One run per voice: bass 41 found and all 41 on the real string and fret (e1458), melody 42 found and 29 on it (e1459), 6 collisions. 159 of the 171 notes got the same string and fret both ways.
  - S2s with B1 labels, one run: bass 43 found and 35 on the real string and fret (e1467), melody 41 found and 29 on it (e1468), 6 collisions. Per voice: bass 44 found and all 44 on the real string and fret (e1470), melody 42 found and 27 on it (e1471), 8 collisions. 153 of 170 the same both ways.
  - With music21's M1 labels: 23 collisions in one run and 29 per voice on S6taps, 10 and 12 on S2s. Melody notes found, 24 on S6taps and 8 on S2s, both ways (e1462, e1465, e1474, e1477).
  - S5capo2, from the guitar-tab lane's run r0240 and compared note by note here: told nothing, 90 of 90 found and 0 on the real string and fret counted from the capo (e0678). Told the capo, 90 found and all 90 on the real string and fret (e0732). Of 139 notes, 82 kept their string with every written fret 2 lower, and 57 moved string.
  - S5dropd, same source: told nothing, 86 found (the 4 D2 notes written as D3) and 72 on the real string and fret (e0695). Told Drop D, 90 found and 86 on the real string and fret (e0733). 14 of 126 paired notes moved string.
  - Drop D given to Basic Pitch and tuttut both (r0528): 90 found, 86 on the real string and fret (e1511).
- Time: r0514 9.80 s with LilyPond, 79.8 MB peak memory. r0515 1.21 s, 39.1 MB. r0528 4.38 s with LilyPond, 75.8 MB.
- Takes as a hint: the tuning (a `Tuning` with D2 on string 6 for Drop D), the fret count, the weights of its difficulty measure and a fixed number in its code for hand span. No capo: it went in as open strings raised 2 semitones (`F#4 C#4 A3 E3 B2 F#2`) with frets counted from the capo. No string or fret for a single note and no voice input, so the voice labels had to be carried around it. They were joined back by start time, within 2.5 ms, and by pitch class, the note name ignoring the octave. A first try joined within 1 ms and lost 18 to 20 labels per run, because MIDI ticks move start times by up to 1.1 ms (r0514, replaced by r0515).
- Hands off to: the Guitar Pro step (see PyGuitarPro).

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

Every run in this lane finished without an error. These are the parts my agents listed as not done. Each of the three below ran on the box in another lane. What wasn't done is the step that links it into a chain. No reason is recorded unless the line gives one, and this lane has no steps for me to try any of them myself.

- **alphaTab's real-time player** (chain E): not measured in this chain. The exported renders were played in the page's own audio clock instead, so the playback and the clicks shared one clock by construction. The browser lane had to tap the player's own audio nodes to record it (r0269).
- **RTMPose and YOLO pose** (chain D): two other models that mark points in video frames. RTMPose marks 21 points on each hand, and YOLO pose marks 17 points on the body, the wrists among them. Chain D wasn't run with their points. Their outputs are on disk in the video lane.
- **tutts** (chain A, as a third tab writer): not done, and no reason is recorded. In the guitar-tab lane's table of runs on Basic Pitch's notes, tutts wrote as many notes as tuttut on 5 of the 8 clips. On S3, strummed chords I synthesized, it wrote 183 to tuttut's 186. R1a and R1c are real guitar recordings from GuitarSet, a research dataset. On R1a it wrote 193 to tuttut's 195, and on R1c 152 to 153. On those three clips tuttut reduces chords it can't finger to fewer notes, and tutts writes them empty.

Two other steps weren't done either: a GP5 file carrying two voices and a percussion track for the taps (chain B), and chain E on R2.

</details>

<details><summary>Licenses of the tools that ran</summary>

This lane recorded no licenses. Every tool in these chains came from another lane, and that lane's survey quotes its license, or records that none was found.

| Tool | License recorded in |
|---|---|
| alphaTab 1.9.0 | [web-tab-render](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/web-tab-render) |
| Basic Pitch 0.4.0 | [audio-to-notes](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/audio-to-notes) |
| `Beat This!` 1.1.0 | [chords-beats-key](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/chords-beats-key) |
| becruily Mel-Band RoFormer guitar model and MSST | [source-separation](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/source-separation) |
| Chordino | [chords-beats-key](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/chords-beats-key) |
| Demucs 4.1.0 | [source-separation](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/source-separation) |
| librosa 1.0.0 | [source-separation](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/source-separation) |
| LilyPond 2.24.3 | [guitar-tab](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/guitar-tab) |
| madmom 0.16.1 | [chords-beats-key](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/chords-beats-key) |
| MediaPipe Hand Landmarker 1.2.2 | [video-hands-fretboard](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/video-hands-fretboard) |
| music21 10.5.2 | [fingerstyle-voices-taps](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/fingerstyle-voices-taps) |
| OpenCV 5.0.0 | [video-hands-fretboard](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/video-hands-fretboard) |
| partitura 1.9.0 | [fingerstyle-voices-taps](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/fingerstyle-voices-taps) |
| PyGuitarPro 0.11 | [guitar-tab](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/guitar-tab) |
| tuttut 0.0.7 | [guitar-tab](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/guitar-tab) |

Each lane's quoted clauses are in its `survey.md`. This lane's full record, every handoff with its runs and checks, is `trials.md` in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/chains).

</details>

## Services an agent can call over the internet

This step sends audio to someone else's server through an API, the way one program talks to another. My agents listed 76 entries for it, and 10 sent back results on 12 of my test clips. On a 90-note clip I synthesized, MiMo returned 29 notes (1 of the 90 among them), Muse Spark Open none and YourMT3 126 (79 among them).

<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/guitar-tab-tools/hosted-apis-beatthis-s4.webp" alt="Two rows of tick marks over a 0 to 38 second axis. The top row, Played, has 68 cream ticks starting after a shaded silent first bar, with a tall tick every fourth beat. The bottom row, the demo page's answer, has 68 blue ticks at the same spacing. Its first three sit inside the shaded silent bar and its last one comes about 1.5 seconds before the top row's last."><figcaption><b><code>Beat This!</code> on S4</b><span class="ao-meta">S4, a band mix I synthesized. Its 68 played beats on top, the 68 the demo page returned below.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/hosted-apis-mimo-s3-chords.webp" alt="Three rows of labelled boxes over a 0 to 24 second axis. Played: none, G, Em, Am7, D7, G, Em, C, D7, G, most boxes 2.5 seconds long. Answer 1: G, Em, C, D, G, Em, C, D, G, G, starting at 0 seconds. Answer 2: none, G, Em, Am7, D7, G, Em, C, D7, G, most boxes 2.3 seconds long."><figcaption><b>MiMo's chords for S3, asked twice</b><span class="ao-meta">S3, 24 seconds of strummed chords I synthesized. The second answer came back for the exact same request.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/hosted-apis-mimo-s2n-notes.webp" alt="A piano roll of S2n, time from 0 to 29 seconds across, pitch from below C3 to above C6 up the side. Cream outlines mark the 90 played notes from about 2 seconds to the end. MiMo's 29 notes are violet bars, all before 8.5 seconds, and notes of the same pitch that overlap share one bar. Six bars, holding eight notes, start before the first played note."><figcaption><b>MiMo's notes for S2n</b><span class="ao-meta">S2n, a fingerstyle clip I synthesized. Played notes outlined, MiMo's filled.</span></figcaption></figure>
<figure><img src="/media/guitar-tab-tools/hosted-apis-yourmt3-s2n-notes.webp" alt="The same piano roll with YourMT3's 126 notes as filled bars in three colors, one per MIDI track: Acoustic Piano 15, Electric Piano 58 and a guitar track 53. Filled bars sit in or beside the cream outlines of the played notes through the whole clip, and nine orange notes, drawn as seven bars, sit around C6, above every played note."><figcaption><b>YourMT3's notes for S2n</b><span class="ao-meta">The CPU demo page's MIDI file, a list of notes with start times. Played notes outlined, one color per track.</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

Nine of these ran on the provider's hardware, not on the box, the cloud computer my agents used. So for them there's no time on 2 of the box's cores and no memory figure, only the round trip from sending the file to having the whole answer. Three more entries on my agents' list ran as helpers and come up inside these entries. The Python library `gradio_client` called the Hugging Face demo pages, the Vercel AI Gateway passed requests on to three of the models, and the audio and video tool ffmpeg made the video frames and decoded the ElevenLabs stems on the box. For every note count below, a played note is among the returned notes when one of them starts within 50 ms of it and sits within 50 cents of its pitch. A cent is a hundredth of a semitone, and a semitone is one fret. MiMo, Muse Spark Open and YourMT3 were asked for the notes of S2n, a 29-second fingerstyle clip I synthesized so every note is known. It has 90 notes, a bass line played with the thumb and a melody on top. None of the transcription or track-splitting request formats my agents read, for these services or for the ones that didn't run, has a field for capo, tuning, the song's key or its tempo. A capo is a clamp across the strings that raises every note.

**`Beat This!`, on the Hugging Face Space `teamup-tech/Beat-This`** ([Space](https://huggingface.co/spaces/teamup-tech/Beat-This)). A beat and downbeat tracker (a downbeat is the first beat of a bar). A Space is a demo page that runs a model on Hugging Face's servers. The Space's code, `app.py`, runs `beat_this.inference.File2Beats` with the saved model file `final0.ckpt` and `dbn=False`. That's the code as of commit `8f2aa339`, a saved version of the Space.

- In: S4 as a stereo WAV, `S4.wav`. It's a 38.7-second band mix I synthesized, with drums, bass, strummed guitar and a lead line. Also R1c as `R1c.wav`, 28 seconds of a real bossa nova guitar take from the GuitarSet dataset, which comes with its notes annotated.
- Command or settings: endpoint `/process`, the address on the Space that a program calls. It was called with `gradio_client` 2.7.2, a Python library for calling Spaces, and no Hugging Face access token (`scripts/hf_space_call.py`). The audio file is the only input.
- Out: a WAV of the input with clicks mixed in, and a `pyharp.LabelList` of labels `beat` or `downbeat`, each with a time `t` in seconds. On S4 it returned 68 beats, 18 of them downbeats. 65 of the 68 landed within 70 ms of one of the clip's 68 played beats, a median 12.4 ms after them, and all 17 played downbeats were matched (e0160). Its first beats were at 0.52, 1.06 and 1.56 seconds. The first played beat is at 2.069 seconds, after a silent bar. On R1c it returned 56 beats, all 56 within 70 ms of the 56 annotated ones, and 14 of 14 downbeats (e0693).
- Time: ran on the Space's `cpu-basic` hardware. Round trip 12.59 s for S4 (r0118) and 5.69 s for R1c (r0246). The verifier's re-run on S4 (r0308, 6.89 s) returned the same 68 beat times and the same click WAV, byte for byte. Free.
- Takes as a hint: none.
- Hands off to: not tried. Soundslice, a player that shows music notation and tab in sync with a recording, lines the two up with sync points. Its docs give a sync point as `[zero_based_bar, time_in_seconds, optional_position_0_to_480]`, so downbeat times give one sync point per bar.

**`bytedance/seed-2.1-turbo`, through the Vercel AI Gateway** ([gateway](https://vercel.com/docs/ai-gateway)). A ByteDance model. The gateway is a router that reaches many AI model providers with one key, and its catalog lists this model with input `text, image, video`. My gateway key is on the free tier, which allowed this model.

- In: R3a, an 18-second excerpt of a real classical guitar concert video. It went in first as the MP4 file, then as 18 JPEG frames, one per second. The frames were made on the box with ffmpeg, an audio and video tool, using `ffmpeg -vf fps=1 -q:v 3`. That step wasn't in the run log at first, so my agents ran it again through the log later (r0600) and got the same 18 files, byte for byte, and so did the verifier (r0662).
- Command or settings: a Chat Completions request, the chat format the gateway takes, to `https://ai-gateway.vercel.sh/v1`. Each frame went in as an `image_url` part after a label, `Frame at t = <k>.0 s:`, then the video prompt. My agents asked for the answer as JSON, a structured text format, in a layout set by a schema. A schema is the list of fields the answer has to fill. This model lists no `response_format` setting, which carried the schema for the other models, so the schema went into the prompt text (`scripts/gateway_frames_trial.py` with `--schema-in-prompt`). `max_tokens` was 16384, a cap on the tokens it may write. A token is the unit these models read, write and charge by.
- Out: the MP4 was refused before running, HTTP 400 `'file part media type video/mp4' functionality not supported.` (r0086). From the frames it answered `capo` `no`, `tuning` `cannot_tell`, and three spans, 0-6.5, 6.5-14.5 and 14.5-17 s (r0127). In each span the fretting hand, the one pressing the strings, is visible and its frets are `null`, meaning no value. R3a has no list of what was really played to count against.
- Time: ran on the provider `bytedance`. Round trip 166.0 s (r0127). It read 23,707 tokens and wrote 11,146, and 10,715 of those were its reasoning before the answer. The call cost 0.0397185 USD.
- Takes as a hint: only what's written in the prompt.
- Hands off to: not tried. The answer is a JSON string inside the chat reply.

**Demucs `mdx_extra_q`, on the Hugging Face Space `nakas/demucs_playground`** ([Space](https://huggingface.co/spaces/nakas/demucs_playground), [Demucs](https://github.com/adefossez/demucs)). A stem splitter. A stem is one instrument's track pulled out of a mix. The Space's `app.py` runs `python3 -m demucs.separate -n mdx_extra_q -d cpu test.wav -o out`, at Space commit `d924a6d3`. It makes four stems and has no guitar stem.

- In: S4 as a stereo WAV, `S4.wav`.
- Command or settings: endpoint `/predict`. With `gradio_client` 2.7.2 the call stopped at `ValueError('Unknown protocol: ws')` (r0119), because the Space runs version 3 of Gradio, the interface a program calls on these demo pages. With `gradio_client` 0.5.3 it went through (r0141, `scripts/hf_space_call_old.py`).
- Out: four WAV files, `vocals`, `bass`, `drums` and `other`, in the same format as the input and exactly as long. My agents measured each against S4's true tracks as SI-SDR, a figure in decibels (dB) for how much of a stem is the true instrument against everything else in it. A higher number means less of anything else. Drums 8.49 dB, bass 5.29 dB, and the lead line 6.37 dB, measured in `vocals`. There's no guitar stem, so the guitar was measured in `other`, at 2.94 dB (e0360). The verifier's re-run (r0322) came back with four files of the same size and length, each with different audio from the first run's. They measured 8.46, 5.31, 6.42 and 3.07 dB (e1331).
- Time: ran on the Space's `cpu-basic` hardware. Round trip 172.46 s, with processing from 4.26 to 167.45 s (r0141). The re-run took 155.50 s (r0322). Free.
- Takes as a hint: none.
- Hands off to: not tried. The Space returns four WAV file paths.

**ElevenLabs Speech to Text, model `scribe_v3`** ([API spec](https://api.elevenlabs.io/openapi.json)). ElevenLabs' transcription service, used here on sung words.

- In: R2, a 36-second excerpt of a real band song with singing, as `R2.wav`. It's "I Want to Destroy Something Beautiful" by Josh Woodward, shared under CC BY 4.0, a license that allows reuse with credit.
- Command or settings: `scripts/elevenlabs_call.py stt /home/user/gtr/inputs/R2/R2.wav <out> --model scribe_v3`, which sends `POST https://api.elevenlabs.io/v1/speech-to-text` with `timestamps_granularity=word`, `tag_audio_events=true` and `diarize=false`. It sent no `seed` or `temperature`, the settings that steer how random the answer is.
- Out: JSON with the fields `language_code`, `language_probability`, `text`, `words` and `audio_duration_secs`. It gave the language as `eng` with a probability of 0.98 and the length as 36.0 seconds. Each word has a `text`, `start`, `end` and `logprob`. It wrote 32 words, `'Cause I've been trying to find out if an angel bends or breaks. Or shatters like a stone. I want to destroy something beautiful for you. I want to destroy for you.` The verifier sent the same request (r0318) and got `I wanna destroy` in both places where the first answer had `I want to destroy`. R2 has no checked copy of its lyrics, so nothing was counted.
- Time: ran on ElevenLabs' side. Round trip 0.92 s (r0108) and 1.24 s (r0318). 11 credits each time, and the first answer reported the same, `character-cost: 11`. ElevenLabs' API price page lists Scribe v3 at `$0.20` per hour. The dollar price of a credit wasn't verified.
- Takes as a hint: `language_code` and `keyterms`, plus `seed` and `temperature`. ElevenLabs' published API spec ends its note on `seed` with `Determinism is not guaranteed.` Nothing about music.
- Hands off to: not tried. Each word comes with its start and end in seconds.

**ElevenLabs Stem Separation, `six_stems_v1`** ([docs](https://elevenlabs.io/docs/api-reference/music/separate-stems)). ElevenLabs' stem splitter, six stems.

- In: S4 as `S4.wav`, a stereo WAV of 6,834,024 bytes. Also S6taps, the S2n notes on steel strings with drum sounds standing in for taps on the guitar body, and R2, each as a WAV.
- Command or settings: `scripts/elevenlabs_call.py stems /home/user/gtr/inputs/S4/S4.wav <out> --variation six_stems_v1 --format mp3_44100_192`, which sends `POST https://api.elevenlabs.io/v1/music/stem-separation`.
- Out: a ZIP of six stereo MP3 files, `drums.mp3`, `vocals.mp3`, `piano.mp3`, `guitar.mp3`, `bass.mp3` and `other.mp3`. Decoded with ffmpeg 6.1.1, every stem starts 25.06 ms after the input, so my agents cut that off before measuring. They measured SI-SDR against S4's true tracks. The guitar came to 13.70 dB, the drums 13.43 dB, the bass 15.16 dB, and the lead line, measured in `other.mp3`, 15.76 dB (e0057). On S6taps the guitar came to 26.77 dB, and the taps, measured in `drums.mp3`, 13.23 dB (e0391). R2 comes with the artist's own instrumental. `vocals.mp3` measured 15.44 dB against the song minus that instrumental, and the other five stems added together measured 13.59 dB against the instrumental itself (e0426). The verifier's re-run on S4 (r0315) returned the same six MP3s, byte for byte.
- Time: ran on ElevenLabs' side. Round trip 6.98 s for S4 (r0064), 6.10 s for S6taps (r0189) and 6.78 s for R2 (r0194). The account's credit counter went up 1,065, 807 and 990 credits, 27.49 to 27.50 credits per second of audio. The price page lists no rate for stem separation, and the dollar price of a credit wasn't verified.
- Takes as a hint: `stem_variation_id` only, two stems or six. No instrument prompt, no time range.
- Hands off to: tried. The S4 `guitar.mp3`, unchanged, went to the YourMT3 CPU Space, `mimbres/YourMT3-cpu` (r0231), which returned 516 notes. 334 of the 369 notes of the strummed guitar part were among them, a median 23.4 ms after the played notes (e0522). Shifted by the stems' 25.057 ms offset, the median was 1.7 ms before them (e0525). Klangio, which sells music transcription apps, takes an uploaded audio file for its guitar transcription, according to its docs. They don't list the audio formats it accepts (not tried).

**MiMo V2.6 Flash, `xiaomi/mimo-v2.6-flash`, through the Vercel AI Gateway** ([gateway](https://vercel.com/docs/ai-gateway)). A Xiaomi model that the gateway's catalog lists with input `text, audio, image, video`. The free tier allowed it. It answers in text, so my agents asked for JSON here too.

- In: the audio clips as mono WAV files. S3, 24 seconds of strummed chords I synthesized, plus S4 and R1c, for chords, tempo and key. S2n for notes. S5capo2, the S2n piece with a capo on fret 2, and S2n for a capo. For tuning, S5dropd, the S2n piece in Drop D, where the lowest string is tuned down to D. Also S7flat30, the S3 chords tuned 30 cents flat, and S2n again. And 18 JPEG frames each, one per second, of R3a, R3b and R3c, three 18-second real guitar videos.
- Command or settings: a Chat Completions request to `https://ai-gateway.vercel.sh/v1`, as for Seed. The audio went in as a `file` part, written out as text in a base64 data URL, with a prompt and a JSON schema in `response_format`. Reasoning stayed at its default settings, and `max_tokens` was 24576, or 16384 for frames. The scripts are `scripts/gateway_trial.py` and `scripts/gateway_frames_trial.py`, and the prompts are in `scripts/prompts/`.
- Out: a chat reply whose `choices[0].message.content` holds the JSON answer.
  - Chords of S3 (r0028): `G Em C D` twice from 0.00 to 19.38 s, then `G` to the end. 99 BPM (beats per minute), G major. The clip has no chord for its first 2.5 s, then `G Em Am7 D7 G Em C D7 G`, at 96 BPM in G major. The answer's chord had the same root as the played chord for 4.6 of the 24 seconds (e0018). A chord's root is the note it's named after. The verifier sent the exact same request again (r0302) and got no chord to 2.5 s, then `G Em Am7 D7 G Em C D7` in 2.3 s steps and `G` from 20.9 s, at 120 BPM in G major. That's the same root for 18.75 of the 24 seconds (e1189).
  - Chords of S4 (r0052): no chord to 4.00 s, then 2-second chords `D A Bm G D A G A Bm G D A G A D A G A`, and a last `D` from 40.00 to 44.50 s in a 38.741 s file. 120 BPM against the clip's 116, and D major, the clip's key. The same root for 22.8 of the 38.7 seconds (e0058).
  - Chords of R1c (r0248): `G D C G C G D C G`, the first and last 3.5 s long and the seven between 3 s each. 84 BPM against the annotated 119, and G major, the annotated key. The same root for 13.4 of the 28.2 seconds (e0696).
  - Notes of S2n (r0076): 29 notes, all between 0.02 and 8.42 s. One of the 90 played notes was among them (e0067). The first played note is at 2.143 s.
  - Capo, the same S5capo2 request three times: fret 2 (r0080), no capo (r0196) and fret 2 (r0203), with the key as A major, A major and B major. The clip has a capo on fret 2 and is in A major. On S2n, which has no capo, it answered no capo and G major (r0182), as in the clip.
  - Tuning: my agents asked for the six open strings as MIDI note numbers, lowest string first. For S5dropd it answered standard tuning, `[40,45,50,55,59,64]`, at -15 cents. The clip is Drop D, `[38,45,50,55,59,64]`, at 0 cents (r0210). For S7flat30 it answered standard at -10 cents, and the clip is standard at -30 cents (r0212). For S2n it answered standard at 0 cents, as in the clip (r0213). All three answers said no capo, as in the clips.
  - Frames, asking about a capo and the frets under the fretting hand. For R3a (r0107) it answered no capo, tuning `cannot_tell`, frets 2-8 from 0 to 6 s, 2-12 from 7 to 14 s and 3-6 from 15 to 17 s. For R3b (r0360), no capo, frets 7-10 at 0-3 s, 1-3 at 4-11 s, none given at 12 s, 7-10 at 13-16 s and 5-7 at 17 s. For R3c (r0391), no capo, frets 1-3 at 0-7 s, 5-8 at 7-10 s, 1-3 at 10-14 s, 5-8 at 14-17 s and 2-4 at 17 s. None of the three videos has a list of what was really played. The written description of my test clips says `No capo.` for R3b and R3c. It describes R3b at 9 s with `frets 2-4 under the fingers` and R3c at 10 s with `the hand is near the nut`. Two answers each broke the requested layout in one field. R3b gave `visible` as the string `"yes"`, and R3c put the tuning under `value`.
  - The MP4 of R3a was refused before running, HTTP 400 `'file part media type video/mp4' functionality not supported.` (r0077), and so was the gateway's other endpoint, Responses, with an `input_video` part (r0098). Both calls were tried on `xiaomi` and then on the six other providers the gateway lists for the model, and all seven refused the file.
- Time: ran on the provider `xiaomi`. Round trips from 12.9 s (r0080) to 163.6 s (r0107). From 0.00009576 USD (r0080) to 0.00754432 USD (r0360) a call. The catalog price is 0.00000014 USD per input token and 0.00000028 USD per output token.
- Takes as a hint: only what's written in the prompt, plus `reasoning.effort` and the provider choice, `providerOptions.gateway.only` or `order`.
- Hands off to: not tried.

**Muse Spark Open, `meta/muse-spark-open`, through the Vercel AI Gateway** ([gateway](https://vercel.com/docs/ai-gateway)). A Meta model. The gateway's catalog lists it with input `text, audio, image, video`. Five providers run it, baseten, fireworks, modal, nebius and togetherai. The free tier allowed it.

- In: S3 and S4 for chords, S2n for notes and S5capo2 for a capo, as WAV. R3a as the MP4, then as the 18 frames.
- Command or settings: the same prompts, schemas and settings as MiMo. Some calls named one provider with `providerOptions.gateway.only`.
- Out:
  - Chords of S3 through baseten (r0024): one entry, `N` (no chord) from 0.0 to 0.0 s, 107 BPM, D minor. Its reasoning text begins `We have audio recording but we cannot hear it? The message shows musical notes characters but no actual audio file provided.` The same root as the played chord for 2.5 of the 24 seconds, the silent start (e0064).
  - The same through fireworks (r0034): HTTP 400, `Extra inputs are not permitted, field: 'messages[0].content.list[...][0].input_audio'`.
  - The same through togetherai (r0036): no chord to 2.10 s, then `Eb Bb Cm Ab` over and over up to 37.15 s in a 24.0 s file, 110 BPM, Eb major. The same root for 2.1 of the 24 seconds (e0061).
  - Chords of S4 through togetherai (r0041): every field was the string `TOO_MANY_TOKENS`.
  - Notes of S2n through togetherai (r0082): `{"recording_secs": 0, "notes": []}`, no notes (e0068).
  - Capo of S5capo2 through togetherai (r0084): no capo and C minor. The clip has a capo on fret 2 and is in A major.
  - R3a as MP4 was refused by all five providers with the same HTTP 400 as MiMo (r0083, and the verifier's r0303 and r0304). From the frames through fireworks (r0129): no capo, tuning `cannot_tell`, frets `null` in all three spans, with a note on 7-15 s, `approx. 2nd-7th fret region`.
- Time: ran on the providers' side. Round trips from 1.76 s (r0084) to 9.84 s (r0129) for the calls that answered. From 0.00080705 USD (r0082) to 0.01514875 USD (r0129) a call. The catalog price is 0.00000125 USD per input token and 0.00000425 USD per output token.
- Takes as a hint: only what's written in the prompt, plus the provider choice.
- Hands off to: not tried.

**xAI Speech to Text, model `grok-voice-transcribe-2.0`** ([docs](https://docs.x.ai/developers/model-capabilities/audio/speech-to-text)). xAI's transcription service.

- In: R2 as `R2.wav`.
- Command or settings: `scripts/xai_stt.py /home/user/gtr/inputs/R2/R2.wav <out> en`, which sends `POST https://api.x.ai/v1/stt` with `language=en`.
- Out: JSON with `text`, `duration` (36.0) and 30 `words`, each with `start` and `end`. The text reads `Cause I've been trying to find out if an angel bends or breaks. All shadows like a stone. I wanna destroy something beautiful for you. I wanna destroy for you.` The verifier's re-run (r0306) returned identical JSON. Against ElevenLabs' first transcript it differs in the second line, `All shadows like a stone.` against `Or shatters like a stone.`, in `wanna` against `want to` twice, and in the apostrophe of `'Cause`. There's no checked copy of the lyrics, so nothing was counted.
- Time: ran on xAI's side. Round trip 5.75 s (r0105) and 1.11 s (r0306). At the published `$0.10 / hr (REST)`, the 36 seconds come to 0.001 USD a call.
- Takes as a hint: `language`, `format`, `diarize`, `keyterm`, `filler_words`, `vad_threshold` and `multichannel`. Nothing about music.
- Hands off to: not tried. Each word comes with its start and end in seconds.

**YourMT3, on the Hugging Face Spaces `mimbres/YourMT3` and `mimbres/YourMT3-cpu`** ([Space](https://huggingface.co/spaces/mimbres/YourMT3), [CPU Space](https://huggingface.co/spaces/mimbres/YourMT3-cpu)). A model that writes down the notes it hears, one track per instrument. Both Spaces' `app.py` load `model_name = 'YPTF.MoE+Multi (noPS)'`, at commits `5e66c1ea` (GPU) and `bd69fbac` (CPU).

- In: S2n as `S2n.mono.wav` and R1c as `R1c.mono.wav`, both mono WAV files. The ElevenLabs guitar stem of S4 as MP3.
- Command or settings: endpoint `/process_audio`, called with `gradio_client` 2.7.2 and no access token (`scripts/hf_space_call.py`). The audio file is the only input.
- Out: an HTML string with a MIDI player. The MIDI sits inside the HTML as a `data:audio/midi;base64,` URL that a program has to cut out. It's a multi-track MIDI file, format 1, that splits each quarter note into 480 steps. It starts with an empty track, then has one track per instrument it predicted. No tempo is written in it, and every note has the same loudness, velocity 100.
  - S2n on the CPU Space (r0164): 126 notes in three tracks, `Acoustic Piano` 15, `Electric Piano` 58 and `Guitar (clean)` 53. 79 of the 90 played notes were among them, a median 3.3 ms after the played notes. That's all 42 melody notes and 37 of the 48 bass notes (e0277). The GPU Space (r0112) returned the same number of notes per track, again with 79 of the 90 (e0110). The `Guitar (clean)` track alone had 53 notes, and 52 of the played notes were among them (e0111).
  - R1c on the CPU Space (r0245): 129 notes in one `Guitar (clean)` track. 119 of the 148 annotated notes were among them, a median 5.2 ms before them (e0690).
  - The ElevenLabs guitar stem of S4 on the CPU Space (r0231): 516 notes, with 334 of the 369 guitar notes among them, as in the ElevenLabs entry.
- Time: ran on the Spaces' hardware. On the CPU Space, `cpu-basic`, it took 31.18 s for S2n (r0164), 31.34 s for R1c (r0245) and 66.90 s for the 38.79 s stem (r0231). On the GPU Space it took 5.32 s for S2n (r0112). That Space runs on `zero-a10g`, Hugging Face's shared graphics cards, called ZeroGPU. The verifier's re-run on the CPU Space (r0305) returned the same MIDI file, byte for byte. Its re-run on the GPU Space (r0311) was refused with `You have exceeded your ZeroGPU quota (90s requested vs. 79s left). Try again in 15:33:27.` Free.
- Takes as a hint: none.
- Hands off to: tried as the receiver of the ElevenLabs guitar stem. Cut out of the HTML, its MIDI is a `.mid` file. Flat, an online music notation editor, lists `.mid` among the files it imports, according to its docs (not tried).

**yt-dlp 2026.10.26** ([repository](https://github.com/yt-dlp/yt-dlp)). A command-line downloader for audio and video from links. It's the one entry in this list that ran on the box itself.

- In: the archive.org page of the concert video R3a was cut from (CC BY-SA 4.0). YouTube wasn't contacted.
- Command or settings: `yt-dlp -F` on the page listed three formats, then `yt-dlp -f 0 --download-sections '*400-418' -x --audio-format wav -o 'R3a_ytdlp_400-418.%(ext)s' https://archive.org/details/scm-422828-crescendo313-drh-meredithconn`.
- Out: `R3a_ytdlp_400-418.wav`, a mono WAV of 18.013 s and 1,729,374 bytes. It downloaded only the 18-second section and printed `WARNING: "asr" field is not numeric - forcing int conversion, there is an error in extractor`. The verifier's re-run (r0323) wrote the same WAV, byte for byte.
- Time: 10.9 s from start to finish, with the processor busy for 1.05 s of it, and a peak of 64.5 MB of memory (r0126). Timed runs here were pinned to 2 of the box's 4 cores, and this one ran without that, so it isn't a 2-core figure. The re-run took 18.03 s (r0323). Free.
- Takes as a hint: none. It takes a time range (`--download-sections`) and a format (`-f`).
- Hands off to: not tried. Klangio, which sells music transcription apps, and the stem splitters LALAL.AI and MVSEP take an uploaded audio file, according to their docs.

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

"Steps for me" means my agents wrote me instructions to run it myself. They're in `for-aaron.md` in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/hosted-apis). My agents' list for this step runs from paid services and free demo pages to models, datasets and code libraries. Eighteen services on it needed an account or an access key I didn't have.

- **Alibaba Cloud Model Studio, Qwen-Omni.** No Alibaba Cloud key in my key store, and the gateway's free tier refused the Qwen model asked for, `alibaba/qwen3.8-27b` (r0023). Steps for me: test T54 in my list of 120 tests.
- **Amazon Nova.** No key for AWS, Amazon's cloud, in my key store. On the two Nova guides my agents read, no model takes general audio and returns text. Nova 2 Lite takes video. Amazon's service terms also name an `Amazon Nova 2 Omni`, and no page about it was read. Steps for me: none.
- **Anthropic Claude Messages API.** Its API reference documents no audio or video input, so it wasn't tried. Steps for me: none.
- **AudioShake Tasks API.** Needs a key from a developer account (sign-up gives `10 free credits`), and I have none. Steps for me: yes.
- **Basic Pitch, as a hosted demo.** No Space with a Gradio API, the interface a program calls, turned up for it. The search found only two static pages and two Docker apps, Spaces of other kinds, and `Richhiey/basic_pitch_fastapi` was `SLEEPING`. Steps for me: none.
- **Beatstorapon API.** Not researched. Steps for me: none.
- **Cesure MCP server.** Cesure is a tab editor, and its MCP server is the address an AI assistant such as Claude connects to so it can use Cesure's tools. With no account, my agents asked it to start a session and list its tools, and it listed 14 (r0622, and the verifier's r0655 got the same answers). Nine of them declare that they work without an account. No tool was called, so no tab was made, and whether one works without an account wasn't tested. It takes no audio. Its page says `No audio. Turning a recording into a tab happens in the app, from a sound.` A tab sent to it can carry a tuning and a capo, and its `refinger` tool has a setting that `lets it choose a capo`. Steps for me: none.
- **Chordify.** No developer API found, and its pages answered HTTP 403 to the box. Steps for me: none.
- **ChordMini.** Its docs page answered HTTP 402, so its hosted API couldn't be read. Steps for me: none.
- **Cyanite API.** Not read as its own API. Music.AI offers it inside its platform. Steps for me: none.
- **Datasets: MAESTRO, MUSDB18-HQ and the Harmonix Set.** Listed for what models were trained on, not something to run.
- **DeepSeek API.** Its two models take text, or text and images, and no audio or video, so it wasn't tried. Steps for me: none.
- **Fadr API.** `Usage of the Fadr API requires a Fadr Plus subscription`, and I have no key. Steps for me: yes.
- **fal.ai `fal-ai/demucs`.** Needs a key, and the audio at a web address (`audio_url`). Steps for me: yes.
- **Flat.io API.** Needs a personal access token or an OAuth2 sign-in, and I have no Flat account. Steps for me: yes.
- **GetSongBPM API.** Answered HTTP 403 to the box. Not researched. Steps for me: none.
- **Google Gemini API.** The key lists models and counts tokens for free, but every request for an answer came back HTTP 402 Payment Required (r0013, r0014, and the verifier's r0300). Through the Vercel AI Gateway, the free tier refused every Google model with HTTP 403 (r0022, r0023). Steps for me: yes, for both routes.
- **Hooktheory API (Trends).** Needs a hooktheory.com account. Steps for me: yes.
- **Hugging Face Inference Providers.** Answered HTTP 401 without an access token, and I have no Hugging Face access token. Steps for me: none.
- **Hugging Face Space `akhaliq/demucs`.** `RUNTIME_ERROR` when my agents looked. Steps for me: none.
- **Hugging Face Space `Hmjz100/MT3`, named after MT3, a multi-instrument music transcription project.** Its code wasn't read. `RUNTIME_ERROR`, `Exit code: 1` with a Python error. Steps for me: none.
- **Hugging Face Space `hugging-apps/muscriptor-music-transcription`.** Refused twice (r0116, r0309) with `You have exceeded your ZeroGPU runs limit. Authenticate with a Hugging Face token for more quota`. Steps for me: yes.
- **Hugging Face Space `lpeterl/sam-audio-webui`, SAM Audio.** The same refusal (r0162). Steps for me: yes.
- **Hugging Face Space `taejunkim/all-in-one`, a demo of All-In-One.** `RUNTIME_ERROR`. Steps for me: none.
- **Hugging Face Space `teamup-tech/Transkun`.** Running on a shared GPU, but not called after the GPU refusals above. Steps for me: yes.
- **Hugging Face Spaces, eight more found by search:** `ahk-d/Spleeter-HT-Demucs-Stem-Separation-2025`, `owiedotch/demucs-stem-separation`, `kajise/Demucs_v4-FT_4s`, `Thafx/Demucs_v4_2s_HT`, `Kevin676/Demucs_v4`, `sparanoid/demucs-gpu`, `akhaliq/sam-audio-large` and `njolnir/Dia-Beat-This`. All `RUNTIME_ERROR` except the last, `BUILD_ERROR`, when the verifier read them. Steps for me: none.
- **Klangio API.** Needs a key from an account, and the free tier is `Max 15s audio duration`, so my agents cut 15-second excerpts for it. That cut wasn't in the run log at first. Done again through the log later (r0599), it made the same files, byte for byte. Steps for me: yes.
- **LALAL.AI API.** Needs a key from a paid license. Steps for me: yes.
- **Mistral audio (Voxtral).** Its audio docs describe speech to text and text to speech, and don't describe music understanding. Not tried. Steps for me: none.
- **Moises, the consumer app.** No developer API for the app was read. Music.AI is its API platform. Steps for me: none.
- **Mureka Music Transcription on fal.ai.** A transcription service from Mureka, sold through fal.ai. Its page says it returns a ZIP that `can include MusicXML, PDF sheet music, and timestamped lyrics`, and what the ZIP holds wasn't seen. MusicXML is a sheet-music file format. It needs a fal key, and I have none. Its request has no field for an instrument, tuning, capo, key or tempo. Steps for me: yes, two calls on S4 and R2 at `$0.20` a song.
- **Music.AI API.** Its docs say `The API key should be included in the Authorization header of each request.`, and I have no music.ai account. Steps for me: yes.
- **MusicGPT API, `audio_to_midi`.** Needs an API key, and I have none. Steps for me: test T50 in my list of 120 tests.
- **MVSEP API.** Needs an `api_token` from an mvsep.com account. Only its public list of 126 algorithms was read. Steps for me: yes.
- **OpenAI audio in Chat Completions, `gpt-audio-1.5`.** No OpenAI key in my key store. Steps for me: test T53 in my list of 120 tests.
- **PianoConvert API.** Its help page answered HTTP 404. Steps for me: none.
- **Replicate, with `ryan5453/demucs`, `sakemin/all-in-one-music-structure-analyzer` and `triadmusic/chord-detection-cnn-lstm`.** Every request needs an API token, and I have none. Steps for me: yes.
- **Roboflow hosted inference.** Page not read. Steps for me: none.
- **Songscription.** No developer API page found. Steps for me: none.
- **Songsterr.** No documented developer API, and its `robots.txt`, the file where a site tells automated programs what not to fetch, has `Disallow: /api/`. Not called. Steps for me: none.
- **Soundslice data API.** API keys only come with its paid Teacher or Licensing plans. Steps for me: yes.
- **Soundverse enterprise API.** Pages not read. Steps for me: none.
- **Spotify Web API, Audio Features and Audio Analysis.** Closed to new apps since November 27, 2024, per Spotify's developer blog. Steps for me: none.
- **StemSplit API.** Needs an API key, and I have none. Steps for me: test T48 in my list of 120 tests.
- **Tencent Smart Music, Vocal To Midi.** The page answered but wasn't read. Steps for me: none.
- **The vendors' Python clients**, `musicai-sdk`, `audioshake`, `replicate`, `fal-client` and `soundsliceapi`. Not installed, for lack of keys. The ElevenLabs calls went straight to its web API, not through the `elevenlabs` package.
- **Vercel AI Gateway, the rest of its catalog.** The free tier refused `xiaomi/mimo-v2.6-pro`, `moonshotai/kimi-k3` and the Google and Qwen models with HTTP 403 (r0022, r0023). Steps for me: yes.
- **WaveSpeedAI.** Not researched. Steps for me: none.
- **xAI language models.** All eight take text and images only, so the chord, note, capo and video questions weren't sent. Steps for me: none.
- **YouTube.** Not contacted. The yt-dlp run used an archive.org page. Steps for me: none.

</details>

<details><summary>Licenses of the tools that ran</summary>

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| `Beat This!` Space | Not read in this lane | Not read | Not read |
| `bytedance/seed-2.1-turbo` | Hosted model, reached through Vercel's gateway, whose page for it says `Your use is subject to ByteDance's Terms & Privacy Policies.` and links BytePlus's terms. Section 4 of BytePlus's [Terms of Service](https://docs.byteplus.com/en/docs/legal/docs-terms-of-service), `Last Updated: August 23, 2022`, says `Unless otherwise agreed, you hereby grant to BytePlus and its affiliates a non-exclusive, worldwide, royalty-free, perpetual, irrevocable, sub-licensable, and transferable right and license without any license fee to access and use any data collected from you, or stored or uploaded by you, during your access to or use of the Services, for any purposes relating to our operation and provision of the Services.` Its [General Terms for AI Services](https://docs.byteplus.com/en/docs/legal/AI-Services-terms), `Last updated: August 28, 2026`, say `As between you and BytePlus, you retain your rights in Input. To the extent permitted by applicable law, as between you and BytePlus, you own the Output generated in response to your Input, and BytePlus does not claim ownership of such Output.` and `Except for feedback that you voluntarily provide for service improvement, or where you otherwise separately consent or agree in writing, BytePlus will not use your Customer Data to train the foundation models underlying the AI Services.` Vercel's gateway terms are in the gateway's row below | No weights were looked for, and the gateway doesn't tag it `open-weights` | Not read |
| Demucs `mdx_extra_q` Space | MIT, per the Demucs [`README.md`](https://raw.githubusercontent.com/adefossez/demucs/main/README.md): `Demucs code is released under the MIT license as found in the LICENSE file.` The Space's own license wasn't read | Unclear, per the same `README.md`: `The license of the weights is not clear: MusDB contains some data that were only usable for research purpose.` | The `README.md` on `mdx_extra`: `trained with extra training data (**including MusDB test set**)`. [MUSDB18-HQ](https://zenodo.org/records/3338373): `MUSDBHQ: is provided for educational purposes only and the material contained in them should not be used for any commercial purpose without the express permission of the copyright holders` |
| ElevenLabs Speech to Text and Stem Separation | Hosted service under the [Terms of Service](https://elevenlabs.io/terms-of-use), `Last Updated: 09 October 2026`, which say `Except as expressly set forth herein, as between you and ElevenLabs, you retain all rights in and to your Output.` Their section 4(d) says `You hereby grant to ElevenLabs a license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, publicly or otherwise perform and display, and use your Content to provide the Services (including the trust and safety features therein), to improve the Services, and to develop new services and products.`, a license they list as `perpetual and irrevocable`, `royalty-free and fully paid` and `sub-licensable, through multiple tiers`. Section 4(i) says `you may opt out of our use of your Content for training at any time by navigating to the 'Data use' menu in the 'Terms and Privacy' section of your ElevenLabs account.` | Not read | Not read |
| `gradio_client` 2.7.2 and 0.5.3, the Python library every Space call went through | `Apache-2.0`, the license PyPI, the Python package index, lists for 2.7.2. For 0.5.3 PyPI lists only the label `License :: OSI Approved :: Apache Software License`. Gradio's [guide to it](https://www.gradio.app/guides/getting-started-with-the-python-client) says `While you can use any public Space as an API, you may get rate limited by Hugging Face if you make too many requests.` | No model | No model |
| MiMo V2.6 Flash | Hosted model, reached through Vercel's gateway, whose page for it says `Your use is subject to Xiaomi's Terms & Privacy Policies.` Xiaomi's [MiMo Service Agreement](https://platform.xiaomimimo.com/#/docs/terms/user-agreement) says `Our Service Agreement was updated on July 7, 2026.` Its section 4.1 says `The data you upload, store, process, download, distribute, or otherwise handle through our services constitutes your business data, over which you retain full control.` My agents found no clause about training models on customer inputs in its English text. Vercel's gateway terms are in the gateway's row below | `license: mit` in the header of the model cards of two Hugging Face repositories, `XiaomiMiMo/MiMo-V2.6-Flash-RL` and `XiaomiMiMo/MiMo-V2.6-Flash-MOPD`, and neither repository holds a license file. Which of the two the `xiaomi` provider serves isn't stated on the pages my agents read | Not read |
| Muse Spark Open | Hosted model, reached through Vercel's gateway, whose page for it says `Your use is subject to Meta's Terms & Privacy Policies.` and links Meta's [Model API Terms](https://dev.meta.ai/legal/terms-of-service). Their Exhibit C covers access through a Hosted Platform, `a third-party cloud platform authorized by Meta to host and provide access to the Meta Materials`, and says `Meta does not receive or process your Content, including Inputs or Outputs, in connection with your access to the Meta Materials through a Hosted Platform.` Whether the gateway's routes count as one isn't stated on the pages my agents read. Vercel's gateway terms are in the gateway's row below | The Muse Model License, the text Hugging Face shows before anyone downloads the model, says `Meta claims no ownership of outputs generated by the Software.` Its section 2 says `Licensee shall prominently display "Built with Muse Spark Open" in the user interface of each product or service that uses the Software or any Derivatives, or in the accompanying documentation, website, or settings menu.` | Not read |
| Vercel AI Gateway, the route to MiMo, Muse Spark Open and Seed | Hosted router. Its docs say `AI Gateway is available on all plans. Your use of each AI provider is subject to their terms listed on each model's page`. Vercel's [AI Product Terms](https://vercel.com/legal/ai-product-terms.md), `Last Updated March 17, 2026`, define Customer Content as `Input(s) and Output(s)` and say `As between you and Vercel, and to the extent permitted by applicable law, you own Customer Content and Vercel assigns to you Vercel's rights, if any, in the Output.` and `If you use the AI Products and Services under a Hobby or Pro plan, your Customer Content forms part of Your Content, as defined in Section 3 of the Terms of Service and is subject to the license granted to Vercel under Section 3.` That section 3, in Vercel's [Terms of Service](https://vercel.com/legal/terms.md), `Last Updated October 19, 2026`, has a sentence that starts `In addition, if you are on a Hobby plan or trial Pro plan, you agree that we may use Your Content to train our artificial intelligence`, gives the short form AI in parentheses, and goes on `and machine learning models, and we may share Your Content with third parties for the purpose of developing and improving their products, including training and improving their AI and machine learning models`. Section 4 says `You shall only use the Services under a Hobby plan for your personal or non-commercial use.` Which Vercel plan my gateway key's account is on wasn't checked. The refusals my agents got say `Free tier users do not have access to this model.` My agents' scripts sent neither `disallowPromptTraining` nor `zeroDataRetention`, two data settings a gateway request can carry | No model | No model |
| xAI Speech to Text | Hosted service, called directly, not through Vercel's gateway. xAI's docs send readers to its legal page `for our Enterprise Terms of Service and Data Processing Addendum`, but those pages answered HTTP 403 to the box, so none of their clauses was read. My agents wrote me steps to save them. The [docs](https://docs.x.ai/developers/faq/security.md), which aren't the contract and call the company SpaceXSI, say `SpaceXSI never trains on your API inputs or outputs without your explicit permission.` and `By default, all API requests and responses are stored on our servers (encrypted at rest) for 30 days for auditing purposes in the event of suspected abuse or misuse.` | Not read | Not read |
| YourMT3 Spaces | Not read in this lane | Not read | Not read |
| yt-dlp 2026.10.26 | Unlicense, per its [`LICENSE`](https://raw.githubusercontent.com/yt-dlp/yt-dlp/master/LICENSE): `This is free and unencumbered software released into the public domain.` Its [`README.md`](https://raw.githubusercontent.com/yt-dlp/yt-dlp/master/README.md) adds that `the PyInstaller-bundled executables include GPLv3+ licensed code, and as such the combined work is licensed under GPLv3+.` It also says `The git repository, the PyPI source distribution and the PyPI built distribution (wheel) only contain code licensed under the Unlicense.` The wheel is the package my agents installed | No model | No model |

Every clause above, and the terms of the services that didn't run, is quoted with its source in `survey.md` or `tools.json` in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/hosted-apis).

</details>

## Apps that already do some of this

Before building anything, my agents looked for apps whose makers say they do pieces of the job, like turning a recording into tab, guitar music written as fret numbers. They listed 60 apps and related projects, and none ran to a result here, though six ran in other sections. One web app, AnthemScore Web, took my test clip and stopped at a rights box, so 0 transcriptions came out.

<ao-compare cols="1" aspect="8/5">
<figure><img src="/media/guitar-tab-tools/apps-survey-anthemscore-web-settings.webp" alt="AnthemScore Web's settings form for the clip titled S2S. It reads Transcribing up to 30 seconds, shows a blue waveform under Trim with Start 0:00.0 and End 0:29.3, a sheet music or tablature switch set to tablature, Instruments: Guitar, Advanced Options, an unticked box reading I confirm that I own or have obtained all necessary rights to transcribe this audio, a browser warning reading Please check this box if you want to proceed, and a Transcribe button."><figcaption><b>Where the run stopped</b><span class="ao-meta">AnthemScore Web's settings page after S2s was uploaded, run r0062, with the rights box unticked</span></figcaption></figure>
</ao-compare>

<details><summary>Every tool that ran, what went in and what came out</summary>

No tool in this group made a transcription, and my agents' list counts none of them as tried. One web app, driven from the cloud box, took a clip, reached its settings page and stopped there.

**AnthemScore Web, free plan as served on 2026-11-10** ([link](https://www.lunaverus.com/transcribe/audio-to-guitar-tab)). Lunaverus's browser version of its AnthemScore program. Its page offers `Tablature you can read and play along with in your browser`.

- In: S2s, a steel-string fingerstyle clip I synthesized so every note is known, as `S2s.wav` (5,178,644 bytes, 29.357 s, 44,100 Hz, 2 channels). A script chose it on the site's audio-to-guitar-tab page. The script drove headless Chromium, a browser with no window, through Playwright 1.63.0, a tool for scripting browsers. No account, no sign-in.
- Command or settings: the script opened the page, chose the file and pressed the first submit button it found 3 s later. It changed nothing on the form, so the page's defaults stood. Those were `tablature`, `guitar` ticked, `timeSignature` and `keySignature` on `auto`, `smallestNote` at `32` and the trim from `0:00.0` to `0:29.3`. `trimEmpty`, labelled `Trim empty measures at the start and end`, was ticked too.

  ```text
  node /home/user/blog/docs/guitar-tab-research/lanes/apps-survey/scripts/anthemscore_web_explore.cjs /home/user/gtr/inputs/S2s/S2s.wav /home/user/gtr/lanes/apps-survey/out/anthemscore-web/explore_S2s_b
  ```

- Out: a settings page, and no tab, notes or file. Choosing the file started the upload by itself. The agent that checked this trial re-ran it as r0226 with every click removed. Here are four of the responses its log recorded, with times in seconds since the script started. That agent took out the job code the site gave the upload and anything after a `?` in each address.

  ```text
  RESP 2.44 200 GET lunaverus.com/transcribe/getJobCode
  RESP 3.63 200 PUT sfo2.digitaloceanspaces.com/lunaverus/user_data/<job code>/input
  RESP 4.10 200 POST lunaverus.com/transcribe/uploaded/<job code>
  RESP 4.47 200 GET lunaverus.com/transcribe/jobSettings/<job code>
  ```

  The `PUT` line is the upload of the file to Lunaverus's storage. The settings page showed `Transcribing up to 30 seconds`, a title box filled with `S2S` and a trim bar reading `Whole song, 0:29`. Under those were a `sheet music` and `tablature` switch set to tablature, `Instruments: Guitar` and `Advanced Options`. Last came a required box, `I confirm that I own or have obtained all necessary rights to transcribe this audio.*`, the line `By continuing, you agree to our Terms of Service and Privacy Policy.` and a `Transcribe` button. The script's press landed on `Transcribe`, by accident, with the box unticked. The browser's own form check stopped it with `Please check this box if you want to proceed.` and no transcription started. The run's network log has no response from the form's target, `/transcribe/submitJobSettings/<job code>`.

  A second script that ticks the box and presses `Transcribe` never ran. Claude's permission system refused to start it with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Consent Given For The User].` Ticking that box states rights and accepts the Terms and Privacy Policy in my name, so my agents didn't do it any other way. This refusal and the ones in the next list, for AnthemScore's desktop program, Guitar Learning and Chordify's terms page, were events in the Claude session. A refused command never starts and leaves no log line, so the agents that checked the work couldn't confirm the refusals themselves, only what they left behind. No run of `anthemscore_web_run.cjs` is in my agents' run log, and there's no output folder for it. The AnthemScore program was unpacked with `unsquashfs` instead of being run. The Guitar Learning copy has no `node_modules` folder, where an install puts its packages. No line of the run log names Chordify. Steps for me to run AnthemScore Web myself are test 2 in `for-aaron.md`, my agents' list of tests for me, in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/apps-survey).
- Time: the whole browser script took 10.51 s from start to finish, run r0062. That's the script's time on the cloud box, not a transcription time. The box's 4 cores are split into two slots of 2 for timed runs. This run used `--nolock`, which takes no slot, so it wasn't held to 2 cores. The processor worked on it for 0.90 s, plus 0.26 s of operating-system work on its behalf. Peak memory was 128.5 MB. The re-run r0226, which clicks nothing, took 10.78 s. The first try, r0055, stopped after 0.04 s with `ReferenceError: require is not defined in ES module scope`, because the blog repo's `package.json` has `"type": "module"` and the script was named `.js`. Renamed `.cjs`, it ran as r0062. Plan: the free one, `Free $0 30 second transcriptions` on its [pricing page](https://www.lunaverus.com/transcribe/pricing).
- Takes as a hint: `timeSignature`, `keySignature`, `smallestNote`, `instruments` (29 checkboxes) and the trim start and end. `timeSignature` offers `auto`, `4/4`, `3/4`, `2/4` and `6/8`. `keySignature` offers `auto` or `-7` to `7`, the number of sharps or flats. `smallestNote`, labelled `Shortest allowed note`, offers `4`, `8`, `16`, `32` and `64`. The web form has no field for the tuning, the string or a capo (a clamp across the strings that raises every note), and no tempo field.
- Hands off to: nothing, since nothing came out. Its pricing page lists `PDF, MIDI, and musicXML download` for the paid Plus and Pro plans. MIDI is a list of notes with start times, and MusicXML is a sheet-music file. My agents' survey notes that Guitar Pro 8 and Tabtify import MusicXML or MIDI and that Soundslice imports MusicXML. That's from the makers' pages, not tested.

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

Everything else on the list, in alphabetical order. My agents looked for apps whose makers say they turn a recording or a video into tab, chords or stems. A stem is one instrument's track pulled out of a mix. The list has 60 entries, 46 of them filed as commercial apps and the rest open-source projects, libraries, datasets, a research paper, an AI-assistant connector and a file format. "Web service" means using it requires accepting its terms in my name, and usually stating that I hold the rights to the upload. Claude's permission system refused that step for AnthemScore Web, so no other web app's upload was tried. "Test N" is the matching section of `for-aaron.md`, my agents' list of tests for me. They estimate about 10 minutes for each, except test 8a, at about 3 minutes, and test 17c, at 2 minutes.

- **AAPA AutoTabs** (guitar video in, and its makers say it `Detects hand positions and finger placements on the fretboard`): web service. Its terms also say not to `Use automated tools to scrape or extract data`. Test 6.
- **alphaTab**: an open-source tab renderer that Tabtify's page references. Context only here. Version 1.9.0 ran in three other sections: showing a tab in the browser, metronome and sync, and tools handing off to each other. No test.
- **alphaTex**: alphaTab's plain-text notation format. Context only, not run. No test.
- **AnthemScore 6 desktop, 6.3.0** (the version its makers' history gives, not confirmed from the file): my agents downloaded its Linux AppImage, a one-file Linux program of 216,013,304 bytes. Claude's permission system refused to run it (the step was `AnthemScore-x86_64.AppImage --appimage-extract`) with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Code from External].` My agents then pulled its files out without running any of its code. No clip went in. Test 9.
- **audio2guitar**: web service. Its terms also say not to `Use automation, scripts, bots, or other tools to submit songs in bulk`. Test 5.
- **basic-pitch** (Spotify): Spotify's open-source audio-to-notes model, listed because RiffToTab's and Cesure's pages say they use it. Context only here. Basic Pitch 0.4.0 ran in the section on turning sound into notes (r0234). No test.
- **Capo** (SuperMegaUltraGroovy): Apple devices only, macOS and iOS. Test 18.
- **Cesure**: web service, with an account required for its AI transcription. Test 21.
- **Cesure MCP connector**: Cesure's page says an AI assistant connected through it, such as Claude, can write `Tab or standard notation, notes by fret or by pitch, in the open .cesure format.` The page also says `No audio. Turning a recording into a tab happens in the app, from a sound.` Not connected or tried by my apps agents. My services agents started a session with it and listed its 14 tools, without calling one (r0622). No test.
- **Chord ai**: phone app, iOS. Test 16.
- **ChordAR** (manbr21/Computer-Vision-Guitar-Tutor): its read-me file asks for printed ArUco markers (square printed codes) on the guitar's neck, and none of the shared clips is described with them. My trial agent read only that file and didn't install it. The agent that checked a later round found a copy of its code on the box, made on 2026-11-10, with nothing installed or built in it. No test in my apps agents' list. The list of 120 tests for me has one, T119.
- **Chordify**: its site answered the cloud box with an HTTP 403 refusal and a Cloudflare security-check page, whether my agents asked with `curl`, `WebFetch` or headless Chromium. On 2026-11-11 its terms page answered `curl` and `WebFetch` with HTTP 403 again. Claude's permission system then refused to open that page in headless Chromium, with `Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Bot Check Circumvention].` A later `curl` check of the page, by the agent that checked that round, was refused the same way. So its terms weren't read. Tests 8 and 8a. Test 8a has me save its terms and privacy pages from my own browser.
- **ChordSheetJS**: a JavaScript library that reads ChordPro, a text format for chord sheets. Context only here. Version 18.0.0 ran in the section on showing a tab in the browser (r0251). No test.
- **ChordU**: web service. Its terms, read on 2026-11-11, say `You shall not collect content or information or access ChordU service using automated means (such as bots, robots, spiders or scrapers) without our permission.` My agents fetched no more of its pages after reading that, so its prices weren't read. Test 8b, optional.
- **Fender Play**: not read, so whether it transcribes a given recording wasn't checked. No test.
- **Fender Songs (with Apple Music)**: not read. No test.
- **Fender Studio Pro 8** (a desktop recording program): not read. No test.
- **Fender Studio: Jam & Record**: phone app, App Store listing read. Test 17b.
- **Fender Tune**: not read. No test.
- **FingerstylePal - Guitar Tab AI**: phone app. Its listing says `Upload any GuitarPro file and get instant guidance` and describes no audio input or transcription. No test.
- **Fretwise**: web service. Its pricing page lists `Guest access without an account` for the free plan. Test 23.
- **Gibson App**: not read. No test.
- **GrabTab**: announced, not released. Its site said `Coming soon to iOS & Android` on 2026-11-10. No test.
- **Guitar Learning** (DecoudJuan/Guitar-Learning, commit 692957d): an open-source browser app for tracking the fretting hand on a webcam and checking chord shapes. It makes no transcription and no tab. My agents copied its code from GitHub, but Claude's permission system refused its install step, `npm ci --ignore-scripts`, with `[Code from External]`. The live app needs a camera and four clicks on the fretboard. Test 19, optional, with my own guitar and webcam.
- **Guitar Pro 8**: a tab editor. Its makers' FAQ says `No, Guitar Pro 8 does not provide automatic audio-to-notation conversion`. No Linux build found. No test.
- **GuitarConvert** (La Touche Musicale): web service. Test 24.
- **GuitarSet**: a dataset of real acoustic guitar recordings with every note marked by string. Three of my test clips, R1a, R1b and R1c, real guitar recordings of 28 to 29 seconds, come from it. Not run. No test.
- **Klangio Guitar2Tabs**: web service. Its free demo needs no account and exports PDF only. Test 1.
- **Klangio sibling apps** (Piano2Notes, Sing2Notes, Drum2Notes, Violin2Notes, Wind2Notes, Scan2Notes, Melody Scanner): one line in my agents' survey, not run. No test.
- **Klangio Transcription Studio**: web service. Test 1, listed with Guitar2Tabs.
- **MediaPipe hand landmarker** (`@mediapipe/tasks-vision`): Google's MediaPipe hand model, which marks points on a hand in a camera picture, used by Guitar Learning and ChordAR. Context only here, since neither app ran. The same package, as MediaPipe Tasks Vision 1.2.2, ran in the section on metronome and sync (r0314, r0329). No test.
- **Melodyne 5**: desktop install, with a trial for macOS and Windows and no Linux build listed. Test 11.
- **MIDI Guitar 2 and 3** (Jam Origin): desktop install that takes live guitar audio, in real time. Test 15.
- **Moises**: web service. Its terms, section 14.6, bar use `through the use of any engine, software, tool, agent, device, or mechanism ... other than the software or search agents provided by Moises or Third-Party Agents connected through functionality expressly provided by Moises under Section 12.4 (AI Agent)`. Test 7.
- **MUSDB18-HQ**: a dataset, the one a version of Open-Unmix called `umxhq` was trained on. Context only. No test.
- **Note2Tabs**: web service. Test 20.
- **NoteHound**: phone app for transcribing by ear. No automatic note transcription described. No test.
- **Open-Unmix**: an open-source source-separation architecture (it pulls a mix apart into stems) that audio2guitar names as the basis of its guitar isolation. Context only here. Version 1.3.0 ran in the section on splitting a song into instruments (r0085). No test.
- **Positive Grid Spark app (Auto Chords)**: phone app, `*Requires Spark Amp*`. No test.
- **Practice Pro - AI Music Tools**: an iOS app my agents know only from a web search result, which lists an `AI Guitar Tab Generator ... synced with playback`. Its App Store page, id 6754810269, answered HTTP 404, not found, on 2026-11-10 and 2026-11-11. Apple's own lookup for App Store ids, `itunes.apple.com/lookup`, found nothing under that id in nine countries' stores on 2026-11-11. Whether it exists isn't confirmed. Test 17c.
- **Riffstation**: not read. No test.
- **RiffToTab**: web service, and its tab step is paid. Test 22.
- **RipX DAW**: desktop install. Its buy page lists `macOS 10.15+ (2012 & later models, including M1 onwards) / Windows 8/10/11 (64-bit)` and no Linux build. Test 12.
- **Rocksmith+** (Ubisoft): not read, so whether it transcribes a given recording wasn't checked. No test.
- **Samplab**: samplab.com redirects to apple.com, so there's nothing to run. No test.
- **ScoreCloud**: desktop install, `Download for PC & Mac`. Test 14.
- **Songscription**: web service. Test 4.
- **Songsterr AI**: web service, and full-length transcription comes with Songsterr Plus, its paid plan. Test 3.
- **Soundslice**: no automatic transcription found, and its acceptable use policy bars automated use. No test.
- **Tabbers**: a 2025 conference talk only. No product, app or code found. No test.
- **TabGenius**: phone app. Its listing says to `simply type or speak your idea` to get tab, so the input is a prompt, not a recording. No test.
- **Tabtify**: web service, and its AI conversion is paid (`AI conversion is not included` in the free plan). An optional paid test, no number.
- **TapToTab**: a research paper, number 2409.08618 on arXiv, a site for research papers. My agents found no code link for it. No test.
- **`Transcribe!` 9.70.4**: my agents downloaded its Linux build (4,365,589 bytes) and read its files and help. My trial agent didn't start it, because running a downloaded program from a vendor is the step that was refused for AnthemScore. The checking agent didn't try either. Its help says `Transcribe! does not output MIDI at all.` Its chord guesses can reach a file only by being copied into its on-screen text labels, which it calls text blocks, and exported from there. Test 10.
- **TuxGuitar**: a free tab editor whose plugin description says it opens `Guitar Pro 6 (GPX) and 7 (GP) files`. Context only here. Its file plugins, from version 1.5.6, ran in the section on showing a tab in the browser (r0221). No test.
- **Ultimate Guitar**: its `AI chords` feature takes a YouTube link, and the shared clips aren't on YouTube. Phone app. No test.
- **Yamaha Chord Tracker**: phone app. Test 17.
- **Yousician**: its makers describe `real-time feedback that listens as you play`, and transcribing a given recording isn't described. No test.
- **YouTube Guitar Tab Parser** (marcelpanse/youtube-guitar-tab-parser): its read-me file describes a `CLI that turns a YouTube guitar-lesson video into a PDF of the guitar tab.` A CLI is a program run by typing commands. Per the same file, it crops the tab already drawn in the video's frames, so it doesn't transcribe audio. No shared clip is such a video. The read-me also asks for `yt-dlp`, a video downloader, and an Anthropic API key, the key a program uses to call Claude. No test.

</details>

<details><summary>Licenses of the tools that ran</summary>

No tool ran to a result. The table has only AnthemScore Web, the web app my agents drove up to its settings page.

| Tool | Code | Model files | Trained on |
|---|---|---|---|
| AnthemScore Web | Lunaverus's [Terms of Service](https://www.lunaverus.com/tos), no separate code license named. Section 2 is quoted below the table. | None named on the pages read | The author's [2016 article](https://lunaverus.com/cnn): `To train the network, I created a dataset of 2.5 million training examples from 3,000 MIDI files spanning several different genres of music ... A MIDI-to-WAV utility created the actual audio data`. Whether AnthemScore 6's models use the same data isn't stated. |

Section 2 of the Terms:

```text
Permission is granted to temporarily download one copy of the materials (information or software) on Lunaverus LLC's web site. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials, except as allowed by the software license; use the materials for any public display (commercial or non-commercial); remove any copyright or other proprietary notations from the materials; or transfer the materials to another person or "mirror" the materials on any other server.
```

Ticking the rights box accepts the [Terms](https://www.lunaverus.com/tos) and the [Privacy Policy](https://www.lunaverus.com/privacy), which include these lines:

- Terms, section 3: `By using the Service, you represent and warrant that: You own the copyright in the User Content or have obtained all necessary licenses, permissions, and consents from the copyright owner to upload, transcribe, and create derivative works (sheet music) from the User Content`
- Terms, uploads: `You retain all ownership rights to any audio files, musical works, or other content ("User Content") that you upload, submit, or process through the Service. However, by uploading User Content, you grant Lunaverus a limited, non-exclusive, royalty-free license to copy, process, store, and modify the User Content solely for the purpose of providing the transcription services to you.`
- Privacy Policy: `When you use our web-based transcription services, we collect and store the content you submit, including audio files, video files, text, and other media ("User Content"). We also store the transcripts, file settings, user actions and modifications, and output generated by our system from this content.`

The license and terms quotes my agents found for this group, with links, are in `survey.md` and `trials.md` in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research/lanes/apps-survey). Some tools' terms weren't read, Chordify's among them.

</details>

## Sound and video still to upload

The separated tracks, playback recordings and hand-tracking videos my agents made aren't on this site yet. They're filed in my media library with the test clips. The outputs are listed here by the section that made them, as the agents wrote the lists.

<details><summary>The outputs still to upload, section by section</summary>

**Splitting a song into instruments**

~~~text
All ten checked present at 01:12 UTC on 2026-11-11, and again at 04:30 UTC on 2026-11-12 after the box restarted, with the same sizes and durations. Nothing new to add: the verifier's later re-runs (r0713, r0718, r0719, r0725, r0728) deleted their audio after the checks, and nothing under `out/` is newer than this list. All are 44.1 kHz stereo WAV. R2 is an excerpt of Josh Woodward's "I Want to Destroy Something Beautiful", CC BY 4.0, so a caption on an R2 stem must credit him.

1. `/home/user/gtr/lanes/source-separation/out/htdemucs_6s/S4/guitar.wav`: Demucs htdemucs_6s guitar stem of S4, the synthesized band (r0021). It holds 0.358 of the true guitar. 38.741 s, 16-bit, 6,834,024 bytes.
2. `/home/user/gtr/lanes/source-separation/out/htdemucs_6s/S4/piano.wav`: the piano stem of the same run (r0021), which holds 0.232 of the true guitar. 38.741 s, 16-bit, 6,834,024 bytes.
3. `/home/user/gtr/lanes/source-separation/out/htdemucs/S4/other.wav`: Demucs htdemucs `other` stem of S4 (r0019), which holds 0.883 of the true guitar and 0.456 of the lead line. 38.741 s, 16-bit, 6,834,024 bytes.
4. `/home/user/gtr/lanes/source-separation/out/htdemucs-6s-guitar-ft/S4/guitar.wav`: the guitar fine-tune's guitar stem of S4 (r0636), which holds 0.898 of the true guitar. 38.741 s, 24-bit, 10,251,014 bytes.
5. `/home/user/gtr/lanes/source-separation/out/uvr/BS-Roformer-SW/S4_0-10s/guitar.wav`: BS-RoFormer-SW guitar stem of the first 10 s of S4, through audio-separator (r0489), which holds 0.939 of the true guitar. 10.000 s, 16-bit, 1,764,078 bytes.
6. `/home/user/gtr/lanes/source-separation/out/msst-becruily-guitar/S4/Guitar.wav`: becruily Mel-Band RoFormer guitar stem of S4 through MSST (r0491), at -39.19 dBFS, holding 0.0773 of the true guitar. 38.741 s, 32-bit float, 13,668,048 bytes.
7. `/home/user/gtr/lanes/source-separation/out/htdemucs_6s/S2s/piano.wav`: Demucs htdemucs_6s piano stem of S2s, the synthesized steel-string guitar alone, where the guitar went (r0099, -19.06 dBFS). 29.357 s, 16-bit, 5,178,644 bytes.
8. `/home/user/gtr/lanes/source-separation/out/htdemucs_6s/R2/guitar.wav`: Demucs htdemucs_6s guitar stem of R2, the real band song (r0428, -19.36 dBFS). 36.000 s, 16-bit, 6,350,444 bytes. Credit Josh Woodward.
9. `/home/user/gtr/lanes/source-separation/out/htdemucs-6s-guitar-ft/R2/guitar.wav`: the guitar fine-tune's guitar stem of R2 (r0637, -18.80 dBFS). 36.000 s, 24-bit, 9,525,644 bytes. Credit Josh Woodward.
10. `/home/user/gtr/lanes/source-separation/out/htdemucs_6s/S6taps/drums.wav`: Demucs htdemucs_6s drums stem of S6taps, whose 32 onsets each fell within 50 ms of one of the 32 taps (r0054, e0928). 29.357 s, 16-bit, 5,178,644 bytes.
~~~

**Turning sound into notes**

~~~text
- `/home/user/gtr/lanes/audio-to-notes/out/sox/S7flat30.plus30c.r0602.wav`: S7flat30 (the S3 chords rendered 30 cents flat) shifted up 30 cents with SoX 14.4.2, run r0602. 24.00 s, 44.1 kHz, 2 channels, 16-bit, 4,233,644 bytes. Exists (checked 2026-11-12, SHA-256 4f54aac7...ed91933b, as `trials.md` "Media kept outside git" records). The file Basic Pitch actually read in run r0319 is the same command's output from the day before, `/home/user/gtr/lanes/audio-to-notes/inputs/S7flat30.plus30c.wav` (24.00 s, 4,233,644 bytes, also present on 2026-11-12 with SHA-256 31f6f3a9...42c42eef as recorded, but under `inputs/`, not `out/`). The two differ only by SoX's dither (at most 2 in 16-bit units).
- No new file since the gap rounds: the verifier's re-run of the same SoX command (run r0691) wrote audio that was deleted afterwards (`trials.md`, "Verification log (verify-gapfill-audio-to-notes, round 2, 2026-11-11)": "the re-run's SoX audio ... were deleted afterwards"), and `/home/user/gtr/lanes/audio-to-notes/verify-gap2/sox/` is empty (checked 2026-11-12). A search of `/home/user/gtr/lanes/audio-to-notes/` for WAV, MP3, FLAC, OGG, M4A, MP4, MOV and WebM files on 2026-11-12 found only the two files above, besides symlinks to the shared inputs.
- Nothing else to hear or watch: no tool in this step wrote audio or video (`trials.md`, "Media kept outside git"). Basic Pitch's `--sonify-midi` was not used. The transcribers wrote MIDI, CSV and NPZ files. The `.wav` entries in `out/onsets-frames/` and `out/crepe-notes/<cfg>/` are symlinks to the shared input clips, not outputs.
~~~

**Chords, beat, key and tuning**

~~~text
None. This lane wrote no audio or video. Checked at 01:21 UTC on 2026-11-11: `/home/user/gtr/lanes/chords-beats-key/out/` holds only 981 `.txt`, 413 `.json`, 130 `.lab`, 11 `.jams` and 1 `.jsonl` files (9.3 MB), with no audio or video file. Checked again at 05:20 UTC on 2026-11-12, after the third round: `out/` holds only 1,031 `.txt`, 425 `.json`, 130 `.lab`, 11 `.jams` and 1 `.jsonl` files (9.6 MB), and a search of the whole `/home/user/gtr/lanes/chords-beats-key/` folder for wav, mp3, flac, ogg, m4a, aif, mp4, webm, mov, avi and gif files finds none. All-In-One's Demucs stems were deleted at the end of each run, as allin1 does by default, and its click-track option (`sonify`) wasn't run. The LiveChord refiner writes text and JSON only, under `out/livechord/` and `out/livechord_cli/`. trials.md, "Media kept outside git", says the same, the gap-round verifier found no audio file left under `out/`, and the third round's verifier found no audio file written by that round. Nothing to add or remove.
~~~

**Choosing the string and fret**

~~~text
None. This lane wrote no audio or video files (trials.md, "Media kept outside git"), and `/home/user/gtr/lanes/guitar-tab/out/` holds no audio or video file (checked 2026-11-10: its folders hold JSON, text, TSV, LilyPond, CSV, GP5, MIDI and PNG files only). Gap round 2 wrote none either (trials.md, same section), and neither `/home/user/gtr/lanes/guitar-tab/gap2/` nor `/home/user/gtr/lanes/guitar-tab/verify-gap2/` holds a file with an audio or video extension (checked 2026-11-12). The 5 PNG files in `gap2/` are images inside the gtrsnipe repository clone, not outputs.
~~~

**Melody, bass and taps from one guitar**

~~~text
All twelve entries' files checked present at 04:37 UTC on 2026-11-12 (the first nine also at 00:02 UTC on 2026-11-11). Float32 files are 44.1 kHz mono, except the libfmp parts (10 to 12), which are 22,050 Hz mono. The others are 16-bit 44.1 kHz stereo.

1. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/librosa-hpss/S6taps/m4/percussive.wav`: librosa HPSS percussive part of S6taps at margin 4 (r0031), float32, 29.357 s, 5,178,680 bytes.
2. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/librosa-hpss/S6taps/m4/harmonic.wav`: the harmonic part from the same split (r0031), float32, 29.357 s, 5,178,680 bytes.
3. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/libnmfd/S6taps/kam_percussive.wav`: libnmfd KAM percussive part of S6taps (r0238), float32, 29.357 s, 5,178,680 bytes.
4. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/libnmfd/S6taps/nmf_percussive.wav`: libnmfd KAM plus NMFD percussive part with the 0.25 threshold (r0238), float32, 29.357 s, 5,178,680 bytes.
5. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/librosa-nmf/S6taps/nmf_k16_oracle_taps.wav`: scikit-learn NMF k = 16 components of S6taps grouped with the answer key (r0296), float32, 29.357 s, 5,178,680 bytes. Any caption must say the grouping used the answer key.
6. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/demucs-real/htdemucs_6s/R3b/bass.wav`: Demucs htdemucs_6s bass stem of R3b, the real home recording (-16.2 dB from the mix) (r0327), 18.000 s, 3,175,244 bytes.
7. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/demucs-real/htdemucs/R3c/drums.wav`: Demucs htdemucs drums stem of R3c, the real lesson video, which has no taps seen in its frames (-42.5 dB from the mix, peak -23.5 dBFS, 55 librosa onsets) (r0330), 18.000 s, 3,175,244 bytes.
8. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/gap1-RT1/demucs/htdemucs_6s/RT1/drums.wav`: Demucs htdemucs_6s drums stem of RT1, the real recording tagged tapping (-40.0 dB from the mix, 351 librosa onsets, its loudest moments at 0:31.8, 1:05.8, 1:08.4, 1:10.4 and 3:25.8) (r0554), 233.509 s, 41,190,956 bytes. Not listened to. RT1 is CC BY 3.0, so a caption must credit Chris Smuck. These figures are one run's. A second run of the same command (r0571, its stems deleted after the check) gave -37.3 dB, 23 librosa onsets and 7 of 180 peaks above -40 dBFS (0:31.8, 1:05.8, 1:08.3, 1:10.4, 2:00.8, 2:18.8, 3:25.8), so any caption must say the figures differ between two runs of one command.
9. Outside this lane's `out/` folder, the source-separation lane's file: `/home/user/gtr/lanes/source-separation/out/htdemucs_6s/S6taps/drums.wav`, Demucs htdemucs_6s drums stem of S6taps (r0054), the one whose librosa onsets were the 32 taps, 29.357 s, 5,178,644 bytes.
10. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/gap2-libfmp/S6taps/hrps_beta2/percussive.wav`: libfmp `hrps` percussive part of S6taps at beta 2 (r0620), float32, 22,050 Hz, 29.357 s, 2,589,380 bytes. Its onset list starts with the excerpt in the libfmp entry.
11. `/home/user/gtr/lanes/fingerstyle-voices-taps/out/gap2-libfmp/S6taps/hrps_beta2/residual.wav`: the residual part from the same split (r0620), float32, 22,050 Hz, 29.357 s, 2,589,380 bytes.
12. The other 14 libfmp parts of S6taps (r0620), each float32, 22,050 Hz, 29.357 s, 2,589,380 bytes: `/home/user/gtr/lanes/fingerstyle-voices-taps/out/gap2-libfmp/S6taps/{hps_binary,hps_soft}/{harmonic,percussive}.wav`, `/home/user/gtr/lanes/fingerstyle-voices-taps/out/gap2-libfmp/S6taps/hrps_beta2/harmonic.wav` and `/home/user/gtr/lanes/fingerstyle-voices-taps/out/gap2-libfmp/S6taps/hrps_beta{1.1,4,32}/{harmonic,percussive,residual}.wav`.
~~~

**Reading hands and the fretboard from video**

~~~text
All four exist (checked with ls and ffprobe on 2026-11-10, and again on 2026-11-12: the same byte counts, durations and frame sizes, one H.264 video stream each). H.264, no audio. Gap round 2 made no audio or video: a search of `/home/user/gtr/lanes/video-hands-fretboard/` on 2026-11-12 for mp4, wav, mp3, webm, mov, avi, gif, m4a, flac and ogg files finds nothing dated after 2026-11-10 22:28 UTC, and its capo input C1 is a still JPEG. Nothing to add or remove. Made by drawing run r0227 (R3a_cu, R3a) and by steps `overlay-video_R3b_mediapipe` and `overlay-video_R3c_mediapipe` of group run r0408 (R3b, R3c).

1. `/home/user/gtr/lanes/video-hands-fretboard/out/videos/R3a_cu_mediapipe_hands.mp4`: R3a_cu with MediaPipe Hand Landmarker's landmarks drawn (output of r0078). 10.01 s, 925,707 bytes, 640x480. CC BY-SA 4.0 derivative.
2. `/home/user/gtr/lanes/video-hands-fretboard/out/videos/R3a_mediapipe_hands_full.mp4`: R3a full frame with MediaPipe Hand Landmarker's landmarks (output of r0071). Shows the detection on the sheet music in the wide shot. 18.02 s (ffprobe 18.018 s), 927,653 bytes, 640x480. CC BY-SA 4.0 derivative.
3. `/home/user/gtr/lanes/video-hands-fretboard/out/videos/R3c_mediapipe_hands_960.mp4`: R3c at 960x540 with MediaPipe Hand Landmarker's landmarks on both hands (group C1 output). 18.00 s, 940,447 bytes. R3c is CC BY 3.0, "Manx Guitar Lesson: Three Little Boats" (2019) by Culture Vannin, presented by Pete Lumb, via Wikimedia Commons.
4. `/home/user/gtr/lanes/video-hands-fretboard/out/videos/R3b_mediapipe_hands_960.mp4`: R3b at 960x540 with MediaPipe Hand Landmarker's landmarks (group C1 output), where the picking-hand fingers at the left edge are never found. 18.00 s, 1,608,746 bytes. CC0.

Left out: `/home/user/gtr/lanes/video-hands-fretboard/out/sam2/R3a_cu_f150-179.mp4` (1.00 s, 395,005 bytes) is the 30-frame input given to SAM 2.1 video mode, not an output.
~~~

**Showing, editing and playing a tab in the browser**

~~~text
All four files exist (checked 2026-11-10 with ffprobe, and again on 2026-11-12 with the same sizes and durations). Gap round 2 made no audio or video (trials.md, "Files of this round"). All are WAV, 44.1 kHz, 2 channels, 32-bit float, so they need converting for the web. Listed in trials.md, "Media kept outside git".

1. `/home/user/gtr/lanes/web-tab-render/out/alphatab-player/S2n_plain.export.wav`: alphaTab 1.9.0's `api.exportAudio()` of S2n.gp5 with its bundled SONiVOX sound bank, click off (run r0128). The known S2n tab played back by alphaTab. 27.858 s, 9,828,396 bytes.
2. `/home/user/gtr/lanes/web-tab-render/out/alphatab-transpose/S2n.plain.wav`: the first 4 s of the same export (run r0328). 4.005 s, 1,413,164 bytes.
3. `/home/user/gtr/lanes/web-tab-render/out/alphatab-transpose/S2n.changeTrackTranspositionPitch.wav`: the same 4 s exported after `api.changeTrackTranspositionPitch(tracks, 2)`. Its first melody note measured 195.78 Hz, the same as file 2 (run r0328). 4.005 s, 1,413,164 bytes.
4. `/home/user/gtr/lanes/web-tab-render/out/alphatab-transpose/S2n.exportOption.wav`: the same 4 s exported with `trackTranspositionPitches` set to `{0: 2}`. Its first melody note measured 219.75 Hz, two semitones up (run r0328). 4.005 s, 1,413,164 bytes.
~~~

**Metronome and sync in the browser**

~~~text
All checked on 2026-11-12 with `ffprobe` and `stat`: every file exists. All are 44.1 kHz 32-bit float WAV.

1. `/home/user/gtr/lanes/browser-audio-sync/out/metronome/metronome_interval_busy100.wav`: the setInterval click track with the page busy, no clip (r0199). Mono, 62.04 s, 10,944,044 bytes.
2. `/home/user/gtr/lanes/browser-audio-sync/out/metronome/metronome_lookahead_busy100.wav`: the look-ahead loop's click track with the page busy, no clip (r0199). Mono, 61.96 s, 10,930,220 bytes.
3. `/home/user/gtr/lanes/browser-audio-sync/out/metronome/metronome_tone_busy100.wav`: Tone.js's click track with the page busy, no clip (r0199). Mono, 61.93 s, 10,925,100 bytes. The file still holds the recorder's 128-frame slip, so from 17.07 s on its clicks sit 2.902 ms later than played.
4. `/home/user/gtr/lanes/browser-audio-sync/out/metronome/metronome_worklet_busy100.wav`: the AudioWorklet click track with the page busy, no clip (r0199). Mono, 62.00 s, 10,936,876 bytes.
5. `/home/user/gtr/lanes/browser-audio-sync/out/sync/sync_s4_element_busy0.wav`: S4 played in an `<audio>` element with clicks booked on its 68 beats, Web Audio (r0150). 2 channels, channel 0 S4 as it arrived in the graph and channel 1 the clicks. 39.40 s, 13,899,820 bytes.
6. `/home/user/gtr/lanes/browser-audio-sync/out/alphatab/S2n_alphatab_live_countin_metronome.wav`: alphaTab 1.9.0's count-in and click while playing `S2n.gp5`, guitar muted (r0269). Mono, 8.41 s, 1,483,820 bytes.
7. `/home/user/gtr/lanes/browser-audio-sync/out/synths/S2n_jssynth.wav`: S2n's 90 notes played by js-synthesizer 1.13.0 with FluidR3_GM (r0225). 2 channels, 32.11 s, 11,328,556 bytes.
8. `/home/user/gtr/lanes/browser-audio-sync/out/synths/S2n_smplr.wav`: S2n's 90 notes played by smplr 1.2.0 with the FluidR3_GM nylon guitar sounds (r0229). 2 channels, 31.18 s, 11,000,876 bytes.
9. `/home/user/gtr/lanes/browser-audio-sync/out/stretch/S1_element_0p75_pp1.wav`: S1 at 0.75x through an `<audio>` element with `preservesPitch` true (r0225). 2 channels, 40.27 s, 14,208,044 bytes.
10. `/home/user/gtr/lanes/browser-audio-sync/out/stretch/S1_element_0p75_pp0.wav`: the same at 0.75x with `preservesPitch` false (r0225). 2 channels, 40.31 s, 14,221,356 bytes.
11. `/home/user/gtr/lanes/browser-audio-sync/out/htdemucs6s-web/S4_10s_t2_optdisabled_drums.wav`: the drums stem htdemucs_6s made of S4_10s in ONNX Runtime Web 1.31.1, 2 threads, graph optimization `disabled` (r0597, gap round 2). 2 channels, 10.00 s, 3,528,044 bytes.
12. `/home/user/gtr/lanes/browser-audio-sync/out/htdemucs6s-web/S4_10s_t2_optdisabled_bass.wav`: the bass stem of the same run (r0597). 2 channels, 10.00 s, 3,528,044 bytes.
13. `/home/user/gtr/lanes/browser-audio-sync/out/htdemucs6s-web/S4_10s_t2_optdisabled_other.wav`: the `other` stem of the same run (r0597), RMS -80.25 dBFS. 2 channels, 10.00 s, 3,528,044 bytes.
14. `/home/user/gtr/lanes/browser-audio-sync/out/htdemucs6s-web/S4_10s_t2_optdisabled_vocals.wav`: the `vocals` stem of the same run, paired with S4's lead line (r0597). 2 channels, 10.00 s, 3,528,044 bytes.
15. `/home/user/gtr/lanes/browser-audio-sync/out/htdemucs6s-web/S4_10s_t2_optdisabled_guitar.wav`: the guitar stem of the same run (r0597). 2 channels, 10.00 s, 3,528,044 bytes.
16. `/home/user/gtr/lanes/browser-audio-sync/out/htdemucs6s-web/S4_10s_t2_optdisabled_piano.wav`: the piano stem of the same run (r0597). 2 channels, 10.00 s, 3,528,044 bytes.

Not listed, also on disk: the 1-thread and 4-thread stem sets in the same folder (`S4_10s_t1_optdisabled_*.wav`, r0613, and `S4_10s_t4_optdisabled_*.wav`, r0607), sample-identical to items 11 to 16. The native demucs-onnx stems of r0596, r0603 and r0611 in `out/htdemucs6s-native/`, `out/htdemucs6s-native-optdisabled/` and `out/htdemucs6s-native-chromiuminput-optdisabled/`, six each, 2 channels, 10.00 s, 3,528,088 bytes each. `out/htdemucs6s-web/S4_10s_decoded_by_chromium.wav`, S4_10s as Chrome decoded it (r0608). S4 was synthesized for the test set. The htdemucs_6s weights' license is in the license table of *Metronome and sync in the browser*.
~~~

**Tools handing off to each other**

~~~text
All three under `/home/user/gtr/lanes/chains/out/chainE/`, checked present on 2026-11-11 with ffprobe. Derived from S4 (synthesized for the test set, see INPUTS.md). alphaTab 1.9.0 made the renders with its bundled SONiVOX SoundFont, `sonivox.sf2` (`scripts/pages/chainE.html` line 26), whose license the web-tab-render survey quotes as `Copyright (c) 2004-2006 Sonic Network Inc. Licensed under the Apache License, Version 2.0` (`web-tab-render/survey.md`, section "SoundFonts used by the web players above"). No credit decision was made here. It is left to the media step. No video was made in this lane.

1. `/home/user/gtr/lanes/chains/out/chainE/S4.madmom.span_alphatab_guitar_only.wav`: alphaTab 1.9.0's `exportAudio` render of the chain A file `S4.madmom.span.gp5` with the metronome at volume 0, the tab from the full-song chain played back at 116 BPM. 37.760 s, 2 channels float32, 44.1 kHz, 13,321,772 bytes (run r0535).
2. `/home/user/gtr/lanes/chains/out/chainE/S4.madmom.span_alphatab_metronome_only.wav`: the same render with the guitar track at volume 0, alphaTab's metronome alone, 73 clicks. 37.760 s, 2 channels float32, 44.1 kHz, 13,321,772 bytes (run r0535).
3. `/home/user/gtr/lanes/chains/out/chainE/S4.madmom.span_capture.wav`: the chain E page's capture, 3 channels: the guitar render, the clicks at madmom's tracked beats, and alphaTab's metronome, all on one `AudioContext` clock. 38.650 s (38.649615), 3 channels float32, 44.1 kHz, 20,453,420 bytes (run r0535).
~~~

**Services an agent can call over the internet**

~~~text
All checked present on the box (sizes and durations from `ls` and ffprobe, matching trials.md "Media kept outside git"). Rechecked 2026-11-12 with `stat` after gap round 2: all nine still present with the same byte sizes. Gap round 2 made no new audio or video (its ffmpeg copies, r0599 and r0600, were deleted after the check, and its Cesure output is JSON: trials.md "Gap round 2"), so nothing was added here. Licenses follow the input: S clips synthesized for this research, R2 CC BY 4.0 ("I Want to Destroy Something Beautiful" by Josh Woodward, credit required), R1c GuitarSet CC BY 4.0 (credit required).

1. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/S4_six_stems/stems/guitar.mp3`: ElevenLabs `six_stems_v1` guitar stem of S4 (r0064). MP3 192 kb/s 44.1 kHz stereo, 38.79 s, 931,048 bytes.
2. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/S4_six_stems/stems/other.mp3`: ElevenLabs `other` stem of S4, the one the lead line was measured in (r0064). 38.79 s, 931,048 bytes.
3. `/home/user/gtr/lanes/hosted-apis/out/hf-spaces/demucs_S4_old/named/other.wav`: Demucs `mdx_extra_q` Space `other` stem of S4, the one the guitar was measured in (r0141). WAV 16-bit 44.1 kHz stereo, 38.74 s, 6,834,024 bytes.
4. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/S6taps_six_stems/stems/guitar.mp3`: ElevenLabs guitar stem of S6taps (r0189). 29.39 s, 705,350 bytes.
5. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/S6taps_six_stems/stems/drums.mp3`: ElevenLabs drums stem of S6taps, the one the taps were measured in (r0189). 29.39 s, 705,350 bytes.
6. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/R2_six_stems/stems/vocals.mp3`: ElevenLabs vocals stem of R2 (r0194). 36.05 s, 865,219 bytes. Needs the R2 credit.
7. `/home/user/gtr/lanes/hosted-apis/out/elevenlabs/R2_six_stems/stems/guitar.mp3`: ElevenLabs guitar stem of R2 (r0194). 36.05 s, 865,219 bytes. Needs the R2 credit.
8. `/home/user/gtr/lanes/hosted-apis/out/hf-spaces/beatthis_S4/files/beat-this_audio-with-beats.wav`: Beat This! Space, S4 with its beat clicks mixed in (r0118). WAV, 38.74 s, 6,834,024 bytes.
9. `/home/user/gtr/lanes/hosted-apis/out/hf-spaces/beatthis_R1c/files/beat-this_audio-with-beats.wav`: Beat This! Space, R1c with its beat clicks mixed in (r0246). WAV, 28.24 s, 2,490,396 bytes. Needs the GuitarSet credit.
~~~

**Apps that already do some of this**

~~~text
None. No tool in this lane produced audio or video (`trials.md`, "Media kept outside git": "No tool in this lane produced audio or video."). `/home/user/gtr/lanes/apps-survey/out/` holds only `anthemscore-web/` (r0055's error output `explore_S2s/run.out`, and the logs, page captures and PNG screenshots of r0062 in `explore_S2s_b/` and r0226 in `verify_S2s/`) and `clips-mp3/`, which is MP3 copies of the shared input clips made for apps that need MP3, not tool output. If the post wants the input that went in, the uploaded file was the WAV `/home/user/gtr/inputs/S2s/S2s.wav`. Its MP3 copy exists at `/home/user/gtr/lanes/apps-survey/out/clips-mp3/S2s.mp3` (705,977 bytes, 29.388 s by ffprobe, which counts the MP3's encoder delay and padding, checked 2026-11-10). Checked again on 2026-11-11 after gap round 2, which installed and ran no tool and added no ledger run (`trials.md`, "Gap round 2" and the round-2 verification log): `out/` holds the same folders and files, all dated 2026-11-10, `S2s.mp3` is still 705,977 bytes, and no audio, video or image file under `/home/user/gtr/lanes/apps-survey/` is newer than 2026-11-10 23:31 UTC, when this fragment was first written (the 337 newer files are the page copies, headers, error logs, text copies and JSON lookups of gap round 2 and its checker, 210 in `gap2/` and 127 in `verify-gap2/`). Nothing to add or remove.
~~~

</details>

*Researched, run and checked by a team of Claude agents from 2026-11-10 to 2026-11-12: Fable 5.2 directing, Opus 5.5 and Sonnet 5.5 doing the work. I haven't run any of these tools myself yet. Every run, quote and count is in [the research folder](https://github.com/aaronorelup/blog/tree/research/guitar-tab-tools/docs/guitar-tab-research).*
