# Traceability Matrix — Tsa Temo Thuo

Team 10 · CSI473 Lab 4 · 21 August 2026

This matrix links each functional requirement to the relevant use case, domain-model elements, and the business rules or criteria that can be used to check it.
The sources used were `docs/Requirements.md`, `docs/use cases/UC.md`,
`docs/acceptance-criteria.md`, `docs/quality-scenarios.md`,
`docs/business-rules.md`, and `models/domain-model.mmd`.

At this stage, UC-01 (Place Order) is the only use case that has been fully
written. It represents the Phase-2 vertical slice. The other requirements,
such as registration, listing, search, transport, and reporting, are linked
to the relevant domain-model elements and business rules. Their use cases are
marked as not yet drafted instead of creating details that have not been
confirmed yet.

|Requirement|Use case|Analysis element(s)|Verification|
|-|-|-|-|
|FR-01 — submit registration|*Not yet drafted* (comes before UC-01)|`Account` (abstract: `Farmer`/`Buyer`), `verificationStatus`|BR-08|
|FR-02 — admin reviews registration|*Not yet drafted*|`Administrator.verifyRegistration()`, `Account.verificationStatus`|BR-08|
|FR-03 — create listing|*Not yet drafted*; assumed in UC-01 precondition 2|`Farmer.createListing()`, `Listing`|BR-04, BR-08|
|FR-04 — search Active listings|*Search Listings*, not yet drafted; mentioned in UC-01 step 1|`Listing`, `ListingState`|QS-02|
|FR-05 — place order within remaining quantity|UC-01 steps 3–4|`Buyer.placeOrder()`, `Order`, `Listing.remainingQuantity`|AC-01, AC-02, BR-02|
|FR-06 — atomic reservation, never oversells under concurrency/duplicates|UC-01 steps 4–5, extensions 4a/4b|`Listing.reserveStock()`|BR-01, BR-02, BR-07, AC-04, AC-05, QS-01, QS-03|
|FR-07 — reject invalid/unavailable order, stock unchanged|UC-01 extensions 3a, 3b|`Listing` (state check), `Order` (rejected — no record)|BR-03, BR-04, AC-02, AC-03|
|FR-08 — farmer confirms/declines; decline releases stock|UC-01 extensions 5a, 6a|`Order.confirm()`, `Order.decline()`, `Listing.restoreStock()`|BR-05, BR-06, QS-05, QS-06, QS-07|
|FR-09 — auto-transition to Sold Out / Expired, reject new orders|UC-01 extension 3b|`Listing.state` (`ListingState` enum)|BR-04, AC-03|
|FR-10 — request transport, transporter accepts|*Not yet drafted*|`Order` —requests→ `TransportJob`, `Transporter.acceptJob()`|CRC: TransportJob (planned test, not yet written)|
|FR-11 — transporter updates delivery status, buyer confirms receipt|*Not yet drafted*|`TransportJob.updateStatus()`, `Order.recordDelivery()`|QS-08 (quality/responsibility split)|
|FR-12 — view order state and full status history|*Not yet drafted*|`Order`, `OrderStatusEvent` *(added rev. 2)*|BR-10, QS-09|
|FR-13 — admin report of order activity by state/date range|*Not yet drafted*|`Administrator.generateReport()`, `OrderActivityReport`, `Order` (source data)|BR-10 (data integrity of the source it aggregates)|



