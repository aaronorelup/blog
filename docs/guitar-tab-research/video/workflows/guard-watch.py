#!/usr/bin/env python3
"""Log every open or read of the answer folders while the blind attempts run.

Usage: python3 watch.py <log file>
Plain inotify through ctypes (no install). Watches each folder below the roots,
adds watches for folders created later, and writes one line per event:
<UTC time> <event> <path>. SIGTERM or SIGINT writes a footer and stops.
"""
import ctypes, ctypes.util, os, signal, struct, sys, time

IN_ACCESS, IN_OPEN, IN_CREATE, IN_ISDIR, IN_Q_OVERFLOW = 0x1, 0x20, 0x100, 0x40000000, 0x4000
GTV = "/home/user/gtv"
ROOTS = [f"{GTV}/truth", f"{GTV}/songs", f"{GTV}/experiments", f"{GTV}/candidates", f"{GTV}/work",
         f"{GTV}/production", "/home/user/blog/docs/guitar-tab-research"]
FILES = [(f"{GTV}/tools/INSTALLED.md", IN_ACCESS | IN_OPEN), ("/home/user/gtr/ledger/runs.jsonl", IN_ACCESS)]

libc = ctypes.CDLL(ctypes.util.find_library("c"), use_errno=True)
fd = libc.inotify_init1(0)
if fd < 0:
    sys.exit("inotify_init1 failed")
wd_path = {}


def add(path, mask):
    wd = libc.inotify_add_watch(fd, path.encode(), mask)
    if wd >= 0:
        wd_path[wd] = path
    return wd


def add_tree(root):
    for dp, dn, _ in os.walk(root):
        dn[:] = [d for d in dn if d != ".git"]
        add(dp, IN_ACCESS | IN_OPEN | IN_CREATE)


log = open(sys.argv[1], "a", buffering=1)
now = lambda: time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
for r in ROOTS:
    if os.path.isdir(r):
        add_tree(r)
for p, m in FILES:
    if os.path.exists(p):
        add(p, m)
time.sleep(0.5)
os.set_blocking(fd, False)
try:
    while os.read(fd, 65536):  # drop the events of our own walk
        pass
except BlockingIOError:
    pass
os.set_blocking(fd, True)
log.write(f"# START {now()} pid {os.getpid()} watching {len(wd_path)} paths. Roots: {' '.join(ROOTS)}. Files: {' '.join(p for p, _ in FILES)}\n")


def stop(*_):
    log.write(f"# STOP {now()}\n")
    sys.exit(0)


signal.signal(signal.SIGTERM, stop)
signal.signal(signal.SIGINT, stop)
names = {IN_ACCESS: "ACCESS", IN_OPEN: "OPEN"}
while True:
    buf = os.read(fd, 65536)
    i = 0
    while i < len(buf):
        wd, mask, _, ln = struct.unpack_from("iIII", buf, i)
        name = buf[i + 16:i + 16 + ln].split(b"\0", 1)[0].decode(errors="replace")
        i += 16 + ln
        if mask & IN_Q_OVERFLOW:
            log.write(f"{now()} OVERFLOW (events lost)\n")
            continue
        path = os.path.join(wd_path.get(wd, "?"), name) if name else wd_path.get(wd, "?")
        if mask & IN_CREATE and mask & IN_ISDIR:
            add_tree(path)
            continue
        kind = "+".join(v for k, v in names.items() if mask & k)
        if kind:
            log.write(f"{now()} {kind}{' DIR' if mask & IN_ISDIR else ''} {path}\n")
