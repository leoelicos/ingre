import { itemById, recipeById } from '../../../test/library'
import type { LibraryRecipe } from '../../../types/library'
import { library } from '../../library/recipeLibrary'
import type { MenuInfo, MenuTable } from '../menu'
import {
  MAX_PER_COURSE,
  MENUS,
  UNDESCRIBED,
  clashOf,
  clashWith,
  composeMenu,
  dessertClash,
  infoOf,
  parseMenus,
  sharedProtein,
  starterClash,
  suggestionsFor
} from '../menu'

/* #219 Composed menus: starter, main and dessert that suit each other, with wine. */

const info = (over: Partial<MenuInfo>): MenuInfo => ({
  ...UNDESCRIBED,
  ...over
})
const light = info({ course: 'starter', weight: 'light' })
const rich = info({ weight: 'rich' })
const names = (recipes: readonly LibraryRecipe[]) => recipes.map((r) => r.name)
const named = (id: string, name: string): LibraryRecipe => ({
  ...recipeById('dahl'),
  id,
  name
})

describe('the bundled menu data', () => {
  it('describes every library recipe: course, weight and a wine', () => {
    for (const recipe of library) {
      expect(MENUS.has(recipe.id)).toBe(true)
      expect(infoOf(recipe.id).wine?.name).toBeTruthy()
    }
  })

  it('names only recipes that exist', () => {
    for (const id of MENUS.keys())
      expect(library.some((r) => r.id === id)).toBe(true)
  })

  it('has starters and mains, and no recipe described as a main is also a starter', () => {
    const courses = new Set([...MENUS.values()].map((m) => m.course))
    expect(courses).toEqual(new Set(['starter', 'main']))
  })

  it('uses real catalogue items for the proteins it names', () => {
    expect(itemById('pork-belly').name).toBeTruthy()
  })

  it('treats a recipe nobody described as a medium main with no wine', () => {
    expect(infoOf('not-in-the-file')).toBe(UNDESCRIBED)
    expect(UNDESCRIBED).toMatchObject({
      course: 'main',
      weight: 'medium',
      wine: null
    })
  })
})

describe('parseMenus', () => {
  const good = {
    recipes: {
      a: {
        course: 'main',
        weight: 'light',
        proteins: ['egg'],
        wine: { name: 'Riesling', why: 'Crisp.' }
      }
    }
  }
  it('reads a valid file', () => {
    expect(parseMenus(good).get('a')).toEqual({
      course: 'main',
      weight: 'light',
      proteins: ['egg'],
      wine: { name: 'Riesling', why: 'Crisp.' }
    })
  })

  it.each([
    ['not an object', 'x', /expected an object/],
    ['no recipes', {}, /"recipes" object/],
    ['recipe not an object', { recipes: { a: 1 } }, /a must be an object/],
    [
      'bad course',
      { recipes: { a: { ...good.recipes.a, course: 'side' } } },
      /a.course must be one of starter, main, dessert/
    ],
    [
      'bad weight',
      { recipes: { a: { ...good.recipes.a, weight: 'heavy' } } },
      /a.weight/
    ],
    [
      'proteins not a list',
      { recipes: { a: { ...good.recipes.a, proteins: 'egg' } } },
      /a.proteins must be a list/
    ],
    [
      'blank protein',
      { recipes: { a: { ...good.recipes.a, proteins: [' '] } } },
      /a.proteins\[0\]/
    ],
    [
      'wine not an object',
      { recipes: { a: { ...good.recipes.a, wine: 'red' } } },
      /a.wine must be an object/
    ],
    [
      'wine without a reason',
      { recipes: { a: { ...good.recipes.a, wine: { name: 'Riesling' } } } },
      /a.wine.why/
    ]
  ])('rejects %s', (_label, data, message) => {
    expect(() => parseMenus(data)).toThrow(message)
  })
})

describe('the rules', () => {
  it('a starter must not repeat a protein of the main', () => {
    const pork = info({ proteins: ['pork'] })
    expect(sharedProtein(pork, info({ proteins: ['beef', 'pork'] }))).toBe(true)
    expect(sharedProtein(pork, info({ proteins: ['beef'] }))).toBe(false)
    expect(starterClash({ ...light, proteins: ['pork'] }, pork)).toBe('protein')
  })

  it('a starter is no heavier than the main, and never rich', () => {
    expect(starterClash(light, rich)).toBeNull()
    expect(starterClash(light, info({ weight: 'light' }))).toBeNull()
    expect(
      starterClash(info({ weight: 'medium' }), info({ weight: 'light' }))
    ).toBe('heavy')
    expect(starterClash(info({ weight: 'rich' }), rich)).toBe('heavy')
  })

  it('a dessert after a rich main must be light; after a light main anything goes', () => {
    const dessert = (weight: MenuInfo['weight']) =>
      info({ course: 'dessert', weight })
    expect(dessertClash(dessert('light'), rich)).toBeNull()
    expect(dessertClash(dessert('medium'), rich)).toBe('heavy')
    expect(
      dessertClash(dessert('medium'), info({ weight: 'medium' }))
    ).toBeNull()
    expect(dessertClash(dessert('rich'), info({ weight: 'light' }))).toBeNull()
    expect(dessertClash(dessert('rich'), info({ weight: 'medium' }))).toBe(
      'heavy'
    )
  })

  it("chooses the rule by the recipe's course; a main clashes with nothing", () => {
    expect(clashWith('main', rich, rich)).toBeNull()
    expect(
      clashWith(
        'starter',
        { ...light, proteins: ['x'] },
        info({ proteins: ['x'] })
      )
    ).toBe('protein')
    expect(clashWith('dessert', info({ weight: 'rich' }), rich)).toBe('heavy')
  })
})

describe('suggestionsFor', () => {
  const butterChicken = infoOf('butter-chicken')
  const porkChops = infoOf('pork-chops-apple-onion')

  it('suggests every starter that suits a chicken main, by name', () => {
    expect(names(suggestionsFor('starter', [butterChicken], library))).toEqual([
      'Greek salad with haloumi',
      'Prawn and pork rice paper rolls (gỏi cuốn)',
      'San choy bau'
    ])
  })

  it("leaves out starters that repeat the main's pork", () => {
    expect(names(suggestionsFor('starter', [porkChops], library))).toEqual([
      'Greek salad with haloumi'
    ])
  })

  it('must suit every main on the menu', () => {
    expect(
      names(suggestionsFor('starter', [butterChicken, porkChops], library))
    ).toEqual(['Greek salad with haloumi'])
  })

  it('has no dessert in the library yet', () => {
    expect(suggestionsFor('dessert', [butterChicken], library)).toEqual([])
  })

  it('suggests a dessert that suits the main, lightest first', () => {
    const table: MenuTable = new Map([
      ['d1', info({ course: 'dessert', weight: 'medium' })],
      ['d2', info({ course: 'dessert', weight: 'light' })],
      ['d3', info({ course: 'dessert', weight: 'rich' })]
    ])
    const desserts = ['d1', 'd2', 'd3'].map((id) => named(id, `Dessert ${id}`))
    const after = (weight: MenuInfo['weight']) =>
      names(suggestionsFor('dessert', [info({ weight })], desserts, table))
    expect(after('rich')).toEqual(['Dessert d2'])
    expect(after('medium')).toEqual(['Dessert d2', 'Dessert d1'])
    expect(after('light')).toEqual(['Dessert d2', 'Dessert d1', 'Dessert d3'])
  })

  it('shows at most three', () => {
    const table: MenuTable = new Map(
      ['a', 'b', 'c', 'd'].map((id) => [
        id,
        info({ course: 'dessert', weight: 'light' })
      ])
    )
    const desserts = ['a', 'b', 'c', 'd'].map((id) =>
      named(id, `Dessert ${id}`)
    )
    expect(suggestionsFor('dessert', [rich], desserts, table)).toHaveLength(
      MAX_PER_COURSE
    )
  })
})

describe('composeMenu', () => {
  const dahl = recipeById('dahl')
  const chicken = recipeById('butter-chicken')
  const greek = recipeById('greek-salad-haloumi')

  it('has nothing to build around until a main is picked', () => {
    expect(composeMenu([])).toMatchObject({ anchored: false })
    expect(composeMenu([greek]).anchored).toBe(false)
    expect(
      composeMenu([greek]).rows.every((row) => row.suggestions.length === 0)
    ).toBe(true)
  })

  it('lists the courses in order with the picked recipes', () => {
    const menu = composeMenu([chicken, greek])
    expect(menu.anchored).toBe(true)
    expect(menu.rows.map((row) => row.course)).toEqual([
      'starter',
      'main',
      'dessert'
    ])
    expect(names(menu.rows[0]?.picked ?? [])).toEqual([
      'Greek salad with haloumi'
    ])
    expect(names(menu.rows[1]?.picked ?? [])).toEqual(['Butter chicken'])
  })

  it('suggests only for a course that has nothing picked, never for the main', () => {
    const menu = composeMenu([dahl])
    expect(menu.rows[0]?.suggestions.length).toBe(MAX_PER_COURSE)
    expect(menu.rows[1]?.suggestions).toEqual([])
    expect(composeMenu([chicken, greek]).rows[0]?.suggestions).toEqual([])
  })
})

describe('clashOf', () => {
  it('names the main a picked starter does not suit, and why', () => {
    const sanChoy = recipeById('san-choy-bau')
    const chops = recipeById('pork-chops-apple-onion')
    expect(clashOf(sanChoy, [chops])).toEqual({ main: chops, clash: 'protein' })
    expect(clashOf(sanChoy, [recipeById('dahl')])).toBeNull()
    expect(clashOf(sanChoy, [])).toBeNull()
  })
})
