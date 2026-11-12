import { CategoryApi } from '../datasources/category'
import { IngredientApi } from '../datasources/ingredient'
import { RecipeApi } from '../datasources/recipe'

/** Saves a recipe the way saveRecipe does: sections, catalogue rows, then the recipe. */
export const saveTestRecipe = async ({
  name = 'Test Recipe',
  lines = [
    { name: 'Chicken', category: 'Meat', ingredientId: 'chicken' },
    { name: 'Broccoli', category: 'Vegetables', ingredientId: null }
  ]
}: {
  name?: string
  lines?: ReadonlyArray<{
    name: string
    category: string
    ingredientId: string | null
  }>
} = {}) => {
  const categories = new CategoryApi()
  const ingredients = new IngredientApi()
  const saved = []
  for (const line of lines) {
    const category = await categories.findOrCreateCategory({
      categoryName: line.category
    })
    saved.push(
      await ingredients.createIngredient({
        name: line.name,
        quantity: 1,
        measure: 'unit',
        category: category._id,
        ingredientId: line.ingredientId
      })
    )
  }
  return new RecipeApi().createRecipe({
    name,
    portions: 4,
    ingredients: saved,
    picture_url: 'http://example.com/image.jpg',
    libraryId: 'some-library-id',
    instructions: 'Test instructions'
  })
}
