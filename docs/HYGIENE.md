# Hygiene and food safety (#213)

Relevant food-safety controls appear at every decision point. The owner's decisions on #213 are the source.

## Rule

**Core hygiene is mandatory in every tier.** The notes below cannot be switched off, dismissed, hidden by the guidance dial (#206, even Self-directed), or put behind a feature flag. They are text, so nothing relies on colour.

## Core notes (built)

| Note                                                           | Shown when                                            | Where                                     |
| -------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------- |
| Keep raw meat and eggs apart from cooked and ready-to-eat food | a raw meat, sausage, bacon or egg item is on the list | above Ingredients; in that item's details |
| Wash and dry hands after raw chicken                           | raw chicken is on the list                            | same                                      |
| Chilled food at 5 °C or below, frozen at −18 °C or below       | any item that lives in the fridge                     | same                                      |
| Check the fridge has room                                      | 12 or more chilled items on the list                  | above Ingredients                         |

The logic is `client/src/utils/hygiene/hygiene.ts` (pure, tested); `HygieneNotes` shows it. "Raw" and "poultry" are lists of catalogue ids, and a test checks they cover every raw meat in the catalogue and name only items that exist. Add an id there when a raw item joins the catalogue.

## Decision points still to cover

The app has the list and ingredient details today. When these exist, they take the same notes: the cooking phase (hand-wash before and after raw poultry, timers), the shop-and-store step (put chilled items away first), and a recipe's own method.

## Leader tier extras (not built; tiers are #208)

Separate gloves, separate storage for raw and cooked, labelling, mop-floor and pre-cook hand-wash reminders, multi-timers in the cooking phase, a reflection step, and full HACCP packs. They sit on top of the core notes, never instead of them.

## Checklist for a change

1. Does a new decision point show the notes that apply there?
2. Can any tier, mode or flag hide a core note? (It must not.)
3. Is a new raw item in the raw (and poultry) list?
