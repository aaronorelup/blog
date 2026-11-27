#!/usr/bin/env python3
"""net_bridge.py <unix socket> <port>

Runs INSIDE a sandboxed call's network namespace (whose only interface is loopback): listens on 127.0.0.1:<port> and
joins every connection to the unix socket served by net_filter.py outside, which lets through only CONNECT to the
allowed hosts. The call's HTTPS_PROXY points here. `--up` first brings the namespace's loopback up (needs
CAP_NET_ADMIN; sandbox_run.sh does it before the capabilities are dropped) and exits."""
import fcntl, socket, struct, sys, threading


def lo_up():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    ifr = struct.pack("16sh", b"lo", 0)
    flags = struct.unpack("16sh", fcntl.ioctl(s, 0x8913, ifr))[1]          # SIOCGIFFLAGS
    fcntl.ioctl(s, 0x8914, struct.pack("16sh", b"lo", flags | 0x1))        # SIOCSIFFLAGS, IFF_UP
    s.close()


def pipe(src, dst):
    try:
        while True:
            d = src.recv(65536)
            if not d:
                break
            dst.sendall(d)
    except OSError:
        pass
    finally:
        for s, how in ((dst, socket.SHUT_WR), (src, socket.SHUT_RD)):
            try:
                s.shutdown(how)
            except OSError:
                pass


def serve(path, port):
    ls = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    ls.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    ls.bind(("127.0.0.1", port))
    ls.listen(64)
    while True:
        c, _ = ls.accept()
        try:
            u = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            u.connect(path)
        except OSError:
            c.close(); continue

        def run(c=c, u=u):
            t = threading.Thread(target=pipe, args=(u, c), daemon=True); t.start()
            pipe(c, u); t.join(); c.close(); u.close()
        threading.Thread(target=run, daemon=True).start()


if __name__ == "__main__":
    if sys.argv[1] == "--up":
        lo_up(); sys.exit(0)
    serve(sys.argv[1], int(sys.argv[2]))
