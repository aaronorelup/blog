\version "2.24.3"
#(define gtr-log (open-output-file "/home/user/gtr/lanes/guitar-tab/out/lilypond/S5capo2.truthmidi.capo2.lilylog.tsv"))
#(define (logging-tab-format context string-number fret-number)
   (let ((m (ly:context-current-moment context)))
     (format gtr-log "~a\t~a\t~a\n" (ly:moment-main m) string-number fret-number)
     (force-output gtr-log)
     (fret-number-tablature-format context string-number fret-number)))
music = { \cadenzaOn <a, a>16 <e a>16 <a, e'>16 <e e'>16 <d fis'>16 <fis fis'>16 <a, e'>16 e16 <d d'>16 <fis d'>16 <a, cis'>16 <e cis'>16 <e b>16 <b, b>16 <a, a>16 e16 <a, e'>16 <e e'>16 <d d'>16 <fis d'>16 <a, cis'>16 <e cis'>16 <e b>16 b,16 <a, e'>16 <e e'>16 <d d'>16 <fis d'>16 <a, cis'>16 <e cis'>16 <e b>16 b,16 <a, a>16 <e a>16 <a, e'>16 <e e'>16 <d fis'>16 <fis fis'>16 <a, e'>16 e16 <d d'>16 <fis d'>16 <a, cis'>16 <e cis'>16 <e b>16 <b, b>16 <a, a>16 e16 }
\score {
  \new TabStaff \with {
    stringTunings = \stringTuning <fis, b, e a cis' fis'>
    tablatureFormat = #logging-tab-format
    minimumFret = #0
    restrainOpenStrings = ##f
    maximumFretStretch = #4
  } { \music }
  \layout { }
}
