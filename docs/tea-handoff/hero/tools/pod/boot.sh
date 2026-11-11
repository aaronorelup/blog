#!/bin/bash
# Plan B bootstrap on runpod/pytorch:1.0.2-cu1281-torch280-ubuntu2404 (Python 3.12, torch 2.8 cu128).
cd /root/spike
export DEPS_FLAG=/root/spike/DEPS_OK HF_HOME=/content/cache HF_HUB_ENABLE_HF_TRANSFER=1
python3 /root/spike/server.py > /root/spike/server.log 2>&1 &
{
set -x
W=https://github.com/camenduru/wheels/releases/download/trellis2
pip install --no-cache-dir triton==3.4.0 pillow imageio==2.37.2 imageio-ffmpeg==0.6.0 tqdm easydict==1.13 opencv-python-headless==4.12.0.88 \
  trimesh==4.10.1 transformers==4.57.3 zstandard==0.25.0 kornia==0.8.2 timm==1.0.22 hf_transfer plyfile "huggingface_hub[cli]"
for w in cumesh-0.0.1 flash_attn-2.8.3 flex_gemm-0.0.1 nvdiffrast-0.4.0 nvdiffrec_render-0.0.0 o_voxel-0.0.1; do
  pip install --no-cache-dir --no-deps $W/$w-cp312-cp312-linux_x86_64.whl
done
GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 --branch dev https://github.com/camenduru/TRELLIS.2-hf /content/TRELLIS.2
for r in camenduru/TRELLIS.2-4B camenduru/RMBG-2.0 camenduru/dinov3-vitl16-pretrain-lvd1689m; do hf download $r > /dev/null; done; du -sh /content/cache
python3 -c "import torch, o_voxel, cumesh, flash_attn; print('deps ok', torch.__version__, torch.cuda.get_device_name())"
touch /root/spike/DEPS_OK
} > /root/spike/boot.log 2>&1
sleep infinity
