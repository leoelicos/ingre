import { checkEmailAlreadyExists } from './resolvers/Query/checkEmailAlreadyExists';
import { getApiKey } from './resolvers/Query/getApiKey';
import { getUser } from './resolvers/Query/getUser';
import { getRecipe } from './resolvers/Query/getRecipe';
import { getNumSavedRecipes } from './resolvers/Query/getNumSavedRecipes';
import { getSavedRecipes } from './resolvers/Query/getSavedRecipes';
import { checkout } from './resolvers/Query/checkout';

import { addUser } from './resolvers/Mutation/addUser';
import { makeUserPro } from './resolvers/Mutation/makeUserPro';
import { saveRecipe } from './resolvers/Mutation/saveRecipe';
import { updateRecipe } from './resolvers/Mutation/updateRecipe';
import { removeRecipe } from './resolvers/Mutation/removeRecipe';
import { login } from './resolvers/Mutation/login';

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
};
