import {
  EXTRA_SCOPE,
  chipCategoryId,
  chipChevronId,
  chipPanelId,
  chipToggleId,
  confirmYesId,
  extraAmount,
  rowScope,
  sourceFieldId
} from '../chipText'
import type { ShopSection } from '../../../utils/shopping/sections'
import { groupHeadingId } from '../Chips'

const dairy: ShopSection = 'Dairy, Eggs & Fridge'

describe('chip ids (#182)', () => {
  it('are scoped to Ingredients unless another scope is given', () => {
    expect(chipToggleId('a')).toBe('chip-a')
    expect(chipChevronId('a')).toBe('chip-a-more')
    expect(chipPanelId('a')).toBe('chip-a-panel')
    expect(chipCategoryId('a')).toBe('chip-a-category')
    expect(sourceFieldId('a', 'extra')).toBe('chip-a-source-extra')
    expect(confirmYesId('a')).toBe('chip-a-yes')
    expect(groupHeadingId(dairy)).toBe('chips-dairy-eggs-fridge')
    const row = rowScope('dahl')
    expect(chipToggleId('a', row)).toBe('row-dahl-a')
    expect(chipChevronId('a', EXTRA_SCOPE)).toBe('extra-a-more')
    expect(chipPanelId('a', row)).toBe('row-dahl-a-panel')
    expect(chipCategoryId('a', EXTRA_SCOPE)).toBe('extra-a-category')
    expect(sourceFieldId('a', 'dahl', row)).toBe('row-dahl-a-source-dahl')
    expect(confirmYesId('a', row)).toBe('row-dahl-a-yes')
    expect(groupHeadingId(dairy, EXTRA_SCOPE)).toBe('extras-dairy-eggs-fridge')
  })

  it('shows 0 for a chip with no Extra amount', () => {
    expect(extraAmount({ extra: null, unit: 'g', item: null })).toBe('0 g')
  })
})
