import { gql } from '@apollo/client'

export const CHECK_EMAIL_ALREADY_EXISTS = gql`
  query CheckEmailAlreadyExists($email: String!) {
    checkEmailAlreadyExists(email: $email)
  }
`

export const GET_APP_CREDENTIALS = gql`
  query GetApiKey {
    getApiKey {
      appId
      appKey
    }
  }
`

export const GET_USER = gql`
  query GetUser($includeSavedRecipes: Boolean) {
    getUser(includeSavedRecipes: $includeSavedRecipes) {
      _id
      email
      firstName
      lastName
      numSavedRecipes
      pro
    }
  }
`

// not being used
export const GET_NUM_SAVED_RECIPES = gql`
  query getNumSavedRecipes {
    getNumSavedRecipes
  }
`

export const GET_SAVED_RECIPES = gql`
  query GetSavedRecipes {
    getSavedRecipes {
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
      edamamId
      instructions
    }
  }
`

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
        category
      }
      picture_url
      edamamId
      instructions
    }
  }
`

export const CHECKOUT = gql`
  query Checkout {
    checkout {
      session
    }
  }
`
