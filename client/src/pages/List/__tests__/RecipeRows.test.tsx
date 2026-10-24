import { libRecipe } from '../../../test/fixtures'
import { library } from '../../../utils/library/recipeLibrary'
import { recipeNotes } from '../RecipeRows'

describe('recipeNotes', () => {
  it('lists allergens and the staples assumed at home', () => {
    const dahl = library.find((recipe) => recipe.id === 'dahl')
    expect(dahl === undefined ? [] : recipeNotes(dahl, 2)).toEqual([
      'Contains: milk',
      "You'll also need: salt"
    ])
  })

  it('is empty when a recipe has neither', () => {
    expect(
      recipeNotes(
        libRecipe({
          ingredients: [
            { ingredientId: 'onion', quantity: 1, measure: 'whole' }
          ]
        }),
        2
      )
    ).toEqual([])
  })
})
