"""Gap round 2 (H5): one read-only probe of Cesure's MCP server, without an account or any key.

usage: python3 -I cesure_mcp_probe.py <outdir>
Sends, over the MCP Streamable HTTP transport (JSON-RPC 2.0 by POST):
  1. initialize (protocolVersion 2025-06-18, a generic clientInfo)
  2. notifications/initialized (required by the protocol before other requests)
  3. tools/list
and also reads GET /.well-known/oauth-protected-resource (read only). No tools/call is sent: nothing is created on
the server. Every request and response (status, headers that are not cookies, body) is saved to <outdir>/probe.json;
the tool list is also saved as <outdir>/tools_list.json. Standard library only.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

URL = "https://api.cesure.app/mcp"
out = sys.argv[1]
os.makedirs(out, exist_ok=True)
log = {"url": URL, "utc_start": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "steps": []}
UA = "research-probe/0.1 (MCP client, no account)"


def keep_headers(h):
    return {k: v for k, v in h.items() if k.lower() not in ("set-cookie", "cookie")}


def parse_body(ctype, text):
    """JSON body, or a text/event-stream whose data: lines carry JSON-RPC messages."""
    if ctype and "text/event-stream" in ctype:
        msgs = []
        for line in text.splitlines():
            if line.startswith("data:"):
                payload = line[5:].strip()
                try:
                    msgs.append(json.loads(payload))
                except ValueError:
                    msgs.append(payload)
        return msgs
    try:
        return json.loads(text)
    except ValueError:
        return text


def call(name, method, body=None, session=None, accept="application/json, text/event-stream", url=URL):
    headers = {"User-Agent": UA, "Accept": accept}
    data = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode()
    if session:
        headers["Mcp-Session-Id"] = session
        headers["MCP-Protocol-Version"] = "2025-06-18"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    t0 = time.time()
    try:
        r = urllib.request.urlopen(req, timeout=60)
        status, rh, raw = r.status, dict(r.headers), r.read()
    except urllib.error.HTTPError as e:
        status, rh, raw = e.code, dict(e.headers), e.read()
    wall = round(time.time() - t0, 3)
    text = raw.decode("utf-8", "replace")
    step = {"step": name, "request": {"method": method, "url": url, "headers": {k: v for k, v in headers.items()},
                                      "body": body},
            "response": {"status": status, "headers": keep_headers(rh), "bytes": len(raw),
                         "body": parse_body(rh.get("Content-Type") or rh.get("content-type"), text)},
            "wall_s": wall}
    log["steps"].append(step)
    print(f"{name}: HTTP {status}, {len(raw)} bytes, {wall} s")
    return step


s1 = call("initialize", "POST", {"jsonrpc": "2.0", "id": 1, "method": "initialize",
                                 "params": {"protocolVersion": "2025-06-18", "capabilities": {},
                                            "clientInfo": {"name": "research-probe", "version": "0.1"}}})
hdr = {k.lower(): v for k, v in s1["response"]["headers"].items()}
session = hdr.get("mcp-session-id")
log["session_id_returned"] = bool(session)
if s1["response"]["status"] == 200:
    call("notifications/initialized", "POST", {"jsonrpc": "2.0", "method": "notifications/initialized"}, session)
    s3 = call("tools/list", "POST", {"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}, session)
    json.dump(s3["response"]["body"], open(os.path.join(out, "tools_list.json"), "w"), indent=1, ensure_ascii=False)
call("well-known oauth-protected-resource", "GET", None, None, "application/json",
     "https://api.cesure.app/.well-known/oauth-protected-resource")
log["utc_end"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
json.dump(log, open(os.path.join(out, "probe.json"), "w"), indent=1, ensure_ascii=False)
