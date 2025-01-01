// recipe
import { getRecipe } from './resolvers/recipe/getRecipe'

// user
import { getUser } from './resolvers/user/getUser'
import { checkEmailAlreadyExists } from './resolvers/user/checkEmailAlreadyExists'
import { getApiKey } from './resolvers/session/getApiKey'
import { getNumSavedRecipes } from './resolvers/user/getNumSavedRecipes'
import { getSavedRecipes } from './resolvers/recipe/getSavedRecipes'
import { checkout } from './resolvers/session/checkout'

import { addUser } from './resolvers/user/addUser'
import { makeUserPro } from './resolvers/user/makeUserPro'
import { saveRecipe } from './resolvers/recipe/saveRecipe'
import { updateRecipe } from './resolvers/recipe/updateRecipe'
import { removeRecipe } from './resolvers/recipe/removeRecipe'
import { login } from './resolvers/session/login'

export const resolvers = {
  Query: {
    checkEmailAlreadyExists,
    getApiKey,
    getUser,
    getRecipe,
    getNumSavedRecipes,
    getSavedRecipes,
    checkout
  },
  Mutation: {
    addUser,
    makeUserPro,
    saveRecipe,
    updateRecipe,
    removeRecipe,
    login
  }
}
