# Scandinavian design: verbatim code

The actual code from ericzakariasson/scandinavian-design (MIT), saved verbatim and referenced from
`../principles.md`. The principles file is the adapted rule system; this folder is the source's own
code that applies and verifies those rules. Harvested 5 September 2026 from
https://github.com/ericzakariasson/scandinavian-design (main). Reference these files; do not restate.

## demos/

Real sites restyled to the Scandinavian system, one `theme.css` each over a shared base. These are the
concrete application of the principles: how the palette, spacing, type and restraint land on a live,
dense product surface.

- `demos/shared.css`, `demos/index.html`: the shared base and the demo index.
- Live: `aws`, `craigslist`, `discord`, `github`, `hn`, `ikea`, `imdb`, `stripe`, `wikipedia`,
  `yahoo-finance` (`demos/<site>/theme.css`).
- Retired by the author, kept for reference: `demos/_retired/{amazon,espn,govuk,linear,mastodon,nytimes,steam,theverge}/theme.css`.

## scripts/

The skill's own measurement and verification tooling (Node), the mechanical side of the review
checklist in `../principles.md`: `density.js` (information density), `lines.js` (rule and divider
counting), `tints.js` (grey tint detection), `bands.js`, `probe.js`, `recon.js`, `target.js`,
`crop.js`, `snap.js`, `compose.js`, `run-eval.js` (the evaluation runner). Read `run-eval.js` first for
how they chain.

## Site

`index.html`, `site.css`, `site.js`: the project's own landing page, itself an example of the system.
