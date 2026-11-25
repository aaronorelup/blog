# How the AO-082 film is made

Production scout, 2026-11-24. This is the build manual for the film at the top of AO-082 ("Testing the tools a
guitar tab web app would need"). Every chapter agent reads it before touching a scene. Everything below was run and
measured on this box (4 vCPU, 15 GB, no GPU) unless it says otherwise.

## In short

- **The look is "the bench".** Tea House night indigo with a faint graph-paper grid, gold Zen Maru Gothic titles,
  Karla labels, Gelasio italic sentences, JetBrains Mono numbers. The answer key is always printed on cream paper.
  Tool output always lives on dark panels, and its verdict is drawn in three colours that also differ in shape:
  sky blue solid = found, lamp gold dashed outline = missed, terracotta hatched = made up.
- **The renderer is HyperFrames 0.9.91** (HTML scenes rendered by headless Chrome, GSAP timelines, ffmpeg). It
  handled every kind of shot the film needs with no fallback. With chrome-headless-shell and 3 workers it renders
  1080p30 at **1.15 s per second of film** (39.6 s proof in 45.6 s). A 30 minute film is about 35 to 60 minutes
  of rendering here, one render at a time.
- **The narrator is ElevenLabs "Mike - Deliberate, Thoughtful, Professional"** (`USXpAZuBZ22GqtSpuKoQ`) on
  `eleven_multilingual_v2`, speed 0.92. A 4,500 word script is about 23,000 characters, which this account bills
  at about 10,000 credits (0.44 per character measured). 193,638 credits remain.
- **The proof** is `/home/user/gtv/production/proof.mp4` (39.7 s, 10.4 MB, -16.1 LUFS, true peak -2.2 dBTP, soft
  captions). The tab cursor and the audio agree to within one frame. Everything reusable is in
  `/home/user/gtv/production/kit/`.

## 1. The bar: what "I Love My Evening Television" gets right

Measured on lessons 03 (Earthlight) and 05 (Touch Move), `public/courses/i-love-my-evening-television/`, with
ffprobe, ebur128, frames pulled at five times each (`/home/user/gtv/production/bar/sheet.jpg`) and a frame-difference count.

1. **Picture:** 1280x720, 30 fps, H.264 High at 0.22 to 0.24 Mb/s. Nine lessons of 5.0 to 6.1 minutes.
2. **Drawn, not filmed:** every frame is drawn on a canvas (`engine/kit.js`) as a pure function of time.
3. **Look:** tinted dark grounds per episode, Gelasio titles ending in a gold block cursor, mono pills, fact cards.
4. **Calm:** only 10 to 12% of frames change at all, 0.16% of the area on average, not one hard cut in 2 minutes.
5. **Pacing:** about 10 chapters of 17 to 54 s per lesson, narration at 127 words a minute with real pauses.
6. **Captions:** soft (mov_text plus .vtt), a cue every 3.1 s, two lines, each tagged with its evidence tier.
7. **Sound:** one narrator over a quiet bed about 18 dB under the voice, AAC 44.1 kHz stereo 124 kb/s.
8. **Loudness:** -16.5 LUFS integrated on both, loudness range 4.2 to 4.3 LU.
9. **One slip:** Touch Move peaks at +4.1 dBTP after its AAC encode (its mix.mp3 is -1.5). Measure after encoding.
10. **Receipts:** every on-screen claim names its source, and each page adds a transcript, chapters and a summary.

That level of care is the bar: every frame deliberate, every claim sourced, sound measured, captions shipped. The
look is not the bar. This film must not resemble the series: no lore cards, no typewriter cursor, no tier pills,
no tinted episode grounds, no serif titles.

## 2. The look: the bench

One sentence: **a lab bench at night, where the answer key is a printed sheet and every tool's output is laid out
next to it on a dark instrument panel.** It is a documentary that shows its measurements.

### 2.1 Palette

All values come from the Tea House brand (`~/agent-kit/skills/aaron-brand/`). The night tokens are the frame. Sky
blue, lamp gold and the dark hatch line come from the brand book's scene palette (section 1.1), which the book
allows for illustrative work. No status green or red exists in the brand, and none is used.

| Token | Hex | Job |
|---|---|---|
| `--bench` | `#101220` | the ground of every frame (`--pc-page` night) |
| grid | `#302E3E` at 34% | 48 px graph-paper hairlines over the bench |
| glow | `#F0C06A` at 6% | one warm radial glow at the top left (lamp light, never a grey vignette) |
| `--panel` | `#15172A` | instrument panels: piano roll, charts, readouts |
| `--tile` | `#201F2C` | media wells behind footage |
| `--line` / `--line2` | `#302E3E` / `#4A445A` | hairlines / heavier rules and chip borders |
| `--head` | `#F0C06A` | titles (gold) |
| `--strong` | `#F2E7D5` | names, key numbers |
| `--body` | `#C9BCA9` | sentences |
| `--soft` / `--quiet` | `#9C917F` / `#8E8375` | labels / source lines |
| `--gold` | `#C9A227` | eyebrows only |
| `--accent` | `#E2795C` | terracotta: a tool's identity |
| `--paper` | `#FBF3E8` | the answer key's sheet |
| `--ink` / `--ink-soft` | `#3A3A42` / `#6B5E52` | notation and text on paper |
| `--ink-gold` | `#BE7A10` | the play cursor on paper |
| `--v-match` | `#6FB4E8` | verdict: found (solid fill) |
| `--v-miss` | `#FFD892` | verdict: missed (dashed outline, no fill) |
| `--v-extra` | `#E2795C` with `#803D2C` stripes | verdict: made up (45 degree hatch) |

Pink (`--th-blossom`) is not used at all.

### 2.2 Truth and tool, at a glance

- **Truth is paper. A tool is a dark panel.** An answer key (a tab, a chord chart, a note list) is drawn in ink on
  the cream sheet with a cream "ANSWER KEY" chip. A tool's output is drawn on `--panel` with a terracotta chip or a
  terracotta identity bar. Paper against panel is a contrast of 16:1, so it reads for every kind
  of colour vision and in greyscale.
- **Verdicts use colour and shape together.** Found = sky blue solid. Missed = lamp gold dashed outline with no
  fill (the ghost of a note the tool never wrote). Made up = terracotta with dark stripes.
- **Checked:** `kit/tools/cvd_check.py` simulates protan, deutan and tritan vision (Machado 2009, full severity). The
  worst pair is missed against made up under deutan vision at CIEDE2000 17.2, and the shapes separate them anyway.
  Contrast on the panel: found 7.9:1, missed 13.0:1, made up 6.0:1.
- A note that is right in pitch but on another string (a tab-only verdict) is drawn as a sky blue outline, solid line.
- On footage, a tool's raw overlay (hand points, boxes, fretboard lines) is terracotta with cream joints.
- The legend always names the verdicts in words: found, missed, made up. The narrator says the colour names once
  per chapter ("blue it found, gold it missed, orange it made up").

### 2.3 Type

| Face | Use | Size on the 1920x1080 frame | File |
|---|---|---|---|
| Zen Maru Gothic 700 | titles, tool names | 92 px film title, 46 to 56 px scene titles, 50 px tool names, tracking -0.015 to -0.02em, gold or cream | `kit/fonts/ZenMaruGothic-700-latin.woff2` (500 too) |
| Karla 600 | labels, chips, eyebrows, legends | 22 to 26 px, UPPERCASE, tracking 0.12 to 0.14em | `kit/fonts/Karla-400-latin.woff2` (variable, 400 to 700) |
| Gelasio italic | full sentences on screen (subtitles, findings) | 32 to 40 px | `kit/fonts/Gelasio-400i-latin.woff2` |
| JetBrains Mono | numbers, versions, run ids, sources | 24 to 40 px, source lines 20 px | `kit/fonts/JetBrainsMono-400-latin.woff2` |

Gelasio is the metric twin of Georgia (the brand's reading face), which this Linux box does not have. All fonts
are Latin subsets from Google Fonts (OFL), declared in `kit/kit.css` with paths `assets/fonts/...`.

Type floor: reading text is at least 32 px, labels at least 22 px, nothing that matters under 22 px. Source lines
at 20 px are texture for a paused viewer and carry `data-layout-ignore`. HyperFrames' own check wants 28 px for
everything and warns about the labels. That warning is accepted on purpose: uppercase tracked labels at 22 to 26 px
read as well as 28 px sentence case.

### 2.4 Layout

- Frame 1920x1080, 30 fps. Side margins 96 px (title safe). Top band 40 to 110 px: scene tags and the `AO-082` mark.
- **Caption band:** the bottom 150 px hold nothing that matters, because the web player draws captions there.
  Lower thirds sit just above it (bottom edge 178 px from the frame bottom). Source lines sit at the very bottom.
- Rounded cards 24 px, pills 999 px, and the square things the brand asks for: media wells, the answer key sheet,
  the title stamp and every identity bar are square cornered.
- Shadows are huge and faint (`0 34px 100px` at 45 to 55% black on the bench). No tight drop shadows, no glass.

### 2.5 Shots (all in `kit/components/`)

- **Film title card** (`title`): eyebrow, two title lines, a hairline, one italic sentence that states the
  conclusion, a mono meta line, and a square stamp on the right that holds the single most important number. The
  film's first frame shows the finished card (`static_first`), because that frame is the thumbnail.
- **Chapter card** (`title` again): eyebrow "Chapter N · stage", the chapter title, the chapter's finding as the
  italic sentence, and the stamp carrying the winning tool and its number.
- **Lower third** (`lowerthird`): for a recording or a person. Cream identity bar = source material, terracotta =
  a tool. Eyebrow, name in Zen Maru Gothic 50 px, mono meta, an optional result pill.
- **Tool tag** (inside `clipoverlay`, `pianoroll`, `tabplayer` headers): "STAGE n · stage name" eyebrow in gold, the
  tool's name in cream Zen Maru Gothic, then one mono line with the exact version and the run id. A tool is always
  named with its version, its setting that matters and the run id, never just its brand.
- **Result label:** numbers in JetBrains Mono, the metric named in a Karla label next to it ("ONSET F1 0.893"),
  the rule behind it in the source line ("mir_eval: onsets within 50 ms, same pitch").
- **Footage with an overlay** (`clipoverlay`): the clip in a square well with a slow 3% push, the tool's per-frame
  output drawn on top, and a live readout panel on the right (frame, found or not, confidence, running hit rate).
- **Tab player** (`tabplayer`): the tab on paper scrolls under a fixed gold cursor at 34% of the sheet while its
  audio plays. The notes that just started get a soft gold column. Bar and time count live in the header.
- **Piano roll** (`pianoroll`): truth against one tool, notes revealed as the playhead passes while you hear the
  tool's notes. Live counts in a legend. Open strings of the recording's tuning are labelled on the pitch axis.
- **Verdict bars** (`barchart`): one row per tool, found / missed / made up stacked against a dashed line at the
  answer key's note count, the score in mono at the right. `mode: "value"` draws plain cream bars for times and costs.

### 2.6 Motion

- Two easings only: `cubic-bezier(.4,0,.2,1)` for every entrance, exit and move (`HFK.EASE`), and one overshoot
  `cubic-bezier(.34,1.8,.64,1)` (`HFK.POP`) used once per chapter at most, for the verdict stamp.
- Entrances 0.45 to 0.56 s with a 12 to 26 px rise, exits 0.4 s fades. Staggers 0.12 s.
- One focal movement at a time. The tab scroll and its cursor count as one. Data motion (cursor, playhead) is
  linear, never eased.
- Scene changes dip through the bench: each scene fades out its own content in its last 0.45 s and the next fades
  in, so chapters join with clean cuts on an empty bench. No whips, flips, glitches or zooms beyond 3%.
- Nothing static for more than 3 s: a held card gets a 2% push over its duration.
- No generated footage of guitar playing, ever. This film is about what is real.

### 2.7 Sound

- One narrator, no music bed. The guitar examples are the music. Silence between lines is allowed.
- Narration lines are levelled one by one to -17 LUFS (`level.py`). Music and clip audio are levelled to -19 LUFS
  before placement.
- Under narration, music sits at gain 0.22 to 0.3 (about -11 to -13 dB) and comes up to 1.0 over 0.35 to 0.4 s when
  the voice stops. Never narrate over a listening window.
- **Listening windows:** whenever a tab is on screen, at least 4 s of it is heard alone with its cursor. When truth
  and a tool are compared by ear, play the same bars twice, truth first, through the same SoundFont and program
  (`/usr/share/sounds/sf2/FluidR3_GM.sf2`, 24 nylon or 25 steel), so the difference is in the notes, not the timbre.
  Never put an experiment's own `render.wav` in the film: to save disk some were cut to mono 22.05 kHz. Render every
  window again from the tool's notes (its CSV, MIDI or GP5) at 48 kHz stereo, as in section 6.
- Master: -16 LUFS integrated, true peak at most -1.5 dBTP **after** the AAC encode, loudness range under 8 LU.
  `finish.py` does this and measures it.

### 2.8 Captions

Soft captions only, never burned in: a `.vtt` next to every chapter and the film. Review copies also carry them
as mov_text (`finish.py --vtt`). The site's film file carries none, because the page loads the `.vtt` (`EMBED.md`).
One cue per sentence when it fits two lines of 42 characters, longer sentences split at a comma, no tail
under four words, cues at least 1.2 s. `hfkit.py vtt` builds them from ElevenLabs word timings. A chapters.vtt marks
each chapter for the player.

## 3. The tools on this box

| What | Where | Notes |
|---|---|---|
| HyperFrames CLI 0.9.91 | `/home/user/gtv/production/tooling/node_modules/.bin/hyperframes` | pinned, telemetry disabled. Projects: `hyperframes init <dir> --non-interactive --example=blank` |
| alphaTab 1.9.0 | `/home/user/gtv/production/tooling/node_modules/@coderline/alphatab` | used by `kit/tools/tabstrip/` |
| Fast capture browser | `/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell` | set `HYPERFRAMES_BROWSER_PATH` to it. With `/usr/bin/google-chrome` HyperFrames falls back to slow screenshot capture |
| Playwright 1.63 | `/opt/node-tools/node_modules/playwright` | used by `tabstrip.cjs` |
| GSAP 3.15.0 | the jsdelivr URL the scaffold writes | HyperFrames also ships vendored copies of 3.14.2 and 3.15.0 |
| mir_eval 0.8.2, pretty_midi, mido | `/home/user/gtr/eval/venv/bin/python` | the research's scoring environment |
| MediaPipe 1.2.2 | `/home/user/gtv/production/venv-mp/bin/python` (+ `proof-data/hand_landmarker.task`) | hand landmarks for overlays |
| FluidSynth 2.3 + FluidR3_GM | system | playing a tab or a tool's notes |
| ffmpeg 6.1.1 | system | everything audio and video |

Skills read for this: hyperframes, hyperframes-cli, hyperframes-core, hyperframes-animation, hyperframes-creative,
hyperframes-audio, hyperframes-registry, media-use, general-video, presentation, missing-map and aaron-brand.
Registry blocks searched before building: the lower thirds (`lt-kicker-name` was installed and read) and
`data-chart` informed the lower third and the bar chart. Nothing in the registry draws notation, a tab cursor or a
piano roll, so those were built.

### 3.1 The kit (`/home/user/gtv/production/kit/`)

| Path | What it does |
|---|---|
| `kit.css` | the palette, type faces, margins and easing tokens. Inlined into every component and root |
| `kit.js` | `HFK.EASE`, `HFK.POP`, `HFK.driver` (runs a draw function on every seek), `HFK.interp`, `HFK.noteName`, `HFK.fmtTime` |
| `fonts/` | the woff2 files and `fonts.css` |
| `components/title.html` | film title and chapter cards |
| `components/lowerthird.html` | lower third for a recording, a person or a tool |
| `components/clipoverlay.html` | footage in a well with per-frame overlay data and a live readout |
| `components/tabplayer.html` | tab on paper, scrolling under the cursor, with its audio |
| `components/pianoroll.html` | truth against a tool, revealed under a playhead, with audio |
| `components/barchart.html` | verdict bars or value bars |
| `tools/hfkit.py` | `init` (fonts), `build` (a component with its data inlined), `root` (a chapter's index.html), `vtt` (captions) |
| `tools/tabstrip/tabstrip.cjs` | a Guitar Pro / MusicXML / alphaTex file to a TAB strip PNG (tiles of 8,000 px for long songs), a beat map JSON and the tab's own MIDI |
| `tools/tab_align_check.py` | checks a strip: drawn fret numbers against beat x (median must be within 1 px) |
| `tools/hands.py` + `hand_landmarker.task` | MediaPipe hand landmarks for a clip excerpt, per frame, ready for `clipoverlay` (run with `venv-mp/bin/python`) |
| `tools/pianoroll_data.py` | truth notes against a tool's notes (CSV or MIDI) with the research's rules, window JSON, and the tool's notes as MIDI |
| `tools/level.py` | sets a file's loudness with a plain gain, optional cut and fades |
| `tools/tts.py` | ElevenLabs line with word timings, cached by a hash of the text and settings |
| `tools/stt_check.py` | Scribe v3 round trip and word error rate against the script |
| `tools/analyze.py` | pace, pauses and pitch spread of a take |
| `tools/render_chapter.sh` | renders a project at 1080p30, fast path, 3 workers, under the box-wide render lock |
| `tools/finish.py` | masters a render to -16 LUFS / -1.5 dBTP after AAC and muxes soft captions |
| `tools/join.py` | joins chapter renders, offsets captions, writes chapters.vtt, masters once |
| `tools/sync_check.py` | measures where note onsets land in a render against where the timeline put them |
| `tools/cvd_check.py` | the colour-vision check of the verdict colours |

## 4. The proof scene

`/home/user/gtv/production/proof.mp4`, built from `/home/user/gtv/production/proof/` by `proof/build_proof.py`.

| Time | Shot | Content |
|---|---|---|
| 0 to 7.2 s | title card | "From a guitar video / to a finished tab", stamp "0:40" |
| 7.2 to 15.6 s | footage with overlay | R3b (Brylie Christopher Oxley, archive.org, CC0), 9 s, MediaPipe HandLandmarker 1.2.2 run here: 220 of 225 frames found a hand, drawn live. Lower third for the recording |
| 15.6 to 27.0 s | tab player | the S2n answer key (alphaTab 1.9.0), scrolling under the cursor with the S2n audio, 5.5 s heard alone |
| 27.0 to 39.6 s | piano roll | truth against ByteDance piano transcription (run r0401): 31 found, 5 missed, 4 made up in the window, the tool's notes heard, whole-clip line "79 of 90 found, 11 missed, 8 made up, onset F1 0.893" |
| all | narration | four lines by the chosen voice, captions in `proof.vtt` |

Measured:

| Measure | Result |
|---|---|
| `hyperframes check` | passed: 0 errors. Warnings: labels under the 28 px floor (accepted, see 2.3), local media start notes |
| Render, chrome-headless-shell, 3 workers | 45.6 s for 39.6 s = **1.15 s per second** (BeginFrame capture) |
| Render, same, 4 workers | 47.6 s = 1.20 s per second (no gain past 3) |
| Render, same, 1 worker | 71.5 s = 1.81 s per second |
| Render, `/usr/bin/google-chrome`, 1 worker | 105.8 s = 2.67 s per second (screenshot capture fallback) |
| File | 10,933,454 bytes for 39.7 s: H.264 High 1080p30 at 2.0 Mb/s, AAC 192 kb/s 48 kHz, mov_text captions |
| Loudness after `finish.py` | -16.1 LUFS integrated, LRA 5.0 LU, true peak -2.2 dBTP |
| Audio placement | guitar onsets land +7.0 ms from the timeline by the onset detector, which reads +5.7 ms on the source file itself: about 1 to 2 ms of real error |
| Cursor | the beat highlight switches on the first frame after each onset (frame 668 for the onset at 22.2357 s), and the drawn fret numbers sit 0.4 px from their beat x: the cursor meets each note within half a frame |
| Chapter join (two copies) | 79.3 s film from 2 x 39.6 s in 17.8 s, captions and chapters offset correctly |

Reference frames: `/home/user/gtv/production/frames/` (proof at 0, 11, 20, 33.5 and 38 s, and the verdict bar chart).

No kind of shot needed a fallback. One bug was found and fixed on the way: alphaTab's bounds lookup reports x
without the score's left padding (`display.padding`), so every glyph sat exactly 10 px left of its reported
position and the cursor ran 40 ms early. `page.html` now subtracts the padding and `tab_align_check.py` guards it.

## 5. The voice

Models on the account (`/v1/models`): eleven_v4, eleven_v4_turbo, eleven_v3, eleven_v3_conversational,
eleven_multilingual_v2, eleven_flash_v2_5, eleven_turbo_v2_5, eleven_turbo_v2, eleven_flash_v2, eleven_storytel_v2,
plus two speech-to-speech models. Account: Creator tier, 197,536 credits a month, resets 2026-12-22 00:59 UTC.

The same 60-word line, read by each candidate (model eleven_multilingual_v2, stability 0.5, similarity 0.75,
style 0, speed 0.92). Files: `/home/user/gtv/production/voice-mike.mp3`, `voice-jamie.mp3`, `voice-owen.mp3`.

| Voice | id | Length | Pace | Pitch spread (IQR) | Pause at a full stop | Scribe round trip |
|---|---|---|---|---|---|---|
| **Mike - Deliberate, Thoughtful, Professional** | `USXpAZuBZ22GqtSpuKoQ` | 21.9 s | 164 wpm | 4.4 semitones | 0.60 s | 0 errors |
| Jamie - Warm Nonfiction Narrator | `RG7Vdpd6OigfTs8d4MVp` | 23.7 s | 152 wpm | 3.2 semitones | 1.01 s | 0 errors |
| Owen | `0KLi0T1jvieih3dQa05S` | 19.6 s | 183 wpm | 2.3 semitones | 0.48 s | 0 errors |

Also tried and dropped: Jake - The Millennial (223 wpm, too fast) and Gxl - Calm and Conversational (too breathy
for a stable pitch read). eleven_v4 ignored speed 0.92 (Owen stayed at 197 wpm) and moved pitch about twice
as much (IQR 5.9 to 7.7 semitones), a performed read rather than an explanation. The voices made for the evening
television series, and the course narrators, were left alone so this film has its own voice.

**Chosen: Mike, because he sounds like a person working something out for you: unhurried, with real but moderate
intonation, and clearly not the woman who narrates the evening television series.** Nobody has listened to these
yet: the numbers above are measurements, so Aaron's ear can overrule them with one word.

Settings for every line:

```json
{"voice_id": "USXpAZuBZ22GqtSpuKoQ", "model_id": "eleven_multilingual_v2",
 "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": true, "speed": 0.92},
 "seed": 7, "output_format": "mp3_44100_192"}
```

```bash
python3 /home/user/gtv/production/kit/tools/tts.py USXpAZuBZ22GqtSpuKoQ vo/l03.mp3 vo/l03.txt --speed 0.92 \
  --prev "$(cat vo/l02.txt)" --next "$(cat vo/l04.txt)"       # writes l03.mp3, l03.words.json, l03.req.json
python3 /home/user/gtv/production/kit/tools/stt_check.py vo/l03.mp3 vo/l03.txt   # retake above 5% word error
python3 /home/user/gtv/production/kit/tools/level.py vo/l03.mp3 project/assets/audio/l03.wav --lufs -17 --mono
```

- One request per paragraph of 1 to 4 sentences, with the neighbours as `previous_text` and `next_text` so the
  prosody runs on across cuts. The key is read inside the script with `getkey.py` and never printed.
- **Word timings:** the script calls `/v1/text-to-speech/{voice_id}/with-timestamps`, which returns the audio and
  one start and end time per character. `tts.py` folds them into words (`*.words.json`: word, start, end in
  seconds from the start of that file). Captions and word-timed cues (a legend lighting up on "blue") come from it.
- Write numbers the way they should be read ("zero point eight nine", "ninety notes") or check them in the round
  trip, and spell tool names the way they are said.
- **Cost:** 4,500 words is about 23,000 characters (5.1 per word in the proof lines). In this session the account
  billed 929 credits for 2,115 characters on eleven_multilingual_v2 (0.44 per character), so the script costs about
  10,100 credits, or about 12,000 with retakes. At the list rate of 1 credit per character it would be 23,000 to
  28,000. Either way it fits: **193,638 credits remain** (read at the end of this run).

## 6. The build plan

### 6.1 Stages

1. **Script** (one agent, outside this document): chapters, each line tagged with the shot it plays over.
2. **Voice** (one agent, before any chapter is built): every line rendered, round-tripped and levelled. Narration
   timing decides every chapter's length, so it comes first.
3. **Experiment data** (the experiment agents): each tool's output on each song in the formats below.
4. **Chapters** (several agents, two or three chapters each, all at once): build, check, look, render, finish.
5. **Join and master** (one agent): `join.py`, a whole-film loudness and caption check, delivery copies.

### 6.2 One folder per chapter

`/home/user/gtv/production/chapters/chNN-slug/`

| Path | Given or made | Contents |
|---|---|---|
| `brief.json` | given | id, title, the one-sentence finding, target length, the shot list (each shot: component, which lines play over it, which data files), the songs and tools it covers |
| `script.md` | given | the chapter's lines, numbered `lNN`, each with its shot |
| `vo/` | given by the voice stage | `lNN.mp3`, `lNN.words.json`, `lNN.req.json`, and the levelled `lNN.wav` |
| `data/` | given by the experiment stage | per shot: tab strips, beat maps and MIDI from `tabstrip.cjs`, comparison JSON from `pianoroll_data.py`, overlay frames JSON, scores for charts, clip excerpts |
| `project/` | made | the HyperFrames project: `index.html` (from `hfkit.py root`), `compositions/`, `assets/`, `build.py` that writes it all from `brief.json` and `data/` |
| `chapter.mp4` | made | the raw HyperFrames render, 1920x1080, 30 fps, with its mixed sound |
| `captions.vtt` | made | from the words files, placed at each line's start |
| `chapter.json` | made | `{"id", "title", "duration"}` |
| `qc/` | made | the check report, a contact sheet at shot midpoints, `sync_check.py` output for each listening window |

A chapter is delivered when `chapter.mp4`, `captions.vtt` and `chapter.json` exist, `hyperframes check` has no
errors, the contact sheet has been looked at, and every listening window measures within 20 ms.

### 6.3 How a chapter agent builds

```bash
K=/home/user/gtv/production/kit/tools; HF=/home/user/gtv/production/tooling/node_modules/.bin/hyperframes
cd /home/user/gtv/production/chapters/ch04-audio-to-notes
$HF init project --non-interactive --example=blank && python3 $K/hfkit.py init project
# 1. one data JSON per scene, then a component per scene (copy proof/build_proof.py as the pattern)
python3 $K/hfkit.py build tabplayer --id truth-tab --data data/truth-tab.json --out project/compositions/truth-tab.html
# 2. the root: scene hosts and narration tracks at their times
python3 $K/hfkit.py root data/root.json project/index.html
python3 $K/hfkit.py vtt captions.vtt vo/l01.words.json@0.55 vo/l02.words.json@7.6
# 3. check and look (cheap), then render once (under the lock)
(cd project && $HF check && $HF snapshot --at 3,11,20)
$K/render_chapter.sh project chapter.mp4
python3 $K/finish.py chapter.mp4 qc/preview.mp4 --vtt captions.vtt        # listening copy only
python3 $K/sync_check.py qc/preview.mp4 <truth notes.csv> --song-at <root s> --t0 <song s> --from <s> --to <s>
```

Timing rules: lines start 0.35 to 0.6 s apart inside a paragraph and 0.8 to 1.2 s apart between paragraphs. A
scene lasts its lines plus its listening window plus 0.45 s for the exit. A scene's own audio starts 0.5 to 0.7 s
after the scene does, so the picture is settled first.

### 6.4 Component data (the JSON each `build` takes)

Every component takes `duration` (seconds, the host's slot). Media are listed under `media` and written as static
tags, because HyperFrames reads media attributes before any script runs:
`{"slot", "tag": "audio" | "video", "src", "start", "duration", "media_start"?, "volume"?, "group"?, "automation": [[t, gain], ...]}`
where `automation` times are seconds from that media element's own start.

- **title**: `eyebrow`, `title_lines` (one or two), `subtitle` (the finding), `meta`, `stamp {k, v, s}`, `static_first` (film only).
- **lowerthird**: `kind` (`source` or `tool`), `eyebrow`, `name`, `meta`, `result {label, value, at}`, `t_in`.
- **clipoverlay**: `well {x, y, w, h}`, `video {start}`, media slot `video`, `push`, `overlay {fps, frame_w, frame_h,
  crop_x, crop_y, crop_w, crop_h, frames, scores}` where `frames[i]` is 42 numbers (21 normalised x, y pairs) or
  null, `tag`, `panel {eyebrow, name, meta}`, `source`. Today it draws the 21-point hand. For boxes or fretboard
  lines add a kind to `draw()` the same way.
- **tabplayer**: `kind` (`truth` or `tool`), `strip {tiles [{src, x, w}], width, height, beats, bars, staff_y,
  staff_h}` straight from the tabstrip JSON, `sheet {x, y, w, h, cursor}`, `audio {start, song_at_start}`, media slot
  `audio`, `header {chip, title, facts}`, `note`, `credit`, `highlight_w`. Always put the tuning and capo in `facts`:
  alphaTab's horizontal strip marks a capo but never the tuning.
- **pianoroll**: `panel`, `window {t0, t1, pmin, pmax}`, `notes` from `pianoroll_data.py`, `open_strings` (the
  recording's tuning as MIDI numbers), `audio`, media slot `audio`, `tool {eyebrow, name, meta}`, `legend`, `cues
  {matched, missed, extra}` (scene times, from the words file), `summary {at, html}`, `source`.
- **barchart**: `mode` (`verdict` or `value`), `truth_notes`, `rows [{name, meta, found, missed, extra} or {name,
  meta, value, color}, label, sublabel]`, `eyebrow`, `title`, `subtitle`, `source`, `top`, `row_h`.

Producing the data:

```bash
# a tab (truth or a tool's tab file) -> strip PNG, beat map, MIDI
node /home/user/gtv/production/kit/tools/tabstrip/tabstrip.cjs song.gp5 data/truth-tab '{"scale":3.0}'
python3 /home/user/gtv/production/kit/tools/tab_align_check.py data/truth-tab          # must print about 0 px
# hear that tab exactly as drawn
fluidsynth -ni -q -F data/truth-tab.wav -r 48000 -g 0.5 /usr/share/sounds/sf2/FluidR3_GM.sf2 data/truth-tab.mid
python3 /home/user/gtv/production/kit/tools/level.py data/truth-tab.wav project/assets/audio/truth-tab.wav --lufs -19 --ss 2.0 --t 12
# truth notes against a tool's notes
/home/user/gtr/eval/venv/bin/python /home/user/gtv/production/kit/tools/pianoroll_data.py truth.csv tool.mid data/roll.json \
  --t0 2.0 --t1 11.8 --tool-name "Basic Pitch" --midi data/roll-tool.mid
# a footage excerpt: only the seconds used, a keyframe every second
ffmpeg -ss 202 -t 9 -i source.mp4 -c:v libx264 -preset slow -crf 17 -g 30 -keyint_min 30 -pix_fmt yuv420p \
  -af "volume=XdB" -c:a aac -b:a 192k -movflags +faststart project/assets/video/clip.mp4
```

### 6.5 Rules learned building the proof

- Draw data-driven frames with `HFK.driver(tl, 0, duration, draw)`. GSAP calls it on every seek, so overlays,
  cursors and counters are exact on every frame. Never use `requestAnimationFrame`, clocks or `Math.random`.
- Media tags and images must be in the HTML before scripts run. Components get them from `hfkit.py build`.
- Media `data-start` inside a component is local to that component. `hyperframes lint` warns
  `nested_media_start_basis_ambiguous` about it. That warning is expected.
- Give every id the component id as a prefix (the builder does). Style a component through
  `[data-composition-id="<id>"]`.
- A media slot's `duration` must not exceed the file (HyperFrames shortens it and warns).
- The film's first frame is the finished title card. Every later scene fades in from the bench.
- AAC adds about 1 dB of peak. `finish.py` limits below the ceiling and measures after the encode.
- Keep alphaTab's "♪ alphaTab.net" credit in the strip images. Never crop it out of a tile.

### 6.6 Joining, captions and loudness

```bash
python3 /home/user/gtv/production/kit/tools/join.py /home/user/gtv/production/film \
  /home/user/gtv/production/chapters/ch00-* /home/user/gtv/production/chapters/ch01-* ...
```

The video is stream-copied (every chapter comes from the same renderer settings), the sound is decoded and
mastered once over the whole film: -16 LUFS integrated, true peak at most -1.5 dBTP after AAC, the same level as
the evening television series (-16.5). Captions are offset by each chapter's measured length into `film.vtt`, and
`chapters.vtt` gets one cue per chapter title. Outputs: `film.mp4` (AAC 256 kb/s, no in-band captions), `film.vtt`,
`chapters.vtt`. The joiner took 17.8 s for 79 s, so about 7 minutes for 30 minutes of film and 14 for 60.

Delivery to the site follows `EMBED.md` (the `<ao-shots>` block, paths, bitrate, the 2 GB file limit of
`media:push`, the poster and chapter stills). The renderer's own output is H.264 High@4.0, yuv420p, about 2.0 Mb/s
for these mostly flat frames: a 30 minute film is about 500 MB and a 60 minute one about 1 GB, both well under the
limit. If `EMBED.md`'s encode settings differ (bitrate floor, colour tags), re-encode `film_raw.mov` once at the end
rather than changing the chapter renders.

### 6.7 Render time and the lock

- Rendering is CPU bound (software GL in Chrome plus x264). Three workers use this box fully, so **only one render
  runs at a time**. `render_chapter.sh` takes `/home/user/gtv/production/render.lock` with flock. Snapshots and
  checks are light and need no lock, so iterate with `hyperframes snapshot --at ...`, not with renders.
- Budget: 1.15 s per second measured, up to about 2 s per second for scenes with several clips. A 30 minute film is
  about 35 to 60 minutes of rendering. A 60 minute film about 70 to 120. Add one re-render of every chapter after
  review. With a dozen agents sharing the queue, plan the renders in the order chapters finish.
- Disk: 8.1 GB free now. Footage excerpts about 5 MB per 10 s, chapter renders about 16 MB a minute. HyperFrames
  caches extracted frames in `/tmp/hyperframes-extract-cache-0` (27 MB after the proof); `hyperframes clean` empties
  what is idle. Keep 3 GB free and delete intermediates (`renders/*.mp4` that were superseded) as you go.

### 6.8 RunPod

**Not needed for a 30 minute film.** The renderer is CPU bound, so a GPU pod does not help (HyperFrames' `--gpu`
only speeds the encode). A CPU pod would only pay off for a full re-render of a 60 minute film or a long queue.

From the Runpod catalog read today (`list-cpu-types`, secure cloud, availability HIGH): **cpu5c Compute-Optimized,
$0.035 per vCPU-hour, 32 vCPU = $1.12 an hour** with 64 GB (EU-RO-1, EUR-IS-1), or cpu3c at $0.030 per vCPU-hour,
32 vCPU = $0.96 an hour in 13 data centres. A 32 vCPU pod would run about eight chapter renders at once (3 to 4 vCPU
each), so a 60 minute film renders in about 10 to 20 minutes plus 20 to 30 minutes of setup: under $1.50.

How: create one CPU pod (`create-pod` with `cpu: {id: "cpu5c", vcpuCount: 32}`) from an Ubuntu image, install Node
22, ffmpeg, `hyperframes@0.9.91` and a chrome-headless-shell, move the chapter `project/` folders over with
runpodctl (`send` and `receive`) or through R2, run `render_chapter.sh` per chapter with `xargs -P 8` and no lock,
bring the `chapter.mp4` files back, then delete the pod. Use it only if the queue on this box passes about 2 hours.

### 6.9 Higgsfield

Not used. Nothing in this film should be generated imagery of people playing: every frame of guitar footage comes
from the three recordings or the research clips, and every graphic is drawn from measured data.

## 7. Licensing notes that matter for specific choices

- **alphaTab asks for its credit to stay visible.** Its 1.9.0 docs: "Do not hide, cover, crop or remove it without
  our permission" (alphatab.net/docs/attribution). Songs over 10 bars carry "♪ alphaTab.net" in the strip, which
  the tab player only shows while that part of the strip passes. So every tab player also prints "tab drawn by
  alphaTab 1.9.0 · alphaTab.net" under the sheet the whole time, and the film's end credits name it.
- R3b is CC0 (no credit required). It is credited on screen anyway. GuitarSet clips are CC BY 4.0 and need their
  credit line if used. FluidR3_GM is MIT. The fonts are OFL.
- The narrator is a voice from the ElevenLabs library used through the account's own plan.

## 8. Files

| Path | What |
|---|---|
| `/home/user/gtv/production/proof.mp4`, `proof.vtt` | the proof scene and its captions |
| `/home/user/gtv/production/proof/` | the proof project: `build_proof.py`, `index.html`, `compositions/`, `assets/`, `data/`, render logs |
| `/home/user/gtv/production/proof-data/` | hand landmarks, the comparison JSON, the tool's MIDI and audio, the four narration lines |
| `/home/user/gtv/production/kit/` | the kit (section 3.1) |
| `/home/user/gtv/production/charttest/` | a one-scene project that renders the verdict bar chart (`chart.mp4`) |
| `/home/user/gtv/production/voice/` | the account read (`account.json`), every candidate take with its words and settings |
| `/home/user/gtv/production/voice-mike.mp3`, `voice-jamie.mp3`, `voice-owen.mp3` | the three candidates |
| `/home/user/gtv/production/bar/` | frames pulled from the evening television lessons |
| `/home/user/gtv/production/frames/` | reference frames of the proof and the chart |
