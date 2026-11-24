# The tea room, the about chapter: its rows of the behaviour inventory

`tests/e2e/tea/about.spec.mjs`. Stub (piece 1): the shared checks every chapter keeps (`chapterChecks` in
`tests/e2e/tea/base.mjs`). The chapter's builder adds a row for each acceptance check of section 3.

| Behaviour | Spec |
|---|---|
| Its section, anchor and heading; at its opening frame the screens are open, its scene is on, nothing is logged, nothing scrolls sideways and every picture in reach has decoded | about: its section, anchor and heading |
| Without JavaScript (book mode) its heading and every link show | about: book mode |
