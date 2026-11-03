import { catalogue, library } from '../../library/recipeLibrary'
import { SHOP_SECTIONS, isNonFood, placeInShop } from '../sections'
import { categoryLabel } from '../../chips/chips'

/* #231: non-food items use the same list model as food. */

const nonFood = catalogue.filter((item) => isNonFood(item.category))
const named = (name: string) => catalogue.find((item) => item.name === name)

describe('non-food items (#231)', () => {
  it('has household items and kitchenware in the catalogue', () => {
    expect(named('disposable gloves')?.category).toBe('household')
    expect(named('kitchen paper')?.category).toBe('household')
    expect(named('saucepan')?.category).toBe('kitchenware')
    expect(nonFood).toHaveLength(17)
  })

  it('knows food from non-food by aisle', () => {
    expect(isNonFood('household')).toBe(true)
    expect(isNonFood('kitchenware')).toBe(true)
    expect(isNonFood('fruit & veg')).toBe(false)
    expect(isNonFood('meat')).toBe(false)
  })

  it('sits in its own Household section after Frozen, aisle as subsection', () => {
    expect(SHOP_SECTIONS.indexOf('Household')).toBeGreaterThan(
      SHOP_SECTIONS.indexOf('Frozen')
    )
    expect(placeInShop('household')).toEqual({
      section: 'Household',
      subsection: 'Household'
    })
    expect(placeInShop('kitchenware')).toEqual({
      section: 'Household',
      subsection: 'Kitchenware'
    })
    expect(placeInShop('meat').subsection).toBeNull()
    expect(categoryLabel('Household')).toBe('Household & kitchen')
  })

  it('has no allergens, no staples and no weight, so food-only logic never applies', () => {
    nonFood.forEach((item) => {
      expect(item.allergens).toEqual([])
      expect(item.staple).toBeUndefined()
      expect(item.approxGrams).toBeUndefined()
    })
  })

  it('is never used by a recipe', () => {
    const ids = new Set(nonFood.map((item) => item.id))
    const used = library.flatMap((recipe) =>
      recipe.ingredients.map((line) => line.ingredientId)
    )
    expect(used.some((id) => ids.has(id))).toBe(false)
  })
})
