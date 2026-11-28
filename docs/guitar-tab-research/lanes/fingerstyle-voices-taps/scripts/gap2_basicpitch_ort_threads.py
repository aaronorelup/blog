"""Run Basic Pitch 0.4.0's own command line with ONNX Runtime's thread pools set to a given size.

Usage: python gap2_basicpitch_ort_threads.py <n intra-op threads> <basic-pitch arguments...>
Basic Pitch builds its session as `ort.InferenceSession(str(model_path), providers=["CPUExecutionProvider"])`
(basic_pitch/inference.py line 132 in 0.4.0), with no SessionOptions, so ONNX Runtime picks its own thread count.
This wrapper replaces onnxruntime.InferenceSession with a subclass that passes SessionOptions with
intra_op_num_threads = n and inter_op_num_threads = 1 when the caller gives none, prints what it set, then calls
basic_pitch.predict.main() with the remaining arguments (the same function the `basic-pitch` script calls).
Nothing else is changed.
"""
import sys

import onnxruntime as ort

n = int(sys.argv[1])
_Base = ort.InferenceSession


class Session(_Base):
    def __init__(self, path_or_bytes, sess_options=None, providers=None, provider_options=None, **kwargs):
        if sess_options is None:
            sess_options = ort.SessionOptions()
            sess_options.intra_op_num_threads = n
            sess_options.inter_op_num_threads = 1
            print(f"[gap2 wrapper] onnxruntime {ort.__version__}: intra_op_num_threads={n}, inter_op_num_threads=1",
                  file=sys.stderr, flush=True)
        super().__init__(path_or_bytes, sess_options=sess_options, providers=providers,
                         provider_options=provider_options, **kwargs)


ort.InferenceSession = Session
import basic_pitch.inference  # noqa: E402

basic_pitch.inference.ort.InferenceSession = Session
from basic_pitch.predict import main  # noqa: E402

sys.argv = ["basic-pitch"] + sys.argv[2:]
sys.exit(main())
