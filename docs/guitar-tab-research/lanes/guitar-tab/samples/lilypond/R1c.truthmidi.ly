\version "2.24.3"
#(define gtr-log (open-output-file "/home/user/gtr/lanes/guitar-tab/out/lilypond/R1c.truthmidi.lilylog.tsv"))
#(define (logging-tab-format context string-number fret-number)
   (let ((m (ly:context-current-moment context)))
     (format gtr-log "~a\t~a\t~a\n" (ly:moment-main m) string-number fret-number)
     (force-output gtr-log)
     (fret-number-tablature-format context string-number fret-number)))
music = { \cadenzaOn <g, g b fis'>16 <g, b b a'>16 <g, b b fis'>16 <b b fis'>16 <a b fis'>16 d16 b16 a16 a16 <d b fis'>16 g16 <e, b fis'>16 e,16 <g b a'>16 <e, b fis'>16 <a cis' fis'>16 <cis gis d'>16 b,16 fis16 <b, a d' fis'>16 fis16 <g, c>16 <g b d' g'>16 <fis b d'>16 <g b>16 <g b>16 g,16 g16 <d g'>16 g16 g16 <c b d'>16 g16 <c b d'>16 g16 g16 <c g>16 g16 c16 d16 a16 e'16 <a c'>16 a16 g,16 <g b fis'>16 <g, g b a'>16 <g, g b a'>16 <d a b fis'>16 a16 d16 a16 <b fis'>16 g16 e,16 <g d' fis'>16 <e, g d' fis'>16 <g d' e'>16 e,16 <g d'>16 b,16 <a d'>16 a16 fis'16 d'16 c16 g16 g16 <g d'>16 g16 g16 g,16 <g d' e'>16 <g, g d' e'>16 <g d'>16 e,16 g16 }
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
