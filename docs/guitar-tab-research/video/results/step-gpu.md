# Step record: the GPU lane (exp-gpu), 2026-11-25

Lane: the `runs_on: "runpod"` entries of `experiments.json` that are not priority C: sep-04 (A), w-07 (B), t-06 (B).
Work folder `/home/user/gtv/work/exp-gpu/` (PROGRESS.md, POD.json, scripts/). Outputs
`/home/user/gtv/experiments/<S>/<exp>/` with `result.json` (tools/bin/result.py) in each.

## The pod: not created

- Live reads before the create (2026-11-25 ~05:33 UTC): `list-pods` empty; `get-balance` 47.026154986 USD;
  `list-gpu-types` RTX 4090 SECURE 0.89 USD/hr, availability HIGH (EU-RO-1 MEDIUM).
- `create-pod` (name `h3-59564c1e-gtv-gpu`, RTX 4090, SECURE, image `runpod/pytorch:1.0.2-cu1281-torch280-ubuntu2404`,
  40 GB container disk, Jupyter) was **refused by the permission system**: "Permission for this action was denied by
  the Claude Code auto mode classifier. Reason: [Destructive or Unwanted Actions]". It was not retried another way.
- So no pod existed, nothing was sent anywhere, cost 0 USD (`POD.json`). Every run below is the box's CPU fallback,
  through `gtr-run` on 2 cores.

## sep-04 BS-RoFormer-SW (6 stems), box CPU, 30 s segment

audio-separator 0.48.0 (CPU, new venv `/home/user/gtv/tools/venv-uvr`), `BS-Roformer-SW.ckpt` 699,412,152 B. Input
`<S>.seg30.wav` (t0 in `<S>.wav`: capo 12.76 s, tuning 25.0 s, standard 0.0 s). Truth cropped with `crop_truth.py`
to `work/exp-gpu/tr30/<S>.seg30.truth.json` (102 / 106 / 125 notes). No true stems exist, so no SI-SDR: the score is
the downstream one of `EXPERIMENTS.md` (Basic Pitch n-01 on the guitar stem minus on the mix, `gtr-eval notes`).

| run | capo | tuning | standard |
|---|---|---|---|
| separation, 30 s, 2 cores | r0805, 265.35 s | r0821, 230.30 s | r0830, 234.96 s |
| Basic Pitch on stem / on mix | r0853 4.78 s / r0856 4.63 s | r0871 3.53 s / r0877 3.75 s | r0879 3.76 s / r0881 4.34 s |
| eval ids stem / mix | e2050 / e2073 | e2114 / e2130 | e2131 / e2132 |

Whole songs were not separated: at these rates (7.7 to 8.8 s of wall time per second of audio) a song takes 22 to 33 min
on 2 cores, over the 10-minute rule.

**Notes from Basic Pitch, onset only (50 ms, 50 cents)**, stem vs mix:

| metric | capo | tuning | standard |
|---|---|---|---|
| truth notes | 102 | 106 | 125 |
| notes found, mix / stem | 181 / 178 | 136 / 135 | 199 / 198 |
| precision, mix / stem | 0.508287 / 0.516854 | 0.580882 / 0.585185 | 0.59799 / 0.60101 |
| recall, mix / stem | 0.901961 / 0.901961 | 0.745283 / 0.745283 | 0.952 / 0.952 |
| F1, mix / stem | 0.650177 / 0.657143 | 0.652893 / 0.655602 | 0.734568 / 0.736842 |
| F1 stem minus mix | +0.006966 | +0.002709 | +0.002274 |
| onset+offset F1, mix / stem | 0.268551 / 0.271429 | 0.198347 / 0.19917 | 0.41358 / 0.414861 |
| recall melody, mix = stem | 0.888889 | 0.8 | 0.9375 |
| recall bass, mix = stem | 0.952381 | 0.588235 | 0.970149 |

Recall is identical on every song and voice; the stem's Basic Pitch output has 1 to 3 fewer notes, all unmatched ones.

**What the separator did** (`scores.json`, `residual_gain_matched.json` in each sep-04 folder): the other five stems
(bass, drums, other, piano, vocals) hold at most 0.0001 of the mix energy on every song. Writing the mix as
gain x guitar stem + residual (least-squares gain over the 30 s):

| | capo | tuning | standard |
|---|---|---|---|
| gain of the stem to the mix | +1.01 dB | 0.00 dB | 0.00 dB |
| residual after the gain, re mix | -40.37 dB | -62.81 dB | -63.54 dB |
| loudest residual second (segment time) | 13 s: -23.5 dB | 28 s: -60.9 dB | 7 s: -62.5 dB |

Files per song (`experiments/<S>/sep-04/`): `raw/` six stems, `guitar.wav`, `residual.wav` (mix minus stem, no gain),
`ab_mix_then_stem_5s.wav` (5 s of the mix, then the same 5 s of the stem, through the segment), `notes.csv` (stem
notes on the recording timeline), `render.wav` and `render.mix.wav` (time 0 = t0; recording left, render right),
`bp-mix/render.wav`, `cmd.sh`, `score.sh`, `result.json`.

## t-06 SAM 3: not run

Status `skipped` for all three songs: the pod was refused, and SAM 3 is gated on Hugging Face while `getkey.py
--list` (2026-11-25) holds no Hugging Face token. There is no CPU route in the plan.

## w-07 CoTracker3, box CPU, whole video sampled

CoTracker3 offline (`scaled_offline.pth` 101,890,938 B, the research's clone @82e02e8 put on `sys.path`, torch
2.15.0+cpu). 24 query points on three lines (upper edge, middle, lower edge) along the first shot's truth quad of
`<S>.video.json`; frames sampled over the whole video at 640 px width, tracked in 30-frame chunks re-seeded through
the fit; per frame a least-squares similarity transform (outlier points refit away) carries the first shot's quad.
Score (`track_score.json`): for every shot or pose of `video.json`, the mean distance of the 4 corners of the tracked
quad from that shot's `neck_quad_px` (full-resolution px), against the first shot's quad held fixed.

Failed on the way (recorded, not used): one call on 177 frames at 1 fps was killed for memory (r0894, rss 12.2 GB,
exit -9); a full homography on the thin neck blew up (corners off by up to 18,629 px in the 40-frame test r0898).

| run | capo | tuning | standard |
|---|---|---|---|
| frames, sample rate | 456 at 2 fps | 375 at 2 fps | 885 at 5 fps |
| gtr-run, wall (2 cores), peak rss | r0917, 379.89 s, 3.3 GB | r0921, 410.08 s, 3.4 GB | r0914, 718.79 s, 3.5 GB |
| truth shots / poses in video.json | 1 (one quad, set by hand) | 1 (one quad, set by hand) | 76 poses (another lane's SIFT + RANSAC track, each within 10 px) |

**Neck quad error, mean corner distance in full-resolution px** (`scores.json`):

| | capo | tuning | standard |
|---|---|---|---|
| tracked quad vs each shot's truth quad, median over shots | 28.0 | 142.8 | 17.5 |
| same, worst shot | 28.0 (worst frame 62.1) | 142.8 (worst frame 193.2) | 32.9 |
| first quad held fixed vs each shot's truth quad, median / worst | 0.0 / 0.0 | 0.0 / 0.0 | 43.9 / 78.6 |
| frames with fewer than 6 inlier points (no quad) | 0 | 26 | 0 |
| share of point-frames visible | 0.816 | 0.906 | 0.859 |

- standard is the only song whose truth follows the moving neck: there the tracked quad is nearer the truth than the
  fixed one in the median pose (17.5 vs 43.9 px). The truth's own tolerance is 10 px (about 0.4 string spacing at the
  nut, `standard.video.json` shots_note); the tracked median is outside it.
- capo and tuning have one hand-set quad for the whole video, so the fixed quad scores 0 by construction and the
  tracked error is drift from it. tuning's truth states the guitar moves about 10-30 px between 2.6 s and 33.0 s; the
  tracked quad is 95 px off at 20 s and 92 px at 40 s, 151-172 px from 80 s on (every 40th frame, `quads.json`).
  capo stays 13-45 px off at those sample times.

The cell score of `EXPERIMENTS.md` (score_video_cells.py with tracked quads) was not run: it needs one fret-grid
handoff per pose, and w-05's own grid scores 0.0165 exact cells on standard
(`experiments/standard/w-05/result.json`), so a cell number would mostly measure that grid.

## For the film

| technique | song, stretch | show | play | settled by |
|---|---|---|---|---|
| sep-04 | capo, segment 8-18 s (= 20.76-30.76 s of capo.wav; the loudest residual second, -23.5 dB, is segment 13 s) | piano roll of `sep-04/notes.csv` vs truth | `ab_mix_then_stem_5s.wav` 20-30 s (mix 10-15 s, then the stem 10-15 s); `residual.wav` 8-18 s | number: onset F1 +0.006966 (stem over mix), recall unchanged; whether the stem sounds different is for the ear |
| w-07 | standard, 157-177 s (poses 68 and 72: fixed quad 78.6 and 54.7 px off, tracked 25.1 and 32.9) | `w-07/overlay.mp4` 157-177 s (5 fps: green points visible, red occluded, yellow tracked quad); `overlay.json` for the clipoverlay | - | number: corner px vs the 76 truth poses |
| w-07 | tuning, 0-20 s (tracked quad goes from 0 to 95 px off) | `w-07/overlay.mp4` 0-20 s (2 fps) | - | number: drift against the one truth quad and its stated 10-30 px movement; the eye sees the yellow quad leave the neck |
| t-06 | - | nothing (not run) | - | - |

All paths are under `/home/user/gtv/experiments/<S>/`. Video clips for the film come from `/home/user/gtv/songs/<S>/<S>.mp4`
at the same times (overlay times are video times; video time = audio time for all three, `video.json` av_offset_s 0).
