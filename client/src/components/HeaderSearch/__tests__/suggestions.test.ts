import { libIngredient, libRecipe } from '../../../test/fixtures'
import {
  MAX_SUGGESTIONS,
  hasEveryWord,
  queryWords,
  searchPath,
  searchSuggestions,
  tabAcceptance,
  visibleSuggestions
} from '../suggestions'

describe('header search suggestions (#163)', () => {
  it('splits a query into lower-case words and matches every word', () => {
    expect(queryWords('  Red  Onion ')).toEqual(['red', 'onion'])
    expect(queryWords('   ')).toEqual([])
    expect(hasEveryWord('Red onion', ['onion', 'red'])).toBe(true)
    expect(hasEveryWord('Red onion', ['green'])).toBe(false)
  })

  it('lists recipes first, then catalogue ingredients, each with a detail and a path', () => {
    const recipes = [libRecipe({ id: 'pie', name: 'Milk pie (tart)' })]
    const items = [
      libIngredient({ id: 'milk', name: 'milk', category: 'dairy & eggs' })
    ]
    expect(searchSuggestions('milk', recipes, items)).toEqual([
      {
        id: 'recipe:pie',
        name: 'Milk pie',
        detail: 'Recipe',
        path: '/recipe/pie'
      },
      {
        id: 'ingredient:milk',
        name: 'Milk',
        detail: 'Dairy, Eggs & Fridge',
        path: '/?q=milk'
      }
    ])
  })

  it('shows nothing for blank text and at most six options', () => {
    expect(searchSuggestions('  ')).toEqual([])
    expect(searchSuggestions('a').length).toBe(MAX_SUGGESTIONS)
    expect(searchSuggestions('egg').length).toBeGreaterThan(0)
  })

  it('hides the options for text just accepted with Tab', () => {
    expect(visibleSuggestions('egg', 'egg')).toEqual([])
    expect(visibleSuggestions('egg', null).length).toBeGreaterThan(0)
  })

  it('searches Pick for the text, or opens Pick unfiltered when blank', () => {
    expect(searchPath(' red onion ')).toBe('/?q=red%20onion')
    expect(searchPath('  ')).toBe('/')
  })

  it('Tab accepts the highlighted option, else the first; never Shift+Tab or a closed list', () => {
    const options = searchSuggestions('egg')
    const [first, second] = options
    expect(tabAcceptance('Tab', false, true, null, options)).toBe(first)
    expect(tabAcceptance('Tab', false, true, second?.id ?? '', options)).toBe(
      second
    )
    expect(tabAcceptance('Tab', false, true, 'gone', options)).toBe(first)
    expect(tabAcceptance('Tab', true, true, null, options)).toBeNull()
    expect(tabAcceptance('Tab', false, false, null, options)).toBeNull()
    expect(tabAcceptance('Enter', false, true, null, options)).toBeNull()
    expect(tabAcceptance('Tab', false, true, null, [])).toBeNull()
  })
})
