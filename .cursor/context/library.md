# Recipe library

Static data, not the network.

| File | Contents |
| --- | --- |
| `client/src/data/recipes.json` | Recipes |
| `client/src/data/ingredients.json` | Catalogue items |
| `client/src/types/library.d.ts` | `LibraryRecipe`, `LibraryIngredient`, sold types |
| `utils/library/parseLibrary.ts` | Parses and checks the JSON |
| `utils/library/recipeLibrary.ts` | `catalogue`, `library`, `toClientRecipe` |
| `utils/library/allergens.ts` | Allergens derived for a recipe |
| `utils/library/catalogueMatch.ts` | Case and plural-insensitive match |
| `utils/library/searchTerms.ts` | Normalised search text |

`toClientRecipe` is what the UI renders. Missing pictures use `/ingre.png`.

`scripts/convert-catalogue.py` regenerates the JSON. Do not hand-edit generated shape without updating the parser and its tests.

Edamam types and `utils/api` were removed.
