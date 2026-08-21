# CRC Cards - Tsa Temo Thuo

Team 10, CSI473 Lab 4, 21 August 2026
Each responsibility is assigned to the class that holds the information
needed to perform it, per the Lab 4 minimum standard.

## Listing

Responsibilities
- Track availableQuantity and remainingQuantity, and enforce that
  remainingQuantity never goes negative (BR-01).
- Hold and transition its own state (Active, Sold Out, Expired) as stock is
  reserved, restored, or the availability window passes (BR-05).
- Validate that a requested order quantity does not exceed
  remainingQuantity before a reservation is made.

Collaborators
- Farmer (owner; created the listing)
- Order (each order reserves against, and may later restore, the
  listing's remaining quantity)

## Order

Responsibilities
- Hold its own lifecycle state (Placed, Confirmed, Assigned, InTransit,
  Delivered, Declined, Cancelled, Expired) and enforce valid transitions.
- Own the reservation: record reservedAt and reservationExpiresAt, and
  trigger stock restoration on decline, cancellation or expiry (BR-02,
  BR-03).
- Record the delivery decision and reason at delivery, without judging
  whether the underlying complaint is valid (BR-06).
- Recognise a duplicate submission via its idempotency token and refuse to
  create a second reservation for the same request (BR-08).

Collaborators
- Listing (reserves against, restores stock to)
- Buyer (placed the order, records the delivery decision)
- Farmer (confirms or declines)
- TransportJob (requested once the order is Confirmed)

## TransportJob

Responsibilities
- Represent a single delivery task tied to exactly one Confirmed order,
  and refuse to exist without one (BR-07).
- Track which transporter accepted the job and its delivery status
  (Requested, Accepted, In Transit, Delivered).

Collaborators
- Order (the job is a composition part of its order; it is created from,
  and lives no longer than, that order)
- Transporter (accepts and updates the job)

## Administrator

Responsibilities
- Review a pending Farmer or Buyer registration and record a verification
  decision (FR-02).
- Generate an order-activity report, aggregating order counts by state
  over a requested date range, from persisted order data (FR-13).

Collaborators
- Farmer, Buyer (verifies)
- OrderActivityReport (generates)

## OrderActivityReport

Responsibilities
- Hold the requested date range and the resulting counts of orders by
  state, computed at generation time.
- Record who generated it and when, for later reference.

Collaborators
- Administrator (requests and receives it)
- Order (the source data it aggregates over)
