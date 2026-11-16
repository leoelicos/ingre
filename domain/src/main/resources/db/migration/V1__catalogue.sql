-- Catalogue tables for the domain service.
-- Distinct from the BFF's user-saved recipes tables.

create table catalogue_ingredients (
  id text primary key,
  name text not null,
  category text not null,
  pantry text,
  allergens text[] not null default '{}',
  sold jsonb not null default '[]'
);

create table catalogue_recipes (
  id text primary key,
  name text not null,
  portions numeric not null default 1 check (portions >= 1)
);

create table catalogue_recipe_ingredients (
  recipe_id text not null references catalogue_recipes (id) on delete cascade,
  position integer not null check (position >= 0),
  ingredient_id text not null references catalogue_ingredients (id),
  quantity numeric not null,
  measure text not null,
  primary key (recipe_id, position)
);

create index catalogue_recipe_ingredients_ingredient_idx
  on catalogue_recipe_ingredients (ingredient_id);

create table catalogue_recipe_steps (
  recipe_id text not null references catalogue_recipes (id) on delete cascade,
  position integer not null check (position >= 0),
  text text not null,
  primary key (recipe_id, position)
);
