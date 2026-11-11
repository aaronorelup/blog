#!/usr/bin/env python3
"""verify-gapfill-web-tab-render (round 2, 2026-11-11): corrections and verifier re-runs added to tools.json after
scripts/gap2_update_tools_json.py (run this after that script). Facts: trials.md, "Verification log
(verify-gapfill-web-tab-render, round 2, 2026-11-11)". Usage: python3 -I fix_tools_json.py <tools.json>"""
import json
import sys

path = sys.argv[1]
d = json.load(open(path, encoding='utf-8'))
tools = {t['name']: t for t in d['tools']}


def run(run_id, input_id, wall_s, peak_mb, note, output_files=None):
    return {'run_id': run_id, 'input_id': input_id, 'cores': 2, 'wall_s': wall_s, 'peak_mb': peak_mb, 'exit_code': 0,
            'output_files': output_files or [], 'metrics': {'note': note}}


def add_runs(name, runs):
    have = {str(r.get('run_id')) for r in tools[name]['runs']}
    tools[name]['runs'].extend(r for r in runs if r['run_id'] not in have)


# ---- HAYA-TAB: the NOT RUN reason and the release files
h = tools['HAYA-TAB (HAYASAKA7/HAYA-TAB)']
h['version'] = ('tag v3.1.8 (2026-07-31, commit eb0466a); frontend/package.json 3.1.7; first commit 2026-02-09; last '
                'commit on main eb0466a 2026-07-31; release v3.1.8 files: HAYA-TAB-linux-amd64.tar.gz, '
                'HAYA-TAB-linux-arm64.tar.gz, HAYA-TAB-macos-amd64.dmg, HAYA-TAB-macos-arm64.dmg, '
                'HAYA-TAB-windows-386.zip, HAYA-TAB-windows-amd64.zip, HAYA-TAB-windows-arm64.zip (listed with the web '
                'fetch tool, 2026-11-11)')
h['not_run_reason'] = ('desktop window program (Wails v3); the gap asked for a survey line. Its release files can be '
                       'fetched from the box by their own URLs (github.com\'s release pages and api.github.com answer '
                       '403 to the box; the files were listed with the web fetch tool). The Linux build is linked '
                       'against libwebkit2gtk-4.1, libjavascriptcoregtk-4.1 and libsoup-3.0, which the box lacks (it has '
                       'libgtk-3 and Xvfb); installing them, a virtual display and starting a downloaded binary were '
                       'not attempted (trials.md, "Gap round 2", HAYA-TAB, verifier note)')
h['unverified'] = [u for u in h['unverified'] if 'files of its GitHub releases' not in u]
h['string_fret_change']['how'] += '; the tag v3.1.8 is this commit'

# ---- the Monaco packages: the playground pointer, and the verifier's re-runs
m = tools['@coderline/alphatab-monaco and @coderline/alphatab-language-server']
m['unverified'] = ['whether the edits behave the same in the live alphatab.net playground (not opened here; '
                   'for-aaron.md item 7 opens the playground for a listening check only)']
add_runs(m['name'], [
    run('r0678', 'S2n', 13.01, 144.9, 'verifier re-run of r0614: every step, marker and console line the same; the six '
        'exported and editor files byte-identical; language server initialised in 348.7 ms, first score at 674.1 ms'),
    run('r0705', None, 1.17, 414.3, 'verifier re-run of the r0604 build from a fresh reinstall (14 packages, 125 MB, '
        'monaco-editor 105 MB, @coderline 15 MB; 135 MB with esbuild): the five bundle files byte-identical; esbuild '
        'metafile: the page bundle takes in 100 CSS files (135 CSS import statements in Monaco\'s ESM code)'),
])

# ---- the other gap-round tools: verifier re-runs
add_runs('abcjs', [run('r0676', 'S2n', 13.27, 141.2, 'verifier re-run of r0598: every listener event, coordinate and '
                       'tab change the same; edited ABC and tab read-backs byte-identical')])
add_runs('alphaTab (@coderline/alphatab)', [
    run('r0679', 'S2n', 1.2, 139.1, 'verifier re-run of r0624: result JSON, edited .gp and alphaTex byte-identical'),
    run('r0684', 'S2n', 0.78, 85.1, 'verifier re-run of r0618 on the r0678 exports: the three read-back JSON files '
        'byte-identical to r0618\'s'),
    run('r0685', 'S2n', 0.25, 85.9, 'verifier re-run of r0627 on the r0679 and r0683 outputs: both read-back JSON files '
        'byte-identical'),
])
add_runs('VexTab (vextab)', [run('r0682', 'S2n', 2.46, 131.0, 'verifier re-run of r0625: result JSON byte-identical')])
add_runs('Verovio (verovio)', [run('r0683', 'S2n', 0.68, 190.6, 'verifier re-run of r0626: the same steps, return '
                                   'values and drawn frets; the edited MEI differs only in generated xml:ids and '
                                   'its read-back JSON is byte-identical')])

# ---- webmscore and abcjs: what the (c) and the per-note string rest on
w = tools['webmscore']
w['string_fret_change']['how'] += ('; the methods of src/index.js load, set excerpts, read metadata, save and '
                                   'synthesize, none edits a note; a MuseScore .mscz/.mscx input with string and fret '
                                   'was not tried (UNVERIFIED whether that would be b)')
a = tools['abcjs']
a['unverified'] = [(u + '; verifier: in the 6.7.2 source, src/tablatures/instruments/string-patterns.js puts a single '
                    'note on the highest-pitched string whose open pitch is at or below it, and no per-note string '
                    'input was found in src/tablatures/') if u.startswith('whether a per-note string choice') else u
                   for u in a['unverified']]

d['updated'] = d['updated'] + '; checked by verify-gapfill-web-tab-render 2026-11-11 (scripts/verify-gap2/fix_tools_json.py)'
open(path, 'w', encoding='utf-8').write(json.dumps(d, indent=2, ensure_ascii=False))
print('ok')
