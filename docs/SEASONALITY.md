# Seasonality and the stubbed micropayment (#218)

Both are **off by default**, each behind its own opt-in flag (`?flags=seasonality`, `?flags=micropayments`; see `docs/TIERS.md` for how flags work). `micropayments` only does anything together with `seasonality`.

## Seasonality (Sydney, v1)

- `client/src/data/seasons.json`: ingredient id → months in season (1 = January), for Sydney, time zone `Australia/Sydney`. Every id is a catalogue ingredient (a test checks this, and that every month has something in season).
- **The calendar is a DRAFT from general knowledge of NSW produce seasons. It is not copied from any published guide.** The owner is to supply or approve a sourced calendar (and its licence) before it is treated as authoritative.
- `client/src/utils/seasons/seasons.ts`: strict `parseSeasons`, `inSeason`, `seasonalIngredients`, `seasonsIn`, `seasonalRecipes`, `monthIn`. No geolocation: the month is Sydney's month (read with `Intl`), whatever the device's clock zone is.
- `components/InSeason`: the "In season now" group at the top of Explore (hidden while a search is typed, so results are not doubled). It names the month ("November in Sydney") in text, lists in-season ingredients (tap to add), and recipes that use something in season, saying which ("In season: tomatoes"). It says it is a guide only.
- It never hides or reorders recipes: the Browse recipes list below is untouched.

## Micropayment (stub)

- `client/src/utils/micropayment/micropayment.ts`: a `MicropaymentGateway` interface and a `stubGateway` that answers at once with a receipt where `charged` is `false`. **No network call, no Stripe call, no charge.** Price shown: 1 USD, as a stand-in.
- The editor's pick (the recipe with the most in-season ingredients) can be "unlocked" to reveal why it is in season. The unlock is remembered on the device (`localStorage` key `ingre.micropayments`) only after the gateway answers; a failing gateway unlocks nothing and says so.
- A real gateway would implement `MicropaymentGateway` against Stripe in **test mode** (test keys from env or secrets, never committed; the public test card 4242 4242 4242 4242). There are no Stripe test keys in this repo's CI secrets, so nothing here talks to Stripe.

## Open questions for the owner

1. The seasonal calendar: source and licence (the bundled one is a draft).
2. Editor's pick: automatic (most in-season ingredients) now; should it be curated?
3. Regions beyond Sydney, and whether a region is chosen by the user.
4. Whether micropayments are wanted at all: the #218 issue thread had a "no micropayments" decision; this stub follows the later instruction to include one, behind its own flag.
