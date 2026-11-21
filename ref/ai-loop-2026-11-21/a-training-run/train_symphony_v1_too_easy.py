"""
Experiment A: an audible training run that breaks at 20:00.

Riff on "Gradient Descent for Orchestra" (Fable 5.2, x.com/imjustnewatai/status/2120383964686729410)
crossed with I Love My Evening Television (programmes that break at twenty minutes).

What is real here:
- A target melody (a gentle 8-note station ident, 2 phrases) is rendered to audio and FFT'd.
- The "orchestra" is a bank of 37 pitched voices (A2..A5) plus one white-noise voice, with one
  amplitude per voice per note slot. It never sees the note list, only the target's magnitude spectrum.
- Plain full-batch gradient descent on spectral MSE. Each rendered bar is the model's *current*
  parameters played back. Nothing is scripted except the learning-rate schedule.
- At "20:00" of a 30:00 programme (2/3 through), the learning rate is ramped past the stability limit
  2/lambda_max of the loss's Hessian. The divergence that follows is the optimiser's real dynamics.
"""
import json, time, numpy as np
from pathlib import Path
import wave

OUT = Path(__file__).parent / "out"; OUT.mkdir(exist_ok=True)
SR = 22050
NOTE = 0.18                      # seconds per note slot
rng = np.random.default_rng(20)  # seed 20 for 20:00

# --- the ident: G major, music-box-ish. (MIDI numbers)
melody = [67, 71, 74, 79, 78, 74, 76, 71,   69, 72, 76, 74, 71, 67, 69, 67]
K = len(melody)
pitches = np.arange(45, 82)      # A2..A5, 37 voices
P = len(pitches)
f = 440.0 * 2 ** ((pitches - 69) / 12)

n = int(SR * NOTE); t = np.arange(n) / SR
env = np.minimum(1, t / 0.01) * np.exp(-t / 0.09)          # pluck envelope
def tone(freq):
    # 4 harmonics, music-box timbre
    return env * sum((0.6 ** h) * np.sin(2 * np.pi * freq * (h + 1) * t) for h in range(4))
TONES = np.stack([tone(fr) for fr in f])                     # P x n
NOISE = env * rng.standard_normal(n) * 0.5
win = np.hanning(n)
def mag(x): return np.abs(np.fft.rfft(x * win))
Phi = np.stack([mag(x) for x in TONES] + [mag(NOISE)])      # (P+1) x B  basis spectra
Phi /= Phi.max()
# target: render the real melody, take its spectrum per slot
target_audio = np.stack([TONES[list(pitches).index(m)] for m in melody])
T = np.stack([mag(x) for x in target_audio]) / np.stack([mag(x) for x in TONES]).max()  # K x B

# loss L(A) = mean ||A Phi - T||^2 ; Hessian ~ (2/N) Phi Phi^T
G = Phi @ Phi.T
lam_max = np.linalg.eigvalsh(G).max()
N = K * Phi.shape[1]
L_hess = 2 * lam_max / N
lr_stable = 0.9 / L_hess          # safe
lr_crit = 2.0 / L_hess            # divergence threshold for GD on a quadratic

A = rng.uniform(0, 0.35, size=(K, P + 1)); A[:, -1] = 1.0    # start: random cluster + loud noise

# programme: 30:00 mapped to 90 s of audio. each bar = K*NOTE = 2.88 s -> 31 bars.
BAR = K * NOTE
n_bars = int(round(90 / BAR))
break_bar = int(round(n_bars * 20 / 30))
steps_per_bar = []
# log-spaced training steps per bar so the early learning is audible
cum = np.unique(np.round(np.geomspace(1, 400, break_bar)).astype(int))
while len(cum) < break_bar: cum = np.append(cum, cum[-1] + 1)
cum = cum[:break_bar]

def loss(A): R = A @ Phi - T; return float((R ** 2).mean())
def grad(A): R = A @ Phi - T; return 2 * R @ Phi.T / N

def render(A):
    bars = []
    for k in range(K):
        a = A[k]
        x = a[:-1] @ TONES + a[-1] * env * rng.standard_normal(n) * 0.5
        bars.append(x)
    return np.concatenate(bars)

audio, log = [], []
step = 0; lr = lr_stable
t0 = time.time()
for b in range(n_bars):
    if b < break_bar:
        target_step = cum[b]
        while step < target_step:
            A -= lr * grad(A); step += 1
    else:
        # after 20:00: ramp lr 12% per step, 6 steps per bar -> crosses 2/L within ~2 bars
        for _ in range(6):
            lr *= 1.12; A -= lr * grad(A); step += 1
    l = loss(A)
    top = [int(pitches[i]) for i in np.argmax(A[:, :-1], axis=1)]
    acc = float(np.mean(np.array(top) == np.array(melody)))
    clock = 30 * b / n_bars
    log.append(dict(bar=b, clock=f"{int(clock):02d}:{int((clock%1)*60):02d}", step=step, lr_over_crit=lr / lr_crit,
                    loss=l, note_accuracy=acc, noise_amp=float(A[:, -1].mean()), max_abs_amp=float(np.abs(A).max())))
    audio.append(render(A))
elapsed = time.time() - t0

y = np.concatenate(audio)
y = np.tanh(y / 1.5)               # soft clip so the divergence is listenable, not a square wave
y = (y / np.abs(y).max() * 0.9 * 32767).astype(np.int16)
with wave.open(str(OUT / "training_run_symphony.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
json.dump(dict(seed=20, sr=SR, bars=n_bars, break_bar=break_bar, bar_seconds=BAR, lr_stable_over_crit=lr_stable / lr_crit,
               lam_max=float(lam_max), compute_seconds=elapsed, log=log), open(OUT / "log.json", "w"), indent=1)
for r in log: print(r["clock"], f"step={r['step']:4d} lr/crit={r['lr_over_crit']:.2f} loss={r['loss']:.3e} notes={r['note_accuracy']:.2f} noise={r['noise_amp']:.3f} max|a|={r['max_abs_amp']:.2e}")
print("compute seconds:", round(elapsed, 2), "audio seconds:", len(y) / SR)
