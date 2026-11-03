-- #217: Postgres schema v1. Additive and empty: nothing reads or writes it yet
-- (no cutover). Mongo stays the system of record until the owner flips it.
-- mongo_id keeps the legacy ObjectId so the backfill can be re-run safely.

create table categories (
  id bigint generated always as identity primary key,
  mongo_id text unique,
  name text not null unique
);

-- A catalogue ingredient. `key` is the catalogue id when there is one, else
-- the lower-cased name, so Mongo's one-document-per-recipe-line dedupes.
create table ingredients (
  id bigint generated always as identity primary key,
  key text not null unique,
  name text not null,
  aliases text[] not null default '{}',
  category_id bigint references categories (id) on delete set null,
  created_at timestamptz not null default now()
);

create table recipes (
  id bigint generated always as identity primary key,
  mongo_id text unique,
  name text not null,
  portions numeric not null default 2 check (portions >= 1),
  picture_url text not null,
  library_id text,
  instructions text,
  customisations jsonb not null default '[]',
  created_at timestamptz not null default now()
);
create index recipes_library_id_idx on recipes (library_id);

-- One row per recipe line, in order. A recipe can list an ingredient twice.
create table recipe_ingredients (
  recipe_id bigint not null references recipes (id) on delete cascade,
  position integer not null check (position >= 0),
  ingredient_id bigint not null references ingredients (id),
  quantity numeric not null default 0 check (quantity >= 0),
  measure text not null default 'unit',
  text text,
  primary key (recipe_id, position)
);
-- Suggestions are computed from overlap on this column.
create index recipe_ingredients_ingredient_idx
  on recipe_ingredients (ingredient_id);

create table users (
  id bigint generated always as identity primary key,
  mongo_id text unique,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  password_hash text not null,
  pro boolean not null default false,
  created_at timestamptz not null default now()
);

create table saved_recipes (
  user_id bigint not null references users (id) on delete cascade,
  recipe_id bigint not null references recipes (id) on delete cascade,
  position integer not null check (position >= 0),
  primary key (user_id, recipe_id)
);

-- A recipe a signed-in user has put on their shopping list (#204).
create table tickets (
  id bigint generated always as identity primary key,
  user_id bigint not null references users (id) on delete cascade,
  recipe_id bigint not null references recipes (id) on delete cascade,
  portions numeric check (portions >= 1),
  state text not null default 'open' check (state in ('open', 'done')),
  created_at timestamptz not null default now()
);
create index tickets_user_idx on tickets (user_id);

create table user_preferences (
  user_id bigint primary key references users (id) on delete cascade,
  journey text,
  allergens text[] not null default '{}',
  diets text[] not null default '{}',
  settings jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
