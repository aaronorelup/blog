#!/usr/bin/env python3
"""Build gtr-finish.js from the prompt blocks of the scripts that already ran (no retyping)."""
import re, sys
SP = sys.argv[1]
def src(n): return open(f'{SP}/{n}', encoding='utf-8').read()
def block(s, name):
    m = re.search(r'^const %s = (`.*?`)[ \t]*$' % name, s, re.S | re.M)
    if not m: raise SystemExit('no block ' + name)
    return m.group(1)
def obj(s, name):
    m = re.search(r'^const %s = (\{.*?^\})[ \t]*$' % name, s, re.S | re.M)
    if not m: raise SystemExit('no obj ' + name)
    return m.group(1)
gap, upd, sec = src('gtr-gapfill.js'), src('gtr-post-update.js'), src('gtr-post-section.js')
FONT = ("\\n8. CHARACTERS: the site's fonts have no glyph for symbols such as the greater-or-equal sign, music notes, arrows, check marks or box-drawing characters, and a site test fails on them even inside code. Write them in words, and where a verbatim excerpt holds one, end the excerpt before it or describe that line instead of quoting it. Check with: grep -nP '[^\\\\x00-\\\\x7F]' on the fragment, and keep only accented letters, curly quotes and the multiplication sign if they were already there.")
GCOMMON = block(gap, 'COMMON')
VERIFY = block(gap, 'VERIFY').replace('${COMMON}', '${GCOMMON}')
JSON_JOB = block(gap, 'JSON_JOB')
UCOMMON = block(upd, 'COMMON')
UCOMMON = UCOMMON[:-1] + FONT + '`'
UPDATE = block(upd, 'UPDATE').replace('${COMMON}', '${UCOMMON}')
CHECK = block(upd, 'CHECK').replace('${COMMON}', '${UCOMMON}')
SCOMMON = block(sec, 'COMMON')
SCOMMON = SCOMMON[:-1] + FONT + '`'
CHECK_NUMBERS = block(sec, 'CHECK_NUMBERS').replace('${COMMON}', '${SCOMMON}')
CHECK_VOICE = block(sec, 'CHECK_VOICE').replace('${COMMON}', '${SCOMMON}')
out = r'''export const meta = {
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
const TITLES = @@TITLES@@
const BIG = '/home/user/gtr/lanes/' + lane
const DOCS = '/home/user/blog/docs/guitar-tab-research'
const DOC = DOCS + '/lanes/' + lane
const LANE = DOC
const OUT = '/tmp/claude-0/-home-user-blog/59564c1e-7fb4-5384-ab71-b563810cf682/scratchpad/post/' + lane + '.md'
const MEDIA = '/home/user/blog/public/media/guitar-tab-tools'

const GCOMMON = @@GCOMMON@@

const VERIFY = @@VERIFY@@

const JSON_JOB = @@JSON_JOB@@

const SUMMARY_SCHEMA = @@SUMMARY_SCHEMA@@

const UCOMMON = @@UCOMMON@@

const UPDATE = @@UPDATE@@

const CHECK = @@CHECK@@

const SCOMMON = @@SCOMMON@@

const CHECK_NUMBERS = @@CHECK_NUMBERS@@

const CHECK_VOICE = @@CHECK_VOICE@@

const PROBLEMS_SCHEMA = @@PROBLEMS_SCHEMA@@

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
'''
for k, v in dict(TITLES=obj(sec, 'TITLES'), GCOMMON=GCOMMON, VERIFY=VERIFY, JSON_JOB=JSON_JOB, SUMMARY_SCHEMA=obj(gap, 'SUMMARY_SCHEMA'),
                 UCOMMON=UCOMMON, UPDATE=UPDATE, CHECK=CHECK, SCOMMON=SCOMMON, CHECK_NUMBERS=CHECK_NUMBERS, CHECK_VOICE=CHECK_VOICE,
                 PROBLEMS_SCHEMA=obj(sec, 'PROBLEMS_SCHEMA')).items():
    out = out.replace('@@' + k + '@@', v)
assert '@@' not in out
open(f'{SP}/gtr-finish.js', 'w', encoding='utf-8').write(out)
print(len(out), 'bytes')
