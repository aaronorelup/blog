/* The reel of the film chapter: fourteen moments, in the order they play (copied from the film reel test, where a
   script wrote it from the clips themselves). The clips play from /media/tea/film/<file>.mp4; their first frames are
   in assets/img/film/poster/.
   light: six times a second, the picture's colour in a 3 x 2 grid (18 bytes each, base64), so the garden can be lit by the film. */
export var REEL = { fps: 6, clips: [
 {
  "file": "paper-lantern",
  "title": "Paper Lantern",
  "what": "A music video made as a cut-paper diorama",
  "id": "AO-026",
  "href": "/ledger/sonnet-vs-opus-gauntlet/",
  "dur": 6.016,
  "light": "TDVAQjFQIR09KzNfMER9KzppTTVBQzJRIh09LDRgMUV+LDtqTDVAQzFQIRw8LDReMEN8KzppTDVAQjFQIBw7LDReL0N7KjloSzQ+QTBPHxs5LDRdLkJ5KTlmSzQ+QTFPHxs5LTRdLkF4KjlmSjQ+QTFPHhs4LTRcLUF3KThlSjQ+QTJPHhs4LTRcLUB3KjllSjQ+QjJQHho3LjRcLUB2KzllSjM+QjNQHRo2LzVdLD91LDhkSjM+QzNQHRo2MDVdLD90LTljSTM9RDVRHRo2MDZdLD90LjpiSTM+RjdSHho2MTZeLD90LzpjSDI9STlTHho2MjdeLD90LjliRjE9TDtUHho2MjdfKz5zKzdhRDA9Tz1WHho2MjdfKz50KDVhQi88UkBXHho2MTdfKz50JDNhQC07VkJYHho2MDZfKz50IjJgPiw7WURYHxs2MDdfKz91IjNhPCo6W0VYHxs3MDZfKz91IjNiOik5XUZXIBw3LzZfKz92IjRiNyc4XkdXIBw3LjZfK0B2IzRjNSU4YEdVIRw3LTVfK0B3IzRjMyM3YUdVIh03LDVeK0B3IzVjMiI2ZEhVIh04KzReK0F4JDZkMCE2Z0lVIx44KjRfLEF5JjdlLiA1aUpVJB45KTNfLUJ6KjlnLR81bUxVJR85KDNfLUJ6LTtnLB41cE5WJx86KDRgLkN7LzxoLB41c1BXJyA6KDRhMUV7MD5pKh01d1FYKSE6KDRhNEZ8MT5pKBw1eVNZKiI7KDRhOEh9MT9pJhs1e1NZKyI7KTRiPUt+MT9qJBk0fFRZLCM7KjViQk5/MT9qIRg0fFRZLiQ7KzViR1GAMD5pHxczfFVZLyU7LDZiTFSBLz5p"
 },
 {
  "file": "still-on-shift-divers",
  "title": "Still on Shift",
  "what": "The music video for the song from my cave-diving game, third try",
  "id": "AO-053",
  "href": "/ledger/still-on-shift-concept/",
  "dur": 3.264,
  "light": "AwEELTg6AwIFCQoLNjw4CgsMAwEELTg7AwIFCgoLNjw4CgsMAwEELTg6AwIFCgoLNzw5CgsMAwEFLTg7AwIFCgoLNz05CgsMAwEFLTc6AwIFCgoLNzw5CgsMAwIFLTg6AwIFCgsMNz05CgsMAwIFLTg7AwIFCgsMOD06CgsMAwIFLjg7AwIFCgsMOD06CgsMAwIFLTg7AwIFCgsMNzw5CgsMAwIFLTg7AwIFCgsMNzw5CgsMHyYhTVlRGyIePUg8eIRzO0Y6HyYhTVlRGyMePUg7eIRzO0Y7HyYhTVlRHCMePUg8doFwPEc7HyYhTFhPHCMePUg8cn1sO0Y6HyYhS1dOHCMePEc6bnhoOUQ5HyYhSldOGyMeOkU5bHdmN0I3HyYhS1dOGyIeN0I2bHZmNT80HyYhS1dOGyIeNT80b3ppMz4zHiUgSlZNGyEdMz0ycXxqMj0yHSQgSVVNGiEdMz4yc35sMz4z"
 },
 {
  "file": "jefrie-at-the-dome",
  "title": "Jefrie at the dome",
  "what": "A test shot of my scythe-wielding character",
  "id": "",
  "href": "",
  "dur": 6.016,
  "light": "X2NpVVhcPD1ANDE0KiQmHhwdYmZrU1RYPD1AMy0vIh8gHhwdXmBlRkVIPD1AKykrIh0eHhwdWVpfQT5CQDxAKCIjJSIjHhwdYVphfE9VYkRJKCAiMiEiIhsdaFZcRj1CPj1AJR8gJiIiHxwdVFRZQjxBPj1BJyIjJyQlHhwdVVNZXkhOgFRZKyYoTTU2Kx4ghV9mR0FGPj1BNCotLCgpHxwdVlRaSERIPj1BLywvKigpHxwdVlVbSURJPj1BLy4wKicoHxwdV1ddTEdMPDs/Ly4wKCYmHxweWlxhVFBWRUFFMC4xJiMlIB0fX2FnUlBWTEZLMC4xIR0fIB4gYWNpS0tQT0hNKikrIRsdIR8hXmBlRURJVVJXJSQmHRcYJiQnUlNZQj5DYGRqJSMlGxQVKyktQD5CSERIYWZrGhcZGhUVKiktNjQ5TUhNbF1kGRUVHBgYKCAiNjQ5TkhNVlVbGxcYHRkZLBweNTE2SkVLVVNZHhscHBgYKBgaPT5EQjxBV1VbIB4fGxcYMiEkNzc8SkRJV1VbJSQnHxkZNSQoNjM3U01SUVRZFRIRIRobLiEkNTE1TkpOVFheEQ4NIx0eLCEkNjE1TklOVFleFRERJiAiLCEkNjE1TEhMVVpgHBcYKiQlKyIlNjI1TEdLVlthIBscKyQlKyIlNjI2TkpOVFpfIRwdKSMkKyElNjQ4WFRZU1VbIh4fJCAhMiMnNjU4V1RZVVVbIx8iIx4fMyUoNjU4V1NYVlVbIyEjIx0eNCUoNTU4V1RYVlVbIyEkIhwdNCUoNTU4V1RZVlZbJCEkIhwdNCUpNjU4VlNYV1ZcJCEkIhwdNSYpNjU4VlNXV1ZcJCEkIhwdNSYp"
 },
 {
  "file": "last-tram",
  "title": "Last Tram to the Moon",
  "what": "A music video in six painted shots",
  "id": "AO-026",
  "href": "/ledger/sonnet-vs-opus-gauntlet/",
  "dur": 5.013,
  "light": "J0BVMzouHTNGLDFDLTpJJic6JD5TMjktHDBEKzJFLDtLJCc8IzxSMjktHTFELDNILT1NIyc+ITtRMzktHzJDLTVKLT9QIyhAIDlPMzktIjNCLzdMLUFRIihCHzhOMzktJzZCMTlOLkNTIilDHjZMMzkuLDhBMjtQLURUIipFHTVLNDouMTpAMz1SLUVWIixIHTNKNTouNTw/ND9ULEZXIS1KHTJINjovOj8/NUFWKkdYIS5MHjJHNjovPkE+NUJZKEdZIS9OHjJGNzouQEI9NURaJUhaIDBPIDJGODovQkM9NUVdI0haHzFRITFEODkuQkI9NUZdIUdZHTBRIjFDODkuQkI9NUdgH0dZHDFTJDJEOTkuQUI+NEhhHEZYGjFTJTNEODguQEE/MUdhGUVXGDFTJjNENzYsPj8+L0dhFkRVFjBSJzNENjUrPkA+LkdhFUNUFTBSJzNFNjQrQEE/LkhhE0NTFDBSKDRFNjQrQ0M/LUhgEkNREzBSKDRFNzQsRkQ/LUdeEUJPEjBQKjVHOTUtSUZALUdeEEFOEjBQLDdHOzctS0hALEZcD0BNEjBPLjhIPTguT0pBLEZbDj5LEjBOLzlJPzkuUk1CK0RZDTxKEi9MMjtJQDouVU5CKUJXDDpIEy9LNT1LQTsvWVBCJ0FWCzhGEy9KOD9MQjsvW1JDJT9UCjdFFTBJOkFNQzsuXFJCJD1SCTVDFzFJ"
 },
 {
  "file": "crimson-coil",
  "title": "Crimson Coil",
  "what": "Episode 1 of I Love My Evening Television",
  "id": "AO-045",
  "href": "/ledger/crimson-coil/",
  "dur": 6.016,
  "light": "a0Esm3VPo4NQTjInWDErVDMpa0EsmnRPooNQTjInWDErVDMpa0EsmnRPooNQTjInWDErVDMpa0EsmnRPooNQTjInWDErVDMpXzoohWNEi29FVTgsVzApUjAnTC4iX0UwYUwwaUk+aEI7XjYtSCgiPScfOigdd0xFe1NOZ0E7XzIqOR8dLRkUi1JMd0dDYjYxeEE0SSclMBkWoWhiiEtFaDEvgEg5WDEsNBwZoGVefz47eC8whE0+aT41OyEfk1dPiDg3nz5ChVZEe0k/Rykll01Ipz0/nj1Eh2FSjVdLVjIqn0ZEtkFFq0NNimVZmmVXZjownDw9xU5WtU5ViVxRnm5icUAymzI2z2BsuExTg1FEnG9nhEo7mTA02Gx5tEdPcUM2mWtkklJFmTI4ymdzr0FJXzQqlWVclVdMijI6xV9psz5FSiYghVZNiVFJhjQ8xltkmS80OB0ZdktDfkc9hTc9sk5WjykqMBoXZD03eUQ5gTc9nztDbh0dLRkWUS8sdEE2ezM2gisxVxcWLhoWQyclbD81dSwvXRwhPRAQLhsXOyMhWzcwXSAjRhMWPBERLxwYNSAeTTAsRRYZPxEUOBARLxwYNB8dRComRh8fNg4RNBESLxsXMx4cPiciOBMUNxASOxYWLhkVMx8cNiEdPBQVOxMUUSsrNR0ZMx4bMR0ZRxcYPxkabU5JQiIeNBwaMBsXRxgYXTo2clFNXC0oOh0dMRkWf05IfVRQckpFejMvaTs5SyQjt5OAn3xyjWlkOg0OfCkpPRAWWispiS4sOhAUrXxMyJhiwI1ewmtarUxGnj87dVs9m3hOonNWpms/nm9FrHxOYEozhGVDj2FL2KxiwZNZyZ5p"
 },
 {
  "file": "earthlight",
  "title": "Earthlight",
  "what": "Episode 2 of I Love My Evening Television",
  "id": "AO-048",
  "href": "/ledger/earthlight/",
  "dur": 5.7,
  "light": "OTYvCAYJBwUHVlRQcnR4ZWdqOTYwCAYJBwQHV1VRcnR4ZGdqMzEqCAYIDw4OU1NPbG9zYmRmLSomCggJHBkYUVBOaGpvYmJkJiQhDAkKKCUiTU1NYmVqYWFgJSIgDAkKKyckTExMYWRoYWFfJSIgDAkKKyckTExMYWRpYmFgJSIgDAkKKyckTExMYWRoYmFgJSIhDQoLKyclTExMYWRpYmFgJSIgDAkLKyclTExMYWRoYmFgJSIgDQoLKyclTExMYWRoYmFgJSIhDgsMKyclTExMYWRoYmFgJSIhDgsMKyclTExMYWRoYmFgJSIhDgsMKyglTExMYWRoYmFgJSIhDgsMKyglTExMYWRoYmFgJSIhDgsMKyclTExMYWRoYmFgJSIhDgsMKyglTExMYWRpYmFgJSIhDgsMKyglTExMYWRoYmFgJSIhDgsMKyglTExMYWRpYmFgJSIhDgwNKyglTExMYWRpYmFgJSIhDwwNKyglTExMYWRoYmFgJSIhDwwNKyclS0xMYWRoYmFgJSIhDgwNKyclS0tMT1JXYWFgJSIhDwwNKyclS0tMTE5SYWFgJSIgDwwNKyclS0tMSEpNYWFgJSIgDw0OKyclS0tMRkhLYWBgJCIgDwwOKiclS0tMRkdKYWBgJCIgDwwOKyclS0tMRkhLYWBgJCIgDw0OKiclSktMRkhLYWBgJCEgDwwOKickSktMRUdKYWBgJCEgDwwNKiYkSktLRUdKYWBgJCEgDwwOKiYkSktMRkdKYWBgJCEgDwwNKiYkSktMRUdKYWBgJCEgDwwNKiYkSktMRUdKYWBg"
 },
 {
  "file": "night-shift",
  "title": "Night Shift",
  "what": "A music video about a lamplighter",
  "id": "AO-026",
  "href": "/ledger/sonnet-vs-opus-gauntlet/",
  "dur": 5.013,
  "light": "ChksOEZGBiI7ERokGyYvFB4qCRksOEVGBiI7ERokGiYvFB4qChksOEVGBiI7ERokGiYvFB4rChkrN0VGBiI7ERokGSUvFB0qChksQktICCM8EhskHykwFx8rDBstYWFRFis+GR8mMjU0JikuEB8ue3JXKTY+ISQnQkA3NTMvEyAuiHpaNTw8JigmSkU5PjkvFCIuj39aOz87JygmTEc4QTsvEyEui3xZNzw7JignSkU4PjkvDx0udG1WITA8HyImPDs2MC8uCxsrYGFRFCo6Gh8jMDQyJSgrDBssY2JSFis7Gx8kMTQzJiksDRwsbGdTHS48HSAkNTc0KSssDh0tdGxTIzI8HiIkOTk0LS4tDh0scmtTITE8HiIkNzk0LC0sDhwsbGhTGy07HSEkNDc0KissDh0scGpUHi87HiEkNTc1KiwsEB0seG9VJTI8ICMkOTo2Li4tEB0seG9VJDI8ISMkOTo2Li4tDhwsbmlUGSw7ICIjNTg0KCosDhwsbWlUGCw7ICIjNzk0KCosDhwscmtUGy08IiQkPz01KissDhwteG5TIzE8JCUkSEI2Li4tDhwteW5SJTM7JiYkTkU2MS8sDRwtdWtSIzE8JyYkUEY2MC4sDBwtbWdRHC48JyYjTUQ1LCwrDBwtamZRGy08JyYiTEM1KisrDBwta2ZRGy07JiYiTEQ1KisrDBwtcWlRIDA7JiYiTkU1LCwr"
 },
 {
  "file": "still-on-shift-heart",
  "title": "Still on Shift",
  "what": "The same song, second try: the diver and the Heart",
  "id": "AO-053",
  "href": "/ledger/still-on-shift-concept/",
  "dur": 5.61,
  "light": "QElJWF1dWmBeHTw6ai4tNEZGP0hIV1xcWl9dHTs7eTQ4PExNP0hHVFhYWF5bHDo6bUBGOktMP0dGTk9RVlxZGTU0ZlhcRFVWO0JCSkZJU1dVFCsqWktQO01ONDs7VT9DTFFPFCkoaj9GNERGMTc3e01RR0lHHDAwiURPP0tONTs7lVphR0ZGKzw8k2FrTFVZOkBAkmBoRkZFQlFRfG11WGFkPEFCe2VtREZFUV5fZmtyYmxuOkBAYFphQ0ZFWGRmYWtzX2lrMzk5V1VZQkVEVmNlWWFoXmhqLDIxU1BTQENAU2BhTVRaXGRlLjMzTkpMPkI/TVhYMzk9VVtcLDEwWVRWP0I/R1FRHyMmUlhXKzEwYFteQERAQEpJFRkbSlFPKzAuaGNlQkZCPUdGERUXSE5MLDEwbWdqRkpHPUZFEBIUSlBOLzQzc2psS1BMPUVEDRASSU9MMTU1emxvUlZTPERDDA4RSU5MMjc2fWxvV1xYOkJADxEUR01KNDk4fmptXGFdNz89EhQXRkpINTo5fmhrYGVhNT07FRcZRUlGNzw7f2hrYmdkNTw7GBocREhFOD08f2dqYmhkNTw7GhseQkZENjs6e2JlXmRgMjo5GhwdPkJAOD08fGNmX2RgNT08HB4fP0NBOT49fGJlXmRgNj49HR4fPkNAOj8+e2FlXmNfNz8+HR8gPkJAOkA+emBjXmNfOEA/HR8gPUJAO0A+eV9iXWJeOUFAHB4ePUI/Oj8+eF5iXGFdOUFAHB0ePkJBOz8+eF5hXGFdOkJBGx0dP0RCOj8+d15hW2BcOkJCGhwcQEVC"
 },
 {
  "file": "weights",
  "title": "A film of MIT’s AI weight-editing experiments",
  "what": "From the AI’s side: 49 minutes, eight tasks",
  "id": "AO-081",
  "href": "/ledger/a-film-of-mit-s-ai-weight-editing-experiments-from-the-ai-s-side/",
  "dur": 6.016,
  "light": "FRgZJSgrKjE3ExcYIyouICcpFRgZJCgrLDE5ExcYIiouICcpFRgZJCgrLDI7ExcYIikuICcpFRgZJigsKzE6ExcYIiktICcpFRgaJigrKjA4ExcYIiktICcpFhgaJigsKjA6ExcYIiktICcpGBobJigrLDE7ExcYIiktICcpGhwcJigrLTI9ExcYISktICcpGhwcKywvLzQ/ExcYISktICcpGhwcKysuLjM+ExcYISktICcpGhwcKisuLzI9ExcYISktICcpGhwcKiotMDI+ExgZISksICcpGhwdKSosMTE9ExgZISksICcpGhwdKistNTQ+FBgZISgsICcpGhwdKiotNTRAFBgZISgsICcpGhwdKistMzI+FBgZIikvICcpGhwdKiotMjE8FBgZIykvIScpGhwdKiosMTA6FBgZIikuIScpGhwdKiosMS86FBgZIikuIigrGhwdKSosNzM9FBgaIikuIygsGhwdKSorNTI7FBgaJCsxIigrGhwcKSkrNDE6FBgaJSsyJCktGhwcKSkrNDA4FBgaJCsxIygsGhwcKSkrMy83FBgaJCowJSouGhwcKSkrNDA4FRkaIyowKSwyGhwcKSkrNC83FRkaIyowKy0zGhwcKSkrMy82FRkbIyovKSwyGhwcKSkrMy82FRkbISkyKCsxGRwcKSkrMy82FRkbISkyKSowGBobKSorNjE3FRkbISgxLy0zFxkbKSkrNjE3FRkbICgxLSwyFhkaKSkrNjE2FRkbICgwLSw0FhkaKSkrNTE2FRkbHycwLi02FhkaKSkrNTA2FRkbHycwLy02FhkaKSkrNTA1FRkbHycvNDA5FhkaKSkrNTA1FRkbHycvMi82"
 },
 {
  "file": "hollows",
  "title": "The Hollows at the Storm Bell",
  "what": "A short film of my characters",
  "id": "AO-054",
  "href": "/ledger/previs-film-flow/",
  "dur": 6.417,
  "light": "eVhHMikpJCcsSS0nPTEzOTE0eVhHMSkoJCcsUDErOzEyOTE0eVdHMCgoJCcsVzMsOSsqOTEzeFdGMCgoJScsVTApOy0sODEzeFZGMSgoJSgsVC8oPS4tOTE0d1ZGMykoJigsVDApPi4tOzI0eFZGMygpJigsVjApPy4uOzI0eFZFNSgpJygsVS8oTCstQTAzeFZGPioqKSgtVS8pcDM2UzA1eFZFQSorKigtVy8odzU4Vi81eFZFQysrKigtVy8peTc6Vy40eFZFRCsrKygtVjApeDU4WC82lmpQXDMwGhESTzcxLh8gOzEyk2ZNXjMwGhESUDcxMSIiOzEzkGBJTDEsGxITUzAsOCcmOzEzilhGTzUvHBMTQSckNCUkPTIzjVpGUTgyHRQUSjMtNSMiPjM0mmFLVT87HhUWVj44KxsbPjIzlmhOTTEuHBQVUj02JBcXOi8wJR8hP0BBLjEzOzIyMCkoJyAeKiEjPz9BLTAzPDIyMSkpKSAfOiQnPT9BKzAzPTIyMSkpLCMhYiQrPT9CKy8yQjQzMikoLiQiijE5RTc8LTAySjU1NCknLiQiSSUoYTtCLjAyRTU1PCsqLSMiKCEiVj5BLy8yPTIyQC0tLCIhJyAhUkFCMzI0PDIyQi4tKh8dNBsdcRsgRSkrPyosURgdLhgYOB4fLBUUOycnQCIjNRodNBERLCEhIRkYNSopOicoJhweKRcWKSAhJSEhMyooNSoqIxsdJBkYJh8fLSorMiooNCkpHxkZIhgWJB8gMzIzNC0sMignJR0dIhkXIh0eOTc5MSwrLyYkLCQlKB4cIRwePDw+Ly0vMyknMikpKR4bIh4fPj9AMjE0MyooNy4uKyEdKCQnQ0NGMjM1NSwrOTExLyMgIR0fPj9AMzM1OTAuOzMzLiIfIR0fPj9AMzQ2OjEwOzM0LSIg"
 },
 {
  "file": "moonlight",
  "title": "Moonlight at the Waterline",
  "what": "A love song’s music video, the fourth way of five",
  "id": "AO-056",
  "href": "/ledger/moonlight-five-times/",
  "dur": 4.266,
  "light": "KCovLCknGRwkDxEUKissGRobKCouLCkmGR0lDhATKSsrFhgaKCouLCkmGh4mDQ8TKSorFBUYKCouLCkmGh4nDA4SKCkpERMXKCouLCkmGh8oCw0RJygoDxEVKCouLSkmGh8oCgsQJicnDQ8UKCotLSkmGiApCQoOJSYmCw4TJyksLSknGSAqCAkNIyUlCQwSJigrLionGSAqBwkNIiMjCAsRJScqLysoGCAqBwgMICEiBwoRJCYoMCwpGB8qBggMHiAgBgoRIyUnMS0pFx8qBggMHB4eBQkRIyQnMi0qFh8qBgcMGxwdBQgRIiMlMi4rFR4qBgcLGRobBAgQISIlMy8rFR4qBgcLFxgaBAgQISIkMy8sFB0qBgcLFRcYAwgRICIkMy8sFB0pBgcLFBUXAwgRICIkNC8sExwpBgcLEhQWAwgRICEjMy8rEhwpBgcLERIVAwgRICEjMy8rEhspBgcLEBEUAwcRISIjMi4rERsoBgcLDhATAwcRICEjMS4rEBknBgcLDQ8SAgYQISIjMS4rDxkmBgcLDA4RAgYQISIjMS4rDhglBgcLCw0QAgYPISIjMS0rDxgmBgcLCgwQAgYQICEiLywqDhglBgcLCQsOAgYQ"
 },
 {
  "file": "echo",
  "title": "Echo",
  "what": "A porcelain figure with a church bell for a head",
  "id": "AO-022",
  "href": "/ledger/echo-the-borrowed-voice/",
  "dur": 4.501,
  "light": "cG1tpZyXqp6SfHVyZFZTl4yGcGxsppyXqp2SfHVyZVZTl4yFcGxspZuWqZ2SenNwZFRRl4uEcGxro5mUp5uRdm9tYVJOl4qDb2tqo5iUpZmPdW5sYVFNl4qCbmloopiTpJiNdG1rYlFNmIqCa2dlopeSo5eMcmtpYlFMmIqAaWRioZaRopWKcGlnYlBLmIh+aGNhoZaQoZSJb2hmZVFLmol/Z2JgoZWPoJKHbGVkZlJLnIp/Z2JfoZWPnpCGamNiaFJLnot+Z2JfoZWOnI+EaGJgaFJKn4x9Z2FdoJSNmo2CaGFfaVFJoYx9ZV9coJSMmYuAamJfalJJoY19ZV5boJOLmIp/a2NfbFNKoox9ZF5an5KKl4l+bWRfblRLoox8YlxYnpCIlYd7bmRfcFVLoYt7YlpWnY+HlIV6b2VfcFZMoIt7YVpVnI6GlIV5cGVfcVZMoIt7YVlUnI2Fk4V4cGVfcVdMoIp6YVhUnI2Fk4R3cGVecVZMn4l5YVlUnY6GlIV4cWZfcVZLoIp6YVlUn5CIlYZ5cGVfcFVLoIp6YllUoJKKlYZ5b2Reb1RKoIp6YllVoZOKlYZ5bWNdbVJIoIp6YlpVopSLlod6bWNdbVJIoIp6Y1pVopWMlod6bGJdbVJIoIp6"
 },
 {
  "file": "all-at-once",
  "title": "All at Once",
  "what": "A music video of gouache fireflies",
  "id": "AO-026",
  "href": "/ledger/sonnet-vs-opus-gauntlet/",
  "dur": 4.01,
  "light": "OkZFMkNrNkFDR2RQTn1xTmhSHCozEiVaGygxLEw+M2dfM08/FSMtCx5UFSItJ0c5LV9YLUg4GikwDiJXGSYuME87NGdbNlE6FyUtCx9UFyQtLk04MmRWM003FiQsCR1SFyQsL003MmNVM002HSswDyNXGykuN1U6O2xYPVc5GigtDCBUGictNlM3OmlUO1M1GCUsCx5SGicsN1M2OmhSOlI0Hi0wECVXHy0vQl46Q3JWRF03HCouDiJUHisuQVw3QW5SQlo1GyosDCFSHSssQlw1QGxQQlkzEB1KDBtfDBlEGDdFFkJgFjM9DBlGCRdbChZBFTNCFD5dFDA6CxdEBxVZChZAFDJBEz1cEy86EB1HCxlbDRlCGThFF0JgFzQ8DhpFCRZZDBdAFzZEFT9eFTI7DBhDCBVWCxY/FjRDFT5dFDA7Eh5HDBlaDxtBGzpIGEJiGDU+DxpECRZXDRg/GDdHFj9gFTI9DRhDCBVVDBc+FjVHFD1fFDA9Eh5GDBlYDxpBGjpLF0BjFzNADhlDChVVDRc/FjZKFDthEy8/DBZBCBRTCxY+FDRJETlfES0+"
 },
 {
  "file": "bad-very-bad",
  "title": "Bad. Very Bad.",
  "what": "A 30-second anime short about a haggler",
  "id": "AO-052",
  "href": "/ledger/bad-very-bad/",
  "dur": 2.767,
  "light": "hFo6lWM2f1ItYyseFyRIjlosg1k6lWI1f1IsYSofGCVIjlksglk6lGEzflErYCkeGCRHjVksgVg6lGEyflEsXykfGCRHjVksf1c6lGAxflErXCcfGCRHjFktf1c6lGAxflEsXCcgGCRHjFktflY6k2AxfVErXCcfGCRHjFktfVY6lGAxflEsXSggGCRHjFkufVU5k2AxflEsXCggGCRHi1ktfFU5k2AwflEsWCggHCRAf1IselQ5kl8vf1IsUScgICU5cEore1Q5lF8wflEsUiggICU6cUsrfFU5lGAwflEsUiggICU6cUsrfFU5lGAxflEsUSggHyQ6cUsrfFU5lGAwflEsUScgHyQ6cUsqfFU5lGAxf1IsUScgHyQ6cUsrfVU5k2Axf1IsUCcfHyQ6cUsr"
 }
] };
