# src/elements/: the post components (browser)

- **Frozen:** every `<ao-*>` tag name and attribute (72 posts use them, `ARCHITECTURE.md` "Contracts"). Add a tag or
  an attribute; never rename or drop one. AO-073 (`src/data/exempt.js`) writes its own markup: never edit it.
- **One folder per tag, found by name:** `ao-x/element.js` defines the class and ends with
  `customElements.define('ao-x', AoX)` (a module runs once: no `get()` guard). `ao-x/style.css` beside it holds that
  element's CSS and only its CSS. `registry.js` loads a folder's module when its tag is in a post; `ElementStyles.astro`
  inlines its CSS into the articles that use it; the build knows the tag by its folder (`scripts/build/markdown.mjs`).
  `ao-demo` loads `ao-demo/demos/<name>/index.js` (`mount`).
- **Adding one:** the folder with `element.js` (its markup built with `h()`) and `style.css`, a `## <ao-x>` section
  in `docs/COMPONENTS.md`, and its behaviours as `tests/e2e/INVENTORY.md` rows with a spec in `tests/e2e/elements/`.
  Nothing to register: the folder is the tag.
- **Never import CSS from JS** here (`scripts/check/code.mjs` fails it). What every element shares (the viewer, the
  now-playing bar, `.visually-hidden`, the caption) is `src/styles/elements.css`.
- **The cascade:** a `style.css` is inlined in the article, after the page's stylesheets, so a rule exactly as
  specific as one in `prose.css` or `base.css` (`.ao-x-list li` against `.pc-prose li`, `.ao-x { outline: none }`
  against `:focus-visible`) wins over it: leave out what the page should set (the old `post-components.css` was
  linked before them, so the ports dropped what they overrode).
- **Shared code:** `_lib/` (pure helpers: `time.js` parseTime/fmtTime, `table.js` readTable/cellNumber, `dom.js` h())
  and `_core/` (`player.js` claim/current/`AO_LISTEN_PLAY`/`AO_STOP`, `media.js`, `now-playing.js`, `viewer.js`
  openViewer, and the lazy `viewer-ui.js` + `zoom.js`). Dynamic imports go through `src/scripts/lazy.js`.
- **Players:** a component that plays as one unit gives its element `aoPlay()`, `aoPause()` (and `aoPlaying()`,
  `aoTitle()`, `aoClock()` for the bar), and calls `claim(this)` when it starts. Groups are `GROUPS` in `player.js`.
- **Lifecycles stay as they are:** each element keeps its own `connectedCallback`, `disconnectedCallback` and
  `_ready` guard; the homepage's reader connects and disconnects posts as the reader moves.
- **Docs and checks:** a section `## <ao-x>` in `docs/COMPONENTS.md` per folder (`npm run check`); its behaviours are
  rows in `tests/e2e/INVENTORY.md` with specs in `tests/e2e/elements/`. Files stay under 400 lines.
