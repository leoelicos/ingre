import compress, { savedIngredientType } from '../compress'

describe('compress', () => {
  const mockIngredients: savedIngredientType[] = [
    {
      _id: '1',
      name: 'tomatoes',
      quantity: '2',
      measure: 'cups',
      category: { name: 'produce' },
      recipe: 'salad',
      recipeId: 'r1'
    },
    {
      _id: '2',
      name: 'tomatoes',
      quantity: '1',
      measure: 'cups',
      category: { name: 'produce' },
      recipe: 'soup',
      recipeId: 'r2'
    }
  ]

  it('aggregates duplicate ingredients', () => {
    const result = compress(mockIngredients)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].category.name.toLowerCase()).toBe('produce')
  })

  it('handles empty input', () => {
    expect(compress([])).toEqual([])
  })
})
