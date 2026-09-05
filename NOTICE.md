# Notices and third-party attributions

The original work in this repository (the philosophy, ontology, register rules, authored reference
docs, the component exemplars, the gallery, and the localisation and adaptation) is licensed under the
MIT License, see `LICENSE`, copyright 2026 Charles Bee.

It also bundles or adapts open-source material, each under its own permissive licence. Those licences
travel with the files.

## Bundled and adapted, under the MIT License

- **ThreeUI** by Meng To (https://github.com/MengTo/threeui). The localised effect extracts in
  `effects/extracts/` are derived from ThreeUI; each file carries its own MIT attribution header. See
  `effects/ATTRIBUTION.md`.
- **Three.js** (https://threejs.org). A bundled runtime is vendored as
  `effects/extracts/three.min.js`, used by an extract that needs it, under its MIT licence and SPDX
  header.
- **Beautiful UI** by Shane Levine, studio Turbo (https://www.beautifului.dev/). The verbatim pattern
  sources in `patterns/ai-native/` are used under the MIT licence in `patterns/ai-native/LICENSE`.
- **scandinavian-design** by Eric Zakariasson
  (https://github.com/ericzakariasson/scandinavian-design). Adapted into `minimal/principles.md` with
  credit; its demo restyle themes and verification scripts are bundled verbatim in
  `minimal/scandinavian/`.
- **transitions.dev** by Jakub Antalik (https://github.com/Jakubantalik/transitions.dev). The 32 free
  transitions and its agent skill in `effects/transitions/`, MIT License.
- **thinking-orbs** by Jakub Antalik (https://github.com/Jakubantalik/thinking-orbs). Engine ported to
  `effects/extracts/thinking-orbs.js` with per-state demos, MIT License.

Full provenance for every part is in `sources.md`.

## Deliberately not in this repository

Two things are kept local and are excluded from this public repository, because they are not ours to
redistribute:

- **Apple Liquid Glass documentation code** (was under `glass/liquid-glass/apple/`). Apple's
  copyrighted sample code, kept locally for reference only.
- **The full glass bible** (`glass/bible-full.md`), whose provenance is not settled. The distilled,
  original `glass/bible.md` is authored work and is included.
- **Aceternity UI component sources** (`effects/aceternity/`). Its licence allows building with them, not
  redistributing them.
- **The Component Gallery scrape** (`ontology/component-gallery/`). Reference data with no licence on the
  descriptions.
