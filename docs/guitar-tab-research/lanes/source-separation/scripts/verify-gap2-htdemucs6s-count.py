"""verify-gapfill-source-separation (round 2, resumed 2026-11-12): count the tensors and parameters of the stock
htdemucs_6s model that the guitar fine-tune's `model_state_dict` was loaded into (strict `load_state_dict`,
"<All keys matched successfully>" in samples/htdemucs-6s-guitar-ft/run_info_*.json). Uses the lane's venv-demucs
(demucs 4.1.0) and the cached stock weights; the fine-tune's checkpoint is not needed.
Usage: HF_HUB_OFFLINE=1 python verify-gap2-htdemucs6s-count.py OUT.json
"""
import json
import sys

from demucs.pretrained import get_model

model = get_model("htdemucs_6s")
sd = model.state_dict()
params = dict(model.named_parameters())
buffers = dict(model.named_buffers())
res = {
    "state_dict_tensors": len(sd),
    "state_dict_numel": int(sum(v.numel() for v in sd.values())),
    "parameter_tensors": len(params),
    "parameter_numel": int(sum(p.numel() for p in params.values())),
    "buffer_tensors": len(buffers),
    "buffer_numel": int(sum(b.numel() for b in buffers.values())),
    "dtypes": sorted({str(v.dtype) for v in sd.values()}),
    "keys_start_with_models0": all(k.startswith("models.0.") for k in sd),
    "sources": list(model.sources),
}
print(json.dumps(res, indent=1))
with open(sys.argv[1], "w") as f:
    json.dump(res, f, indent=1)
