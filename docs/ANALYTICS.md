# Analytics events (#222)

Named events for the core loop. **Local logging only** (owner's decision on #222): each event is
appended to a log in the browser's `localStorage` under `ingre.analytics.events`. Nothing is sent
anywhere, no cookies, no identifiers. Vercel Web Analytics (production page views, #177) is separate.

| Event                 | Fires when                                                                                  | Details                                              | Wired                                            |
| --------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| `ingredient_searched` | the Explore text has sat still for 0.8 s (not per keystroke, not blank, not twice in a row) | `query`, `ingredients`, `recipes` (how many matched) | yes                                              |
| `ticket_added`        | a recipe is added to the list (not when it is removed)                                      | `recipeId`                                           | yes                                              |
| `suggestion_shown`    | a suggested recipe is put in front of the user                                              | `recipeId`                                           | helper only: no suggestions on `main` yet (#204) |
| `mode_switched`       | the guidance mode changes                                                                   | `from`, `to`                                         | helper only: no modes on `main` yet (#206)       |
| `war_room_item_added` | an item is captured in the war room                                                         | `item`                                               | helper only: no war room on `main` yet (#207)    |

## Use

```ts
import { track } from "../utils/analytics/events";

track("ticket_added", { recipeId: recipe.id });
```

`track` is typed per event (`EventDetails`), never throws (a full or blocked store is ignored),
never makes a network request, and keeps only the newest 200 events (`MAX_EVENTS`).

Read the log in the browser console: `JSON.parse(localStorage['ingre.analytics.events'])`.

## Adding an event or a remote sink

- New event: add its name to `EVENT_NAMES` and its details to `EventDetails` in
  `client/src/utils/analytics/events.ts`, call `track` where it happens, and add a row above.
- A remote sink belongs inside `track`, behind a consent decision from the owner; callers do not change.
- Details are plain strings, numbers and booleans. Do not log names, emails, free text typed into
  account forms, or anything that identifies a person.
