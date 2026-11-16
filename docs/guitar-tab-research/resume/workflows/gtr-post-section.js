export const meta = {
  name: 'gtr-post-section',
  description: 'Guitar tab research phase D: draft one lane\'s section of the blog post from its verified files, fact-check it two ways, repair it',
  phases: [
    { title: 'Draft', detail: 'post-section-<lane> (Opus 5.5, max)' },
    { title: 'Check', detail: 'numbers and quotes against the lane files; voice and the facts-only rule (Opus 5.5, max)' },
    { title: 'Repair', detail: 'apply confirmed corrections (Opus 5.5, max)' },
  ],
}

const OPUS = 'claude-opus-5-5'
const lane = (args && args.lane) || ''
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
if (!TITLES[lane]) { throw new Error('unknown lane: ' + lane) }
const DOCS = '/home/user/blog/docs/guitar-tab-research'
const LANE = DOCS + '/lanes/' + lane
const OUT = '/tmp/claude-0/-home-user-blog/59564c1e-7fb4-5384-ab71-b563810cf682/scratchpad/post/' + lane + '.md'
const MEDIA = '/home/user/blog/public/media/guitar-tab-tools'

const COMMON = `PROJECT
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
7. WHERE YOU MAY WRITE: the fragment file ${OUT} and pictures under ${MEDIA}/ . Nothing else. No git commands that change state. No audio or video under /home/user/blog.`

const DRAFT = `[AGENT: post-section-${lane}]

${COMMON}

YOUR JOB: write the fragment ${OUT} for this lane. Exactly these parts, in this order, each starting with the marker line shown:

<!-- RUNDOWN -->
One bullet for the post's quick rundown: "- **A bold lead that carries the point by itself.** One or two short sentences with the counts." The point is what was looked at and what came out, in numbers (how many tools looked at, how many ran here, and one or two plain outcomes as counts).

<!-- SECTION -->
## ${TITLES[lane]}
Three to six short sentences that a reader who stops here can leave with: what this step is for in the app (one line, for a newcomer), how many tools were looked at and how many ran on the cloud box, on which clips, and the plain outcomes as counts. Then, if this lane has pictures worth showing, one <ao-compare> block (markup below) with two to four of them. Then these folded blocks, each a native details element with a blank line after the summary line and before the closing tag:

<details><summary>Every tool that ran, what went in and what came out</summary>

One entry per tool that actually produced output (on the box, on a public demo, or through an API), alphabetical, in this shape:

**Tool name and version** ([link](https://...)). One line saying what it is.
- In: the clip id and what it is, and the file format given to the tool.
- Command or settings: the exact command or call, in inline code or a text block.
- Out: the output format and its fields, then what it contained as counts (against the known answer where there is one), with a short excerpt in a text block where that helps.
- Time: wall-clock seconds on 2 CPU cores and peak memory (or where it ran instead), with the run id. Cost if any.
- Takes as a hint: which constraints it accepts (capo, tuning, note range, tempo, key), with the parameter name, or "none".
- Hands off to: what its output was fed into, if that was tried, or what format the next step would need.

</details>

<details><summary>What didn't run on the cloud box, and why</summary>

One line per tool, alphabetical: the tool, the precise reason from the lane files, and whether steps for Aaron exist.

</details>

<details><summary>Licenses of the tools that ran</summary>

A table: Tool | Code | Model files | Trained on. Each cell gives the license name, and where a clause limits commercial use or requires sharing changes, that clause quoted in inline code with its link. End with one line linking the full quoted record (survey.md in the research folder).

</details>

<!-- IMAGES -->
For each picture used: the source file, the file you wrote under ${MEDIA}/ (WebP, at most 1400 px wide, at most 150 KB, named ${lane}-<what>.webp, made with ffmpeg or Pillow from a file under ${LANE}/samples/), its alt text and its caption. Look at each picture you choose (open it) and describe only what it shows. The ao-compare markup:
<ao-compare cols="2" aspect="16/9">
<figure><img src="/media/guitar-tab-tools/${lane}-x.webp" alt="what the picture shows"><figcaption><b>Short title</b><span class="ao-meta">what it is, the clip and the tool</span></figcaption></figure>
</ao-compare>
(Use cols and aspect to suit the pictures. No style attributes.)

<!-- PENDING MEDIA -->
Audio and video outputs worth hearing or watching in the post, which cannot go into git: for each, the path under /home/user/gtr/lanes/${lane}/out/ (check that the file still exists), what it is (clip and tool), duration and size. Ten at most, the ones a reader would want next to the text. Aaron uploads these himself later.

<!-- NUMBERS -->
Every number, version, price and quote you used above, one per line, with where it comes from (file and section, or run id, or eval id). This is for the fact-checker.

Before you finish: re-read the fragment against rule 1 word by word, and run this to catch what the site's checker would: grep -nE ";|—| – " on the prose (outside code), and a case-insensitive grep for the banned words and for: score|accura|precision|recall|best|better|worse|winner|recommend|impressive|reliable|struggl .
Your final message: at most 15 lines (counts of tools in each block, pictures made, anything in the sources that looked wrong).`

const CHECK_NUMBERS = `[AGENT: check-numbers-${lane}]

${COMMON}

YOUR JOB: you are an independent fact-checker of the fragment ${OUT}, which another agent wrote. Do not edit it: report problems. Your lens is NUMBERS, NAMES AND QUOTES. Assume it has mistakes.
- Check EVERY number, count, version, time, memory figure, price, run id, eval id, command, file format and tool name in the RUNDOWN and SECTION parts against the sources (the lane's trials.md, survey.md, tools.json, the ledgers). Where the lane file carries a verifier's correction, the corrected value is the truth. Recompute counts from the ledgers or the saved outputs where you can.
- Check every quoted license clause character for character against survey.md, and that its link is the one given there.
- Check every "did not run" reason against the lane files.
- Check the alphabetical order, and that no tool that ran is missing from the first block and no tool is in the wrong block.
- Open each picture under ${MEDIA}/ that the fragment uses: it exists, is WebP, at most 150 KB, and shows what its alt text and caption say.
- Check each path under PENDING MEDIA exists.
Return every problem with the exact text, what is wrong, and the correct value with its source. Also say how many items you checked and how many you could not check.`

const CHECK_VOICE = `[AGENT: check-voice-${lane}]

${COMMON}

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

phase('Draft')
const draft = await agent(DRAFT, o('post-section-' + lane, 'Draft'))

phase('Check')
const checks = (await parallel([
  () => agent(CHECK_NUMBERS, { ...o('check-numbers-' + lane, 'Check'), schema: PROBLEMS_SCHEMA }),
  () => agent(CHECK_VOICE, { ...o('check-voice-' + lane, 'Check'), schema: PROBLEMS_SCHEMA }),
])).filter(Boolean)
const problems = checks.flatMap(c => c.problems || [])
log(lane + ': ' + problems.length + ' problems reported')

phase('Repair')
let repair = null
if (problems.length) {
  repair = await agent(`[AGENT: repair-section-${lane}]

${COMMON}

YOUR JOB: two independent checkers reviewed the fragment ${OUT}. Their problems are below as JSON. For each one: check it against the sources yourself (a checker can be wrong), fix the fragment where the problem holds, and keep every rule above while you do. Do not add anything new. When you are done, re-run the greps for semicolons, dashes, banned words and judging words on the prose, and update the NUMBERS part. Your final message: how many problems you applied, how many you rejected and why, in at most 15 lines.

PROBLEMS:
${JSON.stringify(problems, null, 1)}`, o('repair-section-' + lane, 'Repair'))
}
return { lane, fragment: OUT, draft, problems_reported: problems.length, repair }
