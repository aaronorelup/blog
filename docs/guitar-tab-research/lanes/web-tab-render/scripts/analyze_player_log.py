#!/usr/bin/env python3
"""Summarize an alphaTab player log written by alphatab_player.cjs, against the truth onsets.

Usage: python3 -I analyze_player_log.py <prefix>.player.json <id>.truth.json <out_prefix> [--speed 1.0] [--countin-bars 0]

All event times are page times (performance.now() in ms since page load) as logged when the event handler ran.
Reference time 0 = the moment api.play() was called. The truth onset of a tick is tick/960 * 60/bpm seconds
(the input clips have one tempo and the Guitar Pro file starts at the clip's first sample).
Writes <out_prefix>.summary.json and <out_prefix>.events.csv (one row per event kind/time).
"""
import json
import statistics
import sys


def stats(xs):
    if not xs:
        return None
    a = sorted(xs)
    absx = sorted(abs(x) for x in xs)
    return {'n': len(xs), 'median_ms': round(statistics.median(a), 2), 'mean_ms': round(statistics.mean(a), 2),
            'min_ms': round(a[0], 2), 'max_ms': round(a[-1], 2),
            'p95_abs_ms': round(absx[min(len(absx) - 1, int(0.95 * len(absx)))], 2),
            'stdev_ms': round(statistics.pstdev(a), 2)}


def main():
    src, truth_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
    speed = float(sys.argv[sys.argv.index('--speed') + 1]) if '--speed' in sys.argv else 1.0
    countin_bars = int(sys.argv[sys.argv.index('--countin-bars') + 1]) if '--countin-bars' in sys.argv else 0
    d = json.load(open(src))
    t = json.load(open(truth_path))
    bpm = t['tempo_bpm']
    sec_per_tick = 60.0 / bpm / 960.0 / speed
    bar_ticks = 3840
    log = d['log']
    play = [e for e in log if e['type'] == 'play_called']
    t_play = play[0]['t_ms']
    countin_ms = countin_bars * bar_ticks * sec_per_tick * 1000
    fin = [e for e in log if e['type'] == 'playerFinished']
    t_fin = fin[0]['t_ms'] if fin else None
    rows = []
    beat_lat, note_lat, metro = [], [], []
    first_pos_ms = None
    pos_err = []
    for e in log:
        rel = e['t_ms'] - t_play
        if e['type'] == 'playedBeat':
            exp = e['absTick'] * sec_per_tick * 1000 + countin_ms
            beat_lat.append(rel - exp)
            rows.append(('playedBeat', round(rel, 2), e['absTick'], round(exp, 2), json.dumps(e['notes'])))
        elif e['type'] == 'midiEvents':
            for ev in e['events']:
                if ev['isMetronome']:
                    metro.append((rel, ev['tick'], ev.get('metronomeNumerator')))
                    rows.append(('metronome', round(rel, 2), ev['tick'], None, ev.get('metronomeNumerator')))
                elif ev['type'] in (128, 144):
                    exp = ev['tick'] * sec_per_tick * 1000 + countin_ms
                    kind = f"midi_type_{ev['type']}"
                    rows.append((kind, round(rel, 2), ev['tick'], round(exp, 2), ev.get('noteKey')))
                    if ev['type'] == 128:
                        note_lat.append(rel - exp)
        elif e['type'] == 'position':
            if first_pos_ms is None and e['currentTime'] > 0:
                first_pos_ms = rel
            # player-reported song time vs wall time since play(); seek events and events outside
            # play()..playerFinished (the reset to 0 after the end) are left out of the statistic
            if rel >= 0 and not e.get('isSeek') and (t_fin is None or e['t_ms'] <= t_fin) and e['currentTime'] > 0:
                pos_err.append(rel - e['currentTime'] / speed - countin_ms)
            rows.append(('position', round(rel, 2), e['currentTick'], round(e['currentTime'], 2), None))
    type_counts = {}
    for e in log:
        if e['type'] == 'midiEvents':
            for ev in e['events']:
                k = 'metronome' if ev['isMetronome'] else f"type_{ev['type']}"
                type_counts[k] = type_counts.get(k, 0) + 1
        else:
            type_counts[e['type']] = type_counts.get(e['type'], 0) + 1
    finished = [e for e in log if e['type'] == 'playerFinished']
    summary = {
        'source': src, 'truth': truth_path, 'bpm': bpm, 'speed': speed, 'countin_bars_assumed': countin_bars,
        'setup': d.get('setup'), 'event_counts': type_counts,
        'definition': 'latency = (page time when the handler ran - page time of api.play()) - expected song time of '
                      'the event (tick/960*60/bpm/speed, plus the count-in bars when given). Positive = the event '
                      'arrived after its nominal time.',
        'playedBeatChanged_latency': stats(beat_lat),
        'midi_type_128_latency': stats(note_lat),
        'position_wall_minus_reported_ms': stats(pos_err),
        'first_position_event_after_play_ms': first_pos_ms,
        'playerFinished_after_play_ms': round(finished[0]['t_ms'] - t_play, 1) if finished else None,
        'metronome_events': len(metro),
        'metronome_first5': [(round(a, 1), b, c) for a, b, c in metro[:5]],
        'metronome_interval_ms': stats([metro[i + 1][0] - metro[i][0] for i in range(len(metro) - 1)]),
        'audio_export': d.get('audioExport'),
    }
    json.dump(summary, open(out + '.summary.json', 'w'), indent=1)
    with open(out + '.events.csv', 'w') as f:
        f.write('kind,page_ms_after_play,tick,expected_ms_or_reported_time,detail\n')
        for r in rows:
            f.write(','.join('' if x is None else (str(x) if not isinstance(x, str) or ',' not in x else '"' + x.replace('"', "'") + '"') for x in r) + '\n')
    print(json.dumps({k: summary[k] for k in ('event_counts', 'playedBeatChanged_latency', 'midi_type_128_latency',
                                              'position_wall_minus_reported_ms', 'first_position_event_after_play_ms',
                                              'playerFinished_after_play_ms', 'metronome_events', 'metronome_first5',
                                              'metronome_interval_ms')}, indent=1))


if __name__ == '__main__':
    main()
