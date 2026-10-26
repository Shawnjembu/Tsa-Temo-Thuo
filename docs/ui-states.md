# Lab 10 - Alternative-state table (Tsa Temo Thuo)

Design intention only; none of these behaviours is tested until implemented. "Evidence needed" is what the interface must have before it may display that message. `Check this order` depends on an agreed service contract: record the gap if it does not exist yet.

## Buyer: place order (B1)
| Condition | Evidence needed | Message (proposed) | Preserved work | Next action / restriction |
|---|---|---|---|---|
| Normal | Required fields complete | Review screen "Nothing has been sent yet" | All values | Place order / Back to edit |
| Submitting (client) | Attempt started, no result | "Sending your order..." | All values; same request key | No second submit button active; no success claim |
| Validation refused (client or server) | Field identifier returned | "There is 1 error: Enter a quantity in kg" + inline text | Every unaffected value | Focus to summary; link to field |
| Confirmed | Service returns durable reference | "Order placed. Reference TTT-ORD-041" | n/a | View order; persistent on a retrievable page |
| Unconfirmed (lost reply/timeout) | Attempt made, no outcome | "We have not yet confirmed whether your order was placed." | Values + same request key | Check this order (same-request lookup); do not place again |
| Known unsent (offline) | Local request exists and was never transmitted | "Saved on this phone, not yet sent." | Local draft | Send when online / Discard (with consequence explained). Retention/privacy policy: open decision |
| Definite refusal (e.g. listing sold out) | Service returns refusal | "That produce is no longer available. No order was created." | Delivery place, quantity | Choose other listing or quantity |
| Unauthorised | Service refuses actor | "You cannot view this order." (no details) | None | Go to My orders; no Retry |
| Service unavailable | Operation cannot be completed or checked | "We cannot place orders right now." No claim of rollback | Values | Try again later / Check this order |

## Buyer: My orders list
| Condition | Evidence | Message | Next action |
|---|---|---|---|
| Loading | Request in flight | "Loading your orders..." | Keep progress visible; never show "no orders" early |
| Empty | Successful query, 0 results | "You have no orders yet." | Browse produce |
| Unavailable | Query failed/inconclusive | "We could not load your orders." | Try again |
| Stale | Data older than last verified | "Last updated 10:42" | Refresh before state-sensitive action |

## Farmer: respond to order (F1)
| Condition | Evidence | Message | Next action |
|---|---|---|---|
| Normal | Order is Placed, farmer owns listing | Order detail with Accept / Decline | Decide |
| Decline without reason | Server/client validation | "Enter a reason for declining" | Reason field focused; entered text retained |
| Confirmed accept/decline | Service returns new status | "Order accepted" / "Order declined" (actual returned status) | Back to Incoming orders |
| Stale / already changed | Service reports changed status | "This order has changed. Current status: Accepted." | Refresh; action refused |
| Unauthorised | Not the farmer's listing | "You cannot act on this order." | Return to Incoming orders |
| Empty list | Successful query, 0 results | "No incoming orders." | None needed |
| Unavailable / offline | No dependable result | "We could not load orders." | Try again |
