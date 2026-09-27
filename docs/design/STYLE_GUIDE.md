# TIR UI style guide

The shared visual language for the Truck Incident Response frontend, introduced
in TIR-54.

Reference mockup: [`ui-mockup.jpeg`](./ui-mockup.jpeg), in this folder. The
colours below were **sampled from that image**, not approximated, and every
text/background pair is verified at 4.5:1 contrast or better.

One light theme only. There is no dark mode, and no `prefers-color-scheme`
rules anywhere in the app.

---

## Tokens

All tokens live on `:root` in `src/index.css`. Never hard-code a colour, font
size, spacing value or radius in a component. If something you need is missing,
add a token rather than a literal.

### Colour

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#F4F7FC` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, inputs |
| `--color-surface-muted` | `#F7F9FC` | Table headers, detail tiles, hover |
| `--color-border` | `#E3EAF3` | All borders and separators |
| `--color-text` | `#0F172A` | Primary text |
| `--color-text-muted` | `#5B6B80` | Subtitles, hints, secondary cells |
| `--color-text-invert` | `#FFFFFF` | Text on a dark or coloured fill |
| `--color-sidebar` | `#0F2541` | Sidebar, mobile top bar, drawer |
| `--color-sidebar-hover` | `#17304F` | Sidebar nav hover |
| `--color-sidebar-label` | `#C3CFE2` | Idle sidebar nav label |
| `--color-nav-active` | `#0B4AA0` | Active sidebar nav item |
| `--color-primary` | `#045FD8` | Primary buttons, links, focus |
| `--color-primary-hover` | `#0B4AA0` | Primary button hover |
| `--color-primary-soft` | `#EEF4FD` | Selected table row |
| `--color-focus-ring` | `rgba(4,95,216,.18)` | Input focus ring |

### Semantic colour

`--color-danger`, `--color-danger-bg`, `--color-danger-text`,
`--color-success-bg`, `--color-success-text`.

**Semantic colour is reserved for statuses, error and success messages, and
danger actions. Never use it decoratively.**

### Pill tones

`--tone-{amber,blue,violet,cyan,green,grey,red}-bg` and the matching `-fg`.
Each pair is contrast-checked. `red` is currently unused and reserved for a
future urgency badge.

### Spacing, type, radius, layout

| Group | Tokens |
| --- | --- |
| Spacing | `--space-1` … `--space-7` = 4, 8, 12, 16, 24, 32, 48px |
| Font size | `--text-xs` … `--text-2xl` = 12, 13, 14, 16, 18, 24, 30px |
| Font weight | `--weight-regular` 400, `--weight-medium` 500, `--weight-semibold` 600, `--weight-bold` 700 |
| Radius | `--radius-sm` 6, `--radius-md` 10, `--radius-lg` 12, `--radius-pill` 999px |
| Elevation | `--shadow-card`, `--shadow-drawer` |
| Layout | `--sidebar-width` 256, `--topbar-height` 56, `--row-height` 56, `--control-height` 44 |

Typeface is Inter (400/500/600/700), loaded in `index.html` with a `system-ui`
fallback stack, exposed as `--font-sans`.

---

## Shared classes

Defined in `src/index.css`. Reach for these before writing new CSS.

### Layout

- `.page` — page wrapper and gutter (24px, 16px below 768px)
- `.page-header` with `.page-title` and `.page-subtitle`
- `.card`, plus `.card-padded`, `.card-header`, `.card-title`, `.card-subtitle`

### Buttons

`.btn` plus one of `.btn-primary`, `.btn-secondary`, `.btn-danger`.

Hover, `:focus-visible` and `:disabled` states are built in, and every button
is at least 44px tall. **Do not write one-off button styles.**

### Forms

- `.field` — label, control and message as one stack
- `.field-label`
- `.input` — one style covering `input`, `select` **and** `textarea`
- `.field-hint`, `.field-error`

Mark an invalid control with `aria-invalid="true"`; `.input` styles the error
state from that attribute, so the error is never signalled by colour alone.

### Tables

Wrap `.table` in `.table-scroll` so a wide table scrolls inside its own
container and the page never scrolls sideways on a phone.

Helpers: `.table-link` (blue row action), `.cell-strong`, `.cell-muted`,
`.cell-nowrap`.

### States and messages

- `.state` with `.state-title` — loading and empty states
- `.alert` plus `.alert-error` or `.alert-success`
- `.visually-hidden` — screen-reader-only text

---

## Components

### `AppShell`

`src/components/AppShell.jsx`. Wraps every route in `App.jsx`. Navy sidebar at
768px and above; top bar plus a full-width drawer below that. The drawer closes
on navigation and on `Escape`.

### `Pill`

`src/components/Pill.jsx`.

```jsx
<Pill tone="blue">Assigned</Pill>
```

The shared pill *shape* only — it carries colour, not meaning. Wrap it in a
component that maps domain values to a tone.

### `StatusBadge`

`src/features/incidents/StatusBadge.jsx`.

```jsx
<StatusBadge status={incident.status} />
```

**Use this anywhere an incident status is displayed.** It matches
case-insensitively, because `Incident.status` is a free-text `CharField` on the
backend, always renders the status text alongside the colour, and falls back to
a neutral grey pill for any value it does not recognise.

| Status | Tone |
| --- | --- |
| Pending (also `reported`, `waiting for assistance`) | amber |
| Assigned | blue |
| On the way | violet |
| In progress | cyan |
| Resolved (also `closed`) | green |
| Anything else, including `cancelled` and `rejected` | grey |

The live values enforced by `VALID_STATUSES` in `backend/incidents/views.py`
are Pending, Assigned, On the way, In progress and Resolved. The extra keys are
defensive, since the column is free text.

**Why these differ from the mockup:** the mockup paints Assigned and On the Way
in nearly the same blue and has no Pending or In progress at all. Each real
status is given its own tone instead, so status is distinguishable at a glance.

### `formatDateTime`

`src/features/incidents/formatDateTime.js`.

```jsx
{formatDateTime(incident.created_at)}   // "Sep 16, 2026, 10:42 AM"
```

Medium date and short time in en-US, in the viewer's own time zone. Returns an
unparseable value unchanged rather than rendering "Invalid Date". Use it for
any timestamp coming from the API.

---

## Mockup to code

| Mockup element | Use |
| --- | --- |
| Navy sidebar and mobile menu | `AppShell` |
| Page title with grey subtitle | `.page-header` / `.page-title` / `.page-subtitle` |
| White rounded panels | `.card` |
| Incidents table | `.table-scroll` wrapping `.table` |
| "View →" row action | `.table-link` |
| Status and urgency pills | `StatusBadge`, or `Pill` for a new kind |
| "Next" / "Update Status" buttons | `.btn .btn-primary` |
| White bordered buttons | `.btn .btn-secondary` |
| Form fields | `.field` + `.field-label` + `.input` |

---

## Extension points

Designed for, deliberately not built yet:

- **A new page** — add one entry to `NAV_ITEMS` at the top of `AppShell.jsx`.
  It appears in both the sidebar and the drawer. Link only to routes that
  actually exist.
- **A new badge kind** (urgency, incident type) — wrap `Pill`, exactly as
  `StatusBadge` does. A `--tone-red-*` pair is already defined for "High".
- **Stat cards or a map** — add another section inside `.dashboard-sections` on
  the dashboard. It is a flex column, so nothing below it needs restructuring.
- **A new table column** (urgency, type) — just add the `<th>` and `<td>`. The
  table CSS is column-agnostic and needs no additions.

---

## Rules

- Icons come from `lucide-react`, which is already a dependency.
- No Tailwind, no component libraries, no CSS frameworks. Plain CSS with these
  tokens.
- Every text/background pair must reach 4.5:1 contrast.
- The incident history page (`src/features/incidents/IncidentHistory.*`, TIR-53)
  is intentionally **outside** this system and still carries its own dark
  styling. `index.css` pins browser defaults inside `.history-page` so global
  changes cannot alter how it renders. Do not restyle it as a side effect of
  other work.
