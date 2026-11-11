"""Run an image through the public microsoft/TRELLIS.2 HF Space. usage: trellis2_space.py in.png out.glb [res] [decim] [tex]"""
import sys, shutil, time
from gradio_client import Client, handle_file
inp, out = sys.argv[1], sys.argv[2]
res = sys.argv[3] if len(sys.argv) > 3 else "1024"
dec = float(sys.argv[4]) if len(sys.argv) > 4 else 200000
tex = float(sys.argv[5]) if len(sys.argv) > 5 else 2048
t0 = time.time()
c = Client("microsoft/TRELLIS.2", verbose=False)
c.predict(api_name="/start_session")
pre = c.predict(handle_file(inp), api_name="/preprocess_image")
print("preprocessed", round(time.time()-t0,1), flush=True)
shutil.copy(pre if isinstance(pre, str) else pre["path"], out.replace(".glb", "_pre.png"))
c.predict(handle_file(pre if isinstance(pre, str) else pre["path"]), 0, res, api_name="/image_to_3d")
print("generated", round(time.time()-t0,1), flush=True)
glb, dl = c.predict(dec, tex, api_name="/extract_glb")
shutil.copy(glb, out)
print("done", out, round(time.time()-t0,1))
