"""Run the ADTOF-pytorch CLI from a reviewed copy of its package source (no pip install of the clone).

Usage: python -I adtof_run.py <dir that contains the adtof_pytorch package> --audio in.wav --out out.mid --device cpu
The package directory holds only the five .py files of src/adtof_pytorch at commit 85c192e and its bundled
weights data/adtof_frame_rnn_pytorch_weights.pth (no __pycache__). torch >= 2.6 loads the .pth with
torch.load's default weights_only=True.
"""
import sys

sys.path.insert(0, sys.argv[1])
sys.argv = ["adtof"] + sys.argv[2:]
from adtof_pytorch.cli import main  # noqa: E402

main()
