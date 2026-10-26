# Lab 10 - User profile and tasks (Tsa Temo Thuo)

**Traceability:** replace the `REQ-?` placeholders with your team's requirement/use-case IDs before committing.
**Own-project rule:** this is the team's farm-produce ordering and delivery platform, not the University Service Hub.
**Status labels:** *Assumption* = needs confirming with team/stakeholders. *Design intention* = not yet implemented or tested.

## 1. Primary user profile (Buyer)
A buyer (household, shop or institutional kitchen in Gaborone) ordering fresh produce from a smallholder horticulture farmer, usually on a phone, with a connection that may drop. *(Assumption)*

| Circumstance (assumption) | Design consequence |
|---|---|
| Uses a small phone screen, often outdoors or on the move | Single-column layout, large tap targets, labels above inputs |
| Connection can be intermittent | Honest pending/unconfirmed messages; keep typed values; never show "failed" after an ambiguous send |
| Knows what produce and quantity they want, not how the platform routes it | Plain labels ("Quantity in kg"), review step showing exactly what the farmer will receive |
| May navigate by keyboard or assistive technology *(not inferred from age/programme)* | Persistent labels, visible focus, error summary with link to field |

## 2. Secondary user profile (Farmer)
A smallholder farmer who receives orders for their own listings and decides to accept or decline. May check orders between farm work on a phone. *(Assumption)* Needs a short list, clear status, and only the actions they are permitted to take.

## 3. Task scenarios and success criteria

### Task B1 - Buyer places an order (REQ-?)
**Scenario:** "Using the synthetic details provided, order 20 kg of tomatoes from listing #12 for delivery to Gaborone, Block 8. Check what will be shared before sending. Afterwards, find your order reference and say whether the farmer has accepted it."

**Starts:** buyer decides to order. **Ends:** buyer can retrieve a confirmed order reference and state its status.

**Success criteria**
1. Correct produce, quantity and delivery place are on the order.
2. Buyer views the review screen before sending and can return to edit without losing values.
3. Buyer obtains a service-confirmed reference (not a decorative tick).
4. Buyer correctly states "Placed" means the farmer was notified, not that it was accepted or delivered.
5. After a lost reply, buyer does not create a second order (checks the original instead).

### Task F1 - Farmer responds to an incoming order (REQ-?)
**Scenario:** "Open the new order for your tomatoes listing and either accept it or decline it with a reason."

**Success criteria**
1. Farmer sees only orders for their own listings.
2. Farmer completes accept or decline in two screens (list > detail > decide).
3. After deciding, the screen shows the status actually returned by the service.
4. If the order changed meanwhile (stale), the farmer sees the current status and the action is refused, not silently applied.

## 4. Assumed business states (confirm against your contract)
Placed > Accepted / Declined > Out for delivery > Delivered. Navigation arrows in `models/navigation.svg` are routes, not these transitions. Do not add buttons for transitions the team has not agreed.

## 5. Design rationale (marking criterion)
| Choice | Realistic alternative | Consequence accepted |
|---|---|---|
| Separate Review step before Place order | Single-page form with inline summary | One extra step (4 vs 3) in exchange for fewer wrong-item/quantity orders |
| Error summary + inline field error, values retained | Inline error only | Extra element on small screens; clearer recovery by keyboard |
| Farmer view is a separate permission context | One shared dashboard | Two entry points to maintain; clearer authority boundaries |
