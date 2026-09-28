---
version: alpha
name: Ledger Mono
description: >-
  White, black and grey mobile UI for a warehouse + omnichannel SaaS. Red and
  green are the only two colours, and they only ever carry meaning. Derived
  from the Founders Dashboard token set (Inter, hairline borders, value-first
  KPI cards, ink-line charts), adapted for Android phones and glove use.
colors:
  # Canvas and surfaces. The whole app is white; the hairline does the separating.
  neutral: "#FFFFFF"
  surface: "#FFFFFF"
  surface-variant: "#F0F0F2"
  surface-pressed: "#F4F4F5"
  outline: "rgba(10, 10, 14, 0.11)"
  outline-strong: "rgba(10, 10, 14, 0.18)"
  # Ink ramp. Three greys for text, nothing else.
  on-surface: "#0C0C0E"
  on-surface-variant: "#59595F"
  on-surface-muted: "#8E8E95"
  # Action. The primary colour is black. Active means filled black with white text.
  primary: "#0C0C0E"
  on-primary: "#FFFFFF"
  primary-soft: "rgba(12, 12, 14, 0.06)"
  # Meaning. The only two hues in the system.
  positive: "#12994F"
  positive-soft: "rgba(18, 153, 79, 0.13)"
  error: "#E01824"
  error-soft: "rgba(224, 24, 36, 0.13)"
  # Grayscale data ramp for chart series, donut slices and bar fills.
  data-1: "#1C1C1F"
  data-2: "#57575E"
  data-3: "#9C9CA3"
  data-4: "#D2D2D7"
typography:
  headline-display:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.024em
    fontFeature: tnum
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.45
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: tnum
  body-sm:
    fontFamily: Inter
    fontSize: 12.5px
    fontWeight: 400
    lineHeight: 1.4
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.2
  label-md:
    fontFamily: Inter
    fontSize: 11.5px
    fontWeight: 600
    lineHeight: 1.2
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.06em
  mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: -0.02em
  floor-value:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
    fontFeature: tnum
  floor-action:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.2
rounded:
  none: 0px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  screen-gutter: 16px
  card-padding: 16px
  grid-gap: 12px
  floor-target: 56px
components:
  screen:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    padding: "{spacing.screen-gutter}"
  page-title:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    typography: "{typography.headline-lg}"
  page-description:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.body-sm}"
  kpi-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.headline-display}"
    rounded: "{rounded.lg}"
    padding: 16px
  kpi-label:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-sm}"
  kpi-delta-up:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.positive}"
    typography: "{typography.label-md}"
  kpi-delta-down:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.error}"
    typography: "{typography.label-md}"
  kpi-note:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.body-sm}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.headline-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"
  card-pressed:
    backgroundColor: "{colors.surface-pressed}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"
  code:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.mono}"
  floor-body:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-lg}"
  chart-series-1:
    backgroundColor: "{colors.data-1}"
    height: 2.4px
  chart-series-2:
    backgroundColor: "{colors.data-2}"
    height: 1.6px
  chart-series-3:
    backgroundColor: "{colors.data-3}"
    height: 1.6px
  chart-series-4:
    backgroundColor: "{colors.data-4}"
    height: 1.6px
  chart-gridline:
    backgroundColor: "{colors.outline}"
    height: 1px
  divider:
    backgroundColor: "{colors.outline}"
    height: 1px
  divider-strong:
    backgroundColor: "{colors.outline-strong}"
    height: 1px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    height: 44px
    padding: 12px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    height: 40px
    padding: 12px
  button-destructive:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.error}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    height: 44px
    padding: 12px
  floor-button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.floor-action}"
    rounded: "{rounded.lg}"
    height: 64px
    padding: 16px
  floor-button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.floor-action}"
    rounded: "{rounded.lg}"
    height: 56px
    padding: 16px
  scan-fab:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    size: 64px
  segmented-control:
    backgroundColor: "{colors.surface-variant}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    height: 36px
    padding: 3px
  segmented-control-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.sm}"
  tab:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    height: 36px
    padding: 12px
  tab-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
  pill-ok:
    backgroundColor: "{colors.positive-soft}"
    textColor: "{colors.positive}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 4px
  pill-crit:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.error}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 4px
  pill-mute:
    backgroundColor: "{colors.surface-variant}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 4px
  pill-info:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 4px
  as-of-badge:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-sm}"
  bar-track:
    backgroundColor: "{colors.surface-variant}"
    rounded: "{rounded.sm}"
    height: 8px
  bar-fill:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    height: 8px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    height: 44px
    padding: 12px
  floor-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.floor-value}"
    rounded: "{rounded.lg}"
    height: 72px
    padding: 16px
  numpad-key:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.floor-action}"
    rounded: "{rounded.lg}"
    height: 64px
  table-header:
    backgroundColor: "{colors.surface-variant}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-sm}"
    height: 40px
    padding: 12px
  table-cell:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    height: 48px
    padding: 12px
  list-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    height: 56px
    padding: 16px
  list-row-selected:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    height: 56px
    padding: 16px
  list-row-pressed:
    backgroundColor: "{colors.surface-pressed}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    height: 56px
    padding: 16px
  task-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.floor-action}"
    rounded: "{rounded.xl}"
    height: 96px
    padding: 16px
  bottom-nav:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-sm}"
    height: 64px
  bottom-nav-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
  bottom-sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  sync-dot-live:
    backgroundColor: "{colors.positive}"
    rounded: "{rounded.full}"
    size: 7px
  sync-dot-stale:
    backgroundColor: "{colors.error}"
    rounded: "{rounded.full}"
    size: 7px
---

## Overview

A ledger, not a dashboard toy. The product records where every unit of stock physically is, and every screen has to read like a trustworthy document: white paper, black ink, hairline rules, numbers that line up. The visual reference is the Founders Dashboard: a row of four value-first KPI cards, a chart card under them with a single black line and a dashed grey comparison, and a grayscale donut beside it. Nothing on that screen is coloured for decoration. Green appears only where something went up or is healthy. Red appears only where something went down, is blocked, or needs a human now. Everything else is black, white, and three greys.

The same system serves four very different people on one phone. An owner reading KPIs in a car. A store manager clearing approvals between customers. A picker in gloves scanning bins in a dim aisle. A SaaS operator watching MRR. The tokens do not change between them. What changes is density and size: the Floor mode uses the `floor-*` typography and component sizes, drops KPI cards entirely, and gives every action a 56px minimum target.

Tone words: calm, exact, quiet, monochrome, honest. Anti-words: playful, gradient-rich, colourful, glossy, dashboard-y.

## Colors

The palette is white paper plus an ink ramp plus two meanings.

- **Neutral / Surface (#FFFFFF):** The canvas and every card are the same white. Cards are separated from the page by the 1px `outline` hairline, never by a tinted background or a shadow. There is no grey page canvas on mobile.
- **Surface-variant (#F0F0F2):** The only tinted surface. It is the trough behind a segmented control, the header row of a table, the empty track of a bar, and the background of a muted pill. It never wraps a whole card.
- **Outline (rgba 10,10,14 at 11%):** The hairline. Card borders, row dividers, table rules, the top edge of the bottom nav. `outline-strong` (18%) is the hover or pressed border and the border of an input that has focus.
- **On-surface (#0C0C0E):** Headline numbers, primary text, the black of every active control, the main chart line, the fill of every bar.
- **On-surface-variant (#59595F):** Secondary text, inactive tab and segment labels, table body text that is not the key figure, the comparison line in charts.
- **On-surface-muted (#8E8E95):** Captions, uppercase KPI labels, "as of 14 min ago", axis labels, placeholder text, the sparkline stroke.
- **Primary (#0C0C0E):** Black is the action colour. A primary button is a black rectangle with white text. An active segment, active tab, and active bottom-nav icon are filled black. `primary-soft` (6% black) is the background of a selected list row and of the active sidebar item.
- **Positive (#12994F):** Meaning only. An upward delta on a KPI, a "Healthy" or "Synced" pill, the live sync dot, a variance that reconciled, an accepted order. Never a button, never a background wash larger than a pill.
- **Error (#E01824):** Meaning only. A downward delta on a KPI, a "Critical" or "Blocked" pill, a stale-sync dot, a negative variance, a rejected offer, a destructive action label, a required-field message. The one red primary button in the whole app is "Delete organisation".
- **Data ramp (data-1 to data-4):** Four greys for categorical series. Donut slices, stacked bars, and multi-series legends cycle through these. If a chart needs a fifth series, redesign the chart.

There is no blue, no amber, no purple, no teal. A warning state is not a third colour. It is ink text with a bold label, or a muted pill, or an outlined row. If it truly needs the eye now, it is red.

Dark mode is out of scope for v1. Warehouse phones run bright screens in dim aisles, and white paper with black ink is the highest-contrast configuration available.

## Typography

Inter everywhere, JetBrains Mono for identifiers. Tabular numerals on every number so columns align and counters do not jitter.

- **headline-display (28/600, tracking -0.024em):** The KPI value. It is the first thing in the card, above its own label. A unit or suffix (Cr, L, %, units) sits beside it at 15px, weight 500, in on-surface-variant.
- **headline-lg (22/600):** Page title. One per screen, top-left, with a 13px body-sm description in on-surface-variant beneath it.
- **headline-md (15/600):** Card title. Sits at the top-left of a card with an optional 12.5px caption beneath in on-surface-muted.
- **body-lg (16/400):** Floor mode body text and list rows on Floor screens.
- **body-md (14/400):** Default body, list rows, table cells.
- **body-sm (12.5/400):** Captions, delta notes, table sub-lines, "as of" text.
- **label-lg (13/500):** Buttons, segmented controls, tabs, chips.
- **label-md (11.5/600):** Status pills.
- **label-sm (11/500, uppercase, tracking 0.06em):** The KPI label under its number, table column headers, section eyebrows, bottom-nav labels.
- **mono (13/500):** SKU codes, bin codes, barcodes, order numbers, AWB numbers. Always mono, never Inter, so a code is recognisable as a code at a glance.
- **floor-value (40/600):** The quantity being entered or confirmed on a Floor screen. One per screen.
- **floor-action (18/600):** Floor button and task card labels.

Numbers use Indian grouping (1,23,456) and the rupee sign with no space (₹1,42,000). Large money collapses to L or Cr with one or two decimals (₹8.9 Cr, ₹18.6 L). A count is never abbreviated below 10,000.

## Layout

Phone-first, portrait, 390px design width. Horizontal screen gutter 16px. Vertical rhythm in 8px steps. Cards stack in a single column with 12px gaps. The four-KPI row from the Founders Dashboard becomes a 2×2 grid of KPI cards on the phone, 12px gap, each card the same height.

Every non-Floor screen has the same skeleton top to bottom: a slim top bar (screen title as headline-lg, a sync chip on the right), optional filter row (segmented control or chips, one line, scrolls horizontally if needed), then content cards, then a fixed bottom nav with 3 to 5 items. The bottom nav is fixed per mode and never morphs with permissions.

Floor screens break the skeleton on purpose. No bottom nav. A single task occupies the screen. The primary action is a full-width black floor-button pinned to the bottom, inside the thumb zone. Secondary actions sit above it as outlined floor-buttons. The universal Scan button is a 64px black circle, bottom-right, present on every Floor and Manager screen where scanning makes sense. Nothing that needs precision is placed in the top third of a Floor screen.

Tables scroll horizontally inside their own card. The page never scrolls sideways. Lists longer than about twenty rows paginate or lazy-load. Long identifiers truncate with an ellipsis in the middle, keeping the last four characters visible.

## Elevation & Depth

Flat. The hairline border is the elevation system. A card is white on white, held by a 1px `outline`. Resting cards carry a shadow so faint it reads as paper texture (0 1px 2px at 3.5% black), and on a phone it can be dropped entirely.

Depth is expressed by state, not shadow. The active thing is filled black. The selected row has a 6% black wash. The pressed card darkens its border to `outline-strong`. Only two things float: a bottom sheet and a toast, and both use a stronger lift shadow (0 2px 4px at 8%, plus 0 18px 42px at 28% pulled up by 16px) because they are genuinely above the page.

Charts have no plot background, no axis lines, and no tick marks. Gridlines are 1px `outline` dashed 2 on 5. The main series is a 2.4px on-surface line with a soft fill that fades from 30% on-surface to transparent. A comparison series is a 1.6px on-surface-variant line dashed 1 on 5. The last point of the main series carries a 4px dot with a 2px white stroke. Bars in a bar row are on-surface fading to 74% on-surface, left to right, on a surface-variant track.

## Shapes

Radius scale: 6px for small controls and pills that are rectangular, 8px for buttons, inputs, tabs and segmented controls, 12px for cards and KPI cards, 16px for Floor task cards and bottom sheets, full for status pills, the Scan button, avatars, and dots. Corner radius never exceeds 16px on a rectangle. Nothing is a capsule except a pill or the Scan button. Icons are 1.5px-stroke outline glyphs, 18px in lists and 24px in the bottom nav, on-surface-muted when inactive and on-surface when active. Filled icons are not used.

## Components

- **KPI card:** White, hairline, 12px radius, 16px padding. Order top to bottom: the value in headline-display, then the label in label-sm uppercase on-surface-muted, then a foot row that reads as one phrase, a delta chip (▲12.4% in positive or ▼1.2pp in error, 12.5px/600, no icon glyph) followed by its comparison window in body-sm muted ("vs last month"). An optional note line in body-sm muted carries a supporting fact ("14,842 online · 3,590 POS"). A sparkline band 38px tall sits flush across the bottom edge, 1.4px stroke in on-surface-muted at 50% opacity with a 13%-to-0 fill. When a KPI cannot be compared, the foot shows only the note, never a fake 0%. When a value is unknown it shows an em dash, never 0.
- **Card:** White, hairline, 12px radius, 16px padding. Header row: title in headline-md left, caption in body-sm muted beneath, controls right (segmented control, chip, or an "as of" badge). Content below a 14px gap.
- **Chart card:** A card whose body is a chart as described in Elevation. Legend sits in the header row on the right as 9px rounded squares plus label-lg text in on-surface-variant. X-axis labels in label-sm muted under the plot, first and last always shown.
- **Segmented control:** Surface-variant trough, hairline border, 8px radius, 3px inner padding. Segments in label-lg on-surface-variant. The active segment is a 6px-radius black fill with white text. Three to four segments maximum. Scrolls horizontally rather than wrapping.
- **Tabs:** Same visual language as the segmented control at page level. Active tab is black fill with white text, inactive tabs are plain on-surface-variant text. Strip scrolls horizontally.
- **Buttons:** Primary is black, white label-lg text, 8px radius, 44px tall. Secondary is white, hairline border, on-surface-variant text. Destructive is white with error text and border, and turns solid error only for the irreversible action. Floor variants are 64px tall with floor-action text and 12px radius. One primary button per screen.
- **Chip:** A secondary button at 32px height carrying a filter or an action with a leading 15px icon. Selected chip has a black border and 6% black wash.
- **Status pill:** 11.5px/600, 4px 10px padding, capsule, leading 6px dot in currentColor. Tones: ok (positive on positive-soft), crit (error on error-soft), mute (on-surface-variant on surface-variant), info (on-surface on primary-soft). No warn tone exists. The pill's label is the state word: Live, Stale, Synced, Pending, Blocked, Healthy, Critical, Draft, Quarantined.
- **As-of badge:** label-sm muted text with a 13px clock glyph: "as of 14 min ago · 3 of 41 locations stale". Every derived number on a card carries one. A number without an as-of is a guess wearing a suit.
- **Sync chip:** Sits in the top bar. A 7px dot (positive when synced, error when stale or offline) plus body-sm: "Synced 2m ago", "3 pending", "2 issues".
- **Bar row:** Name in body-md/560 left, value in body-md/640 right, an 8px track beneath spanning full width, fill from on-surface to 74% on-surface. Optional target marker as a 2px on-surface-muted tick. Rows divided by hairlines.
- **Table:** Header row on surface-variant, label-sm uppercase muted, 40px tall. Body cells body-md, 48px tall, hairline dividers. Numeric columns right-aligned with tabular figures. Wrapped in a card with an 8px inner radius and horizontal scroll.
- **List row:** 56px tall, 16px horizontal padding, hairline divider. Leading mono identifier or icon, title in body-md, sub-line in body-sm muted, trailing value or pill or chevron.
- **Input:** White, hairline, 8px radius, 44px tall, body-md text, label-sm label above. Focus border is outline-strong. Error state adds an error border and a body-sm error message below. Floor input is 72px tall with floor-value text and is always paired with a numpad, never a system keyboard.
- **Numpad:** 3×4 grid of 64px white keys with hairline borders and floor-action digits, plus a backspace and a confirm key. Confirm is the black floor-button-primary spanning the bottom.
- **Task card (Floor):** 96px tall, 16px radius, hairline, 16px padding. Left: a 24px outline icon and the task type in floor-action ("Pick", "Receive", "Put away", "Count", "Fulfil order"). Right: the count in headline-display ("7"). Beneath the type, one body-sm muted line ("3 lines · Zone A · assigned 09:12"). Tapping opens the task. Nothing else lives on the Floor home.
- **Scan button:** 64px black circle with a white 28px scan glyph, bottom-right, 16px from both edges, above the bottom nav where one exists. Tapping opens the camera sheet. On a Floor task screen, scanning is implicit and the button is not shown.
- **Bottom nav:** 64px, white, hairline top edge, 3 to 5 items with 24px outline icons and label-sm labels. Active item is on-surface with a filled black 4px dot beneath the label, inactive is on-surface-muted. Fixed per mode: Owner (Home, Omni, Ops, Data, Team), Manager (Board, Approvals, Ledger, Lookup), Super Admin (Home, Tenants, Health, Billing). Floor has no bottom nav.
- **Bottom sheet:** White, 16px top radius, 24px padding, drag handle 32×4 in outline-strong, lift shadow. Used for scan results, reject reasons, offer accept, filter pickers, and confirmations. A sheet has at most one primary button.
- **Empty state:** body-md on-surface-variant sentence centred with 30px padding, stating the fact and the reason: "No shortfall. Every store is above its replenishment threshold." Never an illustration.
- **Skeleton:** Rectangles in surface-variant with a slow shimmer between surface-variant and outline. Cards keep their real height while loading so the page does not jump.

## Do's and Don'ts

Do keep the whole screen white and let the hairline separate things. Do put the number first in a KPI card and its label second. Do bind every delta to what it is compared against in one phrase. Do show an as-of age on every derived number. Do right-align numbers with tabular figures. Do use mono for every code the eye must match against a physical label. Do render an unknown as an em dash. Do make the active thing black-filled. Do make every Floor target at least 56px and every Floor primary action full-width at the bottom.

Don't use blue, amber, purple, teal, or any hue other than the one green and the one red. Don't use green or red for anything that is not a change, a health state, or a required action. Don't use gradients except the two named ones: the ink bar fill and the chart area fade. Don't separate cards with tinted backgrounds or shadows. Don't tint a whole card header. Don't show 0, 0%, or "just now" when the value is unknown. Don't let a chart carry more than four series. Don't center-align a column of numbers. Don't put a menu, a tab strip, or a KPI grid on a Floor screen. Don't use the system keyboard for a quantity. Don't use filled icons, illustrations, emoji, or mascots. Don't morph the bottom nav based on permissions. Don't animate anything longer than 200ms except the sparkline and bar draw-in.
