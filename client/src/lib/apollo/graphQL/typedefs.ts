export type User = {
  _id: string
  firstName: string
  lastName: string
  email: string
  pro: boolean
  savedRecipes: Recipe[]
  numSavedRecipes: number
}

export type UserInput = {
  firstName: string
  lastName: string
  email: string
  password: string
  pro: boolean
}

export type Recipe = {
  _id: string
  name: string
  portions: number
  ingredients: Ingredient[]
  picture_url: string
  edamamId: string
  instructions: string
}

export type RecipeInput = {
  name: string
  portions: number
  ingredients: IngredientInput[]
  picture_url: string
  edamamId: string
  instructions: string
}
export type Ingredient = {
  _id: string
  name: string
  quantity: number
  measure: string
  category: Category
}

export type IngredientInput = {
  name: string
  quantity: number
  measure: string
  category: Category
}

/* export type IngredientListItem = {
  _id: string
  name: string
  quantity: number
  measure: string
  category: Category
  recipe: string
  recipeId: string
} */

export type Category = {
  _id: string
  name: string
}

export type Product = {
  _id: string
  name: string
  description: string
  image: string
  quantity: number
  price: number
}

export type Checkout = {
  session: string
}

export type Auth = {
  token: string
  user: User
}

export type EdamamCredentials = {
  appId: string
  appKey: string
}

export type Query = {
  checkEmailAlreadyExists: (email: string) => Promise<boolean | undefined>
  getApiKey: () => Promise<EdamamCredentials | undefined>
  getUser: () => Promise<User | undefined>
  getRecipe: (_id: string) => Promise<Recipe | undefined>
  getSavedRecipes: () => Promise<Recipe[] | undefined>
  getNumSavedRecipes: () => Promise<number | undefined>
  checkout: () => Promise<Checkout | undefined>
}

export type Mutation = {
  addUser: (input: UserInput) => Promise<Auth | undefined>
  makeUserPro: () => Promise<User | undefined>
  saveRecipe: (input: RecipeInput) => Promise<Recipe | undefined>
  updateRecipe: (
    recipeId: string,
    input: RecipeInput
  ) => Promise<Recipe | undefined>
  removeRecipe: (recipeId: string) => Promise<boolean | undefined>
  login: (email: string, password: string) => Promise<Auth | undefined>
}
