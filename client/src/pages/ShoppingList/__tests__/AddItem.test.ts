import { libIngredient } from '../../../test/fixtures'
import { suggest, toExtra } from '../AddItem'

describe('suggest', () => {
  it('matches every word, case-insensitively, up to six items', () => {
    expect(suggest('')).toEqual([])
    expect(suggest('MILK cream').map((i) => i.id)).toEqual(['full-cream-milk'])
    const many = Array.from({ length: 9 }, (_, n) =>
      libIngredient({ id: `o${n}`, name: `onion ${n}` })
    )
    expect(suggest('onion', many)).toHaveLength(6)
  })
})

describe('toExtra (#162)', () => {
  it('takes typed text from the catalogue, ignoring case and plurals', () => {
    expect(toExtra('Eggs')).toEqual({ name: 'eggs', ingredientId: 'egg' })
    expect(toExtra('  garlic ')).toEqual({
      name: 'garlic',
      ingredientId: 'garlic'
    })
  })

  it('keeps text the catalogue does not have as free text', () => {
    expect(toExtra(' Birthday candles ')).toEqual({
      name: 'Birthday candles',
      ingredientId: null
    })
  })
})
