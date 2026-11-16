\version "2.24.0"
\header { title = "Twinkle (Ah! vous dirai-je, maman), fingerstyle, nylon" subtitle = "LilyPond TabStaff, strings: truth" tagline = ##f }
#(define (log-tab grob)
   (let* ((cause (event-cause grob))
          (pitch (ly:event-property cause 'pitch))
          (pos (ly:grob-property grob 'staff-position))
          (txt (ly:grob-property grob 'text))
          (mom (grob::when grob)))
     (ly:message "TABNOTE ~a ~a ~a ~a" (exact->inexact (ly:moment-main mom))
                 (+ 60 (ly:pitch-semitones pitch)) pos (markup->string txt))))
music = { \time 4/4 \tempo 4 = 112 << { \voiceOne r1 g4\3 g4\3 d'4\2 d'4\2 e'4\1 e'4\1 d'2\2 c'4\2 c'4\2 b4\2 b4\2 a4\3 a4\3 g2\3 d'4\2 d'4\2 c'4\2 c'4\2 b4\2 b4\2 a2\3 d'4\2 d'4\2 c'4\2 c'4\2 b4\2 b4\2 a2\3 g4\3 g4\3 d'4\2 d'4\2 e'4\1 e'4\1 d'2\2 c'4\2 c'4\2 b4\2 b4\2 a4\3 a4\3 g2\3 } \\ { \voiceTwo r1 g,4\6 d4\4 g,4\6 d4\4 c4\5 e4\4 g,4\6 d4\4 c4\5 e4\4 g,4\6 d4\4 d4\4 a,4\5 g,4\6 d4\4 g,4\6 d4\4 c4\5 e4\4 g,4\6 d4\4 d4\4 a,4\5 g,4\6 d4\4 c4\5 e4\4 g,4\6 d4\4 d4\4 a,4\5 g,4\6 d4\4 g,4\6 d4\4 c4\5 e4\4 g,4\6 d4\4 c4\5 e4\4 g,4\6 d4\4 d4\4 a,4\5 g,4\6 d4\4 } >> }
\score {
  <<
    \new Staff \with { instrumentName = "Guitar" } { \clef "treble_8" \music }
    \new TabStaff \with { stringTunings = \stringTuning <e, a, d g b e'> } { \music }
  >>
  \layout { \context { \TabStaff \override TabNoteHead.after-line-breaking = #log-tab } }
  \midi { }
}
