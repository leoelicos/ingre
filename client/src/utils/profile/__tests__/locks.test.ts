import { libIngredient, libRecipe } from '../../../test/fixtures'
import {
  DIETS,
  NO_LOCKS,
  allergenLocked,
  itemLocked,
  recipeLocked,
  unlockedRecipes
} from '../locks'
import type { Locks } from '../locks'

const items = [
  libIngredient({ id: 'beef-mince', allergens: [] }),
  libIngredient({ id: 'butter', allergens: ['milk'] }),
  libIngredient({ id: 'oats', allergens: ['gluten (oats)'] }),
  libIngredient({ id: 'almonds', allergens: ['tree nut (almond)'] }),
  libIngredient({ id: 'honey', allergens: [] }),
  libIngredient({ id: 'carrot', allergens: [] })
]
const recipe = (id: string, ...ids: string[]) =>
  libRecipe({
    id,
    ingredients: ids.map((ingredientId) => ({
      ingredientId,
      quantity: 1,
      measure: 'g'
    }))
  })
const lock = (diet: Locks['diet'], ...allergens: string[]): Locks => ({
  allergens,
  diet
})

describe('allergen locks (#224)', () => {
  it('locks an allergen by its name, or by its family', () => {
    expect(allergenLocked('milk', 'milk')).toBe(true)
    expect(allergenLocked('Gluten (oats)', 'gluten')).toBe(true)
    expect(allergenLocked('tree nut (almond)', 'Tree nut')).toBe(true)
    expect(allergenLocked('tree nut (almond)', 'tree nut (cashew)')).toBe(false)
    expect(allergenLocked('milk', 'mil')).toBe(false)
  })

  it('locks the items that carry it, and a recipe with any such item', () => {
    expect(itemLocked('butter', items, lock('none', 'milk'))).toBe(true)
    expect(itemLocked('carrot', items, lock('none', 'milk'))).toBe(false)
    expect(itemLocked('oats', items, lock('none', 'gluten'))).toBe(true)
    expect(
      recipeLocked(recipe('r', 'carrot', 'butter'), items, lock('none', 'milk'))
    ).toBe(true)
    expect(
      recipeLocked(recipe('r', 'carrot'), items, lock('none', 'milk'))
    ).toBe(false)
  })

  it('locks nothing by default', () => {
    expect(itemLocked('butter', items, NO_LOCKS)).toBe(false)
    expect(DIETS).toEqual(['none', 'pescatarian', 'vegetarian', 'vegan'])
  })
})

describe('diet locks (#224)', () => {
  const real = ['beef-mince', 'cooked-prawns', 'egg', 'butter', 'honey']
  const ruledOut = (diet: Locks['diet']) =>
    real.filter((id) => itemLocked(id, items, lock(diet)))

  it('rules out meat for pescatarians, then seafood for vegetarians, then animal products for vegans', () => {
    expect(ruledOut('none')).toEqual([])
    expect(ruledOut('pescatarian')).toEqual(['beef-mince'])
    expect(ruledOut('vegetarian')).toEqual(['beef-mince', 'cooked-prawns'])
    expect(ruledOut('vegan')).toEqual([
      'beef-mince',
      'cooked-prawns',
      'egg',
      'butter',
      'honey'
    ])
  })

  it('rules out fish and oyster sauce for vegetarians', () => {
    expect(itemLocked('fish-sauce', items, lock('vegetarian'))).toBe(true)
    expect(itemLocked('oyster-sauce', items, lock('vegetarian'))).toBe(true)
    expect(itemLocked('fish-sauce', items, lock('pescatarian'))).toBe(false)
  })

  it('keeps only the recipes nothing rules out', () => {
    const all = [recipe('meat', 'beef-mince'), recipe('veg', 'carrot')]
    expect(
      unlockedRecipes(all, items, lock('vegetarian')).map((r) => r.id)
    ).toEqual(['veg'])
  })
})
