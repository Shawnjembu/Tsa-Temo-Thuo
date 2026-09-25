# Architecture options — Tsa Temo Thuo

Team 10 · CSI473 Lab 7 · 25 September 2026
Traces to: QS-01, QS-03, QS-09 (docs/quality-scenarios.md); FR-05/06/07, FR-12 (docs/Requirements.md);
ADR-01–04 (Phase 1 report §8.3, carried forward here as prior decisions, not repeated).

## 1. Selected quality scenarios and derived design obligations

Three scenarios were chosen because they are the ones that actually discriminate between
candidate architectures — QS-02 (search latency) and QS-04 (screen count) are read-path/UI
concerns that both alternatives below satisfy equally, so they are not repeated here.

| QS | Concern | Architectural obligation |
|---|---|---|
| QS-01 | Zero oversell under concurrent orders | The stock reservation write must sit inside a single transactional boundary that the team can reason about end-to-end. Whichever structure is chosen must not let two components independently read-then-write the same listing's stock. |
| QS-03 | Safe retry under dropped rural connectivity | The idempotency-token lookup and the order/reservation write must be atomic with respect to each other. A structure that puts them in different processes needs an explicit distributed lock or shared transaction to keep this guarantee — otherwise a retry can race the original request. |
| QS-09 | Order history survives a crash | The Order and its OrderStatusEvent must commit together, before `placeOrder` reports success. The chosen structure must make that cheap; splitting them across a network call reintroduces the crash window QS-09 exists to close. |

## 2. Alternatives compared

### Alternative A — Modular monolith, single relational store
One deployable application. The buyer-facing API, the Listing module, the Order module, the
TransportJob module and the reporting queries run in the same process and share one relational
database. `placeOrder` performs the idempotency check, the stock reservation and the
Order/OrderStatusEvent insert inside one database transaction. Notification and routing stay
behind the existing stub adapters (Phase 1 ADR-04), called synchronously but non-blocking to the
commit.

### Alternative B — Order/Stock service decomposed behind an API, with an event bus for downstream concerns
The Order/Stock responsibility is pulled into its own service with its own database — a separate
bounded context from listing search, reporting and account management, which stay in a second
service (or the original monolith). The buyer-facing API calls the Order/Stock service
synchronously for `placeOrder`; that service still reserves stock and creates the Order in one
local transaction. Notification, reporting and status-history projections subscribe to an
`OrderPlaced` / `OrderStatusChanged` event on a message broker instead of being called in-line.

### Comparison — same criteria applied to both

| Criterion | A — Modular monolith | B — Decomposed Order/Stock service + event bus |
|---|---|---|
| Meets QS-01 (zero oversell) | Yes — one database, one ACID transaction covers listing and order write together | Yes, but only within the Order/Stock service's own database; that service alone must own every stock write |
| Meets QS-03 (safe retry) | Yes — the idempotency-token lookup and the order write share the same transaction, with a database uniqueness constraint on `Order.idempotencyToken` | Yes, by the same argument, but only inside that one service's boundary |
| Meets QS-09 (recoverability) | Yes — Order and OrderStatusEvent commit together | Yes for the service itself; reporting/notification projections outside it can drift behind the event bus after a crash and need an explicit replay/catch-up path |
| Operational cost for a 4-person team building a Phase 2 vertical slice | Low — one deployable, one database, one test harness | High — a message broker, a second data store, network calls where there used to be function calls, and cross-service tracing to debug a single order |
| Coupling / failure isolation | A defect in reporting code ships in the same deploy as the order path, though it cannot corrupt stock (module boundary + tests still apply) | Genuine process isolation — a notification or reporting outage cannot touch order placement |
| Fit with rural/intermittent-connectivity constraint (assumptions §2.5) | The buyer-facing API is the only network hop that must tolerate drops; everything else is in-process | Adds an internal network hop (API → Order/Stock service) that can itself fail independently of the buyer's own connection |
| Consequence if listing search later needs to scale independently of order-write throughput | Requires splitting the monolith later — an acknowledged future migration cost | Already separated — no later migration needed |

## 3. Decision

Alternative A (modular monolith, single relational store) is selected for the Phase 2 vertical
slice.

### Pros of Alternative A (accepted)
- One ACID transaction covers the idempotency check, stock reservation, order creation and initial
  status event — the most direct way to satisfy QS-01, QS-03 and QS-09 at the same time.
- Single source of truth for inventory and order history; no second data store to keep in sync.
- Core correctness testing needs one process and one database, not a simulated network partition.
- Deployment, debugging and operational cost match a four-person team on a Phase 2 timeline.
- Internal module boundaries (Listing, Order, TransportJob, Reporting) preserve a later extraction
  path without requiring distributed deployment now.

### Cons of Alternative A (accepted)
- Listing search, reporting, transport processing and order placement share one deployment and one
  database; an expensive query or a bad deploy in one module can affect the others' availability or
  performance.
- The module boundaries are a code-review discipline, not a process boundary — a modular monolith
  can quietly become a tightly-coupled one if modules start reaching into each other's internals.
- If a module later needs genuinely independent scaling or its own release cadence (e.g. reporting
  under a different team), extracting it is additional work this decision defers rather than avoids.
- No runtime isolation between modules: a resource spike in one (e.g. an unbounded reporting query)
  is not contained the way it would be behind a separate service boundary.

### Why Alternative B's pros didn't outweigh these
Alternative B's genuine advantages — process isolation and independent scaling of listing search —
are real, but they solve problems this project does not have yet (Section 2 comparison table). They
would be bought at a fixed cost (broker, second data store, cross-service tracing) that a
four-person team cannot justify for one vertical slice, and QS-01/03/09 would still need the same
single transactional boundary, just relocated inside a smaller service.

Full rationale, consequences and reconsideration triggers are recorded in
`decisions/ADR-001-architecture.md`.
