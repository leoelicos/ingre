# Terminology and naming (#214)

How ingredients and kitchen terms are named. The owner's decisions on #214 are the source.

## Rules
1. **English first, for home cooks.** The display name is the one a home cook in Australia would say at the shop: "coriander", "capsicum", "plain flour".
2. **One primary display name per item.** It is the same on the list, in Explore, on chips and in recipes. Never show two names for one thing.
3. **Aliases are for search only.** A search for "cilantro" or "bell pepper" finds coriander or capsicum, but the result is shown under the primary name.
4. **Optional tooltips for regional and specialist names.** A tooltip is a kitchen-term layer in Explore that explains a word ("julienne: cut into thin matchsticks"). It can be switched off, and the page reads fully without it.
5. **Do not settle cut-name debates.** If cooks disagree about what a cut or technique is called, use the plain description ("thin matchsticks") and do not pick a winner.

## Language
- Australian English is the primary language (colour, capsicum, zucchini).
- All strings are in `client/src/i18n/locales/en.json` and read with `useT` or `translate`. Another language is another locale file; aliases and tooltips follow the same route, so they translate too.

## Where it applies
- Ingredient names come from the catalogue (`client/src/data/ingredients.json`). The catalogue has no aliases yet: when the first one is needed, add it as an `aliases` list beside the name in the data, not in components.
- Search (`client/src/utils/explore/exploreSearch.ts`) should match the primary name and the aliases, and always display the primary name.
- The tooltip layer is a feature of Explore (shown from the Guided mode up, #206). Its content is data, not component code.

## Checklist for a change
1. Does each ingredient or term show one name only?
2. Would a home cook with no culinary training understand it?
3. Is a regional or specialist term explained by an optional tooltip, not replaced?
4. Is the new alias searchable, and displayed nowhere?
