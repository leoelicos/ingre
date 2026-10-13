import { recipeKey, splitTitle, tintFor } from '../recipeCardHelpers'

describe('splitTitle', () => {
  it.each([
    ['Shaking beef (bò lúc lắc)', 'Shaking beef', 'bò lúc lắc'],
    [
      'Prawn and pork rice paper rolls (gỏi cuốn)',
      'Prawn and pork rice paper rolls',
      'gỏi cuốn'
    ],
    ['Dahl ( dal ) ', 'Dahl', 'dal']
  ])('splits %s', (name, title, localName) => {
    expect(splitTitle(name)).toEqual({ title, localName })
  })

  it.each([
    'Spaghetti bolognese',
    '(only brackets)',
    'Curry (mild) with rice',
    'Broken (bracket'
  ])('returns null localName for %s', (name) => {
    expect(splitTitle(name)).toEqual({ title: name.trim(), localName: null })
  })
})

describe('recipeKey', () => {
  it('prefers _id, then libraryId, then name', () => {
    expect(recipeKey({ _id: 'a', libraryId: 'b', name: 'c' })).toBe('a')
    expect(recipeKey({ libraryId: 'b', name: 'c' })).toBe('b')
    expect(recipeKey({ name: 'c' })).toBe('c')
  })
})

describe('tintFor', () => {
  it('uses the lunch tint for lunch or sweet tags, case-insensitively', () => {
    expect(tintFor(['Lunch'])).toBe('lunch')
    expect(tintFor(['sweet', 'dinner'])).toBe('lunch')
  })
  it('defaults to the dinner tint', () => {
    expect(tintFor(['dinner', 'Indian'])).toBe('dinner')
    expect(tintFor([])).toBe('dinner')
  })
})
