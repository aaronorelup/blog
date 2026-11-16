#!/usr/bin/env python3
"""Gap round 2 (web-tab-render): add the gap-round-2 facts of trials.md and survey.md to tools.json.

Usage: python3 -I gap2_update_tools_json.py <tools.json>

- @coderline/alphatab-monaco: tried, with its runs (r0604 build, r0614 editing, r0618 read-back), license quotes.
  (r0663, the re-run after the install was trimmed, was added to tools.json by hand afterwards, in the same form.)
- abcjs (r0598), alphaTab (r0624, r0627), VexTab (r0625), Verovio (r0626, r0627): the new runs.
- every tool that ran in this lane: a field "string_fret_change" with the (a)/(b)/(c) answer of trials.md, section
  "Gap round 2", "Changing a string or a fret", and the run ids that show it.
- a new entry for HAYA-TAB (survey only).
The file is written back as json.dumps(indent=2, ensure_ascii=False), the format it had.
"""
import json
import sys

path = sys.argv[1]
d = json.load(open(path, encoding='utf-8'))
tools = {t['name']: t for t in d['tools']}


def run(run_id, input_id, wall_s, peak_mb, output_files, metrics, cores=2, exit_code=0):
    return {'run_id': run_id, 'input_id': input_id, 'cores': cores, 'wall_s': wall_s, 'peak_mb': peak_mb,
            'exit_code': exit_code, 'output_files': output_files, 'metrics': metrics}


# ---- @coderline/alphatab-monaco
m = tools['@coderline/alphatab-monaco and @coderline/alphatab-language-server']
m['tried'] = True
m['tried_how'] = 'browser-headless'
m['not_run_reason'] = None
m['version'] = '1.9.0 (npm, 2026-10-31), with monaco-editor 0.57.0 and @coderline/alphatab-language-server 1.9.0'
m['runs'] = [
    run('r0604', None, 1.25, 384.6,
        ['/home/user/gtr/lanes/web-tab-render/web/bundles/alphatab-monaco/ (outside git)', 'samples/alphatab-monaco/build.run.log'],
        {'cpu_s': 1.7, 'slot_wait_s': 15.6, 'mode': 'esbuild 0.25.12 bundles (scripts/build_alphatab_monaco.sh)',
         'bundle_bytes': {'editor.js': 6287979, 'editor.css': 175371, 'codicon-LTRFOK3N.ttf': 153228,
                          'editor.worker.js': 307296, 'alphatex-lsp.worker.js': 1599875},
         'install': 'npm install --no-audit --no-fund --ignore-scripts @coderline/alphatab-monaco@1.9.0: 14 packages, 9 s, 125 MB node_modules (monaco-editor 105 MB)'}),
    run('r0614', 'S2n', 12.84, 144.8,
        ['samples/alphatab-monaco/alphatab_monaco_edit.json', 'samples/alphatab-monaco/S2n.monaco_edited.gp',
         'samples/alphatab-monaco/S2n.monaco_edited.editor.atex', 'samples/alphatab-monaco/S2n.monaco_edited.export.atex',
         'samples/alphatab-monaco/S2n.monaco_capo2.gp', 'samples/alphatab-monaco/S2n.monaco_capo2.editor.atex',
         'samples/alphatab-monaco/*.webp'],
        {'cpu_s': 1.1, 'slot_wait_s': 64.1,
         'mode': 'headless Chromium page scripts/pages/alphatab_monaco.html: Monaco with the alphaTex grammar and language server; alphaTab 1.9.0 api.tex() 250 ms after the last edit; driver scripts/alphatab_monaco_edit.cjs (mouse double-clicks and typing)',
         'input_file': 'S2n truth alphaTex (samples/alphatab/S2n.truth.atex)',
         'page_ms': {'grammar_registered': 84.6, 'language_server_initialised_in': 327.6, 'first_score_drawn': 656.0},
         'fret_edit': 'double-click the fret digit of melody bar 1 note 1, type 2: 0.3.4 -> 2.3.4; drawn string 3 fret 2 pitch 57',
         'string_edit': 'double-click the fret digit of note 2, type 5; double-click its string digit, type 4: 0.3.4 -> 5.4.4; drawn string 4 fret 5 pitch 55',
         'string_7': 'language-server marker severity 8, code AT208, "Note string is out of range. Available range: 1-6"; alphaTab error event, previous score kept; Control+Z restored the text',
         'capo_edit': 'new line \\capo 2 typed; the suggestion list showed "\\capo, Set the capo fret, Function" first; capo 2 drawn',
         'two_notes_on_one_string': 'after the string edit the moved G3 and the bass voice open D3 sound together on string 4 (2.678571 s); no diagnostic; both kept in the .gp export'}),
    run('r0618', 'S2n', 0.77, 85.2, ['samples/alphatab-monaco/S2n.monaco_edited.gp.est.json', 'samples/alphatab-monaco/S2n.monaco_capo2.gp.est.json'],
        {'slot_wait_s': 36.8, 'mode': 'read back the exports with alphaTab 1.9.0 under Node (scripts/alphatab_node_model.cjs)',
         'tab_edited_gp': '89/90 matched, 88/89 same string and fret, string difference +1 for one note (e1780)',
         'tab_edited_editor_alphatex': 'same numbers (e1782)',
         'tab_capo_gp_vs_S5capo2': '89/90 matched, 88/89, capo 2 stated and equal to the truth (e1784)'}),
]
m['outputs'] = ['alphaTex text edited in the Monaco editor (the editor model)', 'Monaco markers from the alphaTex language server (severity, code, message, range)',
                'completion items, hover and signature help from the language server', 'whatever the application exports from alphaTab after the edit (here Guitar Pro 7 .gp and alphaTex)']
m['constraints_accepted'] = ['per-note fret and string typed as alphaTex fret.string (string 1 = highest)', '\\capo and \\tuning lines typed in the text',
                             'a string outside the staff (7 on a 6-string staff) refused with AT208']
m['license']['code'] = {'spdx': 'MPL-2.0', 'quote': 'alphaTab Monaco is licensed under MPL-2.0. (Monaco package LICENSE, first line); alphaTab Language Server is licensed under MPL-2.0. (language server LICENSE, first line)',
                        'url': 'https://raw.githubusercontent.com/CoderLine/alphaTab/develop/packages/monaco/LICENSE'}
m['handoffs_out'] = [{'to': 'alphaTab', 'via_format': 'alphaTex', 'evidence': 'r0614: alphaTab drew the edited alphaTex; r0618 and e1780: the .gp export read back with the edits'}]
m['unverified'] = ['whether the edits behave the same in the live alphatab.net playground (not opened here; for-aaron.md item 7)']

# ---- new runs on tools that already had runs
tools['abcjs']['runs'].append(run('r0598', 'S2n', 12.63, 141.6,
    ['samples/abcjs/gap2_click_drag.json', 'samples/abcjs/gap2_B_apply.edited.abc', 'samples/abcjs/gap2_D_editor.edited.abc',
     'samples/abcjs/gap2_B_apply.tab.json', 'samples/abcjs/gap2_D_editor.tab.json', 'samples/abcjs/gap2_*.webp'],
    {'cpu_s': 1.6, 'mode': 'renderAbc with dragging: true and a clickListener; ABCJS.Editor; driver scripts/abcjs_click_drag.cjs',
     'click_note_or_tab_number': 'the listener gets el_type note or tabNumber and the note\'s startChar/endChar; nothing changes',
     'drag': 'a drag reports drag.step (up = -1 per 3.875 px, a tab number dragged one tab line = +3); ABC text and tab unchanged until application code rewrites the ABC',
     'apply_mode': 'page rewrote the ABC: G -> A (tab 0 -> 2 on string 3), G -> F# (0 on string 3 -> 4 on string 4), d -> A from a tab-number drag (3 on string 2 -> 2 on string 3); 87/90 matched, 87/87 same string and fret (e1763)',
     'editor_click_then_type': 'a click on a tab number selects the note\'s ABC text in the Editor textarea; typing changed note 1 (0 -> 2 on string 3) and note 2 (0 on string 3 -> 4 on string 4); 88/90, 88/88 (e1764)',
     'two_notes_on_one_string': 'F#3 put on string 4 at the same time as the bass voice open D on string 4'}))
tools['abcjs']['unverified'] = [u for u in tools['abcjs']['unverified'] if 'dragging / clickListener' not in u]
tools['alphaTab (@coderline/alphatab)']['runs'] += [
    run('r0624', 'S2n', 1.1, 138.8, ['samples/alphatab/gap2_S2n.string_edit.json', 'samples/alphatab/gap2_S2n.string_edit.edited.gp', 'samples/alphatab/gap2_S2n.string_edit.edited.webp'],
        {'cpu_s': 0.8, 'mode': 'data-model edit in headless Chromium (scripts/alphatab_model_string_edit.cjs)',
         'model_edit': 'melody bar 1 note 2: Note.string 4 -> 3 (alphaTab counts from the lowest string; 3 -> 4 from the top), Note.fret 0 -> 5, realValue 55 kept; api.render(); GP7 4,981 bytes'}),
    run('r0627', 'S2n', 0.27, 85.7, [],
        {'mode': 'read back the r0624 .gp under Node (and the Verovio-edited MEI of r0626)', 'tab': '90/90 matched, 89/90 same string and fret, string difference +1 for one note (e1826)'}),
]
tools['VexTab (vextab)']['runs'].append(run('r0625', 'S2n', 2.24, 131.1, ['samples/vextab/gap2_editor_string_edit.json', 'samples/vextab/gap2_editor_string_edit.webp'],
    {'cpu_s': 0.8, 'mode': 'editor="true" textarea edit (scripts/vextab_editor_string_edit.cjs)',
     'result': 'second ":q 0/3" replaced by ":q 5/4": 90 numbers before and after, one changed: "0" on string 3 -> "5" on string 4; no editor error'}))
tools['Verovio (verovio)']['runs'] += [
    run('r0626', 'S2n', 0.54, 195.0, ['samples/verovio/gap2_S2n_edit.json', 'samples/verovio/gap2_S2n_edit.edited.mei'],
        {'cpu_s': 0.8, 'mode': 'toolkit.edit() under Node (scripts/verovio_edit_tab.cjs)',
         'result': 'set tab.fret and tab.course on MEI tab notes returned true; getMEI() and the drawn fret text changed; one undo restored all three values',
         'tab_read_back': '89/90 matched, 88/89 same string and fret, string difference +1 for one note (e1827, read in r0627)'}),
]
tools['Verovio (verovio)']['constraints_accepted'].append('MEI attributes tab.fret and tab.course changed through toolkit.edit() "set" actions (r0626)')

# ---- (a)/(b)/(c) for every tool that ran (trials.md, "Gap round 2", "Changing a string or a fret")
CAT = {
    '@coderline/alphatab-monaco and @coderline/alphatab-language-server': ('a', 'a', ['r0614'], 'typed in the alphaTex text in Monaco; the redraw after an edit is application code'),
    'alphaTab (@coderline/alphatab)': ('b', 'b', ['r0132', 'r0624', 'r0134'], 'Note.fret and Note.string set in the data model, then api.render(); no editing UI in the package; a click gave beatMouseDown only'),
    'abcjs': ('a (text, ABCJS.Editor); b (drag: the application rewrites the ABC)', 'c', ['r0312', 'r0598'], 'ABC has no string; abcjs picks it from the pitch'),
    'VexTab (vextab)': ('a (text, editor mode)', 'a (text, editor mode)', ['r0407', 'r0625'], 'editor-mode textarea'),
    'VexFlow (vexflow)': ('b', 'b', ['r0110'], 'the program gives every TabNote position; no change-and-redraw run'),
    'OpenSheetMusicDisplay (opensheetmusicdisplay)': ('b', 'b', ['r0158'], 'draws the MusicXML <technical> string and fret it is given; no change-and-redraw run'),
    'Verovio (verovio)': ('b', 'b', ['r0626', 'r0165'], 'toolkit edit() set on tab.fret and tab.course, or the input MEI/MusicXML; no UI'),
    'MuseScore Studio (mscore CLI)': ('b', 'b', ['r0179', 'r0180'], 'MuseScore 3.2.3 command line: positions of a TAB MusicXML input kept for S2n (e0367), changed for the capo file (e0368); the desktop editor was not run'),
    'webmscore': ('c', 'c', ['r0291'], 'no editing in the package; a TAB MusicXML input came out with 0/90 positions kept (e1009)'),
    'LilyPond (TabStaff)': ('b', 'b', ['r0211', 'r0197'], 'string numbers in the .ly text (e0412); without them LilyPond chooses'),
    'TuxGuitar (helge17 fork)': ('b', 'b', ['r0221'], 'TuxGuitar 1.5.6 format plugins: input positions kept; no change-and-rewrite run; the desktop editor was not run'),
    'PyGuitarPro': ('b', 'b', ['r0236'], 'string 3 fret 0 -> string 4 fret 5 in the data model, written as GP5'),
    'music21': ('b', 'b', ['r0153'], 'StringIndication and FretIndication set by the program; no change-and-rewrite run'),
    'guitarpro-parser (npm)': ('c', 'c', ['r0294'], 'reads only: no writer, no drawing'),
    'svguitar': ('b', 'b', ['r0253'], 'chord-box dots given as [string, fret] by the program; no change-and-redraw run'),
    'vexchords': ('b', 'b', ['r0259'], 'chord-box dots given as [string, fret] by the program; no change-and-redraw run'),
    'Tonal (tonal)': ('c', 'c', ['r0251'], 'no string or fret in what it computes'),
    'ChordSheetJS (chordsheetjs)': ('c', 'c', ['r0251'], 'chord sheets: a {capo} directive and transpose(), no string or fret'),
}
for name, (fret, string, runs, how) in CAT.items():
    tools[name]['string_fret_change'] = {
        'fret': fret, 'string': string, 'runs': runs, 'how': how,
        'key': 'a = through a built-in editing interface; b = only by changing the data and drawing or converting again; c = not at all (trials.md, "Gap round 2")'}

# ---- HAYA-TAB, survey only
haya = {
    'name': 'HAYA-TAB (HAYASAKA7/HAYA-TAB)',
    'kind': 'desktop app',
    'what': 'Organize, read, play, and sync your music tabs from one lightweight desktop app. (README); a Wails v3 (Go) program with a Vue 3 frontend; PDF viewer with annotations and an alphaTab viewer and player for Guitar Pro and MusicXML',
    'url': 'https://github.com/HAYASAKA7/HAYA-TAB',
    'version': 'tag v3.1.8 (2026-07-31); frontend/package.json 3.1.7; first commit 2026-02-09; last commit on main eb0466a 2026-07-31',
    'tried': False,
    'tried_how': None,
    'runs': [],
    'not_run_reason': 'desktop program whose builds are on GitHub Releases, which this box cannot list (github.com answers 403); surveyed from its source only (trials.md, "Gap round 2")',
    'for_aaron': True,
    'callable_via': ['desktop-gui'],
    'inputs': ['PDF', 'Guitar Pro .gp, .gp3, .gp4, .gp5, .gpx (open-file filter)', 'MusicXML .xml, .musicxml, .mxl'],
    'outputs': ['on-screen notation and tab (alphaTab 1.8.1), playback with looping and speed', 'PDF annotations on a separate layer', 'library metadata; no tab file written (no alphaTab exporter call in frontend/src at eb0466a)'],
    'constraints_accepted': [],
    'license': {'code': {'spdx': 'Apache-2.0',
                         'quote': 'Grant of Copyright License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form. (LICENSE section 2); NOTICE: HAYA-TAB Copyright 2026 Ai Hayasaka',
                         'url': 'https://raw.githubusercontent.com/HAYASAKA7/HAYA-TAB/main/LICENSE'},
                'weights': None, 'training_data': [], 'service_terms': []},
    'pricing': None,
    'handoffs_out': [],
    'unverified': ['the date the GitHub repository was created (first commit 2026-02-09)', 'the files of its GitHub releases (github.com answers 403 here)',
                   'whether the released program edits notes (the source at eb0466a has no such code; for-aaron.md item 8)'],
    'string_fret_change': {'fret': 'c (not found in the source; not run)', 'string': 'c (not found in the source; not run)', 'runs': [],
                           'how': 'no alphaTab exporter call and no write to a note string or fret in frontend/src at eb0466a; the edit dialog edits library metadata',
                           'key': 'a = through a built-in editing interface; b = only by changing the data and drawing or converting again; c = not at all (trials.md, "Gap round 2")'},
}
d['tools'].append(haya)
d['updated'] = '2026-11-11 (gap round 2, gapfill-web-tab-render: GAPS.md W1 and W2)'
open(path, 'w', encoding='utf-8').write(json.dumps(d, indent=2, ensure_ascii=False))
print(len(d['tools']), 'tools')
