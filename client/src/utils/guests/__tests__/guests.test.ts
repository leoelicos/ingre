import {
  addGuest,
  conflictText,
  conflictsOf,
  flaggedIngredientIds,
  guestsCaption,
  linesAllergens,
  parseGuests,
  removeGuest,
  setAllergens
} from '../guests'
import type { Guest } from '../guests'

/* Acceptance for #209: guests declare allergens; ingredients and recipes are flagged for them, never silently changed. */

const SAM: Guest = { id: 'g1', name: 'Sam', allergens: ['tree nut (cashew)'] }
const KAI: Guest = { id: 'g2', name: 'Kai', allergens: ['milk', 'wheat'] }

describe('managing guests', () => {
  it('adds a named guest with no allergens, and ignores a blank name', () => {
    const added = addGuest([], '  Sam ', 'g1')
    expect(added).toEqual([{ id: 'g1', name: 'Sam', allergens: [] }])
    expect(addGuest(added, '   ', 'g2')).toBe(added)
  })

  it('removes a guest by id', () => {
    expect(removeGuest([SAM, KAI], 'g1')).toEqual([KAI])
  })

  it("sets a guest's allergens, kept in a fixed order, and drops unknown ones", () => {
    const set = setAllergens([KAI], 'g2', ['wheat', 'egg', 'pollen'])
    expect(set[0]?.allergens).toEqual(['egg', 'wheat'])
  })

  it('leaves the other guests alone', () => {
    expect(setAllergens([SAM, KAI], 'g2', ['egg'])[0]).toBe(SAM)
  })
})

describe('conflictsOf', () => {
  it('names each guest an ingredient is not safe for, and why', () => {
    expect(conflictsOf(['milk', 'soy'], [SAM, KAI])).toEqual([
      { guest: 'Kai', allergens: ['milk'] }
    ])
  })

  it('matches the way the catalogue writes it, in any case', () => {
    expect(conflictsOf(['Tree nut (Cashew)'], [SAM])).toEqual([
      { guest: 'Sam', allergens: ['tree nut (cashew)'] }
    ])
  })

  it('is empty with no guests or no allergens', () => {
    expect(conflictsOf(['milk'], [])).toEqual([])
    expect(conflictsOf([], [KAI])).toEqual([])
  })
})

describe('conflictText', () => {
  it("says who can't have what, in words", () => {
    expect(
      conflictText([
        { guest: 'Sam', allergens: ['tree nut (cashew)'] },
        { guest: 'Kai', allergens: ['milk', 'wheat'] }
      ])
    ).toBe("Sam can't have: tree nut (cashew); Kai can't have: milk, wheat")
    expect(conflictText([])).toBe('')
  })
})

describe('linesAllergens', () => {
  it("collects the lines' allergen tags, and nothing for free text", () => {
    expect(
      linesAllergens([
        { item: { allergens: ['milk'] } },
        { item: null },
        { item: { allergens: ['egg', 'milk'] } }
      ])
    ).toEqual(['milk', 'egg', 'milk'])
  })
})

describe('flaggedIngredientIds', () => {
  it('is the lines whose ingredient carries a declared allergen', () => {
    const lines = [
      { ingredientId: 'cream', item: { allergens: ['milk'] } },
      { ingredientId: 'carrot', item: { allergens: [] } },
      { ingredientId: 'mystery', item: null }
    ]
    expect([...flaggedIngredientIds(lines, [KAI])]).toEqual(['cream'])
    expect(flaggedIngredientIds(lines, []).size).toBe(0)
  })
})

describe('guestsCaption', () => {
  it('is the count, for the button', () => {
    expect(guestsCaption([])).toBe('Guests')
    expect(guestsCaption([SAM, KAI])).toBe('Guests (2)')
  })
})

describe('parseGuests', () => {
  it('reads what it wrote', () => {
    expect(parseGuests([SAM, KAI])).toEqual([SAM, KAI])
  })

  it('drops anything that is not a guest, and unknown allergens', () => {
    expect(parseGuests('x')).toBeNull()
    expect(parseGuests([{ id: 1 }])).toBeNull()
    expect(parseGuests([{ id: 'a', name: 'A', allergens: 'milk' }])).toBeNull()
    expect(
      parseGuests([{ id: 'a', name: 'A', allergens: ['milk', 'pollen'] }])
    ).toEqual([{ id: 'a', name: 'A', allergens: ['milk'] }])
  })
})
