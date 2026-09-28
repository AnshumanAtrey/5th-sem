# Stitch — Application 3 of 5: WAREHOUSE MANAGER

Persona: the warehouse manager and her shift supervisor. Screens: **24** across six acts.

Run it the same way as Application 1: one Stitch project, `DESIGN.md` uploaded once, paste the whole prompt; if Stitch stops early, keep the CONTEXT, PERSONA, DESIGN, SHELL block as a fixed header and send one ACT at a time prefixed "Continue the Warehouse Manager application."

---

## The prompt

```
APPLICATION CONTEXT

Ledger is a stock system for Indian D2C brands that sell online and through physical stores. The wound it treats: the stock physically exists, but the software does not reliably know where. Ledger records every unit movement as an append-only ledger, derives on-hand per SKU per bin per location, pulls each store's stock from its POS, publishes one sellable number to the storefront, routes online orders to the best location with a stored fallback chain, and logs every failure with its reason so routing improves every week. Every number carries an "as of" age. An unknown value is an em dash, never a zero.

Ledger ships as five separate mobile applications that share one design system (DESIGN.md): Owner, Warehouse Floor, Warehouse Manager, Store, and Super Admin. This prompt is the WAREHOUSE MANAGER application, complete, from accepting the owner's invite to the end-of-day report. The manager keeps one warehouse running today and decides what the floor cannot decide alone: approvals above a threshold, who picks what, short picks, receipt variances, count sessions and their variances, transfers out to stores, and investigations in the ledger. She sees only her location. She does not configure the business, see billing, set routing rules, or manage other locations. A shift supervisor uses the same application with fewer rights: he can assign and resolve, but cannot approve or post.

PERSONA

Meena Iyer, 34, warehouse manager at "Bhiwandi DC", Ashva Apparel's only warehouse. Six staff on shift, 2,304 bins, about 320 inbound units and 150 outbound orders a day. She moves between a small office and the floor; the phone is always with her, a laptop rarely. Her bad days: a supplier short-ships and nobody notices until a customer order fails; a picker marks 200 units damaged and the stock value drops with no second pair of eyes; a count finds −18 units and she cannot tell who moved them or when. She wants "what needs me now" at the top, every number tied to a person and a time, and approve or reject as one tap with the evidence in front of her. Her shift lead is Suresh, 29. Her owner is Aarav, who she reports to with one PDF at the end of the day.

DESIGN

Follow DESIGN.md exactly. White everywhere, white cards with a 1px hairline border, no shadows. Black is the only action colour; the active segment, tab and nav item are black-filled. Green only where something went up or is healthy; red only where something went down, is blocked, or needs a human now. Everything else black and three greys. Inter with tabular numbers, right-aligned in columns. Every SKU, bin, order, PO, GRN, transfer and count id in JetBrains Mono. KPI cards are value first with the uppercase label under the number, a green ▲ or red ▼ delta bound to its comparison window in one phrase, and an "as of" age.

SHELL (every screen after Act 1)

Top bar: screen title left, sync chip right (green dot "Synced 1m ago", red dot "2 issues"). Fixed bottom nav, four items: Board, Approvals, Ledger, Lookup. Active item black with a 4px dot. A 64px black circular Scan button bottom-right above the nav on Board and Lookup screens. Android, portrait, 390×844.

ACT 1. ENTRY (2 screens)

1. Accept invite. Opened from the link Aarav sent. A card "Aarav Shah invited you to Ashva Apparel as Manager of Bhiwandi DC". Inputs: Email prefilled and locked, Create password with show/hide. Primary "Accept and continue". Hairline "or". Secondary "Continue with Google". Show the expired state: the card reads "This invite expired on 10 Mar. Ask Aarav to resend it." with a single outlined button "Request a new invite".

2. Unlock. Small line "Ashva Apparel · Bhiwandi DC · Meena", a biometric glyph with "Touch to unlock", and a text link "Use PIN instead". Show the PIN variant: four dots and a 3×4 numpad.

ACT 2. THE BOARD (4 screens)

3. Board, the home. Title "Bhiwandi DC", sync chip "Synced 1m ago". Eyebrow "NEEDS YOU NOW · 4", then four card rows with chevrons: "Approval · −200 units · Damaged · Ravi · WH1-B-01-04"; "Short pick · SO-2026-0417 line 5 · 2 units missing"; "Truck at gate 2 · PO-2026-0089 · Tirupur Knits"; "Count CC-0027 submitted · 6 variances". Then a 2×2 grid of KPI cards: "320 INBOUND TODAY · 8 short"; "148 OUTBOUND TODAY ▲12% vs yesterday" in green; "99.2% PICK ACCURACY ▼0.3pp" in red; "6 STAFF ON SHIFT · 2 pick, 3 putaway, 1 receiving". Then a chart card "Lines picked per hour" with one black line across 09:00–17:00 and a dashed grey line for yesterday.

4. Notifications. Title "Notifications", chip "Mark all read". Rows grouped under "Today" and "Yesterday", each with a 6px dot (red urgent, black unread, none read), a title, a sub-line and a time: "Ravi requested a −200 unit adjustment · WH1-B-01-04 · 10:42"; "Truck arrived for PO-2026-0089 · gate 2 · 09:58"; "Count CC-0027 submitted · 6 variances · 09:30"; "Short pick on SO-2026-0417 · line 5 · 10:44" with a red dot. Footer link "Notification preferences".

5. Approvals queue. Title "Approvals", chip "History". Segmented "Pending 4 · Done today 7". Rows grouped under uppercase eyebrows. ADJUSTMENTS: "−200 units · Damaged · Ravi · WH1-B-01-04 · ₹82,000 at cost". COUNTS: "CC-0027 · Zone A · 6 variances · −18 net". RECEIPTS: "GRN-2026-0142 · 8 short · Tirupur Knits · photo". TRANSFERS: "TR-0090 → Phoenix Citadel · 80 units · Suresh". Each row carries a time and a grey pill "Waiting".

6. Approval detail. Eyebrow "STOCK ADJUSTMENT", "Requested by Ravi · 10:42", a grey reason pill "Damaged", "WH1-B-01-04" and "ASH-TEE-OVS-BLK-M" in monospace. A two-column block "On hand now 412" and "After approval 212" with "−200 units · ₹82,000 at cost" in red between them. Two photo placeholders labelled "Evidence". Muted line "Above the 20-unit threshold, so it waits for you. Nothing has changed in stock yet." Bottom: outlined "Reject" and black "Approve −200". Show the reject sheet: a text input "Tell Ravi why" and primary "Send back".

ACT 3. RUNNING THE FLOOR (5 screens)

7. Assign picks. Segmented "Unassigned 3 · In progress 4 · Done 11", top-right chip "Auto-assign". Pick-list cards: "PL-0931 · 2 orders · 9 lines · Zone A–B", "~14 min walk", a grey pill "Cut-off 14:00", three avatar chips Ravi, Suresh, Anil and a chip "Assign". One card expanded with Anil selected by a black border and "3 lines in progress" under his name. A chip at the bottom of the list "Combine 3 lists into one wave".

8. Short-pick resolution. Title "Short pick · SO-2026-0417 · line 5". Card: "Needed 4 · picked 2 · Ravi · 10:42 · reason: fewer than expected · WH1-A-03-02". Card "Stock elsewhere": rows "WH1-A-03-05 · 12 units", "RECEIVING · 6 units, not yet put away". Single-select action rows: "Pick 2 more from WH1-A-03-05 · reassign to Ravi" selected, "Ship 2 now, back-order 2 · customer notified", "Hold the order". A toggle on: "Create a count task for WH1-A-03-02 (bin shows 48, only 2 found)". Primary "Resolve".

9. Receipt review. Title "GRN-2026-0142 · PO-2026-0089". Row "Tirupur Knits · received by Ravi · 09:58–10:31". A table with columns SKU, Ordered, Received, Variance; nine rows; variance cells "−8" in red on one row with a photo thumbnail beside it, "0" plain elsewhere. Segmented "Accept as received · Dispute with supplier". Show the dispute state: a text input "Note to Tirupur Knits", a toggle "Attach photos" on, and the primary reading "Send dispute and close receipt".

10. Putaway queue. Title "Putaway · 9 waiting". Rows: monospace SKU, quantity, batch, suggested bin in monospace, and "in RECEIVING for 42 min", with the time in red past 60 minutes. Chips "Assign all to…", "Reprioritise". Muted line "Stock in RECEIVING is on hand but cannot be picked."

11. Staff on shift. Title "On shift · 6", inline stats "34 lines/hour avg · 99.2% accuracy". Rows per person: avatar initial, name, current task "Picking PL-0931 · line 5 of 9", "38 lines/hour", accuracy "99.5%" in green or "97.1%" in red, and a chip "Reassign". Footer "Shift lead: Suresh".

ACT 4. COUNTING AND STOCK (5 screens)

12. Create count session. Title "New count". Scope as single-select cards: "Zone" selected with a chip row "Zone A" selected, "SKU list", "Full warehouse", "Bins with variance history". Toggle "Blind count" on with the note "Counters do not see the expected quantity." Assign chips Ravi, Anil. A muted estimate "42 bins · about 90 min". Primary "Start count".

13. Count sessions. Segmented "Counting 1 · Review 1 · Posted 12". Rows: "CC-0027 · Zone A · 42 bins · Ravi · 14 / 42" with a thin progress bar; "CC-0026 · SKU list · 6 variances" with a black-bordered pill "Review"; posted rows "CC-0025 · Zone B · 0 variance" and "CC-0024 · Full · −18 posted".

14. Variance review. Title "Count CC-0026". Three inline stats "Bins counted 42", "Lines with variance 6", "Net variance −18 units" with the negative in red. A table with columns SKU, Bin, Expected, Counted, Variance; six rows; variance cells "−4" in red or "+2" in green; each row has a small chip "Recount". Muted line "Approving posts one adjustment per line with reason cycle count." Bottom: outlined "Recount 6 lines" and black "Approve and post".

15. Create transfer. Title "New transfer". Row "From Bhiwandi DC" fixed. Select "To" showing "Phoenix Citadel, Indore". Lines added by scan or search: "ASH-CRG-OLV-32 · 8", "ASH-TEE-OVS-BLK-M · 24", each with a quantity and a numpad on tap. Muted line "Stock becomes in-transit at dispatch and leaves Bhiwandi's available immediately." Primary "Create transfer TR-0091". Show the created state: chips "Gate pass PDF", "Packing list PDF" and a black chip "Dispatch".

16. Transfers. Segmented "Outgoing 4 · Incoming 1 · Done". Outgoing rows: "TR-0088 → Phoenix Palassio · 120 units · in transit · ETA today"; "TR-0091 → Phoenix Citadel · 32 units · draft" with a chip "Dispatch". Incoming row "TR-0087 from Ambience Mall, Gurugram · 40 units · arriving" with a black chip "Receive". Show the receive state: lines with scan checks, a discrepancy "38 of 40 · 2 missing" in red, and primary "Confirm receipt".

ACT 5. LEDGER AND LOOKUP (5 screens)

17. Ledger. Chips "Today" selected, "SKU", "Bin", "User", "Type"; top-right chip "Export". Rows grouped under time eyebrows like "10:00–11:00": a type eyebrow PICK, PUTAWAY, RECEIPT or ADJUST; monospace SKU; "from → to" bins in monospace; a signed quantity right-aligned ("−4" red when stock leaves the building, "+48" green when it enters, plain black for internal moves); sub-line "Ravi · 10:42 · SO-2026-0417".

18. Movement detail. Title "Move M-88213". Rows: type "ADJUST", "ASH-TEE-OVS-BLK-M", "WH1-B-01-04", "−200 units", "before 412 → after 212", "Ravi · 10:42 · approved by Meena · 10:44", reference "ADJ-0142" as a chip that opens the approval, two photo thumbnails, and a small muted monospace "opId 7f3a…". Footer "Ledger rows cannot be edited. To correct, post a new adjustment."

19. SKU detail. Title "ASH-TEE-OVS-BLK-M" in monospace, chips "Adjust", "Transfer". Header card: 64px grey image, "Oversized Tee · Black · M", barcode in monospace, "MRP ₹1,299 · Cost ₹410 · reorder at 40". A 2×2 KPI grid "66 ON HAND", "14 RESERVED", "52 AVAILABLE", "24 IN TRANSIT" and the line "as of just now". Card "Where it is" with bar rows "WH1-A-03-02 48", "WH1-A-03-05 12", "RECEIVING 6". Card "Last 30 days" with a sparkline of on-hand and the rows "Received 120 · Picked 96 · Adjusted −3".

20. Bin detail. Title "WH1-A-03-02" in monospace, chip "Print label". An 80px QR placeholder with the code beneath. Row "Zone A · Aisle 3 · Shelf 2 · Storage · capacity 72". KPI pair "48 UNITS", "1 SKU". A list of contents with a chip "Move" per row. Muted footer "Last counted 11 Aug · variance 0". Show the print sheet: single-select "This bin", "This aisle · 8 bins", "Zone A · 384 bins", primary "Generate PDF".

21. Low stock and near expiry. Segmented "Low stock 23 · Near expiry 4". Rows: monospace SKU, name, "32 on hand · reorder at 40 · 6 days cover", supplier "Tirupur Knits", chip "Add to PO". Top chip "Create suggested PO · 23 lines" with the note "Goes to Aarav for approval". Near-expiry rows read "LOT-2603-B · expires in 21 days · 40 units · WH1-C-02-01" with the days in red under 30.

ACT 6. DAY END AND SELF (3 screens)

22. Today's report. Title "Today · 9 Sep", chips "Share PDF to Aarav", "CSV". KPI grid "320 RECEIVED · 8 short", "148 DISPATCHED ▲12% vs yesterday" green, "99.2% ACCURACY ▼0.3pp" red, "−18 COUNT VARIANCE · posted". Card "Exceptions" with rows "Short picks 3 · resolved 3", "Supplier disputes 1", "Approvals 7". Chart "Lines by hour" with one black line.

23. Location settings, read-only. Title "Bhiwandi DC · settings". Rows: "Adjustment approval above 20 units", "Dispatch cut-off 16:00", "Daily pick capacity 400", "Pick order FEFO", "Receiving bins RECEIVING, RECEIVING-2", "Staging STAGING-01". Muted line "Only the owner or an admin can change these." Chip "Request a change". Show the request sheet: a text input to Aarav and primary "Send request".

24. My settings. Rows: notification toggles "Approvals", "Short picks", "Stale sync", "Truck arrivals"; "Change PIN"; "Biometric unlock" toggle; "Sign out"; "Switch device". Footer "Meena Iyer · Manager · Bhiwandi DC".

FLOW

Accept invite → Unlock → Board. Every later open goes Unlock → Board. Board rows open Approval detail, Short-pick resolution, Receipt review, or Variance review. The Approvals tab opens the queue, which opens Approval detail or Variance review. The Ledger tab opens the Ledger, whose rows open Movement detail. The Lookup tab opens by scan or search into SKU detail or Bin detail, with Low stock as a chip. Assign picks, Putaway queue, Staff on shift, Count sessions and Transfers are chips on the Board under the KPI grid. Today's report, Location settings and My settings are rows at the bottom of the Board. Do not add billing, plan, routing rules, other locations, store screens, or numpad scan sessions to this application; the first belong to the Owner, the last to the Floor.
```
