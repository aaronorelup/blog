"""verify-gapfill-chords-beats-key: check that each quote the gap round added is in the page as fetched today.

Pages: /home/user/gtr/lanes/chords-beats-key/verify-gap1/raw/pages/ (fetch_sources.sh). HTML is reduced to text (tags
removed, entities decoded); whitespace is collapsed on both sides; curly and straight quotes are kept as they are.
Run: python3 -I check_quotes.py
"""
import html, os, re, sys

P = "/home/user/gtr/lanes/chords-beats-key/verify-gap1/raw/pages"


def text(name):
    s = open(os.path.join(P, name), encoding="utf-8", errors="replace").read()
    if name.endswith(".html") or name.endswith(".xml"):
        s = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", s)
        s = re.sub(r"(?s)<[^>]+>", " ", s)
        s = html.unescape(s)
    return re.sub(r"\s+", " ", s)


def norm(q):
    return re.sub(r"\s+", " ", q).strip()


Q = [
    ("natten_install.html", "if you need to install older NATTEN versions, you can find their wheels in their corresponding GitHub release, or build them from PyPI distributions."),
    ("natten_install.html", "Refer to our release index on GitHub, or build from distribution using PyPI."),
    ("natten_install.html", "Older NATTEN builds"),
    ("natten_CHANGELOG.md", "the changed signature in both QK and AV (both 1D and 2D), where we now take in both kernel size and dilation"),
    ("natten_CHANGELOG.md", "Dropped deprecated ops (`natten.functional.natten*d{qk,qkrpb,av}`)"),
    ("natten_CHANGELOG.md", "Dropped unfused / CPU backends in libnatten."),
    ("natten_CHANGELOG.md", "CPU implementations were all unfused, and were very limited as well, and are likewise removed."),
    ("natten_LICENSE", "Copyright (c) 2022 - 2026 Ali Hassani."),
    ("essentia_std_Key.html", "profiles based on Krumhansl’s specifically tuned to popular and electronic music"),
    ("vamp_pack.html", "Installer for 64-bit Linux"),
    ("vamp_pack.html", "1. Save the file 2. Make it executable 3. Run it"),
    ("hf_skey_onnx_README.md", "FP32 ONNX conversion of the pretrained [Deezer S-KEY](https://github.com/deezer/skey) model, used by [Key & Tempo](https://github.com/Hikari-Tsai/music-detection) to estimate a single global major or minor key from audio."),
    ("hf_skey_onnx_README.md", "This is a community conversion of the upstream checkpoint, not a newly trained model or an official Deezer release."),
    ("hf_skey_onnx_README.md", "Input `audio` is float32 mono PCM at **22,050 Hz**, shape `[1, samples]`. Output `scores` has shape `[1, 24]`. Peak normalization, VQT/dB preprocessing, frequency cropping and ChromaNet are included in the graph. Scores already include the upstream softmax; do not apply softmax again."),
    ("hf_skey_onnx_README.md", "explicitly describes the S-KEY **code** as MIT-licensed. That paragraph does not separately state a license for pretrained weights; this model card does not assign them a new license."),
    ("hf_skey_onnx_README.md", "its softmax scores are not calibrated confidence"),
    ("hf_skey_onnx_README.md", "Browser inference uses ONNX Runtime Web WASM CPU"),
    ("hf_skey_onnx_LICENSE", "Copyright (c) 2019-present, Deezer SA."),
    ("hf_skey_onnx_ConvNeXt-LICENSE", "Copyright (c) Meta Platforms, Inc. and affiliates."),
    ("hf_skey_onnx_nnAudio-LICENSE", "Copyright (c) 2018 The Python Packaging Authority"),
    ("skey_README_918b83d.md", "The code of **SKEY** is [MIT-licensed](LICENSE)."),
    ("skey_README_main.md", "The MIT license **does not** apply to the model weights in skey.pt. You may use the model weights only for non-commercial research purposes."),
    ("skey_LICENSE_main", "Copyright (c) 2019-present, Deezer SA."),
    ("skey_key_detection_main.py", 'torchaudio.load(song_path, backend="soundfile")'),
    ("skey_key_detection_main.py", "torchaudio.transforms.Resample(orig_freq=waveform_sr, new_freq=sr)"),
    ("skey_key_detection_main.py", "torch.mean(waveform, dim=0, keepdim=True)"),
    ("skey_key_detection_main.py", "key_map[int(torch.mean(logits, dim=0).argmax())]"),
    ("arxiv_2506.14223v1.html", "The integration of context-sensitive processing and tuning/capo conditioning further enhances the model’s performance"),
    ("arxiv_2506.14223v1.html", "Conditioning on Tuning and Capo"),
    ("arxiv_abs_2510.10619.html", "A Machine Learning Approach for MIDI to Guitar Tablature Conversion"),
    ("ubuntu_keyfinder.html", "Sorry, your search gave no results"),
    ("debian_keyfinder.html", "Sorry, your search gave no results"),
    ("ubuntu_qm-vamp.html", "Sorry, your search gave no results"),
    ("debian_qm-vamp.html", "Sorry, your search gave no results"),
    ("ubuntu_sonic-annotator.html", "Sorry, your search gave no results"),
    ("debian_sonic-annotator.html", "Sorry, your search gave no results"),
    ("keyfinder-cli_README.md", "ffmpeg"),
    ("keyfinder-cli_README.md", "libkeyfinder"),
    ("keyfinder-cli_README.md", "`A` is equivalent to A Major. Sharps are not used."),
    ("libkeyfinder_README.md", "-DBUILD_TESTING=OFF"),
    ("allin1_README.md", "Install NATTEN (Required for Linux and Windows; macOS will auto-install)"),
]
bad = 0
for f, q in Q:
    ok = norm(q) in text(f)
    if not ok:
        bad += 1
    print("OK  " if ok else "MISS", f, "|", q[:110])
print("missing:", bad, "of", len(Q))
