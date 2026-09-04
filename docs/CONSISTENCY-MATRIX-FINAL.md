# Consistency Matrix — UC-01 Place Order

**Project**: Tsa Temo Thuo - A Farm Produce Ordering and Delivery Coordination System
**Module**: CSI473 — Software Design
**Date**: 4 September 2026
**Core Use Case**: UC-01 — Place Order

---

## Purpose

This matrix links use-case steps, sequence messages, responsible domain elements, relevant states, requirements and business rules to ensure all Lab 5 behavioral models describe the same system.

---

## Consistency Matrix

| UC-01 step / alternative | Sequence message or activity | Responsible element | Relevant state | Requirement | Business rule / verification |
|--------------------------|------------------------------|---------------------|----------------|-------------|----------------------------|
| Precondition 1 | Buyer must be Verified | User / Registration | Verified | FR-01, FR-02 | BR-08 |
| Step 1 | Search/select Active Listing | Listing | Active | FR-04, FR-09 | BR-04 |
| Step 2 | placeOrder(listingId, quantity, token) | Buyer / System | — | FR-05 | AC-01 |
| Retry 4b | findByIdempotencyToken(token) | Order | Existing state returned | FR-06 | BR-07, AC-05, QS-03 |
| Step 3 | verifyOrderable() | Listing | Active / Sold Out / Expired | FR-07, FR-09 | BR-04, AC-03 |
| Step 3 | Validate quantity | Listing | Active | FR-05, FR-07 | BR-02, AC-02 |
| Step 4 | reserve(quantity) | Listing | Active | FR-06 | BR-01, AC-04, QS-01 |
| Extension 4a | Reservation loses concurrency race | Listing | Active/ Sold Out | FR-06, FR-07 | BR-01, BR-03, AC-04 |
| Step 4 | Create Order | Order | Placed | FR-05, FR-06 | AC-01 |
| Step 5 | Record timestamp and links | Order | Placed | FR-12 | BR-10 |
| Step 5 | Append status event | OrderStatusEvent | Placed event | FR-12 | BR-10, QS-06 |
| Step 4/FR-09 | remaining quantity reaches zero | Listing | Active → Sold Out | FR-09 | BR-04, AC-04 |
| Step 6 | Send Farmer notification | SMS Gateway / System | Order remains Placed | supporting UC behaviour | Stubbed external dependency |
| Step 7 | Return confirmation | System / Buyer | Placed | FR-05 | AC-01 |
| Extension 3a | Reject excess quantity | Listing / System | No Order created | FR-07 | BR-03, AC-02 |
| Extension 3b | Reject unavailable Listing | Listing / System | No Order created | FR-07, FR-09 | BR-03, BR-04, AC-03 |
| Later workflow | Farmer confirms | Order / Farmer | Placed → Confirmed | FR-08 | BR-06 |
| Later workflow | Farmer declines | Order / Listing | Placed → Declined | FR-08 | BR-05, BR-06 |
| Transport | Transporter accepts job | TransportJob / Order | Confirmed → Assigned | FR-10 | transport test |
| Delivery | Start delivery | TransportJob / Order | Assigned → In Transit | FR-11 | BR-09 |
| Delivery | Mark delivered | TransportJob / Order | In Transit → Delivered | FR-11 | BR-09 |
| Status viewing | Retrieve current state/history | Order / OrderStatusEvent | Any persisted Order state | FR-12 | BR-10, QS-06 |

---

## Analysis Notes

### 1. Atomic Reservation Pattern
The `Listing.reserve(quantity)` operation performs validation and stock modification in one atomic step to prevent concurrent overselling. This design decision ensures:
- Only one buyer can successfully reserve limited stock when concurrent requests occur
- The system maintains the invariant that sum of order quantities never exceeds listing quantity
- Supports FR-06 (atomic reservation), BR-01 (stock protection), and AC-04 (concurrency test)

### 2. Order Creation Timing
An Order record is created **only after** successful stock reservation. Failed validation or reservation does not create an Order:
- Extensions 3a/3b show "No Order created" for validation failures
- This aligns with BR-03 which states no Order record is created when placement fails
- Prevents ambiguous reporting where failed attempts appear as Orders

### 3. Idempotency Protection
The system checks idempotency tokens before processing to handle duplicate submissions:
- Common in areas with poor connectivity where users retry after timeout
- Returns existing Order state instead of creating duplicate
- Supports BR-07, AC-05, and QS-03

### 4. State Consistency
All three behavioral models (sequence, state-machine, activity) agree on key transitions:
- Stock reservation precedes Order creation
- Order enters `Placed` state only after successful atomic reservation
- Failed placement terminates without creating Order record

### 5. Traceability
Each matrix row links:
- **Use case step** → **Interaction message** → **Responsible domain object** → **State** → **Requirement** → **Verification**

This ensures complete traceability from problem statement through design to testing.

---

## Cross-Diagram Consistency Verification

### Sequence Diagram
Shows `Listing.reserve(quantity)` occurring **before** `Order.create()` in the message flow.

### State-Machine Diagram
Initial transition to `Placed` state includes guard condition: `[listing Active && quantity available]`

### Activity Diagram
"Atomically reserve requested quantity" decision node occurs **before** "Create Order in Placed state" action node.

**Conclusion**: All three diagrams consistently model that successful stock reservation is the authoritative event allowing Order creation.

---

## Requirements Coverage Summary

| Requirement | Use Case Step | Model Element | Verification |
|-------------|---------------|---------------|--------------|
| FR-05 | Steps 2, 7 | placeOrder(), confirmation | AC-01 |
| FR-06 | Step 4 | reserve(quantity) | BR-01, AC-04, QS-01 |
| FR-07 | Step 3 | verifyOrderable(), validate | BR-02, BR-03, AC-02, AC-03 |
| FR-08 | Later workflow | confirmOrder(), declineOrder() | BR-05, BR-06 |
| FR-09 | Step 4/FR-09 | markSoldOut() | BR-04, AC-04 |
| FR-10 | Transport | Transporter accepts job | transport test |
| FR-11 | Delivery | Start/mark delivery | BR-09 |
| FR-12 | Status viewing | OrderStatusEvent | BR-10, QS-06 |

---

## Identified Inconsistencies and Resolutions

### Issue 1: Rejected Order State
**Found**: Glossary included `Rejected` as Order lifecycle state
**Conflict**: UC-01, BR-03, AC-02, AC-03 state no Order created on validation failure
**Resolution**: Removed `Rejected` from persistent Order states; treat as interaction outcome only

### Issue 2: Team Metadata
**Found**: Documents show both Team 4 and Team 10
**Impact**: Submission evidence may appear to belong to different teams
**Required**: Standardize team number before Phase 1 submission

### Issue 3: Cancellation Behavior
**Found**: Proposal mentions cancellation but no formal requirement exists
**Impact**: Cannot model behavior without requirement baseline
**Resolution**: Defer to Phase 2 or add formal requirement first

---

## Terminology Consistency Check

All models use consistent terminology from the project glossary:

| Term | Used Consistently |
|------|-------------------|
| Placed, Confirmed, Assigned, InTransit, Delivered | ✓ |
| Active, Sold Out, Expired | ✓ |
| remainingQuantity | ✓ |
| Listing, Order, OrderStatusEvent | ✓ |
| reserve(), verifyOrderable() | ✓ |

---

**Review status**: Internal consistency check complete
**Next step**: External peer review during lab session
