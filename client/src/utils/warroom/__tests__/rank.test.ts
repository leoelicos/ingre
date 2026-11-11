import type { HistoryEntry } from '../history'
import {
  ALL_TILES,
  EVERYDAY,
  PER_ADD,
  commonness,
  countsOf,
  matchTier,
  ofKind,
  searchTiles,
  wallOrder
} from '../rank'

const added = (...ids: string[]): HistoryEntry[] =>
  ids.map((itemId, i) => ({ id: `h${i}`, itemId, quantity: 1, at: 1000 - i }))

const ingredients = ALL_TILES.flatMap((tile) =>
  tile.kind === 'ingredient' ? [tile] : []
)

describe('commonness (the documented signal)', () => {
  it('puts best-sellers first and never outweighs one past add', () => {
    ingredients.forEach(({ item }) =>
      expect(commonness(item)).toBeLessThan(PER_ADD)
    )
    const banana = ingredients.find(({ id }) => id === 'banana')
    expect(EVERYDAY.has('banana')).toBe(true)
    const spinach = ingredients.find(({ id }) => id === 'baby-spinach')
    expect(commonness(banana!.item)).toBeGreaterThan(commonness(spinach!.item))
  })
})

describe('matchTier', () => {
  it('ranks name starts, then word starts, then insides', () => {
    expect(matchTier('Banana', 'ba')).toBe(0)
    expect(matchTier('Tea bags', 'ba')).toBe(1)
    expect(matchTier('Lebanese cucumber', 'ban')).toBe(2)
    expect(matchTier('Carrot', 'xy')).toBe(3)
  })

  it('folds plurals only from three letters', () => {
    expect(matchTier('Eggs', 'es')).toBe(3)
    expect(matchTier('Tomatoes', 'tomato')).toBe(0)
  })
})

describe('searchTiles', () => {
  it('"ba" puts Banana first for a new user', () => {
    expect(searchTiles('ba', [])[0]?.id).toBe('banana')
    expect(searchTiles('  Ba ', [])[0]?.id).toBe('banana')
  })

  it('two letters give word starts only', () => {
    const names = searchTiles('ba', []).map(({ name }) => name.toLowerCase())
    names.forEach((name) => expect(name).toMatch(/(^|[^a-z])ba/))
  })

  it('what this person adds wins a tie', () => {
    expect(
      searchTiles('ba', added('baby-spinach', 'baby-spinach'))[0]?.id
    ).toBe('baby-spinach')
  })

  it('forgives a typo from three letters when little matches', () => {
    expect(searchTiles('bananna', []).map(({ id }) => id)).toContain('banana')
    expect(searchTiles('', [])).toEqual([])
  })

  /*
   * t32u report: every two-letter prefix that matches anything, and how many tiles it shows.
   * One phone screen with the keyboard up holds about 12-16; "ch" (the chicken family) is the
   * one known outlier and is pinned here so a new one gets noticed.
   */
  it('every two-letter shortlist fits one screen (report)', () => {
    const letters = 'abcdefghijklmnopqrstuvwxyz'
    const sizes = [...letters]
      .flatMap((a) => [...letters].map((b) => a + b))
      .map((prefix) => ({ prefix, size: searchTiles(prefix, []).length }))
      .filter(({ size }) => size > 0)
      .sort((a, b) => b.size - a.size || a.prefix.localeCompare(b.prefix))
    const worst = sizes
      .slice(0, 8)
      .map(({ prefix, size }) => `${prefix} ${size}`)
    console.info(
      `two-letter prefixes with results: ${sizes.length}; worst: ${worst.join(
        ', '
      )}`
    )
    expect(
      sizes.filter(({ size }) => size > 16).map(({ prefix }) => prefix)
    ).toEqual(['ch'])
    expect(sizes.filter(({ size }) => size > 12).length).toBeLessThanOrEqual(3)
  })
})

describe('wallOrder', () => {
  it('fills the first screen with last shop, then everyday lines', () => {
    const { likely, rest } = wallOrder(added('coffee', 'honey'), 24)
    expect(likely).toHaveLength(24)
    expect(
      likely
        .slice(0, 2)
        .map(({ id }) => id)
        .sort()
    ).toEqual(['coffee', 'honey'])
    expect(likely.map(({ id }) => id)).toContain('banana')
    expect(likely.length + rest.length).toBe(ALL_TILES.length)
    expect(rest[0]?.kind).toBe('recipe')
  })

  it('counts adds per item', () => {
    expect(countsOf(added('egg', 'egg', 'milk')).get('egg')).toBe(2)
  })
})

describe('ofKind', () => {
  it('filters by the toggle', () => {
    expect(ofKind(ALL_TILES, 'both')).toHaveLength(ALL_TILES.length)
    expect(
      ofKind(ALL_TILES, 'recipes').every(({ kind }) => kind === 'recipe')
    ).toBe(true)
    expect(
      ofKind(ALL_TILES, 'ingredients').every(
        ({ kind }) => kind === 'ingredient'
      )
    ).toBe(true)
  })
})
