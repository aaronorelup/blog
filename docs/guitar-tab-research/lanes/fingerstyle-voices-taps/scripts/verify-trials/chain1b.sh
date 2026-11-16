#!/usr/bin/env bash
# Verifier chain 1b (nolock, 1 thread; the slot queue did not free within 29 min) re-running r0031, r0247, r0235 from their recorded commands.
source /home/user/gtr/env.sh >/dev/null 2>&1
export OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 NUMBA_NUM_THREADS=1
L=/home/user/gtr/lanes/fingerstyle-voices-taps; V=$L/verify-trials; S=/home/user/blog/docs/guitar-tab-research/lanes/fingerstyle-voices-taps/scripts
gtr-run --nolock --lane fingerstyle-voices-taps --tool librosa-hpss --label "verify: re-run of r0031 (librosa_hpss_sweep.py S6taps, margins 1-16 + onset_detect), output to verify-trials/; nolock, 1 thread" --input /home/user/gtr/inputs/S6taps/S6taps.mono.wav -- $L/venv-core/bin/python -I -B $S/librosa_hpss_sweep.py S6taps $V/librosa-hpss/S6taps
gtr-run --nolock --lane fingerstyle-voices-taps --tool madmom --label "verify: re-run of r0247 (madmom_onsets.sh, 8 programs on S6taps mono) (nolock, 1 thread)" --input /home/user/gtr/inputs/S6taps/S6taps.mono.wav -- bash $S/madmom_onsets.sh $L/venv-madmom /home/user/gtr/inputs/S6taps/S6taps.mono.wav $V/madmom/S6taps
gtr-run --nolock --lane fingerstyle-voices-taps --tool librosa-pyin-bass --label "verify: re-run of r0235 (bass_lowpass_pyin.py S2n, cutoffs 150/200/250) (nolock, 1 thread)" --input /home/user/gtr/inputs/S2n/S2n.mono.wav -- $L/venv-core/bin/python -I -B $S/bass_lowpass_pyin.py S2n $V/bass-lowpass-pyin/S2n
echo CHAIN1B-DONE
