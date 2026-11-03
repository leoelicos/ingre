import { recipeById } from '../../../test/library'
import type { LibraryIngredient, LibraryRecipe } from '../../../types/library'
import { copyLines, newCopy } from '../../balance/copies'
import { catalogue, library } from '../../library/recipeLibrary'
import type { Prices } from '../../suggest/suggest'
import type { PickedRecipe } from '../risks'
import {
  SUBSTITUTES,
  accessFor,
  budgetFor,
  costOf,
  fridgeFor,
  fridgeLitres,
  gramsOf,
  listItems,
  ovenRecipes,
  parseSubstitutes,
  shopItems,
  substitutesFor
} from '../risks'

/* #220 Risk handling: the five risks, as pure rules over the picked recipes. */

const picked = (...ids: string[]): PickedRecipe[] =>
  ids.map((id) => {
    const recipe = recipeById(id)
    return { recipe, lines: copyLines(recipe, newCopy(id), catalogue) }
  })
const names = (items: readonly LibraryIngredient[]) =>
  items.map((item) => item.id)
const PRICE: Prices = new Map([
  ['butter', 5],
  ['chicken-thigh', 10],
  ['onion', 2],
  ['rice-paper', 3]
])

describe('data/risks.json', () => {
  it('names only catalogue ingredients, each with advice or null', () => {
    const ids = new Set(catalogue.map((item) => item.id))
    for (const [id, use] of SUBSTITUTES) {
      expect(ids.has(id)).toBe(true)
      expect(use === null || use.length > 3).toBe(true)
    }
  })

  it('marks rice paper as having no good substitute', () => {
    expect(SUBSTITUTES.get('rice-paper')).toBeNull()
  })

  it('fails loudly on a malformed file', () => {
    expect(() => parseSubstitutes([])).toThrow('risks: expected an object')
    expect(() => parseSubstitutes({})).toThrow('"substitutes" object')
    expect(() => parseSubstitutes({ substitutes: { a: '' } })).toThrow(
      'a needs advice text or null'
    )
    expect(() => parseSubstitutes({ substitutes: { a: 4 } })).toThrow(
      'a needs advice text or null'
    )
    expect(parseSubstitutes({ substitutes: { a: 'b c', d: null } })).toEqual(
      new Map([
        ['a', 'b c'],
        ['d', null]
      ])
    )
  })
})

describe('the list: what the picked recipes need', () => {
  it('has each ingredient once, and nothing from an unknown id', () => {
    const items = listItems(picked('butter-chicken', 'chicken-korma'))
    expect(new Set(names(items)).size).toBe(items.length)
    expect(names(items)).toContain('chicken-thigh')
    expect(listItems(picked('dahl'), [])).toEqual([])
  })

  it('skips a line the copy removed', () => {
    const [entry] = picked('dahl')
    const lines = (entry?.lines ?? []).map((line) =>
      line.ingredientId === 'butter' ? { ...line, quantity: 0 } : line
    )
    const items = listItems([{ recipe: recipeById('dahl'), lines }])
    expect(names(items)).not.toContain('butter')
  })

  it('leaves staples out of what to buy', () => {
    expect(names(listItems(picked('dahl')))).toContain('salt')
    expect(names(shopItems(picked('dahl')))).not.toContain('salt')
  })
})

describe('1. the shop is out of an ingredient', () => {
  it('offers a substitute for each ingredient to buy that has one', () => {
    const advice = substitutesFor(picked('butter-chicken'))
    const butter = advice.find((a) => a.item.id === 'butter')
    expect(butter?.use).toBe('ghee, or a neutral oil')
    expect(advice.find((a) => a.item.id === 'chicken-thigh')?.use).toMatch(
      /^chicken breast/
    )
  })

  it('says so when there is nothing to use instead', () => {
    const advice = substitutesFor(picked('rice-paper-rolls'))
    expect(advice.find((a) => a.item.id === 'rice-paper')?.use).toBeNull()
  })

  it('stays quiet about an ingredient with no entry, and about staples', () => {
    const table = new Map([
      ['salt', 'x y z'],
      ['butter', 'ghee']
    ])
    const advice = substitutesFor(picked('dahl'), table)
    expect(names(advice.map((a) => a.item))).toEqual(['butter'])
  })
})

describe('2. the shop cannot be reached', () => {
  it('counts what each picked recipe still needs, fewest first', () => {
    const have = new Set(['red-lentils', 'onion', 'garlic'])
    const { picked: found } = accessFor(picked('butter-chicken', 'dahl'), have)
    expect(found.map(({ recipe }) => recipe.id)).toEqual([
      'dahl',
      'butter-chicken'
    ])
    expect(found[0]?.missing).toBeGreaterThan(0)
  })

  it('has nothing missing once every shop ingredient is in hand', () => {
    const have = new Set(shopItems(picked('dahl')).map((item) => item.id))
    expect(accessFor(picked('dahl'), have).picked[0]?.missing).toBe(0)
  })

  it('names the closest recipe not picked, when it is near enough', () => {
    const have = new Set(
      shopItems(picked('chicken-korma', 'butter-chicken')).map((i) => i.id)
    )
    const { alternative } = accessFor(picked('chicken-korma'), have)
    expect(alternative?.recipe.id).toBe('butter-chicken')
    expect(alternative?.missing).toBe(0)
  })

  it('names none when every other recipe is out of reach', () => {
    const { alternative } = accessFor(picked('dahl'), new Set())
    expect(alternative).toBeNull()
  })

  it('breaks a tie by name', () => {
    const a: LibraryRecipe = { ...recipeById('dahl'), id: 'a', name: 'Alpha' }
    const b: LibraryRecipe = { ...recipeById('dahl'), id: 'b', name: 'Bravo' }
    const have = new Set(shopItems(picked('dahl')).map((i) => i.id))
    const { alternative } = accessFor([], have, [b, a])
    expect(alternative?.recipe.name).toBe('Alpha')
  })
})

describe('3. the budget is overrun', () => {
  it('prices one pack of each shop ingredient, and counts a missing price as nothing', () => {
    expect(costOf(picked('butter-chicken'), PRICE)).toBe(17)
    expect(costOf(picked('butter-chicken', 'dahl'), PRICE)).toBe(17)
    expect(costOf(picked('butter-chicken', 'rice-paper-rolls'), PRICE)).toBe(20)
  })

  it('is within a budget that covers the cost', () => {
    expect(budgetFor(picked('butter-chicken'), 20, PRICE)).toEqual({
      cost: 17,
      budget: 20,
      over: 0,
      drops: []
    })
  })

  it('says how far over, and which recipe to drop to save the most', () => {
    const both = picked('butter-chicken', 'rice-paper-rolls')
    const result = budgetFor(both, 10, PRICE)
    expect(result.over).toBe(10)
    expect(result.drops[0]?.recipe.id).toBe('butter-chicken')
    expect(result.drops[0]?.saving).toBe(17)
  })

  it('names no recipe to drop from an empty list', () => {
    expect(budgetFor([], -1, PRICE).drops).toEqual([])
  })

  it('uses the bundled prices by default', () => {
    expect(costOf(picked('dahl'))).toBeGreaterThan(0)
    expect(budgetFor(picked('dahl'), 1000).over).toBe(0)
  })
})

describe('4. the fridge is too full', () => {
  it('adds up the chilled ingredients in grams, as litres', () => {
    const litres = fridgeLitres(picked('butter-chicken'))
    expect(litres).toBeGreaterThan(0.2)
    expect(litres).toBeLessThan(2)
  })

  it('ignores cupboard items and unknown ingredients', () => {
    expect(fridgeLitres(picked('dahl'), [])).toBe(0)
    const rice = picked('egg-fried-rice')
    const all = fridgeLitres(rice)
    const noFridge = catalogue.map((item) => ({
      ...item,
      pantry: 'Cupboard' as const
    }))
    expect(all).toBeGreaterThan(0)
    expect(fridgeLitres(rice, noFridge)).toBe(0)
  })

  it('weighs a line in grams, and nothing when its measure cannot be weighed', () => {
    const [entry] = picked('butter-chicken')
    const line = entry?.lines.find((l) => l.ingredientId === 'chicken-thigh')
    const item = catalogue.find((i) => i.id === 'chicken-thigh')
    expect(line).toBeDefined()
    expect(item).toBeDefined()
    if (line === undefined || item === undefined) return
    expect(gramsOf(line, item)).toBeGreaterThan(100)
    expect(gramsOf({ ...line, measure: 'handful' }, item)).toBe(0)
    const onion = catalogue.find((i) => i.id === 'onion')
    if (onion === undefined) return
    const { approxGrams: _, ...uncounted } = onion
    expect(gramsOf({ ...line, measure: 'whole' }, uncounted)).toBe(0)
  })

  it('fits when the space is enough, and says how much over when not', () => {
    const load = fridgeLitres(picked('butter-chicken'))
    expect(fridgeFor(picked('butter-chicken'), load + 1).over).toBe(0)
    const tight = fridgeFor(picked('butter-chicken'), 0.1)
    expect(tight.litres).toBe(load)
    expect(tight.over).toBeCloseTo(load - 0.1, 2)
  })
})

describe('5. the oven fails', () => {
  it('finds no recipe in the library that needs the oven', () => {
    expect(ovenRecipes(picked(...library.map((r) => r.id)))).toEqual([])
  })

  it('finds a recipe whose method bakes, roasts or uses the oven', () => {
    const roast: PickedRecipe = {
      recipe: { ...recipeById('dahl'), method: ['Roast the lentils.'] },
      lines: []
    }
    const baked: PickedRecipe = {
      recipe: { ...recipeById('dahl'), id: 'x', method: ['Heat the oven.'] },
      lines: []
    }
    expect(ovenRecipes([roast, baked, ...picked('dahl')])).toHaveLength(2)
  })
})
