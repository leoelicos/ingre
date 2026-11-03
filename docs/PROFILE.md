# Customer profile (#224)

The profile is built from the ingredients the user actually selects, buys and keeps, grouped by **class** (`client/src/utils/profile/classes.ts`): broad groups (vegetables, fruit, proteins, dairy, carbs, flavour, treats) and finer classes inside them (root vegetable, beef, cheese, ...). Every catalogue ingredient has a class (a test fails when one is added without it); anything else, such as a free-text extra, is `other` and ignored.

## Where it comes from
| Behaviour | Signal weight |
| --- | --- |
| Picked a recipe (its ingredients) | 1 |
| Added an ingredient by hand (Extra) | 2 |
| Crossed a chip off ("bought") | 1 |
| Hearted a recipe ("kept") | 2 |

Weights become class shares that add up to 1. A class's affinity is its share plus half its group's share, so someone who picks carrots leans to vegetables in general.

## Precedence (never reorder these)
1. **Hard locks** (allergens from the FSANZ list, or a family such as "gluten"; diets: pescatarian, vegetarian, vegan) always win. A locked recipe is not browsed, not found by search and not suggested, whatever the user likes.
2. **Explicit settings** (`likes`, `dislikes`) override observed behaviour. A dislike beats a like of the same class.
3. **Observed behaviour** ranks everything else. With no history the order is A to Z.

## Where it is used
- Explore browse order (blank search) and the recipe results (locks).
- Any later suggestion ranking or RAG retrieval (#204, #225) should call `rankByTaste` / `unlockedRecipes` rather than reinvent them.

## Notes
- The list is read once per page load, so ticking a row never reshuffles the rows under the finger; it counts from the next load. Hearts count as they arrive.
- Explicit settings are kept in `localStorage` (`ingre.profile.settings`). There is no settings screen yet: it belongs to the Profile tab (#227).
