import { libRecipe } from '../../../test/fixtures'
import { findRecipe } from '../../Recipe/RecipePage'
import { recipeNotes } from '../RecipeRows'

describe('recipeNotes', () => {
  it('lists allergens and the staples assumed at home', () => {
    const dahl = findRecipe('dahl')
    expect(dahl === null ? [] : recipeNotes(dahl, 2)).toEqual([
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
