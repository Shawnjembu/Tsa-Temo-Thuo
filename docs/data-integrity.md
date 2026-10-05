# Data integrity — Tsa Temo Thuo

Team 10 · CSI473 Lab 8 · 2 October 2026
Traces to: QS-01, QS-03, QS-06/07/09/10; FR-05/06/07/12; AC-02, AC-04, AC-05;
`models/logical-data-model.md`; `docs/api-contracts/core-operation.md`; `decisions/ADR-001-architecture.md`

This document collects the constraints that keep the data correct under concurrency and failure,
and says which quality scenario or acceptance criterion each one exists for. It does not repeat the
full column/constraint listing already in `models/logical-data-model.md`, or the "Difference from
the Phase 1 domain model" note there (the `Reserved`/`Confirmed` quantity gap) — both are referenced,
not restated.

## 1. Stock-quantity invariants

The two invariants the Phase 1 report states for `Listing` stock —
`Available + Reserved + Confirmed = Total` and `Reserved + Confirmed <= Total` — are enforced as
database constraints, not just application logic, so a bug in one code path cannot silently violate
them:

| Constraint | Enforces | Fails safe against |
|---|---|---|
| `CHECK (reservedQuantity + confirmedQuantity <= totalQuantity)` on `Listing` | `Reserved + Confirmed <= Total` | A reservation or confirmation write that would oversell the listing is rejected by the database even if the application-level check in `placeOrder` (step 6 of `docs/api-contracts/core-operation.md`) has a bug or is bypassed |
| `availableQuantity` modelled as **derived**, not stored (`totalQuantity - reservedQuantity - confirmedQuantity`) | `Available + Reserved + Confirmed = Total`, by construction | A code path that updates `reservedQuantity` or `confirmedQuantity` without recomputing a separately-stored `availableQuantity` cannot leave the three figures inconsistent, because there is nothing separate to fall out of sync |
| The reservation write (step 6, `core-operation.md`) runs inside the single ACID transaction described in ADR-001 | QS-01 — zero oversell under concurrent requests | Two concurrent `placeOrder` calls for the same listing's last stock cannot both read the pre-reservation quantity and both succeed; the database's row-level locking inside one transaction serialises them, and the `CHECK` constraint above is the backstop if application logic ever got the arithmetic wrong |

## 2. Idempotency invariant

`UNIQUE` on `Order.idempotencyToken` is the data-layer half of QS-03/AC-05; the other half is the
`findByIdempotencyToken()` lookup-before-write described in ADR-001 and walked through step-by-step
in `models/failure-recovery.svg`.

- **What it prevents:** two orders for the same client-generated token. Without the database-level
  `UNIQUE` constraint, a race between a dropped-connection retry and the original request's commit
  could still let two inserts both pass an application-level "does this token exist?" check before
  either has committed. The constraint makes the second insert fail at the database regardless of
  timing, which is a stronger guarantee than an application-level check alone.
- **What it does not prevent:** a buyer generating a *new* token for what they intend as the same
  order (e.g. resubmitting a form instead of letting the client retry automatically). That is a
  client-correctness concern, not a data-integrity one — `docs/api-contracts/core-operation.md`
  notes that the client, not the server, is responsible for reusing the same `Idempotency-Key` across
  retries of one logical request.

## 3. Append-only history invariant

`OrderStatusEvent` has no `UPDATE`/`DELETE` path in the application (FR-12; QS-09). This is a
process rule rather than a database constraint — there is no technical trigger stopping a write —
which is itself worth recording as a known gap rather than overstating the guarantee: see the exit
record below.

## 4. Referential integrity

Every foreign key in `models/logical-data-model.md` (`Listing.farmerId`, `Order.listingId`,
`Order.buyerId`, `OrderStatusEvent.orderId`, `TransportJob.orderId`/`transporterId`,
`OrderActivityReport.generatedByAdminId`) is `NOT NULL` except where the model explicitly says
otherwise (`Account.verifiedByAdminId`, `TransportJob.transporterId` before acceptance). None of
these are new decisions — they are carried forward from the Phase 1 domain model's associations —
so they are listed here only as the data-integrity view of facts already established, not repeated
in full.

## 5. Traceability — extending Lab 7's quality-to-architecture table

`docs/quality-to-architecture.md` (Lab 7) maps each quality scenario to the architecture element
that satisfies it. This adds the Lab 8 artifacts that make each mapping concrete at the data level:

| QS / AC | Lab 7 architecture element | Lab 8 data-level evidence |
|---|---|---|
| QS-01, AC-04 | Persistence layer, single ACID transaction | `Listing` CHECK constraint (§1 above); `models/logical-data-model.md` |
| QS-03, AC-05 | `findByIdempotencyToken()` inside the reservation transaction | `Order.idempotencyToken UNIQUE` (§2 above); `models/failure-recovery.svg`; `docs/api-contracts/core-operation.md` |
| QS-09 | Order + OrderStatusEvent commit together | `OrderStatusEvent` append-only table (§3 above); `models/logical-data-model.md` |
| QS-06/07/10 | `restoreStock()`/`confirm()`/`decline()` inside the transactional boundary | Same `Listing` CHECK constraint (§1) governs these writes too — they cannot leave `reservedQuantity + confirmedQuantity > totalQuantity` regardless of which module performs the write |
| — | Deployment boundaries (new in Lab 8) | `models/deployment.svg` — shows the database is reachable only from the application server node, which is what makes "every write to `Listing`/`Order` goes through one transactional boundary" an enforceable claim rather than just an intended one |

## Exit record

**Risk:** `OrderStatusEvent` is append-only by convention (application code never issues an
`UPDATE`/`DELETE` against it) but nothing at the database level currently stops a future change, a
migration script, or direct database access from violating that. This matters because QS-09's
"order history survives a crash" guarantee quietly assumes history is never *edited*, not just that
it's written durably.

**Mechanism that addresses it:** none implemented yet at the database level — flagged here rather
than silently assumed, per the brief's own allowance for recording an open risk rather than only
closed ones. The two viable next steps (not yet decided between) are a database-level trigger that
rejects `UPDATE`/`DELETE` on the table, or restricting the application's database role so it holds
only `INSERT`/`SELECT` privileges on `OrderStatusEvent`.

**Test needed to verify the mechanism, once chosen:** attempt an `UPDATE` and a `DELETE` against an
existing `OrderStatusEvent` row using the application's own database credentials and confirm both
are rejected by the database itself, not merely absent from the application's code paths.
