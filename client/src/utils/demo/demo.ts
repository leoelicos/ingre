/*
 * The /demo loop (#216): ingredient -> suggestion -> ticket, with no backend. A small fixed
 * catalogue, so the page works offline and the same on every visit.
 */

export interface DemoIngredient {
  readonly id: string
  /** The one primary name shown everywhere (#214). */
  readonly name: string
  /** Matched by search only, never displayed. */
  readonly aliases: readonly string[]
  readonly priceCents: number
}

export interface DemoRecipe {
  readonly id: string
  readonly title: string
  readonly needs: readonly string[]
}

export interface DemoSuggestion {
  readonly id: string
  readonly title: string
  /** Names of what the user has not picked yet. */
  readonly missing: readonly string[]
  readonly costCents: number
}

/** A suggestion that was added: what the Tickets list shows. */
export interface Ticket {
  readonly id: string
  readonly title: string
}

export const DEMO_INGREDIENTS: readonly DemoIngredient[] = [
  { id: 'carrot', name: 'carrot', aliases: ['carrots'], priceCents: 100 },
  { id: 'flour', name: 'flour', aliases: ['plain flour'], priceCents: 150 },
  { id: 'sugar', name: 'sugar', aliases: ['caster sugar'], priceCents: 200 },
  { id: 'butter', name: 'butter', aliases: [], priceCents: 450 },
  { id: 'egg', name: 'egg', aliases: ['eggs'], priceCents: 100 },
  {
    id: 'chicken',
    name: 'chicken breast',
    aliases: ['chicken'],
    priceCents: 900
  },
  { id: 'rice', name: 'rice', aliases: [], priceCents: 300 },
  { id: 'onion', name: 'onion', aliases: ['onions'], priceCents: 80 }
]

export const DEMO_RECIPES: readonly DemoRecipe[] = [
  {
    id: 'carrot-cake',
    title: 'Carrot cake',
    needs: ['carrot', 'flour', 'sugar']
  },
  {
    id: 'chicken-rice',
    title: 'Chicken and rice',
    needs: ['chicken', 'rice', 'onion']
  },
  { id: 'egg-rice', title: 'Egg fried rice', needs: ['egg', 'rice', 'onion'] },
  {
    id: 'shortbread',
    title: 'Shortbread',
    needs: ['flour', 'butter', 'sugar']
  }
]

/** How many suggestions the page shows. */
export const MAX_SUGGESTIONS = 3

const ingredientById = (id: string): readonly DemoIngredient[] =>
  DEMO_INGREDIENTS.filter((ingredient) => ingredient.id === id)

/** Ingredients whose name or an alias contains the text; all of them for empty text. */
export const matchIngredients = (query: string): readonly DemoIngredient[] => {
  const text = query.trim().toLowerCase()
  return DEMO_INGREDIENTS.filter(
    (ingredient) =>
      ingredient.name.includes(text) ||
      ingredient.aliases.some((alias) => alias.includes(text))
  )
}

/** The picked ids with this one added, or removed when it is already there. */
export const toggleId = (
  ids: readonly string[],
  id: string
): readonly string[] =>
  ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]

const missingFor = (
  recipe: DemoRecipe,
  picked: readonly string[]
): readonly DemoIngredient[] =>
  recipe.needs
    .filter((id) => !picked.includes(id))
    .flatMap((id) => ingredientById(id))

const toSuggestion = (
  recipe: DemoRecipe,
  picked: readonly string[]
): DemoSuggestion => {
  const missing = missingFor(recipe, picked)
  return {
    id: recipe.id,
    title: recipe.title,
    missing: missing.map((ingredient) => ingredient.name),
    costCents: missing.reduce(
      (sum, ingredient) => sum + ingredient.priceCents,
      0
    )
  }
}

const usesAny = (recipe: DemoRecipe, picked: readonly string[]): boolean =>
  recipe.needs.some((id) => picked.includes(id))

/** Recipes that use something picked, fewest missing first, then by title. */
export const suggest = (picked: readonly string[]): readonly DemoSuggestion[] =>
  DEMO_RECIPES.filter((recipe) => usesAny(recipe, picked))
    .map((recipe) => toSuggestion(recipe, picked))
    .sort(
      (a, b) =>
        a.missing.length - b.missing.length || a.title.localeCompare(b.title)
    )
    .slice(0, MAX_SUGGESTIONS)

/** Whole dollars: 200 -> "$2"; cents only when there are some: 450 -> "$4.50". */
export const formatDollars = (cents: number): string =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2
  }).format(cents / 100)

/** The tickets with this one added; unchanged when it is already there. */
export const withTicket = (
  tickets: readonly Ticket[],
  ticket: Ticket
): readonly Ticket[] =>
  tickets.some((t) => t.id === ticket.id) ? tickets : [...tickets, ticket]
