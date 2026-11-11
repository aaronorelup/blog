#!/bin/bash
cd /workspace/teahouse_alt/hero_work
for n in jefrie_apose yusef_apose echo_apose prop_crt jefrie_leap yusef_leap echo_leap prop_lantern prop_bell; do
  POD=${POD:-pdv3f0gwb5d1be} tools/venv/bin/python tools/pod/client.py submit $n stills/$n.jpg res=1024 dec=150000 tex=2048
done
