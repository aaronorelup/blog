export const meta = {
  name: 'gtr-gapfill',
  description: 'Guitar tab research: close listed gaps in one lane (run what was skipped, look up what is missing), verify, refresh tools.json',
  phases: [
    { title: 'Fill', detail: 'gapfill-<lane> (Opus 5.5, max)' },
    { title: 'Verify', detail: 'verify-gapfill-<lane> (Opus 5.5, max)' },
    { title: 'Structure', detail: 'tools.json refresh', model: 'claude-sonnet-5-5' },
  ],
}

const OPUS = 'claude-opus-5-5'
const SONNET = 'claude-sonnet-5-5'
const lane = (args && args.lane) || ''
const tasks = (args && args.tasks) || ''
const round = (args && args.round) || '1'
if (!lane || !tasks) { throw new Error('need args.lane and args.tasks') }
const BIG = '/home/user/gtr/lanes/' + lane
const DOCS = '/home/user/blog/docs/guitar-tab-research'
const DOC = DOCS + '/lanes/' + lane

const COMMON = `PROJECT
You are one agent in a research project for Aaron Orelup (aaronorelup.com), coordinated by an orchestrator who will assemble everyone's files into a research folder and a blog post draft. The thing being researched (NOT built) is a web app that builds guitar tablature step by step with a human in the loop: from a full song (notes, chords, melody, tempo, isolated tracks) and from a fingerstyle guitar video (melody, bass and taps, and the fretting and picking hands tracked from video), plus metronome sync, reference playback of the correct tab, editable tablature, and user corrections (capo, tuning, wrong string or fret) that re-run the analysis with those constraints. Ten lanes each surveyed one category and tried its tools on one shared set of test clips. Read ${DOCS}/PLAN.md and ${DOCS}/ENVIRONMENT.md, and /home/user/gtr/inputs/INPUTS.md (the clips and their ground truth).

YOUR LANE: ${lane}. Its record is ${DOC}/ : trials.md (what ran, with run ids, and a verification log at the end), survey.md (docs, formats, licenses with quoted clauses, and its own verification log), for-aaron.md (steps for what could not run here), tools.json, samples/, scripts/. Big files are under ${BIG}/ . Read trials.md and survey.md before you start: you are adding to a record that was already checked, in the same format, and you must not break what is there.

HARD RULES
1. FACTS ONLY. What went in, what came out, how long it took, what a license says. No judging, grading, ranking, "best", "better", "winner", "recommended", "impressive", "poor", scores presented as verdicts, or advice. A number measured against ground truth is a fact: give it with how it was computed.
2. NEVER FAKE ANYTHING. If something did not run, say so and why, with evidence. Do not fill gaps from memory: check the live source. If unsure, write UNVERIFIED and what would settle it.
3. LICENSES AND TERMS are quoted exactly, in quotation marks, with the URL read and the date (date -u +%F).
4. THE BOX: 4 vCPU, 15 GiB RAM, no swap, no GPU. Disk is limited and shared: check df -h / first. You may install what a task needs while at least 4 GB stays free: one tool at a time, the smallest checkpoint a model offers, and when a tool is done save its uv pip freeze next to its samples and delete its venv and weights. Start every shell command with: source /home/user/gtr/env.sh (if it prints a DISK notice, follow it). Make environments with uv: uv venv --python 3.11 ${BIG}/venv-<tool> then uv pip install --python ${BIG}/venv-<tool>/bin/python <packages> (CPU-only torch by default).
5. Timed or heavy runs go through gtr-run (two slots of 2 cores): gtr-run --lane ${lane} --tool <tool> --label "<what>" --input <file> -- <command...> . Quote run ids and say "2 cores" (or --nolock, unpinned, if you had to use that, and why). For anything over about 5 minutes including the wait for a slot, run it in the background with a log file and poll: one shell call is cut off at 10 minutes. Score with /home/user/gtr/bin/gtr-eval (README: ${DOCS}/scripts/gtr-eval/README.md) and quote eval ids.
6. WHERE YOU MAY WRITE: ${BIG}/ (big things) and ${DOC}/ (the record: no audio or video, no file over 300 KB). Touch nothing else under /home/user/blog. Run NO git command that changes state: the orchestrator commits.
7. The repo is public: never write or print a key or token, nothing personal about Aaron beyond his name and site, and no description of his computer.
8. If the box's permission system refuses a step (running downloaded binaries, installing a cloned repository, ticking a consent box), do not work around it: record it as NOT RUN HERE with that reason and write the steps for Aaron.
9. SAVE AS YOU GO: append each finished item to the record at once. If a section headed "## Gap round ${round}" already exists in trials.md, an earlier run of you was cut off: continue from where it stops.
10. THE WEB: outbound HTTPS is open. github.com web pages and api.github.com answer 403 from this box: use raw.githubusercontent.com, git clone --depth 1, or your web fetch and search tools.
11. You may hand grunt work to helper agents on Sonnet (model "sonnet") if you have an agent-spawning tool. You remain responsible for what they return.
12. YOUR FINAL MESSAGE is read by the orchestrator: at most 30 lines.`

const FILL = `[AGENT: gapfill-${lane}]

${COMMON}

YOUR JOB: close the gaps listed below in this lane's record. For each gap: do what closes it, then write the result into the record in the lane's existing format.
- A tool you run gets a full section in trials.md, placed under a new heading "## Gap round ${round}" at the end of the tool sections and before the verification log, in the same shape as the other tool sections (what it is and where it came from, install commands and sizes, each run with clip, exact command, run id, cores, wall-clock, peak memory, output format and counts, gtr-eval numbers with eval ids, input and output format facts, constraints accepted, failures). Samples go under samples/<tool>/, scripts under scripts/, audio and video stay under ${BIG}/out/ and are added to "## Media kept outside git".
- A tool that still cannot run gets its NOT RUN HERE reason corrected to what is true now, with evidence, and steps in for-aaron.md.
- A missing license, format or fact goes into the tool's section of survey.md, quoted and linked, with the date. A new tool gets a full survey section in the same shape as the others, and a line in the tool list.
- A wrong or unsupported statement is corrected where it stands, with a short note "(corrected in gap round ${round}: ...)".
Where an earlier NOT RUN reason was the low-disk notice, the disk has more room now: run the tool.
Give up on one item after about 25 minutes of failed installing and record what failed. Do the items in the order listed. When you finish, list in your final message, item by item: closed (how), or still open (why).

THE GAPS TO CLOSE:
${tasks}`

const VERIFY = `[AGENT: verify-gapfill-${lane}]

${COMMON}

YOUR JOB: you are the independent checker of what a gap-filling agent just added to this lane's record: the section "## Gap round ${round}" in trials.md, its edits to survey.md and for-aaron.md, and the new files under samples/ and scripts/. Assume mistakes. Fix the files in place.
- Every run cited is in /home/user/gtr/ledger/runs.jsonl with that command, cores, wall-clock and exit code. A failed run is not described as a success. Every eval id is in /home/user/gtr/eval/ledger/evals.jsonl with those numbers: re-run the scoring with --no-ledger and compare.
- Every output and sample file named exists and holds what the text says (recount).
- Re-run one representative trial per new tool when it takes under about 5 minutes (label starting "verify") and compare.
- Every new license or terms quote is verbatim at its URL. Code, weights and data licenses are not mixed up.
- Every NOT RUN HERE reason is specific and true.
- No judging language, no advice, no secrets, nothing personal, no audio or video and no file over 300 KB under ${DOC}/ .
- The earlier parts of the record were not damaged (headings, tables and the earlier verification logs are still intact).
Append "## Verification log (verify-gapfill-${lane}, round ${round}, <date>)" to trials.md with what you checked, what you changed and what stays unverified.

The gaps the agent was asked to close:
${tasks}

Its closing summary follows. Treat it as a claim to check:
`

const JSON_JOB = `[AGENT: json-${lane}-round-${round}]

You are refreshing one lane (${lane}) of a research project on tools for a guitar tablature web app. Its reports were just extended by a gap-filling round: ${DOC}/survey.md, ${DOC}/trials.md (see "## Gap round ${round}" and the verification logs at the end) and ${DOC}/for-aaron.md . An earlier ${DOC}/tools.json exists.

Update ${DOC}/tools.json so that it matches the three reports as they are now: add objects for new tools, and update the objects of tools whose facts changed (tried, tried_how, runs, not_run_reason, for_aaron, license, inputs, outputs, constraints_accepted, handoffs_out, unverified). Keep the same shape as the existing objects: name, kind, what, url, version, tried, tried_how ("local-cpu", "public-space", "api", "browser-headless" or null), runs [{run_id, input_id, cores, wall_s, peak_mb, exit_code, output_files, metrics}], not_run_reason, for_aaron, callable_via, inputs, outputs, constraints_accepted, license {code {spdx, quote, url}, weights {name, quote, url}, training_data [{name, license, quote, url}], service_terms [{topic, quote, url}]}, pricing, handoffs_out [{to, via_format, evidence}], unverified. Set "generated" to today's UTC date.
Rules: copy facts exactly as the reports state them. Add NO fact that is not in those three files. Where a verification log corrects an earlier statement, the correction wins. Do not paraphrase license quotes. Touch no other file and run no git commands. Check the file parses (python3 -m json.tool ${DOC}/tools.json > /dev/null).
Then report the counts.`

const SUMMARY_SCHEMA = {
  type: 'object',
  properties: {
    lane: { type: 'string' },
    tools_total: { type: 'integer' },
    tools_tried: { type: 'integer' },
    tools_not_run: { type: 'integer' },
    tools_for_aaron: { type: 'integer' },
    tried_names: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['lane', 'tools_total', 'tools_tried', 'tools_for_aaron'],
}

const o = (label, ph) => ({ label, phase: ph, model: OPUS, effort: 'max', agentType: 'general-purpose' })
const tail = r => (r ? String(r) : '(it returned nothing: it may have been cut off. Check whatever is on disk.)')

phase('Fill')
const fill = await agent(FILL, o('gapfill-' + lane, 'Fill'))
phase('Verify')
const verify = await agent(VERIFY + tail(fill), o('verify-gapfill-' + lane, 'Verify'))
phase('Structure')
const summary = await agent(JSON_JOB, { label: 'json-' + lane + '-round-' + round, phase: 'Structure', model: SONNET, effort: 'high', agentType: 'general-purpose', schema: SUMMARY_SCHEMA })
return { lane, round, fill, verify, summary }
