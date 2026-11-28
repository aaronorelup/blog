"""Verifier (round 2): run a Python script with ONNX Runtime's intra-op thread count fixed (the script's files unchanged).
usage: python -I ort_threads.py <n threads> <script.py> [args...]
Replaces onnxruntime.InferenceSession with a subclass that sets sess_options.intra_op_num_threads = n
(a new SessionOptions if none is given) before the script runs; the script then runs as __main__ with its own argv."""
import runpy, sys
import onnxruntime as ort
N = int(sys.argv[1]); script = sys.argv[2]
_Base = ort.InferenceSession
class _Sess(_Base):
    def __init__(self, path_or_bytes, sess_options=None, providers=None, provider_options=None, **kw):
        so = sess_options or ort.SessionOptions(); so.intra_op_num_threads = N
        super().__init__(path_or_bytes, sess_options=so, providers=providers, provider_options=provider_options, **kw)
ort.InferenceSession = _Sess
sys.argv = [script] + sys.argv[3:]
runpy.run_path(script, run_name='__main__')
