import { newCopy } from '../../balance/copies'
import { copyEntries } from '../../chips/useChips'
import { allergensOnList, needsCare, separate } from '../diet'

/* #221 Dietary separation: who can eat what, and when care is needed. */

const entriesOf = (...ids: string[]) =>
  copyEntries(ids.map((id) => newCopy(id)))

const names = (list: readonly { name: string }[]) => list.map((r) => r.name)

describe('allergensOnList', () => {
  it('is the lowercased, alphabetical union across the picked recipes', () => {
    expect(allergensOnList(entriesOf('dahl', 'rice-paper-rolls'))).toEqual([
      'crustacean',
      'milk',
      'peanut',
      'soy',
      'wheat'
    ])
  })

  it('is empty for no recipes, or recipes with none', () => {
    expect(allergensOnList([])).toEqual([])
    expect(allergensOnList(entriesOf('beef-keema', 'vegetable-curry'))).toEqual(
      []
    )
  })

  it('leaves out an ingredient the cook removed', () => {
    const copy = { ...newCopy('dahl'), amounts: { butter: 0 } }
    expect(allergensOnList(copyEntries([copy]))).toEqual([])
  })
})

describe('separate', () => {
  const picked = entriesOf('dahl', 'lemongrass-chilli-chicken', 'beef-keema')

  it('splits recipes by the allergens to avoid, saying which', () => {
    const result = separate(picked, new Set(['milk']))
    expect(names(result.safe)).toEqual([
      'Lemongrass chilli chicken (gà xào sả ớt)',
      'Beef keema with peas'
    ])
    expect(result.unsafe.map((h) => [h.recipe.name, h.allergens])).toEqual([
      ['Red lentil dahl', ['milk']]
    ])
  })

  it('lists only the avoided allergens a recipe has', () => {
    const result = separate(entriesOf('shaking-beef'), new Set(['fish', 'egg']))
    expect(result.unsafe[0]?.allergens).toEqual(['fish'])
  })

  it('has every recipe safe when nothing is avoided', () => {
    const result = separate(picked, new Set())
    expect(result.safe).toHaveLength(3)
    expect(result.unsafe).toEqual([])
  })

  it('has none safe when every one has the allergen', () => {
    const result = separate(
      entriesOf('dahl', 'butter-chicken'),
      new Set(['milk'])
    )
    expect(result.safe).toEqual([])
    expect(result.unsafe).toHaveLength(2)
  })
})

describe('needsCare', () => {
  const split = (avoid: string[]) =>
    separate(entriesOf('dahl', 'beef-keema'), new Set(avoid))

  it('only when safe and unsafe dishes are cooked together', () => {
    expect(needsCare(split(['milk']))).toBe(true)
    expect(needsCare(split([]))).toBe(false)
    expect(needsCare(separate(entriesOf('dahl'), new Set(['milk'])))).toBe(
      false
    )
  })
})
