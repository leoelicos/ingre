-- Mongo removal: Postgres becomes the only database. Adds what the API kept on the
-- Mongo User (subscriptions #312, store purchases #314, Paddle + RevenueCat
-- entitlements) and the webhook event ledger, and turns mongo_id into the public id.

-- The id the outside world holds (RevenueCat app_user_id, Paddle ingre_user_id,
-- Apple appAccountToken, Google obfuscated account id, JWT data._id): the Mongo
-- ObjectId for migrated rows, 24 random hex digits in the same shape for new ones.
create function new_public_id() returns text language sql volatile
  as $$ select left(replace(gen_random_uuid()::text, '-', ''), 24) $$;

alter table users rename column mongo_id to public_id;
alter table recipes rename column mongo_id to public_id;
update users
  set public_id = new_public_id()
  where public_id is null;
update recipes
  set public_id = new_public_id()
  where public_id is null;
alter table users
  alter column public_id set default new_public_id(),
  alter column public_id set not null,
  add constraint users_public_id_shape check (public_id ~ '^[0-9a-f]{24}$');
alter table recipes
  alter column public_id set default new_public_id(),
  alter column public_id set not null,
  add constraint recipes_public_id_shape check (public_id ~ '^[0-9a-f]{24}$');

-- A Google account may have no family name (Firebase Auth).
alter table users alter column last_name set default '';
-- Email lookups ignore case (Firebase lower-cases emails; old accounts may not).
create index users_email_lower_idx on users (lower(email));

alter table users
  -- #208 / #312: the tier and the Stripe subscription behind it
  add column tier text check (tier in ('EXPLORER', 'MANAGER', 'LEADER')),
  add column stripe_customer_id text,
  add column stripe_subscription_id text,
  add column subscription_status text,
  add column active boolean not null default false,
  -- #314: an App Store or Google Play subscription
  add column store_platform text check (store_platform in ('APPLE', 'GOOGLE')),
  add column store_product_id text,
  add column store_id text,
  add column store_expires_at timestamptz,
  -- Paddle + RevenueCat: the normalised entitlement; entitlement_updated_at is when
  -- the newest applied event happened, so an older event never undoes a newer one
  add column entitlement_source text check (entitlement_source in
    ('PADDLE', 'APP_STORE', 'PLAY_STORE', 'AMAZON', 'STRIPE', 'RC_BILLING',
     'PROMOTIONAL', 'OTHER')),
  add column entitlement_subscription_id text,
  add column entitlement_product_id text,
  add column entitlement_interval text
    check (entitlement_interval in ('month', 'year')),
  add column entitlement_expires_at timestamptz,
  add column entitlement_updated_at timestamptz,
  add column paddle_customer_id text;

create index users_stripe_customer_idx on users (stripe_customer_id);
create index users_store_id_idx on users (store_id);
create index users_entitlement_subscription_idx
  on users (entitlement_subscription_id);

-- Paddle + RevenueCat: one row per payment event already taken
-- (`<provider>:<event id>`), so a repeat delivery is skipped.
create table webhook_events (
  id text primary key,
  received_at timestamptz not null default now()
);

-- A recipe line keeps the name and section it was saved with (as each Mongo
-- Ingredient document did); the shared catalogue row supplies them when null.
alter table recipe_ingredients
  add column name text,
  add column category_id bigint references categories (id) on delete set null;
