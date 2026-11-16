export const meta = {
  name: 'gtr-phase-c3',
  description: 'Guitar tab research phase C3: write the handoff graph as facts from every lane, then check each edge against its evidence',
  phases: [
    { title: 'Graph', detail: 'handoff-graph (Opus 5.5, max)' },
    { title: 'Verify', detail: 'two independent checkers: evidence and formats (Opus 5.5, max)' },
    { title: 'Repair', detail: 'apply confirmed corrections (Opus 5.5, max)' },
  ],
}

const OPUS = 'claude-opus-5-5'
const DOCS = '/home/user/blog/docs/guitar-tab-research'

const COMMON = `PROJECT
You are one agent in a research project for Aaron Orelup (aaronorelup.com), coordinated by an orchestrator who will assemble everyone's files into a research folder and a blog post draft. The thing being researched (NOT built) is a web app that builds guitar tablature step by step with a human in the loop. Two inputs: (1) full-song audio or video, from which it extracts notes, chords, melody and tempo and isolates tracks; (2) fingerstyle guitar video, from which it isolates melody, bass and taps and tracks the fretting and picking hands from video to tablature. It also needs metronome sync, reference playback of the correct tab, fully editable tablature, and user corrections (capo, tuning, wrong string or fret) that re-run the analysis with those constraints. The finished program would chain roughly 24 tools with cross-feedback between them (for example, fingering seen in the video constraining the pitch guesses from the audio).

WHERE THINGS STAND. Ten lanes have each surveyed one category and tried its tools on one shared set of test clips, and an eleventh ("chains") ran cross-lane handoff chains. Read:
- ${DOCS}/PLAN.md, ${DOCS}/ENVIRONMENT.md, /home/user/gtr/inputs/INPUTS.md (the test clips).
- ${DOCS}/lanes/<lane>/ for each lane: tools.json (structured facts: start here), trials.md (what was run, with run ids), survey.md (docs, formats, licenses, and a "## Handoff facts" section). Lanes: audio-to-notes, chords-beats-key, source-separation, guitar-tab, fingerstyle-voices-taps, video-hands-fretboard, web-tab-render, browser-audio-sync, apps-survey, hosted-apis, and chains (trials.md only).
- The run ledger /home/user/gtr/ledger/runs.jsonl and the scoring ledger /home/user/gtr/eval/ledger/evals.jsonl.

HARD RULES
1. FACTS ONLY. No judging, grading, ranking, "best", "better", "winner", "recommended", scores presented as verdicts, or advice about what to choose. Do NOT pick "the 24 tools": show what exists at each stage and what connects to what.
2. NEVER FAKE ANYTHING. Every statement must be traceable to a lane file, a ledger line or a URL. If it is not, leave it out or mark it UNVERIFIED with what would settle it.
3. Start every shell command with: source /home/user/gtr/env.sh . The disk is tight: install nothing large.
4. WRITE ONLY where your job says. Touch nothing else under /home/user/blog. Run NO git command that changes state. No audio or video under /home/user/blog and no file over 300 KB there.
5. The repo is public: no keys, nothing personal about Aaron beyond his name and site.
6. SAVE AS YOU GO. If your output file already exists when you start, an earlier run of you was cut off: read it and continue.
7. YOUR FINAL MESSAGE is read by the orchestrator: at most 30 lines.`

const GRAPH = `[AGENT: handoff-graph]

${COMMON}

YOUR JOB: write ${DOCS}/HANDOFFS.md, ${DOCS}/handoffs.json and a diagram under ${DOCS}/handoffs/ : which of the tools the finished program's agents could call, with what input and output, and how each could hand off to the next, stated as facts.

HANDOFFS.md:
1. THE STAGES, in pipeline order: input (audio file, video file, link) -> source separation -> notes and melody -> chords, beat, downbeat, tempo, key, tuning -> string and fret assignment -> fingerstyle voices and taps -> video hands and fretboard -> tab file formats -> rendering, editing and playback in the browser -> metronome and sync -> user corrections that re-run analysis. Under each stage, a table of every tool the lanes looked at, alphabetical, with: how an agent calls it (CLI, Python, HTTP, WASM, browser JavaScript, desktop only), input, output (format and fields), where it ran (here on 2 CPU cores with the measured wall-clock for a named clip and the run id; on a public Space or an API; not run, with the reason in a few words), and the license ids for code and weights exactly as the lane recorded them. Give the count of tools at each stage. No picks.
2. THE EDGES, one fact per line, grouped by joint: "X outputs <format with fields>, which Y accepts as <input>." Each edge carries its evidence: TESTED with the run ids of a run in which Y really consumed X's output (from the chains lane or from a lane that used another lane's output), or DOCS with the link or lane-file reference for each half. Name the glue an edge needed (for example: "needs a tempo to turn seconds into note lengths", "stereo 44.1 kHz down to mono 22.05 kHz", "stem called other, not guitar").
3. CONSTRAINT EDGES, for the user's corrections: for capo, tuning, a pinned string or fret, a tempo or key hint, a note range: which tools accept it, through which parameter, and what was observed when it was used (run ids). And which tools accept none.
4. CROSS-FEEDBACK EDGES the brief asks about (video constraining audio and the reverse): state only what data exists on each side (formats, rates, coordinates), what the chains lane measured when it lined them up, and whether any tool that was tried takes the other side's output as a constraint.
5. WHERE NOTHING CONNECTS: joints where no tool that ran here accepts the other's output without glue, and stages where nothing ran here.
6. COUNTS: tools in total, tools that ran here, ran elsewhere (Space or API), not run with steps for Aaron, not run with nothing to run. Compute them from the tools.json files with a script (save it as ${DOCS}/handoffs/count_tools.py) and state the counting rule in one sentence. A tool that appears in two lanes is counted once.
handoffs.json: {"nodes": [{"id", "name", "stage", "lane", "status": "ran-here" | "ran-elsewhere" | "for-aaron" | "not-runnable", "callable_via": [...]}], "edges": [{"from", "to", "format", "glue", "evidence_type": "tested" | "docs", "evidence": [...]}]}.
The diagram: draw the graph with Graphviz (apt package graphviz, through: flock /home/user/gtr/locks/apt.lock apt-get install -y graphviz) from handoffs.json with a script kept beside it (${DOCS}/handoffs/make_diagram.py): stages as columns left to right, tools as nodes, tested edges solid and docs-only edges dashed, tools that did not run here drawn with a dashed outline. Keep it legible: if the full graph is too dense, draw one overview (stages, with counts) and one diagram per input path (full song; fingerstyle video), each as SVG and as a 1600 px wide PNG of at most 300 KB.`

const VERIFY_EVIDENCE = `[AGENT: verify-handoffs-evidence]

${COMMON}

YOUR JOB: you are an independent checker of ${DOCS}/HANDOFFS.md and ${DOCS}/handoffs.json. Another agent wrote them. Your lens is EVIDENCE. Do not edit the files: report what is wrong.
- For every edge marked TESTED: find the run ids in the run ledger and confirm that the consuming tool's input file really is the producing tool's output (compare the input hash in the ledger line with the output file, or read the script that was run). An edge whose consumer ran on the truth file, not on the producer's output, is not tested.
- For every edge marked DOCS: open the reference for each half and confirm it says what the edge says.
- For every "ran here" entry: the run id exists, exit code 0, and the wall-clock, cores and clip match the ledger.
- For every license id in the tables: it matches the lane's survey.md.
- The counts: re-run or re-derive them from the tools.json files and compare.
- Any sentence with no source.
Return the list of problems, each with the exact text, what is wrong, and the correction supported by a source. Say "refuted" only when you can show it. Also list what you could not check.`

const VERIFY_FORMATS = `[AGENT: verify-handoffs-formats]

${COMMON}

YOUR JOB: you are an independent checker of ${DOCS}/HANDOFFS.md and ${DOCS}/handoffs.json. Another agent wrote them. Your lens is FORMATS AND COMPLETENESS. Do not edit the files: report what is wrong.
- For every edge: does the stated output format of X (fields, units, sample rate, channels, time base) actually match what Y accepts, according to the lane files and the sample outputs saved under each lane's samples/ and /home/user/gtr/lanes/<lane>/out/ ? Open real files. Name any glue the edge leaves out.
- Missing edges: joints that a lane or the chains lane ran but the graph omits, and tools in a tools.json that the stage tables omit.
- Constraint edges: check each named parameter exists in the tool (in the lane's trials.md or the tool's own help output or source).
- Anything that picks, ranks or advises, and any judging word.
- The diagrams: every node and edge in a diagram is in handoffs.json, and the PNG files are at most 300 KB.
Return the list of problems, each with the exact text, what is wrong, and the correction supported by a source. Also list what you could not check.`

const PROBLEMS_SCHEMA = {
  type: 'object',
  properties: {
    problems: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          where: { type: 'string' },
          text: { type: 'string' },
          wrong: { type: 'string' },
          correction: { type: 'string' },
          source: { type: 'string' },
        },
        required: ['where', 'wrong', 'correction'],
      },
    },
    could_not_check: { type: 'array', items: { type: 'string' } },
    checked_counts: { type: 'string' },
  },
  required: ['problems'],
}

const o = (label, ph) => ({ label, phase: ph, model: OPUS, effort: 'max', agentType: 'general-purpose' })

phase('Graph')
const graph = await agent(GRAPH, o('handoff-graph', 'Graph'))

phase('Verify')
const checks = (await parallel([
  () => agent(VERIFY_EVIDENCE, { ...o('verify-handoffs-evidence', 'Verify'), schema: PROBLEMS_SCHEMA }),
  () => agent(VERIFY_FORMATS, { ...o('verify-handoffs-formats', 'Verify'), schema: PROBLEMS_SCHEMA }),
])).filter(Boolean)
const problems = checks.flatMap(c => c.problems || [])
log(problems.length + ' problems reported by the two checkers')

phase('Repair')
let repair = null
if (problems.length) {
  repair = await agent(`[AGENT: repair-handoffs]

${COMMON}

YOUR JOB: two independent checkers reviewed ${DOCS}/HANDOFFS.md, ${DOCS}/handoffs.json and the diagrams under ${DOCS}/handoffs/ . Their problem list is below as JSON. For each problem: check it against the source yourself (a checker can be wrong), then fix the files when it holds, and re-make the diagrams and the counts if nodes or edges changed. Where a problem does not hold, leave the text and say why. Append "## Verification log (two checkers and a repair pass, <date>)" to HANDOFFS.md listing each problem and what was done, and what the checkers said they could not check.

PROBLEMS:
${JSON.stringify(problems, null, 1)}

COULD NOT CHECK:
${JSON.stringify(checks.flatMap(c => c.could_not_check || []), null, 1)}`, o('repair-handoffs', 'Repair'))
}
return { graph, problems_reported: problems.length, repair }
