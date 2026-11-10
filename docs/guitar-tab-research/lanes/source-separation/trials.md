# Source separation: trials

Lane `source-separation`, agent `try-source-separation`, started 2026-11-10 20:52 UTC. Everything below was run on the
shared box (4 vCPU Intel Xeon 2.10 GHz, 15 GiB RAM, no GPU). Timed runs went through `gtr-run`, which pins a job to
one slot of 2 cores unless the run says 4 cores (`--all-cores`); every run id (r0xxx) is a line in
`/home/user/gtr/ledger/runs.jsonl`, every scoring id (e0xxx) a line in the gtr-eval ledger. Estimated stems are in
`/home/user/gtr/lanes/source-separation/out/<model>/<clip>/` for other lanes to use.

How stems are scored (where truth exists, S4 and S6taps): `gtr-eval stems` averages every signal to mono, resamples to
44.1 kHz if needed, trims to the shortest length, then reports SI-SDR (computed by gtr-eval: mean removed,
target = (<est,ref>/<ref,ref>) ref, 10 log10(|target|^2/|est-target|^2)) and mir_eval 0.8.2
`bss_eval_sources` SDR / SIR / SAR (512-tap filter, whole signal, one joint call over all scored stems). No time
alignment is searched. These are measurements on one synthesized clip, not a ranking.

Scripts are in `scripts/`, small text samples in `samples/<tool>/`. Audio stays outside git (list at the end).

