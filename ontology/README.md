# Component ontology

The by-intent layer over the by-source library. The source catalogues (`../effects/catalogue.md`,
`../patterns/ai-native.md`) answer "what did we harvest". This answers "I need a glass search bar
with a loading state", and it tells the skill how to produce one whether or not it already exists.

## Two things: one finite, one not

- **The map is enumerated in full, once.** Every asset type crossed with every register. It is small
  and finite: roughly 60 types by 4 registers, of which about 70 are meaningful combinations. That is
  this folder.
- **The artifacts are not enumerated.** A handful of load-bearing cells are pre-built as exemplars.
  Every other cell is generated on demand from a recipe. You never build "everything". You build the
  map, then synthesise against it.

So the honest answer to "do you have to enumerate everything": yes for the map (about 200 rows, done
once), no for the files (generated when a task needs them).

**State is not an axis.** Sizes, hover, active, focus, disabled, loading, and light or dark are a
checklist every exemplar implements internally, not cells in the matrix. Treating state as a
dimension is what turns 200 cells into thousands, and it is the source of the "enumerate everything"
dread. Keep the matrix two-dimensional.

## The two axes

- **Type**: the asset, in a family tree. See `taxonomy.md`.
- **Register**: `minimal` / `glass` / `tactile` / `shader`. These are the four pillars. Modifiers
  (neon, editorial, mono) ride on top of a register; they are not registers of their own.

## Retrieval, then synthesis

To produce an asset:

1. **Locate the cell** (type by register) in `assets.json` or `taxonomy.md`.
2. **If the cell is filled** (an exemplar, or a mapped example from `../effects/extracts/`), adapt
   it. Change the content and tokens, keep the mechanism.
3. **If the cell is empty, synthesise.** `register-rules.md` gives how that register expresses on
   that family. Add the type's specifics, borrow structure from the nearest filled cell, and apply
   the taste bar in `../philosophy/taste.md`. The sources rarely explain themselves, so inferring the
   pattern and composing is the normal path, not the exception.
4. **Verify it renders.** Never ship a synthesised asset unseen. WebGL especially can look right in
   code and paint black.

This is the whole point of the library: the skill reaches it by intent, and fills the gap when the
intent has no ready answer.

## Files

- `taxonomy.md`: the full type tree and which cells are meaningful per family.
- `register-rules.md`: the generative engine. How each register expresses on each family.
- `assets.json`: the machine-readable map. Cell status and file links, for the skill to traverse.

The by-source views stay where they are; this is a lens over them, not a replacement. When a new
source is harvested, its assets map into these cells rather than starting a new pile.
