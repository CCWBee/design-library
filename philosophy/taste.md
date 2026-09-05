# The taste bar

The judgement layer that governs every design decision in this workspace. Read it before choosing an
aesthetic direction or reviewing one. It sits on top of the material knowledge in the pillars: it
decides *which* register to use and *how far* to push it. The history behind it is in
[`evolution.md`](evolution.md).

## The one test

**Every element must earn its place.** Every spacing, type, colour, radius, shadow, blur, and motion
choice should be defensible in terms of the product, not the style alone. If the honest answer is
"it looks cool", it has not earned its place. This test is borrowed, with credit, from the
Scandinavian-design system (see [`../minimal/principles.md`](../minimal/principles.md)); it governs
the flashy pillars too, not only the minimal one.

Depth, glass, and motion earn their place only when they carry hierarchy, context, state, affordance,
or spatial continuity. Decoration that carries none of these is the old skeuomorphic mistake in new
clothes. This is the central lesson of [`evolution.md`](evolution.md) and the reason restraint is the
default and depth is the deliberate exception.

## Choosing the register

Start from restraint and add richness deliberately, never the reverse. A design almost never fails
for being too calm.

- **Default to minimal.** Neutral palette, generous whitespace, quiet type, content first. This is
  the baseline for almost everything: dashboards, docs, tools, most product UI, anything content-led.
  Pillar: [`../minimal/principles.md`](../minimal/principles.md).
- **Add glass and functional depth** when layering, context, or focus needs to be shown: a panel
  that should let the ground read through it, navigation that floats over content, a modal that keeps
  its backdrop present, a control that adapts to what is beneath it. Pillar:
  [`../glass/bible.md`](../glass/bible.md). Reach for a real GPU refraction shader over CSS
  backdrop-filter only when the surface is a hero moment, not routine chrome.
- **Add a rendered shader effect** when a surface should feel alive rather than static: a hero
  background, an ambient field, an orb, a landing-page centrepiece. One live effect per view is
  usually the ceiling; a page full of them is noise. Pillar:
  [`../effects/catalogue.md`](../effects/catalogue.md) and the localised extracts.
- **Use AI-native patterns** whenever the surface shows generated, streaming, or agent-driven work:
  chat, assistants, tools, anything with thinking or tool-use states. Pillar:
  [`../patterns/ai-native.md`](../patterns/ai-native.md).

These combine. A calm minimal layout with one glass navigation bar and a single shader hero is a
common, correct answer. What is wrong is reaching for glass or shaders first and asking what they are
for afterwards.

Whatever the register, hold the interaction-feedback bar on every control: how it answers when
touched, across the visual, spatial, haptic, and sound layers, considered even on simple controls.
See [`../patterns/interaction-feedback.md`](../patterns/interaction-feedback.md).

## Standing rules (non-negotiable in this workspace)

These are house law, stated positively. They hold across every page, site, and artefact.

### Headings and labels
- Use a plain heading, or plain small-caps eyebrow text with no background and no dot. An eyebrow
  label rendered as a rounded pill, badge, or chip is banned, as is a small status or "live" dot
  placed before a heading. Add a genuine live indicator only when it reports real live state and only
  when asked for one. Pills and status dots on headings are a recognised AI-design tell and read as
  cheap.
- Let whitespace separate a heading from the content beneath it. Do not place a horizontal border
  rule directly under a heading. Before adding any rule anywhere, name what would be ambiguous
  without it; if nothing would be, the space does the job.

### Copy
- British English throughout.
- No em dashes. Restructure the sentence, or use a colon, comma, or full stop. Where a title needs a
  separator, use a middle dot ("·").
- Dry and understated. Never twee, never breathless, never over-cute. Dry wit is welcome; forced
  whimsy is not. Say the thing plainly and let it stand.
- In professional or management-facing documents, go further: no dashes used as punctuation, no bold
  run-in labels, and dry conventional headings rather than clever ones.

### Colour and state
- Set ink and surface tints with alpha colours, not the CSS `opacity` property, so a value does not
  fade every descendant beneath it.
- A colour that genuinely encodes state (an unread dot, an error badge, a live indicator) stops
  working as an accent once it saturates the region a reader scans. Keep accent colour rare so state
  colour still means something.
- Keep a product's own brand mark as it shipped, in full colour, even when everything around it goes
  neutral. A brand mark is not chrome to be desaturated.

### Accessibility (a correctness bar, not a nicety)
- Maintain text and control contrast on every surface, glass included. Translucency and blur reduce
  contrast; pair them with a tint so type stays legible.
- Honour `prefers-reduced-transparency` and `prefers-reduced-motion`: keep hierarchy and useful
  feedback while removing the blur or the movement.
- Keyboard access, visible focus, and adequate touch targets are required, not optional.

## Delivery

- Hand over a site or component as a self-contained local `.html` file the user opens over `file://`,
  not as a hosted artifact, unless the user asks otherwise. Everything in
  [`../effects/extracts/`](../effects/extracts/) is built to this standard.
- Verify the true look with a real render (headless Chrome or the browser), not by reasoning about
  the CSS. WebGL especially can look fine in code and render black; confirm it.

## Instrument, not composition

Charles's brief (September 2026, from a study of a vibe-coded dashboard against a human-designed
one), applied to any product UI that is used repeatedly rather than glanced at once:

- **Design for the second-hundredth use.** Edited density, stable positions for recurring
  information, compact controls, persistent context, predictable colour semantics, little decorative
  movement. The test is not "does the screenshot look welcoming" but "after a month, can someone
  read the whole state in five seconds".
- **The interface is an instrument, not a poster.** Position follows importance; related signals sit
  together; exceptions outrank decorative headings; components differ in size by their value; the
  screen answers a connected sequence of questions (what is happening, is it better or worse, where,
  why, what can I do).
- **Thesis before components.** Three or four qualities, and anything that contradicts one goes.
  From the qualities, most decisions follow (radii, borders versus shadows, neutral versus warm
  surfaces, compact versus oversized type, one strong action).
- **Every visible distinction pays rent.** If removing a treatment would not remove information,
  hierarchy or affordance, remove it. A shadow on every panel, a pill around ordinary text, a coloured
  rail that means nothing elsewhere: none of these pay.
- **Hierarchy by quietening.** Metadata recedes through colour and weight; panel titles locate, they
  do not compete; maximum contrast is reserved for current state, exceptional conditions and the next
  consequential action.
- **One geometry.** One inset, one gap, one padding, one control height, one radius, one border
  weight, a 4/8/12/16/24 scale, and alignments that recur across the screen. Spacing indicates
  conceptual distance: tight within a group, moderate between groups, large between parts.
- **Cards sparingly.** A card exists because its boundary matters (a discrete module, an
  independently interactive region, its own states). "Card soup" separates more and ranks less.
- **Density is designed.** No redundant titles, repeated legends, oversized controls, wrapped
  identifiers or empty chart areas; still adequate row height, legible secondary text, strong
  alignment, sufficient targets.
- **Typography as infrastructure.** One family, two weights, three ink levels, tabular numerals, a
  restrained scale; monospace only for code or aligned values. One repeatable hierarchy: label,
  value, secondary.
- **Charts answer a question.** Decide the comparison, the primary series, the scale, the selected
  state, what colour means and what stays visible without interaction. Library defaults produce a
  valid chart, not a finished one.
- **Whole screen before polished components.** Define every module, rank them, fit the hierarchy
  into the target viewport, set the grid, rough every panel, validate the whole, then polish.
- **Design states, not components.** Default, hover, focus, selected, loading, empty, error,
  disabled, stale; one semantic colour language across all of them.
- **Coherence over novelty.** Dense content agrees with compact type, which agrees with tight
  spacing, small radii, fine borders, neutral surfaces, meaningful data colour. Good taste is mostly
  the removal of contradictions.

Priority order: information architecture, viewport geometry, hierarchy, state behaviour, component
design, typography and colour, decoration. Generated interfaces start at the wrong end.

## Working inside an existing product

Restyling is not greenfield. Before changing anything that renders: read the project's design
constitution if it has one (`docs/DESIGN.md`), the audit of what went wrong before, the registry of
primitives, and the neighbouring surface that already does the same job. Grep for the behaviour and
the classes before writing new ones. A feature sits in a screen's rank order and reinforces what is
there; it reuses the colours that already carry state, does not repeat a number already shown, and
takes its neighbours' form. Diverge only for a written reason; mint a primitive only by registering it
and sweeping its siblings in the same change. The worked example is
`E:\claude-projects\cruise-passport` (its `docs/DESIGN.md`, `docs/DESIGN-AUDIT.md` and `tools/qa/`).

## The AI-design tells to avoid

Beyond the heading rules above, the common giveaways of machine-made design: three-across "feature
card" grids with an icon, a bold title, and two lines of grey text, repeated down the page; centred
everything; a gradient on every surface; emoji used as interface icons; identical rounded cards with
no dominant element; generous but meaningless motion. Restraint and a clear dominant element in each
section are the antidote. When in doubt, remove.
