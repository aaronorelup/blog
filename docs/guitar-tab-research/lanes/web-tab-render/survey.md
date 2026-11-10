# web-tab-render: survey (docs lane)

Lane: tab rendering, editing and playback on the web, and the tab file formats.
Written by the `docs-web-tab-render` agent on 2026-11-10 (UTC date from `date -u +%F`). Facts read from primary
sources on that date: the npm registry (`https://registry.npmjs.org/<package>`), the PyPI JSON API
(`https://pypi.org/pypi/<package>/json`), files of each repository read through `raw.githubusercontent.com` or a
`git clone --depth 1` of the public repository, and the projects' own documentation and terms pages. Each section
names the URLs it was read from. "Last commit" is the committer date of the newest commit on the default branch
of a `git clone --depth 1` made on 2026-11-10. This file judges nothing; it records what the sources say.

RUNNABLE = the tool can be installed and run on this CPU-only Linux box (npm package in Node or headless Chromium,
PyPI wheel, or Linux binary). It is a statement about installability from the published packages, not a trial
result: trials are in `trials.md`.

## Tool list

Version and date = the npm `dist-tags.latest` (or PyPI latest release, or newest release tag) and its publish date.

| Tool | Kind | Latest version (date) | Last commit | License (as declared) | Renders tab | Plays audio | Edits | RUNNABLE |
|---|---|---|---|---|---|---|---|---|
| alphaTab (`@coderline/alphatab`) | JS/TS library (also .NET, Kotlin/Android builds) | 1.9.0 (2026-10-31) | 2026-11-08 | MPL-2.0 | yes | yes (alphaSynth) | API-level data model; see section | RUNNABLE |
| VexFlow (`vexflow`) | JS library | 5.0.0 (2025-03-05) | 2026-10-28 (vexflow/vexflow) | MIT | yes (TabStave) | no | no | RUNNABLE |
| VexTab (`vextab`) | JS text language over VexFlow | 4.0.5 (2026-01-18) | 2026-01-18 | npm field `LicenseRef-LICENSE` (see section) | yes | no | text only | RUNNABLE |
| OpenSheetMusicDisplay (`opensheetmusicdisplay`) | JS library, MusicXML renderer | 2.3.0 (2026-11-07) | 2026-11-10 | BSD-3-Clause | yes (MusicXML tab staves) | not in the open-source package (see section) | no | RUNNABLE |
| osmd-audio-player | JS player for OSMD | 0.7.0 (2021-12-30) | 2021-12-30 | MIT | n/a | yes | no | RUNNABLE |
| abcjs | JS library, ABC renderer and synth | 6.7.2 (2026-10-16) | 2026-10-16 | MIT | yes (generated from notes) | yes | text only | RUNNABLE |
| Verovio (`verovio` npm, PyPI, C++ CLI) | engraving library (C++, WASM, Python) | 6.4.1 (2026-11-03) | 2026-11-10 | LGPL-3.0-only | yes (MEI tablature) | MIDI out only | no | RUNNABLE |
| MuseScore Studio (`mscore` CLI) | desktop notation editor with CLI conversion | v4.7.6 tag (commit 2026-10-22) | 2026-11-10 | GPL-3.0 (LICENSE.txt) | yes | yes (desktop) | yes (desktop) | RUNNABLE (Linux AppImage) |
| webmscore | MuseScore 3 engine compiled to WASM | 1.2.1 (2023-01-24) | 2023-01-23 | npm field `GPL`; LICENSE.GPL is GPL v3 | yes | yes (with a SoundFont) | no | RUNNABLE |
| LilyPond (TabStaff) | text-to-engraving compiler | 2.26.0 stable (2026-04-21); 2.27.4 unstable (2026-10-20) | not read (GitLab) | GPL-3.0-or-later (LICENSE) | yes | MIDI out only | text only | RUNNABLE |
| TuxGuitar (helge17 fork) | desktop tab editor (Java) | 2.1.1 (CHANGES: 2026-10-23; tag commit 2026-10-21) | 2026-11-03 | LGPL-2.1 (docs/LICENSE) | yes | yes | yes | RUNNABLE (desktop app; headless use UNVERIFIED) |
| PyGuitarPro | Python reader/writer for GP3-GP5 | 0.11 (PyPI 2026-05-03) | 2026-11-10 | LGPL-3.0-only (PyPI) | no | no | data model | RUNNABLE |
| music21 | Python music toolkit (MusicXML in/out) | 10.5.2 (PyPI 2026-10-28); v11.0.0b14 tag 2026-10-30 | 2026-11-08 | BSD-3-Clause (PyPI) | via MusicXML export | MIDI out | data model | RUNNABLE |
| ChordSheetJS (`chordsheetjs`) | JS ChordPro / chord-sheet parser and formatter | 18.0.0 (2026-09-24) | 2026-11-10 | GPL-2.0-only | chord sheets, not tab | no | text | RUNNABLE |
| ChordPro (reference program, Perl) | chord-sheet formatter (PDF etc.) | R6.101.0 tag (2026-04-30) | 2026-04-30 | Artistic License 2.0 (LICENSE) | no (chords and lyrics; tab blocks as text) | no | text | RUNNABLE |
| svguitar | JS chord-diagram renderer | 2.10.1 (2026-10-17) | 2026-10-17 | MIT | chord boxes | no | no | RUNNABLE |
| vexchords | JS chord-diagram renderer | 1.2.0 (2019-03-31) | 2024-12-31 | MIT | chord boxes | no | no | RUNNABLE |
| Tonal (`tonal`) | JS music-theory functions | 6.5.1 (2026-10-14) | 2026-10-14 | MIT | no | no | n/a | RUNNABLE |
| react-guitar | React fretboard component | 1.1.3 (2026-01-04) | 2026-01-06 | MIT | fretboard view | yes (see section) | fretboard input | RUNNABLE |
| fretboard.js (`@moonwave99/fretboard.js`) | JS fretboard diagrams | 0.2.13 (2022-11-18) | 2022-11-17 | ISC | fretboard view | no | no | RUNNABLE |
| chords-db / react-chords (`@tombatossals/*`) | chord-shape database and React chord diagrams | 0.5.1 (2019-11-02) / 0.2.10 (2019-10-23) | 2025-10-14 (chords-db) | MIT | chord boxes | no | no | RUNNABLE |
| jTab (`jtab`, telesoho fork) | JS chord and tab drawing from text | 1.3.2 (2017-10-30) | 2022-02-20 | MIT (npm field) | yes | no | no | RUNNABLE |
| abc2svg | JS ABC renderer | 1.22.1 on npm (2022-09-13, marked deprecated on npm) | not read (chiselapp) | LGPL-3.0 (npm field) | UNVERIFIED | UNVERIFIED | no | RUNNABLE (npm package) |
| Flat.io embed and API (`flat-embed`, `flat-api`) | hosted notation editor; JS embed client; REST API | flat-embed 2.12.1 (2026-04-02); flat-api 1.0.1 (2026-09-17) | 2026-10-20 / 2026-09-17 | clients Apache-2.0; service under Flat's terms | yes (service) | yes (service) | yes (service) | service; account needed |
| Soundslice | hosted tab/notation player and editor | n/a | n/a | service terms | yes (service) | yes (service) | yes (service) | service; account needed |
| MusicXML 4.0 (format) | W3C Community Group format | v4.0 tag (2021-06-03); 4.1 draft | 2026-11-10 (w3c/musicxml) | W3C Community Final Specification Agreement (spec page) | tab elements | n/a | n/a | n/a |
| MEI (format) | Music Encoding Initiative schema | v5.1 tag (2025-01-22); v6.0 tags in progress (2026-11-02) | 2026-11-10 | ECL-2.0 (repository LICENSE) | tablature module | n/a | n/a | n/a |
| Guitar Pro formats (.gp3/.gp4/.gp5, .gpx, .gp) | proprietary formats of Arobas Music | n/a | n/a | see section | n/a | n/a | n/a | n/a |
| alphaTex (format) | alphaTab's text format | n/a | n/a | see section | n/a | n/a | n/a | n/a |
| ABC (format) | text notation standard | see section | n/a | n/a | n/a | n/a | n/a | n/a |
| ChordPro (format) | chord-sheet text format | see section | n/a | n/a | n/a | n/a | n/a | n/a |
| ASCII tab (format) | informal plain-text convention | n/a | n/a | n/a | n/a | n/a | n/a | n/a |

Added after the first pass (sections "Added after the first pass" below):

| Tool | Kind | Latest version (date) | Last commit | License (as declared) | Renders tab | Plays audio | Edits | RUNNABLE |
|---|---|---|---|---|---|---|---|---|
| `@coderline/alphatab-monaco` and `@coderline/alphatab-language-server` | alphaTex editor integration and LSP | 1.9.0 (2026-10-31) | 2026-11-08 (alphaTab repo) | MPL-2.0 | via alphaTab | no | text (alphaTex) | RUNNABLE |
| guitarpro-parser (npm) | TS parser for GP3-GP8 | 2.0.0 (2026-11-08) | 2026-11-08 | Apache-2.0 | no | no (computes timing) | no | RUNNABLE |
| ApolloTab (PyPI) | Python GP3-GP8 parser, Qt renderer, FluidSynth player | 1.6.0 (2026-08-06) | 2026-08-28 | LGPL-2.1 | yes (QPixmap images) | yes (FluidSynth) | UNVERIFIED | RUNNABLE |
| score-parser (`@jbfullstack/score-parser`) | MIDI and GP to JSON, uses alphaTab | 1.0.1 (2026-03-26) | 2026-03-26 | MIT | no | no | no | RUNNABLE |
| guitarpro (Rust crates, slundi) | GP3-GP7, MSCZ, MusicXML read/write; ASCII tab CLI; C FFI | 0.4.5 crates.io (2026-11-03) | 2026-11-03 | MIT | ASCII tab | no | data model | RUNNABLE |
| @musicbird/gpx-parser (npm) | GPX parser | 0.1.3 (2021-12-10) | not read | AGPL-3.0-or-later (npm field) | no | no | no | RUNNABLE |
| It's MyTabs (louislam/its-mytabs) | self-hosted web tab viewer/player on alphaTab | n/a (Docker image; version not read) | 2026-11-06 | MIT | yes | yes | no (feature list read) | RUNNABLE (Deno or Docker) |
| Tab Flow (Obsidian plugin) | alphaTab inside Obsidian | 0.5.7 | 2026-09-23 | MPL-2.0 | yes | yes | alphaTex text | Obsidian desktop |
| Autostrum (michaelongaro/autostrum) | web tab player and editor | n/a | 2026-11-09 | no license file found | yes | yes (samples) | yes | UNVERIFIED |
| muzart (thegedge/muzart) | browser tab editor (personal project) | n/a | 2026-06-18 | MIT | yes | yes (Web Audio) | yes | RUNNABLE |
| Songshed (danjutan/Songshed) | grid-based tab editor, proof of concept | n/a | 2026-02-16 | no license file found | yes | UNVERIFIED | yes | UNVERIFIED |
| tab-editor (calesce/tab-editor) | browser tab editor | n/a | 2017-11-02 | MIT | yes | yes (soundfont-player) | yes | RUNNABLE |
| SLiMTAB (tim37021/SLiMTAB) | tab editor (Node.js) | n/a | 2017-06-17 | CC0-1.0 | yes | UNVERIFIED | yes | UNVERIFIED |
| Guitar (1j01/guitar) | web virtual guitar, pasted-tab player | n/a | 2023-05-02 | MIT | ASCII tab input | yes | records notes | RUNNABLE |
| Power Tab Editor 2.0 | desktop tab editor (C++/Qt) | n/a (not read) | 2026-11-01 | GPL-3.0 | yes | yes (mixer per README) | yes | desktop |
| tuitar | terminal tab editor (Go) | n/a | 2025-09-28 | MIT | ASCII in terminal | yes (Karplus-Strong) | yes | RUNNABLE |

Notes on the list, read 2026-11-10:

- alphaTab 1.9 draws a "♪ alphaTab.net" mark in rendered scores of more than 10 bars (or more than 2 shown tracks),
  and its maintainer announces a planned license change from MPL-2.0 to CPAL-1.0 "or similar". Quotes in the
  alphaTab section. A trial that renders more than 10 bars will show the mark.
- VexTab's LICENSE file restricts the free grant to non-commercial use (quote in the VexTab section).
- `abc2svg` on npm is marked deprecated by npm; its project lives on chiselapp.com (section below).

## alphaTab

- **What it is.** "alphaTab renders interactive sheet music and guitar tablature from Guitar Pro, MusicXML, Capella
  and alphaTex files, and plays it back with a built-in synthesizer or in sync with your own audio and video. One
  TypeScript core ships for the web, .NET and Android" (README,
  https://raw.githubusercontent.com/CoderLine/alphaTab/develop/README.md). Maintainer: Daniel Kuschny ("Copyright ©
  2025, Daniel Kuschny and Contributors", LICENSE). Repository https://github.com/CoderLine/alphaTab (default branch
  `develop`, last commit 2026-11-08, "feat: keep the sharp or flat spelling of tunings (#3020)"). Docs
  https://alphatab.net/docs/introduction.
- **Versions.** npm `@coderline/alphatab` 1.9.0 published 2026-10-31T21:21:39Z; 611 versions on npm, first
  2020-05-01; `alpha` tag 1.10.0-alpha.1975 (https://registry.npmjs.org/@coderline/alphatab). Sibling packages at
  1.9.0 on the same day: `@coderline/alphatab-vite`, `@coderline/alphatab-webpack`, `@coderline/alphatab-monaco`
  ("alphaTex editing in the Monaco editor (experimental)", README) and `@coderline/alphatab-language-server`
  ("alphaTex language server with completion, hover docs and formatting, plus a TextMate grammar"). The monorepo
  also holds `@coderline/alphatab-react` ("React bindings for alphaTab: API lifecycle, host element and event
  hooks") and `@coderline/alphatab-ui` ("The alphaTab player and alphaTex editor shared by the website and the
  playground"), both marked `"private": true` in their package.json and not on npm (registry returned 404 on
  2026-11-10). Also on NuGet (`AlphaTab`, `AlphaTab.Windows`) and Maven Central (`net.alphatab:alphaTab`) per the
  README.
- **Formats** (README table): "**Reads** | Guitar Pro 3–8 (`.gp3` `.gp4` `.gp5` `.gpx` `.gp`), MusicXML (`.xml`
  `.musicxml` `.mxl`), Capella (`.capx`), alphaTex"; "**Writes** | Guitar Pro 7+ (`.gp`), alphaTex, MIDI, audio (PCM
  samples)". Exporters per the docs: `Gp7Exporter` ("since: 1.2", returns a `Uint8Array`; "Guitar Pro 7 and Guitar
  Pro 8 both open the resulting file"), MIDI via `MidiFileGenerator` ("Standard MIDI File 1.0 output ... tempo map,
  time signatures, program changes, note on/off with expression and pitch bend"; "since: 1.3"), `AlphaTexExporter`
  ("since: 1.7", `export()` returns UTF-8 bytes, `exportToString()` returns a string)
  (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/website/docs/features/export/export-to-guitar-pro-7.mdx,
  .../export-midi.mdx, .../export-to-alphatex.mdx).
- **How the docs describe the Guitar Pro generations** (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/website/docs/features/import-load/guitar-pro.mdx):
  "GP3, GP4, GP5 (.gp3 / .gp4 / .gp5) — proprietary binary streams. GP4 has an official partial spec from Arobas; the
  rest was reverse-engineered from test files." "GP6 (.gpx) — the first XML-based generation, wrapped in a custom
  container that behaves like a compressed filesystem. Inside sit `score.gpif` (the notation XML),
  `BinaryStylesheet`, `PartConfiguration`, and `LayoutConfiguration`." "GP7 and GP8 (.gp) — a standard ZIP archive
  holding `Content/score.gpif` plus the stylesheet and configuration blobs from GP6. GP8 uses the same envelope as GP7
  with additional payloads (embedded audio)".
- **MusicXML import of tab data** (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/website/docs/features/import-load/musicxml.mdx):
  "Guitar techniques — string and fret from `technical`, string numbers on standard notation staves, dead notes,
  harmonics, fingering, and let ring or palm mute lines. Coverage extended in 1.9."
- **How a program calls it.** Browser: `new alphaTab.AlphaTabApi(element, { core: { file: '/scores/song.gp' } })`
  or `{ tex: true }` for inline alphaTex (README quick start). Node.js without a DOM: "you skip `AlphaTabApi` (which
  expects a DOM host) and drive the low-level `ScoreRenderer` directly", `ScoreLoader.loadScoreFromBytes`, with
  `settings.core.engine = 'svg'` for SVG text or `'skia'` (with `@coderline/alphaskia` and a native package
  `-windows`, `-linux` or `-macos`) for PNG
  (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/website/docs/features/render/nodejs-headless-rendering.mdx).
  Backends: "Web — SVG (default) or HTML5 Canvas. Skia is not available in the browser"
  (.../features/render/choosing-a-backend.mdx). No GPU or model weights involved.
- **Editing.** No point-and-click tab editor is described in the README or in the docs pages read (the
  `@coderline/alphatab-ui` package that holds the website's "player and alphaTex editor" is private, above); the docs
  describe editing as code on the data model: "Iterate `Score → Track → Staff → Bar → Voice → Beat → Note`, change fields, call `api.render()`, and the
  render reflects the changes" (.../features/extend/traversing-and-mutating-the-model.mdx), plus "Modify the data
  model in code and export to Guitar Pro, alphaTex, MIDI or rendered audio" (README). Text editing through alphaTex
  with the Monaco package and the language server (above).
- **Data fields relevant to tab.** Notes carry `fret` (used in the traversal example); the string of each note is
  read from MusicXML `technical` (MusicXML import doc, below) and written as `fret.string` in alphaTex. alphaTex: "On a stringed instrument, a note is written as `fret.string`. The number before the dot is the fret. The
  number after the dot is the string, counted from the highest-pitched string down. String 1 is the top string when
  you read tab — the thinnest string on a guitar, sounding highest."
  (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/website/docs/alphatex/syntax.mdx).
- **Constraints a user can set (alphaTex staff metadata)**, from the tag definitions in
  `packages/alphatex/src/metadata/staff/` of the repository: `\capo` "Defines the fret on which a capo should be
  placed." (example `\capo 5`); `\tuning` "Defines the number of strings and their tuning for stringed (and fretted)
  instruments." (example `\tuning (A1 D2 A2 D3 G3 B3 E4)`). Also `\tempo`, `\ts` (time signature), `\track`,
  `\staff {tabs}` (alphaTex introduction example). Playback settings in the docs: count-in and metronome, playback
  speed, looping, backing-track audio and video sync (pages under `website/docs/features/play-sync/`).
- **Player and SoundFont.** "alphaTab converts the score into MIDI, feeds that stream to a built-in software
  synthesizer that plays samples from a SoundFont 2 (`.sf2`) file"; "The current synthesizer implementation is
  derived from TinySoundFont"; "Web Audio through an AudioWorklet on the browser"
  (.../features/play-sync/soundfont2-with-tinysoundfont.mdx). Bundled SoundFont: the repository holds
  `packages/alphatab/font/sonivox/sonivox.sf2` and `sonivox.sf3`; their LICENSE file
  (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/packages/alphatab/font/sonivox/LICENSE) reads in full:
  "Copyright (c) 2004-2006 Sonic Network Inc. Licensed under the Apache License, Version 2.0 (the "License"); you may
  not use this file except in compliance with the License." (followed by the standard Apache 2.0 boilerplate). Other
  SoundFonts load with `api.loadSoundFont(data)` or, on Web, `api.loadSoundFont(url)`; the docs demo GeneralUser GS
  ("about 9 MB as compressed SF3") (.../features/play-sync/custom-soundfonts.mdx).
- **LICENSE FACTS** (read 2026-11-10):
  - a. Code: SPDX `MPL-2.0` (npm `license` field of 1.9.0). LICENSE file
    (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/LICENSE) begins "alphaTab is licensed under
    MPL-2.0." Grant, section 2.1: "Each Contributor hereby grants You a world-wide, royalty-free, non-exclusive
    license: (a) under intellectual property rights (other than patent or trademark) Licensable by such Contributor
    to use, reproduce, make available, modify, display, perform, distribute, and otherwise exploit its Contributions,
    either on an unmodified basis, with Modifications, or as part of a Larger Work". Copyleft, section 3.2: "If You
    distribute Covered Software in Executable Form then: (a) such Covered Software must also be made available in
    Source Code Form, as described in Section 3.1, and You must inform recipients of the Executable Form how they can
    obtain a copy of such Source Code Form by reasonable means in a timely manner". Section 3.3: "You may create and
    distribute a Larger Work under terms of Your choice, provided that You also comply with the requirements of this
    License for the Covered Software."
  - a2. Attribution (a requirement stated outside the MPL text). `packages/alphatab/LICENSE.header`
    (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/packages/alphatab/LICENSE.header): "Attribution:
    The "♪ alphaTab.net" attribution in rendered scores must stay visible in the rendered output. Removing, hiding,
    covering or cropping it requires permission from the alphaTab maintainers: https://alphatab.net/docs/attribution".
    README: "Scores rendered by alphaTab carry a small "♪ alphaTab.net" attribution above the staff at the end of the
    first system (in the horizontal layout, after the first group of bars). Songs with up to 10 bars are rendered
    without it, unless more than 2 tracks are shown." and "There is no setting to turn it off." The attribution page
    (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/website/docs/attribution.mdx, also live at
    https://alphatab.net/docs/attribution, both read 2026-11-10): "alphaTab is free, also for commercial products. In
    return, we ask for a visible credit."; "MPL-2.0 has no clause about credits in your user interface. Keeping the
    attribution is what the project asks of everyone who uses alphaTab, and the license change below makes it part
    of the license."; "A future release of alphaTab will move from MPL-2.0 to an open-source license with an
    attribution clause. The choice is not settled yet. The Common Public Attribution License 1.0 (CPAL-1.0) is the
    best fit we see so far"; under that planned license "Offering an app over a network counts as distribution.
    Changes you make to alphaTab's own files must be made available, also when they only run on your server or in
    your web app." and "Releases published under MPL-2.0 stay under MPL-2.0." The page lists what qualifies as an
    agreed "Alternative attribution" and says "An entry in an about dialog, a credits screen or a license list does
    not qualify on its own."
  - a3. Bundled third-party parts (LICENSE.header "Integrated Libraries"): TinySoundFont "License: MIT", SFZero
    "License: MIT", Bravura "License: SIL Open Font License 1.1". README: "The bundled music fonts Bravura and Petaluma
    (© Steinberg Media Technologies) and the Noto fonts are licensed under the SIL Open Font License. The bundled
    SONiVOX SoundFont is licensed under the Apache License 2.0."
  - b, c. No model weights, no training data.
- **Measurements by the authors:** none found in the pages read.

## VexFlow

- **What it is.** "VexFlow is an open-source library for rendering sheet music. It is written in TypeScript, and
  outputs scores to HTML Canvas and SVG. It works in browsers and in Node.js projects (e.g., a command line script to
  save a score as a PDF)." (README, https://raw.githubusercontent.com/vexflow/vexflow/main/README.md). Repository
  https://github.com/vexflow/vexflow (default branch `main`, last commit 2026-10-28). The older repository
  https://github.com/0xfe/vexflow has its last commit on 2025-03-05.
- **Versions.** npm `vexflow` 5.0.0 published 2025-03-05 (https://registry.npmjs.org/vexflow); no newer `latest` on
  2026-11-10.
- **How a program calls it.** Script tag or `npm install vexflow`; high-level `Factory`/`EasyScore` API or the
  low-level API (`new Renderer(div, Renderer.Backends.SVG)`) (README). Input is JavaScript calls or the EasyScore
  string syntax, not a file: the README describes no MusicXML or Guitar Pro import, and no file in the 2026-11-10
  file list has "musicxml" in its name.
- **Tab support.** The source holds `src/tabstave.ts`, `src/tabnote.ts`, `src/gracetabnote.ts`, `src/tabslide.ts`,
  `src/tabtie.ts`, `src/bend.ts`, `src/vibrato.ts` (file list of the 2026-11-10 clone). `TabNote` positions are
  "An array of `{ str: X, fret: X }`"; "fret: 'X' indicates an unused/muted string." (comments in `src/tabnote.ts`).
- **Plays audio:** no player in the package (none in the README or source list). **Edits:** no editor; rendering
  only.
- **LICENSE FACTS** (read 2026-11-10): a. SPDX `MIT` (npm field). https://raw.githubusercontent.com/vexflow/vexflow/main/LICENSE:
  "The MIT License ... Copyright (c) 2023-2026 VexFlow contributors (see AUTHORS.md) Copyright (c) 2010-2022 Mohit
  Muthanna Cheppudira ... Permission is hereby granted, free of charge, to any person obtaining a copy of this
  software and associated documentation files (the "Software"), to deal in the Software without restriction".
  b, c. No weights, no training data.

## VexTab

- **What it is.** "VexTab is a language that allows you to easily create, edit, and share music notation and guitar
  tablature. Unlike ASCII tab, which is designed for readability, VexTab is designed for writeability." (README,
  https://raw.githubusercontent.com/0xfe/vextab/master/README.md, heading "VexTab 4.0"). Author Mohit Muthanna
  Cheppudira. Repository https://github.com/0xfe/vextab, last commit 2026-01-18.
- **Versions.** npm `vextab` 4.0.5 published 2026-01-18; npm `license` field `LicenseRef-LICENSE`
  (https://registry.npmjs.org/vextab).
- **How a program calls it.** `import {VexTab, Artist, Vex} from 'vextab'`, then `tab.parse('tabstave')` and
  `artist.render(renderer)`; or include `dist/div.prod.js` and every `div` with class `vextab-auto` is rendered in
  place, with an optional live `editor="true"` text box (README).
- **Input format** (README example): `tabstave notation=true key=A time=4/4` followed by `notes :q =|: (5/2.5/3.7/4)
  :8 7-5h6/3 ...`, i.e. `fret/string` pairs, durations such as `:q`, `:8`, and technique marks (`h`, `p`, `s`, `b`,
  `v`). Output: VexFlow drawing (SVG or canvas). Plays audio: none in the README.
- **LICENSE FACTS** (read 2026-11-10), https://raw.githubusercontent.com/0xfe/vextab/master/LICENSE, quoted in full
  apart from the warranty paragraph: "VexTab is an open specification and the reference implementation (this
  repository) is open source. It is freely available complete and uncrippled for non-commercial use." "If you would
  like to use this code on commercial websites, products, blogs, plugins, or tools, please get in touch with me. (I'm
  very reasonable.)" "Copyright (c) 2012 Mohit Muthanna Cheppudira". The file ends with "The above copyright notice
  shall be included in all copies or substantial portions of the Software." The npm field is `LicenseRef-LICENSE`
  (no SPDX id).

## vexchords

- **What it is.** "VexChords renders guitar chords in your browser." (README,
  https://raw.githubusercontent.com/0xfe/vexchords/master/README.md). `import { ChordBox } from 'vexchords'`, options
  include `numStrings` ("e.g., 4 for bass"), `numFrets`, `showTuning`. Repository https://github.com/0xfe/vexchords,
  last commit 2024-12-31; npm `vexchords` 1.2.0 published 2019-03-31 (3 versions in all).
- **Renders tab:** no (chord boxes). **Plays audio:** no. **Edits:** no.
- **LICENSE FACTS** (read 2026-11-10), https://raw.githubusercontent.com/0xfe/vexchords/master/LICENSE: "MIT License
  Copyright (c) 2019 Mohit Muthanna Cheppudira Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software". npm field `MIT`.

## OpenSheetMusicDisplay (OSMD)

- **What it is.** "OpenSheetMusicDisplay renders MusicXML sheet music in the browser. It is the missing link between
  MusicXML and VexFlow." (README, https://raw.githubusercontent.com/opensheetmusicdisplay/opensheetmusicdisplay/develop/README.md).
  Made by PhonicScore (LICENSE: "Copyright 2019 PhonicScore"). Repository
  https://github.com/opensheetmusicdisplay/opensheetmusicdisplay (default branch `develop`, last commit 2026-11-10).
- **Versions.** npm `opensheetmusicdisplay` 2.3.0 published 2026-11-07 (https://registry.npmjs.org/opensheetmusicdisplay);
  git tag `2.3.0` dated 2026-11-07.
- **Input:** MusicXML. **Output:** "Outputs SVG or PNG, also via nodejs script in the command line, completely
  headless/browserless (e.g. for server-side rendering - see generateImages script)" (README).
- **Tab:** "Can display tablature (guitar tabs) from MusicXML, including effects like bends and glissandi. Can be
  combined with treble clef." (README).
- **Audio:** "Soon: Audio Playback (work in progress, early access build available for Github sponsors)" (README).
  An image caption in the README reads "(Mockup, OSMD on its own does not support playback)".
- **Editing:** "Allows modification of the displayed score, like hiding parts or instruments, hiding instrument
  names, title or composer, a more compact layout, or coloring notes" (README). No note-entry editor is described.
- **LICENSE FACTS** (read 2026-11-10): a. SPDX `BSD-3-Clause` (npm field).
  https://raw.githubusercontent.com/opensheetmusicdisplay/opensheetmusicdisplay/develop/LICENSE: "Copyright 2019
  PhonicScore Redistribution and use in source and binary forms, with or without modification, are permitted
  provided that the following conditions are met: 1. Redistributions of source code must retain the above copyright
  notice, this list of conditions and the following disclaimer." The early-access audio player for GitHub sponsors
  is not part of the npm package; its terms were not read (UNVERIFIED: the sponsor page
  https://github.com/sponsors/opensheetmusicdisplay is a github.com page, which returns 403 through this box's
  proxy).

## osmd-audio-player

- **What it is.** "Unoffical audio playback engine for OpenSheetMusicDisplay" by Jimmy Utterström (README,
  https://raw.githubusercontent.com/jimutt/osmd-audio-player/master/README.md). The README opens: "This project is
  no longer in active development. I still keep an eye on it and it's open for contributions/PRs but I am not
  actively working on new feature implementations." npm `osmd-audio-player` 0.7.0 published 2021-12-30; last commit
  2021-12-30. Its package.json depends on `"opensheetmusicdisplay": "^0.8.4"` and `"soundfont-player": "^0.12.0"`.
- **SoundFont:** `src/players/SoundfontPlayer.ts` calls `Soundfont.instrument(...)` from soundfont-player with an
  instrument list file named `musyngkiteInstruments`; soundfont-player's README (npm registry readme, read
  2026-11-10): "Out of the box are two Soundfonts available: MusyngKite and FluidR3_GM (MusyngKite by default: has
  more quality, but also weights more)" and they are loaded from "Benjamin Gleitzman's package of pre-rendered sound
  fonts" (https://github.com/gleitz/midi-js-soundfonts). Licenses of those sample sets: see "SoundFonts" below.
- **LICENSE FACTS** (read 2026-11-10): https://raw.githubusercontent.com/jimutt/osmd-audio-player/master/LICENSE:
  "MIT License Copyright (c) 2020 Jimmy Utterström".

## abcjs

- **What it is.** "Javascript library for rendering standard music notation in a browser." (README,
  https://raw.githubusercontent.com/paulrosen/abcjs/main/README.md). Authors per LICENSE: Paul Rosen and Gregory
  Dyke. Repository https://github.com/paulrosen/abcjs, last commit 2026-10-16. Docs https://docs.abcjs.net.
- **Versions.** npm `abcjs` 6.7.2 published 2026-10-16 (https://registry.npmjs.org/abcjs).
- **Input:** ABC notation text. **Output:** SVG; synthesized audio; the docs list "Synthesized Sound", "Timing
  Callbacks", "Interactive Editor", "Transposition" sections (navigation of https://docs.abcjs.net/visual/tablature.html).
- **Tab** (https://docs.abcjs.net/visual/tablature.html, read 2026-11-10): "A line of tablature can be placed under
  a line of standard notation." "To get tablature to appear, add the option abcjs.renderAbc("paper", abc, {
  tablature: [...] }". instrument: "Options: "violin" | "mandolin" | "fiddle" | "guitar" | "fiveString" | """.
  tuning: "This is an array of notes that represent the open strings, starting from the lowest pitch of the
  instrument." with the guitar default `[ "E," , "A," , "D" , "G" , "B" , "e" ]`. capo: "default: 0 The number of
  frets that a capo is placed. This will transpose the numbers so that the open string is on the fret of the capo."
  The tab is computed from the notes; ABC itself carries no string or fret per note (UNVERIFIED whether a per-note
  string choice can be forced; the page read shows only instrument, label, tuning, capo, highestNote,
  hideTabSymbol).
- **SoundFont:** `src/synth/create-synth.js` (2026-11-10 clone) sets `var defaultSoundFontUrl =
  "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/";` and `var alternateSoundFontUrl =
  "https://paulrosen.github.io/midi-js-soundfonts/MusyngKite/";`, overridable with the `soundFontUrl` parameter.
  License of those sample sets: see "SoundFonts" below.
- **LICENSE FACTS** (read 2026-11-10): https://raw.githubusercontent.com/paulrosen/abcjs/main/LICENSE.md: "Copyright
  (c) 2009-2026 Paul Rosen and Gregory Dyke Permission is hereby granted, free of charge, to any person obtaining a
  copy of this software and associated documentation files (the "Software"), to deal in the Software without
  restriction". npm field `MIT`.

## SoundFonts used by the web players above

- **SONiVOX (alphaTab's bundled `sonivox.sf2` / `.sf3`):** "Copyright (c) 2004-2006 Sonic Network Inc. Licensed
  under the Apache License, Version 2.0" (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/packages/alphatab/font/sonivox/LICENSE,
  read 2026-11-10).
- **MIDI.js pre-rendered sets** (used by soundfont-player, osmd-audio-player and abcjs), from
  https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/README.md (read 2026-11-10): "Fluid Soundfont
  - Generated from FluidR3_GM.sf2 (148 MB uncompressed) - Released under Creative Commons Attribution 3.0 license";
  "Musyng Kite Soundfont - Generated from Musyng Kite.sfpack (1.75 GB uncompressed) - Released under Creative Commons
  Attribution Share-Alike 3.0 license"; "FatBoy Soundfont ... Released under Creative Commons Attribution Share-Alike
  3.0 license". The paulrosen fork's README (https://raw.githubusercontent.com/paulrosen/midi-js-soundfonts/gh-pages/README.md)
  repeats the FluidR3_GM and Musyng Kite lines. Neither repository has a LICENSE file at its root (404 on
  2026-11-10). gleitz repository last commit 2021-12-17; paulrosen fork last commit 2022-01-17.
- **GeneralUser GS** is the alternative SoundFont alphaTab's docs demo ("about 9 MB as compressed SF3"); its license
  was not read (UNVERIFIED; source https://schristiancollins.com/generaluser.php).
- **FluidR3_GM on this box:** `/usr/share/sounds/sf2/FluidR3_GM.sf2` (used by the shared test inputs). Its Debian
  copyright file is quoted in the next bullet.
- **Note on FluidR3_GM licenses (sources conflict):** the MIDI.js README above says the FluidR3_GM set is "Released
  under Creative Commons Attribution 3.0 license". The box's Debian package `fluid-soundfont-gm` 3.1-5.3, file
  `/usr/share/doc/fluid-soundfont-gm/copyright` (read 2026-11-10), says: "Upstream Author: Frank Wen", "Copyright ©
  2000-2002, 2008 Frank Wen", and under License: "From README: "I hereby release Fluid under the MIT license, as
  described in COPYING."", followed by the MIT permission text. Both quoted; nothing more is concluded here.

## Verovio

- **What it is.** "Verovio is a fast, portable and lightweight library for engraving Music Encoding Initiative (MEI)
  digital scores into SVG images. Verovio also contains on-the-fly converters to render Plaine & Easie Code, Humdrum,
  Musedata, MusicXML, EsAC, and ABC digital scores." "Verovio is written in standard C++20 and is available in
  several bindings (JavaScript, Python, Java, Swift, Go). It can be compiled as a standalone command-line tool or as
  a music-rendering library for applications." (README, https://raw.githubusercontent.com/rism-digital/verovio/develop/README.md).
  Made by RISM Digital (repository https://github.com/rism-digital/verovio, default branch `develop`, last commit
  2026-11-10). Reference book https://book.verovio.org.
- **Versions.** 6.4.1: npm `verovio` published 2026-11-03, PyPI `verovio` uploaded 2026-11-03 (requires Python
  >=3.10), git tag `version-6.4.1` dated 2026-11-03; CHANGELOG "## [6.4.1] – 2026-11-03".
- **Tablature history** (CHANGELOG.md in the repository, read 2026-11-10): "[3.4.0] - 2021-05-01 ... Preliminary
  support for tablature (experimental work)"; "[3.7.0] - 2021-11-22 ... Preliminary support for tablature MIDI
  output"; "[3.9.0] - 2022-02-22 ... Preliminary support for stems and beam for guitar tablature" and "Preliminary
  support for tablature MusicXML import"; "[4.5.0] – 2024-12-22 ... Integration of tablature customization
  implementation"; "[5.2.0] – 2025-04-23 ... Support for additional tablature features introduced in MEI 5.1";
  "[6.1.0] – 2026-03-12 ... Support (initial) for `notationtype@tab.staff-like`"; "[6.4.0] – 2026-10-30 ... Fix
  tablature tie and tuplet positioning". Source files `src/view_tab.cpp`, `src/tabgrp.cpp`, `src/tabdursym.cpp`.
- **How a program calls it.** Python (https://book.verovio.org/installing-or-building-from-sources/python.html):
  "pip install verovio", "import verovio", "tk = verovio . toolkit ()", "tk . loadFile ( " path-to-mei-file " )",
  "svg_string = tk . renderToSVG ( 1 )". MIDI: `RenderToMIDI`, and `RenderToMIDIFile` "Render a document to MIDI
  and save it to the file. This method is not available in the JavaScript distributed version of the toolkit"
  (https://book.verovio.org/toolkit-reference/toolkit-methods.html). Other render methods listed there:
  `RenderToPAE`, `RenderToSVG`, `RenderToTimemap`. Command line: a `verovio` binary built with CMake
  (.../command-line.html). JavaScript: npm `verovio` (WASM toolkit). Input format detection: "When data is loaded into
  Verovio with no input format specifies, it tries to detect it based on the initial content of the data. MEI is
  assume to be the default format if auto detection fails." (https://book.verovio.org/toolkit-reference/input-formats.html).
- **Plays audio:** no synthesizer; it renders MIDI and a timemap (above). **Edits:** no editor in the library (the
  Verovio Online Editor/Viewer at http://editor.verovio.org is named in the README; not read further).
- **LICENSE FACTS** (read 2026-11-10): a. SPDX `LGPL-3.0-only` (npm and PyPI fields). README: "Verovio is available
  under the LGPL license (see COPYING and COPYING.LESSER)". COPYING.LESSER
  (https://raw.githubusercontent.com/rism-digital/verovio/develop/COPYING.LESSER): "GNU LESSER GENERAL PUBLIC LICENSE
  Version 3, 29 June 2007"; section 4: "You may convey a Combined Work under terms of your choice that, taken
  together, effectively do not restrict modification of the portions of the Library contained in the Combined Work
  and reverse engineering for debugging such modifications, if you also do each of the following:" (conditions a-e
  follow in the file). Embedded libraries named in the README: humlib, JSON++, MidiFile, pugixml, MINIZ-CPP,
  tuning-library (their licenses were not read; UNVERIFIED). b, c. No weights, no training data.

## MusicXML (format), tablature elements

- **What it is.** MusicXML 4.0, "Final Community Group Report 1 June 2021", "published by the Music Notation
  Community Group under the W3C Community Final Specification Agreement (FSA)"; "It is not a W3C Standard nor is it on
  the W3C Standards Track." (https://www.w3.org/2021/06/musicxml40/, read 2026-11-10). Repository
  https://github.com/w3c/musicxml (tags up to `v4.0`, tag commit 2021-06-03; last commit 2026-11-10 "Update test
  suite"). The repository's version history lists "Version 4.1 (Draft)" (`docs/src/pages/version-history/41.md`,
  "title: Version 4.1 Draft"); its listed changes do not include `<string>`, `<fret>`, `<staff-tuning>` or `<capo>`
  (one listed change adds a `@number` attribute to `<harmonic>`).
- **Tab elements** (MusicXML 4.0 reference, read 2026-11-10):
  - `<string>`: "The <string> element is used with tablature notation, regular notation (where it is often
    circled), and chord diagrams. String numbers start with 1 for the highest pitched full-length string." Parent
    elements `<frame-note>`, `<technical>`
    (https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/string/).
  - `<fret>`: "The <fret> element is used with tablature notation and chord diagrams. Fret numbers start with 0 for
    an open string and 1 for the first fret." Content `nonNegativeInteger`
    (https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/fret/).
  - `<staff-tuning>`: "The <staff-tuning> element specifies the open, non-capo tuning of the lines on a tablature
    staff." Content "<tuning-step> (Required) <tuning-alter> (Optional) <tuning-octave> (Required)"; attribute `line`
    "Indicates the staff line for this tuning, numbered from bottom to top."
    (https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/staff-tuning/).
  - `<capo>`: "The <capo> element indicates at which fret a capo should be placed on a fretted instrument. This
    changes the open tuning of the strings specified by the <staff-tuning> element by the specified number of
    half-steps." Parent `<staff-details>`; content `nonNegativeInteger`
    (https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/capo/).
  - `<staff-details>` attribute `show-frets`: "Indicates whether to show tablature frets as numbers (0, 1, 2) or
    letters (a, b, c). It is numbers if not specified."
    (https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/staff-details/).
  - Tutorial (https://www.w3.org/2021/06/musicxml40/tutorial/tablature/): "The <staff-lines> element specifies the
    number of lines on a tablature staff, usually one for each string. Staff tunings are described with the
    <staff-tuning> and <capo> elements. TAB is one of the values available for <clef> elements." Its example encodes
    a note's position as `<technical><string>3</string><fret>5</fret></technical>` alongside a `<pitch>`, and says
    "While elements like <harmonic> and <bend> have sporadic support in current MusicXML software, the <hammer-on>
    and <pull-off> elements are supported in many applications."
- **Readers and writers of MusicXML tab named in this survey:** alphaTab (reads; "string and fret from `technical`"),
  OSMD (renders tab from MusicXML), Verovio ("Preliminary support for tablature MusicXML import", 3.9.0), MuseScore and
  music21 (sections below).
- **License of the specification:** the copyright line above, "Copyright © 2004-2021 the Contributors to the MusicXML
  Specification, published by the Music Notation Community Group under the W3C Community Final Specification
  Agreement (FSA)" and "Please note that under the W3C Community Final Specification Agreement (FSA) other conditions
  apply." The FSA text itself was not read (UNVERIFIED: https://www.w3.org/community/about/agreements/final/). The
  w3c/musicxml repository has no LICENSE file at its root (file list of the 2026-11-10 clone).

## MEI (format), tablature module

- **What it is.** "The Music Encoding Initiative (MEI) is an open-source effort to define a system for encoding
  musical documents in a machine-readable structure." (README of https://github.com/music-encoding/music-encoding,
  default branch `develop`, last commit 2026-11-10). Release tags: `v5.0`, `v5.1` (tag date 2025-01-22), and
  `v6.0-0+featureFreeze`, `v6.0-1+meiODDs` (2026-11-02), i.e. a v6.0 in preparation (UNVERIFIED whether 6.0 has
  been released; the tags carry no plain `v6.0`).
- **Tablature** (MEI Guidelines v5, chapter "7 Repertoire: String Tablature",
  https://music-encoding.org/guidelines/v5/content/tablature.html, read 2026-11-10): "This chapter describes the
  MEI.stringtab module (which will be renamed to MEI.tablature in a future version). The MEI.stringtab module is used
  to record basic tablature notation. It is designed primarily for plucked-string instruments, such as guitar and
  lute." "The notation used is defined on the staffDef element using the notationtype attribute. Possible values
  are: tab.guitar , tab.lute.italian , tab.lute.french and tab.lute.german ." Tuning: "The tuning element is used
  inside staffDef to describe the pitches of the open strings of the instrument", e.g. `<tuning
  tuning.standard="guitar.standard"/>` or per-course `<course n="1" pname="e" oct="4"/>`, where "n captures the
  course number (counting from the course closest to the player’s feet when the instrument is played)". Notes:
  "Unlike CMN, note elements in tablature do not have an explicit pitch, but indicate playing instructions ... The
  tab.course attribute is used to capture which course is to be struck, and tab.fret specifies on which fret of the
  fretboard the player should stop the course. A value of 0 for tab.fret refers to an unstopped, open course", e.g.
  `<note tab.course="6" tab.fret="5"/>`; chords are `<tabGrp dur="4">` with an optional `<tabDurSym/>`. The word
  "capo" does not occur in that chapter (text search of the saved page).
- **Renderer:** Verovio (section above).
- **License:** the repository LICENSE (https://raw.githubusercontent.com/music-encoding/music-encoding/develop/LICENSE,
  read through the 2026-11-10 clone): "Educational Community License Version 2.0, April 2007"; "The Educational
  Community License version 2.0 ("ECL") consists of the Apache 2.0 license, modified to change the scope of the
  patent grant in section 3 to be specific to the needs of the education communities using this license."

## MuseScore Studio (command line)

- **What it is.** "MuseScore Studio is an open source and free music notation software." (README of
  https://github.com/musescore/MuseScore, read through the 2026-11-10 clone; default branch `main`, last commit
  2026-11-10). Newest release tag `v4.7.6` (tagged commit dated 2026-10-22). Linux downloads on
  https://musescore.org/en/download are `musescore-x86_64.AppImage` and `musescore-aarch64.AppImage` (links on that
  page, read 2026-11-10).
- **How a program calls it** (https://musescore.org/en/handbook/4/command-line-usage, read 2026-11-10): `-o` /
  `--export-to`: "Export the given (or currently opened) file to the specified output file . The file type depends
  on the extension of the filename given. This option switches to “converter mode” and avoids the graphical user
  interface." `-j` processes a JSON conversion job. "Valid file extensions for output are:" flac, metajson, mid, midi,
  mlog, mp3, mpos ("measure positions (XML)"), mscx, mscz, musicxml, mxl, ogg, pdf, png, spos, svg, wav, xml. No
  Guitar Pro extension is in that output list. Whether the AppImage runs headless on this box without a display
  server: UNVERIFIED here (the try lane tests it).
- **Input formats with tab.** `src/importexport/guitarpro/guitarpromodule.cpp` registers the Guitar Pro reader for
  `{ "gtp", "gp3", "gp4", "gp5", "gpx", "gp", "ptb" }` (line 52 of the 2026-11-10 clone). The source tree also has
  importexport modules `musicxml`, `mei`, `midi`, `tabledit`, `capella`, `musedata`, `bww`, `ove`, `mnx`. README
  features: "MusicXML import/export", "MIDI (SMF) import/export", "MEI import/export", "MuseData import".
- **Plays audio / edits:** the desktop application does both; the command line renders audio files (wav, mp3, flac,
  ogg) per the extension list above.
- **LICENSE FACTS** (read 2026-11-10): `LICENSE.txt` in the repository: "MuseScore Studio, free and open source
  music notation software Copyright (C) 1999-2026 MuseScore Limited and others This program is free software; you can
  redistribute it and/or modify it under the terms of the GNU General Public License version 3 as published by the
  Free Software Foundation." Font exception in the same file: "If you create a document which uses fonts included in
  MuseScore Studio, and embed this font or unaltered portions of this font into the document, then this font does not
  by itself cause the resulting document to be covered by the GNU General Public License." README: "MuseScore Studio
  is licensed under GPL version 3.0." The repository also has an `AI_POLICY.md` (not read).

## webmscore

- **What it is.** "MuseScore's libmscore (the core library) in WebAssembly!" (README of
  https://github.com/LibreScore/webmscore, read through the 2026-11-10 clone). Last commit 2023-01-23; npm `webmscore`
  1.2.1 published 2023-01-24 (https://registry.npmjs.org/webmscore); npm `license` field `GPL`.
- **Features** (README): "Parse `mscz` file data", "Generate music sheets in SVG/PNG/PDF format", "Generate MIDI",
  "Generate audio files in WAV, OGG, MP3, or FLAC format", "Synthesize raw audio frames, can be used in the Web Audio
  API", "Export as MusicXML compressed/uncompressed", "Generate position information of measures or segments on the
  generated sheets", "Run inside a Web Worker thread".
- **Input formats** (`web-public/schemas.ts`, type `InputFileFormat`): `'mscz'`, `'mscx'`, `'mxl'`, `'musicxml' |
  'xml'`, `'midi'`, `'kar'`, `'gtp' | 'gp3' | 'gp4' | 'gp5' | 'gpx' | 'gp' | 'ptb' // Guitar Pro`.
- **How a program calls it:** `import WebMscore from 'webmscore'`, `WebMscore.ready.then(async () => { const score =
  await WebMscore.load('mscz', msczdata) })`, in browsers or in Node.js (README).
- **SoundFont:** "Loading a soudfont (sf2/sf3) file is required before generating/synthesizing audio." `await
  score.setSoundFont(soudfontData)`; the README's example fetches `FluidR3Mono_GM.sf3` from
  `https://cdn.jsdelivr.net/gh/musescore/MuseScore@2.1/share/sound/FluidR3Mono_GM.sf3`. No SoundFont is bundled per
  that sentence.
- **LICENSE FACTS** (read 2026-11-10): `LICENSE.GPL` in the repository: "MuseScore, free and open source music
  notation software Copyright (C) 1999-2022 MuseScore BVBA and others This program is free software; you can
  redistribute it and/or modify it under the terms of the GNU General Public License version 3 as published by the
  Free Software Foundation."

## LilyPond (TabStaff)

- **What it is.** GNU LilyPond, a text-to-engraving compiler. Versions on https://lilypond.org/ (read 2026-11-10):
  "LilyPond 2.26.0 released - April 21, 2026" (Stable Release) and "LilyPond 2.27.4 released - October 20, 2026"
  (Unstable Release). PyPI `lilypond` (binary wheels from https://gitlab.com/jeanas/lilypond-wheels) newest 2.25.12,
  uploaded 2024-02-02.
- **Tab** (Notation Reference 2.26, "Common notation for fretted strings",
  https://lilypond.org/doc/v2.26/Documentation/notation/common-notation-for-fretted-strings, read 2026-11-10): "By
  default, string 1 is the highest string, and corresponds to the top line on the TabStaff . The tuning of the
  TabStaff strings defaults to the standard guitar tuning (with 6 strings). The notes are printed as tablature, by
  using TabStaff and TabVoice contexts." "LilyPond automatically calculates the fret for a note based on the string
  to which the note is assigned. In order to do this, the tuning of the strings must be specified. The tuning of the
  strings is given in the stringTunings property." Predefined tunings include "guitar-open-g-tuning". String choice:
  "If you would like a certain pitch to be played on a specific string you can add a string number indication to the
  pitch name." and "Usually it will be more comfortable to define the playing position by using the value of
  minimumFret . The default value for minimumFret is 0. Even when minimumFret is set, open strings are used whenever
  possible. This behavior can be changed by setting restrainOpenStrings to #t ." Capo: the page mentions a capo only
  for fret diagrams: "Unique to the \fret-diagram-verbose interface is a capo indication that can be placed on the
  fret diagram."
- **How a program calls it:** the `lilypond` command on a `.ly` text file (the usage page was not re-read today:
  UNVERIFIED wording), producing PDF, SVG ("23.3.1 SVG Output" in the manual's table of contents), and MIDI with a
  `\midi` block ("24 Creating MIDI output"). Input is LilyPond text; Python tools
  that write it include abjad (PyPI 3.31, 2025-10-31) and python-ly (PyPI 0.9.10, 2026-04-04). TuxGuitar exports to
  LilyPond (plugin `TuxGuitar-lilypond`, section below).
- **Plays audio:** MIDI output only. **Edits:** text only.
- **LICENSE FACTS** (read 2026-11-10): https://gitlab.com/lilypond/lilypond/-/raw/master/LICENSE: "GNU LilyPond is
  free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as
  published by the Free Software Foundation, either version 3 of the License, or (at your option) any later
  version." `COPYING` in the same place is the GPL version 3 text. PyPI `lilypond` wheel `license` field
  `GPL-3.0-or-later`.

## TuxGuitar

- **What it is.** "TuxGuitar is an open source multitrack tablature editor and player written in Java." (README of
  https://github.com/helge17/tuxguitar, read through the 2026-11-10 clone; last commit 2026-11-03). Website
  https://www.tuxguitar.app/. "You can find ready to use installation packages for Linux, Windows, macOS, FreeBSD and
  Android" on the GitHub releases page (README). Newest release in `CHANGES`: "TuxGuitar 2.1.1 (2026-10-23)"; the
  previous "TuxGuitar 2.1.0 (2026-06-30)" lists "Security fix for CVE-2026-55543: Prevent embedding or loading
  malicious Java classes in a TG file".
- **Formats** (plugin `.info` files in the repository): `TuxGuitar-gtp` "Guitar Pro 1 to 5 file import/export
  plugin" ("This plugin lets you open and export Guitar Pro version 1 to 5 files (GTP, GP3/GP4/GP5)");
  `TuxGuitar-gpx` "Guitar Pro 6 and 7 file import plugin" ("Plugin to open Guitar Pro 6 (GPX) and 7 (GP) files");
  `TuxGuitar-ascii` "ASCII tab export plugin"; `TuxGuitar-musicxml` "MusicXML file export plugin"; `TuxGuitar-ptb`
  (Power Tab), `TuxGuitar-lilypond`, `TuxGuitar-pdf`, `TuxGuitar-svg`, `TuxGuitar-midi`, `TuxGuitar-tef`;
  `TuxGuitar-converter` "Batch File Converter" ("This plugin converts all tabs in the given input folder from various
  formats into the given output file format"). 2.1.1 CHANGES: "Improve Guitar Pro import", "Export beat text in
  MusicXML".
- **How a program calls it:** a desktop GUI (SWT, JavaFX or Qt toolkits per the module names
  `TuxGuitar-ui-toolkit-swt`, `-jfx`, `-qt`); the batch converter is a plugin of the GUI. A documented headless
  command line was not found in the files read (UNVERIFIED).
- **Sound:** README "Third party products": "Gervill (Java Software Synthesizer)" and "Magic Sound Font v2.0 -
  Contributed by Dennis Deutschmann" (license of that SoundFont not read: UNVERIFIED). Modules
  `TuxGuitar-fluidsynth`, `TuxGuitar-synth-lv2`, `TuxGuitar-alsa`, `TuxGuitar-jack` exist.
- **LICENSE FACTS** (read 2026-11-10): README: "TuxGuitar is released under the GNU Lesser General Public License.
  Copyright (C) 2005-2022 Julián Casadesús 2023-2025 guiv42, helge17". `docs/LICENSE`: "GNU Lesser General Public
  License Version 2.1, February 1999".

## PyGuitarPro

- **What it is.** "PyGuitarPro is a package to read, write and manipulate GP3, GP4 and GP5 files. Initially
  PyGuitarPro is a Python port of AlphaTab which originally was a Haxe port of TuxGuitar." (README.rst of
  https://github.com/Perlence/PyGuitarPro, read through the 2026-11-10 clone; last commit 2026-11-10). PyPI
  `PyGuitarPro` 0.11 uploaded 2026-05-03, requires Python >=3.10, `license_expression` `LGPL-3.0-only`.
  Docs https://pyguitarpro.readthedocs.io/.
- **How a program calls it** (README): `import guitarpro`, `curl = guitarpro.parse('Mastodon - Curl of the
  Burl.gp5')`, `guitarpro.write(curl, 'Mastodon - Curl of the Burl 2.gp5')`. Pure Python, no GPU.
- **Fields** (`src/guitarpro/models.py`, 2026-11-10 clone): `Track.strings` defaults to
  `[(1, 64), (2, 59), (3, 55), (4, 50), (5, 45), (6, 40)]` (string number, MIDI pitch of the open string, so string
  1 is the highest); `Track.offset` (the GP3 reader's docstring: "Height of the capo: :ref:`int`. The number of the
  fret on which a capo is set. If no capo is used, the value is 0." followed by `track.offset = self.readI32()`);
  `Track.fretCount = 24`; `Note.value` (fret), `Note.string`, `Note.velocity`, `Note.effect`, and the property
  `realValue = self.value + ...strings[self.string - 1].value` (MIDI pitch); `Song.tempo = 120` default.
- **Not supported:** .gpx and .gp (GP6-GP8): the README names GP3, GP4 and GP5 only.
- **LICENSE FACTS** (read 2026-11-10): `LICENSE` in the repository begins "GNU LESSER GENERAL PUBLIC LICENSE Version
  3, 29 June 2007". PyPI `license_expression`: `LGPL-3.0-only`.

## music21 (tab-related parts)

- **What it is.** Python toolkit, https://github.com/cuthbertLab/music21 (last commit 2026-11-08). PyPI `music21`
  10.5.2 uploaded 2026-10-28 (requires Python >=3.11, `license_expression` `BSD-3-Clause`); tag `v11.0.0b14`
  (2026-10-30) is a beta.
- **Tab data** (2026-11-10 clone): `music21/tablature.py`: "Music21 representation of FretNote and FretBoard
  objects." `FretNote(string, fret, fingering)`; "A FretBoard represents a displayed fretboard (i.e. used in chord
  symbols)." `articulations.StringIndication` ("StringIndication indicates which string a note is played on.") and
  `articulations.FretIndication` map to MusicXML `<string>` and `<fret>` (`music21/musicxml/xmlObjects.py` lines 68
  and 75). In both `musicxml/m21ToXml.py` (lines 7263-7264) and `musicxml/xmlToM21.py` (lines 6448-6449) the source
  carries the comments `# TODO: staff-tuning` and `# TODO: capo`.
- **How a program calls it:** `from music21 import converter; s = converter.parse('file.musicxml')`,
  `s.write('musicxml', 'out.musicxml')`, `s.write('midi', 'out.mid')` (standard music21 API; the exact doc page was
  not re-read today: UNVERIFIED wording).
- **LICENSE FACTS** (read 2026-11-10): `LICENSE` in the repository: "Copyright (c) 2006-2026 Michael Scott Asato
  Cuthbert Redistribution and use in source and binary forms, with or without modification, are permitted provided
  that the following conditions are met:". PyPI `license_expression` `BSD-3-Clause`.

## ChordPro (format and reference program)

- **What it is.** "ChordPro generates professional-looking sheet music from a text file containing the lyrics of
  one or many songs with chord information." "This program implements ChordPro language version 6." (README of
  https://github.com/ChordPro/chordpro, a Perl program; last commit 2026-04-30; newest tag `R6.101.0`, commit dated
  2026-04-30). Site https://www.chordpro.org. "execute `chordpro --help` for an overview about the available
  options" (README).
- **Tab in the format** (https://www.chordpro.org/chordpro/directives-env_tab/, read 2026-11-10): "Directives:
  start_of_tab Abbreviation: sot . This directive indicates that the lines that follow form a section of guitar TAB
  instructions. The lines will not be folded or changed. Markup is left as is, and directives are considered literal
  text except for {end_of_tab} and {eot} ." i.e. tab inside ChordPro is opaque text (ASCII tab), not parsed notes.
  README: "Prominent features of ChordPro 6 are advanced text markup, annotations, integrated support for ABC".
- **LICENSE FACTS** (read 2026-11-10): `LICENSE` in the repository: "This program is free software; you can
  redistribute it and/or modify it under the terms of the "Artistic License 2.0", included in this document."

## ChordSheetJS

- **What it is.** A JavaScript library by Martijn Versluis that parses and formats chord sheets
  (https://github.com/martijnversluis/ChordSheetJS, last commit 2026-11-10). npm `chordsheetjs` 18.0.0 published
  2026-09-24, `license` `GPL-2.0-only` (https://registry.npmjs.org/chordsheetjs).
- **Input/output** (README, 2026-11-10 clone): parsers `ChordProParser`, `ChordsOverWordsParser`,
  `UltimateGuitarParser`; formatters `TextFormatter`, `HtmlTableFormatter`, `HtmlDivFormatter`,
  `ChordsOverWordsFormatter`. Its directive table marks "start_of_tab (short: sot)" and "end_of_tab (short: eot)" as
  supported (README lines 663-664). No audio. Edits as text.
- **LICENSE FACTS** (read 2026-11-10): `LICENSE` in the repository begins "GNU GENERAL PUBLIC LICENSE Version 2, June
  1991"; npm field `GPL-2.0-only`.

## svguitar

- "JavaScript (TypeScript) library to create beautiful SVG guitar chord charts directly in the browser." (README,
  https://raw.githubusercontent.com/omnibrain/svguitar/master/README.md). Usage `new svguitar.SVGuitarChord('#chart')`.
  npm `svguitar` 2.10.1 published 2026-10-17; last commit 2026-10-17. Chord charts only: no tab staff, no audio.
- **LICENSE FACTS** (read 2026-11-10): https://raw.githubusercontent.com/omnibrain/svguitar/master/LICENSE: "Copyright
  2017 Raphael Voellmy <r.voellmy@gmail.com> Permission is hereby granted, free of charge, to any person obtaining a
  copy of this software". npm field `MIT`.

## Tonal

- Music-theory functions in JavaScript: README examples `Interval.semitones("5P"); // => 7`, `Scale.get("C
  major").notes`, `Chord.get("Cmaj7").name` (README of https://github.com/tonaljs/tonal, last commit 2026-10-14).
  npm `tonal` 6.5.1 published 2026-10-14. No rendering, no audio, no tab.
- **LICENSE FACTS** (read 2026-11-10): README "## License [MIT License](docs/LICENSE)"; npm field `MIT`.
  (`docs/LICENSE` itself not opened.)

## react-guitar (and react-guitar-sound)

- "A beautiful and accessible guitar component for React." (README of https://github.com/4lejandrito/react-guitar,
  last commit 2026-01-06); npm `react-guitar` 1.1.3 published 2026-01-04. Props: `strings` "An array where each
  number represents the fret the string is pressed on (`0` means open string and `-1` muted)"; `onChange` "called
  when a string is press/unpressed. If not present the guitar will be read only." Sound via the `useSound` hook of
  `react-guitar-sound`, whose default instrument is `withSoundFont('acoustic_guitar_nylon')` built on
  `soundfont-player` with `soundfont?: 'FluidR3_GM' | 'MusyngKite'` (`packages/react-guitar-sound/src/`), i.e. the
  MIDI.js sample sets listed under "SoundFonts". A fretboard input and display, not a tab staff.
- **LICENSE FACTS** (read 2026-11-10): `LICENSE`: "MIT License Copyright (c) 2018-present Alejandro Tardín".

## fretboard.js

- `@moonwave99/fretboard.js` 0.2.13 published 2022-11-18, npm `license` field `ISC`; repository
  https://github.com/moonwave99/fretboard.js, last commit 2022-11-17. The repository has no LICENSE file at its root
  (file list of the 2026-11-10 clone); the only license statement found is the npm field. Fretboard diagrams; no tab
  staff, no audio (README not read beyond the file list: UNVERIFIED details).

## chords-db and react-chords

- chords-db: "This is a javascript database of string instruments chords. Open, free to use, easily improved with
  more chords." Entries such as `key: 'D', suffix: 'sus2', positions: [{ frets: '0320xx', ...` (README of
  https://github.com/tombatossals/chords-db, last commit 2025-10-14). npm `@tombatossals/chords-db` 0.5.1 published
  2019-11-02; `@tombatossals/react-chords` 0.2.10 published 2019-10-23.
- **LICENSE FACTS** (read 2026-11-10): chords-db `LICENSE`: "MIT License Copyright (c) 2016 David Rubert". npm fields
  `MIT` for both packages.

## jTab

- npm `jtab` 1.3.2 (2017-10-30) is the telesoho fork ("Guitar Tab Notation for the Web (Javascript/CSS/SVG)";
  "Differences from the original tardate/jtab: ... it was not tested very well", README of
  https://github.com/telesoho/jtab, last commit 2022-02-20). package.json `"license": "MIT"`; no LICENSE file at the
  root of the fork (file list of the clone). The original tardate/jtab repository was not read.

## abc2svg

- npm `abc2svg` 1.22.1 published 2022-09-13 with the npm deprecation message "Package no longer supported. Contact
  Support at https://www.npmjs.com/support for more info."; `license` field `LGPL-3.0`; `repository`
  https://chiselapp.com/user/moinejf/repository/abc2svg (npm registry, read 2026-11-10). The chiselapp project
  pages were not read, so its current version and any tablature support are UNVERIFIED.

## Soundslice (hosted player, editor, embed and data API)

- **What it is.** A web service by Soundslice LLC ("an Illinois Limited Liability Company", Terms of Service,
  https://www.soundslice.com/terms/, read 2026-11-10) for interactive notation and tab synced to audio or video, with
  a "full-featured notation and tab editor" (https://www.soundslice.com/teachers/). Not runnable on this box: it is a
  service and needs an account.
- **Embed** (https://www.soundslice.com/licensing/, read 2026-11-10): "Once you’ve created a lesson (a “slice”), you
  simply copy and paste our embed code into your site. It’s a simple <iframe> , similar to a YouTube video embed."
  "We also have a JavaScript API for advanced integration." "Every Soundslice account gets one free embed."
- **Embed pricing** (same page): "We charge based on how many people use Soundslice on your site in a month. There’s
  a flat fee of $100 for the first 200 unique users. Each unique user after that costs 50 cents." "A “unique user” is
  a single computer that's viewed at least one Soundslice embed on your site in a given calendar month."
- **Plans** (https://www.soundslice.com/plans/, read 2026-11-10): Free "$0"; Plus "$5" per month or "$50" per year;
  Teacher "$20" per month or "$200" per year. Teacher page: "The Teacher plan costs $20/month for up to 100 students.
  Any student beyond that costs 20 cents extra a month."
- **Data API** (https://www.soundslice.com/help/data-api/, read 2026-11-10): "API keys are only available to paying
  Soundslice customers — either in the Teacher or Licensing plans ." "This API is REST-based and works over HTTP. For
  each API call, you’ll need to authenticate with your API key, using HTTP Basic Authentication ." Example `curl -X
  GET -u 'my_app_id:my_password' https://www.soundslice.com/api/v1/slices/abcde/`. Upload notation: "This endpoint
  lets you upload a slice’s notation from one of our supported formats : MusicXML, Guitar Pro, PowerTab or
  TuxGuitar. It does not support our PDF/image scan feature" (multi-step: POST, PUT the file, callback POST). Export:
  `GET /api/v1/slices/SCOREHASH/musicxml/` "Generates MusicXML for the slice"; "this uses our own MusicXML exporting
  algorithm based on the slice’s current notation." Recordings and syncpoints: endpoints "Create recording", "Put
  recording’s audio/video", "Get recording’s syncpoints", "Set recording’s syncpoints", "Syncpoint data format"
  (table of contents of the same page).
- **TERMS FACTS** (read 2026-11-10):
  - Content ownership, Terms 7.5: "You retain any intellectual property rights in the content you upload or post to
    the Service. You hereby grant Soundslice a worldwide, non-exclusive, royalty-free license (with the right to
    sublicense) to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute such
    Content in any and all media or distribution methods (now known or later developed)."
  - Service IP, Terms 7.2: "Provider retains all right, title, and interest in and to the Service, and this Agreement
    does not grant User any intellectual property rights in or to the Service or any of its components."
  - Automated access, Acceptable Use Policy (https://www.soundslice.com/terms/aup/): "Attempt to access or search or
    scrape or download content from Soundslice, or otherwise use Soundslice through any engine, software, tool, agent,
    device or mechanism (including automated scripts, spiders, robots, crawlers, data mining tools or the like) other
    than the software and/or search agents provided by Soundslice or other generally available third party Web
    browsers;" (listed among things not to do).
  - Commercial use, AUP: "Use Soundslice for any commercial purpose or the benefit of any third party, except as
    otherwise explicitly permitted for you by Soundslice or in any manner not permitted by the Terms;" (same list).
    AUP purpose line: "It's primarily for educational use".
  - Changes, Terms 5: "Provider reserves the right to modify, suspend or discontinue, at any time and from time to
    time, the Services or any part thereof, or User’s access to the Services."
  - Governing law, Terms 10.6: Illinois.

## Flat.io (embed, REST API)

- **What it is.** A web notation and tab editor by Tutteo Limited ("The Service is provided by Tutteo Limited
  ("Flat"), a company incorporated and registered in England and Wales", Embed Terms,
  https://help.flat.io/en/policies/terms-of-service-embed/, "Last updated February 24, 2026", read 2026-11-10). Not
  runnable on this box: a service; needs an account and an app ID.
- **Products** (https://flat.io/developers, read 2026-11-10): "Embed and OMR are usage-based; the REST and Import
  APIs are free." "Free 14-day trial. The REST and Import APIs are free; no plan needed." Embed: "Viewer or editor
  mode", "JavaScript/TypeScript SDK". OMR: "PDFs and photos in", "MusicXML or MIDI out". REST API: "Scores,
  collections and comments", "Personal tokens or OAuth2". Example on that page: `<script
  src="https://prod.flat-cdn.com/embed-js/v2.12.1/embed.min.js"></script>`, `new Flat.Embed('embed', { ...
  embedParams: { appId: 'YOUR_APP_ID', mode: 'edit' } })`, `embed.play()`.
- **Embed docs** (https://flat.io/developers/docs/embed/, read 2026-11-10): "You can easily create and edit music
  notation and TABs with our web editor Flat and display them in no time on any web page." "You can also embed our
  editor directly in your site , and let your users or visitors create and edit MusicXML files." "You can try the
  embed for free with a personal Flat account ... (no customization or API available)." "If you want to customize it
  (e.g. removing Flat Branding, changing the controls displayed, the colors and theme) or use our embed commercially,
  subscribe to one our embed plan ."
- **REST API docs** (https://flat.io/developers/docs/api/, read 2026-11-10): "Creating and importing new music scores
  using MusicXML or MIDI files." "Browsing, updating, copying, exporting the user's scores (for example in MP3, WAV or
  MIDI)." "By using this API, and especially on the behalf of a user account, you must accept, respect and enforce our
  Terms of Service and Privacy Policy ." The page has a "Rate Limits" section (values not recorded here).
- **Embed pricing** (https://flat.io/embed, read 2026-11-10): "Flat Embed’s billing is based on the total number of
  unique users each month." "Beyond 200 users, each additional user results in a -- charge." The dollar figures on
  that page are filled in by JavaScript; the static HTML read here shows "--" in their place (UNVERIFIED amounts;
  open the page in a browser to read them). "A unique user is tracked by user IDs that your development team places
  directly in the embed code! If you are looking for a development-free option, we can instead track unique IPs that
  access the embedded music or activities monthly." Listed features include "Commercial use", "Personalized
  branding", "MIDI output".
- **Clients:** npm `flat-embed` 2.12.1 (2026-04-02) and `flat-api` 1.0.1 (2026-09-17), both `Apache-2.0`
  (npm fields; repositories https://github.com/FlatIO/embed-client last commit 2026-10-20 and
  https://github.com/FlatIO/api-client-js last commit 2026-09-17).
- **TERMS FACTS**, Embed Terms (https://help.flat.io/en/policies/terms-of-service-embed/, read 2026-11-10):
  - Fees, 2.3: ""Fees" means the monthly licence fee payable for the Service ("License Fee") plus the extra fee per
    view or active user ("Consumption Fees"), as shown on our site https://flat.io/embed following the offer you
    select;"
  - User content, 8.2: "We do not claim ownership in your User Content. Instead, you grant us a worldwide,
    non-exclusive, royalty-free and perpetual licence to use, copy, reproduce, distribute, adapt, re-format, modify,
    publish, translate, licence, sub-licence, and exploit the User Content anywhere and in any form for the purpose of
    providing our Service" (sentence continues on the page).
  - Service IP, 7.1: "Flat is the owner of the licensee of all intellectual property rights in the Service."
  - Price changes, 11.6: "Flat may increase the Fees upon giving you 30 days' notice in writing."
  - Termination, 13.2: "Flat may terminate these Terms of Service and your access to the Service with 30 days' notice
    in writing."
  - The individual-account terms (https://help.flat.io/en/policies/terms-of-service-individual/) were not read
    (UNVERIFIED).

## Guitar Pro formats (.gp3, .gp4, .gp5, .gpx, .gp)

- **Owner and specification.** Guitar Pro is a product of Arobas Music. No public specification of these formats was
  found among the pages read on 2026-11-10. alphaTab's docs state: "GP4 has an official partial spec from Arobas;
  the rest was reverse-engineered from test files." The same page describes GP6 `.gpx` as "the first XML-based
  generation, wrapped in a custom container that behaves like a compressed filesystem" holding `score.gpif`, and GP7/8
  `.gp` as "a standard ZIP archive holding `Content/score.gpif`" ("GP8 uses the same envelope as GP7 with additional
  payloads (embedded audio)") (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/website/docs/features/import-load/guitar-pro.mdx).
  The Rust `guitarpro` README calls the GPX container "BCFZ/BCFS container" and `.gp` a "ZIP container with GPIF XML"
  (https://github.com/slundi/guitarpro README, read through the 2026-11-10 clone).
- **Which open-source libraries read and write which versions** (each cell from the source named; read 2026-11-10):

| Library (license) | GP3-GP5 | GPX (GP6) | GP (GP7/GP8) | Source of the claim |
|---|---|---|---|---|
| alphaTab (MPL-2.0) | read | read | read; write (GP7 container) | README "Reads"/"Writes" table |
| PyGuitarPro (LGPL-3.0-only) | read, write | no | no | README "read, write and manipulate GP3, GP4 and GP5 files" |
| TuxGuitar (LGPL-2.1) | import, export (GP1-GP5) | import | import (GP7) | plugin `.info` files `TuxGuitar-gtp`, `TuxGuitar-gpx` |
| MuseScore Studio (GPL-3.0) | import | import | import | `guitarpromodule.cpp` reader registration (`gtp gp3 gp4 gp5 gpx gp ptb`) |
| webmscore (GPL-3.0) | import | import | import | `web-public/schemas.ts` `InputFileFormat` |
| Power Tab Editor 2.0 (GPL-3.0) | open | open | open | README "Supported File Types" (.pt2, .ptb, .gp3, .gp4, .gp5, .gpx, .gp) |
| guitarpro-parser, npm (Apache-2.0) | read | read | read (GP7 and GP8) | README "Reads `.gp` (Guitar Pro 7 and 8), `.gpx` (Guitar Pro 6), `.gp5`, `.gp4` and `.gp3`" |
| ApolloTab, PyPI (LGPL-2.1) | read | read | read | README "Full support for GP3/GP4/GP5/GPX/GP(GP7/GP8) formats" |
| guitarpro (Rust crate, MIT) | read, write | read, write | read, write | README "Supported formats" table |
| Soundslice data API (service) | upload | upload | upload | API docs "MusicXML, Guitar Pro, PowerTab or TuxGuitar" (versions not listed) |

- No byte-level validation of these claims was done in this docs lane (the try lane runs files through some of them).

## alphaTex (format)

- alphaTab's own plain-text format: "alphaTex is a plain-text notation format for alphaTab. You write a score as
  source code and alphaTab parses it into the same data model any other format produces."
  (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/website/docs/alphatex/introduction.mdx). Note syntax
  `fret.string` with string 1 the highest (quoted in the alphaTab section); metadata `\title`, `\tempo`, `\tuning`,
  `\capo`, `\ts`, `\track`, `\staff {tabs}`; beat durations as `:4`, `:8`, `:16`; note properties in braces, e.g.
  `11.1{b (0 2)}` (bend), `{h}`, `{v}` (introduction showcase). Written by `AlphaTexExporter` (since 1.7), read by
  alphaTab's importer, edited with `@coderline/alphatab-monaco` and `@coderline/alphatab-language-server`. Also the
  file format of the Obsidian plugin Tab Flow ("Write scores in alphaTex (.atex files, or alphatex code blocks in
  notes)", https://community.obsidian.md/plugins/tab-flow, read 2026-11-10). No separate license for the format was
  found; the documentation sits in the MPL-2.0 repository.

## ABC (format)

- "This is the home page for the abc standard, the (semi-formal) description of the rules of abc." "The current
  version of the standard is at: abcnotation.com/wiki/abc:standard:v2.1 - abc standard 2.1 (Dec 2011)"; draft
  "abcnotation.com/wiki/abc:standard:v2.2" (https://abcnotation.com/wiki/abc:standard, read 2026-11-10). ABC carries
  pitches and durations, not strings or frets; abcjs derives a tab line from the pitches with its `tablature` option
  (abcjs section). Verovio reads ABC (README).

## ASCII tab (informal convention)

- "ASCII tab is intended to be a human-readable format rather than machine-readable, and hence is not strictly
  defined. Though some standards are used by all ASCII tab files, such as hyphens to represent string lines and
  digits to represent frets, other things such as barlines, rhythms, bends, chord symbols etc. may be present, absent
  or represented in a variety of way[s]" (Wikipedia "ASCII tab", wikitext read 2026-11-10 through
  https://en.wikipedia.org/w/index.php?title=ASCII_tab&action=raw; secondary source).
- A 1990s guide exists: the "Tablature FAQ" by Howard Wright, "Copyright Howard Wright and the olga-grunts", with the
  notice "This document may be distributed freely as long as NO CHARGE is made and my name and email address are not
  removed." (https://guitartabs.cc/tabfaq.php, read 2026-11-10). It is a reading and writing guide, not a grammar.
- Tools that write ASCII tab: TuxGuitar (`TuxGuitar-ascii` "ASCII tab export plugin"), the Rust `guitarpro` CLI
  `score_tool` ("generate ASCII tablatures", README). ChordPro carries ASCII tab verbatim inside `{start_of_tab}`
  blocks. Readers: ChordSheetJS `UltimateGuitarParser` reads Ultimate Guitar chord sheets (README); 1j01/guitar "You
  can copy and paste entire webpages containing guitar tabs and it'll try to load all it can." (README). No parser
  library for ASCII tab note content with a stated grammar was found among the pages read.

## Added after the first pass: more parsers and converters

- **guitarpro-parser** (npm, TypeScript). "TypeScript parser for Guitar Pro files. Returns a typed model of the score
  and computes playback order and timing." "Reads `.gp` (Guitar Pro 7 and 8), `.gpx` (Guitar Pro 6), `.gp5`, `.gp4`
  and `.gp3`." "Detects the format from the file's bytes." Usage `import { parseGuitarPro } from
  'guitarpro-parser'`; `parseGuitarPro` "accepts a `Uint8Array`, a Node `Buffer` or an `ArrayBuffer`"; note fields
  include `note.string; // 0-based, 0 is the highest string` (README of https://github.com/emilienbev/guitarpro-parser,
  last commit 2026-11-08). npm 2.0.0 published 2026-11-08 (6 versions, first 2026-02-24). LICENSE: "Apache License
  Version 2.0, January 2004". Read only (no writer named in the README lines read). RUNNABLE.
- **ApolloTab** (PyPI). "`ApolloTab` is a fully-featured Python library for parsing, rendering, and playing Guitar Pro
  (.gp3/.gp4/.gp5/.gpx/.gp) tablature files."; "Tablature Rendering: Render high-quality tablature images (QPixmap)
  using QPainter"; "Audio Playback: Real-time MIDI synthesis engine based on FluidSynth with SoundFont support"
  (README of https://github.com/Zhuwenqian/ApolloTab, last commit 2026-08-28). PyPI 1.6.0 uploaded 2026-08-06,
  `license` field `LGPL-2.1`; repository LICENSE "GNU LESSER GENERAL PUBLIC LICENSE Version 2.1, February 1999".
  `pip install ApolloTab`. RUNNABLE (Qt dependency for rendering; not tried here).
- **score-parser** (npm `@jbfullstack/score-parser`). "Parse MIDI and Guitar Pro files into a clean, format-neutral
  JSON structure."; peer dependencies `@tonejs/midi` and `@coderline/alphatab` (README of
  https://github.com/jbfullstack/score-parser, last commit 2026-03-26). npm 1.0.1 (2026-03-26), `MIT`; LICENCE "MIT
  License Copyright (c) 2026 jbfullstack". RUNNABLE.
- **@musicbird/gpx-parser** (npm). 0.1.3 published 2021-12-10, `license` `AGPL-3.0-or-later`, no repository field
  (npm registry). Not read further.
- **guitarpro (Rust crates, "Guitar Pro Tools")**. "A comprehensive suite of tools for parsing, manipulating, and
  visualizing Guitar Pro files in Rust." Core library reads and writes "GP3, GP4, GP5, GPX, GP7" and "MuseScore files
  (MSCZ)"; also MusicXML read and write per its table; CLI `score_tool` "to inspect files, view metadata, and generate
  ASCII tablatures"; a C ABI `guitarpro-ffi` "so C, C++, Swift, Kotlin or Python `ctypes` can parse and convert
  scores" (README of https://github.com/slundi/guitarpro, last commit 2026-11-03). crates.io `guitarpro` 0.4.5
  (2026-11-03, license `MIT`, repository https://codeberg.org/slundi/scorelib) (https://crates.io/api/v1/crates/guitarpro).
  LICENSE: "The MIT License (MIT)". RUNNABLE (Rust toolchain; not tried here).
- Also named by the web search but not read: `dart_gp_tab_reader` (pub.dev), `parsegp` (Go,
  pkg.go.dev/github.com/knasan/parsegp), `PhilPotter/gp_parser` (C++). UNVERIFIED.

## Added after the first pass: open-source tab editors and players

| Project | What its README says | Last commit | License (file read) | Runs in a browser |
|---|---|---|---|---|
| It's MyTabs (louislam/its-mytabs) | "Open source, web based, self hostable guitar/bass tab viewer and player, similar to Songsterr."; "Supports .gp, .gpx, .gp3, .gp4, .gp5, .musicxml, .capx formats"; "Sync your tabs with audio files (.mp3, .ogg) or Youtube videos"; frontend depends on `@coderline/alphatab` 1.8.4 | 2026-11-06 | MIT ("Copyright (c) 2025 Louis Lam") | yes (viewer and player, no editor in the feature lines read) |
| Tab Flow (LIUBINfighter/Obsidian-Tab-Flow) | Obsidian plugin, "Render, play and write guitar tabs in Obsidian", "Powered by alphaTab"; package.json `@coderline/alphatab` ^1.8.4, version 0.5.7 | 2026-09-23 | MPL-2.0 | inside Obsidian |
| Autostrum (michaelongaro/autostrum) | "an interactive tab player, a fast tab editor, and a collection of practice tools"; "Every tab on Autostrum plays back using sampled acoustic or electric guitar audio" | 2026-11-09 | no LICENSE file at the root and no `license` field in package.json (2026-11-10 clone) | yes (web app) |
| muzart (thegedge/muzart) | "Singe-page guitar tab editor (eventually scores!) built with: React, SVG / Canvas, Web Audio"; "This is just a fun personal project" | 2026-06-18 | MIT ("Copyright (c) 2018 Jason Gedge") | yes |
| Songshed (danjutan/Songshed) | "Songshed is a proof-of-concept for a grid-based guitar tab editor." | 2026-02-16 | no LICENSE file at the root (2026-11-10 clone) | yes (UNVERIFIED stack) |
| tab-editor (calesce/tab-editor) | "Guitar Tab Editor"; "This uses the Web Audio API for playback. Thanks to soundfont-player" | 2017-11-02 | MIT text ("Copyright (c) 2015 Cale Newman") | yes |
| SLiMTAB (tim37021/SLiMTAB) | "SLiMTAB is a brand new guitar tab editor. And it is open source."; "requires Node.js" | 2017-06-17 | CC0 1.0 Universal | UNVERIFIED |
| Guitar (1j01/guitar) | "a virtual guitar record-a-synthesize-amatronic web application" | 2023-05-02 | MIT ("Copyright (c) 2018 Isaiah Odhner") | yes |
| Power Tab Editor 2.0 (powertab/powertabeditor) | "A powerful cross platform guitar tablature viewer and editor"; desktop, "Cross platform - Windows, Mac, & Linux" | 2026-11-01 | GPL-3.0 (COPYING) | no (desktop) |
| tuitar (cod-e-codes/tuitar) | "A terminal-based guitar tablature editor built with Go and Bubble Tea"; "Karplus-Strong string synthesis" | 2025-09-28 | MIT | no (terminal) |

## Handoff facts

Each line: what one side outputs, what the other side accepts, with the source of each half. "(this file, X)" points
to the section above where the quote and URL are; other lanes' files are named by path. All read 2026-11-10.

String and fret numbering (needed by any converter between these formats):

- MusicXML `<string>` "String numbers start with 1 for the highest pitched full-length string" and `<fret>` "Fret
  numbers start with 0 for an open string" (https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/string/,
  .../fret/), while `<staff-tuning line="...">` lines are "numbered from bottom to top" (.../staff-tuning/), i.e. tuning
  line 1 is the lowest string and `<string>1</string>` is the highest.
- alphaTex `fret.string`: "String 1 is the top string when you read tab — the thinnest string on a guitar, sounding
  highest." (this file, alphaTab).
- MEI: `tab.course` with course `n` "counting from the course closest to the player’s feet when the instrument is
  played"; `tab.fret` "0 ... refers to an unstopped, open course" (this file, MEI).
- LilyPond: "By default, string 1 is the highest string" (this file, LilyPond).
- PyGuitarPro: default `Track.strings` `(1, 64) ... (6, 40)`, string 1 = MIDI 64 (this file, PyGuitarPro).
- guitarpro-parser: `note.string; // 0-based, 0 is the highest string` (this file, "more parsers").
- abcjs `tuning` array: "starting from the lowest pitch of the instrument" (this file, abcjs).
- react-guitar `strings` prop: array of frets per string, "`0` means open string and `-1` muted" (this file).

Within this lane:

- alphaTab `Gp7Exporter` outputs a `.gp` ZIP with `Content/score.gpif` (alphaTab docs: "Guitar Pro 7 and Guitar Pro 8
  both open the resulting file"), which guitarpro-parser ("Reads `.gp` (Guitar Pro 7 and 8)"), TuxGuitar ("open ...
  7 (GP) files"), MuseScore (`gp` in its reader list), webmscore (`'gp'`) and Soundslice's upload ("Guitar Pro")
  accept as input (this file, those sections).
- alphaTab `AlphaTexExporter` outputs alphaTex text, which alphaTab's `tex()` / `{ tex: true }` and the Tab Flow
  Obsidian plugin (".atex files") accept (this file, alphaTab, alphaTex).
- PyGuitarPro `guitarpro.write(song, 'x.gp5')` outputs GP5 with per-note `string`/`value` (fret), `Track.offset`
  (capo) and `Track.strings` (tuning), which alphaTab, TuxGuitar, MuseScore, webmscore, Power Tab Editor,
  guitarpro-parser, ApolloTab and the Rust `guitarpro` crate read as `.gp5` (parser table above).
- alphaTab outputs Standard MIDI File 1.0 (`MidiFileGenerator`, "tempo map, time signatures, program changes, note
  on/off with expression and pitch bend"), which webmscore (`'midi'` input), MuseScore ("MIDI (SMF) import") and
  Flat's REST API ("Creating and importing new music scores using MusicXML or MIDI files") accept. alphaTab's own
  "Reads" list has no MIDI entry (README), so MIDI does not go straight into alphaTab.
- MuseScore `mscore -o out.musicxml` / webmscore "Export as MusicXML" output MusicXML, which alphaTab reads ("string
  and fret from `technical`"), OSMD renders as tab ("Can display tablature (guitar tabs) from MusicXML"), and Verovio
  imports ("Preliminary support for tablature MusicXML import").
- music21 writes `<technical><string>/<fret>` from `articulations.StringIndication` / `FretIndication`
  (`musicxml/xmlObjects.py`), and its MusicXML writer has `# TODO: staff-tuning` and `# TODO: capo` (`m21ToXml.py`
  lines 7263-7264), so a capo or non-standard tuning set in music21 is not written as `<capo>` / `<staff-tuning>` by
  that code path (source read; behaviour not run here).
- Soundslice API `GET /api/v1/slices/SCOREHASH/musicxml/` outputs MusicXML ("our own MusicXML exporting algorithm"),
  which alphaTab, OSMD, MuseScore, Verovio accept as MusicXML (this file).
- Flat REST API exports "MP3, WAV or MIDI" and its OMR outputs "MusicXML or MIDI" (Flat section), which MuseScore,
  webmscore and alphaTab (MusicXML only) accept.
- chords-db entries give `frets: '0320xx'` per chord position (README), and react-guitar takes `strings` as an
  array of frets per string with `-1` for muted (README); svguitar and vexchords draw chord boxes from their own
  option objects (READMEs). The mapping between the chords-db string order and either renderer's order was not
  checked (UNVERIFIED).
- ChordSheetJS `ChordProParser` parses ChordPro including `{start_of_tab}` blocks, which ChordPro's spec defines as
  "guitar TAB instructions. The lines will not be folded or changed" (this file, ChordPro, ChordSheetJS): ASCII tab
  inside a ChordPro file travels as opaque text.

To and from neighbouring lanes:

- Tab generators in the guitar-tab lane that output `.gp5` (Guitab "solo steel-string fingerstyle audio to .gp5";
  Audio2Tab "Whisper-small fine-tuned to .gp5", per `lanes/guitar-tab/survey.md` lines 27 and 48) produce a file that
  alphaTab, TuxGuitar, MuseScore, webmscore, guitarpro-parser and PyGuitarPro read as GP5 (parser table above).
- A string-and-fret assigner that outputs per-note (string, fret, onset, duration) can be written as alphaTex
  (`fret.string` with `:4`/`:8` durations, `\tuning`, `\capo`) or as MusicXML `<technical><string>/<fret>` with
  `<staff-tuning>` and `<capo>`, both of which alphaTab loads (alphaTex syntax and MusicXML import docs, this file).
- Notes without strings (MIDI pitches from the audio-to-notes lane, e.g. tools that "export them to MIDI", per
  `lanes/audio-to-notes/survey.md` line 554) can be given string and fret by LilyPond's TabStaff ("LilyPond
  automatically calculates the fret for a note based on the string to which the note is assigned"; options
  `stringTunings`, `minimumFret`, `restrainOpenStrings`, string-number indications) or drawn as tab by abcjs from
  ABC pitches (`tablature` with `tuning` and `capo`) (this file, LilyPond, abcjs). Neither documents an optimiser for
  playability beyond those rules (pages read).
- Downbeat times in seconds (All-In-One's JSON "downbeats" (seconds), `lanes/chords-beats-key/survey.md` line 222)
  map onto alphaTab's `FlatSyncPoint { barIndex, barPosition, barOccurence, millisecondOffset }`, where
  `millisecondOffset` is "the audio timestamp in milliseconds this point maps to" and `barPosition` "a `0..1` ratio
  inside the bar", applied with `score.applyFlatSyncPoints(list)` and `api.updateSyncPoints()`
  (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/website/docs/features/play-sync/sync-points-at-runtime.mdx),
  with the player in `PlayerMode.EnabledBackingTrack` for an audio file or an `IExternalMediaHandler` for a video
  (".../play-sync/video-sync.mdx": it "exposes `backingTrackDuration`, `playbackRate`, `masterVolume`, `seekTo`,
  `play`, and `pause`"). Soundslice's API has the equivalent "Set recording’s syncpoints" endpoint (Soundslice section).
- Tempo (BPM) from the chords-beats-key lane maps to alphaTex `\tempo` (example `\tempo 196`, alphaTex introduction)
  and MusicXML `sound`/`metronome` markers ("Tempo and tempo changes — read from `sound` and `metronome` markers",
  alphaTab MusicXML import doc).
- User constraints from the UI (capo fret, tuning) have a field in each format: MusicXML `<capo>` and
  `<staff-tuning>`; alphaTex `\capo` and `\tuning`; MEI `<tuning>`/`<course>` (no capo element in the v5 tablature
  chapter); PyGuitarPro `Track.offset` and `Track.strings`; abcjs `capo` and `tuning` options; LilyPond
  `stringTunings` (capo only in fret diagrams). Sources in the sections above.
- Count-in and metronome for practice playback: alphaTab "Before the song starts, the count-in taps out one bar ...
  during playback, the metronome keeps clicking on every beat"
  (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/website/docs/features/play-sync/count-in-and-metronome.mdx);
  the browser-audio-sync lane covers the clock side.
- Rendering positions for cursor sync: MuseScore CLI outputs `mpos` "measure positions (XML)" and `spos` (handbook
  extension list); webmscore can "Generate position information of measures or segments on the generated sheets";
  Verovio has `RenderToTimemap` (Verovio section).

## Where the raw sources are

- Registry summaries made by `scripts/npm_summary.py` from https://registry.npmjs.org on 2026-11-10:
  `samples/docs-registry/npm_summary.tsv`. Newest-commit date and hash of every repository cloned for this survey
  (`git clone --depth 1 --filter=blob:none`): `samples/docs-registry/last_commits.tsv`.
- Saved copies of the pages and files quoted above (untrusted downloads, kept out of git):
  `/home/user/gtr/lanes/web-tab-render/fetched/` (npm and PyPI JSON, READMEs, LICENSE files, docs pages, terms
  pages) and the blobless clones in `/home/user/gtr/lanes/web-tab-render/repos/`. `scripts/html2text.py` turns a
  saved page into the text that was searched.
