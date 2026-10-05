# Logical data model — Tsa Temo Thuo

Team 10 · CSI473 Lab 8 · 2 October 2026
Traces to: Phase 1 domain model (Fig. 2); FR-01–03/05–09/12; QS-01/06/07/10; ADR-001 (`decisions/ADR-001-architecture.md`)

## Difference from the Phase 1 domain model, explained

The Phase 1 domain model gives `Listing` an `availableQuantity` and a `remainingQuantity` but never
shows `Reserved` or `Confirmed` as attributes, even though the stock invariants
(`Available + Reserved + Confirmed = Total`, `Reserved + Confirmed <= Total`) depend on tracking all
three. This was flagged in the Phase 1 marking feedback ("complete details for ... lifecycle
quantities") and again in the team's own review. This logical model closes that gap: `Listing`
carries `totalQuantity`, `reservedQuantity` and `confirmedQuantity` as stored columns, and
`availableQuantity` becomes a derived value rather than an independently-stored one. Nothing else
in the domain model changes.

## Entities

### Account (abstract — table-per-subtype)
| Column | Type | Key | Constraint |
|---|---|---|---|
| accountId | ID | PK | |
| name | Text | | NOT NULL |
| contactPhone | Text | | NOT NULL |
| district | District | | NOT NULL |
| verificationStatus | Enum(Pending, Verified, Rejected) | | NOT NULL, default Pending |
| verifiedByAdminId | ID | FK → Administrator.adminId | NULLable until verified |

### Farmer (subtype of Account)
| Column | Type | Key | Constraint |
|---|---|---|---|
| accountId | ID | PK, FK → Account.accountId | |

### Buyer (subtype of Account)
| Column | Type | Key | Constraint |
|---|---|---|---|
| accountId | ID | PK, FK → Account.accountId | |
| buyerCategory | Enum(Restaurant, Retailer, StreetTrader) | | NOT NULL |

### Transporter
Modelled as a standalone concept, not an `Account` subtype — this matches the Phase 1 domain model
(Transporter has its own `transporterId` and is not reached by Administrator's `verifies`
association) and FR-01/02, which scope registration/verification to Farmer and Buyer only.

| Column | Type | Key | Constraint |
|---|---|---|---|
| transporterId | ID | PK | |
| name | Text | | NOT NULL |
| contactPhone | Text | | NOT NULL |

### Administrator
| Column | Type | Key | Constraint |
|---|---|---|---|
| adminId | ID | PK | |
| name | Text | | NOT NULL |

### Listing
| Column | Type | Key | Constraint |
|---|---|---|---|
| listingId | ID | PK | |
| farmerId | ID | FK → Farmer.accountId | NOT NULL |
| crop | Text | | NOT NULL |
| grade | Text | | NOT NULL |
| unitPrice | Money | | NOT NULL, > 0 |
| district | District | | NOT NULL |
| totalQuantity | Number | | NOT NULL, > 0. Immutable after creation. |
| reservedQuantity | Number | | NOT NULL, default 0, >= 0 |
| confirmedQuantity | Number | | NOT NULL, default 0, >= 0 |
| availableQuantity | Number (derived) | | `totalQuantity - reservedQuantity - confirmedQuantity`; CHECK >= 0 |
| availabilityWindowStart | Date | | NOT NULL |
| availabilityWindowEnd | Date | | NOT NULL, >= availabilityWindowStart |
| state | Enum(Active, SoldOut, Expired) | | NOT NULL |

**Table-level constraints:**
`CHECK (reservedQuantity + confirmedQuantity <= totalQuantity)`
`CHECK (availableQuantity >= 0)` — enforced by the same check above, since `availableQuantity` is derived.

### Order
| Column | Type | Key | Constraint |
|---|---|---|---|
| orderId | ID | PK | |
| listingId | ID | FK → Listing.listingId | NOT NULL |
| buyerId | ID | FK → Buyer.accountId | NOT NULL |
| quantity | Number | | NOT NULL, > 0 |
| state | Enum(Placed, Confirmed, Assigned, InTransit, Delivered, Declined, Cancelled, ReservationExpired) | | NOT NULL |
| reservedAt | DateTime | | NOT NULL |
| reservationExpiresAt | DateTime | | NOT NULL while state = Placed |
| idempotencyToken | Text | UNIQUE, NOT NULL | One token maps to exactly one Order, for the lifetime of the Order — see `docs/data-integrity.md` |
| deliveryDecision | Enum(Accepted, RejectedWithReason) | | NULLable until farmer decides |
| deliveryDecisionReason | Text | | NULLable |

### OrderStatusEvent
| Column | Type | Key | Constraint |
|---|---|---|---|
| eventId | ID | PK | |
| orderId | ID | FK → Order.orderId | NOT NULL |
| toState | Enum (same domain as Order.state) | | NOT NULL |
| occurredAt | DateTime | | NOT NULL |

Append-only: application code never updates or deletes a row in this table (FR-12, QS-09).

### TransportJob
| Column | Type | Key | Constraint |
|---|---|---|---|
| jobId | ID | PK | |
| orderId | ID | FK → Order.orderId, UNIQUE | NOT NULL — at most one TransportJob per Order |
| transporterId | ID | FK → Transporter.transporterId | NULLable until accepted |
| status | Enum(Requested, Accepted, InTransit, Delivered) | | NOT NULL |
| acceptedAt | DateTime | | NULLable until accepted |

### OrderActivityReport
| Column | Type | Key | Constraint |
|---|---|---|---|
| reportId | ID | PK | |
| generatedByAdminId | ID | FK → Administrator.adminId | NOT NULL |
| periodStart | Date | | NOT NULL |
| periodEnd | Date | | NOT NULL, >= periodStart |
| generatedAt | DateTime | | NOT NULL |

`countsByState` is not stored as a column — it is computed from `Order`/`OrderStatusEvent` at
generation time (FR-13: "computed from live order data"), not persisted as a snapshot.

## Relationship cardinalities

| Relationship | Cardinality |
|---|---|
| Administrator verifies Farmer | 1 : 0..* |
| Administrator verifies Buyer | 1 : 0..* |
| Administrator generates OrderActivityReport | 1 : 0..* |
| Farmer owns Listing | 1 : 0..* |
| Listing receives Order | 1 : 0..* |
| Buyer places Order | 1 : 0..* |
| Order has OrderStatusEvent | 1 : 0..* |
| Order requests TransportJob | 1 : 0..1 |
| Transporter accepts TransportJob | 1 : 0..* |

See `models/logical-data-model.svg` for the equivalent entity-relationship diagram.
