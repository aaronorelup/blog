"""Verifier: list a remote wheel's zip central directory with HTTP Range requests (no full download, nothing installed
or executed) and report whether mediapipe/python/solutions/hands.py is in it."""
import io, json, sys, urllib.request, zipfile

class HTTPRangeFile(io.RawIOBase):
    def __init__(self, url):
        self.url = url; self.pos = 0; self.fetched = 0
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=60) as r:
            self.size = int(r.headers["Content-Length"])
    def seekable(self): return True
    def readable(self): return True
    def tell(self): return self.pos
    def seek(self, off, whence=0):
        self.pos = off if whence == 0 else (self.pos + off if whence == 1 else self.size + off); return self.pos
    def read(self, n=-1):
        if n is None or n < 0: n = self.size - self.pos
        if n == 0 or self.pos >= self.size: return b""
        end = min(self.size, self.pos + n) - 1
        req = urllib.request.Request(self.url, headers={"Range": f"bytes={self.pos}-{end}"})
        with urllib.request.urlopen(req, timeout=120) as r:
            data = r.read()
        self.pos += len(data); self.fetched += len(data); return data
    def readinto(self, b):
        d = self.read(len(b)); b[:len(d)] = d; return len(d)

for v in sys.argv[1:]:
    meta = json.load(urllib.request.urlopen(f"https://pypi.org/pypi/mediapipe/{v}/json", timeout=60))
    cands = [u for u in meta["urls"] if u["filename"].endswith(".whl") and "x86_64" in u["filename"] and "manylinux" in u["filename"]
             and ("cp311" in u["filename"] or "py3-none" in u["filename"])]
    if not cands:
        print(v, "no linux x86_64 cp311/py3 wheel"); continue
    u = cands[0]
    f = HTTPRangeFile(u["url"])
    z = zipfile.ZipFile(io.BufferedReader(f, buffer_size=1 << 16))
    names = z.namelist()
    has = "mediapipe/python/solutions/hands.py" in names
    print(v, u["filename"], "solutions/hands.py:", has, "| entries", len(names), "| bytes fetched", f.fetched, "of", f.size)
