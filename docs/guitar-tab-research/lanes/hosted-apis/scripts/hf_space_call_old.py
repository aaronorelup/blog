"""Call a Gradio 3 Space (websocket queue) with gradio_client 0.5.3, which still speaks the `ws` protocol that
gradio_client 2.x refuses ("Unknown protocol: ws"). Files are passed as plain paths. No token.
Usage: python -I hf_space_call_old.py <space_id> <api_name> <outdir> <input_file>
"""
import json, os, shutil, sys, time
import requests
from gradio_client import Client

sid, api, out, inp = sys.argv[1:5]
os.makedirs(os.path.join(out, "files"), exist_ok=True)
rec = {"space": sid, "api_name": api, "input": inp, "token": None, "client": "gradio_client 0.5.3"}
rt = requests.get(f"https://huggingface.co/api/spaces/{sid}/runtime", timeout=30).json()
rec["runtime_before"] = {"stage": rt.get("stage"), "hardware": rt.get("hardware")}
rec["space_sha"] = requests.get(f"https://huggingface.co/api/spaces/{sid}", timeout=30).json().get("sha")
t0 = time.time()
statuses = []
try:
    c = Client(sid, verbose=False)
    job = c.submit(inp, api_name=api)
    last = None
    while not job.done():
        st = job.status()
        key = (str(st.code), st.rank, st.queue_size)
        if key != last:
            statuses.append({"t_s": round(time.time() - t0, 2), "code": str(st.code), "rank": st.rank,
                             "queue_size": st.queue_size, "eta": st.eta})
            last = key
        time.sleep(1)
    res = job.result()
    rec["ok"] = True
except Exception as e:  # noqa: BLE001
    res, rec["ok"], rec["error"] = None, False, repr(e)[:1500]
rec["wall_s"] = round(time.time() - t0, 3)
rec["status_changes"] = statuses
files = []
for x in (res if isinstance(res, (list, tuple)) else [res]):
    if isinstance(x, str) and os.path.isfile(x):
        dst = os.path.join(out, "files", os.path.basename(os.path.dirname(x)) + "_" + os.path.basename(x))
        shutil.copy(x, dst)
        files.append({"file": dst, "bytes": os.path.getsize(dst)})
    else:
        files.append(x)
rec["result"] = files
json.dump(rec, open(os.path.join(out, "record.json"), "w"), indent=1, default=str)
print(json.dumps(rec, default=str)[:2500])
