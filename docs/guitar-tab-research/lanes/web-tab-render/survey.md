# web-tab-render: survey (docs lane)

Lane: tab rendering, editing and playback on the web, and the tab file formats.
Written by the `docs-web-tab-render` agent on 2026-11-10 (UTC date from `date -u +%F`). Facts read from primary
sources on that date: the npm registry (`https://registry.npmjs.org/<package>`), the PyPI JSON API
(`https://pypi.org/pypi/<package>/json`), files of each repository read through `raw.githubusercontent.com` or a
`git clone --depth 1` of the public repository, and the projects' own documentation and terms pages. Each section
names the URLs it was read from. "Last commit" is the committer date of the newest commit on the default branch
of a `git clone --depth 1` made on 2026-11-10. This file judges nothing; it records what the sources say.

Checked and corrected in place by `verify-docs-web-tab-render` on 2026-11-10: every quoted clause was re-fetched from
its URL and compared, corrections are marked "(verifier, 2026-11-10)", and the tally is in "Verification log" at the
end. Sources the verifier fetched are saved in `/home/user/gtr/lanes/web-tab-render/verify/fetched/` (kept out of git);
the scripts are in `scripts/verify/`.

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
| Verovio (`verovio` npm, PyPI, C++ CLI) | engraving library (C++, WASM, Python) | 6.4.1 (2026-11-03) | 2026-11-10 | LGPL-3.0-only | yes (MEI tablature) | MIDI out only | no (corrected in gap round 2: no editing interface, but a toolkit `edit()` call; section, r0626) | RUNNABLE |
| MuseScore Studio (`mscore` CLI) | desktop notation editor with CLI conversion | v4.7.6 tag (commit 2026-10-22) | 2026-11-10 | GPL-3.0 (LICENSE.txt) | yes | yes (desktop) | yes (desktop) | RUNNABLE (Linux AppImage; 4.x not run here; the try lane ran the Ubuntu package 3.2.3 headless, trials.md) |
| webmscore | MuseScore 3 engine compiled to WASM | 1.2.1 (2023-01-24) | 2023-01-23 | npm field `GPL`; LICENSE.GPL is GPL v3 | yes | yes (with a SoundFont) | no | RUNNABLE (under Node 22.23.4 only with two workarounds, trials.md) |
| LilyPond (TabStaff) | text-to-engraving compiler | 2.26.0 stable (2026-04-21); 2.27.4 unstable (2026-10-20) | not read (GitLab) | GPL-3.0-or-later (LICENSE) | yes | MIDI out only | text only | RUNNABLE |
| TuxGuitar (helge17 fork) | desktop tab editor (Java) | 2.1.1 (CHANGES: 2026-10-23; tag commit 2026-10-21) | 2026-11-03 | LGPL-2.1 (docs/LICENSE); PDF export depends on iText 5.5.13.3 (AGPL v3 per its Maven pom) | yes | yes | yes | RUNNABLE (desktop app; its command line takes a file to open and `-h`, `-v`, `-i`, `-D`, no export option: section) |
| PyGuitarPro | Python reader/writer for GP3-GP5 | 0.11 (PyPI 2026-05-03) | 2026-11-10 | LGPL-3.0-only (PyPI) | no | no | data model | RUNNABLE (run in trials.md; its GP3/GP4 output kept one of two voices) |
| music21 | Python music toolkit (MusicXML in/out) | 10.5.2 (PyPI 2026-10-28); v11.0.0b14 tag 2026-10-30 | 2026-11-08 | BSD-3-Clause (PyPI) | via MusicXML export | MIDI out | data model | RUNNABLE |
| ChordSheetJS (`chordsheetjs`) | JS ChordPro / chord-sheet parser and formatter | 18.0.0 (2026-09-24) | 2026-11-10 | GPL-2.0-only | chord sheets, not tab | no | text | RUNNABLE |
| ChordPro (reference program, Perl) | chord-sheet formatter (PDF etc.) | R6.101.0 tag (2026-04-30) | 2026-04-30 | Artistic License 2.0 (LICENSE) | no (chords and lyrics; tab blocks as text) | no | text | RUNNABLE |
| svguitar | JS chord-diagram renderer | 2.10.1 (2026-10-17) | 2026-10-17 | MIT | chord boxes | no | no | RUNNABLE |
| vexchords | JS chord-diagram renderer | 1.2.0 (2019-03-31) | 2024-12-31 | MIT | chord boxes | no | no | RUNNABLE (the npm `dist` build threw a TypeError in Chromium; an esbuild bundle of its source drew, trials.md) |
| Tonal (`tonal`) | JS music-theory functions | 6.5.1 (2026-10-14) | 2026-10-14 | MIT | no | no | n/a | RUNNABLE |
| react-guitar | React fretboard component | 1.1.3 (2026-01-04) | 2026-01-06 | MIT | fretboard view | yes (see section) | fretboard input | RUNNABLE |
| fretboard.js (`@moonwave99/fretboard.js`) | JS fretboard diagrams | 0.2.13 (2022-11-18) | 2022-11-17 | ISC (npm field; ISC text in the README) | fretboard view | no | no | RUNNABLE |
| chords-db / react-chords (`@tombatossals/*`) | chord-shape database and React chord diagrams | 0.5.1 (2019-11-02) / 0.2.10 (2019-10-23) | 2025-10-14 (chords-db) | MIT | chord boxes | no | no | RUNNABLE |
| jTab (`jtab`, telesoho fork) | JS chord and tab drawing from text | 1.3.2 (2017-10-30) | 2022-02-20 | MIT (npm field of the fork); the upstream tardate/jtab LICENSE is LGPL-2.1-or-later (section) | yes | no | no | RUNNABLE |
| abc2svg | JS ABC renderer, player and editor page | v1.23.7 tag on chiselapp (2026-11-08); npm 1.22.1 (2022-09-13, marked deprecated on npm) | not read (Fossil; newest tag 2026-11-08) | LGPL-3.0-or-later (file headers); npm field `LGPL-3.0` | yes (`strtab.js`, `tblt.js` modules) | yes (README: "playing") | text (ABC) | RUNNABLE (scripts; npm package deprecated) |
| Flat.io embed and API (`flat-embed`, `flat-api`) | hosted notation editor; JS embed client; REST API | flat-embed 2.12.1 (2026-04-02); flat-api 1.0.1 (2026-09-17) | 2026-10-20 / 2026-09-17 | clients Apache-2.0; service under Flat's terms | yes (service) | yes (service) | yes (service) | service; account needed |
| Soundslice | hosted tab/notation player and editor | n/a | n/a | service terms | yes (service) | yes (service) | yes (service) | service; account needed |
| MusicXML 4.0 (format) | W3C Community Group format | v4.0 tag (2021-06-03); 4.1 draft | 2026-11-10 (w3c/musicxml) | W3C Community Final Specification Agreement (spec page) | tab elements | n/a | n/a | n/a |
| MEI (format) | Music Encoding Initiative schema | v5.1 tag (2025-01-22); in-progress tags `v6.0-0+featureFreeze` (2026-08-04) and `v6.0-1+meiODDs` (2026-11-02) | 2026-11-10 | ECL-2.0 (repository LICENSE) | tablature module | n/a | n/a | n/a |
| Guitar Pro formats (.gp3/.gp4/.gp5, .gpx, .gp) | proprietary formats of Arobas Music | n/a | n/a | see section | n/a | n/a | n/a | n/a |
| alphaTex (format) | alphaTab's text format | n/a | n/a | see section | n/a | n/a | n/a | n/a |
| ABC (format) | text notation standard | see section | n/a | n/a | n/a | n/a | n/a | n/a |
| ChordPro (format) | chord-sheet text format | see section | n/a | n/a | n/a | n/a | n/a | n/a |
| ASCII tab (format) | informal plain-text convention | n/a | n/a | n/a | n/a | n/a | n/a | n/a |

Added after the first pass (sections "Added after the first pass" below):

| Tool | Kind | Latest version (date) | Last commit | License (as declared) | Renders tab | Plays audio | Edits | RUNNABLE |
|---|---|---|---|---|---|---|---|---|
| `@coderline/alphatab-monaco` and `@coderline/alphatab-language-server` | alphaTex editor integration and LSP | 1.9.0 (2026-10-31) | 2026-11-08 (alphaTab repo) | MPL-2.0 | via alphaTab | no | text (alphaTex) | RUNNABLE (run in trials.md, gap round 2: r0614) |
| guitarpro-parser (npm) | TS parser for GP3-GP8 | 2.0.0 (2026-11-08) | 2026-11-08 | Apache-2.0 | no | no (computes timing) | no | RUNNABLE (run in trials.md; refused alphaTab's `.gp` export) |
| ApolloTab (PyPI) | Python GP3-GP8 parser, Qt renderer, FluidSynth player | 1.6.0 (2026-08-06) | 2026-08-28 | LGPL-2.1 | yes (QPixmap images) | yes (FluidSynth) | UNVERIFIED | RUNNABLE |
| score-parser (`@jbfullstack/score-parser`) | MIDI and GP to JSON, uses alphaTab | 1.0.1 (2026-03-26) | 2026-03-26 | MIT | no | no | no | RUNNABLE |
| guitarpro (Rust crates, slundi) | GP3-GP7, MSCZ, MusicXML read/write; ASCII tab CLI; C FFI | 0.4.5 crates.io (2026-11-03) | 2026-11-03 | MIT | ASCII tab | no | data model | RUNNABLE |
| @musicbird/gpx-parser (npm) | GPX parser | 0.1.3 (2021-12-10) | not read | AGPL-3.0-or-later (npm field) | no | no | no | RUNNABLE |
| It's MyTabs (louislam/its-mytabs) | self-hosted web tab viewer/player on alphaTab | 1.7.0 (`deno.jsonc` version; tag commit 2026-08-14) | 2026-11-06 | MIT | yes | yes | no (feature list read) | RUNNABLE (Deno or Docker) |
| Tab Flow (Obsidian plugin) | alphaTab inside Obsidian | 0.5.7 | 2026-09-23 | MPL-2.0 | yes | yes | alphaTex text | Obsidian desktop |
| Autostrum (michaelongaro/autostrum) | web tab player and editor | n/a | 2026-11-09 | no license file found | yes | yes (samples) | yes | UNVERIFIED |
| muzart (thegedge/muzart) | browser tab editor (personal project) | n/a | 2026-06-18 | MIT | yes | yes (Web Audio) | yes | RUNNABLE |
| Songshed (danjutan/Songshed) | grid-based tab editor, proof of concept (Nuxt 4 / Vue 3 app per package.json) | n/a | 2026-02-16 | no license file and no `license` field found | yes | UNVERIFIED | yes | UNVERIFIED |
| tab-editor (calesce/tab-editor) | browser tab editor | n/a | 2017-11-02 | MIT | yes | yes (soundfont-player) | yes | RUNNABLE |
| SLiMTAB (tim37021/SLiMTAB) | tab editor (Electron app: package.json `"start": "electron ."`, `electron ~1.6.2`) | n/a | 2017-06-17 | CC0-1.0 | yes | UNVERIFIED | yes | UNVERIFIED |
| Guitar (1j01/guitar) | web virtual guitar, pasted-tab player | n/a | 2023-05-02 | MIT | ASCII tab input | yes | records notes | RUNNABLE |
| Power Tab Editor 2.0 | desktop tab editor (C++/Qt) | 2.0.22 tag (2025-06-29) | 2026-11-01 | GPL-3.0 | yes | yes (mixer per README) | yes | desktop |
| tuitar | terminal tab editor (Go) | n/a | 2025-09-28 | MIT | ASCII in terminal | yes (Karplus-Strong) | yes | RUNNABLE |

Added in gap round 2 (2026-11-11; section "HAYA-TAB" below):

| Tool | Kind | Latest version (date) | Last commit | License (as declared) | Renders tab | Plays audio | Edits | RUNNABLE |
|---|---|---|---|---|---|---|---|---|
| HAYA-TAB (HAYASAKA7/HAYA-TAB) | desktop tab library with PDF and alphaTab viewers (Go, Wails v3, Vue 3) | tag v3.1.8 (2026-07-31) | 2026-07-31 | Apache-2.0 (LICENSE, NOTICE); bundles alphaTab 1.8.1 (MPL-2.0) | yes (alphaTab) | yes (alphaTab) | library metadata and PDF annotations; no tab-content editing found in the source | desktop app (Windows, macOS, Linux per README); not run here |

Notes on the list, read 2026-11-10:

- alphaTab 1.9 draws a "♪ alphaTab.net" mark in rendered scores of more than 10 bars (or more than 2 shown tracks),
  and its maintainer announces a planned license change from MPL-2.0 to CPAL-1.0 "or similar". Quotes in the
  alphaTab section. A trial that renders more than 10 bars will show the mark (verifier, 2026-11-10: trials.md Run 3
  reports a small "alphaTab.net" text in every render of the 13-bar test pieces, r0059 to r0070).
- VexTab's LICENSE file restricts the free grant to non-commercial use (quote in the VexTab section).
- `abc2svg` on npm is marked deprecated by npm; its project lives on chiselapp.com (section below).
- (verifier, 2026-11-10) The npm `jtab` fork declares `"license": "MIT"`; the upstream repository it says it differs
  from (tardate/jtab) has a LICENSE granting LGPL 2.1 or later (quotes in the jTab section).
- (verifier, 2026-11-10) TuxGuitar's desktop build pins `com.itextpdf:itextpdf` 5.5.13.3 for PDF export; that
  artifact's Maven pom names the "GNU Affero General Public License v3" (TuxGuitar section).
- (verifier, 2026-11-10) The try lane's results (`trials.md`) differ from what the documentation leads one to expect
  in places: MuseScore 3.2.3 and guitarpro-parser 2.0.0 refused alphaTab's `.gp` export (r0178, r0298); MuseScore
  3.2.3 and webmscore wrote MusicXML without string or fret for a `.gp5` (e0141, e0990); PyGuitarPro's GP3/GP4 output
  kept one of two voices (e0578, e0581); abcjs's guitar tablature expects ABC one octave above sounding pitch (r0239,
  r0241); alphaTab read music21's TAB MusicXML (no `<staff-tuning>`) without string or fret (e0908). Details in the
  sections and in "Handoff facts".

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
  samples)". Exporters per the docs: `Gp7Exporter` (front matter `since: "1.2"`, returns a `Uint8Array`; "Guitar Pro 7 and Guitar
  Pro 8 both open the resulting file"), MIDI via `MidiFileGenerator` ("Standard MIDI File 1.0 output ... tempo map,
  time signatures, program changes, note on/off with expression and pitch bend"; `since: "1.3"`), `AlphaTexExporter`
  (`since: "1.7"`, `export()` returns UTF-8 bytes, `exportToString()` returns a string)
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
  (verifier, 2026-11-10) What the try lane saw (trials.md "Format matrix"): MusicXML with a TAB staff and six
  `<staff-tuning>` (written for the trial) was read with 90/90 on the truth's string and fret, tuning and capo (e0843,
  e0847, e0852); music21's TAB-clef MusicXML without `<staff-tuning>` was read as one staff with `showTablature` false
  and no string or fret (r0278, e0908); TuxGuitar 1.5.6's MusicXML was read with a tuning one octave high (e0860).
- **How a program calls it.** Browser: the README quick start has `new
  alphaTab.AlphaTabApi(document.getElementById('alphaTab'), { tex: true })` for alphaTex written inside the element;
  the export docs pages load a file with `new alphaTab.AlphaTabApi(container, { core: { file: '/scores/song.gp' } })`
  (e.g. export-to-guitar-pro-7.mdx) (corrected by the verifier, 2026-11-10: the `core.file` form is not in the README).
  Node.js without a DOM: "you skip `AlphaTabApi` (which
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
- **The Monaco package and the language server** (added in gap round 2, read 2026-11-11 from the installed npm
  packages and from https://raw.githubusercontent.com/CoderLine/alphaTab/develop/packages/monaco/README.md, which is
  byte-identical to the package's README). `@coderline/alphatab-monaco` README: "This is a Monaco Editor integration
  for writing alphaTex, providing coding assistance to code editors." (link markup dropped), features "Setup Monaco
  for the use with TextMate Grammars", "Setup Monaco with the basic alphaTex language (grammar and language
  configuration)." and "Setup Monaco to integrate with a alphaTab Language server running in a web worker.", and
  "This package is still in a very experimental stage." `@coderline/alphatab-language-server` README: "This is a
  Language Server (LSP) for writing alphaTex, providing coding assistance to code editors." Both at 1.9.0 on npm.
  The Monaco package's 1.9.0 dependencies (registry): `monaco-editor` ^0.57.0, `vscode-textmate` ^9.3.2,
  `vscode-oniguruma` ^2.0.1, `@coderline/alphatab` ^1.9.0, `@coderline/alphatab-language-server` ^1.9.0 and four
  `vscode-languageserver*` packages; unpacked size 256,593 bytes, while `monaco-editor` 0.57.0 (license `MIT`) is
  101,674,083 bytes unpacked (registry `dist.unpackedSize`). What it exports: `addTextMateGrammarSupport`,
  `registerAlphaTexGrammar`, `registerGrammar`, `basicEditorLspIntegration` (diagnostics, completion, hover and
  signature help for one editor model, per its doc comment in the 1.9.0 package's `dist/lsp.d.ts`) and a worker entry; it does
  not draw a score or call alphaTab's renderer: the alphatab.net playground does that in its own code
  (`packages/ui/src/editor/use-score-document.ts`, `TEX_RENDER_DELAY_MS = 250`, commit ec751a23). LICENSE FACTS: the
  Monaco package's `LICENSE` (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/packages/monaco/LICENSE,
  byte-identical to the package's) begins "alphaTab Monaco is licensed under MPL-2.0." followed by the MPL 2.0 text;
  the language server's `LICENSE` begins "alphaTab Language Server is licensed under MPL-2.0."; npm `license` field
  `MPL-2.0` for both. What the try lane saw (trials.md, "Gap round 2"): installed and bundled with esbuild (r0604), a
  fret, a string and a capo typed in Monaco and redrawn by alphaTab, a string 7 refused with the language server's
  marker AT208 "Note string is out of range. Available range: 1-6" (r0614), the `.gp` export read back with the edits
  (e1780, e1784).
- **Data fields relevant to tab.** Notes carry `fret` (used in the traversal example); the string of each note is
  read from MusicXML `technical` (MusicXML import doc, below) and written as `fret.string` in alphaTex. alphaTex: "On a stringed instrument, a note is written as `fret.string`. The number before the dot is the fret. The
  number after the dot is the string, counted from the highest-pitched string down. String 1 is the top string when
  you read tab — the thinnest string on a guitar, sounding highest."
  (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/website/docs/alphatex/syntax.mdx).
  (verifier, 2026-11-10) The data model counts the other way. `Note.string` in
  https://raw.githubusercontent.com/CoderLine/alphaTab/develop/packages/alphatab/src/model/Note.ts: "Gets or sets the
  string number where the note is placed. 1 is the lowest string on the guitar and the bottom line on the tablature."
  `Staff.stringTuning` in .../src/model/Staff.ts: "Unlike the {@link Note.string} property this array directly
  represents the order of the tracks shown in the tablature. The first item is the most top tablature line." and
  `Staff.capo`: "Gets or sets the fret on which a capo is set." The try lane read the same from the package's
  `dist/alphaTab.d.ts` and converted with `string = number_of_strings - note.string + 1` (trials.md, Run 1, r0020).
- **Constraints a user can set (alphaTex staff metadata)**, from the tag definitions in
  `packages/alphatex/src/metadata/staff/` of the repository: `\capo` "Defines the fret on which a capo should be
  placed." (example `\capo 5`); `\tuning` "Defines the number of strings and their tuning for stringed (and fretted)
  instruments." (example `\tuning (A1 D2 A2 D3 G3 B3 E4)`). Also `\tempo`, `\ts` (time signature), `\track`
  (alphaTex introduction example) and `\staff {tabs}` (example in
  https://raw.githubusercontent.com/CoderLine/alphaTab/develop/website/docs/alphatex/document-structure.mdx; the
  introduction example has no `\staff` tag: source corrected by the verifier, 2026-11-10). Playback settings in the docs: count-in and metronome, playback
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
    (verifier, 2026-11-10) The same page, for use without rendering: "I only use alphaTab for playback or file import"
    / "Then no score is rendered and the built-in mark does not appear, but the license still applies." and "Under the
    planned license, alphaTab's attribution in your user interface becomes a license condition as well, also when you
    do not render scores." (link markup dropped). On payment: "There is no setting to turn it off and no paid option
    to remove it." The page also has a section headed "For AI agents", addressed to coding agents, and
    `LICENSE.header` has a line addressed to them; that text is not reproduced here.
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
  (verifier, 2026-11-10) The same file treats string 1 as the top line of the TAB staff: `const isTopBound = string ===
  1;` and `const isBottomBound = string === totalLines;`
  (https://raw.githubusercontent.com/vexflow/vexflow/main/src/tabnote.ts).
- **Plays audio:** no player in the package (none in the README or source list). **Edits:** no editor; rendering
  only.
- **LICENSE FACTS** (read 2026-11-10): a. SPDX `MIT` (npm field). https://raw.githubusercontent.com/vexflow/vexflow/main/LICENSE:
  "The MIT License ... Copyright (c) 2023-2026 VexFlow contributors (see AUTHORS.md) Copyright (c) 2010-2022 Mohit
  Muthanna Cheppudira ... Permission is hereby granted, free of charge, to any person obtaining a copy of this
  software and associated documentation files (the "Software"), to deal in the Software without restriction".
  (verifier, 2026-11-10) The LICENSE inside the published npm 5.0.0 package begins differently: "VexFlow - A
  JavaScript library for rendering music notation. Copyright (c) 2023-present VexFlow contributors (see AUTHORS.md).
  Copyright (c) 2010-2022 Mohit Muthanna Cheppudira" (https://unpkg.com/vexflow@5.0.0/LICENSE; the same opening is
  quoted in trials.md), followed by the MIT permission text.
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
- **Constraints** (verifier, 2026-11-10): `tabstave` takes `tuning=`, with the values listed in the tutorial as
  "standard, dropd, eb, E/5,B/4,G/4,D/4,A/3,E/3" (https://raw.githubusercontent.com/0xfe/vextab/master/doc/tutorial.html);
  the word "capo" does not occur in that tutorial (text search). trials.md (VexTab section) reports the same and drew
  S5dropd with `tuning=dropd` (r0144).
- **LICENSE FACTS** (read 2026-11-10), https://raw.githubusercontent.com/0xfe/vextab/master/LICENSE, quoted in full
  apart from the warranty paragraph: "VexTab is an open specification and the reference implementation (this
  repository) is open source. It is freely available complete and uncrippled for non-commercial use." "If you would
  like to use this code on commercial websites, products, blogs, plugins, or tools, please get in touch with me. (I'm
  very reasonable.)" "Copyright (c) 2012 Mohit Muthanna Cheppudira". The file ends with "The above copyright notice
  shall be included in all copies or substantial portions of the Software." The npm field is `LicenseRef-LICENSE`
  (no SPDX id). (verifier, 2026-11-10) The README's "License" section repeats the LICENSE text and adds: "**Note**: The
  underlying library, VexFlow, is completely open source and distributed under the MIT license."

## vexchords

- **What it is.** "VexChords renders guitar chords in your browser." (README,
  https://raw.githubusercontent.com/0xfe/vexchords/master/README.md). `import { ChordBox } from 'vexchords'`, options
  include `numStrings` ("e.g., 4 for bass"), `numFrets`, `showTuning`. Repository https://github.com/0xfe/vexchords,
  last commit 2024-12-31; npm `vexchords` 1.2.0 published 2019-03-31 (3 versions in all).
- **Renders tab:** no (chord boxes). **Plays audio:** no. **Edits:** no.
- **What the try lane saw** (verifier, 2026-11-10, from trials.md "svguitar 2.10.1 and vexchords 1.2.0"): the npm
  package's `dist/vexchords.js` stopped with "TypeError: A[e] is not a constructor" (r0253 to r0255); its ES-module
  source failed to load because `index.js` imports `'./chordbox'` without an extension (r0256); an esbuild bundle of
  the source drew both test chords (r0259). svguitar drew both (r0253). Both take string 1 as the highest string.
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

- **What it is.** "Unoffical audio playback engine for OpenSheetMusicDisplay" (README,
  https://raw.githubusercontent.com/jimutt/osmd-audio-player/master/README.md); author Jimmy Utterström per its
  LICENSE (verifier, 2026-11-10: the name is in the LICENSE, not the README). The README opens: "This project is
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
  instrument." with the guitar default `tuning: ["E,", "A,", "D", "G", "B", "e"]` (spacing corrected by the
  verifier, 2026-11-10, to match the page). capo: "default: 0 The number of
  frets that a capo is placed. This will transpose the numbers so that the open string is on the fret of the capo."
  The tab is computed from the notes; ABC itself carries no string or fret per note (UNVERIFIED whether a per-note
  string choice can be forced; the page read shows only instrument, label, tuning, capo, highestNote,
  hideTabSymbol).
- **What the try lane saw** (verifier, 2026-11-10, from trials.md "abcjs 6.7.2"): the guitar default tuning in
  `src/tablatures/abc_tablatures.js` is `['E,', 'A,', 'D', 'G', 'B', 'e']`, "which in ABC pitch is E3 A3 D4 G4 B4 E5:
  one octave above the sounding open strings (written guitar pitch)". ABC at sounding pitch drew 42 of 90 tab
  positions as "?" (r0239); ABC written one octave up gave 90 fret numbers, 88/90 matched by order and 88/88 on the
  truth's string and fret (r0241, e0638); `capo: 2` and a Drop D `tuning` gave the same counts (r0244, e0655, e0659).
- **Clicking and dragging** (added in gap round 2, pages read 2026-11-11). The render options page
  (https://docs.abcjs.net/visual/render-abc-options.html): `clickListener` "Default: null", "Callback function. The
  signature of the function is: function(abcelem, tuneNumber, classes, analysis, drag) {}." and "This is called
  whenever the user clicks on a note or selects a series of notes."; `dragging` "See the dragging page for more
  information." The "Selecting and Dragging" page (https://docs.abcjs.net/visual/dragging.html): "You can select which
  type of elements on the page you want to be selectable. If the element is a note, then it can also be draggable.";
  "The underlying music is not changed to reflect the user's action. The clickListener function should modify the
  ABC string and rerender if the user has made a change."; the drag argument is "{ step: number, setSelection:
  function, index: number, max: number, }" and "A negative number means that the note was dragged flatter and
  positive means it was dragged sharper."; "If selectTypes is not passed in, then nothing is selectable (the same
  behavior as passing false), but notes and rests are clickable." The click-listener page
  (https://docs.abcjs.net/visual/click-listener.html) on `abcelem`: "The internal object that is associated with the
  element clicked. Use a debugger to see what is available." and "This object is subject to change as the library
  gets more functionality." No page read names the tab numbers, a string, or a fret among the selectable or draggable
  things. What the try lane saw (trials.md, "Gap round 2", r0598): a click on a tab number reached the listener as
  `el_type` "tabNumber" with the note's text position; a drag changed nothing until the page rewrote the ABC; dragging
  up gave a negative step; abcjs put an edited F#3 on string 4 at the same time as the bass voice's open D on string 4
  (e1763, e1764).
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
  2026-11-10). gleitz repository last commit 2021-12-17; paulrosen fork last commit 2022-01-17. (verifier, 2026-11-10:
  the quoted lines are nested list items in the README, joined here with " - "; the "Creative Commons Attribution 3.0
  license" link points to https://creativecommons.org/licenses/by/3.0/us/, the BY-SA links to
  https://creativecommons.org/licenses/by-sa/3.0/.)
- **GeneralUser GS** is the alternative SoundFont alphaTab's docs demo ("about 9 MB as compressed SF3"). alphaTab's
  page says "GeneralUser GS is redistributed here under its author's permissive license (commercial and modification
  allowed)." (custom-soundfonts.mdx). (verifier, 2026-11-10) The license file of the SoundFont's repository,
  https://raw.githubusercontent.com/mrbumpy409/GeneralUser-GS/main/documentation/LICENSE.txt ("GeneralUser GS v2.0.3",
  "License v2.0"; repository last commit 2026-02-23): "You may use GeneralUser GS without restriction for your own
  music creation, private or commercial. This SoundFont bank is provided to the community free of charge. Please feel
  free to use it in your software projects, and to modify the SoundFont bank or its packaging to suit your needs."; on
  the samples: "GeneralUser GS inherits the usage rights of the samples contained within, all of which allow full use
  in music production, including the ability to make profit from musical recordings created with GeneralUser GS." and
  "I cannot be 100% sure where all of the samples originated"; on hosting: "If you plan to feature GeneralUser GS on
  your own website, please do not link directly to my download files. Either link to my website, or provide your own
  local copy instead." (The schristiancollins.com page is drawn by JavaScript; its static HTML has no license text.)
- **MuseScore's bundled SoundFonts** (verifier, 2026-11-10): the repository's `share/sound/` holds
  `MS Basic.sf3` and `FluidR3Mono_GM.sf3`. `MS Basic_License.md`
  (https://raw.githubusercontent.com/musescore/MuseScore/main/share/sound/MS%20Basic_License.md, titled
  "MuseScore_General.sf2"): "MuseScore_General.sf2 is shared under the MIT license as described in COPYING, as was
  FluidR3Mono and FluidR3 before it." and "The acknowledgements and copyright notices above must be included in any
  derivative work."; the same file reproduces the FluidR3 README line "I hereby release Fluid under the MIT license, as
  described in COPYING."
- **TuxGuitar's bundled SoundFont** (verifier, 2026-11-10): `desktop/TuxGuitar-resources/resources/soundfont/MagicSFver2.sf2`;
  the `readme.txt` next to it reads in full "Magic Sound Font v2.0" / "Contributed by Dennis Deutschmann"
  (https://raw.githubusercontent.com/helge17/tuxguitar/master/desktop/TuxGuitar-resources/resources/soundfont/readme.txt),
  and no other license text for it was found in the repository file list (searched for "licen", "copying"). License:
  UNVERIFIED.
- **FluidR3_GM on this box:** `/usr/share/sounds/sf2/FluidR3_GM.sf2` (used by the shared test inputs). Its Debian
  copyright file is quoted in the next bullet.
- **Note on FluidR3_GM licenses (sources conflict):** the MIDI.js README above says the FluidR3_GM set is "Released
  under Creative Commons Attribution 3.0 license". The box's Debian package `fluid-soundfont-gm` 3.1-5.3, file
  `/usr/share/doc/fluid-soundfont-gm/copyright` (read 2026-11-10), says: "Upstream Author: Frank Wen", "Copyright ©
  2000-2002, 2008 Frank Wen", and under License: "From README: "I hereby release Fluid under the MIT license, as
  described in COPYING."", followed by the MIT permission text. Both quoted; nothing more is concluded here.
  (verifier, 2026-11-10) A third source, MuseScore's `MS Basic_License.md` (bullet above), reproduces the FluidR3 README
  with the same MIT sentence.

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
  `pip install verovio`, `import verovio`, `tk = verovio.toolkit()`, `tk.loadFile("path-to-mei-file")`,
  `svg_string = tk.renderToSVG(1)` (corrected by the verifier, 2026-11-10: the earlier text had spaces inserted inside
  the code). MIDI: `RenderToMIDI`, and `RenderToMIDIFile` "Render a document to MIDI
  and save it to the file. This method is not available in the JavaScript distributed version of the toolkit"
  (https://book.verovio.org/toolkit-reference/toolkit-methods.html). Other render methods listed there:
  `RenderToPAE`, `RenderToSVG`, `RenderToTimemap`. Command line: a `verovio` binary built with CMake
  (.../command-line.html). JavaScript: npm `verovio` (WASM toolkit). Input format detection: "When data is loaded into
  Verovio with no input format specifies, it tries to detect it based on the initial content of the data. MEI is
  assume to be the default format if auto detection fails." (https://book.verovio.org/toolkit-reference/input-formats.html).
- **Plays audio:** no synthesizer; it renders MIDI and a timemap (above). **Edits:** no editor in the library (the
  Verovio Online Editor/Viewer at http://editor.verovio.org is named in the README; not read further). (corrected in
  gap round 2: the library has an editing call, though no editing interface. The npm package's typings,
  `dist/types/verovio-toolkit.d.ts` of 6.4.1 (read 2026-11-11 from the installed package), declare
  `edit(editorAction: EditorAction): boolean;` with the comment "Edit the MEI data.", plus `editStatus()` ("Return the
  editor status.") and `editResponse()`; `dist/types/EditorTypes.d.ts` lists the actions, among them `set` (`elementId`,
  `attribute`, `value`), `drag` (`elementId`, `x`, `y`), `insertNote`, `keyDown`, `undo` and `redo`. Run in trials.md,
  "Gap round 2", r0626: `set` on `tab.fret` and `tab.course` of MEI tab notes changed the MEI and the drawn fret
  number; one `undo` restored all three changes; e1827.)
- **What the try lane saw** (verifier, 2026-11-10, from trials.md "Verovio 6.4.1"): MusicXML with a TAB staff came out
  as MEI with `notationtype="tab.guitar"` and 90 `tab.course` (r0166; gtr-eval 90/90 same string and fret, e0363); the
  `<capo>` of the S5capo2 MusicXML was not carried into the MEI ("the word "capo" appears only in the title", r0174;
  e0365 0/90 when read with capo 0, e0366 90/90 with the capo supplied by hand).
- **LICENSE FACTS** (read 2026-11-10): a. SPDX `LGPL-3.0-only` (npm and PyPI fields). README: "Verovio is available
  under the LGPL license (see COPYING and COPYING.LESSER)". COPYING.LESSER
  (https://raw.githubusercontent.com/rism-digital/verovio/develop/COPYING.LESSER): "GNU LESSER GENERAL PUBLIC LICENSE
  Version 3, 29 June 2007"; section 4: "You may convey a Combined Work under terms of your choice that, taken
  together, effectively do not restrict modification of the portions of the Library contained in the Combined Work
  and reverse engineering for debugging such modifications, if you also do each of the following:" (conditions a-e
  follow in the file). Embedded libraries named in the README: humlib, JSON++, MidiFile, pugixml, MINIZ-CPP,
  tuning-library. (verifier, 2026-11-10) Two carry license files in the repository: `include/json/LICENSE` ("Copyright
  (c) 2010 Hong Jiang", MIT permission text) and `include/tuning-library/LICENSE.md` ("Copyright 2019-2020, Paul
  Walker", MIT permission text); the licenses of humlib, MidiFile, pugixml and MINIZ-CPP were not read (UNVERIFIED).
  Bundled fonts, `fonts/README.md` (https://raw.githubusercontent.com/rism-digital/verovio/develop/fonts/README.md):
  Leipzig, Bravura, Gootville, Petaluma, Leland and the Liberation text font; "All fonts included in Verovio are
  licensed under the SIL Open Font License." (link markup dropped). b, c. No weights, no training data.

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
  apply." (verifier, 2026-11-10) The FSA text, https://www.w3.org/community/about/agreements/final/: "2.1. Copyright
  Grant. I grant to you a perpetual (for the duration of the applicable copyright), worldwide, non-exclusive,
  no-charge, royalty-free, copyright license, without any obligation for accounting to me, to reproduce, prepare
  derivative works of, publicly display, publicly perform, sublicense, distribute, and implement the Specification to
  the full extent of my copyright interest in the Specification." and "2.2. Attribution. As a condition of the
  copyright grant, you must include an attribution to the Specification in any derivative work you make based on the
  Specification. That attribution must include, at minimum, the Specification name and version number." Patents,
  3.1: "I agree to license my Essential Claims under the W3C Community RF Licensing Requirements." The
  w3c/musicxml repository has no LICENSE file at its root (file list of the 2026-11-10 clone).

## MEI (format), tablature module

- **What it is.** "The Music Encoding Initiative (MEI) is an open-source effort to define a system for encoding
  musical documents in a machine-readable structure." (README of https://github.com/music-encoding/music-encoding,
  default branch `develop`, last commit 2026-11-10). Release tags: `v5.0`, `v5.1` (tag date 2025-01-22), and
  `v6.0-0+featureFreeze` (tag 2026-08-04) and `v6.0-1+meiODDs` (tag 2026-11-02) (dates corrected by the verifier,
  2026-11-10), i.e. a v6.0 in preparation (UNVERIFIED whether 6.0 has been released; the tags carry no plain `v6.0`).
- **Tablature** (MEI Guidelines v5, chapter "7 Repertoire: String Tablature",
  https://music-encoding.org/guidelines/v5/content/tablature.html, read 2026-11-10): "This chapter describes the
  MEI.stringtab module (which will be renamed to MEI.tablature in a future version). The MEI.stringtab module is used
  to record basic tablature notation. It is designed primarily for plucked-string instruments, such as guitar and
  lute." "The notation used is defined on the staffDef element using the notationtype attribute. Possible values
  are: tab.guitar, tab.lute.italian, tab.lute.french and tab.lute.german." (spaces before punctuation removed by the
  verifier, 2026-11-10, to match the page). Tuning: "The tuning element is used
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
  `--export-to`: "Export the given (or currently opened) file to the specified output file. The file type depends
  on the extension of the filename given. This option switches to “converter mode” and avoids the graphical user
  interface." `-j` processes a JSON conversion job. "Valid file extensions for output are:" flac, metajson, mid, midi,
  mlog, mp3, mpos ("measure positions (XML)"), mscx, mscz, musicxml, mxl, ogg, pdf, png, spos, svg, wav, xml. No
  Guitar Pro extension is in that output list. (verifier, 2026-11-10) The same page says: "PLEASE NOTE: This page was
  copied from the equivalent page in the MuseScore 3 Handbook. If you find an option that no longer works in
  MuseScore 4, please report it on GitHub." The 4.x AppImage was not run here. The try lane ran the Ubuntu package
  MuseScore 3.2.3 (`mscore3 -o <out.ext> <in>`); it needed `QT_QPA_PLATFORM=offscreen`, without which it stopped with
  "This application failed to start because no Qt platform plugin could be initialized." (trials.md, r0120 to r0125).
- **What the try lane saw with MuseScore 3.2.3** (verifier, 2026-11-10, from trials.md): a `.gp5` imported as one
  standard-notation staff with no TAB staff; its MusicXML export had no `<technical><string>/<fret>`, no
  `<staff-tuning>` and no TAB clef (r0120; gtr-eval refused it, e0141); the capo of S5capo2.gp5 became a staff text
  "Capo. fret 2" (r0176); alphaTab's `.gp` (GP7) export was refused, "unknown file suffix <gp>" (r0178, exit 1);
  MusicXML with a TAB staff in kept the TAB staff and string and fret on the way out (r0179, e0367 90/90), but
  `<capo>` was not in the output and string and fret changed (r0180, e0368 0/90 same string and fret).
- **Input formats with tab.** `src/importexport/guitarpro/guitarpromodule.cpp` registers the Guitar Pro reader for
  `{ "gtp", "gp3", "gp4", "gp5", "gpx", "gp", "ptb" }` (line 52 of the 2026-11-10 clone). The source tree also has
  importexport modules `musicxml`, `mei`, `midi`, `tabledit`, `capella`, `musedata`, `bww`, `ove`, `mnx`. README
  features: "MusicXML import/export", "MIDI (SMF) import/export", "MEI import/export", "MuseData import".
- **Plays audio / edits:** the desktop application does both; the command line renders audio files (wav, mp3, flac,
  ogg) per the extension list above.
- **LICENSE FACTS** (read 2026-11-10): `LICENSE.txt` in the repository: "MuseScore Studio, free and open source
  music notation software Copyright (C) 1999-2026 MuseScore Limited and others This program is free software; you can
  redistribute it and/or modify it under the terms of the GNU General Public License version 3 as published by the
  Free Software Foundation." Font exception in the same file, which first says "All fonts included in MuseScore
  Studio are made available under the GNU Freefont License, and those fonts are covered by the following special
  exception:" (verifier, 2026-11-10): "If you create a document which uses fonts included in
  MuseScore Studio, and embed this font or unaltered portions of this font into the document, then this font does not
  by itself cause the resulting document to be covered by the GNU General Public License." README: "MuseScore Studio
  is licensed under GPL version 3.0." The repository also has an `AI_POLICY.md` (not read). Bundled SoundFonts and
  their license files: see "SoundFonts used by the web players above".

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
- **What the try lane saw** (verifier, 2026-11-10, from trials.md "webmscore 1.2.1"): under Node 22.23.4 loading
  stopped with "TypeError: Cannot set property navigator of #<Object> which has only a getter" (r0279 to r0282) and
  then "TypeError: Failed to parse URL from .../webmscore.lib.wasm" (r0283 to r0286); with a writable
  `globalThis.navigator` and `globalThis.fetch` deleted it ran (r0288 to r0291). It read alphaTab's `.gp` (r0290).
  Guitar Pro in, MusicXML out: no TAB staff and no `<string>`/`<fret>` (e0990, e0995, e1002). MusicXML with a TAB staff
  in, MusicXML out: `<staff-tuning>` one octave high and 0/90 on the truth's string and fret (e1009). MIDI out matched
  the truth pitches, the capo file included (e0992, e0999, e1006).
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
  default, string 1 is the highest string, and corresponds to the top line on the TabStaff. The tuning of the
  TabStaff strings defaults to the standard guitar tuning (with 6 strings). The notes are printed as tablature, by
  using TabStaff and TabVoice contexts." "LilyPond tablature automatically calculates the fret for a note based on
  the string to which the note is assigned. In order to do this, the tuning of the strings must be specified. The
  tuning of the strings is given in the stringTunings property." (verifier, 2026-11-10: the word "tablature" was
  missing from this quote, and spaces before full stops in this paragraph are removed to match the page.) Predefined
  tunings include "guitar-open-g-tuning". String choice:
  "If you would like a certain pitch to be played on a specific string you can add a string number indication to the
  pitch name." and "Usually it will be more comfortable to define the playing position by using the value of
  minimumFret. The default value for minimumFret is 0. Even when minimumFret is set, open strings are used whenever
  possible. This behavior can be changed by setting restrainOpenStrings to #t." Capo: the page mentions a capo only
  for fret diagrams: "Unique to the \fret-diagram-verbose interface is a capo indication that can be placed on the
  fret diagram."
- **How a program calls it:** the `lilypond` command on a `.ly` text file, producing PDF, SVG ("23.3.1 SVG Output"
  in the manual's table of contents), and MIDI with a `\midi` block ("24 Creating MIDI output"). (verifier,
  2026-11-10) Usage manual, https://lilypond.org/doc/v2.26/Documentation/usage/invoking-lilypond: "lilypond
  [option]… file…" and "When filename.ly is processed it produces filename.pdf as output by default."; the options
  page https://lilypond.org/doc/v2.26/Documentation/usage/basic-command_002dline-options-for-lilypond lists `--png`,
  `--pdf` and `--svg` ("--svg is actually equivalent to using the -dbackend=svg option."). The try lane ran the Ubuntu
  package LilyPond 2.24.3 with `lilypond --png -dresolution=100 -o <out> <in>.ly` (trials.md, r0197 and others).
  Input is LilyPond text; Python tools
  that write it include abjad (PyPI 3.31, 2025-10-31) and python-ly (PyPI 0.9.10, 2026-04-04). TuxGuitar exports to
  LilyPond (plugin `TuxGuitar-lilypond`, section below).
- **Plays audio:** MIDI output only. **Edits:** text only.
- **LICENSE FACTS** (read 2026-11-10): https://gitlab.com/lilypond/lilypond/-/raw/master/LICENSE: "GNU LilyPond is
  free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as
  published by the Free Software Foundation, either version 3 of the License, or (at your option) any later
  version." `COPYING` in the same place is the GPL version 3 text. PyPI `lilypond` wheel `license` field
  `GPL-3.0-or-later`. (verifier, 2026-11-10) The same LICENSE lists exceptions: "It does not apply to the
  documentation files (contained in the directory tree Documentation/)."; "The files under mf/ form a font, and this
  font is dual-licensed under the GPL+Font exception and the SIL Open Font License (OFL)."; the font exception: "If
  you create a document which uses fonts included in LilyPond, and embed this font or unaltered portions of this font
  into the document, then this font does not by itself cause the resulting document to be covered by the GNU General
  Public License."

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
  `TuxGuitar-ui-toolkit-swt`, `-jfx`, `-qt`); the batch converter is a plugin of the GUI. (verifier, 2026-11-10) The
  command-line parser,
  https://raw.githubusercontent.com/helge17/tuxguitar/master/desktop/TuxGuitar/src/app/tuxguitar/app/util/ArgumentParser.java,
  prints "usage: TuxGuitar [file]" and the options "-h, --help", "-v, --version", "-i, --system-info" and
  "-D<name>=<value>"; it has no export or convert option. The plugin `.info` files quoted above carry their
  descriptions with a `\n` line-break escape inside (e.g. "version 1 to 5\nfiles"); the quotes join the two halves.
- **What the try lane saw** (verifier, 2026-11-10, from trials.md "TuxGuitar 1.5.6"): the Ubuntu package's
  `/usr/bin/tuxguitar` "only starts the GUI main class"; a Java program written for the trial called the plugins'
  reader and writer classes with `-Djava.awt.headless=true` (r0221 to r0224). GP5, GP4 and GP3 written by TuxGuitar
  kept 90/90 notes with string, fret, capo and tuning (e0457 to e0459, e0464 to e0466, e0471 to e0473); its MusicXML
  export had one G-clef staff with the two voices merged, `<staff-tuning>` and `<pitch>` one octave above the
  sounding pitch and no capo element (16/90 matched by pitch, e0460; 0/90 for S5capo2, e0467); its ASCII export has
  no capo or tuning field; its LilyPond export is written for `\version "2.14.0"` and compiled in LilyPond 2.24.3 only
  after `convert-ly -e` (r0230 exit 1, r0232).
- **Sound:** README "Third party products": "Gervill (Java Software Synthesizer)" and "Magic Sound Font v2.0 -
  Contributed by Dennis Deutschmann" (no license text for that SoundFont was found: UNVERIFIED; see "SoundFonts used
  by the web players above"). Modules
  `TuxGuitar-fluidsynth`, `TuxGuitar-synth-lv2`, `TuxGuitar-alsa`, `TuxGuitar-jack` exist.
- **LICENSE FACTS** (read 2026-11-10): README: "TuxGuitar is released under the GNU Lesser General Public License.
  Copyright (C) 2005-2022 Julián Casadesús 2023-2025 guiv42, helge17". `docs/LICENSE`: "GNU Lesser General Public
  License Version 2.1, February 1999". (verifier, 2026-11-10) Third-party parts: the README's "Third party products"
  list also names "iText (Free Java-PDF library): https://itextpdf.com/"; `desktop/pom.xml` pins
  `com.itextpdf:itextpdf` version 5.5.13.3 (used by `common/TuxGuitar-pdf`), and that artifact's Maven Central pom
  (https://repo1.maven.org/maven2/com/itextpdf/itextpdf/5.5.13.3/itextpdf-5.5.13.3.pom) names its license "GNU Affero
  General Public License v3". The bundled SoundFont: see "SoundFonts used by the web players above".

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
- **What the try lane saw** (verifier, 2026-11-10, from trials.md "PyGuitarPro 0.11", r0236): GP5 written and re-read
  with 90/90 on the same string and fret (e0574); GP4 and GP3 written with 42 of 90 notes, "the first voice only; the
  second voice is not in the output" (e0578, e0581). An edited copy (one note moved to string 4 fret 5, `track.offset`
  1, string 6 tuned to 38) was read by alphaTab 1.9.0 with capo 1, tuning [38, 45, 50, 55, 59, 64] and the moved note
  on string 4, fret 5.
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
  and 75). The source carries the comments `# TODO: staff-tuning` and `# TODO: capo` in `musicxml/m21ToXml.py`
  (lines 7263-7264, at the end of the function that writes `<staff-details>`) and `# TODO: staff-tuning*` and
  `# TODO: capo` in `musicxml/xmlToM21.py` (lines 6448-6449) (the asterisk corrected by the verifier, 2026-11-10).
- **How a program calls it:** `from music21 import converter; s = converter.parse('file.musicxml')`,
  `s.write('musicxml', 'out.musicxml')`, `s.write('midi', 'out.mid')` (standard music21 API; the exact doc page was
  not re-read: UNVERIFIED wording). (verifier, 2026-11-10) The try lane used `score.write('musicxml')` and
  `converter.parse()` on music21 10.5.2 (trials.md, r0153, r0154): string and fret written as `<technical><string>`
  and `<fret>` on every note, no `<staff-tuning>` and no `<capo>` in the output.
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
  start_of_tab Abbreviation: sot. This directive indicates that the lines that follow form a section of guitar TAB
  instructions. The lines will not be folded or changed. Markup is left as is, and directives are considered literal
  text except for {end_of_tab} and {eot}." (spaces before full stops removed by the verifier, 2026-11-10, to match the
  page) i.e. tab inside ChordPro is opaque text (ASCII tab), not parsed notes.
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
  (verifier, 2026-11-10) `docs/LICENSE` (https://raw.githubusercontent.com/tonaljs/tonal/main/docs/LICENSE): "The MIT
  License (MIT) Copyright (c) 2015 danigb", followed by the MIT permission text.

## react-guitar (and react-guitar-sound)

- "A beautiful and accessible guitar component for React." (README of https://github.com/4lejandrito/react-guitar,
  last commit 2026-01-06); npm `react-guitar` 1.1.3 published 2026-01-04. Props: `strings` "An array where each
  number represents the fret the string is pressed on (`0` means open string and `-1` muted)"; `onChange` "called
  when a string is press/unpressed. If not present the guitar will be read only." Sound via the `useSound` hook of
  `react-guitar-sound`, whose default instrument is `withSoundFont('acoustic_guitar_nylon')` built on
  `soundfont-player` with `soundfont?: 'FluidR3_GM' | 'MusyngKite'` (`packages/react-guitar-sound/src/`), i.e. the
  MIDI.js sample sets listed under "SoundFonts". A fretboard input and display, not a tab staff. (verifier,
  2026-11-10) String order, from the same README row: "`[0, 1, 2, 2, 0, -1]` is an `A minor` in a standard guitar",
  i.e. the first array element is the highest-pitched string (A minor is x02210 written from the lowest string).
- **LICENSE FACTS** (read 2026-11-10): `LICENSE`: "MIT License Copyright (c) 2018-present Alejandro Tardín".

## fretboard.js

- `@moonwave99/fretboard.js` 0.2.13 published 2022-11-18, npm `license` field `ISC`; repository
  https://github.com/moonwave99/fretboard.js, last commit 2022-11-17. The repository has no LICENSE file at its root
  (file list of the 2026-11-10 clone). (corrected by the verifier, 2026-11-10) The README
  (https://raw.githubusercontent.com/moonwave99/fretboard.js/master/README.md) ends with "## ISC License", "Copyright
  (c) 2020, Diego Caponera" and the ISC text: "Permission to use, copy, modify, and/or distribute this software for
  any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission
  notice appear in all copies." README description: "a guitar/bass fretboard SVG visualisation; a set of music
  oriented tools - as scale boxes, arpeggios and chord shapes; an API for user interaction." (list items joined).
  No tab staff and no audio are named in the README.

## chords-db and react-chords

- chords-db: "This is a javascript database of string instruments chords. Open, free to use, easily improved with
  more chords." Entries such as `key: 'D', suffix: 'sus2', positions: [{ frets: '0320xx', ...` (README of
  https://github.com/tombatossals/chords-db, last commit 2025-10-14). npm `@tombatossals/chords-db` 0.5.1 published
  2019-11-02; `@tombatossals/react-chords` 0.2.10 published 2019-10-23.
- **LICENSE FACTS** (read 2026-11-10): chords-db `LICENSE`: "MIT License Copyright (c) 2016 David Rubert". npm fields
  `MIT` for both packages.
- **String order** (verifier, 2026-11-10): the README example `frets: '0320xx'` for D sus2 does not match the data
  file it names. `src/db/guitar/chords/D/sus2.js` at HEAD has `frets: 'xx0230'` as its first position, `C/major.js`
  has `frets: 'x32010'`, and `src/db/guitar/tunings.js` has `standard: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']`: the
  data files list frets from the lowest string to the highest. Frets above 9 are letters (`C/major.js` has
  `frets: '8aa988'`). (Read from the 2026-11-10 clone, commit df06fa7; the npm package 0.5.1 is from 2019 and was not
  opened.)

## jTab

- npm `jtab` 1.3.2 (2017-10-30) is the telesoho fork ("Guitar Tab Notation for the Web (Javascript/CSS/SVG)";
  "Differences from the original tardate/jtab: ... it was not tested very well", README of
  https://github.com/telesoho/jtab, last commit 2022-02-20). package.json `"license": "MIT"`; no LICENSE file at the
  root of the fork (file list of the clone). (verifier, 2026-11-10) The original repository
  https://github.com/tardate/jtab (last commit 2025-10-01, "add LICENSE to repo re #55 (#56)"; newest tag 1.4.0) has a
  LICENSE (https://raw.githubusercontent.com/tardate/jtab/main/LICENSE): "Copyright (c) 2009-2025 Paul Gallagher" and
  "This library is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser General
  Public License as published by the Free Software Foundation; either version 2.1 of the License, or (at your option)
  any later version." Its README: "this is the source repository for the jTab Javascript library." The fork's
  `"license": "MIT"` and the upstream LGPL text are both quoted; nothing more is concluded here.

## abc2svg

- npm `abc2svg` 1.22.1 published 2022-09-13 with the npm deprecation message "Package no longer supported. Contact
  Support at https://www.npmjs.com/support for more info."; `license` field `LGPL-3.0`; `repository`
  https://chiselapp.com/user/moinejf/repository/abc2svg (npm registry, read 2026-11-10). (verifier, 2026-11-10: the
  chiselapp pages were read.) Documentation page: "abc2svg is a set of ECMAscript files that handle the ABC music
  notation. This includes editing, displaying, printing, playing the music files and converting them to other
  formats such as ABC and MEI notations." Newest tag on the tag list
  (https://chiselapp.com/user/moinejf/repository/abc2svg/taglist): `v1.23.7`, 2026-11-08 17:28. Tablature: the
  `modules/` directory holds `strtab.js` and `tblt.js` (also `capo.js`, `diag.js`); `strtab.js`
  (https://chiselapp.com/user/moinejf/repository/abc2svg/raw?name=modules/strtab.js&ci=trunk): "abc2svg - strtab.js -
  tablature for string instruments", "The command %%strtab changes the display of the voice to a tablature.",
  "%%strtab <string list> [diafret] [nodot]", and "The fret may be forced by a decoration format "!" digit "s!" where
  'digit' is the string range in the string list (last string is '1')"; also "%%minfret [ <string number> : <fret
  number> ]*". `tblt.js`: "This module is loaded when %%tablature appears in a ABC source." License, in the header of
  both files: "abc2svg is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
  General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your
  option) any later version." The top level holds `COPYING`, `COPYING.LESSER` and `MIT.txt` (file list; `MIT.txt`
  not traced to a component). Not run here.

## Soundslice (hosted player, editor, embed and data API)

- **What it is.** A web service by Soundslice LLC ("an Illinois Limited Liability Company", Terms of Service,
  https://www.soundslice.com/terms/, read 2026-11-10) for interactive notation and tab synced to audio or video, with
  a "full-featured notation and tab editor" (https://www.soundslice.com/teachers/). Not runnable on this box: it is a
  service and needs an account.
- **Embed** (https://www.soundslice.com/licensing/, read 2026-11-10): "Once you’ve created a lesson (a “slice”), you
  simply copy and paste our embed code into your site. It’s a simple <iframe>, similar to a YouTube video embed."
  "We also have a JavaScript API for advanced integration." "Every Soundslice account gets one free embed."
- **Embed pricing** (same page): "We charge based on how many people use Soundslice on your site in a month. There’s
  a flat fee of $100 for the first 200 unique users. Each unique user after that costs 50 cents." "A “unique user” is
  a single computer that's viewed at least one Soundslice embed on your site in a given calendar month."
- **Plans** (https://www.soundslice.com/plans/, read 2026-11-10): Free "$0"; Plus "$5" per month or "$50" per year;
  Teacher "$20" per month or "$200" per year. Teacher page: "The Teacher plan costs $20/month for up to 100 students.
  Any student beyond that costs 20 cents extra a month." (verifier, 2026-11-10) The plans page also lists Licensing:
  "$100" "per month for 200 users", "Each additional user is 50 cents/month.", "Embed Soundslice in your site/app".
- **Data API** (https://www.soundslice.com/help/data-api/, read 2026-11-10): "API keys are only available to paying
  Soundslice customers — either in the Teacher or Licensing plans." "This API is REST-based and works over HTTP. For
  each API call, you’ll need to authenticate with your API key, using HTTP Basic Authentication." Example `curl -X
  GET -u 'my_app_id:my_password' https://www.soundslice.com/api/v1/slices/abcde/`. Upload notation: "This endpoint
  lets you upload a slice’s notation from one of our supported formats: MusicXML, Guitar Pro, PowerTab or
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
  editor directly in your site, and let your users or visitors create and edit MusicXML files." "You can try the
  embed for free with a personal Flat account ... (no customization or API available)." "If you want to customize it
  (e.g. removing Flat Branding, changing the controls displayed, the colors and theme) or use our embed commercially,
  subscribe to one our embed plan." (spaces before punctuation removed by the verifier, 2026-11-10, to match the page)
- **REST API docs** (https://flat.io/developers/docs/api/, read 2026-11-10): "Creating and importing new music scores
  using MusicXML or MIDI files." "Browsing, updating, copying, exporting the user's scores (for example in MP3, WAV or
  MIDI)." "By using this API, and especially on the behalf of a user account, you must accept, respect and enforce our
  Terms of Service and Privacy Policy." and "By using this API, you agree to update your app in a timely fashion in
  response to any changes that are rolled out." The page has a "Rate Limits" section (values not recorded here).
- **Embed pricing** (https://flat.io/embed, read 2026-11-10): "Flat Embed’s billing is based on the total number of
  unique users each month." "Beyond 200 users, each additional user results in a -- charge." The dollar figures on
  that page are filled in by JavaScript; the static HTML read here shows "--" in their place. (verifier, 2026-11-10)
  The page rendered in headless Chromium (`scripts/verify/render_text.cjs`, Playwright, page text after network idle)
  shows, next to the estimator at its starting position ("0 Users", slider to "1000"): "$75.00" "/month" and "Beyond
  200 users, each additional user results in a $0.25 charge."; "More than 1,000 users include" "Advanced tech
  support", "Volume pricing", "Slack channel". Its FAQ answer "How does the pricing work? Give me an example." says:
  "For example, if Tina visits your site daily, she's one unique user, costing 50 cents." Both figures are quoted as
  shown; the page does not say which applies. "A unique user is tracked by user IDs that your development team places
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
  - Individual-account terms (verifier, 2026-11-10: read on that date),
    https://help.flat.io/en/policies/terms-of-service-individual/, "Last updated September 4, 2026". 6.1 defines a
    "Free Service" and a paid "Premium Service" with which users can "print and export unbranded documents (i.e.
    without Flat mention or any watermark)" and "have the ability to select a MIDI output". Section 10, for content
    made "public": "you grant us a worldwide, nonexclusive and royalty-free licence to use, reproduce, distribute,
    adapt, reformat, modify, publish, translate, licence, sub-licence, and exploit the User Content anywhere and in any
    form only for the purpose of providing our Service". 11.2 lists what users must not do, including "(k) collect any
    data from the Service other than in accordance with these Terms of Service;" and "(q) use any automated system,
    including without limitation "robots", "spiders" or "offline readers" to access the Service in a manner that send
    more request messages to the Service than a human can reasonably produce in the same period of time."

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
| PyGuitarPro (LGPL-3.0-only) | read, write | no | no | README "read, write and manipulate GP3, GP4 and GP5 files"; trials.md: its GP4 and GP3 output kept 42 of 90 notes (the second voice was not written; e0578, e0581), GP5 kept 90/90 (e0574) |
| TuxGuitar (LGPL-2.1) | import, export (GP1-GP5) | import | import (GP7) | plugin `.info` files `TuxGuitar-gtp`, `TuxGuitar-gpx`; trials.md (Ubuntu package 1.5.6, plugin classes called from Java): GP5 read and GP5/GP4/GP3 written with 90/90 kept, alphaTab's `.gp` read 90/90 (e0477) |
| MuseScore Studio (GPL-3.0) | import | import | import | `guitarpromodule.cpp` reader registration (`gtp gp3 gp4 gp5 gpx gp ptb`) on `main`; the try lane's MuseScore 3.2.3 (Ubuntu package) imported `.gp5` but refused `.gp`, "unknown file suffix <gp>" (trials.md, r0178) |
| webmscore (GPL-3.0) | import | import | import | `web-public/schemas.ts` `InputFileFormat`; trials.md: read S2n.gp5 (r0288) and alphaTab's `.gp` (r0290) |
| Power Tab Editor 2.0 (GPL-3.0) | open | open | open | README "Supported File Types" (.pt2, .ptb, .gp3, .gp4, .gp5, .gpx, .gp) |
| guitarpro-parser, npm (Apache-2.0) | read | read | read (GP7 and GP8) | README "Reads `.gp` (Guitar Pro 7 and 8), `.gpx` (Guitar Pro 6), `.gp5`, `.gp4` and `.gp3`"; trials.md: GP5 and TuxGuitar's GP3 read 90/90 (e1101, e1110); alphaTab's `.gp` export refused, "staff 1 of track 0 has a FretCount property without <Number>." (r0298) |
| ApolloTab, PyPI (LGPL-2.1) | read | read | read | README "Full support for GP3/GP4/GP5/GPX/GP(GP7/GP8) formats" |
| guitarpro (Rust crate, MIT) | read, write | read, write | read, write | README "Supported formats" table |
| Soundslice data API (service) | upload | upload | upload | API docs "MusicXML, Guitar Pro, PowerTab or TuxGuitar" (versions not listed) |

- No byte-level validation of these claims was done in this docs lane (the try lane runs files through some of them).
  (verifier, 2026-11-10) Run in trials.md ("Format matrix" there): alphaTab 1.9.0 read the three `.gp5` inputs and its
  own `.gp` export with every string and fret kept (r0020, r0026, r0030; e0004 to e0016). alphaTab's `.gp` export was
  read by TuxGuitar 1.5.6 (e0477) and webmscore (r0290), and refused by MuseScore 3.2.3 (r0178) and guitarpro-parser
  (r0298). TuxGuitar's GP3 and GP4 output read back in alphaTab with 90/90 (e0799, e0802); PyGuitarPro's GP3 output
  carried 42 of 90 notes into alphaTab (e0805).
- (verifier, 2026-11-10) Newer parsers found in the completeness pass are in "Added by the verifier" below
  (`@holm/asciitabs-to-gp`, SuNett, `@musicbird/gp-parser`).

## alphaTex (format)

- alphaTab's own plain-text format: "alphaTex is a plain-text notation format for alphaTab. You write a score as
  source code and alphaTab parses it into the same data model any other format produces."
  (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/website/docs/alphatex/introduction.mdx). Note syntax
  `fret.string` with string 1 the highest (quoted in the alphaTab section); metadata `\title`, `\tempo`, `\tuning`,
  `\ts`, `\track` (introduction showcase), `\capo` (tag definition `capo.ts`), `\staff {tabs}`
  (document-structure.mdx); beat durations as `:4`, `:8`, `:16`; note properties in braces, e.g.
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
  or represented in a variety of ways" (Wikipedia "ASCII tab", wikitext read 2026-11-10 through
  https://en.wikipedia.org/w/index.php?title=ASCII_tab&action=raw; secondary source).
- A 1990s guide exists: the "Tablature FAQ" by Howard Wright, "Copyright Howard Wright and the olga-grunts", with the
  notice "This document may be distributed freely as long as NO CHARGE is made and my name and email address are not
  removed." (https://guitartabs.cc/tabfaq.php, read 2026-11-10). It is a reading and writing guide, not a grammar.
  (verifier, 2026-11-10: on the page the notice sits in a box of asterisks, dropped in the quotes; it continues "If
  you want to edit or re-format this document for public consumption, please contact me first.")
- Tools that write ASCII tab: TuxGuitar (`TuxGuitar-ascii` "ASCII tab export plugin"), the Rust `guitarpro` CLI
  `score_tool` ("generate ASCII tablatures", README). ChordPro carries ASCII tab verbatim inside `{start_of_tab}`
  blocks. Readers: ChordSheetJS `UltimateGuitarParser` reads Ultimate Guitar chord sheets (README); 1j01/guitar "You
  can copy and paste entire webpages containing guitar tabs and it'll try to load all it can." (README). No parser
  library for ASCII tab note content with a stated grammar was found among the pages read. (verifier, 2026-11-10)
  Parsers of ASCII tab found in the completeness pass, none with a published grammar in the READMEs read:
  `@holm/asciitabs-to-gp` ("Parse 6-string ASCII guitar tabs into a normalized intermediate representation"),
  `@tabkit/parser` ("Parse ASCII tabs and MusicXML into JSON", per the tabkit README), `ascii-tabs` ("with plain ASCII
  import and export"), `@danzw777/tab-score` (ASCII input), and the 1j01/guitar player above. Details in "Added by
  the verifier".

## Added after the first pass: more parsers and converters

- **guitarpro-parser** (npm, TypeScript). "TypeScript parser for Guitar Pro files. Returns a typed model of the score
  and computes playback order and timing." "Reads `.gp` (Guitar Pro 7 and 8), `.gpx` (Guitar Pro 6), `.gp5`, `.gp4`
  and `.gp3`." "Detects the format from the file's bytes." Usage `import { parseGuitarPro } from
  'guitarpro-parser'`; `parseGuitarPro` "accepts a `Uint8Array`, a Node `Buffer` or an `ArrayBuffer`"; note fields
  include `note.string; // 0-based, 0 is the highest string` (README of https://github.com/emilienbev/guitarpro-parser,
  last commit 2026-11-08). npm 2.0.0 published 2026-11-08 (6 versions, first 2026-02-24). LICENSE: "Apache License
  Version 2.0, January 2004". Read only (no writer named in the README lines read). RUNNABLE. (verifier, 2026-11-10)
  trials.md "guitarpro-parser 2.0.0": S2n.gp5, S5capo2.gp5, S5dropd.gp5 and TuxGuitar's GP3 parsed with 90/90 on the
  truth's string and fret, tuning and capo read (r0294 to r0299; e1101, e1103, e1105, e1110); alphaTab's `.gp` export
  was refused: "GuitarProError: Cannot read this Guitar Pro 7+ (.gp) file (track 1): staff 1 of track 0 has a
  FretCount property without <Number>." (r0298).
- **ApolloTab** (PyPI). "`ApolloTab` is a fully-featured Python library for parsing, rendering, and playing Guitar Pro
  (.gp3/.gp4/.gp5/.gpx/.gp) tablature files."; "Tablature Rendering: Render high-quality tablature images (QPixmap)
  using QPainter"; "Audio Playback: Real-time MIDI synthesis engine based on FluidSynth with SoundFont support"
  (README of https://github.com/Zhuwenqian/ApolloTab, last commit 2026-08-28). PyPI 1.6.0 uploaded 2026-08-06,
  `license_expression` `LGPL-2.1` (the `license` field is empty; corrected by the verifier, 2026-11-10); repository
  LICENSE "GNU LESSER GENERAL PUBLIC LICENSE Version 2.1, February 1999".
  `pip install ApolloTab`. RUNNABLE (Qt dependency for rendering; not tried here).
- **score-parser** (npm `@jbfullstack/score-parser`). "Parse MIDI and Guitar Pro files into a clean, format-neutral
  JSON structure."; peer dependencies `@tonejs/midi` and `@coderline/alphatab` (README of
  https://github.com/jbfullstack/score-parser, last commit 2026-03-26). npm 1.0.1 (2026-03-26), `MIT`; LICENCE "MIT
  License Copyright (c) 2026 jbfullstack". RUNNABLE. (verifier, 2026-11-10) The README installs and imports it as
  `score-parser` (`npm install score-parser @tonejs/midi @coderline/alphatab`, `import { parseFile } from
  "score-parser"`); on npm, `score-parser` is a different package (0.0.1 of 2018-06-05, `repository` "score-parser"),
  and this project is published as `@jbfullstack/score-parser`. Its README table: MIDI via `@tonejs/midi` ("Key
  signatures not extracted; multi-channel tracks use first channel"), Guitar Pro via `@coderline/alphatab` ("Volta
  brackets (1st/2nd ending) not expanded"). Because it renders nothing, alphaTab's attribution page applies as quoted
  in the alphaTab section ("the built-in mark does not appear, but the license still applies").
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
| Songshed (danjutan/Songshed) | "Songshed is a proof-of-concept for a grid-based guitar tab editor." | 2026-02-16 | no LICENSE file at the root (2026-11-10 clone); no `license` field in package.json | yes: a Nuxt app (package.json `"nuxt": "^4.3.1"`, `"vue": "^3.5.13"`; dependencies include `@tombatossals/chords-db` and `tonal`) (verifier, 2026-11-10) |
| tab-editor (calesce/tab-editor) | "Guitar Tab Editor"; "This uses the Web Audio API for playback. Thanks to soundfont-player" | 2017-11-02 | MIT text ("Copyright (c) 2015 Cale Newman") | yes |
| SLiMTAB (tim37021/SLiMTAB) | "SLiMTAB is a brand new guitar tab editor. And it is open source."; "requires Node.js" | 2017-06-17 | CC0 1.0 Universal | no: an Electron app (package.json `"start": "electron ."`, `"electron": "~1.6.2"`, `"license": "CC0-1.0"`) (verifier, 2026-11-10) |
| Guitar (1j01/guitar) | "a virtual guitar record-a-synthesize-amatronic web application" | 2023-05-02 | MIT ("Copyright (c) 2018 Isaiah Odhner") | yes |
| Power Tab Editor 2.0 (powertab/powertabeditor) | "A powerful cross platform guitar tablature viewer and editor"; desktop, "Cross platform - Windows, Mac, & Linux" | 2026-11-01 | GPL-3.0 (COPYING) | no (desktop) |
| tuitar (cod-e-codes/tuitar) | "A terminal-based guitar tablature editor built with Go and Bubble Tea"; "Karplus-Strong string synthesis" | 2025-09-28 | MIT | no (terminal) |

## Added by the verifier (2026-11-10): packages from 2025 and 2026

Found by searching the npm registry on 2026-11-10 (`https://registry.npmjs.org/-/v1/search?text=...` for "guitar pro",
"tablature", "guitar tab", "alphatex"). Versions, dates and license fields from `https://registry.npmjs.org/<name>`;
README and LICENSE text from `raw.githubusercontent.com` at the default branch, or from the registry's `readme` field
where noted; last commit from a `git clone --depth 1 --filter=blob:none` on 2026-11-10. None of them was run here.
Saved copies: `/home/user/gtr/lanes/web-tab-render/verify/fetched/new/`.

| Package (repository) | What its README says | npm latest (date); first published | Last commit | License |
|---|---|---|---|---|
| `tutts` and `tutts-alphatab` (madisonrickert/tutts) | "**tutts** is a TypeScript port of tuttut, Nathan Candre's Python library that turns MIDI into playable guitar tablature. It frames fingering as a Hidden Markov Model (fretboard positions are hidden states, note onsets are observations) and uses the Viterbi algorithm" (link markup dropped); `tutts-alphatab`: "Pure adapter mapping `TabData` → alphaTex for rendering with alphaTab. Full polyphony, tuplets, ties, rests."; call: `generateTab({ notes: [{ midi: 64, startBeats: 0, durationBeats: 1 }, ...], tuning: Tuning.standardGuitar() })`, then `toAlphaTex(tab.data, { title: "Demo", tempo: 120 })` | 0.1.0 (2026-06-09) for both; first 2026-06-09 | 2026-06-09 (527ad0e) | npm `MIT`; LICENSE: "MIT License Copyright (c) 2026 Madison Rickert tutts is a TypeScript port of tuttut (https://github.com/natecdr/tuttut), Copyright (c) 2023 Nathan Candre, distributed under the MIT License." |
| `@holm/asciitabs-to-gp` (holm/asciitabs-to-gp) | "Convert ASCII guitar tabs to Guitar Pro 7/8 `.gp` files from Node.js."; "Parse 6-string ASCII guitar tabs into a normalized intermediate representation"; "Emit alphaTex and export Guitar Pro 7/8 files through `@coderline/alphatab`"; library `parseAsciiTab`, `toAlphaTex`, `toGuitarPro`; CLI `asciitabs convert ./song.txt ./song.gp` | 0.1.0 (2026-03-25); first 2026-03-25 | 2026-03-25 (8e20caf) | npm `MIT`; LICENSE "MIT License Copyright (c) 2026 Christian Holm" |
| `@tabkit/core`, `@tabkit/parser`, `@tabkit/player`, `@tabkit/react`, `@tabkit/audio` (juliocarneiro/tabkit) | "Modern, responsive SVG tablature renderer for any stringed instrument. Zero dependencies, ~5KB gzipped." (the authors' size figure); package table: `@tabkit/parser` "Parse ASCII tabs and MusicXML into JSON", `@tabkit/player` "Playback engine with cursor sync and metronome", `@tabkit/react` "React components and hooks — TabSheet, TabPlayer, TabEditor", `@tabkit/audio` "Web Audio API synthesis — play notes during playback"; features include "Interactive editor — click on fret positions to build tabs visually (browser)" and "Export — PNG, SVG data URL, or direct file download" | core, audio, player, react 0.1.3 (2026-03-12); parser 0.1.4 (2026-03-12) | 2026-03-11 (8dfd46b) | npm `MIT`; LICENSE "MIT License Copyright (c) 2025 Julio Carneiro" |
| `ascii-tabs` (libasoles/ascii-tabs) | "A zero-dependency web component for editing and displaying guitar tablature, with plain ASCII import and export."; `import 'ascii-tabs'` defines `<ascii-tabs>`; `import { parse, format } from 'ascii-tabs'` | 0.11.3 (2026-11-04); first 2026-10-28 | 2026-11-03 (316ffcf) | npm `MIT`; LICENSE "MIT License Copyright (c) 2026 libasoles" |
| `@zklau/sunett-engine` and `@zklau/sunett-react` (zKlau/SuNett-engine); `sunett-parser` (zKlau/SuNett-parser-wasm) | "Monorepo for **SuNett**, a browser library that renders Guitar Pro tablature as SVG."; npm description of the engine: "Render guitar tablature as SVG in the browser from parsed Guitar Pro song data."; the `sunett-parser` README carries the "Guitar Pro Tools" README text of slundi/guitarpro (core library `scorelib`, "GP3, GP4, GP5, GPX, GP7") | engine 1.2.2 (2026-10-25), first 2026-08-16; react 0.1.0 (2026-10-11); parser 0.0.7 (2026-10-13) | engine 2026-10-25 (45c62ea); parser 2026-10-14 (d673020) | npm `MIT` (all three); engine LICENSE "MIT License Copyright (c) 2026 Claudiu Padure"; parser LICENSE "The MIT License (MIT)" without a copyright line in the part read |
| `@danzw777/tab-score` (danzw1995/guitar-app, directory `tools/tab-score`) | registry `readme` (in Chinese): "把吉他六线谱（alphaTex 文本、JSON，或者手写的 ASCII 六线谱）渲染成图片：一个不依赖浏览器的命令行工具，也是一个可以直接 import 的库。" (verifier's gloss: renders guitar tab from alphaTex, JSON or hand-written ASCII tab to an image; a command-line tool that needs no browser, and an importable library); "输出 PNG（默认 2 倍像素）或 SVG" (output PNG or SVG); dependencies `@coderline/alphatab` and `@coderline/alphaskia`; CLI `tab-score song.tex --format svg -o song.svg` | 0.8.2 (2026-11-10); first 2026-11-10 | 2026-11-10 (21c8869) | npm `MIT`; no LICENSE file found at the repository root (LICENSE, LICENSE.md, LICENSE.txt, LICENCE, COPYING tried). Renders scores with alphaTab, so the alphaTab attribution terms above apply to its output |
| `expo-alphatab` (juapperez/expo-alphatab) | "Render and play **Guitar Pro, MusicXML and alphaTex** scores in an Expo / React Native app, offline, using alphaTab inside a WebView." and "Playback with a soundfont, cursor, speed control, looping, metronome, count-in, per-track mute and solo." (link markup dropped) | 0.1.0 (2026-10-20); first 2026-10-20 | 2026-10-19 (24ec2b8) | npm `MIT`; LICENSE "MIT License Copyright (c) 2026 Juan Pablo Pérez" |
| `@fretfall/player` (fretfall/player) | "An arcade-style note highway for Guitar Pro and MusicXML tabs, in the browser — with a tablature and a notation page beside it."; "**Formats**: `.gp`, `.gp3`–`.gp5`, `.gpx`, `.musicxml`, `.mxl`, plus `.mp3`, `.m4a`, `.ogg`, `.wav`, `.flac` recordings"; "Add the band's recording and the player lines the tab up with it on its own." | 0.5.0 (2026-10-16); first 2026-09-16 | 2026-10-16 (ed2bc3b) | npm `MIT`; LICENSE "MIT License Copyright (c) 2026 Angelo Dini" |
| `@hidechae/eztab-mcp` (repository field github.com/hidechae/eztab, directory `mcp`) | registry `readme`: "An MCP server that lets an AI agent (e.g. Claude) build and edit guitar/bass tablature using EZTab's data model." (link markup dropped); the README says, in Japanese, that `get_tab` returns an ASCII rendering and that `send_to_eztab` posts the result to the EZTab app's inbox; library access needs an `EZTAB_TOKEN` issued in the app | 0.5.2 (2026-10-25); first 2026-05-31 | not read: `git clone` of github.com/hidechae/eztab failed with an authentication error (repository not public on 2026-11-10) | npm `MIT`; LICENSE not readable (repository not public) |

## HAYA-TAB (added in gap round 2)

Read 2026-11-11 (UTC date from `date -u +%F`) from `raw.githubusercontent.com` and from a blobless clone with full
history (`git clone --filter=blob:none --no-checkout https://github.com/HAYASAKA7/HAYA-TAB.git`, in
`/home/user/gtr/lanes/web-tab-render/repos/HAYASAKA7_HAYA-TAB`); saved copies in
`/home/user/gtr/lanes/web-tab-render/fetched/gap2/haya-tab/`. Not run here (trials.md, "Gap round 2").

- **What it is.** "Organize, read, play, and sync your music tabs from one lightweight desktop app." and, under
  "HAYA-TAB helps musicians:", "Keep PDF, Guitar Pro, and MusicXML files in one searchable library.", "Practice
  without leaving the app using built-in PDF and AlphaTab viewers." and "Carry the same organized library between
  computers through WebDAV." (README, https://raw.githubusercontent.com/HAYASAKA7/HAYA-TAB/main/README.md). "HAYA-TAB
  is a cross-platform desktop application built using the Wails framework, combining a Go backend with a modern web
  frontend (Vue 3 + Vite)." (`docs/ARCHITECTURE.md`, link markup dropped); `go.mod` requires
  `github.com/wailsapp/wails/v3 v3.0.0-alpha.74`. The README's platform badge URL encodes the text "platform-Windows |
  macOS | Linux", and the README points to GitHub Releases for builds ("Download the current build for your operating system from GitHub Releases.", link
  markup dropped); github.com pages answer 403 from this box, so the release files were not listed.
- **Repository and versions.** https://github.com/HAYASAKA7/HAYA-TAB, default branch `main` (`git ls-remote`: HEAD at
  eb0466a). First commit bf61c77 "Initial commit", 2026-02-09T10:11:03+08:00 (author and committer date; the date the
  GitHub repository was created was not visible from here); last commit on `main` eb0466a "chore: ignore generated
  local artifacts", 2026-07-31T13:39:12+08:00; 276 commits on `main`. Tags v1.1.0 (2026-02-09) to v3.1.8
  (2026-07-31). `CHANGELOG.md` begins with "## [3.1.7] - 2026-07-27"; `frontend/package.json` says `"version":
  "3.1.7"`. Six feature branches, among them `feat/ios-native` and `feature/mobile-devices`.
- **Formats** (README table "Supported formats"): "PDF | `.pdf` | Reader, auto-scroll, and non-destructive
  annotations"; "Guitar Pro | `.gp`, `.gp5`, `.gpx` | Notation, playback, looping, section playback, and speed
  control"; "MusicXML | `.xml`, `.musicxml`, `.mxl` | Notation and playback through AlphaTab". The open-file dialog in
  `internal/app/app_files.go` filters `"*.pdf;*.gp;*.gp3;*.gp4;*.gp5;*.gpx;*.xml;*.musicxml;*.mxl"`, and the changelog
  has "Extended Format Support: Added support for Guitar Pro versions 3 and 4 (.gp3, .gp4) format detection for webDAV
  sync and viewer loading" (Markdown bold dropped). No format is written: no export of tab content was found (below).
- **The tab viewer is alphaTab.** `frontend/package.json` depends on `"@coderline/alphatab": "^1.3.1"`;
  `frontend/package-lock.json` resolves it to 1.8.1 (`license` MPL-2.0); `frontend/src/composables/useAlphaTab.ts`
  creates `new alphaTab.AlphaTabApi(...)` and sets `playbackSpeed`, `isLooping` and `playbackRange`. README: "Open
  Guitar Pro and MusicXML files with AlphaTab to view notation, play parts, loop sections, and adjust playback speed
  while you practice." The license facts of the alphaTab code it ships are in the alphaTab section above.
- **Does it edit tabs?** In the source at eb0466a, no file under `frontend/src` calls an alphaTab exporter
  (`Gp7Exporter`, `AlphaTexExporter`) or sets a note's string or fret (`git grep`; the only "editor" hits are PDF.js
  annotation-editor buttons in `PdfViewer.vue`). Its edit dialog (`EditTabModal.vue`) edits library metadata: title,
  artist, album, type, tag, country, language. PDFs get "pen or highlighter notes on a non-destructive layer that
  leaves the original score untouched" (README). So: tab content is viewed and played, not edited, in this version.
  The README also lists "extend metadata workflows with JavaScript plugins" (the Go backend requires the goja
  JavaScript engine).
- **How a program calls it:** a desktop program; no command line or library interface for tab content was found in
  the README or the architecture document.
- **LICENSE FACTS** (read 2026-11-11): a. Code: `LICENSE`
  (https://raw.githubusercontent.com/HAYASAKA7/HAYA-TAB/main/LICENSE, 11,341 bytes, identical on `master`) is the
  Apache License text, "Apache License Version 2.0, January 2004 http://www.apache.org/licenses/"; its section 2: "Grant
  of Copyright License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a
  perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare
  Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative
  Works in Source or Object form."; section 4(d): "If the Work includes a "NOTICE" text file as part of its
  distribution, then any Derivative Works that You distribute must include a readable copy of the attribution notices
  contained within such NOTICE file"; the appendix filled in as "Copyright 2026 Ai Hayasaka". `NOTICE`
  (https://raw.githubusercontent.com/HAYASAKA7/HAYA-TAB/main/NOTICE): "HAYA-TAB Copyright 2026 Ai Hayasaka" and "This
  product includes software developed by Ai Hayasaka (https://github.com/HAYASAKA7/HAYA-TAB)." README: "HAYA-TAB is
  available under the Apache License 2.0. See NOTICE for attribution information." (link markup dropped).
  `frontend/package.json`: `"license": "Apache-2.0"`. Bundled alphaTab 1.8.1: MPL-2.0 (lockfile). b, c. No model
  weights, no training data.
- **Measurements by the authors:** none found in the pages read.

## Not covered

Seen in the same npm search or in the web search on 2026-11-10 and not examined further. One line each, from the
registry entry or the page named.

- `keyjockey` (npm 0.1.0, 2026-08-26, https://www.npmjs.com/package/keyjockey): "Read guitar tablature and convert
  notes: eight tunings, capo offsets, MIDI and frequency." Its LICENSE begins "MIT License" and then "EXCEPTION:
  Key-J is not covered by this licence. Everything under keyj/ is governed by keyj/LICENSE, from Key-J version 1.6.0
  onward." (keyj/LICENSE not read).
- `@musicbird/gp-parser` (npm 0.0.1, 2026-01-10, `AGPL-3.0-or-later`): "Guitar tablature files parser (.gp3, .gp4,
  .gp5)"; its repository github.com/MusicBirdProject/musicbird-gp-parser could not be cloned (authentication error).
- `aibandtab` (npm 1.0.9, 2025-01-13): "aibandTab is a music notation and guitar tablature rendering library"; npm
  `license` field "Inter AI", no repository field.
- `vexflow_smoosic` (npm 4.2.17, 2026-09-22, repository field https://github.com/smoosic/vexflow_smoosic): a VexFlow
  fork under the smoosic organisation, with VexFlow's own description ("A JavaScript library for rendering music
  notation and guitar tablature.").
- `@ukegeeks/song-formatter` (npm 1.0.0-beta.1, 2026-11-05): "Convert ChordPro markup text to HTML with chord
  fingering diagrams".
- `tonal-guitar` (npm 0.4.0, 2026-09-30): "Guitar fretboard, shapes, patterns, and sequences — built on Tonal.js".
- `vexflow-react-native-svg` (npm 1.0.3, 2025-12-18): "React Native SVG rendering backend for VexFlow".
- `guitar-pro-api` (npm 0.0.1, 2025-06-28): "An easy to use guitar pro file reader, exporter and compiler."
- MNX: the Music Notation Community Group page (https://www.w3.org/community/music-notation/, read 2026-11-10) says
  "The group is developing a new specification to embody this broader set of use cases and technologies, under the
  working title of MNX." and lists an "MNX Specification Working Group meeting: November 3, 2026". The site
  https://mnx.formats.music/ is drawn by JavaScript and its static HTML has no content, so whether MNX encodes
  tablature was not checked (UNVERIFIED).

## Handoff facts

Each line: what one side outputs, what the other side accepts, with the source of each half. "(this file, X)" points
to the section above where the quote and URL are; other lanes' files are named by path and section (line numbers in
other lanes' files change while those files are edited). Run ids (`rNNNN`) and eval ids (`eNNNN`) are from this lane's
`trials.md`. All read 2026-11-10. Checked line by line by the verifier on 2026-11-10; lines it changed or added are
marked "(verifier)".

String and fret numbering (needed by any converter between these formats):

- MusicXML `<string>` "String numbers start with 1 for the highest pitched full-length string" and `<fret>` "Fret
  numbers start with 0 for an open string" (https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/string/,
  .../fret/), while `<staff-tuning line="...">` lines are "numbered from bottom to top" (.../staff-tuning/), i.e. tuning
  line 1 is the lowest string and `<string>1</string>` is the highest.
- alphaTex `fret.string`: "String 1 is the top string when you read tab — the thinnest string on a guitar, sounding
  highest." (this file, alphaTab).
- (verifier) alphaTab's data model counts the other way: `Note.string` "1 is the lowest string on the guitar and the
  bottom line on the tablature", while `Staff.stringTuning` lists "the most top tablature line" first (this file,
  alphaTab; the try lane converted with `string = number_of_strings - note.string + 1`, trials.md Run 1).
- MEI: `tab.course` with course `n` "counting from the course closest to the player’s feet when the instrument is
  played"; `tab.fret` "0 ... refers to an unstopped, open course" (this file, MEI).
- LilyPond: "By default, string 1 is the highest string" (this file, LilyPond).
- PyGuitarPro: default `Track.strings` `(1, 64) ... (6, 40)`, string 1 = MIDI 64 (this file, PyGuitarPro).
- guitarpro-parser: `note.string; // 0-based, 0 is the highest string` (this file, "more parsers").
- abcjs `tuning` array: "starting from the lowest pitch of the instrument" (this file, abcjs).
- react-guitar `strings` prop: array of frets per string, "`0` means open string and `-1` muted" (this file); (verifier)
  first element = highest string, from the README example "`[0, 1, 2, 2, 0, -1]` is an `A minor`".
- (verifier) VexFlow `TabNote` positions `{ str, fret }`: `src/tabnote.ts` treats `string === 1` as the top line of the
  TAB staff (this file, VexFlow).
- (verifier) chords-db `frets` strings run from the lowest string to the highest in the data files (`'x32010'` for C
  major; tuning `['E2', 'A2', 'D3', 'G3', 'B3', 'E4']`); its README example `'0320xx'` is written the other way (this
  file, chords-db).
- (verifier) vexchords and svguitar chord arrays use string 1 for the highest string, as read from their README
  examples: vexchords "Draw an open D7" is `[[1, 2], [2, 1], [3, 2], [4, 0], [5, 'x'], [6, 'x']]` (D7 = xx0212 from
  the lowest string); svguitar's Fm example is `[6, 1], [5, 3], [4, 3], [3, 1], [2, 1], [1, 1]` with `barres: [{
  fromString: 6, toString: 1, fret: 1 }]` (https://raw.githubusercontent.com/0xfe/vexchords/master/README.md,
  https://raw.githubusercontent.com/omnibrain/svguitar/master/README.md).

Within this lane:

- alphaTab `Gp7Exporter` outputs a `.gp` ZIP with `Content/score.gpif` (alphaTab docs: "Guitar Pro 7 and Guitar Pro 8
  both open the resulting file"), which guitarpro-parser ("Reads `.gp` (Guitar Pro 7 and 8)"), TuxGuitar ("open ...
  7 (GP) files"), MuseScore Studio 4 (`gp` in its reader list on `main`), webmscore (`'gp'`) and Soundslice's upload
  ("Guitar Pro") list as input (this file, those sections). (verifier) Run: alphaTab re-imported its own `.gp` with
  90/90 notes on the same string and fret (r0020, e0005); TuxGuitar 1.5.6 read it with 90/90 (r0224, e0477) and
  webmscore read it (r0290); MuseScore 3.2.3 refused it, "unknown file suffix <gp>" (r0178), and guitarpro-parser
  2.0.0 refused it, "staff 1 of track 0 has a FretCount property without <Number>." (r0298). Soundslice was not run.
- alphaTab `AlphaTexExporter` outputs alphaTex text, which alphaTab's `tex()` / `{ tex: true }` and the Tab Flow
  Obsidian plugin (".atex files") accept (this file, alphaTab, alphaTex). (verifier) Run: alphaTab re-imported its own
  alphaTex export with 90/90 on the same string and fret (e0006, e0010, e0016).
- PyGuitarPro `guitarpro.write(song, 'x.gp5')` outputs GP5 with per-note `string`/`value` (fret), `Track.offset`
  (capo) and `Track.strings` (tuning), which alphaTab, TuxGuitar, MuseScore, webmscore, Power Tab Editor,
  guitarpro-parser, ApolloTab and the Rust `guitarpro` crate read as `.gp5` (parser table above). (verifier) Run on
  `.gp5` inputs: alphaTab 1.9.0 read capo 2 and Drop D tuning from the S5 files (e0008, e0012); TuxGuitar 1.5.6 and
  guitarpro-parser read them with capo and tuning (e0463, e0470; e1103, e1105); MuseScore 3.2.3 read the notes (r0120)
  but turned the capo into a staff text (r0176). PyGuitarPro's own output: GP5 kept 90/90 (e0574), GP4 and GP3 kept
  the first voice only, 42/90 (e0578, e0581); an edited GP5 (a moved note, capo 1, Drop D) was read by alphaTab with
  those changes (trials.md, PyGuitarPro section).
- alphaTab outputs Standard MIDI File 1.0 (`MidiFileGenerator`, "tempo map, time signatures, program changes, note
  on/off with expression and pitch bend"), which webmscore (`'midi'` input), MuseScore ("MIDI (SMF) import") and
  Flat's REST API ("Creating and importing new music scores using MusicXML or MIDI files") accept. alphaTab's own
  "Reads" list has no MIDI entry (README), so MIDI does not go straight into alphaTab. (verifier) Run: alphaTab's MIDI
  of S2n is format 0, 960 ticks per quarter, 90 notes, onset F1 1.0 against the truth (e0007).
- (rewritten by the verifier) MusicXML out of MuseScore depends on what went in. From a `.gp5`, MuseScore 3.2.3's
  `-o out.musicxml` had no `<technical><string>/<fret>`, no `<staff-tuning>` and no TAB clef (r0120, e0141), and OSMD
  drew that file with no TAB staff (r0163). From MusicXML that has a TAB staff, MuseScore 3.2.3 kept the TAB staff,
  `<staff-tuning>` and string and fret (r0179, e0367 90/90) but dropped `<capo>` and moved notes (r0180, e0368). The
  documented readers of MusicXML tab are alphaTab ("string and fret from `technical`"), OSMD ("Can display tablature
  (guitar tabs) from MusicXML") and Verovio ("Preliminary support for tablature MusicXML import"); OSMD drew the
  reference TAB MusicXML with string and fret on all 90 notes (r0158, r0160) and Verovio converted it to MEI tab with
  90/90 on the same string and fret (r0166, e0363); alphaTab read it with 90/90 (e0843). webmscore's MusicXML export
  behaved like MuseScore 3.2.3 for Guitar Pro input (no `<string>`/`<fret>`, e0990), and for TAB MusicXML input it
  wrote `<staff-tuning>` one octave high with 0/90 on the truth's string and fret (e1009). TuxGuitar 1.5.6's MusicXML
  export writes pitches and `<staff-tuning>` one octave high, and alphaTab read it with a tuning one octave high
  (e0460, e0860).
- music21 writes `<technical><string>/<fret>` from `articulations.StringIndication` / `FretIndication`
  (`musicxml/xmlObjects.py`), and its MusicXML writer has `# TODO: staff-tuning` and `# TODO: capo` (`m21ToXml.py`
  lines 7263-7264), so a capo or non-standard tuning set in music21 is not written as `<capo>` / `<staff-tuning>` by
  that code path. (verifier) Run: music21 10.5.2 wrote string and fret on all 90 notes and no `<staff-tuning>` or
  `<capo>` (r0153, r0154); OSMD drew the tab-only file (r0161); alphaTab read it as one staff with `showTablature`
  false and no string or fret (r0278, e0908); MuseScore 3.2.3 logged "no instrument found for part"
  and wrote a file whose six `<staff-tuning>` are all C-1 (MIDI 0), 4/90 on the same string and fret (r0181, e0369).
- Soundslice API `GET /api/v1/slices/SCOREHASH/musicxml/` outputs MusicXML ("our own MusicXML exporting algorithm"),
  which alphaTab, OSMD, MuseScore, Verovio accept as MusicXML (this file). Not run (service, account needed).
- (rewritten by the verifier) Flat's REST API exports the user's scores "for example in MP3, WAV or MIDI" and its OMR
  outputs "MusicXML or MIDI" (Flat section). The MIDI is accepted by MuseScore ("MIDI (SMF) import") and webmscore
  (`'midi'`); the MusicXML by alphaTab, OSMD, Verovio and MuseScore. Not run (service, account needed).
- (rewritten by the verifier) chords-db positions give `frets` as one character per string from the lowest string to
  the highest in the data files (chords-db section); react-guitar's `strings` array starts with the highest string
  (react-guitar section). Going from chords-db to react-guitar therefore reverses the order and maps `x` to `-1` and
  letters (`a` = 10) to numbers; vexchords and svguitar take `[string, fret]` pairs with string 1 the highest (above;
  the try lane drew G and Bm with both, string 1 = highest, r0253, r0259). No chords-db conversion was run.
- ChordSheetJS `ChordProParser` parses ChordPro including `{start_of_tab}` blocks, which ChordPro's spec defines as
  "guitar TAB instructions. The lines will not be folded or changed" (this file, ChordPro, ChordSheetJS): ASCII tab
  inside a ChordPro file travels as opaque text.
- (gap round 2) The `@coderline/alphatab-monaco` editor holds alphaTex text, which alphaTab's `api.tex()` reads (this
  file, alphaTab, "The Monaco package and the language server"). Run: a fret, a string and `\capo 2` typed in Monaco
  were drawn by alphaTab and kept in its GP7 export; read back, 89/90 matched and 88/89 on the truth's string and fret,
  the one difference being the moved note (r0614, r0618, e1780, e1784).
- (gap round 2) abcjs's clickListener outputs the clicked note's `startChar`/`endChar` in the ABC text and a drag
  `step`, which the application's own code has to turn into an edited ABC string for `renderAbc` (this file, abcjs,
  "Clicking and dragging"). Run: r0598, e1763.
- (gap round 2) Verovio's `edit()` changes MEI `tab.course`/`tab.fret`; its `getMEI()` output, read by this lane's
  `mei_tab_to_json.py`, carried the change (r0626, r0627, e1827).

To and from neighbouring lanes:

- Tab generators in the guitar-tab lane that output `.gp5` (Guitab "solo steel-string fingerstyle audio to .gp5";
  Audio2Tab "Whisper-small fine-tuned to .gp5", per `lanes/guitar-tab/survey.md`, tool list items 1 and 10 and the
  sections "Guitab" and "Audio2Tab (Loth)") produce a file that alphaTab, TuxGuitar, MuseScore, webmscore,
  guitarpro-parser and PyGuitarPro read as GP5 (parser table above). (verifier) Not run with those tools' output here;
  alphaTab's GP5 reading was run on the shared inputs (e0004, e0008, e0012).
- A string-and-fret assigner that outputs per-note (string, fret, onset, duration) can be written as alphaTex
  (`fret.string` with `:4`/`:8` durations, `\tuning`, `\capo`) or as MusicXML `<technical><string>/<fret>` with
  `<staff-tuning>` and `<capo>`, both of which alphaTab loads (alphaTex syntax and MusicXML import docs, this file).
  (verifier) Run: alphaTex written from the truth JSON parsed with 90/90 on the same string and fret and capo 2 kept
  (r0043, r0045, r0046; e0024, e0026, e0028).
- Notes without strings (MIDI pitches from the audio-to-notes lane, e.g. tools that "export them to MIDI", per
  `lanes/audio-to-notes/survey.md`, section "11. MELODIA Vamp plugin and `audio_to_midi_melodia`") can be given string
  and fret by LilyPond's TabStaff ("LilyPond tablature automatically calculates the fret for a note based on the
  string to which the note is assigned"; options `stringTunings`, `minimumFret`, `restrainOpenStrings`, string-number
  indications) or drawn as tab by abcjs from ABC pitches (`tablature` with `tuning` and `capo`) (this file, LilyPond,
  abcjs). Neither documents an optimiser for playability beyond those rules (pages read). (verifier) Run: LilyPond
  2.24.3's own string choice gave the truth's string and fret for 90/90 matched notes of S2n (e0399) and for 104/188,
  33/70 and 127/145 matched notes of three GuitarSet clips read with `--ignore-time` (e0416, e0417, e0418). abcjs's
  tablature expects ABC at written guitar pitch, one octave above the sounding pitch: at sounding pitch 42 of 90
  positions were drawn as "?" (r0239); one octave up, 88/90 matched by order and 88/88 on the truth's string and fret
  (r0241, e0638). (verifier) Also found: `tutts` + `tutts-alphatab` (npm, 2026), a TypeScript
  port of tuttut that picks fingerings with an HMM/Viterbi and writes alphaTex ("Added by the verifier" below; not run).
- Downbeat times in seconds (All-In-One's JSON "downbeats" (seconds), `lanes/chords-beats-key/survey.md`, section
  "All-In-One (`allin1`): tempo, beats, downbeats, sections")
  map onto alphaTab's `FlatSyncPoint { barIndex, barPosition, barOccurence, millisecondOffset }`, where
  `millisecondOffset` is "the audio timestamp in milliseconds this point maps to" and `barPosition` "a `0..1` ratio
  inside the bar", applied with `score.applyFlatSyncPoints(list)` and `api.updateSyncPoints()`
  (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/website/docs/features/play-sync/sync-points-at-runtime.mdx),
  with the player in `PlayerMode.EnabledBackingTrack` for an audio file or, for a video, `PlayerMode.EnabledExternalMedia`
  with an `IExternalMediaHandler`
  (".../play-sync/video-sync.mdx": it "exposes `backingTrackDuration`, `playbackRate`, `masterVolume`, `seekTo`,
  `play`, and `pause`"). Soundslice's API has the equivalent "Set recording’s syncpoints" endpoint (Soundslice section).
  Not run here.
- Tempo (BPM) from the chords-beats-key lane maps to alphaTex `\tempo` (example `\tempo 196`, alphaTex introduction)
  and MusicXML `sound`/`metronome` markers ("Tempo and tempo changes — read from `sound` and `metronome` markers",
  alphaTab MusicXML import doc).
- User constraints from the UI (capo fret, tuning) have a field in each format: MusicXML `<capo>` and
  `<staff-tuning>`; alphaTex `\capo` and `\tuning`; MEI `<tuning>`/`<course>` (no capo element in the v5 tablature
  chapter); PyGuitarPro `Track.offset` and `Track.strings`; abcjs `capo` and `tuning` options; LilyPond
  `stringTunings` (capo only in fret diagrams). Sources in the sections above. (verifier) Also: alphaTab's model
  `Staff.capo` and `Staff.stringTuning`; VexTab `tabstave tuning=` (no capo option in its tutorial); abc2svg
  `capo.js` and `%%strtab <string list>`. Run: the capo did not survive Verovio's MusicXML-to-MEI conversion (r0174)
  or MuseScore 3.2.3's MusicXML round trip (r0180); music21's writer has no capo code (source `# TODO: capo`; not run
  with a capo); alphaTab kept it through `.gp` and alphaTex (e0009, e0010).
- Count-in and metronome for practice playback: alphaTab "Before the song starts, the count-in taps out one bar ...
  during playback, the metronome keeps clicking on every beat"
  (https://raw.githubusercontent.com/CoderLine/alphaTab/develop/website/docs/features/play-sync/count-in-and-metronome.mdx);
  the browser-audio-sync lane covers the clock side. (verifier) Run: in headless Chromium alphaTab emitted 52
  metronome events (13 bars x 4 beats) with a median spacing of 530.4 ms against a nominal 535.7 ms, page event times
  without an audio device (r0128).
- Rendering positions for cursor sync: MuseScore CLI outputs `mpos` "measure positions (XML)" and `spos` (handbook
  extension list); webmscore can "Generate position information of measures or segments on the generated sheets";
  Verovio has `RenderToTimemap` (Verovio section). (verifier) Run: Verovio's timemap carried `qstamp`, `tstamp` (ms)
  and `tempo` with the ids of the notes switched on and off (trials.md, Verovio section, r0165).

## Where the raw sources are

- Registry summaries made by `scripts/npm_summary.py` from https://registry.npmjs.org on 2026-11-10:
  `samples/docs-registry/npm_summary.tsv`. Newest-commit date and hash of every repository cloned for this survey
  (`git clone --depth 1 --filter=blob:none`): `samples/docs-registry/last_commits.tsv`.
- Saved copies of the pages and files quoted above (untrusted downloads, kept out of git):
  `/home/user/gtr/lanes/web-tab-render/fetched/` (npm and PyPI JSON, READMEs, LICENSE files, docs pages, terms
  pages) and the blobless clones in `/home/user/gtr/lanes/web-tab-render/repos/`. `scripts/html2text.py` turns a
  saved page into the text that was searched.
- Verifier (2026-11-10): every source re-fetched by `scripts/verify/fetch_sources.py` from the list
  `scripts/verify/sources.tsv` into `/home/user/gtr/lanes/web-tab-render/verify/fetched/src/` (raw bytes and text;
  `status.tsv` there has the HTTP code of each fetch); quotes compared by `scripts/verify/check_quotes.py`; registry
  facts re-read by `scripts/verify/registry_check.py`; packages found in the completeness pass by
  `scripts/verify/new_tools.py` into `verify/fetched/new/`; the Flat embed page rendered by
  `scripts/verify/render_text.cjs` into `verify/rendered/flat_embed.txt`. Result tables:
  `samples/verify/quote_check_original.tsv` (the survey as written: 316 EXACT, 23 MARKUP, 10 TYPO, 66 NOTFOUND),
  `samples/verify/quote_check_final.tsv` (after the corrections: 470 EXACT, 30 MARKUP, 0 TYPO; its NOTFOUND rows are
  text between quotes and quotes whose source is trials.md, a git commit, a ledger or a registry field, all checked by
  hand), `samples/verify/registry_now.tsv`, `samples/verify/lsremote.tsv`, `samples/verify/fetch_status.tsv`.
- Gap round 2 (2026-11-11): the abcjs docs pages (render options, Selecting and Dragging, Click Listener), the npm
  registry entries of `@coderline/alphatab-monaco`, `@coderline/alphatab-language-server`, `monaco-editor` and their
  dependencies, the alphaTab monorepo files of `packages/monaco` and `packages/ui/src/editor` (at `develop` and at
  commit ec751a23), and HAYA-TAB's README, LICENSE and NOTICE are saved in
  `/home/user/gtr/lanes/web-tab-render/fetched/gap2/` (untrusted downloads, kept out of git); the HAYA-TAB clone is
  `/home/user/gtr/lanes/web-tab-render/repos/HAYASAKA7_HAYA-TAB`.

## Verification log (verify-docs-web-tab-render, 2026-11-10)

Done by re-fetching every cited source on 2026-11-10 (187 fetches, 184 with HTTP 200; the three 404s are the two
MIDI.js LICENSE paths the survey already reported as absent, and an MNX page; `samples/verify/fetch_status.tsv`;
plus the npm entries, READMEs and LICENSE files of 15 packages found in the completeness pass),
comparing each quoted string with the fetched text (`scripts/verify/check_quotes.py`, whitespace collapsed; a second
level ignores Markdown/HTML markup; a third also folds curly quotes and dashes), and reading by hand every quote that
did not match. Nothing was installed or run except the fetches, `git ls-remote` and shallow blobless clones, and one
headless-Chromium page load of https://flat.io/embed. trials.md was read as it stood at 21:49 UTC.

Tally:

| Check | Count |
|---|---|
| License and terms quotes in the survey as written (LICENSE FACTS, TERMS FACTS, SoundFont, format-license, pricing lines; grouped as quoted) | 102 |
| ... confirmed verbatim at the URL given (whitespace, Markdown/rST markup, joined list items or layout characters aside) | 97 |
| ... corrected (a space before a full stop or comma, not on the page: Soundslice embed, API-key and Basic-Auth sentences; Flat embed-plan and Privacy-Policy sentences) | 5 |
| ... wrong URL / unverifiable | 0 / 0 |
| All double-quoted strings extracted from the survey as written (automated pass) | 415 |
| ... found verbatim (316), with markup-only differences (23) or with typographic differences (10) | 349 |
| ... not found automatically: real quotes confirmed by hand (commit messages, package.json descriptions, MDX front matter, headings, `\n` escapes in `.info` files, rST and list markup, npm registry field) | 16 |
| ... not found automatically: real quotes corrected (Verovio Python code with inserted spaces x3; LilyPond quote missing the word "tablature"; Wikipedia "way[s]" is "ways"; abcjs default tuning array spacing) | 6 |
| ... not found automatically: text between two different quotes, or the survey's own labels (pairing artifacts) | 44 |
| Quotes corrected in total (6 above, 10 typographic-level matches with spaces before punctuation, 2 more found by hand) | 18 |
| Sources or attributions corrected ("links fixed"): alphaTab `core.file` example is in the export docs, not the README; `\staff {tabs}` is in document-structure.mdx, not the alphaTex introduction (2 places); osmd-audio-player's author is named in its LICENSE, not its README; three line-number references into other lanes' surveys replaced by section names | 6 |
| Facts corrected | MEI v6.0 tag dates (2026-08-04 and 2026-11-02, not both 2026-11-02); ApolloTab's PyPI field is `license_expression`; music21 `xmlToM21.py` comment is `# TODO: staff-tuning*`; fretboard.js README does carry the ISC text; chords-db README example (`0320xx`) runs opposite to its data files (`xx0230`); SLiMTAB is an Electron app; abc2svg version, tablature support and license; MuseScore handbook page is copied from the MuseScore 3 handbook |
| Repository HEADs compared with `git ls-remote` | 43 of 43 unchanged, so all "Last commit" dates stand |
| npm, PyPI and crates.io entries re-read (`samples/verify/registry_now.tsv`) | 40 packages: versions, dates, license fields and the abc2svg deprecation match |
| Tag dates read from the tags themselves | 13 (music21, Verovio, OSMD, MuseScore, TuxGuitar, ChordPro, MusicXML, MEI x3, Power Tab Editor, It's MyTabs, Tab Flow) |
| Earlier UNVERIFIED items settled with a quote or a run id | 18: W3C FSA text; GeneralUser GS license; Flat individual terms; Flat embed prices (rendered); abc2svg chiselapp facts; TuxGuitar command line; LilyPond usage; music21 calls (trials r0153); Tonal `docs/LICENSE`; fretboard.js README; chords-db and renderer string order; upstream jTab license; Songshed stack; SLiMTAB runtime; It's MyTabs and Power Tab versions; Verovio fonts and two bundled libraries; MuseScore without a display (3.2.3, trials) |
| License facts added that the survey missed (data or third-party parts) | GeneralUser GS; MuseScore's MS Basic SoundFont (a third FluidR3 MIT source); TuxGuitar's Magic SoundFont (no license text found); Verovio fonts (OFL); LilyPond font and documentation exceptions; MuseScore fonts (GNU Freefont); TuxGuitar's iText 5.5.13.3 (AGPL v3 per its pom); upstream jTab (LGPL 2.1+) against the fork's MIT field; VexFlow npm 5.0.0 LICENSE header; CC BY 3.0 link target (`/by/3.0/us/`) |
| Handoff lines checked | 30 now: 26 as written by the survey, of which 9 kept unchanged and 17 amended (run or eval ids from trials.md added, references or wording corrected); 4 added. Each half is tied to a quote in this file or to a trials.md run or eval id; every run and eval id cited was found in `/home/user/gtr/ledger/runs.jsonl` or `/home/user/gtr/eval/ledger/evals.jsonl` and the counts quoted were re-read there |
| Places where trials.md and the documentation disagree, now stated with both sources | 7: alphaTab `.gp` into MuseScore 3.2.3 (r0178) and guitarpro-parser (r0298); `.gp5` to MusicXML in MuseScore 3.2.3 and webmscore (e0141, e0990); PyGuitarPro GP3/GP4 voices (e0578, e0581); abcjs octave (r0239, r0241); music21 MusicXML into alphaTab (e0908); TuxGuitar MusicXML octave (e0460, e0860); webmscore TAB MusicXML round trip (e1009) |
| Tools added | 9 projects (16 npm packages) in "Added by the verifier", 9 entries in "Not covered" |
| Judging language | none found outside quotes attributed to their authors |

Still UNVERIFIED after this pass: the OSMD sponsor player's terms (github.com returns 403 here); the Magic SoundFont's
license; the licenses of humlib, MidiFile, pugixml and MINIZ-CPP inside Verovio; whether MEI 6.0 has been released;
whether abcjs can force a string per note; the EZTab repository (not public); whether MNX encodes tablature;
`keyj/LICENSE` of keyjockey; the "Plays audio" column for Songshed and SLiMTAB and the "Edits" column for ApolloTab.

## Gap round 2 log (gapfill-web-tab-render, 2026-11-11)

What this round added or changed in this file, closing `GAPS.md` rows W1 and W2 (sources read 2026-11-11):

- Tool list: the `@coderline/alphatab-monaco` row now points to its run (r0614); a table "Added in gap round 2" with
  HAYA-TAB.
- alphaTab section: a bullet on the Monaco package and the language server (READMEs, dependencies, sizes, exports, the
  first lines of both LICENSE files).
- abcjs section: a bullet "Clicking and dragging" quoting the render-options, Selecting and Dragging, and Click
  Listener pages.
- Verovio: the "Edits" cell of its tool-list row and the "Edits" line of its section corrected in place (the toolkit's
  `edit()` call), marked "(corrected in gap round 2: ...)".
- New section "HAYA-TAB".
- "Handoff facts": three lines marked "(gap round 2)" (the Monaco editor to alphaTab, abcjs's clickListener, Verovio's
  `edit()`).
- "Where the raw sources are": the gap-round-2 folder.

Every quote added was compared with the saved file it came from (`scripts/gap2_check_quotes.py`, output
`samples/verify/gap2_quote_check.tsv`). Still UNVERIFIED: the date HAYA-TAB's GitHub repository was created (its
first commit is dated 2026-02-09) and the files of its GitHub releases (github.com answers 403 here); whether abcjs
can force a string per note (no option for it in the pages read, and none among the click and drag options).
