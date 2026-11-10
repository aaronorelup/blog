#!/bin/sh
# g++ wrapper for the demucs.cpp build: demucs.cpp's CMakeLists.txt hard-codes "-march=native" in
# CMAKE_CXX_FLAGS_RELEASE; on this box GCC 13.3's -march=native turns on -mavx512fp16, and the vendored Eigen's
# AVX512 FP16 code (Eigen/src/Core/arch/AVX512/PacketMathFP16.h) then fails to compile. Appending
# -mno-avx512fp16 after the project's own flags switches only that extension off.
exec g++ "$@" -mno-avx512fp16
