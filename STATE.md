# State

## Where it stands

The library is complete against every source recorded in `sources.md`, indexed by the ontology, browsable
in the local gallery and published (filtered) at https://ccwbee.github.io/design-library/ on every push to
`main`. The four skills (`frontend-design`, `glass-ui`, `web-shaders`, `minimal-ui`) and the
user-invoked `design-review` front door read from it. Last pushed 17 September 2026.

## Open threads

- **Beautiful UI component 21 (Agent Screen).** Announced by Turbo on 14 September 2026 but its registry
  item `https://www.beautifului.dev/r/agent-screen.json` returned 404 that day. Harvest it verbatim into
  `patterns/ai-native/` once it returns 200; never reconstruct it from the compiled site. Detail in
  `sources.md`, "Update 14 September 2026".
- **21st.dev scope.** A community marketplace of thousands of components. Whether to harvest any of it,
  and by what filter, is Charles's call; nothing taken yet.

## Next action

Re-check the Agent Screen registry item; if 200, harvest it and add the row to `patterns/ai-native.md` and
`sources.md`. Otherwise nothing is pending.

## Gotchas

- Never publish `glass/liquid-glass/apple/`, `glass/bible-full.md`, `effects/aceternity/` or
  `ontology/component-gallery/` (all gitignored; licence or ownership). Check `git diff --name-only
  origin/main..HEAD` against that list before every push.
- The Pages build runs `python gallery/serve.py --build`; a scan error there fails the deploy, so run the
  build locally first.
- `gallery/serve.py` is CRLF; edit it with a tool that keeps the line endings.
