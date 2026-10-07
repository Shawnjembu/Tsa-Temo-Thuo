# ADR-001: Modular monolith on a single relational store for the Phase 2 vertical slice

**Team 10 · Tsa Temo Thuo · CSI473 Lab 7 · 25 September 2026**

**Status:** Accepted  
**Traces to:** QS-01, QS-03, QS-09; FR-05/06/07/12; Phase 1 report §8 (ADR-01 to ADR-04, which this record sits above — those ADRs govern the reservation and integration mechanisms within the architectural structure selected here).

## Context

The Phase 2 vertical slice must place an order against a listing with zero oversell under concurrent requests (QS-01), survive a dropped-connection retry without creating a duplicate reservation or duplicate order (QS-03), and preserve complete order history across a crash (QS-09).

The team consists of four students implementing one core workflow rather than operating independently owned production services. The architecture therefore needs to satisfy the required correctness and recoverability properties without introducing infrastructure and operational complexity that is unnecessary for the Phase 2 vertical slice.

## Decision

Build the system as a **modular monolith** consisting of one deployable application and one relational database.

`Listing`, `Order`, `TransportJob`, and `Reporting` are separate application modules with explicit boundaries, but they are not independently deployed services.

`placeOrder` defines the transactional boundary for order placement. Within a single relational database transaction it:

1. validates the request and looks up the idempotency token via `findByIdempotencyToken()`; if a committed Order already carries this token, the transaction ends here and that Order is returned;
2. verifies the listing is still orderable and validates the requested quantity against current remaining stock;
3. performs the atomic stock reservation;
4. creates the `Order`, writing the idempotency token into its `idempotencyToken` column, which carries a database uniqueness constraint so a concurrent duplicate insert fails atomically at the database rather than racing in application code; and
5. creates the initial `OrderStatusEvent`.

All of these changes commit or roll back together.

When the same idempotency token is retried after a dropped connection, step 1 finds the previously committed Order and the application returns that result instead of reserving stock or creating another order.

Notification through the SMS Gateway and routing through OpenRouteService remain behind the stub adapters established by Phase 1 ADR-04. These adapter calls are synchronous at the application level but execute outside the database commit path.

A failure in notification or routing after a successful commit does not roll back the order transaction. Such failures are recorded and handled separately from order-placement correctness.

## Alternatives considered

### Rejected: Order/Stock service decomposed behind an API, with an event bus for downstream concerns

An alternative architecture would extract Order/Stock into an independently deployed service with its own database while moving concerns such as notification and reporting behind an event bus.

This would provide stronger runtime isolation and could allow listing search or downstream consumers to scale independently of order-write throughput in a future production architecture.

It was rejected for Phase 2 because:

- It introduces a message broker, an additional deployable service, an additional data store, network-failure handling, and cross-service tracing that a four-person team cannot justify for one vertical slice.
- The fundamental correctness properties required by QS-01, QS-03, and QS-09 are not eliminated by service decomposition. The Order/Stock service would still require a transactional boundary around the idempotency check, reservation, and order persistence.
- Event-driven reporting introduces eventual consistency, consumer failure, duplicate-event handling, and replay considerations. These are additional failure modes that the current Phase 2 requirements do not require the team to solve.
- The architecture would therefore purchase isolation and independent scalability before either has been demonstrated as necessary.

See `docs/architecture-options.md` for the detailed comparison.

## Consequences

### Positive

- One ACID transaction covers the idempotency check, stock reservation, order creation, and initial status event, providing the most direct implementation path for QS-01, QS-03, and QS-09.
- The database provides a single source of truth for inventory and order history, with no separate idempotency store to keep in sync.
- Core correctness testing requires one process and one database rather than distributed failure simulation.
- Deployment, debugging, tracing, and operational overhead remain appropriate for the team's size and the Phase 2 schedule.
- Internal module boundaries preserve a future extraction path without requiring distributed deployment now.

### Negative

- Listing search, reporting, transport processing, and order placement share the same deployment and database infrastructure.
- Resource exhaustion, a defective deployment, or an expensive database query in one module could therefore affect the availability or performance of another module.
- The modular structure must be enforced through code boundaries and review; a modular monolith can degrade into a tightly coupled monolith if modules directly depend on each other's internal implementation.
- If a module later requires genuinely independent scaling, deployment, or team ownership, extracting it will require additional engineering work. This decision defers that cost rather than eliminating it.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Concurrent order requests create database contention around stock reservation | Medium | High — could prevent QS-01 from meeting its required response or concurrency characteristics | AC-04/QS-01 concurrency testing before Phase 2 sign-off; inspect transaction duration, lock waits, deadlocks, and failed reservations |
| Listing or reporting workloads materially interfere with order-placement transactions | Low–Medium | Medium–High | Query profiling, appropriate indexes, bounded reporting queries, and reconsideration of workload isolation if measured interference occurs |
| Team couples unrelated modules through shared implementation code | Medium | Medium | Enforce the module boundaries defined in §8.2/§10.1 through interfaces, repository ownership and code review |
| Idempotency is implemented only as an application-level check and races under concurrent retries | Low if correctly implemented | High — could violate QS-03 | Database uniqueness constraint on `Order.idempotencyToken`, so two concurrent inserts with the same token cannot both succeed, combined with `findByIdempotencyToken()` returning the existing committed Order on retry |

## Evidence that would trigger reconsideration

This ADR should be reconsidered if evidence shows that the modular monolith is no longer meeting the required quality attributes. Relevant evidence includes:

- AC-04/QS-01 testing showing sustained contention or unacceptable transaction latency caused by unrelated workloads sharing the same relational store, rather than unavoidable contention between requests competing for the same stock.
- Listing-search demand requiring independent scaling beyond the synthetic 500-listing target in QS-02 and materially affecting order-write performance.
- Reporting workloads requiring a separate read model, store, or deployment because analytical queries interfere with transactional workloads.
- A second team requiring independent ownership, release cadence, deployment, or failure isolation for a module such as reporting or notification.
- Operational evidence showing that failures or resource consumption in one module repeatedly compromise unrelated modules despite enforced modular boundaries.
