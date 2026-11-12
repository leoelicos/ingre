# Postgres schema sketch (prototype foundation)

## Tables

### ingredients

- id uuid primary key
- name text not null
- aliases text[] default '{}'
- created_at timestamptz default now()

### recipes

- id uuid primary key
- title text not null
- steps jsonb
- dietary_flags text[] default '{}'
- created_at timestamptz default now()

### recipe_ingredients

- recipe_id uuid references recipes(id)
- ingredient_id uuid references ingredients(id)
- quantity numeric
- unit text
- primary key (recipe_id, ingredient_id)

### tickets

- id uuid primary key
- user_id uuid
- recipe_id uuid references recipes(id)
- created_at timestamptz default now()

### user_preferences

- user_id uuid primary key
- journey text
- allergens text[] default '{}'

## Notes

- Mongo is replaced (docs/POSTGRES_MIGRATION.md has the cutover runbook).
- Suggestions can be computed from recipe_ingredients overlap with selected ingredients.
- War room and Explore both write into the same ingredients / tickets tables.
