#!/bin/bash
# verify-gapfill-chords-beats-key: rebuild the gap round's venv-allin1 (Python 3.9) from its saved freeze, build NATTEN
# 0.17.3 from the PyPI sdist as in r0518, fetch the same weights, re-run allin1_run.py on S3 (as r0521), then compare.
# Everything goes under /home/user/gtr/lanes/chords-beats-key/verify-gap1/ ; the venv is deleted by the cleanup step.
set -e
source /home/user/gtr/env.sh >/dev/null 2>&1
L=/home/user/gtr/lanes/chords-beats-key; V=$L/verify-gap1; S=/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key/scripts
SM=/home/user/blog/docs/guitar-tab-research/lanes/chords-beats-key/samples
VE=$L/venv-verify-allin1
echo "== $(date -u +%FT%TZ) venv"; rm -rf $VE; uv venv -q --python 3.9 $VE
echo "numpy==1.23.5" > $V/logs/allin1_constraints.txt
grep -v '^#' $SM/allin1/venv-allin1.freeze.txt | grep -v '^natten==' > $V/logs/allin1_req_without_natten.txt
echo "== $(date -u +%FT%TZ) install freeze without natten"
( time uv pip install --python $VE/bin/python -c $V/logs/allin1_constraints.txt -r $V/logs/allin1_req_without_natten.txt ) 2>&1 | grep -v '^ + ' | tail -25
echo "== $(date -u +%FT%TZ) natten 0.17.3 build"
gtr-run --lane chords-beats-key --tool natten-0.17.3-build --label "verify: build NATTEN 0.17.3 from the PyPI sdist, CPU only, into venv-verify-allin1 (torch 2.5.1+cpu, Python 3.9), as r0518" -- \
  bash -c "export PATH=$VE/bin:\$PATH NATTEN_N_WORKERS=2; uv pip install --python $VE/bin/python -c $V/logs/allin1_constraints.txt --no-build-isolation natten==0.17.3 2>&1 | grep -v '^DEBUG' | tail -5; $VE/bin/python -c \"import natten, torch; print('natten', natten.__version__, 'torch', torch.__version__); from natten.functional import natten1dav, natten1dqkrpb, natten2dav, natten2dqkrpb; print('deprecated ops import OK')\""
uv pip freeze --python $VE/bin/python > $V/logs/venv-verify-allin1.freeze.txt
if diff <(grep -v '^#' $SM/allin1/venv-allin1.freeze.txt) $V/logs/venv-verify-allin1.freeze.txt; then echo "freeze identical to samples/allin1/venv-allin1.freeze.txt"; fi
echo "== $(date -u +%FT%TZ) weights"
$VE/bin/python -I -c "
from demucs.pretrained import get_model; m=get_model('htdemucs'); print(type(m).__name__)
from allin1.models import load_pretrained_model; load_pretrained_model(model_name='harmonix-all', device='cpu'); print('harmonix-all loaded')" 2>&1 | grep -v Warning | tail -3
( cd $TORCH_HOME/hub/checkpoints && sha256sum 955717e8-8726e21a.th ); find $HF_HOME/hub/models--taejunkim--allinone -name 'harmonix-fold*.pth' -exec sha256sum {} \; | sed 's#  .*/#  #' | sort -k2
cat > $S/verify/gap1/plans/verify_allin1_S3.json <<EOP
[{"tool": "allin1", "python": "$VE/bin/python", "script": "$S/allin1_run.py", "clips": ["S3"], "args": [], "tag": "allin1"}]
EOP
echo "== $(date -u +%FT%TZ) run"
cd $L && gtr-run --lane chords-beats-key --tool allin1-1.1.0 --label "verify: re-run allin1 1.1.0 harmonix-all on S3 with the stage-timed wrapper, as r0521 (venv rebuilt from the gap round's freeze, NATTEN 0.17.3 rebuilt), outputs to verify-gap1/reruns" --input /home/user/gtr/inputs/S3/S3.wav -- \
  $VE/bin/python -I $S/verify/vbatch.py --plan $S/verify/gap1/plans/verify_allin1_S3.json --log $V/logs/verify_allin1_S3.jsonl --outroot $V/reruns
echo "== $(date -u +%FT%TZ) done"
