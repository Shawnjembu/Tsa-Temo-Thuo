# API/service contract — placeOrder (UC-01)

Team 10 · CSI473 Lab 8 · 2 October 2026
Traces to: UC-01 Place Order; FR-05/06/07; AC-01–AC-05; QS-01/QS-03; ADR-001; `models/logical-data-model.md`

This is the implementable version of the one-line summary already in the Phase 1 report's service
contracts table (§9.2, `placeOrder`): same operation, same invariants, now with request/response
schemas, validation order and stable error codes.

## Request

```
POST /orders
Authorization: Bearer <buyer session token>
Idempotency-Key: <client-generated idempotency token, UUID>
Content-Type: application/json

{
  "listingId": "string, required",
  "quantity": "number, required, > 0"
}
```

`buyerId` is taken from the authenticated session, not the request body — a buyer cannot place an
order as someone else. `Idempotency-Key` maps directly to `Order.idempotencyToken`
(`models/logical-data-model.md`).

## Validation and rule order

Checked in this order, so failures are reported against the first thing actually wrong rather than
whichever check happens to run first in the implementation:

1. **Request shape** — `listingId` present and well-formed; `quantity` present, numeric, > 0.
   Failing this never touches the database.
2. **Idempotency replay** — `findByIdempotencyToken(Idempotency-Key)`. If a committed `Order`
   already carries this token, skip straight to the success response below with that Order's data.
   This is what makes a dropped-connection retry safe (QS-03, AC-05) — see
   `models/failure-recovery.svg`.
3. **Authorisation** — the authenticated account is a Verified `Buyer`. Unverified or wrong-role
   accounts are rejected before the listing is even read.
4. **Listing orderability** — the listing exists and `state = Active`. Sold Out / Expired listings
   are rejected without touching stock (FR-07, FR-09, AC-03).
5. **Quantity against stock** — `quantity <= Listing.availableQuantity` (the derived value from
   `models/logical-data-model.md`). Over-quantity requests are rejected with the actual maximum
   (AC-02).
6. **Atomic reservation** — performed inside the single database transaction described in
   `decisions/ADR-001-architecture.md`. Under concurrent requests for the last stock, exactly one
   succeeds; the rest are rejected through the same path as step 5 (AC-04, QS-01).

## Success response

```
201 Created
Content-Type: application/json

{
  "orderId": "string",
  "listingId": "string",
  "buyerId": "string",
  "quantity": 20,
  "state": "Placed",
  "reservedAt": "2026-10-02T09:14:00Z",
  "reservationExpiresAt": "2026-10-02T09:44:00Z",
  "idempotencyToken": "string"
}
```

A replayed request (step 2 above) returns the **same** `201` body with the **same** `orderId` and
`reservedAt` — not a new timestamp, not a new Order. The client cannot tell a replay from the
original response by looking at the body; that is the point of AC-05.

## Error responses

All errors share one envelope so a client only has to parse one shape:

```
{
  "error": {
    "code": "string — one of the stable codes below",
    "message": "string — human-readable, safe to display",
    "details": { }
  }
}
```

| HTTP status | Error code | When | `details` |
|---|---|---|---|
| 400 | `INVALID_REQUEST` | Malformed body: missing `listingId`, non-numeric or non-positive `quantity` | field-level messages |
| 401 | `NOT_AUTHENTICATED` | Missing/invalid session token | — |
| 403 | `NOT_VERIFIED_BUYER` | Authenticated account is not a Verified Buyer | — |
| 404 | `LISTING_NOT_FOUND` | `listingId` does not exist | — |
| 409 | `LISTING_NOT_ACTIVE` | Listing is Sold Out or Expired (FR-07, FR-09, AC-03) | `{ "listingState": "SoldOut" \| "Expired" }` |
| 409 | `QUANTITY_EXCEEDS_AVAILABLE` | Requested quantity exceeds current available quantity, including the case where a concurrent request won the last stock first (FR-07, AC-02, AC-04) | `{ "maxAvailable": <number> }` |

`409 QUANTITY_EXCEEDS_AVAILABLE` is deliberately the same code whether the buyer simply asked for
too much or lost a concurrency race for the last units — from the client's point of view both are
"the quantity you asked for is no longer available," and `maxAvailable` tells it what is. This
keeps the error contract stable under concurrency instead of leaking an internal distinction the
buyer can't act on differently.

## What this contract does not cover

`confirmOrder`, `declineOrder` and `generateOrderActivityReport` have their own contracts implied
by the Phase 1 report's §9.2 table; they are not repeated here, since Lab 8 asks for one core
operation in full depth rather than all of them restated at the same level.
