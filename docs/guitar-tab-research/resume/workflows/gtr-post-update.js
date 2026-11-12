export const meta = {
  name: 'gtr-post-update',
  description: 'Guitar tab research phase D: bring one lane\'s post section up to date after the gap rounds changed the lane\'s record, then check the changes',
  phases: [
    { title: 'Update', detail: 'update-section-<lane> (Opus 5.5, max)' },
    { title: 'Check', detail: 'check-update-<lane> (Opus 5.5, max)' },
  ],
}

const OPUS = 'claude-opus-5-5'
const lane = (args && args.lane) || ''
if (!lane) { throw new Error('need args.lane') }
const DOCS = '/home/user/blog/docs/guitar-tab-research'
const LANE = DOCS + '/lanes/' + lane
const OUT = '/tmp/claude-0/-home-user-blog/59564c1e-7fb4-5384-ab71-b563810cf682/scratchpad/post/' + lane + '.md'
const MEDIA = '/home/user/blog/public/media/guitar-tab-tools'

const COMMON = `PROJECT
Aaron Orelup (aaronorelup.com) had a team of AI agents research the tools a web app would need to build guitar tablature step by step with a person in the loop. Nothing was built. Ten lanes each surveyed one category, ran what they could on a cloud box (4 CPU cores, 15 GB of memory, no graphics card), and read the licenses. The findings are becoming ONE blog post on Aaron's site, a draft he reads first. Each lane has a section of that post as a fragment file. You work on the fragment for the lane "${lane}": ${OUT} .

THE SOURCES (the only place facts may come from): ${LANE}/tools.json, ${LANE}/trials.md (run ids like r0123, scoring ids like e0456. It now has one or more sections headed "## Gap round N" near the end and new verification logs), ${LANE}/survey.md, ${LANE}/for-aaron.md, the files under ${LANE}/samples/, /home/user/gtr/inputs/INPUTS.md (the test clips), the ledgers /home/user/gtr/ledger/runs.jsonl and /home/user/gtr/eval/ledger/evals.jsonl, and ${DOCS}/ENVIRONMENT.md . The writing rules are /home/user/blog/WRITING.md : read it in full first.

THE RULES OF THIS POST
1. FACTS ONLY. Aaron asked for no judging, grading, ranking, "best", "winner", scores, or recommendations: describe what went in and what came out and let the reader judge. No evaluative words about a tool or a result. No "score", "accuracy", "F1", "precision" or "recall" as words, and no percentages standing in for a grade: give counts (found N of M real notes, N extra notes, the right chord for N of M seconds, N of M beats within 70 ms, the same string and fret for N of M matched notes). For separated stems give the measured figure with its unit and plain definition once, with no adjective. Tools are listed alphabetically, never by result. No advice. A tool's own claim appears only as an attributed quote. Failures and things not run are stated as plainly as the rest.
2. NOTHING IS ADDED. Every number, name, version, command, price and quote must be in the sources, exactly. Where a verification log corrects an earlier statement, the correction is the truth.
3. VOICE: Aaron, first person, talking to a friend ("I", "my agents ran", "Claude"). Short sentences, plain words, contractions, every term a newcomer would not know explained in a few words the first time. No em dashes. NO SEMICOLONS anywhere in running text or tables. No exclamation marks, no emoji, no hype words (the site's checker rejects: incredible, powerful, seamless, unlock, leverage, delve, game-changing, "it turns out", "in this post", "here's the thing", "the short answer", "tl;dr"). No telling the reader how to read. No closing moral.
4. VERBATIM TEXT GOES IN CODE: commands, file names, error messages, tool output and every quoted license clause go in inline code or a fenced text block, copied character for character.
5. NEVER PUBLISH: nothing about Aaron's job, money or plans, no private links, no keys, no description of his computer beyond "my laptop". Do not link any other post of his.
6. WHERE YOU MAY WRITE: the fragment file ${OUT} and pictures under ${MEDIA}/ (WebP, at most 1400 px wide and 150 KB, named ${lane}-<what>.webp). Nothing else. No git commands that change state. No audio or video under /home/user/blog.`

const UPDATE = `[AGENT: update-section-${lane}]

${COMMON}

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

${COMMON}

YOUR JOB: you are the independent checker of an update another agent just made to the fragment (its summary is below). Assume mistakes. This time you FIX the fragment in place.
- For every entry it added or changed: check every number, version, command, run id, eval id, format statement and quote against the sources, recomputing counts from the ledgers or saved outputs where you can.
- Recount the totals in the RUNDOWN and the section opening from tools.json: tools looked at, tools that ran. Check that every tool with tried true in tools.json and a run that produced output has an entry in "Every tool that ran", that no tool is in both blocks, and that the lists are alphabetical.
- Check the facts-only rule and the voice rules on every changed line, and that all verbatim text is in code.
- Check every path under PENDING MEDIA exists and every picture named exists, is WebP and at most 150 KB.
- Check the structure is intact: the five marker lines in order, each details block with a blank line after its summary line and before its closing tag.
Your final message: at most 15 lines: what you checked and what you fixed.

The updating agent's summary follows. Treat it as a claim to check:
`

const o = (label, ph) => ({ label, phase: ph, model: OPUS, effort: 'max', agentType: 'general-purpose' })
phase('Update')
const update = await agent(UPDATE, o('update-section-' + lane, 'Update'))
phase('Check')
const check = await agent(CHECK + (update || '(no summary returned)'), o('check-update-' + lane, 'Check'))
return { lane, fragment: OUT, update, check }
