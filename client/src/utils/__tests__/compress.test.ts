import compress from '../compress'

describe('compress', () => {
  it('aggregates duplicate ingredients and sorts categories', () => {
    const result = compress([
      {
        _id: '1',
        name: 'Tomatoes!!',
        quantity: '2',
        measure: ' Cups ',
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
      },
      {
        _id: '3',
        name: '  double  space ',
        quantity: '1',
        measure: 'unit',
        category: { name: 'other' },
        recipe: 'salad',
        recipeId: 'r1'
      },
      {
        _id: '4',
        name: 'eggs',
        quantity: '2',
        measure: 'unit',
        category: { name: 'dairy' },
        recipe: 'omelette',
        recipeId: 'r3'
      },
      {
        _id: '5',
        name: 'eggs',
        quantity: '1',
        measure: 'gram',
        category: { name: 'dairy' },
        recipe: 'omelette',
        recipeId: 'r3'
      },
      {
        _id: '6',
        name: 'apple',
        quantity: '1',
        measure: 'unit',
        category: { name: 'produce' },
        recipe: 'snack',
        recipeId: 'r4'
      }
    ])

    const produce = result.find(
      (category) => category.category.name === 'Produce'
    )
    const other = result.find((category) => category.category.name === 'Other')
    const dairy = result.find((category) => category.category.name === 'Dairy')
    expect(
      produce?.items.some((item) => item.description.includes('3 cups'))
    ).toBe(true)
    expect(
      produce?.items.some((item) => item.description.startsWith('Apple'))
    ).toBe(true)
    expect(other?.items[0]?.description).toBe('Double  space (1)')
    expect(dairy?.items[0]?.description).toContain('+')
    expect(result.map((category) => category.category.name)).toEqual([
      'Dairy',
      'Other',
      'Produce'
    ])
  })

  it('handles empty input', () => {
    expect(compress([])).toEqual([])
  })
})
