# Functional Requirements — Tsa Temo Thuo

**Team 10** · CSI473 Semester 1, 2026/27 · Lab 3, 14 August 2026
**Traces to:** Project Problem Proposal (approved), Team 4, 7 August 2026

Each requirement states what the system must do and is independently verifiable.
Behaviour outside the approved scope (payments, warehousing, AI recommendations,
livestock, financing/extension services) has been deliberately excluded — see
`docs/decisions/D-001-no-payments.md` and the proposal's scope table.

## Actors

| Actor | Type | Goal |
|---|---|---|
| Farmer | Primary (human) | List produce, confirm orders, get it delivered |
| Buyer | Primary (human) | Find and order available local produce reliably |
| Transporter | Primary (human) | Receive and fulfil well-specified delivery jobs |
| Administrator | Primary (human) | Verify accounts, monitor activity, produce reports |
| OpenRouteService | Secondary (external, stubbed) | Supplies route information |
| SMS Gateway | Secondary (external, stubbed) | Delivers status notifications |

## Requirements

| ID | Requirement | Primary actor(s) |
|---|---|---|
| FR-01 | The system shall allow a prospective farmer or buyer to submit a registration request with identifying details and supporting verification information. | Farmer, Buyer |
| FR-02 | The system shall allow an administrator to review a pending registration and record an Approve or Reject decision, including a reason when rejected. | Administrator |
| FR-03 | The system shall allow a verified farmer to create a produce listing specifying crop, grade, unit price, available quantity, district and availability window; the listing state becomes Active on creation. | Farmer |
| FR-04 | The system shall allow a verified buyer to search Active listings filtered by, at minimum, crop type and district. | Buyer |
| FR-05 | The system shall allow a verified buyer to place an order against an Active listing for a quantity not exceeding the listing's remaining available quantity. | Buyer |
| FR-06 | The system shall atomically reserve the ordered quantity against a listing at the moment of order placement, such that the sum of all Placed and Confirmed orders against a listing never exceeds its original available quantity, even under concurrent or duplicate submission. | System (enforced on behalf of Buyer/Farmer) |
| FR-07 | The system shall reject an order placement that exceeds a listing's remaining quantity, or that targets a listing in the Sold Out or Expired state, and shall leave the listing's reserved stock unchanged. | System |
| FR-08 | The system shall allow the farmer who owns a listing to Confirm or Decline a Placed order for that listing; confirming moves the order to Confirmed, and declining releases the reserved quantity back to the listing. | Farmer |
| FR-09 | The system shall automatically transition a listing to Sold Out when its remaining available quantity reaches zero, and to Expired when its availability window has passed, and shall reject new orders against either state. | System |
| FR-10 | The system shall allow the farmer to request transport for a Confirmed order, and shall allow an available transporter to accept the job, transitioning the order to Assigned. | Farmer, Transporter |
| FR-11 | The system shall allow the assigned transporter to update an order's delivery status through In Transit and Delivered, and shall allow the buyer to confirm receipt. | Transporter, Buyer |
| FR-12 | The system shall allow the farmer, the buyer and the administrator to view the current state and full status history of any order they are authorised to access. | Farmer, Buyer, Administrator |
| FR-13 | The system shall allow an administrator to generate a report of order activity (counts by order state) over a specified date range, computed from live order data. | Administrator |

Eight is the brief's minimum; thirteen is what the approved scope actually needs to
cover registration, listing lifecycle, the stock-integrity rule, transport, and
reporting without leaving a stakeholder need untraced.

## Traceability to objectives and stakeholders

| Requirement(s) | Proposal objective | Stakeholder need served |
|---|---|---|
| FR-01, FR-02 | Supports Obj. 1 (end-to-end workflow requires verified actors) | Administrator — verify registrations; Farmer/Buyer — mistrust of unfamiliar platforms |
| FR-03, FR-04, FR-09 | Obj. 3 — buyer locates produce by crop/district | Farmer — visibility of demand; Buyer — transparent view of availability |
| FR-05, FR-06, FR-07 | Obj. 2 — stock integrity under concurrency (zero oversell) | Farmer — fair, non-double-sold stock; Buyer — reliable order fulfilment |
| FR-08 | Obj. 1 — farmer confirms order to complete workflow | Farmer — control over own listing |
| FR-10, FR-11 | Obj. 1 — transporter delivers, end-to-end | Transporter — well-specified jobs; Buyer — delivered produce |
| FR-12 | Obj. 1, Obj. 3 — result retrievable by relevant actor | Farmer, Buyer, Administrator — order visibility |
| FR-13 | Obj. 3 — administrator reporting | Ministry/BHC (indirect) — evidence production reaches market |

## Revision note

FR-06 was tightened during drafting from an earlier, vaguer wording
("the system should prevent overselling") to the current form, which names the
atomicity guarantee explicitly and states the invariant it must hold. The looser
wording could not have been tested; the current wording can — see
`docs/acceptance-criteria.md` AC-03/AC-04 and the concurrent-order failure test
in `docs/quality-scenarios.md` QS-03. This is also recorded in the exit record
(`docs/exit-record.md`).
