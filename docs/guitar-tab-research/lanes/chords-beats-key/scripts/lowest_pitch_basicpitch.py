import mido
for c in ['S2n','S5dropd','S5capo2']:
    for src,p in [('basicpitch-onnx','/home/user/gtr/lanes/audio-to-notes/out/basic-pitch/onnx-default/%s.mid'%c), ('truth','/home/user/gtr/inputs/%s/%s.mid'%(c,c))]:
        m=mido.MidiFile(p); ps=[]
        for tr in m.tracks:
            for msg in tr:
                if msg.type=='note_on' and msg.velocity>0 and getattr(msg,'channel',0)!=9: ps.append(msg.note)
        ps.sort()
        print(c, src, 'n',len(ps),'lowest5',ps[:5], 'n<40', sum(1 for x in ps if x<40), 'n==38', ps.count(38))
