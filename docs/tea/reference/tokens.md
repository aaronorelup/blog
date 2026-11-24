# Tokens: the site's colours and type, as facts

Sources: `src/scripts/home/scene/palette.js` (the homepage 3D world's palette), `src/styles/tokens.css` (the page tokens), `src/styles/tea/*.css` (the tea room), all on a working branch; computed values measured on the live https://aaronorelup.com/tea/?hero=off on 2026-11-12 (main, commit 3beb3cd) in Chromium. Night is the default mode (`:root`); day is `:root[data-mode='day']`.

## 1. Homepage world palette (palette.js): day (mix 0) and night (mix 1)

palette.js says: "The page's own colours are tokens.css's, not these." Every key below is lerped channel by channel between DAY and NIGHT by `mix`.

| key | day | night |
|---|---|---|
| cream | #FBF3E8 | #151726 |
| skyTop | #6FB4E8 | #0B1030 |
| skyLow | #CDE9F7 | #2A3157 |
| cloud | #FFFFFF | #39406B |
| cloudLow | #E4EEF6 | #272E52 |
| wall | #F0A6B8 | #6B4453 |
| wallDeep | #E8909F | #573746 |
| shoji | #F6DFA8 | #424A66 |
| shojiLit | #FCEFC4 | #4E5678 |
| wood | #C4874F | #5B3A26 |
| woodDark | #9A5F36 | #3F2918 |
| beam | #B2703F | #4E3120 |
| tatami | #E8C98A | #7C6647 |
| grass | #9DB863 | #31453C |
| grassDark | #7E9A4A | #25352D |
| leaf | #8FAE55 | #3B4E38 |
| leafDark | #6E8B3D | #2C3B29 |
| trunk | #B4643C | #492E20 |
| stone | #CBC0AE | #565B63 |
| clay | #7A5B52 | #3A2C29 |
| tea | #E08A5F | #8B4C34 |
| vermilion | #C2603F | #803D2C |
| ink | #3A3A42 | #0E1019 |
| petal | #F7B7C8 | #CE8CA4 |
| paper | #F3E7D2 | #C7B28D |
| hillNear | #8FA96E | #243043 |
| hillMid | #9BB07A | #2A3550 |
| hillFar | #A8BA86 | #33405E |
| hillBack | #6E8B3D | #1C2637 |
| roof | #9BA1B8 | #363E56 |
| roofRidge | #848AA3 | #2C3346 |
| cushion | #6E7A9B | #39425F |
| tataki | #9C8B78 | #4A4038 |
| mtnNear | #5C6B8A | #39435C |
| mtnFar | #7B89A6 | #4A5670 |
| lampPaper | #EFE2C2 | #FFD892 |
| lampGlow | #F4EAD0 | #FFF0C8 |
| flame | #E9DCB4 | #FFE6A8 |
| shojiEmis | #000000 | #8A5E28 |
| shojiLitEmis | #000000 | #A0703A |

Light rig (palette.js `RIG`): ambient day #FFFFFF 1.5, night #A8B4E4 0.34; hemisphere day sky #FFF6EA ground #F2DFC6 1.1, night sky #8C9FDC ground #232839 0.42; directional day #FFF4E4 0.35 at (6, 12, 9), night #D8E2FF 0.3 at (-7, 14, 8).

The tea hero's own lights and fog are in `plates/manifest.json` (`lights`, `glows`, `look`): e.g. night fog #141A38, day fog #8A6A7A, TV glow #9FB8FF, motes fly #FFD892 and petal #F7B7C8.

## 2. Page tokens (src/styles/tokens.css), verbatim

```css
:root {
  --day-page: rgb(251, 243, 232);       --night-page: rgb(16, 18, 32);
  --day-bg: rgba(251, 243, 232, 0.97);  --night-bg: rgba(21, 23, 38, 0.96);
  --day-head: rgb(190, 122, 16);        --night-head: rgb(240, 192, 106);
  --day-strong: rgb(58, 58, 66);        --night-strong: rgb(242, 231, 213);
  --day-body: rgb(74, 74, 80);          --night-body: rgb(201, 188, 169);
  --day-quiet: rgb(122, 108, 93);       --night-quiet: rgb(142, 131, 117);
  --day-soft: rgb(107, 94, 82);         --night-soft: rgb(156, 145, 127);
  --day-line: rgb(226, 213, 192);       --night-line: rgb(48, 46, 62);
  --day-line2: rgb(208, 190, 163);      --night-line2: rgb(74, 68, 90);
  --day-accent: rgb(168, 94, 43);       --night-accent: rgb(226, 121, 92);
  --day-gold: rgb(176, 138, 46);        --night-gold: rgb(201, 162, 39);
  --day-tile: rgb(243, 231, 210);       --night-tile: rgb(32, 31, 44);
  --day-hover: rgb(244, 233, 216);      --night-hover: rgb(34, 33, 48);
  --day-code: rgb(240, 229, 210);       --night-code: rgb(34, 33, 48);
  --day-scrim: rgba(251, 243, 232, 0.34); --night-scrim: rgba(8, 9, 18, 0.44);
  --day-shadow: 0 30px 90px rgba(58, 58, 66, 0.22); --night-shadow: 0 34px 100px rgba(0, 0, 0, 0.6);

  --pc-page: var(--night-page); --pc-bg: var(--night-bg); --pc-head: var(--night-head);
  --pc-strong: var(--night-strong); --pc-body: var(--night-body); --pc-quiet: var(--night-quiet);
  --pc-soft: var(--night-soft); --pc-line: var(--night-line); --pc-line2: var(--night-line2);
  --pc-accent: var(--night-accent); --pc-gold: var(--night-gold); --pc-tile: var(--night-tile);
  --pc-hover: var(--night-hover); --pc-code: var(--night-code); --pc-scrim: var(--night-scrim);
  --pc-shadow: var(--night-shadow);

  --font-display: 'Zen Maru Gothic', sans-serif;
  --font-body: Karla, system-ui, sans-serif;
  --font-serif: Georgia, 'Times New Roman', serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
  --text-xs: 11.5px; --text-sm: 12.5px; --text-md: 14px; --text-body: 15.5px; --text-lg: 17px;
  --text-h1: clamp(30px, 4vw, 44px);
  --space-1: 4px; --space-2: 8px; --space-3: 14px; --space-4: 18px; --space-5: 24px; --space-6: 34px;
  --space-7: 44px; --space-8: 60px;
  --radius-s: 8px; --radius-m: 10px; --radius-l: 24px; --radius-pill: 999px;
  --ease-panel: cubic-bezier(.4, 0, .2, 1);
  --z-panel: 34; --z-toggle: 41; --z-skip: 50;
}

:root[data-mode='day'] {
  --pc-page: var(--day-page); --pc-bg: var(--day-bg); --pc-head: var(--day-head);
  --pc-strong: var(--day-strong); --pc-body: var(--day-body); --pc-quiet: var(--day-quiet);
  --pc-soft: var(--day-soft); --pc-line: var(--day-line); --pc-line2: var(--day-line2);
  --pc-accent: var(--day-accent); --pc-gold: var(--day-gold); --pc-tile: var(--day-tile);
  --pc-hover: var(--day-hover); --pc-code: var(--day-code); --pc-scrim: var(--day-scrim);
  --pc-shadow: var(--day-shadow);
}
```

Note: `--font-mono` in tokens.css does not name JetBrains Mono; the tea room uses `--tea-mono: 'JetBrains Mono', var(--font-mono)` (tea.css), and `--font-serif` is Georgia (a system font, not shipped).

## 3. Tea room custom properties (src/styles/tea/*.css)

### tea.css `:root` (night values are the default; `:root[data-mode='day']` switches each `--tea-*` to its `--day-tea-*`)

| name | day | night |
|---|---|---|
| --tea-card | rgb(255, 251, 245) | rgb(21, 23, 38) |
| --tea-kicker | rgb(143, 90, 12) | rgb(240, 192, 106) |
| --tea-link | rgb(163, 74, 46) | rgb(226, 121, 92) |
| --tea-wood | rgb(154, 95, 54) | rgb(160, 112, 58) |
| --tea-wood-fill | rgb(196, 135, 79) | rgb(63, 41, 24) |
| --tea-shoji | rgb(252, 239, 196) | rgb(43, 42, 58) |
| --tea-lamp | rgb(246, 223, 168) | rgb(255, 216, 146) |
| --tea-pink | rgba(240, 166, 184, 0.32) | rgba(206, 140, 164, 0.18) |
| --tea-glow | none | 0 0 14px rgba(255, 216, 146, 0.55) |

Mode-independent, tea.css `:root`:

- `--tea-ink-fixed: rgb(58, 58, 66)`
- `--tea-mono: 'JetBrains Mono', var(--font-mono)`
- `--tea-rail-w: 248px` (208px at max-width 1280px)
- `--tea-pad: clamp(18px, 4.4vw, 56px)`
- `--tea-strip-h: 56px`
- `--tea-anchor: 0px` (calc(var(--tea-strip-h) + 8px) at max-width 1023px)
- `--tea-gap-chapter: clamp(96px, 14vh, 160px)`
- `--tea-gap-group: clamp(56px, 8vh, 96px)`
- `--tea-lattice: repeating-linear-gradient(0deg, color-mix(in srgb, var(--tea-wood) 7%, transparent) 0 1px, transparent 1px 28px), repeating-linear-gradient(90deg, color-mix(in srgb, var(--tea-wood) 7%, transparent) 0 1px, transparent 1px 28px)`

### cover.css and stage.css (the hero)

- `.tea-hero`: `--tea-hero-pt: 84px; --tea-hero-pb: 56px; --tea-hero-px: var(--tea-pad)`; at max-width 560px: `76px / 40px / 14px` (cover.css)
- `.tea-hero[data-tea-hero]` at max-aspect-ratio 1/1: `--tea-hero-pt: max(76px, 61vh)`, with svh support `max(76px, 61svh)` (stage.css)
- `.tea-hero`: `--tea-dock-x: clamp(16px, 3vw, 44px); --tea-dock-low: clamp(16px, 4vh, 44px); --tea-dock-scale: .8`; at min-width 1024px `--tea-dock-low: max(78px, 4vh)` (stage.css)

chapters.css and sections.css define no custom properties; they use the ones above (e.g. `.tea-about-face`: 148px circle, `border: 3px solid var(--tea-lamp)`, `box-shadow: var(--tea-glow), 0 0 0 7px var(--pc-tile)`; 96px under its small-screen query).

## 4. Type on /tea/ today

Families: display **Zen Maru Gothic** (700 for headings; 500 also shipped), body **Karla** (400, 600), mono **JetBrains Mono** (400/500/700), serif **Georgia** (system). Woff2 files and @font-face rules: `fonts/`.

CSS (chapters.css): `.tea-word { font-family: var(--font-display); font-weight: 700; font-size: clamp(64px, 10.6vw, 168px); line-height: 0.92; letter-spacing: -0.025em; color: var(--pc-head); }`; small chapters (`.is-small`: Now, About) `clamp(52px, 7vw, 104px)`. `.tea-lede { font-family: var(--font-serif); font-size: clamp(19px, 1.7vw, 24px); line-height: 1.42; color: var(--pc-strong); max-width: 34ch }`.

Computed on the live page (font-size / weight / line-height, colour night | day):

| element | family | 1440x900 | 390x844 | colour night | colour day |
|---|---|---|---|---|---|
| giant chapter word `.tea-word` ("Start here") | Zen Maru Gothic | 152.64px / 700 / 140.43px, ls -3.816px | 64px / 700 / 58.88px, ls -1.6px | rgb(240, 192, 106) | rgb(190, 122, 16) |
| small chapter word ("Now", "About") | Zen Maru Gothic | 100.8px / 700 / 92.74px | 52px / 700 / 47.84px | same | same |
| chapter lede `.tea-lede` | Georgia | 24px / 400 / 34.08px | 19px / 400 / 26.98px | rgb(242, 231, 213) | rgb(58, 58, 66) |
| hero h1 ("Everything on one page") | Zen Maru Gothic | 60px / 700 / 61.2px, ls -0.9px | 38px / 700 / 38.76px | rgb(240, 192, 106) | rgb(190, 122, 16) |
| hero kicker ("The tea room") | Karla | 11.5px / 600 / 18.4px, ls 1.84px, uppercase | same | rgb(240, 192, 106) | rgb(143, 90, 12) |
| hero statement `.tea-statement` | Georgia | 17px / 400 / 25.5px | 17px | rgb(201, 188, 169) | (pc-body) |
| hero counter `.tea-counter` | JetBrains Mono | 12.5px / 400 / 20px | 12.285px | rgb(242, 231, 213) | (pc-strong) |
| hero chapter list links | Karla | 19px / 600 / 24.7px | 17px | rgb(201, 188, 169) | |
| group title (a topic, e.g. "Working with AI agents") | Zen Maru Gothic | 36px / 700 / 39.6px | 26px | rgb(242, 231, 213) | rgb(58, 58, 66) |
| card title (feature card) | Zen Maru Gothic | 23px / 700 / 28.06px | 23px | rgb(242, 231, 213) | rgb(58, 58, 66) |
| card line (summary) | Georgia | 15.5px / 400 / 23.25px | 15.5px | rgb(201, 188, 169) | rgb(74, 74, 80) |
| index row title | Karla | 16.5px / 600 / 21.45px | 16.5px | rgb(242, 231, 213) | rgb(58, 58, 66) |
| row meta (AO id, date) | JetBrains Mono | 11.5px / 400 / 17.25px | 11.5px | rgb(156, 145, 127) | rgb(107, 94, 82) |
| About text `.tea-about .page p` | Georgia | 25px / 400 / 35.5px | 20px / 28.4px | rgb(242, 231, 213) | rgb(58, 58, 66) |
| body (default) | Karla | 15.5px / 400 / 24.8px | 15.5px | rgb(201, 188, 169) | rgb(74, 74, 80) |
| page background | | rgb(16, 18, 32) | | night | rgb(251, 243, 232) day |
