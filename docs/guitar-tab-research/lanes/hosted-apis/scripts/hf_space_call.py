"""Call one endpoint of a public Hugging Face Space with gradio_client, without a token, and keep what comes back.

Usage: python -I hf_space_call.py <space_id> <api_name> <outdir> '<json list of args>'
In the args list, a string starting with "file:" is sent as a file (gradio_client.handle_file).
Records the Space's runtime hardware (Hub API), every status change of the job (queue rank, ETA, progress), the
wall-clock from submit to result, and copies returned files into <outdir>/files/. Downloaded files are untrusted data.
"""
import json, os, shutil, sys, time
import requests
from gradio_client import Client, handle_file

sid, api, out, args = sys.argv[1], sys.argv[2], sys.argv[3], json.loads(sys.argv[4])
os.makedirs(os.path.join(out, "files"), exist_ok=True)
rec = {"space": sid, "api_name": api, "args": args, "token": None}
try:
    rt = requests.get(f"https://huggingface.co/api/spaces/{sid}/runtime", timeout=30).json()
    rec["runtime_before"] = {"stage": rt.get("stage"), "hardware": rt.get("hardware")}
    rec["space_sha"] = requests.get(f"https://huggingface.co/api/spaces/{sid}", timeout=30).json().get("sha")
except Exception as e:  # noqa: BLE001
    rec["hub_error"] = repr(e)[:300]
call_args = [handle_file(a[5:]) if isinstance(a, str) and a.startswith("file:") else a for a in args]
t0 = time.time()
statuses = []
try:
    c = Client(sid, verbose=False, download_files=os.path.join(out, "dl"))
    rec["client_connect_s"] = round(time.time() - t0, 3)
    job = c.submit(*call_args, api_name=api)
    last = None
    while not job.done():
        st = job.status()
        key = (str(st.code), st.rank, st.queue_size, round(st.eta or 0, 1) if st.eta else None,
               str(st.progress_data)[:200] if st.progress_data else None)
        if key != last:
            statuses.append({"t_s": round(time.time() - t0, 2), "code": str(st.code), "rank": st.rank,
                             "queue_size": st.queue_size, "eta": st.eta,
                             "progress": str(st.progress_data)[:300] if st.progress_data else None})
            last = key
        time.sleep(1)
    res = job.result()
    rec["ok"] = True
except Exception as e:  # noqa: BLE001
    res = None
    rec["ok"] = False
    rec["error"] = repr(e)[:1500]
rec["wall_s"] = round(time.time() - t0, 3)
rec["status_changes"] = statuses


def keep(x):
    if isinstance(x, str) and os.path.isfile(x):
        dst = os.path.join(out, "files", os.path.basename(x))
        shutil.copy(x, dst)
        return {"file": dst, "bytes": os.path.getsize(dst)}
    if isinstance(x, (list, tuple)):
        return [keep(y) for y in x]
    if isinstance(x, dict):
        return {k: keep(v) for k, v in x.items()}
    return x


rec["result"] = keep(res)
json.dump(rec, open(os.path.join(out, "record.json"), "w"), indent=1, default=str)
print(json.dumps({k: rec.get(k) for k in ("space", "ok", "wall_s", "error")}, default=str))
print(json.dumps(rec["result"], default=str)[:2000])
