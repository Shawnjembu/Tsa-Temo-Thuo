# Business Rules and Invariants — Tsa Temo Thuo

Team 10 — Tsa Temo Thuo · CSI473 Lab 4 · 21 August 2026
Traces to: docs/requirements.md, docs/use-cases/UC-01-place-order.md, docs/acceptance-criteria.md, docs/quality-scenarios.md, models/domain-model.mmd

These are the invariants the domain model has to hold. For each one we name the class that owns it and where it's checked against the acceptance criteria or quality scenarios.

## BR-01. Stock reservation is atomic and never oversells

Across all of a listing's orders in the Placed or Confirmed state, the combined quantity can't exceed the listing's original quantity. Decrementing the remaining quantity is a single operation on `Listing`, and it has to run as one indivisible step, not a read followed later by a separate write. This lives on `Listing` and is what FR-06, UC-01 step 4, AC-04 and QS-01 are all ultimately checking.

## BR-02. Order quantity can't exceed what's actually left

When an order is created, the quantity has to be greater than zero and no more than the listing's remaining quantity, checked at the exact moment of the decrement rather than against a quantity read earlier in the request (that's what BR-01 guards against). Split across `Listing` and `Order`. Ties to FR-05, FR-07, UC-01 step 3, AC-01 and AC-02.

## BR-03. A rejected order doesn't touch the listing's stock

If an order gets rejected, whether for quantity (BR-02) or because the listing isn't Active (BR-04), nothing changes: no decrement, no order record. Rejection is a no-op, not something that needs undoing afterward. Owned by `Listing`. FR-07, UC-01 extensions 3a/3b, AC-02, AC-03.

## BR-04. Orders can only be placed against an Active listing

A listing in the SoldOut or Expired state has to reject any new order. The transition itself is automatic: SoldOut once remaining quantity hits zero, Expired once the current date passes the listing's availability end. Owned by `Listing`. FR-09, UC-01 extension 3b, AC-03.

## BR-05. Declining an order gives the stock back

If a farmer declines a Placed order, or a Confirmed reservation isn't finalised in time, the reserved quantity is added back onto the listing's remaining quantity. If that brings a SoldOut listing's remaining quantity above zero, it goes back to Active. Split across `Listing` and `Order`. FR-08 and proposal §6 step 5.

## BR-06. Only the listing's own farmer can confirm or decline its orders

Any confirm/decline attempt is checked against listing ownership first. If the acting farmer doesn't own the listing the order was placed against, the attempt is rejected and the order state doesn't move. Spans `Order`, `Listing` and `Farmer`. FR-08, QS-05.

## BR-07. A retried submission can't double-reserve stock

Order submissions carry an idempotency token. If a token has already produced an accepted order, a later submission with the same token just returns that order's existing state, it doesn't create a second order and it doesn't decrement the listing a second time. Owned by `Order`. FR-06, UC-01 extension 4b, AC-05, QS-03.

## BR-08. Listing and ordering both require a verified account

A farmer can only create a listing, and a buyer can only place an order, while their verification status is Verified. Nothing else about the request matters if that's not true. Spans `User` and `Registration`. FR-01, FR-02, UC-01 precondition 1.

## BR-09. Only the assigned transporter can move a job forward

A transport job's state only advances (Accepted → In Transit → Delivered) at the hand of the transporter it's currently assigned to. Any update from someone else is rejected. Spans `TransportJob` and `Transporter`. FR-11.

## BR-10. Order state changes are appended, never overwritten

Every time an order's state changes, a new `OrderStatusEvent` gets added rather than the previous state being edited or removed. That's what lets the full history be reconstructed even after a crash or restart. Spans `Order` and `OrderStatusEvent`. FR-12, FR-13, QS-06.
