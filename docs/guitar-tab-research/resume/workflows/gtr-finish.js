export const meta = {
  name: 'gtr-finish',
  description: 'Guitar tab research, resumed: finish a cut-off gap-round check, refresh tools.json, and update and fact-check one lane\'s post section',
  phases: [
    { title: 'Verify', detail: 'verify-gapfill-<lane> continues the cut-off check (Opus 5.5, max)' },
    { title: 'Structure', detail: 'tools.json refresh', model: 'claude-sonnet-5-5' },
    { title: 'Update', detail: 'update-section-<lane> (Opus 5.5, max)' },
    { title: 'Check', detail: 'one or two independent checkers (Opus 5.5, max)' },
    { title: 'Repair', detail: 'repair-section-<lane> (Opus 5.5, max)' },
  ],
}

const OPUS = 'claude-opus-5-5'
const SONNET = 'claude-sonnet-5-5'
const mode = (args && args.mode) || ''
const lane = (args && args.lane) || ''
const round = (args && args.round) || '2'
const tasks = (args && args.tasks) || '(the task list is the critic\'s list for this lane in /home/user/blog/docs/guitar-tab-research/GAPS.md)'
if (!lane || !mode) { throw new Error('need args.lane and args.mode') }
const TITLES = {
  'audio-to-notes': 'Turning sound into notes',
  'chords-beats-key': 'Chords, beat, key and tuning',
  'source-separation': 'Splitting a song into instruments',
  'guitar-tab': 'Choosing the string and fret',
  'fingerstyle-voices-taps': 'Melody, bass and taps from one guitar',
  'video-hands-fretboard': 'Reading hands and the fretboard from video',
  'web-tab-render': 'Showing, editing and playing a tab in the browser',
  'browser-audio-sync': 'Metronome and sync in the browser',
  'apps-survey': 'Apps that already do some of this',
  'hosted-apis': 'Services an agent can call over the internet',
  'chains': 'Tools handing off to each other',
}
const BIG = '/home/user/gtr/lanes/' + lane
const DOCS = '/home/user/blog/docs/guitar-tab-research'
const DOC = DOCS + '/lanes/' + lane
const LANE = DOC
const OUT = '/tmp/claude-0/-home-user-blog/59564c1e-7fb4-5384-ab71-b563810cf682/scratchpad/post/' + lane + '.md'
const MEDIA = '/home/user/blog/public/media/guitar-tab-tools'

const GCOMMON = `PROJECT
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

const VERIFY = `[AGENT: verify-gapfill-${lane}]

${GCOMMON}

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

const UCOMMON = `PROJECT
Aaron Orelup (aaronorelup.com) had a team of AI agents research the tools a web app would need to build guitar tablature step by step with a person in the loop. Nothing was built. Ten lanes each surveyed one category, ran what they could on a cloud box (4 CPU cores, 15 GB of memory, no graphics card), and read the licenses. The findings are becoming ONE blog post on Aaron's site, a draft he reads first. Each lane has a section of that post as a fragment file. You work on the fragment for the lane "${lane}": ${OUT} .

THE SOURCES (the only place facts may come from): ${LANE}/tools.json, ${LANE}/trials.md (run ids like r0123, scoring ids like e0456. It now has one or more sections headed "## Gap round N" near the end and new verification logs), ${LANE}/survey.md, ${LANE}/for-aaron.md, the files under ${LANE}/samples/, /home/user/gtr/inputs/INPUTS.md (the test clips), the ledgers /home/user/gtr/ledger/runs.jsonl and /home/user/gtr/eval/ledger/evals.jsonl, and ${DOCS}/ENVIRONMENT.md . The writing rules are /home/user/blog/WRITING.md : read it in full first.

THE RULES OF THIS POST
1. FACTS ONLY. Aaron asked for no judging, grading, ranking, "best", "winner", scores, or recommendations: describe what went in and what came out and let the reader judge. No evaluative words about a tool or a result. No "score", "accuracy", "F1", "precision" or "recall" as words, and no percentages standing in for a grade: give counts (found N of M real notes, N extra notes, the right chord for N of M seconds, N of M beats within 70 ms, the same string and fret for N of M matched notes). For separated stems give the measured figure with its unit and plain definition once, with no adjective. Tools are listed alphabetically, never by result. No advice. A tool's own claim appears only as an attributed quote. Failures and things not run are stated as plainly as the rest.
2. NOTHING IS ADDED. Every number, name, version, command, price and quote must be in the sources, exactly. Where a verification log corrects an earlier statement, the correction is the truth.
3. VOICE: Aaron, first person, talking to a friend ("I", "my agents ran", "Claude"). Short sentences, plain words, contractions, every term a newcomer would not know explained in a few words the first time. No em dashes. NO SEMICOLONS anywhere in running text or tables. No exclamation marks, no emoji, no hype words (the site's checker rejects: incredible, powerful, seamless, unlock, leverage, delve, game-changing, "it turns out", "in this post", "here's the thing", "the short answer", "tl;dr"). No telling the reader how to read. No closing moral.
4. VERBATIM TEXT GOES IN CODE: commands, file names, error messages, tool output and every quoted license clause go in inline code or a fenced text block, copied character for character.
5. NEVER PUBLISH: nothing about Aaron's job, money or plans, no private links, no keys, no description of his computer beyond "my laptop". Do not link any other post of his.
6. WHERE YOU MAY WRITE: the fragment file ${OUT} and pictures under ${MEDIA}/ (WebP, at most 1400 px wide and 150 KB, named ${lane}-<what>.webp). Nothing else. No git commands that change state. No audio or video under /home/user/blog.\n8. CHARACTERS: the site's fonts have no glyph for symbols such as the greater-or-equal sign, music notes, arrows, check marks or box-drawing characters, and a site test fails on them even inside code. Write them in words, and where a verbatim excerpt holds one, end the excerpt before it or describe that line instead of quoting it. Check with: grep -nP '[^\\x00-\\x7F]' on the fragment, and keep only accented letters, curly quotes and the multiplication sign if they were already there.`

const UPDATE = `[AGENT: update-section-${lane}]

${UCOMMON}

YOUR JOB: the fragment was written and fact-checked before the lane's gap rounds ran. Since then the lane's record changed: tools were run that had been skipped, reasons were corrected, licenses and terms were added, tools.json was refreshed. Bring the fragment up to date and change nothing else.
1. Read the fragment in full, then every "## Gap round" section and every verification log dated after the fragment was written in trials.md, the changed sections of survey.md and for-aaron.md, and tools.json.
2. Update the fragment, keeping its exact structure (the marker lines <!-- RUNDOWN -->, <!-- SECTION -->, <!-- IMAGES -->, <!-- PENDING MEDIA -->, <!-- NUMBERS -->, the heading, the three folded blocks and the shape of each entry):
   - a tool that now ran gets a full entry in "Every tool that ran" in the same shape as the others, in alphabetical place, and leaves the "didn't run" block.
   - a tool whose not-run reason changed gets the new reason.
   - new licenses or terms for tools that ran go into the license table.
   - every count in the RUNDOWN and in the section's opening sentences (how many tools looked at, how many ran) is recomputed from tools.json as it is now, and any statement the gap rounds made untrue is corrected.
   - add a picture only if a gap round produced one that shows something the existing pictures do not.
   - add new audio or video outputs to PENDING MEDIA if they still exist on disk, and remove entries whose files no longer exist.
   - add every new or changed number to NUMBERS with its source.
3. Do not rewrite text that is still true. Do not shorten existing entries in the folded blocks.
3b. LENGTH OF THE TWO OPEN PARTS (the site caps the open part of a post, and this post has eleven sections): the RUNDOWN bullet is a bold lead that carries the point, plus at most one more short sentence, about 45 words in all. The section's opening paragraph, between the heading and the first picture or folded block, is at most three short sentences, about 60 words: what this step is for (one clause, for a newcomer), how many tools were looked at and how many ran, and one plain outcome as counts. Anything else those two parts said must still be findable in the folded blocks: check each fact you cut is there, and add it to the fitting entry if it is not. Counts stay exact.
3c. Right after the opening paragraph and the pictures, and before the first folded block, there must be no other open text.
4. Run the same greps as the original writer on the prose: semicolons, dashes, exclamation marks, the banned words, and score|accura|precision|recall|best|better|worse|winner|recommend|impressive|reliable|struggl .
If the gap rounds changed nothing that the fragment says or omits, change nothing and say so.
Your final message: at most 15 lines: what you added, moved and corrected, with counts.`

const CHECK = `[AGENT: check-update-${lane}]

${UCOMMON}

YOUR JOB: you are the independent checker of an update another agent just made to the fragment (its summary is below). Assume mistakes. This time you FIX the fragment in place.
- For every entry it added or changed: check every number, version, command, run id, eval id, format statement and quote against the sources, recomputing counts from the ledgers or saved outputs where you can.
- Recount the totals in the RUNDOWN and the section opening from tools.json: tools looked at, tools that ran. Check that every tool with tried true in tools.json and a run that produced output has an entry in "Every tool that ran", that no tool is in both blocks, and that the lists are alphabetical.
- Check the facts-only rule and the voice rules on every changed line, and that all verbatim text is in code.
- Check every path under PENDING MEDIA exists and every picture named exists, is WebP and at most 150 KB.
- Check the structure is intact: the five marker lines in order, each details block with a blank line after its summary line and before its closing tag.
Your final message: at most 15 lines: what you checked and what you fixed.

The updating agent's summary follows. Treat it as a claim to check:
`

const SCOMMON = `PROJECT
Aaron Orelup (aaronorelup.com) had a team of AI agents research the tools a web app would need to build guitar tablature step by step with a person in the loop: from a full song (notes, chords, melody, tempo, isolated tracks) and from a fingerstyle guitar video (melody, bass and taps, and the fretting and picking hands tracked from video), plus metronome sync, reference playback of the correct tab, editable tablature, and user corrections (capo, tuning, wrong string or fret) that re-run the analysis. Nothing was built. Ten lanes each surveyed one category, ran what they could on a cloud box (4 CPU cores, 15 GB of memory, no graphics card; every timed run was pinned to 2 cores), and read the licenses. Independent agents then checked every run and every quote. Now the findings become ONE blog post on Aaron's site, a draft he will read first. You work on one section of it: the lane "${lane}", under the heading "${TITLES[lane]}".

THE SOURCES (the only place facts may come from):
- ${LANE}/tools.json (start here), ${LANE}/trials.md (what ran, with run ids like r0123 and scoring ids like e0456), ${LANE}/survey.md (docs, formats, licenses with quoted clauses), ${LANE}/for-aaron.md (steps for what could not run here), and the files under ${LANE}/samples/ .
- /home/user/gtr/inputs/INPUTS.md: the shared test clips. S1 single-note melody, S2n and S2s two-voice fingerstyle (nylon, steel), S3 strummed chords, S4 a four-instrument band mix with its true stems, S5capo2 and S5dropd the fingerstyle piece with a capo and in Drop D, S6taps fingerstyle plus percussive taps, S7flat30 chords tuned 30 cents flat: all synthesized, so every note is known. R1a, R1b, R1c real solo guitar from the GuitarSet dataset with its annotations. R2 a real band song with singing. R3a, R3b, R3c real guitar videos. Name a clip in words the first time ("S2n, a 29-second fingerstyle clip I synthesized so every note is known"), then by id.
- The ledgers /home/user/gtr/ledger/runs.jsonl and /home/user/gtr/eval/ledger/evals.jsonl, and ${DOCS}/ENVIRONMENT.md .
- The writing rules: /home/user/blog/WRITING.md . Read it in full before writing a word. It is the law for voice.

THE RULES OF THIS POST
1. FACTS ONLY. Aaron asked for this in so many words: no judging, grading, ranking, "best", "winner", scores, or recommendations. Describe what went in and what came out and let the reader judge. So:
   - No evaluative words about a tool or a result: not good, bad, better, worse, best, strong, weak, accurate, inaccurate, reliable, impressive, disappointing, struggled, failed badly, nailed, clean, messy, promising, usable, state of the art, and nothing like them. "It returned 97 notes. 84 of the 90 real notes were among them." is the register.
   - No "score", "accuracy", "F1", "precision" or "recall" as words, and no percentages standing in for a grade. Give counts: found N of M real notes, N extra notes that were not played, the right chord for N of M seconds, N of M beats within 70 ms, the same string and fret for N of M matched notes. For separated stems, where no count exists, give the measured figure with its unit and plain definition once (for example "13.4 dB, on a scale where a higher number means less of the other instruments leaked in"), with no adjective.
   - No ordering by result. List tools alphabetically. Never say which to use, and never say what Aaron should do.
   - A tool's own claim may appear only as a quote attributed to its makers.
   - What failed is stated the same plain way as what worked. What was not run is said plainly with the reason.
2. NOTHING IS ADDED. Every number, name, version, command, price and quote must be in the sources above, exactly. Do not round in a way that changes meaning. If the sources disagree with each other, use the verified text (a "verifier" correction or the verification log wins) and note the place under NUMBERS. If something is marked UNVERIFIED in the sources, either leave it out or say that it was not verified.
3. VOICE: Aaron, first person, talking to a friend. "I", "my agents ran", "Claude". Short sentences, plain words, contractions. Explain every term a newcomer would not know in a few words the first time (a stem is one instrument's track pulled out of a mix; MIDI is a list of notes with start times; a capo is a clamp across the strings that raises every note; a tab is guitar music written as fret numbers on six lines). No em dashes. NO SEMICOLONS anywhere in running text or tables. No exclamation marks, no emoji, no hype words (the site's checker rejects: incredible, powerful, seamless, unlock, leverage, delve, game-changing, "it turns out", "in this post", "here's the thing", "the short answer", "tl;dr"). No telling the reader how to read. No closing moral.
4. VERBATIM TEXT GOES IN CODE. Commands, file names, error messages, tool output and every quoted license clause go in inline code or in a fenced block marked text, never in running prose, because the checker scans prose for semicolons and banned words and a quote must not be altered. A quote is copied character for character from the lane file.
5. NEVER PUBLISH: nothing about Aaron's job, money or plans, no private links, no keys. Do not link any other post of his.
6. Links: tools link to their own home or repository. The full record links to the research folder as https://github.com/aaronorelup/blog/tree/main/docs/guitar-tab-research/lanes/${lane} .
7. WHERE YOU MAY WRITE: the fragment file ${OUT} and pictures under ${MEDIA}/ . Nothing else. No git commands that change state. No audio or video under /home/user/blog.\n8. CHARACTERS: the site's fonts have no glyph for symbols such as the greater-or-equal sign, music notes, arrows, check marks or box-drawing characters, and a site test fails on them even inside code. Write them in words, and where a verbatim excerpt holds one, end the excerpt before it or describe that line instead of quoting it. Check with: grep -nP '[^\\x00-\\x7F]' on the fragment, and keep only accented letters, curly quotes and the multiplication sign if they were already there.`

const CHECK_NUMBERS = `[AGENT: check-numbers-${lane}]

${SCOMMON}

YOUR JOB: you are an independent fact-checker of the fragment ${OUT}, which another agent wrote. Do not edit it: report problems. Your lens is NUMBERS, NAMES AND QUOTES. Assume it has mistakes.
- Check EVERY number, count, version, time, memory figure, price, run id, eval id, command, file format and tool name in the RUNDOWN and SECTION parts against the sources (the lane's trials.md, survey.md, tools.json, the ledgers). Where the lane file carries a verifier's correction, the corrected value is the truth. Recompute counts from the ledgers or the saved outputs where you can.
- Check every quoted license clause character for character against survey.md, and that its link is the one given there.
- Check every "did not run" reason against the lane files.
- Check the alphabetical order, and that no tool that ran is missing from the first block and no tool is in the wrong block.
- Open each picture under ${MEDIA}/ that the fragment uses: it exists, is WebP, at most 150 KB, and shows what its alt text and caption say.
- Check each path under PENDING MEDIA exists.
Return every problem with the exact text, what is wrong, and the correct value with its source. Also say how many items you checked and how many you could not check.`

const CHECK_VOICE = `[AGENT: check-voice-${lane}]

${SCOMMON}

YOUR JOB: you are an independent checker of the fragment ${OUT}, which another agent wrote. Do not edit it: report problems. Your lens is THE RULES: facts only, and Aaron's voice. Assume it breaks them somewhere.
- Rule 1, line by line through the RUNDOWN and SECTION parts: any evaluative word or implied grade, any "score", "accuracy", "F1", "precision", "recall", any percentage used as a grade, any ordering by result, any advice or recommendation, any tool claim not attributed, any sentence that tells the reader what to conclude. Quote each one and give a plain factual rewording that keeps the same numbers.
- WRITING.md, line by line: em dashes, semicolons in prose or tables, exclamation marks, banned words, the two-sentence contrast flip, cheekiness, telling the reader how to read, a closing moral, terms a newcomer would not know that are not explained, sentences that are long or stacked with commas or parentheses, anything not in first person as Aaron.
- Verbatim text outside code: any command, quote or tool output sitting in running prose.
- Never-publish: anything personal, any private link, any link to another post.
- Markup: each details block has a blank line after its summary line and before its closing tag, no style attributes, the ao-compare markup is as specified, tables are well-formed.
Return every problem with the exact text and the rewording.`

const PROBLEMS_SCHEMA = {
  type: 'object',
  properties: {
    problems: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          wrong: { type: 'string' },
          correction: { type: 'string' },
          source: { type: 'string' },
        },
        required: ['wrong', 'correction'],
      },
    },
    checked: { type: 'string' },
  },
  required: ['problems'],
}

const o = (label, ph) => ({ label, phase: ph, model: OPUS, effort: 'max', agentType: 'general-purpose' })
const LOST = `(The earlier agent's closing summary was lost: the whole run was stopped by hand on 2026-11-11 at about 01:25 UTC, when the account's usage limit was nearly used up, and it resumed on ${'2026-11-12'}. Work from what is on disk.)`
const out = { lane, mode }

if (mode === 'gapverify' || mode === 'json') {
  if (mode === 'gapverify') {
    phase('Verify')
    const CONT = `

CONTINUING A CUT-OFF CHECK: an earlier run of you may have been stopped partway. If trials.md already ends with a section "## Verification log (verify-gapfill-${lane}, round ${round}, ...)", read it first: keep what it finished, do not repeat those items unless one looks wrong, and continue under the same heading with the items it did not reach (the gap round's other tools and runs, the survey.md and for-aaron.md edits, the license quotes, the size and secrets checks). If no such section exists, start one. End the log with a line saying it was completed on today's date (date -u +%F) after the stop. The date in ENVIRONMENT.md's "Interruptions" section explains the stop.
`
    out.verify = await agent(VERIFY + CONT + LOST, o('verify-gapfill-' + lane, 'Verify'))
  }
  phase('Structure')
  out.summary = await agent(JSON_JOB, { label: 'json-' + lane + '-round-' + round, phase: 'Structure', model: SONNET, effort: 'high', agentType: 'general-purpose', schema: SUMMARY_SCHEMA })
  return out
}

if (mode === 'update') {
  phase('Update')
  out.update = await agent(UPDATE, o('update-section-' + lane, 'Update'))
  phase('Check')
  out.check = await agent(CHECK + (out.update || LOST), o('check-update-' + lane, 'Check'))
  return out
}

if (mode === 'check') {
  phase('Check')
  out.check = await agent(CHECK + LOST + ' The update folded gap round 2 of this lane into the fragment and shortened its two open parts. Its own check never ran, so check the whole fragment against the lane record as it is now.', o('check-update-' + lane, 'Check'))
  return out
}

if (mode === 'first') {
  phase('Update')
  const FIRST = UPDATE.replace("the fragment was written and fact-checked before the lane's gap rounds ran.", "the fragment is a first draft. It was written while the lane's gap rounds were still running and it has never been fact-checked (two independent checkers read it after you). Treat every statement in it as unchecked: where you touch an entry, check it against the sources.")
  if (FIRST === UPDATE) { throw new Error('first-draft sentence not found in UPDATE') }
  out.update = await agent(FIRST, o('update-section-' + lane, 'Update'))
  phase('Check')
  const checks = (await parallel([
    () => agent(CHECK_NUMBERS, { ...o('check-numbers-' + lane, 'Check'), schema: PROBLEMS_SCHEMA }),
    () => agent(CHECK_VOICE, { ...o('check-voice-' + lane, 'Check'), schema: PROBLEMS_SCHEMA }),
  ])).filter(Boolean)
  const problems = checks.flatMap(c => c.problems || [])
  log(lane + ': ' + problems.length + ' problems reported')
  out.problems_reported = problems.length
  phase('Repair')
  if (problems.length) {
    out.repair = await agent(`[AGENT: repair-section-${lane}]

${SCOMMON}

YOUR JOB: two independent checkers reviewed the fragment ${OUT}. Their problems are below as JSON. For each one: check it against the sources yourself (a checker can be wrong), fix the fragment where the problem holds, and keep every rule above while you do. Do not add anything new. Keep the two open parts short: the RUNDOWN bullet about 45 words, the section's opening paragraph at most three short sentences, about 60 words. When you are done, re-run the greps for semicolons, dashes, banned words and judging words on the prose, and update the NUMBERS part. Your final message: how many problems you applied, how many you rejected and why, in at most 15 lines.

PROBLEMS:
${JSON.stringify(problems, null, 1)}`, o('repair-section-' + lane, 'Repair'))
  }
  return out
}

throw new Error('unknown mode ' + mode)
