export const meta = {
  name: 'gtv-scout',
  description: 'Guitar tab video, stage 1: find three real recordings with video and known tablature (capo, unusual tuning, neither), and scout the production pipeline, the experiment matrix and the way to publish a long film on the post',
  phases: [
    { title: 'Scout', detail: 'three song scouts by source type, production, tools and embed scouts (Opus 5.5, max)' },
    { title: 'Select', detail: 'song-selector verifies the candidates and picks the three (Opus 5.5, max)' },
  ],
}

const OPUS = 'claude-opus-5-5'
const GTV = '/home/user/gtv'
const REC = '/home/user/blog/docs/guitar-tab-research/video'
const RES = '/home/user/blog/docs/guitar-tab-research'

const COMMON = `THE JOB (read this first)
Aaron Orelup (aaronorelup.com) has a published blog post, "Testing the tools a guitar tab web app would need" (id AO-082, file /home/user/blog/src/content/posts/guitar-tab-tools.md, live at https://aaronorelup.com/ledger/guitar-tab-tools/ ). Behind it is a research folder, ${RES} (README.md first: ten "lanes", each with trials.md, survey.md, tools.json. HANDOFFS.md maps every tool by stage).
He now wants a VIDEO for the top of that post, about 30 minutes long (up to 60 if the findings earn it), that shows the current state of having AI turn a video of a person playing guitar into a finished tablature on its own, using the tools that already exist. In his words: apply everything and show what it looks like and the results from each tool, so the viewer gets the best understanding of the current state, because "we want to know which tools to give our AI to help it do this task and which ones actually make the output work".
The plan he set:
- Pick three real, high-quality recordings of a full song played on guitar that each have a video and a tablature to use as ground truth: one played with a CAPO, one in an UNUSUAL TUNING, one with NEITHER.
- Apply each technique from the post to them (the whole song or a short segment, as fits the experiment) and compare with the truth. Where the truth settles it, the video says so. Where it is a matter of judgement, the viewer judges: so whenever a tab is shown, part of it is also PLAYED so it can be heard.
- At the end, an Opus 5.5 session tries to recreate each tab from the video alone with the answer hidden: once with the chosen tools, once without them.
- It must look and sound very good. His quality bar for effort and polish is his own series "I Love My Evening Television" (files under /home/user/blog/public/courses/i-love-my-evening-television/ ). That is a reference for the level of care only: this video is separate and must NOT imitate that series.
- Voice is free to choose. ElevenLabs, Higgsfield and RunPod may be used (keys come from: python3 ~/.claude/bin/getkey.py NAME, inside a script, never printed. Names available include ELEVENLABS_API_KEY and RUNPOD_API_KEY).
- Licensing is not a concern for this video unless something is notable for a specific choice. Then say so.
- Aaron has pre-approved everything this job needs. Do not stop to ask for permission. If this box's permission system refuses a step, do not work around it: note what was refused and take another route.

HOW THIS IS RUN
An orchestrator runs stages of agents like you. You are one scout in stage 1. Heavy files (video, audio, models, renders) go under ${GTV}/ . Written records go under ${REC}/ (in the repo, public: no audio or video there, no file over 300 KB, no key, nothing personal about Aaron). Touch nothing else in /home/user/blog and run no git command that changes state.
THE BOX: 4 vCPU, 15 GB of memory, no graphics card, Ubuntu 24.04, about 8 GB of free disk that cannot grow. Check df -h / before any download or install, keep at least 3 GB free, delete what you no longer need, and run uv cache prune if space runs short. ffmpeg, fluidsynth (with /usr/share/sounds/sf2/FluidR3_GM.sf2), node 22, uv and Playwright's Chromium are installed. Outbound HTTPS is open. github.com web pages answer 403 here: use raw.githubusercontent.com, git clone, or a fetch tool. Long transfers through the proxy can stall: use curl -C - with --speed-limit and --speed-time in a retry loop.
MODELS: if you start a helper agent, give it the model opus or sonnet explicitly. Never start anything on Fable.
YOUR FINAL MESSAGE goes to the orchestrator, whose reading budget is small: AT MOST 12 LINES, facts only, with the path of the file that holds the detail.`

const SONG_RULES = `WHAT A GOOD CANDIDATE IS
1. A real recording of ONE person playing a whole piece on guitar (steel-string or nylon acoustic preferred, clean electric acceptable), about 1.5 to 5 minutes, clean audio.
2. A VIDEO of that same performance in which the fretting hand and the fretboard are clearly visible for most of the piece, and ideally the picking hand too. 1080p preferred, 720p the minimum. A steady camera. No tab drawn on screen over the hands (a tab strip that can be cropped away is acceptable: say where it sits).
3. A TABLATURE that can serve as ground truth for that exact performance: published by the performer or arranger, or a dataset's annotation. Machine-readable is strongly preferred (Guitar Pro .gp, .gpx, .gp5, MusicXML with a TAB staff, a MIDI file with string information, a dataset's note table). A PDF or text tab is a fallback. It must give the tuning and the capo. Check that it matches the performance: compare its first bars with the audio (pitch content, by ear-proxy tools such as a chromagram, or by reading the hand positions in a few frames) and say how you checked.
4. It can be DOWNLOADED from this box now: do the download for real (the video at its best quality and the tab file) into ${GTV}/candidates/<source-tag>/<short-id>/ and keep the files. yt-dlp can be installed with: uv tool install yt-dlp . YouTube may refuse this box with a bot check: try, and if it refuses, do not try to get around it. Use sources that answer (Wikimedia Commons, archive.org, Vimeo, performers' own sites, dataset hosts such as Zenodo or Hugging Face).
5. THE THREE SLOTS: (a) played with a capo, on any fret, visible in the video. (b) an unusual tuning: DADGAD, an open tuning, or anything further from standard (drop D alone is the weakest acceptable). (c) neither: standard tuning E A D G B E, no capo. A candidate is for one slot.
6. Wanted across the final three: different players, guitars and camera set-ups, and at least one fingerstyle piece. A very famous song is a small minus (a model may know its tab by heart): say how well known it is.
7. For each candidate record: title, performer, source page, licence or terms as stated there, the credit line to show, video resolution and length, what the camera shows, tuning, capo, the tab's format and who made it, how well the tab matches, and anything notable about rights (for example a major-label recording).`

const scout = (tag, where) => `[AGENT: song-scout-${tag}]

${COMMON}

YOUR JOB: find candidate recordings for the three slots, searching ONE kind of source: ${where}
${SONG_RULES}
Find the best candidates you can for EACH of the three slots (aim for two per slot, more is welcome), download them, and write ${REC}/candidates-${tag}.md with one section per candidate (the facts of rule 7 and the local file paths). Start by reading ${RES}/lanes/video-hands-fretboard/survey.md and ${RES}/lanes/guitar-tab/survey.md for the datasets and sources the research already found (search them for "dataset", "video" and "tab").
Your final message: the candidates per slot, one line each (slot, title, performer, source, resolution, tab format, downloaded yes or no), and the path of your record.`

const PRODUCTION = `[AGENT: production-scout]

${COMMON}

YOUR JOB: work out, and prove on this box, how the finished video will be made, and write it down so that a dozen other agents can build scenes the same way. Write ${REC}/PRODUCTION.md and put the proof files under ${GTV}/production/ .
1. THE BAR. Look at "I Love My Evening Television" (/home/user/blog/public/courses/i-love-my-evening-television/ : read its lesson pages and engine, probe two lesson videos with ffprobe, pull a few frames, measure loudness with ffmpeg's ebur128 filter). Describe in ten lines what its level of polish consists of (resolution, frame rate, pacing, how much moves on screen, the audio mix and its loudness, captions). That is the bar for care. Then define a DIFFERENT look for this video: a clear documentary and lab feel built from Aaron's own brand (read ~/agent-kit/skills/aaron-brand/SKILL.md in full and follow it: colours, type, tone). Write the style guide: palette with hex values, fonts and where their files are, title cards, lower thirds, how a tool's name and its result are labelled, how truth and a tool's output are coloured so they can be told apart at a glance (also for colour-blind viewers), safe margins, motion rules, 1920x1080 at 30 fps.
2. THE TOOLS FOR MAKING IT. Read the kit's video skills as files: ~/agent-kit/skills/hyperframes/SKILL.md first, then hyperframes-cli, hyperframes-core, hyperframes-animation, hyperframes-creative, hyperframes-audio, hyperframes-registry, media-use, general-video, and skim presentation and missing-map for how narrated pieces were made before. Install what they need here, and build ONE proof scene of 25 to 40 seconds at 1920x1080, 30 fps, that has every kind of shot the film needs: (a) a title card, (b) a real guitar video clip with an overlay drawn on it (use one of the research clips: a picture or a few seconds of any clip you can fetch again, or a synthetic stand-in), (c) a tablature that scrolls with a moving play cursor while its audio plays (alphaTab 1.9.0 rendered the tabs in the research: see ${RES}/lanes/web-tab-render/trials.md . The tab picture and the cursor must be in sync with the audio), (d) a piano-roll style comparison of "truth" notes against "tool" notes with matched, missed and extra notes in the three colours of your style guide, (e) narration over it, with a music-free bed or none. Render it to ${GTV}/production/proof.mp4 and measure: render time per second of video on this box, file size, loudness. If the kit's renderer cannot do a kind of shot, say so and give the working alternative you used (for example frames drawn with Python and joined with ffmpeg).
3. THE VOICE. Use ElevenLabs for the narrator (read the key inside your script with the getkey line above. The ElevenLabs HTTP API works from here). List the models and a few fitting voices, make the same 20-second test line with three candidate voices (a calm, clear, warm narrator who sounds like a person explaining something they find interesting: not a trailer voice), save them as ${GTV}/production/voice-<name>.mp3, pick one and say why in one line, and record its voice id, model, settings, the credits a 4,500-word script would use, and the account's remaining credits. Also record how to get word timings back for captions.
4. THE BUILD PLAN. From what you measured, write how the full film gets built: one folder per chapter under ${GTV}/production/chapters/, what a chapter-building agent is given (script lines, audio files, experiment artifacts) and must deliver (a rendered 1080p30 chapter mp4 with its narration and sound mixed, plus a captions .vtt), the shared components to reuse (give their paths: the tab player with cursor, the piano-roll comparison, the video-with-overlay frame, the lower third, the chart styles), how chapters are joined, the loudness target, and how long the whole render should take here. Say whether a rented RunPod machine would be worth it for rendering, with its hourly price, and how.
Your final message: the look in two lines, the renderer and its measured speed, the voice chosen, and the path of PRODUCTION.md.`

const TOOLS = `[AGENT: tools-scout]

${COMMON}

YOUR JOB: turn the post's research into the EXPERIMENT MATRIX for the video, and check what can really run. Write ${REC}/EXPERIMENTS.md and ${REC}/experiments.json .
1. Read the post's eleven sections (the file above) and, for each lane, ${RES}/lanes/<lane>/tools.json and the parts of trials.md you need, plus ${RES}/HANDOFFS.md sections 2 to 5 and ${RES}/FOR_AARON.md (what could not run on the box and why).
2. For each STEP of the job the video is about (a guitar video in, a finished tab out), choose the techniques the film should show, so that a viewer sees the real spread of what exists: the tools that ran in the research, and the ones worth adding now that a rented GPU is allowed. The steps: pulling the guitar out of a mix, and whether separation does anything useful on a solo guitar. Sound to notes. Melody, bass and percussive taps from one guitar. Chords, beat, bars, tempo, key. Tuning and capo. Choosing the string and fret for each note. Reading the hands, the fretboard and the capo from the video. Putting sound and video together. Writing the tab file, drawing it and playing it back. Hosted services that do the whole thing in one call. For each technique give: the tool and version, what it takes in and gives out, the exact install and run commands the research used (copy them from trials.md with the run ids), its measured time on this box, whether it needs a GPU, a key or an account, and what the viewer would SEE and HEAR from it (for example: a piano roll over the truth, the transcribed notes played back with a guitar sound, a tab drawn and played, an overlay of hand landmarks on the video, a detected capo box).
3. Say which techniques cannot run on this box and why (the research recorded each refusal and each GPU need), and for the ones that matter most give the plan to run them on a rented RunPod machine: which image, how much disk and video memory, the commands, the expected minutes and the hourly price (read ~/agent-kit/skills/runpod-render/SKILL.md for how Aaron's pods are made and paid for. Do NOT create a pod: only plan it). Say which need an account or key that is not in the key store (list the key names with: python3 ~/.claude/bin/getkey.py --list ).
4. THE SCORING. The research's scoring tool is ${RES}/scripts/gtr-eval (its README says what each number means). Say what each experiment will be scored on against a ground truth made of timed notes with string and fret, beats, chords, tuning and capo, and what the truth files must contain for that (their exact format, as gtr-eval reads it).
5. THE TOOLKIT FOR THE LAST CHAPTER. Propose the set of tools that an Opus 5.5 session should be handed for its attempt "with tools" (installed and documented in one folder), from what the research measured, and say in one line each why it is in.
6. Check the disk (df -h /) and say what the full set of installs needs, in GB, and what order to install and delete in.
Keep EXPERIMENTS.md to what an agent needs to act on: tables, commands, no essays. experiments.json: [{"id", "step", "tool", "version", "runs_on": "box" | "runpod" | "api" | "not possible", "needs", "install", "run", "inputs", "outputs", "score_with", "viewer_sees", "viewer_hears", "minutes_per_song"}].
Your final message: how many techniques per step, how many run on the box, on a rented GPU, through an API, and not at all, the disk needed, and the path of EXPERIMENTS.md.`

const EMBED = `[AGENT: embed-scout]

${COMMON}

YOUR JOB: work out exactly how a 30 to 60 minute film is put at the TOP of the post and published, by this site's own rules, and write ${REC}/EMBED.md . Change nothing in the repo outside ${REC}/ .
Read /home/user/blog/CLAUDE.md, WRITING.md, PREVIEWS.md, docs/MEDIA.md, docs/COMPONENTS.md (find the component made for a film or long video: its markup, captions track, chapters, poster) and how an existing post does it (the post "a-film-of-mit-s-ai-weight-editing-experiments-from-the-ai-s-side" has a film of about 1 GB with chapter pictures: read its file under src/content/posts/ and list its media under public/media/ and in src/data/media-manifest.json ). Then write:
1. The exact markup to put at the top of AO-082, with every attribute, and where in the file it goes (the post's first lines are a hover card in front matter, then the opening paragraphs: say what the site's rules allow above the opening text and what the checker enforces).
2. Every file the film needs and its rules: the video file (codec, container, resolution, bitrate that the site's players and phones handle, the size other films use, "faststart"), the poster, chapter pictures and their sizes, the captions file format, the hover card's still and loop if a post with a film gets one, any limits in src/data/limits.js.
3. How the video gets to the site: npm run media:push (what it reads, how it uploads, whether one upload of 1 to 2 GB has been done before, how long it took if any record says), the manifest, then the landing steps from CLAUDE.md (check, build, test, rebase, push main, version.json, media:verify).
4. What else on the site reacts to a film on a listed post (the read-aloud, the Ask index, the search index, the share card), and whether the post's text should change (for example one line that says the film exists and how long it is). The post's voice rules apply to any new line.
5. Where the film's originals must also be filed (read ~/agent-kit/skills/studio-library/SKILL.md : the studio push command and what the NOTES.md needs).
Your final message: the component's name, the video file's target format and size, and the path of EMBED.md.`

const SELECT = (reports) => `[AGENT: song-selector]

${COMMON}

YOUR JOB: three scouts searched different kinds of sources for recordings that fit the three slots (capo, unusual tuning, neither). Their records are ${REC}/candidates-datasets.md, ${REC}/candidates-creators.md and ${REC}/candidates-archives.md, and their downloads are under ${GTV}/candidates/ . Verify the best candidates yourself and PICK the three recordings the film will use, plus one backup per slot.
${SONG_RULES}
For each finalist: check the files are whole (ffprobe the video: resolution, frame rate, length, audio. Open the tab file with a parser such as PyGuitarPro or music21 in a uv venv and read its tuning, capo, tempo, bar count and note count). Pull six frames across the video and LOOK at them: are the fretting hand and fretboard clearly visible, is a capo visible when the tab says there is one, is anything drawn over the hands. Check that the tab matches the performance: synthesize the tab's first 20 to 30 seconds (FluidSynth) and compare with the recording's audio (a chromagram correlation after aligning, and the note count per bar), and say what you found in numbers. Prefer, in this order: a trustworthy tab that matches, a clear video, clean audio, variety across the three, low fame.
If a slot has no candidate that passes, search for one yourself (any kind of source) before settling for the weakest.
Then: copy each chosen recording to ${GTV}/songs/<slot>/ as video.<ext> and tab.<ext> (slot is capo, tuning or standard), extract audio.wav (44.1 kHz stereo) beside it, and write ${REC}/SONGS.md (for each of the three and each backup: every fact of rule 7, the checks you ran with their numbers, the credit line, anything notable about rights, and what part of the piece would make the best 20 to 40 second segment for short experiments, as start and end times) and ${REC}/songs.json with the same facts.

The scouts' closing messages:
${reports}

THIS BOX RESTARTS WITHOUT WARNING, about every 80 minutes, and a restart kills you. A copy of you was already cut off twice: the last one at 01:27 UTC on 2026-11-25, about nine minutes in. It left files under ${GTV}/candidates/_selector/ (frames of three finalists, an Odysee lookup) and ${GTV}/candidates/archive-gaps/ (a video it fetched itself). So:
- First read ${GTV}/candidates/_selector/PROGRESS.md if it exists, and look at what is in that folder, and continue from there. Never redo a finished check.
- Keep ${GTV}/candidates/_selector/PROGRESS.md up to date: after every finished check or decision, append what you did, the numbers, and what comes next. Write it so that a new copy of you can carry on with no other memory.
- Be done within about 45 minutes. Decide with the checks you can afford in that time: do not search for more candidates for longer than 10 minutes in all. Write SONGS.md and songs.json as soon as the three picks are fixed, and copy the files then. Refine afterwards if time is left.
WHAT ELSE TO WEIGH (from the orchestrator, who has read the three scouts' reports)
- The truth must end up as TIMED notes with string and fret for the stretch of the piece the film scores. A tab with rhythm (a Guitar Pro file, MusicXML, a dataset's note table, or a Guitar Pro tab that scrolls on screen with a cursor) is worth much more than a handwritten tab with no rhythm. A tab that is only on screen is acceptable if it is legible in the frames (it will be read off the frames and checked against the audio): say how legible it is and at what pixel size.
- Tools and the blind Opus session must NOT see the answer: when a tab, chord names or a title are drawn in the video, give the exact rectangle of the picture that shows only the player and the guitar (x, y, width, height in pixels, and the size left after cropping), and say whether the hands, the fretboard and the capo are still whole inside it.
- Three different players are better than one player three times, but not at the cost of a worse truth. Say plainly what was traded.
- Rights: Aaron said not to worry unless something is notable. A cover of a major-label pop song is notable (the composition is not the performer's). Prefer the performer's own pieces, traditional or public-domain music when the quality is equal, and say in SONGS.md what is notable for each pick.
- songs.json must give, for each pick: slot, id, title, performer, credit line, source url, licence as stated, the local paths of video, tab and audio.wav, fps, width, height, duration_s, tuning (names low to high and MIDI numbers), capo, tab format and what it contains (rhythm yes or no, strings and frets yes or no), the crop rectangle if one is needed, the best 30 second segment (start_s, end_s) and why, and how well known the piece is.

Your final message: the three picks, one line each (slot, title, performer, tuning, capo, resolution, length, tab format, how well the tab matches), the backups in one line, and anything notable about rights.`

const o = (label, ph) => ({ label, phase: ph, model: OPUS, effort: 'max', agentType: 'general-purpose' })

phase('Scout')
const side = parallel([
  () => agent(PRODUCTION, o('production-scout', 'Scout')),
  () => agent(TOOLS, o('tools-scout', 'Scout')),
  () => agent(EMBED, o('embed-scout', 'Scout')),
])
const scouts = await parallel([
  () => agent(scout('datasets', 'research DATASETS and papers that come with video and a note-level or tablature annotation (for example GAPS, Guitar-TECHS and whatever else exists: check each one\'s files for whether it really has video, tablature with string and fret, a capo, an unusual tuning), on their hosts (Zenodo, Hugging Face, university pages).'), o('song-scout-datasets', 'Scout')),
  () => agent(scout('creators', 'PERFORMERS AND ARRANGERS who publish their own tablature next to their own performance video: fingerstyle and classical players with free tabs or Guitar Pro files on their sites (for example Bradford Werner\'s This Is Classical Guitar editions with their lesson videos), tab sites that carry a tab made by the performer, and channels on video hosts that this box can download from.'), o('song-scout-creators', 'Scout')),
  () => agent(scout('archives', 'OPEN ARCHIVES AND OPEN-LICENSED VIDEO: Wikimedia Commons, archive.org (for example taught guitar lessons that come with tab booklets), Vimeo and YouTube uploads under a Creative Commons licence, and public-domain pieces whose tab editions are free (Mutopia, classtab.org, free-scores), paired with a performance video of that same edition.'), o('song-scout-archives', 'Scout')),
])
phase('Select')
const reports = scouts.map((r, i) => `--- scout ${['datasets', 'creators', 'archives'][i]} ---\n${r || '(no closing message: read its record file if it exists)'}`).join('\n')
const selected = await agent(SELECT(reports), o('song-selector', 'Select'))
const [production, tools, embed] = await side
return { selected, production, tools, embed }
