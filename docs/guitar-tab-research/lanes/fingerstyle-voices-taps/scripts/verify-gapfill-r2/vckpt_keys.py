#!/usr/bin/env python3
"""List (verifier, round 2) the top-level keys of a PyTorch checkpoint's data.pkl from the first bytes of the file.

Usage: python3 -I vckpt_keys.py <first bytes of the .ckpt (zip, first entry stored)>
The pickle is read by pickle.Unpickler with find_class() returning an inert stub class and persistent_load()
returning a placeholder, so no module named in the file is imported and no code from the file runs; tensor data
(in other zip entries) is not read. Prints the top-level keys with the type or value of each, and the state_dict's
word_emb and in_linear shapes (from the _rebuild_tensor_v2 arguments).
"""
import pickle
import struct
import sys


class Stub:
    def __init__(self, *a, **k):
        self.args, self.items, self.state = a, {}, None

    def __setitem__(self, k, v):
        self.items[k] = v

    def __setstate__(self, s):
        self.state = s

    def __repr__(self):
        return f"Stub{self.args!r}"


class Safe(pickle.Unpickler):
    def find_class(self, module, name):
        return type(f"{module}.{name}", (Stub,), {})

    def persistent_load(self, pid):
        return ("persistent", pid)


b = open(sys.argv[1], "rb").read()
assert b[:4] == b"PK\x03\x04"
method, = struct.unpack("<H", b[8:10])
nlen, xlen = struct.unpack("<HH", b[26:30])
name = b[30:30 + nlen].decode()
data = b[30 + nlen + xlen:]
obj = Safe(__import__("io").BytesIO(data)).load()
print("first zip entry:", name, "| compression method:", method, "| top-level type:", type(obj).__name__)
for k, v in obj.items():
    if isinstance(v, (int, float, str)):
        print("  key", repr(k), "=", v)
    else:
        print("  key", repr(k), "->", type(v).__name__, (len(v.items) if isinstance(v, Stub) else len(v) if hasattr(v, "__len__") else ""))
sd = obj["state_dict"]
items = sd.items if isinstance(sd, Stub) else sd
print("state_dict entries:", len(items))
for k, v in items.items():
    if "word_emb" in k or "in_linear" in k:
        # _rebuild_tensor_v2(storage, storage_offset, size, stride, requires_grad, backward_hooks)
        args = v.args if isinstance(v, Stub) else None
        storage = args[0] if args else None
        print("  ", k, "size", args[2] if args else None, "storage", storage[1][:4] if storage else None)
