# Retrieval over hand-curated profiles (#225)

Ideas for what to add next to what you have, from a small hand-curated corpus, searched locally. **No paid model or embedding API is called, anywhere**: the corpus is a checked-in JSON file, the ranking is BM25 plus the curated pairings, and the words shown are composed from what retrieval found.

## The corpus: `client/src/data/profiles.json`

One profile per catalogue ingredient (111 today), written by hand:

```json
{
  "id": "carrot",
  "classes": ["root", "vegetable"],
  "style": ["roast", "comfort", "salad"],
  "goesWith": ["celery", "onion", "butter", "..."]
}
```

- `classes` and `style` are plain tags. `goesWith` lists classic partners; list a pairing once and it is known on both ingredients (`utils/rag/corpus.ts` symmetrises it).
- Names and allergens come from the catalogue (`ingredients.json`), never from the profile, so they cannot drift.
- A catalogue ingredient without a profile throws when the corpus loads, and `corpus.test.ts` checks every profile is joined, points at real ingredients, and pairs both ways. Add an ingredient to the catalogue and add its profile in the same change.
- Growth: this is the "smaller derived set" the owner chose in #225, not the ~3000 of the issue. More profiles (and more tags) are added as the catalogue grows.

## Retrieval: `client/src/utils/rag/`

1. `text.ts`: lowercase words with a light plural stem (tomatoes = tomato).
2. `named` (`retrieve.ts`): the ingredients the text names are what you have: every word of a name is in the text ("red lentils"), or, for a word no full name used, ingredients ending in it ("flour" is plain flour). They are left out of the results.
3. **Hard locks first:** a profile carrying an allergen the user avoids is removed before ranking, never after (`retrieve.test.ts`).
4. Rank the rest: BM25 over each profile's text (name x3, classes, style, partners' names) + 2 per partner you have + 0.25 per shared style tag. Ties break by name, so the same text always gives the same list. Only scores above zero are returned.
5. `explain.ts`: one sentence per reason (goes with, shares cooking style with, matches), each built only from the profiles involved.

`/ideas` (`pages/Ideas/IdeasPage.tsx`) is the surface: a search field, an Avoid group (the catalogue's allergens) and a plain list. No chat. The page is not linked from the tab bar yet; where it surfaces (the #204 suggestions, a Profile card) is for the owner.

## Free and paid

The retrieval is free. The #208 tier flag, when it lands, would gate profile-driven re-weighting (#224), not this lookup. Nothing here reads that flag yet.

## If a model is ever added

It would only phrase what retrieval returned (the hits and their reasons as its only context), behind a server resolver with `explain.ts` as the fallback, and only with Alana's sign-off for the cost (AGENTS.md). That is out of scope here and not built.
