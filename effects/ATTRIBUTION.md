# Attribution: localised effects

Most of `extracts/` is derived from **ThreeUI** by Meng To
(https://github.com/MengTo/threeui), used under the MIT License. The exception is the thinking-orbs
set (`thinking-orbs.js`, `orb-*.html`), which comes from a different MIT project and is covered in
its own section below. Every file carries its own attribution header.

## MIT License (ThreeUI)

Copyright (c) 2026 Meng To

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## MIT License (thinking-orbs)

`extracts/thinking-orbs.js` and the ten `orb-*.html` demos are derived from **thinking-orbs** by
Jakub Antalik (https://github.com/Jakubantalik/thinking-orbs), used under the MIT License.

Copyright (c) 2026 Jakub Antalik

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

The port keeps the engine: every geometry and painter function is the upstream body with its types
translated away. It drops the React component and the two theme hooks, replacing them with
`ThinkingOrbs.mount(canvas, options)`, which runs the same shared clock, the same offscreen and
hidden-tab pausing and the same static reduced-motion frame. Parity is not a judgement call: the
port reproduces the upstream `spec/orbs-golden.json` vectors, all 70,115 numbers across nine states,
two tuned sizes and four sample times, within the spec's own tolerance.

## What each extract keeps and drops

Each extract carries a header comment naming the effect, the ThreeUI/MIT attribution, and what was
stripped. In general the extracts keep the genuine effect (shader or canvas code and its mount) and
drop everything the MIT licence does not cover or that breaks offline use:

- **Remote catalog media** (threeui.com thumbnails and preview video, and the Supabase-hosted images
  and video some source scenes reference) is not redistributed by ThreeUI and is not carried here.
- **Public CDN libraries** (Tailwind, GSAP, Iconify, CDN-hosted Three.js) are removed. Where an
  effect genuinely needs Three.js, a bundled Three.js build from the ThreeUI repo is vendored
  locally instead; Three.js is MIT and keeps its upstream header.
- **Bundled fonts** (Fragment Mono, Instrument Serif, Newsreader, Lexend, Onest) are under the SIL
  Open Font License 1.1, not MIT, and are not carried into the extracts. The extracts use a system
  font stack instead.

If an extract is ever published or shipped, keep its header comment intact; MIT requires the
copyright and permission notice to travel with the code.
