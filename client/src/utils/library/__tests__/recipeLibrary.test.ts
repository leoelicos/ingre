import searchLibrary, {
  PLACEHOLDER_PICTURE,
  catalogue,
  library,
  matchesSearch,
  toClientRecipe
} from '../recipeLibrary'
import { libIngredient } from '../../../test/fixtures'
import type { LibraryIngredient, LibraryRecipe } from '../../../types/library'

const ingredients: LibraryIngredient[] = [
  libIngredient({ id: 'rice', name: 'jasmine rice', category: 'pasta & rice' }),
  libIngredient({
    id: 'chicken',
    name: 'chicken thigh fillets',
    category: 'meat'
  })
]
const chickenRice: LibraryRecipe = {
  id: 'hainan-chicken-rice',
  name: 'Hainan chicken rice',
  portions: 4,
  ingredients: [
    { ingredientId: 'rice', quantity: 2, measure: 'cup' },
    { ingredientId: 'chicken', quantity: 800, measure: 'g' }
  ],
  method: ['Poach chicken', 'Cook rice in stock'],
  picture_url: 'http://pic.example/chicken-rice.jpg'
}
const salad: LibraryRecipe = {
  id: 'salad',
  name: 'Garden salad',
  portions: 2,
  ingredients: [{ ingredientId: 'missing', quantity: 1, measure: 'whole' }],
  method: []
}
const fixtures = [chickenRice, salad]

const firstBundledRecipe = (): LibraryRecipe => {
  const [first] = library
  if (!first) throw new Error('bundled library is empty')
  return first
}

describe('recipe library data', () => {
  it('every recipe ingredient references the catalogue', () => {
    const ids = new Set(catalogue.map((i) => i.id))
    for (const r of library) {
      for (const ri of r.ingredients)
        expect(ids.has(ri.ingredientId)).toBe(true)
      expect(r.portions).toBe(1)
    }
  })

  it('PO audit: rice in uncooked grams, tins in g/ml, a cook-the-rice step', () => {
    const uses = (recipeId: string, id: string) =>
      library
        .find((r) => r.id === recipeId)
        ?.ingredients.find((i) => i.ingredientId === id)
    expect(uses('egg-fried-rice', 'jasmine-rice')).toMatchObject({
      quantity: 75,
      measure: 'g'
    })
    expect(uses('butter-chicken', 'basmati-rice')).toMatchObject({
      quantity: 75,
      measure: 'g'
    })
    expect(
      library
        .flatMap((r) => r.ingredients)
        .some((i) => i.measure.endsWith(' tin'))
    ).toBe(false)
    expect(library.find((r) => r.id === 'egg-fried-rice')?.method[0]).toMatch(
      /cool for 10 minutes/
    )
    expect(library.find((r) => r.id === 'dahl')?.method[0]).toMatch(
      /250 ml water/
    )
    expect(
      library.find((r) => r.id === 'chicken-korma')?.method.join(' ')
    ).toMatch(/almond meal/)
    expect(
      library.flatMap((r) => r.method).some((m) => /ground almond/i.test(m))
    ).toBe(false)
  })

  it('flags salt, pepper, olive and vegetable oil as staples (not sesame oil)', () => {
    const staples = catalogue
      .filter((i) => i.staple)
      .map((i) => i.id)
      .sort()
    expect(staples).toEqual(
      ['black-pepper', 'olive-oil', 'salt', 'vegetable-oil'].sort()
    )
  })

  it('uses a known set of aisles', () => {
    const aisles = new Set(catalogue.map((i) => i.category))
    expect([...aisles].sort()).toEqual([
      'bakery',
      'baking',
      'breakfast & spreads',
      'canned food',
      'dairy & eggs',
      'deli',
      'fruit & veg',
      'herbs & spices',
      'international',
      'meat',
      'oils & vinegar',
      'pasta & rice',
      'sauces',
      'seafood',
      'tea & coffee'
    ])
  })

  it('merges the everyday extras with sized options and loose weights', () => {
    const byId = new Map(catalogue.map((i) => [i.id, i]))
    expect(catalogue).toHaveLength(111)

    expect(byId.get('apple')?.pantry).toBe('Bench')
    expect(byId.get('apple')?.approxGrams).toBe(185)
    expect(byId.get('hummus')?.sold).toEqual([
      { type: 'tub', size: { amount: 200, unit: 'g' } }
    ])
    expect(byId.get('bread-rolls')?.sold[0]?.label).toBe('6-pack')
    catalogue
      .filter((i) => i.sold.some((o) => o.type === 'each'))
      .forEach((i) => expect(i.approxGrams).toBeGreaterThan(0))
  })

  it('search ignores case and plurals', () => {
    const titles = (q: string) => searchLibrary({ q }).map((r) => r.name)
    for (const q of ['apple', 'Apples', 'apples'])
      expect(titles(q)).toEqual(['Pork chops with apples and onion'])
    expect(titles('tomatoes')).toEqual(titles('Tomato'))
    expect(titles('tomatoes').length).toBeGreaterThan(0)
    expect(titles('chillies')).toEqual(titles('CHILLI'))
    expect(titles('chillies').length).toBeGreaterThan(0)
  })

  it('has unique recipe and ingredient ids', () => {
    const rIds = library.map((r) => r.id)
    const iIds = catalogue.map((i) => i.id)
    expect(new Set(rIds).size).toBe(rIds.length)
    expect(new Set(iIds).size).toBe(iIds.length)
  })
})

describe('toClientRecipe', () => {
  it('resolves catalogue ingredients into the UI shape', () => {
    expect(toClientRecipe(chickenRice, ingredients)).toEqual({
      _id: undefined,
      name: 'Hainan chicken rice',
      portions: 4,
      picture_url: 'http://pic.example/chicken-rice.jpg',
      instructions: undefined,
      libraryId: 'hainan-chicken-rice',
      ingredients: [
        {
          _id: undefined,
          name: 'jasmine rice',
          quantity: 2,
          measure: 'cup',
          category: 'pasta & rice'
        },
        {
          _id: undefined,
          name: 'chicken thigh fillets',
          quantity: 800,
          measure: 'g',
          category: 'meat'
        }
      ]
    })
  })

  it('falls back for missing pictures and unknown ingredients', () => {
    const r = toClientRecipe(salad, ingredients)
    expect(r.picture_url).toBe(PLACEHOLDER_PICTURE)
    expect(r.ingredients[0]).toMatchObject({
      name: 'missing',
      category: 'other'
    })
  })

  it('uses the bundled catalogue by default', () => {
    const r = toClientRecipe(firstBundledRecipe())
    expect(r.ingredients[0]?.category).not.toBe('other')
  })
})

describe('matchesSearch / searchLibrary', () => {
  const names = (q: Parameters<typeof searchLibrary>[0]) =>
    searchLibrary(q, fixtures, ingredients).map((r) => r.name)

  it('returns everything for an empty search', () => {
    expect(names({})).toEqual(['Hainan chicken rice', 'Garden salad'])
    expect(names({ q: '   ' })).toHaveLength(2)
  })

  it('matches every query word against the name and ingredient names, not tags (#181)', () => {
    expect(names({ q: 'hainan' })).toEqual(['Hainan chicken rice'])
    expect(names({ q: 'jasmine' })).toEqual(['Hainan chicken rice'])
    expect(names({ q: 'garden' })).toEqual(['Garden salad'])
    expect(names({ q: 'vegetarian' })).toEqual([])
    expect(names({ q: 'chicken salad' })).toEqual([])
  })

  it('uses the bundled data by default', () => {
    expect(searchLibrary().length).toBe(library.length)
    expect(searchLibrary({ q: 'haloumi' }).map((r) => r.name)).toEqual([
      'Greek salad with haloumi'
    ])
    expect(matchesSearch(firstBundledRecipe(), { q: 'beef' })).toBe(true)
  })

  it('has no recipe tags in the data or the client shape (#181)', () => {
    for (const r of library) expect(Object.keys(r)).not.toContain('tags')
    expect(Object.keys(toClientRecipe(chickenRice, ingredients))).not.toContain(
      'tags'
    )
  })
})
