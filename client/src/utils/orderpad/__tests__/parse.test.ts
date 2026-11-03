import { parseConstraint } from '../parse'

describe('parseConstraint (#233)', () => {
  it.each([
    ['portion for 3', 3],
    ['Portions for 4', 4],
    ['  a   portion  for 2 ', 2],
    ['for 5', 5],
    ['serves 6', 6],
    ['3 portions', 3],
    ['1 serving', 1]
  ])('reads %s as portions', (text, portions) => {
    expect(parseConstraint(text)).toEqual({ kind: 'portions', portions })
  })

  it.each([
    ['at most 1 kg carrots', 'atMost', 1000, 'g', 'carrots'],
    ['At most 500g of flour', 'atMost', 500, 'g', 'flour'],
    ['no more than 2 litres milk', 'atMost', 2000, 'ml', 'milk'],
    ['up to 250 ml cream', 'atMost', 250, 'ml', 'cream'],
    ['max 1.5 kilos potatoes', 'atMost', 1500, 'g', 'potatoes'],
    ['at least 300 g red lentils', 'atLeast', 300, 'g', 'red lentils'],
    ['min 2 eggs', 'atLeast', 2, 'count', 'eggs'],
    ['at most 3 red onions', 'atMost', 3, 'count', 'red onions'],
    ['at least 2 of carrots', 'atLeast', 2, 'count', 'carrots']
  ])('reads %s', (text, bound, amount, unit, ingredient) => {
    expect(parseConstraint(text)).toEqual({
      kind: 'bound',
      bound,
      amount,
      unit,
      ingredient
    })
  })

  it.each([
    [''],
    ['lots of carrots'],
    ['at most carrots'],
    ['at most 3'],
    ['at most 3 kg'],
    ['portion for three']
  ])('does not read %j', (text) => {
    expect(parseConstraint(text)).toBeNull()
  })
})
