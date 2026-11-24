"""Read any PCM/float WAV as float64 (frames x channels) and write 24-bit PCM WAV with a fixed header, so the
same samples always give the same bytes. numpy and scipy only."""
import struct

import numpy as np
from scipy.io import wavfile


def read_wav(path):
    """Returns float64 samples in [-1, 1]: shape (n,) for mono, (n, ch) otherwise."""
    with open(path, 'rb') as f:
        head = f.read(64)
    if head[:4] == b'RIFF' and head[8:12] == b'WAVE':
        fmt = head.find(b'fmt ')
        bits = struct.unpack('<H', head[fmt + 22:fmt + 24])[0]
        tag = struct.unpack('<H', head[fmt + 8:fmt + 10])[0]
        if bits == 24 and tag in (1, 0xFFFE):
            return _read24(path)
    sr, x = wavfile.read(path)
    if x.dtype.kind == 'i':
        x = x.astype(np.float64) / float(-np.iinfo(x.dtype).min)
    elif x.dtype.kind == 'u':
        x = (x.astype(np.float64) - 128) / 128
    else:
        x = x.astype(np.float64)
    return x


def _read24(path):
    data = open(path, 'rb').read()
    i = 12
    ch = None
    while i < len(data) - 8:
        cid, size = data[i:i + 4], struct.unpack('<I', data[i + 4:i + 8])[0]
        if cid == b'fmt ':
            ch = struct.unpack('<H', data[i + 10:i + 12])[0]
        if cid == b'data':
            raw = np.frombuffer(data[i + 8:i + 8 + size], dtype=np.uint8)
            raw = raw[:len(raw) // 3 * 3].reshape(-1, 3).astype(np.int32)
            v = raw[:, 0] | (raw[:, 1] << 8) | (raw[:, 2] << 16)
            v = np.where(v >= 1 << 23, v - (1 << 24), v)
            x = v.astype(np.float64) / float(1 << 23)
            return x.reshape(-1, ch) if ch > 1 else x
        i += 8 + size + (size & 1)
    raise ValueError('no data chunk in ' + path)


def write_wav24(path, x, sr):
    """x: float array (n, ch). Clipped to the 24-bit range, rounded half to even (numpy's rint)."""
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = x[:, None]
    n, ch = x.shape
    v = np.clip(np.rint(x * 8388607.0), -8388608, 8388607).astype(np.int32).reshape(-1)
    b = np.empty((v.size, 3), dtype=np.uint8)
    b[:, 0] = v & 0xFF
    b[:, 1] = (v >> 8) & 0xFF
    b[:, 2] = (v >> 16) & 0xFF
    body = b.tobytes()
    hdr = (b'RIFF' + struct.pack('<I', 36 + len(body)) + b'WAVE' + b'fmt ' +
           struct.pack('<IHHIIHH', 16, 1, ch, sr, sr * ch * 3, ch * 3, 24) + b'data' + struct.pack('<I', len(body)))
    with open(path, 'wb') as f:
        f.write(hdr)
        f.write(body)
