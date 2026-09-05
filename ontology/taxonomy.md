# Taxonomy

The type tree, grouped into ten families, with a meaningful-cell grid per family. A grid marks which
registers make sense for each type: `Y` meaningful, `.` not a real thing. `minimal` is meaningful for
essentially everything, so treat a blank there as `Y`. See `register-rules.md` for how each `Y`
expresses, and `assets.json` for current fill status.

Registers, in grid column order: **min** (minimal) · **gls** (glass) · **tac** (tactile) · **shd**
(shader/live).

## 1. Actions

Buttons and command triggers.

| type | min | gls | tac | shd |
|---|---|---|---|---|
| button | Y | Y | Y | Y |
| icon button | Y | Y | Y | Y |
| FAB | Y | Y | Y | Y |
| split / menu button | Y | Y | Y | . |
| segmented control | Y | Y | Y | . |
| dropdown menu | Y | Y | Y | . |
| link / text action | Y | . | . | Y |
| button group / toolbar | Y | Y | Y | . |

## 2. Inputs

Places a user types or supplies a value.

| type | min | gls | tac | shd |
|---|---|---|---|---|
| text field | Y | Y | Y | . |
| search bar | Y | Y | Y | Y |
| textarea | Y | Y | Y | . |
| prompt / chat composer | Y | Y | Y | Y |
| select | Y | Y | Y | . |
| combobox / autocomplete | Y | Y | . | . |
| file upload / dropzone | Y | Y | Y | Y |
| stepper (numeric) | Y | Y | Y | . |
| OTP / code input | Y | Y | Y | . |

## 3. Selection

Controls that set a discrete or bounded value.

| type | min | gls | tac | shd |
|---|---|---|---|---|
| checkbox | Y | Y | Y | . |
| radio | Y | Y | Y | . |
| switch / toggle | Y | Y | Y | Y |
| slider / range | Y | Y | Y | Y |
| chips / tags | Y | Y | . | . |
| rating | Y | Y | Y | . |
| colour picker | Y | Y | . | Y |

## 4. Navigation

Moving between places and showing where you are.

| type | min | gls | tac | shd |
|---|---|---|---|---|
| tab bar | Y | Y | Y | . |
| sidebar / nav rail | Y | Y | . | . |
| breadcrumb | Y | . | . | . |
| pagination | Y | Y | . | . |
| dock | Y | Y | Y | Y |
| command palette | Y | Y | . | . |
| wizard / step nav | Y | Y | . | . |

## 5. Surfaces

Containers that hold and layer content.

| type | min | gls | tac | shd |
|---|---|---|---|---|
| card | Y | Y | Y | Y |
| panel / section | Y | Y | . | Y |
| sheet / drawer | Y | Y | . | . |
| modal / dialog | Y | Y | Y | . |
| accordion | Y | Y | . | . |
| popover | Y | Y | . | . |

## 6. Feedback and status

Telling the user what happened or is happening.

| type | min | gls | tac | shd |
|---|---|---|---|---|
| toast / snackbar | Y | Y | . | . |
| confirmation tick (success mark + label + haptic) | . | Y | . | . |
| badge / pill count | Y | Y | . | . |
| tooltip | Y | Y | . | . |
| progress bar | Y | Y | Y | Y |
| spinner / loader | Y | Y | Y | Y |
| skeleton | Y | Y | . | . |
| empty state | Y | Y | . | Y |
| alert / banner | Y | Y | . | . |

## 7. Data display

Structured information.

| type | min | gls | tac | shd |
|---|---|---|---|---|
| table | Y | Y | . | . |
| rows / list | Y | Y | . | . |
| diff view | Y | Y | . | . |
| filter bar | Y | Y | . | . |
| stat / metric tile | Y | Y | Y | Y |
| key-value / spec list | Y | Y | . | . |

## 8. Media, hero and background

The live and pictorial layer. This is where most ThreeUI extracts already sit.

| type | min | gls | tac | shd |
|---|---|---|---|---|
| shader background | . | Y | . | Y |
| gradient background | Y | Y | . | Y |
| particle / flow field | . | . | . | Y |
| orb / sphere | . | Y | . | Y |
| scene (3D) | . | . | . | Y |
| image treatment | Y | Y | . | Y |
| hero composition | Y | Y | . | Y |

## 9. AI-native

Surfaces for generated, streaming, agent-driven work. Detail in `../patterns/ai-native.md`.

| type | min | gls | tac | shd |
|---|---|---|---|---|
| approval card | Y | Y | . | . |
| tool chip | Y | Y | . | . |
| streaming text | Y | Y | . | Y |
| thinking indicator | Y | Y | . | Y |
| context / source card | Y | Y | . | . |
| insight / recommendation card | Y | Y | . | Y |
| diff / change view | Y | Y | . | . |
| citation | Y | . | . | . |

## 10. Typography

Text as a designed element.

| type | min | gls | tac | shd |
|---|---|---|---|---|
| heading treatment | Y | Y | . | Y |
| animated text | Y | . | . | Y |
| wordmark | Y | Y | Y | Y |
| prose block | Y | . | . | . |
| code block | Y | Y | . | . |

## Counting

About 62 types. The grid marks roughly 150 meaningful cells across the four registers, but the
load-bearing set (the cells worth a pre-built exemplar) is far smaller, on the order of 30 to 40.
Everything else is a synthesis recipe. The map is finite and fixed; the file count is deliberately
not.

## Also known as

Cross-system aliases for the types above, taken from The Component Gallery's survey of design systems (names
only; the gallery's own descriptions stay local in `component-gallery/`). Use these when a brief names a
component by another system's word: a snackbar is a toast, a chip is a badge or tag, a sheet is a drawer.

| Component | Also known as |
|---|---|
| Accordion | Arrow toggle, Collapse, Collapsible sections, Collapsible, Details, Disclosure, Expandable, Expander, ShowyHideyThing |
| Alert | Notification, Feedback, Message, Banner, Callout |
| Badge | Tag, Label, Chip |
| Breadcrumbs | Breadcrumb trail |
| Button group | Toolbar |
| Card | Tile |
| Carousel | Content slider |
| Combobox | Autocomplete, Autosuggest |
| Datepicker | Calendar, Datetime picker |
| Drawer | Tray, Flyout, Sheet |
| Dropdown menu | Select menu |
| File | Attachment, Download |
| File upload | File input, File uploader, Dropzone |
| Hero | Jumbotron, Banner |
| Image | Picture |
| Label | Form label |
| Link | Anchor, Hyperlink |
| Modal | Dialog, Popup, Modal window |
| Navigation | Nav, Menu |
| Progress bar | Progress |
| Progress indicator | Progress tracker, Stepper, Steps, Timeline, Meter |
| Quote | Pull quote, Block quote |
| Radio button | Radio, Radio group |
| Rich text editor | RTE, wysiwyg editor |
| Search input | Search |
| Segmented control | Toggle button group |
| Select | Dropdown, Select input |
| Separator | Divider, Horizonal rule, Vertical rule |
| Skeleton | Skeleton loader |
| Slider | Range input |
| Spinner | Loader, Loading |
| Stepper | Nudger, Quantity, Counter |
| Tabs | Tabbed interface |
| Textarea | Textbox, Text box |
| Toast | Snackbar |
| Toggle | Switch, Lightswitch, Toggle button |
| Tooltip | Toggletip |
| Video | Video player |
| Visually hidden | Screenreader only |
