import json, numpy as np, wave, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
L=json.load(open("out/log.json")); log=L["log"]
w=wave.open("out/training_run_symphony.wav"); sr=w.getframerate(); y=np.frombuffer(w.readframes(w.getnframes()),np.int16)/32768
fig,ax=plt.subplots(2,1,figsize=(13,7),sharex=True,gridspec_kw=dict(height_ratios=[2,1]))
fig.patch.set_facecolor("#111")
for a in ax: a.set_facecolor("#111"); a.tick_params(colors="#ccc"); [s.set_color("#555") for s in a.spines.values()]
ax[0].specgram(y,NFFT=2048,Fs=sr,noverlap=1536,cmap="magma",vmin=-110)
ax[0].set_ylim(0,3000); ax[0].set_ylabel("Hz",color="#ccc")
sec_per_min=len(y)/sr/30
xs=[r["bar"]*L["bar_seconds"] for r in log]
ax[1].semilogy(xs,[r["loss"] for r in log],color="#f0c060",lw=2,label="spectral loss")
ax2=ax[1].twinx(); ax2.plot(xs,[r["energy_on_right_notes"] for r in log],color="#7fd1ff",lw=2,label="energy on the right notes"); ax2.set_ylim(0,1.05); ax2.tick_params(colors="#7fd1ff")
for a in ax: a.axvline(20*sec_per_min,color="#ff3b3b",lw=1.5,ls="--")
ax[0].text(20*sec_per_min+0.5,2800,"20:00",color="#ff3b3b",fontsize=13,va="top")
ticks=np.arange(0,31,5); ax[1].set_xticks(ticks*sec_per_min); ax[1].set_xticklabels([f"{m:02d}:00" for m in ticks])
ax[1].set_xlabel("programme clock (30:00 compressed to 89 s)",color="#ccc"); ax[1].set_ylabel("loss",color="#f0c060")
ax[0].set_title("A training run you can hear, and the moment it breaks",color="#eee",fontsize=14)
fig.tight_layout(); fig.savefig("out/spectrogram_and_loss.png",dpi=110,facecolor=fig.get_facecolor())
