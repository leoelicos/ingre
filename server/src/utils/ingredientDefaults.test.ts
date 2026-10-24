import {
  DEFAULT_INGREDIENT,
  fulfilledValues,
  withIngredientDefaults
} from './ingredientDefaults'

describe('withIngredientDefaults', () => {
  it('fills every falsy field with defaults', () => {
    expect(
      withIngredientDefaults({
        name: '',
        quantity: 0,
        measure: '',
        category: '',
        ingredientId: ''
      })
    ).toEqual(DEFAULT_INGREDIENT)
  })
  it('keeps provided values', () => {
    const input = {
      name: 'egg',
      quantity: 2,
      measure: 'whole',
      category: 'dairy',
      ingredientId: 'egg'
    }
    expect(withIngredientDefaults(input)).toEqual(input)
  })
})

describe('fulfilledValues', () => {
  it('keeps fulfilled values in order and drops rejections', async () => {
    const results = await Promise.allSettled([
      Promise.resolve(1),
      Promise.reject(new Error('x')),
      Promise.resolve(3)
    ])
    expect(fulfilledValues(results)).toEqual([1, 3])
  })
  it('returns [] for no results', () => {
    expect(fulfilledValues([])).toEqual([])
  })
})
