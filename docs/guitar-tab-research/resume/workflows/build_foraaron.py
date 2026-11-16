#!/usr/bin/env python3
import re, sys
SP = sys.argv[1]
s = open(f'{SP}/gtr-phase-c1.js', encoding='utf-8').read()
def block(name):
    m = re.search(r'^const %s = (`.*?`)[ \t]*$' % name, s, re.S | re.M)
    if not m: raise SystemExit('no block ' + name)
    return m.group(1)
COMMON, FA, VFA = block('COMMON'), block('FORAARON'), block('VERIFY_FORAARON')
old = re.search(r'how he gets the test clips \(.*?give a small table of the clips with what each is for\)', FA, re.S)
assert old, 'clips sentence not found'
FA = FA.replace(old.group(0), "how he gets the test clips (they are filed in his studio library: project blog-posts, run 20261110-225132-vm-7d3107, items #70897 to #70922, filed as reference. Say exactly that and write no web address for the library. Always refer to a clip by its id and file name, and give a small table of the clips with what each is for)")
FA = FA[:-1] + """

THE FILE THAT IS THERE NOW is not an earlier run of you. It is an index the orchestrator wrote on 2026-11-11 when the whole run was stopped by hand (the account's usage limit was nearly used up. The run resumed on 2026-11-12, and every lane's gap rounds are finished and checked now). Replace it with the merged document, and keep its facts: drop its status line, keep "The test clips", "Sending results back" and "Three things only you can decide" (reworded only where the merge changes them), and keep the table of the ten lane lists as a section near the end, with each lane's count recomputed from its for-aaron.md as it is now.
MORE RULES FOR THIS FILE: (a) Do not state or guess the make or model of his laptop, graphics card or phone: write "your laptop" and give each tool's own stated requirement (memory, operating system) from the lane files. (b) The repository is public and this file is in it: no key, no private link, nothing about him beyond what a step needs. (c) The file must stay under 300 KB: where a lane's steps for one tool run past about 40 lines, give the short form here and link the lane's for-aaron.md section for the rest. (d) Every test id (T01, T02, ...) names the lane and tool it came from, so a result can be traced back. (e) Tools that are on two lanes' lists get one test, naming both lanes.`"""
VFA = VFA.replace("Open the live page for every link and price (record the date) and correct what has changed or was wrong.", "The lanes' own checkers opened the live pages on 2026-11-10 and 2026-11-11, so do not re-open every page: re-open a live page where the merged text differs from the lane file, for every price and free-tier limit stated (record the date read), and for a sample of at least 25 other links spread across the sections. Correct what has changed or was wrong.")
assert 'do not re-open every page' in VFA
VFA = VFA.replace("Append \"## Verification log", "9. The file keeps the facts of the index it replaced (the studio library run for the clips, how to send results back, the three decisions only Aaron can make, the ten lane lists with current counts), names no make or model of his devices, holds no web address for the library, and is under 300 KB.\nAppend \"## Verification log")
out = r'''export const meta = {
  name: 'gtr-foraaron',
  description: 'Guitar tab research, resumed: merge the ten lanes\' lists of what Aaron runs himself into one FOR_AARON.md, then check it',
  phases: [
    { title: 'Merge', detail: 'for-aaron (Opus 5.5, max)' },
    { title: 'Verify', detail: 'verify-for-aaron (Opus 5.5, max)' },
  ],
}
const OPUS = 'claude-opus-5-5'
const DOCS = '/home/user/blog/docs/guitar-tab-research'
const COMMON = @@COMMON@@

const FORAARON = @@FA@@

const VERIFY_FORAARON = @@VFA@@

const o = (label, ph) => ({ label, phase: ph, model: OPUS, effort: 'max', agentType: 'general-purpose' })
const tail = r => (r ? String(r) : '(it returned nothing: it may have been cut off. Check whatever is on disk and say what is missing.)')
phase('Merge')
const merged = await agent(FORAARON, o('for-aaron', 'Merge'))
phase('Verify')
const verify = await agent(VERIFY_FORAARON + tail(merged), o('verify-for-aaron', 'Verify'))
return { merged, verify }
'''
out = out.replace('@@COMMON@@', COMMON).replace('@@FA@@', FA).replace('@@VFA@@', VFA)
open(f'{SP}/gtr-foraaron.js', 'w', encoding='utf-8').write(out)
print(len(out), 'bytes')
