import { matchCatalogue } from '../catalogueMatch'
import { normaliseTerm } from '../searchTerms'
import { catalogue } from '../recipeLibrary'
import { libIngredient } from '../../../test/fixtures'

const items = [
  libIngredient({ id: 'apple', name: 'apples' }),
  libIngredient({ id: 'tomato', name: 'tomato' }),
  libIngredient({ id: 'feta', name: 'feta' })
]

describe('matchCatalogue', () => {
  it('matches a catalogue name exactly', () => {
    expect(matchCatalogue('feta', items)).toEqual({
      kind: 'matched',
      item: items[2]
    })
  })

  it('allows simple plurals both ways', () => {
    expect(matchCatalogue('apple', items)).toMatchObject({
      item: { id: 'apple' }
    })
    expect(matchCatalogue('tomatoes', items)).toMatchObject({
      item: { id: 'tomato' }
    })
  })

  it('ignores case and surrounding space', () => {
    expect(matchCatalogue('  APPLES ', items)).toMatchObject({
      kind: 'matched',
      item: { id: 'apple' }
    })
  })

  it('returns the trimmed text when nothing matches', () => {
    expect(matchCatalogue('  zzz qq ', items)).toEqual({
      kind: 'unmatched',
      text: 'zzz qq'
    })
  })

  it('finds apples in the real catalogue', () => {
    expect(matchCatalogue('apples', catalogue)).toMatchObject({
      item: { id: 'apple', name: 'apples' }
    })
  })
})

describe('normaliseTerm', () => {
  it('lowercases, trims and singularises every word, irregulars included', () => {
    expect(normaliseTerm('  Red  Chillies ')).toBe('red chilli')
    expect(normaliseTerm('TOMATOES')).toBe('tomato')
    expect(normaliseTerm('Apples')).toBe('apple')
    expect(normaliseTerm('hummus lemongrass')).toBe('hummus lemongrass')
    expect(normaliseTerm('   ')).toBe('')
  })
})
