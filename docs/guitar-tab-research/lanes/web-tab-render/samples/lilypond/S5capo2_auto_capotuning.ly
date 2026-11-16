\version "2.24.0"
\header { title = "S2 with a capo on fret 2" subtitle = "LilyPond TabStaff, strings: auto, capo as raised tuning" tagline = ##f }
#(define (log-tab grob)
   (let* ((cause (event-cause grob))
          (pitch (ly:event-property cause 'pitch))
          (pos (ly:grob-property grob 'staff-position))
          (txt (ly:grob-property grob 'text))
          (mom (grob::when grob)))
     (ly:message "TABNOTE ~a ~a ~a ~a" (exact->inexact (ly:moment-main mom))
                 (+ 60 (ly:pitch-semitones pitch)) pos (markup->string txt))))
music = { \time 4/4 \tempo 4 = 112 << { \voiceOne r1 a4 a4 e'4 e'4 fis'4 fis'4 e'2 d'4 d'4 cis'4 cis'4 b4 b4 a2 e'4 e'4 d'4 d'4 cis'4 cis'4 b2 e'4 e'4 d'4 d'4 cis'4 cis'4 b2 a4 a4 e'4 e'4 fis'4 fis'4 e'2 d'4 d'4 cis'4 cis'4 b4 b4 a2 } \\ { \voiceTwo r1 a,4 e4 a,4 e4 d4 fis4 a,4 e4 d4 fis4 a,4 e4 e4 b,4 a,4 e4 a,4 e4 d4 fis4 a,4 e4 e4 b,4 a,4 e4 d4 fis4 a,4 e4 e4 b,4 a,4 e4 a,4 e4 d4 fis4 a,4 e4 d4 fis4 a,4 e4 e4 b,4 a,4 e4 } >> }
\score {
  <<
    \new Staff \with { instrumentName = "Guitar" } { \clef "treble_8" \music }
    \new TabStaff \with { stringTunings = \stringTuning <fis, b, e a cis' fis'> } { \music }
  >>
  \layout { \context { \TabStaff \override TabNoteHead.after-line-breaking = #log-tab } }
  \midi { }
}
