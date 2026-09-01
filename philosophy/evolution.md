# The evolution of interface design, and where it is going

The inferred layer. None of the source material states this arc outright; it is read out of the
sources and out of what shipped over twenty years. The point is not history for its own sake. It is
to know *why* depth, material, and motion have returned, so a design reaches for them where they
carry meaning and leaves them out where they do not. See [`taste.md`](taste.md) for the rules that
follow from this.

## The pendulum: honesty against richness

Every era of screen design has swung between two goods that pull against each other.

- **Honesty to the medium.** A screen is not leather or paper. Design that admits this is lighter,
  faster, scales across sizes, and keeps structure legible.
- **Richness and affordance.** People read depth, texture, and light instinctively. A surface that
  looks raised reads as pressable; one that sits behind another reads as context. Strip all of it
  and the interface becomes honest but mute.

Progress has not been a straight line from ornament to flatness. It has been a swing, and each swing
overcorrected. What is new now is that the tension is being *resolved* rather than swung through, and
the resolution is the whole thesis of this library.

## The eras

The common "Web 1.0 / 2.0 / 3.0" numbering is loose and maps only roughly onto design: the
document web, the application web, and the spatial-and-agentic web. The design movements are the
sharper lens.

**Skeuomorphism (to ~2012, the document and early-app web).** Interfaces imitated physical objects:
stitched leather, felt, linen, glassy buttons with real bevels. It won on affordance. Nobody had to
be taught what a switch or a torn-paper edge did. It lost on scale and honesty: literal metaphors
aged badly, added visual noise, and did not survive the jump to many screen sizes. Depth here was
*faked* to mimic the physical world.

**Flat design (2013 to ~2017).** iOS 7, Material Design, and Metro stripped ornament for clarity.
This was a genuine advance: honest to the medium, performant, consistent at scale, responsive, and
built on system thinking rather than hand-painted screens. Hierarchy came from type, colour, and
space. It lost affordance in the process. When everything is a flat rectangle, nothing announces
that it can be touched, and "is this a button" became a real question again.

**The correction (2018 to ~2020): Material elevation and the neumorphism dead end.** Measured depth
came back to restore affordance without returning to skeuomorphism. Material's elevation and shadow
system did this well. Neumorphism, the soft extruded look, did it badly: it failed contrast and
accessibility and stayed a Dribbble curiosity. But even the failure was a signal. The appetite for
tactility had returned, and flatness alone was not enough.

**Functional depth (2020 to now): glass and the spatial turn.** Big Sur, Fluent, iOS 26 Liquid
Glass, and visionOS brought depth back, but changed what it is *for*. Translucency now shows real
context, what sits behind and how layers stack. Material adapts to the content and light beneath it
rather than being a fixed texture. Motion carries spatial continuity, not decoration. Crucially the
GPU made real-time blur and refraction cheap, so depth can be *computed for real* instead of faked
with a static drop shadow. On spatial platforms depth stops being a metaphor and becomes literal.

**AI-native (2024 onward).** The newest shift is not visual, it is about what the interface now
contains: generated, conversational, streaming, uncertain output produced by an agent. It needs new
primitives that earlier eras never had to design: thinking and streaming states, tool chips, approval
cards, provenance and context surfaces, diffs a human is asked to accept. The design task becomes
making probabilistic, in-progress, agent-driven work legible and trustworthy. See
[`../patterns/ai-native.md`](../patterns/ai-native.md).

## The synthesis, and the advance over flat

The advance over flat Web 1.0 and 2.0 design is not "more effects". It is **depth in service of
meaning, now cheap enough to be real.** The resolution of the honesty-against-richness tension is a
single rule: bring back depth, material, and motion, but only where they *do* something the flat
version could not.

Depth earns its place when it carries one of these:

- **Hierarchy**: what is on top, what is beneath, what is primary.
- **Context**: a translucent layer that lets the ground show through so the user keeps their place.
- **State**: a surface that responds to input, focus, or live data.
- **Affordance**: a surface that reads as pressable, draggable, or dismissible.
- **Spatial continuity**: motion that preserves where a thing came from and went.

Where depth carries none of these, it is the old skeuomorphic mistake in new clothes: decoration
that adds noise and cost. That is why this library puts a restraint baseline first
([`../minimal/principles.md`](../minimal/principles.md)), then adds functional depth and glass
([`../glass/bible.md`](../glass/bible.md)) where it earns its place, and uses the GPU for the real
material ([`../effects/catalogue.md`](../effects/catalogue.md)) rather than faking it. Restraint is
the default; depth is the deliberate exception that has to justify itself.
