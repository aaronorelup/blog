\version "2.24.0"
\header { title = "Twinkle (Ah! vous dirai-je, maman), fingerstyle, nylon" subtitle = "LilyPond TabStaff, strings: auto" tagline = ##f }
#(define (log-tab grob)
   (let* ((cause (event-cause grob))
          (pitch (ly:event-property cause 'pitch))
          (pos (ly:grob-property grob 'staff-position))
          (txt (ly:grob-property grob 'text))
          (mom (grob::when grob)))
     (ly:message "TABNOTE ~a ~a ~a ~a" (exact->inexact (ly:moment-main mom))
                 (+ 60 (ly:pitch-semitones pitch)) pos (markup->string txt))))
music = { \time 4/4 \tempo 4 = 112 << { \voiceOne r1 g4 g4 d'4 d'4 e'4 e'4 d'2 c'4 c'4 b4 b4 a4 a4 g2 d'4 d'4 c'4 c'4 b4 b4 a2 d'4 d'4 c'4 c'4 b4 b4 a2 g4 g4 d'4 d'4 e'4 e'4 d'2 c'4 c'4 b4 b4 a4 a4 g2 } \\ { \voiceTwo r1 g,4 d4 g,4 d4 c4 e4 g,4 d4 c4 e4 g,4 d4 d4 a,4 g,4 d4 g,4 d4 c4 e4 g,4 d4 d4 a,4 g,4 d4 c4 e4 g,4 d4 d4 a,4 g,4 d4 g,4 d4 c4 e4 g,4 d4 c4 e4 g,4 d4 d4 a,4 g,4 d4 } >> }
\score {
  <<
    \new Staff \with { instrumentName = "Guitar" } { \clef "treble_8" \music }
    \new TabStaff \with { stringTunings = \stringTuning <e, a, d g b e'> } { \music }
  >>
  \layout { \context { \TabStaff \override TabNoteHead.after-line-breaking = #log-tab } }
  \midi { }
}
