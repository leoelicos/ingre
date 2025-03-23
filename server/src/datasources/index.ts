import { RecipeApi } from './recipe'
import { UserApi } from './user'
import { IngredientApi } from './ingredient'
import { CategoryApi } from './category'
import { StripeApi } from './stripe'

export const createDataSources = () => {
  return {
    userApi: new UserApi(),
    recipeApi: new RecipeApi(),
    ingredientApi: new IngredientApi(),
    categoryApi: new CategoryApi(),
    stripeApi: new StripeApi()
  }
}
