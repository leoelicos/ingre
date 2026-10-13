import searchLibrary, {
  PLACEHOLDER_PICTURE,
  getLibraryTags,
  matchesSearch,
  toClientRecipe
} from '../recipeLibrary'
import ingredientData from '../../../data/ingredients.json'
import recipeData from '../../../data/recipes.json'
import type { LibraryIngredient, LibraryRecipe } from '../../../types/library'

const ingredients: LibraryIngredient[] = [
  { id: 'rice', name: 'jasmine rice', category: 'pasta & rice' },
  { id: 'chicken', name: 'chicken thigh fillets', category: 'meat' }
]
const chickenRice: LibraryRecipe = {
  id: 'hainan-chicken-rice',
  name: 'Hainan chicken rice',
  portions: 4,
  tags: ['Chinese', 'Malaysian', 'Singaporean', 'dinner'],
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
  tags: ['vegetarian'],
  ingredients: [{ ingredientId: 'missing', quantity: 1, measure: 'whole' }],
  method: []
}
const fixtures = [chickenRice, salad]

describe('recipe library data', () => {
  it('every recipe ingredient references the catalogue', () => {
    const ids = new Set(ingredientData.ingredients.map((i) => i.id))
    for (const r of recipeData.recipes) {
      for (const ri of r.ingredients)
        expect(ids.has(ri.ingredientId)).toBe(true)
      expect(r.tags.length).toBeGreaterThan(0)
    }
  })

  it('flags salt and cooking oils as staples and nothing else', () => {
    const staples = ingredientData.ingredients
      .filter((i: LibraryIngredient) => i.staple)
      .map((i) => i.id)
      .sort()
    expect(staples).toEqual(
      [
        'black-pepper',
        'olive-oil',
        'salt',
        'sesame-oil',
        'vegetable-oil'
      ].sort()
    )
  })

  it('uses a known set of aisle categories', () => {
    const aisles = new Set(ingredientData.ingredients.map((i) => i.category))
    expect([...aisles].sort()).toEqual([
      'baking',
      'canned food',
      'dairy & eggs',
      'frozen',
      'fruit & veg',
      'herbs & spices',
      'international',
      'meat',
      'oils & vinegar',
      'pasta & rice',
      'sauces'
    ])
  })

  it('has unique recipe and ingredient ids', () => {
    const rIds = recipeData.recipes.map((r) => r.id)
    const iIds = ingredientData.ingredients.map((i) => i.id)
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
    const r = toClientRecipe(recipeData.recipes[0])
    expect(r.ingredients[0].category).not.toBe('other')
  })
})

describe('matchesSearch / searchLibrary', () => {
  const names = (q: Parameters<typeof searchLibrary>[0]) =>
    searchLibrary(q, fixtures, ingredients).map((r) => r.name)

  it('returns everything for an empty search', () => {
    expect(names({})).toEqual(['Hainan chicken rice', 'Garden salad'])
    expect(names({ q: '   ', tags: [] })).toHaveLength(2)
  })

  it('matches one recipe under several cuisine tags (many-to-many)', () => {
    for (const tag of ['Chinese', 'malaysian', 'SINGAPOREAN'])
      expect(names({ tags: [tag] })).toEqual(['Hainan chicken rice'])
  })

  it('requires every selected tag', () => {
    expect(names({ tags: ['Chinese', 'dinner'] })).toEqual([
      'Hainan chicken rice'
    ])
    expect(names({ tags: ['Chinese', 'vegetarian'] })).toEqual([])
  })

  it('matches query words against name, tags and ingredient names', () => {
    expect(names({ q: 'hainan' })).toEqual(['Hainan chicken rice'])
    expect(names({ q: 'jasmine' })).toEqual(['Hainan chicken rice'])
    expect(names({ q: 'vegetarian' })).toEqual(['Garden salad'])
    expect(names({ q: 'chicken salad' })).toEqual([])
    expect(names({ q: 'garden', tags: ['vegetarian'] })).toEqual([
      'Garden salad'
    ])
  })

  it('uses the bundled data by default', () => {
    expect(searchLibrary().length).toBe(recipeData.recipes.length)
    expect(searchLibrary({ q: 'haloumi' }).map((r) => r.name)).toEqual([
      'Greek salad with haloumi'
    ])
    expect(matchesSearch(recipeData.recipes[0], { q: 'beef' })).toBe(true)
  })

  it('lists unique sorted tags', () => {
    expect(getLibraryTags(fixtures)).toEqual([
      'Chinese',
      'Malaysian',
      'Singaporean',
      'dinner',
      'vegetarian'
    ])
    expect(getLibraryTags()).toContain('Indian')
  })
})
