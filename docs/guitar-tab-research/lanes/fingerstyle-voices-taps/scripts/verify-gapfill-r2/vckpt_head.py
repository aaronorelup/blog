#!/usr/bin/env python3
"""Read (verifier) the pickle opcodes of a PyTorch checkpoint's data.pkl from the first bytes of the zip, without
unpickling: zip local header -> stored data.pkl -> pickletools.genops. Prints top-level keys, GLOBALs, storage
locations and every tensor name with its shape. Usage: python3 -I vckpt_head.py <first bytes of the .ckpt>"""
import pickletools, struct, sys
b = open(sys.argv[1], "rb").read()
assert b[:4] == b"PK\x03\x04", "not a zip local header"
method, = struct.unpack("<H", b[8:10]); csize, usize = struct.unpack("<II", b[18:26]); nlen, xlen = struct.unpack("<HH", b[26:30])
name = b[30:30 + nlen].decode(); start = 30 + nlen + xlen
print("first entry:", name, "method", method, "(0 = stored)", "sizes", csize, usize)
data = b[start:start + (usize if usize else len(b))]
ops = list(pickletools.genops(data))
strings = [a for op, a, pos in ops if isinstance(a, str)]
globs = [a for op, a, pos in ops if op.name in ("GLOBAL", "STACK_GLOBAL")]
print("GLOBAL opcodes:", sorted(set(globs)))
# STACK_GLOBAL takes module and name from the two preceding strings
sg = []
for i, (op, a, pos) in enumerate(ops):
    if op.name == "STACK_GLOBAL":
        sg.append(tuple(x[1] for x in ops[i - 2:i]))
print("STACK_GLOBAL pairs:", sorted(set(sg)))
print("storage locations:", sorted({s for s in strings if s.startswith("cuda") or s == "cpu"}))
print("strings that look like keys:", [s for s in strings if s in ("epoch", "state_dict", "optimizer", "best_acc")])
# tensor names followed by their shape tuples: walk opcodes, remember the last name-like string, print TUPLE of ints after it
last = None; cur = []; out = []
for op, a, pos in ops:
    if isinstance(a, str) and ("." in a and ("weight" in a or "bias" in a)):
        last = a; cur = []
    elif op.name in ("BININT", "BININT1", "BININT2") and last:
        cur.append(a)
    elif op.name in ("TUPLE1", "TUPLE2", "TUPLE3", "TUPLE") and last and cur:
        out.append((last, tuple(cur))); last = None; cur = []
for n, sh in out:
    if "word_emb" in n or "in_linear" in n:
        print(n, sh)
