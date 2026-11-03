import { recipeById } from '../../../test/library'
import { newCopy } from '../../balance/copies'
import { buildBalances, buildChips } from '../../chips/chips'
import { copyEntries } from '../../chips/useChips'
import { EMPTY_LAYOUT } from '../../storage/shoppingState'
import { catalogue } from '../../library/recipeLibrary'
import { CSV_HEADER, csvField, shoppingListCsv } from '../csv'

describe('CSV export (#230)', () => {
  it('quotes fields with commas, quotes and line breaks', () => {
    expect(csvField('plain')).toBe('plain')
    expect(csvField('a, b')).toBe('"a, b"')
    expect(csvField('say "hi"')).toBe('"say ""hi"""')
    expect(csvField('a\nb')).toBe('"a\nb"')
  })

  it('defuses spreadsheet formulas', () => {
    expect(csvField('=SUM(A1)')).toBe("'=SUM(A1)")
    expect(csvField('@x')).toBe("'@x")
  })

  it('is just the header for an empty list', () =>
    expect(shoppingListCsv([])).toBe(CSV_HEADER))

  const chips = buildChips(
    buildBalances(
      copyEntries([newCopy(recipeById('dahl').id)]),
      [
        { id: 'free-1', name: 'candles, tall', ingredientId: null, quantity: 2 }
      ],
      catalogue
    ),
    { edits: {}, layout: EMPTY_LAYOUT, crossedIds: new Set() }
  )

  it('has a row per wanted item: name, amount, shop section', () => {
    const lines = shoppingListCsv(chips).split('\r\n')
    expect(lines[0]).toBe(CSV_HEADER)
    expect(lines).toHaveLength(chips.length + 1)
    expect(lines).toContain('red lentils,150 g,Pantry')
    expect(
      lines.some((line) => line.startsWith('"candles, tall",2 items,Other'))
    ).toBe(true)
  })

  it('leaves out greyed items', () => {
    const [first, ...rest] = chips
    if (first === undefined) throw new Error('no chips')
    const lines = shoppingListCsv([{ ...first, greyed: true }, ...rest])
    expect(lines.split('\r\n')).toHaveLength(chips.length)
  })
})
