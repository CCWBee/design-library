# Live exhibits: the site is the demo

A pattern for a page whose job is to prove a maker's competence: a portfolio, a launch page, the
about page of someone who builds. The page demonstrates instead of describing. Each section is a
working thing the reader can poke, labelled honestly, and the person appears in a few lines at the
end. The wow is the argument; the CV is the footnote.

The grammar is borrowed from Lucas Martinic's site (a 3D room that is itself an asset of the product
being shown): interactive, curious, and everything you poke pays out. The vocabulary must be the
subject's own. A page about an islander runs on the tide; a page about interpretability reads its
author as features that fire. Taking the grammar is fine; taking the vocabulary is copying.

Restraint still governs (`../philosophy/taste.md`). One live effect per view. Every exhibit must
pay out on the first poke, and its label must be true.

## The exhibit shapes

Five shapes came out of the September 2026 portfolio pages (`E:\claude-projects\portfolio-live`).
Four are in the library as extracts; the fifth stays in its source.

**An ambient effect driven by real data.** A full-viewport effect whose main parameter comes from
something true, with a readout that says so. The tide page's sea swells with the actual St Helier
tide, computed client-side from harmonic constituents, and the readout gives the height, the
direction and the next low and high. The honesty is the point: the readout admits the model is
approximate and not for navigation. Extract: `../effects/extracts/tide-water.html`, whose
`data-swell` attribute lets any 0..1 value drive the water instead.

**A panel that watches the page.** Show the reader what a site can see about a visit, and store
none of it: frame rate, scroll depth, pointer travel in metres, clicks, a fading trail of the
cursor. A privacy position made visible rather than asserted. Extract:
`../effects/extracts/components/stat-tile-minimal.html`, the live tile group. The claim beside it
must be true of the whole page: a page that loads Google Fonts cannot say it makes no network
requests.

**A toy model training in front of the reader.** A small neural net doing real gradient descent in
the browser, with step, loss and active units on screen. Labelled a toy in plain words, so it shows
the mechanism without pretending to scale. Extract: `../effects/extracts/toy-autoencoder.html`.

**A field the content can fire.** An activation field behind the page that the pointer lights, and
that page elements can light too: hovering a project fires its own coordinate in the field, so the
list and the effect are one system. Extract: `../effects/extracts/activation-field.html`
(`ActivationField.activate(x, y, strength, ms)`) with the index-list specimen in
`../effects/extracts/components/rows-list-minimal.html` calling it.

**A judgement game.** Three messages, one is a scam, one pick, a verdict that names the tells, a
score across rounds. Twenty seconds of a public-good site compressed into something people argue
with. Not extracted, because the mechanism is ordinary and the value is the writing: the rounds
live in the `ROUNDS` array and `pick()` in `E:\claude-projects\portfolio-live\index.html`. Reuse
the shape (items, one pick, an explanation that teaches, a running score), write new rounds.

## Presenting work without a card grid

The project list is where these pages most often collapse into a kit. The four treatments in
`rows-list-minimal.html` each fit a thesis: an index of features that fired (a machine reading its
author), a resolving log (contacts on a scope), an editorial index (a quiet chaptered read), a
typographic index (a fashion-house masthead). Pick the one the page's vocabulary supports and use
one. Rows are separated by space and relative distance, not lines; metadata recedes; the only status
dot in the page sits on the one row whose state is genuinely live, with a word beside it.

## When not to use this

Anything used repeatedly. A dashboard, a tool, an admin screen: those are instruments, and the
"Instrument, not composition" section of `../philosophy/taste.md` applies instead. Live exhibits
are for the page a reader visits once and remembers.

## Checklist

- One live effect per view, legible type over it in the still, a static frame under
  `prefers-reduced-motion`.
- Every exhibit pays out on the first interaction without instructions.
- Every label is true: "toy", "approximate", "nothing stored" only where they hold.
- No network request the copy does not admit to; `file://` is the proof.
- The maker's own lines come last and stay under five.
- British English, no em dashes, dry copy; specific beats clever.
