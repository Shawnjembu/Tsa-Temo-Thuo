# Lab 09 — Framework and dependency decision
**Team 10 · Status: Pending framework selection**

## Confirmed architecture constraints
Lab 7 ADR-001 selects a **modular monolith with one relational database** (`Listing`, `Order`, `TransportJob`, `Reporting` modules). Lab 8 specifies `POST /orders`, a bearer-authenticated verified Buyer, `Order.idempotencyToken UNIQUE`, an ACID stock-reservation transaction and external SMS/OpenRouteService stubs outside the commit. Its deployment diagram defines logical application and external boundaries but does not establish an exact application framework or runtime implementation in the supplied evidence.

## Conditional framework comparison — not a completed decision
| Candidate | Fit | Risk / burden |
|---|---|---|
| Express + TypeScript and transaction-capable relational driver | Lightweight HTTP mapping and interface-oriented modules | Team must enforce transaction composition, dependency injection and validation conventions |
| NestJS + TypeScript and transaction-capable relational driver | Module/provider organization and dependency injection | Extra framework ceremony; must still explicitly manage a shared DB transaction |
| Django + relational database | ORM migrations and database-transaction tooling | Language change if team has chosen TypeScript; suitability needs team confirmation |

**Provisional preference if the team selects TypeScript:** Express and narrow service/repository ports. **No accepted framework or database product can be inferred from these lab archives alone.** The accepted Lab 9 decision must name the chosen framework and why it beats the specific alternative in Team 10's implementation context.

## Dependency management
- Keep domain-facing interfaces free of HTTP and SQL library imports. SQL adapters implement them; controllers depend on the application service.
- Use one shared DB transaction for stock, order and initial status event; ensure adapters accept the same transaction context.
- Version-control the schema, migration scripts and lockfile; pin the runtime and direct dependencies once chosen.
- Avoid secret keys in repository; check dependency security/licensing and maintainability.
- Require clean build/type checks, API-contract tests, concurrency and crash/retry DB integration tests before claiming implemented correctness.

## Remaining approval inputs
Confirm implementation language, HTTP framework, database engine/isolation, migration tooling, and reviewer/commit reference. Do not silently revise Lab 8 HTTP statuses, error codes, field names, or idempotency semantics.
