export const meta = {
  name: 'gtr-foraaron',
  description: 'Guitar tab research, resumed: merge the ten lanes\' lists of what Aaron runs himself into one FOR_AARON.md, then check it',
  phases: [
    { title: 'Merge', detail: 'for-aaron (Opus 5.5, max)' },
    { title: 'Verify', detail: 'verify-for-aaron (Opus 5.5, max)' },
  ],
}
const OPUS = 'claude-opus-5-5'
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

const FORAARON = `[AGENT: for-aaron]

${COMMON}

YOUR JOB: write ONE document, ${DOCS}/FOR_AARON.md, with everything Aaron has to run himself, step by step, with what to send back. Merge every lane's for-aaron.md, every NOT RUN HERE entry in the trials files that Aaron could run and that has no steps yet, and the "Access needs" lines in the surveys. You may write only that file.

The reader is Aaron. He is not a programmer by trade. He has a Windows laptop with an 8 GB NVIDIA GPU, a phone and a browser, and he keeps API keys in his own key store, where his agents can read them by name. He reads this file first, so it must stand alone.

Structure:
- Top: what this file is; how he gets the test clips (they are filed in his studio library: project blog-posts, run 20261110-225132-vm-7d3107, items #70897 to #70922, filed as reference. Say exactly that and write no web address for the library. Always refer to a clip by its id and file name, and give a small table of the clips with what each is for); and how to send results back (one folder per test named by its test id, holding exactly the files listed, plus a line of notes).
- Section 1, minutes and no install: free web apps and public demos. One numbered test each (T01, T02, ...): what it is, the link, whether an account is needed, the cost, which clip, the exact steps, what to send back, about how long.
- Section 2, accounts and API keys an agent could then use for him: which service, where the key is made, the free tier or trial, the name to store the key under, and the first request (a curl command with a placeholder where the key goes).
- Section 3, runs for his GPU laptop: tools that needed a GPU or more memory than the box has. Exact commands for Windows PowerShell, model sizes, and the expected time only where the tool's docs give one.
- Section 4, desktop and phone apps with trials.
- Section 5, his own videos: what the shared set lacks (no video with a capo, none with body taps, none with a known tab) and what to film or pick, with the framing the video lane's results depended on.
- Section 6, the browser measuring page from the browser-audio-sync lane: where the file is and what numbers to copy back.
- Section 7, the steps this cloud box's permission system refused (see the apps-survey lane), and what he can do himself for each.
- A closing checklist table: test id | tool | needs (account, key, GPU, install, phone) | clip | what to send back | time | cost.
Rules: every step must be factual and checkable against the tool's own docs: do not promise what a tool will do. Order tests inside a section by time and cost, and say that this is the order used; give no advice on which are worth doing. Prices carry the date they were read. Count the tools covered at the top, and list separately every NOT RUN tool for which there is nothing Aaron can run (for example no weights were published), with the reason.

THE FILE THAT IS THERE NOW is not an earlier run of you. It is an index the orchestrator wrote on 2026-11-11 when the whole run was stopped by hand (the account's usage limit was nearly used up. The run resumed on 2026-11-12, and every lane's gap rounds are finished and checked now). Replace it with the merged document, and keep its facts: drop its status line, keep "The test clips", "Sending results back" and "Three things only you can decide" (reworded only where the merge changes them), and keep the table of the ten lane lists as a section near the end, with each lane's count recomputed from its for-aaron.md as it is now.
MORE RULES FOR THIS FILE: (a) Do not state or guess the make or model of his laptop, graphics card or phone: write "your laptop" and give each tool's own stated requirement (memory, operating system) from the lane files. (b) The repository is public and this file is in it: no key, no private link, nothing about him beyond what a step needs. (c) The file must stay under 300 KB: where a lane's steps for one tool run past about 40 lines, give the short form here and link the lane's for-aaron.md section for the rest. (d) Every test id (T01, T02, ...) names the lane and tool it came from, so a result can be traced back. (e) Tools that are on two lanes' lists get one test, naming both lanes.`

const VERIFY_FORAARON = `[AGENT: verify-for-aaron]

${COMMON}

YOUR JOB: you are the independent checker of ${DOCS}/FOR_AARON.md, which another agent just assembled from the lanes' for-aaron.md files. Assume it has mistakes. Fix it in place.
1. Every test traces to a lane file: the tool, the link, the price and the steps must match what the lane's survey.md, trials.md or for-aaron.md says. The lanes' own checkers opened the live pages on 2026-11-10 and 2026-11-11, so do not re-open every page: re-open a live page where the merged text differs from the lane file, for every price and free-tier limit stated (record the date read), and for a sample of at least 25 other links spread across the sections. Correct what has changed or was wrong.
2. Every clip id and file name exists in /home/user/gtr/inputs/INPUTS.md.
3. Every command is valid for where it is meant to run (Windows PowerShell for the laptop section, curl for the API section), names real packages and real model files, and contains no key.
4. Nothing is promised that the tool's docs do not say. No advice, no ranking, no judging words.
5. Nothing personal beyond Aaron's name, and no private link.
6. No tool that could not run here and that Aaron could run is missing: compare against every lane's tools.json (for_aaron true, or tried false with a reason he could remove). Add what is missing. Tools he cannot run either are listed with the reason.
7. The counts at the top and the checklist table agree with the body.
8. The "what to send back" lines are specific enough for an agent to score the result later with gtr-eval (which files, in which format).
9. The file keeps the facts of the index it replaced (the studio library run for the clips, how to send results back, the three decisions only Aaron can make, the ten lane lists with current counts), names no make or model of his devices, holds no web address for the library, and is under 300 KB.
Append "## Verification log (verify-for-aaron, <date>)" with what you checked and changed.

The assembling agent's closing summary follows. Treat it as a claim to check:
`

const o = (label, ph) => ({ label, phase: ph, model: OPUS, effort: 'max', agentType: 'general-purpose' })
const tail = r => (r ? String(r) : '(it returned nothing: it may have been cut off. Check whatever is on disk and say what is missing.)')
phase('Merge')
const merged = await agent(FORAARON, o('for-aaron', 'Merge'))
phase('Verify')
const verify = await agent(VERIFY_FORAARON + tail(merged), o('verify-for-aaron', 'Verify'))
return { merged, verify }
