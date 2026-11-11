# The box every trial ran on

Recorded 2026-11-10 from the machine itself. Every runtime in this folder was measured here unless the line
says otherwise (a public Hugging Face Space, a hosted API, or Aaron's own machine).

## Hardware

| | |
|---|---|
| Machine | one Claude Code cloud session container (a KVM virtual machine) |
| CPU | 4 vCPU, `Intel(R) Xeon(R) Processor @ 2.10GHz`, with AVX2 and AVX-512 |
| Memory | 15 GiB, no swap |
| GPU | none (`nvidia-smi` is not installed) |
| Disk | 252 GB volume, about 26 GB free when the research started |
| Kernel / OS | Linux 6.18.44, Ubuntu 24.04.5 LTS |

## Software

| | |
|---|---|
| Python | 3.13.18 by default. 3.9.25, 3.10.20, 3.11.15 and 3.12.3 through `uv` 0.11.32 |
| Node | 22.23.4 |
| Browser | Playwright 1.63.0 with Google Chrome for Testing 153.0.8010.12 (headless, software rendering) |
| ffmpeg | 6.1.1 |
| FluidSynth | 2.3.4, with the FluidR3_GM SoundFont from the Ubuntu package `fluid-soundfont-gm` |
| Other audio tools | SoX 14.4.2, Rubber Band 3.3.0, aubio (Ubuntu package), TiMidity++ 2.14.0, the Vamp plugin SDK |
| PyTorch | CPU-only wheels (`UV_TORCH_BACKEND=cpu`) |

Each lane's `trials.md` gives the exact version of each tool it installed, and a `uv pip freeze` of its
environment where one was saved.

## How runs were timed: `gtr-run`

[`scripts/gtr-run`](scripts/gtr-run) wraps every timed command.

- The 4 cores are split into two slots of 2 cores (cores 0-1 and cores 2-3). A job waits for a free slot and
  is pinned to that slot's 2 cores with `sched_setaffinity`, so at most two timed jobs ran at once and each
  had 2 cores to itself. Of the 722 logged runs, 246 ran in a 2-core slot and 4 with all four cores. The other
  471 ran unpinned (`--nolock`): light jobs, browser and API jobs, and jobs that could not get a slot while the
  queue was long. Each lane's `trials.md` says which runs were pinned. One catch found late: native ONNX Runtime
  sets its own thread affinity and ignored the 2-core slot unless its thread count was set, so timings of
  ONNX Runtime jobs at default settings are not 2-core figures (see the video, audio-to-notes and browser lanes).
- `--all-cores` takes both slots and all 4 cores, for a whole-box figure.
- Thread-count variables (`OMP_NUM_THREADS` and the like) are set to the number of cores given.
- Each run appends one line to the ledger: run id, lane, tool, label, exact command, working directory, each
  input file's size and SHA-256, cores, wall-clock seconds, CPU seconds, peak memory, exit code, and how long
  it waited for a slot.
- Up to twenty agents shared the box. Installs, downloads and web reading were not pinned, so they ran next
  to the timed jobs. Timings are what this shared box gave, not a clean-room benchmark.

The ledger is copied, gzipped, to [`ledger/runs.jsonl.gz`](ledger/runs.jsonl.gz).

## How outputs were scored: `gtr-eval`

[`scripts/gtr-eval/`](scripts/gtr-eval/) scores a tool's output against a test clip's ground truth with
`mir_eval`. Its README says what each number means and which `mir_eval` function and tolerance is behind it.
Each scoring run gets an id (`e0042`) in its own ledger, copied to [`ledger/evals.jsonl.gz`](ledger/evals.jsonl.gz). The tool was fixed twice during the run (0.11.1 to 0.12.1, see `scripts/gtr-eval-fix-notes.md`).

## Cost

Local runs cost nothing beyond the cloud session itself. Calls to paid APIs are listed with their cost in
`lanes/hosted-apis/trials.md` (0.96 US dollars in total). No GPU was rented. Token use by the agents is in
[`costs/COSTS.md`](costs/COSTS.md).

## Interruptions

The container's worker process restarted at about 20:49 UTC on 2026-11-10, after the test inputs were finished
and before the ten lanes started, and again at about 01:33 UTC on 2026-11-11 during a site build. The files on disk
survived both. The run was stopped by hand at about 01:25 UTC on 2026-11-11, when the account's weekly usage limit
was nearly used up: eleven background workflows were cut off (see `README.md`).
