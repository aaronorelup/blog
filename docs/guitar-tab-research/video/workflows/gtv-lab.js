export const meta = {
  name: 'gtv-lab',
  description: 'Guitar tab video, stages 2 and 3: a checked ground truth for the three recordings, the toolkit installed, every chosen technique run on them and scored, the scores audited and written up',
  phases: [
    { title: 'Truth', detail: 'two independent readers of each tab, a builder, an independent checker and a repair pass per recording (Opus 5.5, max)' },
    { title: 'Toolkit', detail: 'two installers with smoke tests (Opus 5.5, high)' },
    { title: 'Experiments', detail: 'one agent per step of the job, in three waves, plus a rented GPU lane (Opus 5.5, high)' },
    { title: 'Audit', detail: 'two auditors recompute the scores, then a repair pass (Opus 5.5, max)' },
    { title: 'Results', detail: 'the results editor and the toolkit picker for the blind test (Opus 5.5, max)' },
  ],
}

const OPUS = 'claude-opus-5-5'
const GTV = '/home/user/gtv'
const REC = '/home/user/blog/docs/guitar-tab-research/video'
const RES = '/home/user/blog/docs/guitar-tab-research'
const SLOTS = ['capo', 'tuning', 'standard']

const COMMON = `THE JOB (read this first)
Aaron Orelup (aaronorelup.com) has a published post, "Testing the tools a guitar tab web app would need" (AO-082, /home/user/blog/src/content/posts/guitar-tab-tools.md). Behind it is a research folder, ${RES} (README.md first). He now wants a FILM for the top of that post, about 30 minutes long (up to 60 if the findings earn it), that shows the current state of having AI turn a video of a person playing guitar into a finished tablature on its own, using the tools that already exist. In his words: "we want to know which tools to give our AI to help it do this task and which ones actually make the output work".
His plan: three real recordings that each have a video and a tablature to serve as ground truth (one played with a capo, one in an unusual tuning, one with neither). Every technique from the post is applied to them and compared with the truth. Where the truth settles a question the film says so. Where it is a matter of judgement the viewer judges: so whenever a tab or a set of notes is shown, part of it is also PLAYED. At the end an Opus 5.5 session recreates each tab from the video alone, with the answer hidden, once with the chosen tools and once without them.
Aaron has pre-approved everything this job needs: do not stop to ask. If this box's permission system refuses a step, do not work around it: write down what was refused and take another route.

WHERE THINGS ARE
- The three recordings: ${REC}/SONGS.md and ${REC}/songs.json (read both first). Their files are in ${GTV}/songs/<slot>/ , where slot is capo, tuning or standard. The slot name is also the song id, "S", everywhere in this job.
- The plan of experiments: ${REC}/EXPERIMENTS.md and ${REC}/experiments.json (ids such as sep-01 or n-02. "A" entries are for the film, "B" if time allows, "C" are not run). Its "Conventions" block fixes the paths and file names everyone uses: follow it exactly, with S = the slot name.
- How the film is built and what data its scenes take: ${REC}/PRODUCTION.md (section 6.4 for the data formats).
- Scoring: gtr-eval (/home/user/gtr/bin/gtr-eval, README at ${RES}/scripts/gtr-eval/README.md). Heavy or timed runs go through /home/user/gtr/bin/gtr-run as in the research (source /home/user/gtr/env.sh first. Its "DISK LOW" notice was written for the research: the rule for this job is the one under THE BOX).
- Heavy files go under ${GTV}/ . Written records go under ${REC}/ (in the repo, PUBLIC: no audio or video there, no file over 300 KB, no key, nothing personal about Aaron, and never any of Aaron's own videos). Touch nothing else in /home/user/blog and run no git command that changes state.

THE BOX
4 vCPU, 15 GB of memory, no graphics card, Ubuntu 24.04. Free disk is about 6 GB and cannot grow: check df -h / before any download or install, keep at least 2.5 GB free, and delete intermediates you no longer need. Other agents share the processor: run heavy jobs through gtr-run's two slots and never start more than one heavy job of your own at a time. Outbound HTTPS is open. github.com web pages answer 403 here (use raw.githubusercontent.com or git clone). YouTube refuses this box: do not try to get around it. Long transfers can stall: use curl -C - with --speed-limit and --speed-time in a retry loop. Keys: python3 ~/.claude/bin/getkey.py NAME inside a script, never printed, never written to a file.

THE BOX RESTARTS WITHOUT WARNING, about every 80 minutes, and a restart kills you. The orchestrator then starts a new copy of you with this same prompt and no memory. So:
- Your work folder is ${GTV}/work/<your agent name>/ . FIRST read PROGRESS.md there if it exists, and continue from it. Never redo a finished step.
- After every finished step append to PROGRESS.md what was done, the numbers, the paths and what comes next, so that a new copy of you can carry on from the file alone. Put results at their final paths as soon as they exist.
- Make long jobs restartable: loops that skip an item whose output already exists.
KEEP YOUR OWN CONTEXT SMALL, it is what this job costs: send command output to log files and read only the lines you need, never print a whole JSON or CSV file, do not read a document twice, and read only the sections of the long documents that concern you.
HONESTY: every number you report must come from a file you can name. If something did not run or failed, say so with the error. Never fill a gap with a guess.
MODELS: if you start a helper agent, give it the model opus or sonnet explicitly. Never start anything on Fable.
YOUR FINAL MESSAGE goes to the orchestrator, whose reading budget is small: AT MOST 12 LINES, facts only, with the path of the file that holds the detail.`

// ---------- Truth ----------
const READ = (s, r) => `[AGENT: read-${r}-${s}]

${COMMON}

YOUR JOB: read the published tablature of the recording in slot "${s}" into a file a program can use. You are one of TWO readers who work apart: the other writes read-${r === 'a' ? 'b' : 'a'}.json . Do not open that file, nor anything else under ${GTV}/truth/${s}/ except your own file, nor ${GTV}/candidates/_selector/ . A third agent will compare the two readings note by note, so read what is on the page, not what you expect to be there.
The tab: see "paths" and "tab" for this slot in songs.json. It is either tab_pages/ (a tab filmed on screen: each page is the tab strip as it was shown between two times, listed in pages.json) or a PDF (render each page to PNG at 300 dpi with pdftoppm or PyMuPDF). LOOK at the pictures at full resolution, a line or a few bars at a time: cut each page with a script into pieces of at most 4 bars, enlarged so that every digit is large. Never read a whole page shrunk.
Write ${GTV}/truth/${s}/read-${r}.json :
{"reader": "${r}", "tuning_as_written": "...", "capo_as_written": 0, "time_signature": "4/4", "tempo_as_written": null, "form": "how the page says the parts repeat, word for word",
 "bars": [{"n": 1, "page": 1, "section": "Verse", "events": [{"pos": 0.0, "dur": 0.5, "notes": [{"string": 5, "fret": 3}], "marks": "h"}]}]}
Rules: string 1 is the thinnest string (the top line of a tab), string 6 the thickest. fret is the number as drawn (so counted from the capo when there is one). pos is the event's place in its bar, in quarter notes from the bar's start, and dur its length in quarter notes, both read from the rhythm marks (stems, beams, dots, rests, ties). If the tab has no rhythm, set pos and dur to null, keep the events in order, and number "bars" by the tab's own lines or boxes. A tied note is one event with the whole length (put "tie" in marks). A chord is one event with several notes. Rests are left out. marks holds what is drawn on the event: h, p, slide, harmonic, x (percussive), let ring and so on, or an empty string. Null where the page gives no time signature, tempo or section. A digit you cannot read for sure: give your best reading and add "doubt": "what else it could be" to that note.
Keep PROGRESS.md page by page, so that a restart costs at most one page. When all pages are read, run a script that checks the file (every bar present and numbered once, every string 1 to 6, every fret 0 to 24, pos + dur never past the bar's length) and counts bars, events, notes and doubts.
Budget: about 40 minutes of work.
Your final message: bars, events, notes, doubts, the tuning and capo as written, the form as written, and anything about the page the next agent must know.`
const TRUTH = (s) => `[AGENT: truth-${s}]

${COMMON}

YOUR JOB: build the GROUND TRUTH for the recording in slot "${s}" (${GTV}/songs/${s}/ ). Everything the film says about a tool on this recording is measured against your file. It has to be right, and where it is not certain it has to say so.
1. Prepare the inputs exactly as EXPERIMENTS.md "Conventions" names them (S = ${s}): ${s}.mp4 is the video as the tools and the blind session will get it. If songs.json gives a crop rectangle or a mask (a tab, chord names, a logo or a title drawn in the picture), make ${s}.mp4 the cropped and masked copy with all of that gone, encoded once at high quality (x264 crf 16 or better, audio copied, metadata stripped), and keep the uncropped file as ${s}.full.mp4 . Then ${s}.wav, ${s}.mono.wav and the 30 second segment files, from the segment songs.json names.
2. Build ${GTV}/truth/${s}/${s}.truth.json in exactly the schema of EXPERIMENTS.md "Scoring" (and ${RES}/inputs/INPUTS.md): tuning_midi, capo, tuning_offset_cents (measured from the recording), key, tempo_bpm, time_signature, notes (onset, offset, pitch, string, fret, voice), beats, downbeats, chords, taps if the piece has them, and source with the licence and the credit line. Strings and frets come from the published tab, which two readers have each read on their own into ${GTV}/truth/${s}/read-a.json and read-b.json (the format is in their headers: bars, events with pos and dur in quarter notes or null, notes with string and fret). Compare the two with a script, bar by bar and note by note. For every difference and every note a reader marked with a doubt, LOOK at that place of the picture yourself, enlarged, and check which pitch sounds in the recording there, then decide. Write the merged reading to ${s}.tab-merged.json in the same format, and put the counts in your record (notes both agreed on, notes that differed, how each difference was settled). If a reader's file is missing or broken, read those bars yourself and say so. Times come from the recording: align the tab to the audio the way that section describes (synthesize the tab, DTW on chroma, then snap each onset to a detected onset of the same pitch), or a better way if the material offers one, such as reading bar times off a cursor that moves over an on-screen tab. Use the venvs under ${GTV}/tools/ if the installers (running beside you) have made them (see ${GTV}/tools/INSTALLED.md), else make a small one of your own under your work folder (uv, with UV_CACHE_DIR=/home/user/gtr/cache/uv UV_LINK_MODE=hardlink).
3. Work outward from the 30 second segment, so that whatever is finished is one unbroken stretch and is right. Cover the WHOLE piece if the tab and the alignment allow it. If only part can be made trustworthy in the time you have, cover the 30 second segment and at least 60 more seconds, and give the covered range in the JSON as "scored_range": [start_s, end_s]. Where the player departs from the tab (a repeat skipped, a note added or left out, another fingering that you can SEE in the video), follow the PERFORMANCE and list the departure.
4. Mark what is uncertain. Give each note "conf": "tab+audio" (the tab says it and that pitch is heard starting there), "tab" (from the tab, the onset is not confirmed in the audio) or "audio" (heard, not in the tab). Say how beats and downbeats were derived. Chords are Harte labels: from the tab's chord names if it has them, else derived from the notes of each bar, and say which.
5. Write the side files that section lists (${s}.notes.csv, .beats.txt, .chords.lab, .mid, .gp5, .tab.txt), and make gtr-eval check-truth pass with 0 mismatches. Write ${s}.video.json too (the "Video truth" of that section: fps, picture size, capo_fret, shots, the neck quadrilateral per shot, and two labelled frames per shot that you labelled by LOOKING at them at full resolution).
6. Check your own work before you finish, with numbers: a transcription model (Basic Pitch, or the guitar-trained model if it is installed) against your truth with gtr-eval notes (on real guitar the research saw onset F1 between 0.7 and 0.9: far lower means the alignment is off somewhere, so find where, per 10 seconds). The truth synthesized against the recording (chroma similarity per 10 seconds). Ten notes spread over the piece, each checked by hand against a spectrogram slice at its onset and a video frame at its onset.
7. Write ${REC}/truth-${s}.md (under 200 lines): the source and credit, the tuning and the capo and how each was confirmed (the tab, the lowest notes and open strings heard in the audio, a frame), the method, the covered range, the counts (notes, bars, beats, chords, notes per conf value), the departures from the tab, every check with its numbers, and what remains uncertain.
Budget: about 60 minutes of work. A truth that covers less but is right is worth more than one that covers everything and is wrong somewhere unknown.
Your final message: tuning, capo, covered range, note count, the self-check numbers, what is uncertain, the record's path.`

const TRUTH_CHECK = (s, again) => `[AGENT: truth-${again ? 're' : ''}check-${s}]

${COMMON}

YOUR JOB: check, independently, the ground truth another agent built for slot "${s}": ${GTV}/truth/${s}/ (the JSON, the side files, ${s}.video.json) with its record ${REC}/truth-${s}.md . You did not build it and you must not trust its record: measure for yourself, with scripts of your own in your work folder. Do NOT change the truth files. Find what is wrong.${again ? `
An earlier checker listed problems (${REC}/truth-${s}-check.md) and a repair agent then changed the truth (see "Repairs" in the record). Check that each listed problem is really fixed and that the repairs broke nothing else: run checks 1 and 3 again in full, and the others where the repairs touched. Write your findings as a new section "Second check" at the end of ${REC}/truth-${s}-check.md .` : ''}
Check at least:
1. gtr-eval check-truth passes. The schema is complete. Every time lies inside the audio. No duplicate or zero-length notes. pitch = tuning + capo + fret for every note. The side files agree with the JSON.
2. Tuning and capo, in three ways that do not use the tab's own header: the lowest pitches and the open-string pitches that actually sound in the recording (a spectrogram or pitch tracker of your own), a frame of the video in which the capo (or its absence) and the nut can be seen (LOOK at it at full resolution), and the tuning offset in cents.
3. Timing. An onset detector of your own against the truth's onsets: the share of truth onsets with a detected onset within 50 ms, per 10 seconds of the piece. A transcription model against the truth (gtr-eval notes), per 10 seconds. List every stretch where either drops: those are where the truth is suspect.
4. Twenty notes picked at random with a fixed seed across the covered range, plus every note of two bars inside the 30 second segment: for each, is that pitch really sounding from that onset (spectrogram slice), and does the video frame at that onset show a finger on that string and fret counted from the capo (or an open string)? Give the table.
5. Beats and downbeats against the onset envelope and against one beat tracker. Does each downbeat fall where a bar of the tab starts? Five chords picked at random: do they match the notes sounding in them?
6. Does the record claim anything the files do not show? Does the cropped video ${GTV}/songs/${s}/${s}.mp4 still show any tab, chord name or title (look at six frames)?
Write ${REC}/truth-${s}-check.md (under 150 lines) with every check and its numbers, then PROBLEMS: each with where (seconds or note index), what, the evidence, and how to fix it. A problem is something that would make the film say a wrong thing about a tool: a wrong pitch, string, fret, tuning or capo, a stretch more than 50 ms off, a passage missing or invented, a wrong bar line, the answer visible in the tools' video. Smaller doubts go in a separate list, "Doubts".
Budget: about 40 minutes of work.
Return: pass (true only if no problem is left), the problems (one string each, with where), and a two-line summary with the key numbers.`

const TRUTH_FIX = (s, problems) => `[AGENT: truth-fix-${s}]

${COMMON}

YOUR JOB: an independent checker found problems in the ground truth for slot "${s}" (${GTV}/truth/${s}/ , record ${REC}/truth-${s}.md , the checker's report ${REC}/truth-${s}-check.md ). Fix every one in the truth files, or show with evidence of your own that the checker is wrong about it. Then run gtr-eval check-truth and the builder's self-checks again (step 6 of the builder's method, in the record), rewrite the side files from the JSON, and add a section "Repairs" to the record: each problem, what you changed (how many notes, which seconds), and the numbers before and after. If a stretch cannot be made trustworthy, cut it out of "scored_range" rather than leave it wrong, and say so.
The problems:
${problems}
Your final message: each problem in a few words with fixed, or not a problem and why, or cut from the scored range. Then the new counts and the self-check numbers.`

// ---------- Toolkit ----------
const KIT_AUDIO = `[AGENT: toolkit-audio]

${COMMON}

YOUR JOB: install the SOUND-side tools the experiments need, under ${GTV}/tools/ , exactly as ${REC}/EXPERIMENTS.md "Installs (box)" gives them: venv-torch, venv-bp, venv-madmom, venv-chordext, and the small weights (guitar-gaps, guitar-fl, the guitar fine-tune of htdemucs_6s, TabCNN). Follow the order in its "Disk" section.
Before installing, free disk: read ${REC}/songs.json and delete under ${GTV}/candidates/ every candidate that is neither one of the three picks nor one of their backups (the picks are already copied to ${GTV}/songs/). Leave everything else on the box alone unless EXPERIMENTS.md "Disk" names it as safe to delete. If the permission system refuses a delete, leave it and say so.
Then smoke-test every tool you installed on ONE research clip (under /home/user/gtr/inputs/ : use a clip the research scored that tool on) with the run command from EXPERIMENTS.md, score it with gtr-eval, and compare with the number the research recorded for that clip in the lane's trials.md: same, or different by how much. If venv-torch's packages do not import together, split it back the way EXPERIMENTS.md says.
Write ${GTV}/tools/INSTALLED.md (create it or add your section "Sound"): per tool the version, the venv, the exact command that worked, the smoke score next to the research's, and anything that failed with its error. Add the same in short to ${REC}/toolkit.md under "Sound".
Your final message: what is installed, what failed and why, the smoke scores that differ from the research, free disk now.`

const KIT_VIDEO = `[AGENT: toolkit-video]

${COMMON}

YOUR JOB: install the PICTURE-side and output-side tools the experiments need, under ${GTV}/tools/ , as ${REC}/EXPERIMENTS.md "Installs (box)" gives them: venv-video (MediaPipe, OpenCV, rtmlib), venv-api (the hosted-service scripts and gradio_client), the node tools (alphaTab, scorify, tutts: reuse the npm cache or the research's node_modules as that section says), and venv-ultra only if at least 4 GB of disk is free after the rest (else skip it and say so). Another installer (toolkit-audio) is working beside you on the sound side: do not touch its venvs.
Then write the small shared scripts every experiment agent will use, in ${GTV}/tools/bin/ , each with a usage line at the top and a test you ran:
- crop_truth.py and score_video_cells.py, as EXPERIMENTS.md "Scoring" specifies them.
- notes2wav.py: a note CSV (onset,offset,pitch[,string,fret]), a MIDI file or a GP5 file in, a 44.1 kHz stereo WAV out, played with FluidSynth's steel or nylon guitar program (--program), ON THE TIMELINE IT WAS GIVEN (time 0 of the notes is time 0 of the WAV, padded to --duration), so that a tool's notes can be played against the recording. A --mix option writes the recording on the left and the rendering on the right, and --alternate writes N seconds of one then N seconds of the other.
- result.py: writes and validates result.json for an experiment (fields: exp, song, tool, version, scope "full" or "seg30", status "ran" | "failed" | "refused" | "skipped", why, runtime_s, cores, scores, eval_ids, files, notes) and can collect every result.json under ${GTV}/experiments/ into one table.
- frames.py: frames of a video at given times or every N seconds as JPEG at full resolution, and a contact sheet with the time printed on each tile.
Smoke-test: MediaPipe hands and the fret-grid scripts on one research video clip (under /home/user/gtr/inputs/ ), alphaTab drawing one research GP5, scorify on one research clip's truth notes (compare each with the research's number), and notes2wav on that clip's truth (check with a script that the first rendered onset lands within 20 ms of the first note's onset).
Write your section "Picture and output" in ${GTV}/tools/INSTALLED.md and in short in ${REC}/toolkit.md .
Your final message: what is installed, the scripts written, what failed and why, free disk now.`

// ---------- Experiments ----------
const STEP_RULES = `HOW AN EXPERIMENT IS RUN AND RECORDED (the same for every step)
- Songs: capo, tuning, standard. Truth: ${GTV}/truth/<S>/<S>.truth.json . Do not edit it. Read ${REC}/truth-<S>.md and ${REC}/truth-<S>-check.md first for what is uncertain, and score only inside "scored_range" when the truth has one (crop both sides with ${GTV}/tools/bin/crop_truth.py). If you find the truth wrong somewhere, write the evidence to TRUTH-DOUBTS.md in your work folder and go on.
- What is installed and the exact commands that worked on this box: ${GTV}/tools/INSTALLED.md . Install nothing big yourself.
- Run every "A" technique of your step on all three songs: on the whole piece when that takes under about 10 minutes per song on 2 cores, else on the 30 second segment (record which). Then the "B" techniques, as far as about 60 minutes of work allow. Skip "C".
- One folder per technique and song, ${GTV}/experiments/<S>/<exp id>/ , holding: the tool's raw output. cmd.sh, the exact command, runnable again. The canonical files that apply, all on the RECORDING's timeline: notes.csv (onset,offset,pitch[,string,fret]), beats.txt, chords.lab, tab.gp5, stems as WAV, overlay.json or overlay.mp4. For anything that is notes or a tab, render.wav (${GTV}/tools/bin/notes2wav.py), so that it can be heard. score.sh, the exact scoring commands. result.json through ${GTV}/tools/bin/result.py, with the scores exactly as the scorer printed them.
- With a hint and without: where a tool accepts the tuning, the capo, a frequency range, a tempo or a similar hint, run it first with no hint and then with the true value, as two results (exp id with -hint added). The film shows what a hint buys.
- An experiment in which a model LOOKS or JUDGES (for example Opus 5.5 reading the capo or the hand position from frames) must be done by a helper agent that you start with the model opus and that gets only the frames or pictures, never the song's name, the tab or the truth. Save its whole answer.
- A tool that fails, that the permission system refuses, or that needs something missing: record the status and the exact error, try the documented fallback once, and move on. At most 15 minutes on one broken tool.
- Your step record, ${REC}/results/<your step file>.md (under 250 lines): one table per kind of score (rows are techniques, columns the three songs), each run's scope and time, what failed and why. Then "For the film": for each technique the one stretch (song, start and end in seconds, at most 20 seconds) that shows best what it gets right and what it gets wrong, the paths of the files to show and to play, and whether the point is settled by the truth (a number) or is for the viewer's ear or eye. Only statements the numbers carry. No grades, no advice.`

const STEPS = {
  sep: { n: 1, file: 'step-01-separation', name: 'Separation: pulling the guitar out of a mix, and whether separating does anything useful on a solo guitar', ids: 'sep-*', extra: 'None of the three recordings may have a band or a voice (check SONGS.md). If none has, also run the "A" separators on the research\'s band clip (S4, under /home/user/gtr/inputs/) so the film can show a real separation, and say so. For the solo recordings the question is whether a note model does better on the separated guitar than on the untouched sound.' },
  notes: { n: 2, file: 'step-02-notes', name: 'Sound to notes', ids: 'n-*', extra: 'Besides the totals, give the scores per 10 seconds and by pitch range (bass strings against treble), and count the invented notes and the missed ones separately: the film draws them in different colours.' },
  chords: { n: 4, file: 'step-04-chords-beat', name: 'Chords, beat, bars, tempo and key', ids: 'c-*', extra: 'For each beat tracker also write a click track mixed over the recording (click.wav) so the viewer can hear whether the beat is right.' },
  tuning: { n: 5, file: 'step-05-tuning-capo', name: 'Tuning and capo', ids: 't-*', extra: 'This step decides the capo song and the tuning song: for every technique record its plain answer (tuning as six note names, capo fret) next to the truth, right or wrong, and for the wrong ones what it said instead.' },
  video: { n: 7, file: 'step-07-video', name: 'Reading the hands, the fretboard and the capo from the video', ids: 'w-*', extra: 'Use the cropped <S>.mp4 . Write overlay videos or overlay JSON on the video timeline (hand landmarks, the fret grid, the fingertip cells, the capo box) for a 20 second stretch per song, and count how often each technique loses the hand or the neck.' },
  hosted: { n: 10, file: 'step-10-hosted', name: 'Hosted services that do the whole job in one call', ids: 'h-* (the step 10 entries)', extra: 'Send only the three recordings\' sound or video, nothing about Aaron. Record the cost of every call. Entries marked "not possible" stay not run: copy the reason into the record.' },
  voices: { n: 3, file: 'step-03-voices-taps', name: 'Melody, bass and percussive taps from one guitar', ids: 'v-*', extra: 'Score only on recordings whose truth has the voices or taps. Where it has none, run the technique anyway, keep the output to show and play, and mark it as for the viewer\'s ear.' },
  strfret: { n: 6, file: 'step-06-string-fret', name: 'Choosing the string and fret for each note', ids: 'f-*', extra: 'Run each assigner twice: on the TRUTH\'s notes with strings and frets removed (this isolates the step), and on the notes of the best step-2 technique for that song (read ' + REC + '/results/step-02-notes.md ). With and without the true tuning and capo as hints.' },
  av: { n: 8, file: 'step-08-sound-and-video', name: 'Putting sound and video together', ids: 'y-*', extra: 'Take the notes from the best step-2 technique and the hand positions from the best step-7 technique for each song (read their step records), and show what the video adds to the string and fret choice over sound alone (the same notes through the best step-6 assigner).' },
}

const STEP = (k) => `[AGENT: exp-${k}]

${COMMON}

YOUR JOB: run STEP ${STEPS[k].n} of the experiment plan on the three recordings: ${STEPS[k].name}. Your techniques are the entries ${STEPS[k].ids} of ${REC}/experiments.json , and their section of ${REC}/EXPERIMENTS.md has the commands (read that section, "Conventions" and "Scoring", not the whole file). Your step file is ${STEPS[k].file} .
${STEP_RULES}
FOR THIS STEP: ${STEPS[k].extra}
Your final message: per technique one short line (ran on which songs, the main score per song), what failed or was refused, and the record's path.`

const GPU = `[AGENT: exp-gpu]

${COMMON}

YOUR JOB: run the techniques that need a graphics card (runs_on "runpod" in ${REC}/experiments.json , "A" first, then "B") on a rented RunPod machine, following "RunPod plan" in ${REC}/EXPERIMENTS.md and Aaron's own rules in ~/agent-kit/skills/runpod-render/SKILL.md (read both first: your OWN pod, never touch another pod, terminate at the end).
${STEP_RULES}
FOR THIS LANE:
- Money: at most 3 hours of one pod and 5 US dollars in all. Write the hourly price into your PROGRESS.md before you create the pod. The moment the pod exists, write its id, the price and the start time to ${GTV}/work/exp-gpu/POD.json . If you are a new copy after a restart, read POD.json first: reuse that pod if it is alive, and never create a second one.
- Send the pod only the three recordings' files and public code. No key goes onto the pod except through RunPod's own secret or environment mechanism, and none is printed.
- If the permission system refuses running cloned code on the pod, record it per technique and run what is allowed.
- WHEN YOU ARE DONE, OR BLOCKED, OR OUT OF TIME: copy the outputs back, DELETE THE POD, check with the pod list that it is gone, and write "deleted" with the time and the total cost into POD.json . Do this before your final message, whatever else happened.
Your step file is step-gpu . Your final message: per technique one short line, the pod's hours and cost, and the line "pod deleted: yes" or what is left.`

const CHAINS = `[AGENT: exp-chains]

${COMMON}

YOUR JOB: STEP 9 of the plan (the entries o-* of ${REC}/experiments.json : writing the tab file, drawing it, playing it back) and, with it, the thing the whole film is about: FINISHED TABS made from each recording by chains of the tools, scored against the truth. Read the step records in ${REC}/results/ first (step-01 to step-08, step-10, step-gpu as far as they exist): the chains use, for each step, the technique that scored best on that song there.
${STEP_RULES}
FOR THIS STEP, per song, build these tabs (exp ids chain-1 to chain-6), each as tab.gp5 with bars, tempo and tuning, a drawn picture (the production kit's tab strip tool, ${GTV}/production/kit/tools/tabstrip , see PRODUCTION.md 6.4), render.wav, and scores from gtr-eval tab, notes, beats, chords and tuning:
- chain-1: sound only, nothing given. The tuning and capo are whatever the best blind step-5 technique said (standard and no capo if it said nothing).
- chain-2: the same with the TRUE tuning and capo handed in as hints, as a person in the loop would.
- chain-3: sound and video together (the best step-8 technique), nothing given.
- chain-4: the best hosted all-in-one service of step 10, as it came back.
- chain-5: the truth's notes into the best string and fret chooser (what is lost by that step alone).
- chain-6: the best tool notes, each given the truth's string (what is lost by the note step alone).
Say for each chain which technique was used at which step and why (its score in the step record). Then one table per song: the six chains against the truth.
Your step file is step-09-tabs-and-chains . Your final message: per song the six chains' main score (same string and fret over all truth notes), which step loses the most, and the record's path.`

// ---------- Audit ----------
const AUDIT = (tag, which) => `[AGENT: audit-${tag}]

${COMMON}

YOUR JOB: audit the experiments of ${which}. Their folders are ${GTV}/experiments/<song>/<exp id>/ and their records are in ${REC}/results/ . You ran none of them: check them against the files. Change nothing except to write your report.
1. Recompute: run every score.sh of these steps again (they only score saved outputs, which is quick) and compare each number with result.json, and each number in the step record's tables with result.json. List every difference.
2. For each step, open five results in depth (pick with a fixed seed, and always include the best-scoring technique of each song): was the right truth and the right scope used, are segment outputs shifted to the right place on the timeline, did a "-hint" run really get the hint and the plain run really get none, is the canonical output really on the recording's timeline (check the first three notes of notes.csv against the recording's onsets, and the first second of render.wav), does a result marked "ran" have its output, was a helper agent that had to be blind really given no name and no truth (read its prompt in the saved answer)?
3. Read each step record's sentences: does any say more than its numbers carry?
4. Is anything in ${REC}/results/ that must not be public (a key, a private address, anything about Aaron) or over 300 KB?
Write ${REC}/results/audit-${tag}.md (under 200 lines): what was checked, the counts, and PROBLEMS, each with the experiment, what is wrong, the evidence and the fix.
Return: pass (true only if no problem is left), the problems (one string each), and a two-line summary.`

const AUDIT_FIX = (tag, which, problems) => `[AGENT: audit-fix-${tag}]

${COMMON}

YOUR JOB: an auditor found problems in the experiments of ${which} (its report: ${REC}/results/audit-${tag}.md ). Fix each one at its source: re-score, re-run the tool if its output was wrong (the commands are in each folder's cmd.sh), correct result.json through ${GTV}/tools/bin/result.py and the step record's tables and sentences. If the auditor is wrong about one, show why with evidence. Add a section "After the audit" to each step record you changed.
${STEP_RULES}
The problems:
${problems}
Your final message: each problem in a few words with what you did, and the numbers that changed.`

// ---------- Results ----------
const RESULTS = `[AGENT: results-editor]

${COMMON}

YOUR JOB: write the one document the film's script will be written from: ${REC}/RESULTS.md (under 450 lines) and ${REC}/results.json . Sources: every result.json under ${GTV}/experiments/ (collect them with ${GTV}/tools/bin/result.py), the step records and audits in ${REC}/results/ , the truth records ${REC}/truth-*.md . Use the numbers as they stand after the audits.
1. results.json: every result as one row (exp, step, song, tool, version, scope, status, the scores, the paths of the files to show and to play).
2. RESULTS.md, per step of the job in order: what was tried, one table (techniques by songs, the main scores), what failed or could not run and why, what a hint changed, and the two or three stretches worth showing with their files. Then the finished tabs (the six chains per song). Then "What the truth settles" (statements a number carries, each with its number and file) and "What the viewer has to judge" (things to hear or see, with the files). Then "Surprises": results that go against what the post's research found or against what one would expect, each with the numbers.
3. For someone choosing tools to hand to an AI: per step, which techniques' output was closest to the truth on these three recordings, by the numbers, and at what cost in time, hardware, keys or money. State it as measured fact for these three recordings. No advice beyond that.
4. A last section "Limits": three recordings, how each truth was made and where it is uncertain, what was scored on segments only, what never ran.
Check every number you write against its result.json before you finish (a script that greps them is fine), and say how many you checked.
Your final message: the five findings that matter most, each with its numbers, and the paths.`

const PICK = `[AGENT: kit-picker]

${COMMON}

YOUR JOB: prepare the last chapter's test: an Opus 5.5 session recreates each tab from the video alone, once WITH a toolkit and once WITHOUT. Read "The last chapter" in ${REC}/EXPERIMENTS.md , and ${REC}/RESULTS.md .
1. PICK the toolkit from what was measured on the three recordings (RESULTS.md) and in the research: per step the technique or two whose output was closest to the truth and that runs on this box in reasonable time, plus what a session needs to look and listen (frames, contact sheets, spectrogram pictures, playing a tab back). Write ${REC}/BLIND.md : the pick per step with the numbers behind it, what was left out and why, and the full protocol of the test (both arms, what each may use, the time cap, the answer format, how answers are scored and audited).
2. BUILD it in ${GTV}/tools/kit/ : one small wrapper per tool (a path in, a folder out, the canonical file formats), all runnable from that folder with no install, and TOOLS.md, written for a session that has never seen any of this: for each tool what it takes, what it gives, how long it takes, its measured accuracy as a range and its known failure modes, and how the outputs chain. Include validate_answer.py (checks answer.json against the format in "The last chapter"), answer2gp5.py, and selfcheck.sh (renders the answer, transcribes the rendering, and compares it with the transcription of the original: estimate against estimate, never the truth).
3. Build the no-tools arm's environment: ${GTV}/tools/bare/ with a venv holding only numpy, scipy and soundfile, plus ffmpeg, FluidSynth, PyGuitarPro, validate_answer.py and answer2gp5.py, and a BARE.md that says exactly what is allowed.
4. NOTHING in the kit, in TOOLS.md or in BARE.md may give away anything about the three recordings: no title, player, tuning, capo, key, or score on a named recording. Accuracy is given as ranges over "the test recordings". Test every wrapper on a RESEARCH clip (under /home/user/gtr/inputs/), not on the three recordings.
5. Make the blind inputs: ${GTV}/blind/b1, b2, b3/video.mp4 from the three cropped videos (ffmpeg -map_metadata -1 -c copy), in an order you draw at random, and write the mapping ONLY to ${GTV}/truth/blind-map.json . Look at six frames of each to be sure that no title, tab or chord name is visible.
Your final message: the pick per step in one line each, where the kit is, the tests that passed, and anything that could not be included.`

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
const verdict = (v) => (v && typeof v === 'object' && Array.isArray(v.problems) ? v : { pass: false, problems: ['the checker returned no verdict: ' + short(v)], summary: '' })

// ---------- Run ----------
phase('Truth')
const kit = parallel([
  () => safe(KIT_AUDIO, o('toolkit-audio', 'Toolkit', 'high')),
  () => safe(KIT_VIDEO, o('toolkit-video', 'Toolkit', 'high')),
])
const truth = await parallel(SLOTS.map((s) => async () => {
  const reads = await parallel(['a', 'b'].map((r) => () => safe(READ(s, r), o('read-' + r + '-' + s, 'Truth'))))
  const built = await safe(TRUTH(s), o('truth-' + s, 'Truth'))
  let v = verdict(await safe(TRUTH_CHECK(s, false), { ...o('truth-check-' + s, 'Truth'), schema: VERDICT }))
  let fixed = null
  if (!v.pass && v.problems.length) {
    fixed = await safe(TRUTH_FIX(s, v.problems.map((p, i) => (i + 1) + '. ' + p).join('\n')), o('truth-fix-' + s, 'Truth'))
    v = verdict(await safe(TRUTH_CHECK(s, true), { ...o('truth-recheck-' + s, 'Truth'), schema: VERDICT }))
  }
  return { slot: s, reads: reads.map((x) => short(x).slice(0, 400)), built: short(built), fixed: fixed ? short(fixed) : null, pass: v.pass, open: v.problems, check: v.summary }
}))
phase('Toolkit')
const kitOut = await kit
log('truth: ' + truth.map((t) => t.slot + (t.pass ? ' ok' : ' OPEN ' + t.open.length)).join(', '))

phase('Experiments')
const waveA = await parallel([
  ...['sep', 'notes', 'chords', 'tuning', 'video', 'hosted'].map((k) => () => safe(STEP(k), o('exp-' + k, 'Experiments', 'high'))),
  () => safe(GPU, o('exp-gpu', 'Experiments', 'high')),
])
const waveB = await parallel(['voices', 'strfret', 'av'].map((k) => () => safe(STEP(k), o('exp-' + k, 'Experiments', 'high'))))
const chains = await safe(CHAINS, o('exp-chains', 'Experiments', 'max'))

phase('Audit')
const AUD = [
  ['a', 'steps 1 to 5 and the rented GPU lane (step files step-01 to step-05 and step-gpu)'],
  ['b', 'steps 6 to 10 (step files step-06 to step-10, with the chains of step 9)'],
]
const audits = await parallel(AUD.map(([tag, which]) => async () => {
  const v = verdict(await safe(AUDIT(tag, which), { ...o('audit-' + tag, 'Audit'), schema: VERDICT }))
  let fixed = null
  if (!v.pass && v.problems.length) {
    fixed = await safe(AUDIT_FIX(tag, which, v.problems.map((p, i) => (i + 1) + '. ' + p).join('\n')), o('audit-fix-' + tag, 'Audit'))
  }
  return { tag, pass: v.pass, problems: v.problems.length, summary: v.summary, fixed: fixed ? short(fixed) : null }
}))

phase('Results')
const results = await safe(RESULTS, o('results-editor', 'Results'))
const pick = await safe(PICK, o('kit-picker', 'Results'))

return {
  truth,
  toolkit: kitOut.map(short),
  waveA: waveA.map(short),
  waveB: waveB.map(short),
  chains: short(chains),
  audits,
  results: short(results),
  pick: short(pick),
}
