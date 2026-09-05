# Beautiful UI — attribution and provenance

The `.tsx` files in this directory are the **real, published component source** from
**Beautiful UI** (https://www.beautifului.dev/), a library of copy-paste AI-native interface
components built by the studio **Turbo** (https://turbodesign.co/). Author: Shane Levine.

Harvested 31 August 2026 from the server-rendered page source (the code ships inline in the
site's React payload, one file per component, each with a copy button). Nothing here is inferred
or reconstructed; every file is a verbatim copy of the published source.

## Licence

**MIT License, Copyright (c) 2026 Shane Levine.** Full text in `./LICENSE`. The MIT terms permit
use, copying, and modification provided the copyright and permission notice travel with copies or
substantial portions. Keep `LICENSE` alongside these files if they are moved or reused.

## What these are, and are not

These are **React (TSX) + Tailwind** components, not vanilla drop-ins. They assume:

- **Tailwind** with the source's custom design tokens (`bg-surface`, `text-ink` / `text-ink-2` /
  `text-ink-3`, `shadow-hairline`, `rounded-card`, `bg-hover`, `bg-line`, `text-green`, `text-red`,
  and CSS variables such as `var(--accent-ink)`). Without that token layer the classes are inert.
- External packages beyond `react` / `react-dom`: **`liveline`** (charting, used by insight-cards),
  **`glimm`** (used by prompt-bar), **`iconoir-react`** (icons, used by selection-actions).
- The studio's own internal building blocks, which are **not published on the page** and are therefore
  **not included here**: `@/components/atoms/*` (`Button`, `EntityChip`, `ValuePill`, `Shimmer`,
  `StreamText`) and `@/components/primitives/GlideMenu`. Components importing these will not compile
  as-is; treat them as reference/adaptation material.

So: reference and adaptation source, not a drop-in for a vanilla or dependency-free project. The
matching vanilla, dependency-free sketches live in `../ai-native.md`.

## Files, retrieval URLs, and dependencies

Every component's code is on the homepage; the URL is the homepage plus the component's anchor.

| File | Pattern | Retrieval URL | External deps | Unpublished internals needed |
| --- | --- | --- | --- | --- |
| `loading-state.tsx` | Loading State | https://www.beautifului.dev/#loading-state | react | — |
| `thinking-state.tsx` | Thinking | https://www.beautifului.dev/#thinking-state | react | — |
| `streaming-text.tsx` | Streaming Text | https://www.beautifului.dev/#streaming-text | react | — |
| `approval-card.tsx` | Approval Card | https://www.beautifului.dev/#approval-card | react | Button, GlideMenu |
| `tool-chips.tsx` | Tool Chips | https://www.beautifului.dev/#tool-chips | react, react-dom | — |
| `task-rows.tsx` | Task Rows | https://www.beautifului.dev/#task-rows | react | — |
| `chat-composer.tsx` | Chat Composer | https://www.beautifului.dev/#chat-composer | react | — |
| `prompt-bar.tsx` | Prompt Bar | https://www.beautifului.dev/#prompt-bar | react, glimm | — |
| `recommendation-card.tsx` | Recommendation Card | https://www.beautifului.dev/#recommendation-card | react | Button, EntityChip, ValuePill |
| `context-cards.tsx` | Context Cards | https://www.beautifului.dev/#context-cards | react | — |
| `diff-table.tsx` | Diff Table | https://www.beautifului.dev/#diff-table | react | Button |
| `records-table.tsx` | Records Table | https://www.beautifului.dev/#records-table | react | GlideMenu |
| `filter-table.tsx` | Filter Table | https://www.beautifului.dev/#filter-table | react | — |
| `sidebar-nav.tsx` | Sidebar Nav | https://www.beautifului.dev/#sidebar-nav | react, react-dom | GlideMenu |
| `search.tsx` | Search (export `SearchList`) | https://www.beautifului.dev/#search | react | GlideMenu |
| `flowchart.tsx` | Flowchart | https://www.beautifului.dev/#flowchart | react | — |
| `insight-cards.tsx` | Insight Cards | https://www.beautifului.dev/#insight-cards | react, liveline | — |
| `code-block.tsx` | Code Block | https://www.beautifului.dev/#code-block | react | — |
| `fine-tune-card.tsx` | Fine-tune Card | https://www.beautifului.dev/#fine-tune-card | react | GlideMenu |
| `selection-actions.tsx` | Selection Actions | https://www.beautifului.dev/#selection-actions | react, iconoir-react | Button, Shimmer, StreamText |

## Primitives (added 5 September 2026)

The six UI primitives the components import, plus the foundation stylesheet, were harvested verbatim
from the public shadcn registry (`https://www.beautifului.dev/r/<name>.json`) into `./primitives/`:
`foundation.css`, `Button.tsx`, `GlideMenu.tsx`, `EntityChip.tsx`, `ValuePill.tsx`, `Shimmer.tsx`,
`StreamText.tsx`. With these the 27-item registry is captured in full. Same MIT licence as the
components; see `./LICENSE`.
