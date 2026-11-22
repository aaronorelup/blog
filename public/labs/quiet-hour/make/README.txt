THE QUIET HOUR: how the film is made
====================================

The film is the page. ../index.html loads ../film.js, which draws any frame of any of the four
endings as a pure function of (frame, ending): the engine (../src/signals.js) turns the published
training log into every signal for that frame, ../src/shots.js picks the shot, the programme
(../src/programme/) draws the TV picture into a 1280x960 canvas, the room (../src/room/) puts it on
the tube and lights the room with it, and ../src/post.js adds the final pass and the subtitles.
These tools only drive that page frame by frame and keep the receipts.

Needs: Node 20+, Playwright with its Chromium (headless shell), ffmpeg/ffprobe on PATH. No npm install:
render.mjs looks for Playwright in NODE_PATH and the usual global folders first.

  # render frames 0..2159 of one ending in 3 browsers; lossless FFV1 segments + log.json
  node make/render.mjs --ending main --from 0 --to 2159 --width 1280 --height 720 --shards 3 --out out/main

  # join: segments + 240 black coda frames + the 48 kHz soundtrack (padded with silence to 100 s)
  node make/render.mjs join --in out/main --audio main.48k.wav --out the-quiet-hour-main.mp4

  # a labelled contact sheet of chosen frames (bars:A-B = first frame of every bar)
  node make/contact.mjs --ending x10 --frames bars:44-72 --out sheet-x10.png

  # same frame, same bytes: two fresh launches, reversed and sharded orders, and frames before 20:00
  # identical in all four endings. Prints PASS or FAIL.
  node make/determinism.mjs

render.mjs options: --quality final|draft (draft: no MSAA, smaller shadow map, fewer motes),
--chunk N (frames per segment, default 60), --format ffv1|png, --order forward|reverse|shuffle,
--mount /url/prefix=<path> (serve another file or folder at that URL, for testing a replacement).

How a frame is captured: in the page, QH.renderFrame(f) draws into the WebGL canvas and
gl.readPixels reads the same drawing buffer in the same task (no preserveDrawingBuffer needed),
then the raw RGBA is POSTed to the local server, which flips the rows, hashes them (sha256, in
log.json) and pipes them into ffmpeg. Nothing is lossy before the final H.264 encode, and the hashes
are of the exact pixels the page drew.

Determinism rules the page keeps: no Date, performance.now, requestAnimationFrame, timers or
Math.random in the render path; randomness is hash01(seed, ...) from ../src/rng.js; no state carried
from one frame to the next (anything that looks like memory is a closed form or precomputed at load);
fonts are loaded and awaited before frame 0; shaders are compiled before frame 0. Chromium runs with
pinned flags (render.mjs CHROMIUM_ARGS: SwiftShader WebGL, sRGB, no LCD text), deviceScaleFactor 1.

Third-party files in this folder
--------------------------------
../vendor/three.module.min.js  three.js r160 (npm three@0.160.0, build/three.module.min.js, unmodified).
    MIT License. Copyright (c) 2010-2023 three.js authors. https://github.com/mrdoob/three.js
    No three.js addons are used.
../fonts/*.woff2  Cormorant Garamond, Courier Prime, Caveat (Latin subsets, @fontsource 5.3.0).
    SIL Open Font License 1.1; full texts in ../fonts/LICENSES.txt.
