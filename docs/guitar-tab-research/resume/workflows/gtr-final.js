export const meta = {
  name: 'gtr-final',
  description: 'Guitar tab research: last fact-check of the whole post (the main read against the records, and the eleven sections against each other), then one repair pass',
  phases: [
    { title: 'Check', detail: 'check-main and check-cross, independent (Opus 5.5, max)' },
    { title: 'Repair', detail: 'repair-post (Opus 5.5, max)' },
  ],
}

const OPUS = 'claude-opus-5-5'
const DOCS = '/home/user/blog/docs/guitar-tab-research'
const SP = '/tmp/claude-0/-home-user-blog/59564c1e-7fb4-5384-ab71-b563810cf682/scratchpad'
const POST = '/home/user/blog/src/content/posts/guitar-tab-tools.md'

const COMMON = `PROJECT
Aaron Orelup (aaronorelup.com) had a team of AI agents research the tools a web app would need to build guitar tablature step by step with a person in the loop. Nothing was built. Ten lanes each surveyed one category, ran what they could on a cloud box (4 CPU cores, 15 GB of memory, no graphics card), and read the licenses. An eleventh group ("chains") ran tools from different lanes in a chain. Independent agents checked every lane, a critic listed 52 gaps, and gap rounds closed them. The findings are ONE blog post on Aaron's site. Every section of it has been written and fact-checked against its own lane. This is the last check of the whole post before Aaron reads it.

THE POST is ${POST} . It is ASSEMBLED, never edited directly, by: python3 ${SP}/assemble.py . Its parts are in ${SP}/post/ :
- _front.yaml : the front matter (title, summary, and the hover card under "preview": verdict, takeaway, three points, image, alt).
- _main.md : the main read. The opening, "The quick rundown" (filled from each section's RUNDOWN part), "How the tests worked", "What it cost", "What plugs into what", "What I still have to run myself", then the token {{SECTIONS}}, then "Sound and video still to upload" and the closing credit.
- _clips.md : the table of the 17 test clips.
- <lane>.md for source-separation, audio-to-notes, chords-beats-key, guitar-tab, fingerstyle-voices-taps, video-hands-fretboard, web-tab-render, browser-audio-sync, chains, hosted-apis, apps-survey : one fragment per section, with the marker lines <!-- RUNDOWN -->, <!-- SECTION -->, <!-- IMAGES -->, <!-- PENDING MEDIA -->, <!-- NUMBERS --> (only RUNDOWN and SECTION are published).
- _pending.md : generated from the fragments by python3 ${SP}/make_pending.py . Never edit it by hand.

THE SOURCES (the only place facts may come from): ${DOCS}/lanes/<lane>/ (tools.json, trials.md with run ids like r0123 and scoring ids like e0456, survey.md, for-aaron.md, samples/), ${DOCS}/HANDOFFS.md and handoffs.json (the handoff map and the count of tools after merging duplicates, made by handoffs/count_tools.py), ${DOCS}/FOR_AARON.md (the merged list of what Aaron runs himself), ${DOCS}/GAPS.md, ${DOCS}/ENVIRONMENT.md, ${DOCS}/costs/COSTS.md and the agent-metrics JSON files beside it, /home/user/gtr/inputs/INPUTS.md (the test clips), and the ledgers /home/user/gtr/ledger/runs.jsonl (one line per logged run: locked true means it ran in a pinned slot, n_cores 2 or 4) and /home/user/gtr/eval/ledger/evals.jsonl . The writing rules are /home/user/blog/WRITING.md and /home/user/blog/PREVIEWS.md : read both in full first.

THE RULES OF THIS POST
1. FACTS ONLY. Aaron asked for no judging, grading, ranking, "best", "winner", scores, or recommendations: what went in and what came out. No evaluative words about a tool or a result. No "score", "accuracy", "F1", "precision" or "recall" as words, and no percentages standing in for a grade: counts. Tools are listed alphabetically or in pipeline order, never by result. No advice. A tool's own claim appears only as an attributed quote. Failures and things not run are stated as plainly as the rest.
2. NOTHING IS ADDED. Every number, name, version, command, price and quote must be in the sources, exactly. Where a verification log corrects an earlier statement, the correction is the truth.
3. VOICE: Aaron, first person, talking to a friend ("I", "my agents ran", "Claude"). Short sentences, plain words, contractions, every term a newcomer would not know explained in a few words the first time. No em dashes. NO SEMICOLONS anywhere in running text or tables. No exclamation marks, no emoji, no hype words (the site's checker rejects: incredible, powerful, seamless, unlock, leverage, delve, game-changing, "it turns out", "in this post", "here's the thing", "the short answer", "tl;dr"). No telling the reader how to read. No closing moral.
4. VERBATIM TEXT GOES IN CODE: commands, file names, error messages, tool output and every quoted license clause go in inline code or a fenced text block, copied character for character.
5. NEVER PUBLISH: nothing about Aaron's job, money or plans, no private links, no keys, no description of his computer beyond "my laptop". The post links no other post of his (the site's checker forbids a link to his earlier guitar post, which is unlisted, so the post names it in words only).
6. CHARACTERS: the site's fonts have no glyph for symbols such as the greater-or-equal sign, music notes, arrows, check marks, the section sign, the middle dot or box-drawing characters, and a site test fails on them even inside code. Only plain ASCII, accented letters, curly quotes and the multiplication sign.
7. Run NO git command that changes state. No audio or video under /home/user/blog. Start shell commands that touch /home/user/gtr with: source /home/user/gtr/env.sh . Install nothing.`

const CHECK_MAIN = `[AGENT: check-main]

${COMMON}

YOUR JOB: you are an independent fact-checker of the parts of the post that no lane checker has read: _front.yaml, _main.md and _clips.md (and the quick rundown as it reads assembled). The orchestrator wrote them. Do not edit anything: report problems. Assume there are mistakes.
- Recompute EVERY number in those three files from the sources with your own commands: the entries on the ten lists, how many are marked as run and how many have steps for Aaron (the tools.json files: tried, for_aaron), the count of tools after merging duplicates and its split (HANDOFFS.md "Counts", re-run handoffs/count_tools.py), the number of edges tested and from documentation, the run and scoring-run counts and the split of runs by slot and by exit code (the ledgers), the 52 gaps, the tests in FOR_AARON.md and the per-step table of entries with steps, the clip table (against INPUTS.md: every length, instrument, source and license), and every figure in "What it cost" against costs/COSTS.md and the agent-metrics JSON files (agents per model, token counts, prices, the dollar range and its arithmetic, the dates and hours).
- Check every statement of fact in those files against the sources: what the agents did and in what order, what the permission system refused (the lanes' trials.md and for-aaron.md name each refusal), what the chains ran, what stopped and resumed and when (ENVIRONMENT.md "Interruptions", README.md).
- Check each rundown bullet and each sentence of the main read that summarizes a section against that section as it is now: no number in the main read may differ from the section it comes from.
- Check the front matter against PREVIEWS.md (the caps on verdict, takeaway and points, and what each must be), that every hover-card statement is in the post body with the same numbers, and that the hover picture exists and its alt text describes what it shows (open the picture).
- Check rule 1 and rule 3 line by line on the main read, and WRITING.md's rules for the top of a post (the first screen, the layers, the length of the open part).
- Check every link in those three files: research-folder links must point at files that exist under ${DOCS}/ (the assembler rewrites tree/main to the branch name), and tool links at the tool's own page as a lane's survey gives it.
- PLACEHOLDERS: the figures written as [[ALL_AGENTS]], [[S2_HOURS]], [[S2_ROWS]] and the like in "What it cost" are the second sitting's agent and token counts. A script fills them in from the transcripts after this check, because your own tokens are part of them. Do not report them. Do check the first sitting's figures, the prices, and that every sentence around a placeholder will be true once a number is in it. The second sitting began on 2026-11-12 at about 03:45 UTC.
Return every problem with the exact text, what is wrong, and the correct value with its source. Say how many items you checked and what you could not check.`

const CHECK_CROSS = `[AGENT: check-cross]

${COMMON}

YOUR JOB: you are an independent checker of the post AS A WHOLE: the eleven sections against each other. Each section was checked against its own lane only, so nobody has looked across them. Do not edit anything: report problems. Assume there are contradictions.
Start from ${SP}/cross_sections.txt (made by ${SP}/cross_sections.py : every tool name by the block it sits in per section, with the names that are in "ran" in one section and "didn't run" in another). Then, reading the assembled post ${POST} and the fragments:
- For every tool that one section lists as run and another lists under "didn't run": read both lines. The "didn't run" line must be true as written for that section (for example: that step's agents did not run it themselves) and must not read as if nobody ran it. Where it would mislead a reader of the whole post, report it with a rewording that says where it did run, using only facts from the sources.
- The same run, clip or measurement described in two sections: the numbers, versions, run ids, times and units must agree. Search for run ids and eval ids that appear in more than one section and compare the sentences around them. Compare each tool's version and license as stated in different sections.
- The same test clip described in different sections: length, instrument, where it came from and what is known about it must agree with ${SP}/post/_clips.md and INPUTS.md.
- Terms: a term explained in one section and used with a different meaning in another. A count described as "found" or "extra" must follow the one definition in the main read ("How the tests worked").
- Each section's RUNDOWN bullet against its own section opening and entries: the same counts.
- Statements that span sections ("no tool returned a capo position", "none of the tools that ran accepts a tuning", totals of tools) must hold across every section: look for a counterexample in every other section and in the lanes' tools.json (constraints_accepted).
- Rule 1 across the post: any place where the order of tools, a heading or a comparison between sections reads as a ranking or a pick.
- Markup across the assembled post: every details block opens and closes, the marker comments do not leak into the post, no heading level is skipped, every picture named under /media/guitar-tab-tools/ exists under /home/user/blog/public/media/guitar-tab-tools/ , and no picture file there is unused (list any).
Return every problem with the section (fragment file), the exact text, what is wrong, and the correction with its source. Say how many tools, run ids and clips you compared and what you could not check.`

const PROBLEMS_SCHEMA = {
  type: 'object',
  properties: {
    problems: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          text: { type: 'string' },
          wrong: { type: 'string' },
          correction: { type: 'string' },
          source: { type: 'string' },
        },
        required: ['wrong', 'correction'],
      },
    },
    checked: { type: 'string' },
    could_not_check: { type: 'array', items: { type: 'string' } },
  },
  required: ['problems'],
}

const o = (label, ph) => ({ label, phase: ph, model: OPUS, effort: 'max', agentType: 'general-purpose' })

phase('Check')
const checks = (await parallel([
  () => agent(CHECK_MAIN, { ...o('check-main', 'Check'), schema: PROBLEMS_SCHEMA }),
  () => agent(CHECK_CROSS, { ...o('check-cross', 'Check'), schema: PROBLEMS_SCHEMA }),
])).filter(Boolean)
const problems = checks.flatMap(c => c.problems || [])
log(problems.length + ' problems reported by the two checkers')

phase('Repair')
let repair = null
if (problems.length) {
  repair = await agent(`[AGENT: repair-post]

${COMMON}

YOUR JOB: two independent checkers read the whole post. Their problems are below as JSON. For each one: check it against the sources yourself (a checker can be wrong), and where it holds, fix it IN THE PART FILE it comes from under ${SP}/post/ (_front.yaml, _main.md, _clips.md or a section fragment: in a fragment also update its NUMBERS part), never in the assembled post and never in _pending.md. Keep every rule above. Add nothing new. Keep each section's two open parts short (the RUNDOWN bullet about 45 words, the opening paragraph at most three short sentences). Leave the figures of the second cost window in "What it cost" alone if they are marked as measured after this check: the orchestrator fills those in.
When you are done: run python3 ${SP}/make_pending.py , then python3 ${SP}/assemble.py , then in /home/user/blog run: npm run check -- src/content/posts/guitar-tab-tools.md  (it must end with 0 errors: fix what it reports in the part files and assemble again), and grep the assembled post for non-ASCII characters outside the allowed set.
Your final message: at most 25 lines. How many problems you applied, how many you rejected and why, anything you could not settle, and the checker's last line.

PROBLEMS:
${JSON.stringify(problems, null, 1)}

WHAT THE CHECKERS COULD NOT CHECK:
${JSON.stringify(checks.flatMap(c => c.could_not_check || []), null, 1)}`, o('repair-post', 'Repair'))
}
return { problems_reported: problems.length, checked: checks.map(c => c.checked || ''), repair }
