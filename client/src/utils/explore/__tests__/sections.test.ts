import { libIngredient } from '../../../test/fixtures'
import { catalogue } from '../../library/recipeLibrary'
import {
  EXPLORE_SECTIONS,
  SECTION_ACCENT,
  SECTION_TONE,
  exploreSectionOf,
  inSections,
  sectionsOf
} from '../sections'

const item = (id: string) => {
  const found = catalogue.find((i) => i.id === id)
  if (found === undefined) throw new Error(`no ${id}`)
  return found
}

describe('Explore sections (#226)', () => {
  it('colours vegetables green, fruit orange, meat pink and seafood blue', () => {
    expect(SECTION_TONE.vegetables).toBe('produce')
    expect(SECTION_TONE.fruit).toBe('fruit')
    expect(SECTION_TONE.meat).toBe('meat')
    expect(SECTION_TONE.seafood).toBe('seafood')
  })

  it('splits fruit from vegetables, and seafood from meat', () => {
    expect(exploreSectionOf(item('carrot'))).toBe('vegetables')
    expect(exploreSectionOf(item('fresh-mint'))).toBe('vegetables')
    expect(exploreSectionOf(item('banana'))).toBe('fruit')
    expect(exploreSectionOf(item('lime'))).toBe('fruit')
    expect(exploreSectionOf(item('beef-mince'))).toBe('meat')
    expect(exploreSectionOf(item('cooked-prawns'))).toBe('seafood')
  })

  it('keeps the shop sections for everything else', () => {
    expect(exploreSectionOf(item('butter'))).toBe('dairy')
    expect(exploreSectionOf(item('sliced-ham'))).toBe('deli')
    expect(exploreSectionOf(item('white-bread'))).toBe('bakery')
    expect(exploreSectionOf(item('salt'))).toBe('pantry')
    expect(exploreSectionOf(libIngredient({ category: 'fruit & veg' }))).toBe(
      'vegetables'
    )
  })

  it('puts every catalogue ingredient in a listed section with a tone and an accent', () => {
    catalogue.forEach((i) => {
      const section = exploreSectionOf(i)
      expect(EXPLORE_SECTIONS).toContain(section)
      expect(SECTION_ACCENT[section]).toMatch(/^border-badge-[a-z]+-ink$/)
    })
    EXPLORE_SECTIONS.forEach((section) =>
      expect(SECTION_ACCENT[section]).toBe(
        `border-badge-${SECTION_TONE[section]}-ink`
      )
    )
  })

  it('lists the sections present, in the filter order', () => {
    expect(
      sectionsOf([item('banana'), item('beef-mince'), item('carrot')])
    ).toEqual(['vegetables', 'fruit', 'meat'])
  })

  it('filters to the chosen sections, and to everything when none apply', () => {
    const items = [item('banana'), item('beef-mince'), item('carrot')]
    expect(inSections(items, new Set(['fruit'])).map((i) => i.id)).toEqual([
      'banana'
    ])
    expect(
      inSections(items, new Set(['fruit', 'meat'])).map((i) => i.id)
    ).toEqual(['banana', 'beef-mince'])
    expect(inSections(items, new Set()).map((i) => i.id)).toHaveLength(3)
    expect(
      inSections(items, new Set(['seafood'])).map((i) => i.id)
    ).toHaveLength(3)
  })
})
