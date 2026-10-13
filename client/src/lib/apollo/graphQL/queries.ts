import { gql } from '@apollo/client'
import type { Checkout, Operation, Recipe, UserProfile } from './typedefs'

export const CHECK_EMAIL_ALREADY_EXISTS: Operation<
  { checkEmailAlreadyExists: boolean },
  { email: string }
> = gql`
  query CheckEmailAlreadyExists($email: String!) {
    checkEmailAlreadyExists(email: $email)
  }
`

export const GET_USER: Operation<{ getUser: UserProfile }> = gql`
  query GetUser {
    getUser {
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
export const GET_NUM_SAVED_RECIPES: Operation<{
  getNumSavedRecipes: number
}> = gql`
  query getNumSavedRecipes {
    getNumSavedRecipes
  }
`

export const GET_SAVED_RECIPES: Operation<{ getSavedRecipes: Recipe[] }> = gql`
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
      libraryId
      instructions
    }
  }
`

export const GET_RECIPE: Operation<{ getRecipe: Recipe }, { id: string }> = gql`
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
      libraryId
      instructions
    }
  }
`

export const CHECKOUT: Operation<{ checkout: Checkout }> = gql`
  query Checkout {
    checkout {
      session
    }
  }
`
