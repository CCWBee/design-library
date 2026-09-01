# Register rules: the generative engine

How each register expresses itself, stated per family. This is the finite thing that makes synthesis
work. To build an empty cell, take the family block below, add the type's own specifics, borrow
structure from the nearest filled cell, and apply the taste bar (`../philosophy/taste.md`). The four
registers, once, at the top; then the per-family deltas.

## The four registers, in general

- **Minimal.** Alpha-black ink and fills, not `opacity`. Hairline borders (`rgb(0 0 0 / 10%)`), radii
  6 to 12px, weight 500 labels, hierarchy from size and space. No shadow unless elevation means
  something. The baseline in `../minimal/principles.md`.
- **Glass.** Translucent tint plus `backdrop-filter: blur() saturate()`, a 1px top-edge highlight, a
  soft layered shadow, and a tint that carries text contrast. Always an `@supports` non-blur
  fallback and a `prefers-reduced-transparency` path. Recipes in `../glass/recipes.md`.
- **Tactile.** Measured physical depth: a soft top-light gradient, an inner highlight, a low outer
  shadow, and a pressed state that insets. Honest tactility, never neumorphism's low-contrast
  monochrome. Depth must read the affordance, not decorate.
- **Shader / live.** A GPU or canvas material is the surface. Input drives uniforms (pointer, focus,
  press). Needs a static or reduced-motion fallback frame, and one live element per view is the
  ceiling. Mechanics in the `web-shaders` skill and `../effects/extracts/`.

## 1. Actions

- **Minimal.** Filled solid (primary) or hairline outline (secondary); one filled action per chapter.
  8 to 12px radius, 500 label, hover lifts fill by one alpha rung, focus ring visible.
- **Glass.** Translucent capsule over content, blurred backdrop, faint top highlight, glow on hover.
  Keep the label at full contrast with a tint behind it. See `extracts/glassmorphism-cta.html`.
- **Tactile.** Raised key with a top-light gradient and inner highlight; press insets and darkens.
  Chrome and liquid-metal buttons live here (`extracts/liquid-metal-button.html`).
- **Shader.** The button face is a running material (liquid metal, refraction); hover and press feed
  the shader. Label sits in a legible plate above it.

## 2. Inputs

- **Minimal.** Hairline field on canvas, generous inner padding, label above or floating, focus ring
  replaces or thickens the border. Placeholder at tertiary ink.
- **Glass.** Frosted field over a busy backdrop; the tint provides the contrast the blur removes.
  Icon and caret at reduced ink. Good for search bars over imagery.
- **Tactile.** Inset well: the field looks recessed (inner shadow at top), giving a physical "type
  here" affordance. Use sparingly.
- **Shader.** Reserved for search bars and prompt composers as hero moments: an ambient field behind
  a clear input, or a focus-driven glow. Keep the typing surface itself plain and legible.

## 3. Selection

- **Minimal.** Switch is a track plus knob in alpha-black, on-state uses one accent or solid ink;
  checkbox and radio are hairline to filled on select, motion under 200ms.
- **Glass.** Track and knob translucent with a blurred backdrop, on-state tint brighter. Reads well
  on coloured surfaces.
- **Tactile.** The classic switch: recessed track, raised glossy knob with a shadow that travels as
  it slides. The most convincing tactile cell in the whole set.
- **Shader.** Only slider and switch: a fill that is a running gradient or the knob throwing a small
  particle or glow on toggle. Restraint applies hard here.

## 4. Navigation

- **Minimal.** Text or icon items, active by weight and an alpha-black indicator bar, whitespace not
  borders between groups. Sidebar uses indentation and space, not rules.
- **Glass.** Floating bar or rail over content, blurred so the page reads through it. The canonical
  glass use: iOS-style tab bars and docks. Active pill is a brighter tint.
- **Tactile.** A dock with raised, lightly bevelled tiles; the macOS-dock lineage. Hover lifts.
- **Shader.** Docks and tab bars where the active or hovered item drives a small live effect
  (`extracts/genie-dock`, animated docks). The bar itself stays legible.

## 5. Surfaces

- **Minimal.** A few large chapter containers, separated by space and very light neutral fills
  (`rgb(0 0 0 / 4%)`), one dominant element each. Avoid a wall of identical cards.
- **Glass.** The signature use: a frosted panel or sheet that keeps its backdrop present, hairline
  edge, soft shadow. Modals that dim and blur behind. See `../glass/recipes.md`.
- **Tactile.** A raised card with a subtle top-light and low shadow; use only when elevation encodes
  "this floats above". Not the default.
- **Shader.** A panel or card whose background is a slow ambient field. One per view, content plate
  kept opaque enough to read.

## 6. Feedback and status

- **Minimal.** Toasts and banners as quiet tinted surfaces; badges as small alpha-black pills; state
  colour kept rare so it still means something. Skeletons pulse opacity slowly, never a shimmer sweep.
- **Glass.** Frosted toast or tooltip floating over content; useful when it must sit above imagery.
- **Tactile.** Progress and spinners with a slight raised or grooved track; sparing.
- **Shader.** Progress, spinner, and empty state as live moments: a flowing progress fill, a shader
  loader, an ambient empty-state field (`extracts/uplink-loader`, orbs). Keep it brief.

## 7. Data display

- **Minimal.** Rows separated by space and relative distance, not lines; one hairline rule per
  viewport at most. Numbers right-aligned, tabular figures. This is the default for all data.
- **Glass.** A frosted table or filter bar floating over a designed background; rare, for dashboards
  with a live or image backdrop.
- **Shader.** Only stat and metric tiles: a small live sparkline or field behind a bold number
  (`extracts/data-pixel-arc`, `predictive-arc`, `performance-gauges`).

## 8. Media, hero and background

- **Glass.** A tinted, blurred overlay panel sitting on top of media (the content-over-hero pattern).
- **Shader.** The home register: fullscreen fragment shaders, particle and flow fields, orbs, and 3D
  scenes. This is where most `../effects/extracts/` already live. Pair with a legible content layer
  and a reduced-motion fallback.
- **Minimal / gradient.** A quiet CSS gradient or grain when a shader would be too much; often the
  right restrained choice.

## 9. AI-native

- **Minimal.** The default for chat and agent UIs: quiet cards, clear state, restraint. Approval
  cards, tool chips, and diffs as calm tinted surfaces. Full guidance in `../patterns/ai-native.md`.
- **Glass.** A floating composer or assistant panel over content; the frosted prompt bar.
- **Shader.** Only the affective states: a thinking indicator or streaming shimmer as a small live
  element, an insight card with an ambient field. Motion must read as "working", not decoration.

## 10. Typography

- **Minimal.** Size and space carry hierarchy; three or four styles per screen; measure 55 to 68
  characters; sentence case, never all-caps.
- **Glass.** A heading or wordmark plate that is itself frosted glass over a backdrop.
- **Shader.** Animated headings, kinetic text, and neon or liquid wordmarks
  (`extracts/glassblown-neon`, `typography-vortex`, `text-path-studies`). One per page, and never at
  the cost of reading the body.
