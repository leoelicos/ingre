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

  it('uses the overrides product chose for items whose derived codes clashed', () => {
    const codeOf = (id: string): string =>
      resolveBadgeCode(
        catalogue.find((item) => item.id === id) ?? { name: `missing ${id}` }
      )
    expect(
      [
        'baby-spinach',
        'bean-sprouts',
        'lemongrass',
        'lemon',
        'white-bread',
        'wholemeal-bread',
        'broccoli',
        'bread-rolls',
        'fresh-mint',
        'full-cream-milk',
        'beef-mince'
      ].map(codeOf)
    ).toEqual([
      'SPI',
      'BSP',
      'LGR',
      'LEM',
      'WHB',
      'WMB',
      'BRC',
      'BRO',
      'MNT',
      'MLK',
      'BEF'
    ])
  })
})
