export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AddedIngredient = {
  ingredientId: Scalars['String']['output'];
  to: Scalars['Float']['output'];
};

export type AddedIngredientInput = {
  ingredientId: Scalars['String']['input'];
  to: Scalars['Float']['input'];
};

export type Auth = {
  token: Scalars['String']['output'];
  user: User;
};

export type Category = {
  _id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type ChangedIngredient = {
  from: Scalars['Float']['output'];
  ingredientId: Scalars['String']['output'];
  to: Scalars['Float']['output'];
};

export type ChangedIngredientInput = {
  from: Scalars['Float']['input'];
  ingredientId: Scalars['String']['input'];
  to: Scalars['Float']['input'];
};

export type Checkout = {
  session: Scalars['String']['output'];
};

export type Customisation = AddedIngredient | ChangedIngredient | PortionsChange | RemovedIngredient;

export type CustomisationsInput = {
  added: Array<AddedIngredientInput>;
  changed: Array<ChangedIngredientInput>;
  portions?: InputMaybe<PortionsChangeInput>;
  removed: Array<RemovedIngredientInput>;
};

export type Ingredient = {
  _id: Scalars['ID']['output'];
  category: Category;
  /** catalogue id (#182); missing on recipes saved before it */
  ingredientId?: Maybe<Scalars['String']['output']>;
  measure: Scalars['String']['output'];
  name: Scalars['String']['output'];
  quantity: Scalars['Float']['output'];
};

export type IngredientInput = {
  category: Scalars['String']['input'];
  ingredientId: Scalars['String']['input'];
  measure: Scalars['String']['input'];
  name: Scalars['String']['input'];
  quantity: Scalars['Float']['input'];
};

export type Mutation = {
  addUser: Auth;
  login: Auth;
  makeUserPro: User;
  removeRecipe: Scalars['Boolean']['output'];
  saveRecipe: Recipe;
};


export type MutationAddUserArgs = {
  input: UserInput;
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRemoveRecipeArgs = {
  recipeId: Scalars['ID']['input'];
};


export type MutationSaveRecipeArgs = {
  input: RecipeInput;
};

export type PortionsChange = {
  from: Scalars['Int']['output'];
  to: Scalars['Int']['output'];
};

export type PortionsChangeInput = {
  from: Scalars['Int']['input'];
  to: Scalars['Int']['input'];
};

export type Query = {
  checkEmailAlreadyExists: Scalars['Boolean']['output'];
  checkout: Checkout;
  getNumSavedRecipes: Scalars['Int']['output'];
  getRecipe: Recipe;
  getSavedRecipes: Array<Recipe>;
  getUser: User;
};


export type QueryCheckEmailAlreadyExistsArgs = {
  email: Scalars['String']['input'];
};


export type QueryGetRecipeArgs = {
  _id: Scalars['ID']['input'];
};

export type Recipe = {
  _id: Scalars['ID']['output'];
  customisations: Array<Customisation>;
  ingredients: Array<Ingredient>;
  instructions?: Maybe<Scalars['String']['output']>;
  libraryId?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  picture_url: Scalars['String']['output'];
  portions: Scalars['Int']['output'];
};

export type RecipeInput = {
  customisations: CustomisationsInput;
  ingredients: Array<IngredientInput>;
  instructions?: InputMaybe<Scalars['String']['input']>;
  libraryId?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  picture_url: Scalars['String']['input'];
  portions: Scalars['Int']['input'];
};

export type RemovedIngredient = {
  from: Scalars['Float']['output'];
  ingredientId: Scalars['String']['output'];
};

export type RemovedIngredientInput = {
  from: Scalars['Float']['input'];
  ingredientId: Scalars['String']['input'];
};

export type User = {
  _id: Scalars['ID']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  numSavedRecipes: Scalars['Int']['output'];
  pro: Scalars['Boolean']['output'];
  savedRecipes: Array<Recipe>;
};

export type UserInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};
