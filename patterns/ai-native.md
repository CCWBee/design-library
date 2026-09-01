# AI-native interface patterns

This file is expandable: it is seeded from one source and grows as more AI-native references are added. Seeded from Beautiful UI (https://www.beautifului.dev/), by the studio Turbo (Shane Levine).

Beautiful UI ships its source two ways (MIT, Copyright (c) 2026 Shane Levine), and they serve different targets.

**Registry (the drop-in).** Every pattern is a shadcn registry item at `https://www.beautifului.dev/r/<name>.json`, installed with `npx shadcn add <url>`. Each item declares its full `registryDependencies`, so the install resolves the whole tree the page never showed: `foundation.json` (the shared tokens and keyframes the components assume: `--ink`, `--surface`, `--shadow-*`, `--radius-*`, and `shimmer-text`, `pop-in`, `pixel-on`, `fade-up`, and the rest) and the studio's own atoms as their own items (`button.json`, `glide-menu.json`, and so on). On a React + Tailwind + shadcn target this is a real drop-in, dependencies and all, so prefer installing it to reimplementing the look. Verified Aug 2026 on `loading-state`, `foundation`, and `approval-card` (which pulls `foundation` + `button` + `glide-menu`); treat `shadcn add` as the published path rather than smoke-testing it here.

**Harvest (the reference).** The verbatim component source is also mirrored into `./ai-native/` (one `.tsx` per pattern, plus `LICENSE` and `ATTRIBUTION.md`), for reading and adapting with no network and no CLI. It is component source only: the atoms (`Button`, `GlideMenu`, `EntityChip`) and the `foundation` tokens the files import live in the registry, not the mirror, so a file read in isolation shows unresolved imports. Resolve them from the registry when installing, or supply your own when adapting. On a vanilla, non-Tailwind, or non-shadcn project (most of this workspace, cruise-passport included), adapt the source or the vanilla sketches below; `shadcn add` does not apply there.

The source carries motion and state, not sound or haptics: no audio or vibration code ships in any pattern. Treat sensory polish (layered feedback, haptics, sound) as a bar to build to, per `interaction-feedback.md`, not something these bring for free.

The layers, then: registry to install, harvest to read, vanilla sketches below to adapt dependency-free. Where a pattern already carried an inferred sketch it is kept and marked as the vanilla adaptation; patterns without one carry the real-code reference alone. See `./ai-native/ATTRIBUTION.md` for the per-component URL, dependencies, and licence.

Read `../philosophy/taste.md` for when AI-native depth and motion are warranted rather than decorative, and `../minimal/principles.md` for the restraint baseline these patterns sit on. Nothing here overrides that baseline: an AI surface earns extra state, motion, and affordance because the underlying process is genuinely uncertain and long-running, not because the surface is a chat. Where a plain control would do, use the plain control.

Conventions used in the sketches: tokens follow the minimal palette (`--ink`, `--ink-2`, `--border`, `--surface`, alpha-black borders and fills, no tinted greys). All motion is transform/opacity, under 300ms, and gated behind `prefers-reduced-motion`. Every async pattern specifies five states: loading, empty, error, streaming, partial. Treat "streaming" and "partial" as first-class, not as a loading variant: streaming is content arriving token by token; partial is a structured result where some fields have resolved and others have not.

---

## Loading & State

### Loading State

Real code: `./ai-native/loading-state.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#loading-state). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: the placeholder shown between request and first byte, when you know the shape of what is coming but have no content yet. For AI, this window is long and variable (hundreds of ms to seconds), so a bare spinner reads as a hang.

When to use: any request where first content is more than ~400ms away and you can predict the layout. Prefer a skeleton that mirrors the real result's shape over a centred spinner; the shape itself is information and reduces layout shift on arrival.

State considerations:
- Loading: skeleton matching final layout; animate with a slow opacity pulse, not a sweeping shimmer (shimmer is the AI-design tell of the moment).
- Empty: if the request legitimately returns nothing, swap to an empty state with a next action, never leave the skeleton up.
- Error: replace the skeleton in place with an inline error and a retry; do not collapse the region to zero height (that jumps the page).
- Streaming/partial: dissolve skeleton lines as their real counterparts arrive, top-down, rather than all at once.

Vanilla adaptation (inferred, dependency-free):

```html
<div class="skel" aria-busy="true" aria-live="polite">
  <div class="skel-line" style="width:70%"></div>
  <div class="skel-line" style="width:92%"></div>
  <div class="skel-line" style="width:40%"></div>
</div>
<style>
  .skel-line{height:.9rem;margin:.55rem 0;border-radius:6px;
    background:rgb(0 0 0 / 8%);animation:skel 1.4s ease-in-out infinite}
  @keyframes skel{0%,100%{opacity:.55}50%{opacity:1}}
  @media (prefers-reduced-motion:reduce){.skel-line{animation:none;opacity:.7}}
</style>
```

### Thinking

Real code: `./ai-native/thinking-state.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#thinking-state). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: an indicator that the model is reasoning before it produces the answer, distinct from network loading. It signals "work is happening you cannot see yet", and optionally exposes a summary of that work (a reasoning trace, tool planning, retrieval steps).

When to use: agentic or reasoning-model flows where the gap before output is filled by real internal work. Do not use it as decoration on a fast call; a fake think-pause erodes trust.

Key interaction: keep it dismissible and collapsible. If you surface a reasoning trace, treat it as untrusted, low-emphasis text (`--ink-2`), never as the answer. Collapse it by default once the answer starts streaming.

State considerations:
- Loading: animated ellipsis or a single quiet dot cadence, plus optional rotating status line ("Reading files", "Planning edits").
- Streaming: status lines append; keep only the last few visible, scroll or fade older ones.
- Error: if reasoning fails before output, show the error where the answer would go, not buried in the trace.
- Partial: if some tools have returned and reasoning continues, show completed steps as settled and the current one as active.

Vanilla adaptation (inferred, dependency-free):

```html
<div class="think" aria-live="polite">
  <span class="think-dot"></span>
  <span class="think-label">Thinking</span>
</div>
<style>
  .think{display:inline-flex;gap:.5rem;align-items:center;color:var(--ink-2)}
  .think-dot{width:.5rem;height:.5rem;border-radius:50%;
    background:currentColor;animation:pulse 1.1s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
  @media (prefers-reduced-motion:reduce){.think-dot{animation:none;opacity:.7}}
</style>
```

### Streaming Text

Real code: `./ai-native/streaming-text.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#streaming-text). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: model output rendered incrementally as tokens arrive. The defining AI-native display pattern.

When to use: any generative text response. Streaming is the default; a response that appears all at once after a long wait feels slower even when it is not.

Key interaction and state considerations:
- Append text nodes; do not re-render the whole block per token (it thrashes layout and breaks text selection).
- Show a caret at the tail while streaming; remove it on completion.
- Auto-scroll to follow the tail only while the user is already at the bottom. If they have scrolled up to read, do not yank them down; show a "jump to latest" affordance instead.
- Markdown/code that arrives mid-token will be malformed; render progressively but re-parse on safe boundaries (line breaks, fence close) rather than every chunk.
- Loading: precede with Thinking or a skeleton. Empty: a completed stream with no content is an error, treat it as one. Error mid-stream: keep the text received, append an inline error and retry that continues rather than restarts where possible. Partial: on cancel, keep what streamed and mark it stopped.

Vanilla adaptation (inferred, dependency-free):

```html
<p class="stream" aria-live="polite"></p>
<style>
  .stream::after{content:"";display:inline-block;width:.5ch;height:1em;
    margin-left:1px;background:var(--ink);vertical-align:text-bottom;
    animation:caret 1s step-end infinite}
  .stream.done::after{display:none}
  @keyframes caret{50%{opacity:0}}
</style>
<script>
  const el = document.querySelector('.stream');
  const stick = () => (window.innerHeight + window.scrollY) >=
    (document.body.offsetHeight - 24);
  function push(chunk){
    const atBottom = stick();
    el.appendChild(document.createTextNode(chunk));
    if (atBottom) el.scrollIntoView({block:'end'});
  }
  // push(chunk) per token; el.classList.add('done') at end
</script>
```

---

## User Interaction

### Approval Card

Real code: `./ai-native/approval-card.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#approval-card). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: a card that pauses an agent to request human confirmation before a consequential action (running a command, sending an email, spending, writing to a system of record). The human-in-the-loop gate.

When to use: any irreversible, costly, or externally visible action taken on the user's behalf. Scope the gate to genuine consequence; gating harmless reads trains users to click through.

Key interaction: show exactly what will happen, in reviewable form (the command, the recipient, the diff, the amount). Two clear actions, approve and reject, visually distinct by weight and never by colour alone. Default focus on the safer action. Support a keyboard path (Enter/Esc) and, where warranted, "approve and don't ask again for this kind".

State considerations:
- Pending: the resting state; the agent is blocked and this card owns the turn.
- Executing: after approval, show progress in place; disable both buttons.
- Success/error: resolve the card into its outcome inline; on error show what failed and offer retry.
- Empty/partial: if the action's parameters are still resolving, keep the card disabled with a Thinking indicator rather than presenting an approvable action that might still change.

Vanilla adaptation (inferred, dependency-free):

```html
<div class="approval" role="group" aria-label="Confirm action">
  <p class="approval-what">Run <code>rm -rf ./build</code> in <code>web/</code></p>
  <div class="approval-actions">
    <button class="btn-ghost" data-act="reject">Reject</button>
    <button class="btn-solid" data-act="approve" autofocus>Approve</button>
  </div>
</div>
<style>
  .approval{border:1px solid var(--border);border-radius:10px;padding:1rem}
  .approval-actions{display:flex;gap:.5rem;justify-content:flex-end;margin-top:.9rem}
  .btn-solid{background:var(--ink);color:var(--surface);border:0}
  .btn-ghost{background:transparent;border:1px solid var(--border)}
  .btn-solid,.btn-ghost{border-radius:8px;padding:.5rem .9rem;font-weight:500}
</style>
```

### Tool Chips

Real code: `./ai-native/tool-chips.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#tool-chips). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: compact inline tokens showing which tools the agent called and their status (search, read file, run, fetch). They make the agent's actions legible without a full log.

When to use: agent flows where the user benefits from seeing what happened, not just the final answer. Keep them small and secondary to the output.

Key interaction: each chip expands to its call detail (arguments, result, duration) on click. Collapsed by default. An icon or short verb plus target reads faster than the raw tool name.

State considerations:
- Running: quiet spinner or pulse on the active chip.
- Success: settled, low-emphasis.
- Error: mark the failed chip distinctly (shape and label, not colour alone) and let it expand to the error.
- Streaming/partial: chips appear as calls start and update in place as they resolve; never reorder settled chips.

Vanilla adaptation (inferred, dependency-free):

```html
<span class="chip" data-state="ok">
  <span class="chip-verb">Read</span>
  <span class="chip-arg">config.ts</span>
</span>
<style>
  .chip{display:inline-flex;gap:.4rem;align-items:center;font-size:.82rem;
    padding:.15rem .5rem;border:1px solid var(--border);border-radius:999px;
    color:var(--ink-2)}
  .chip-verb{font-weight:500;color:var(--ink)}
  .chip[data-state="run"]{animation:pulse 1.1s ease-in-out infinite}
</style>
```

### Chat Composer

Real code: `./ai-native/chat-composer.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#chat-composer). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: the multi-line input where the user writes to the model. More than a text field: it holds attachments, model/mode selectors, a send/stop toggle, and grows with content.

When to use: the primary input of any conversational surface.

Key interaction:
- Auto-grow to a max height, then scroll internally.
- Enter sends, Shift+Enter newlines (make this discoverable; it is the single most common friction point). On touch, Enter should newline and a send button sends.
- The send button becomes a stop button while a response streams; stopping is a first-class action, not hidden.
- Disable send on empty/whitespace-only input.

State considerations:
- Idle: send enabled only with content.
- Sending/streaming: toggle to stop; keep the field editable so the user can draft the next message.
- Error: keep the user's text; never clear the composer on a failed send.
- Empty: a single quiet placeholder line, not a wall of suggestion chips unless the product is genuinely cold-start.

Vanilla adaptation (inferred, dependency-free):

```html
<form class="composer">
  <textarea rows="1" placeholder="Message" aria-label="Message"></textarea>
  <button type="submit" data-mode="send" aria-label="Send">Send</button>
</form>
<style>
  .composer{display:flex;gap:.5rem;align-items:end;border:1px solid var(--border);
    border-radius:12px;padding:.5rem}
  .composer textarea{flex:1;border:0;resize:none;outline:none;max-height:12rem;
    font:inherit;background:transparent}
  .composer button[data-mode="stop"]{background:transparent;border:1px solid var(--border)}
</style>
<script>
  const f=document.querySelector('.composer'), t=f.querySelector('textarea'),
        b=f.querySelector('button');
  t.addEventListener('input',()=>{t.style.height='auto';
    t.style.height=t.scrollHeight+'px'; b.disabled=!t.value.trim();});
  t.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();f.requestSubmit();}});
</script>
```

### Prompt Bar

Real code: `./ai-native/prompt-bar.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#prompt-bar). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: a compact, often centred single-purpose input, typically the cold-start entry point ("What do you want to do?") or a command palette style launcher. Distinct from the Chat Composer: it opens a task rather than continuing a conversation.

When to use: landing/empty states, command palettes, and single-shot query surfaces. Where the interaction becomes a conversation, promote it into a Chat Composer rather than stretching the prompt bar.

Key interaction: strong focus affordance, optional example prompts beneath, and often a keyboard shortcut to summon it (`/` or `Cmd/Ctrl+K`). One field, one clear submit.

State considerations:
- Empty: the resting state; examples or recent prompts as low-emphasis suggestions.
- Loading: on submit, hand off to Thinking/Loading in the destination surface rather than spinning inside the bar.
- Error: inline beneath the bar; keep the text.

---

## Data Display

### Task Rows

Real code: `./ai-native/task-rows.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#task-rows). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: a vertical list of discrete units of agent work, each row a task or step with its own status. The backbone of an agent progress view or plan.

When to use: multi-step agent runs, plans, checklists, background jobs. Rows over cards: the eye scans a list faster and density stays high.

Key interaction: each row shows a status glyph, a label, and optional detail on expand. Order is meaningful (execution order or priority); do not reorder settled rows.

State considerations:
- Pending: quiet, dimmed (`--ink-2`).
- Active: one row emphasised with a running indicator.
- Done: settled with a check; keep it visible, do not remove completed work.
- Error: the failed row marked and expandable to its cause, with retry scoped to that row.
- Partial: a run stopped mid-way reads as some-done, some-pending, none-lost.

Vanilla adaptation (inferred, dependency-free):

```html
<ul class="tasks">
  <li class="task" data-state="done"><span class="task-mark"></span>Clone repository</li>
  <li class="task" data-state="run"><span class="task-mark"></span>Install dependencies</li>
  <li class="task" data-state="pending"><span class="task-mark"></span>Run tests</li>
</ul>
<style>
  .tasks{list-style:none;margin:0;padding:0}
  .task{display:flex;gap:.6rem;align-items:center;padding:.5rem 0;
    border-top:1px solid var(--border)}
  .task:first-child{border-top:0}
  .task-mark{width:.7rem;height:.7rem;border-radius:50%;border:1.5px solid var(--ink-2)}
  .task[data-state="done"] .task-mark{background:var(--ink);border-color:var(--ink)}
  .task[data-state="run"] .task-mark{animation:pulse 1.1s ease-in-out infinite}
  .task[data-state="pending"]{color:var(--ink-2)}
</style>
```

### Records Table

Real code: `./ai-native/records-table.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#records-table). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: a dense tabular view of structured records the model produced or retrieved (extracted entities, search hits, generated rows). Read/browse oriented.

When to use: when the result is inherently rows and columns and the user needs to scan, sort, or compare. Do not force prose into a table or a table into cards.

Key interaction: sticky header, sortable columns, row selection where actions follow (see Selection Actions). Right-align numerics; keep column widths stable as rows stream in.

State considerations:
- Loading: skeleton rows matching column count.
- Empty: a single explanatory row with the reason and a next action.
- Error: keep the header, show the error in the body region.
- Streaming/partial: append rows as they arrive; if a cell is still resolving, show a per-cell placeholder rather than blocking the whole row. Never let column widths jump per new row.

### Diff Table

Real code: `./ai-native/diff-table.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#diff-table). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: a before/after comparison of structured or textual data, the review surface for anything the agent proposes to change (file edits, record updates, config changes).

When to use: any agent-proposed change the user should review before it applies. Pairs naturally with an Approval Card.

Key interaction: added, removed, and unchanged lines distinguished by sign and background weight, not colour alone (accessibility, and it must survive greyscale). Side-by-side for wide screens, unified/inline for narrow. Let the user collapse unchanged regions.

State considerations:
- Loading: skeleton over the diff region.
- Empty: "no changes" is a valid, informative state; say it plainly.
- Partial: for a multi-file change, show per-file diff status; a file still computing shows a placeholder, resolved files are reviewable immediately.
- Error: if a hunk fails to apply later, reflect that against the specific hunk.

Vanilla adaptation (inferred, dependency-free):

```html
<table class="diff">
  <tr class="d-ctx"><td class="d-gutter">12</td><td>const timeout = 30</td></tr>
  <tr class="d-del"><td class="d-gutter">-</td><td>const retries = 1</td></tr>
  <tr class="d-add"><td class="d-gutter">+</td><td>const retries = 3</td></tr>
</table>
<style>
  .diff{width:100%;border-collapse:collapse;font-family:ui-monospace,monospace;
    font-size:.85rem}
  .diff td{padding:.1rem .6rem;white-space:pre}
  .d-gutter{color:var(--ink-2);text-align:right;user-select:none;width:2.5rem}
  .d-add{background:rgb(0 0 0 / 4%)}
  .d-add .d-gutter::before,.d-add td:last-child{font-weight:500}
  .d-del{background:rgb(0 0 0 / 7%);text-decoration:line-through;color:var(--ink-2)}
</style>
```

### Filter Table

Real code: `./ai-native/filter-table.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#filter-table). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: a Records Table with a controls row for filtering, faceting, and search. Often the model both populates the rows and offers the filters (facets derived from the data, or natural-language filtering).

When to use: result sets large enough that scanning alone fails. Below ~15 rows, filters are noise.

Key interaction: filters apply live and are removable individually (chips of active filters). Preserve selection and scroll where filtering does not remove the selected rows. Where the model drives filtering from natural language, echo the interpreted filter back as editable chips, never as opaque magic.

State considerations:
- Empty (post-filter): distinguish "no data" from "no matches"; the latter offers "clear filters".
- Loading: filter controls stay interactive while rows reload.
- Partial: streaming rows must respect active filters as they arrive.

---

## Information

### Context Cards

Real code: `./ai-native/context-cards.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#context-cards). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: cards surfacing the sources, memory, or grounding the model is drawing on (retrieved documents, cited passages, connected data, prior context). The provenance surface.

When to use: RAG and grounded flows where trust depends on the user seeing what informed the answer. Attribution is not optional in these flows; it is the difference between a claim and a citation.

Key interaction: each card links to its source and shows enough (title, snippet, origin) to judge relevance. Cluster near the claim they support, or in a consistent rail. Let the user dismiss or pin context where the product allows steering it.

State considerations:
- Loading: skeleton cards during retrieval.
- Empty: "answered without sources" is meaningful; say so rather than hiding it, so the user knows the answer is ungrounded.
- Error: a source that failed to load is marked, not silently dropped.
- Partial: cards appear as retrieval resolves; the answer may stream before all context cards settle.

### Recommendation Card

Real code: `./ai-native/recommendation-card.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#recommendation-card). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: a single, prominent suggested next action or item the model proposes (a recommended fix, a suggested query, a product, a route). One clear recommendation with rationale.

When to use: when the model has a confident, actionable suggestion worth elevating above the flow. One per moment; a stack of recommendation cards is just a list and should be one.

Key interaction: the recommendation, a one-line why, and a primary action to take it plus a quiet way to dismiss or see alternatives. Make the rationale honest and short; do not oversell.

State considerations:
- Loading: skeleton or hold until confident; a low-confidence recommendation should not use this high-emphasis pattern.
- Empty: no recommendation is a valid state; render nothing rather than a filler card.
- Error/partial: if the action fails on take, resolve the card into the error with retry.

### Insight Cards

Real code: `./ai-native/insight-cards.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#insight-cards). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: small cards each carrying one derived finding, metric, or observation the model surfaced from data (an anomaly, a trend, a summary statistic with a note). A scannable set of takeaways.

When to use: analytical surfaces where the model distils many data points into a few findings. Keep each card to one idea (mirrors the minimal "one idea per chapter" rule).

Key interaction: each card leads with the finding, supports it with a figure or micro-visual, and links to the underlying data. Consistent card size; let the finding, not decoration, carry emphasis.

State considerations:
- Loading: skeleton grid.
- Empty: "nothing notable found" is itself an insight; state it.
- Error: a card whose computation failed shows that, without breaking the grid.
- Partial: cards populate as findings resolve; do not reflow the grid on each arrival (reserve slots).

---

## Navigation & Search

### Sidebar Nav

Real code: `./ai-native/sidebar-nav.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#sidebar-nav). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: the persistent left rail for AI apps: conversation history, projects/spaces, tools, and account. The wayfinding backbone.

When to use: any app with more than a single conversation or surface. For a single-shot tool, a sidebar is overhead.

Key interaction: current location clearly marked; collapsible to reclaim width; grouped (pinned, recent, older) rather than one long undated list. History search lives here. New-conversation is a primary, always-reachable action.

State considerations:
- Empty: a first-run sidebar shows the new-conversation action and nothing pretending to be history.
- Loading: skeleton rows for history while it loads.
- Streaming: a conversation being generated updates its title in place once the model names it; until then show a provisional label, not a spinner in the list.
- Error: a failed history load offers retry without blocking new work.

### Search

Real code: `./ai-native/search.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#search). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: retrieval over the user's own content (past conversations, documents, records), frequently blending keyword and semantic matching, and sometimes answering directly rather than only listing hits.

When to use: once the corpus outgrows browsing. Semantic search earns its cost only when exact-match fails users.

Key interaction: instant results as the user types (debounced), keyboard navigable, results grouped by type. Where the model answers over results, show the answer with Context Cards for the hits it used, and always keep the raw results reachable.

State considerations:
- Empty (no query): show recents or scopes, not a blank pane.
- Empty (no results): distinguish from no-query; offer to broaden or search semantically.
- Loading: results region shows progress; the input stays live.
- Partial: keyword hits can render immediately while semantic ranking resolves and reorders once (never continuously, which makes targets move under the cursor).

### Flowchart

Real code: `./ai-native/flowchart.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#flowchart). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: a node-and-edge visualisation of an agent's plan, a workflow, or a decision graph. Shows structure and branching that a linear list cannot.

When to use: genuinely non-linear processes: branching agent plans, pipelines, dependency graphs. For a linear sequence, use Task Rows; a flowchart of a straight line is decoration.

Key interaction: pan and zoom; nodes carry status and expand to detail; the active path is emphasised. Keep the default layout readable without interaction (auto-layout, not hand-placed).

State considerations:
- Loading: render the graph structure greyed while node results resolve.
- Running: the active node and traversed edges emphasised; pending branches dimmed.
- Error: a failed node marked in place with its edge; downstream pending nodes shown as blocked.
- Partial: a graph still being planned adds nodes as they are decided; avoid relayout thrash by reserving space or animating layout changes under 300ms.

---

## Code & Development

### Code Block

Real code: `./ai-native/code-block.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#code-block). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: syntax-highlighted, monospaced code output with copy, and often language label and line numbers. The most-used display in developer-facing AI.

When to use: any code the model returns. Always a dedicated block, never inline for anything multi-line.

Key interaction: one-click copy with clear confirmation; horizontal scroll inside the block (the block scrolls, the page never does); highlighting must survive streaming, so re-highlight on fence boundaries rather than per token. Optional filename header and, where the code is a proposed change, a route into a Diff Table.

State considerations:
- Streaming: render as plain monospace while tokens arrive, then apply highlighting once the fence closes; a half-highlighted line reads as broken.
- Error: if generation is cut off, keep the partial code and mark it incomplete.
- Empty: an empty code block is an error; do not render one.

Vanilla adaptation (inferred, dependency-free):

```html
<figure class="code">
  <figcaption class="code-head">
    <span>retry.ts</span>
    <button class="code-copy">Copy</button>
  </figcaption>
  <pre><code>export const retries = 3;</code></pre>
</figure>
<style>
  .code{border:1px solid var(--border);border-radius:10px;overflow:hidden;margin:0}
  .code-head{display:flex;justify-content:space-between;align-items:center;
    padding:.4rem .7rem;color:var(--ink-2);font-size:.8rem}
  .code pre{margin:0;padding:.7rem;overflow-x:auto;font-family:ui-monospace,monospace;
    font-size:.85rem}
  .code-copy{border:1px solid var(--border);background:transparent;border-radius:6px;
    padding:.15rem .55rem;font:inherit}
</style>
<script>
  document.querySelector('.code-copy').addEventListener('click',async e=>{
    await navigator.clipboard.writeText(
      e.target.closest('.code').querySelector('code').textContent);
    e.target.textContent='Copied'; setTimeout(()=>e.target.textContent='Copy',1400);
  });
</script>
```

### Fine-tune Card

Real code: `./ai-native/fine-tune-card.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#fine-tune-card). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: a card representing a training/fine-tuning or long-running job: config, progress, metrics, and lifecycle controls (start, stop, resume). A specialised long-job surface.

When to use: ML tooling and any comparably long, monitorable job (batch runs, evals, large ingests).

Key interaction: live progress (step/epoch, loss curve, ETA), controls scoped to the job's current phase, and links to logs and artefacts. Progress must degrade gracefully when metrics stream irregularly.

State considerations:
- Queued: show position/estimate, not a spinner.
- Running: live metrics; stop is a first-class, confirmed action (pair with an Approval Card if costly to lose).
- Success: resolve to a result with the produced artefact and key metrics.
- Error/failed: surface the failure reason and offer resume or restart; keep partial logs.
- Partial: metrics that arrive out of order should not make a chart jump backwards; buffer to monotonic step order.

---

## Visual Elements

### Selection Actions

Real code: `./ai-native/selection-actions.tsx` (Beautiful UI / Turbo, MIT (c) 2026 Shane Levine, from https://www.beautifului.dev/#selection-actions). React + Tailwind reference; deps in `./ai-native/ATTRIBUTION.md`.

What it is: a contextual action set that appears when the user selects one or more items (rows, messages, files, records): a floating bar or inline toolbar offering operations on the selection.

When to use: any multi-select surface, especially Records/Filter Tables and message lists, where actions apply to a chosen set rather than to each item individually.

Key interaction: appears on first selection, reports the count, and offers the relevant verbs (delete, export, tag, feed to the model). Destructive actions distinct by weight and confirmed; a clear way to clear the selection. Keyboard: Shift/Cmd-click ranges, Esc clears, and the bar is reachable by keyboard, not mouse-only.

State considerations:
- None selected: hidden entirely (do not reserve a permanent empty bar).
- One vs many: the label and available verbs may differ; some actions are single-item only.
- Executing: show progress on the action; keep the selection until it resolves so a failure can be retried against the same set.
- Error: report which items failed; do not silently drop them from the selection.

Vanilla adaptation (inferred, dependency-free):

```html
<div class="selbar" hidden role="toolbar" aria-label="Selection actions">
  <span class="selbar-count">0 selected</span>
  <button class="btn-ghost">Export</button>
  <button class="btn-ghost" data-danger>Delete</button>
  <button class="btn-ghost" data-clear>Clear</button>
</div>
<style>
  .selbar{position:sticky;bottom:1rem;display:flex;gap:.5rem;align-items:center;
    padding:.5rem .75rem;border:1px solid var(--border);border-radius:12px;
    background:var(--surface);box-shadow:0 1px 3px rgb(0 0 0 / 8%)}
  .selbar-count{margin-right:auto;color:var(--ink-2);font-size:.85rem}
  .selbar [data-danger]{font-weight:500}
</style>
<script>
  // on selection change: bar.hidden = count===0;
  // count.textContent = count + ' selected'
</script>
```

---

## Applying these

Reach for AI-native depth when the process behind the surface is genuinely uncertain, long-running, or consequential: those are the cases where extra state, provenance, and gating earn their weight. When the underlying call is fast and deterministic, the plain minimal control is the better answer. See `../philosophy/taste.md` for that judgement and `../minimal/principles.md` for the restraint every sketch above assumes.
