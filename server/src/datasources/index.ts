import { RecipeApi } from './recipe'
import { UserApi } from './user'
import { IngredientApi } from './ingredient'
import { CategoryApi } from './category'
import { StoreApi } from './store'

export const createDataSources = () => {
  return {
    userApi: new UserApi(),
    recipeApi: new RecipeApi(),
    ingredientApi: new IngredientApi(),
    categoryApi: new CategoryApi(),
    storeApi: new StoreApi()
  }
}
