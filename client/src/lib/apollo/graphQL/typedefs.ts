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
  libraryId: string | null
  instructions: string | null
}

export type RecipeInput = {
  name: string
  portions: number
  ingredients: IngredientInput[]
  picture_url: string
  libraryId: string
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
  category: string
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

// not being used
export type Query = {
  checkEmailAlreadyExists: (email: string) => Promise<boolean>
  getUser: () => Promise<User>
  getRecipe: (_id: string) => Promise<Recipe>
  getSavedRecipes: () => Promise<Recipe[]>
  getNumSavedRecipes: () => Promise<number>
  checkout: () => Promise<Checkout>
}

// not being used
export type Mutation = {
  addUser: (input: UserInput) => Promise<Auth>
  makeUserPro: () => Promise<User>
  saveRecipe: (input: RecipeInput) => Promise<Recipe>
  updateRecipe: (recipeId: string, input: RecipeInput) => Promise<Recipe>
  removeRecipe: (recipeId: string) => Promise<boolean>
  login: (email: string, password: string) => Promise<Auth>
}
