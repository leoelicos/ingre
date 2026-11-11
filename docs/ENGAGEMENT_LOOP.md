# Engagement loop (#215)

The funnel the app is built around, so a change can be checked against it. The owner's description on #215 is the source.

```
scroll -> tap an ingredient -> read a suggestion -> act -> loop (suggestions update)
```

1. **Scroll.** Explore's browse list is the front door: ingredients and recipes, with nothing to set up first.
2. **Tap an ingredient.** Picking one starts the loop. Each ingredient has the same journey (shop section, what goes with it, what uses it, suggested recipes; #205).
3. **Read a suggestion.** A short, relevant list: what it is, what is missing, what it costs (#204).
4. **Act.** Add it to the list, customise it, or move on to the next suggestion. Acting is part of the loop, not the end of it.
5. **Loop.** The suggestions update straight away with what was just added, in the same place, so the next tap is already in view.

## Rules

- **Creation is a high-value action inside the loop, not the only exit.** Adding a ticket never navigates away, never opens a blocking dialog, and always leaves the next suggestions on screen.
- **No dead ends.** Every state offers a next tap: an empty search still shows browse, a finished suggestion still shows the next.
- **Every act updates the suggestions.** Picking, adding, removing and customising all feed the same ranking, so what is shown reflects what is on the list.
- **Short before long.** A suggestion shows one line of what is missing and one price. Detail is one tap deeper.
- **Quiet acknowledgement.** An action is confirmed in place (a status line), never with a modal or a toast that has to be dismissed.
- **Guidance changes how much the loop does for you, not whether it exists** (the dial, #206).

## Status in the code

| Step                                         | Where                     | Status                    |
| -------------------------------------------- | ------------------------- | ------------------------- |
| Scroll, tap                                  | Explore results and chips | on main                   |
| Suggestion with missing and cost             | PR #243 (#204)            | open                      |
| Ingredient journey                           | PR #244 (#205)            | open                      |
| Dial changes how proactive it is             | PR #246 (#206)            | open                      |
| Add keeps the next suggestions in view       | PR #243                   | open                      |
| `/demo` shows the whole loop with no backend | PR #242 (#216)            | open                      |
| Swipe a suggestion to act                    | not built                 | open question below       |
| Measuring time in the loop                   | analytics events (#222)   | with the analytics worker |

## Open question

"Swipe/read suggestion" and "act (add/customise/swipe)" mention swiping. A swipe gesture is not specified (direction, what each direction does, keyboard and screen-reader equivalent). Until it is, every action is a button, which is the accessible equivalent a swipe would need anyway.

## Checklist for a change

1. Does acting leave the person where they were, with updated suggestions in view?
2. Is there always a next tap?
3. Is the acknowledgement in place and quiet?
4. Is there a button for anything a gesture does?
