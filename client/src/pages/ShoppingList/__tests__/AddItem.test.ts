import { libIngredient } from '../../../test/fixtures'
import { suggest } from '../AddItem'

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
