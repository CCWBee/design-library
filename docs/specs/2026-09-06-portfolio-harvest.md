# Portfolio harvest into the design library

Workflow run id: `wf_c3c5ad18-ed0` (launched 2026-09-06; resume handle in `E:\claude-projects\portfolio-live\STATE.md`)

## Why

On 22 August 2026 an Ox Alpha model test in `E:\claude-projects\portfolio-live` produced five
self-contained portfolio pages: a tide-driven sea hero with three live exhibits, and four alternative
directions (`variants/latent`, `mercury`, `signals`, `quiet`). The mechanisms are reusable and four
ontology cells they realise are currently `synth` (empty): `media-hero / hero-composition` (minimal
and shader), `data / rows-list` (minimal), `surfaces / panel` (shader) and `data / stat-tile`
(minimal). This spec lifts the mechanisms out as library extracts and component exemplars, stripped
of the portfolio's copy, fonts and chrome, so any session can reach them by intent.

## Sources (read the named file in full before building from it)

| Page | File | What it holds |
| --- | --- | --- |
| Tide | `E:\claude-projects\portfolio-live\index.html` | WebGL water plane with finite-difference normals and chop, pointer ripples, swell driven by a client-side harmonic tide model (St Helier), a self-telemetry panel, a scam-spotting game, a toy autoencoder training in canvas |
| Latent | `E:\claude-projects\portfolio-live\variants\latent\index.html` | Raw-WebGL activation field (from `dot-matrix`) with pointer and per-row activation sites; a "features that fired" index list |
| Mercury | `E:\claude-projects\portfolio-live\variants\mercury\index.html` | Liquid-metal wordmark: text painted to an offscreen canvas as an alpha mask, chrome dispersion shader inside the letters; a heavy typographic index |
| Signals | `E:\claude-projects\portfolio-live\variants\signals\index.html` (+ `three.min.js`) | A composed preset of `warp-field`; a "scope log" list with a resolving state and decoding metadata |
| Quiet | `E:\claude-projects\portfolio-live\variants\quiet\index.html` | A minimal light page whose one living detail is a small condensation pane; an editorial index |

## Deliverables

Eight files, each owned by one builder, none shared. Nothing else in the library is written by a
builder: the catalogue, `ontology/assets.json`, `sources.md`, `effects/ATTRIBUTION.md` and the
pattern doc are registered afterwards by a single writer.

| # | File (under `E:\claude-projects\design\effects\extracts\`) | Ontology cell | Derived from |
| --- | --- | --- | --- |
| 1 | `tide-water.html` | media-hero / shader-background (shader); media-hero / hero-composition (shader) | original |
| 2 | `activation-field.html` | media-hero / particle-field (shader); hero-composition (shader) | ThreeUI `dot-matrix` (MIT) |
| 3 | `liquid-metal-wordmark.html` | typography / wordmark (shader); hero-composition (shader) | ThreeUI `liquid-metal-button` (MIT) |
| 4 | `signals-field.html` | media-hero / particle-field (shader); hero-composition (shader) | ThreeUI `warp-field` (MIT), Three.js via `three.min.js` |
| 5 | `condensation-pane.html` | surfaces / panel (shader); hero-composition (minimal) | ThreeUI `condensation` (MIT) |
| 6 | `components/rows-list-minimal.html` | data / rows-list (minimal), exemplar | original |
| 7 | `components/stat-tile-minimal.html` | data / stat-tile (minimal), exemplar | original |
| 8 | `toy-autoencoder.html` | data / stat-tile (shader), example | original |

### 1. `tide-water.html`

Full-viewport WebGL water. Keep: the height field as layered directional sines plus three
high-frequency chop terms; normals by finite difference across the whole height field (the lesson
from the build: normals from the low-frequency layers alone produce fog patches, not water); diffuse
plus a tight specular and a tighter glint; pointer ripples as ring uniforms with age decay; a swell
uniform in 0..1. Drive the swell two ways: by default from a client-side harmonic tide module (the St
Helier constituents and mean sea level from the source, with the readout of height, rising or
falling, next low and next high), and by a `data-swell` attribute on the canvas that overrides it
with any 0..1 value so the effect can follow other live data. Over the water, one legible sample
headline and a small readout in system type. Reduced motion renders one static frame. The header
states that the constituents are approximate (about ±0.1 m) and not for navigation.

### 2. `activation-field.html`

The raw-WebGL dot grid from `dot-matrix`, reworked as an activation field. Keep: sparse dots that
breathe slowly; the pointer as an activation site; an idle drift so a still or a touch device is
never dead. Add a small script API, `ActivationField.activate(x, y, strength, ms)` with `x` and `y`
in 0..1, so page elements can fire a region (this is how the Latent page lit a project's own
coordinate on hover). Show the API working with two sample controls beneath the field. Reduced
motion renders one idle frame.

### 3. `liquid-metal-wordmark.html`

The `liquid-metal-button` dispersion shader applied to a word rather than a pill. Keep: text painted
to an offscreen 2D canvas and uploaded as an alpha mask; the chrome gradient, the wavy prismatic
dispersion horizon, the softening blur and bloom rendered only inside the letters; the pointer warp
and the rest drift; a styled silver CSS fallback where WebGL2 is absent. Take the word from a
`data-text` attribute (default "Liquid metal") in a system serif at masthead size. Document the
build's NaN gotcha in the header: `atan(0, 0)` in the ripple and the `dFdx` self-refraction produced
NaN that the blur smeared to solid black; the guard is finite checks and clamps, and the fix must be
re-tested on a discrete GPU, not only SwiftShader.

### 4. `signals-field.html`

The `warp-field` extract as a composed preset. Keep: the drifting debris tiles removed; streak speed
2.2; streaks recoloured desaturated slate-white with a rare warm one, faded head to tail; a minimum
spawn radius so the centre stays dark; the pointer leaning the whole field a little toward the
cursor. A sample headline sits in the dark centre and must be legible in the still. Reference the
vendored runtime as `<script src="three.min.js"></script>`. Reduced motion renders one frame.

### 5. `condensation-pane.html`

A minimal light page whose only living element is a small dark pane running `condensation`. Keep:
density proportional to the pane's area (the source's retune from a fixed-count swarm); a lifted
highlight so droplets read in a still; faint coordinates read through the glass; the pointer wipe
that clears the fog; an occasional drop that runs. The page around it is the point: cool-biased
near-white ground, generous space, one headline and one paragraph in system type, light and dark
tokens. Reduced motion seeds a static condensed frame and keeps the wipe user-driven.

### 6. `components/rows-list-minimal.html`

A component exemplar in the house spec-sheet shape (`components/card-minimal.html` is the model:
masthead with the family and register, a lede, a plain theme toggle, small-caps section heads,
specimens labelled beneath). Four specimens, each a list of four rows of neutral, real sample content
(short project or record names with a genuine dry sentence each; no personal biography):

- **Index list** (the "features that fired" lineage): a monospace index, a name, one line, a
  metadata word or two; hover and focus light a short activation bar and, if
  `window.ActivationField` exists, call `activate` with the row's stored coordinate.
- **Resolving log** (the "scope log" lineage): a corner-bracket marker, a name, one line, a
  key-value column with a signal meter; a `resolved` state; metadata decodes from glyphs to text once,
  on first intersection, over a short deterministic settle, the name itself never scrambles, and the
  decode is skipped under reduced motion.
- **Editorial index**: a numeral, a serif title, one sentence, a small metadata line; hover indents
  the row and colours the numeral.
- **Typographic index**: a large numeral, a big name, a dry line, a status word; hover shifts weight.

Rows are separated by space and relative distance, not lines: at most one hairline rule in the
viewport and none under a heading. Metadata recedes by colour and weight. Tabular numerals. Every
state is designed: hover, focus-visible, active, resolved or live, disabled. The one status dot in the
file sits on the single row whose status is genuinely live, with a text label beside it.

### 7. `components/stat-tile-minimal.html`

A component exemplar in the same spec-sheet shape. Specimens: a static tile (label, value, secondary
line, tabular numerals); a two-by-two group of live tiles reading the page's own frame rate, scroll
percentage, pointer travel converted to metres at 96 px per inch (say so in a note), and clicks; a
fading pointer-trail canvas beneath them. Nothing is stored or sent, and the page says so. Minimal
register: no shadow, hairline or space, one geometry, three ink levels.

### 8. `toy-autoencoder.html`

The 24 to 64 to 24 sparse autoencoder from the tide page: vanilla-JS gradient descent with an L1
penalty on synthetic signals built from a few overlapping patterns; a 16 by 4 grid of hidden units on
a canvas, colour rising with smoothed activation; a readout of step, loss and active units; one
control that starts and pauses training. Label it plainly as a toy in the page copy. Under reduced
motion, redraw only every fiftieth step.

## Rules for every file

- Header comment first: the name; the provenance line (original work, copyright 2026 Charles Bee,
  MIT, or "derived from ThreeUI `<name>` by Meng To, MIT; adaptation copyright 2026 Charles Bee,
  MIT"); what was kept and dropped; any gotcha worth a future reader's time. Then the document in the
  house shape used by the existing extracts.
- British English. No em dash or en dash anywhere, comments and placeholders included (a pending
  readout shows "…" or "0", never a dash). Sentence case; a plain small-caps eyebrow is allowed, a
  pill, badge or status dot on a heading is not. No border rule under a heading or along a box.
- Ink and fills as alpha colours, never the `opacity` property. Light base with dark redefined under
  `@media (prefers-color-scheme: dark)` guarded as `:root:not([data-theme="light"])` and again under
  `:root[data-theme="dark"]`, unless the file commits to one world on purpose, in which case it paints
  every colour explicitly. `body` always paints its background from a token.
- System font stack only. No Google Fonts, no CDN, no network request of any kind. Runs from disk
  over `file://`.
- `prefers-reduced-motion` honoured as the section says. Visible `:focus-visible` on every control.
  Contrast of at least 4.5:1 for text under 24 px on every surface, effects included.
- No personal copy: no name, biography, employer or contact from the source pages. Sample content is
  real, dry and neutral.
- One live effect per file. The type layer over an effect must be legible in the still, not only in
  motion.

## Verification

Each builder, before returning:

1. Render with the shared harness from Bash using forward-slash Windows paths (a leading-slash path
   would be rewritten by Git Bash):
   `node E:/claude-projects/design/tools/qa/shot.mjs --url E:/claude-projects/design/effects/extracts/<file> --out E:/claude-projects/design/effects/extracts/_qa-<name>.png --width 1200 --height 800`
   and again at `--width 500 --height 800`. Read both PNGs. WebGL must visibly paint (a black or empty
   canvas is a failure), type must be legible, nothing overflows (the tool prints `HORIZONTAL
   OVERFLOW` when it does).
2. Grep the file for `—`, `–`, `fonts.googleapis`, `http://` and `https://` and fix anything found
   (an attribution URL in the header comment is the only allowed URL).
3. Delete the `_qa-*.png` files.

Then a separate gate reviewer, refuting by default, takes its own screenshots of all eight files at
both widths, reads each source, and reports findings by file and line with a one-line fix, per
`C:\Users\Charles\.claude\skills\visual-verify\GATE.md`. Blockers and majors are fixed before
registration.

## Registration (single writer, after the gate)

- `effects/catalogue.md`: a row per file under the matching theme heading, marked `●` (extracts 1, 2,
  4 under Fields, particles and flow; 3 under Typography and text; 5 under Glass and material; 8 under
  Loaders and UI chrome; the two components are listed by the gallery from `assets.json`).
- `ontology/assets.json`: the cells in the deliverables table, `exemplar` for the two components,
  `example` for the rest, files written as `../effects/extracts/<file>`.
- `effects/ATTRIBUTION.md`: a section for the library's own extracts and for those derived from
  ThreeUI extracts.
- `sources.md`: an entry dated 6 September 2026 naming the portfolio pages as the source.
- `patterns/live-exhibits.md`: the "site is the demo" pattern, with the two exhibits not extracted
  (the scam-spotting game and the self-watching panel's page framing) pointed at their source.
- `README.md`: the effects and patterns lines mention the additions.
