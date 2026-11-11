#!/usr/bin/env python3
"""Gap round 2 (web-tab-render): check that every quote added to survey.md and trials.md in gap round 2 occurs in the
saved file it was taken from. Stdlib only; reads untrusted saved pages as data.

Usage: python3 -I gap2_check_quotes.py <out.tsv>

Each source is normalised: HTML tags removed without inserting spaces (HTML pages), Markdown link markup
"[text](url)" reduced to "text" and "**" removed (Markdown files), zero-width spaces removed, whitespace collapsed.
A source given as "raw:<path>" is only whitespace-collapsed (used for text inside a Markdown image link).
A quote is EXACT if it occurs in the normalised source; MISSING otherwise.
"""
import html
import re
import sys

G = '/home/user/gtr/lanes/web-tab-render/fetched/gap2/'
NM = '/home/user/gtr/lanes/web-tab-render/web/node_modules/'

QUOTES = [
    # abcjs docs pages
    (G + 'abcjs/visual_render-abc-options.html', 'Default: null'),
    (G + 'abcjs/visual_render-abc-options.html', 'Callback function. The signature of the function is: function(abcelem, tuneNumber, classes, analysis, drag) {}.'),
    (G + 'abcjs/visual_render-abc-options.html', 'This is called whenever the user clicks on a note or selects a series of notes.'),
    (G + 'abcjs/visual_render-abc-options.html', 'See the dragging page for more information.'),
    (G + 'abcjs/visual_dragging.html', 'You can select which type of elements on the page you want to be selectable. If the element is a note, then it can also be draggable.'),
    (G + 'abcjs/visual_dragging.html', "turns on dragging. The user will be able to click on an element, (or use the tab key to go through the elements) and, if it is a draggable element, move it visually. When the user has finished moving the element, the click listener is called. The underlying music is not changed to reflect the user's action. The clickListener function should modify the ABC string and rerender if the user has made a change."),
    (G + 'abcjs/visual_dragging.html', 'step are the number of visual positions the note was dragged. A negative number means that the note was dragged flatter and positive means it was dragged sharper.'),
    (G + 'abcjs/visual_dragging.html', '{ step: number, setSelection: function, index: number, max: number, }'),
    (G + 'abcjs/visual_dragging.html', 'If selectTypes is not passed in, then nothing is selectable (the same behavior as passing false), but notes and rests are clickable.'),
    (G + 'abcjs/visual_click-listener.html', 'function clickListener(abcelem, tuneNumber, classes, analysis, drag, mouseEvent)'),
    (G + 'abcjs/visual_click-listener.html', 'The internal object that is associated with the element clicked. Use a debugger to see what is available.'),
    (G + 'abcjs/visual_click-listener.html', 'This object is subject to change as the library gets more functionality.'),
    (NM + 'abcjs/src/write/draw/selectables.js', 'by default, only notes and tab numbers can be clicked.'),
    # alphaTab Monaco package and language server
    (G + 'npm/_coderline_alphatab-monaco.json', 'A Monaco editor integration for alphaTab providing coding assistance for alphaTex.'),
    (G + 'npm/_coderline_alphatab-language-server.json', 'A language server for alphaTab providing coding assistance for alphaTex.'),
    (G + 'alphatab/packages_monaco_README.md', 'This is a Monaco Editor integration for writing alphaTex, providing coding assistance to code editors.'),
    (G + 'alphatab/packages_monaco_README.md', 'Setup Monaco for the use with TextMate Grammars'),
    (G + 'alphatab/packages_monaco_README.md', 'Setup Monaco with the basic alphaTex language (grammar and language configuration).'),
    (G + 'alphatab/packages_monaco_README.md', 'Setup Monaco to integrate with a alphaTab Language server running in a web worker.'),
    (G + 'alphatab/packages_monaco_README.md', 'This package is still in a very experimental stage.'),
    (G + 'alphatab/packages_monaco_LICENSE', 'alphaTab Monaco is licensed under MPL-2.0.'),
    (G + 'npm/alphatab-language-server-1.9.0_README.md', 'This is a Language Server (LSP) for writing alphaTex, providing coding assistance to code editors.'),
    (G + 'npm/alphatab-language-server-1.9.0_LICENSE', 'alphaTab Language Server is licensed under MPL-2.0.'),
    (G + 'alphatab/packages_ui_src_editor_monaco-env.ts', 'const DIAGNOSTICS_DELAY_MS = 150;'),
    (G + 'alphatab/packages_ui_src_editor_use-score-document.ts', 'const TEX_RENDER_DELAY_MS = 250;'),
    # Verovio typings
    (NM + 'verovio/dist/types/verovio-toolkit.d.ts', 'Edit the MEI data.'),
    (NM + 'verovio/dist/types/verovio-toolkit.d.ts', 'edit(editorAction: EditorAction): boolean;'),
    (NM + 'verovio/dist/types/verovio-toolkit.d.ts', 'Return the editor status.'),
    # HAYA-TAB
    (G + 'haya-tab/main_README.md', 'Organize, read, play, and sync your music tabs from one lightweight desktop app.'),
    (G + 'haya-tab/main_README.md', 'Keep PDF, Guitar Pro, and MusicXML files in one searchable library.'),
    (G + 'haya-tab/main_README.md', 'Practice without leaving the app using built-in PDF and AlphaTab viewers.'),
    (G + 'haya-tab/main_README.md', 'Carry the same organized library between computers through WebDAV.'),
    (G + 'haya-tab/main_README.md', 'Download the current build for your operating system from GitHub Releases.'),
    ('raw:' + G + 'haya-tab/main_README.md', 'platform-Windows%20%7C%20macOS%20%7C%20Linux'),  # inside an image link: checked in the raw file
    (G + 'haya-tab/main_README.md', 'PDF | `.pdf` | Reader, auto-scroll, and non-destructive annotations'),
    (G + 'haya-tab/main_README.md', 'Guitar Pro | `.gp`, `.gp5`, `.gpx` | Notation, playback, looping, section playback, and speed control'),
    (G + 'haya-tab/main_README.md', 'MusicXML | `.xml`, `.musicxml`, `.mxl` | Notation and playback through AlphaTab'),
    (G + 'haya-tab/main_README.md', 'Open Guitar Pro and MusicXML files with AlphaTab to view notation, play parts, loop sections, and adjust playback speed while you practice.'),
    (G + 'haya-tab/main_README.md', 'pen or highlighter notes on a non-destructive layer that leaves the original score untouched'),
    (G + 'haya-tab/main_README.md', 'extend metadata workflows with JavaScript plugins'),
    (G + 'haya-tab/main_README.md', 'HAYA-TAB is available under the Apache License 2.0. See NOTICE for attribution information.'),
    (G + 'haya-tab/eb0466a_docs_ARCHITECTURE.md', 'HAYA-TAB is a cross-platform desktop application built using the Wails framework, combining a Go backend with a modern web frontend (Vue 3 + Vite).'),
    (G + 'haya-tab/eb0466a_CHANGELOG.md', '## [3.1.7] - 2026-07-27'),
    (G + 'haya-tab/eb0466a_CHANGELOG.md', 'Extended Format Support: Added support for Guitar Pro versions 3 and 4 (.gp3, .gp4) format detection for webDAV sync and viewer loading'),
    (G + 'haya-tab/eb0466a_frontend_package.json', '"@coderline/alphatab": "^1.3.1"'),
    (G + 'haya-tab/eb0466a_frontend_package.json', '"version": "3.1.7"'),
    (G + 'haya-tab/eb0466a_frontend_package.json', '"license": "Apache-2.0"'),
    (G + 'haya-tab/eb0466a_internal_app_app_files.go', '"*.pdf;*.gp;*.gp3;*.gp4;*.gp5;*.gpx;*.xml;*.musicxml;*.mxl"'),
    (G + 'haya-tab/eb0466a_go.mod', 'github.com/wailsapp/wails/v3 v3.0.0-alpha.74'),
    (G + 'haya-tab/main_LICENSE', 'Apache License Version 2.0, January 2004 http://www.apache.org/licenses/'),
    (G + 'haya-tab/main_LICENSE', 'Grant of Copyright License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form.'),
    (G + 'haya-tab/main_LICENSE', 'If the Work includes a "NOTICE" text file as part of its distribution, then any Derivative Works that You distribute must include a readable copy of the attribution notices contained within such NOTICE file'),
    (G + 'haya-tab/main_LICENSE', 'Copyright 2026 Ai Hayasaka'),
    (G + 'haya-tab/main_NOTICE', 'HAYA-TAB Copyright 2026 Ai Hayasaka'),
    (G + 'haya-tab/main_NOTICE', 'This product includes software developed by Ai Hayasaka (https://github.com/HAYASAKA7/HAYA-TAB).'),
]


def normalise(path):
    if path.startswith('raw:'):
        return re.sub(r'\s+', ' ', open(path[4:], encoding='utf-8', errors='replace').read())
    t = open(path, encoding='utf-8', errors='replace').read()
    if path.endswith('.html'):
        t = re.sub(r'<script.*?</script>', '', t, flags=re.S | re.I)
        t = re.sub(r'<style.*?</style>', '', t, flags=re.S | re.I)
        t = re.sub(r'<[^>]+>', '', t)
        t = html.unescape(t)
    if path.endswith('.md'):
        t = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', t)
        t = t.replace('**', '')
        t = re.sub(r'^\s*[*-] ', '', t, flags=re.M)
    t = t.replace('​', '')
    return re.sub(r'\s+', ' ', t)


def main():
    rows = ['result\tsource\tquote']
    cache = {}
    n_ok = 0
    for path, q in QUOTES:
        if path not in cache:
            cache[path] = normalise(path)
        ok = re.sub(r'\s+', ' ', q) in cache[path]
        n_ok += ok
        rows.append(('EXACT' if ok else 'MISSING') + '\t' + path.replace('raw:', '').replace(G, 'fetched/gap2/').replace(NM, 'web/node_modules/') + '\t' + q)
    open(sys.argv[1], 'w', encoding='utf-8').write('\n'.join(rows) + '\n')
    print(f'{n_ok} of {len(QUOTES)} EXACT')


main()
