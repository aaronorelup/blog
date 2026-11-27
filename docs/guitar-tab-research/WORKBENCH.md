# The workbench: AO-082's working files, saved for the next sessions

The cloud box that made AO-082 and its film kept its working files outside git, in `/home/user/gtv` (the film's
songs, answer keys, experiments, blind test, tools and production kit) and `/home/user/gtr` (the scorer and the run
wrapper of the first research). The box is reclaimed after 2026-11-27. Before that, agent `workbench-archivist` copied
what the next sessions need into Aaron's private R2 bucket, so a fresh cloud box can put it back at the same paths.
The kit, the scorer and every `cmd.sh` / `score.sh` have those paths built in, so restore to `/home/user/gtv` and
`/home/user/gtr`, nowhere else. Read [DIRECTION.md](DIRECTION.md) first; this file only says where the files are.

- **Where:** the bucket in getkey's `R2_BUCKET`, prefix `workbench/guitar-tab-app/2026-11-27/`. Under it: `gtv/...`
  and `gtr/...` with the box's folder layout, plus the side files below. It is not under `runs/` or `projects/`, so it
  never shows up in Aaron's media library.
- **Size:** 25,617 files, 2.757 GB (2,757,244,152 bytes), copied on 2026-11-27 from 00:34 UTC. 18.4 GB of the two trees
  were left out (venvs, caches, renders, derived media; the table below).
- **Check (2026-11-27 00:39 UTC):** `rclone check --one-way` of the uploaded tree against the box: 0 differences, 25,617
  matching files; the five files over 100 MB compared again byte for byte (`--download`): 0 differences. Every file's
  sha256 is in `MANIFEST.tsv` (checked against the box with `sha256sum -c`: all match; five files fetched back from
  the bucket: same sha256). A dry run of the restore's copy into `/home/user` found the 25,617 files and nothing to change.

## Side files (at the prefix's top, beside `gtv/` and `gtr/`)

| file | what |
|---|---|
| `MANIFEST.tsv` | `path`, `bytes`, `sha256` of every uploaded file (path relative to `/home/user`) |
| `SYMLINKS.tsv` | the 26 symbolic links of the two trees (`truth/capo/capo.wav` -> `songs/capo/capo.wav` and the like); object storage keeps no links |
| `HARDLINKS.tsv` | 13 files left out because they are hard links of an uploaded file (the blind `video.mp4`s, the candidate copies of the picked videos, four WAVs in `work/`); restored as hard links |
| `EXEC.tsv` | the 283 uploaded files that were executable (the launchers, the kit's tools, the `cmd.sh` files) |
| `LEFT-OUT.tsv` | what was not uploaded: folder, files, bytes, reason |
| `restore.sh` | the restore below, as one script |
| `wb-rclone.py` | the rclone wrapper below |

## What is in it, by the job it serves

**(a) Score a new method against the answer keys exactly as AO-082 did.**

| path | what |
|---|---|
| `gtr/eval/` | gtr-eval 0.12.1: `gtr_eval.py`, `gtr_eval_selftest.py`, `README.md` (subcommands, output fields), `requirements.lock.txt` (the venv's exact pins), `checks/`, `fixtures/`, `ledger/evals.jsonl` (every scoring run e0001 to e3519, the ids the records cite) |
| `gtr/bin/gtr-eval`, `gtr/bin/gtr-run`, `gtr/env.sh`, `gtr/ledger/runs.jsonl` | the launcher (runs the scorer with its own venv), the run wrapper (2-core slots, one ledger line per run), the shared settings, and every logged run (r0001 to r1311, with the exact command of each) |
| `gtv/truth/<S>/` | the three answer keys: `<S>.truth.json` (the scored file), `.gp5`, `.mid`, `.notes.csv`, `.beats.txt`, `.chords.lab`, `.tab.txt`, `.tab-merged.json`, the two independent readings `read-a.json` / `read-b.json`, `standard.neck_track.json`, `<S>.video.json`; `tuning.seg30.truth.json` + `tuning.seg30.wav`; `blind-map.json` (which blind id was which song) |
| `gtv/songs/<S>/<S>.wav` | the audio each truth is timed to (44.1 kHz 16-bit stereo; time 0 = the truth's time 0), and `<S>.seg30.wav` for the 30-second segments |
| `gtv/songs/<S>/video.mkv` (capo, standard), `video.mp4` (tuning) | the three source videos as downloaded; `audio.wav` is the selector's first extract of each |
| `gtv/songs/capo/capo.mp4`, `gtv/songs/standard/standard.mp4` | the cut, cropped videos the tools and the blind test got (x264 re-encodes, kept because the video timings are frames of these files) |
| `gtv/songs/<S>/tab.png`, `tab_pages/`, `tuning/tab.pdf`, `tuning/post.txt` | the tab sources the keys were read from |
| songs, sources and credits | `video/songs.json` and `video/SONGS.md` on this branch; `gtv/library/NOTES.md` (credits and links of the three recordings, the film's settings) |

**(b) Run the kit tools the blind test used.** `gtv/tools/kit/` (the kit: `TOOLS.md`, every tool, `lib/`),
`gtv/tools/bare/` (the bare arm's two scripts and `BARE.md`), `gtv/tools/bin/` (crop_truth, notes2wav, result.py,
frames, the `vhf/` video scripts, the alphaTab server), `gtv/tools/blind-admin/` (`vault.py`, `score_blind.sh`,
`audit_blind.py`), `gtv/tools/models/` (guitar-gaps.pth, guitar-fl.pth, guitar_htdemucs_6s.pt, TabCNN, `uvr/`, with
`SHA256SUMS`), `gtv/tools/INSTALLED.md` (what was installed and the smoke tests), and the venv recipes:
`gtv/tools/venv-{torch,bp,madmom,chordext,video,api}.freeze.txt`, `gtv/tools/bare/venv.freeze.txt`,
`gtv/production/venv-mp.freeze.txt`, `gtr/eval/requirements.lock.txt`, `gtv/tools/node/package.json` + lock. The
freeze files of venv-video, venv-api, the bare venv and venv-mp, and `tools/node/package.json` (from the lock's root
entry), were written on 2026-11-27 from the live venvs for this copy; the others are from 2026-11-25.

**(c) Make a film with the production kit.** `gtv/production/kit/` (the components, `kit.css`/`kit.js`, the fonts and
every tool with the fixes of PRODUCTION.md 6.10: `strip_seams.py`, true-peak `level.py`, sample-exact `join.py`,
`listen_cues.py`, `merge_cues.py`, plus `hands.py` and `hand_landmarker.task`), `gtv/production/tooling/package.json` and
`package-lock.json` (HyperFrames 0.9.91 and alphaTab), the stage notes (`SCRIPT.md`, `VOICE.md`, `FILM.md`,
`FILM-QC-*.md`, `KIT-NEEDS.md`), `voice/` (the narrator auditions), and for each of the 18 chapters
`production/chapters/<ch>/`: `script.md`, `brief.json`, `chapter.json`, `captions.vtt`, `data/`, `qc/` notes,
`logs/`, `project/` (build.py, make_data.py, index.html, compositions, fonts and images) and `vo/` (each line's
ElevenLabs take `lNN.mp3` with `lNN.txt`, `lNN.req.json` and `lNN.words.json`). `production/film/` has the join list,
`gains.json` and the film's captions. The tools are listed in `video/PRODUCTION.md`.

**(d) Read every past result.** Every experiment `gtv/experiments/<S>/<id>/` (and `S4/`) with its text outputs:
`result.json`, `cmd.sh`, `score.sh`, scores, notes csv, json, txt, md, py, sh, gp5, mid, logs, `strip.json` with its
`strip.NN.png` tiles, figures; the ElevenLabs stems of `sep-06` whole (a paid output). The blind attempts
`gtv/blind/<b1..c3>/{tools,bare}/`: `answer.json`, `answer_vN.json`, `answer.gp5`, `HOW.md`, `NOTES.md`, every script
and the frames and sheets they looked at, `score/`, `film/` (strip.json, labels), plus `blind/results.json` and
`blind/b2/video.mp4` (the re-encoded tuning video the blind test got; run r1123). `gtv/work/<agent>/`: every
agent's PROGRESS.md, scripts, json, csv, txt, logs and arrays (no images or audio). `gtv/candidates/` (the song
scouts' notes, pages, checks; no media), `gtv/guard/` (the blind test's file-access watch and logs),
`gtv/library/NOTES.md`, `gtv/render/web/` (the site's captions and chapter list).

`work/exp-tuning/prompts/`, `work/exp-tuning/r2_share.json` and `work/audit-fix-a/t07/` hold signed links to files
that were shared with hosted services. They expired 24 hours after 2026-11-25 06:45 UTC.

## Left out, and how to get it back

| left out | size | how to get it back |
|---|---|---|
| venvs (`tools/venv-*`, `tools/bare/venv`, `production/venv-mp`, `gtr/eval/venv`), `node_modules`, `gtr/cache` (uv's download cache) | 6.5 GB | rebuild, below |
| `gtr/lanes`, `gtr/inputs` (the first research's lanes and 17 test clips) | 2.7 GB | their records are `lanes/` and `inputs/` on this branch; the clips' audio and video are in the studio library, project `blog-posts`, run `20261110-225132-vm-7d3107`. `gtr-eval --truth <clip id>` and `gtr-eval selftest --all-inputs` look there, and the smoke tests of INSTALLED.md ran on them |
| the film and its copies, chapter renders (`library/guitar-video-to-tab.mp4`, `render/*.mp4`, `production/film/film.mp4`, `chapters/*/chapter.mp4`, `production/proof.mp4`), the narration `library/narration.flac`, the blind playbacks `library/blind-*.wav`, the card loop | 3.0 GB | the film is in R2 (the site serves it at `/media/guitar-tab-tools/film/guitar-video-to-tab.mp4`); the library files are in the studio library |
| `songs/<S>/<S>.mono.wav`, `.seg30.mono.wav` | 60 MB | the commands below (checked on the box: sample for sample equal) |
| `songs/<S>/<S>.full.mp4`, `.seg30.mp4`, `tuning/tuning.mp4` | 607 MB | the commands below (`tuning.mp4` is a stream copy: packet for packet equal; the x264 files come out with the same frames and times, not the same bytes) |
| the blind `video.mp4`s of b1, b3, c1, c2, c3; the candidates' copies of the picked videos | 1.1 GB | hard links, made again by `restore.sh` from `HARDLINKS.tsv` |
| experiments' audio and video (stems, MIDI renders, listening windows, overlay videos) except `sep-06` | 1.0 GB | each experiment's `cmd.sh` (and `score.sh`) makes them again with the rebuilt venvs |
| blind `render.wav` files and other audio of the attempts | 171 MB | `tools/bin/notes2wav.py` from the answer (the film's `film/` folders say how) |
| `chapters/*/vo/lNN.wav` and `.pre-tp` | 485 MB | `python3 /home/user/gtv/production/kit/tools/level.py vo/lNN.mp3 vo/lNN.wav --lufs -17 --mono` (PRODUCTION.md 6.10) |
| `chapters/*/project/assets/{audio,video}` | 728 MB | cut and levelled from songs, experiments and `vo/` by the chapter's `project/make_data.py` / `build.py` and `level.py` (PRODUCTION.md, each chapter's `logs/`) |
| other production media (`proof-data`, `kittest`, `voice` and `proof` audio and video) | 143 MB | test renders of the kit; not needed |
| `work/` images and media (QC frames, previews, contact sheets, render WAVs) | 1.9 GB | made by the reviewers from the renders; not needed |
| other `candidates/` media (the selector's check WAVs, a dataset zip) | 48 MB | the URLs are in `video/candidates-*.md` and `songs.json` |

## Restore on a fresh box

Needs rclone (`/root/.local/bin/rclone` on a kit-installed box), uv, ffmpeg, Python 3, Node 22 and about 3 GB free
for the files (plus about 3 GB for the venvs). The keys come from getkey inside the wrapper, into rclone's
environment only; nothing is printed or written to a config file. Save this as `~/wb/wb-rclone.py`:

```python
#!/usr/bin/env python3
"""wb-rclone.py <rclone args...>: rclone with a remote `wb:` = the workbench prefix in the bucket in getkey's R2_BUCKET."""
import os, subprocess, sys
sys.path.insert(0, os.path.expanduser("~/.claude/bin"))
from getkey import getkey

PREFIX = "workbench/guitar-tab-app/2026-11-27"
env = dict(os.environ)
env.update({
    "RCLONE_CONFIG_R2_TYPE": "s3",
    "RCLONE_CONFIG_R2_PROVIDER": "Cloudflare",
    "RCLONE_CONFIG_R2_ACCESS_KEY_ID": getkey("R2_ACCESS_KEY_ID"),
    "RCLONE_CONFIG_R2_SECRET_ACCESS_KEY": getkey("R2_SECRET_ACCESS_KEY"),
    "RCLONE_CONFIG_R2_ENDPOINT": getkey("R2_ENDPOINT"),
    "RCLONE_CONFIG_R2_NO_CHECK_BUCKET": "true",
    "RCLONE_CONFIG_WB_TYPE": "alias",
    "RCLONE_CONFIG_WB_REMOTE": "r2:" + getkey("R2_BUCKET") + "/" + PREFIX,
})
rclone = os.environ.get("RCLONE", os.path.expanduser("~/.local/bin/rclone"))
sys.exit(subprocess.run([rclone] + sys.argv[1:], env=env).returncode)
```

Then:

```bash
cd ~/wb && python3 wb-rclone.py copy wb:restore.sh .
bash ~/wb/restore.sh --eval
```

`restore.sh` does, in order: fetch the side files into `~/wb`; `rclone copy wb: /home/user --include "/gtv/**"
--include "/gtr/**"`; make the links of `SYMLINKS.tsv` and `HARDLINKS.tsv`; set the executable bits of `EXEC.tsv`;
check every file with `sha256sum -c` against `MANIFEST.tsv` and the weights against `tools/models/SHA256SUMS`. With
`--eval` it also builds gtr-eval's venv and re-scores one blind attempt (the check below). It only adds files, so
running it again finishes an interrupted restore.

## Rebuild the venvs and the node folders

Run with the box's settings: `source /home/user/gtr/env.sh` (shared uv cache, `UV_TORCH_BACKEND=cpu` for CPU-only
torch wheels). `G=/home/user/gtv`. The pins are the freeze files; the original install commands, with their reasons
(Python versions, `--no-build-isolation`), are `video/EXPERIMENTS.md` "Installs (box)".

```bash
source /home/user/gtr/env.sh; G=/home/user/gtv
# the scorer (Python 3.11.15 on the old box)
uv venv --python 3.11 /home/user/gtr/eval/venv && uv pip install --python /home/user/gtr/eval/venv/bin/python -r /home/user/gtr/eval/requirements.lock.txt
/home/user/gtr/bin/gtr-eval selftest
# the kit's venvs
uv venv --python 3.11 $G/tools/venv-torch && uv pip install --python $G/tools/venv-torch/bin/python -r $G/tools/venv-torch.freeze.txt
uv venv --python 3.10 $G/tools/venv-bp && uv pip install --python $G/tools/venv-bp/bin/python -r $G/tools/venv-bp.freeze.txt
uv venv --python 3.9 $G/tools/venv-madmom && uv pip install --python $G/tools/venv-madmom/bin/python "numpy==1.23.5" "scipy<1.11" mido "cython<3" "setuptools<81" wheel soundfile \
  && uv pip install --python $G/tools/venv-madmom/bin/python --no-build-isolation -r $G/tools/venv-madmom.freeze.txt
uv venv --python 3.11 $G/tools/venv-chordext && uv pip install --python $G/tools/venv-chordext/bin/python numpy "setuptools<81" wheel \
  && uv pip install --python $G/tools/venv-chordext/bin/python --no-build-isolation -r $G/tools/venv-chordext.freeze.txt
uv venv --python 3.11 $G/tools/venv-video && uv pip install --python $G/tools/venv-video/bin/python -r $G/tools/venv-video.freeze.txt
uv venv --python 3.11 $G/tools/venv-api && uv pip install --python $G/tools/venv-api/bin/python -r $G/tools/venv-api.freeze.txt
uv venv --python 3.11 $G/tools/bare/venv && uv pip install --python $G/tools/bare/venv/bin/python -r $G/tools/bare/venv.freeze.txt
# the production kit's MediaPipe venv (Python 3.12.3 on the old box)
uv venv --python 3.12 $G/production/venv-mp && uv pip install --python $G/production/venv-mp/bin/python -r $G/production/venv-mp.freeze.txt
# node: alphaTab, scorify, tutts for the tools; HyperFrames and alphaTab for the film
(cd $G/tools/node && npm ci --ignore-scripts --no-audit --no-fund)
(cd $G/production/tooling && npm ci --no-audit --no-fund)
```

Both `npm ci` were tried on the old box from copies of the two package files (3 and 81 packages, the same top-level
folders as the live `node_modules`). Demucs fetches its base `htdemucs_6s` weights into `TORCH_HOME` on first use.
The film renders with HyperFrames (PRODUCTION.md: `kit/tools/render_chapter.sh`, about 1.15 s per second of 1080p30
on 4 CPUs) and needs a headless Chrome (`env.sh` points Playwright at `/opt/pw-browsers`).

## Remake the derived song files

```bash
cd /home/user/gtv/songs
for S in capo standard tuning; do
  ffmpeg -y -v warning -i $S/$S.wav -ac 1 $S/$S.mono.wav
  ffmpeg -y -v warning -i $S/$S.seg30.wav -ac 1 $S/$S.seg30.mono.wav
done
ffmpeg -y -v warning -i tuning/video.mp4 -map 0 -c copy -map_metadata -1 -fflags +bitexact tuning/tuning.mp4
# the two encode scripts write <S>.mp4 again as well as <S>.full.mp4: keep the uploaded <S>.mp4 (the timings are its frames)
mv capo/capo.mp4 capo/capo.keep.mp4; bash /home/user/gtv/work/truth-capo/encode.sh; mv capo/capo.keep.mp4 capo/capo.mp4
mv standard/standard.mp4 standard/standard.keep.mp4; bash /home/user/gtv/work/truth-standard/encode.sh   # also rewrites its WAVs and seg30 files (same samples)
mv standard/standard.keep.mp4 standard/standard.mp4
ffmpeg -y -v warning -i standard/standard.mp4 -t 30 -c copy -map_metadata -1 -movflags +faststart standard/standard.seg30.mp4
ffmpeg -nostdin -v error -ss 25 -t 30 -i tuning/tuning.mp4 -map 0:v:0 -map 0:a:0 -c:v libx264 -crf 16 -preset medium -pix_fmt yuv420p \
  -c:a aac -b:a 256k -map_metadata -1 -fflags +bitexact -movflags +faststart tuning/tuning.seg30.mp4   # gtr-run r0753
```

`capo.seg30.mp4` is capo.mp4 from 12.76 s for 30 s (`video/truth-capo.md`; its exact command was not logged). The
canonical WAVs, if ever needed again from the videos: `ffmpeg -i <S>.mp4 -vn -ac 2 -ar 44100 -c:a pcm_s16le
-map_metadata -1 <S>.wav` (tuning: from `video.mp4`), and the segments `ffmpeg -ss <t0> -t 30 -i <S>.wav -c:a
pcm_s16le <S>.seg30.wav` with t0 = 12.76 (capo), 0 (standard), 25 (tuning). On the old box each of these gave the
uploaded file's samples exactly (ffmpeg's md5 of the decoded audio).

## Check a restore

`restore.sh --eval` re-scores round 2's Imagine attempt with the kit (blind id c3, tools arm) against the standard
answer key, the main number of [video/BLIND-RESULTS.md](video/BLIND-RESULTS.md) ("standard (c3)", kit arm: **0.865**
in the GP5, 0.875 in the list):

```bash
TR=/home/user/gtv/truth/standard/standard.truth.json; D=/home/user/gtv/blind/c3/tools
GTR_EVAL_LEDGER=/tmp/check.jsonl /home/user/gtr/bin/gtr-eval tab --truth $TR --est $D/answer.json --out /tmp/tab.json
GTR_EVAL_LEDGER=/tmp/check.jsonl /home/user/gtr/bin/gtr-eval tab --truth $TR --est $D/answer.gp5 --time-shift -0.2 --out /tmp/gp5.json
cmp /tmp/tab.json $D/score/tab.json && cmp /tmp/gp5.json $D/score/score_tab.json && echo same
```

`same_string_and_fret_fraction_of_truth` is 0.874816 (list) and 0.864507 (GP5), and both outputs are byte for byte
the recorded `score/tab.json` and `score/score_tab.json` (gtr-eval writes no time or run id, and the paths are the
same). Run on the old box on 2026-11-27 before the upload: identical. `GTR_EVAL_LEDGER` keeps the check out of the
real ledger.
