# The design library gallery

A local, self-updating browser for everything in `design/`. It scans the folders live on every load,
so it never needs rewriting when you add or remove an asset. This is the place to see the whole
library at a glance and curate it: what exists, where each file lives, and which ontology cells are
filled or still empty.

## Run it

```
python E:\claude-projects\design\gallery\serve.py
```

Or double-click `run.bat` in this folder. It starts a local server on `http://127.0.0.1:8770` and opens
your browser. Stop it with Ctrl+C. Nothing is installed: it uses only the Python standard library, and
it binds to localhost only.

Options: `--port 8770` (or set `GALLERY_PORT`), `--no-open` to skip opening the browser.

## What you get

- **Gallery view**: every asset as a card with a live preview (effects and components run in a
  sandboxed iframe; code files show a peek), searchable by name, register, type or family, filterable
  by category (components, effects, Apple code, AI-native, docs). Each card shows the file path with a
  copy control, so you can find and delete or move it on disk. Reload to see your change.
- **Ontology view**: the type-by-register matrix from `../ontology/assets.json`, cells shaded by status
  (exemplar, example, synth, empty), so you can see coverage and gaps at a glance and jump to the files
  in a cell.

## Curating

The gallery reads the folder; it does not write to it. To remove an asset, delete or move its file in
`design/` (send to the recycle bin). To add one, drop a file into the right folder
(`effects/extracts/`, `effects/extracts/components/`, `patterns/ai-native/`, and so on). Reload the
page and it appears. Nothing here needs editing by hand.

## How it is built

`serve.py` is the scanner and server; `public/` is the frontend (`index.html`, `styles.css`, `app.js`),
vanilla and dependency-free. The build contract is in `CONTRACT.md`. The frontend dogfoods the
library's own taste (neutral palette, restraint, light and dark, the house rules in
`../philosophy/taste.md`).
