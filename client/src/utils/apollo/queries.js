import { gql } from '@apollo/client';

export const GET_USER_WITH_EMAIL = gql`
  query GetUserWithEmail($email: String!) {
    getUserWithEmail(email: $email) {
      _id
    }
  }
`;

export const GET_API_KEY = gql`
  query GetApiKey {
    getApiKey {
      appId
      appKey
    }
  }
`;

export const GET_USER = gql`
  query GetUser {
    getUser {
      firstName
      lastName
    }
  }
`;

export const GET_SAVED_RECIPES = gql`
  query GetSavedRecipes {
    getSavedRecipes {
      _id
      name
      portions
      picture_url
    }
  }
`;

export const GET_RECIPE = gql`
  query GetRecipe($id: ID!) {
    getRecipe(_id: $id) {
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

export const CHECKOUT = gql`
  query Checkout {
    checkout {
      session
    }
  }
`;
