"""Run a guitar checkpoint of xavriley/midi-transcription-models (Kong et al.'s high-resolution CRNN,
Regress_onset_offset_frame_velocity_CRNN, fine-tuned on guitar) on one audio file -> MIDI + note CSV.

What hf_midi_transcription (github.com/xavriley/hf_midi_transcription, not on PyPI) does, read from its source:
PianoTranscription("Regress_onset_offset_frame_velocity_CRNN", device, checkpoint_path, segment_samples=10*16000,
batch_size) from xavriley's fork of piano_transcription_inference, audio = librosa.load(path, sr=16000).
This script does the same with the PyPI package piano-transcription-inference 0.0.6 (Kong's original): same model
class and config (diffs vs the fork: dropout inplace flag, librosa API spellings, constructor arguments with the same
default thresholds 0.3/0.3/0.1, and the fork's weights_only=False). The PyPI PianoTranscription.__init__ is NOT used,
because it re-downloads the piano model when the checkpoint file is under 160 MB (the guitar files are 99 MB); the
object is built with __new__ and its attributes set to the same values. The checkpoint is opened with
torch.load(weights_only=True) and an allow-list of the globals pickletools listed; load_state_dict(strict=False) as in
both package versions, and the missing/unexpected keys are printed.
usage: python run_hfmt_guitar.py ckpt.pth audio.wav outprefix
"""
import sys, json, time, collections, _codecs, os
import numpy as np, torch, librosa
from piano_transcription_inference.models import Regress_onset_offset_frame_velocity_CRNN
from piano_transcription_inference.inference import PianoTranscription
from piano_transcription_inference import config

ckpt, audio_path, outp = sys.argv[1:4]
torch.set_num_threads(max(1, len(os.sched_getaffinity(0))))
allow = [collections.OrderedDict, _codecs.encode, np.dtype, np.ndarray,
         (np._core.multiarray._reconstruct, "numpy.core.multiarray._reconstruct")]
allow += [getattr(np.dtypes, n) for n in dir(np.dtypes) if n.endswith("DType")]
t0 = time.time()
with torch.serialization.safe_globals(allow):
    ck = torch.load(ckpt, map_location="cpu", weights_only=True)
model = Regress_onset_offset_frame_velocity_CRNN(frames_per_second=config.frames_per_second, classes_num=config.classes_num)
r = model.load_state_dict(ck["model"], strict=False)
model.eval()
pt = PianoTranscription.__new__(PianoTranscription)
pt.segment_samples = 10 * config.sample_rate; pt.frames_per_second = config.frames_per_second
pt.classes_num = config.classes_num; pt.onset_threshold = 0.3; pt.offset_threshod = 0.3
pt.frame_threshold = 0.1; pt.pedal_offset_threshold = 0.2; pt.model = model
audio, _ = librosa.load(audio_path, sr=config.sample_rate, mono=True)
t1 = time.time()
with torch.no_grad():
    td = pt.transcribe(audio, outp + ".mid")
t2 = time.time()
ev = td["est_note_events"]
with open(outp + ".notes.csv", "w") as fh:
    fh.write("onset,offset,pitch,velocity\n")
    for e in ev:
        fh.write(f"{e['onset_time']:.6f},{e['offset_time']:.6f},{int(e['midi_note'])},{int(e['velocity'])}\n")
print(f"iteration {ck.get('iteration')}, missing keys {len(r.missing_keys)} {r.missing_keys[:3]}, unexpected keys "
      f"{len(r.unexpected_keys)} {r.unexpected_keys[:3]}, load {t1-t0:.2f}s, transcribe {t2-t1:.2f}s, notes {len(ev)}, "
      f"first {[ (round(e['onset_time'],3), int(e['midi_note'])) for e in ev[:5]]}")
