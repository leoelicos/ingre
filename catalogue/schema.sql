-- Recipe catalogue schema (source of truth for generated recipes.db)
-- Generated SQLite file is a build artefact; edit seed via scripts or this schema.

CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ingredients (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL,
  pantry        TEXT,
  approx_grams  REAL,
  allergens     TEXT  -- JSON array
);

CREATE TABLE IF NOT EXISTS ingredient_measures (
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id),
  measure       TEXT NOT NULL,
  grams         REAL NOT NULL,
  PRIMARY KEY (ingredient_id, measure)
);

CREATE TABLE IF NOT EXISTS recipes (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  portions INTEGER NOT NULL DEFAULT 1,
  method   TEXT  -- JSON array of steps
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  recipe_id     TEXT NOT NULL REFERENCES recipes(id),
  ingredient_id TEXT NOT NULL REFERENCES ingredients(id),
  quantity      REAL NOT NULL,
  measure       TEXT NOT NULL,
  PRIMARY KEY (recipe_id, ingredient_id, measure)
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(name);
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name);
