# Acceptance Criteria - UC-01: Place Order

Team 10 - Tsa Temo Thuo
CSI473 Lab 3, 14 August 2026
Traces to docs/use-cases/UC-01-place-order.md, FR-05, FR-06, FR-07

AC-01 to AC-05 cover the Phase 2 minimum vertical slice. AC-01 is the success
path. AC-02 and AC-03 are the rule/validation path. AC-04 and AC-05 are the
failure path (brief section 7, items 5-6).

AC-01: Successful order reserves stock (normal path)
Given an Active listing with 50 kg of tomatoes remaining, owned by a verified
farmer. When a verified buyer places an order for 20 kg. Then an Order is
created in the Placed state, linked to that buyer and listing, and the
listing's remaining quantity becomes 30 kg.

AC-02: Order exceeding remaining quantity is rejected (validation path)
Given an Active listing with 10 kg of tomatoes remaining. When a verified
buyer attempts to order 15 kg. Then the system rejects the order, no Order
record is created, the listing's remaining quantity stays at 10 kg, and the
response states the maximum available quantity (10 kg).

AC-03: Order against a Sold Out or Expired listing is rejected (rule path)
Given a listing whose remaining quantity is 0 (Sold Out) or whose
availability window has passed (Expired). When a verified buyer attempts to
place an order against it. Then the system rejects the order with a message
stating the listing is no longer available, and no reservation is made.

AC-04: Concurrent orders on the last remaining stock resolve without oversell
(failure path)
Given an Active listing with exactly 5 kg remaining. When two verified buyers
submit orders for 5 kg each at effectively the same time. Then exactly one
order is accepted (Placed, listing remaining quantity becomes 0, listing
transitions to Sold Out) and the other is rejected per AC-02, with no state
in which both orders are Placed at once.

AC-05: Duplicate submission on retry does not double-reserve stock (failure
path)
Given a buyer's order request was submitted but the confirmation response was
lost due to a dropped connection. When the buyer's client automatically
retries the identical request carrying the same idempotency token. Then the
system does not create a second Order or a second reservation, and returns
the original order's state to the buyer.
