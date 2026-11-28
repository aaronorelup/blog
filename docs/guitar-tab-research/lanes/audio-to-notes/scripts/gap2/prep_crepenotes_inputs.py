"""Gap round 2, item A3: inputs for CREPE Notes (`crepe_notes --f0`) from this lane's torchcrepe f0 files.

usage: python3 prep_crepenotes_inputs.py <lane out dir> <dest dir>

CREPE Notes reads --f0 with np.genfromtxt(..., delimiter=',', names=True) and uses the columns named `frequency` and
`confidence` (crepe_notes.py, parse_f0); this lane's torchcrepe files are `time_s,frequency_hz,confidence` (10 ms
rows, viterbi decoder, fmin 50, fmax 2006 Hz, periodicity in the confidence column). Written per configuration:
  tcfull   torchcrepe `full`, header renamed to time,frequency,confidence, every value unchanged
  tctiny   torchcrepe `tiny`, the same
  tcfullz  torchcrepe `full`, frequency set to 0 where periodicity < 0.21, as CREPE Notes' own torchcrepe backend
           does (crepe_notes.py run_torchcrepe: pitch_np[periodicity_np < 0.21] = 0.0)
and, per configuration folder, symlinks <clip>.wav to the audio the f0 was computed from (the shared inputs are not
written to; CREPE Notes is run with --use-cwd from inside the folder).
"""
import csv
import os
import sys

out_dir, dest = sys.argv[1], sys.argv[2]
AUDIO = {
    "S1": "/home/user/gtr/inputs/S1/S1.mono.wav",
    "R1b": "/home/user/gtr/inputs/R1b/R1b.mono.wav",
    "S4lead": "/home/user/gtr/inputs/S4/stems/lead.wav",
}
CONFIGS = {"tcfull": ("torchcrepe-full", False), "tctiny": ("torchcrepe-tiny", False), "tcfullz": ("torchcrepe-full", True)}
for cfg, (src_tool, zero) in CONFIGS.items():
    d = os.path.join(dest, cfg)
    os.makedirs(d, exist_ok=True)
    for clip, audio in AUDIO.items():
        link = os.path.join(d, clip + ".wav")
        if not os.path.islink(link):
            os.symlink(audio, link)
        src = os.path.join(out_dir, src_tool, "f0", clip + ".f0.csv")
        rows = list(csv.reader(open(src)))
        assert rows[0] == ["time_s", "frequency_hz", "confidence"], rows[0]
        n_zeroed = 0
        with open(os.path.join(d, clip + ".f0in.csv"), "w", newline="") as f:
            w = csv.writer(f, lineterminator="\n")
            w.writerow(["time", "frequency", "confidence"])
            for t, hz, conf in rows[1:]:
                if zero and float(conf) < 0.21:
                    hz = "0.000"
                    n_zeroed += 1
                w.writerow([t, hz, conf])
        print(cfg, clip, "rows", len(rows) - 1, "zeroed", n_zeroed, "from", src)
