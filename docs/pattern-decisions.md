# Lab 09 — Pattern and technique decisions
**Team 10 · Tsa Temo Thuo · 9 October 2026**  
**Status:** Revised against the supplied Lab 7 and Lab 8 evidence; pending team approval.

**Baseline:** Accepted `decisions/ADR-001-architecture.md`: one modular monolith, one relational store, one `placeOrder` ACID transaction. Lab 8 `docs/api-contracts/core-operation.md` fixes `POST /orders` and stable error meanings. The Lab 8 logical model stores `Order.idempotencyToken` as **globally UNIQUE** (there is no separate idempotency-claims table), and its successful replay returns the **original 201 body**.

| ID | Exact problem / trace | Chosen pattern or technique | Participants | Benefits | Trade-off and alternative |
|---|---|---|---|---|---|
| P-01 | SQL coupling inside `placeOrder` (UC-01, FR-05, QS-09) | Repository ports / dependency inversion | `PlaceOrderService`, `OrderRepository`, `ListingRepository`, `OrderStatusEventRepository`, SQL adapters | Stable domain-facing contract, test doubles, isolated SQL | Interface overhead; alternative is controller/service SQL with tighter coupling |
| P-02 | Last-stock race and partial commits (FR-06, AC-04, QS-01/09) | Transaction-scoped unit of work and row-level locking/guarded reservation | `UnitOfWork`, `ListingRepository`, `OrderRepository`, `OrderStatusEventRepository` | Reserve, create order and initial event commit or roll back together | Lock contention; in-memory mutex rejected because it cannot ensure DB consistency across processes |
| P-03 | Lost response followed by an identical retry (AC-05, QS-03) | Durable idempotency using existing `Order.idempotencyToken UNIQUE` and `findByIdempotencyToken()` | `PlaceOrderService`, `OrderRepository`, SQL unique constraint | Returns previously committed Order without a second reservation | Concurrent duplicate inserts require uniqueness-conflict recovery; client must reuse same key |

## UC-01 sequence and contract preservation
1. Validate request shape (`listingId`, positive finite `quantity`) and authenticate the session at the HTTP boundary; `buyerId` is derived from the session, never request JSON. Follow Lab 8 validation/result semantics; unauthorized requests must not return another buyer's order.
2. Inside one transaction, call `findByIdempotencyToken()`; if an eligible existing order is found, return the **same original 201 response data**, without another reservation or changing `reservedAt`.
3. For a new key, authorize a verified Buyer, verify an Active Listing, and atomically reserve quantity if still available. Use `QUANTITY_EXCEEDS_AVAILABLE` with `maxAvailable` for insufficient stock, including concurrent loss of stock.
4. Persist `Order` with the supplied token and initial `OrderStatusEvent` within the **same** DB transaction (ADR-001). `Order.state` begins `Placed`.
5. On concurrent uniqueness collision for that token, roll back the losing attempt and retrieve the winner's committed order when visible; do not create another order. The preexisting Lab 8 contract does not define behavior for key reuse with a changed payload: document it as an **open decision**, not a new accepted error code.
6. Run SMS Gateway and OpenRouteService stub adapters **outside** the commit path. Their failure must not roll back the order (ADR-001).

**Data names:** `Listing.totalQuantity`, `reservedQuantity`, `confirmedQuantity`; `availableQuantity` is derived. `Order.idempotencyToken` and `OrderStatusEvent.toState` follow Lab 8. Distinguish `Listing.state` (Active/SoldOut/Expired) from `Order.state` (Placed/Confirmed/Assigned/InTransit/Delivered/Declined/Cancelled/ReservationExpired).

**Evidence / limitations:** This is a design-level solution; no concurrency, crash/restart, or database verification has yet been run. Approval requires peer critique, a recorded revision and commit in `lab-09`.
