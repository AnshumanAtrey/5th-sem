# Stitch — Application 4 of 5: STORE

Persona: the store manager and store associate on one shared phone behind the counter. Screens: **20** across five acts.

Run it the same way as Application 1: one Stitch project, `DESIGN.md` uploaded once, paste the whole prompt; if Stitch stops early, keep the CONTEXT, PERSONA, DESIGN, SHELL block as a fixed header and send one ACT at a time prefixed "Continue the Store application."

---

## The prompt

```
APPLICATION CONTEXT

Ledger is a stock system for Indian D2C brands that sell online and through physical stores. The wound it treats: the stock physically exists, but the software does not reliably know where. So an online order gets routed to a store whose stock number is wrong, the store cannot find the item, and the order jumps to another location or dies. Ledger pulls each store's stock from its POS, publishes one sellable number to the storefront, routes each online order to the best location with a stored fallback chain, logs every jump with its reason and its rupee cost, and feeds those reasons back into each location's trust score. Every number carries an "as of" age. An unknown value is an em dash, never a zero.

Ledger ships as five separate mobile applications that share one design system (DESIGN.md): Owner, Warehouse Floor, Warehouse Manager, Store, and Super Admin. This prompt is the STORE application, complete, from a store associate's first day to closing the store at night. A store is a location whose stock comes from its POS, not from a picker. The store's job in Ledger is to say yes or no to online orders quickly and honestly, find and hand over what it said yes to, take returns from anywhere, sell a size it does not have from another location, and never let a wrong stock number leak into the shared pool. Every store stock number carries an as-of age and a confidence; when the POS goes quiet, the store's confidence collapses and it stops winning orders instead of lying. "Can't find it" is one tap, and it does three things at once: adjusts the stock here, releases the reservation, and re-routes the order to the next location. The store manager and the store associate share the application; the manager additionally sees the scorecard, sync health, staff, and settings.

PERSONA

Priya Nair, 27, store manager at "Phoenix Palassio, Lucknow", one of Ashva Apparel's forty stores. Karan, 21, and Neha, 22, are her associates. Three people, one shared phone behind the counter, a Ginesys POS. Thirty to fifty walk-in bills a day and ten to twenty online orders offered. Priya's fear is an order she accepted that Karan cannot find, and the customer-service call that follows; or a stock number the POS says is 3 while the shelf says 0. Karan's need is to know in one glance whether an order is waiting and how long he has. Both want the application to stay out of the way of the customer standing in front of them.

DESIGN

Follow DESIGN.md exactly. White everywhere, hairline borders, no shadows. Black is the only action colour. Green only where something is accepted, healthy or synced; red only where something is late, failing, or needs a human now. Everything else black and three greys. Inter with tabular numbers; every SKU, order, AWB, transfer and code in JetBrains Mono. Countdown timers are the largest text on an offer card. Tap targets are at least 56px. Quantities use a numpad, never the system keyboard.

SHELL (every screen after Act 1)

Top bar: the store name or screen title left; on the right a POS sync chip that reads green dot "POS synced 3m ago" or red dot "POS stale 47 min". Fixed bottom nav, three items: Orders, Stock, Store. Active item black with a 4px dot. A 64px black circular Scan button bottom-right above the nav on Orders and Stock screens. For an associate, the Store tab shows "My shift" instead of the manager's scorecard. Android, portrait, 390×844.

ACT 1. FIRST DAY (3 screens)

1. Join. Two states on one screen. Associate state: title "Join your store", "Enter the 6-character code from your manager", six monospace cells, a preview card "Ashva Apparel · Phoenix Palassio, Lucknow · Store Associate", input "Your name" prefilled "Karan", primary "Join". Manager state, opened from Aarav's link: a card "Aarav Shah invited you to Ashva Apparel as Store Manager of Phoenix Palassio, Lucknow", Email locked, Create password, primary "Accept and continue".

2. Create your PIN. Line "You will use this to unlock the store phone." Four dots and a 3×4 numpad. Second state "Enter it again" with a green check when matched. Muted footer "Your PIN is yours."

3. Who are you. Muted line "Phoenix Palassio · Counter phone · 10:58". Avatar chips Priya, Karan, Neha; tapping one reveals four PIN dots and the numpad. Show the wrong-PIN state with a red line "Wrong PIN". Footer "Not on this list? Ask Priya to add you."

ACT 2. ORDERS (7 screens)

4. Orders, the home. Title "Phoenix Palassio", sync chip "POS synced 3m ago". A small line "12 of 14 accepted first time today" in green. Segmented "Offered 2 · Picking 1 · Ready 3 · Done 14". Two offer cards at the top, each with the countdown as the largest text: "Accept within 12:40" and "03:10" in red; beneath, "#ORD-88213 · 2 items · Gomti Nagar · 4.2 km" and "#ORD-88240 · 1 item · pickup". Then Ready cards: "#ORD-88190 · pickup · Ananya S. · waiting since 11:20" with a chip "Hand over". A collapsed row "Done today 14". Scan button bottom-right.

5. Offer detail. Card "#ORD-88213" with the countdown "Accept within 12:40", two line items with monospace SKUs, names, sizes, and beneath each "In stock here: 3 · POS as of 3 min ago · confidence 94%" and "In stock here: 1", then "Deliver to Gomti Nagar, Lucknow · 4.2 km · courier pickup by 16:00". Bottom: outlined "Reject" and black "Accept". Show the reject sheet: title "Why can't this store fulfil it?", single-select rows "Can't find the item", "Item is damaged", "Stock number is wrong", "No staff capacity", "Past dispatch cut-off", footer "The order moves to the next location automatically. This counts on the store scorecard.", primary "Reject and re-route".

6. Store pick. Title "Pick · #ORD-88213", progress "1 of 2". No bins. Each line is a card: "Oversized Tee · Black · M", "ASH-TEE-OVS-BLK-M" in monospace, a shelf hint from the POS category "Men's tees wall", and "Scan the item" which turns into a green check when scanned. Each card has a small outlined chip "Can't find it". Primary "All items found". Show the can't-find sheet: "We will mark 0 here, release the order and send it to the next store." with the line "Phoenix Citadel has 7", an outlined red-text button "Can't find it", and a plain "Cancel".

7. Handover. Title "Handover · #ORD-88213". Segmented "Courier · Customer pickup". Courier state: carrier chips "Delhivery" selected, "Bluedart", a row "Scan AWB" that becomes "AWB 2891 7743 2210" in monospace with a green check, a chip "Print label", and primary "Handed to courier". Pickup state: a line "Customer gets a QR code by SMS and email" and primary "Mark ready for pickup".

8. Customer pickup. Title "Pickup". A large camera area with "Scan the customer's QR". Scanned state: a card "#ORD-88190 · Ananya S. · 2 items · paid online" with the items, a toggle "ID checked", and primary "Hand over". Beneath the camera a list "Waiting for pickup · 3": rows with the customer's first name, "held until 18:00", and a muted note on one "No-show at 18:00 releases stock to the pool automatically".

9. Endless aisle. Title "Not in this store?". Scan or search shows "ASH-TEE-OVS-BLK-L · Oversized Tee · Black · L · 0 here". Ranked rows "Phoenix Citadel · 7 · ships in 2 days", "Bhiwandi DC · 48 · ships in 3 days". Customer inputs: Phone, Pincode "226010", and a segmented "Ship to home · Ship to this store". Payment segmented "Collect at POS · Send pay link". Primary "Place order · credited to Phoenix Palassio". Muted "A walkout becomes a sale."

10. Return intake. Title "Return". Scan the item or type the order: "#ORD-88102 · bought online · 6 days ago · ₹1,299". Single-select disposition rows: "Good · restock here" with a black border and the note "This size sells 4 a week here", "Good · send to Bhiwandi DC", "Damaged · quarantine". A line "Refund to original method · POS bill created". Primary "Accept return".

ACT 3. STOCK (4 screens)

11. Store stock lookup. Scan or search opens a card: "ASH-TEE-OVS-BLK-M · Oversized Tee · Black · M", "3 on hand here · POS as of 3 min ago · confidence 94%", "1 reserved · 2 sellable online", "Last sold 14:10". A list "Other locations": "Phoenix Citadel 7", "Bhiwandi DC 48", "Model Town · stale 47 min" in muted text. Chip "Report wrong count". Show the report state: a numpad quantity "0", reason chips "Not on shelf", "Damaged", "Sold, not billed", and primary "Post and update POS".

12. Incoming transfers. Rows: "TR-0088 from Bhiwandi DC · 120 units · arriving today" with a black chip "Receive". Show the receive state: lines with monospace SKU, expected, and a scan check; a discrepancy line "118 of 120 · 2 missing" in red; primary "Confirm receipt · POS updated".

13. Store count. Title "Count · Men's tees wall · 12 SKUs". Rows fill as items are scanned: "ASH-TEE-OVS-BLK-M · counted 2 · POS 3 · −1" with the variance in red, "ASH-TEE-OVS-BLK-L · 0 · 0". Progress "9 of 12". Muted "Counts feed this store's confidence score." Primary "Post count · update POS".

14. Unmapped POS items, manager only. Title "Not in catalogue · 12". Rows: "GNS-88213 · 'OVS TEE BLK M' · sold 14× this week" with a black chip "Map". One row expanded with a search field showing "ASH-TEE-OVS-BLK-M" and a chip "Confirm". Muted line "Unmapped items never enter the online pool."

ACT 4. STORE, THE MANAGER'S TAB (4 screens)

15. Store scorecard. Title "Phoenix Palassio", segmented "7d · 30d". KPI grid "91% FIRST-ATTEMPT ACCEPTANCE ▲3pp" green; "6 ORDERS JUMPED AWAY ▼2 vs last week" green because fewer is good; "0.87 TRUST SCORE · top 5 of 41"; "94% STOCK CONFIDENCE · buffer 2 units". Card "Why we rejected · 30 days" with bar rows "Can't find it 4", "Stock number wrong 1", "No capacity 1". Chart "Acceptance rate by week": one black line and a dashed grey chain-average line.

16. Sync health. Card "Ginesys POS": rows "Last success 3 min ago" with a green dot, "Rows changed 412", "Consecutive failures 0", "Next run in 12 min". A 24-hour strip of tiny squares, black for ok and red for failed. Chips "Sync now", "Last run details". Show the stale state: a red banner across the top "POS stale 47 min. This store is excluded from online orders until sync recovers." and the dot red.

17. Store settings. Rows: toggle "Fulfils online orders" on with a chip "Pause for today"; toggle "Allows customer pickup" on; "Daily pick capacity 40 · used 26 today"; "Dispatch cut-off 16:00"; "Offer timer 15 min". Muted line "Capacity and cut-off are set by the owner." Chip "Request a change". Show the pause sheet: reason chips "Short-staffed", "Stock take", "Closed early" and primary "Pause until tomorrow".

18. Staff. Rows: "Priya Nair · STORE MANAGER", "Karan · STORE ASSOCIATE", "Neha · STORE ASSOCIATE", each with a chip "Reset PIN". Chip "Add associate". Show the add sheet: a 6-character code "K7M2QX" in large monospace, "expires in 24 hours", and a chip "Share on WhatsApp".

ACT 5. THE END OF THE DAY (2 screens)

19. Sync issues. Title "Sync issues", count "1". Line "These actions could not be saved. Nothing is lost." One card: "Return · #ORD-88102 · restock here" with muted "POS unreachable at 15:12 · will retry" and chips "Retry now", "Send to Bhiwandi DC instead". Show the empty state "Everything is synced." with a green dot.

20. Close store. Title "Close · 9 Sep". Summary card rows: "Offers 16 · accepted 14 · first-attempt 88%"; "Handed to courier 9 · pickups 4 · returns 2"; "Can't find it 1 · ASH-TEE-OVS-BLK-M · count task created"; "POS synced 2 min ago" in green. Outlined "Still open". Primary "Close store", which returns to Who are you.

FLOW

Join → Create your PIN → Who are you → Orders. Every later day starts at Who are you. Offer cards open Offer detail; Accept opens Store pick, then Handover; a pickup order opens Customer pickup. Endless aisle and Return intake are reached from the Scan button's sheet on any Orders or Stock screen. The Stock tab opens Store stock lookup, with Incoming transfers, Store count and Not in catalogue as chips beneath. The Store tab opens the Scorecard for a manager, with Sync health, Store settings and Staff as rows beneath; for an associate it opens My shift, which shows their own handovers and pickups today and the Close store row. Do not add bins, putaway, warehouse pick walks, multi-location dashboards, routing rules, or billing to this application.
```
