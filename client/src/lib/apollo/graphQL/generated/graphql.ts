/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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

export type AddedIngredientInput = {
  ingredientId: string;
  to: number;
};

export type ChangedIngredientInput = {
  from: number;
  ingredientId: string;
  to: number;
};

export type CustomisationsInput = {
  added: Array<AddedIngredientInput>;
  changed: Array<ChangedIngredientInput>;
  portions?: PortionsChangeInput | null | undefined;
  removed: Array<RemovedIngredientInput>;
};

export type IngredientInput = {
  category: string;
  ingredientId: string;
  measure: string;
  name: string;
  quantity: number;
};

export type PortionsChangeInput = {
  from: number;
  to: number;
};

export type RecipeInput = {
  customisations: CustomisationsInput;
  ingredients: Array<IngredientInput>;
  instructions?: string | null | undefined;
  libraryId?: string | null | undefined;
  name: string;
  picture_url: string;
  portions: number;
};

export type RemovedIngredientInput = {
  from: number;
  ingredientId: string;
};

export type UserInput = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

export type AddUserMutationVariables = Exact<{
  input: UserInput;
}>;


export type AddUserMutation = { addUser: { token: string, user: { _id: string, firstName: string } } };

export type MakeUserProMutationVariables = Exact<{ [key: string]: never; }>;


export type MakeUserProMutation = { makeUserPro: { _id: string, pro: boolean } };

export type RemoveRecipeMutationVariables = Exact<{
  recipeId: string | number;
}>;


export type RemoveRecipeMutation = { removeRecipe: boolean };

export type LoginMutationVariables = Exact<{
  email: string;
  password: string;
}>;


export type LoginMutation = { login: { token: string, user: { _id: string, email: string, firstName: string, lastName: string, numSavedRecipes: number, pro: boolean } } };

export type SaveRecipeMutationVariables = Exact<{
  input: RecipeInput;
}>;


export type SaveRecipeMutation = { saveRecipe: { _id: string, name: string, portions: number, picture_url: string, libraryId: string | null, instructions: string | null, ingredients: Array<{ _id: string, name: string, quantity: number, measure: string, ingredientId: string | null, category: { _id: string, name: string } }>, customisations: Array<
      | { __typename: 'AddedIngredient', ingredientId: string, to: number }
      | { __typename: 'ChangedIngredient', ingredientId: string, from: number, to: number }
      | { __typename: 'PortionsChange', fromPortions: number, toPortions: number }
      | { __typename: 'RemovedIngredient', ingredientId: string, from: number }
    > } };

export type CheckEmailAlreadyExistsQueryVariables = Exact<{
  email: string;
}>;


export type CheckEmailAlreadyExistsQuery = { checkEmailAlreadyExists: boolean };

export type GetUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserQuery = { getUser: { _id: string, email: string, firstName: string, lastName: string, numSavedRecipes: number, pro: boolean } };

export type GetNumSavedRecipesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetNumSavedRecipesQuery = { getNumSavedRecipes: number };

export type GetSavedRecipesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSavedRecipesQuery = { getSavedRecipes: Array<{ _id: string, name: string, portions: number, picture_url: string, libraryId: string | null, instructions: string | null, ingredients: Array<{ _id: string, name: string, quantity: number, measure: string, ingredientId: string | null, category: { _id: string, name: string } }>, customisations: Array<
      | { __typename: 'AddedIngredient', ingredientId: string, to: number }
      | { __typename: 'ChangedIngredient', ingredientId: string, from: number, to: number }
      | { __typename: 'PortionsChange', fromPortions: number, toPortions: number }
      | { __typename: 'RemovedIngredient', ingredientId: string, from: number }
    > }> };

export type GetRecipeQueryVariables = Exact<{
  id: string | number;
}>;


export type GetRecipeQuery = { getRecipe: { _id: string, name: string, portions: number, picture_url: string, libraryId: string | null, instructions: string | null, ingredients: Array<{ _id: string, name: string, quantity: number, measure: string, category: { _id: string, name: string } }> } };

export type CheckoutQueryVariables = Exact<{ [key: string]: never; }>;


export type CheckoutQuery = { checkout: { session: string } };
