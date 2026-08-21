# Business Rules and Invariants — Tsa Temo Thuo

**Team 10 — Tsa Temo Thuo** · CSI473 Lab 4 · 21 August 2026
**Traces to:** `docs/requirements.md`, `docs/use-cases/UC-01-place-order.md`,
`docs/acceptance-criteria.md`, `docs/quality-scenarios.md`, `models/domain-model.mmd`

Each rule states an invariant or constraint the domain model must enforce, names
the responsible class(es), and points to the requirement and verification that
depend on it.

---

**BR-01 — Stock reservation is atomic and never oversells.**
For any `Listing`, the sum of the `quantity` of all its `Order`s in the
`Placed` or `Confirmed` state must never exceed the listing's
`originalQuantity`. `Listing.reserve(qty)` is the single operation permitted to
decrement `remainingQuantity`, and it must succeed or fail as one indivisible
step — never a read followed by a separate write.
*Responsible class:* `Listing`. *Traces to:* FR-06, UC-01 step 4, AC-04, QS-01.

**BR-02 — Order quantity is bounded by the listing's remaining quantity at
the moment of placement.**
An `Order` may only be created with `0 < quantity <= Listing.remainingQuantity`
evaluated at the same instant as the reservation (BR-01), not against a
value read earlier in the request.
*Responsible class:* `Listing`, `Order`. *Traces to:* FR-05, FR-07, UC-01 step 3, AC-01, AC-02.

**BR-03 — A rejected order placement leaves the listing's stock unchanged.**
If an order is rejected under BR-02 (quantity too high) or BR-04 (listing not
Active), no `Listing.remainingQuantity` change and no `Order` record occur —
rejection is a no-op on domain state, not a compensating action.
*Responsible class:* `Listing`. *Traces to:* FR-07, UC-01 extensions 3a/3b, AC-02, AC-03.

**BR-04 — Only an Active listing accepts new orders.**
`Order` creation against a `Listing` whose `state` is `SoldOut` or `Expired`
must be rejected. `Listing.state` becomes `SoldOut` automatically when
`remainingQuantity` reaches zero, and `Expired` automatically once the current
date passes `availabilityEnd`.
*Responsible class:* `Listing`. *Traces to:* FR-09, UC-01 extension 3b, AC-03.

**BR-05 — Declining a Placed order releases its reservation.**
When a `Farmer` declines an `Order` (or a Confirmed reservation is not
finalised within policy), `Listing.release(qty)` restores `quantity` to
`remainingQuantity`, and a `SoldOut` listing reverts to `Active` if
`remainingQuantity` becomes greater than zero.
*Responsible class:* `Listing`, `Order`. *Traces to:* FR-08, proposal §6 step 5.

**BR-06 — Only the owning farmer may confirm or decline an order.**
An attempt to change an `Order`'s state via the Confirm/Decline action is
permitted only when the acting `Farmer` is the owner of the `Listing` the
order was placed against; every other actor's attempt is rejected and the
order's state is unchanged.
*Responsible class:* `Order`, `Listing`, `Farmer`. *Traces to:* FR-08, QS-05.

**BR-07 — A retried submission with the same idempotency token never
double-reserves stock.**
If an `Order` submission carrying a given `idempotencyToken` has already been
accepted, a later submission carrying the same token must return the existing
`Order`'s state and must not create a second `Order` or invoke
`Listing.reserve` a second time.
*Responsible class:* `Order`. *Traces to:* FR-06, UC-01 extension 4b, AC-05, QS-03.

**BR-08 — Only a Verified account may list or order.**
A `Farmer` may create a `Listing`, and a `Buyer` may place an `Order`, only
while their `User.verificationStatus` is `Verified`; an unverified account is
blocked from both actions regardless of any other condition being met.
*Responsible class:* `User`, `Registration`. *Traces to:* FR-01, FR-02, UC-01 precondition 1.

**BR-09 — Only the assigned transporter may advance a transport job's
delivery status.**
`TransportJob.state` may be advanced through `Accepted → In Transit →
Delivered` only by the `Transporter` currently associated with that job;
an update attempted by any other transporter or actor is rejected.
*Responsible class:* `TransportJob`, `Transporter`. *Traces to:* FR-11.

**BR-10 — Every order state change is recorded, never overwritten.**
Each transition of `Order.state` appends a new `OrderStatusEvent` rather than
mutating or deleting a prior one, so an order's full history is always
reconstructable after a crash or restart.
*Responsible class:* `Order`, `OrderStatusEvent`. *Traces to:* FR-12, FR-13, QS-06.
