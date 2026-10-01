# Stitch prompt pack — WMS mobile, four UIs

Style lives in `DESIGN.md`. These prompts only describe **what is on the screen and what the user is doing**. Do not add style words to them; if Stitch drifts, fix it with a redesign credit that quotes a line from DESIGN.md.

## How to run this in Stitch

1. New project → **Paste existing DESIGN.md** → upload `wms/DESIGN.md`.
2. **Additional instructions** → paste §0 (in Part B) once.
3. **Part A is the primary path.** One prompt per UI. Each prompt generates that user's complete screen set as one flow. Five prompts, five runs.
4. **Part B is the repair kit.** When one screen in a generated set is wrong, redesign only that screen with its Part B prompt. Do not regenerate the whole set.
5. Export → **Flutter widgets** when a mode is done. Tokens go to `core/theme` once; Stitch output gets refactored, never shipped raw.

If Stitch produces fewer screens than a Part A prompt asks for, paste the same prompt's shell paragraph plus the first four screens, then send "Add the remaining screens to this same flow" with the rest. Screens are listed in priority order so a truncated run still yields the screens that matter most.

---

# Part A. One prompt per UI

Why this shape: a multi-screen prompt works when the shell (nav, top bar, sync chip) is stated once so every screen shares chrome; screens are named and numbered with the hub first; each screen gets its content in three or four sentences and exactly one alternate state; sample data is concrete so nothing renders as lorem ipsum; the flow is stated at the end so Stitch links the screens; and a closing "do not" line blocks the one thing that mode must never have.

## A.1 Shared entry: Auth and Onboarding (5 screens)

```
Generate a 5-screen mobile flow (Android, portrait, 390×844) for the entry into Ledger, a warehouse and store stock system. Follow DESIGN.md exactly: everything white, hairline borders, black is the only action colour, green and red only for meaning, codes in monospace. Sample tenant "Ashva Apparel".

Shell: no bottom nav on any of these screens. A top bar with a back arrow and a title only where noted.

Screen 1, Welcome. Wordmark "Ledger" and one line "Know where every unit is." Three stacked full-width buttons: primary "Create your organisation", secondary "Sign in", secondary "Join with a code". Muted footer line "Staff joining a team: use the code your manager gave you."

Screen 2, Sign in. Email, Password with show/hide, right-aligned "Forgot password?" link, primary "Sign in", a hairline with "or", secondary "Continue with Google" with a grey G. Show the error state: the password field with a red border and "Wrong password. 2 attempts left." beneath it.

Screen 3, Join with a code. Title "Join your team", line "Enter the 6-character code from your manager." Six monospace code cells, the current cell with a darker border. Once filled, a preview card appears: "Ashva Apparel · Phoenix Palassio, Lucknow · Store Associate". Primary "Join".

Screen 4, Create organisation, step 1 of 5. Five 4px progress segments, the first filled black. Title "Your business". Inputs: Business name, Industry (select), Country India fixed, Currency INR fixed, Timezone Asia/Kolkata, GST number optional with the note "You can add this later". Primary "Continue", text link "Skip setup, go to dashboard".

Screen 5, Onboarding step 3 of 5, "Add your products". Three segments filled. Two large option cards: "Upload a CSV" with sub-line "Products, barcodes, prices. We map the columns", and "Add one product now" with sub-line "Good for trying the scanner today". Beneath, a compact mapping preview table: "Column A → SKU code", "Column B → Name", "Column D → Barcode" each with a small green check, and "Column F → unmapped" in muted text. Primary "Continue", link "Do this later".

Flow: Welcome opens Sign in, Join, or Create. Create leads through the wizard. Join lands the staff member directly on their tasks and never shows the wizard. Do not add illustrations, mascots, or a marketing hero.
```

## A.2 Floor UI: Operator and Store Associate (6 screens)

```
Generate a 6-screen mobile flow (Android, portrait, 390×844) for the Floor mode of Ledger, a warehouse and store stock app. The user is Ravi, a picker at "Bhiwandi DC", gloves on, phone in one hand, dim aisle. The same mode serves a store associate at "Phoenix Palassio, Lucknow". Follow DESIGN.md: white, hairline borders, black actions, green and red only for meaning, 56px minimum tap targets, quantities entered on a numpad never the system keyboard, codes in monospace.

Shell for every Floor screen: no bottom nav, no tabs, no KPI cards, no menus. One task per screen. The primary action is a full-width black button pinned to the bottom. A sync chip sits top-right (green dot "Synced 2m ago", or red dot "2 issues"). A 64px black circular Scan button sits bottom-right on the home screen only.

Screen 1, PIN unlock. Muted line "Bhiwandi DC · Device 03". Three avatar chips named Ravi, Meena, Suresh, with Ravi selected by a black border. Four PIN dots. A 3×4 numpad of large white keys with hairline borders. Footer "Not you? Tap your name above."

Screen 2, My Tasks, the home. Top bar "Ravi · Bhiwandi DC" and the sync chip. Muted line "Tuesday · shift 09:00–17:00". A stack of 96px task cards, each with a 24px outline icon, the task type at 18px, a large count on the right, and one muted sub-line: "Pick 7 · 3 orders · Zone A · assigned 09:12", "Put away 12 · from GRN-2026-0142", "Receive 1 · PO-2026-0089 · Tirupur Knits", "Count 0 · nothing assigned" rendered muted. For a store associate the cards read "Fulfil order", "Customer pickup", "Return intake" instead. Scan button bottom-right.

Screen 3, Pick session, line 3 of 7. Top bar: back, "Pick · SO-2026-0417", "3 / 7", and a 4px progress bar. Card one: eyebrow "GO TO BIN", bin "WH1-A-03-02" at 40px monospace, muted "Zone A · aisle 3 · shelf 2". Card two: eyebrow "PICK", "Oversized Tee · Black · M", SKU "ASH-TEE-OVS-BLK-M" monospace, quantity "4" at 40px with "units". A row button "Scan bin to confirm" with a scan glyph. Bottom: outlined "Short, can't find enough" above primary "Confirm 4 picked". Show the wrong-bin state on card one: red border and "That's WH1-A-03-05. Go to WH1-A-03-02."

Screen 4, Receive against PO. Top bar: back, "Receive · PO-2026-0089", "4 of 9 lines". A list of PO lines: monospace SKU, name, "received / expected"; finished rows carry a small green check and "48 / 48"; the current row has a darker border and "12 / 40". Below, the quantity "12" at 40px above a numpad, three chips "Short", "Over", "Damaged", and a chip "Add photo". Primary "Confirm line". Show "Damaged" selected as a black-filled chip with a photo placeholder and the note "Photo required for damaged".

Screen 5, Order offered to this store. Top bar "Phoenix Palassio · Orders". A card with "#ORD-88213", a large countdown "Accept within 12:40", two line items with monospace SKUs and "In stock: 3", "In stock: 1" in muted text, and "Deliver to Gomti Nagar, Lucknow · 4.2 km". Bottom: outlined "Reject" and black "Accept" side by side. Include the reject bottom sheet: title "Why can't this store fulfil it?", single-select rows "Can't find the item", "Item is damaged", "Stock number is wrong", "No staff capacity", "Past dispatch cut-off", footer "The order moves to the next location automatically.", primary "Reject and re-route".

Screen 6, Sync issues. Top bar: back, "Sync issues", count "2". Line "These scans could not be saved. Fix them here. Nothing is lost." Two cards: "Pick · SO-2026-0417 · line 5" with muted "Someone else moved this stock at 10:42" and chips "Pick from another bin", "Mark short"; and "Adjustment · WH1-B-01-04" with muted "Needs manager approval (above 20 units)" and chip "Send for approval". Footer "1 scan still pending upload".

Flow: PIN opens My Tasks. Each task card opens its session. The sync chip opens Sync issues. Do not add a dashboard, chart, KPI card, tab strip, or navigation bar anywhere in this mode.
```

## A.3 Manager UI: Warehouse Manager, Store Manager, Supervisor (6 screens)

```
Generate a 6-screen mobile flow (Android, portrait, 390×844) for the Manager mode of Ledger. The user is Meena, who runs "Bhiwandi DC" today: she approves, assigns, and clears exceptions for her one location. The same mode serves a store manager at "Phoenix Palassio, Lucknow"; only the board content changes. Follow DESIGN.md: white, hairline cards, black active controls, green only for up or healthy, red only for down, blocked, or urgent, an "as of" age on every derived number, codes in monospace, numbers right-aligned with tabular figures.

Shell for every Manager screen: top bar with the screen title left and a sync chip right; fixed bottom nav with four items Board, Approvals, Ledger, Lookup, the active item black with a 4px dot; a 64px black Scan button bottom-right above the nav on Board and Lookup.

Screen 1, Board, the home. Title "Bhiwandi DC". Eyebrow "NEEDS YOU NOW · 4" then four card rows: "Approval · +200 units adjustment · Ravi · WH1-B-01-04"; "Short pick · SO-2026-0417 line 5 · 2 units missing"; "Offer expiring · #ORD-88213 · 04:12 left" with the time in red; "Stale sync · Model Town POS · 47 min" with a red dot. Then a 2×2 grid of KPI cards, value first and uppercase label under it: "320 INBOUND TODAY · 1 PO open"; "148 OUTBOUND TODAY · ▲12% vs yesterday" in green; "99.2% PICK ACCURACY · ▼0.3pp" in red; "6 STAFF ON SHIFT · 2 pick, 3 putaway, 1 receiving". Then a chart card "Lines picked per hour" with one black line 09:00–17:00 and a dashed grey line for yesterday.

Screen 2, Approval detail. Eyebrow "STOCK ADJUSTMENT", "Requested by Ravi · 10:42", a grey reason pill "Damaged", bin "WH1-B-01-04" in monospace. A two-column block "On hand now 412" and "After approval 212" with "−200 units" in red between them. Two photo placeholders labelled "Evidence". Muted line "Above the 20-unit threshold, so it waits for you. Nothing has changed in stock yet." Bottom: outlined "Reject" and black "Approve −200".

Screen 3, Assign picks. Segmented control "Unassigned 3 · In progress 4 · Done 11", top-right chip "Auto-assign". Pick-list cards: "PL-0931 · 2 orders · 9 lines · Zone A–B", "~14 min walk", grey pill "Cut-off 14:00", three avatar chips Ravi, Suresh, Priya and an "Assign" chip. One card expanded with Suresh selected by a black border and "3 lines in progress" under his name.

Screen 4, Count variance review. Title "Count CC-0027 · Zone A". Three inline stats "Bins counted 42", "Lines with variance 6", "Net variance −18 units" with the negative in red. A table with columns SKU, Bin, Expected, Counted, Variance; six rows; variance cells "−4" in red or "+2" in green. Muted line "Approving posts one adjustment per line with reason cycle count." Bottom: outlined "Recount 6 lines" and black "Approve and post".

Screen 5, Ledger. Chips "Today" selected, "SKU", "Bin", "User", "Type"; top-right chip "Export". Rows grouped under time eyebrows like "10:00–11:00": a type eyebrow PICK, PUTAWAY, RECEIPT, or ADJUST; monospace SKU; "from → to" bins in monospace; a signed quantity right-aligned ("−4" red when stock leaves the building, "+48" green when it enters, plain black for internal moves); sub-line "Ravi · 10:42 · SO-2026-0417".

Screen 6, SKU detail (Lookup). Title "ASH-TEE-OVS-BLK-M" in monospace, chip "Adjust". Header card with a 64px grey image square, "Oversized Tee · Black · M", barcode in monospace, "MRP ₹1,299 · Cost ₹410". A 2×2 KPI grid "66 ON HAND", "14 RESERVED", "52 AVAILABLE", "24 IN TRANSIT" and the line "as of just now". Card "Where it is" with bar rows "WH1-A-03-02 48", "WH1-A-03-05 12", "RECEIVING 6". Card "Stores" with "Phoenix Palassio 3 · as of 14 min ago", "Phoenix Citadel 0", "Model Town 7 · stale 47 min" with the stale age in red.

Flow: Board rows open Approval detail, Assign picks, or the Ledger pre-filtered. Lookup opens SKU detail. For the store-manager variant the Board's KPI grid reads "91% FIRST-ATTEMPT ACCEPTANCE", "6 ORDERS JUMPED AWAY", "0.87 TRUST SCORE", "94% STOCK CONFIDENCE". Do not add billing, plan, or multi-location screens to this mode.
```

## A.4 Owner UI: Owner and Admin (7 screens)

```
Generate a 7-screen mobile flow (Android, portrait, 390×844) for the Owner mode of Ledger. The user is the founder of "Ashva Apparel", one warehouse "Bhiwandi DC" and 40 stores, checking the phone between meetings. Owner sees every location, configures the system, and pays for it. Follow DESIGN.md exactly. This mode is where the Founders Dashboard pattern lives: a 2×2 grid of value-first KPI cards with uppercase labels, green ▲ and red ▼ deltas bound to their comparison window, a sparkline band, then a chart card with one black line and a dashed grey comparison. White everywhere, hairline borders, black active controls, "as of" on every derived number, Indian rupee grouping (₹21.4 Cr, ₹18.6 L, ₹1,42,000).

Shell for every Owner screen: top bar with title left and sync chip right; fixed bottom nav with five items Home, Omni, Ops, Data, Team.

Screen 1, Dashboard, the home. Title "Ashva Apparel". Segmented "Today · 7d · 30d". KPI grid: "148 ORDERS SHIPPED ▲12.4% vs yesterday" green with sparkline; "9 STUCK ORDERS ▼3 vs yesterday" green because fewer is good, note "6 awaiting a store, 3 short-picked"; "2.1% JUMP RATE ▲0.4pp" red, note "₹18.6 L re-routed this week"; "₹21.4 Cr STOCK ON HAND", note "647k units · 41 locations · as of 4 min ago". Chart card "Inbound vs outbound · units": black outbound line, dashed grey inbound, 7 days, legend in the header. Card "Location health": a strip of 41 tiny squares, 37 black, 3 grey, 1 red, caption "37 live · 3 stale · 1 quarantined". Card "Alerts" with rows "Model Town POS stale 47 min" with a red dot, "23 SKUs at reorder point", "Cartons short at Bhiwandi DC".

Screen 2, Omni live board. Segmented "Live 14 · Waiting on store 6 · Exhausted 1". Order cards like "#ORD-88213 · 2 items · Gomti Nagar, Lucknow", each with a horizontal attempt chain of small chips: "Phoenix Palassio · offered 04:12 left" with a black border, "Phoenix Citadel" grey, "Bhiwandi DC" grey. One exhausted card whose chain reads "Model Town · rejected: can't find it", "Phoenix Citadel · timed out", "Bhiwandi DC · rejected: no capacity", all in red, with a black chip "Assign manually".

Screen 3, Omni scorecard. Segmented "7d · 30d · 90d". KPI grid "88% FIRST-ATTEMPT ACCEPTANCE ▲4pp" green; "2.1% JUMP RATE ▲0.4pp" red; "₹18.6 L COST OF JUMPS · 142 hours of delay"; "3 OVERSELLS · 0.2%, target under 0.5%". Card "Why locations reject" with bar rows "Can't find it 41", "Stock number wrong 12", "No capacity 9", "Past cut-off 6", "No response 4". Table "Locations by trust" with columns Location, Trust, Accept %, Jumps, five rows, the lowest trust "0.41" in red. Chart "Jump rate by week": black line, dashed grey target at 1%.

Screen 4, Locations. Chip "+ Add". Segmented "All 41 · Warehouses 1 · Stores 40". Search "Search location". Rows with a status pill on the right: "Bhiwandi DC · Warehouse · 6 zones · 1,240 bins" Live green; "Phoenix Palassio, Lucknow · Store · POS synced 3m ago" Live green; "Phoenix Citadel, Indore" Stale grey; "Model Town, Ghaziabad" Quarantined red with a red sub-line "Stock went negative on 2 SKUs · excluded from routing".

Screen 5, Location setup, step 2 of 4, "New location". Section "Where it is": Name, Address, Pincode, a grey map placeholder. Section "How it serves online orders": toggles "Fulfils online orders" on and "Allows customer pickup" on; inputs "Serviceable radius (km) 25", "Daily pick capacity 40", "Dispatch cut-off 16:00". Section "Stock source": select "POS connector · Ginesys" with sub-line "Pull every 15 min". Note "This location cannot route orders until its first sync passes with no negative stock." Primary "Run first sync (dry run)".

Screen 6, Team. Chip "+ Invite". Segmented "People 14 · Invites 3". Rows: avatar initial, name, uppercase role badge MANAGER, OPERATOR, STORE ASSOCIATE, or VIEWER, scope sub-line "Bhiwandi DC", "Phoenix Palassio", or "All locations"; the owner row reads "OWNER · you". Include the invite bottom sheet: Email or phone, Role select, Locations multi-select chips, note "Managers can invite operators and viewers only", primary "Send invite".

Screen 7, Plan and settings. Card "Plan": "Growth · ₹12,000 / month", green pill "Active", four thin usage bars "Users 14 / 25", "Locations 41 / 50", "SKUs 4,120 / 10,000", "Orders this month 3,812 / 5,000", chip "Upgrade". Card "Stock rules": "Pick order FEFO", "Adjustment approval above 20 units", "Store stock stale after 15 min". Card "Document numbering" with "PO-2026-0089", "SO-2026-0417", "GRN-2026-0142" in monospace. Card "Data": "Export everything", and "Delete organisation" in red text.

Flow: Home alerts open Locations or the Omni board. The Omni tab holds the live board and the scorecard as two tabs. The Data tab holds Locations and Products. The Team tab holds Team and Settings. Do not put scan sessions, numpads, or pick screens in this mode.
```

## A.5 Super Admin UI: platform founders (5 screens)

```
Generate a 5-screen mobile flow (Android, portrait, 390×844) for the Super Admin mode of Ledger, used only by the SaaS founders. It shows every tenant, and its whole point is one join: revenue × usage × cost per tenant. Follow DESIGN.md exactly: the Founders Dashboard KPI grid, white, hairline borders, black active controls, green only for up or healthy, red only for down, failing, or negative margin, "as of" on every derived number, rupee grouping.

Shell for every screen: top bar with title left and "as of 6 min ago" right; fixed bottom nav with four items Home, Tenants, Health, Billing.

Screen 1, Platform home. Title "Ledger · Platform". KPI grid: "₹4.82 L MRR ▲8.3% vs last month" green with sparkline; "₹57.8 L ARR · at current MRR"; "₹38,000 NET NEW MRR · +₹52K new · +₹9K expansion · −₹23K churn"; "41 ACTIVE TENANTS · 6 on trial · 2 past due". Chart card "MRR by month": black line over 12 months, dashed grey prior year. Card "Trials expiring this week" with three rows: tenant name, "3 days left", usage line "18 users · 1,200 SKUs · 41 locations", chip "Extend". Card "Costing more than they pay" with one red row: "Ashva Apparel · pays ₹12,000 · Firebase ₹14,300 · margin −19%".

Screen 2, Tenants. Search "Search tenant", chip "Filter". Segmented "All 41 · Trial 6 · Active 33 · Past due 2". Rows: tenant name, status pill (Active green, Trial grey, Past due red), MRR right-aligned "₹12,000", sub-line "Growth plan · 14 users · 41 locations · margin 38%". One row with margin "−19%" in red. One row with "Last active 21 days ago" in red.

Screen 3, Tenant detail, "Ashva Apparel", chip "Impersonate". Pills "Active" green, "Growth plan", "Since Mar 2026". KPI grid: "₹12,000 MRR ▲ from ₹8,000" green; "₹14,300 / mo FIREBASE COST · location_stock 1.6M docs · 92% of cost"; "−19% GROSS MARGIN" in red; "14 / 25 SEATS USED". Card "Usage vs plan" with four thin bars. Card "Health": "Connectors 39 of 41 healthy · 2 stale" with the 2 in red, "Oversell events 3 this month", "Function errors 0.2%". Card "Actions" with rows "Extend trial", "Override a limit", "Issue credit", "Resend owner invite", and "Suspend tenant" in red text. Footer "Every impersonation writes an audit row the tenant can see."

Screen 4, Platform health. KPI grid: "412 / 430 CONNECTORS HEALTHY · 18 stale" with 18 in red; "7 OVERSELL EVENTS 24H ▲3" red; "0.2% FUNCTION ERROR RATE ▼0.1pp" green; "6 min SYNC LAG P95 · target under 15 min". Table "Failing connectors" with columns Tenant, Location, Adapter, Failing since; six rows with the last column in red. Card "Oversells by cause" with bar rows "Stale store stock 4", "Two counters summed 2", "Untyped location 1". Chart "Sync runs per hour": black line, dashed grey error line.

Screen 5, Billing events. Chip "Export". Segmented "All · Failed 2 · Refunds". Rows grouped under date eyebrows: tenant, type eyebrow PAYMENT, PAYMENT FAILED, PLAN CHANGE, or REFUND, amount right-aligned ("₹12,000" black, "−₹3,000" for a refund, failed amounts in red), sub-line "Razorpay · pay_MkX93… · card ending 4421" with the id in monospace. Failed rows carry chips "Retry" and "Notify owner".

Flow: Home rows, Tenants rows, Health rows, and failed Billing rows all open Tenant detail. Do not add any tenant-side screen (stock, orders, scanning) to this mode.
```

---

# Part B. Per-screen prompts (repair kit)

Use these only to redesign a single screen inside a set Part A already generated. Same numbering as before.

Screen count: Shared 5 · Floor 7 · Manager 8 · Owner 11 · Super Admin 5 = **36**.

---

## 0. Project instructions (paste once into "Additional instructions")

```
Mobile app, Android, portrait, 390×844. White background everywhere; cards are white with a 1px hairline border, no shadows, no tinted backgrounds. Follow DESIGN.md exactly: Inter, black is the action colour, green only for "went up / healthy / synced", red only for "went down / blocked / needs a human now", everything else black, white and three greys.

The product is a warehouse + omnichannel stock system for Indian D2C brands that run warehouses and retail stores. Sample tenant: "Ashva Apparel". Locations: "Bhiwandi DC" (warehouse), "Phoenix Palassio, Lucknow", "Phoenix Citadel, Indore", "Model Town, Ghaziabad" (stores). SKUs look like ASH-TEE-OVS-BLK-M. Bins look like WH1-A-03-02. Money in rupees with Indian grouping (₹1,42,000; ₹8.9 Cr; ₹18.6 L). Staff names: Ravi, Meena, Suresh, Priya.

Every derived number carries an "as of" age in small muted text ("as of 14 min ago"). Unknown values render as an em dash, never 0. Codes (SKU, bin, order, AWB) are in monospace.

Four modes share these tokens. Floor screens have no bottom nav, no tabs, no KPI cards; one task per screen, a full-width black action button pinned to the bottom, 56px minimum tap targets, quantities entered on a numpad. Manager, Owner and Super Admin screens have a top bar (title left, sync chip right), optional one-line filter row, cards, and a fixed bottom nav.
```

---

## 1. Shared — Auth & Onboarding

### 1.1 Welcome
```
Screen: Welcome. First launch, signed out. Top third: product wordmark "Ledger" in large text and one line under it: "Know where every unit is." Bottom half: three stacked full-width buttons — primary "Create your organisation", secondary "Sign in", secondary "Join with a code". Beneath, one line of muted small text: "Staff joining a team: use the code your manager gave you." No imagery, no illustration.
```

### 1.2 Sign in
```
Screen: Sign in. Top bar with back arrow and title "Sign in". Form: Email input, Password input with show/hide toggle, "Forgot password?" as a small right-aligned text link. Full-width primary button "Sign in". A hairline divider with "or" centred, then a secondary button "Continue with Google" with the Google G glyph in grey. Error state variant: password input with red border and the message "Wrong password. 2 attempts left." in small red text under it.
```

### 1.3 Join with a code
```
Screen: Join with a code. Used by floor staff and store associates who were invited by their manager. Title "Join your team". One line muted: "Enter the 6-character code from your manager." A 6-cell code entry (monospace, one character per cell, current cell has a darker border), then a black numpad-style keyboard is NOT needed — use system keyboard hint. Below the cells, resolved preview card appears once 6 chars are typed: "Ashva Apparel · Phoenix Palassio, Lucknow · Store Associate". Full-width primary button "Join". Second state: invalid code, cells outlined red with "That code has expired. Ask your manager for a new one."
```

### 1.4 Create organisation
```
Screen: Create organisation. Step 1 of a 5-step wizard, progress shown as five 4px segments at the top with the first filled black. Title "Your business". Inputs: Business name ("Ashva Apparel"), Industry (select: Apparel), Country (India, fixed), Currency (INR, fixed), Timezone (Asia/Kolkata). GST number (optional) with a small muted note "You can add this later". Full-width primary button "Continue". Secondary text link "Skip setup, go to dashboard" under it in muted text.
```

### 1.5 Onboarding wizard — step 3, import products
```
Screen: Onboarding step 3 of 5, "Add your products". Progress segments at top, three filled. Two large white option cards with hairline borders stacked: (1) "Upload a CSV" with a 24px upload glyph, sub-line "Products, barcodes, prices — we'll map the columns"; (2) "Add one product now" with a plus glyph, sub-line "Good for trying the scanner today". Under the cards, a muted line: "You can also email the sheet to import@ledger.app and we'll do it." Bottom: primary "Continue" and a text link "Do this later". Third state: CSV chosen, showing a compact mapping table — three rows "Column A → SKU code", "Column B → Name", "Column D → Barcode" with a small green check on each mapped row and one row "Column F → (unmapped)" in muted text.
```

---

## 2. Floor UI (Operator / Store Associate)

Reference person: Ravi, picker, gloves on, phone in one hand. No menus. One job per screen. The physical world and the app must agree after every tap.

### 2.1 PIN unlock
```
Screen: PIN unlock on a shared warehouse phone. Top: small muted line "Bhiwandi DC · Device 03". Centre: a row of three large avatar chips with first names (Ravi, Meena, Suresh) — Ravi selected with a black border. Below: four PIN dots, then a 3×4 numpad of large white keys with hairline borders (digits 1–9, empty, 0, backspace). No confirm button — four digits unlock automatically. Bottom muted text: "Not you? Tap your name above." Error state variant: dots shake and a red line "Wrong PIN" appears above the numpad.
```

### 2.2 My Tasks (Floor home)
```
Screen: My Tasks — the Floor home. Top bar: left "Ravi · Bhiwandi DC", right a sync chip with a green dot "Synced 2m ago". Below, one muted line "Tuesday · shift 09:00–17:00". Then a vertical stack of large task cards, each 96px tall with a hairline border and 16px radius: "Pick" with count 7 and sub-line "3 orders · Zone A · assigned 09:12"; "Put away" with count 12 and sub-line "from GRN-2026-0142 · receiving bin"; "Receive" with count 1 and sub-line "PO-2026-0089 · Supplier: Tirupur Knits"; "Count" with count 0 and the sub-line "nothing assigned" in muted text, card slightly muted. Bottom-right: the 64px black circular Scan button. No bottom nav.
```

### 2.3 Scan result sheet
```
Screen: Camera scan with result. Top 55% of the screen is the camera viewfinder (render as a dark grey rectangle with a thin white bracket frame in the middle and a torch icon top-right). Bottom 45% is a white bottom sheet with a drag handle showing the resolved result. Variant A, SKU found: monospace "ASH-TEE-OVS-BLK-M", name "Oversized Tee · Black · M", then a compact three-row list "WH1-A-03-02 — 48", "WH1-A-03-05 — 12", "RECEIVING — 6" with bin codes in monospace and quantities right-aligned, plus a muted line "66 on hand · 14 reserved · as of just now". Two buttons side by side: secondary "Move", primary "Done". Variant B, bin found: monospace "WH1-A-03-02" and a list of the four SKUs inside it with quantities. Variant C, unknown barcode: red text "Barcode not recognised" and two buttons "Link to a product" and "Create product".
```

### 2.4 Pick session
```
Screen: Pick session, line 3 of 7. Top bar: back arrow, title "Pick · SO-2026-0417", right a progress text "3 / 7". A thin 4px progress bar under the top bar, 3/7 filled black. Main card: step label "Go to bin" in small uppercase muted text, then the bin code "WH1-A-03-02" in 40px monospace, then a muted line "Zone A · aisle 3 · shelf 2". Below it a second card: "Pick" label, product name "Oversized Tee · Black · M", SKU in monospace, and the quantity "4" in 40px with the word "units" beside it. A large secondary row-button "Scan bin to confirm" with a scan glyph. At the very bottom two stacked buttons: secondary outlined "Short — can't find enough" and primary black "Confirm 4 picked". State variant: wrong bin scanned — the bin card border turns red with the line "That's WH1-A-03-05. Go to WH1-A-03-02."
```

### 2.5 Receive session
```
Screen: Receive against PO. Top bar: back, "Receive · PO-2026-0089", right "4 of 9 lines". Under the bar a muted line "Tirupur Knits · expected 320 units". A scrollable list of PO lines as list rows: each shows SKU in monospace, name, expected qty, and received qty; completed rows show a small green check and "48 / 48"; the current row has a darker border and shows "12 / 40". Below the list, a numpad-driven quantity input showing "12" in 40px, three small chips above it for variance reasons "Short", "Over", "Damaged" (unselected), and a camera chip "Add photo". Pinned bottom: primary black button "Confirm line". Second state: "Damaged" selected — chip filled black, a photo thumbnail placeholder appears, and a small muted line "Photo required for damaged".
```

### 2.6 Fulfil order — store offer (Store Associate)
```
Screen: New online order offered to this store. Top bar: "Phoenix Palassio · Orders". A prominent card: "Order #ORD-88213" with a countdown "Accept within 12:40" as the largest text on the card, two line items beneath — "Oversized Tee · Black · M ×1" and "Cargo · Olive · 32 ×1" — each with monospace SKU and "In stock: 3" and "In stock: 1" in muted text, then "Deliver to: Gomti Nagar, Lucknow · 4.2 km". Bottom, two buttons side by side: outlined "Reject" and black "Accept". Second state, bottom sheet after tapping Reject: title "Why can't this store fulfil it?" and a vertical list of single-select rows — "Can't find the item", "Item is damaged", "Stock number is wrong", "No staff capacity", "Past dispatch cut-off" — with a muted footer "The order moves to the next location automatically." and a primary button "Reject and re-route".
```

### 2.7 Sync issues
```
Screen: Sync issues. Reached from the sync chip when it reads "2 issues" in red. Top bar: back, title "Sync issues", right a small muted "2". Explanatory line: "These scans could not be saved. Fix them here — nothing is lost." Two list rows, each a card: row 1 — "Pick · SO-2026-0417 · line 5", muted "Someone else moved this stock at 10:42", quantity "4 units from WH1-A-03-02", and two chips "Pick from another bin" and "Mark short". Row 2 — "Adjustment · WH1-B-01-04", muted "Needs manager approval (above 20 units)", and a single chip "Send for approval". Bottom: a muted line "1 scan still pending upload" with a small grey spinner. Empty state variant: a centred sentence "Everything is synced." with a green dot.
```

---

## 3. Manager UI (Warehouse Manager / Store Manager / Supervisor)

Reference person: Meena, runs Bhiwandi DC today. Same UI for a store manager at Phoenix Palassio; only the board content changes. Bottom nav: Board · Approvals · Ledger · Lookup.

### 3.1 Board (Manager home)
```
Screen: Board — Manager home for Bhiwandi DC. Top bar: title "Bhiwandi DC", right sync chip "Synced 1m ago". Section eyebrow "NEEDS YOU NOW" with a count "4". Four list rows as cards: "Approval · +200 units adjustment · Ravi · WH1-B-01-04" with a chevron; "Short pick · SO-2026-0417 line 5 · 2 units missing"; "Offer expiring · #ORD-88213 · 04:12 left" with the time in red; "Stale sync · Model Town POS · 47 min" with a red dot. Below, a 2×2 grid of KPI cards: "Inbound today" 320 with note "1 PO open"; "Outbound today" 148 with delta ▲12% vs yesterday in green; "Pick accuracy" 99.2% with delta ▼0.3pp in red; "Staff on shift" 6 with note "2 on pick, 3 on putaway, 1 receiving". Under that a chart card "Lines picked per hour" with a single black line across 09:00–17:00 and a dashed grey line for yesterday. Bottom nav: Board (active), Approvals, Ledger, Lookup. Scan button bottom-right above the nav.
```

### 3.2 Approval detail
```
Screen: Approval detail. Top bar: back, "Approval". Card: eyebrow "STOCK ADJUSTMENT", requested by "Ravi · 10:42", reason pill "Damaged" in muted style, location and bin in monospace "WH1-B-01-04". A two-column before/after block: "On hand now 412" left, "After approval 212" right, with the change "−200 units" in red between them. A photo thumbnail strip with two placeholders labelled "Evidence". A muted line "Above the 20-unit threshold, so it waits for you. Nothing has changed in stock yet." Bottom: two buttons side by side — outlined "Reject" and black "Approve −200". Second state: a bottom sheet after Reject with a text input "Tell Ravi why" and a primary "Send back".
```

### 3.3 Assign pick lists
```
Screen: Assign pick lists. Top bar: back, "Assign picks", right chip "Auto-assign". A segmented control: "Unassigned 3", "In progress 4", "Done 11". List of pick-list cards: each shows "PL-0931 · 2 orders · 9 lines · Zone A–B", an estimated "~14 min walk", a priority pill "Cut-off 14:00" in muted style, and a row of three small avatar chips (Ravi, Suresh, Priya) with "Assign" as a chip. One card expanded showing the operator chips as selectable, Suresh selected with a black border and current load "3 lines in progress" under his name. Bottom nav with Board, Approvals, Ledger, Lookup; none active since this is a pushed screen.
```

### 3.4 Count variance review
```
Screen: Cycle count variance review. Top bar: back, "Count CC-0027 · Zone A". Summary row of three inline stats: "Bins counted 42", "Lines with variance 6", "Net variance −18 units" with the negative in red. A table card with columns SKU (monospace), Bin, Expected, Counted, Variance; six rows; variance cells show "−4" in red or "+2" in green, zero-variance rows are not shown. A muted line under the table: "Approving posts one adjustment per line with reason 'cycle count'." Bottom: outlined "Recount 6 lines" and black "Approve and post".
```

### 3.5 Stock ledger
```
Screen: Stock ledger. Top bar: "Ledger", right chip "Export". Filter row of chips: "Today" (selected, black border), "SKU", "Bin", "User", "Type". A list of movement rows grouped by time: each row shows the type as a muted eyebrow ("PICK", "PUTAWAY", "RECEIPT", "ADJUST"), the SKU in monospace, "from → to" bins in monospace, the signed quantity right-aligned ("−4" in red for stock leaving the building, "+48" in green for stock entering, plain black for internal moves), and a sub-line "Ravi · 10:42 · SO-2026-0417". Time group headers "10:00–11:00" in small uppercase muted text. Bottom nav: Ledger active.
```

### 3.6 SKU detail (Lookup)
```
Screen: SKU detail. Top bar: back, title in monospace "ASH-TEE-OVS-BLK-M", right chip "Adjust". Header card: product image placeholder 64px square grey, name "Oversized Tee · Black · M", barcode in monospace, MRP "₹1,299", cost "₹410". A 2×2 KPI grid: "On hand 66", "Reserved 14", "Available 52", "In transit 24" with an as-of line under the grid "as of just now". A card "Where it is" listing bins with quantities as bar rows: "WH1-A-03-02 — 48", "WH1-A-03-05 — 12", "RECEIVING — 6" (bars proportional). A card "Stores" listing "Phoenix Palassio 3 · as of 14 min ago", "Phoenix Citadel 0", "Model Town 7 · stale 47 min" with the stale age in red. Bottom nav: Lookup active.
```

### 3.7 Bin detail (Lookup)
```
Screen: Bin detail. Top bar: back, monospace title "WH1-A-03-02", right chip "Print label". A small QR placeholder 80px square with the bin code under it. Info row: "Zone A · Aisle 3 · Shelf 2 · Storage · capacity 120". A KPI pair: "Units 74" and "SKUs 4". A list of the SKUs in the bin: each row monospace SKU, name, quantity right-aligned, and a small chip "Move". A muted footer line "Last counted 11 Aug · variance 0". Bottom sticky secondary button "Move everything out of this bin".
```

### 3.8 Location scorecard (Store Manager)
```
Screen: Store scorecard for Phoenix Palassio, Lucknow. Top bar: "Phoenix Palassio", sync chip "POS synced 3m ago" with green dot. A 2×2 KPI grid: "First-attempt acceptance 91%" with ▲3pp in green; "Orders jumped away 6" with ▼2 vs last week in green (fewer is better, so green); "Trust score 0.87" with note "top 5 of 41 locations"; "Stock confidence 94%" with note "buffer auto-set to 2 units". A card "Why orders were rejected · last 30 days" with bar rows: "Can't find it 4", "Stock number wrong 1", "No capacity 1", bars in black. A chart card "Acceptance rate" with a single black line over 8 weeks and a dashed grey chain-average line. Bottom nav: Board, Approvals, Ledger, Lookup with Board active.
```

---

## 4. Owner UI (Owner / Admin)

Reference person: the founder of Ashva Apparel, 1 warehouse + 40 stores, checking the phone in a car. Bottom nav: Home · Omni · Ops · Data · Team. This is where the Founders Dashboard pattern lives.

### 4.1 Dashboard (Owner home)
```
Screen: Owner dashboard. Top bar: "Ashva Apparel", right sync chip "Synced 4m ago". A segmented control "Today · 7d · 30d" with Today active. A 2×2 grid of KPI cards exactly in the Founders Dashboard style: "Orders shipped" 148 with ▲12.4% vs yesterday in green and a sparkline; "Stuck orders" 9 with ▼3 vs yesterday in green (fewer is good) and note "6 awaiting a store, 3 short-picked"; "Jump rate" 2.1% with ▲0.4pp in red and note "₹18.6 L re-routed this week"; "Stock on hand" ₹21.4 Cr with note "647k units · 41 locations · as of 4 min ago". Under the grid a chart card "Inbound vs outbound · units" with two lines — black outbound, dashed grey inbound — over 7 days and a small legend in the header. Under that a card "Location health" as a horizontal strip of 41 tiny squares (most black, three grey for stale, one red for quarantined) with the caption "37 live · 3 stale · 1 quarantined". Then a card "Alerts" with three list rows: "Model Town POS stale 47 min" (red dot), "23 SKUs at reorder point", "Cartons short at Bhiwandi DC". Bottom nav: Home active.
```

### 4.2 Locations
```
Screen: Locations. Top bar: "Locations", right chip "+ Add". A segmented control "All 41 · Warehouses 1 · Stores 40". A search input "Search location". List rows: name in body text, a status pill on the right ("Live" green, "Stale" muted, "Quarantined" red, "Dry run" muted), and a sub-line with type and sync age: "Store · Lucknow · POS synced 3m ago". First row "Bhiwandi DC · Warehouse · 6 zones · 1,240 bins". A quarantined row "Model Town, Ghaziabad" with the sub-line in red "Stock went negative on 2 SKUs · excluded from routing". Bottom nav: Data active.
```

### 4.3 Location setup
```
Screen: Location setup for a new store. Top bar: back, "New location", progress "Step 2 of 4". Section "Where it is": inputs Name, Address, Pincode, and a small map placeholder as a grey rectangle. Section "How it serves online orders": a toggle row "Fulfils online orders" on; a toggle row "Allows customer pickup" on; inputs "Serviceable radius (km)" = 25, "Daily pick capacity" = 40, "Dispatch cut-off" = 16:00. Section "Stock source": a select "POS connector" showing "Ginesys" with a sub-line "Pull every 15 min". A muted note "This location cannot route orders until its first sync passes with no negative stock." Bottom: primary "Run first sync (dry run)".
```

### 4.4 Omni live board
```
Screen: Omni live board — online orders looking for a location right now. Top bar: "Omni", right "as of just now". A segmented control "Live 14 · Waiting on store 6 · Exhausted 1". A list of order cards: each shows "#ORD-88213 · 2 items · Gomti Nagar, Lucknow", then a horizontal "attempt chain" of small chips left to right: "Phoenix Palassio · offered 04:12 left" (black border, current), "Phoenix Citadel" (muted, next), "Bhiwandi DC" (muted, last). One card in the exhausted state: chain shows "Model Town · rejected: can't find it" in red, "Phoenix Citadel · timed out" in red, "Bhiwandi DC · rejected: no capacity" in red, and a black chip "Assign manually". Bottom nav: Omni active.
```

### 4.5 Omni scorecard
```
Screen: Omni scorecard — the numbers this module exists to produce. Top bar: "Omni scorecard", segmented "7d · 30d · 90d" with 30d active. A 2×2 KPI grid: "First-attempt acceptance 88%" ▲4pp green; "Jump rate 2.1%" ▲0.4pp red; "Cost of jumps ₹18.6 L" with note "142 hours of delay"; "Oversells 3" with note "target < 0.5% · 0.2%". A card "Why locations reject" with bar rows: "Can't find it 41", "Stock number wrong 12", "No capacity 9", "Past cut-off 6", "No response 4". A table card "Locations by trust" with columns Location, Trust, Accept %, Jumps; five rows, the lowest trust row showing "0.41" in red. A chart card "Jump rate by week" with a black line and a dashed grey target line at 1%. Bottom nav: Omni active.
```

### 4.6 Routing rules and dry run
```
Screen: Routing rules. Top bar: back, "Routing rules", right chip "Dry run". A single-select list of strategies as rows with a black radio dot on the selected one: "Nearest first" (selected), "Cheapest first", "Warehouse first", "Clear aged stock first", "Balance load". A card "Weights" with five slider rows labelled Distance, Stock confidence, Capacity left, Time to cut-off, Cost to serve — each a thin black track on a grey rail with a numeric value right-aligned. A card "Safety buffers" with a toggle "Auto-tune per location from its own failure rate" on, and a muted line "Phoenix Palassio 2 units · Model Town 6 units". Second state: a bottom sheet titled "Dry run · last 30 days of real orders" with three inline stats "Jumps 61 → 44", "Delivery cost ₹4.2 L → ₹4.6 L" (increase in red), "Split shipments 12 → 9", and two buttons "Keep current" and black "Apply new rules".
```

### 4.7 Products
```
Screen: Products. Top bar: "Products", right chip "Import". Search input "Search name, SKU, barcode". Filter chips "All 4,120", "Low stock 23", "No barcode 8", "Batch-tracked". List rows: 40px grey image placeholder, name, monospace SKU beneath, and on the right the on-hand count with a small pill — "Healthy" green for most, "Reorder due" muted, "Out of stock" red. Bottom nav: Data active. Scan button bottom-right.
```

### 4.8 Product detail (edit)
```
Screen: Product detail, editable. Top bar: back, monospace "ASH-TEE-OVS-BLK-M", right chip "Save". Image placeholder 96px. Inputs: Name, Category (select), Unit of measure (select: piece), Pack size 1, MRP ₹1,299, Cost ₹410, Reorder point 40, Safety stock 20. A section "Barcodes" listing two monospace barcodes with a "+ Add barcode" row. A section "Tracking" with three toggle rows: Batch/lot off, Expiry off, Serial numbers off. A section "Stock" that is read-only: "66 on hand across 4 bins and 3 stores · as of 2 min ago" with a chevron to the SKU detail. No delete button on this screen.
```

### 4.9 Team and invites
```
Screen: Team. Top bar: "Team", right chip "+ Invite". A segmented control "People 14 · Invites 3". List rows: avatar initial circle, name, a role badge in small uppercase muted text ("MANAGER", "OPERATOR", "STORE ASSOCIATE", "VIEWER"), and a sub-line with scope: "Bhiwandi DC", "Phoenix Palassio", "All locations". One row for the owner with "OWNER · you". Invites tab variant: rows show email or phone, role, location, a muted "Sent 2 days ago", and two small chips "Resend" and "Revoke". Second state: bottom sheet "Invite someone" with inputs Email or phone, Role (select), Locations (multi-select chips), a muted line "Managers can invite operators and viewers only", and a primary "Send invite".
```

### 4.10 Reports
```
Screen: Reports. Top bar: "Reports". A list of report rows grouped under small uppercase eyebrows: STOCK — "Stock summary", "Stock ledger", "Ageing and dead stock", "Near expiry"; MOVEMENT — "GRN register", "Dispatch register", "Adjustments", "Transfers", "Count variances"; PEOPLE — "Operator productivity"; OMNI — "Jump analysis", "Location trust". Each row has a chevron. Second state: one report open, "Stock summary", with a segmented "By SKU · By location · By category", a table with SKU, On hand, Reserved, Value columns, a totals row in bold, and two chips at the top right "CSV" and "PDF". Bottom nav: Data active.
```

### 4.11 Plan and settings
```
Screen: Settings. Top bar: "Settings". A card "Plan" with the plan name "Growth · ₹12,000 / month", a pill "Active" in green, and four thin usage bars with labels and values: "Users 14 / 25", "Locations 41 / 50", "SKUs 4,120 / 10,000", "Orders this month 3,812 / 5,000" with the fullest bar's label in black and a chip "Upgrade". A card "Business" with rows: Currency INR, Timezone Asia/Kolkata, GST number, Financial year start April. A card "Stock rules" with rows: "Pick order FEFO" (select), "Adjustment approval above 20 units", "Store stock stale after 15 min". A card "Document numbering" with rows "PO-2026-0089", "SO-2026-0417", "GRN-2026-0142" in monospace. A card "Data" with rows "Export everything" and "Delete organisation" in red text. Bottom nav: Team active (settings lives under Team).
```

---

## 5. Super Admin UI (platform, us)

Reference person: the founder of the SaaS. Sees every tenant. Revenue × usage × cost per tenant is the whole point. Bottom nav: Home · Tenants · Health · Billing.

### 5.1 Platform home
```
Screen: Super admin home. Top bar: "Ledger · Platform", right "as of 6 min ago". A 2×2 KPI grid in the Founders Dashboard style: "MRR ₹4.82 L" with ▲8.3% vs last month in green and a sparkline; "ARR ₹57.8 L" with note "at current MRR"; "Net new MRR ₹38,000" with note "+₹52K new · +₹9K expansion · −₹23K churn"; "Active tenants 41" with note "6 on trial · 2 past due". A chart card "MRR by month" with a single black line over 12 months and a dashed grey line for the prior year. A card "Trials expiring this week" with three list rows: tenant name, "3 days left", usage line "18 users · 1,200 SKUs · 41 locations", and a chip "Extend". A card "Costing more than they pay" with one row in red: "Ashva Apparel · pays ₹12,000 · Firebase ₹14,300 · margin −19%". Bottom nav: Home active.
```

### 5.2 Tenants
```
Screen: Tenants. Top bar: "Tenants", right chip "Filter". Search input "Search tenant". A segmented control "All 41 · Trial 6 · Active 33 · Past due 2". List rows: tenant name, a status pill ("Active" green, "Trial" muted, "Past due" red), MRR right-aligned "₹12,000", and a sub-line "Growth plan · 14 users · 41 locations · margin 38%". One row's margin in red "−19%". One row with "Last active 21 days ago" in red as a churn signal. Bottom nav: Tenants active.
```

### 5.3 Tenant detail
```
Screen: Tenant detail — Ashva Apparel. Top bar: back, "Ashva Apparel", right chip "Impersonate". A row of three pills: "Active" green, "Growth plan", "Since Mar 2026". A 2×2 KPI grid: "MRR ₹12,000" with ▲ from ₹8,000 in green; "Firebase cost ₹14,300 / mo" with note "location_stock 1.6M docs · 92% of cost"; "Gross margin −19%" in red; "Seats used 14 / 25". A card "Usage vs plan" with four thin bars as in the owner settings screen. A card "Health" with list rows: "Connectors 39 of 41 healthy · 2 stale" (2 stale in red), "Oversell events 3 this month", "Function errors 0.2%". A card "Actions" with list rows: "Extend trial", "Override a limit", "Issue credit", "Resend owner invite", "Suspend tenant" (red text). A muted footer "Every impersonation writes an audit row the tenant can see."
```

### 5.4 Platform health
```
Screen: Platform health. Top bar: "Health", right "as of 1 min ago". A 2×2 KPI grid: "Connectors healthy 412 / 430" with the 18 stale noted in red; "Oversell events 24h 7" with ▲3 in red; "Function error rate 0.2%" with ▼0.1pp in green; "Sync lag p95 6 min" with note "target < 15 min". A card "Failing connectors" as a table: Tenant, Location, Adapter, Failing since — six rows, "Failing since" values in red. A card "Oversells by cause" with bar rows: "Stale store stock 4", "Two counters summed 2", "Untyped location 1". A chart card "Sync runs per hour" with a black line and a dashed grey error line. Bottom nav: Health active.
```

### 5.5 Billing events
```
Screen: Billing events. Top bar: "Billing", right chip "Export". A segmented control "All · Failed 2 · Refunds". A list of event rows grouped by day with small uppercase date eyebrows: each row shows tenant name, event type as an eyebrow ("PAYMENT", "PAYMENT FAILED", "PLAN CHANGE", "REFUND"), amount right-aligned ("₹12,000" black, "−₹3,000" for refund, failed amounts in red), and a sub-line "Razorpay · pay_MkX93… · card ending 4421" with the id in monospace. A failed row has a chip "Retry" and "Notify owner". Bottom nav: Billing active.
```

---

## Order of operations, with what each proves

1. **Floor 2.2 → 2.4 → 2.3.** Proves the tokens survive glove-mode sizing. If My Tasks looks like a dashboard, DESIGN.md is being ignored; redesign with "no KPI cards on Floor screens".
2. **Owner 4.1.** Proves the Founders Dashboard pattern ports to a 2×2 grid on a phone.
3. **Manager 3.1 → 3.2.** Proves the "needs you now" list and the approve/reject pair.
4. **Super Admin 5.1 → 5.3.** Proves the revenue × usage × cost join reads in one glance.
5. Everything else in listed order.
