# Minimal / Restraint Design Authority

Adapted from [ericzakariasson/scandinavian-design](https://github.com/ericzakariasson/scandinavian-design) (MIT).
Localised to a vanilla web stack (plain HTML/CSS, no framework, no build step) with `file://` previews.

This is the workspace authority for the minimal register: neutral, quiet, structural.
It is not a licence to strip. Simplicity means making the primary task obvious, not deleting context.

See also:
- `../philosophy/taste.md` for when minimal is the right register at all (it is not the only one).
- `../glass/bible.md` for the glass register. Restraint still governs glass: the rules here on
  earning place, spacing, type, and motion apply there too; glass adds material, it does not licence noise.

## Core stance

- Simplicity is not minimalism. Remove what is unnecessary so the primary task becomes obvious,
  but add context, labels, boundaries, or density when they make the interface easier to understand.
- Every element must earn its place. Every spacing, type, colour, radius, and motion choice must be
  defensible in terms of the product, not the style alone. If the only reason for a choice is "it
  looks cleaner", it has not earned its place.
- The two standing bans below are positive rules, not caveats. Follow them by default.

### Heading labels: plain heading or plain small-caps eyebrow

Use a plain heading, or plain small-caps eyebrow text above it. No pill, no badge, no chip around
an eyebrow label, and no leading status or "live" dot in front of a heading. A rounded coloured
capsule with a dot reads as an AI-design tell and is banned here. If you genuinely need a live
status indicator, add one only where state is really being shown, and only when asked for it.

```css
.eyebrow {                 /* correct: plain small-caps eyebrow */
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: none;    /* small-caps via font-variant, not forced uppercase */
  font-variant: small-caps;
  color: rgb(0 0 0 / 44%);
}
/* WRONG: background pill + border-radius + leading ● dot on an eyebrow. Do not produce this. */
```

### No border rule directly beneath a heading

Never place a horizontal border rule directly under a heading. Let whitespace separate the heading
from its content. Before adding any rule anywhere, name what would be genuinely ambiguous without
it; if nothing would be, the rule is decoration and does not go in. A heading followed by an
underline is the single most common violation of this in generated markup.

## Colour and ink

Neutral alpha-black on white. There is no brand hue in the base system; colour arrives only from the
product's own content (see Brand below).

Default palette:

| Role | Value |
| --- | --- |
| Canvas | `#FFFFFF` |
| Primary ink | `#000000` |
| Secondary ink | `rgb(0 0 0 / 64%)` |
| Tertiary ink | `rgb(0 0 0 / 44%)` |
| Border / separator | `rgb(0 0 0 / 10%)` |
| Hover fill | `rgb(0 0 0 / 5%)` |
| Pressed / selected fill | `rgb(0 0 0 / 9%)` |

Opacity hierarchy (what each rung is for):

- 90-100%: primary text, critical icons.
- 60-70%: supporting text.
- 40-50%: metadata, non-essential icons.
- 8-12%: borders, separators.
- 4-6%: hover surfaces.
- 8-10%: pressed or selected surfaces.

Set ink with alpha colours, not the `opacity` property. `opacity` on a container fades every
descendant with it; `opacity` on a leaf multiplies against whatever rung the element already sits
on, so values compound unpredictably. Alpha in the colour value keeps each element on a known rung.

```css
/* correct */
.meta { color: rgb(0 0 0 / 44%); }
/* WRONG */
.meta { color: #000; opacity: 0.44; }
```

Do not replace neutral alpha-black with tinted warm or cool greys. The neutrality is the system.

## Typography

Typeface order: keep an existing well-made sans-serif product face if one is in use; otherwise the
platform system font stack; otherwise Inter (via Google Fonts, with a real fallback stack) for web.
On `file://` previews, always give a full system fallback so the page reads correctly before any web
font loads.

```css
body {
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
```

Sizing and weight:

- Body 16-18px, weight 400, line-height 1.5-1.6.
- Labels and controls weight 500.
- Headings weight 500-600. Avoid 700-900; heavy weights read as shouting in this register.
- Large headings: line-height 1.05-1.15 with slight negative letter-spacing (around -0.01em to -0.02em).

Rules:

- Never all-caps or `text-transform: uppercase` on logos, labels, buttons, nav, badges, or metadata.
  Use sentence case or natural title case. Small-caps via `font-variant` is fine for a plain eyebrow.
- Build hierarchy through size and whitespace, not through many weights.
- Limit each screen to three or four clearly distinct text styles.
- Keep prose measure at 55-68 characters (`max-width: 34rem` to `42rem` for body columns).

## Spacing and structure

8px spacing rhythm, with 4px adjustments where a step of 8 is too coarse. Express it as tokens:

```css
:root {
  --s-1: 4px;  --s-2: 8px;  --s-3: 16px; --s-4: 24px;
  --s-5: 32px; --s-6: 48px; --s-7: 64px; --s-8: 96px;
}
```

Margins:

- Mobile page margin 24px.
- Desktop page margin 40-64px when the system permits.

Section transitions:

- Major section transitions 96-144px on desktop, 64-96px on mobile when density permits.
- Spacing inside a related group stays much tighter than the gap between groups.

Grouping and separation:

- Let whitespace separate sections before reaching for borders or background fills.
- A heading belongs to the content beneath it when the gap above it is roughly three times the gap
  below it. Get that ratio right and no rule is needed to show the join.
- Bind metadata to its record with a small gap; separate records with a much larger one. The eye
  groups on relative distance and needs no line.
- Roughly one chapter rule per viewport reads as structure. The same fourteen rules across one
  document read as a violation.

Radii:

- Corner radii restrained, 6-12px.
- Fully rounded pill buttons are allowed but are not the default.

```css
:root { --r-sm: 6px; --r-md: 8px; --r-lg: 12px; }
```

## Surfaces and components

- Prefer a few large chapter containers over many small cards. A wall of uniform cards with no
  dominant element is a smell.
- Treat adjacent controls as one group: match height, radius, and horizontal extent, and keep the
  gap between them smaller than the gap to anything around them.
- Avoid shadows unless elevation genuinely communicates behaviour. When a shadow is warranted, use a
  barely visible neutral one, not a large blur or a layered stack. No decorative glows.

## Page composition

- Each major chapter carries one clear idea.
- A recurring, reliable structure: concise heading, one short explanation, three or four feature
  summaries, then one dominant product visual as the anchor of the chapter.
- Alternate white and a very light neutral fill (`rgb(0 0 0 / 4%)`) for section rhythm before
  reaching for borders or containers.
- Keep partner or customer logos monochrome and evenly spaced so social proof stays quiet.
- One filled primary action per chapter on a long marketing page is the pattern, not a violation.
  Scope "sparingly" to the viewport, not to the whole document.

## Brand and colour treatment

- A brand mark is not chrome. Keep the product's own logo as it shipped, in full colour, even as
  everything around it goes neutral. Do not desaturate a brand mark to match the palette.
- A signature colour may attach to the product's own primary datum (the gold on a rating, the green
  on a score). Treat that as a brand mark, not a free accent to reuse elsewhere.
- A colour that genuinely encodes state (unread dot, live indicator, error badge) stops working as
  signal once it saturates a whole scanned region. Where a state colour has stopped distinguishing
  anything, let shape and label carry it and take the hue out. State that as a trade, not a free win.

## Interaction and motion

Motion is quiet, immediate, and purposeful. Add it only for feedback, spatial continuity, state
indication, or preventing a jarring change.

- Keep ordinary UI motion under 300ms. Longer only for a rare, explanatory moment.
- Easing: `ease-out` for entrances and exits; `ease-in-out` for movement already on screen; `ease`
  for colour and hover transitions.
- Prefer `transform` and `opacity`. Avoid animating layout properties when a composited alternative
  exists.
- Never animate an entrance from `scale(0)`. Use a subtle `scale(0.96)` with opacity.
- Honour `prefers-reduced-motion`: keep useful colour and opacity feedback, remove unnecessary movement.

```css
.panel { transition: transform 180ms ease-out, opacity 180ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  .panel { transition: opacity 120ms ease; }
}
```

## Operating posture (priority order)

Optimise in this order. When two goals conflict, the earlier one wins.

1. Comprehension and wayfinding.
2. Task completion and accessibility.
3. Information hierarchy and useful density.
4. Brand and semantic meaning.
5. Visual restraint and cohesion.
6. Delight.

Restraint sits at 5. It never overrides comprehension, task completion, or hierarchy. Stripping a
label to look cleaner trades a rank-1 goal for a rank-5 one and is wrong.

## Verification checklist

Run through this before calling a minimal surface done:

1. Primary task and next action are obvious.
2. Navigation answers location, destinations, and exit routes.
3. Grouping follows proximity; controls sit near the elements they affect.
4. Long copy, empty states, loading, and errors do not break the layout.
5. Contrast, keyboard nav, visible focus, touch targets, and semantic states are all accessible.
6. Larger text and narrow screens do not collapse the hierarchy.
7. Nothing is painted twice; matching an existing design means checking existing declarations first.
8. Long pages have deliberate chapter rhythm without repetitive card stacks.
9. The finished state reads as intentional, not as the original with colour removed.
10. Every interactive capability of the original surface is still present and reachable.
11. No pill or dot eyebrow labels; no border rule directly under a heading (the two standing bans).

## Escalation triggers

Correct these on sight:

- Tinted warm or cool greys replacing neutral alpha-black.
- Serif display type, or mixed serif and sans.
- All-caps or `text-transform: uppercase`; all-lowercase nav or labels.
- Emoji used as interface iconography.
- Dividers separating an element from its own caption.
- Excessive rules where whitespace would do the work.
- Decorative gradients, textures, or glows without meaning.
- Large or layered shadows applied for a premium look only.
- Uniform cards with no dominant element.
- Mixed radii, heights, or padding among equivalent controls.
- More type styles than the hierarchy needs.
- Oversized headings crowding out useful density.
- Low-contrast body text or controls.
- Semantic colour stripped from a state indicator that needed it.
- Purposeless motion.
- Pill/badge/chip eyebrow labels or leading status dots on headings.
- A border rule placed directly beneath a heading.

## Remediation order

When fixing an existing surface, work in this order. Do not tune motion before the static hierarchy holds.

1. Repair page flow, hierarchy, wayfinding, grouping, and control-to-content mapping.
2. Restructure layout when composition blocks those goals.
3. Remove ornament, redundant surfaces, and duplicated labels.
4. Normalise spacing, alignment, and density.
5. Normalise typography, measure, tracking, and line height.
6. Consolidate colour, borders, radii, and elevation into shared tokens.
7. Refine controls and their focus, hover, pressed, disabled, and loading states.
8. Add or tune motion only after the static hierarchy works.

## Invocation modes

- Apply (default): redesign the requested surface, including layout and composition when structure
  limits clarity, then run the verification checklist.
- Review: no source edits. Return prioritised findings, proposed changes, and the elements to preserve.
- Prototype: three genuinely different directions with an instant switcher, one shown at full size
  with realistic content.
- Deep: inspect the whole flow, including responsive states, interaction states, accessibility, and
  visual consistency.

## Guardrails (do not)

- Make destructive and neutral actions visually indistinguishable.
- Remove labels or boundaries needed for comprehension.
- Invent primary CTAs on surfaces that never had them.
- Desaturate brand marks to match the palette.
- Replace established product identity unasked.
- Preserve a weak layout solely to minimise a diff.
- Add dependencies when existing components solve the problem.
- Hide advanced functionality for a cleaner screenshot.
- Confuse novelty with refinement.

## The code

The source system's own code is kept verbatim in `./scandinavian/` (see its `README.md`): 18 demo
restyle themes that show these rules applied to real, dense product surfaces, and the 11 verification
scripts (density, rule counting, tint detection, the evaluation runner) that make the checklist above
mechanical. Reference those files rather than re-deriving a theme or a check from this prose.
