# Stitch — Application 2 of 5: WAREHOUSE FLOOR

Persona: the picker, packer, receiver on a shared warehouse phone. Screens: **20** across six acts.

Run it the same way as Application 1: one Stitch project, `DESIGN.md` uploaded once, paste the whole prompt; if Stitch stops early, keep the CONTEXT, PERSONA, DESIGN, SHELL block as a fixed header and send one ACT at a time prefixed "Continue the Warehouse Floor application."

---

## The prompt

```
APPLICATION CONTEXT

Ledger is a stock system for Indian D2C brands that sell online and through physical stores. The wound it treats: the stock physically exists, but the software does not reliably know where. Ledger records every unit movement as an append-only ledger, derives on-hand per SKU per bin per location, pulls each store's stock from its POS, publishes one sellable number to the storefront, routes online orders to the best location with a stored fallback chain, and logs every failure with its reason so routing improves every week. Every number carries an "as of" age. An unknown value is an em dash, never a zero.

Ledger ships as five separate mobile applications that share one design system (DESIGN.md): Owner, Warehouse Floor, Warehouse Manager, Store, and Super Admin. This prompt is the WAREHOUSE FLOOR application, complete, from a new worker's first day to handing the device back at the end of a shift. It is the tool the physical world uses to tell the ledger what just happened. Every confirmed scan is written to a local outbox first and synced when the network allows, so the app keeps working in dead aisles; nothing is lost, and a conflict is shown to the worker in plain words, never dropped silently. The app never asks the worker to type when a scan will do, never asks them to read a chart, and never shows another warehouse's stock.

PERSONA

Ravi Yadav, 24, picker, packer and receiver at "Bhiwandi DC", Ashva Apparel's only warehouse. Eight-hour shift, gloves on, phone in one hand, sometimes a Bluetooth scanner gun that types into whichever field is focused. He does not own the device: he taps his name on a shared phone and enters a 4-digit PIN. He receives cartons from suppliers, puts them away in suggested bins, picks orders in bin-walk order, packs boxes, hands them to the courier, and counts bins when asked. His manager is Meena, his shift lead is Suresh. He is measured on lines per hour and scan accuracy. He wants the app to tell him exactly one thing at a time: where to go, what to scan, how many. When something is wrong (wrong bin, stock missing, no network) he wants one plain sentence and one button, never a form.

DESIGN

Follow DESIGN.md exactly, Floor mode. White everywhere, hairline borders, no shadows. Black is the only action colour. Green only where something is confirmed, healthy or synced; red only where something is wrong, blocked or urgent. Everything else black and three greys. Inter with tabular numbers; every SKU, bin, order, PO, GRN, AWB and serial in JetBrains Mono. Quantities are 40px numbers. Tap targets are at least 56px. Task type labels are 18px semibold.

SHELL

No bottom nav, no tabs, no KPI cards, no menus anywhere in this application. One task per screen. Top bar: a back arrow (or the worker's name on the home screen), the screen title, and on the right a sync chip that reads green dot "Synced 2m ago", grey dot "Offline · 6 queued", or red dot "2 issues", plus a small scanner-gun glyph when a Bluetooth scanner is connected. The primary action is one full-width black 64px button pinned to the bottom. Secondary actions are outlined 56px buttons stacked above it. Quantities are edited on a 3×4 numpad, never the system keyboard. A 64px black circular Scan button sits bottom-right on the home screen only; inside a task, scanning is always live and needs no button. Android, portrait, 390×844.

ACT 1. FIRST DAY (3 screens)

1. Join with a code. Title "Join your team". Line "Enter the 6-character code from your manager." Six monospace code cells, the current cell with a darker border. Once filled, a preview card: "Ashva Apparel · Bhiwandi DC · Operator". Input "Your name" prefilled "Ravi". Primary "Join". Show the error state: cells outlined red with the line "That code has expired. Ask Meena for a new one."

2. Create your PIN. Line "You will use this to unlock the warehouse phone." Four dots and a 3×4 numpad of large white keys. Second state "Enter it again", with a green check beside the dots when the two match; the flow continues automatically. Muted footer "Your PIN is yours. Do not share it."

3. Who are you. The shared device's resting screen. Muted line "Bhiwandi DC · Device 03 · 14:02". A grid of avatar chips with first names: Ravi, Suresh, Anil, Deepa. Tapping one selects it with a black border and reveals four PIN dots and the numpad beneath. Show the wrong-PIN state: dots shake and a red line "Wrong PIN" appears. Footer "Not on this list? Ask your manager to add you."

ACT 2. SHIFT START (2 screens)

4. My Tasks, the home. Top bar "Ravi · Bhiwandi DC" and the sync chip with a green dot "Synced 2m ago". Muted line "Tuesday · shift 09:00–17:00". A black-bordered card at the top, the push that just arrived: "New pick list assigned · PL-0931 · 9 lines · Zone A" with a black chip "Start". Then a stack of 96px task cards, each with a 24px outline icon, the task type at 18px, a large count on the right, and one muted sub-line: "Pick 7 · 3 orders · Zone A"; "Put away 12 · from GRN-2026-0142 · in RECEIVING"; "Receive 1 · PO-2026-0089 · Tirupur Knits · truck at gate 2"; "Pack 3 · picked, waiting for boxes"; "Dispatch 2 · boxes ready for courier"; "Count 0 · nothing assigned" rendered muted. Scan button bottom-right.

5. Scan lookup. The top 55% is the camera viewfinder (a dark grey area with a thin white bracket frame and a torch icon top-right). The bottom 45% is a white bottom sheet with a drag handle. Variant A, product found: "ASH-TEE-OVS-BLK-M" in monospace, "Oversized Tee · Black · M", then rows "WH1-A-03-02 · 48", "WH1-A-03-05 · 12", "RECEIVING · 6" with bins in monospace and quantities right-aligned, a muted line "66 on hand · 14 reserved · as of just now", and two buttons "Move" and "Done". Variant B, bin found: "WH1-A-03-02" and the four SKUs inside with quantities. Variant C, order found from a packing-slip QR: "SO-2026-0417 · Picking · 5 of 7 lines" with a chip "Open". Variant D, unknown: red text "Barcode not recognised" and a single outlined button "Ask a manager to link this barcode".

ACT 3. INBOUND (4 screens)

6. Receive against PO. Top bar: back, "Receive · PO-2026-0089", "4 of 9 lines". Muted line "Tirupur Knits · expected 320 units · scan any carton to jump to its line". A list of PO lines: monospace SKU, name, "received / expected"; finished rows carry a small green check and "48 / 48"; the current row has a darker border and "12 / 40". Below, the quantity "12" at 40px above a numpad, three chips "Short", "Over", "Damaged", and a chip "Add photo". Primary "Confirm line". Show "Damaged" selected as a black-filled chip with a photo placeholder and the note "Photo required for damaged".

7. Batch, expiry and serials. For a tracked product. Title "Receive · ASH-HD-GRY-L". Line "This product is batch and expiry tracked." Inputs: Batch "LOT-2609-A" in monospace, Expiry "Mar 2028" as a month picker, quantity "24" at 40px with the numpad. Primary "Confirm 24 units". Show the serial variant: a counter "Serials 3 / 24", the last three scanned serials in monospace, the hint "Scan the next serial", and a red line "Already scanned 2 minutes ago" for a duplicate.

8. Receipt complete. A black check circle and "GRN-2026-0142 created". Summary rows "9 lines · 312 of 320 units · 2 variances", with the variance line in red "8 short on ASH-TEE-OVS-BLK-M · photo attached". Muted "Stock is now in RECEIVING and counts as on hand." Bottom: outlined "Share GRN PDF" with WhatsApp and mail glyphs, primary "Put away now · 9 tasks".

9. Putaway task. Title "Put away · 1 of 9". Card: SKU in monospace, name, "24 units · LOT-2609-A". Eyebrow "SUGGESTED BIN", then "WH1-A-03-02" at 40px monospace, muted "same product already here · 48 units · 72 capacity". Row "Scan the bin to confirm". Bottom: outlined "Use a different bin", primary "Confirm 24 to WH1-A-03-02". Show the override state: a bottom sheet "Why a different bin?" with single-select rows "Suggested bin is full", "Shelf damaged", "Closer to picking", and primary "Confirm WH1-A-04-01".

ACT 4. OUTBOUND (4 screens)

10. Pick session, line 3 of 7. Top bar: back, "Pick · SO-2026-0417", "3 / 7", and a 4px progress bar. Card one: eyebrow "GO TO BIN", "WH1-A-03-02" at 40px monospace, muted "Zone A · aisle 3 · shelf 2". Card two: eyebrow "PICK", "Oversized Tee · Black · M", "ASH-TEE-OVS-BLK-M" monospace, quantity "4" at 40px with "units". Row "Scan bin, then scan item". Bottom: outlined "Short, can't find enough" above primary "Confirm 4 picked". Show the wrong-bin state on card one: red border and "That's WH1-A-03-05. Go to WH1-A-03-02."

11. Short pick. Title "Short · SO-2026-0417 · line 5". Line "Needed 4 · found 2 at WH1-A-03-02". Single-select reasons: "Bin is empty", "Fewer than expected", "Damaged", "Can't find the bin". Then a card "What next" with a black-bordered suggestion "Check WH1-A-03-05 · 12 units there" and two plain rows "Pick 2 and continue · Suresh is told", "Skip this line · order goes on hold". Primary "Send to Suresh and continue". Muted "The order stays open until Suresh resolves it."

12. Pack. Title "Pack · SO-2026-0417". Card "Box 1 · Medium" listing the three picked lines with quantities and check marks, and a chip "+ Add box". Weight "1.240 kg" at 40px with a green dot "Scale connected" (or a numpad when manual). A chip "Photo of box" optional. Primary "Print packing slip and close box". Show the second state: one line moved to "Box 2 · Small" and the chip "Move to box" on each line.

13. Dispatch handover. Title "Dispatch · 2 boxes". Carrier chips "Delhivery" selected black, "Bluedart", "Ecom Express". Per box a row "SO-2026-0417 · Box 1 · 1.24 kg" with "Scan AWB", which after scanning shows "AWB 2891 7743 2210" in monospace and a green check. Chip "Print label · Bluetooth printer". Primary "Mark 2 boxes shipped". Show the confirmation state: a black check circle and "Stock has left the building. Ledger updated."

ACT 5. STOCK KEEPING (4 screens)

14. Bin transfer. Three stacked step cards. "FROM": scan result "WH1-A-03-02" in monospace with its contents as rows, one selected "ASH-TEE-OVS-BLK-M · 48". "HOW MANY": "12" at 40px with "of 48" muted and the numpad. "TO": "Scan the destination bin", then "WH1-B-01-04". Primary "Move 12 units". Show the error state: destination "QUARANTINE" with the red line "That bin is quarantine. Only a manager can move stock here."

15. Adjustment. Title "Adjust · WH1-B-01-04". Rows "ASH-TEE-OVS-BLK-M · on hand 412". "New count" at 40px showing "409" with the numpad, and a computed "−3 units" in red beside it. Reason chips, one required: "Damaged", "Lost", "Found", "Expired", "Sample". Chip "Add photo". Primary "Post −3 units". Show the threshold state: new count "212", computed "−200 units", a banner "Above 20 units. This goes to Meena for approval. Nothing changes until she approves.", and the primary now reads "Send for approval".

16. Cycle count. Title "Count · CC-0027 · Zone A", progress "bin 14 of 42" with a 4px bar. Card "Scan the bin" showing "WH1-A-02-03" in monospace. Blind mode: a list that grows as items are scanned, each row "ASH-TEE-OVS-BLK-M · 47" with minus and plus steppers, no expected quantity shown. A row "Scan an item not listed". Primary "Bin done · next bin". Show the informed-mode variant: the expected quantity in muted text beside each count.

17. Count submitted. A black check circle and "42 bins counted · sent to Meena for review". Muted "You will not see variances. Your manager reviews and posts them." Primary "Back to tasks".

ACT 6. TRUST AND THE END OF THE SHIFT (3 screens)

18. Working offline. The My Tasks screen with a grey sync chip "Offline · 6 queued" and a slim banner under the top bar: "No network in this aisle. Keep scanning. Everything is saved on this phone." Task cards remain tappable; a pick in progress continues from the cached list. Show the reconnect state: the chip reads "Syncing 6…" with a small grey spinner, then turns green.

19. Sync issues. Top bar: back, "Sync issues", count "2". Line "These scans could not be saved. Fix them here. Nothing is lost." Two cards: "Pick · SO-2026-0417 · line 5" with muted "Someone else moved this stock at 10:42" and chips "Pick from another bin", "Mark short"; and "Adjustment · WH1-B-01-04" with muted "Needs manager approval (above 20 units)" and chip "Send for approval". Footer "1 scan still pending upload". Show the empty state: a centred sentence "Everything is synced." with a green dot.

20. End shift. Title "End shift · Ravi". A summary card with rows "Lines picked 212", "Scan accuracy 99.5%" in green, "Receipts 1 · Putaways 9 · Counts 42 bins", "Time on floor 7h 40m". Muted "Meena sees the same numbers." Outlined "I'm still working". Primary "Hand device back", which returns to Who are you.

FLOW

Join with a code → Create your PIN → Who are you → My Tasks. Every later shift starts at Who are you. Each task card opens its session: Receive runs 6 → 7 (only for tracked products) → 8 → 9; Pick runs 10, with 11 on a shortfall, then 12 → 13. Transfer, Adjust and Count are reached by scanning a bin or item from the Scan button and choosing the action on the sheet. The sync chip opens Sync issues. End shift is a row at the bottom of My Tasks. Do not add a dashboard, chart, KPI card, tab strip, navigation bar, settings screen, or any other location's stock to this application; those belong to the Manager and Owner applications.
```
