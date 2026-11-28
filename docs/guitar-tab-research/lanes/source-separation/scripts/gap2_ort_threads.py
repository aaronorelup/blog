#!/usr/bin/env python3
"""gap2_ort_threads.py: run a Python console-script entry point with every ONNX Runtime session given a fixed
intra-op thread count (gap round 2).

Usage:  <venv>/bin/python gap2_ort_threads.py <N> <module>:<function> [the tool's own arguments...]

Before the tool is imported, onnxruntime.InferenceSession is replaced by a subclass that sets
sess_options.intra_op_num_threads = N (creating a SessionOptions when the tool passes none) and then builds the
session exactly as the tool asked. Nothing in the tool's installed files is changed. ONNX Runtime's threading page
(https://onnxruntime.ai/docs/performance/tune-performance/threading.html) says that when the thread count is set
explicitly "there will be no affinity set to any of the created thread".
"""
import importlib
import sys

n = int(sys.argv[1])
target = sys.argv[2]

import onnxruntime as ort  # noqa: E402

_Base = ort.InferenceSession


class InferenceSession(_Base):
    def __init__(self, path_or_bytes, sess_options=None, providers=None, provider_options=None, **kwargs):
        if sess_options is None:
            sess_options = ort.SessionOptions()
        sess_options.intra_op_num_threads = n
        sys.stderr.write(f"[gap2_ort_threads] InferenceSession(...{str(path_or_bytes)[-50:]}) "
                         f"intra_op_num_threads={n}\n")
        super().__init__(path_or_bytes, sess_options, providers, provider_options, **kwargs)


ort.InferenceSession = InferenceSession

module, function = target.split(":")
sys.argv = [module] + sys.argv[3:]
sys.exit(getattr(importlib.import_module(module), function)())
