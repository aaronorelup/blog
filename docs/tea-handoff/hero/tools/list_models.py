import os, sys, json, urllib.request, subprocess
k = subprocess.run([sys.executable.replace("tools/venv/bin/python","")+"" if False else "python3", os.path.expanduser("~/.claude/bin/getkey.py"), "GEMINI_API_KEY"], capture_output=True, text=True, env={k:v for k,v in os.environ.items() if k!="INFISICAL_CLIENT_ID"}).stdout.strip()
r = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", headers={"x-goog-api-key": k})
for m in json.load(urllib.request.urlopen(r))["models"]:
    if "image" in m["name"] or "imagen" in m["name"]: print(m["name"], m.get("supportedGenerationMethods"))
x = subprocess.run(["python3", os.path.expanduser("~/.claude/bin/getkey.py"), "XAI_API_KEY"], capture_output=True, text=True, env={k:v for k,v in os.environ.items() if k!="INFISICAL_CLIENT_ID"}).stdout.strip()
r = urllib.request.Request("https://api.x.ai/v1/image-generation-models", headers={"Authorization": "Bearer "+x})
try: print([m["id"] for m in json.load(urllib.request.urlopen(r))["models"]])
except Exception as e: print("xai", e)
