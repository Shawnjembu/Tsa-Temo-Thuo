# Quality-to-architecture traceability — Tsa Temo Thuo

Team 10 · CSI473 Lab 7 · 25 September 2026

| QS | Design obligation | Architecture element that satisfies it (Alternative A, ADR-001) | Verification evidence |
|---|---|---|---|
| QS-01 | Atomic reservation; zero oversell | Persistence layer (single ACID transaction) + Listing module `reserveStock()` | AC-04, T-AC04 |
| QS-03 | Idempotent retry; no duplicate reservation | Order module `findByIdempotencyToken()` executed inside the same transaction as the reservation | AC-05, T-AC05 |
| QS-09 | Order history survives a crash | Persistence layer commits Order + OrderStatusEvent in the same transaction | T-QS09 |
| QS-05 | Owner-only confirm/decline | Application/order-use-case service checks the owning farmer before calling `confirm()`/`decline()` | T-QS05 |
| QS-06/QS-07/QS-10 | Correct release/transfer of reserved stock; no double deduction | Listing module `restoreStock()` and Order module `confirm()`/`decline()`/`cancel()`/`expireReservation()`, all inside the same transactional boundary | T-QS06/07 |
| QS-02, QS-04 | Search latency; five-screen buyer flow | Buyer-facing UI + Listing module read path — satisfied identically by both alternatives in `docs/architecture-options.md`; not architecture-discriminating | QS-02, QS-04 |

This table extends, rather than replaces, the Phase 1 model-to-requirement-to-test mapping
(Phase 1 report §14.1): it adds the architecture element each quality scenario is now traced to,
following the component/module view in `models/component-architecture.svg` and the decision in
`decisions/ADR-001-architecture.md`.
