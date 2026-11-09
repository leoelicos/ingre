import catalogue from '../ingredients.json'
import library from '../recipes.json'

/* The recipe rules every catalogue recipe must pass (#103), checked on the shipped data */
const recipes: ReadonlyArray<Record<string, unknown>> = library.recipes
const ingredientIds = new Set(catalogue.ingredients.map(({ id }) => id))

interface Line {
  readonly ingredientId: unknown
  readonly quantity: unknown
}
const linesOf = (recipe: Record<string, unknown>): readonly Line[] =>
  recipe['ingredients'] as Line[]
const ids = recipes.map((recipe) => recipe['id'] as string)

describe('recipe catalogue (#103)', () => {
  it('ships recipes, each with ingredient lines', () => {
    expect(recipes.length).toBeGreaterThan(0)
    for (const recipe of recipes)
      expect(linesOf(recipe).length).toBeGreaterThan(0)
  })

  it.each(ids)('%s uses only ingredient ids from ingredients.json', (id) => {
    const recipe = recipes[ids.indexOf(id)] as Record<string, unknown>
    const unknown = linesOf(recipe)
      .map((line) => line.ingredientId)
      .filter((ingredientId) => !ingredientIds.has(ingredientId as string))
    expect(unknown).toEqual([])
  })

  it.each(ids)('%s gives every quantity as a finite number above 0', (id) => {
    const recipe = recipes[ids.indexOf(id)] as Record<string, unknown>
    const bad = linesOf(recipe).filter(
      ({ quantity }) =>
        typeof quantity !== 'number' ||
        !Number.isFinite(quantity) ||
        quantity <= 0
    )
    expect(bad).toEqual([])
  })

  it.each(ids)('%s is for 1 portion', (id) => {
    expect(recipes[ids.indexOf(id)]?.['portions']).toBe(1)
  })

  it.each(ids)('%s has no tags', (id) => {
    expect(recipes[ids.indexOf(id)]).not.toHaveProperty('tags')
  })
})
