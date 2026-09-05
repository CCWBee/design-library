# Sources and provenance

Where everything in this library came from, and the licence each source carries. Harvested August
2026.

## Content sources

**ThreeUI Community** (https://github.com/MengTo/threeui, by Meng To). MIT License, © 2026 Meng To.
The mechanics: ~51 WebGL/GLSL effect families plus ~70 standalone HTML demos. Cloned to
`E:\claude-projects\threeui` (the raw mine, kept as-is). Catalogued in `effects/catalogue.md`;
flagship effects localised into `effects/extracts/` (see `effects/ATTRIBUTION.md`). ThreeUI-authored
scene assets are also MIT. Not redistributed: remote catalog media (threeui.com and Supabase URLs)
and public CDN libraries. Bundled fonts are OFL 1.1, not carried.

**Glass Interface Design Bible** (`glass/bible-full.md`). A 2,485-line design guide on generic
glassmorphism and Apple Liquid Glass, generalised cross-platform. Copied in from the user's OneDrive
Desktop as source-of-truth; the original on OneDrive is left untouched. Distilled into
`glass/bible.md`. Internal reference document; treat as the user's own material.

**scandinavian-design** (https://github.com/ericzakariasson/scandinavian-design, by Eric
Zakariasson). MIT License. A minimal/restraint design system, captured and adapted into
`minimal/principles.md`. The captured scratch input was superseded by `principles.md` and recycled.
The repository's own code was harvested verbatim on 5 September 2026 into `minimal/scandinavian/`:
18 demo restyle themes (10 live, 8 retired), `shared.css`, the 11 verification scripts, and the site.
See `minimal/scandinavian/README.md`.

**Beautiful UI** (https://www.beautifului.dev/, by the studio Turbo; author Shane Levine). MIT License,
© 2026 Shane Levine. A library of 20 AI-native interface patterns that **does** publish working code:
the real source for every pattern ships inline on the page as copy-paste React (TSX) components. An
earlier note here wrongly said it "ships no code" and that "none is published"; that was mistaken. The
verbatim source for all 20 was harvested on 31 August 2026 into `patterns/ai-native/` (one `.tsx` per
component, plus `LICENSE` and `ATTRIBUTION.md`); `patterns/ai-native.md` is the index over them, keeping
its intent/when-to-use/state prose and the inferred vanilla sketches as the dependency-free adaptation
layer. The code is React + Tailwind (custom tokens: `bg-surface`, `text-ink`, `shadow-hairline`,
`rounded-card`, …) and pulls external packages (`liveline`, `glimm`, `iconoir-react`) plus the studio's
own atoms/primitives (`Button`, `EntityChip`, `GlideMenu`, …). An earlier note said those primitives
were not published; they are, in the shadcn registry, and on 5 September 2026 all six (`Button`,
`GlideMenu`, `EntityChip`, `ValuePill`, `Shimmer`, `StreamText`) plus the `foundation` stylesheet were
harvested verbatim into `patterns/ai-native/primitives/`, so the full 27-item registry is captured. It
remains React and Tailwind, so it is reference and adaptation material for a vanilla target, not a
drop-in.
Copying is permitted under MIT provided the notice travels with it (`patterns/ai-native/LICENSE`). Not
carried: the unpublished internal atoms/primitives, and the site's own fonts and media.

## Structural exemplars (method, not content)

**mattpocock/skills** (https://github.com/mattpocock/skills, by Matt Pocock). Studied for how an
interlinked skill set is structured: a mix of model-invoked and user-invoked skills that
cross-reference each other, with descriptions written to trigger invocation rather than to explain
the skill. This library's skill set (frontend-design, glass-ui, web-shaders, minimal-ui) follows that
shape.

**writing-for-agents** (the user's own skill). The governing method for the skill files and reference
docs: context pointers, progressive disclosure, leading words, positive prompting, single source of
truth.

## The inferred layer

`philosophy/evolution.md` and `philosophy/taste.md` are not from any single source. They are read out
of the sources above and out of the user's own standing design rules, to give the library a point of
view: restraint as the default, depth and material where they carry meaning, and the workspace's
house rules as first-class design law.

## Adding a source later

Drop new material under the matching pillar (`glass/`, `minimal/`, `effects/`, `patterns/`), record
it here with its licence, and update the relevant pillar reference and, if the trigger surface
changes, the skill description. The `patterns/` pillar in particular is built to grow.

## Added 5 September 2026: the tab audit

Sources found open in the browser that the first pass had missed, each harvested as literal per-object files:

**transitions.dev** (https://transitions.dev, https://github.com/Jakubantalik/transitions.dev, by Jakub Antalik).
MIT License (its Terms page: "released under the MIT License"). The 32 free transitions as self-contained HTML in
`effects/transitions/`, plus its agent skill with the copy-ready snippet per transition
(`effects/transitions/skill/`). The repository also holds 11 landing-page stubs for paid Pro transitions;
those carry no code and were not taken. Clone kept at
`E:\claude-projects	ransitions-dev` as the raw mine. Published.

**thinking-orbs** (https://github.com/Jakubantalik/thinking-orbs, Jakub Antalik, MIT). Nine canvas orb states
for agent interfaces; the upstream of ThreeUI's brand-orbs. Clone at `E:\claude-projects	hinking-orbs`; engine
ported to vanilla as `effects/extracts/thinking-orbs.js` with one demo per state (`orb-<state>.html`). Published.

**Aceternity UI** (https://ui.aceternity.com). 109 components fetched verbatim from its shadcn registry into
`effects/aceternity/`. Its licence permits building with the components but not redistributing them, so the
folder is gitignored and local only.

**The Component Gallery** (https://component.gallery, by Iain Bean; site source at github.com/inbn/component-gallery
but the data lives in Airtable). Sixty component pages scraped into `ontology/component-gallery/` as JSON: name,
aliases ("also known as"), and every design system implementing it with tech tags (2,804 entries). No licence on
the descriptions, so kept local only; the factual taxonomy (names, aliases, who implements what) informs
`ontology/taxonomy.md`.

**Liquid glass lens** (`glass/liquid-glass/liquid-lens.html`). Charles's own example code from an earlier session,
rescued from a temporary scratchpad; only its remote backdrop photo was swapped for a local SVG colour field.

**Originkit** (https://www.originkit.dev): 403 animated React components, client-rendered. NOT harvested: its free tier is metered (3 component copies a day, account required) with paid Pro and Studio tiers and a usage licence, not open source, so bulk copying would breach its terms. Reference only; copy individual components by hand within the free allowance if wanted.
**21st.dev**: a community marketplace of thousands (2,043 buttons alone); scope to be decided, not harvested.
