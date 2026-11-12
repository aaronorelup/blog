export const meta = {
  name: 'gtr-phase-c1',
  description: 'Guitar tab research phase C1: run cross-lane handoff chains, find gaps, and assemble the steps for Aaron',
  phases: [
    { title: 'Cross-lane', detail: 'chain-trials, completeness-critic, for-aaron (Opus 5.5, max)' },
    { title: 'Verify', detail: 'verify-for-aaron, verify-chains (Opus 5.5, max)' },
  ],
}

const OPUS = 'claude-opus-5-5'
const which = (args && args.which) || 'all'
const DOCS = '/home/user/blog/docs/guitar-tab-research'

const COMMON = `PROJECT
You are one agent in a research project for Aaron Orelup (aaronorelup.com), coordinated by an orchestrator who will assemble everyone's files into a research folder and a blog post draft. The thing being researched (NOT built) is a web app that builds guitar tablature step by step with a human in the loop. Two inputs: (1) full-song audio or video, from which it extracts notes, chords, melody and tempo and isolates tracks; (2) fingerstyle guitar video, from which it isolates melody, bass and taps and tracks the fretting and picking hands from video to tablature. It also needs metronome sync, reference playback of the correct tab, fully editable tablature, and user corrections (capo, tuning, wrong string or fret) that re-run the analysis with those constraints. The finished program would chain roughly 24 tools with cross-feedback between them (for example, fingering seen in the video constraining the pitch guesses from the audio).

WHERE THINGS STAND. Ten lanes have each surveyed one category and tried its tools on one shared set of test clips. Read these before anything else:
- ${DOCS}/PLAN.md (the plan and the tool lists) and ${DOCS}/ENVIRONMENT.md (the box and how runs are timed).
- /home/user/gtr/inputs/INPUTS.md (the test clips: S1, S2n, S2s, S3, S4, S5capo2, S5dropd, S6taps, S7flat30 synthesized with exact ground truth; R1a-c real GuitarSet excerpts with annotations; R2 and R2full a real band song; R3a-c real guitar videos).
- ${DOCS}/lanes/<lane>/ for each lane: trials.md (what was run, with run ids), survey.md (docs, formats, licenses with quoted clauses), for-aaron.md (steps for what could not run here), tools.json (the same facts, structured). Lanes: audio-to-notes, chords-beats-key, source-separation, guitar-tab, fingerstyle-voices-taps, video-hands-fretboard, web-tab-render, browser-audio-sync, apps-survey, hosted-apis.
- The run ledger /home/user/gtr/ledger/runs.jsonl and the scoring ledger /home/user/gtr/eval/ledger/evals.jsonl. The scoring tool's README: ${DOCS}/scripts/gtr-eval/README.md.
These files are large. Read tools.json first for the shape of a lane, then the parts of trials.md and survey.md you need.

HARD RULES
1. FACTS ONLY. What went in, what came out, how long it took, what a license says. No judging, grading, ranking, "best", "better", "winner", "recommended", "impressive", "poor", scores presented as verdicts, or advice about what to choose. A number measured against ground truth is a fact: give it as counts with how it was computed.
2. NEVER FAKE ANYTHING. If something did not run, say so and why. Do not fill gaps from memory. If unsure, write UNVERIFIED and what would settle it.
3. LICENSES AND TERMS are quoted exactly, with the URL and the date read.
4. THE BOX: 4 vCPU, 15 GiB RAM, no GPU. THE DISK IS TIGHT and cannot be enlarged. Reuse the venvs the lanes made where they still exist (paths are in each trials.md and under /home/user/gtr/lanes/<lane>/). Several lanes deleted theirs to save space: when you need one of those tools, recreate its venv from the lane's install commands or its saved uv pip freeze, one at a time, and delete it again when you are done with it. Never let free space fall under 3 GB (df -h /). Start every shell command with: source /home/user/gtr/env.sh (if it prints a DISK notice, follow it).
5. Timed or heavy runs go through gtr-run (two slots of 2 cores each): gtr-run --lane <your lane name> --tool <tool> --label "<what>" --input <file> -- <command...> . Quote run ids. For anything over about 5 minutes including the wait for a slot, run it in the background with a log file and poll. Score against ground truth with /home/user/gtr/bin/gtr-eval and quote the eval ids.
6. WRITE ONLY where your job says. Touch nothing else under /home/user/blog. Run NO git command that changes state: the orchestrator commits. No audio or video files anywhere under /home/user/blog, and no file over 300 KB there.
7. The repo is public: never write or print a key or token, and nothing personal about Aaron beyond his name and site.
8. SAVE AS YOU GO. If your output file already exists when you start, an earlier run of you was cut off: read it and continue from where it stops.
9. THE WEB: outbound HTTPS is open. github.com web pages and api.github.com answer 403 from this box: use raw.githubusercontent.com, git clone, or your web fetch and search tools. If the box's permission system refuses a step (running downloaded binaries, ticking consent boxes, and the like), do not work around it: record it and move on.
10. You may hand grunt work to helper agents on Sonnet (model "sonnet") if you have an agent-spawning tool. You remain responsible for what they return.
11. YOUR FINAL MESSAGE is read by the orchestrator: at most 30 lines. What you finished, counts, files written, what failed, what is unverified.`

const CHAINS = `[AGENT: chain-trials]

${COMMON}

YOUR JOB: the lanes tested tools one at a time. You test the HANDOFFS between them. Run a few end-to-end chains across lanes with tools that are already installed, and record at each joint exactly what came out of tool A, what tool B needed, and what glue had to be written between them. A chain is not a product and is not tuned: use defaults, or a setting a lane already documented. Your lane name for gtr-run is: chains. Write big files under /home/user/gtr/lanes/chains/ and the record under ${DOCS}/lanes/chains/ (trials.md, scripts/, samples/ with text, JSON, MIDI, Guitar Pro files and pictures of at most 300 KB). First look at what each lane already chained (several used other lanes' outputs): do not repeat a handoff a lane already ran: cite its run ids instead and run what is missing.

For every chain, choose each stage's tool among the ones that ran here, name which you used and why it was the one at hand (already installed, emits the needed format): that is a statement of convenience, not a pick. Where two tools at a stage emit different formats, run the joint with both if it is cheap, because the format difference is the fact of interest.

CHAIN A, full song to tab, chords and beat grid, on S4 (ground truth for every stage): the mix -> a separator that has a guitar stem -> the guitar stem -> a note transcriber -> notes -> a notes-to-tab assigner -> string and fret per note -> a Guitar Pro file -> rendered in headless Chromium with alphaTab -> a picture. From the same mix: a beat and downbeat tracker -> beat times (used to place bar lines and turn seconds into rhythm for the Guitar Pro file), and a chord recogniser -> chord labels. At each joint give: the file type, fields and units handed over, every conversion needed (stereo to mono, sample rate, seconds to ticks and which tempo was used, stem naming), and the counts against truth (notes matched out of how many, matched notes with the same string and fret, beats matched, seconds of the right chord). Then run the same chain on R2 (real song, no truth) and record what each stage emitted.
CHAIN B, fingerstyle audio to melody, bass and taps, on S6taps and S2s (truth): harmonic-percussive separation -> the percussive part -> an onset detector -> tap times; the harmonic part -> a note transcriber -> notes -> a voice split -> bass notes and melody notes -> a tab assigner -> tab. Counts against truth at every joint.
CHAIN C, a user correction, on S5capo2 and S5dropd: run the notes-to-tab part with no hint, then again telling the assigner the capo (or the tuning) through the parameter the guitar-tab lane documented, and report what changed, in counts. Then try to pin one note to a given string: if no tool that ran here exposes that, say so and name what each one does expose.
CHAIN D, video with audio, on R3b (close view) and R3c (both hands): a hand landmarker on every frame -> fingertip positions in pixels with frame times; the video lane's way of finding the neck or the frets -> fretboard geometry; fingertips mapped into fretboard coordinates where that lane's method allows; a note transcriber on the clip's audio -> note onsets. There is no ground truth: report what came out. Give the two timelines' formats and rates (frames per second against note onset times), how many note onsets have a hand-landmark frame within 20 ms, how many onsets have a fretting-hand fingertip mapped to some string and fret cell, and what joining the two streams needed.
CHAIN E, tab to reference playback with a metronome in the browser: a Guitar Pro file from chain A (or S2n.gp5) -> alphaTab's player in headless Chromium -> its playback timeline; a metronome scheduled from chain A's beat times in the same audio clock; capture the output and measure the click-to-beat offset the way the browser lane did (reuse its scripts).

For each chain write in trials.md: one table with a row per joint (A's output format and fields | what B needed | glue written: lines of code and what it does | run ids | counts against truth), then the plain list of every place a handoff failed or needed a manual choice (for example: a tempo was needed to turn seconds into note lengths; the output had no rhythm; two tools named stems differently; one wanted mono 22.05 kHz). Glue scripts go in scripts/. End trials.md with "## Media kept outside git". Aim to finish in about 90 minutes: chains A, B and C first.`

const CRITIC = `[AGENT: completeness-critic]

${COMMON}

YOUR JOB: find what is missing or unsupported across the ten lanes, so it can be fixed before the write-up. You change no lane file. Write ${DOCS}/GAPS.md and return the gap list as structured output.

Look for, lane by lane:
- A tool on PLAN.md's list for the lane that appears in neither trials.md nor survey.md.
- A tool the survey marks RUNNABLE that was never tried and has no stated reason.
- A tool counted as tried in tools.json with no ledger run id, or whose only runs have a nonzero exit code, or that reached no output.
- A license section without a quoted clause or without a URL, or a tool with weights but no weights license looked up, or a model whose training data is not stated.
- UNVERIFIED markers that one fetch or one command would settle.
- A NOT RUN HERE reason that is vague, or a NOT RUN tool with no steps in for-aaron.md although Aaron could run it.
- The same tool described differently in two lanes (license, version, formats).
- Judging language left in any lane file (grep for best, better, winner, recommend, impressive, poor, state of the art, superior, outperform, excellent).
- Thin coverage of things the brief asks for: key AND tuning detection, capo detection, taps, the picking hand, fretboard detection, metronome sync, reference playback, editable tablature, user corrections that re-run analysis, source separation with a guitar stem, melody extraction, chord recognition, downbeats.
- Products and projects that agents found late and did not write up: Note2Tabs, Cesure, RiffToTab, Fretwise, GuitarConvert, gtrsnipe (scottvr/gtrsnipe, an open-source audio-to-tab pipeline), and anything else mentioned in a closing summary or verification log as "found late" or "not covered".
- Anything from 2025 or 2026 in these categories that a web search turns up and no lane has.
Timing notes for this run: (a) the source-separation lane's trials.md is still being verified as you start and its tools.json may not exist yet: for that lane, list only gaps that verification would not fix (a tool missing, a runnable tool not tried, a missing license). (b) A first gap round is already running for three lanes and writes a section "## Gap round 1" into their trials.md: audio-to-notes (MT3, MR-MT3, RMVPE, CREPE in TensorFlow, Omnizart, Onsets and Frames, YourMT3+ locally), fingerstyle-voices-taps (ADTOF, Omnizart drum, ADT_STR, LarsNet, drumsep, piano_svsep, a real recording with body taps) and chords-beats-key (All-In-One, tempo-cnn, libKeyFinder, S-KEY, the QM Vamp plugins, Omnizart chord, a tuning or capo detector). Do not list those again. (c) The box's permission system refuses to run code from cloned repositories and downloaded binaries in most cases: a gap that can only be closed that way is closed by steps for Aaron, not by a run here, so say which it is. (d) Two known defects in the scoring tool gtr-eval belong on the list under lane "scripts": its ASCII-tab reader took "capo 2" from a song title line (eval e0468), and its f0 command stops with an IndexError when a CSV has empty cells for unvoiced frames (evals e0440 to e0447). (e) A cross-lane fact to check in every lane that used ONNX Runtime (Basic Pitch on ONNX, rtmlib, audio-separator, demucs-onnx): ONNX Runtime sets its own thread affinity and can ignore the 2-core slot, as the video lane's checker found. Any timing reported as "on 2 cores" for an ONNX Runtime job needs that caveat or a re-run with the thread count set.
For each gap say exactly what would close it and how much work and disk it needs. Do not pad the list: a gap must be specific and checkable. Order by lane, not by importance. GAPS.md has the same list as a table per lane, plus a short count at the top.`

const GAPS_SCHEMA = {
  type: 'object',
  properties: {
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          lane: { type: 'string' },
          kind: { type: 'string' },
          tool: { type: 'string' },
          what_is_missing: { type: 'string' },
          how_to_close: { type: 'string' },
          effort: { type: 'string' },
          needs_disk_mb: { type: 'integer' },
        },
        required: ['lane', 'kind', 'what_is_missing', 'how_to_close'],
      },
    },
    summary: { type: 'string' },
  },
  required: ['gaps'],
}

const FORAARON = `[AGENT: for-aaron]

${COMMON}

YOUR JOB: write ONE document, ${DOCS}/FOR_AARON.md, with everything Aaron has to run himself, step by step, with what to send back. Merge every lane's for-aaron.md, every NOT RUN HERE entry in the trials files that Aaron could run and that has no steps yet, and the "Access needs" lines in the surveys. You may write only that file.

The reader is Aaron. He is not a programmer by trade. He has a Windows laptop with a consumer NVIDIA GPU, a phone and a browser, and he keeps API keys in his own key store, where his agents can read them by name. He reads this file first, so it must stand alone.

Structure:
- Top: what this file is; how he gets the test clips (they are on the cloud box under /home/user/gtr/inputs/ and the orchestrator is filing them in his media library: leave the placeholder line "CLIPS: <the orchestrator fills this in>" for where to download them; always refer to a clip by its id and file name, and give a small table of the clips with what each is for); and how to send results back (one folder per test named by its test id, holding exactly the files listed, plus a line of notes).
- Section 1, minutes and no install: free web apps and public demos. One numbered test each (T01, T02, ...): what it is, the link, whether an account is needed, the cost, which clip, the exact steps, what to send back, about how long.
- Section 2, accounts and API keys an agent could then use for him: which service, where the key is made, the free tier or trial, the name to store the key under, and the first request (a curl command with a placeholder where the key goes).
- Section 3, runs for his GPU laptop: tools that needed a GPU or more memory than the box has. Exact commands for Windows PowerShell, model sizes, and the expected time only where the tool's docs give one.
- Section 4, desktop and phone apps with trials.
- Section 5, his own videos: what the shared set lacks (no video with a capo, none with body taps, none with a known tab) and what to film or pick, with the framing the video lane's results depended on.
- Section 6, the browser measuring page from the browser-audio-sync lane: where the file is and what numbers to copy back.
- Section 7, the steps this cloud box's permission system refused (see the apps-survey lane), and what he can do himself for each.
- A closing checklist table: test id | tool | needs (account, key, GPU, install, phone) | clip | what to send back | time | cost.
Rules: every step must be factual and checkable against the tool's own docs: do not promise what a tool will do. Order tests inside a section by time and cost, and say that this is the order used; give no advice on which are worth doing. Prices carry the date they were read. Count the tools covered at the top, and list separately every NOT RUN tool for which there is nothing Aaron can run (for example no weights were published), with the reason.`

const VERIFY_FORAARON = `[AGENT: verify-for-aaron]

${COMMON}

YOUR JOB: you are the independent checker of ${DOCS}/FOR_AARON.md, which another agent just assembled from the lanes' for-aaron.md files. Assume it has mistakes. Fix it in place.
1. Every test traces to a lane file: the tool, the link, the price and the steps must match what the lane's survey.md, trials.md or for-aaron.md says. Open the live page for every link and price (record the date) and correct what has changed or was wrong.
2. Every clip id and file name exists in /home/user/gtr/inputs/INPUTS.md.
3. Every command is valid for where it is meant to run (Windows PowerShell for the laptop section, curl for the API section), names real packages and real model files, and contains no key.
4. Nothing is promised that the tool's docs do not say. No advice, no ranking, no judging words.
5. Nothing personal beyond Aaron's name, and no private link.
6. No tool that could not run here and that Aaron could run is missing: compare against every lane's tools.json (for_aaron true, or tried false with a reason he could remove). Add what is missing. Tools he cannot run either are listed with the reason.
7. The counts at the top and the checklist table agree with the body.
8. The "what to send back" lines are specific enough for an agent to score the result later with gtr-eval (which files, in which format).
Append "## Verification log (verify-for-aaron, <date>)" with what you checked and changed.

The assembling agent's closing summary follows. Treat it as a claim to check:
`

const VERIFY_CHAINS = `[AGENT: verify-chains]

${COMMON}

YOUR JOB: you are the independent checker of ${DOCS}/lanes/chains/trials.md, the record of cross-lane handoff chains another agent just ran. Assume it has mistakes. Fix it in place.
1. Every run id cited is in the run ledger with that command, cores, wall-clock and exit code. Every eval id is in the scoring ledger with those numbers. A failed run is not described as a success.
2. Every file named exists. Open each joint's output and input and confirm the format statements (fields, units, sample rate, channels, ticks, tempo).
3. Re-run at least one joint per chain from the recorded command (label starting "verify") and confirm the counts.
4. Every "glue" script exists under scripts/ and does what the table says, in the number of lines stated.
5. Every stated failure or manual choice is real, and no manual choice is missing (read the scripts: a hard-coded tempo, offset, threshold or stem name is a manual choice).
6. Tool choices are stated as convenience, with no judging or ranking language anywhere.
7. No audio or video and no file over 300 KB under ${DOCS}/lanes/chains/.
Append "## Verification log (verify-chains, <date>)".

The chain agent's closing summary follows. Treat it as a claim to check:
`

const o = (label, ph) => ({ label, phase: ph, model: OPUS, effort: 'max', agentType: 'general-purpose' })
const tail = r => (r ? String(r) : '(it returned nothing: it may have been cut off. Check whatever is on disk and say what is missing.)')

const jobs = {
  chains: () => agent(CHAINS, o('chain-trials', 'Cross-lane'))
    .then(r => agent(VERIFY_CHAINS + tail(r), o('verify-chains', 'Verify')).then(v => ({ job: 'chains', result: r, verify: v }))),
  critic: () => agent(CRITIC, { ...o('completeness-critic', 'Cross-lane'), schema: GAPS_SCHEMA })
    .then(r => ({ job: 'critic', result: r })),
  foraaron: () => agent(FORAARON, o('for-aaron', 'Cross-lane'))
    .then(r => agent(VERIFY_FORAARON + tail(r), o('verify-for-aaron', 'Verify')).then(v => ({ job: 'foraaron', result: r, verify: v }))),
}
const wanted = which === 'all' ? Object.keys(jobs) : String(which).split(',')
const out = await parallel(wanted.map(k => jobs[k]))
return out
