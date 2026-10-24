import { SAVE_RECIPE } from '../../lib/apollo/graphQL/mutations'
import { COPIES_KEY } from '../../utils/storage/shoppingState'
import { itemById, recipeById } from '../library'
import { pickedIds } from '../renderList'
import { saveMock } from '../savedMocks'

describe('test helpers', () => {
  it('find real items and recipes, and say when one is missing', () => {
    expect(itemById('butter').name).toBe('butter')
    expect(recipeById('dahl').name).toBe('Red lentil dahl')
    expect(() => itemById('nope')).toThrow('no item nope')
    expect(() => recipeById('nope')).toThrow('no recipe nope')
  })

  it('read no picks from empty storage', () => {
    localStorage.clear()
    expect(pickedIds()).toEqual([])
    localStorage.setItem(COPIES_KEY, '{}')
    expect(pickedIds()).toEqual([])
  })

  it('match saveRecipe only for its library id', () => {
    const mock = saveMock('dahl')
    expect(mock.request.query).toBe(SAVE_RECIPE)
    expect(mock.variableMatcher?.({})).toBe(false)
    expect(mock.variableMatcher?.({ input: { libraryId: 'x' } })).toBe(false)
  })
})
