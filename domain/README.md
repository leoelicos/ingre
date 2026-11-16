# domain/

Domain service for the **ingre** catalogue.

## What this does

This service owns the catalogue domain: ingredients, recipes, and the rules that turn a list of ingredients into suggestions. It is the long-term home for the data that today lives as static JSON in the client (`client/src/data/recipes.json`, `ingredients.json`).

It does **not** serve the web or mobile apps directly. The existing Express + Apollo service (`server/`, `ingre-backend` on Render) stays the **BFF**: it handles auth, shapes responses for the clients, and talks to this service (or the same Postgres) for catalogue data.

| Concern | Where |
|---------|--------|
| Client API, auth, payments webhooks | `server/` (Express BFF) |
| Catalogue, recipes, ingredients, search, bulk import | `domain/` (this service) |
| Postgres | Shared; this service will own the catalogue tables |

## Current state

- Spring Boot 3 + Java 21 + Lombok
- Postgres catalogue tables (Flyway `V1__catalogue.sql`)
- On startup, seeds from the bundled JSON when the tables are empty
  (`catalogue/ingredients.json`, `catalogue/recipes.json` — copies of the client catalogue)
- Read endpoints: `GET /catalogue/ingredients`, `GET /catalogue/recipes`
- `/health` so Render can mark the service live

### Tables

- `catalogue_ingredients` — id, name, category, pantry, allergens, sold
- `catalogue_recipes` — id, name, portions
- `catalogue_recipe_ingredients` — lines (ingredient, quantity, measure)
- `catalogue_recipe_steps` — method steps

These are the catalogue. The BFF’s `recipes` / `recipe_ingredients` tables remain for user-saved recipes.

### Env

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | `postgres://user:pass@host:port/db` (Render) or a JDBC URL |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | Used when `DATABASE_URL` is a JDBC URL |
| `PORT` | HTTP port (Render sets this) |

## Local

From this directory:

```bash
mvn spring-boot:run
```

Health: http://localhost:8080/health

## Render

- Repo: `leoelicos/ingre`
- Root directory / Docker context: `domain`
- Runtime: Docker
- Health check path: `/health`

The service binds to the `PORT` Render sets.
