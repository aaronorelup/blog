#!/bin/bash
# verify-gapfill-chords-beats-key: fetch again, on the day of the check, every web source the gap round quoted.
# Pages go to $R/pages/, downloaded packages each into their own empty folder under $R/dl/. Status codes: $R/status.tsv.
R=/home/user/gtr/lanes/chords-beats-key/verify-gap1/raw
mkdir -p $R/pages $R/dl
: > $R/status.tsv
get() { # name url
  code=$(curl -sS -L --max-time 60 -o "$R/pages/$1" -w '%{http_code}' "$2" 2>"$R/pages/$1.err"); echo -e "$1\t$code\t$2\t$(date -u +%FT%TZ)\t$(head -c 200 "$R/pages/$1.err" | tr '\n\t' '  ')" >> $R/status.tsv
}
# All-In-One / NATTEN / Demucs
get natten_shilabs.html https://www.shi-labs.com/natten/
get natten_install.html https://natten.org/install/
get natten_whl_index.html https://whl.natten.org
get natten_CHANGELOG.md https://raw.githubusercontent.com/SHI-Labs/NATTEN/main/CHANGELOG.md
get natten_LICENSE https://raw.githubusercontent.com/SHI-Labs/NATTEN/main/LICENSE
get natten_pypi.json https://pypi.org/pypi/natten/json
get allin1_pypi.json https://pypi.org/pypi/allin1/json
get allin1_README.md https://raw.githubusercontent.com/mir-aidj/all-in-one/main/README.md
get hf_allinone.json https://huggingface.co/api/models/taejunkim/allinone
get hf_allinone_tree.json https://huggingface.co/api/models/taejunkim/allinone/tree/main
get demucs_pypi.json https://pypi.org/pypi/demucs/4.0.1/json
# tempo-cnn
get tempocnn_pypi.json https://pypi.org/pypi/tempocnn/json
# libKeyFinder
get ubuntu_keyfinder.html "https://packages.ubuntu.com/search?keywords=keyfinder&searchon=names&suite=all&section=all"
get debian_keyfinder.html "https://packages.debian.org/search?keywords=keyfinder&searchon=names&suite=all&section=all"
for n in keyfinder libkeyfinder pykeyfinder keyfinder-py keyfinder-cli key-finder; do get pypi_$n.json https://pypi.org/pypi/$n/json; done
for n in libkeyfinder keyfinder-cli keyfinder; do get conda_$n.json https://api.anaconda.org/package/conda-forge/$n; done
get essentia_std_Key.html https://essentia.upf.edu/reference/std_Key.html
get libkeyfinder_README.md https://raw.githubusercontent.com/mixxxdj/libkeyfinder/main/README.md
get keyfinder-cli_README.md https://raw.githubusercontent.com/EvanPurkhiser/keyfinder-cli/main/README.md
# S-KEY
for n in skey s-key deezer-skey skey-deezer; do get pypi_$n.json https://pypi.org/pypi/$n/json; done
get hf_skey_onnx.json https://huggingface.co/api/models/aaatmy/skey-onnx
get hf_skey_onnx_tree.json https://huggingface.co/api/models/aaatmy/skey-onnx/tree/main
get hf_skey_onnx_README.md https://huggingface.co/aaatmy/skey-onnx/raw/main/README.md
get hf_skey_onnx_manifest.json https://huggingface.co/aaatmy/skey-onnx/raw/main/manifest.json
get hf_skey_onnx_LICENSE https://huggingface.co/aaatmy/skey-onnx/raw/main/LICENSE
get hf_skey_onnx_ConvNeXt-LICENSE https://huggingface.co/aaatmy/skey-onnx/raw/main/ConvNeXt-LICENSE
get hf_skey_onnx_nnAudio-LICENSE https://huggingface.co/aaatmy/skey-onnx/raw/main/nnAudio-LICENSE
get skey_README_main.md https://raw.githubusercontent.com/deezer/skey/main/README.md
get skey_README_918b83d.md https://raw.githubusercontent.com/deezer/skey/918b83d273568d5041569bb8068843d19a335726/README.md
get skey_LICENSE_main https://raw.githubusercontent.com/deezer/skey/main/LICENSE
get skey_key_detection_main.py https://raw.githubusercontent.com/deezer/skey/main/skey/key_detection.py
# QM Vamp
get ubuntu_qm-vamp.html "https://packages.ubuntu.com/search?keywords=qm-vamp&searchon=names&suite=all&section=all"
get debian_qm-vamp.html "https://packages.debian.org/search?keywords=qm-vamp&searchon=names&suite=all&section=all"
get ubuntu_sonic-annotator.html "https://packages.ubuntu.com/search?keywords=sonic-annotator&searchon=names&suite=all&section=all"
get debian_sonic-annotator.html "https://packages.debian.org/search?keywords=sonic-annotator&searchon=names&suite=all&section=all"
get ubuntu_vamp-plugin.html "https://packages.ubuntu.com/search?keywords=vamp-plugin&searchon=names&suite=all&section=all"
get debian_vamp-plugin.html "https://packages.debian.org/search?keywords=vamp-plugin&searchon=names&suite=all&section=all"
for n in qm-vamp-plugins vamp-plugins-qm qm-dsp qmdsp pyqmdsp vampy sonic-annotator; do get pypi_$n.json https://pypi.org/pypi/$n/json; done
get qm_files.html https://code.soundsoftware.ac.uk/projects/qm-vamp-plugins/files
get vamp_pack.html https://www.vamp-plugins.org/pack.html
get qm_plugin_doc.html https://vamp-plugins.org/plugin-doc/qm-vamp-plugins.html
# Omnizart
get omnizart_pypi.json https://pypi.org/pypi/omnizart/json
# capo / tuning search
get arxiv_capo_guitar.xml "http://export.arxiv.org/api/query?search_query=all:capo+AND+all:guitar&sortBy=submittedDate&sortOrder=descending&max_results=50"
get arxiv_guitar_tuning.xml "http://export.arxiv.org/api/query?search_query=all:%22guitar+tuning%22&sortBy=submittedDate&sortOrder=descending&max_results=50"
get arxiv_ti_guitar_tuning.xml "http://export.arxiv.org/api/query?search_query=ti:guitar+AND+ti:tuning&sortBy=submittedDate&sortOrder=descending&max_results=50"
get arxiv_abs_capo_audio.xml "http://export.arxiv.org/api/query?search_query=abs:capo+AND+abs:audio&sortBy=submittedDate&sortOrder=descending&max_results=50"
get arxiv_2506.14223v1.html https://arxiv.org/html/2506.14223v1
get arxiv_abs_2510.10619.html https://arxiv.org/abs/2510.10619
for q in "guitar%20tuning" "guitar-tuning" "guitar%20tablature" "capo" "drop%20d" "open%20tuning"; do get "hf_search_$(echo $q | tr -c 'a-z0-9-' '_').json" "https://huggingface.co/api/models?search=$q&limit=100"; done
get hf_ast_guitar_config.json https://huggingface.co/magnjorg/ast-finetuned-guitar/raw/main/config.json
for n in guitar-tuning-classification guitar-tuning guitartuning guitar-tuning-classifier tuning-classifier capo-detection guitar-capo; do get pypi_$n.json https://pypi.org/pypi/$n/json; done
echo done
