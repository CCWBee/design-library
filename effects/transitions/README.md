# transitions.dev: verbatim UI transitions (the free set)

The 32 free transitions from transitions.dev by Jakub Antalik (https://github.com/Jakubantalik/transitions.dev),
MIT License, one self-contained HTML demo per transition, verbatim apart from the site navigation, footer and page
metadata being removed. Each carries its own CSS and JS and runs over `file://`: 3D tilt, accordion, avatar group
hover, banner stacking, card resize, checkbox check, dropdown menu morph, error shake, icon swap, input clear with
dissolve, like button, matrix dot loader, menu dropdown, modal open/close, notification badge, number pop-in, page
side-by-side, panel reveal, reasoning stream, shimmer text, skeleton loader, spinning counter, streaming text,
success check, tabs sliding, text states swap, texts reveal, thinking states, toast, toggle, tooltip.

`skill/` is the project's own agent skill: `SKILL.md`, `_root.css` (the shared token set), and one numbered
snippet document per transition with the copy-ready `t-*` CSS block and a `prefers-reduced-motion` guard. The
snippet docs are the cleanest source to lift from; the HTML files show each one running.

Not included: the site's 11 Pro transitions (spinner-to-check morph, gooey plus menu, confetti burst, smoky
dissolve, drag and drop with physics, organic shimmer, and others). Their pages in the public repository are
landing stubs with no code; the code is paid. Reference these files for any state change, feedback moment or
micro-interaction rather than re-deriving one; the bar they should meet is in
`../../patterns/interaction-feedback.md`. Harvested 5 September 2026.
