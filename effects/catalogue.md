# ThreeUI effect catalogue

Discoverable index of every effect in the ThreeUI clone. Use it to find the right effect fast, then open the source path listed against it.

## How to read this

The raw mine is the clone at `/e/claude-projects/threeui`. It stays as-is: never edit it, copy out of it. All source paths below are relative to that clone root (so `src/shaders/...` and `public/...`).

Columns:

- Name: the effect. A leading `●` marks the eight effects localised into `./extracts/` this run (self-contained, file://-runnable copies alongside this catalogue).
- Effect: one line on what it looks like.
- Tech: how it renders, read from the source. `WebGL` / `WebGL2` = raw GL via `getContext`; `Three.js` = imports or references `three`; `Canvas2D` = `getContext('2d')`; `CSS` = DOM, CSS and animation only; `SVG` = SVG DOM.
- Self: file:// self-containment. `Clean` = no remote assets or CDN, runs from disk as-is. `Vendorable` = pulls a public CDN library and/or Google Fonts only, no remote media, can be made self-contained by vendoring. `Hard` = references remote Supabase images or video or other remote media that is not redistributed here.

Family folders under `src/shaders/` are the React components used in the app; many also ship a standalone HTML demo (in the folder, in the folder's `sources/`, or in `public/`). Where a family only embeds a standalone demo, the tech shown is the demo's. Demos under `neuform-isolated/sources/` are marketing-hero captures: most reference remote media and read `Hard`, while their motion is usually a self-contained shader or canvas that survives once the media is stubbed.

## Glass and material

| Name | Effect | Tech | Self | Path |
|---|---|---|---|---|
| ● liquid-form | Refractive liquid blob, gooey metaball surface | WebGL | Clean | src/shaders/liquid-form/ |
| ● liquid-metal-button | Chrome liquid-metal button, mercury reflow on hover | WebGL2 | Clean (demo Vendorable, gfont) | src/shaders/liquid-metal-button/ |
| ● glassmorphism-cta | Frosted glass CTA panel, blurred translucent card | CSS | Hard | src/shaders/neuform-isolated/sources/glassmorphism-cta.html |
| ● glassblown-neon | Blown-glass neon lettering, glossy tube glow | Canvas2D | Clean | src/shaders/neuform-isolated/sources/glassblown-neon.html |
| ● condensation | Water condensation on glass, droplets and clearing trails | Canvas2D | Clean | src/shaders/condensation/ |
| crt | CRT screen material, scanlines, curvature and bloom | WebGL | Clean | src/shaders/crt/ |
| nexus-tactile | Tactile fluidic surface, soft rubbery deform | WebGL | Vendorable | src/shaders/neuform-isolated/sources/nexus-tactile.html |
| lumina-weavers-cloth | Kinetic woven cloth, rippling textile sheet | Three.js | Hard | src/shaders/neuform-isolated/sources/lumina-weavers-cloth.html |
| amber-halftone | Amber halftone bento hero, dotted duotone material | Three.js | Hard | src/shaders/neuform-isolated/sources/amber-halftone.html |
| gradient-collection | Grainy animated gradient swatches (grainient) | Canvas2D | Clean | src/shaders/neuform-isolated/sources/gradient-collection.html |

## Orbs and spheres

| Name | Effect | Tech | Self | Path |
|---|---|---|---|---|
| ● orb-working | Thinking orb, working: particles on tilted orbits. From thinking-orbs by Jakub Antalik (MIT), engine ported to extracts/thinking-orbs.js | Canvas2D | Clean | ../thinking-orbs/src/engine/ (separate clone) |
| ● orb-searching | Thinking orb, searching: a scan line sweeping a dotted globe. From thinking-orbs by Jakub Antalik (MIT), engine ported to extracts/thinking-orbs.js | Canvas2D | Clean | ../thinking-orbs/src/engine/ (separate clone) |
| ● orb-solving | Thinking orb, solving: scrambling bands that click into place. From thinking-orbs by Jakub Antalik (MIT), engine ported to extracts/thinking-orbs.js | Canvas2D | Clean | ../thinking-orbs/src/engine/ (separate clone) |
| ● orb-listening | Thinking orb, listening: a waveform rolling through rings. From thinking-orbs by Jakub Antalik (MIT), engine ported to extracts/thinking-orbs.js | Canvas2D | Clean | ../thinking-orbs/src/engine/ (separate clone) |
| ● orb-connecting | Thinking orb, connecting: a constellation wiring itself. From thinking-orbs by Jakub Antalik (MIT), engine ported to extracts/thinking-orbs.js | Canvas2D | Clean | ../thinking-orbs/src/engine/ (separate clone) |
| ● orb-weaving | Thinking orb, weaving: three strands braiding round the sphere. From thinking-orbs by Jakub Antalik (MIT), engine ported to extracts/thinking-orbs.js | Canvas2D | Clean | ../thinking-orbs/src/engine/ (separate clone) |
| ● orb-composing | Thinking orb, composing: an undulating multi-band sash. From thinking-orbs by Jakub Antalik (MIT), engine ported to extracts/thinking-orbs.js | Canvas2D | Clean | ../thinking-orbs/src/engine/ (separate clone) |
| ● orb-breathing | Thinking orb, breathing: a ring slowly morphing. From thinking-orbs by Jakub Antalik (MIT), engine ported to extracts/thinking-orbs.js | Canvas2D | Clean | ../thinking-orbs/src/engine/ (separate clone) |
| ● orb-shaping | Thinking orb, shaping: a dotted outline morphing circle to triangle to square. From thinking-orbs by Jakub Antalik (MIT), engine ported to extracts/thinking-orbs.js | Canvas2D | Clean | ../thinking-orbs/src/engine/ (separate clone) |
| ● orb-all | Thinking orb, all nine thinking-orb states in one grid. From thinking-orbs by Jakub Antalik (MIT), engine ported to extracts/thinking-orbs.js | Canvas2D | Clean | ../thinking-orbs/src/engine/ (separate clone) |
| ● energy-orb | Pulsing energy orb, plasma core with corona | WebGL | Clean | src/shaders/energy-orb/ |
| brand-orbs | Set of thinking-orb marks, soft animated spheres | Canvas2D | Clean (demo Vendorable, gfont) | src/shaders/brand-orbs/ |
| orbital-sphere | Orbiting particles around a sphere | Three.js | Clean | src/shaders/orbital-sphere/ |
| globe | Rotating globe collection, dotted and wireframe earths | Three.js | Clean | src/shaders/globe/ |
| synthesis-orb | Autonomous-systems orb, layered rotating rings | Canvas2D | Hard | src/shaders/neuform-isolated/sources/synthesis-orb.html |
| recursive-erosion | Particle sphere eroding and reforming | WebGL | Clean | src/shaders/neuform-isolated/sources/recursive-erosion.html |
| valence-core | Kinetic induction core, energised nucleus | WebGL | Vendorable (gfont) | src/shaders/neuform-isolated/sources/valence-core.html |
| platform-core | Logic-core hero, glowing central node | Three.js | Vendorable (gfont) | src/shaders/neuform-isolated/sources/platform-core.html |

## Fields, particles and flow

| Name | Effect | Tech | Self | Path |
|---|---|---|---|---|
| ● warp-field | Warp starfield, streaks pulled toward vanishing point | Three.js | Clean | src/shaders/warp-field/ |
| ● aura-ui-fluid | Fluid aura background for a UI builder, flowing colour wash | Three.js | Hard | src/shaders/neuform-isolated/sources/aura-ui-fluid.html |
| bell-field | Field of bell-curve ripples, radial pulses | WebGL | Clean | src/shaders/bell-field/ |
| ribbon-field | Flowing ribbons, waving parallel bands | WebGL | Clean | src/shaders/ribbon-field/ |
| stream-convergence | Streams converging to a focal point | WebGL | Clean | src/shaders/stream-convergence/ |
| structure-flow | Structured lattice with flow through it | Three.js | Clean | src/shaders/structure-flow/ |
| dot-matrix | Animated dot-matrix field, rippling grid of dots | Three.js | Clean | src/shaders/dot-matrix/ |
| constellation-field | Linked constellation dots (app family) | CSS | Clean | src/shaders/constellation-field/ |
| portal-field | Depth portal, tunnel of receding field | Three.js | Clean | src/shaders/portal-field/ |
| laser | Laser beam collection, sweeping bright lines | WebGL | Clean | src/shaders/laser/ |
| hypnotic-loops | Hypnotic loops: lines, dots, rays, type | WebGL2 | Clean | src/shaders/hypnotic-loops/hypnotic-loops.html |
| flow-field | Flow field with particle trails | Canvas2D | Clean | src/shaders/neuform-isolated/sources/flow-field.html |
| particle-drift | Drifting particle compute network | Canvas2D | Vendorable (gfont) | src/shaders/neuform-isolated/sources/particle-drift.html |
| particle-network | Connected particle network, data-intelligence hero | Canvas2D | Hard | src/shaders/neuform-isolated/sources/particle-network.html |
| signal-particles | Signal particles rising, security-intel hero | Canvas2D | Hard | src/shaders/neuform-isolated/sources/signal-particles.html |
| flux-vortex | Quantum flux vortex, swirling particle funnel | Three.js | Vendorable (gfont) | src/shaders/neuform-isolated/sources/flux-vortex.html |
| matrix-field | Quantum matrix-state grid, glitching cells | WebGL | Hard | src/shaders/neuform-isolated/sources/matrix-field.html |
| topo-field | Topographic contour field, NexusNode hero | WebGL | Vendorable | src/shaders/neuform-isolated/sources/topo-field.html |
| void-protocol | Void field, dark rippling plane | WebGL | Vendorable (gfont) | src/shaders/neuform-isolated/sources/void-protocol.html |
| digital-expanse | Expanse particle field, editorial hero | Three.js | Hard | src/shaders/neuform-isolated/sources/digital-expanse.html |
| strata-cloud | Volumetric cloud strata, cloud-migration hero | WebGL | Hard | src/shaders/neuform-isolated/sources/strata-cloud.html |
| gateway-flow | Nexus gateway, flowing conduits to a portal | Canvas2D | Hard | src/shaders/neuform-isolated/sources/gateway-flow.html |
| nexus-unified-flow | Unified-ecosystem flow lines | WebGL | Hard | src/shaders/neuform-isolated/sources/nexus-unified-flow.html |
| nexus-topology | Network topology mesh, connected nodes | Three.js | Vendorable (gfont) | src/shaders/neuform-isolated/sources/nexus-topology.html |
| connectivity-graph | Global connectivity node graph | Canvas2D | Hard | src/shaders/neuform-isolated/sources/connectivity-graph.html |
| interface-lines | System interface line-work, scanning traces | Canvas2D | Hard | src/shaders/neuform-isolated/sources/interface-lines.html |
| defense-lines | Cyber-defence line grid, sweeping shields | Canvas2D | Hard | src/shaders/neuform-isolated/sources/defense-lines.html |
| override-grid | System-override grid glitch | Canvas2D | Hard | src/shaders/neuform-isolated/sources/override-grid.html |
| wireframe-forms | Rotating wireframe forms, systems hero | Canvas2D | Hard | src/shaders/neuform-isolated/sources/wireframe-forms.html |
| imaginie-starfield | Soft starfield, imagination hero | Canvas2D | Hard | src/shaders/neuform-isolated/sources/imaginie-starfield.html |
| julian-vance-nebula | Nebula cloud portrait hero | Three.js | Vendorable (gfont) | src/shaders/neuform-isolated/sources/julian-vance-nebula.html |
| aeonix-ember-storm | Ember-storm particle field in the void | Three.js | Hard | src/shaders/neuform-isolated/sources/aeonix-ember-storm.html |
| aetheris-labs | Lab hero background, drifting shader wash | WebGL | Vendorable (gfont) | src/shaders/neuform-isolated/sources/aetheris-labs.html |
| vertex-9 | Global data field, rotating vertex mesh | Three.js | Vendorable (gfont) | src/shaders/neuform-isolated/sources/vertex-9.html |
| vanguard-dimensional | Dimensional architecture field, layered planes | Three.js | Vendorable (gfont) | src/shaders/neuform-isolated/sources/vanguard-dimensional.html |
| constellation-field (Lumira) | Analytics constellation, linked point cloud | Canvas2D | Hard | src/shaders/neuform-isolated/sources/constellation-field.html |
| portal-field-aeon | AEON portal, depth tunnel hero | Three.js | Vendorable (gfont) | src/shaders/neuform-isolated/sources/portal-field.html |

## Buttons and CTAs

| Name | Effect | Tech | Self | Path |
|---|---|---|---|---|
| circle-buttons | Circular button collection, hover states | CSS | Clean | src/shaders/circle-buttons/ |
| rectangle-buttons | Rectangular button collection, hover states | CSS | Clean | src/shaders/rectangle-buttons/ |
| shader-buttons | Button set with animated fills (DOM/CSS) | CSS | Clean | src/shaders/shader-buttons/ |
| lumen-cta | Nocturne finance CTA, luminous headline block | Three.js | Vendorable (gfont) | src/shaders/lumen-cta/ |
| ignition-terminal | Ignition button, charge-up glow | WebGL | Vendorable (gfont) | src/shaders/neuform-isolated/sources/ignition-terminal.html |
| uploading-button | Uploading button, glowing running border | Canvas2D | Clean | src/shaders/neuform-isolated/sources/uploading-button.html |
| gradient-cta | Gradient CTA block | CSS | Vendorable | src/shaders/neuform-isolated/sources/gradient-cta.html |
| gradient-beam-cta | Gradient CTA with sweeping beam | CSS | Vendorable | src/shaders/neuform-isolated/sources/gradient-beam-cta.html |
| floating-dots-cta | CTA with floating dot particles | CSS | Vendorable | src/shaders/neuform-isolated/sources/floating-dots-cta.html |
| sliding-text-cta | CTA with sliding-label transition | CSS | Vendorable | src/shaders/neuform-isolated/sources/sliding-text-cta.html |
| gradient-pill-button | Pill button, animated gradient fill | CSS | Vendorable | src/shaders/neuform-isolated/sources/gradient-pill-button.html |
| dot-border-button | Button with animated dotted border | CSS | Vendorable | src/shaders/neuform-isolated/sources/dot-border-button.html |
| spinning-border-button | Button with spinning conic border | CSS | Vendorable | src/shaders/neuform-isolated/sources/spinning-border-button.html |
| generate-button | AI generate button, shimmer state | CSS | Vendorable (gfont) | src/shaders/neuform-isolated/sources/generate-button.html |
| launch-button | Launch button, press and lift-off state | CSS | Vendorable | src/shaders/neuform-isolated/sources/launch-button.html |
| skeuomorphic-toggle | Skeuomorphic toggle switch, physical press | CSS | Vendorable | src/shaders/neuform-isolated/sources/skeuomorphic-toggle.html |

## Typography and text

| Name | Effect | Tech | Self | Path |
|---|---|---|---|---|
| typography-vortex | Letters pulled into a vortex | Canvas2D | Clean | src/shaders/typography-vortex/ |
| article-headings | Heading reveal animations, decode and wipe | CSS | Clean | src/shaders/article-headings/ |
| text-path-studies | Text on a path, motion studies | Canvas2D | Clean | src/shaders/text-path-studies/ (sources: text-on-a-path.html, text-on-a-path-ii.html) |
| ● text-on-a-path | Text on a path, study i | Canvas2D | Clean | src/shaders/text-path-studies/sources/text-on-a-path.html |
| ● text-on-a-path-ii | Text on a path, study ii | Canvas2D | Clean | src/shaders/text-path-studies/sources/text-on-a-path-ii.html |
| character-carousel | Per-character carousel, filmstrip and wave | CSS | Clean | src/shaders/character-carousel/ (sources: character-filmstrip.html, character-wave.html) |
| ● character-filmstrip | Character carousel, filmstrip variant | CSS | Clean | src/shaders/character-carousel/sources/character-filmstrip.html |
| ● character-wave | Character carousel, wave variant | CSS | Clean | src/shaders/character-carousel/sources/character-wave.html |
| semantic-bloom | Words blooming from a seed term | Canvas2D | Clean | src/shaders/semantic-bloom/ (sources/design-f0ebbe02-...html) |
| audio-wordmark | Wordmark reacting to audio, radio identity | Canvas2D | Clean | src/shaders/neuform-isolated/sources/audio-wordmark.html |
| kinetic-lathe-certificate | Kinetic lathe-turned certificate type | Canvas2D | Vendorable (gfont) | src/shaders/neuform-isolated/sources/kinetic-lathe-certificate.html |
| creator-studio-intro | Keynote motion-study title sequence | Canvas2D | Clean | src/shaders/neuform-isolated/sources/creator-studio-intro.html |
| epilude-footer | Oversized animated footer wordmark | Canvas2D | Clean | src/shaders/neuform-isolated/sources/epilude-footer.html |

## Scenes and landscapes

| Name | Effect | Tech | Self | Path |
|---|---|---|---|---|
| at-the-horizon | Sun meeting the horizon, gradient sky and water | WebGL | Clean | src/shaders/at-the-horizon/at-the-horizon-we-meet.html |
| emerald-horizon | Emerald aurora over a horizon | Three.js | Clean | src/shaders/emerald-horizon/ |
| landscape | Layered landscape scene, parallax terrain | Canvas2D | Clean | src/shaders/landscape/ (embeds public/landscape.html) |
| japanese-tower | Japanese pagoda towers at dusk | Three.js | Clean | src/shaders/japanese-tower/Towers.html |
| temple-night | Temple at night, lantern-lit scene | Three.js | Clean | src/shaders/temple-night/ |
| bookshelf | 3D bookshelf, browsable spines | Three.js | Clean | src/shaders/bookshelf/ |
| gallery | 3D gallery walkthrough | Three.js | Clean | src/shaders/gallery/ |
| koi-studies | Halftone koi swimming studies | Canvas2D | Clean | src/shaders/koi-studies/ (embeds public/synthralos-halftone.html) |
| sylva-living-world | Living forest world, drifting green depth | Three.js | Clean | src/shaders/sylva-living-world/ (sources/inner-green-3d.html) |
| elements | Elemental marks (water/thunder/fire) and generative tree | WebGL2 / Canvas2D | Clean (marks Vendorable, gfont) | src/shaders/elements/ (sources: elemental-marks.html, generative-tree.html) |
| ● elemental-marks | Elements, elemental marks study | WebGL | Vendorable | src/shaders/elements/sources/elemental-marks.html |
| ● generative-tree | Elements, generative tree study | Canvas2D | Vendorable | src/shaders/elements/sources/generative-tree.html |
| sketchbook | Hand-drawn sketchbook document, ink strokes | SVG | Clean | src/shaders/sketchbook/ |

## Loaders and UI chrome

| Name | Effect | Tech | Self | Path |
|---|---|---|---|---|
| uplink-loader | Uplink sequence loader, terminal boot animation | Canvas2D | Vendorable (gfont) | src/shaders/uplink-loader/uplink-loader.html |
| animated-top-dock | Animated top dock/nav, expanding items | CSS | Clean | src/shaders/animated-top-dock/ |
| genie-dock | Genie-effect dock, windows sucking to the bar | CSS | Clean | src/shaders/genie-dock/ (sources/genie-effect.html) |
| spark-badge | Credential badge in rain, spark shimmer | Canvas2D | Clean | src/shaders/spark-badge/spark-badge.html |
| predictive-arc | Predictive gauge arc, sweeping indicator | Canvas2D | Clean | src/shaders/predictive-arc/ |
| data-pixel-arc | Pixel-arc data readout, animated dial | Canvas2D | Clean | src/shaders/data-pixel-arc/ |
| performance-gauges | Performance diagnostics gauges | CSS | Vendorable | src/shaders/neuform-isolated/sources/performance-gauges.html |
| diagnostics-panel | Network diagnostics panel, live readouts | Canvas2D | Hard | src/shaders/neuform-isolated/sources/diagnostics-panel.html |
| maccess-elements | UI element kit, controls and surfaces | CSS | Clean | src/shaders/maccess-elements/ |
| sections | Page section layouts collection | CSS | Clean | src/shaders/sections/ |
| landing-pages | Full landing-page recipes, embedded via iframe | CSS | Clean | src/shaders/landing-pages/ |
| quantera-trading-background | Trading hero background, ticker motion | Three.js | Vendorable (gfont) | src/shaders/quantera-trading-background/ (sources/quantera-trading-hero.html) |

## Localised extracts

Eight effects are localised into `./extracts/` this run as self-contained, file://-runnable copies (marked `●` above): liquid-form, glassmorphism-cta, glassblown-neon, liquid-metal-button, condensation, energy-orb, aura-ui-fluid, warp-field. Each lives at `./extracts/<name>/`. The clone stays the raw mine; extracts are the working, self-contained copies.

## Licence

ThreeUI code and ThreeUI-authored scene assets are MIT, (c) 2026 Meng To. Remote catalog media (Supabase-hosted images and video) and public CDN libraries are not redistributed here. Bundled fonts are OFL 1.1.

The clone at `/e/claude-projects/threeui` is the raw mine and stays as-is.
