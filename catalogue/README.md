# Catalogue

Shared relational source for the recipe library.

- `schema.sql` — SQLite schema
- `recipes.db` — generated build artefact (do not edit by hand)

## Build

```bash
npm run build:catalogue
```

This reads `client/src/data/ingredients.json` and `recipes.json`, produces `catalogue/recipes.db`, and copies it to:

- `client/public/recipes.db` (web)
- `ios/Ingre/Resources/recipes.db`
- `android/app/src/main/assets/recipes.db`

No running database server is required. The JSON files remain the editable source; the `.db` is regenerated on each build.
