# Interaction feedback

The polish bar for how a control answers when touched. Beautiful UI (`ai-native.md`) sets the visual
and motion standard; this file holds the standard itself and extends it to the sensory layers and to
plain controls, not only AI surfaces. The point Charles made: even simple things, a toggle, a tick, a
tab switch, earn a considered layered response, and that response is what separates a shipped feel
from a wired-up one.

Restraint still governs (`../philosophy/taste.md`): every layer of feedback maps to a real event, a
state change, a completion, an error, never to decoration. A control that lights up for no reason is
noise, not polish.

## The feedback stack

Build feedback in layers, each a progressive enhancement on the one below. The visual layer is the
floor: it always stands alone, and the richer layers only add to it. This ordering is what keeps the
feel intact when a platform withholds a layer.

1. **Visual, the floor, always present.** Every interaction changes something visible: a press that
   scales or depresses, a hover, a focus ring, an active tint, a loading skeleton, a success or error
   mark. Give even the plainest control a deliberate press state rather than the browser default.
   Composited `transform`/`opacity`, under 300ms, and collapsed to a minimal state under
   `prefers-reduced-motion`. This layer carries the whole feel on its own.

2. **Spatial, where depth carries meaning.** The element behaves as a material: layering, a shadow
   that answers the press, content that settles rather than snaps. Reach for `glass/` and the spring
   easings here. Warranted when the motion communicates hierarchy or continuity, skipped when it does
   not.

3. **Haptic, progressive enhancement, platform-permitting.** `navigator.vibrate()` on a genuine
   touch gesture, kept short. **iOS Safari has never supported the Vibration API, and iOS web has no
   general haptics API**, so on iPhone, the primary target for this workspace's apps, web haptics will
   not fire at all. Layer it strictly on top of visual feedback that already reads without it, fire it
   only from real user gestures, and never let a feature depend on it. Android Chrome is where it
   lands.

4. **Sound, opt-in only.** Behind an explicit user setting, off by default, with a mute always in
   reach. Keep cues short, quiet, and tied to a real event. iOS blocks audio without a prior user
   gesture, which matches the rule: never autoplay, never a sound the user did not switch on.

## The bar in one line

Visual feedback on every interaction, considered even on simple controls; spatial where depth means
something; haptic and sound as enhancements that the visual floor never relies on. Feedback is never
the only signal: pair colour with text or shape, and motion with a state, so a viewer who cannot see a
layer still gets the message.
