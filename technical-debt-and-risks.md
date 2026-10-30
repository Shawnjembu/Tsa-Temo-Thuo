# Lab 11 — Technical debt and residual-risk register

| Priority | Issue / consequence | Evidence | Required next action |
|---|---|---|---|
| Critical | HTTP actor identity is a spoofable header, not actual login/authentication; unauthorized real users could impersonate any demo actor if exposed | `app/server.py` `X-Actor-ID` | Integrate authenticated sessions/JWT, secure role claims and end-to-end authorization tests before network deployment |
| High | Current runtime is Python/SQLite while original `src/contracts.ts` contains TypeScript illustrative interfaces; technology decision and data-access contracts are not aligned | Repository sources | Agree final stack in ADR and migrate/port slice or explicitly adopt reference design |
| High | Reservation release on buyer cancellation or time expiry is not implemented; stranded reservations possible | FR/UC extensions, QS-06 | Add transactional cancel/expire jobs, corresponding events and tests |
| High | No real frontend, registration, farmer listing creation, search, transport or admin reports | FR-01 to FR-13 | Implement omitted project use cases with traceability and tests |
| High | Post-commit notification failures are swallowed; message may never reach farmer | `place_order` notification callback | Transactional outbox and observable retry worker; failure metrics |
| Medium | SQLite serialises writers; multi-server transactions/locks and operating performance not established | 100 classroom concurrency trials only | Evaluate PostgreSQL row locking and load tests with real deployment topology |
| Medium | Listing expiry transition only triggered during order placement | `place_order` | Scheduled expiry worker and search-time expiry filtering |
| Medium | Whole-number-only quantity is an explicit simplifying assumption; some produce units require fractional quantities | `quantity` INTEGER | Agree units/precision and use fixed-point decimal with bounded validation |
| Medium | `Idempotency-Key` uniqueness global; retention/expiry policy undefined | UNIQUE constraint | Define token scope, persistence duration and collision handling |
| Medium | No backup, monitoring, request audit, migrations versioning or robust production error handling | Local demo | Add deployment operations and resilience tests |
| Low | Terminology mismatch `Rejected` versus `Declined` in original UC/contracts | `docs/use cases/UC.md`, `src/contracts.ts` | Resolve model terminology explicitly and update traceable revisions |

**Recommendation:** Suitable as a **local teaching demonstration of UC-01** conditional on using synthetic users and localhost only. **Not approved for public deployment or full-project release.** Conditions for a future release include genuine authentication, full lifecycle, integrated UI and transport, migration discipline, security testing, real notifications and demonstrable acceptance of all required project scenarios.
