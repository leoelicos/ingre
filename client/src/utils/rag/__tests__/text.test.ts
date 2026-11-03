import { stem, tokenise } from '../text'

describe('text for the index (#225)', () => {
  it.each([
    ['tomatoes', 'tomato'],
    ['potatoes', 'potato'],
    ['carrots', 'carrot'],
    ['lentils', 'lentil'],
    ['berries', 'berry'],
    ['sauces', 'sauce'],
    ['radishes', 'radish'],
    ['hummus', 'hummus'],
    ['grass', 'grass'],
    ['oat', 'oat'],
    ['egg', 'egg'],
    ['gas', 'gas']
  ])('stems %s to %s', (word, expected) => {
    expect(stem(word)).toBe(expected)
  })

  it('lowercases, drops accents and punctuation, and stems each word', () => {
    expect(tokenise('Carrots, FLOUR & Crème-fraîche!')).toEqual([
      'carrot',
      'flour',
      'creme',
      'fraiche'
    ])
  })

  it('has no words for an empty text', () => {
    expect(tokenise('  ,, ')).toEqual([])
  })
})
