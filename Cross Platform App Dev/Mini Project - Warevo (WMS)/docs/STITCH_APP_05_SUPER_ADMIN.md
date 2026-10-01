# Stitch — Application 5 of 5: SUPER ADMIN

Persona: the SaaS founders. A separate build no tenant ever sees. Screens: **21** across six acts.

Run it the same way as Application 1: one Stitch project, `DESIGN.md` uploaded once, paste the whole prompt; if Stitch stops early, keep the CONTEXT, PERSONA, DESIGN, SHELL block as a fixed header and send one ACT at a time prefixed "Continue the Super Admin application."

---

## The prompt

```
APPLICATION CONTEXT

Ledger is a stock system for Indian D2C brands that sell online and through physical stores. It records every unit movement as an append-only ledger, pulls store stock from each store's POS, routes online orders to the best location with a stored fallback chain, and logs every failure with its reason. It is sold as a multi-tenant SaaS: a brand signs up, gets an isolated workspace, invites its staff, and pays monthly through Razorpay in India or Stripe abroad.

Ledger ships as five separate mobile applications that share one design system (DESIGN.md): Owner, Warehouse Floor, Warehouse Manager, Store, and Super Admin. This prompt is the SUPER ADMIN application, complete, used only by Ledger's founders. Its job is to run the SaaS: who is paying, who is on trial, who is about to churn, what each tenant costs us to serve, whether the platform is healthy, and to act (extend a trial, override a limit, issue a credit, impersonate for support, suspend) with an audit trail the tenant can see. Its whole point is one join no external dashboard can do: revenue × usage × cost per tenant. Revenue comes from the payment provider; usage and cost come from our own metering of Firestore, Functions and Storage per tenant. A tenant whose infrastructure costs more than their subscription is shown in red before the cloud bill arrives.

PERSONA

Anshuman Atrey and Ayush Jha, co-founders. Forty-one tenants, ₹4.82 L MRR, six on trial. Anshuman checks it between builds on his phone; Ayush before sales calls. Their fears: a tenant whose Firestore bill exceeds their subscription for months; a failed payment nobody chased; a POS connector outage that turns into a customer's oversell; a trial that expired quietly with nobody calling. They want MRR in one glance, the margin-negative tenants in red, connector failures before the tenant notices, and impersonation that is one tap and fully logged.

DESIGN

Follow DESIGN.md exactly. White everywhere, white cards with a 1px hairline border, no shadows. Black is the only action colour. Green only where a number went up or a thing is healthy; red only where a number went down, a payment failed, a margin is negative, or a connector is failing. Everything else black and three greys. The Founders Dashboard pattern anchors this application: a 2×2 grid of value-first KPI cards with uppercase labels, a green ▲ or red ▼ delta bound to its comparison window in one phrase, a sparkline band, then a chart card with one black line and a dashed grey comparison. Inter with tabular numbers; payment ids, tenant ids and function names in JetBrains Mono. Indian rupee grouping: ₹4.82 L, ₹57.8 L, ₹12,000.

SHELL (every screen after Act 1)

Top bar: screen title left, "as of 6 min ago" right in muted text. Fixed bottom nav, five items: Home, Tenants, Health, Billing, Admin. Active item black with a 4px dot. While impersonating a tenant, a persistent black banner sits under the top bar on every screen: "Impersonating Ashva Apparel as Aarav · 14:37 left · End". Android, portrait, 390×844.

ACT 1. ENTRY (2 screens)

1. Internal sign in. Wordmark "Ledger · Platform" and the line "Founders only". Primary "Continue with Google Workspace". Show the second-factor state: a card "Touch your security key" with a key glyph, and beneath it a text link "Use a 6-digit code instead" which reveals six monospace cells. Footer "Every session is logged."

2. Unlock. Small line "Ledger · Platform · Anshuman", a biometric glyph with "Touch to unlock", a text link "Use PIN instead", and a muted line "Session expires in 12 hours".

ACT 2. HOME (3 screens)

3. Platform home. Title "Platform". KPI grid: "₹4.82 L MRR ▲8.3% vs last month" green with sparkline; "₹57.8 L ARR · at current MRR"; "₹38,000 NET NEW MRR · +₹52K new · +₹9K expansion · −₹23K churn"; "41 ACTIVE TENANTS · 6 on trial · 2 past due". Chart card "MRR by month": black line over 12 months, dashed grey prior year. Card "Costing more than they pay" with one red row: "Ashva Apparel · pays ₹12,000 · Firebase ₹14,300 · margin −19%" and a chevron. Card "Trials expiring this week" with two rows: "Bloom Kids · 3 days left" and "Trail & Co · 5 days left", each with a chip "Extend".

4. Trials and conversion. Segmented "Expiring 7d · All trials 6 · Converted 30d". A funnel strip "Signed up 22 → activated 14 → paid 9 · 41%". Rows: tenant name, plan being trialled, days left (red at 3 or fewer), a usage line "18 users · 1,200 SKUs · 41 locations", an activation line "12 orders shipped" in green or "no stock moved yet" in grey, and chips "Extend 7d", "Call".

5. Alerts. Title "Alerts", chips "Mute", "Assign to Ayush". Rows with a 6px dot and a chevron: red "Nimbus Home · payment failed 3rd time · ₹8,000"; red "Ashva Apparel · margin −19% for 2 months"; red "Kora Beauty · 6 connectors failing · 2h 14m"; grey "Bloom Kids · trial expires tomorrow"; grey "routeOrder error rate 0.4% · above 0.2% target".

ACT 3. TENANTS (5 screens)

6. Tenants. Search "Search tenant", chip "Filter". Segmented "All 41 · Trial 6 · Active 33 · Past due 2". Rows: tenant name, status pill (Active green, Trial grey, Past due red), MRR right-aligned "₹12,000", sub-line "Growth plan · 14 users · 41 locations · margin 38%". One row with margin "−19%" in red. One row with "Last active 21 days ago" in red.

7. Tenant detail, "Ashva Apparel", chip "Impersonate". Pills "Active" green, "Growth plan", "Since Mar 2026". KPI grid: "₹12,000 MRR ▲ from ₹8,000" green; "₹14,300 / mo FIREBASE COST · 92% from POS syncs"; "−19% GROSS MARGIN" in red; "14 / 25 SEATS USED". Card "Usage vs plan" with four thin bars "Users 14 / 25", "Locations 41 / 50", "SKUs 4,120 / 10,000", "Orders 3,812 / 5,000". Card "Health": "Connectors 39 of 41 healthy · 2 stale" with the 2 in red, "Oversell events 3 this month", "Function errors 0.2%". Card "Actions": rows "Extend trial", "Override a limit", "Issue credit", "Change plan", "Resend owner invite", and "Suspend tenant" in red text. Footer "Every impersonation writes an audit row the tenant can see."

8. Usage and cost breakdown, "Ashva Apparel · cost". KPI grid "₹14,300 THIS MONTH ▲22% vs last month" red; "1.6M DOCUMENTS · location_stock"; "48M READS · 92% from POS syncs"; "₹12,000 REVENUE". Card "Cost by driver" with bar rows "Firestore reads ₹9,800", "Firestore writes ₹3,100", "Functions ₹900", "Storage ₹500". Chart "Cost vs revenue · 6 months": black cost line, dashed grey revenue line, the crossing point marked with a dot. Card "Suggestions" with two rows and chips: "Raise their sync interval to 30 min · −38% reads", "Propose Scale plan · ₹25,000".

9. Impersonate. A bottom sheet: "Impersonate Ashva Apparel as Aarav (Owner)?" Required input "Reason" with placeholder "Support ticket number". Duration chips "15 min" selected, "1 hour". A toggle "Allow writes" off, whose label turns red when on. Note "Read-only by default. The tenant's audit log will show: Ledger support viewed as Aarav · 14:02 · reason." Primary "Start session". Show the active state: the persistent black banner "Impersonating Ashva Apparel as Aarav · 14:37 left · End" under the top bar of the Tenant detail screen.

10. Tenant actions. A bottom sheet of rows: "Extend trial · +7 days · +14 days" as two chips; "Override a limit · Locations 50 → 60 · until 1 Oct" with a numpad on tap; "Issue credit · ₹" with an amount input; "Change plan" with a select; "Resend owner invite"; a hairline; "Suspend tenant · they see read-only" in red text; "Schedule deletion · 30-day hold" in red text. Show the confirm state for Suspend: "Type ASHVA to confirm", a text input, a reason input, and a solid red button "Suspend Ashva Apparel", the only solid red button in the application.

ACT 4. HEALTH (4 screens)

11. Platform health. KPI grid: "412 / 430 CONNECTORS HEALTHY · 18 stale" with 18 in red; "7 OVERSELL EVENTS 24H ▲3 vs yesterday" red; "0.2% FUNCTION ERROR RATE ▼0.1pp" green; "6 min SYNC LAG P95 · target under 15 min". Card "Oversells by cause" with bar rows "Stale store stock 4", "Two counters summed 2", "Untyped location 1". Chart "Sync runs per hour · 24h": black line, dashed grey error line.

12. Failing connectors. Segmented "Failing 18 · Stale 22 · All 430". Rows: "Kora Beauty · Indiranagar · Shopify POS · failing 2h 14m · 401 Unauthorized" with the duration and error in red, chips "Retry", "Notify tenant". Show one row expanded: a small table of the last five runs with time, rows, and error in monospace, and a note "Credential likely rotated. Ask the tenant to reconnect."

13. Oversell events. Segmented "24h 7 · 7d 31 · by cause". Rows: "Ashva Apparel · #ORD-88240 · Phoenix Palassio · stale store stock 52 min · ₹1,299", "Nimbus Home · #NH-4471 · Koramangala · two counters summed · ₹2,450". Chart "Oversells by week": black line, dashed grey target. Muted line "Every event feeds that location's safety buffer automatically."

14. Functions and sync lag. KPI grid "0.2% ERRORS · all functions", "6 min P95 SYNC LAG", "0.05% postStockMove", "0.4% routeOrder" in red. A table with columns Function, Calls 24h, Errors, p95 ms; six rows with function names in monospace; the routeOrder row's error cell in red. Chart "Errors per hour · 24h" with one black line.

ACT 5. BILLING (4 screens)

15. Billing events. Chip "Export". Segmented "All · Failed 2 · Refunds". Rows grouped under date eyebrows: tenant name, a type eyebrow PAYMENT, PAYMENT FAILED, PLAN CHANGE or REFUND, amount right-aligned ("₹12,000" black, "−₹3,000" for a refund, failed amounts in red), sub-line "Razorpay · pay_MkX93… · card ending 4421" with the id in monospace. Failed rows carry chips "Retry" and "Notify owner".

16. Payment detail. Title "Nimbus Home · ₹8,000", pill "Failed" red. Rows: "Razorpay pay_MkX93…" monospace, "card ending 4421 · insufficient funds", "Attempt 3 of 4 · next retry 12 Sep". A vertical dunning timeline: "Day 1 · email sent" done, "Day 3 · WhatsApp sent" done, "Day 7 · read-only" pending with a toggle on. Chips "Retry now", "Send pay link", "Waive this month".

17. Plans and limits. Three plan cards: "Starter · ₹4,000 · 5 users · 3 locations · 2,000 SKUs · 1,000 orders/month"; "Growth · ₹12,000 · 25 · 50 · 10,000 · 5,000"; "Scale · ₹25,000 · 100 · 200 · 50,000 · 25,000". Each number is an editable input. Toggle "Grandfather existing tenants at their current price" on. Muted line "Limits are enforced server-side in Functions." Primary "Save plans".

18. Revenue report. Segmented "Sep · Q3 · 2026". Chips "CSV", "PDF". A table "MRR movements" with columns Tenant, Type, Δ MRR; rows "Trail & Co · New · +₹12,000", "Ashva Apparel · Expansion · +₹4,000", "Kora Beauty · Contraction · −₹4,000" in red, "Urban Threads · Churn · −₹8,000" in red; a bold totals row "+₹38,000 net". Chart "MRR waterfall": black bars for new and expansion, grey for start and end, red bars for contraction and churn.

ACT 6. ADMIN (3 screens)

19. Feature flags. Rows with a toggle and a scope chip: "Wave picking · 12% of tenants · rollout"; "Routing weights v2 · Ashva Apparel only"; "Store dark mode · off"; "New import mapper · all tenants". Chip "+ New flag". Muted line "Remote Config. Changes reach every app in under a minute."

20. Super-admin audit log. Chip "Export". Rows: "Anshuman impersonated Ashva Apparel as Aarav · 15 min · ticket 421 · 14:02"; "Ayush extended Bloom Kids trial · +7 days · yesterday"; "Anshuman changed Growth price ₹10,000 → ₹12,000 · 1 Aug"; "Ayush waived Nimbus Home · ₹8,000 · 28 Aug". Footer "Immutable. Tenants see the rows that concern them."

21. Team and access. Rows: "Anshuman Atrey · FOUNDER", "Ayush Jha · FOUNDER", a chip "Add support engineer · read-only". Toggle "Require a security key" on. Rows "Sign out", "Sign out of all devices". Footer "Ledger Platform · build 1.0.0".

FLOW

Internal sign in → Unlock → Platform home. Every later open goes Unlock → Platform home. Home rows open Tenant detail or Trials. Alerts is a bell in the Home top bar. Tenants rows open Tenant detail; its chips open Usage and cost, Impersonate, and Tenant actions. Health rows open Failing connectors, Oversell events, or Functions and sync lag. Billing rows open Payment detail; Plans and limits and Revenue report are chips in the Billing header. Admin holds Feature flags, Audit log, and Team and access as a stacked list. Do not add any tenant-side screen (stock, orders, scanning, locations) to this application; those live in the other four applications, and the only way to see them here is through a logged impersonation.
```
