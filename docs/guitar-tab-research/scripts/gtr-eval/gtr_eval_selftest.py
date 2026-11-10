"""gtr-eval selftest: known-answer checks for every subcommand.

Part 1 builds a small fixture clip (FX1: 8 s, 120 bpm, 4/4, G major, standard tuning, a melody voice in eighth notes on
strings 1-3, a bass voice in half notes on strings 4-6, four chords, eight taps, two synthesized stems) and writes
estimate files whose correct scores are known in advance: the truth itself, the truth shifted in time, transposed,
with half the notes removed, at double tempo, and so on. Part 2 (--truth / --all-inputs) runs the same kind of checks
on real truth files, using only answers that follow from the truth itself (scoring the truth against itself gives
1.0; shifts that cannot collide with other notes give 0).
"""
import copy
import json
import math
import os
import subprocess
import sys
import tempfile

import numpy as np

import gtr_eval as G

HERE = os.path.dirname(os.path.abspath(__file__))
FIXDIR = os.path.join(HERE, "fixtures")
TUN = [40, 45, 50, 55, 59, 64]


# ----------------------------------------------------------------------------------------------------------------
# fixture
# ----------------------------------------------------------------------------------------------------------------

def fixture_truth(capo=0, tuning=None):
    tun = tuning or TUN
    mel = [(2, 0), (2, 3), (1, 3), (1, 0), (3, 2), (2, 1), (1, 2), (3, 0)]
    bas = [(6, 3), (4, 0), (5, 3), (4, 0)]
    notes = []
    for k in range(32):
        s, f = mel[k % 8]
        t = k * 0.25
        notes.append({"onset": round(t, 3), "offset": round(t + 0.2, 3), "pitch": tun[6 - s] + capo + f, "velocity": 90,
                      "voice": "melody", "string": s, "fret": f})
    for k in range(8):
        s, f = bas[k % 4]
        t = float(k)
        notes.append({"onset": t, "offset": round(t + 0.9, 3), "pitch": tun[6 - s] + capo + f, "velocity": 100,
                      "voice": "bass", "string": s, "fret": f})
    notes.sort(key=lambda n: (n["onset"], n["pitch"]))
    return {
        "id": "FX1", "title": "gtr-eval fixture", "what": "synthetic fixture for gtr-eval selftest (sine partials)",
        "audio": "FX1.wav", "duration_s": 8.0, "sample_rate": 16000, "channels": 1,
        "tempo_bpm": 120.0, "time_signature": "4/4", "key": "G major",
        "tuning_midi": tun, "capo": capo, "tuning_offset_cents": 0,
        "notes": notes,
        "beats": [k * 0.5 for k in range(16)], "downbeats": [0.0, 2.0, 4.0, 6.0],
        "chords": [{"start": 0.0, "end": 2.0, "label": "G:maj"}, {"start": 2.0, "end": 4.0, "label": "C:maj"},
                   {"start": 4.0, "end": 6.0, "label": "D:7"}, {"start": 6.0, "end": 8.0, "label": "E:min7"}],
        "taps": [{"time": 0.5 + k, "kind": "thump"} for k in range(8)],
        "stems": {"guitar": "stems/guitar.wav", "bass": "stems/bass.wav"},
        "source": {"kind": "synthesized", "url": None, "license": "made by gtr-eval selftest", "license_quote": None,
                   "attribution": None},
    }


def synth(notes, sr, dur):
    t_all = np.arange(int(sr * dur)) / sr
    y = np.zeros_like(t_all)
    for n in notes:
        f0 = 440.0 * 2 ** ((n["pitch"] - 69) / 12)
        i0, i1 = int(n["onset"] * sr), int(n["offset"] * sr)
        t = np.arange(i1 - i0) / sr
        env = np.exp(-3 * t) * np.minimum(1, t / 0.005) * np.minimum(1, (t[::-1] + 1 / sr) / 0.005)
        for h, amp in ((1, 1.0), (2, 0.5), (3, 0.25), (4, 0.12)):
            y[i0:i1] += 0.15 * amp * env * np.sin(2 * np.pi * f0 * h * t)
    return y


def ensure_fixture():
    import soundfile as sf
    d = os.path.join(FIXDIR, "FX1")
    os.makedirs(os.path.join(d, "stems"), exist_ok=True)
    T = fixture_truth()
    path = os.path.join(d, "FX1.truth.json")
    # write each file under a temporary name and rename it, so two selftests running at once never read a half file
    tag = f".tmp{os.getpid()}"
    with open(path + tag, "w") as f:
        json.dump(T, f, indent=1)
    os.replace(path + tag, path)
    sr = T["sample_rate"]
    g = synth([n for n in T["notes"] if n["voice"] == "melody"], sr, T["duration_s"])
    b = synth([n for n in T["notes"] if n["voice"] == "bass"], sr, T["duration_s"])
    for rel, y in (("stems/guitar.wav", g), ("stems/bass.wav", b), ("FX1.wav", g + b)):
        out = os.path.join(d, rel)
        sf.write(out + tag, y, sr, subtype="FLOAT", format="WAV")
        os.replace(out + tag, out)
    return path, T


# ----------------------------------------------------------------------------------------------------------------
# estimate writers
# ----------------------------------------------------------------------------------------------------------------

def w_notes_csv(path, notes, hz=False, header=True, shift=0.0, pshift=0.0):
    with open(path, "w") as f:
        if header:
            f.write("onset,offset," + ("frequency_hz" if hz else "pitch_midi") + "\n")
        for n in notes:
            p = n["pitch"] + pshift
            p = 440.0 * 2 ** ((p - 69) / 12) if hz else p
            f.write(f"{n['onset'] + shift:.6f},{n['offset'] + shift:.6f},{p:.6f}\n")
    return path


def w_lines(path, values, fmt="{:.6f}"):
    with open(path, "w") as f:
        for v in values:
            f.write((fmt.format(v) if not isinstance(v, str) else v) + "\n")
    return path


def w_midi(path, notes, split_voices=False):
    import pretty_midi
    pm = pretty_midi.PrettyMIDI(initial_tempo=120)
    groups = {"melody": 24, "bass": 33} if split_voices else {None: 24}
    for voice, prog in groups.items():
        inst = pretty_midi.Instrument(program=prog, name=str(voice))
        for n in notes:
            if voice is None or n.get("voice") == voice:
                inst.notes.append(pretty_midi.Note(velocity=int(n.get("velocity", 90)), pitch=int(n["pitch"]),
                                                   start=float(n["onset"]), end=float(n["offset"])))
        pm.instruments.append(inst)
    drum = pretty_midi.Instrument(program=0, is_drum=True, name="drums")
    drum.notes.append(pretty_midi.Note(velocity=100, pitch=36, start=0.0, end=0.1))
    pm.instruments.append(drum)
    pm.write(path)
    return path


def w_tab_json(path, notes, tuning=None, capo=None, order=False):
    d = {"notes": [{"onset": (i if order else n["onset"]), "pitch": n["pitch"], "string": n["string"], "fret": n["fret"]}
                   for i, n in enumerate(notes)]}
    if tuning is not None:
        d["tuning_midi"] = tuning
    if capo is not None:
        d["capo"] = capo
    with open(path, "w") as f:
        json.dump(d, f)
    return path


def w_ascii_tab(path, notes, per_line=12):
    groups = {}
    for n in notes:
        groups.setdefault(n["onset"], []).append(n)
    keys = sorted(groups)
    lines_out = []
    names = ["e", "B", "G", "D", "A", "E"]
    for b0 in range(0, len(keys), per_line):
        rows = [names[i] + "|-" for i in range(6)]
        for k in keys[b0:b0 + per_line]:
            cells = ["---"] * 6
            for n in groups[k]:
                cells[n["string"] - 1] = f"{n['fret']}".ljust(3, "-")
            rows = [r + c for r, c in zip(rows, cells)]
        lines_out += [r + "|" for r in rows] + [""]
    with open(path, "w") as f:
        f.write("Fixture tab\n\n" + "\n".join(lines_out))
    return path


def w_gp5(path, T):
    import guitarpro
    from guitarpro import models as M
    song = M.Song()
    song.tempo = int(T["tempo_bpm"])
    nmeas = int(T["duration_s"] / 2.0)
    for i in range(1, nmeas):
        h = M.MeasureHeader(number=i + 1, start=960 + i * 3840)
        song.addMeasureHeader(h)
    track = song.tracks[0]
    track.measures = [M.Measure(track, h) for h in song.measureHeaders]
    track.offset = T["capo"]
    mel = [n for n in T["notes"] if n["voice"] == "melody"]
    bas = [n for n in T["notes"] if n["voice"] == "bass"]
    for mi, meas in enumerate(track.measures):
        v0, v1 = meas.voices[0], meas.voices[1]
        for n in mel:
            if mi * 2.0 <= n["onset"] < (mi + 1) * 2.0:
                b = M.Beat(v0, duration=M.Duration(value=8), status=M.BeatStatus.normal)
                b.notes.append(M.Note(b, value=n["fret"], string=n["string"], type=M.NoteType.normal))
                v0.beats.append(b)
        for n in bas:
            if mi * 2.0 <= n["onset"] < (mi + 1) * 2.0:
                b = M.Beat(v1, duration=M.Duration(value=2), status=M.BeatStatus.normal)
                b.notes.append(M.Note(b, value=n["fret"], string=n["string"], type=M.NoteType.normal))
                v1.beats.append(b)
    guitarpro.write(song, path)
    return path


PC_NAMES = [("C", 0), ("C", 1), ("D", 0), ("D", 1), ("E", 0), ("F", 0), ("F", 1), ("G", 0), ("G", 1), ("A", 0), ("A", 1), ("B", 0)]


def w_musicxml(path, T, compressed=False):
    """Partwise MusicXML: divisions 4, melody (eighths) as voice 1, bass (halves) as voice 2 after <backup>, TAB marks."""
    tun = T["tuning_midi"]
    def pitch_xml(m):
        st, al = PC_NAMES[m % 12]
        return (f"<pitch><step>{st}</step>" + (f"<alter>{al}</alter>" if al else "") + f"<octave>{m // 12 - 1}</octave></pitch>")
    def note_xml(n, dur, typ, voice):
        return (f"<note>{pitch_xml(n['pitch'])}<duration>{dur}</duration><voice>{voice}</voice><type>{typ}</type>"
                f"<notations><technical><string>{n['string']}</string><fret>{n['fret']}</fret></technical></notations></note>")
    names = ["C", "D", "E", "F", "G", "A", "B"]
    tun_xml = ""
    for line, m in enumerate(tun, start=1):
        st, al = PC_NAMES[m % 12]
        tun_xml += (f'<staff-tuning line="{line}"><tuning-step>{st}</tuning-step>' + (f"<tuning-alter>{al}</tuning-alter>" if al else "")
                    + f"<tuning-octave>{m // 12 - 1}</tuning-octave></staff-tuning>")
    meas = []
    mel = [n for n in T["notes"] if n["voice"] == "melody"]
    bas = [n for n in T["notes"] if n["voice"] == "bass"]
    for mi in range(int(T["duration_s"] / 2)):
        body = ""
        if mi == 0:
            body += ("<attributes><divisions>4</divisions><time><beats>4</beats><beat-type>4</beat-type></time>"
                     f"<clef><sign>TAB</sign><line>5</line></clef><staff-details><staff-lines>{len(tun)}</staff-lines>{tun_xml}"
                     + (f"<capo>{T['capo']}</capo>" if T["capo"] else "") + "</staff-details></attributes>"
                     '<direction placement="above"><direction-type><words>q=120</words></direction-type><sound tempo="120"/></direction>')
        for n in mel:
            if mi * 2.0 <= n["onset"] < (mi + 1) * 2.0:
                body += note_xml(n, 2, "eighth", 1)
        body += "<backup><duration>16</duration></backup>"
        for n in bas:
            if mi * 2.0 <= n["onset"] < (mi + 1) * 2.0:
                body += note_xml(n, 8, "half", 2)
        meas.append(f'<measure number="{mi + 1}">{body}</measure>')
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n<score-partwise version="4.0"><part-list><score-part id="P1">'
           '<part-name>Guitar</part-name></score-part></part-list><part id="P1">' + "".join(meas) + "</part></score-partwise>")
    if compressed:
        import zipfile
        with zipfile.ZipFile(path, "w") as z:
            z.writestr("META-INF/container.xml", '<?xml version="1.0"?><container><rootfiles><rootfile full-path="score.musicxml"/></rootfiles></container>')
            z.writestr("score.musicxml", xml)
    else:
        with open(path, "w") as f:
            f.write(xml)
    return path


# ----------------------------------------------------------------------------------------------------------------
# runner
# ----------------------------------------------------------------------------------------------------------------

class Results:
    def __init__(self):
        self.rows = []

    def check(self, name, ok, detail=""):
        self.rows.append({"check": name, "result": "PASS" if ok else "FAIL", "detail": detail})
        print(f"{'PASS' if ok else 'FAIL'} {name}" + (f"  | {detail}" if detail else ""), flush=True)

    def na(self, name, why):
        self.rows.append({"check": name, "result": "N/A", "detail": why})
        print(f"N/A  {name}  | {why}", flush=True)

    def run(self, name, argv, test, show):
        try:
            r = G.run_args(argv)
        except Exception as e:  # noqa
            self.check(name, False, f"raised {type(e).__name__}: {e}")
            return None
        try:
            ok = bool(test(r))
            detail = show(r)
        except Exception as e:  # noqa
            ok, detail = False, f"test raised {type(e).__name__}: {e}"
        self.check(name, ok, detail)
        return r


def approx(x, y, tol=1e-6):
    return x is not None and not isinstance(x, str) and abs(float(x) - float(y)) <= tol


def part1(R, tmp, quick=False):
    tp, T = ensure_fixture()
    notes = T["notes"]
    mel = [n for n in notes if n["voice"] == "melody"]
    j = lambda *p: os.path.join(tmp, *p)  # noqa

    # ---------------- check-truth
    R.run("check-truth.fixture", ["check-truth", "--truth", tp], lambda r: r["counts"]["mismatches"] == 0,
          lambda r: f"mismatches={r['mismatches_with_schema']}")
    bad = copy.deepcopy(T)
    bad["notes"][0]["fret"] += 1
    bp = j("bad.truth.json")
    json.dump(bad, open(bp, "w"))
    R.run("check-truth.detects_wrong_fret", ["check-truth", "--truth", bp],
          lambda r: any("tuning_midi" in m for m in r["mismatches_with_schema"]), lambda r: f"{r['mismatches_with_schema'][:2]}")

    # ---------------- notes
    on = lambda r: r["metrics"]["onset_only"]  # noqa
    oo = lambda r: r["metrics"]["onset_offset"]  # noqa
    f = w_notes_csv(j("id.csv"), notes)
    R.run("notes.identity_csv_midi", ["notes", "--truth", tp, "--est", f, "--chroma"],
          lambda r: all(approx(x, 1) for x in (on(r)["f1"], oo(r)["f1"], on(r)["precision"], on(r)["recall"],
                                               r["metrics"]["chroma_onset_only"]["f1"])),
          lambda r: f"onset_f1={on(r)['f1']} onoff_f1={oo(r)['f1']} chroma_f1={r['metrics']['chroma_onset_only']['f1']}")
    f = w_notes_csv(j("id_hz.csv"), notes, hz=True)
    R.run("notes.identity_csv_hz_detected", ["notes", "--truth", tp, "--est", f],
          lambda r: approx(on(r)["f1"], 1) and any("read as Hz" in p for p in r["processing"]),
          lambda r: f"onset_f1={on(r)['f1']} unit_note={[p for p in r['processing'] if 'pitch unit' in p]}")
    f = w_notes_csv(j("id_hz_nohdr.csv"), notes, hz=True, header=False)
    R.run("notes.identity_headerless_hz_auto", ["notes", "--truth", tp, "--est", f],
          lambda r: approx(on(r)["f1"], 1), lambda r: f"onset_f1={on(r)['f1']}")
    f = w_midi(j("id.mid"), notes)
    R.run("notes.identity_midi", ["notes", "--truth", tp, "--est", f],
          lambda r: approx(on(r)["f1"], 1) and approx(oo(r)["f1"], 1), lambda r: f"onset_f1={on(r)['f1']} onoff_f1={oo(r)['f1']}")
    f = w_midi(j("split.mid"), notes, split_voices=True)
    R.run("notes.midi_programs_filter", ["notes", "--truth", tp, "--est", f, "--midi-programs", "24-31"],
          lambda r: approx(r["metrics"]["recall_by_voice"]["melody"]["onset_only_recall"], 1)
          and approx(r["metrics"]["recall_by_voice"]["bass"]["onset_only_recall"], 0) and r["counts"]["n_est"] == 32,
          lambda r: f"n_est={r['counts']['n_est']} instruments={[(i['program'], i['used']) for i in r['est']['instruments']]}")
    jp = j("id.json")
    json.dump([{"onset": n["onset"], "offset": n["offset"], "pitch": n["pitch"]} for n in notes], open(jp, "w"))
    R.run("notes.identity_json", ["notes", "--truth", tp, "--est", jp],
          lambda r: approx(on(r)["f1"], 1), lambda r: f"onset_f1={on(r)['f1']}")
    R.run("notes.truth_file_as_estimate", ["notes", "--truth", tp, "--est", tp],
          lambda r: approx(on(r)["f1"], 1), lambda r: f"onset_f1={on(r)['f1']}")
    f = w_notes_csv(j("sh100.csv"), notes, shift=0.1)
    R.run("notes.shift_100ms_gives_0", ["notes", "--truth", tp, "--est", f],
          lambda r: approx(on(r)["f1"], 0) and r["counts"]["n_matched_onset_only"] == 0, lambda r: f"onset_f1={on(r)['f1']}")
    R.run("notes.negative_times_after_shift", ["notes", "--truth", tp, "--est", w_notes_csv(j("id2.csv"), notes), "--time-shift", "-0.03"],
          lambda r: approx(on(r)["f1"], 1) and any("negative" in p for p in r["processing"]), lambda r: f"onset_f1={on(r)['f1']}")
    R.run("notes.shift_100ms_undone_by_time_shift", ["notes", "--truth", tp, "--est", f, "--time-shift", "-0.1"],
          lambda r: approx(on(r)["f1"], 1), lambda r: f"onset_f1={on(r)['f1']}")
    f = w_notes_csv(j("sh40.csv"), notes, shift=0.04)
    R.run("notes.shift_40ms_within_50ms_tol", ["notes", "--truth", tp, "--est", f],
          lambda r: approx(on(r)["f1"], 1) and approx(r["metrics"]["onset_timing_of_matched"]["median_s"], 0.04)
          and approx(r["metrics"]["onset_timing_of_matched"]["max_abs_s"], 0.04),
          lambda r: f"onset_f1={on(r)['f1']} timing={r['metrics']['onset_timing_of_matched']}")
    f = w_notes_csv(j("sh50.csv"), notes, shift=0.05)
    R.run("notes.shift_exactly_50ms_matches", ["notes", "--truth", tp, "--est", f],
          lambda r: approx(on(r)["f1"], 1), lambda r: f"onset_f1={on(r)['f1']}")
    R.run("notes.onset_tol_option", ["notes", "--truth", tp, "--est", f, "--onset-tol", "0.03"],
          lambda r: approx(on(r)["f1"], 0), lambda r: f"onset_f1={on(r)['f1']} with --onset-tol 0.03")
    f = w_notes_csv(j("tr1.csv"), notes, pshift=1)
    R.run("notes.transpose_1_semitone_gives_0", ["notes", "--truth", tp, "--est", f, "--chroma"],
          lambda r: approx(on(r)["f1"], 0), lambda r: f"onset_f1={on(r)['f1']}")
    R.run("notes.transpose_undone_by_pitch_shift", ["notes", "--truth", tp, "--est", f, "--pitch-shift", "-1"],
          lambda r: approx(on(r)["f1"], 1), lambda r: f"onset_f1={on(r)['f1']}")
    f = w_notes_csv(j("oct.csv"), notes, pshift=12)
    R.run("notes.octave_up_0_but_chroma_1", ["notes", "--truth", tp, "--est", f, "--chroma"],
          lambda r: approx(on(r)["f1"], 0) and approx(r["metrics"]["chroma_onset_only"]["f1"], 1)
          and approx(r["metrics"]["chroma_onset_offset"]["f1"], 1),
          lambda r: f"onset_f1={on(r)['f1']} chroma_f1={r['metrics']['chroma_onset_only']['f1']}")
    f = w_notes_csv(j("c30.csv"), notes, hz=True, pshift=0.30)
    R.run("notes.30_cents_sharp_still_matches", ["notes", "--truth", tp, "--est", f],
          lambda r: approx(on(r)["f1"], 1), lambda r: f"onset_f1={on(r)['f1']}")
    f = w_notes_csv(j("c60.csv"), notes, hz=True, pshift=0.60)
    R.run("notes.60_cents_sharp_does_not_match", ["notes", "--truth", tp, "--est", f],
          lambda r: approx(on(r)["f1"], 0), lambda r: f"onset_f1={on(r)['f1']}")
    half = notes[::2]
    f = w_notes_csv(j("half.csv"), half)
    R.run("notes.half_removed_recall_0.5", ["notes", "--truth", tp, "--est", f],
          lambda r: approx(on(r)["recall"], 0.5) and approx(on(r)["precision"], 1),
          lambda r: f"recall={on(r)['recall']} precision={on(r)['precision']}")
    f = w_notes_csv(j("mel.csv"), mel)
    R.run("notes.recall_by_voice", ["notes", "--truth", tp, "--est", f],
          lambda r: approx(r["metrics"]["recall_by_voice"]["melody"]["onset_only_recall"], 1)
          and approx(r["metrics"]["recall_by_voice"]["bass"]["onset_only_recall"], 0),
          lambda r: json.dumps({v: x["onset_only_recall"] for v, x in r["metrics"]["recall_by_voice"].items()}))
    R.run("notes.voice_filter", ["notes", "--truth", tp, "--est", f, "--voice", "melody"],
          lambda r: approx(on(r)["f1"], 1) and r["counts"]["n_truth"] == 32, lambda r: f"onset_f1={on(r)['f1']} n_truth={r['counts']['n_truth']}")
    halfdur = [dict(n, offset=n["onset"] + (n["offset"] - n["onset"]) / 2) for n in notes]
    f = w_notes_csv(j("halfdur.csv"), halfdur)
    R.run("notes.offsets_halved_onset_1_onoff_0", ["notes", "--truth", tp, "--est", f],
          lambda r: approx(on(r)["f1"], 1) and approx(oo(r)["f1"], 0), lambda r: f"onset_f1={on(r)['f1']} onoff_f1={oo(r)['f1']}")
    ons = w_lines(j("onsets_only.csv"), [f"{n['onset']},{n['pitch']}" for n in notes])
    R.run("notes.onset_pitch_only_file", ["notes", "--truth", tp, "--est", ons, "--cols", "onset,pitch"],
          lambda r: approx(on(r)["f1"], 1) and r["metrics"]["onset_offset"] is None, lambda r: f"onset_f1={on(r)['f1']} onoff={oo(r)}")
    # the custom (chroma-capable) matcher equals mir_eval.transcription.match_notes when chroma is off
    import mir_eval
    rng = np.random.default_rng(7)
    ref_iv = np.array([[n["onset"], n["offset"]] for n in notes])
    ref_hz = G.midi_to_hz([n["pitch"] for n in notes])
    same = True
    for trial in range(20):
        est_iv = ref_iv + rng.normal(0, 0.04, ref_iv.shape)
        est_iv[:, 1] = np.maximum(est_iv[:, 1], est_iv[:, 0])
        est_hz = ref_hz * 2 ** (rng.normal(0, 40, len(ref_hz)) / 1200)
        for ratio in (None, 0.2):
            a1 = mir_eval.transcription.match_notes(ref_iv, ref_hz, est_iv, est_hz, offset_ratio=ratio)
            a2 = G.match_notes_custom(ref_iv, ref_hz, est_iv, est_hz, 0.05, 50.0, ratio, 0.05, chroma=False)
            same &= len(a1) == len(a2)
    R.check("notes.custom_matcher_equals_mir_eval", same, "40 random perturbations, match counts equal")

    # ---------------- f0
    t, fr, _ = G.truth_f0(G.Truth(tp))
    f = w_lines(j("f0.csv"), [f"{a:.4f},{b:.4f},0.9" for a, b in zip(t, fr)])
    m = lambda r: r["metrics"]  # noqa
    R.run("f0.identity", ["f0", "--truth", tp, "--est", f],
          lambda r: approx(m(r)["raw_pitch_accuracy"], 1) and approx(m(r)["voicing_recall"], 1)
          and approx(m(r)["voicing_false_alarm"], 0) and approx(m(r)["overall_accuracy"], 1),
          lambda r: json.dumps(m(r)))
    f = w_lines(j("f0oct.csv"), [f"{a:.4f},{2 * b:.4f}" for a, b in zip(t, fr)])
    R.run("f0.octave_up_rpa_0_rca_1", ["f0", "--truth", tp, "--est", f],
          lambda r: approx(m(r)["raw_pitch_accuracy"], 0) and approx(m(r)["raw_chroma_accuracy"], 1), lambda r: json.dumps(m(r)))
    f = w_lines(j("f0zero.csv"), [f"{a:.4f},0" for a in t])
    R.run("f0.all_unvoiced", ["f0", "--truth", tp, "--est", f],
          lambda r: approx(m(r)["voicing_recall"], 0) and approx(m(r)["voicing_false_alarm"], 0), lambda r: json.dumps(m(r)))
    f = w_lines(j("f0conf.csv"), ["time,frequency,confidence"] + [f"{a:.4f},{b:.4f},0.2" for a, b in zip(t, fr)])
    R.run("f0.conf_threshold_unvoices_but_keeps_pitch", ["f0", "--truth", tp, "--est", f, "--conf-threshold", "0.5"],
          lambda r: approx(m(r)["voicing_recall"], 0) and approx(m(r)["raw_pitch_accuracy"], 1), lambda r: json.dumps(m(r)))
    t2 = np.arange(0, 8.0, 0.0058)
    fr2 = np.interp(t2, t, fr)
    fr2 = np.array([fr[min(int(round(x / 0.01)), len(fr) - 1)] for x in t2])
    f = w_lines(j("f0hop.csv"), [f"{a:.5f},{b:.4f}" for a, b in zip(t2, fr2)])
    R.run("f0.other_hop_resampled", ["f0", "--truth", tp, "--est", f],
          lambda r: m(r)["raw_pitch_accuracy"] >= 0.95, lambda r: f"rpa={m(r)['raw_pitch_accuracy']} (frames at note edges move under interpolation)")
    f = w_lines(j("f0nan.csv"), ["time,f0"] + [f"{a:.4f},{(b if b > 0 else float('nan')):.4f}" for a, b in zip(t, fr)])
    R.run("f0.nan_means_unvoiced", ["f0", "--truth", tp, "--est", f],
          lambda r: approx(m(r)["overall_accuracy"], 1), lambda r: json.dumps(m(r)))

    # ---------------- beats
    B = np.array(T["beats"])
    bm = lambda r, k="beats": r["metrics"][k]  # noqa
    f = w_lines(j("beats.txt"), B)
    R.run("beats.identity", ["beats", "--truth", tp, "--est", f],
          lambda r: all(approx(bm(r)[k], 1) for k in ("f_measure", "CMLt", "AMLt")), lambda r: json.dumps(bm(r)))
    f = w_lines(j("beats_sh.txt"), B + 0.1)
    R.run("beats.shift_100ms_f_0", ["beats", "--truth", tp, "--est", f],
          lambda r: approx(bm(r)["f_measure"], 0), lambda r: f"F={bm(r)['f_measure']}")
    # mir_eval builds the double-tempo and off-beat variations by interpolating BETWEEN truth beats, so the
    # estimate stays inside the truth span: 31 beats at 0.25 s from 0 to 7.5 s; P = 16/31, R = 1
    dbl = np.arange(31) * 0.25
    f = w_lines(j("beats_dbl.txt"), dbl)
    R.run("beats.double_tempo", ["beats", "--truth", tp, "--est", f],
          lambda r: approx(bm(r)["f_measure"], 2 * (16 / 31) / (16 / 31 + 1)) and approx(bm(r)["AMLt"], 1) and approx(bm(r)["CMLt"], 0),
          lambda r: f"F={bm(r)['f_measure']} CMLt={bm(r)['CMLt']} AMLt={bm(r)['AMLt']}")
    f = w_lines(j("beats_off.txt"), B[:-1] + 0.25)
    R.run("beats.offbeat", ["beats", "--truth", tp, "--est", f],
          lambda r: approx(bm(r)["f_measure"], 0) and approx(bm(r)["AMLt"], 1), lambda r: f"F={bm(r)['f_measure']} AMLt={bm(r)['AMLt']}")
    rows = [f"{b:.6f}\t{(i % 4) + 1}" for i, b in enumerate(B)]
    f = w_lines(j("beats_db.txt"), rows)
    R.run("beats.downbeat_column", ["beats", "--truth", tp, "--est", f, "--downbeat-col", "2"],
          lambda r: approx(bm(r, "downbeats")["f_measure"], 1) and approx(bm(r)["f_measure"], 1), lambda r: json.dumps(bm(r, "downbeats")))
    f2 = w_lines(j("downbeats.txt"), np.array(T["downbeats"]) + 0.1)
    R.run("beats.downbeats_file_shifted", ["beats", "--truth", tp, "--est", j("beats.txt"), "--downbeats-est", f2],
          lambda r: approx(bm(r, "downbeats")["f_measure"], 0) and approx(bm(r)["f_measure"], 1), lambda r: json.dumps(bm(r, "downbeats")))
    jb = j("beats.json")
    json.dump({"bpm": 120.0, "beats": list(B), "downbeats": T["downbeats"]}, open(jb, "w"))
    R.run("beats.json_with_downbeats", ["beats", "--truth", tp, "--est", jb],
          lambda r: approx(bm(r)["f_measure"], 1) and approx(bm(r, "downbeats")["f_measure"], 1), lambda r: f"beats_F={bm(r)['f_measure']} db_F={bm(r, 'downbeats')['f_measure']}")
    R.run("beats.min_beat_time", ["beats", "--truth", tp, "--est", j("beats.txt"), "--min-beat-time", "5"],
          lambda r: bm(r)["n_truth"] == 6, lambda r: f"n_truth after trim={bm(r)['n_truth']}")

    # ---------------- tempo
    tm = lambda r: r["metrics"]  # noqa
    R.run("tempo.identity", ["tempo", "--truth", tp, "--est-bpm", "120"],
          lambda r: tm(r)["within_tolerance"] and not tm(r)["octave_error"], lambda r: json.dumps(tm(r)))
    R.run("tempo.double_flagged_octave_error", ["tempo", "--truth", tp, "--est-bpm", "240"],
          lambda r: (not tm(r)["within_tolerance"]) and tm(r)["within_tolerance_any_factor"] and tm(r)["octave_error"]
          and tm(r)["closest_factor"] == "2", lambda r: json.dumps(tm(r)))
    R.run("tempo.half_flagged_octave_error", ["tempo", "--truth", tp, "--est-bpm", "60"],
          lambda r: tm(r)["octave_error"] and tm(r)["closest_factor"] == "1/2", lambda r: f"closest={tm(r)['closest_factor']}")
    R.run("tempo.triple_any_factor_not_octave", ["tempo", "--truth", tp, "--est-bpm", "360"],
          lambda r: tm(r)["within_tolerance_any_factor"] and not tm(r)["octave_error"], lambda r: f"factors={tm(r)['factors_within_tolerance']}")
    R.run("tempo.3pct_within", ["tempo", "--truth", tp, "--est-bpm", "123.6"],
          lambda r: tm(r)["within_tolerance"], lambda r: f"dev={tm(r)['relative_deviation']}")
    R.run("tempo.5pct_outside", ["tempo", "--truth", tp, "--est-bpm", "126"],
          lambda r: not tm(r)["within_tolerance"] and not tm(r)["within_tolerance_any_factor"], lambda r: f"dev={tm(r)['relative_deviation']}")
    f = w_lines(j("bpm.txt"), ["tempo: 119.5 bpm"])
    R.run("tempo.from_file", ["tempo", "--truth", tp, "--est", f], lambda r: approx(tm(r)["est_bpm"], 119.5), lambda r: f"est={tm(r)['est_bpm']}")

    # ---------------- chords
    cm = lambda r: r["metrics"]  # noqa
    f = w_lines(j("ch.lab"), [f"{c['start']} {c['end']} {c['label']}" for c in T["chords"]])
    R.run("chords.identity_harte", ["chords", "--truth", tp, "--est", f],
          lambda r: all(approx(cm(r)[k], 1) for k in ("root", "majmin", "sevenths")), lambda r: f"root={cm(r)['root']} majmin={cm(r)['majmin']} sevenths={cm(r)['sevenths']}")
    short = {"G:maj": "G", "C:maj": "C", "D:7": "D7", "E:min7": "Em7"}
    f = w_lines(j("ch_short.lab"), [f"{c['start']}\t{c['end']}\t{short[c['label']]}" for c in T["chords"]])
    R.run("chords.identity_shorthand", ["chords", "--truth", tp, "--est", f],
          lambda r: all(approx(cm(r)[k], 1) for k in ("root", "majmin", "sevenths")) and not r["labels"]["unparsed"],
          lambda r: f"normalized={r['labels']['normalized']}")
    up = {"G:maj": "G#:maj", "C:maj": "C#:maj", "D:7": "D#:7", "E:min7": "F:min7"}
    f = w_lines(j("ch_up.lab"), [f"{c['start']} {c['end']} {up[c['label']]}" for c in T["chords"]])
    R.run("chords.transposed_root_0", ["chords", "--truth", tp, "--est", f],
          lambda r: approx(cm(r)["root"], 0), lambda r: f"root={cm(r)['root']}")
    f = w_lines(j("ch_bad.lab"), ["0 2 G", "2 4 Cfoo", "4 6 D7", "6 8 Em7"])
    R.run("chords.unparsed_listed", ["chords", "--truth", tp, "--est", f],
          lambda r: r["labels"]["unparsed"] == {"Cfoo": 1} and approx(cm(r)["root"], 0.75) and approx(cm(r)["other_mir_eval_chord_scores"]["mirex"], 0.75)
          and approx(r["counts"]["est_unparsed_duration_s"], 2.0),
          lambda r: f"unparsed={r['labels']['unparsed']} root={cm(r)['root']} mirex={cm(r)['other_mir_eval_chord_scores']['mirex']} unparsed_s={r['counts']['est_unparsed_duration_s']}")
    f = w_lines(j("ch_cp.csv"), ['"mix.wav",0.0,"G"', "2.0,C", "4.0,D7", "6.0,Em7"])
    R.run("chords.change_points_csv", ["chords", "--truth", tp, "--est", f],
          lambda r: approx(cm(r)["sevenths"], 1), lambda r: f"sevenths={cm(r)['sevenths']} fmt={r['est']['format']}")
    f = w_lines(j("ch_half.lab"), ["0 2 G", "2 4 C", "4 6 D", "6 8 Em"])
    R.run("chords.sevenths_vs_triads", ["chords", "--truth", tp, "--est", f],
          lambda r: approx(cm(r)["majmin"], 1) and approx(cm(r)["sevenths"], 0.5), lambda r: f"majmin={cm(r)['majmin']} sevenths={cm(r)['sevenths']}")
    cases = {"Am": "A:min", "Cmaj7": "C:maj7", "Amin7": "A:min7", "A:min7": "A:min7", "C/E": "C:maj/3", "F#m7b5": "F#:hdim7",
             "Bb": "Bb:maj", "N.C.": "N", "N": "N", "Bdim": "B:dim", "Csus4": "C:sus4", "E5": "E:5", "G7": "G:7",
             "Ebm": "Eb:min", "D/F#": "D:maj/3", "Am/G": "A:min/b7", "C:maj": "C:maj", "Caug": "C:aug", "C6": "C:maj6",
             "Cadd9": "C:maj(9)", "Gsus2": "G:sus2", "C#m": "C#:min", "Dbmaj7": "Db:maj7", "A:m": "A:min", "C:M7": "C:maj7"}
    bad_cases = {k: (G.normalize_chord(k)[0], v) for k, v in cases.items() if G.normalize_chord(k)[0] != v}
    R.check("chords.label_normaliser", not bad_cases, f"{len(cases)} labels; wrong: {bad_cases}")

    # ---------------- key
    km = lambda r: r["metrics"]  # noqa
    for est, ws, nm in (("G major", 1.0, "identity"), ("D major", 0.5, "fifth_above"), ("E minor", 0.3, "relative_minor"),
                        ("G minor", 0.2, "parallel"), ("Gm", 0.2, "shorthand_Gm"), ("F# major", 0.0, "other"),
                        ("g major", 1.0, "lowercase_with_mode"), ("G", 1.0, "bare_tonic_major")):
        R.run(f"key.{nm}", ["key", "--truth", tp, "--est-key", est],
              lambda r, ws=ws: approx(km(r)["weighted_score"], ws), lambda r: f"{km(r)['est_key']} -> {km(r)['weighted_score']} ({km(r)['relationship']})")

    # ---------------- tuning
    R.run("tuning.identity", ["tuning", "--truth", tp, "--est-cents", "0"],
          lambda r: approx(r["metrics"]["difference_cents"], 0), lambda r: json.dumps(r["metrics"]))
    R.run("tuning.plus_10", ["tuning", "--truth", tp, "--est-cents", "10"],
          lambda r: approx(r["metrics"]["difference_cents"], 10), lambda r: f"diff={r['metrics']['difference_cents']}")
    R.run("tuning.wrap_mod_100", ["tuning", "--truth", tp, "--est-cents", "-90"],
          lambda r: approx(r["metrics"]["difference_mod_100_cents"], 10), lambda r: f"mod100={r['metrics']['difference_mod_100_cents']}")
    R.run("tuning.a4_hz", ["tuning", "--truth", tp, "--est-a4-hz", "440"],
          lambda r: approx(r["metrics"]["est_cents"], 0), lambda r: f"est_cents={r['metrics']['est_cents']}")
    R.run("tuning.capo_and_strings", ["tuning", "--truth", tp, "--est-capo", "2", "--est-tuning-midi", "38,45,50,55,59,64"],
          lambda r: (not r["metrics"]["capo_equal"]) and r["metrics"]["string_differences_semitones"] == [-2, 0, 0, 0, 0, 0],
          lambda r: f"capo_equal={r['metrics']['capo_equal']} diffs={r['metrics']['string_differences_semitones']}")

    # ---------------- onsets
    taps = [x["time"] for x in T["taps"]]
    om = lambda r: r["metrics"]  # noqa
    f = w_lines(j("taps.txt"), taps)
    R.run("onsets.taps_identity", ["onsets", "--truth", tp, "--est", f],
          lambda r: approx(om(r)["f_measure"], 1), lambda r: json.dumps(om(r)))
    f = w_lines(j("taps60.txt"), np.array(taps) + 0.06)
    R.run("onsets.taps_shift_60ms_0", ["onsets", "--truth", tp, "--est", f],
          lambda r: approx(om(r)["f_measure"], 0), lambda r: f"F={om(r)['f_measure']}")
    f = w_lines(j("noteons.txt"), sorted({n["onset"] for n in notes}))
    R.run("onsets.note_onsets_identity", ["onsets", "--truth", tp, "--est", f, "--field", "notes"],
          lambda r: approx(om(r)["f_measure"], 1) and r["counts"]["n_truth"] == 32, lambda r: f"F={om(r)['f_measure']} n_truth={r['counts']['n_truth']}")
    jo = j("onsets.json")
    json.dump({"onsets": taps}, open(jo, "w"))
    R.run("onsets.json", ["onsets", "--truth", tp, "--est", jo], lambda r: approx(om(r)["f_measure"], 1), lambda r: f"F={om(r)['f_measure']}")
    f = w_lines(j("taps_m30.txt"), np.array(taps) - 0.03)
    R.run("onsets.taps_early_30ms_timing", ["onsets", "--truth", tp, "--est", f],
          lambda r: approx(om(r)["f_measure"], 1) and approx(om(r)["timing_of_matched"]["median_s"], -0.03),
          lambda r: f"F={om(r)['f_measure']} timing={om(r)['timing_of_matched']}")
    f = w_lines(j("taps_half.txt"), taps[::2])
    R.run("onsets.half_recall_0.5", ["onsets", "--truth", tp, "--est", f],
          lambda r: approx(om(r)["recall"], 0.5) and approx(om(r)["precision"], 1), lambda r: json.dumps(om(r)))

    # ---------------- tab
    tb = lambda r: r["metrics"]  # noqa
    f = w_tab_json(j("tab.json"), notes, TUN, 0)
    R.run("tab.identity_json", ["tab", "--truth", tp, "--est", f],
          lambda r: approx(tb(r)["same_string_and_fret_fraction_of_matched"], 1) and r["counts"]["n_matched"] == 40
          and not r["tuning_and_capo"]["tuning_differs"], lambda r: f"sf={tb(r)['same_string_and_fret_fraction_of_matched']} matched={r['counts']['n_matched']}")
    f = w_lines(j("tab.csv"), ["onset,pitch,string,fret"] + [f"{n['onset']},{n['pitch']},{n['string']},{n['fret']}" for n in notes])
    R.run("tab.identity_csv_assumed_tuning_flagged", ["tab", "--truth", tp, "--est", f],
          lambda r: approx(tb(r)["same_string_and_fret_fraction_of_matched"], 1) and r["tuning_and_capo"]["est_tuning_or_capo_assumed"],
          lambda r: f"sf={tb(r)['same_string_and_fret_fraction_of_matched']} assumed={r['tuning_and_capo']['est_tuning_or_capo_assumed']}")
    f = w_lines(j("tab_nohdr.csv"), [f"{n['onset']},{n['pitch']},{n['string']},{n['fret']}" for n in notes])
    R.run("tab.identity_csv_headerless", ["tab", "--truth", tp, "--est", f],
          lambda r: approx(tb(r)["same_string_and_fret_fraction_of_matched"], 1), lambda r: f"sf={tb(r)['same_string_and_fret_fraction_of_matched']}")
    moved = []
    for n in notes:
        if n["voice"] == "melody":
            s2 = n["string"] + 1
            moved.append(dict(n, string=s2, fret=n["pitch"] - TUN[6 - s2]))
        else:
            moved.append(n)
    f = w_tab_json(j("tab_moved.json"), moved, TUN, 0)
    R.run("tab.melody_moved_one_string_down", ["tab", "--truth", tp, "--est", f],
          lambda r: r["counts"]["n_matched"] == 40 and approx(tb(r)["same_string_and_fret_fraction_of_matched"], 0.2)
          and tb(r)["string_difference_counts"] == {"0": 8, "+1": 32},
          lambda r: f"sf={tb(r)['same_string_and_fret_fraction_of_matched']} sdiff={tb(r)['string_difference_counts']}")
    T2 = fixture_truth(capo=2)
    tp2 = j("FX1capo2.truth.json")
    T2s = dict(T2, stems={}, audio=None)
    json.dump(T2s, open(tp2, "w"))
    nocapo = [dict(n, fret=n["fret"] + 2) for n in T2["notes"]]
    f = w_tab_json(j("tab_nocapo.json"), nocapo, TUN, 0)
    R.run("tab.capo_difference_flagged", ["tab", "--truth", tp2, "--est", f],
          lambda r: r["tuning_and_capo"]["capo_differs"] and r["counts"]["n_matched"] == 40
          and approx(tb(r)["same_string_and_fret_fraction_of_matched"], 0) and approx(tb(r)["same_string_and_absolute_fret_fraction_of_matched"], 1),
          lambda r: f"capo_differs={r['tuning_and_capo']['capo_differs']} sf={tb(r)['same_string_and_fret_fraction_of_matched']} abs={tb(r)['same_string_and_absolute_fret_fraction_of_matched']}")
    T3 = fixture_truth(tuning=[38, 45, 50, 55, 59, 64])
    tp3 = j("FX1dropD.truth.json")
    json.dump(dict(T3, stems={}, audio=None), open(tp3, "w"))
    f = w_tab_json(j("tab_std.json"), T3["notes"], TUN, 0)
    R.run("tab.tuning_difference_flagged", ["tab", "--truth", tp3, "--est", f],
          lambda r: r["tuning_and_capo"]["tuning_differs"], lambda r: f"tuning_differs={r['tuning_and_capo']['tuning_differs']} matched={r['counts']['n_matched']}")
    f = w_tab_json(j("tab_order.json"), notes, TUN, 0, order=True)
    R.run("tab.ignore_time_order_alignment", ["tab", "--truth", tp, "--est", f, "--ignore-time"],
          lambda r: r["IGNORE_TIME_USED"] and approx(tb(r)["same_string_and_fret_fraction_of_matched"], 1) and r["counts"]["n_matched"] == 40,
          lambda r: f"sf={tb(r)['same_string_and_fret_fraction_of_matched']} matched={r['counts']['n_matched']}")
    f = w_ascii_tab(j("tab.txt"), notes)
    R.run("tab.ascii_tab", ["tab", "--truth", tp, "--est", f],
          lambda r: r["IGNORE_TIME_USED"] and approx(tb(r)["same_string_and_fret_fraction_of_matched"], 1) and r["counts"]["n_matched"] == 40,
          lambda r: f"sf={tb(r)['same_string_and_fret_fraction_of_matched']} matched={r['counts']['n_matched']} n_est={r['counts']['n_est']}")
    f = w_gp5(j("tab.gp5"), T)
    R.run("tab.guitar_pro_5", ["tab", "--truth", tp, "--est", f],
          lambda r: approx(tb(r)["same_string_and_fret_fraction_of_matched"], 1) and r["counts"]["n_matched"] == 40,
          lambda r: f"sf={tb(r)['same_string_and_fret_fraction_of_matched']} matched={r['counts']['n_matched']} n_est={r['counts']['n_est']}")
    f = w_gp5(j("tab_capo.gp5"), T2)
    R.run("tab.guitar_pro_5_capo", ["tab", "--truth", tp2, "--est", f],
          lambda r: approx(tb(r)["same_string_and_fret_fraction_of_matched"], 1) and not r["tuning_and_capo"]["capo_differs"],
          lambda r: f"sf={tb(r)['same_string_and_fret_fraction_of_matched']} est_capo={r['tuning_and_capo']['est']['capo']}")

    f = w_musicxml(j("tab.musicxml"), T)
    R.run("tab.musicxml", ["tab", "--truth", tp, "--est", f],
          lambda r: approx(tb(r)["same_string_and_fret_fraction_of_matched"], 1) and r["counts"]["n_matched"] == 40
          and r["tuning_and_capo"]["est"]["tuning_source"] == "stated in the estimate file",
          lambda r: f"sf={tb(r)['same_string_and_fret_fraction_of_matched']} matched={r['counts']['n_matched']} tuning={r['tuning_and_capo']['est']['tuning_midi']}")
    R.run("notes.musicxml", ["notes", "--truth", tp, "--est", f],
          lambda r: approx(r["metrics"]["onset_only"]["f1"], 1), lambda r: f"onset_f1={r['metrics']['onset_only']['f1']}")
    f = w_musicxml(j("tab_capo.mxl"), T2, compressed=True)
    R.run("tab.musicxml_compressed_capo", ["tab", "--truth", tp2, "--est", f],
          lambda r: approx(tb(r)["same_string_and_fret_fraction_of_matched"], 1) and r["counts"]["n_matched"] == 40
          and not r["tuning_and_capo"]["capo_differs"], lambda r: f"sf={tb(r)['same_string_and_fret_fraction_of_matched']} est_capo={r['tuning_and_capo']['est']['capo']}")
    f = w_ascii_tab(j("tab_capo2.txt"), T2["notes"])
    with open(f) as fh:
        txt = fh.read()
    with open(f, "w") as fh:
        fh.write("Capo: 2nd fret\n" + txt)
    R.run("tab.ascii_capo_line", ["tab", "--truth", tp2, "--est", f],
          lambda r: r["tuning_and_capo"]["est"]["capo"] == 2 and not r["tuning_and_capo"]["capo_differs"]
          and approx(tb(r)["same_string_and_fret_fraction_of_matched"], 1),
          lambda r: f"est_capo={r['tuning_and_capo']['est']['capo']} sf={tb(r)['same_string_and_fret_fraction_of_matched']}")

    # ---------------- options and input variants not covered above
    jl = j("lol.json")
    json.dump([[n["onset"], n["offset"], n["pitch"]] for n in notes], open(jl, "w"))
    R.run("notes.json_list_of_lists", ["notes", "--truth", tp, "--est", jl], lambda r: approx(on(r)["f1"], 1), lambda r: f"onset_f1={on(r)['f1']}")
    f = w_lines(j("dur.txt"), [f"{n['onset']} {n['offset'] - n['onset']:.6f} {n['pitch']}" for n in notes])
    R.run("notes.cols_onset_duration_pitch", ["notes", "--truth", tp, "--est", f, "--cols", "onset,duration,pitch"],
          lambda r: approx(on(r)["f1"], 1) and approx(oo(r)["f1"], 1), lambda r: f"onset_f1={on(r)['f1']} onoff={oo(r)['f1']}")
    jh = j("hz.json")
    json.dump({"notes": [{"start": n["onset"], "end": n["offset"], "pitch_hz": 440 * 2 ** ((n["pitch"] - 69) / 12)} for n in notes]}, open(jh, "w"))
    R.run("notes.json_start_end_pitch_hz", ["notes", "--truth", tp, "--est", jh],
          lambda r: approx(on(r)["f1"], 1) and any("Hz" in p for p in r["processing"]), lambda r: f"onset_f1={on(r)['f1']}")
    tb_, fb_, _ = G.truth_f0(G.Truth(tp), voice="bass")
    f = w_lines(j("f0bass.csv"), [f"{a:.4f},{b:.4f}" for a, b in zip(tb_, fb_)])
    R.run("f0.voice_bass", ["f0", "--truth", tp, "--est", f, "--voice", "bass"],
          lambda r: approx(r["metrics"]["raw_pitch_accuracy"], 1) and approx(r["metrics"]["overall_accuracy"], 1), lambda r: json.dumps(r["metrics"]))
    f = w_lines(j("f0midi.csv"), ["time,midi"] + [f"{a:.4f},{(69 + 12 * math.log2(b / 440) if b > 0 else 0):.4f}" for a, b in zip(t, fr)])
    R.run("f0.midi_unit_from_header", ["f0", "--truth", tp, "--est", f],
          lambda r: approx(r["metrics"]["overall_accuracy"], 1), lambda r: json.dumps(r["metrics"]))
    T80 = dict(fixture_truth(), tuning_offset_cents=80, stems={}, audio=None)
    tp80 = j("FX1cents80.truth.json")
    json.dump(T80, open(tp80, "w"))
    f = w_lines(j("f0nominal.csv"), [f"{a:.4f},{b:.4f}" for a, b in zip(t, fr)])
    R.run("f0.tuning_offset_applied_to_reference", ["f0", "--truth", tp80, "--est", f],
          lambda r: approx(r["metrics"]["raw_pitch_accuracy"], 0), lambda r: f"rpa={r['metrics']['raw_pitch_accuracy']} (est 80 cents below the reference)")
    R.run("f0.nominal_ignores_tuning_offset", ["f0", "--truth", tp80, "--est", f, "--nominal"],
          lambda r: approx(r["metrics"]["raw_pitch_accuracy"], 1), lambda r: f"rpa={r['metrics']['raw_pitch_accuracy']}")
    R.run("notes.apply_tuning_offset", ["notes", "--truth", tp80, "--est", w_notes_csv(j("n80.csv"), notes), "--apply-tuning-offset"],
          lambda r: approx(on(r)["f1"], 0), lambda r: f"onset_f1={on(r)['f1']} (truth shifted +80 cents, estimate nominal)")
    f = w_lines(j("cents.txt"), ["estimated tuning: -12.5 cents"])
    R.run("tuning.from_file", ["tuning", "--truth", tp, "--est", f], lambda r: approx(r["metrics"]["est_cents"], -12.5), lambda r: f"est={r['metrics']['est_cents']}")
    f = w_lines(j("key.txt"), ["E minor"])
    R.run("key.from_file", ["key", "--truth", tp, "--est", f], lambda r: approx(r["metrics"]["weighted_score"], 0.3), lambda r: f"ws={r['metrics']['weighted_score']}")
    jc = j("chords.json")
    json.dump({"chords": [{"start": c["start"], "end": c["end"], "label": c["label"]} for c in T["chords"]]}, open(jc, "w"))
    R.run("chords.json", ["chords", "--truth", tp, "--est", jc], lambda r: approx(r["metrics"]["sevenths"], 1), lambda r: f"sevenths={r['metrics']['sevenths']}")
    f = w_tab_json(j("tab_dropd_declared.json"), notes, [38, 45, 50, 55, 59, 64], 0)
    R.run("tab.est_tuning_option_overrides_file", ["tab", "--truth", tp, "--est", f, "--est-tuning", "40,45,50,55,59,64"],
          lambda r: r["tuning_and_capo"]["est"]["tuning_source"] == "--est-tuning" and not r["tuning_and_capo"]["tuning_differs"]
          and approx(r["metrics"]["same_string_and_fret_fraction_of_matched"], 1), lambda r: json.dumps(r["tuning_and_capo"]["est"]))
    shifted = [dict(n, onset=n["onset"] + 0.1) for n in notes]
    f = w_tab_json(j("tab_shift.json"), shifted, TUN, 0)
    R.run("tab.shift_100ms_no_match", ["tab", "--truth", tp, "--est", f],
          lambda r: r["counts"]["n_matched"] == 0, lambda r: f"matched={r['counts']['n_matched']}")
    R.run("tab.time_shift_option", ["tab", "--truth", tp, "--est", f, "--time-shift", "-0.1"],
          lambda r: r["counts"]["n_matched"] == 40, lambda r: f"matched={r['counts']['n_matched']}")
    R.run("tab.voice_option", ["tab", "--truth", tp, "--est", w_tab_json(j("tab_mel.json"), mel, TUN, 0), "--voice", "melody"],
          lambda r: r["counts"]["n_truth"] == 32 and r["counts"]["n_matched"] == 32, lambda r: json.dumps(r["counts"]))
    xmlT = copy.deepcopy(T)
    for n in xmlT["notes"]:
        n["pitch"] += 12  # written an octave above sounding, as a guitar part
    f = w_musicxml(j("written8va.musicxml"), xmlT)
    with open(f) as fh:
        txt = fh.read()
    with open(f, "w") as fh:
        fh.write(txt.replace("<divisions>4</divisions>", "<divisions>4</divisions><transpose><diatonic>0</diatonic><chromatic>0</chromatic><octave-change>-1</octave-change></transpose>", 1))
    R.run("notes.musicxml_transpose_octave", ["notes", "--truth", tp, "--est", f],
          lambda r: approx(on(r)["f1"], 1), lambda r: f"onset_f1={on(r)['f1']}")

    # ---------------- tab-frames
    hop = 0.02
    grid = np.arange(int(8.0 / hop) + 1) * hop
    def frames_rows(nts):
        rows = []
        for k, t in enumerate(grid):
            for n in nts:
                if n["onset"] - 1e-9 <= t < n["offset"] - 1e-9:
                    rows.append((t, n["string"], n["fret"]))
        return rows
    rows = frames_rows(notes)
    f = w_lines(j("frames_long.csv"), ["time,string,fret"] + [f"{t:.4f},{s_},{f_}" for t, s_, f_ in rows])
    fm = lambda r: r["metrics"]  # noqa
    R.run("tab-frames.identity_long", ["tab-frames", "--truth", tp, "--est", f, "--hop", "0.02"],
          lambda r: approx(fm(r)["tab_f1"], 1) and approx(fm(r)["pitch_f1"], 1), lambda r: json.dumps(fm(r)))
    R.run("tab-frames.identity_long_hop_inferred", ["tab-frames", "--truth", tp, "--est", f],
          lambda r: approx(fm(r)["tab_f1"], 1) and approx(r["counts"]["hop_s"], 0.02), lambda r: f"hop={r['counts']['hop_s']} F={fm(r)['tab_f1']}")
    mat = []
    for t in grid:
        cells = ["-1"] * 6
        for t2, s_, f_ in rows:
            if abs(t2 - t) < 1e-9:
                cells[s_ - 1] = str(f_)
        mat.append(f"{t:.4f}," + ",".join(cells))
    f = w_lines(j("frames_matrix.csv"), mat)
    R.run("tab-frames.identity_matrix", ["tab-frames", "--truth", tp, "--est", f],
          lambda r: approx(fm(r)["tab_f1"], 1) and approx(fm(r)["pitch_f1"], 1), lambda r: json.dumps(fm(r)))
    rows_m = frames_rows(moved)
    f = w_lines(j("frames_moved.csv"), ["time,string,fret"] + [f"{t:.4f},{s_},{f_}" for t, s_, f_ in rows_m])
    n_mel = sum(1 for t, s_, f_ in rows if s_ <= 3)
    R.run("tab-frames.melody_moved_pitch_1_tab_lower", ["tab-frames", "--truth", tp, "--est", f, "--hop", "0.02"],
          lambda r, k=(len(rows) - n_mel) / len(rows): approx(fm(r)["pitch_f1"], 1) and approx(fm(r)["tab_precision"], k),
          lambda r: f"pitch_f1={fm(r)['pitch_f1']} tab_P={fm(r)['tab_precision']} expected={(len(rows) - n_mel) / len(rows):.6f}")
    f = w_lines(j("frames_empty.csv"), ["time,string,fret", "0.0,1,-1", "0.02,1,-1"])
    R.run("tab-frames.all_silent", ["tab-frames", "--truth", tp, "--est", f, "--hop", "0.02"],
          lambda r: approx(fm(r)["tab_recall"], 0) and r["counts"]["est_activations"] == 0, lambda r: json.dumps(r["counts"]))

    # ---------------- stems
    if quick:
        R.na("stems.*", "--quick")
    else:
        import soundfile as sf
        d = os.path.dirname(tp)
        g, sr = sf.read(os.path.join(d, "stems", "guitar.wav"))
        b, _ = sf.read(os.path.join(d, "stems", "bass.wav"))
        ed = j("est_stems")
        os.makedirs(ed, exist_ok=True)
        sf.write(os.path.join(ed, "guitar.wav"), g, sr, subtype="FLOAT")
        sf.write(os.path.join(ed, "bass.wav"), b, sr, subtype="FLOAT")
        ps = lambda r: r["metrics"]["per_stem"]  # noqa
        R.run("stems.identity", ["stems", "--truth", tp, "--est-dir", ed],
              lambda r: all((x["si_sdr_db"] == "inf" or x["si_sdr_db"] > 100) and (x["sdr_db"] == "inf" or x["sdr_db"] > 60) for x in ps(r).values()),
              lambda r: json.dumps(ps(r)))
        rng = np.random.default_rng(3)
        ng = rng.normal(0, 1, len(g))
        ng = ng - ng.mean()
        gz = g - g.mean()
        ng *= math.sqrt(np.dot(gz, gz) / np.dot(ng, ng)) / math.sqrt(10.0)  # 10 dB SNR
        ed2 = j("est_noisy")
        os.makedirs(ed2, exist_ok=True)
        sf.write(os.path.join(ed2, "guitar.wav"), g + ng, sr, subtype="FLOAT")
        R.run("stems.noise_10dB_si_sdr_10", ["stems", "--truth", tp, "--est-dir", ed2, "--map", "guitar=guitar.wav"],
              lambda r: abs(ps(r)["guitar"]["si_sdr_db"] - 10) < 0.3, lambda r: json.dumps(ps(r)))
        R.run("stems.single_mode", ["stems", "--truth", tp, "--est-dir", ed, "--sdr-mode", "single"],
              lambda r: all("sir_db" not in x and (x["sdr_db"] == "inf" or x["sdr_db"] > 60) for x in ps(r).values()), lambda r: json.dumps(ps(r)))
        R.run("stems.ref_dir_option", ["stems", "--truth", tp, "--ref-dir", os.path.join(d, "stems"), "--est-dir", ed, "--map", "guitar=guitar", "bass=bass"],
              lambda r: all(x["si_sdr_db"] == "inf" or x["si_sdr_db"] > 100 for x in ps(r).values()), lambda r: json.dumps({k: v["si_sdr_db"] for k, v in ps(r).items()}))
        R.run("stems.swapped_negative", ["stems", "--truth", tp, "--est-dir", ed, "--map", "guitar=bass.wav", "bass=guitar.wav"],
              lambda r: all(x["si_sdr_db"] == "-inf" or x["si_sdr_db"] < 0 for x in ps(r).values()), lambda r: json.dumps(ps(r)))
        from scipy.signal import resample_poly
        ed3 = j("est_sr")
        os.makedirs(ed3, exist_ok=True)
        sf.write(os.path.join(ed3, "guitar.wav"), np.stack([resample_poly(g, 441, 160)] * 2, axis=1), 44100, subtype="FLOAT")
        R.run("stems.other_rate_and_stereo", ["stems", "--truth", tp, "--est-dir", ed3, "--map", "guitar=guitar.wav"],
              lambda r: ps(r)["guitar"]["si_sdr_db"] > 30 and any("resampled" in p for p in r["processing"]),
              lambda r: f"si_sdr={ps(r)['guitar']['si_sdr_db']} processing={r['processing'][:2]}")

    # ---------------- the launcher, from another directory, with --out
    exe = "/home/user/gtr/bin/gtr-eval"
    if os.path.exists(exe):
        outp = j("cli_out.json")
        led = j("ledger.jsonl")
        env = dict(os.environ, PYTHONPATH="/nonexistent", VIRTUAL_ENV="/nonexistent", GTR_EVAL_LEDGER=led)
        p = subprocess.run([exe, "notes", "--truth", tp, "--est", j("id.csv"), "--out", outp], cwd="/", env=env,
                           capture_output=True, text=True)
        ok = p.returncode == 0 and os.path.exists(outp) and json.loads(p.stdout) == json.load(open(outp)) and "\n" not in p.stdout.strip()
        R.check("cli.launcher_from_root_with_out", ok, f"exit={p.returncode} stderr={p.stderr.strip()[:200]}")
        lines = open(led).read().splitlines() if os.path.exists(led) else []
        ok = len(lines) == 1 and json.loads(lines[0])["id"] == "e0001" and json.loads(lines[0])["result"] == json.loads(p.stdout)
        R.check("cli.ledger_line_written", ok, f"{len(lines)} ledger lines; stderr={p.stderr.strip()[:120]}")
        p = subprocess.run([exe, "notes", "--truth", tp, "--est", j("missing.csv")], cwd="/", capture_output=True, text=True, env=env)
        R.check("cli.error_is_json_exit_1", p.returncode == 1 and "error" in json.loads(p.stdout), f"exit={p.returncode}")
        p = subprocess.run([exe, "ledger", "--id", "e0002"], cwd="/", capture_output=True, text=True, env=env)
        R.check("cli.ledger_subcommand", p.returncode == 0 and json.loads(p.stdout)["exit_code"] == 1, f"exit={p.returncode} out={p.stdout[:120]}")
        p = subprocess.run([exe, "notes", "--truth", "FX1", "--est", j("id.csv"), "--no-ledger"], cwd="/", capture_output=True, text=True,
                           env=dict(os.environ, GTR_INPUTS=FIXDIR, GTR_EVAL_LEDGER=led))
        R.check("cli.truth_by_clip_id", p.returncode == 0 and json.loads(p.stdout)["truth"]["id"] == "FX1", f"exit={p.returncode}")


# ----------------------------------------------------------------------------------------------------------------
# part 2: checks derived from a real truth file
# ----------------------------------------------------------------------------------------------------------------

def part2(R, tmp, tp, quick=False):
    T = G.Truth(tp)
    tid = T.id or os.path.basename(tp)
    j = lambda *p: os.path.join(tmp, f"{tid}_" + "_".join(p))  # noqa
    pre = f"[{tid}]"
    r = G.check_truth(tp)
    R.check(f"{pre} check-truth", r["counts"]["mismatches"] == 0, f"mismatches={r['mismatches_with_schema'][:4]}")
    notes, _ = T.notes()
    on = lambda r: r["metrics"]["onset_only"]  # noqa
    if notes:
        f = w_notes_csv(j("id.csv"), notes)
        R.run(f"{pre} notes.identity", ["notes", "--truth", tp, "--est", f],
              lambda r: approx(on(r)["f1"], 1) and approx(r["metrics"]["onset_offset"]["f1"], 1),
              lambda r: f"n={r['counts']['n_truth']} onset_f1={on(r)['f1']} onoff_f1={r['metrics']['onset_offset']['f1']}")
        ons = np.array([float(n["onset"]) for n in notes])
        ps_ = np.array([float(n["pitch"]) for n in notes])
        dt = np.abs(np.subtract.outer(ons, ons))
        dp = np.abs(np.subtract.outer(ps_, ps_))
        if np.any((dp == 0) & (dt >= 0.05) & (dt <= 0.15)):
            R.na(f"{pre} notes.shift_100ms", "same-pitch notes 50-150 ms apart, so 0 is not the known answer")
        else:
            f = w_notes_csv(j("sh.csv"), notes, shift=0.1)
            R.run(f"{pre} notes.shift_100ms_gives_0", ["notes", "--truth", tp, "--est", f],
                  lambda r: approx(on(r)["f1"], 0), lambda r: f"onset_f1={on(r)['f1']}")
        if np.any((dp == 1) & (dt <= 0.05)):
            R.na(f"{pre} notes.transpose_1", "notes a semitone apart within 50 ms, so 0 is not the known answer")
        else:
            f = w_notes_csv(j("tr.csv"), notes, pshift=1)
            R.run(f"{pre} notes.transpose_1_gives_0", ["notes", "--truth", tp, "--est", f],
                  lambda r: approx(on(r)["f1"], 0), lambda r: f"onset_f1={on(r)['f1']}")
        np.fill_diagonal(dt, 1.0)
        if np.any((dp == 0) & (dt <= 0.05)):
            R.na(f"{pre} notes.half_removed", "same pitch twice within 50 ms (e.g. unison on two strings)")
        else:
            half = notes[::2]
            f = w_notes_csv(j("half.csv"), half)
            R.run(f"{pre} notes.half_removed", ["notes", "--truth", tp, "--est", f],
                  lambda r, k=len(half) / len(notes): approx(on(r)["recall"], k) and approx(on(r)["precision"], 1),
                  lambda r: f"recall={on(r)['recall']} expected={len(half) / len(notes):.6f}")
        try:
            t, fr, info = G.truth_f0(T)
            f = w_lines(j("f0.csv"), [f"{a:.4f},{b:.6f}" for a, b in zip(t, fr)])
            R.run(f"{pre} f0.identity", ["f0", "--truth", tp, "--est", f],
                  lambda r: approx(r["metrics"]["raw_pitch_accuracy"], 1) and approx(r["metrics"]["overall_accuracy"], 1),
                  lambda r: f"rpa={r['metrics']['raw_pitch_accuracy']} oa={r['metrics']['overall_accuracy']} ref={info['reference_notes']}")
        except G.EvalError as e:
            R.na(f"{pre} f0.identity", str(e))
        withpos = [n for n in notes if n.get("string") is not None and n.get("fret") is not None]
        if withpos:
            f = w_tab_json(j("tab.json"), withpos, T.tuning(), T.capo())
            R.run(f"{pre} tab.identity", ["tab", "--truth", tp, "--est", f],
                  lambda r: approx(r["metrics"]["same_string_and_fret_fraction_of_matched"], 1) and r["counts"]["n_matched"] == len(withpos),
                  lambda r: f"matched={r['counts']['n_matched']}/{len(withpos)} sf={r['metrics']['same_string_and_fret_fraction_of_matched']}")
            grid = np.arange(int(T.duration() / 0.02) + 1) * 0.02
            rows = []
            for n in withpos:
                for t in grid[(grid >= float(n["onset"]) - 1e-9) & (grid < float(n["offset"]) - 1e-9)]:
                    rows.append(f"{t:.4f},{n['string']},{n['fret']}")
            f = w_lines(j("frames.csv"), ["time,string,fret"] + rows)
            R.run(f"{pre} tab-frames.identity", ["tab-frames", "--truth", tp, "--est", f, "--hop", "0.02"],
                  lambda r: approx(r["metrics"]["tab_f1"], 1) and approx(r["metrics"]["pitch_f1"], 1),
                  lambda r: f"tab_f1={r['metrics']['tab_f1']} activations={r['counts']['ref_activations']}")
        else:
            R.na(f"{pre} tab.identity", "no notes with string and fret")
    else:
        R.na(f"{pre} notes.*", "truth has no notes")
    if T.get("beats"):
        f = w_lines(j("beats.txt"), T.get("beats"))
        argv = ["beats", "--truth", tp, "--est", f]
        if T.get("downbeats"):
            argv += ["--downbeats-est", w_lines(j("db.txt"), T.get("downbeats"))]
        R.run(f"{pre} beats.identity", argv,
              lambda r: approx(r["metrics"]["beats"]["f_measure"], 1) and (r["metrics"].get("downbeats") is None or approx(r["metrics"]["downbeats"]["f_measure"], 1)),
              lambda r: f"beats_F={r['metrics']['beats']['f_measure']} downbeats={(r['metrics'].get('downbeats') or {}).get('f_measure')}")
    else:
        R.na(f"{pre} beats.identity", "truth has no beats")
    if T.get("chords"):
        f = w_lines(j("ch.lab"), [f"{c['start']} {c['end']} {c['label']}" for c in T.get("chords")])
        R.run(f"{pre} chords.identity", ["chords", "--truth", tp, "--est", f],
              lambda r: approx(r["metrics"]["root"], 1), lambda r: f"root={r['metrics']['root']} majmin={r['metrics']['majmin']} sevenths={r['metrics']['sevenths']}")
    else:
        R.na(f"{pre} chords.identity", "truth has no chords")
    if T.d.get("key"):
        R.run(f"{pre} key.identity", ["key", "--truth", tp, "--est-key", str(T.d["key"])],
              lambda r: approx(r["metrics"]["weighted_score"], 1), lambda r: f"{r['metrics']['truth_key']} ws={r['metrics']['weighted_score']}")
    else:
        R.na(f"{pre} key.identity", "truth has no key")
    if T.d.get("tempo_bpm"):
        R.run(f"{pre} tempo.identity", ["tempo", "--truth", tp, "--est-bpm", str(T.d["tempo_bpm"])],
              lambda r: r["metrics"]["within_tolerance"], lambda r: f"ratio={r['metrics']['ratio_est_over_truth']}")
        R.run(f"{pre} tempo.double", ["tempo", "--truth", tp, "--est-bpm", str(2 * float(T.d["tempo_bpm"]))],
              lambda r: r["metrics"]["octave_error"], lambda r: f"octave_error={r['metrics']['octave_error']}")
    else:
        R.na(f"{pre} tempo.identity", "truth has no tempo_bpm")
    R.run(f"{pre} tuning.identity", ["tuning", "--truth", tp, "--est-cents", str(T.cents())],
          lambda r: approx(r["metrics"]["difference_cents"], 0), lambda r: f"diff={r['metrics']['difference_cents']}")
    if T.get("taps"):
        f = w_lines(j("taps.txt"), sorted(float(x["time"]) for x in T.get("taps")))
        R.run(f"{pre} onsets.taps_identity", ["onsets", "--truth", tp, "--est", f],
              lambda r: approx(r["metrics"]["f_measure"], 1), lambda r: f"F={r['metrics']['f_measure']} n={r['counts']['n_truth']}")
    else:
        R.na(f"{pre} onsets.taps_identity", "truth has no taps")
    # cross-checks against the sidecar files the inputs builder wrote next to the truth (independent writers)
    base = os.path.join(T.dir, tid)
    drums = ["--include-drums"] if any(n.get("voice") == "drums" for n in (T.get("notes") or [])) else []
    side = [("notes.csv", ["notes"] + drums, lambda r: r["metrics"]["onset_only"]["f1"]),
            ("mid", ["notes"] + drums, lambda r: r["metrics"]["onset_only"]["f1"]),
            ("beats.txt", ["beats", "--downbeat-col", "2"], lambda r: min(r["metrics"]["beats"]["f_measure"], (r["metrics"].get("downbeats") or {"f_measure": 1})["f_measure"])),
            ("chords.lab", ["chords"], lambda r: r["metrics"]["root"]),
            # ASCII tab: one character column per 16th note cannot hold two notes on one string, and its column order
            # can differ from the truth's onset order, so only the matched pairs are required to agree
            ("tab.txt", ["tab"], lambda r: r["metrics"]["same_string_and_fret_fraction_of_matched"]),
            ("gp5", ["tab"], lambda r: r["metrics"]["same_string_and_fret_fraction_of_matched"] if r["counts"]["n_matched"] == r["counts"]["n_truth"] else -1)]
    for ext, cmd, val in side:
        f = f"{base}.{ext}"
        if not os.path.isfile(f):
            continue
        if os.path.getsize(f) == 0:
            R.na(f"{pre} sidecar {os.path.basename(f)}", "empty file")
            continue
        R.run(f"{pre} sidecar {os.path.basename(f)} scores 1", [cmd[0], "--truth", tp, "--est", f] + cmd[1:],
              lambda r, val=val: approx(val(r), 1),
              lambda r, val=val: f"value={val(r)} counts={json.dumps(r['counts'])[:160]}")
    stems = T.get("stems") or {}
    if stems and not quick:
        if all(os.path.isfile(os.path.join(T.dir, p)) for p in stems.values()):
            R.run(f"{pre} stems.identity_first_10s", ["stems", "--truth", tp, "--est-dir", T.dir, "--max-seconds", "10",
                                                      "--map"] + [f"{k}={os.path.join(T.dir, p)}" for k, p in stems.items()],
                  lambda r: all(x["si_sdr_db"] == "inf" or (not isinstance(x["si_sdr_db"], str) and x["si_sdr_db"] > 100)
                                for x in r["metrics"]["per_stem"].values()),
                  lambda r: json.dumps({k: v["si_sdr_db"] for k, v in r["metrics"]["per_stem"].items()}))
        else:
            R.check(f"{pre} stems.files_exist", False, f"missing: {[p for p in stems.values() if not os.path.isfile(os.path.join(T.dir, p))]}")


def run_selftest(a):
    import glob
    R = Results()
    print(f"gtr-eval {G.VERSION} selftest", flush=True)
    with tempfile.TemporaryDirectory(prefix="gtr-eval-selftest-") as tmp:
        part1(R, tmp, quick=a.quick)
        files = list(a.truth or [])
        if a.all_inputs:
            files += sorted(glob.glob(os.path.join(os.environ.get("GTR_INPUTS", G.DEFAULT_INPUTS), "*", "*.truth.json")))
        for tp in files:
            try:
                part2(R, tmp, tp, quick=a.quick)
            except Exception as e:  # noqa
                R.check(f"[{os.path.basename(tp)}] part2", False, f"raised {type(e).__name__}: {e}")
    npass = sum(r["result"] == "PASS" for r in R.rows)
    nfail = sum(r["result"] == "FAIL" for r in R.rows)
    nna = sum(r["result"] == "N/A" for r in R.rows)
    print(f"selftest: {npass} PASS, {nfail} FAIL, {nna} N/A (gtr-eval {G.VERSION})", flush=True)
    if a.out:
        with open(a.out, "w") as f:
            json.dump({"gtr_eval_version": G.VERSION, "pass": npass, "fail": nfail, "na": nna, "checks": R.rows}, f, indent=1)
    return 0 if nfail == 0 else 1
