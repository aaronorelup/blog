#!/usr/bin/env python3
"""net_filter.py --socket PATH --log PATH [--label L] [--watch-pid PID] [--allow HOST:PORT ...] [--mode inspect|observe|tunnel]

The only way out of a sandboxed call's network namespace. Runs OUTSIDE the sandbox (sandbox_run.sh starts one for each
call's lifetime) and serves a unix socket; inside, net_bridge.py turns 127.0.0.1:<port> into that socket and the call's
HTTPS_PROXY points there.

1. CONNECT only, and only to the allowed hosts (default: api.anthropic.com:443). Any other CONNECT, a plain HTTP request
   or anything else gets 403 and a log line with its host. The filter opens the allowed connection itself, directly
   (never through the box's agent proxy).
2. mode inspect (the default): the API host's TLS is terminated here with the sandbox's own CA (G/loop/netca/, made on
   first use; inside, only that CA is trusted), so every request is seen before it goes on, over a new TLS connection
   checked against the real certificate:
   - its method and path must be on PATHS (the model API and the few calls the CLI makes at start, found by testing;
     never the session ingress, the files API or anything else of the host);
   - a model request's body may not name a tool the API runs itself (web search, web fetch, code execution, MCP
     servers, a container) nor a content block whose source is a URL or a stored file: the API would fetch for it.
   So the credential the CLI needs, readable inside, can only buy what the CLI already does: model calls without web.
   mode observe: the same, but nothing is refused at the request level (to find PATHS); mode tunnel: a plain CONNECT
   relay (no TLS termination, no request check).
Log: one JSON line per event (start, refused, open, request, close): time, label, host, port, method, path (no query
string), allowed, why, sizes, the model and the tools' types. Never a header value or a byte of a body.
Exits when the watched process (sandbox_run.sh) is gone."""
import argparse, asyncio, json, os, re, ssl, subprocess, sys, tempfile, time, zlib

ap = argparse.ArgumentParser()
ap.add_argument("--socket", required=True)
ap.add_argument("--log", required=True)
ap.add_argument("--label", default="")
ap.add_argument("--allow", nargs="*", default=["api.anthropic.com:443"])
ap.add_argument("--watch-pid", type=int, default=0)
ap.add_argument("--mode", choices=["inspect", "observe", "tunnel"], default="inspect")
ap.add_argument("--ca-dir", default="/home/user/gtv/loop/netca")
ap.add_argument("--make-ca", action="store_true", help="make the CA and the leaf certificates, print the CA path, exit")
a = ap.parse_args()

ALLOW = set()
for x in a.allow:
    h, _, p = x.rpartition(":")
    ALLOW.add((h.lower(), int(p)))
INSPECT_HOSTS = {"api.anthropic.com"}
# (method, path) a sandboxed claude -p call needs: found with --mode observe on real calls (LOOP-BUILD.md, "Network
# and credentials"). Every other path of the host is refused (403).
PATHS = {
    ("POST", "/v1/messages"),
    ("POST", "/v1/messages/count_tokens"),
}
SAFE_SOURCES = {"base64", "text", "content"}
LOG = open(a.log, "a", buffering=1)
N = [0]


def log(**rec):
    LOG.write(json.dumps(dict(t=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), label=a.label, **rec)) + "\n")


# ---------------------------------------------------------------- the sandbox's own CA (outside the sandbox)
def ensure_ca(d, hosts):
    ca_crt, ca_key = os.path.join(d, "ca.crt"), os.path.join(d, "ca.key")
    if not all(os.path.exists(os.path.join(d, f"{h}.crt")) for h in hosts) or not os.path.exists(ca_crt):
        os.makedirs(d, mode=0o700, exist_ok=True)
        t = tempfile.mkdtemp(dir=d)
        run = lambda *c: subprocess.run(c, check=True, capture_output=True, cwd=t)
        run("openssl", "req", "-x509", "-newkey", "ec", "-pkeyopt", "ec_paramgen_curve:P-256", "-nodes",
            "-keyout", "ca.key", "-out", "ca.crt", "-days", "3650", "-subj", "/CN=gtv loop sandbox filter CA",
            "-addext", "basicConstraints=critical,CA:TRUE", "-addext", "keyUsage=critical,keyCertSign,cRLSign")
        for h in hosts:
            open(os.path.join(t, "ext.cnf"), "w").write(
                f"subjectAltName=DNS:{h}\nbasicConstraints=CA:FALSE\nkeyUsage=critical,digitalSignature\n"
                "extendedKeyUsage=serverAuth\n")
            run("openssl", "req", "-newkey", "ec", "-pkeyopt", "ec_paramgen_curve:P-256", "-nodes", "-keyout",
                f"{h}.key", "-out", f"{h}.csr", "-subj", f"/CN={h}")
            run("openssl", "x509", "-req", "-in", f"{h}.csr", "-CA", "ca.crt", "-CAkey", "ca.key", "-CAcreateserial",
                "-out", f"{h}.crt", "-days", "825", "-extfile", "ext.cnf")
        for f in os.listdir(t):
            if f.endswith((".crt", ".key")):
                os.chmod(os.path.join(t, f), 0o600 if f.endswith(".key") else 0o644)
                os.replace(os.path.join(t, f), os.path.join(d, f))
        for f in os.listdir(t):
            os.remove(os.path.join(t, f))
        os.rmdir(t)
    return ca_crt


if a.make_ca:
    print(ensure_ca(a.ca_dir, INSPECT_HOSTS)); sys.exit(0)


# ---------------------------------------------------------------- request checks
MAX_BODY = 64 << 20


def decode_body(body, headers):
    enc = headers.get("content-encoding", "").lower().strip()
    if not enc or enc == "identity":
        return body
    if enc in ("gzip", "deflate"):
        z = zlib.decompressobj(31 if enc == "gzip" else 15)
        out = z.decompress(body, MAX_BODY)
        if z.unconsumed_tail or not z.eof:
            raise ValueError("compressed body too large or cut")
        return out
    raise ValueError(f"body encoding {enc}")


TOKEN = re.compile(r"^[!#$%&'*+.^_`|~0-9A-Za-z-]+$")
CHUNK = re.compile(rb"^([0-9a-fA-F]{1,8})(;[^\r\n]*)?\r\n$")


def parse_head(head):
    """A strict HTTP/1.1 request head, or ValueError: CRLF lines only, no folded or odd header names, one
    Content-Length at most, Transfer-Encoding only `chunked` and never with Content-Length (no request smuggling)."""
    if b"\n" in head.replace(b"\r\n", b"") or b"\r" in head.replace(b"\r\n", b""):
        raise ValueError("bare CR or LF")
    lines = head.decode("latin-1").split("\r\n")[:-2]
    parts = lines[0].split(" ")
    if len(parts) != 3 or parts[2] not in ("HTTP/1.1", "HTTP/1.0") or not TOKEN.match(parts[0]) \
            or not parts[1].startswith("/"):
        raise ValueError("request line")
    hdrs = []
    for l in lines[1:]:
        if ":" not in l or l[:1] in (" ", "\t"):
            raise ValueError("header line")
        k, v = l.split(":", 1)
        if not TOKEN.match(k):
            raise ValueError("header name")
        hdrs.append((k, v.strip()))
    low = [k.lower() for k, _ in hdrs]
    for one in ("content-length", "transfer-encoding", "host", "content-encoding"):
        if low.count(one) > 1:
            raise ValueError(f"two {one} headers")
    h = {k.lower(): v for k, v in hdrs}
    if "transfer-encoding" in h and ("content-length" in h or h["transfer-encoding"].lower() != "chunked"):
        raise ValueError("transfer-encoding")
    if "content-length" in h and not h["content-length"].isdigit():
        raise ValueError("content-length")
    return parts[0], parts[1], hdrs, h


def walk_blocks(x, out):
    """Every content block (a dict with a type) anywhere under messages / system."""
    if isinstance(x, list):
        for y in x:
            walk_blocks(y, out)
    elif isinstance(x, dict):
        if "type" in x:
            out.append(x)
        for k in ("content", "source"):
            if k in x and isinstance(x[k], (list, dict)):
                walk_blocks(x[k], out)


def check_model_request(body, headers):
    """None if the body is a model request the API answers without fetching anything; else why it is refused.
    Also returns a short summary for the log (no content)."""
    def no_dup(pairs):              # a key given twice could mean one thing here and another upstream
        keys = [k for k, _ in pairs]
        if len(keys) != len(set(keys)):
            raise ValueError("a JSON key given twice")
        return dict(pairs)
    try:
        d = json.loads(decode_body(body, headers) or b"{}", object_pairs_hook=no_dup)
    except Exception as e:
        return f"unreadable body ({type(e).__name__}: {str(e)[:60]})", {}
    if not isinstance(d, dict):
        return "body is not a JSON object", {}
    tools = d.get("tools") or []
    types = sorted({str(t.get("type") or "custom") for t in tools if isinstance(t, dict)})
    info = {"model": str(d.get("model", ""))[:40], "n_tools": len(tools), "tool_types": types,
            "n_messages": len(d.get("messages") or [])}
    if d.get("mcp_servers"):
        return "mcp_servers (the API would connect to them)", info
    if d.get("container"):
        return "container (code execution)", info
    bad = [t for t in types if t != "custom"]
    if bad:
        return f"server tools {bad} (the API would run them)", info
    blocks = []
    walk_blocks(d.get("messages"), blocks); walk_blocks(d.get("system"), blocks)
    for b in blocks:
        src = b.get("source")
        if isinstance(src, dict) and str(src.get("type")) not in SAFE_SOURCES:
            return f"a {b.get('type')} block with a {src.get('type')} source (the API would fetch it)", info
        if str(b.get("type", "")).startswith(("server_tool_use", "web_", "mcp_", "container_")):
            return f"a {b.get('type')} block", info
    return None, info


# ---------------------------------------------------------------- connections
async def pipe(r, w, count, key):
    try:
        while True:
            d = await r.read(65536)
            if not d:
                break
            w.write(d); count[key] += len(d)
            await w.drain()
    except (ConnectionError, asyncio.IncompleteReadError, ssl.SSLError, OSError):
        pass
    finally:
        try:
            if w.can_write_eof():
                w.write_eof()
            else:
                w.close()
        except (OSError, RuntimeError):
            pass


async def read_body(r, headers):
    """The body, out of its chunked framing if any; it goes upstream with a Content-Length of its own."""
    if headers.get("transfer-encoding", "").lower() == "chunked":
        dec = bytearray()
        while True:
            m = CHUNK.match(await r.readuntil(b"\r\n"))
            if not m:
                raise ValueError("chunk size line")
            size = int(m.group(1), 16)
            if size == 0:
                while (await r.readuntil(b"\r\n")) != b"\r\n":      # trailers (dropped), then the empty line
                    pass
                break
            chunk = await r.readexactly(size + 2)
            if chunk[-2:] != b"\r\n":
                raise ValueError("chunk end")
            dec += chunk[:-2]
            if len(dec) > MAX_BODY:
                raise ValueError("body too large")
        return bytes(dec)
    n = int(headers.get("content-length", "0") or 0)
    if n > MAX_BODY:
        raise ValueError("body too large")
    return await r.readexactly(n) if n else b""


HOP = {"content-length", "transfer-encoding", "expect", "proxy-authorization", "proxy-connection", "te", "trailer",
       "upgrade", "keep-alive"}


def rebuild(method, target, hdrs, body):
    """The request as the filter checked it, written anew: the same headers but the framing ones, its own length."""
    out = [f"{method} {target} HTTP/1.1"] + [f"{k}: {v}" for k, v in hdrs if k.lower() not in HOP]
    if body or method not in ("GET", "HEAD"):
        out.append(f"Content-Length: {len(body)}")
    return ("\r\n".join(out) + "\r\n\r\n").encode("latin-1") + body


def refuse_response(why):
    body = json.dumps({"type": "error", "error": {"type": "permission_error",
                                                  "message": f"refused by the sandbox's network filter: {why}"}}).encode()
    return (b"HTTP/1.1 403 Forbidden\r\nContent-Type: application/json\r\nConnection: close\r\nContent-Length: "
            + str(len(body)).encode() + b"\r\n\r\n" + body)


async def inspect(cr, cw, host, port, cid):
    """TLS terminated on both sides; requests checked one by one; responses relayed as they come."""
    sctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    sctx.load_cert_chain(os.path.join(a.ca_dir, f"{host}.crt"), os.path.join(a.ca_dir, f"{host}.key"))
    sctx.set_alpn_protocols(["http/1.1"])
    await cw.start_tls(sctx)
    uctx = ssl.create_default_context()
    uctx.set_alpn_protocols(["http/1.1"])
    ur, uw = await asyncio.wait_for(asyncio.open_connection(host, port, ssl=uctx, server_hostname=host,
                                                            limit=1 << 20), 20)
    count = {"up": 0, "down": 0, "requests": 0, "refused": 0}
    down = asyncio.create_task(pipe(ur, cw, count, "down"))
    try:
        while True:
            try:
                head = await cr.readuntil(b"\r\n\r\n")
            except (asyncio.IncompleteReadError, ConnectionError, ssl.SSLError, OSError):
                break
            except asyncio.LimitOverrunError:
                log(event="request", conn=cid, host=host, allowed=False, why="request head too long"); break
            try:
                method, target, hdrs, headers = parse_head(head)
            except ValueError as e:
                log(event="request", conn=cid, host=host, allowed=False, why=f"malformed request ({e})")
                cw.write(refuse_response(f"malformed request ({e})")); await cw.drain(); break
            path = target.split("?", 1)[0]
            if headers.get("expect", "").lower() == "100-continue":
                cw.write(b"HTTP/1.1 100 Continue\r\n\r\n")
            try:
                dec = await read_body(cr, headers)
            except (asyncio.IncompleteReadError, ValueError, asyncio.LimitOverrunError) as e:
                log(event="request", conn=cid, host=host, method=method[:10], path=path[:120], allowed=False,
                    why=f"unreadable body framing ({type(e).__name__}: {str(e)[:40]})"); break
            why, info = None, {}
            if (method, path) not in PATHS:
                why = "path not on the list"
            elif headers.get("host", "").lower() not in (host, f"{host}:{port}"):
                why = "Host header is not the API host"
            elif "upgrade" in headers:
                why = "upgrade"
            elif path.startswith("/v1/messages"):
                why, info = check_model_request(dec, headers)
            count["requests"] += 1
            ok = why is None or a.mode == "observe"
            log(event="request", conn=cid, host=host, method=method[:10], path=path[:120], allowed=ok,
                **({"why": why} if why else {}), body=len(dec), **info)
            if not ok:
                count["refused"] += 1
                cw.write(refuse_response(why)); await cw.drain()
                break
            req = rebuild(method, target, hdrs, dec)
            uw.write(req); count["up"] += len(req)
            await uw.drain()
    finally:
        try:
            uw.close()
        except (OSError, RuntimeError):
            pass
        down.cancel()
        try:
            await down
        except (asyncio.CancelledError, Exception):
            pass
    return count


async def handle(cr, cw):
    N[0] += 1; cid = N[0]
    t0 = time.time()
    host = port = None
    try:
        try:
            head = await asyncio.wait_for(cr.readuntil(b"\r\n\r\n"), 30)
        except (asyncio.IncompleteReadError, asyncio.TimeoutError, asyncio.LimitOverrunError, ConnectionError):
            head = b""
        line = head.split(b"\r\n", 1)[0].decode("latin-1", "replace")[:300]
        parts = line.split()
        method = parts[0] if parts else ""
        target = parts[1] if len(parts) > 1 else ""
        if method.upper() == "CONNECT":
            h, _, p = target.rpartition(":")
            host, port = h.strip("[]").lower().rstrip("."), (int(p) if p.isdigit() else None)
        elif "://" in target:
            host = target.split("://", 1)[1].split("/", 1)[0].rsplit("@", 1)[-1].split(":")[0].lower()
        if not (method.upper() == "CONNECT" and (host, port) in ALLOW):
            log(event="refused", conn=cid, method=method[:16], host=(host or "")[:200], port=port)
            cw.write(b"HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\nConnection: close\r\n\r\n")
            await cw.drain()
            return
        cw.write(b"HTTP/1.1 200 Connection established\r\n\r\n"); await cw.drain()
        log(event="open", conn=cid, method="CONNECT", host=host, port=port, allowed=True, mode=a.mode)
        if a.mode != "tunnel" and host in INSPECT_HOSTS:
            count = await inspect(cr, cw, host, port, cid)
        else:
            ur, uw = await asyncio.wait_for(asyncio.open_connection(host, port), 20)
            count = {"up": 0, "down": 0}
            await asyncio.gather(pipe(cr, uw, count, "up"), pipe(ur, cw, count, "down"))
        log(event="close", conn=cid, host=host, port=port, s=round(time.time() - t0, 1), **count)
    except Exception as e:
        log(event="error", conn=cid, host=host, port=port, error=f"{type(e).__name__}: {str(e)[:120]}")
    finally:
        try:
            cw.close()
        except (OSError, RuntimeError):
            pass


async def watch():
    while True:
        await asyncio.sleep(1)
        if a.watch_pid:
            try:
                os.kill(a.watch_pid, 0)
            except ProcessLookupError:
                log(event="stop", why=f"watched pid {a.watch_pid} gone")
                os._exit(0)


async def main():
    if a.mode != "tunnel":
        ensure_ca(a.ca_dir, INSPECT_HOSTS)
    if os.path.exists(a.socket):
        os.remove(a.socket)
    srv = await asyncio.start_unix_server(handle, path=a.socket, limit=1 << 20)
    os.chmod(a.socket, 0o666)          # the bridge inside runs as nobody
    log(event="start", allow=sorted(f"{h}:{p}" for h, p in ALLOW), mode=a.mode, pid=os.getpid())
    asyncio.create_task(watch())
    async with srv:
        await srv.serve_forever()


try:
    asyncio.run(main())
finally:
    try:
        os.remove(a.socket)
    except OSError:
        pass
