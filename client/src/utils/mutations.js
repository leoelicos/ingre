import { gql } from '@apollo/client';

export const ADD_USER = gql`
  mutation addUser($input: UserInput!) {
    addUser(input: $input) {
      token
      user {
        _id
        firstName
        lastName
        email
      }
    }
  }
`;

export const ADD_RECIPE = gql`
  mutation addRecipe($input: RecipeInput!) {
    addRecipe(input: $input) {
      _id
      name
      portions
      ingredients {
        _id
        name
        quantity
        measure
        category {
          _id
          name
        }
      }
      picture_url
    }
  }
`;

export const ADD_INGREDIENT = gql`
  mutation addIngredient($input: IngredientInput!) {
    addIngredient(input: $input) {
      _id
      name
      quantity
      measure
      category {
        _id
        name
      }
    }
  }
`;

export const ADD_ORDER = gql`
  mutation addOrder($products: [ID]!) {
    addOrder(products: $products) {
      purchaseDate
      products {
        _id
        name
        description
        price
        quantity
        category {
          name
        }
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation updateUser($input: UserInput!) {
    updateUser(input: $input) {
      token
      user {
        _id
      }
    }
  }
`;

export const UPDATE_RECIPE = gql`
  mutation updateRecipe($recipeId: ID!, $input: RecipeInput!) {
    updateRecipe(recipeID: $recipeId, input: $input) {
      _id
      name
      portions
      ingredients {
        _id
        name
        quantity
        measure
        category {
          _id
          name
        }
      }
      picture_url
    }
  }
`;

export const REMOVE_RECIPE = gql`
  mutation removeRecipe($recipeId: ID!) {
    removeRecipe(recipeID: $recipeId) {
      _id
      name
      portions
      picture_url
      ingredients {
        _id
        name
        quantity
        measure
        category {
          _id
          name
        }
      }
    }
  }
`;
export const REMOVE_INGREDIENT = gql`
  mutation removeIngredient($ingredientId: ID!) {
    removeIngredient(ingredientID: $ingredientId) {
      _id
      name
      quantity
      measure
      category {
        _id
        name
      }
    }
  }
`;
export const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
      }
    }
  }
`;
