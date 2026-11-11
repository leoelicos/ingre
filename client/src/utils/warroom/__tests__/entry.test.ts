import { catalogue } from '../../library/recipeLibrary'
import { completed, isList, lineParts, listLines } from '../entry'

/* t26u rapid entry: suggestions follow the last part of the line; pasted lists go in line by line. */

const item = (id: string) => {
  const found = catalogue.find((i) => i.id === id)
  if (found === undefined) throw new Error(id)
  return found
}

describe('lineParts: the part being typed now', () => {
  it('is everything after the last comma, semicolon, new line or "and"', () => {
    expect(lineParts('2 carrots, oni')).toEqual({
      head: '2 carrots,',
      tail: ' oni'
    })
    expect(lineParts('carrot and gar')).toEqual({
      head: 'carrot and',
      tail: ' gar'
    })
    expect(lineParts('milk\nbr')).toEqual({ head: 'milk\n', tail: 'br' })
    expect(lineParts('onion')).toEqual({ head: '', tail: 'onion' })
  })

  it('does not split inside a word that holds "and"', () => {
    expect(lineParts('candle')).toEqual({ head: '', tail: 'candle' })
  })
})

describe('completed: Tab fills in the highlighted name', () => {
  it('keeps what came before and the quantity', () => {
    expect(completed('2 car', item('carrot'))).toBe('2 carrot')
    expect(completed('carrot, 2 tins of chi', item('chickpeas'))).toBe(
      'carrot, 2 tins of chickpeas'
    )
    expect(completed('milk\nbr', item('broccoli'))).toBe('milk\nbroccoli')
    expect(completed('carrot, ', item('onion'))).toBe('carrot, brown onion')
  })

  it('does not keep "a" as a quantity when it is the start of the name', () => {
    expect(completed('a', item('avocado'))).toBe('avocado')
  })
})

describe('pasted lists', () => {
  it('is a list when it has more than one line', () => {
    expect(isList('milk\neggs')).toBe(true)
    expect(isList('milk\n')).toBe(false)
    expect(isList('milk')).toBe(false)
  })

  it('drops bullets, checkboxes, numbering and blank lines', () => {
    expect(
      listLines(
        '- milk\r\n* [ ] 2 eggs\n\n3. garlic\n• [x] honey\n☐ jam\n1) bread'
      )
    ).toBe('milk\n2 eggs\ngarlic\nhoney\njam\nbread')
    expect(listLines('1.5 kg potatoes\n2 eggs')).toBe('1.5 kg potatoes\n2 eggs')
  })
})
