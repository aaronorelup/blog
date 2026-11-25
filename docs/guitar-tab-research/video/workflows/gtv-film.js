export const meta = {
  name: 'gtv-film',
  description: 'Guitar tab video, stages 4 to 6: the blind Opus 5.5 attempts with and without tools, the script, the voice, the chapters, the finished film and its publication at the top of AO-082',
  phases: [
    { title: 'Blind', detail: 'Opus 5.5 recreates each tab from the video alone, with the toolkit and without (Opus 5.5, max)' },
    { title: 'Score', detail: 'the blind answers scored against the truth, rendered, and the attempts audited (Opus 5.5, max)' },
    { title: 'Script', detail: 'the script, a fact check and a viewer read, a fix pass, then the voice and the missing scene components (Opus 5.5)' },
    { title: 'Chapters', detail: 'one builder per chapter, an independent reviewer, a fix pass (Opus 5.5)' },
    { title: 'Finish', detail: 'join, master, poster and stills, then an independent check of the whole film (Opus 5.5, max)' },
    { title: 'Publish', detail: 'studio library, the post edit, landing on main and the live checks (Opus 5.5, max)' },
  ],
}

// One part per workflow run: args.part is blind (with args.lane x or y), score, script, chapters (with args.chapters), polish (with args.items, args.wide), kitfix, voicefix, finish or publish.
const OPUS = 'claude-opus-5-5'
const GTV = '/home/user/gtv'
const REC = '/home/user/blog/docs/guitar-tab-research/video'
const RES = '/home/user/blog/docs/guitar-tab-research'
const PROD = GTV + '/production'
const PART = (args && args.part) || 'none'

const COMMON = `THE JOB (read this first)
Aaron Orelup (aaronorelup.com) has a published post, "Testing the tools a guitar tab web app would need" (AO-082, /home/user/blog/src/content/posts/guitar-tab-tools.md, research folder ${RES}). He asked for a FILM at the top of that post. His words: "make a 30 minute long video where you apply everything and show what it looks like and the results from each tool so that the reader can get the best understanding of the current state ... at the quality of my I Love My Evening Television series, but this is completely separate and should not try to imitate it, that's just a reference for how much effort you should put into it to make it look and sound good ... Let the watching judge for themselves when it is a matter of judgement, otherwise since you have the ground truth you can tell them. At the end ... have an Opus 5.5 session try to recreate the tab from the video with the answer hidden and see how close it can get with using the different techniques and its own judgement ... also let it try without the tool. The finished video can be as long as an hour long, but shoot for 30 minutes in the beginning and add to it when there are useful findings and good examples to show the viewer. When you make a tab, don't just show it, but play part of it so the listener can hear what it sounds like. Make it visually very pleasing and the audio high quality ... All of this is to show the current state of having AI do video of a person playing guitar to a finished tablature on its own using the tools that are already out there ... we want to know which tools to give our AI to help it do this task and which ones actually make the output work ... Once you are done, post it at the top of the blog post and push it live. You do not need to ask me permission for anything, you are preapproved."
Everything is pre-approved: do not stop to ask. If this box's permission system refuses a step, do not work around it: write down what was refused and take another route.

WHERE THINGS ARE
- Records (in the repo, PUBLIC): ${REC}/ . The three recordings: SONGS.md, songs.json. The experiments: EXPERIMENTS.md, RESULTS.md, results.json, results/step-*.md (each has a "For the film" section), results/audit-*.md, results/truth-doubts.md (where an answer key itself is in doubt: the film follows its readings), truth-<slot>.md and truth-<slot>-check.md. The blind test: BLIND.md, BLIND-RESULTS.md. The film's build manual: PRODUCTION.md. How it goes on the site: EMBED.md.
- Heavy files: ${GTV}/ (songs/<slot>/, truth/<slot>/, experiments/<slot>/<exp id>/, blind/, tools/, production/). Slots: capo, tuning, standard.
- The film's kit: ${PROD}/kit/ (PRODUCTION.md section 3.1). Chapters: ${PROD}/chapters/chNN-slug/ (PRODUCTION.md 6.2). One render at a time, under ${PROD}/render.lock (render_chapter.sh takes it).
- Written records go under ${REC}/ : no audio or video there, no file over 300 KB, no key, nothing personal about Aaron. Touch nothing else in /home/user/blog and run no git command that changes state there.

PRIVACY (hard rules)
- None of Aaron's own videos or recordings appear in the film or its records. Nothing at all from the earlier post AO-078 (guitar-tabs-from-video): no clip, no picture, no tab, no number. The film may say in one plain sentence that an earlier test found Opus sometimes did better without tools, nothing more.
- No person is named anywhere except the performers and tab authors listed in songs.json (credited as songs.json says).
- Never print a key, never write one to a file, a URL or a log: keys come from python3 ~/.claude/bin/getkey.py NAME inside a script.

THE BOX
4 vCPU, 15 GB of memory, no graphics card. Keep at least 3 GB of disk free (df -h /), delete superseded intermediates. Heavy analysis jobs go through /home/user/gtr/bin/gtr-run (source /home/user/gtr/env.sh first; ignore its "DISK LOW" notice). Renders only through render_chapter.sh. Long transfers can stall: use curl -C - with --speed-limit and --speed-time in a retry loop.

THE BOX CAN RESTART WITHOUT WARNING, and a restart kills you. A new copy of you then starts with this same prompt and no memory. So:
- Your work folder is ${GTV}/work/<your agent name>/ . FIRST read PROGRESS.md there if it exists, and continue from it. Never redo a finished step.
- After every finished step append to PROGRESS.md what was done, the numbers, the paths and what comes next. Put results at their final paths as soon as they exist. Make long jobs restartable.
KEEP YOUR OWN CONTEXT SMALL: send command output to log files and read only the lines you need, never print a whole JSON or CSV file, do not read a document twice, read only the sections that concern you.
HONESTY: every number you report must come from a file you can name. If something did not run or failed, say so with the error. Never fill a gap with a guess.
MODELS: if you start a helper agent, give it the model opus or sonnet explicitly. Never start anything on Fable.
YOUR FINAL MESSAGE goes to the orchestrator, whose reading budget is small: AT MOST 12 LINES, facts only, with the path of the file that holds the detail.`

// ---------- Stage 4: the blind attempts ----------
const ARM = {
  tools: `WHAT YOU MAY USE: only what ${GTV}/tools/kit/TOOLS.md allows ("What you may use, and nothing else"). Read it first. In short: the kit's tools in that folder (they run the environments they need by themselves), your own scripts run with the Python that TOOLS.md names, ffmpeg, ffprobe, FluidSynth, /home/user/gtr/bin/gtr-run for long computations, and /home/user/gtr/bin/gtr-eval ONLY to compare two files you made yourself (never its ledger command), plus your own judgement: look at frames you extract and at pictures you draw of the sound, and listen to renderings you make. Its selfcheck.sh renders your answer and compares it with the recording.`,
  bare: `WHAT YOU MAY USE: only what ${GTV}/tools/bare/BARE.md allows. Read it first. In short: the Python environment in ${GTV}/tools/bare/ (numpy, scipy, soundfile), ffmpeg and ffprobe, FluidSynth, PyGuitarPro, and the helper scripts in that folder (the answer checker and the Guitar Pro writer). No other Python environment, no music analysis or machine learning package, no trained model, no hosted service. You may write your own signal processing, draw your own pictures of the sound, and look at frames you extract.`,
}
const ARM_DIR = { tools: GTV + '/tools/kit', bare: GTV + '/tools/bare' }

const BLIND = (id, arm) => `[AGENT: blind-${id}-${arm}]

You are taking part in a measured test. Your task: write down the guitar tablature of the piece played in one video, as close as you can get to what the player actually plays, from the video alone.

THE INPUT: ${GTV}/blind/${id}/video.mp4 . One person plays one guitar, with sound and picture. Nothing else about it is given to you: not its title, the player, the tuning, or whether a capo is used. Find out what you need from the sound and the picture.

YOUR WORK FOLDER: ${GTV}/blind/${id}/${arm}/ . Create it, cd into it, and write only inside it.

${ARM[arm]}

WHAT YOU MAY NOT DO. This is what makes the test valid. Your whole transcript and every file access on this machine are audited afterwards, and any breach voids your attempt:
- Read, list or search anything outside your work folder, the video, and ${ARM_DIR[arm]} . Running the programs that ${arm === 'tools' ? 'TOOLS.md' : 'BARE.md'} names is allowed; opening, listing or searching their folders is not. In particular nothing else under ${GTV}/ (not the other folders under ${GTV}/blind/, not the rest of ${GTV}/tools/), nothing under /home/user/blog, /home/user/land, /home/user/gtr (apart from running what is named above), /root/.claude or /tmp/claude-0, no ledger or log of other jobs, no search over the whole disk (find / , grep -r /, locate), and no git command anywhere.
- Use the web in any way: no web search or fetch tool, no curl, wget or pip to the internet, no tab or chord site.
- Start helper agents.
- Recall instead of hearing: if you think you recognise the piece, do not use remembered tabs or chords. Write only what you hear and see, and say in HOW.md that you thought you recognised it and what you thought it was.

TIME: 90 minutes of wall-clock time from your first start, the same for every attempt. First: mkdir -p the work folder, cd into it, then: [ -f START ] || date +%s > START . Check the elapsed time often (echo $(( ($(date +%s) - $(cat START)) / 60 )) min). Have a first complete answer.json by 45 minutes and improve it after. At 75 minutes stop exploring and finish. If you are a new copy after a machine restart (START exists), read NOTES.md and carry on: the clock keeps running from START.

THE ANSWER: answer.json in your work folder, this object:
{"tuning_midi": [six MIDI numbers, lowest string first], "capo": <fret, 0 for none>, "tuning_offset_cents": <number>, "tempo_bpm": <number>, "key": "<tonic> major or <tonic> minor, like E minor or Bb major", "notes": [{"onset": <s>, "offset": <s>, "pitch": <MIDI number as it sounds>, "string": <1 to 6, 1 is the highest>, "fret": <counted from the capo>}], "beats": [<s>, ...], "downbeats": [<s>, ...], "chords": [{"start": <s>, "end": <s>, "label": "<Harte label like C:maj, A:min7, G:maj/3 or N>"}]}
Times are seconds on the video's own timeline. pitch must equal tuning_midi[6 - string] + capo + fret. Cover the whole piece, from its first note to its last.
Check it with the validate_answer.py in ${ARM_DIR[arm]} until it passes. Then write answer.gp5 with answer2gp5.py from the same folder, and HOW.md (under 60 lines): what you did in order, which tools or methods you used and what each told you, what you decided by your own judgement and why, how sure you are of each part (tuning, capo, notes, strings and frets, rhythm, chords), and what you would do with more time.
Keep NOTES.md in the work folder as you go (what is done, what you decided, what comes next).

YOUR FINAL MESSAGE (at most 8 lines): the tuning, the capo, the number of notes, the minutes used, and what you are least sure of.`

const SCORE = `[AGENT: blind-scorer]

${COMMON}

YOUR JOB: score the blind test. Six attempts: for each blind id b1, b2, b3 an Opus 5.5 session wrote ${GTV}/blind/<id>/tools/answer.json (with the toolkit of ${GTV}/tools/kit/) and ${GTV}/blind/<id>/bare/answer.json (without tools). The mapping from blind id to song is ONLY in ${GTV}/truth/blind-map.json . Read ${REC}/BLIND.md (the protocol and how answers are scored) and the step-09 record ${REC}/results/step-09-tabs-and-chains.md (how the finished tabs of the chains were scored: use exactly the same commands and the same scope, so that the blind answers and the six chains sit in one table).
1. For each attempt: did it finish (answer.json valid by validate_answer.py, answer.gp5, HOW.md), the minutes used (START to the last write of answer.json), and its scores against the truth with gtr-eval: tab, notes, beats, chords, tuning (and key). Put the outputs in ${GTV}/blind/<id>/<arm>/score/ with score.sh.
2. Make each answer showable and playable: its tab strip with the production kit's tabstrip tool (PRODUCTION.md 6.4) from answer.gp5, its render through FluidSynth with the same SoundFont and program as the truth's render, and a truth-against-answer piano roll JSON with pianoroll_data.py for the best 20 second stretch and the worst. Paths in ${GTV}/blind/<id>/<arm>/film/ .
3. Read each HOW.md and summarise in two lines per attempt what it did and what it decided by judgement.
4. Write ${REC}/BLIND-RESULTS.md (under 250 lines): per song a table of both arms next to the six chains of step 9 and the truth (tuning, capo, the main tab score, note F1, string and fret right, beat F, chord score); what each arm got right and wrong, with numbers; the time used; "For the film": per song the stretch (at most 20 s) that shows best where the two arms differ, the files to show and to play, and which points the truth settles and which are for the viewer's ear. Use the songs' slot names there (the film may name them). Also ${GTV}/blind/results.json with every number.
Your final message: per song one line with both arms' main scores next to the best chain's, and the record's path.`

const BLIND_AUDIT = `[AGENT: blind-auditor]

${COMMON}

YOUR JOB: audit the six blind attempts for breaches. Each attempt was an agent whose label is blind-<id>-<arm> (ids b1, b2, b3, arms tools and bare). Its rules: read only its work folder ${GTV}/blind/<id>/<arm>/ , its video ${GTV}/blind/<id>/video.mp4 and its arm's folder (${GTV}/tools/kit/ for tools, ${GTV}/tools/bare/ for bare; the tools arm may run the Python environments that the kit's wrappers name); no web at all; no helper agents; no git; nothing under /home/user/blog, /home/user/land, /home/user/gtr, /root/.claude, /tmp/claude-0, or anywhere else in ${GTV}/ ; the bare arm no MIR or machine learning package or model.
1. Find each attempt's transcript: the files agent-<id>.jsonl next to an agent-<id>.meta.json whose "description" is the label, under /root/.claude/projects/-home-user-blog/*/subagents/workflows/*/ . There may be more than one per label (a restart starts a new copy): audit all of them.
2. Go through every tool call in each transcript (write a script that lists them: tool name, command or path, never the whole file). Flag every path or command that leaves the allowed set, every web tool or internet call, every helper agent, every git command, every package install, and for the bare arm every import beyond numpy, scipy, soundfile, PyGuitarPro and the standard library. Flag any place where the attempt names the piece, the player or a remembered tab or chord chart.
3. Read the file-access log of the watch that ran during the attempts: ${GTV}/guard/access.log (every open or read of the answer folders while the attempts ran; its header says what was watched and when it started and stopped). For every line in the attempt window, find which process could have made it (the attempts' commands, or something else) and say so.
4. Write ${REC}/results/audit-blind.md (under 150 lines): what was checked, per attempt the counts (tool calls, commands, paths outside the allowed set: 0 or the list), and a verdict per attempt: valid, or void with the evidence.
Return: pass (true only if every attempt is valid), problems (one string per breach, starting with the label), and a two-line summary.`

const SCORE2 = `[AGENT: blind-scorer-r2]

${COMMON}

YOUR JOB: score round 2 of the blind test and make it the main result. Round 1 (ids b1, b2, b3) is scored already: ${REC}/BLIND-RESULTS.md , ${GTV}/blind/results.json , and per attempt ${GTV}/blind/<id>/<arm>/score/ (with its score.sh) and film/ . Its audit (${REC}/results/audit-blind.md) found the attempts valid, but the orchestrator's own task list had been attached to every round-1 attempt's context by the harness (13 to 18 times each): its entries named the performers and the three answer keys "capo", "tuning" and "standard". So round 1 was run again as round 2, with an empty task list: ids c1, c2, c3 (a new random order; the mapping is in ${GTV}/truth/blind-map.json under "round2"), the same videos, prompt, model, effort, time and kit.
1. Score the six round-2 attempts (${GTV}/blind/c<n>/<arm>/) EXACTLY as round 1 was scored: copy each round-1 score.sh, change only the paths, and run it. Same for the film files (film/: tab strip, render, labels, piano rolls of the best, worst and arms-differ 20 s; click tracks for the tuning song), and film_diff.json per id.
2. Rewrite ${REC}/BLIND-RESULTS.md (under 300 lines): round 2 is the result the film reports. Per song a table of round 2's two arms next to the six chains of step 9 and the truth, then round 1's two arms as a second run, marked "task list visible" with one sentence on what that means. Say where the two rounds agree and where they differ (tuning and capo answers, main score, note F1, time used), because two runs per arm also show how much one attempt varies. Keep the "For the film" section, now from round 2, with the files to show and play. Also rewrite ${GTV}/blind/results.json with both rounds (a "round" field on every row).
Your final message: per song one line with round 2's two main scores, round 1's two, and the best chain's; the record's path.`

const BLIND_AUDIT2 = `[AGENT: blind-auditor-r2]

${COMMON}

YOUR JOB: audit round 2 of the blind test exactly as round 1 was audited (read ${REC}/results/audit-blind.md first and reuse its scripts in ${GTV}/work/blind-auditor/). Round 2's attempts are the agents labelled blind-c1-tools, blind-c1-bare, blind-c2-tools, blind-c2-bare, blind-c3-tools and blind-c3-bare: work folders ${GTV}/blind/c<n>/<arm>/ , videos ${GTV}/blind/c<n>/video.mp4 . The same rules as round 1; the round-1 folders ${GTV}/blind/b<n>/ count as other attempts' files.
Check in addition, for every round-2 transcript: that NO attachment or reminder in its context names a performer, a song, the slots capo / tuning / standard, or the job's folders (round 1's problem was the orchestrator's task list attached as task_reminder; list every attachment type you find and what it held). The file-access log for round 2 is ${GTV}/guard/access-r2.log (and ${GTV}/guard/NOTE.md says which entries the orchestrator expects; verify, do not trust it).
Add a section "Round 2" to ${REC}/results/audit-blind.md (under 100 lines) with the same counts and a verdict per attempt.
Return: pass (true only if every round-2 attempt is valid and no attachment leaked), problems (one string each, starting with the label), and a two-line summary.`

// ---------- Stage 5: script, voice, components ----------
const SCRIPT = `[AGENT: script-writer]

${COMMON}

YOUR JOB: write the film. Read first: ${REC}/RESULTS.md, ${REC}/BLIND-RESULTS.md, ${REC}/results/audit-blind.md, the "For the film" sections of ${REC}/results/step-*.md, ${REC}/SONGS.md, ${REC}/truth-*.md (what each answer key is and how sure it is), ${REC}/results/truth-doubts.md (where a key is in doubt the film lets the viewer listen and does not grade the tool), ${REC}/PRODUCTION.md sections 1, 2, 5 and 6 (the look, the voice, the shots that exist, the timing rules), ${REC}/EMBED.md section 1 (chapter labels), and the post itself (its vocabulary, and so that the film does not contradict it; where the film's numbers differ from the post's, say why in the film).
THE STORY: a viewer who wants to give an AI tools to turn a guitar video into a finished tab should come away knowing, step by step, which tools' output was closest to the truth on these three recordings, what each costs, what still fails, and how close Opus 5.5 got on its own with and without the tools. Order: a cold open with one striking result heard and seen; the three recordings and how each answer key was made (and how sure it is); the job as a chain of steps; one chapter per step of the job with its best and worst tools shown and heard; the finished tabs (the chains); the blind test, both arms, heard against the original; what to give the AI, stated as measured on these recordings; credits.
THE FILM MUST SAY, plainly and once each, where it belongs (from ${REC}/BLIND.md section 7 and ${REC}/results/audit-blind.md):
- The blind test's result is round 2. Round 1 ran first with the same videos, prompt, model, time and kit, but the harness had shown its attempts the orchestrator's to-do list, which named the answer keys "capo", "tuning" and "standard"; so it was run again with an empty list. Round 1 is shown as a second run, which also shows how much one attempt varies.
- The kit was picked, and its accuracy measured, on these same three recordings. That favours the kit arm.
- The attempts were told which tools they could use, but the session did not take the other tools away; the audits found they used none of them.
- Where an answer key itself is in doubt (results/truth-doubts.md, e.g. the tuning song's beat phase), the viewer listens and the film does not grade.
- One plain sentence may say that an earlier test found Opus sometimes did better without tools; here the kit arm did better on every song in both rounds. Nothing else from that earlier test.
LENGTH: aim for 30 to 40 minutes. Go longer (up to 60) only where a chapter has more findings and examples worth showing. About 3,200 to 4,600 narrated words at the narrator's 164 words a minute, plus listening windows.
RULES
- Every tab or set of notes on screen is also heard: at least 4 s alone with its cursor, truth first, then the tool through the same SoundFont and program, the same bars. Never narrate over a listening window. Also let the viewer hear the original recording often.
- Where the truth settles it, the narrator states the number. Where it is a matter of judgement (how a render sounds, whether an overlay follows the hand), the narrator sets it up and lets the viewer judge, without telling them what to think.
- Every tool is named with its version and the setting that matters. Every number on screen names its metric and comes from a named file (result.json, a step record, BLIND-RESULTS.md).
- Write the narration for the ear: short sentences, terms explained the first time (onset, F1, capo, tuning, string and fret assignment), numbers written as they are said ("zero point eight nine", "ninety notes"), tool names as they are said. A neutral documentary narrator: it is not Aaron and does not speak for him.
- Visual variety: every shot is drawn from real data or real footage (PRODUCTION.md 2.5 and 2.6). No generated imagery. Vary the shots across the film. List any shot the kit cannot draw yet.
- The credits name the performers and tab authors as songs.json credits them, with their links, alphaTab 1.9.0 (its credit must stay visible on every tab strip), the tools, the narrator voice (ElevenLabs, "Mike"), and that the film was made by Claude agents for aaronorelup.com.
WRITE
1. ${PROD}/SCRIPT.md: the film's title, its one-sentence finding, the chapter list with target lengths, then per chapter: its finding, its shots in order (component, data files with exact paths, which lines play over it, each listening window with what is heard and for how long), its narration lines numbered l01, l02 ... (1 to 4 sentences each).
2. Per chapter, ${PROD}/chapters/chNN-slug/brief.json and script.md as PRODUCTION.md 6.2 describes (ch00 is the cold open and title).
3. ${PROD}/KIT-NEEDS.md: every shot the kit's components (kit/components/) cannot draw yet, each with the data it takes, which chapters use it, and a sketch of the frame in words. Keep the list short: reuse and extend the six components where you can.
Your final message: the title, the chapters with their target lengths, the narrated word count, and the paths.`

const SCRIPT_FACTS = `[AGENT: script-factcheck]

${COMMON}

YOUR JOB: fact-check the film's script before it is voiced: ${PROD}/SCRIPT.md and every ${PROD}/chapters/*/script.md and brief.json. You did not write it.
1. Every number, said or on screen: find it in its source (result.json under ${GTV}/experiments/, ${REC}/RESULTS.md, ${REC}/BLIND-RESULTS.md, the step records) and compare. Write a script that lists them. Rounding as said is fine. A number with no source is a problem.
2. Every claim: does its source carry it? Is a truth-settled point stated with its number, and is a matter of judgement left to the viewer? Does the film contradict the post or the records anywhere? Does it say each point of the script-writer's list "THE FILM MUST SAY" (round 2 is the result and why round 1 was re-run; the kit was picked on these recordings; the tool list was not enforced; doubtful keys are listened to, not graded), and the blind numbers as round 2 of ${REC}/BLIND-RESULTS.md?
3. Every tool named with its version and the setting that matters. Every data file named in a brief exists.
4. The privacy rules above, and nothing that is not public.
Write ${REC}/results/script-factcheck.md (under 150 lines). Return: pass, problems (one string each: chapter, line, what is wrong, the source, the fix), and a two-line summary.`

const SCRIPT_VIEWER = `[AGENT: script-viewer]

${COMMON}

YOUR JOB: read the film's script as its viewer will meet it: ${PROD}/SCRIPT.md and the ${PROD}/chapters/*/script.md files, together with ${REC}/PRODUCTION.md sections 1 and 2. You are someone who plays guitar and is curious about AI, but knows nothing about music information retrieval. You did not write it.
Flag: any term used before it is explained; any stretch over about 90 seconds with nothing new to see or hear; any tab or note list shown and not played, or played under narration; any place that tells the viewer what to think about a matter of judgement; any place where the main question (which tools to give an AI, and which ones make the output work) is lost; repetition; any chapter whose shots are all of one kind; anything that would look or sound cheap next to the bar in PRODUCTION.md section 1; length, if a chapter does not earn its minutes or a strong finding is rushed.
Write ${REC}/results/script-viewer.md (under 120 lines). Return: pass, problems (one string each: chapter, line or shot, what is wrong, the fix), and a two-line summary.`

const SCRIPT_FIX = (problems) => `[AGENT: script-fix]

${COMMON}

YOUR JOB: a fact checker and a viewer read the film's script (${PROD}/SCRIPT.md, ${PROD}/chapters/*/script.md and brief.json). Their reports: ${REC}/results/script-factcheck.md and ${REC}/results/script-viewer.md. Fix every problem at its source in the script files, keeping the rules of the script (every tab heard, judgement left to the viewer, numbers from named files). Where a reviewer is wrong, say why with evidence. Add a section "After review" to SCRIPT.md listing each change.
The problems:
${problems}
Your final message: the count of problems fixed and refused, the new narrated word count and target length.`

const VOICE = `[AGENT: voice]

${COMMON}

YOUR JOB: voice the whole film before any chapter is built (narration timing decides every chapter's length). Read ${REC}/PRODUCTION.md section 5 (the voice, the settings, tts.py, stt_check.py, level.py) and section 6.2. For every chapter in ${PROD}/chapters/ and every line in its script.md: render the line with tts.py (with its neighbours as previous and next text), run stt_check.py and retake a line above 5% word error (at most two retakes, then fix the spelling of the line for the ear and note it), level it with level.py to -17 LUFS mono, and put lNN.mp3, lNN.words.json, lNN.req.json and the levelled lNN.wav in that chapter's vo/ . Read the account's credits before and after. Stop and report if the job would pass 40,000 credits.
Write ${PROD}/VOICE.md: per chapter the lines, the narration seconds, the retakes, and the credits used in all.
Your final message: the line count, the narration minutes per chapter and in all, the credits used, and any line that failed.`

const KITX = `[AGENT: kit-extender]

${COMMON}

YOUR JOB: build the scene components the film's script needs and the kit lacks, before the chapter builders start. The list: ${PROD}/KIT-NEEDS.md . The kit: ${PROD}/kit/ (components, kit.css, kit.js, tools/hfkit.py). Read ${REC}/PRODUCTION.md sections 2, 3.1 and 6.3 to 6.5, and copy the patterns of the existing components (data JSON in, HFK.driver for anything drawn from data, the palette and type of section 2, the motion rules, nothing in the caption band).
For each new component: add it to kit/components/ and make hfkit.py build it; build a one-scene test project from real data of this job in ${PROD}/kittest/<component>/ ; run hyperframes check and a snapshot at three times; look at the frames yourself and fix what looks wrong; render it once under the lock to prove it renders. Extend an existing component instead of adding one where that is enough. Write each new component's data format into ${REC}/PRODUCTION.md section 6.4 (keep that section's style).
Your final message: per component one line (what it draws, its test frames), and anything not built.`

// ---------- Stage 5: chapters ----------
const CH_BUILD = (ch) => `[AGENT: build-${ch}]

${COMMON}

YOUR JOB: build chapter ${ch} of the film, from its brief to a finished render: ${PROD}/chapters/${ch}/ (brief.json, script.md, vo/ are given). Read ${REC}/PRODUCTION.md sections 2, 3.1 and 6 first (the look, the kit, the chapter folder, how a chapter agent builds, the data formats, the rules learned, render time and the lock), ${PROD}/SCRIPT.md for this chapter only, and ${PROD}/VOICE.md for its narration lengths.
1. Data: make every shot's data from the files the brief names (tab strips, beat maps and MIDI with tabstrip.cjs and tab_align_check.py, renders through FluidSynth with the truth's SoundFont and program, piano roll JSON with pianoroll_data.py, overlay frames, chart rows, footage excerpts cut to only the seconds used). Numbers on screen come from the files, never typed by hand.
2. Build the project with hfkit.py (build per scene, root, vtt) following the timing rules of 6.3 and the sound rules of 2.7: lines from their words files, every listening window heard alone, music ducked under narration, the scene's own audio starting after the picture settles. Captions show the script's spelling, not the respelling some lines were voiced with (${PROD}/VOICE.md lists them, e.g. "guitar F L" is captioned guitar-fl, "tut-tut" is tuttut). Other chapters are built at the same time by other agents: touch only your chapter's folder and your work folder, and never edit the shared kit (if a component is wrong for your chapter, work around it in your chapter and say so in qc/README.md).
3. Check and look before rendering: hyperframes check (no errors), snapshots at the middle of every shot and at every scene change. Look at every snapshot yourself and fix what is off: overlaps, text under 22 px, anything in the bottom 150 px, empty or crowded frames, a tab without its alphaTab credit, a tool without its version, a frame that is static for more than 3 s. Aim for the care of PRODUCTION.md section 1.
4. Render once with render_chapter.sh (it waits for the lock), then finish.py to qc/preview.mp4 with the captions, sync_check.py for every listening window (each within 20 ms), a contact sheet at the shot midpoints in qc/, loudness of the preview. Fix and re-render if a window is off.
5. Deliver chapter.mp4, captions.vtt and chapter.json, and qc/README.md (what was checked, the numbers).
Your final message: the chapter's length, its shots, the sync and loudness numbers, and anything that does not match the brief.`

const CH_REVIEW = (ch, again) => `[AGENT: ${again ? 're' : ''}review-${ch}]

${COMMON}

YOUR JOB: review the finished chapter ${ch} as an independent viewer and editor: ${PROD}/chapters/${ch}/ (chapter.mp4, captions.vtt, qc/, brief.json, script.md). You did not build it. Read ${REC}/PRODUCTION.md sections 1 and 2 (the bar and the look).
1. Look: pull frames every 2 seconds and around every scene change (ffmpeg into ${GTV}/work/<your name>/frames/), make contact sheets, and look at all of them. Flag what a careful viewer would notice: text overlapping or cut off, text too small to read, anything that matters in the bottom 150 px, a frame static for more than 3 s, jumps or flashes at scene changes, a tab strip without its alphaTab credit, a tool named without its version, a number on screen that differs from the script or its source file, ugly or crowded layouts, colours outside the palette.
2. Listen by measurement: loudness per scene (ffmpeg ebur128), that no narration plays during a listening window (the words files against the timeline), that music sits under the voice as section 2.7 says, no clicks, gaps or clipping (true peak), and the sync_check numbers in qc/.
3. Captions: every narration line has its cues, in time, two lines at most.
4. The privacy rules above.
Write ${PROD}/chapters/${ch}/qc/review${again ? '2' : ''}.md (under 100 lines). Return: pass (true only if nothing needs fixing), problems (one string each: the time, what is wrong, the fix), and a two-line summary.`

const CH_FIX = (ch, problems) => `[AGENT: fix-${ch}]

${COMMON}

YOUR JOB: a reviewer found problems in chapter ${ch} (${PROD}/chapters/${ch}/qc/review.md). Fix each one in the chapter's project (${PROD}/chapters/${ch}/project/ and its build script), check with snapshots, re-render once with render_chapter.sh, finish the preview, re-run sync_check, and update chapter.mp4, captions.vtt, chapter.json and qc/README.md. Read ${REC}/PRODUCTION.md section 6 for the tools. Where the reviewer is wrong, say why with evidence in qc/README.md.
The problems:
${problems}
Your final message: each problem in a few words with what you did, and the new length.`

// ---------- Stage 5b: polish (a second round on what the re-review left open) ----------
const RENDER_RULE = (ch) => `RENDERING (this went wrong in the first round: agents that ended their turn while their render waited for the lock had it killed, and chapters were left without a chapter.mp4). Do exactly this:
- From ${PROD}/chapters/${ch}/ : mkdir -p logs; setsid nohup bash ${PROD}/kit/tools/render_chapter.sh project chapter.new.mp4 > logs/render.out 2>&1 < /dev/null & echo $! > logs/render.pid
- Then wait in the foreground, one Bash call at a time with a 600000 ms timeout: timeout 580 tail --pid=$(cat logs/render.pid) -f /dev/null; tail -3 logs/render.out ; repeat until the process is gone. Renders queue behind each other (about 5 minutes each, several may be waiting), so a 30 to 60 minute wait is normal. Do not use Monitor, background waits or sleep, and never end your turn while a render you started is queued or running: your final message is your result and nobody will come back for the render.
- When it says exit=0: mv chapter.new.mp4 chapter.mp4 and mv chapter.new.mp4.log logs/chapter.mp4.log, then run the QC (finish.py to qc/preview.mp4 with the captions, sync_check.py for every listening window, the contact sheet, loudness and true peak of the preview, freeze detection). If it fails, read the log, fix, and render again the same way.
- Render once if you can: check everything with snapshots first. Keep 3 GB of disk free (df -h /): delete your own superseded renders and intermediates (old chapter copies, frame dumps) when you no longer need them.`

const POLISH_FIX = (ch, problems, round) => `[AGENT: polish${round}-${ch}]

${COMMON}

YOUR JOB: finish chapter ${ch} of the film so it can be joined: ${PROD}/chapters/${ch}/. It was built, reviewed, fixed and reviewed again; the problems below are what the last review left open (its notes: qc/review2.md, or qc/review.md; ${round > 1 ? 'qc/verify.md has the check after the first polish round' : 'the fix agent wrote qc/README.md'}). Read ${REC}/PRODUCTION.md sections 2 and 6 for the look and the tools, and the chapter's build script and qc/README.md before you change anything.
Fix every problem in the list, nits too where the fix is small. Where a problem is wrong, say why with evidence in qc/README.md rather than change the film. A problem that blames the shared kit: fix it inside this chapter (other chapters are rendered with the same kit; never edit ${PROD}/kit/). Touch only this chapter's folder and ${GTV}/work/polish-${ch}/. Captions keep the script's spelling (${PROD}/VOICE.md lists the respelt lines). Check every change with snapshots before rendering.

${RENDER_RULE(ch)}

Then update captions.vtt, chapter.json (its length) and qc/README.md (a "Polish round ${round}" section: each problem, what you did, the QC numbers).
The problems:
${problems}
Your final message: each problem in a few words with what you did, the new length, and the QC numbers (loudness, true peak, the sync of each window).`

const POLISH_VERIFY = (ch, problems, round) => `[AGENT: verify${round}-${ch}]

${COMMON}

YOUR JOB: check that chapter ${ch} (${PROD}/chapters/${ch}/) is ready to be joined into the film. You did not build or fix it. This is a closing check, not a fresh review: it was already reviewed twice.
1. The render is current: chapter.mp4 exists, plays to the end (ffprobe duration matches chapter.json within 0.1 s; decode the last 2 s), is newer than every file in project/ (find project -newer chapter.mp4 must list nothing that matters), and qc/preview.mp4 is newer than chapter.mp4.
2. Each problem in the list below is fixed, or qc/README.md shows with evidence that it was not a problem. Check each one on the frames or the sound at its time (ffmpeg frames into ${GTV}/work/verify-${ch}/, look at them).
3. No new damage: a contact sheet every 4 s over the whole chapter, looked at; loudness of the preview (-16 LUFS integrated within 1 LU, true peak at most -1.5 dBTP), no silence over 3 s that is not in the script, no frame frozen over 3 s, no narration inside a listening window, the qc sync numbers within 20 ms.
4. The privacy rules above.
Mark each problem you return BLOCKING (a viewer would notice: wrong or missing picture or sound, a wrong number, text cut off or unreadable, a broken listening window, a stale or missing render, privacy) or NIT (polish). Write ${PROD}/chapters/${ch}/qc/verify.md (under 60 lines). Return: pass (true when nothing BLOCKING is left), problems (each starting with BLOCKING: or NIT:, with the time, what is wrong and the fix), and a two-line summary.
The problems that were to be fixed:
${problems}`

const WIDE = (ch) => `FILM-WIDE DECISIONS (${REC}/PRODUCTION.md section 6.10, read it; they apply even where the problems below do not mention them): (a) in chapter.mp4 every narration line is 1.5 to 3 dB louder than the listening windows; measure it (each line's span against each window's span with ffmpeg ebur128) and fix the mix if it is outside; (b) tab strips: if this chapter shows a tab strip, read /home/user/gtv/work/seamfix/AFFECTED.md and do what it says for ${ch}; (c) voice edges: every narration placement starts at a quiet point with a 5 ms fade-in and ends with a 20 to 25 ms fade-out, and no sample step over 0.01 within 10 ms of a line's start or end; (d) a song kept under the narration sits at gain 0.22 to 0.3 and comes up to 1.0 in gaps longer than about 1 s, or is left out of that stretch (never 0.12); (e) clipped narration: the 156 source lines are being levelled again with a true-peak limit by kit-voicefix; when /home/user/gtv/work/voicefix/DONE exists, refresh this chapter's narration as /home/user/gtv/work/voicefix/AFFECTED.md says (keep your own trims, fades and placement gain) and check that no narration file the chapter places has a sample at or over 0.999. Do your other fixes first; if DONE is not there yet when you are ready to render, wait for it with a foreground call (600000 ms timeout): timeout 580 python3 -c "import os,time
while not os.path.exists('/home/user/gtv/work/voicefix/DONE'): time.sleep(10)" ; repeat until it exists.`

const VOICEFIX = `[AGENT: kit-voicefix]

${COMMON}

YOUR JOB: the film's narration is clipped, fix it at the source. Chapters are being polished by other agents at the same time: never edit anything under ${PROD}/chapters/*/project/ or ${PROD}/chapters/*/data/; you may only replace the source narration files ${PROD}/chapters/*/vo/lNN.wav as described below.
The problem (${REC}/PRODUCTION.md section 6.10, "Clipped narration"; found by the ch15 re-review, /home/user/gtv/work/rereview-ch15-blind-results/): ${PROD}/kit/tools/level.py raises each ElevenLabs take (vo/lNN.mp3) 8 to 10 dB with plain gain to -17 LUFS and writes 16-bit PCM, so loud syllables are cut flat. Over the 156 vo/lNN.wav files there are 7,467 samples at or over 0.999. ${PROD}/VOICE.md says how the voice agent made them (read it: the exact level.py arguments, trims and fades it used, if any).
1. Fix level.py: after the gain, a true-peak limiter (4x oversampled detection, look-ahead with the delay compensated so the output stays sample-aligned with the input, smooth release) to at most -1.0 dBTP; make the integrated loudness still land on the target (adjust the gain and limit again if the limiter lowered it); write 24-bit PCM. Keep its command line and its output's length the same. Write it in numpy/scipy (deterministic), not ffmpeg's alimiter, unless you prove alimiter is sample-aligned.
2. Make all 156 vo/lNN.wav again from their mp3 with the fixed level.py and the same arguments VOICE.md records. Keep each old file as lNN.wav.pre-tp. Check every new file: the same number of samples as the old one, zero offset against it (cross-correlation), integrated loudness within 0.1 LU of the old one, true peak at most -1.0 dBTP, no sample at or over 0.999, and away from the old clipped stretches the two differ by less than -40 dB (null test). Listen by measurement to three of the most clipped lines before and after (a spectrogram crop of the loudest syllable is enough).
3. Find how every chapter uses the narration: for each ${PROD}/chapters/chNN-slug/, which project files come from vo/lNN.wav (copies, trims, fades, re-levelled versions; look at its build script and the files' lengths and content), and which ones were already made from the mp3s with a limiter by a fix agent (ch03's project/level_tp.py, ch08's project/vo_level.py and any like them) and so are not affected. Count the clipped samples in each chapter's placed narration files.
4. Write /home/user/gtv/work/voicefix/AFFECTED.md: per chapter, its clipped-sample count, whether it must refresh, and the exact steps (which build step or command makes its narration files again from the new sources, keeping its trims, fades and placement gain), so a chapter agent can do it in a few minutes; and the chapters that need nothing. Then write /home/user/gtv/work/voicefix/DONE (one line: the time and "156 lines re-levelled").
5. Add to ${REC}/PRODUCTION.md section 6.10 "Clipped narration" only what differs from what it says (one short line).
Your final message: the fix, the numbers before and after, and the AFFECTED.md summary.`

const VOICEFIX_CHECK = `[AGENT: kit-voicefix-check]

${COMMON}

YOUR JOB: check, independently, the repair of the film's clipped narration. Another agent fixed ${PROD}/kit/tools/level.py, made the 156 ${PROD}/chapters/*/vo/lNN.wav again (old ones kept as lNN.wav.pre-tp) and wrote /home/user/gtv/work/voicefix/AFFECTED.md (the problem: ${REC}/PRODUCTION.md section 6.10, "Clipped narration"). You did not do it. Edit nothing under ${PROD}/chapters/.
1. With your own code: every new lNN.wav has no sample at or over 0.999, true peak at most -1.0 dBTP, the same length and zero offset against its .pre-tp file, and integrated loudness within 0.1 LU of it.
2. The words files (vo/lNN.words.json) still line up: check five lines' word onsets against the new audio's energy.
3. The sound: compare the loudest second of five of the most clipped lines before and after (spectrogram crops, look at them): the flat tops are gone, and nothing new is wrong (pumping, dulled consonants).
4. AFFECTED.md against the chapters: is each chapter's count and its refresh steps right? Did it miss a chapter that places narration under other names?
Return: pass, problems (one string each, with the path and the fix), and a two-line summary.`

const KITFIX = `[AGENT: kit-seamfix]

${COMMON}

YOUR JOB: fix a bug in the film's shared tab strip tool and repair the strips it damaged. Chapters are being polished by other agents at the same time: never edit anything under ${PROD}/chapters/.
The bug (found by the ch11 re-review: /home/user/gtv/work/rereview-ch11-tab-file/PROGRESS.md, seam_scan.txt, crop_seam.jpg, seamstrip.jpg): ${PROD}/kit/tools/tabstrip/tabstrip.cjs cuts a long strip into tiles of 8000 px. For the last, narrower tile it calls page.setViewportSize with the tile's width, and the score is then shot about 10 px left of the x the tile claims in strip.json: the first columns of the last tile repeat the last columns of the tile before, and marks drawn from the beat map sit off their digits there. The reviewer's scan found 23 of 47 strips affected.
1. Find the real cause in tabstrip.cjs and page.html (alphaTab re-layout on resize, centring, a scrollbar or something else) and fix it so every tile shows exactly the pixels its x and w claim, with the same layout as the beat map. Prove it on one affected strip: adjacent tiles join with no repeated and no missing columns, and with the debug option the beat lines land on the note glyphs in the last tile as in the others.
2. Write ${PROD}/kit/tools/strip_seams.py: it checks every tile join of a strip.json against its tiles and tells a real overlap from look-alike blank staff columns (compare columns that hold glyphs, or test candidate shifts on the whole join and pick the best). Run it on every strip.json under ${GTV} (experiments, blind, work, production) and keep the output.
3. Shoot again in place, with the fixed tool and the same source and options each strip.json records, every affected strip outside ${PROD}/chapters/. Keep each old strip.json as strip.json.pre-seamfix. Check that the beat map (every beat's t and x) is unchanged and only the damaged tile's pixels changed; flag anything else. Run strip_seams.py again: zero overlaps outside the chapters.
4. Find every chapter that uses an affected strip: by path in its build script, data and compositions, and by the hash of tile images copied into its project. For each, work out whether the part of the strip shown on screen reaches the damaged tile (from the scene's data: the strip window and the times shown). Write /home/user/gtv/work/seamfix/AFFECTED.md: per chapter, which strips, whether the damage was visible and when, and the exact steps to refresh (copy which files again, or shoot its own data strips again with which command), so a chapter agent can do it in a few minutes. Also list chapters checked and not affected.
5. Add a short line to ${REC}/PRODUCTION.md section 6.10 only if what you found differs from what it says (do not rewrite it).
Your final message: the cause, the fix, the strips shot again, and the AFFECTED.md summary (chapter: visible or not).`

const KITFIX_VERIFY = `[AGENT: kit-seamfix-check]

${COMMON}

YOUR JOB: check, independently, the repair of the tab strip seams. Another agent fixed ${PROD}/kit/tools/tabstrip/tabstrip.cjs, re-shot the damaged strips and wrote /home/user/gtv/work/seamfix/AFFECTED.md (the bug: ${REC}/PRODUCTION.md section 6.10). You did not do it. Never edit anything under ${PROD}/chapters/.
1. With your own method (not its strip_seams.py), check every tile join of every strip.json under ${GTV} outside the chapters: no repeated and no missing columns. Look at crops of at least five joins, including two last tiles.
2. For three re-shot strips, check that the beat map is the same as in strip.json.pre-seamfix and that beat x lines land on note glyphs in the last tile.
3. Check AFFECTED.md against the chapters: for each chapter's build script, data and compositions, does it use a strip that was damaged, and is AFFECTED.md right about it and about whether the damage was on screen? Are its refresh steps enough?
Return: pass, problems (one string each, with the path and the fix), and a two-line summary.`

const JOINFIX = `[AGENT: kit-joinfix]

${COMMON}

YOUR JOB: fix the film's join tool so the sound stays in sync with the picture over the whole film. Never edit anything under ${PROD}/chapters/.
The bug (found by the film's sound check, ${PROD}/FILM-QC-sound.md and /home/user/gtv/work/film-qc-sound/: drift.txt, sync.txt, sync_lag.txt, vframe.py, drift.py): ${PROD}/kit/tools/join.py concatenates the chapters' chapter.mp4 with ffmpeg's concat demuxer. Each chapter starts at the previous chapter's audio length rounded up to a whole AAC frame, so the sound falls behind the picture at every join: +17 ms at ch01, +95 ms at ch07, +130 ms at ch09, +235 ms at ch17. The picture is right to within one frame. Also, film-join (${GTV}/work/film-join/PROGRESS.md and ${PROD}/FILM.md) level-matched four chapters by making gained copies (-2.9 dB on ch02, ch04, ch13 and ch16).
1. Fix join.py: keep the video stream-copied as now; build the audio by decoding each chapter's sound, trimming or padding it to exactly that chapter's video length (its frame count / 30; check against chapter.json), applying a per-chapter gain, and concatenating the parts sample-exactly (one ffmpeg filter graph: atrim, apad, volume, concat; or numpy), then master once with finish.py as now. Add an option for the per-chapter gains (a JSON file of chapter folder name to dB) so no gained copies are needed. Captions and chapter marks must use the same per-chapter lengths. Keep its command line otherwise and update its docstring and ${REC}/PRODUCTION.md section 6.6 (one or two lines).
2. Prove it on the current 18 chapters (gains from FILM.md): join into ${GTV}/work/kit-joinfix/out/ and measure the lag of the film's sound against each chapter's own sound at its place, at the start, the middle and the end of every chapter (cross-correlation), with your own code and with the sound checker's drift.py: every lag 0 within 1 ms, the film's length equal to the sum of the chapter video lengths, and the picture still within one frame (vframe.py). Also check that the loudness numbers stay as FILM.md has them (about -16.0 LUFS, true peak at most -1.5 dBTP, LRA about 5). Keep 3 GB of disk free: delete the test outputs once measured (keep the logs and numbers).
Write ${GTV}/work/kit-joinfix/REPORT.md (the cause, the fix, the numbers before and after). Your final message: the fix, the lag numbers, the command to join the film with the gains.`

const LISTENCUES = `[AGENT: kit-listencues]

${COMMON}

YOUR JOB: the film's captions say nothing while a tab, a recording or a tool's output plays with no speech (the film's story check: ${PROD}/FILM-QC-story.md, its first problem; 50 caption-free stretches over 5 s, about 10 minutes in all). ${REC}/EMBED.md section 2.4 asks for a short cue in brackets that says what is playing, e.g. [Basic Pitch's notes, played back]. Make a tool that adds them, so they survive any chapter rebuild. Other agents are fixing chapters and join.py right now: never edit anything under ${PROD}/chapters/ or ${PROD}/kit/tools/join.py.
1. Write ${PROD}/kit/tools/listen_cues.py: for one chapter folder, read where its listening windows are and what plays in each (its project/data timing files and root.json audio entries, its build script's window list, its script.md and ${PROD}/SCRIPT.md LISTEN lines, the brief) and write <chapter>/captions.listen.vtt into a folder you name with an --out option: one bracketed cue per window, timed to the window in chapter time, 1 to 7 s (a window longer than 7 s gets its cue at the start, or two cues), never overlapping that chapter's captions.vtt cues (trim to the gap), worded from what the script says plays, in the film's words (the answer key, the kit arm, the bare arm, a tool by its name and version as on screen, the recording). Name tools as the chapter shows them. Keep each under 42 characters a line, at most 2 lines.
2. Write ${PROD}/kit/tools/merge_cues.py: takes the film's film.vtt and chapters.vtt and the folder of captions.listen.vtt files, offsets each chapter's listen cues by that chapter's start in chapters.vtt, merges them into one WebVTT in time order, renumbers, and checks EMBED 2.4's format rules (hours always written, no overlap, 1 to 7 s, two lines at most, escaping).
3. Run both on the current chapters and the current film (/home/user/gtv/production/film/film.vtt and chapters.vtt) into ${GTV}/work/listencues/ and check the result: every caption-free stretch over 5 s in the film is now covered or is a scripted pause with nothing playing; look at 15 windows spread over the film and say whether each cue is right about what plays (compare with the chapter's frames or data). Run the never-publish check of EMBED 2.4 on the merged file.
4. Add two lines to ${REC}/PRODUCTION.md section 6.6 on how the join uses them (listen_cues.py per chapter after the chapters are final, then merge_cues.py on the joined film's captions).
Your final message: the number of cues added, what is still uncovered and why, and the two commands.`

// ---------- Stage 5: finish ----------
const JOIN = `[AGENT: film-join]

${COMMON}

YOUR JOB: make the finished film and its web files. Chapters: ${PROD}/chapters/ch*/ in order of their number (each has chapter.mp4, captions.vtt, chapter.json). Read ${REC}/PRODUCTION.md sections 6.6 and 6.10 and ${REC}/EMBED.md sections 2 and 6 step 1 and 2.
0. Gate: for each of the 18 chapters, chapter.mp4 decodes to its end, its length matches chapter.json within 0.1 s, nothing that feeds the render in project/ is newer than it (Studio state files do not count), and qc/verify.md is its latest check and says it passes. If one fails the gate, stop and report it; do not join. Disk: the film needs about 3 GB while you work (df -h /). Free it first by deleting every chapter's qc/preview.mp4 (listening copies, made again by finish.py when needed) and /tmp/hyperframes-extract-cache-0/* (no render runs now: check that no hyperframes render process is alive), never chapter.mp4 or anything in project/.
1. Level match before joining: the chapters were mixed one by one (narration placed at 0.71 to 1.0 against mono or stereo lines; PRODUCTION 6.10), so their raw loudness differs. For each chapter.mp4 measure the narration's loudness over its lines' spans (the words files and the chapter's timing data say where the lines are) and the integrated loudness. If a chapter's narration is more than 0.75 LU from the median of all chapters' narration, gain that chapter's whole audio by the difference before joining (one gain per chapter, so its own voice-to-window gap stays as checked). Record every chapter's numbers and gains in ${PROD}/FILM.md. join.py takes chapter folders: give it level-matched copies under ${GTV}/work/film-join/ (video stream-copied, sound gained) for the chapters that need a gain.
2. Join with join.py into ${PROD}/film/ (film.mp4, film.vtt, chapters.vtt), mastered to -16 LUFS integrated, true peak at most -1.5 dBTP after the AAC encode, loudness range under 8 LU (if it is over, say by how much and where; do not compress the film to hide it). Delete film_raw.mov once film.mp4 is checked if the disk needs it.
3. Make the site copy exactly as EMBED.md 2.1 says: /home/user/gtv/render/guitar-video-to-tab.mp4 , and run its checks (profile, size, faststart, loudness after encode).
4. captions.vtt (EMBED 2.4, with its never-publish check), the poster (2.2), the chapter stills (2.3) with the chapter times from chapters.vtt, the card still and loop (2.5), all under ${GTV}/render/web/ with the names EMBED.md uses.
Write ${PROD}/FILM.md: the length, the chapter list with start times and labels (EMBED.md 1 rules for labels), the loudness and file numbers, and the paths.
SECOND JOIN (when ${PROD}/FILM-QC-*.md exist from an earlier film check, as now): this is a re-join after fixes. Read those three reports and ${GTV}/work/film-join/PROGRESS.md first, and keep the earlier FILM.md as FILM.1.md.
- join.py was fixed (${GTV}/work/kit-joinfix/REPORT.md): it trims each chapter's sound to its video length and takes per-chapter gains as an option. Use the option, measure the gains again (chapters were re-rendered), and make no gained copies. After the join, check with /home/user/gtv/work/film-qc-sound/drift.py (or the joinfix's own check) that the sound lags the picture by 0 within 1 ms at the start, middle and end of every chapter. Do not go on if it does not.
- Listening-window cues (EMBED 2.4): run ${PROD}/kit/tools/listen_cues.py on every chapter and merge_cues.py on the joined film's film.vtt and chapters.vtt (${GTV}/work/listencues/ and PRODUCTION 6.6 say how); the merged file is the captions.vtt you ship, after its format and never-publish checks. film.vtt has one spoken cue over 7 s (ch06 at about 18:44, 7.8 s, "madmom on the capo and nylon songs, lv-chordia on Imagine."): split it at a word boundary, as the first join did, before or after the merge, and run merge_cues.py's checks on the final file.
- Poster: the picture check found a fingertip mark covering a tool label's fret digit at 1712 s; choose a poster frame where no mark covers a digit and look at it. The card's alt text must describe only what its crop shows (the picture check: it does not show the capo).
- Bitrate: peaks over EMBED's "about 6 Mbit/s at most" were left as they were in the first join; keep that unless EMBED.md says otherwise, and say so in FILM.md.`

const FILM_QC = `[AGENT: film-qc]

${COMMON}

YOUR JOB: check the finished film as Aaron would watch it, before it goes live: /home/user/gtv/render/guitar-video-to-tab.mp4 , its captions /home/user/gtv/render/web/captions.vtt (or as ${PROD}/FILM.md says), the poster and chapter stills. You made none of it. Read ${REC}/PRODUCTION.md sections 1 and 2 and ${PROD}/FILM.md.
1. Picture: a frame every 10 seconds and three frames around every chapter join (contact sheets in ${GTV}/work/film-qc/). Look at all of them. Flag anything a viewer would notice (black or frozen stretches, a cut mid-movement, broken layout, text too small, a number that differs from the records, a missing alphaTab credit, the AO-082 mark missing).
2. Sound: loudness per minute and over the whole film, true peak, silences over 3 s, any narration during a listening window, the loudness jump at chapter joins, clipping.
3. Captions: they cover all narration, in time (check 20 cues spread over the film against the audio), no cue over two lines.
4. The story: does the film answer which tools to give an AI and which ones make the output work, and does it show the blind test with both arms, heard against the original? Is every tab shown also heard?
5. The privacy rules above, and the never-publish check of EMBED.md 2.4 over the captions and the stills' alt texts in FILM.md.
Write ${PROD}/FILM-QC.md (under 120 lines). Return: pass, problems (one string each: chapter id, time, what is wrong, the fix), and a two-line summary.`

// The whole-film check, split by lens so a 50-minute film gets three full looks (run in parallel after the join).
const QC_HEAD = (lens) => `[AGENT: film-qc-${lens}]

${COMMON}

YOUR JOB: check the finished film as Aaron would watch it, before it goes live, through one lens: ${lens.toUpperCase()}. Two other checkers look at the other lenses at the same time; stay on yours. The film: /home/user/gtv/render/guitar-video-to-tab.mp4 (the site copy), its captions and chapters under /home/user/gtv/render/web/ (names as ${PROD}/FILM.md says), the chapter folders ${PROD}/chapters/chNN-slug/ it was joined from (their qc/verify.md say what was already checked). You made none of it. Read ${REC}/PRODUCTION.md sections 1, 2 and 6.10 and ${PROD}/FILM.md. Work in ${GTV}/work/film-qc-${lens}/.
If ${PROD}/FILM-QC-${lens}.md exists from an earlier check of the film, this is a re-check after fixes: rename it to FILM-QC-${lens}.1.md, check that each of its problems is fixed (BLOCKING and NIT), and then do your full check again; a problem that came back or a fix that broke something else is BLOCKING.
`
const QC_TAIL = (lens) => `
Mark each problem BLOCKING (a viewer would notice, or it is wrong: a wrong number, a broken or missing picture or sound, text cut off or unreadable, a broken listening window, a privacy breach) or NIT (polish). Give each one the chapter id and the time in the film and in the chapter, what is wrong, and the fix. Write ${PROD}/FILM-QC-${lens}.md (under 100 lines). Return: pass (true when nothing BLOCKING), problems (each starting with BLOCKING: or NIT:), and a two-line summary.`

const QC_PICTURE = QC_HEAD('picture') + `
1. A frame every 5 seconds over the whole film, and five frames around every chapter join (contact sheets). Look at every sheet.
2. Flag what a viewer would notice: black, empty or frozen stretches (ffmpeg freezedetect over the film, then look), a flash or jump at a join, broken or overlapping layout, text cut off or under 22 px, anything that matters in the bottom 150 px under the captions, a tab strip without its alphaTab credit, a tool named without its version, colours outside the palette, the AO-082 mark missing where PRODUCTION.md says it shows, a tab strip seam or marks off their digits (PRODUCTION 6.10).
3. The poster, the chapter stills and the card still and loop: each is the frame FILM.md says, readable, and none shows anything private.` + QC_TAIL('picture')

const QC_SOUND = QC_HEAD('sound') + `
1. Over the whole film: integrated loudness, true peak, loudness range, and loudness per minute (ffmpeg ebur128); the jump in narration loudness at every chapter join (compare the last line before and the first line after); clipping (samples at full scale) and flat tops; silences over 3 s (silencedetect) and whether each is in the script.
2. The rules of PRODUCTION 6.10 on the joined film, sampled: in at least six chapters, each narration line against the listening windows (1.5 to 3 dB), voice edges (no clicks: sample steps near line starts and ends), the song under the voice (0.22 to 0.3, never inaudible).
3. Listening windows: in every chapter, at least one window is heard alone (no narration over it, from the words files against the chapter's timing), truth first and then the tool when both are played; spot-check sync of five windows with the qc sync tool against their sources.` + QC_TAIL('sound')

const QC_STORY = QC_HEAD('story') + `
1. Watch the film's argument end to end from the captions and the chapter scripts (${PROD}/SCRIPT.md): does it answer which tools to give an AI to go from a video of a person playing guitar to a finished tab, and which ones actually make the output work? Does it show the blind test with both arms (with tools and without), heard against the original, and give round 2 as the result with round 1 as a second run, as ${REC}/BLIND.md section 7 and ${REC}/BLIND-RESULTS.md say? Is every tab shown also heard? Does it say plainly where it lets the viewer judge (answer keys in doubt) and where the answer key decides?
2. Numbers: check at least 40 numbers on screen or in the narration, spread over all chapters, against their source files (${REC}/BLIND-RESULTS.md, ${REC}/results/, /home/user/gtv/blind/results.json, the experiments' result.json files). Pull the frame for each.
3. Captions: they cover all narration (compare word counts per chapter with the vo .txt files), in time (20 cues spread over the film against the audio), two lines at most, and the script's spelling (VOICE.md's respelt lines).
4. Privacy and records: the never-publish check of EMBED.md 2.4 over the captions, chapter titles and alt texts; nothing from the removed AO-078 videos; no private person's name; the credits name the three recordings' performers and the tools as songs.json and results.json say.` + QC_TAIL('story')

const PUBLISH = `[AGENT: publisher]

${COMMON}

YOUR JOB: put the finished film at the top of AO-082 and push it live, as Aaron asked ("Once you are done, post it at the top of the blog post and push it live. You do not need to ask me permission for anything, you are preapproved."). Read /home/user/blog/CLAUDE.md, ${REC}/EMBED.md (all of it: it is the procedure), /home/user/blog/WRITING.md and PREVIEWS.md, ${PROD}/FILM.md and ${REC}/BLIND-RESULTS.md.
Follow EMBED.md section 6 steps 3 to 6:
1. The studio library: file the originals as EMBED.md section 5 says (studio push blog-posts <folder> --agent gtv-publisher with NOTES.md, a dry run first). Record the run id.
2. Work in the worktree /home/user/land (git fetch origin && git checkout -B land-guitar origin/main). Never push from /home/user/blog.
3. The web files into public/media/guitar-tab-tools/film/ and the video through npm run media:push (EMBED.md 3).
4. The post edit (EMBED.md 1 and 4.2): the <ao-shots> block first in the body, the new opening paragraph with the blind test's result and the film's length (WRITING.md voice: Aaron, first person, no em dashes, no semicolons), the credits of the three recordings, the film's costs in "What it cost" (ElevenLabs credits from ${PROD}/VOICE.md, any rented GPU from ${GTV}/work/exp-gpu/POD.json, hosted calls from the step-10 record; tokens if you can measure them with the agent-metrics skill), the credit line. The post stays listed.
5. npm run check, npm run build, npm test (fonts.test.mjs fails on main already and is not yours), the e2e specs for ao-shots against npm run preview. Then git fetch origin && git rebase origin/main, git push origin HEAD:main, repeat on rejection, never force.
6. Within 10 minutes https://aaronorelup.com/version.json must show branch main and your commit or newer. Then npm run media:verify, and a live check with Playwright of https://aaronorelup.com/ledger/guitar-tab-tools/ : the video element loads its metadata, the poster shows, the captions track loads, a chapter click seeks. If a live check fails because of your change, push a git revert at once and report.
Commit message: a plain subject, Aaron's words quoted above in the body, and these two last lines exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01UUo1wzpodZueETn2SeiGku
Your final message: the commit on main, the version.json line, the live checks, the studio run id and item ids, and anything left.`

// ---------- helpers ----------
const VERDICT = {
  type: 'object',
  properties: {
    pass: { type: 'boolean' },
    problems: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['pass', 'problems', 'summary'],
}
const o = (label, ph, effort) => ({ label, phase: ph, model: OPUS, effort: effort || 'max', agentType: 'general-purpose' })
const safe = async (prompt, opts) => {
  try {
    const r = await agent(prompt, opts)
    return r == null ? 'NO RESULT' : r
  } catch (e) {
    return 'FAILED: ' + String(e && e.message ? e.message : e).slice(0, 300)
  }
}
const short = (r) => (typeof r === 'string' ? r.slice(0, 1500) : JSON.stringify(r).slice(0, 1500))
const verdict = (v) => (v && typeof v === 'object' && Array.isArray(v.problems) ? v : { pass: false, problems: ['the reviewer returned no verdict: ' + short(v)], summary: '' })
const numbered = (ps) => ps.map((p, i) => (i + 1) + '. ' + p).join('\n')

// ---------- Run ----------
if (PART === 'blind') {
  phase('Blind')
  // Two lanes, three attempts at a time, and never both arms of one video at once:
  // lane x: (b1 tools + b2 bare), then (b1 bare + b2 tools); lane y: b3 tools, then b3 bare.
  const ids = (args && args.ids) || ['b1', 'b2', 'b3']
  const waves = args.lane === 'x'
    ? [[[ids[0], 'tools'], [ids[1], 'bare']], [[ids[0], 'bare'], [ids[1], 'tools']]]
    : [[[ids[2], 'tools']], [[ids[2], 'bare']]]
  const attempts = []
  for (const wave of waves) {
    const out = await parallel(wave.map(([id, arm]) => () => safe(BLIND(id, arm), o('blind-' + id + '-' + arm, 'Blind'))))
    wave.forEach(([id, arm], i) => attempts.push({ id, arm, said: short(out[i]).slice(0, 600) }))
  }
  return { part: 'blind', lane: args.lane, attempts }
}

if (PART === 'score') {
  phase('Score')
  const [score, audit] = await parallel([
    () => safe(SCORE, o('blind-scorer', 'Score')),
    () => safe(BLIND_AUDIT, { ...o('blind-auditor', 'Score'), schema: VERDICT }),
  ])
  const a = verdict(audit)
  return { part: 'score', score: short(score), audit: { pass: a.pass, problems: a.problems, summary: a.summary } }
}

if (PART === 'score2') {
  phase('Score')
  const [score, audit] = await parallel([
    () => safe(SCORE2, o('blind-scorer-r2', 'Score')),
    () => safe(BLIND_AUDIT2, { ...o('blind-auditor-r2', 'Score'), schema: VERDICT }),
  ])
  const a = verdict(audit)
  return { part: 'score2', score: short(score), audit: { pass: a.pass, problems: a.problems, summary: a.summary } }
}

if (PART === 'script') {
  phase('Script')
  const written = await safe(SCRIPT, o('script-writer', 'Script'))
  const [facts, viewer] = await parallel([
    () => safe(SCRIPT_FACTS, { ...o('script-factcheck', 'Script'), schema: VERDICT }),
    () => safe(SCRIPT_VIEWER, { ...o('script-viewer', 'Script'), schema: VERDICT }),
  ])
  const f = verdict(facts)
  const v = verdict(viewer)
  const problems = [...f.problems.map((p) => 'FACT: ' + p), ...v.problems.map((p) => 'VIEWER: ' + p)]
  const fixed = problems.length ? await safe(SCRIPT_FIX(numbered(problems)), o('script-fix', 'Script')) : 'nothing to fix'
  const [voice, kitx] = await parallel([
    () => safe(VOICE, o('voice', 'Script', 'high')),
    () => safe(KITX, o('kit-extender', 'Script')),
  ])
  return { part: 'script', written: short(written), facts: { pass: f.pass, n: f.problems.length, summary: f.summary }, viewer: { pass: v.pass, n: v.problems.length, summary: v.summary }, fixed: short(fixed), voice: short(voice), kit: short(kitx) }
}

if (PART === 'chapters') {
  phase('Chapters')
  const list = args.chapters || []
  const done = await pipeline(
    list,
    (ch) => safe(CH_BUILD(ch), o('build-' + ch, 'Chapters', 'high')),
    async (built, ch) => {
      let v = verdict(await safe(CH_REVIEW(ch, false), { ...o('review-' + ch, 'Chapters', 'high'), schema: VERDICT }))
      let fixed = null
      if (!v.pass && v.problems.length) {
        fixed = await safe(CH_FIX(ch, numbered(v.problems)), o('fix-' + ch, 'Chapters', 'high'))
        v = verdict(await safe(CH_REVIEW(ch, true), { ...o('rereview-' + ch, 'Chapters', 'high'), schema: VERDICT }))
      }
      return { ch, built: short(built).slice(0, 500), fixed: fixed ? short(fixed).slice(0, 500) : null, pass: v.pass, open: v.problems, summary: v.summary }
    },
  )
  return { part: 'chapters', chapters: done }
}

if (PART === 'kitfix') {
  phase('Kit fix')
  const fixed = await safe(KITFIX, o('kit-seamfix', 'Kit fix'))
  const v = verdict(await safe(KITFIX_VERIFY, { ...o('kit-seamfix-check', 'Kit fix', 'high'), schema: VERDICT }))
  return { part: 'kitfix', fixed: short(fixed), check: { pass: v.pass, problems: v.problems, summary: v.summary } }
}

if (PART === 'listencues') {
  phase('Listen cues')
  const made = await safe(LISTENCUES, o('kit-listencues', 'Listen cues', 'high'))
  return { part: 'listencues', made: short(made) }
}

if (PART === 'joinfix') {
  phase('Join fix')
  const fixed = await safe(JOINFIX, o('kit-joinfix', 'Join fix', 'high'))
  return { part: 'joinfix', fixed: short(fixed) }
}

if (PART === 'voicefix') {
  phase('Voice fix')
  const fixed = await safe(VOICEFIX, o('kit-voicefix', 'Voice fix', 'high'))
  const v = verdict(await safe(VOICEFIX_CHECK, { ...o('kit-voicefix-check', 'Voice fix', 'high'), schema: VERDICT }))
  return { part: 'voicefix', fixed: short(fixed), check: { pass: v.pass, problems: v.problems, summary: v.summary } }
}

if (PART === 'polish') {
  phase('Polish')
  // args.items: [{ch, problems: [...]}], from the chapters lanes' open problems (or what I add).
  // args.wide: true adds the film-wide decisions (PRODUCTION 6.10) to every fix and check (run P1 was launched without it).
  const items = args.items || []
  const W = (ch, p) => (args.wide ? p + '\n\n' + WIDE(ch) : p)
  const done = await pipeline(
    items,
    (it) => safe(W(it.ch, POLISH_FIX(it.ch, numbered(it.problems), 1)), o('polish1-' + it.ch, 'Polish', 'high')),
    async (fixed, it) => {
      let v = verdict(await safe(W(it.ch, POLISH_VERIFY(it.ch, numbered(it.problems), 1)), { ...o('verify1-' + it.ch, 'Polish', 'high'), schema: VERDICT }))
      let fixed2 = null
      const blocking = (vv) => vv.problems.filter((p) => !/^NIT:/.test(p))
      if (!v.pass && blocking(v).length) {
        fixed2 = await safe(W(it.ch, POLISH_FIX(it.ch, numbered(v.problems), 2)), o('polish2-' + it.ch, 'Polish', 'high'))
        v = verdict(await safe(W(it.ch, POLISH_VERIFY(it.ch, numbered(v.problems), 2)), { ...o('verify2-' + it.ch, 'Polish', 'high'), schema: VERDICT }))
      }
      return { ch: it.ch, fixed: short(fixed).slice(0, 400), fixed2: fixed2 ? short(fixed2).slice(0, 400) : null, pass: v.pass, open: v.problems, summary: v.summary }
    },
  )
  return { part: 'polish', chapters: done }
}

if (PART === 'finish') {
  phase('Finish')
  const joined = await safe(JOIN, o('film-join', 'Finish', 'high'))
  // three lenses on the joined film; the cap of 2 agents per run means the third starts when one ends
  const lenses = [['picture', QC_PICTURE], ['sound', QC_SOUND], ['story', QC_STORY]]
  const qcs = await parallel(lenses.map(([k, p]) => () => safe(p, { ...o('film-qc-' + k, 'Finish', 'high'), schema: VERDICT })))
  const qc = lenses.map(([k], i) => { const v = verdict(qcs[i]); return { lens: k, pass: v.pass, problems: v.problems, summary: v.summary } })
  return { part: 'finish', joined: short(joined), qc }
}

if (PART === 'publish') {
  phase('Publish')
  const pub = await safe(PUBLISH, o('publisher', 'Publish'))
  return { part: 'publish', publish: short(pub) }
}

return { error: 'unknown part: ' + PART }
