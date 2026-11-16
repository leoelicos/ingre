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

Deployable skeleton only:

- Spring Boot 3 + Java 21 + Lombok
- `/health` (and Actuator) so Render can mark the service live
- No database connection yet
- No catalogue endpoints yet

Once it is running on Render, the next steps are Postgres, seeding the current catalogue, and exposing list/search endpoints for the BFF to call.

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
