# Lab 10 - Three-person task-based usability check

> **Do not fill this with invented results.** The lab requires at least one design change that follows from an *observed* difficulty. Run the check with real teammates during the lab, then complete the shaded fields. Anything invented must be labelled HYPOTHETICAL.

## Set-up (completed)
- **Artefact tested:** `prototype/wireframes.svg` v0.1 (paper/screen prototype; keyboard, network and screen-reader behaviour are **not executed**)
- **Roles (rotate):** Participant, Facilitator (reads scenario, supplies simulated outcome cards), Observer (records actions, hesitation, help)
- **Data:** synthetic only (listing #12, TTT-ORD-041)
- **Rules:** do not name the intended control; record any help as an intervention (task then counts as *assisted*, not independent)

## Tasks and success definition (set before observing)
| Task | Neutral instruction to participant | Success |
|---|---|---|
| B1 | "Order 20 kg of tomatoes for Gaborone, Block 8. Then tell me whether the farmer has accepted it." | Correct values, passes review, finds reference, says Placed is not Accepted |
| B1-recovery | Facilitator shows the Unconfirmed card: "You did not see a result. Find out whether your order exists." | Uses the check route; does not start a second order |
| F1 | "Open the new order and respond to it." | Accepts/declines in list > detail > decide |

## Observation record (complete during the lab)
| # | Participant (initials) | Task | Observation (what they did/said, with hesitation and help) | Independent / assisted | Outcome |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

## Finding (complete after observing)
- **Observation:** *(what actually happened)*
- **Interpretation:** *(why it matters, linked to a task consequence)*
- **Design change made:** *(wireframe/label/route changed, with version e.g. v0.2)*
- **Retest plan (not yet performed):** *(repeat neutral task with revised screens; later test in implementation)*
- **Commit:** *(hash/message of the revision commit)*

## Exit record (required by the brief)
- **Most important usability problem observed:**
- **Interface change made:**
- **How it will be verified after implementation:** *(e.g. controlled lost-reply scenario confirms the check route recovers the original reference without a second order; keyboard/focus tested in a named browser and assistive technology)*

## Risks worth watching (hypotheses, NOT observations)
- Buyer reads "Order placed" as "farmer accepted".
- Buyer reads the Unconfirmed card as "failed" and re-orders.
- Buyer loses typed values after a quantity error.
- Farmer cannot tell Accept from Decline without reading carefully.
