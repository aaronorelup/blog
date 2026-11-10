\version "2.24.0"
\header { title = "GuitarSet 04_Rock1-90-C#_solo (first 29.3 s)" subtitle = "LilyPond TabStaff, strings: auto" tagline = ##f }
#(define (log-tab grob)
   (let* ((cause (event-cause grob))
          (pitch (ly:event-property cause 'pitch))
          (pos (ly:grob-property grob 'staff-position))
          (txt (ly:grob-property grob 'text))
          (mom (grob::when grob)))
     (ly:message "TABNOTE ~a ~a ~a ~a" (exact->inexact (ly:moment-main mom))
                 (+ 60 (ly:pitch-semitones pitch)) pos (markup->string txt))))
music = { \time 4/4 \tempo 4 = 90 { cis8 e8 f8 gis8 gis8 f8 a8 cis'8 c'8 d'8 ais8 b8 cis'8 dis'8 cis'8 cis'8 ais8 cis'8 cis'8 <cis' fis'>8 dis'8 cis'8 dis'8 c'8 cis'8 b8 gis8 fis8 e8 f8 gis8 f8 a8 ais8 cis'8 cis'8 ais8 e'8 f'8 fis'8 g'8 gis'8 e'8 f'8 e'8 cis'8 b8 cis'8 e'8 fis'8 e'8 fis'8 g'8 <fis' b'>8 <e' a'>8 cis'8 e'8 cis'8 e'8 cis'8 b8 a8 ais8 cis'8 gis8 fis8 e8 } }
\score {
  <<
    \new Staff \with { instrumentName = "Guitar" } { \clef "treble_8" \music }
    \new TabStaff \with { stringTunings = \stringTuning <e, a, d g b e'> } { \music }
  >>
  \layout { \context { \TabStaff \override TabNoteHead.after-line-breaking = #log-tab } }
  \midi { }
}
