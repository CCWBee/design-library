# Glass Interface Design Bible

Working reference for building glass, liquid-glass, depth, and translucent-material UI. The exhaustive original this distils remains at ./bible-full.md.

Related references:

- GPU-based refraction and liquid-glass shaders (specular highlights, real light-bending, animated distortion) live in ../effects/. See the web-shaders skill before reaching for a shader.
- Restraint and whitespace discipline live in ../minimal/principles.md. Glass fails first from overuse, so read that alongside this.

## Two material models

Glass in interfaces means one of two distinct things. Decide which you are building before you touch a blur value.

**Generic glassmorphism.** A CSS-level visual technique you compose by hand from transparency, background blur, tint, hairline borders, and layering. You own every parameter and every fallback. This is what you build on the web and on any platform without a managed material.

**A framework-managed adaptive material.** A functional material for controls and navigation that the platform renders and adapts automatically in response to content, context, input method, hardware, and system settings. Apple Liquid Glass (iOS/iPadOS/macOS/tvOS/visionOS/watchOS from the 2025 releases) is the reference implementation. You opt in with standard components and the system handles blur, luminosity adaptation, morphing, and accessibility fallbacks. Microsoft Fluent (Windows 11 acrylic/mica) is a second example of the same category.

The practical difference: with generic glassmorphism you must supply the contrast overlay, the reduced-transparency path, and the performance budget yourself. With a managed material you mostly stay out of the way, remove custom backgrounds that would fight the system, and apply the effect sparingly to your own custom controls.

The single most load-bearing rule for either model: **glass belongs to a functional layer of controls and navigation that floats above the content layer. Never put glass in the content layer, and never stack glass on glass.** Glass exists to separate interactive chrome from content and to let content peek through. Using it for content backgrounds, or layering translucent panels on translucent panels, destroys the hierarchy it was meant to create. The one exception is a transient control inside content (a slider or toggle) that takes on a glass appearance only while the user is actively manipulating it.

## Generalise by capability, not by product

Reason about the design in terms of the axes below rather than by device name. Apple hardware radii and point metrics are examples, not universal measurements.

- **Viewport and window class.** Support resizable desktop windows, tablet rotation and split-screen, and narrow phone layouts. As space contracts, reflow columns, stack content, collapse optional navigation, and push low-priority actions into overflow. Do not uniformly scale a desktop layout down into a crowded miniature.
- **Input method.** Hover may reveal supplementary help on pointer devices but no essential action may depend on it. Touch needs generous, well-separated targets. Keyboard users need visible focus, familiar shortcuts, and complete access to every action.
- **Safe areas and chrome.** Consume platform insets for title bars, window controls, display cutouts, and software keyboards. Do not copy one platform's bezel radii onto another.
- **Environment and preference.** Test light and dark appearance, larger text, increased contrast, reduced motion, and reduced transparency. Each of these changes what the material may do.
- **Rendering capability.** Profile live backdrop filters on low-end hardware and always ship a non-blur path.

## Core principles

### Transparency and background blur

The foundation is transparency combined with a background blur, producing a semi-opaque frosted layer through which shapes and colour read but detail does not. Blur intensity and background contrast together decide legibility. Too much blur over a busy background makes text unreadable; too little and the effect collapses into a plain see-through box.

Text legibility is where most glass fails. Blur alone is never enough. Pair the blur with a semi-transparent tint (a white or dark film at 10-30% opacity) that dampens background noise and holds contrast steady across whatever scrolls behind. Robinhood's translucent market widgets and The General Intelligence Company's homepage (heavy blur, low opacity over a loud pixel-art skyline) are worked examples of the blur-plus-tint balance.

### Depth and layering

Glass only reads when there is something behind it. Without a layered environment the effect is just a transparent box. Manage z-order and elevation deliberately: on the web, stack with `z-index` and reinforce with soft shadows or thin semi-transparent borders; on native platforms, elevation or shadow tokens do the same job, making the topmost element feel physically closer. A minor elevation (2-4dp) with a softer shadow when a widget is active sells the layering. Gentle parallax reinforces it: for example, background elements shifting 3px per scroll step against card elements shifting 5px.

### Single, consistent light direction

Keep one light direction across every panel so highlights and shadows align into a coherent scene. A faint near-white rim along the edge facing the light adds realism. Adapt the lighting per theme (see light vs dark below).

### Light, shadow, and colour balance

Three interdependent decisions sell the illusion: where light comes from, how strong the shadow is, and what colour sits behind the glass. The background gives glass its personality. If the product already has a designed or animated backdrop, let it do the storytelling. If the background is flat, introduce a subtle gradient so the glass has variation to refract; glass over a dead-flat fill looks lifeless.

### Minimalism and focus

Glass is a spotlight, not wallpaper. Reserve it for the highest-priority surface (a primary action, a navigation bar, a pinned card) and let secondary elements use plain backgrounds. Reduce clutter behind the panel, since a busy backdrop competes for attention and hurts readability. Limit the palette and iconography around the glass so the effect does the guiding. Rains uses glass only on buttons and the main nav over a muted photographic backdrop, so the eye lands straight on the interactive areas.

### Contrast and accessibility

Transparency and blur both reduce contrast, so strong separation between text, icons, and background is a requirement, not a preference. Keep to the numbers below, match text tone to glass tone (dark text on light glass, light text on dark glass), and raise contrast by increasing the tint opacity rather than by over-darkening the background or over-brightening the text. A 1px text shadow can lift type off the surface.

## Concrete parameters

| Parameter | Value | Notes |
| --- | --- | --- |
| Blur, small controls (buttons, toggles, chips) | 4-8px | Start low; larger values look muddy and cost more |
| Blur, bars, cards, panels | 10-20px | The everyday working range |
| Blur, large overlays over busy media | 20-30px | Busier background needs more blur; 20px+ is GPU-costly, so prefer a pre-blurred image |
| Tint opacity | 10-30% | White film on light glass, dark film on dark glass |
| Legibility lever | 20% to 30% tint | A 10-point opacity bump noticeably improves readability without visibly hardening the glass |
| Border | 1px hairline, semi-transparent | Defines the edge; near-white in light mode, neutral-grey or subtle colour in dark |
| Text shadow | 1px | Optional lift of type off the surface |
| Elevation | 2-4dp | Raise slightly more when active |
| Parallax | background ~3px vs card ~5px per scroll | Only if motion is allowed |
| Contrast (WCAG) | 4.5:1 normal text, 3:1 large text | Large = 18pt, or 14pt bold, and above |
| Corner radius | Concentric with the container | Nested shapes echo the parent's curvature; softer corners read as a real diffused surface |

The three blur ranges above reconcile the source's conflicting advice by element role: small interactive controls stay low, bars and panels sit mid-range, and only large overlays over rich media go high. Do not apply a single universal blur across the whole interface.

## Baseline recipe (generic glassmorphism)

A copy-ready panel that carries the tint film, the hairline, the elevation, the GPU hint, and both theme variants, with the mandatory non-blur fallback. Tune the tokens per element role using the parameter table above.

```css
.glass {
  /* tint film + blur is the effect; the film is not optional */
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.30); /* hairline */
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18); /* elevation */
  transform: translateZ(0); /* nudge onto the GPU */
  color: #1a1a1a; /* dark text on light glass */
}

@media (prefers-color-scheme: dark) {
  .glass {
    background: rgba(28, 28, 32, 0.45); /* darker, higher tint */
    border-color: rgba(255, 255, 255, 0.12); /* neutral, not pure white */
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    color: #f2f2f2; /* light text on dark glass */
  }
}

/* mandatory non-blur fallback */
@supports not (backdrop-filter: blur(10px)) {
  .glass { background: rgba(255, 255, 255, 0.85); }
}
@media (prefers-color-scheme: dark) {
  @supports not (backdrop-filter: blur(10px)) {
    .glass { background: rgba(28, 28, 32, 0.92); }
  }
}

/* honour reduced transparency: drop to a solid, keep hierarchy */
@media (prefers-reduced-transparency: reduce) {
  .glass {
    background: rgba(245, 245, 247, 0.98);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

For real light-bending, specular highlights, or animated refraction rather than this flat blur, do not extend this CSS; use a GPU shader from ../effects/ (see the web-shaders skill).

## Light mode vs dark mode

The same component behaves differently per theme, so design and tune both. Never assume a value that looks right in one mode holds in the other.

**Light mode.** Glass needs stronger boundaries because light-on-light flattens fast. Use pale tints, darker text, and clearer edge definition (a visible hairline border, slightly higher tint opacity). Rim highlights can be near-white. The same blur that looks subtle in dark mode often looks foggy here, so expect to reduce it.

**Dark mode.** Glass needs softer highlights and gentler shadows. A pure-white border glows harshly against dark, so dial opacity back or switch to neutral-grey highlights, or a subtle coloured rim (navy, violet, teal). Use darker or desaturated tints and lighter text.

Even a single-appearance product should define both light and dark colour variants, because a managed adaptive material switches appearance in response to the content behind it regardless of the app's own mode.

## Fallbacks, reduced transparency, and performance

Contrast and legibility must survive when the optical effect is switched off. A fallback succeeds when it preserves hierarchy, contrast, and interaction, even without reproducing the look.

**Non-blur fallback (the mandatory path).** Not every browser or device supports live backdrop blur. Feature-detect and provide a solid-ish tinted background when it is absent:

```css
@supports (backdrop-filter: blur(10px)) {
  .glass {
    backdrop-filter: blur(10px);
  }
}
@supports not (backdrop-filter: blur(10px)) {
  .glass {
    background: rgba(255,255,255,0.85);
  }
}
```

**Reduced transparency.** When the user has requested reduced transparency (or a managed material has stripped translucency), replace the effect with a more opaque tinted surface, stronger separation, clear labels, and non-motion feedback. Hierarchy and state must remain obvious. Managed materials do this automatically for standard components; you must handle it for custom ones and for all generic glassmorphism.

**Reduced motion.** Drop parallax and morphing; keep state changes instantaneous or use a plain fade. Never make motion the only signal of a state change.

**Accessibility floor.** Hold text to WCAG 4.5:1 (normal) and 3:1 (large). Do not rely on colour alone to convey status or interactivity; back it with text or shape. Keep the resting state of content beneath a bar legible even though colourful content may occasionally scroll under it.

**Performance.**

- Blur only where it matters (key cards, modals, navigation), never full-page backgrounds or many overlapping panels.
- Limit simultaneous filters and avoid animating `backdrop-filter`; stacked or animated blur is the usual cause of scroll jank.
- Trigger GPU compositing with `transform: translateZ(0)` on the glass layer; use `will-change` cautiously.
- Prefer a static pre-blurred image behind the panel on low-end devices instead of a runtime filter.
- On a managed material, merge adjacent glass surfaces into one render container so they morph efficiently (Apple: `GlassEffectContainer`).

## Material variants and standard materials

A managed material typically offers two glass variants; generic glassmorphism should mirror the same two intents.

- **Regular / opaque-enough-for-text.** Blurs and adjusts the luminosity of the background to hold legibility. Use it wherever background content could hurt readability, or wherever the surface carries significant text: alerts, sidebars, popovers, most bars. Larger surfaces such as sidebars should read more opaque to stay legible over complex content.
- **Clear / media-overlay.** Highly translucent, for floating controls over photos or video where the media should stay prominent. Add a dimming layer for contrast: over bright content, a dark dimming layer at about 35% opacity; over already-dark content, or where the media player supplies its own dimming, none.

Distinct from glass, **standard materials** (Apple names them ultra-thin, thin, regular, thick) belong in the content layer to create visual separation there, not floating chrome. Thicker and more opaque means better contrast for fine text; thinner and more translucent means the user retains more sense of the content behind. Choose a material by its semantic role, not by the apparent colour it happens to impart, because system settings change that colour. Where a managed material offers vibrancy (system-tuned foreground colours for labels, fills, separators at graded contrast levels), prefer it over hand-picked colours so foreground content stays legible on any material.

## Per-control guidance

### Buttons

- Hit target at least 44x44pt (visionOS example: 60x60pt, with centres 60pt apart).
- Always give a custom button a press state, or it feels unresponsive.
- Reserve the prominent, colour-filled style for the single most likely action; keep prominent buttons to one or two per view.
- Distinguish the preferred option by style, not size; equal-sized buttons read as a coherent set.
- Apply colour to the glass background for emphasis (a primary call to action), not to the label. Over colourful content, prefer a monochromatic label and avoid tinting the label the same hue as the backdrop.
- Roles: normal, primary (default, accent-coloured, answers Return), cancel, destructive (system red). Never give a destructive action the primary role, because visual prominence invites unread taps.
- Prefer rounded or capsule shapes; concentric corners nestle into container corners. A managed material can offer ready-made glass button styles (Apple: `glass`, `glassProminent`); prefer those over hand-rolling the effect.

### Toolbars

- A toolbar acts on the current view; a tab bar navigates between sections. Do not conflate them.
- Choose items deliberately to avoid overcrowding. Let the system collapse overflow (do not add a manual overflow menu, and avoid layouts that overflow by default); add a More menu only for genuinely lower-priority actions.
- Reduce custom backgrounds and tinted controls; let the content layer inform the toolbar's appearance and use a scroll edge effect to separate it from content.
- Group items by function and frequency; keep groups consistent across platforms; aim for at most three groups.
- Represent common actions with standard icons rather than text to declutter, but never mix text and icons across items that share one background. Always give every icon an accessibility label.
- Keep window titles concise (under about 15 characters) and never title a window with the app name.

### Tab bars

- Use for top-level navigation only; keep it visible as the user moves between sections (a modal may cover it).
- Prefer few tabs; avoid overflow into a More tab, which hides content. Do not disable or hide tab buttons when their content is empty; explain the emptiness instead.
- Include short single-word labels beneath or beside icons; prefer filled icons.
- Over bright, colourful content, prefer a monochromatic tab bar or an accent with clear differentiation; do not match label colour to the content-layer background.
- On a floating glass tab bar, content peeks through beneath. The bar may minimise on scroll-down and expand on scroll-up to elevate content (Apple: `TabBarMinimizeBehavior`). A dedicated search tab belongs at the trailing end.

### Sheets

- A sheet is a scoped, mostly-modal task related to the current context. Show one at a time from the main interface; close the first before opening a second.
- Half sheets inset from the display edge so content peeks through beneath; when expanded to full height, transition to a more opaque appearance to hold focus.
- Support resize detents (medium and large). Medium enables progressive disclosure; use full-height-only when the task needs the room (compose views). Include a grabber to signal and cycle resizability, and support swipe-to-dismiss (confirm via an action sheet if there are unsaved changes).
- Pair Done with Cancel (or Back); never rely on Done alone, and avoid showing Cancel, Done, and Back together.
- For prolonged or complex flows prefer a full-screen presentation, a new window, or an immersive space over a sheet.
- Check content clearance around rounded corners, and check what peeks through the inset gap.

### Search fields

- Use placeholder text to state scope. Start searching as the user types where feasible, and offer recent or predictive suggestions. Simplify and prioritise results; consider a scope bar or tokens to filter (tokens are less discoverable, so pair them with suggestions and do not let them replace visible filter UI).
- Placement follows context: a dedicated tab or sidebar item for discovery-led search; a toolbar field (prefer the bottom, within reach, if there is room) for quick access; an inline field next to the content it filters when scope is local. Keep the field resizing with the window, and pin an inline field to the top bar while scrolling.
- Clearly display current scope with placeholder, scope bar, or title. Offer a way to clear search history, since it may be seen by others.

### Menus

- Each item is a command, option, or state. Label with a verb phrase, title-style capitalisation, no articles. Append an ellipsis when the action needs more input first.
- List important items first; group related commands and separate groups with a separator (a line or a gap). Keep logically related commands together even at differing importance.
- Show unavailable items dimmed rather than removed, and keep a menu openable even when all its items are unavailable.
- Use icons sparingly and only standard ones for standard actions; apply icons to all items in a group or none. Every icon still needs an accessibility label.
- Use submenus sparingly, generally one level deep, roughly five items or fewer, preferring a submenu to indentation. Prefer a single toggled item with a changeable label (Show/Hide Map) over two items, adding a verb if the label is ambiguous.
- The managed material applies glass to menus automatically; match a menu's top actions to the equivalent swipe actions for consistency.

### Scroll views and the scroll edge effect

- Support default scrolling gestures, keyboard shortcuts, and elastic behaviour. Make scrollability apparent by letting partial content show at the edge. Do not nest same-orientation scroll views.
- A **scroll edge effect** gives visual separation between floating chrome (toolbars, pinned headers) and the content scrolling beneath, by obscuring that content so controls stay legible. It is not decorative and does not darken like an overlay; use it only where a scroll view sits behind floating elements. Prefer the automatic style (more opaque, safer for busy top bars); test thoroughly if you choose a softer style. Apply one effect per view; in split layouts keep per-pane effects at consistent height. Standard bars adopt this automatically; register custom bars for it (Apple: `safeAreaBar`, `ScrollEdgeEffectStyle`).
- Auto-scroll only as far as needed to keep context (bring a found selection or a hidden insertion point into view). Set sensible zoom min/max.

### Widgets

- Choose one simple idea tied to the app's purpose; show timely, glanceable, dynamic content, not a static logo. Balance density: sparse looks pointless, dense stops being glanceable.
- Offer a size only when it adds value; do not inflate a small widget's content to fill a larger frame.
- Standard margin 16pt; tighter groupings can use 11pt. Coordinate content corner radius with the widget's corner radius. Minimum text 11pt.
- A widget renders in one of three modes depending on placement and user customisation: full-colour; accented (background removed, content split into an accent group and a primary group, each tinted); and vibrant (desaturated, brightness-driven contrast for lock-screen and low-light). Design for all three: convey meaning without relying on a specific colour, and for the vibrant mode use opaque grey values (white or light grey for prominent content, darker grey for secondary) rather than opacities of white.
- Support light and dark appearances with semantic system colours. Keep interactivity simple (a tap opens the app, plus optional buttons and toggles); deep-link to the exact relevant location. Use full-colour images judiciously, since tinted and clear appearances desaturate them by default.
- A glass treatment separates a bright, always-legible foreground from an ambient-reactive background; a paper or print-like treatment lets the whole surface respond to surroundings. Use glass for information-rich widgets where the foreground must stay crisp.

Layered app icons are the same idea applied to branding: solid, overlapping, semi-transparent shapes across a background and one or more foreground layers, with the system supplying highlights, refraction, shadow, and blur. Do not bake those effects in; keep primary content centred against masking; provide light, dark, and tinted variants.

## Typography

- Use weights people can read: prefer Regular, Medium, Semibold, Bold; avoid Ultralight, Thin, Light, especially at small sizes. On glass, legibility pressure is higher, so lean heavier and add a visible backing shape or tint when text sits on a translucent surface.
- Respect per-platform default and minimum sizes:

| Platform (example) | Default | Minimum |
| --- | ---: | ---: |
| iOS, iPadOS | 17pt | 11pt |
| macOS | 13pt | 10pt |
| tvOS | 29pt | 23pt |
| visionOS | 17pt | 12pt |
| watchOS | 16pt | 12pt |

- Convey hierarchy through weight, size, and colour; minimise the number of typefaces. Prefer a system text-style scale so text scales with the user's chosen size and accessibility settings (Dynamic Type). When a larger text size is chosen, prioritise the content the user cares about rather than uniformly enlarging chrome; keep truncation minimal and maintain a stable hierarchy.
- Adapt layout at large sizes: stack inline items above text, and drop columns before letting text truncate or overlap.
- On a spatial platform, keep text facing the viewer (billboarding) and prefer bold over shadow for legibility where there is no surface to cast a real shadow.

## Colour

- Use colour consistently: one meaning per colour. Do not use an interactive-signalling colour to also style non-interactive text.
- Make every colour work in light, dark, and increased-contrast contexts. Prefer system colours (they define these variants already); for custom colours supply light and dark variants plus an increased-contrast option for each. Provide both light and dark even in a single-appearance app, to support adaptive-material switching.
- Prefer semantic, dynamic system colours (defined by role: backgrounds at graded hierarchy, labels, links, separators) over hard-coded values, whose actual numbers drift between releases. Do not repurpose a semantic colour (for example a separator colour used as text).
- **Glass colour.** By default glass has no inherent colour and takes on the colour of the content behind it. Apply colour sparingly and only where emphasis genuinely helps (a status indicator, a primary action). For emphasis, colour the glass background rather than the symbol or text, and colour only one control's background, not many. On small surfaces such as toolbars and tab bars, keep symbols and text monochromatic (darkening over light content, lightening over dark). Larger surfaces read more opaque to stay legible.
- Do not rely on colour alone to communicate; pair it with text or shape. Test under varied lighting and on varied displays; apply colour profiles (sRGB is safe; Display P3 for wide-gamut richness).

## Motion

- Add motion purposefully; gratuitous animation distracts and can cause discomfort. Make motion optional and never the sole carrier of information; supplement with haptics or audio.
- Feedback motion should follow the user's gesture and expectation (a view pulled down from the top dismisses upward, not sideways). Keep feedback brief and precise.
- Avoid animating frequent, routine interactions; let people cancel or interrupt an animation rather than waiting through it, especially on repeat.
- A managed material adds its own motion, moving with more emphasis under direct touch and more subtly under an indirect pointer, and morphing shapes fluidly between states; keep custom animation short (roughly two seconds or less) and out of its way.
- On spatial platforms, avoid motion in peripheral vision, avoid rotating the whole scene, keep large moving objects small or translucent, and avoid sustained oscillation near 0.2Hz.

## Common failure modes

- **Blur without a tint film.** The single most common defect: text over a plain blur has no stable contrast. Always add the 10-30% tint.
- **Glass in the content layer.** Translucent content backgrounds create confusing hierarchy. Glass is for floating chrome only.
- **Glass on glass.** Overlapping translucent panels muddy into fog and wreck legibility and performance.
- **One universal blur.** A value tuned for a hero overlay looks foggy on a small button and vice versa. Tune per role.
- **Same value across themes.** A dark-mode blur looks foggy in light mode; a pure-white border glows in dark mode.
- **No non-blur path.** Unsupported `backdrop-filter` leaves a fully transparent, unreadable panel. Ship the `@supports` fallback.
- **Glass everywhere.** The effect is a spotlight. Used on every surface it stops guiding anything. Reserve it for a few high-value elements.
- **Busy backdrop left as-is.** If the environment behind the glass is loud, calm it (more blur, more tint, or redesign the backdrop) rather than accepting unstable text.
- **Colour matching between control and content layer.** Labels tinted the same hue as the background behind them disappear. Prefer monochromatic labels over colourful content.

## Build checklist

Before shipping a glass surface, confirm every item:

- Glass is on floating chrome, not content, and not stacked on other glass.
- A tint film (10-30%) sits behind any text, tuned to theme.
- Blur value matches the element role (small control, bar, or overlay).
- Light and dark variants are both defined and both tested.
- Contrast meets 4.5:1 (normal text) and 3:1 (large text) in every state that can scroll behind it.
- A non-blur `@supports` fallback and a reduced-transparency path exist.
- Reduced-motion drops parallax and morphing.
- The effect appears on only a few high-value elements, over a backdrop calm enough to keep text stable.

## Sources

- Apple Human Interface Guidelines and "Adopting Liquid Glass" (developer.apple.com), retained as the managed-adaptive-material reference implementation.
- Generic glassmorphism primer from the source corpus (blur, tint, layering, and the shipped examples: Robinhood, Rains, AnyDistance, The General Intelligence Company, Nike After Dark Tour).
