// Verifier's stub: only the exported declarations of mixedkey v0.1.0 (detect.go, profiles.go at 723a590) that the
// lane's glue uses, with empty bodies, to type-check the glue. No mixedkey code.
package mixedkey

type Mode int

const (
	Major Mode = iota
	Minor
)

type PitchClass int

type Key struct {
	Tonic PitchClass
	Mode  Mode
}

func (k Key) Camelot() string { return "" }

type Profile int

const (
	ProfileAardenEssen Profile = iota
	ProfileKrumhansl
	ProfileTemperley
	ProfileBellmanBudge
)

type Options struct {
	Profile Profile
}

type Candidate struct {
	Key        Key
	Support    float64
	Confidence float64
}

func DetectWith(mono []float64, sampleRate int, opt Options) (Key, error) { return Key{}, nil }
func DetectCandidates(mono []float64, sampleRate int) ([]Candidate, error) { return nil, nil }
