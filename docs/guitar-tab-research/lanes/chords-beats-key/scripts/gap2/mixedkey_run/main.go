// Gap round 2: run mixedkey v0.1.0 (github.com/cabbagekobe/mixedkey) on this lane's test clips.
//
// mixedkey does not decode audio, so this glue (standard library only) reads each 16-bit PCM WAV file, mixes the
// channels to mono as the README asks ("Stereo sources must be mixed to mono by the caller (`(L+R)/2`)"), scales the
// samples to [-1, 1] (divides by 32768), and calls mixedkey.DetectWith once per profile (Aarden-Essen, the default;
// Krumhansl; Temperley; Bellman-Budge) and mixedkey.DetectCandidates once (default profile). Each call is timed with
// time.Since. One JSON object per file goes to <outdir>/<clip>.mixedkey.json, and for each profile one file
// <outdir>/<clip>.key_mixedkey_<profile>.txt holds one line "<tonic> <major|minor>" with sharps (C, C#, ..., B).
// <outdir> must exist: the program does not create it.
//
// Usage: mixedkey_run <outdir> <file.wav> [<file.wav> ...]
package main

import (
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/cabbagekobe/mixedkey"
)

var names = []string{"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"}

func readWav(path string) ([]float64, int, int, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, 0, 0, err
	}
	defer f.Close()
	var riff [12]byte
	if _, err := io.ReadFull(f, riff[:]); err != nil {
		return nil, 0, 0, err
	}
	if string(riff[0:4]) != "RIFF" || string(riff[8:12]) != "WAVE" {
		return nil, 0, 0, errors.New("not a RIFF/WAVE file")
	}
	var channels, bits, format uint16
	var rate uint32
	for {
		var hdr [8]byte
		if _, err := io.ReadFull(f, hdr[:]); err != nil {
			return nil, 0, 0, errors.New("no data chunk")
		}
		id := string(hdr[0:4])
		size := binary.LittleEndian.Uint32(hdr[4:8])
		switch id {
		case "fmt ":
			b := make([]byte, size)
			if _, err := io.ReadFull(f, b); err != nil {
				return nil, 0, 0, err
			}
			format = binary.LittleEndian.Uint16(b[0:2])
			channels = binary.LittleEndian.Uint16(b[2:4])
			rate = binary.LittleEndian.Uint32(b[4:8])
			bits = binary.LittleEndian.Uint16(b[14:16])
		case "data":
			if format != 1 || bits != 16 || channels == 0 {
				return nil, 0, 0, fmt.Errorf("unsupported format %d, %d bits, %d channels", format, bits, channels)
			}
			b := make([]byte, size)
			if _, err := io.ReadFull(f, b); err != nil {
				return nil, 0, 0, err
			}
			n := int(size) / 2 / int(channels)
			mono := make([]float64, n)
			for i := 0; i < n; i++ {
				s := 0.0
				for c := 0; c < int(channels); c++ {
					v := int16(binary.LittleEndian.Uint16(b[2*(i*int(channels)+c):]))
					s += float64(v) / 32768.0
				}
				mono[i] = s / float64(channels)
			}
			return mono, int(rate), int(channels), nil
		default:
			if _, err := f.Seek(int64(size+size%2), io.SeekCurrent); err != nil {
				return nil, 0, 0, err
			}
		}
	}
}

func label(k mixedkey.Key) string {
	mode := "major"
	if k.Mode == mixedkey.Minor {
		mode = "minor"
	}
	return names[int(k.Tonic)%12] + " " + mode
}

type result struct {
	Clip     string                 `json:"clip"`
	File     string                 `json:"file"`
	Rate     int                    `json:"sample_rate"`
	Channels int                    `json:"channels"`
	Seconds  float64                `json:"seconds"`
	ReadS    float64                `json:"read_s"`
	Profiles map[string]interface{} `json:"profiles"`
	Cands    []interface{}          `json:"candidates_default_profile"`
	CandsS   float64                `json:"candidates_s"`
	TotalS   float64                `json:"total_s"`
	Error    string                 `json:"error,omitempty"`
}

func main() {
	if len(os.Args) < 3 {
		fmt.Fprintln(os.Stderr, "usage: mixedkey_run <outdir> <file.wav> ...")
		os.Exit(2)
	}
	outdir := os.Args[1]
	profiles := []struct {
		name string
		p    mixedkey.Profile
	}{{"aarden_essen", mixedkey.ProfileAardenEssen}, {"krumhansl", mixedkey.ProfileKrumhansl},
		{"temperley", mixedkey.ProfileTemperley}, {"bellman_budge", mixedkey.ProfileBellmanBudge}}
	failed := false
	for _, path := range os.Args[2:] {
		t0 := time.Now()
		clip := strings.SplitN(filepath.Base(path), ".", 2)[0]
		r := result{Clip: clip, File: path, Profiles: map[string]interface{}{}}
		mono, rate, ch, err := readWav(path)
		r.ReadS = time.Since(t0).Seconds()
		if err != nil {
			r.Error = err.Error()
			failed = true
		} else {
			r.Rate, r.Channels, r.Seconds = rate, ch, float64(len(mono))/float64(rate)
			for _, pr := range profiles {
				t := time.Now()
				k, err := mixedkey.DetectWith(mono, rate, mixedkey.Options{Profile: pr.p})
				el := time.Since(t).Seconds()
				if err != nil {
					r.Profiles[pr.name] = map[string]interface{}{"error": err.Error(), "s": el}
					failed = true
					continue
				}
				r.Profiles[pr.name] = map[string]interface{}{"key": label(k), "camelot": k.Camelot(),
					"tonic": int(k.Tonic), "s": el}
				line := label(k) + "\n"
				if err := os.WriteFile(filepath.Join(outdir, clip+".key_mixedkey_"+pr.name+".txt"), []byte(line), 0o644); err != nil {
					panic(err)
				}
			}
			t := time.Now()
			cands, err := mixedkey.DetectCandidates(mono, rate)
			r.CandsS = time.Since(t).Seconds()
			if err == nil {
				for _, c := range cands {
					r.Cands = append(r.Cands, map[string]interface{}{"key": label(c.Key), "camelot": c.Key.Camelot(),
						"support": c.Support, "confidence": c.Confidence})
				}
			}
		}
		r.TotalS = time.Since(t0).Seconds()
		b, _ := json.MarshalIndent(r, "", " ")
		if err := os.WriteFile(filepath.Join(outdir, clip+".mixedkey.json"), b, 0o644); err != nil {
			panic(err)
		}
		fmt.Printf("%s %v\n", clip, r.Profiles)
	}
	if failed {
		os.Exit(1)
	}
}
