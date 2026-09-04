# Lab 05 Internal Review and Findings

**Project**: Tsa Temo Thuo - A Farm Produce Ordering and Delivery Coordination System
**Module**: CSI473 — Software Design
**Date**: 4 September 2026

---

## Purpose

This document records the internal review findings for Lab 05 behavioral models before the formal peer review exchange. The review assessed consistency among the sequence diagram, state-machine diagram, activity diagram, and existing project artifacts (requirements, use cases, business rules).

---

## Review Methodology

The review followed these steps:
1. Examined each behavioral model independently for correctness
2. Cross-checked models against each other for consistency
3. Verified alignment with requirements (FR-01 to FR-13)
4. Checked compliance with business rules (BR-01 to BR-10)
5. Validated against use case UC-01 (Place Order)
6. Identified terminology consistency with project glossary

---

## Summary of Findings

| Finding | Severity | Status |
|---------|----------|--------|
| Glossary treats Rejected as Order state vs. UC-01 says no Order created | High | Resolved |
| Cancellation/expiry in proposal but not in formal requirements | High | Deferred |
| Team number inconsistency (Team 4 vs Team 10) | Medium | Requires action |
| Failed attempts and FR-13 reporting | Medium | Requires decision |
| Terminology consistency across diagrams | Medium | Verified |

---

## Detailed Findings

### Finding 1: Rejected Order State Inconsistency ✓ RESOLVED

**Area**: State-machine diagram vs. Use Case specification

**Evidence**:
- Project glossary lists `Rejected` as an Order lifecycle state
- UC-01 extensions 3a and 3b specify that invalid placement creates no Order
- BR-03 states: "No Order record is created when placement fails"
- AC-02 verifies: Excess quantity requests do not create Orders
- AC-03 verifies: Unavailable Listing requests do not create Orders

**Impact**:
- State-machine would show `Rejected` as a persistent state
- Use case specifies no Order record exists for failed validation
- This represents two different systems

**Analysis**:
The contradiction stems from treating validation failure as an Order state rather than as an interaction outcome. If an Order record is not created (per BR-03), it cannot have a state.

**Resolution**:
- Removed `Rejected` from the Order lifecycle state-machine
- State-machine now begins at `Placed` only after successful atomic reservation
- Rejection is modeled as a sequence diagram alternative flow that terminates without Order creation
- Activity diagram shows rejection paths exiting before Order creation step

**Affected Artifacts**:
- State-machine diagram (initial transition guard added)
- Sequence diagram (alternatives show rejection without Order)
- Activity diagram (rejection paths exit early)
- Consistency matrix (Extensions 3a/3b marked "No Order created")

---

### Finding 2: Cancellation and Expiry Behavior

**Area**: Scope definition

**Evidence**:
- Project proposal mentions stock restoration when either party cancels
- Project proposal mentions reservation expiry timeout
- BR-05 references Confirmed reservations not finalized within policy
- FR-01 through FR-13 do not define cancellation use case
- No formal requirement specifies expiry timeout or behavior

**Impact**:
Adding cancellation or timeout states/transitions would model behavior not supported by the current requirement baseline.

**Analysis**:
While the project proposal identified these as potential features, they have not been formalized in the requirements specification. Modeling them in Lab 05 would be premature.

**Recommendation**:
- Do not include cancellation or expiry in Lab 05 models
- If needed for Phase 1, add formal requirements first
- Consider deferring to Phase 2 if not critical for Phase 1

**Status**: Deferred pending team decision

---

### Finding 3: Team Metadata Inconsistency

**Area**: Document metadata

**Evidence**:
- Some documents reference "Team 4"
- Project proposal metadata table shows "Team 10"
- Same project content across all documents

**Impact**:
- Phase 1 submission may appear to belong to different teams
- Confusion during assessment
- Potential issues with grade recording

**Recommendation**:
Standardize on the correct team number across all documents before Phase 1 submission.

**Status**: Requires team action

---

### Finding 4: Failed Placement Attempts and Reporting

**Area**: Requirements interpretation

**Evidence**:
- UC-01 has open issue regarding FR-13 reporting
- Question: Should administrative reports include rejected placement attempts?
- Currently ambiguous whether failed validation should be tracked

**Analysis**:
Two valid interpretations:
1. Report only successful Orders (cleaner domain model)
2. Report all attempts including failures (better analytics)

**Recommendation**:
Team should decide before Phase 1 baseline and document decision.

**Status**: Requires team decision

---

### Finding 5: Terminology Consistency ✓ VERIFIED

**Area**: Cross-artifact consistency

**Review**:
Verified that all behavioral models use consistent terminology from the project glossary:

| Term | Sequence Diagram | State-Machine | Activity Diagram | Consistent? |
|------|------------------|---------------|------------------|-------------|
| Placed, Confirmed, Assigned, InTransit, Delivered | ✓ | ✓ | ✓ | Yes |
| Active, Sold Out, Expired | ✓ | ✓ | ✓ | Yes |
| remainingQuantity | ✓ | ✓ | ✓ | Yes |
| Listing, Order, OrderStatusEvent | ✓ | ✓ | ✓ | Yes |
| reserve(), verifyOrderable() | ✓ | N/A | ✓ | Yes |

**Result**: All terminology consistent with glossary and each other.

---

## Strengths Identified

### 1. Comprehensive Sequence Model
The sequence diagram correctly models:
- Idempotency checking for duplicate submissions
- Listing state validation before reservation
- Atomic stock reservation operation
- Order creation only after successful reservation
- Status event recording for history
- Multiple alternative flows (duplicate, expired, insufficient quantity, concurrency)

### 2. Clear State Transitions
The state-machine diagram:
- Shows complete Order lifecycle from Placed to Delivered
- Includes guard conditions on transitions
- Models alternative path through Declined
- Notes clarify important constraints

### 3. Detailed Activity Workflow
The activity diagram:
- Makes all decision points explicit
- Shows both success and failure paths
- Models concurrent order handling
- Demonstrates idempotency protection

### 4. Strong Cross-Diagram Consistency
All three diagrams agree on:
- Atomic reservation precedes Order creation
- No Order created for validation failures
- Same terminology and state names
- Same sequence of operations

### 5. Requirements Traceability
Each model element traces to:
- Specific functional requirement (FR-##)
- Business rule (BR-##)
- Acceptance criteria (AC-##)
- Quality scenario (QS-##)

---

## Cross-Diagram Consistency Verification

### Event: Successful Order Placement

**Sequence Diagram**:
- Message sequence shows `Listing.reserve(quantity)`
- Followed by `Order.create(buyer, listing, quantity, Placed)`
- Stock reserved BEFORE Order created

**State-Machine Diagram**:
- Initial transition: `[*] --> Placed: placeOrder [listing Active && quantity available]`
- Guard condition enforces preconditions
- Order enters Placed ONLY AFTER successful operation

**Activity Diagram**:
- Decision node: "Reservation succeeded?"
- Success path leads to "Create Order in Placed state"
- Failure path leads to rejection without Order creation

**Conclusion**: All three models consistently show that successful stock reservation is the authoritative event that permits Order creation.

---

## Quality Concerns Addressed

### Data Integrity ✓
- Atomic reservation prevents overselling (FR-06, BR-01)
- State transitions maintain lifecycle invariants
- Concurrent requests handled correctly (AC-04, QS-01)

### Reliability ✓
- Idempotency tokens protect against duplicates (BR-07, AC-05, QS-03)
- Status history survives system failures (FR-12, QS-06)

### Security and Authorization ✓
- Only verified Buyers may order (precondition, BR-08)
- Only owning Farmer may confirm/decline (BR-06)
- Role-based transition enforcement

### Recoverability ✓
- OrderStatusEvent records preserve complete history (FR-12, BR-10)
- No dependency on application logs for domain events

### Usability ✓
- Rejected quantity requests return actual available quantity
- Clear error messages guide corrective action
- Seamless duplicate submission handling

---

## Requirements Coverage

All behavioral models support the following requirements:

| Requirement | Coverage | Verified In |
|-------------|----------|-------------|
| FR-05: Place and manage orders | Full | Sequence, Activity |
| FR-06: Atomic reservation | Full | All three diagrams |
| FR-07: Stock validation | Full | Sequence alternatives |
| FR-08: Farmer confirm/decline | Full | State-machine transitions |
| FR-09: Automatic Sold Out | Full | Sequence opt block |
| FR-10: Transport coordination | Partial | State-machine (Assigned) |
| FR-11: Delivery tracking | Partial | State-machine (InTransit, Delivered) |
| FR-12: Status history | Full | Sequence (OrderStatusEvent) |

---

## Recommendations for Improvement

### Before Phase 1 Submission

1. **Resolve Team Number**: Standardize metadata across all documents

2. **Complete Peer Review**: Exchange reviews with another CSI473 team as required by lab

3. **Decide on Failed Attempts**: Clarify whether FR-13 reports include rejected placements

4. **Glossary Update**: Revise Order state definition to reflect removal of Rejected state

5. **Visual Clarity**: Ensure all diagram exports are readable at standard print sizes

### For Future Phases

1. **Formalize Cancellation**: If needed, add requirement before modeling

2. **Define Expiry Policy**: Specify timeout duration and behavior in requirements

3. **Expand Transport Model**: Add detailed transport workflow diagrams in Phase 2

---

## Design Trap Avoided

**Lab Brief Warning**: "Do not create independent diagrams that are individually attractive but describe different versions of the project."

**How Avoided**:
- All three diagrams model the same atomic reservation design
- Consistent terminology throughout
- Same event sequence in all models
- Cross-diagram verification performed
- Consistency matrix ensures alignment

---

## Peer Review Section

**Status**: Awaiting exchange with another team during lab session

### To Be Completed During Lab
- [ ] Exchange review with assigned peer team
- [ ] Receive feedback on our behavioral models
- [ ] Review peer team's models using Phase 1 rubric
- [ ] Document peer findings below
- [ ] Create action items from peer feedback

### Peer Reviewer Comments
_[To be added after peer review exchange]_

### Peer-Identified Issues
_[To be added after peer review exchange]_

### Action Items from Peer Review
_[To be added after peer review exchange]_

---

## Next Steps

1. Complete formal peer review exchange
2. Address any peer review findings
3. Resolve team metadata consistency
4. Update glossary to reflect state-machine changes
5. Integrate Lab 05 into Phase 1 draft report

---

## Conclusion

The internal review identified one high-severity inconsistency (Rejected state) which has been resolved. All three behavioral models now consistently describe the same Place Order workflow with atomic stock reservation as the central design pattern.

The models demonstrate strong traceability to requirements, business rules, and acceptance criteria. Cross-diagram consistency has been verified. The artifacts are ready for peer review and Phase 1 integration.

---

**Date**: 4 September 2026
**Status**: Internal review complete, awaiting peer review
