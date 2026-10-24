import type { CustomisationKind } from './types'
// recipe
import { getRecipe } from './resolvers/recipe/getRecipe'

// user
import { getUser } from './resolvers/user/getUser'
import { checkEmailAlreadyExists } from './resolvers/user/checkEmailAlreadyExists'
import { getNumSavedRecipes } from './resolvers/user/getNumSavedRecipes'
import { getSavedRecipes } from './resolvers/recipe/getSavedRecipes'
import { checkout } from './resolvers/session/checkout'

import { addUser } from './resolvers/user/addUser'
import { makeUserPro } from './resolvers/user/makeUserPro'
import { saveRecipe } from './resolvers/recipe/saveRecipe'
import { removeRecipe } from './resolvers/recipe/removeRecipe'
import { login } from './resolvers/session/login'

/** #182: each stored change names the union member it resolves to. */
export const resolveCustomisationType = ({
  kind
}: {
  kind: CustomisationKind
}): CustomisationKind => kind

export const resolvers = {
  Customisation: { __resolveType: resolveCustomisationType },
  Query: {
    checkEmailAlreadyExists,
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
    removeRecipe,
    login
  }
}
