# Visual QA harness

The workspace's one headless-Chrome screenshot tool and one CSS scanner. Zero dependencies, Node 22
and Chrome only. Promoted here from `cruise-passport/tools/qa/`, whose copies stay in place and keep
that project's own routes, seeding and baked-in token scale; new work points at this folder instead
of re-typing a `chrome.exe --headless` line or copying the harness again.

The skill that fires on screenshot and render work, and carries the gotchas and the gate prompt, is
`C:\Users\Charles\.claude\skills\visual-verify\`.

## Screenshot

```
node E:\claude-projects\design\tools\qa\shot.mjs --url <url|path> --out <file.png> [flags]
```

| Flag | Default | What it does |
| --- | --- | --- |
| `--url <url\|path>` | required | `http(s)://`, `file://`, or a filesystem path, converted for you |
| `--out <file.png>` | required | output path; parent directories are created |
| `--width` / `--height` | 1200 / 800 | the CSS viewport |
| `--full` | off | also writes `<out>-full.png` at the whole document height |
| `--wait <ms>` | 400 | settle time on top of the measured readiness |
| `--dsf <n>` | 1 | device scale factor; 2 for a retina-density image |
| `--mobile` | off | mobile emulation (touch, mobile hints) |
| `--click <sel>` | none | clicks a selector after load, then settles again |
| `--eval <js>` | none | runs JavaScript after load and prints its JSON result |
| `--no-gpu` | off | drops SwiftShader; only for pages with no canvas or WebGL |
| `--timeout <ms>` | 45000 | navigation timeout |

It prints the measured viewport, `scrollWidth`, the document height and `HORIZONTAL OVERFLOW` when
there is any, then the bytes and the PNG's own pixel size for every file written. A missing or empty
file exits 1.

Run it from PowerShell. Git Bash rewrites a leading-slash argument into a Windows path.

## What is hard-coded, and why

Every one of these was a line somebody re-typed and got wrong at least once:

- **An isolated `--user-data-dir` per run**, created under the OS temp directory with `mkdtemp` and
  removed afterwards. A bare `chrome.exe` attaches to the user's running Chrome and silently ignores
  every headless flag, so `--screenshot` writes nothing and the exit code is still 0. The profile is
  never inside a project folder: a dev server watching the tree reload-storms on its thousands of files.
- **`--hide-scrollbars` and `--force-color-profile=srgb`**, so the image is the true page and true colour.
- **`--remote-debugging-port=0`** plus the profile's `DevToolsActivePort` file, so parallel runs and
  other harnesses never collide on a port.
- **Measured readiness**: the load event, then network idle (500 ms at zero in-flight requests), then
  `document.fonts.ready`, then two animation frames, then `--wait`. This replaces
  `--virtual-time-budget`, which fast-forwards timers and exits without waiting for real I/O.
- **A 500px width floor with a warning below it.** Chrome lays out at 500 CSS px minimum for
  `--window-size`, so a plain `--screenshot` at 390 crops the right edge instead of reflowing, which
  reads exactly like an overflow bug. Below 500 the tool warns, opens the window at the floor, and
  sets the real CSS viewport with `Emulation.setDeviceMetricsOverride`, which does reflow. The printed
  viewport line and the PNG's own width are the proof.
- **A non-zero-bytes assertion** on every file written.
- **SwiftShader on by default**, so canvas and WebGL pages paint. `--no-gpu` opts out.
- **`taskkill` on the captured pid only**, never a broad Chrome filter.

## Scan the CSS

```
node scan.mjs <file.css | dir> [...] [--tokens tokens.json] [--allow design-allow.txt] [--check]
```

Names suspect lines: sizes, weights, spacing, radii, shadows, backdrop blur, uppercase and tracked
labels, easing, non-token colours, gradients and endless motion. It is heuristic, so it names
suspects and a person or an agent decides.

`--tokens` takes the project's scale as JSON. `tokens.example.json` is the shape, filled in with the
Cocktail Passport's scale: `fontSize`, `spacing`, `radius` and `fontWeight` as arrays of the allowed
literals, `colour` as a regular expression for what counts as a token, `shadow` and `easing` as
allowed values, `ignore` as file suffixes to skip (the token file's own literals are the tokens), and
`flags` to switch off any of the six categorical checks. Anything the file omits falls back to the
generic default scale in `scan.mjs`, which is deliberately stricter than most projects want.

`--allow` takes accepted exceptions, one per line as `<path suffix> :: <text the finding contains>`,
each with its reason as a `#` comment. `--check` exits 1 on any suspect that is not allowed, which is
the form to wire into CI. Record a genuine exception rather than widening the scanner.
