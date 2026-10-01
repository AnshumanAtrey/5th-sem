# Stitch — Application 1 of 5: OWNER

Five separate mobile applications share one `DESIGN.md`:

| # | Application | Persona | File |
|---|---|---|---|
| 1 | Owner | Brand founder / admin, HQ | this file |
| 2 | Warehouse Floor | Picker, packer, receiver | `STITCH_APP_02_FLOOR.md` |
| 3 | Warehouse Manager | Warehouse manager, shift supervisor | `STITCH_APP_03_WH_MANAGER.md` |
| 4 | Store | Store manager + store associate | `STITCH_APP_04_STORE.md` |
| 5 | Super Admin | The SaaS founders | `STITCH_APP_05_SUPER_ADMIN.md` |

In code these remain the four shells from the plan (Store = Manager/Floor shells scoped to a store-type location). Five prompts is how we brief Stitch so each persona's world is complete.

## How to run this prompt in Stitch

1. Project → **Paste existing DESIGN.md** → `wms/DESIGN.md`. Do this once per project; one project per application keeps the canvases clean.
2. Paste the whole prompt below. Stitch generates a limited number of screens per run, so if it stops early: keep the **CONTEXT, PERSONA, DESIGN, SHELL** block as a fixed header and send one **ACT** at a time in the same project, prefixed with "Continue the Owner application."
3. Repair a single screen with a redesign credit, quoting the screen's numbered paragraph. Never regenerate the whole act for one screen.
4. Export → Flutter widgets when the app is done.

Screens: 37 across six acts.

---

## The prompt

```
APPLICATION CONTEXT

Ledger is a stock system for Indian D2C brands that sell online and through physical stores. The wound it treats: the stock physically exists, but the software does not reliably know where. So an online order gets routed to a store whose stock number is wrong, the store cannot find the item, and the order jumps to another location or dies. Ledger records every unit movement as an append-only ledger, derives on-hand per SKU per bin per location, pulls each store's stock from its POS, publishes one sellable number to the storefront, routes each online order to the best location with a stored fallback chain, logs every jump with its reason and its rupee cost, and feeds those reasons back into each location's trust score so routing gets better every week without anyone tuning it. Every number carries an "as of" age. An unknown value is an em dash, never a zero.

Ledger ships as five separate mobile applications that share one design system (DESIGN.md): Owner, Warehouse Floor, Warehouse Manager, Store, and Super Admin. This prompt is the OWNER application, complete, from first launch to account deletion.

PERSONA

Aarav Shah, 31, founder of Ashva Apparel, Mumbai. One warehouse, "Bhiwandi DC". Forty mall stores across twelve cities, including "Phoenix Palassio, Lucknow", "Phoenix Citadel, Indore", "Model Town, Ghaziabad". Sells on his Shopify site and on Myntra and Ajio. About 3% of his online orders jump between stores every month, he oversells every sale weekend, and his accountant's stock value never matches the floor. He is on the phone 80% of the time: 8 a.m. in the car, lunch, 11 p.m. He wants to know in five seconds whether today is fine, and one tap to see why not. He sets things up once, watches them daily, and pays the bill. He never scans, picks, or packs; that is his staff's world in other applications. He is the only person who can see billing or delete the organisation. An admin he appoints sees everything he sees except billing.

DESIGN

Follow DESIGN.md exactly. White everywhere, white cards with a 1px hairline border, no shadows, no tinted backgrounds. Black is the only action colour; the active segment, tab, and nav item are black-filled. Green is used only where something went up or is healthy; red only where something went down, is blocked, or needs a human now. Everything else is black and three greys. Inter with tabular numbers, JetBrains Mono for every code (SKU, bin, order, PO, GRN). Indian rupee grouping: ₹21.4 Cr, ₹18.6 L, ₹1,42,000. The Founders Dashboard pattern is the anchor of this application: a 2×2 grid of value-first KPI cards, uppercase label under the number, a green ▲ or red ▼ delta bound to its comparison window in one phrase, a sparkline band, then a chart card with one black line and a dashed grey comparison.

SHELL (every screen after Act 1)

Top bar: screen title left, sync chip right (green dot "Synced 4m ago", or red dot "3 locations stale"). Fixed bottom nav, five items: Home, Omni, Ops, Data, Team. Active item black with a 4px dot. Android, portrait, 390×844.

ACT 1. FIRST LAUNCH TO FIRST DASHBOARD (10 screens, no bottom nav until screen 9)

1. Welcome. Wordmark "Ledger" and the line "Know where every unit is." Three stacked buttons: primary "Create your organisation", secondary "Sign in", secondary "Join with a code". Muted footer "Staff joining a team: use the code your manager gave you."

2. Create account. Email, Password with show/hide, primary "Create account", hairline "or", secondary "Continue with Google". Show the verify state: a card "Check your inbox" with the email shown, a muted line "Tap the link we sent to aarav@ashva.in", a text link "Resend", and a disabled primary "Continue" that becomes active once verified.

3. Create organisation, step 1 of 5. Five 4px progress segments, first filled black. Title "Your business". Inputs Business name "Ashva Apparel", Industry (Apparel), Country India fixed, Currency INR fixed, Timezone Asia/Kolkata, GST number optional with the note "You can add this later". Primary "Continue". Text link "Skip setup, go to dashboard".

4. Step 2 of 5, "Your first location". Two large option cards: "Warehouse" (sub-line "Bins, zones, receiving and dispatch") selected with a black border, and "Store" (sub-line "Stock comes from your POS"). Inputs Name "Bhiwandi DC", Address, Pincode "421302". Primary "Continue".

5. Step 3 of 5, "Bins for Bhiwandi DC". Explanatory line "We will generate bin codes like WH1-A-03-02." Four numeric inputs in a 2×2 grid: Zones 6, Aisles per zone 12, Racks per aisle 8, Levels per rack 4. A live preview line "2,304 bins · first WH1-A-01-01 · last WH1-F-12-08". A secondary chip "Import bin CSV instead". Primary "Generate 2,304 bins".

6. Step 4 of 5, "Add your products". Two large option cards: "Upload a CSV" (sub-line "Products, barcodes, prices. We map the columns") and "Add one product now" (sub-line "Good for trying the scanner today"). Show the CSV state: a compact mapping table with rows "Column A → SKU code", "Column B → Name", "Column D → Barcode", "Column G → MRP", each with a small green check, and "Column F → unmapped" in muted text; under it a validation strip "4,118 rows ready · 2 rows skipped: duplicate barcode" with the 2 in red and a chip "See rows". Primary "Import 4,118 products". Link "Do this later".

7. Step 5 of 5, "Invite your team". Three prefilled invite rows, each with Email or phone, a Role select, and a Location select: "meena@ashva.in · Manager · Bhiwandi DC", "ravi · Operator · Bhiwandi DC", an empty third row. A muted line "Managers get a link. Operators get a 6-character code to type on the warehouse phone." Primary "Send 2 invites and finish". Link "Skip".

8. Setup complete. A single card: a black check circle, "Ashva Apparel is set up", and a five-row checklist with green checks on "Business", "Bhiwandi DC", "2,304 bins", "4,118 products" and a muted unchecked "Connect a store POS". Primary "Open dashboard".

9. First dashboard, empty state. The Home shell appears for the first time with the bottom nav. Title "Ashva Apparel". The 2×2 KPI grid shows em dashes for every value with muted labels and the note "No movements yet". Below, a card "Get to real numbers" with three rows, each with a chevron: "Receive your first PO on the warehouse phone", "Connect Phoenix Palassio's POS", "Place a test order on your Shopify". A muted line "Everything above turns live the moment stock moves."

10. Unlock, on every later open. A small line "Ashva Apparel · Aarav", a biometric glyph with "Touch to unlock", and a text link "Use PIN instead". Show the PIN variant: four dots and a 3×4 numpad.

ACT 2. A NORMAL MORNING, HOME TAB (3 screens)

11. Dashboard, live. Title "Ashva Apparel", sync chip "Synced 4m ago". Segmented "Today · 7d · 30d" with Today active. KPI grid: "148 ORDERS SHIPPED ▲12.4% vs yesterday" green with sparkline; "9 STUCK ORDERS ▼3 vs yesterday" green because fewer is good, note "6 awaiting a store, 3 short-picked"; "2.1% JUMP RATE ▲0.4pp" red, note "₹18.6 L re-routed this week"; "₹21.4 Cr STOCK ON HAND", note "647k units · 41 locations · as of 4 min ago". Chart card "Inbound vs outbound · units": black outbound line, dashed grey inbound, 7 days, legend in the header. Card "Location health": a strip of 41 tiny squares, 37 black, 3 grey, 1 red, caption "37 live · 3 stale · 1 quarantined". Card "Needs you": rows "Approve +200 unit adjustment · Bhiwandi DC · Ravi", "Model Town POS stale 47 min" with a red dot, "PO-2026-0091 awaiting your approval · ₹4.2 L", "23 SKUs at reorder point", each with a chevron.

12. Notifications. Title "Notifications", chip "Mark all read". Rows grouped under "Today" and "Yesterday": a 6px dot (red for urgent, black for unread, none for read), a title like "Order #ORD-88213 exhausted its fallback chain", sub-line "3 locations rejected · assign manually", time "09:41". One row "Phoenix Citadel accepted 14 orders first-attempt today" with a green dot. Footer link "Notification preferences".

13. Approval detail. Reached from "Needs you". Eyebrow "STOCK ADJUSTMENT", "Requested by Ravi · Bhiwandi DC · 10:42", grey reason pill "Damaged", bin "WH1-B-01-04" in monospace, SKU "ASH-TEE-OVS-BLK-M". Two-column block "On hand now 412" and "After approval 212" with "−200 units · ₹82,000 at cost" in red between them. Two photo placeholders labelled "Evidence". Muted line "Above the 20-unit threshold. Nothing has changed in stock yet." Bottom: outlined "Reject" and black "Approve −200".

ACT 3. OMNI TAB, THE REASON THE PRODUCT EXISTS (5 screens)

14. Omni live board. Title "Omni", right "as of just now". Segmented "Live 14 · Waiting on store 6 · Exhausted 1". Order cards "#ORD-88213 · 2 items · Gomti Nagar, Lucknow · ₹2,598", each with a horizontal attempt chain of small chips: "Phoenix Palassio · offered · 04:12 left" with a black border, "Phoenix Citadel" grey, "Bhiwandi DC" grey. One exhausted card whose chain reads "Model Town · rejected: can't find it", "Phoenix Citadel · timed out", "Bhiwandi DC · rejected: no capacity", all in red, with a black chip "Assign manually".

15. Order attempt history. Title "#ORD-88213". Header: customer area, two line items with monospace SKUs, "Placed 09:12 · Shopify". A vertical timeline of attempt cards: "1 · Phoenix Palassio · score 0.91 · offered 09:12 · rejected 09:18 · Can't find the item · +₹0 · +6 min" with the reason in red; "2 · Phoenix Citadel · score 0.84 · offered 09:18 · accepted 09:21" with accepted in green; a muted "3 · Bhiwandi DC · fallback, not used". A footer card "What this jump cost: ₹0 extra shipping · 6 min delay · Phoenix Palassio trust 0.87 → 0.85". Bottom: outlined "Re-route now" and black "Assign to a location".

16. Omni scorecard. Segmented "7d · 30d · 90d". KPI grid "88% FIRST-ATTEMPT ACCEPTANCE ▲4pp" green; "2.1% JUMP RATE ▲0.4pp" red; "₹18.6 L COST OF JUMPS · 142 hours of delay"; "3 OVERSELLS · 0.2%, target under 0.5%". Card "Why locations reject" with bar rows "Can't find it 41", "Stock number wrong 12", "No capacity 9", "Past cut-off 6", "No response 4". Table "Locations by trust", columns Location, Trust, Accept %, Jumps, five rows, the lowest "0.41" in red. Chart "Jump rate by week": black line, dashed grey target at 1%. Two chips in the header: "Routing rules", "Availability lookup".

17. Routing rules. Single-select strategy rows with a black radio dot: "Nearest first" selected, "Cheapest first", "Warehouse first", "Clear aged stock first", "Balance load". Card "Weights": five slider rows Distance, Stock confidence, Capacity left, Time to cut-off, Cost to serve, each a black track on a grey rail with its value right-aligned. Card "Safety buffers": toggle "Auto-tune per location from its own failure rate" on, muted "Phoenix Palassio 2 units · Model Town 6 units". Show the dry-run bottom sheet: "Dry run · last 30 days of real orders", three inline stats "Jumps 61 → 44", "Delivery cost ₹4.2 L → ₹4.6 L" with the increase in red, "Split shipments 12 → 9", buttons "Keep current" and black "Apply new rules".

18. Availability lookup. Title "Where can we ship this from?". Inputs: SKU search showing "ASH-TEE-OVS-BLK-M · Oversized Tee · Black · M", Customer pincode "226010", Radius "50 km". Ranked result rows: "Phoenix Palassio · 3 sellable · 4.2 km · today · confidence 94%", "Phoenix Citadel · 7 sellable · 610 km · 2 days · confidence 91%", "Bhiwandi DC · 48 sellable · 1,340 km · 3 days · confidence 99%", and "Model Town · excluded · stale 47 min" in muted text. Footer "Published to storefront: 58 sellable · as of 2 min ago".

ACT 4. OPS TAB, WHAT IS MOVING (5 screens)

19. Sales orders. Title "Orders", chip "Import CSV". A horizontal funnel of chips with counts: "Confirmed 22 · Allocated 18 · Picking 9 · Packed 6 · Dispatched 148 · On hold 3". List rows: "SO-2026-0417 · Shopify · 3 lines · ₹4,197" with the id in monospace, a status pill ("Picking" grey, "On hold" red, "Dispatched" green), sub-line "Bhiwandi DC · Ravi · cut-off 16:00". Search "Order, customer, AWB".

20. Sales order detail. Title "SO-2026-0417" monospace, pill "Picking". Card "Lines": three rows with monospace SKU, name, qty, and a per-line status "Picked 2 / 2", "Short 1 / 2" in red, "Allocated". Card "Progress": a five-step horizontal stepper Confirmed, Allocated, Picking (current, black), Packed, Dispatched, with timestamps under the completed steps. Card "Documents": rows "Packing slip", "Shipping label", each with a chip "PDF" disabled until packed. Card "Customer": name, area, phone masked. Bottom: outlined "Put on hold" and black "Re-allocate short line".

21. Purchase orders. Title "Purchase orders", chip "+ New PO". Chips "Draft 2 · Awaiting approval 1 · Approved 4 · Partially received 2 · Closed 31". Rows: "PO-2026-0091 · Tirupur Knits · 12 lines · ₹4.2 L" with a grey pill "Awaiting approval", sub-line "Expected 14 Sep · Bhiwandi DC".

22. Purchase order detail. Title "PO-2026-0091", pill "Awaiting approval". Card "Supplier": Tirupur Knits, GSTIN in monospace, terms "Net 30". Table "Lines": SKU, Ordered, Received, Rate; five rows shown with "7 more"; totals row "₹4,20,000". Card "Receipts": "GRN-2026-0142 · 4 of 12 lines · Ravi · 8 Sep" with a chip "GRN PDF". Bottom: outlined "Send back to draft" and black "Approve PO".

23. Transfers. Title "Transfers", chip "+ New transfer". Segmented "In transit 4 · Suggested 3 · Done". In-transit rows: "TR-0088 · Bhiwandi DC → Phoenix Palassio · 120 units · dispatched 7 Sep · ETA today". Suggested rows are the rebalancing engine's cards: "Move 8 × ASH-CRG-OLV-32 · Phoenix Citadel → Phoenix Palassio · dead 30 days there, 7 days cover here · expected gain ₹9,800" with a black chip "Create transfer".

ACT 5. DATA TAB, WHAT THE SYSTEM KNOWS (9 screens; a 64px black Scan button bottom-right on screens 24, 28 and 29)

24. Locations. Title "Locations", chip "+ Add". Segmented "All 41 · Warehouses 1 · Stores 40". Search "Search location". Rows with a status pill on the right: "Bhiwandi DC · Warehouse · 6 zones · 2,304 bins" Live green; "Phoenix Palassio, Lucknow · Store · POS synced 3m ago" Live green; "Phoenix Citadel, Indore · Store · POS synced 22m ago" Stale grey; "Model Town, Ghaziabad" Quarantined red with a red sub-line "Stock went negative on 2 SKUs · excluded from routing".

25. Location detail, Phoenix Palassio. Pills "Live" green, "Store", "Fulfils online", "Pickup". KPI grid "1,212 UNITS · as of 3 min ago", "₹38.4 L STOCK VALUE", "91% FIRST-ATTEMPT ▲3pp" green, "0.87 TRUST · top 5 of 41". Card "Connector": "Ginesys POS · pull every 15 min · last success 3 min ago · 412 rows changed" with a green dot and chips "Sync now", "Settings". Card "Capacity": "Daily picks 40 · used 26 today", "Dispatch cut-off 16:00", "Serviceable radius 25 km". Card "Staff": "Priya · Store Manager", "Karan · Store Associate". Bottom: outlined "Pause routing" in red text.

26. Add location, step 2 of 4. Section "Where it is": Name, Address, Pincode, a grey map placeholder. Section "How it serves online orders": toggles "Fulfils online orders" on, "Allows customer pickup" on; inputs "Serviceable radius (km) 25", "Daily pick capacity 40", "Dispatch cut-off 16:00". Section "Stock source": select "POS connector · Ginesys" with sub-line "Pull every 15 min", a masked field "API key ••••••••" with the note "Stored in a vault. Never shown again." Note "This location cannot route orders until its first sync passes with no negative stock." Primary "Run first sync (dry run)".

27. Dry-run result and unmapped SKUs. Title "Dry run · Phoenix Citadel". Four inline stats "Rows found 1,318", "Matched 1,290", "Unmapped 28", "Negative stock 0" with the 0 in green. A list "Unmapped POS SKUs": rows like "GNS-88213 · 'OVS TEE BLK M' · seen 14×" with a black chip "Map"; one row expanded with a search field showing "ASH-TEE-OVS-BLK-M" ready to confirm. Muted line "Unmapped rows are never dropped. They wait here." Primary "Go live" disabled with the note "Map 28 SKUs first", and a secondary "Go live and keep mapping later".

28. Products. Title "Products", chip "Import". Search "Name, SKU, barcode". Chips "All 4,120 · Low stock 23 · No barcode 8 · Batch-tracked 140". Rows: 40px grey image, name, monospace SKU, on-hand right-aligned, and a pill "Healthy" green, "Reorder due" grey, or "Out of stock" red.

29. Product detail. Title "ASH-TEE-OVS-BLK-M" monospace, chip "Save". Image placeholder 96px. Inputs Name, Category, Unit of measure "piece", Pack size 1, MRP ₹1,299, Cost ₹410, Reorder point 40, Safety stock 20. Section "Barcodes": two monospace barcodes and a row "+ Add barcode". Section "Tracking": toggles Batch off, Expiry off, Serial off. Read-only section "Stock": "66 on hand across 4 bins and 3 stores · as of 2 min ago" with a chevron. No delete button.

30. Import CSV. Title "Import products". Step chips "Upload · Map · Check · Import" with Check active. Summary strip "4,118 ready · 2 errors · 0 warnings". A table of the two error rows: row number, the offending value in monospace, the reason in red "Duplicate barcode 8901234567". Toggle "Skip rows with errors" on. Primary "Import 4,118 products". Secondary "Download error report".

31. Reports. Title "Reports". Rows under uppercase eyebrows. STOCK: "Stock summary", "Stock ledger", "Ageing and dead stock", "Near expiry". MOVEMENT: "GRN register", "Dispatch register", "Adjustments", "Transfers", "Count variances". PEOPLE: "Operator productivity". OMNI: "Jump analysis", "Location trust". Each row has a chevron.

32. Report view, Stock summary. Segmented "By SKU · By location · By category". Chips "CSV", "PDF", "Share". Table with columns SKU, On hand, Reserved, Value, numbers right-aligned, ten rows, a bold totals row "647,212 · 14,102 · ₹21.4 Cr". Footer "as of 09:40 · 41 locations · 3 stale, excluded".

ACT 6. TEAM TAB: PEOPLE, RULES, MONEY, AND THE END (5 screens)

33. Team. Title "Team", chip "+ Invite". Segmented "People 14 · Invites 3". Rows: avatar initial, name, uppercase role badge OWNER, ADMIN, MANAGER, OPERATOR, STORE MANAGER, STORE ASSOCIATE, or VIEWER, and a scope sub-line "Bhiwandi DC", "Phoenix Palassio", or "All locations". First row "Aarav Shah · OWNER · you". Show the invite bottom sheet: Email or phone, Role select, Locations multi-select chips, note "Managers can invite operators and viewers only", primary "Send invite".

34. Member detail, Meena. Header: initial, "Meena Iyer", badge MANAGER, "Bhiwandi DC · joined 12 Mar 2026". Card "Access": Role select, Locations chips, toggle "Can approve adjustments" on. Card "Recent actions": rows "Approved −200 units · 10:44", "Assigned PL-0931 to Suresh · 09:30". Bottom: outlined "Revoke access" in red text and black "Save".

35. Settings. Title "Settings". Card "Business": Currency INR, Timezone Asia/Kolkata, GST number, Financial year starts April. Card "Stock rules": "Pick order FEFO", "Adjustment approval above 20 units", "Store stock stale after 15 min", "Offer timer 15 min". Card "Document numbering" with "PO-2026-0091", "SO-2026-0417", "GRN-2026-0142" in monospace. Card "Notifications": toggles "Stale POS", "Exhausted orders", "Approvals", "Low stock". Card "Account": rows "Sign out", "Switch organisation".

36. Plan and billing. Card "Plan": "Growth · ₹12,000 / month", green pill "Active", "Renews 1 Oct 2026". Four thin usage bars "Users 14 / 25", "Locations 41 / 50", "SKUs 4,120 / 10,000", "Orders this month 3,812 / 5,000", the fullest bar's label in black, chip "Upgrade". Card "Payment method": "Razorpay · card ending 4421", chip "Change". Card "Invoices": rows "Sep 2026 · ₹12,000 · Paid" green, "Aug 2026 · ₹12,000 · Paid" green, each with a chip "PDF", and one row "Jul 2026 · ₹8,000 · Failed, retried" with Failed in red.

37. Audit log and danger zone. Title "Audit log", chip "Export". Rows: "Aarav approved PO-2026-0091 · 09:52", "Meena changed Ravi's role to Supervisor · yesterday", "Routing strategy changed to Nearest first · 3 Sep", each with actor, action, target, time. Below, a card "Data": rows "Export everything as a ZIP" and, after a hairline, "Delete organisation" in red text. Show the delete confirmation sheet: "Type ASHVA to confirm", a text input, the note "Deletes 41 locations, 4,120 products and 2 years of ledger after a 30-day hold", and a solid red button "Delete organisation", the only solid red button in the application.

FLOW

Welcome → Create account → Create organisation → wizard steps 2 to 5 → Setup complete → First dashboard. Every later open goes Unlock → Dashboard. Home "Needs you" rows open Approval detail, Location detail, Purchase order detail, or Products filtered to low stock. Omni holds the live board and the scorecard as two tabs; a board card opens Order attempt history; Routing rules and Availability lookup sit behind the two chips on the scorecard. Ops holds Orders, Purchase orders, Transfers as three tabs. Data holds Locations, Products, Reports as three tabs; Add location runs into Dry-run result. Team holds Team, Settings, Plan and billing, Audit log as a stacked list. Do not put scan sessions, numpads, pick or receive screens, or store-associate screens in this application; those belong to the Floor and Store applications.
```
