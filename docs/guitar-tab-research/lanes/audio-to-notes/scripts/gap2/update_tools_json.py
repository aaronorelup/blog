"""Gap round 2 (gapfill-audio-to-notes, 2026-11-11): write this round's facts into tools.json.

usage: python update_tools_json.py <tools.json>
Idempotent: sets fields of existing entries by name and adds new entries once. Every value comes from trials.md /
survey.md as written in gap round 2. Items are applied in the order of the round (A1 ... A9, then the PyPI packages).

Format: until this round the file was json.dumps(indent=1, ensure_ascii=False) without a trailing newline. With this
round's additions that form passed the folder's 300 KB per-file limit (299,432 bytes after items A1 to A4), so the
file is now written with json.dumps(indent=0, ensure_ascii=False) (same keys and values, one value per line, no
indentation, no trailing newline). The reformat alone changes no value: json.load of the file before and after it
compares equal (checked when it was made; `git diff -w` shows only the content changes).
"""
import json
import sys

path = sys.argv[1]
d = json.load(open(path))
by = {t["name"]: t for t in d["tools"]}
G2 = "gap round 2 (gapfill-audio-to-notes, 2026-11-11)"


def run_by_id(tool, rid):
    for r in tool["runs"]:
        if r.get("run_id") == rid:
            return r
    raise KeyError(rid)


# ---- A1 PENN: attempted, no output ----
penn = by["PENN (FCNF0++)"]
penn["tried"] = False
penn["tried_how"] = None
penn["attempt_status"] = (
    "attempted, no output: installed, checkpoint downloaded, `import penn` failed in r0399 and r0423 (both exit 1, "
    "--nolock); tried was true until " + G2)
r = run_by_id(penn, "r0399")
r.update({"wall_s": 4.91, "peak_mb": 258.3})
r["metrics"].pop("ledger", None)
r = run_by_id(penn, "r0423")
r.update({"wall_s": 5.41, "peak_mb": 257.4, "exit_code": 1})
r["metrics"].pop("ledger", None)

# ---- A2 SoX: input preparation, logged re-run r0602, license ----
sox = by["SoX"]
sox["url"] = "https://sourceforge.net/p/sox/code/"
sox["version"] = "14.4.2 (Ubuntu package sox 14.4.2+git20190427-4build4)"
sox["role"] = "input preparation for the Basic Pitch tuning-correction test, not a transcription trial"
if not any(r.get("run_id") == "r0602" for r in sox["runs"]):
    sox["runs"].append({
        "run_id": "r0602", "input_id": "S7flat30", "cores": None, "wall_s": 0.26, "peak_mb": 9.7, "exit_code": 0,
        "output_files": ["/home/user/gtr/lanes/audio-to-notes/out/sox/S7flat30.plus30c.r0602.wav"],
        "metrics": {"round": G2, "nolock": True,
                    "result": "same command logged; output differs from the 2026-11-10 file (sha256 4f54aac7...ed91933b vs 31f6f3a9...42c42eef; at most 2 units of 16-bit, SoX's default TPDF dither); runs with -R are byte-identical (samples/sox/gap2-sox-determinism.txt)"}})
sox["license"]["code"] = {
    "spdx": "GPL-2.0-or-later (sox program); LGPL-2.1-or-later (libsox)",
    "quote": "sox.c, and thus SoX-the user application, is distributed under the GPL, while the files that make up libsox are licensed under the less restrictive LGPL.",
    "url": "https://sourceforge.net/p/sox/code/ci/master/tree/COPYING?format=raw",
    "also": ["src/sox.c: \"either version 2 of the License, or (at your option) any later version\" (GPL); src/tempo.c (the pitch effect): \"either version 2.1 of the License, or (at your option) any later version\" (LGPL); read 2026-11-11"]}
sox["unverified"] = [u for u in sox["unverified"] if not u.startswith("license: not stated")]

# ---- A3 CREPE Notes: ran (r0616) ----
cn = by["CREPE Notes (crepe_notes)"]
cn["tried"] = True
cn["tried_how"] = "local-cpu"
cn["not_run_reason"] = None
cn_scores = {  # cfg: {clip: [est notes, P, R, F1, onset+offset F1, eval id, printed tuning offset cents]}
    "tcfull": {"S1": [62, 0.984, 0.984, 0.984, 0.984, "e1781", 6], "R1b": [94, 0.309, 0.414, 0.354, 0.244, "e1783", 20], "S4lead": [38, 0.737, 0.757, 0.747, 0.667, "e1785", 6]},
    "tctiny": {"S1": [62, 1.0, 1.0, 1.0, 1.0, "e1786", 6], "R1b": [95, 0.263, 0.357, 0.303, 0.17, "e1787", 27], "S4lead": [38, 0.868, 0.892, 0.88, 0.773, "e1788", 4]},
    "tcfullz": {"S1": [61, 0.967, 0.952, 0.959, 0.959, "e1789", 6], "R1b": [97, 0.289, 0.4, 0.335, 0.251, "e1790", 6], "S4lead": [40, 0.675, 0.73, 0.701, 0.623, "e1791", 6]},
}
cn["runs"] = [{
    "run_id": "r0616", "input_id": "S1,R1b,S4lead", "cores": 2, "wall_s": 35.19, "peak_mb": 570.9, "exit_code": 0,
    "output_files": ["/home/user/gtr/lanes/audio-to-notes/out/crepe-notes/<cfg>/<clip>.<cfg>.mid"],
    "metrics": {
        "round": G2,
        "command": "crepe_notes --f0 <clip>.f0in.csv --use-cwd --output-label <cfg> <clip>.wav (other options default; madmom 0.17.dev0 onset splitting on); 9 calls, 3.17 to 4.44 s wall each",
        "f0_inputs": "tcfull / tctiny: this lane's torchcrepe full / tiny f0 (viterbi, 10 ms) with the header renamed to time,frequency,confidence; tcfullz: full with frequency 0 where periodicity < 0.21",
        "scores_key": "clip: [est notes, onset-only P, R, F1, onset+offset F1, eval id, printed tuning offset in cents]; gtr-eval 0.11.1; S4lead against the S4 truth melody voice; truth notes S1 62, R1b 70, S4lead 37",
        "scores": cn_scores,
        "pitch0_notes_tcfullz": {"S1": 1, "R1b": 51, "S4lead": 3},
        "notes_at_midi_90_or_above_R1b": {"tcfull": 48, "tctiny": 52},
    }}]
cn["outputs"] = [
    cn["outputs"][0],
    "observed (r0616): MIDI type 1, 220 ticks per quarter, 2 tracks, program 0, tempo 120, velocities 7 to 127, no pitch bends; the estimated tuning offset is printed ('Tuning offset: ... cents') and subtracted before rounding; 0 Hz frames become MIDI pitch 0 notes",
]
cn["install_facts"] = "Python 3.11 venv: the fingerstyle-voices-taps lane's built madmom 0.17.dev0 copied in (cp -a), uv pip install --no-deps crepe-notes==0.2.0, then click, librosa 0.11.0, pretty_midi, tqdm and matplotlib (imported at crepe_notes.py line 6 but not a declared requirement); freeze samples/crepe-notes/"

# ---- A4 madmom: the box's installs, one SPDX id ----
mm = by["madmom"]
mm["version"] = ("PyPI 0.16.1 (single source archive madmom-0.16.1.tar.gz, 20,040,947 bytes, no wheel); last commit "
                 "2024-08-25 (27f032e). On this box: 0.16.1 built from that archive on Python 3.9 by chords-beats-key "
                 "(r0047); 0.17.dev0 from git (27f032e8) by fingerstyle-voices-taps; a copy of the latter ran inside "
                 "CREPE Notes here (r0616)")
mm["not_run_reason"] = ("not run on its own in this lane; its CNNOnsetProcessor ran inside CREPE Notes in r0616 (" + G2 +
                        "). Was: 'its only PyPI file is a source archive, so installing it means compiling it; not attempted'")
mm["license"]["code"]["spdx"] = "BSD-2-Clause"
mm["license"]["code"]["note"] = "two numbered conditions and no third clause in LICENSE (re-read 2026-11-11); was 'BSD' here until " + G2
mm["license"]["weights"]["spdx"] = "CC-BY-NC-SA-4.0"

# ---- A5 melodyExtraction_JDC, melodyExtraction_SSL, MTANet, Deep Salience: specific reasons ----
REFUSAL = ("Permission for this action was denied by the Claude Code auto mode classifier. "
           "Reason: [Code from External].")
A5_COMMON = ("runs only from its cloned repository (no package from the authors); in " + G2 + " running the Deep "
             "Salience clone's predict_on_audio.py --help was refused by the session's permission system (\"" + REFUSAL +
             "\"), and no TensorFlow or Keras venv was on the box (trials.md, Gap round 2, A5)")
a5 = {
    "melodyExtraction_JDC": dict(
        reason="NOT RUN HERE: " + A5_COMMON + ". README pins Keras 2.2.2, Librosa 0.6.2, madmom 0.16.1, Python 3.6+; no TensorFlow version named.",
        weights="weights/ResNet_joint_add_L(CE_G).hdf5, 16,867,888 bytes, and weights/model.json, in the repository (86e6d2b)",
        for_aaron=True),
    "melodyExtraction_SSL": dict(
        reason="NOT RUN HERE: " + A5_COMMON + ". README pins Keras 2.3.0, Librosa 0.7.0, madmom 0.16.1, pysndfx 0.3.6, Python 3.7+; no TensorFlow version named.",
        weights="weights/ResNet_NS.hdf5, 17,056,656 bytes, in the repository (eb2525d)",
        for_aaron=True),
    "Deep Salience (ismir2017-deepsalience)": dict(
        reason="NOT RUN HERE: " + A5_COMMON + ". replicate.yaml pins Python 2.7.15, tensorflow 1.12.0, keras 2.0.3, librosa 0.5.0, mir_eval 0.4, pescador 1.0.0, joblib 0.11.",
        weights=None, for_aaron=True),
    "MTANet": dict(
        reason="NOT RUN HERE: no trained weights are published (no checkpoint in the repository at 2856a89, config.py resume_checkpoint = None, README links only training data); PyTorch and PyTorch Lightning; main.py imports model.multi_dr and model.danet, which the repository does not hold (" + G2 + ").",
        weights=None, for_aaron=False),
}
for name, v in a5.items():
    t = by[name]
    t["not_run_reason"] = v["reason"]
    t["for_aaron"] = v["for_aaron"]
    if v["weights"]:
        if t["license"]["weights"] is None:
            t["license"]["weights"] = {"name": v["weights"], "quote": None, "url": t["url"], "note": "in the MIT repository; no separate statement found"}
        else:
            t["license"]["weights"]["name"] = v["weights"]
t = by["Deep Salience (ismir2017-deepsalience)"]
t["license"]["weights"]["name"] = "predict/weights/{bass,melody1,melody2,melody3,multif0,pitch,vocal}.h5 (1,674,464 to 1,674,816 bytes each)"

# ---- A6 Essentia PitchYinProbabilistic: explicit-parameter sine check (r0647) ----
es_ = by["Essentia"]
if not any(r.get("run_id") == "r0647" for r in es_["runs"]):
    es_["runs"].append({
        "run_id": "r0647", "input_id": "synthetic sines 110, 220, 369.99, 440 Hz", "cores": None, "wall_s": 10.57,
        "peak_mb": 153.1, "exit_code": 0, "output_files": ["samples/essentia-pyin/gap2-sines-explicit.txt"],
        "metrics": {"round": G2, "nolock": True,
                    "result": "PitchYinProbabilistic with sampleRate 44100, frameSize 2048, hopSize 256, lowRMSThreshold 0.1 and outputUnvoiced negative/zero/abs set explicitly: same medians as the defaults (103.826, 138.591, 146.832, 293.665 Hz); preciseTime true: 110.0, 110.0, 73.416, 61.735 Hz; PitchYinProbabilities returns candidates as whole MIDI numbers (Essentia source: hz2midi returns int), so outputs lie on the equal-tempered grid"}})
es_["unverified"] = [
    u if not u.startswith("why Essentia's PitchYinProbabilistic returns grid frequencies") else
    "why PitchYinProbabilistic's chosen values lie below the input pitch (the grid itself comes from whole-MIDI candidates, " + G2 + ", r0647) and why its outputs differed between runs"
    for u in es_["unverified"]]

open(path, "w").write(json.dumps(d, indent=0, ensure_ascii=False))
print("ok", path, len(open(path, "rb").read()), "bytes")
