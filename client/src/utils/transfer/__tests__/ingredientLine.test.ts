import { catalogue } from '../../library/recipeLibrary'
import {
  findItem,
  parseIngredientLine,
  parseNumber,
  splitLine
} from '../ingredientLine'

describe('parseNumber (#230)', () => {
  it.each([
    ['2', 2],
    ['0.5', 0.5],
    ['1/2', 0.5],
    ['1 1/2', 1.5],
    ['½', 0.5],
    ['1½', 1.5],
    ['¾', 0.75]
  ])('reads %s', (text, expected) => expect(parseNumber(text)).toBe(expected))

  it.each(['', 'abc', '1/0', 'x 1/2', '1 x', '1x½'])('rejects "%s"', (text) =>
    expect(parseNumber(text)).toBeNull()
  )
})

describe('splitLine (#230)', () => {
  it('reads quantity, unit and name', () =>
    expect(splitLine('200 g red lentils')).toEqual({
      quantity: 200,
      measure: 'g',
      name: 'red lentils'
    }))

  it('reads a unit stuck to the number and plural unit words', () => {
    expect(splitLine('400g crushed tomatoes').measure).toBe('g')
    expect(splitLine('2 Tablespoons olive oil')).toEqual({
      quantity: 2,
      measure: 'tbsp',
      name: 'olive oil'
    })
    expect(splitLine('2 tsp. salt').measure).toBe('tsp')
  })

  it('converts kilograms and litres', () => {
    expect(splitLine('1.5 kg chicken breast')).toMatchObject({
      quantity: 1500,
      measure: 'g'
    })
    expect(splitLine('1 litre stock')).toMatchObject({
      quantity: 1000,
      measure: 'ml'
    })
  })

  it('means one when there is no quantity and whole items when there is no unit', () =>
    expect(splitLine('brown onion')).toEqual({
      quantity: 1,
      measure: 'whole',
      name: 'brown onion'
    }))

  it('drops "of" and notes after a comma or bracket', () => {
    expect(splitLine('1 cup of plain flour, sifted').name).toBe('plain flour')
    expect(splitLine('2 cloves garlic (crushed)').name).toBe('garlic')
  })

  it('reads fractions as quantities', () =>
    expect(splitLine('1 1/2 cups plain flour').quantity).toBe(1.5))
})

describe('findItem (#230)', () => {
  const id = (name: string) => findItem(name, catalogue)?.id

  it('prefers the item of exactly that name, singular or plural', () => {
    expect(id('tomatoes')).toBe('tomato')
    expect(id('Tomato')).toBe('tomato')
  })

  it('then the shortest item with all the words', () => {
    expect(id('crushed tomatoes')).toBe('crushed-tomatoes')
    expect(id('lentils')).toBe('red-lentils')
    expect(id('onion')).toBe('red-onion')
  })

  it('then the longest item name inside the text', () => {
    expect(id('sea salt')).toBe('salt')
  })

  it('finds nothing for an empty or unknown name', () => {
    expect(id('')).toBeUndefined()
    expect(id('unicorn dust')).toBeUndefined()
  })
})

describe('parseIngredientLine (#230)', () => {
  it('maps a line to a catalogue id with its quantity and measure', () =>
    expect(parseIngredientLine('200 g red lentils', catalogue)).toEqual({
      ingredientId: 'red-lentils',
      quantity: 200,
      measure: 'g'
    }))

  it('keeps a measure the item can convert', () =>
    expect(parseIngredientLine('2 cloves garlic', catalogue)).toEqual({
      ingredientId: 'garlic',
      quantity: 2,
      measure: 'clove'
    }))

  it('turns a measure the item cannot convert into whole items', () =>
    expect(parseIngredientLine('2 stalks olive oil', catalogue)).toEqual({
      ingredientId: 'olive-oil',
      quantity: 2,
      measure: 'whole'
    }))

  it('is null for something the catalogue does not have', () =>
    expect(parseIngredientLine('3 unicorn horns', catalogue)).toBeNull())
})
