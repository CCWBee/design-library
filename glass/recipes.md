# Glass UI recipes: vanilla, static, file:// safe

Copy-ready implementation recipes for glass surfaces on the web. Every snippet here runs from a single static HTML file opened over `file://` with no build step, no bundler and no CDN. Plain CSS custom properties only, no preprocessor, no JavaScript required for the base effect.

For the reasoning behind these choices (why tint plus blur, why a hairline border, the 4.5:1 contrast floor, per-theme tuning), read `./bible.md`. This file does not restate principles: it turns them into code. Relevant sections there are "Glassmorphism UI principles", "Contrast and accessibility" and "Materials".

Constraints assumed throughout:
- No network. Fonts fall back to a system stack. No remote images behind the glass in the examples; swap in your own local asset.
- `backdrop-filter` is a live GPU filter. Treat it as a limited resource: a few panels, not every surface. See "when CSS is enough" at the foot of this file.
- Tokens are defined once on `:root` and overridden per theme. Never define a colour only inside a media query.

## 1. Canonical glass panel

The base surface: `backdrop-filter` with `blur()` plus `saturate()`, a semi-transparent tint, a 1px hairline border and a two-stop soft shadow. Light and dark are driven entirely by custom properties, so the same `.glass` class serves both.

```html
<article class="glass">
  <h2>Panel title</h2>
  <p>Body text sits on the readability overlay, not on raw blur.</p>
</article>
```

```css
:root {
  color-scheme: light dark;

  /* Glass tokens: light theme defaults */
  --glass-tint: rgba(255, 255, 255, 0.55);
  --glass-blur: 16px;
  --glass-saturate: 180%;
  --glass-border: rgba(255, 255, 255, 0.65);
  --glass-radius: 20px;
  --glass-shadow:
    0 1px 2px rgba(16, 24, 40, 0.08),
    0 12px 32px rgba(16, 24, 40, 0.16);
  --glass-text: rgba(20, 24, 33, 0.92);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --glass-tint: rgba(22, 26, 34, 0.45);
    --glass-border: rgba(255, 255, 255, 0.14);
    --glass-shadow:
      0 1px 2px rgba(0, 0, 0, 0.40),
      0 12px 36px rgba(0, 0, 0, 0.55);
    --glass-text: rgba(240, 243, 248, 0.94);
  }
}

/* Manual toggle wins in both directions */
:root[data-theme="dark"] {
  --glass-tint: rgba(22, 26, 34, 0.45);
  --glass-border: rgba(255, 255, 255, 0.14);
  --glass-shadow:
    0 1px 2px rgba(0, 0, 0, 0.40),
    0 12px 36px rgba(0, 0, 0, 0.55);
  --glass-text: rgba(240, 243, 248, 0.94);
}

.glass {
  color: var(--glass-text);
  background-color: var(--glass-tint);
  border: 1px solid var(--glass-border);
  border-radius: var(--glass-radius);
  box-shadow: var(--glass-shadow);
  padding: 1.5rem;
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
}
```

Notes:
- The `-webkit-` prefix is still required for Safari and must come first. Both properties carry the same value.
- `saturate(180%)` restores the colour the blur washes out, which is what reads as "premium glass" rather than "grey fog". Push it higher over vivid backdrops, lower over neutral ones.
- The shadow is layered on purpose: a tight 1-2px stop grounds the edge, a wide soft stop lifts the panel. One stop alone looks either flat or detached.
- `color-scheme: light dark` lets native form controls and scrollbars match the theme for free.

An optional top highlight sells the glass edge without a second element:

```css
.glass {
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.12),
    rgba(255, 255, 255, 0) 40%
  );
}
```

Keep the highlight subtle. In dark themes drop it to `0.06` or it reads as a seam.

## 2. Readability overlay

Blur alone does not guarantee legible type: a busy or high-contrast backdrop still bleeds through. The fix is a semi-opaque tint film between the glass and the text, at 10-30% opacity, tuned so body text clears 4.5:1 (large text 3:1). This is the single most common failure point, so treat the overlay as mandatory wherever text sits on glass.

Two ways to add it.

Overlay through the panel tint (simplest): raise the alpha on `--glass-tint` itself for any panel that carries text. A content panel needs a heavier film than a purely decorative one.

```css
.glass--content {
  --glass-tint: rgba(255, 255, 255, 0.72); /* light: ~72% film */
}
:root[data-theme="dark"] .glass--content,
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .glass--content {
    --glass-tint: rgba(18, 22, 30, 0.66);
  }
}
```

Overlay as a dedicated layer (when the panel tint must stay light but text must stay crisp): put a scrim directly behind the text run.

```html
<article class="glass">
  <div class="glass-scrim">
    <h2>Readable heading</h2>
    <p>Type sits on the scrim, not on the raw backdrop.</p>
  </div>
</article>
```

```css
.glass-scrim {
  background-color: rgba(255, 255, 255, 0.18); /* 18%: within 10-30% */
  border-radius: calc(var(--glass-radius) - 6px);
  padding: 1rem 1.25rem;
}
:root[data-theme="dark"] .glass-scrim {
  background-color: rgba(0, 0, 0, 0.28);
}
```

Tuning rule, per `./bible.md` "Contrast and accessibility": buy contrast with opacity, not by darkening the backdrop or over-brightening the text. Moving a film from 18% to 26% recovers legibility while keeping the surface soft. Verify against the actual backdrop image, not a flat swatch, because the worst-case region is what fails.

## 3. Capability tiers

`backdrop-filter` is not universal and is expensive on weak GPUs. Detect it and provide an explicit non-blur path. The fallback does not reproduce the optics: it preserves hierarchy with a more opaque tinted surface, so the layout still reads.

```css
/* Tier 1: no backdrop-filter. Opaque-enough tinted surface. */
.glass {
  background-color: var(--glass-fallback);
  border: 1px solid var(--glass-border);
  border-radius: var(--glass-radius);
  box-shadow: var(--glass-shadow);
  color: var(--glass-text);
}

/* Tier 2: backdrop-filter supported. Add the live blur. */
@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass {
    background-color: var(--glass-tint);
    -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
    backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  }
}
```

The fallback token is materially more opaque than the glass tint, so text stays legible with nothing blurring the backdrop:

```css
:root {
  --glass-fallback: rgba(255, 255, 255, 0.90);
}
:root[data-theme="dark"],
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --glass-fallback: rgba(24, 28, 36, 0.92);
  }
}
```

Order matters: declare the fallback as the base rule, then upgrade inside `@supports`. Browsers without support ignore the block and keep the opaque surface. Test the `or` form: Safari historically reported only the prefixed property.

## 4. Reduced transparency and reduced motion

Honour the OS accessibility settings. Under reduced transparency, drop the blur and go near-opaque so nothing shimmers behind text. Under reduced motion, remove transitions and any animated filter or transform.

```css
@media (prefers-reduced-transparency: reduce) {
  .glass {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    background-color: var(--glass-fallback);
  }
  .glass-scrim {
    background-color: transparent; /* film no longer needed on opaque surface */
  }
}

@media (prefers-reduced-motion: reduce) {
  .glass,
  .glass * {
    animation: none !important;
    transition: none !important;
  }
}
```

`prefers-reduced-transparency` support is still partial, so it is a progressive enhancement layered on top of the tiers in section 3, not a replacement for them. The `@supports` fallback remains the floor. Never animate `backdrop-filter` or `filter` on scroll or hover: it forces per-frame recompositing and is the usual cause of jank. If a panel must move, animate `transform` and `opacity` only, and gate even those behind the reduced-motion query.

## 5. When CSS is enough, and when to reach for a shader

CSS `backdrop-filter` is the correct tool for the overwhelming majority of glass UI: panels, modals, toolbars, nav bars, cards, sheets. It is cheap to author, theme-aware, accessible through the queries above, and it runs over `file://` with zero dependencies. Default to it. Reach further only when the brief genuinely needs optical behaviour CSS cannot express.

Stay in CSS when:
- The effect is frosting, tint and depth on rectangular or rounded surfaces.
- The backdrop is a static image, gradient or page content.
- You need light and dark variants and predictable accessibility fallbacks.
- The surface count is small and the panels are mostly still.

Reach for a GPU refraction shader when:
- You need true refraction, lensing, chromatic edges or specular highlights that bend the backdrop, not just blur it.
- The glass must react continuously to pointer, tilt or motion with per-pixel distortion.
- You are rendering a hero or centrepiece where the material itself is the point, and the extra weight is justified.

The shader path costs a canvas, a render loop and a WebGL/WebGPU context, and it needs its own reduced-motion and no-context fallback back to the CSS panel above. Do not pay that cost for ordinary chrome.

Apple's actual Liquid Glass API code is saved verbatim, one listing per file, in `./liquid-glass/apple/` (see its `README.md`): `glassEffect`, `GlassEffectContainer`, morphing, glass buttons. That is native SwiftUI and UIKit, the behaviour reference, not web code. Apple ships no web implementation, so do not reconstruct one from it. If a web Liquid Glass surface is genuinely needed, harvest a real published web implementation into `./liquid-glass/` the same way, literal code referenced locally, rather than rebuilding the wheel.

For the shader route see `../effects/` for the effect library and invoke the `web-shaders` skill for the WebGL/WebGPU implementation, refraction maths and the file:// vendoring pattern. For localised, self-contained worked examples of the CSS recipes on this page, see `../effects/extracts/`.
