\version "2.24.3"
#(define gtr-log (open-output-file "/home/user/gtr/lanes/guitar-tab/out/lilypond/S5dropd.truthmidi.lilylog.tsv"))
#(define (logging-tab-format context string-number fret-number)
   (let ((m (ly:context-current-moment context)))
     (format gtr-log "~a\t~a\t~a\n" (ly:moment-main m) string-number fret-number)
     (force-output gtr-log)
     (fret-number-tablature-format context string-number fret-number)))
music = { \cadenzaOn <g, g>16 <d g>16 <g, d'>16 <d d'>16 <c e'>16 <e e'>16 <g, d'>16 d16 <c c'>16 <e c'>16 <g, b>16 <d b>16 <d, a>16 <a, a>16 <g, g>16 d16 <g, d'>16 <d d'>16 <c c'>16 <e c'>16 <g, b>16 <d b>16 <d, a>16 a,16 <g, d'>16 <d d'>16 <c c'>16 <e c'>16 <g, b>16 <d b>16 <d, a>16 a,16 <g, g>16 <d g>16 <g, d'>16 <d d'>16 <c e'>16 <e e'>16 <g, d'>16 d16 <c c'>16 <e c'>16 <g, b>16 <d b>16 <d, a>16 <a, a>16 <g, g>16 d16 }
\score {
  \new TabStaff \with {
    stringTunings = \stringTuning <e, a, d g b e'>
    tablatureFormat = #logging-tab-format
    minimumFret = #0
    restrainOpenStrings = ##f
    maximumFretStretch = #4
  } { \music }
  \layout { }
}
