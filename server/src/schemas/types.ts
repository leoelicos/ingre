import { Types } from 'mongoose';

export type User = {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  pro: boolean;
  savedRecipes: Array<Types.ObjectId>;
  numSavedRecipes: number;
};

export type UserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type Recipe = {
  _id: Types.ObjectId;
  name: string;
  portions: number;
  ingredients: Array<Types.ObjectId>;
  picture_url: string;
  edamamId?: string;
  instructions?: string;
};

export type RecipeInput = {
  name: string;
  portions: number;
  ingredients: Array<IngredientInput>;
  picture_url: string;
  edamamId: string;
  instructions: string;
};

export type Ingredient = {
  _id: Types.ObjectId;
  name: string;
  quantity: number;
  measure: string;
  category: Category;
};

export type IngredientInput = {
  name: string;
  quantity: number;
  measure: string;
  category: string;
};

export type IngredientListItem = {
  _id: Types.ObjectId;
  name: string;
  quantity: number;
  measure: string;
  category: string;
  recipe: string;
  recipeId: Types.ObjectId;
};

export type Category = {
  _id: Types.ObjectId;
  name: string;
};

export type Product = {
  _id: Types.ObjectId;
  name: string;
  description: string;
  image: string;
  quantity: number;
  price: number;
};

export type Checkout = {
  session: string;
};

export type Auth = {
  token: string;
  user: User;
};

export type EdamamCredentials = {
  appId: string;
  appKey: string;
};
