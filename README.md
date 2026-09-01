# Design library

The workspace's front-end design authority: the philosophy, mechanics, and localised material behind
how things are built to look and feel here. It marries design theory (a glass design bible, a
Scandinavian restraint system) to real implementable mechanics (the ThreeUI effect trove), adds an
AI-native pattern layer, and infers a point of view the sources leave implicit.

This folder is the single source of truth. Four global skills are thin routers into it and self-fire
on the right work: **frontend-design** (the keystone authority and router), **glass-ui**,
**web-shaders**, **minimal-ui**. Reading the skills is optional; reading this library is where the
substance is.

## Browse it

Hosted (public subset): https://ccwbee.github.io/design-library/ · source:
https://github.com/CCWBee/design-library

Or run the gallery locally to see and curate the whole library, including the local-only Apple
reference code that is kept out of the public repository:

```
python E:\claude-projects\design\gallery\serve.py
```

A local page at http://127.0.0.1:8770 that scans these folders live, so it never goes stale: a
searchable preview grid of every asset and an ontology coverage matrix. Details in `gallery/README.md`.

## Start here

- `philosophy/taste.md`: the taste bar, the one test (every element earns its place), the register
  decision map, and the standing house rules. Read before choosing a direction.
- `philosophy/evolution.md`: why depth, material, and motion returned, so they are used where they
  carry meaning.

## The pillars

- `glass/`: functional depth and translucency. `bible.md` (distilled), `bible-full.md` (the
  exhaustive original), `recipes.md` (copy-ready CSS).
- `minimal/`: restraint as the baseline. `principles.md` (tokens, checklist, remediation order).
- `effects/`: live GPU and canvas material. `catalogue.md` (the map into ~120 ThreeUI effects),
  `extracts/` (self-contained, file://-runnable localised effects), `ATTRIBUTION.md`.
- `patterns/`: `ai-native.md` (generated, streaming, agent-driven surfaces; installing Beautiful UI
  via its shadcn registry) and `interaction-feedback.md` (the polish bar for how controls answer,
  across the visual, spatial, haptic, and sound feedback stack).
- `ontology/`: the by-intent index over all of the above. `taxonomy.md` and `assets.json` map every
  asset type against the four registers; `register-rules.md` is the synthesis engine, so any asset
  can be found if it exists or generated from the philosophy if it does not. This is how the skills
  actually use the library.

## Provenance

`sources.md` records where every piece came from and its licence. In short: ThreeUI is MIT
(© 2026 Meng To) and is cloned to `E:\claude-projects\threeui` as the raw mine; the glass bible is
the user's own material; the minimal system is adapted from ericzakariasson/scandinavian-design
(MIT); the AI-native patterns are seeded from Beautiful UI (Turbo). The skill-set structure follows
mattpocock/skills and the user's writing-for-agents method.

## The idea

Restraint is the default. Depth, glass, and motion are the deliberate exceptions that have to justify
themselves by carrying hierarchy, context, state, affordance, or spatial continuity. The library
exists so that any session can design with that judgement and reach real, licensed, self-contained
mechanics rather than starting from a blank page.
