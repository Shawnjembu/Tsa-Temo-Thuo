# Lab 10 - Accessibility checklist (Tsa Temo Thuo)

Selected checks for learning, **not** a WCAG 2.2 conformance claim. Status key: *Designed* = shown in wireframe; *Not tested* = needs implementation evidence. Record browser/device/assistive technology and version when tested.

| Check | WCAG 2.2 | What is designed | Evidence now | Test still needed |
|---|---|---|---|---|
| Meaning without colour | 1.4.1 | Errors use text ("There is 1 error"), an icon and heavy outline; required fields say "(required)" | Designed | Inspect in greyscale on built UI |
| Keyboard operation | 2.1.1 | All controls reachable and operable; order: summary, produce, quantity, delivery, Review | Designed | Tab/Shift+Tab through B1 and F1 in a named browser |
| Focus order | 2.4.3 | Order matches reading order; summary receives focus after failed submit | Designed | Verify actual focus destination |
| Visible focus | 2.4.7 | Heavy outline on focused control | Designed | Verify contrast and visibility on device |
| Errors identified | 3.3.1 | Summary links to the field; message names the field and fix | Designed | Trigger server refusal; check association |
| Persistent labels/instructions | 3.3.2 | Visible labels above inputs; no placeholder-only inputs | Designed | Check after typing |
| Name, role, value | 4.1.2 | Native `label for`, `select`, `input`; `aria-describedby` for error; `aria-invalid` only while invalid | Designed (see snippet) | Inspect exposed name/state with screen reader |
| Status messages | 4.1.3 | Order outcome/stale updates announced without moving focus; failed submit moves focus to summary | Designed | Test announcement in named screen reader |
| Readable responsive layout | (lab brief) | Single column at 320 px; text enlargement to 200%; actions full width | Designed | Test 320 px and 200% text on built UI |

## Reference snippet (illustration only, not a tested form)
```html
<label for="qty">Quantity in kg (required)</label>
<input id="qty" name="qty" inputmode="numeric" required
       aria-invalid="true" aria-describedby="qty-error">
<p id="qty-error">Enter a quantity, for example 20.</p>
```

## Limits
Wireframes can show intent only. Focus behaviour, announcements and responsive reflow have **no executed result** here. Do not record any row as passed until it is tested.
