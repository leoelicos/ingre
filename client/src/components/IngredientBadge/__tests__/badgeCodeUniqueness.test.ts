import { catalogue } from '../../../utils/library/recipeLibrary'
import {
  duplicateBadgeCodes,
  namesByCode,
  resolveBadgeCode
} from '../badgeCode'

/*
 * Colour can't be the only cue: two items in different sections with the same code
 * would look identical to anyone who can't tell the colours apart. So every catalogue
 * item must resolve to its own code, whatever its section.
 */
describe('badge code uniqueness', () => {
  it('gives every item in the real catalogue its own code, across all sections', () => {
    expect(duplicateBadgeCodes(catalogue)).toEqual([])
    expect(namesByCode(catalogue).size).toBe(catalogue.length)
  })

  it('reports a shared code with every item that shares it, even across sections', () => {
    const items = [
      { name: 'broccoli' },
      { name: 'tomato' },
      { name: 'bread rolls' },
      { name: 'beetroot', badgeCode: 'BRO' }
    ]
    expect(duplicateBadgeCodes(items)).toEqual([
      'BRO: broccoli, bread rolls, beetroot'
    ])
  })

  it('treats an override that equals another derived code as a clash', () => {
    expect(
      duplicateBadgeCodes([
        { name: 'lemon' },
        { name: 'lime', badgeCode: 'LEM' }
      ])
    ).toEqual(['LEM: lemon, lime'])
  })

  /** Product lead's overrides (#168) and the accessible-content reviewer's swaps (Batch 1). */
  const OVERRIDES: readonly (readonly [string, string])[] = [
    ['beef-mince', 'BEF'],
    ['pork-mince', 'PKM'],
    ['butter', 'BTR'],
    ['parmesan', 'PRM'],
    ['ginger', 'GNG'],
    ['carrot', 'CRT'],
    ['spring-onion', 'SPR'],
    ['spaghetti', 'SPG'],
    ['crushed-tomatoes', 'CCT'],
    ['potato', 'PTT'],
    ['baby-spinach', 'SPI'],
    ['cooked-prawns', 'CPW'],
    ['lemongrass', 'LGR'],
    ['fresh-mint', 'MNT'],
    ['bean-sprouts', 'BSP'],
    ['apple', 'APL'],
    ['banana', 'BNA'],
    ['mandarin', 'MDN'],
    ['pear', 'PRA'],
    ['lemon', 'LEM'],
    ['watermelon', 'WML'],
    ['broccoli', 'BRC'],
    ['full-cream-milk', 'FCM'],
    ['sliced-ham', 'HAM'],
    ['hummus', 'HUS'],
    ['chicken-breast', 'CKB'],
    ['bacon', 'BCN'],
    ['white-bread', 'WHB'],
    ['wholemeal-bread', 'WMB'],
    ['bread-rolls', 'BRL'],
    ['breakfast-cereal', 'CRL'],
    ['tea-bags', 'TEA']
  ]

  it('uses exactly the overrides product and the content reviewer chose', () => {
    const codeOf = (id: string): string =>
      resolveBadgeCode(
        catalogue.find((item) => item.id === id) ?? { name: `missing ${id}` }
      )
    expect(OVERRIDES.map(([id]) => [id, codeOf(id)])).toEqual(OVERRIDES)
    expect(
      catalogue
        .filter((item) => item.badgeCode !== undefined)
        .map((item) => item.id)
        .sort()
    ).toEqual(OVERRIDES.map(([id]) => id).sort())
  })
})
