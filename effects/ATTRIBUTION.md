# Attribution: localised effects

Every file in `extracts/` is derived from **ThreeUI** by Meng To
(https://github.com/MengTo/threeui), used under the MIT License.

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
