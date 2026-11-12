\version "2.24.3"
#(define gtr-log (open-output-file "/home/user/gtr/lanes/chains/out/chainC/lilypond/S5dropd.bp.dropD.pin1-55-s4.lilylog.tsv"))
#(define (logging-tab-format context string-number fret-number)
   (let ((m (ly:context-current-moment context)))
     (format gtr-log "~a\t~a\t~a\n" (ly:moment-main m) string-number fret-number)
     (force-output gtr-log)
     (fret-number-tablature-format context string-number fret-number)))
music = { \cadenzaOn c,,16 <g, g\4>16 <d g b''>16 <g, d g d' g'>16 <d d'>16 <c c' e'>16 <c e e'>16 <g, e g d'>16 d16 d'16 <c c'>16 <c e c'>16 <g, e g b>16 <g, d g b>16 <d, d a>16 <a, a>16 <g, g>16 d16 <g, d g d'>16 <d d'>16 <c c'>16 <c e c'>16 <g, g b>16 <d b>16 <d, d a>16 a,16 <g, g d'>16 <d d'>16 <c c'>16 <c e c'>16 <g, e g b>16 dis'''16 <g, d g b>16 <d, d a>16 a,16 <g, g>16 <d g b''>16 <g, d g d'>16 <d d'>16 <c c' e'>16 <c e e'>16 <g, e g d'>16 d16 <c c'>16 <c e c'>16 <g, g b>16 <d g b>16 <d, d a>16 <a, a>16 <g, g>16 d16 }
\score {
  \new TabStaff \with {
    stringTunings = \stringTuning <d, a, d g b e'>
    tablatureFormat = #logging-tab-format
    minimumFret = #0
    restrainOpenStrings = ##f
    maximumFretStretch = #4
  } { \music }
  \layout { }
}
