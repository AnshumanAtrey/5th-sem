# Warehouse Management SaaS — App Flow, Architecture & Feature List

**Sector:** Logistics / warehousing
**Product shape:** Multi-tenant SaaS. A business signs up, gets its own isolated workspace, its own admin panel + dashboard, invites its own staff.
**Client:** Flutter, **mobile only** (Android primary, iOS secondary). Admin panel + dashboard live *inside* the app, gated by role.
**Backend:** Firebase — Auth, Firestore, Cloud Functions, Storage, FCM, App Check.
**Status:** Design doc. No code yet.

---

## 0. The one design constraint that shapes everything

A WMS is fundamentally a **ledger** (every unit that moves is an entry) plus a **derived position** (what's on hand right now). Firestore has no cheap `SUM` / `GROUP BY` / join, so:

1. `stock_moves` is **append-only** and is the single source of truth.
2. `stock_positions` (on-hand per SKU × warehouse × bin × batch) is a **derived cache**, written only by a Cloud Function inside a transaction.
3. Dashboard KPIs read **pre-computed aggregate documents**, never a live scan of the ledger.
4. Heavy/ad-hoc reporting goes to **BigQuery** via the Firestore export extension, not to the phone.

**Rule:** the client never writes a quantity. It calls a Callable Function that validates → posts ledger rows → updates positions → writes audit → bumps aggregates, all atomically. This is also what makes offline sync safe (see §5.6).

### And the second constraint: a location is not always a warehouse

Every brand that sells online *and* runs physical stores has the same wound: the stock exists, but the
software doesn't reliably know **where**. So an online order gets routed to a store whose stock number
is wrong, the store can't find the item, and the order jumps to another location or dies. Measured on a
live Indian D2C brand running **40 stores + 1 central warehouse**, 1.2–4.2% of orders jump between
locations, and the incumbent analytics tool ships an entire dashboard tab whose only job is to *measure*
that pain — nobody closes the loop.

So this system treats **stores and warehouses as one registry of typed locations from day one** (§2.11).
A store's stock arrives from its **POS**, not from a picker; a warehouse's stock arrives from receiving
and putaway. Both feed one sellable pool, and every stock number carries **who said it and when**. A
number without an `as_of` is a guess wearing a suit.

---

## 1. Roles & personas

| Role | Who they are | Lives in the app to… |
|---|---|---|
| **Owner** | Business owner / founder | Billing, plan, org settings, full access, can delete org |
| **Admin** | Ops head | Everything except billing & org deletion |
| **Manager** | Warehouse manager | Full ops on their warehouse(s), approves adjustments / counts / transfers |
| **Supervisor** | Shift in-charge | Assigns & verifies tasks, resolves short-picks, no master-data deletion |
| **Operator** | Picker / packer / receiver | Executes scan tasks assigned to them, in their assigned warehouse only |
| **Store Manager** | Retail store in-charge | Same rights as Manager, scoped to one *store*-type location: accepts/rejects omni orders, store stock, store transfers |
| **Store Associate** | Shop-floor staff | Same rights as Operator, scoped to one store: fulfils omni orders, click-&-collect handover, return intake |
| **Viewer** | Accountant / client / auditor | Read-only dashboards & reports |
| **Platform Super-Admin** | Us | Separate build flavour: tenants, plans, support impersonation |

---

## 2. Feature list

Grouped by module. `MVP` = phase 1 must-ship, `V1` = first paid release, `V2` = later.

### 2.1 Auth & tenancy
- `MVP` Email + password sign-up / login; Google sign-in
- `MVP` **Create organization** on first sign-up → that user becomes Owner
- `MVP` **Join organization** by email invite or 6-char invite code
- `MVP` Invite team members (email / phone), assign role + warehouse scope, revoke access
- `MVP` Password reset, email verification
- `MVP` Persistent session; **PIN / biometric unlock** (warehouse phones are shared — fast user switch matters more than long sessions)
- `V1` One user in multiple organizations → org switcher
- `V1` Shift-based device login (device registered to warehouse, operator taps their name + PIN)
- `V2` SSO / Google Workspace domain capture

### 2.2 RBAC (role-based access control)
- `MVP` Fixed role set (§1) with a **permission matrix** (§3)
- `MVP` **Per-warehouse scoping** — an Operator assigned to WH-A cannot see WH-B stock
- `MVP` Enforced at **three layers**: UI hides it → route guard blocks it → **Security Rules + Functions reject it** (only the third one is real security)
- `MVP` Role + tenant + warehouse list carried as **custom claims** on the Firebase ID token
- `V1` Approval thresholds per role (e.g. Operator may adjust ≤ 5 units, above that needs Manager approval)
- `V1` Audit log entry for every role / permission change
- `V2` Custom roles (tenant defines its own permission bundle)

### 2.3 Master data
- `MVP` **Products / SKUs**: code, name, category, UoM + pack size, barcode(s) (multiple per SKU), image, weight & dims, MRP / cost, reorder point, safety stock, tracking flags (batch / expiry / serial)
- `MVP` **Locations** — one typed registry (`warehouse | store | dark_store | 3pl | vendor | transit | quarantine`), see §2.11A. Warehouse-type locations get **Zones → Aisles/Racks → Bins** with structured codes (`WH1-A-03-02`); store-type locations are single-bin by default (a store's "bin" is the shop floor)
- `MVP` **Bin label generation** — printable QR/barcode sheets (PDF via Function)
- `MVP` Suppliers, Customers
- `MVP` **Bulk import** CSV/Excel: pick file → column mapping → validation preview → commit; and export
- `V1` Carriers, tax/GST masters, reason-code masters (damage, loss, found…)
- `V2` Kitting / BOM (a sellable kit made of SKUs)

### 2.4 Inbound (receiving)
- `MVP` Purchase Order: create in app, or import CSV
- `MVP` **Receive against PO by scanning**; also **blind receipt** (no PO)
- `MVP` Capture batch / lot, expiry date, serial numbers where the SKU demands it
- `MVP` Short / over / damaged flags + **photo evidence** to Storage
- `MVP` **GRN** (goods receipt note) generated → PDF → share on WhatsApp/email
- `MVP` **Putaway**: system-suggested bin (nearest empty / same-SKU consolidation) → scan bin → confirm
- `V1` Multi-line partial receipts across days, PO closure rules
- `V1` Cross-dock flag (receive → straight to outbound staging, skip putaway)
- `V2` Dock / appointment scheduling, vehicle check-in

### 2.5 Inventory
- `MVP` Live on-hand by **SKU / warehouse / bin / batch**
- `MVP` **Scan a bin → what's inside**; **scan a SKU → where is it** (the two most-used screens on the floor)
- `MVP` On-hand vs **reserved** vs available vs in-transit
- `MVP` **Bin-to-bin transfer** (scan from-bin → SKU → qty → to-bin)
- `MVP` **Stock adjustment** with mandatory reason code + optional approval
- `MVP` **Cycle count**: create session (by zone / by SKU / blind) → count → variance report → approve → posts adjustments
- `V1` Batch/expiry intelligence: **FEFO / FIFO pick suggestion**, near-expiry alert list
- `V1` Reorder point breach → low-stock alert + suggested PO
- `V1` Stock ageing / dead-stock report
- `V1` Inter-warehouse **transfer order** with in-transit state (dispatch → receive)
- `V1` Serial-number genealogy (which serial went to which order)
- `V2` Quarantine / hold locations, quality inspection step

### 2.6 Outbound (fulfilment)
- `MVP` Sales Order: create in app / import CSV
- `MVP` **Allocation** — reserve stock against an order (FEFO-aware)
- `MVP` **Pick list** generation, sorted by **bin walk sequence** (not by SKU — this is the whole point)
- `MVP` **Scan-verified picking**: scan bin → scan SKU → enter/scan qty → confirm
- `MVP` **Short-pick** handling: mark short → notify supervisor → substitute / partial / hold
- `MVP` **Packing**: pack into box(es), capture weight, generate packing slip
- `MVP` **Dispatch**: carrier + AWB, generate shipping label, mark shipped
- `V1` **Batch / wave picking** — one operator picks many orders in one walk, then sorts
- `V1` **Returns inward**: scan return → inspect good/damaged → restock or quarantine
- `V1` Proof of delivery (photo + signature capture) if last-mile is in scope
- `V2` Rate-shopping across carriers, carrier API label pulls

### 2.7 Dashboard & reports (per tenant)
- `MVP` KPI tiles: SKU count, total on-hand qty & value, orders pending pick / pack / dispatch, today's inbound & outbound, low-stock count
- `MVP` Charts: inbound vs outbound trend, order fulfilment funnel, top-moving SKUs
- `MVP` **Stock ledger view** — full movement history, filterable by SKU / bin / user / date
- `V1` Registers: GRN, dispatch, adjustment, transfer, cycle-count variance
- `V1` Operator productivity (lines picked / hour, scan accuracy)
- `V1` Export any report to CSV / PDF and share
- `V1` Near-expiry & ageing dashboards
- `MVP` **Omni scorecard** — first-attempt acceptance rate, jump rate, jump cost (₹ + hours), reject-reason mix, per-location trust score, stale-connector count. The numbers §2.11F generates
- `V2` Scheduled email digest; BigQuery-backed custom report builder

### 2.8 Scanning & device
- `MVP` Camera scanner: 1D barcodes + QR, **continuous batch-scan mode**, torch, haptic + sound feedback
- `MVP` **Hardware scanner support** — keyboard-wedge / HID guns type into the focused field (many warehouses already own these)
- `MVP` **Offline-first**: every scan queues locally, syncs on reconnect, conflicts surfaced not silently dropped
- `MVP` Glove-friendly UI: large tap targets, high contrast, minimal typing, one-hand reachable primary actions
- `V1` Bluetooth thermal label printing (ESC/POS + ZPL)
- `V2` Zebra/Honeywell DataWedge deep integration, voice-confirm picking

### 2.9 Notifications
- `MVP` FCM push: task assigned, low stock, approval requested, receipt awaiting putaway
- `MVP` In-app notification centre with read state
- `V1` Per-role / per-event notification preferences
- `V2` WhatsApp / email digests via Function

### 2.10 SaaS / platform layer
- `MVP` Onboarding wizard: create org → create first warehouse → generate bins → import SKUs → invite team
- `MVP` Tenant settings: business profile, currency, timezone, tax id, **document numbering series** (`PO-2026-0001`), FEFO vs FIFO default
- `MVP` Audit trail / activity feed
- `V1` **Plans & limits**: users, warehouses, SKUs, orders/month — enforced server-side
- `V1` Trial → subscription (Razorpay primary for India, Stripe for international) via Function webhooks
- `V1` Usage metering + upgrade prompts on limit breach
- `V1` Tenant data export (they own their data) + account deletion
- `V1` Super-admin console (separate flavour): tenant list, plan overrides, support impersonation with audit
- `V2` 3PL mode — one tenant serving many *client* companies, per-client stock segregation + storage billing
- `V2` Public REST API + webhooks; Shopify / Amazon / marketplace connectors

### 2.11 ⭐ Omnichannel — stores and warehouses as one stock pool

**This is the module that justifies the product.** Every other feature here exists in ten other WMSs.
This is the one that is universally broken, directly moves revenue, and is purely a *software* gap —
the stock is physically there; only the software's picture of it is wrong.

**A. Unified location model** `MVP`
- One registry, every location typed (`warehouse | store | dark_store | 3pl | vendor | transit | quarantine`)
- Per location: geo (pincode, lat/lng), serviceable pincodes or radius, `fulfils_online`, `allows_pickup`, `daily_pick_capacity`, `dispatch_cutoff`, `cost_to_serve`, `priority`
- **A location cannot enter routing until it has: a type, a stock source, one verified sync, and a non-negative stock check.** Learned the hard way from a live system where one untyped "warehouse" row carried **−1,074,445 units** and silently poisoned every availability number downstream.
- `V1` Location groups (region / cluster / franchise) for rollups and routing rules

**B. Store stock from the POS** `MVP`
- Connector framework, one interface, three transports: **pull** (poll the POS stock/catalogue endpoint), **push** (POS webhook), **file** (CSV / Sheet) for stores whose POS has no API
- Identity mapping per store: POS SKU/barcode ↔ our SKU, with an **unmapped-SKU queue** and a one-tap "map to this" action — never silently drop a row
- Every store stock row carries `as_of` + `source` + `confidence`. **Store stock is a claim with an age, not a fact**, and confidence decays with staleness
- Write-back leg: stock the WMS moves (return restocked at store, transfer received) is pushed back to the POS so the two never drift
- `V1` Near-real-time sales sync so a store sale decrements the omni pool in minutes, not overnight
- `V1` Store-level offline tolerance: if a store's POS is down, its stock freezes at last-known and its confidence collapses — it stops winning routing decisions instead of lying

**C. Availability & promise engine** `MVP`
- `sellable(location, sku) = on_hand − reserved − safety_buffer(location, sku)`
- `safety_buffer` is **auto-tuned per location from that location's own historical fulfilment-failure rate** — the store that can never find anything gets a bigger buffer automatically, without anyone configuring it
- **Nearby availability**: `sku + customer pincode + radius` → ranked locations with qty, ETA, pickup-today flag and a **confidence score**
- One aggregate "sellable online" number published to the storefront, so oversell is prevented at the source instead of apologised for later

**D. Order routing / allocation engine** `MVP` — the brain
- Scores every candidate location per order line: distance/ETA · sellable stock × confidence · remaining daily capacity · time to dispatch cut-off · cost to serve · **location trust score** · split-shipment penalty · **aged-stock bonus** (deliberately route to where the SKU is dead stock)
- Prefers single-location fulfilment; splits only when the score says the split beats the delay
- Emits an allocation plan **plus a ranked fallback chain**, stored on the order — so a rejection re-routes instantly with no human in the loop and no recompute under load
- Tenant-selectable strategy: `nearest-first` · `cheapest-first` · `warehouse-first` · `clear-aged-stock-first` · `balance-load`
- `V1` **Dry-run mode** — replay last month's orders against a changed rule set and see what it would have cost. Nobody lets you test a routing change before it hits real orders; that's why nobody ever changes one.

**E. Store fulfilment flow** `MVP`
- Store staff get a push: *New order to fulfil — accept within 15:00*
- **Accept / Reject with a mandatory reason.** Timer expiry = auto-reject → auto re-route. No order ever sits waiting on a silent store
- Pick with scan → pack → hand to courier, or mark **ready for pickup**
- **"Can't find it" is one tap**, and it does three things atomically: writes an inventory adjustment at that location, releases the reservation, and re-routes the order down the fallback chain. The most common cause of omni failure becomes a self-healing event instead of a phone call
- `V1` Ship-from-store label printing and a store-level dispatch manifest

**F. Reassignment ("jump") tracking + the trust loop** `MVP` — the part nobody builds
- Every decision is an append-only event: `order → attempt(location, score, reason) → outcome(accepted | rejected(reason) | timeout)`
- Named reject reasons, because "rejected" alone is useless: `not_found` · `damaged` · `stock_wrong` · `no_capacity` · `past_cutoff` · `no_response` · `price_mismatch`
- Metrics: **first-attempt acceptance rate**, jump rate, per-location reject rate and reason mix, destination flow (which locations lose orders to which), and **the ₹ and the hours each jump costs**
- Those rates feed straight back into each location's **trust score** → its routing weight and its safety buffer. The loop closes: the system gets more accurate every week with nobody tuning it. Measuring the jump rate is a dashboard; feeding it back is a product.

**G. Omni customer journeys** `V1`
- **BOPIS / click & collect** — reserve at store, pickup slot, QR handover code, no-show auto-release
- **Endless aisle** — the customer is standing in the store and the size isn't there; staff raise an order fulfilled from the warehouse or another store, shipped to the customer's home. Converts a walkout into a sale
- **Return anywhere** — return at any store; disposition decided by *that store's* demand for the SKU (restock locally if it sells there, else route back to the warehouse)
- **Order-driven store-to-store transfer** — triggered by a specific order, not a planning cycle

**H. Rebalancing automation** `V1`
- Detects dead stock at location A against stockout risk at location B for the same SKU and **proposes a transfer with the expected ₹ gain**; one tap creates the transfer order, gate-pass and packing list
- Scheduled job → a handful of high-value suggestions, not another report nobody opens
- `V2` Pre-season allocation: push new-arrival quantities to each store on **that store's own historical size curve**, not a flat split

**I. Channel & marketplace fan-out** `V2`
- One catalogue → per-channel stock publish with per-channel buffer and rounding rules
- A failed stock push is a **first-class alert**, not a silent divergence that surfaces as an oversell three days later

### 2.12 Data trust & sync health `MVP` — what makes every number above believable
- Per-connector heartbeat: last success, rows changed, latency, consecutive failures. A stale connector visibly degrades every number it feeds
- **Auto-quarantine** — a location whose stock goes negative, or whose sync is older than its threshold, is dropped out of routing and flagged. Never averaged into the pool
- **Two-counter reconciliation** — when a POS and the WMS both claim the same physical stock, one is declared authoritative *per location* and the delta is logged as a reconciliation item. Summing two counters of one pool is the single most common way an omni stock number goes wrong
- Anomaly alarms on the aggregates a human would never re-check: total stock moving more than X% in a tick, a location reporting zero for everything, a SKU appearing at a location it was never sent to
- Every derived number carries its inputs' `as_of`, and the UI says **"as of 14 min ago · 3 of 41 locations stale"** instead of showing a confident wrong figure

---

## 3. RBAC permission matrix

Permission keys are `module.action`. `R` read · `W` create/update · `D` delete · `A` approve · `—` none.

| Permission | Owner | Admin | Manager | Supervisor | Operator | Viewer |
|---|---|---|---|---|---|---|
| `products.*` | RWD | RWD | RW | R | R | R |
| `locations.*` | RWD | RWD | RW | R | R | R |
| `partners.*` (suppliers/customers) | RWD | RWD | RW | R | — | R |
| `inbound.*` (PO, receipt, GRN) | RWD | RWD | RW | RW | RW¹ | R |
| `putaway.execute` | ✓ | ✓ | ✓ | ✓ | ✓¹ | — |
| `inventory.read` | ✓ | ✓ | ✓ | ✓ | ✓¹ | ✓ |
| `stock.transfer` | ✓ | ✓ | ✓ | ✓ | ✓¹ | — |
| `stock.adjust` | ✓ | ✓ | ✓ | ✓² | ✓² | — |
| `stock.adjust.approve` | ✓ | ✓ | ✓ | — | — | — |
| `outbound.*` (SO, pick, pack, dispatch) | RWD | RWD | RW | RW | RW¹ | R |
| `count.run` | ✓ | ✓ | ✓ | ✓ | ✓¹ | — |
| `count.approve` | ✓ | ✓ | ✓ | — | — | — |
| `transfer.approve` (inter-warehouse) | ✓ | ✓ | ✓ | — | — | — |
| `users.invite` | ✓ | ✓ | ✓³ | — | — | — |
| `users.manage` (role change / revoke) | ✓ | ✓ | — | — | — | — |
| `settings.manage` | ✓ | ✓ | — | — | — | — |
| `reports.read` | ✓ | ✓ | ✓ | ✓ | own only | ✓ |
| `billing.manage` | ✓ | — | — | — | — | — |
| `org.delete` | ✓ | — | — | — | — | — |
| `locations.manage` (type, geo, capacity, cut-off) | ✓ | ✓ | R | R | — | R |
| `connectors.manage` (POS credentials, sync config) | ✓ | ✓ | — | — | — | — |
| `routing.rules` (strategy, weights, buffers) | ✓ | ✓ | R | R | — | R |
| `orders.fulfil` (accept / pick / pack an omni order) | ✓ | ✓ | ✓ | ✓ | ✓¹ | — |
| `orders.reject` (decline with reason) | ✓ | ✓ | ✓ | ✓ | ✓¹ | — |
| `orders.reroute` (manual override of the engine) | ✓ | ✓ | ✓ | — | — | — |
| `transfers.propose` (accept a rebalancing suggestion) | ✓ | ✓ | ✓ | — | — | — |

¹ **scoped to assigned warehouse(s) only** — enforced by the `warehouses[]` custom claim.
² above the tenant's configured quantity/value threshold it becomes an approval request instead of a direct post.
³ Manager can invite only Supervisor / Operator / Viewer, never Admin or Owner (privilege-escalation guard, enforced in the Function).

**Store roles reuse the same machinery, no new code:** *Store Manager* = the Manager row with its
`warehouses[]` claim scoped to one **store**-type location; *Store Associate* = the Operator row scoped
the same way. The claim is a list of location ids, so warehouse-scoping and store-scoping are one
mechanism — which is why the location registry had to be typed rather than split into two tables.

**Enforcement points**
| Layer | Mechanism | Purpose |
|---|---|---|
| Widget | `can('stock.adjust')` helper hides/disables | UX — don't show dead buttons |
| Router | `go_router` redirect guard on route | Prevents deep-link into a forbidden screen |
| Firestore Rules | path tenant id must equal `request.auth.token.tenantId`, role must be in the allowed set, warehouse must be in claim | **Real** read-side wall |
| Cloud Function | re-checks claim + threshold + plan limit before posting | **Real** write-side wall; all quantity changes live here |

---

## 4. Application flow

### 4.1 Cold start
```
launch → Firebase init, App Check, Remote Config
  └─ signed in?
       no  → Welcome → [Sign up] / [Log in] / [Join with code]
       yes → fetch ID token claims
              ├─ no tenantId claim        → Create-org OR Accept-invite screen
              ├─ tenant status = suspended → Billing-blocked screen (Owner sees Pay, others see Contact admin)
              ├─ onboarding incomplete     → Onboarding wizard (resume at step)
              └─ ok → PIN / biometric gate → Role-based home
```

### 4.2 Sign-up → first workspace (Owner path)
1. Email + password (or Google) → verify email
2. **Create organization**: business name, industry, country, currency, timezone → Function creates `tenants/{id}`, `memberships/{uid}_{tid}`, sets custom claims `{tenantId, role: owner, warehouses: ["*"]}` → client force-refreshes the token
3. **Onboarding wizard** (skippable, resumable, progress persisted on the tenant doc):
   1. Create first warehouse (name, address)
   2. Generate bin structure (zones × aisles × racks × levels → bulk-create bins) or import bin CSV
   3. Import SKUs (CSV mapping) or add 1 SKU manually
   4. Invite team (email + role + warehouse)
   5. Done → Dashboard with a "3 of 5 setup steps complete" nudge card

### 4.3 Invited user path
1. Receives email/SMS link or 6-char code → app opens Join screen
2. Signs up / logs in → Function validates invite, creates membership, sets claims from the invite (role + warehouse scope), marks invite consumed
3. Lands directly on the **role-based home** (no wizard — the org already exists)

### 4.4 Role-based home
| Role | Home screen |
|---|---|
| Owner / Admin | **Dashboard** — KPI tiles, charts, alerts, quick actions |
| Manager | **Warehouse dashboard** — today's inbound/outbound, pending approvals, staff on shift |
| Supervisor | **Task board** — open receipts, pick lists, exceptions to resolve |
| Operator | **My Tasks** — big cards: *Receive*, *Putaway*, *Pick*, *Count*; nothing else |
| Store Manager | **Store board** — offers awaiting acceptance, this store's jump/reject rate, store stock health, sync status |
| Store Associate | **My offers** — one card per order to accept, pick or hand over; nothing else |
| Viewer | **Reports** list |

### 4.5 Navigation map
```
App
├─ Auth            Welcome · Login · Sign-up · Forgot · Verify · Join-org · Create-org · PIN unlock
├─ Onboarding      5-step wizard
├─ Home (role-based, bottom nav adapts to permissions)
│   ├─ Dashboard         KPI tiles · charts · alerts · quick actions
│   ├─ Scan (FAB)        universal scanner → resolves barcode → routes to SKU / Bin / Order / Box
│   ├─ Omni  ⭐          Live board (orders awaiting a location) · My offers (store view) · Jump analytics ·
│   │                    Location scorecard · Availability lookup · Routing rules + dry-run · Sync health
│   ├─ Operations
│   │   ├─ Inbound       PO list · PO detail · Receive session · GRN list/detail · Putaway queue
│   │   ├─ Outbound      SO list · SO detail · Allocation · Pick list · Pick session · Pack · Dispatch
│   │   ├─ Inventory     SKU search · SKU detail (by bin/batch) · Bin lookup · Transfer · Adjust
│   │   ├─ Counts        Session list · Count session · Variance review · Approve
│   │   └─ Returns       Return list · Receive return · Inspect · Restock/Quarantine
│   ├─ Master Data       Products · Categories · Locations (+Zones/Bins) · Connectors · Suppliers · Customers · Import/Export
│   ├─ Reports           Stock summary · Ledger · GRN reg. · Dispatch reg. · Adjustments · Ageing · Variance · Productivity
│   ├─ Notifications     feed · preferences
│   └─ Admin             Users & roles · Invites · Org settings · Numbering · Plan & billing · Audit log
└─ Super-admin (separate flavour)   Tenants · Plans · Impersonate · Platform metrics
```
The **universal Scan FAB** is present on every ops screen — scan first, navigate second. That's how warehouse staff actually work.

### 4.6 Core task flows

**A. Receive against PO**
1. Inbound → select PO (or scan PO barcode on the paperwork)
2. `Start receipt` → Function creates receipt session (status `in_progress`), locks it to this user
3. Scan item barcode → SKU resolves → if unknown barcode: offer *link barcode to existing SKU* or *create SKU* (permission-gated)
4. Enter qty (numpad or scan-per-unit); capture batch + expiry + serials if the SKU requires them
5. Variance branch: qty ≠ expected → pick reason (short / over / damaged) → photo → continue
6. Repeat; running progress bar per line
7. `Complete` → Function: posts `receipt` moves into ledger, creates positions at the **RECEIVING** staging bin, updates PO line received qty, generates GRN + PDF, creates a **putaway task**
8. Share GRN PDF · or `Putaway now`

**B. Putaway**
1. Putaway queue → task → shows SKU, qty, batch, **suggested bin**
2. Scan the suggested bin (or scan another bin → confirm override + reason)
3. Confirm qty → Function posts a `putaway` move: RECEIVING bin → target bin (one ledger row out, one in)
4. Task closes; next task auto-loads

**C. Pick → Pack → Dispatch**
1. Outbound → SO → `Allocate` → Function reserves stock (FEFO if configured); un-allocatable lines flagged
2. `Generate pick list` → lines sorted by bin walk sequence → assign to operator (push notification)
3. Operator → My Tasks → pick session: **scan bin → scan SKU → qty → confirm** per line; wrong bin or wrong SKU = hard block with error haptic
4. Short pick → reason → supervisor notified → resolve (substitute / partial ship / hold order)
5. All lines done → order `picked` → **Pack**: create box(es), assign lines to boxes, capture weight → packing slip PDF
6. **Dispatch**: choose carrier, enter/scan AWB, print label, `Mark shipped` → Function posts `ship` moves (stock leaves the building), order → `dispatched`, customer notification optional

**D. Bin transfer** — Scan from-bin → pick SKU/batch → qty → scan to-bin → confirm → Function posts paired out/in moves.

**E. Cycle count** — Create session (zone / SKU list / full, blind or informed) → count by scanning each bin's contents → system computes variance per line → **Variance review** (Manager) → `Approve` → Function posts adjustment moves for every variance with reason `cycle_count` → session `posted`, variance report saved.

**F. Adjustment with approval** — Operator adjusts 3 units damaged → below threshold → posts immediately. Adjusts 200 units → above threshold → creates an **approval request**, notifies Manager → Manager approves → *then* the Function posts. Nothing changes stock while pending.

**G. Invite a user** — Admin → Users → Invite (email, role, warehouses) → Function validates the inviter may grant that role (§3 note ³) + plan seat limit → writes invite doc + sends email/SMS → on accept, claims are set and an audit row is written.

**H. Offline scan and sync** — Operator loses network mid-pick. Scans keep working off the cached pick list; each confirmed line is written to a local outbox with a client-generated `opId`. Reconnect → outbox drains to the Callable Function in order; the Function dedupes on `opId` (so a retry never double-posts) and returns per-op success/conflict. Conflicts (someone else already moved that stock) surface as a **Sync issues** screen the operator must clear — never silently discarded.

### 4.7 Omnichannel task flows

**I. Onboarding a store (tenant admin, once per store)**
1. Locations → Add → type **Store** → name, address, pincode, lat/lng
2. Serviceability: serviceable pincodes or a radius · `fulfils_online` · `allows_pickup` · daily pick capacity · dispatch cut-off
3. **Connect its POS**: pick the adapter, enter credentials (stored as a secret ref, never in a client-readable doc), choose transport (pull / webhook / file)
4. **First sync runs in dry-run** → shows rows found, SKUs matched, SKUs unmapped, any negative stock
5. Resolve the unmapped-SKU queue (one tap each) → `Go live`
6. Only now does the location become routable. Until then it is visible but excluded from every availability number.

**J. An online order gets fulfilled (the core omni loop, no human)**
1. Order arrives → `routeOrder` scores every routable location for every line
2. Plan chosen + **fallback chain stored on the order**; stock reserved at the winning location(s) with a TTL
3. Winning location's staff get a push with an accept timer
4. **Accepted** → pick (scan) → pack → dispatch or ready-for-pickup. Order done, `first-attempt accepted` recorded
5. **Rejected / timed out** → reason recorded → reservation released → next location in the chain fires automatically → this is the **jump**, and it is logged with its reason, its ₹ cost and its delay
6. Chain exhausted → order flagged for a human with the full attempt history, plus a substitute suggestion if one exists
7. Overnight, `not_found` and `stock_wrong` rates recompute each location's trust score and safety buffer → tomorrow's routing is better than today's

**K. BOPIS (click & collect)**
Customer picks a store at checkout → stock reserved at that store, pickup slot offered from its capacity → store staff pick and set **ready** → customer shows a QR handover code → staff scan → order closed. No-show past the hold window auto-releases the reservation back into the pool.

**L. Endless aisle (in-store save)**
Customer in Store A wants a size Store A doesn't have → associate scans the SKU → nearby-availability shows Warehouse and Store C hold it → associate raises the order → routing fulfils it and ships to the customer's home → the sale is credited to Store A. A walkout becomes revenue.

**M. Rebalancing suggestion**
Scheduled job finds SKU dead at Store A (no sales in 30 days, 12 on hand) and at stockout risk at Store B (7 days of cover left) → surfaces one card: *move 8 units A → B, expected gain ₹X* → Manager taps accept → transfer order + gate-pass + packing list created, and the units become in-transit stock rather than vanishing from the pool for four days.

**N. A connector goes stale**
Store A's POS stops responding → connector heartbeat misses its threshold → Store A's confidence collapses → it stops winning routing decisions and is excluded from published availability → an alert names the store, the last success time and the row count. Nobody discovers the outage from an oversell a week later.

### 4.8 Status state machines
| Entity | States |
|---|---|
| Purchase order | `draft → approved → partially_received → received → closed` (· `cancelled`) |
| Receipt session | `in_progress → completed → putaway_pending → putaway_done` (· `abandoned`) |
| Sales order | `draft → confirmed → allocated → picking → picked → packed → dispatched → delivered` (· `on_hold` · `cancelled`) |
| Transfer order | `draft → dispatched → in_transit → received` (· `cancelled`) |
| Count session | `draft → counting → variance_review → posted` (· `discarded`) |
| Return | `initiated → received → inspected → restocked \| quarantined \| scrapped` |
| Adjustment | `pending_approval → approved → posted` (· `rejected`) |
| Invite | `sent → accepted` (· `expired` · `revoked`) |
| **Routing attempt** | `scored → offered → accepted` (· `rejected(reason)` · `timed_out`) → next attempt or `exhausted` |
| **Reservation** | `held → consumed` (· `released` · `expired`) |
| **Location** | `draft → connected → dry_run → live` (· `quarantined` · `paused`) |
| **Connector run** | `queued → running → success` (· `partial(errors)` · `failed`) |

---

## 5. Architecture

### 5.1 Stack
| Layer | Choice |
|---|---|
| UI | Flutter (Material 3, custom warehouse theme — large targets, high contrast) |
| State | **Riverpod** (+ `freezed` for immutable state/models) |
| Routing | **go_router** with auth + role redirect guards |
| Local cache | **Isar** (or Hive) for scan buffers, pick-list cache, outbox, settings |
| Backend data | Cloud **Firestore** (offline persistence on) |
| Writes that change stock | Cloud **Functions** (callable), never direct client writes |
| Auth | Firebase Auth + **custom claims** |
| Files | Firebase **Storage** (product images, evidence photos, generated PDFs, import files) |
| Push | **FCM** |
| Ops | Crashlytics, Analytics, Remote Config (feature flags), **App Check** |
| Reporting | Firestore → **BigQuery** export for heavy/ad-hoc analytics |
| Payments | Razorpay (IN) / Stripe (intl) via Function webhooks |

### 5.2 Flutter layering (feature-first)
```
lib/
├─ core/          theme · router · di · errors · result type · permissions · scanner · connectivity · formatters
├─ data/          firestore refs · function client · outbox · local db · dtos + mappers
├─ domain/        entities (Sku, Bin, StockMove, Order…) · repository interfaces · use-cases
├─ features/
│   ├─ auth/  onboarding/  dashboard/  inbound/  outbound/  inventory/  counts/
│   ├─ returns/  master_data/  reports/  admin_users/  settings/  billing/  notifications/
│   └─ each: presentation/ (screens, widgets) · application/ (controllers/providers) · data/ (repo impl)
└─ main_dev.dart · main_staging.dart · main_prod.dart   (flavours)
```
Dependency direction is strictly **presentation → application → domain ← data**. Domain knows nothing about Firebase, so the backend stays swappable (relevant if Firestore's reporting cost ever forces a move to Postgres).

### 5.3 Firestore data model (tenant-rooted)

Rooting everything under `tenants/{tenantId}/…` makes isolation a **path check** in the rules — the simplest thing that can't be got wrong.

```
users/{uid}                          profile, memberships[], activeTenantId, fcmTokens[]
invites/{inviteId}                   tenantId, email, role, warehouses[], code, status, expiresAt
tenants/{tid}
  ├─ (doc)                           name, plan, status, settings{currency,tz,fefo,numbering}, onboarding{}, usage{}
  ├─ members/{uid}                   role, warehouses[], status, joinedAt
  ├─ warehouses/{wid}                name, address, binSequence
  ├─ zones/{zid}                     wid, name
  ├─ bins/{binId}                    wid, zid, code, type(receiving|storage|staging|quarantine), seq, capacity
  ├─ products/{sku}                  code, name, barcodes[], uom, packSize, dims, cost, mrp,
  │                                  tracks{batch,expiry,serial}, reorderPoint, safetyStock, image
  ├─ barcodes/{barcode}              → skuId          (flat lookup, O(1) scan resolution)
  ├─ partners/{pid}                  type(supplier|customer), name, contact, address
  ├─ purchase_orders/{poId}          + lines[] (or lines subcollection if > 200)
  ├─ receipts/{rid}                  poId, status, lines[], variances[], grnUrl, userId
  ├─ sales_orders/{soId}             + lines[], allocation state, status
  ├─ pick_lists/{plId}               soIds[], assignedTo, lines[] (bin-sequenced), status
  ├─ shipments/{shId}                soId, boxes[], weight, carrier, awb, labelUrl, status
  ├─ transfers/{trId}                fromWid, toWid, lines[], status
  ├─ counts/{cid}                    scope, blind, lines[], variances[], status
  ├─ returns/{retId}                 soId, lines[], disposition
  ├─ adjustments/{adjId}             lines[], reason, status, requestedBy, approvedBy
  ├─ stock_moves/{moveId}            APPEND-ONLY: ts, type, skuId, batch, qty(+/-), binId, wid,
  │                                  refType, refId, userId, opId, costAtMove
  ├─ stock_positions/{skuId_wid_binId_batch}   DERIVED: onHand, reserved, updatedAt
  ├─ aggregates/{docId}              DERIVED: kpi_today, kpi_month, sku_velocity, low_stock, near_expiry
  ├─ locations/{locId}               type(warehouse|store|dark_store|3pl|vendor|transit|quarantine),
  │                                  geo{pincode,lat,lng}, serviceablePincodes[]|radiusKm,
  │                                  fulfilsOnline, allowsPickup, dailyPickCapacity, dispatchCutoff,
  │                                  costToServe, priority, status(draft|dry_run|live|quarantined|paused)
  ├─ location_stock/{locId_skuId}    onHand, reserved, asOf, source, confidence     [HOT — batched writes]
  ├─ location_stock_agg/{locId}      DERIVED: totalSellable, skuCount, staleSince    [the read path]
  ├─ reservations/{resId}            locId, skuId, qty, orderId, expiresAt, state
  ├─ routing_attempts/{attId}        APPEND-ONLY: orderId, seq, locId, score, offeredAt,
  │                                  outcome(accepted|rejected|timed_out), reason, costDelta, delayMins
  ├─ location_scores/{locId}         DERIVED: trustScore, rejectRateByReason{}, safetyBuffer{}, updatedAt
  ├─ connectors/{connId}             locId, adapter, transport(pull|push|file), secretRef,
  │                                  schedule, lastSuccessAt, consecutiveFailures, health
  ├─ sku_map/{connId_externalSku}    → skuId  (per-connector identity map; misses go to the queue below)
  ├─ unmapped_skus/{connId_extSku}   externalSku, seenCount, firstSeenAt, sampleName
  ├─ notifications/{nid}             userId, type, payload, readAt
  ├─ audit_log/{aid}                 actor, action, target, before/after, ts, ip
  └─ counters/{name}                 numbering series (PO/SO/GRN) — incremented in a transaction
```

**Indexing notes.** Composite indexes needed on: `stock_moves (skuId, ts desc)`, `stock_moves (binId, ts desc)`, `stock_positions (skuId, wid)`, `stock_positions (wid, binId)`, `sales_orders (status, createdAt desc)`, `purchase_orders (status, createdAt desc)`, `pick_lists (assignedTo, status)`. Barcode → SKU is a flat doc-id lookup so scanning never runs a query.

**Omni indexing.** `location_stock (skuId, confidence desc)` answers "who has this SKU, best first";
`locations (status, fulfilsOnline)` narrows routing candidates before any scoring;
`routing_attempts (orderId, seq)` replays one order's history and `routing_attempts (locId, outcome, offeredAt desc)`
feeds the trust loop; `reservations (expiresAt)` lets the reaper find only what expired.
Both stock keys are **composite doc ids** (`locId_skuId`), so the routing engine reads candidates by id
rather than querying — the same trick as barcode lookup, applied to the hot path.

### 5.4 Security Rules strategy (no code here — the shape)
- Every request must carry claims `tenantId`, `role`, `warehouses[]`.
- **Read**: allowed only if `{tenantId}` in the document path equals the token's `tenantId`, *and* the role appears in that collection's read-allow set, *and* (for warehouse-scoped collections) the doc's `wid` is in `warehouses[]` or the claim holds `"*"`.
- **Write**: **denied outright** for `stock_moves`, `stock_positions`, `aggregates`, `audit_log`, `counters`, `members`, and the tenant doc. Those are Function-only.
- Master data and order-header writes are allowed direct-from-client for roles that hold the matching `module.write` permission — with field-level guards (client may not set `tenantId`, `createdBy`, or any derived total).
- Storage rules mirror the same tenant-path check; uploads capped by size and content type.
- **App Check** required on Firestore, Storage and Functions, so a stolen API key alone is useless.

### 5.5 Cloud Functions (the authority layer)
| Function | Trigger | Job |
|---|---|---|
| `createOrganization` | callable | Create tenant + owner membership + set claims + seed settings |
| `inviteUser` / `acceptInvite` | callable | Validate inviter's grant rights + seat limit; set claims on accept |
| `setUserRole` / `revokeUser` | callable | Change claims, write audit; block privilege escalation |
| `postStockMove` | callable | **The core.** Validate → idempotency check on `opId` → transaction: append moves, upsert positions, update ref doc status, write audit, bump aggregates |
| `completeReceipt` | callable | Post receipt moves, update PO, generate GRN PDF, create putaway tasks |
| `allocateOrder` | callable | Reserve stock FEFO/FIFO, flag shortfalls |
| `generatePickList` | callable | Build bin-sequenced pick lines, assign, notify |
| `confirmPick` / `packOrder` / `dispatchOrder` | callable | State transitions + moves + label/slip PDFs |
| `postCount` / `approveAdjustment` | callable | Convert variances into adjustment moves after approval |
| `nextNumber` | callable / internal | Atomic document numbering from `counters` |
| `bulkImport` | Storage trigger | Parse CSV → validate → write in batches → return error report |
| `onMoveWritten` | Firestore trigger | Incremental aggregate updates (KPI, velocity) |
| `rebuildAggregates` | scheduled nightly | Full recompute — self-heals any drift from incremental updates |
| `expiryAndReorderScan` | scheduled daily | Near-expiry + reorder-point alerts → notifications + push |
| `paymentWebhook` | HTTPS | Razorpay/Stripe events → plan status, seat limits |
| `enforcePlanLimits` | callable / internal | Reject writes past plan caps |
| `exportTenantData` | callable | Zip a tenant's data to Storage, signed URL |
| **`routeOrder`** | callable / order trigger | **The omni brain.** Score routable locations, pick a plan, store the fallback chain, place TTL reservations. Idempotent on `opId` |
| `respondToOffer` | callable | A store accepts / rejects with reason → on rejection release the hold, advance the chain, log the attempt |
| `reapOfferTimeouts` | scheduled (1 min) | Auto-reject silent offers and expired reservations, then re-route — no order waits on a quiet store |
| `syncLocationStock` | scheduled / webhook / Storage trigger | The three connector transports (§5.8): land raw → map → write **changed rows only** → bump `location_stock_agg` → write `sync_runs` |
| `pushStockBack` | callable / internal | Write-back allowlist: push movements we originated to the store's POS |
| `recomputeLocationScores` | scheduled nightly + on rejection | Trust score, per-reason reject rates, auto-tuned safety buffers from `routing_attempts` |
| `quarantineLocation` | internal | Drop a location out of routing on negative stock or a stale sync, and alert |
| `availabilityLookup` | callable | `sku + pincode + radius` → ranked locations with qty, ETA, pickup flag, confidence |
| `proposeRebalances` | scheduled daily | Dead stock at A vs stockout risk at B → transfer suggestions with expected ₹ gain |
| `dryRunRouting` | callable | Replay a window of real orders against a candidate rule set; returns what would have changed |

### 5.6 Offline & sync design
1. Firestore offline persistence serves **reads** (SKUs, bins, assigned pick lists) from cache.
2. **Writes** never go straight to Firestore for stock. They land in a local **outbox** row: `{opId, fn, payload, attempts, state}`.
3. A drain worker fires on connectivity regain and on app resume, sending ops **in creation order**.
4. Every Function is **idempotent on `opId`** (a processed-ops doc set) — retries and duplicate sends are harmless.
5. Server rejects an op only for a real reason (stock already moved, order closed, permission changed) → the op is marked `conflict` and shown on a **Sync issues** screen with the reason and a resolve action.
6. UI shows an always-visible sync chip: `synced` / `N pending` / `N issues`.

### 5.7 Omnichannel routing architecture
| Piece | Shape |
|---|---|
| `locations` | typed registry + geo + capacity + cut-off + `status` (draft/dry_run/live/quarantined) |
| `location_stock` | per location × sku: `on_hand`, `reserved`, `as_of`, `source`, `confidence`. The hot write path — POS syncs touch it in batches |
| `location_stock_agg` | one doc per location (and one per sku) holding total sellable, so the storefront reads a single document instead of a query |
| `reservations` | TTL-bearing holds against a location + sku + order; a scheduled Function reaps expired ones |
| `routing_attempts` | **append-only** decision log — the input to every omni metric and to the trust loop |
| `location_scores` | derived: trust score, per-reason reject rates, auto-tuned safety buffers. Recomputed nightly + incrementally on rejection |
| `routeOrder` | Callable Function: deterministic, fully logged, replayable. Same idempotency-on-`opId` contract as `postStockMove`, so an offline retry can never double-reserve |

Routing lives server-side for the same reason stock does: it must be atomic against reservations, and it
must be auditable after the fact. The fallback chain is computed **once** at allocation and stored on
the order, so a rejection is a cheap pointer-advance rather than a re-scoring storm during a sale.

### 5.8 POS / external-system connector framework
- **One interface, three transports** — pull (scheduled Function polls the POS), push (HTTPS webhook Function), file (Storage-triggered CSV/Sheet). Adding a POS vendor is a new adapter, not a new pipeline.
- **Raw-first, always.** Land the source payload verbatim before mapping, so a mapping bug is re-runnable without re-hitting the POS. Vendor rate limits are real, and a backfill you can only run once is a backfill you will get wrong.
- Per-tenant, per-location connector config in Firestore holding **secret references only** — credentials live in Secret Manager and are never readable by a client.
- Every run writes a `sync_runs` row: cursor, rows in, rows changed, errors, duration. That row is what the sync-health module (§2.12) reads.
- Per-connector identity map (POS SKU/barcode ↔ our SKU) with an unmapped queue. An unrecognised SKU is a task, never a dropped row.
- Adapters are **read-mostly with an explicit write-back allowlist** — the WMS pushes back only the movements it owns (returns restocked, transfers received), so it can never stampede a store's own book.

### 5.9 Non-functional targets
| Concern | Target / approach |
|---|---|
| Scan → confirm latency | < 300 ms locally, optimistic UI, server confirm async |
| Devices | Android 8+, low-RAM budget phones; 60 fps on lists via pagination + `ListView.builder` |
| Warehouse network | Full offline operation for at least a whole shift |
| Firestore cost | Aggregate docs for dashboards, paginate everything, cache masters locally, never scan the ledger from the client |
| Security | App Check, three-layer RBAC, no client-side stock math, full audit trail |
| Tenant isolation | Path + claim + rules; a cross-tenant read is impossible by construction |
| Observability | Crashlytics, Function structured logs keyed by `tenantId` + `opId`, per-tenant error dashboards |
| Data ownership | One-click tenant export; deletion honours a documented retention window |
| Routing latency | < 2 s from order arrival to a location being offered; scoring is O(candidate locations), and candidates are pincode/radius-filtered first |
| Stock freshness | Store stock no older than its own threshold (default 15 min) or the location loses routing confidence; every number renders with its `as_of` |
| Oversell | Target < 0.5% of online orders; every oversell event is logged with its cause and feeds buffer tuning |

### 5.10 What the omni layer costs on Firestore (named, not hidden)
`location_stock` is the one genuinely hot collection: 41 locations × 40k SKUs is 1.6M documents, and a
full POS sync would rewrite a large slice of it. Three mitigations, all in the design above: write
**only changed rows** (the POS tells us `oldQty → newQty`), batch them, and keep the read path on the
per-location aggregate docs so no client ever queries the wide collection. If a tenant outgrows that,
`location_stock` is the first thing that moves to Postgres — which is exactly why the domain layer
(§5.2) knows nothing about Firebase.

---

## 6. Build phases

| Phase | Contents | Exit criteria |
|---|---|---|
| **P0 — Foundation** | Auth, org creation, invites, RBAC + claims, rules, tenant settings, onboarding wizard, app shell + role nav | Two isolated tenants; an Operator provably cannot read the other's data or another warehouse |
| **P1 — Core loop** | Products, bins, barcode lookup, scanner, receiving, putaway, inventory lookup, transfer, stock ledger + positions via `postStockMove` | One SKU can be received, put away, found by scan, moved — and the ledger sums exactly to the position |
| **P2 — Outbound** | Sales orders, allocation, pick list, scan-verified pick, pack, dispatch, labels/slips | An order goes confirmed → dispatched entirely on the phone |
| **P3 — ⭐ Omnichannel** | Typed locations, POS connector framework + first adapter, sync health & auto-quarantine, availability engine, routing + fallback chain (§5.7), store fulfilment flow, jump tracking + trust loop | A store's POS-fed stock routes a real online order, a rejection auto-re-routes with a reason, and the jump rate is visible |
| **P4 — Control** | Adjustments + approvals, cycle counts + variance, returns inward, audit log | A full stock take reconciles and posts |
| **P5 — Insight** | Dashboard KPIs, aggregates, reports + exports, notifications, low-stock & expiry alerts, omni scorecard per location | Owner opens the app and understands the business in 5 seconds |
| **P6 — SaaS** | Plans, limits, payments, usage metering, super-admin console, tenant export | A stranger can sign up, pay, and use it with zero help from us |
| **P7 — Scale** | BOPIS + endless aisle + return-anywhere, rebalancing automation, wave picking, 3PL multi-client, marketplace fan-out, public API, BigQuery reporting | — |

**P3 is the moat.** P0–P2 make a competent WMS; a dozen vendors sell that. P3 is the part every
multi-location brand is bleeding on and no affordable tool closes. It depends on nothing in P4–P7, so
it can ship straight after outbound.

---

## 7. Open decisions

1. **Costing method** — moving average vs FIFO cost layers? Decides whether stock *value* on the dashboard is trustworthy for accounting. (Recommend: moving average for MVP, store `costAtMove` on every ledger row so FIFO can be derived later.)
2. **Shared-device model** — one device login per shift with per-operator PIN, or one Firebase account per operator? Affects seat pricing and audit granularity.
3. **Serial tracking in MVP or not** — it roughly doubles receiving-flow complexity.
4. **Pricing axis** — per user, per warehouse, per order volume, or per SKU count? Drives what `usage{}` must meter from day one.
5. **Tax/GST documents** — do we generate e-invoices / e-way bills, or stay a pure stock system and hand off to Tally/Zoho? (Big scope fork.)
6. **iOS in v1?** Flutter gives it nearly free, but warehouse hardware is Android.
7. **Does the Owner ever need a web view?** Firestore + Functions stay identical if a Flutter Web admin is added later — worth keeping the domain layer clean for that.
8. **Which POS do we adapt first?** The first adapter defines the interface. Pick the POS with a documented stock endpoint and a real customer waiting, not the biggest one.
9. **Is a store's POS or our WMS authoritative for that store's stock?** Recommend: **the POS is authoritative for on-hand, we are authoritative for reservations.** Anything else means two systems both think they own the same number.
10. **Does a store get to reject an order at all?** A hard-accept model kills the jump problem outright but makes staff hide stock; the reject-with-reason model keeps them honest and gives us the trust signal. Recommend reject-with-reason plus a visible per-store scorecard.
11. **Do we ever write stock back into a store's POS?** Recommend yes but narrow (§5.8 allowlist): only movements we originate. A full two-way stock sync is how you corrupt a client's book of record.

## 8. Known risks

| Risk | Mitigation |
|---|---|
| Firestore reporting limits bite as tenants grow | Aggregates + BigQuery export from P4; domain layer stays backend-agnostic so Postgres remains an option |
| Aggregate drift from incremental updates | Nightly `rebuildAggregates` self-heal + a variance alert if the rebuild differs from the incremental value |
| Offline conflicts confusing floor staff | Conflicts are never silent — dedicated Sync-issues screen, plain-language reasons, one-tap resolve |
| Camera scanning too slow for high-volume picking | HID hardware-scanner support in MVP, not as a later add-on |
| RBAC bypass via direct SDK calls | All stock writes are Function-only; rules deny client writes on derived collections; App Check enforced |
| Cost blow-up from read-heavy dashboards | Every dashboard reads a single aggregate doc, not a query |
| **A store's POS stock is simply wrong** (the core omni risk) | Never trusted absolutely: per-location safety buffer auto-tuned from that store's own failure rate, confidence decay on staleness, auto-quarantine on negatives, and a fallback chain so one bad location costs a re-route rather than a cancelled order |
| Untyped / half-configured location poisons every number | A location is not routable until typed + connected + dry-run clean + non-negative. Proven necessary: one untyped warehouse row in a live system carried −1,074,445 units |
| Summing two systems that describe one stock pool | One authoritative counter per location, the other stored as a reconciliation delta — never added |
| Routing rule change breaks fulfilment silently | Dry-run replay against last month's real orders before any rule goes live; `routing_attempts` is append-only so every change is measurable after the fact |
| Store staff game the reject reasons | Reasons are per-store scored and visible on a leaderboard the Store Manager sees; `not_found` triggers a real inventory adjustment, so gaming it costs them stock accuracy |
