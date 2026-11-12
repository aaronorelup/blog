#(define (tie::tab-clear-tied-fret-numbers grob)
   (let* ((tied-fret-nr (ly:spanner-bound grob RIGHT)))
      (ly:grob-set-property! tied-fret-nr 'transparent #t)))

\version "2.14.0"
\paper {
   indent = #0
   print-all-headers = ##t
   ragged-right = ##f
   ragged-bottom = ##t
}
\layout {
   \context { \Score
      \override MetronomeMark #'padding = #'5
   }
   \context { \Staff
      \override TimeSignature #'style = #'numbered
      \override StringNumber #'transparent = ##t
   }
   \context { \TabStaff
      \override TimeSignature #'style = #'numbered
      \override Stem #'transparent = ##t
      \override Beam #'transparent = ##t
      \override Tie  #'after-line-breaking = #tie::tab-clear-tied-fret-numbers
   }
   \context { \TabVoice
      \override Tie #'stencil = ##f
   }
   \context { \StaffGroup
      \consists "Instrument_name_engraver"
   }
}
TrackAVoiceAMusic = #(define-music-function (parser location inTab) (boolean?)
#{
   \tempo 4=112
   \clef #(if $inTab "tab" "treble_8")
   \key c \major
   \time 4/4
   \voiceOne
   r1 
   <g\3>4 <g\3>4 <d'\2>4 <d'\2>4 
   <e'\1>4 <e'\1>4 <d'\2>2 
   <c'\2>4 <c'\2>4 <b\2>4 <b\2>4 
   <a\3>4 <a\3>4 <g\3>2 
   <d'\2>4 <d'\2>4 <c'\2>4 <c'\2>4 
   <b\2>4 <b\2>4 <a\3>2 
   <d'\2>4 <d'\2>4 <c'\2>4 <c'\2>4 
   <b\2>4 <b\2>4 <a\3>2 
   <g\3>4 <g\3>4 <d'\2>4 <d'\2>4 
   <e'\1>4 <e'\1>4 <d'\2>2 
   <c'\2>4 <c'\2>4 <b\2>4 <b\2>4 
   <a\3>4 <a\3>4 <g\3>2 
   \bar "|."
   \pageBreak
#})
TrackAVoiceBMusic = #(define-music-function (parser location inTab) (boolean?)
#{
   \tempo 4=112
   \clef #(if $inTab "tab" "treble_8")
   \key c \major
   \time 4/4
   \voiceTwo
   \skip 1 
   <g,\6>4 <d\4>4 <g,\6>4 <d\4>4 
   <c\5>4 <e\4>4 <g,\6>4 <d\4>4 
   <c\5>4 <e\4>4 <g,\6>4 <d\4>4 
   <d\4>4 <a,\5>4 <g,\6>4 <d\4>4 
   <g,\6>4 <d\4>4 <c\5>4 <e\4>4 
   <g,\6>4 <d\4>4 <d\4>4 <a,\5>4 
   <g,\6>4 <d\4>4 <c\5>4 <e\4>4 
   <g,\6>4 <d\4>4 <d\4>4 <a,\5>4 
   <g,\6>4 <d\4>4 <g,\6>4 <d\4>4 
   <c\5>4 <e\4>4 <g,\6>4 <d\4>4 
   <c\5>4 <e\4>4 <g,\6>4 <d\4>4 
   <d\4>4 <a,\5>4 <g,\6>4 <d\4>4 
   \bar "|."
   \pageBreak
#})
TrackALyrics = \lyricmode {
   \set ignoreMelismata = ##t
   
   \unset ignoreMelismata
}
TrackAStaff = \new Staff <<
   \context Voice = "TrackAVoiceAMusic" {
      \TrackAVoiceAMusic ##f
   }
   \context Voice = "TrackAVoiceBMusic" {
      \TrackAVoiceBMusic ##f
   }
>>
TrackATabStaff = \new TabStaff \with { stringTunings = #`( ,(ly:make-pitch 0 2 NATURAL) ,(ly:make-pitch -1 6 NATURAL) ,(ly:make-pitch -1 4 NATURAL) ,(ly:make-pitch -1 1 NATURAL) ,(ly:make-pitch -2 5 NATURAL) ,(ly:make-pitch -2 2 NATURAL) ) } <<
   \context TabVoice = "TrackAVoiceAMusic" {
      \removeWithTag #'chords
      \removeWithTag #'texts
      \TrackAVoiceAMusic ##t
   }
   \context TabVoice = "TrackAVoiceBMusic" {
      \removeWithTag #'chords
      \removeWithTag #'texts
      \TrackAVoiceBMusic ##t
   }
>>
TrackAStaffGroup = \new StaffGroup <<
   \TrackAStaff
   \TrackATabStaff
>>
\score {
   \TrackAStaffGroup
   \header {
      title = "Twinkle (Ah! vous dirai-je, maman), fingerstyle, nylon" 
      composer = "" 
      instrument = "Guitar" 
   }
}
