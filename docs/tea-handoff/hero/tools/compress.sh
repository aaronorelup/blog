#!/bin/bash
# usage: compress.sh in.glb out.glb ratio texsize [simplify-error]
cd /workspace/teahouse_alt/hero_work/tools/node
npx gltf-transform optimize "$1" "$2" --compress meshopt --texture-compress webp --texture-size ${4:-1024} --simplify true --simplify-ratio ${3:-0.15} --simplify-error ${5:-0.002} --weld true 2>&1 | tail -3
ls -l "$1" "$2" | awk '{print $5, $9}'
