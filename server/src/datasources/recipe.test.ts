import { NotFoundError } from '../errors'
import type { SqlClient } from '../postgres/sql'
import { newPublicId } from '../test-utils/ids'
import { useTestDb } from '../test-utils/pg'
import { saveTestRecipe } from '../test-utils/recipes'
import { insertUser } from '../test-utils/users'
import { CategoryApi } from './category'
import { IngredientApi } from './ingredient'
import { catalogueIdOf, RecipeApi } from './recipe'
import { UserApi } from './user'

jest.setTimeout(60000)

const sql = useTestDb()
const recipeApi = new RecipeApi()
const userApi = new UserApi()

const count = async (table: string) =>
  (await sql().query(`select count(*)::int as n from ${table}`))[0]?.['n']

describe('RecipeApi', () => {
  it('saves a recipe with its lines, sections and catalogue ids', async () => {
    const recipe = await saveTestRecipe()
    expect(recipe).toEqual({
      _id: expect.stringMatching(/^[0-9a-f]{24}$/),
      name: 'Test Recipe',
      portions: 4,
      picture_url: 'http://example.com/image.jpg',
      libraryId: 'some-library-id',
      instructions: 'Test instructions',
      customisations: [],
      ingredients: [
        {
          _id: `${recipe._id}:0`,
          name: 'Chicken',
          quantity: 1,
          measure: 'unit',
          category: { _id: expect.any(String), name: 'Meat' },
          ingredientId: 'chicken'
        },
        {
          _id: `${recipe._id}:1`,
          name: 'Broccoli',
          quantity: 1,
          measure: 'unit',
          category: { _id: expect.any(String), name: 'Vegetables' },
          ingredientId: null
        }
      ]
    })
    expect(await recipeApi.getRecipe(recipe._id)).toEqual(recipe)
  })

  it('keeps each line’s own name and section over the shared catalogue row', async () => {
    const first = await saveTestRecipe({
      lines: [{ name: 'Tomato', category: 'Produce', ingredientId: null }]
    })
    const second = await saveTestRecipe({
      lines: [{ name: 'tomato', category: 'Canned', ingredientId: null }]
    })
    expect(await count('ingredients')).toBe(1)
    expect(first.ingredients[0]).toMatchObject({
      name: 'Tomato',
      category: { name: 'Produce' }
    })
    expect(second.ingredients[0]).toMatchObject({
      name: 'tomato',
      category: { name: 'Canned' }
    })
  })

  it('falls back to the catalogue row, then Generic, for lines without their own', async () => {
    const recipe = await saveTestRecipe()
    await sql().exec(
      'update recipe_ingredients set name = null, category_id = null'
    )
    const catalogue = await recipeApi.getRecipe(recipe._id)
    expect(catalogue?.ingredients.map(({ name }) => name)).toEqual([
      'Chicken',
      'Broccoli'
    ])
    await sql().exec('delete from categories')
    const generic = await recipeApi.getRecipe(recipe._id)
    expect(generic?.ingredients[0]?.category).toEqual({
      _id: 'generic',
      name: 'Generic'
    })
  })

  it('stores customisations with only the amounts each kind has (#182)', async () => {
    const recipe = await recipeApi.createRecipe({
      name: 'Toast',
      portions: 2,
      ingredients: [],
      picture_url: 'pic',
      customisations: [
        { kind: 'PortionsChange', from: 2, to: 4 },
        { kind: 'RemovedIngredient', ingredientId: 'butter', from: 1 },
        { kind: 'AddedIngredient', ingredientId: 'jam', to: 1 }
      ]
    })
    expect(recipe).toEqual({
      _id: recipe._id,
      name: 'Toast',
      portions: 2,
      picture_url: 'pic',
      ingredients: [],
      customisations: [
        { kind: 'PortionsChange', from: 2, to: 4 },
        { kind: 'RemovedIngredient', ingredientId: 'butter', from: 1 },
        { kind: 'AddedIngredient', ingredientId: 'jam', to: 1 }
      ]
    })
  })

  it('returns null for an unknown recipe', async () => {
    expect(await recipeApi.getRecipe(newPublicId())).toBeNull()
  })

  it('reports a recipe that could not be read back', async () => {
    const client = sql()
    const blind: SqlClient = {
      ...client,
      transaction: (work) =>
        client.transaction((tx) =>
          work({
            ...tx,
            query: async (text, params) =>
              text.trim().startsWith('select') ? [] : tx.query(text, params)
          })
        )
    }
    await expect(
      new RecipeApi(blind).createRecipe({
        name: 'Ghost',
        portions: 1,
        ingredients: [],
        picture_url: 'pic'
      })
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it('deletes only a recipe the user saved, with its lines and saves', async () => {
    const owner = await userApi.createUser({
      email: 'owner@example.com',
      password: 'password123',
      firstName: 'Ada',
      lastName: 'Lovelace'
    })
    const stranger = await insertUser({ email: 'stranger@example.com' })
    const recipe = await saveTestRecipe()
    await userApi.addRecipeToUser({ userId: owner._id, recipeId: recipe._id })
    await expect(
      recipeApi.deleteRecipe({ recipeId: recipe._id, userId: stranger })
    ).rejects.toThrow('Recipe does not exist!')
    await recipeApi.deleteRecipe({ recipeId: recipe._id, userId: owner._id })
    expect(await recipeApi.getRecipe(recipe._id)).toBeNull()
    expect(await count('recipe_ingredients')).toBe(0)
    expect(
      (await userApi.findOneUserById({ id: owner._id }))?.numSavedRecipes
    ).toBe(0)
    // the shared catalogue stays
    expect(await count('ingredients')).toBe(2)
  })
})

describe('catalogueIdOf', () => {
  it('hides name keys', () => {
    expect(catalogueIdOf('chicken')).toBe('chicken')
    expect(catalogueIdOf('name:chicken')).toBeNull()
  })
})

describe('CategoryApi and IngredientApi', () => {
  it('finds or creates a section by name', async () => {
    const categories = new CategoryApi()
    const meat = await categories.findOrCreateCategory({ categoryName: 'Meat' })
    expect(
      await categories.findOrCreateCategory({ categoryName: ' Meat ' })
    ).toEqual(meat)
    await categories.findOrCreateCategory({ categoryName: 'Dairy' })
    expect(await categories.getAllCategories()).toEqual([
      meat,
      { _id: expect.any(String), name: 'Dairy' }
    ])
  })

  it('shares a catalogue row by key, keeping its first section', async () => {
    const categories = new CategoryApi(sql())
    const ingredients = new IngredientApi(sql())
    const meat = await categories.findOrCreateCategory({ categoryName: 'Meat' })
    const deli = await categories.findOrCreateCategory({ categoryName: 'Deli' })
    const first = await ingredients.createIngredient({
      name: ' Ham ',
      quantity: 2,
      measure: 'slice',
      category: meat._id,
      ingredientId: ''
    })
    expect(first).toEqual({
      _id: expect.any(String),
      name: 'Ham',
      quantity: 2,
      measure: 'slice',
      category: meat,
      ingredientId: null
    })
    const again = await ingredients.createIngredient({
      name: 'ham',
      quantity: 1,
      measure: 'unit',
      category: deli._id
    })
    expect(again._id).toBe(first._id)
    // the line keeps the section it was saved with
    expect(again.category).toEqual(deli)
    const [row] = await sql().query(
      'select category_id::text as category from ingredients'
    )
    expect(row?.['category']).toBe(meat._id)
  })
})
