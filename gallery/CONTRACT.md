# Design gallery: build contract

A local, self-updating browser for the design library. It scans the `design/` folders live on every
load and presents every asset as a browsable, filterable gallery with live previews, so it never needs
rewriting when assets are added or removed. Reference model: https://transitions.dev/ (clean grid,
live previews, minimal chrome, code on demand).

The library root is the parent of this `gallery/` folder: `E:\claude-projects\design`. Two parts build
to this contract independently: the **server** (`serve.py`) and the **frontend** (`public/`).

## Server (`design/gallery/serve.py`, Python 3 standard library only)

- Bind `127.0.0.1`, port `8770` (override with `--port` or `$GALLERY_PORT`). Localhost only.
- On start, print the URL and open it in the browser (`webbrowser.open`), unless `--no-open`.
- Compute `ROOT = Path(__file__).resolve().parent.parent` (the `design/` dir). Never serve outside it.
- Routes:
  - `GET /` serves `public/index.html`.
  - `GET /public/<path>` serves static files from `gallery/public/`.
  - `GET /api/index` scans the library (below) and returns the JSON document (below). Scan on every
    request; no caching, so a reload reflects added or removed files. `Content-Type: application/json`.
  - `GET /files/<relpath>` serves any file under `ROOT` by its path relative to `ROOT`, with a correct
    `Content-Type` (html, css, js, png, jpg, svg, webp, mp4 by extension; `.tsx`, `.swift`, `.md`,
    `.css` served as `text/plain; charset=utf-8` so code can be fetched and shown). Reject and 403 any
    path that escapes `ROOT` (resolve and check `is_relative_to`).
  - Anything else: 404 JSON.
- Keep it a single file, no third-party packages. `ThreadingHTTPServer` so iframes and API load together.

## Scan rules (build `items[]`)

Walk these sets; for each file emit one item. Skip `three.min.js`, any file whose name starts with `_`,
anything under `gallery/`, and `apple/README.md`.

| Set | Glob (relative to ROOT) | category | kind | renderable |
|---|---|---|---|---|
| Effects | `effects/extracts/*.html` | `effects` | `html` | true |
| Components | `effects/extracts/components/*.html` | `components` | `html` | true |
| AI-native | `patterns/ai-native/*.tsx` | `ai-native` | `tsx` | false |
| Apple code | `glass/liquid-glass/apple/**/*.swift` | `apple` | `swift` | false |
| Docs | `**/*.md` (exclude `gallery/`) | `docs` | `md` | false |

Item shape:

```json
{
  "id": "effects/liquid-form",
  "name": "liquid-form",
  "title": "Liquid form",
  "category": "effects",
  "subgroup": null,
  "relpath": "effects/extracts/liquid-form.html",
  "fileUrl": "/files/effects/extracts/liquid-form.html",
  "kind": "html",
  "renderable": true,
  "size": 12345,
  "mtime": "2026-08-31T12:00:00",
  "meta": { "family": "media-hero", "type": "orb-sphere", "register": "shader", "status": "example" }
}
```

- `title`: humanise `name` (hyphens to spaces, first letter upper). For apple files, keep the symbol
  name; set `subgroup` to the framework folder (`swiftui` / `uikit` / `appkit` / root as `guide`).
- `meta`: from `ontology/assets.json`, by inverting it into a map from referenced file path to its cell
  (`family`, `type`, `register`, `status`). Match on the item's `relpath` (the assets.json `files`
  entries are written relative to `design/`, for example `../effects/extracts/...`; normalise both to a
  path relative to ROOT before matching). If a file is not referenced, `meta` is `null`.

## API document (`GET /api/index`)

```json
{
  "generatedAt": "<iso>",
  "counts": { "effects": 84, "components": 14, "ai-native": 20, "apple": 60, "docs": 15 },
  "categories": [ { "id": "components", "label": "Components", "count": 14 }, ... ],
  "items": [ ... ],
  "ontology": { ...the parsed contents of ontology/assets.json verbatim... }
}
```

Order `categories` as: components, effects, glass/apple, ai-native, docs (put the most curatable first).

## Frontend (`design/gallery/public/`: `index.html`, `styles.css`, `app.js`)

A calm, minimal gallery that **dogfoods this library's own taste**. Before building, read
`../philosophy/taste.md` and `../minimal/principles.md` and obey them: neutral alpha-black palette,
hierarchy from size and space, British English, no em dashes, no pill/badge/chip eyebrow labels and no
status dot on a heading, no border rule directly under a heading, ink and fills set with alpha colours
not `opacity`, light and dark via `prefers-color-scheme` plus a plain toggle, visible focus, honour
`prefers-reduced-motion`. The gallery is the first thing anyone sees of the library, so it must be
exemplary, not a scaffold.

Fetch `/api/index` once on load. Two views, switchable by a plain control:

**Gallery view** (default): a search box (filters by name and by register/type/family), a plain
category filter, and a responsive card grid.
- A renderable (`html`) card shows a **live preview** in a sandboxed `<iframe sandbox="allow-scripts">`
  pointed at `fileUrl`, at a fixed aspect ratio. **Lazy-load** each iframe with an `IntersectionObserver`
  (set `src` only when the card scrolls into view) and **unload** it (`src=""`) when it scrolls far out,
  so 98 live previews and their WebGL contexts do not run at once. Show a quiet placeholder until loaded.
- A code card (`tsx`, `swift`, `md`) shows the file name, its kind, and a short monospace peek fetched
  from `fileUrl` (first ~20 lines); no iframe.
- Every card shows: title, a plain category label, the `register`/`type` when known, the `size`, and the
  **`relpath`** with a copy-to-clipboard control, so a file can be found and curated on disk. Clicking a
  card opens a detail panel: the full-size live preview (or full fetched code in a scrollable pane), the
  ontology meta, and the `relpath`. Curation is done by editing the folder on disk; a reload reflects it.

**Ontology view**: render `ontology` as the type-by-register matrix (families down, the four registers
across). Colour each cell by `status`: `exemplar` strongest, `example` filled, `synth` a light outline,
`n/a` blank. Clicking a filled cell lists its files and can jump to the gallery filtered to them. This is
the coverage-and-gaps view for curation.

Performance and robustness: no external CDN or fonts (system font stack); degrade gracefully if
`/api/index` fails (show the error, not a blank page); keep the whole frontend dependency-free vanilla
HTML, CSS and JS.
