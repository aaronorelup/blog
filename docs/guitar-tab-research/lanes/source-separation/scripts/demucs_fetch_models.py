"""Pre-download Demucs 4.1.0 pretrained models (so timed runs do not include the download) and print
what each bag contains: sources, sample rate, channels, segment length, number of sub-models, parameter count.
Usage: python demucs_fetch_models.py htdemucs htdemucs_ft htdemucs_6s mdx_extra
"""
import sys, time, json
from demucs.pretrained import get_model
from demucs.apply import BagOfModels

out = {}
for name in sys.argv[1:]:
    t0 = time.time()
    m = get_model(name)
    dt = time.time() - t0
    subs = m.models if isinstance(m, BagOfModels) else [m]
    info = {
        "load_or_download_s": round(dt, 1),
        "sources": list(m.sources),
        "samplerate": m.samplerate,
        "audio_channels": m.audio_channels,
        "n_submodels": len(subs),
        "submodel_classes": [type(s).__name__ for s in subs],
        "submodel_segment_s": [float(getattr(s, "segment", float("nan"))) for s in subs],
        "params_total": int(sum(p.numel() for s in subs for p in s.parameters())),
    }
    if isinstance(m, BagOfModels):
        info["bag_weights"] = [list(map(float, w)) for w in m.weights]
    out[name] = info
    print(name, json.dumps(info), flush=True)
