import { gql } from '@apollo/client'

export const ADD_USER = gql`
  mutation AddUser($input: UserInput!) {
    addUser(input: $input) {
      token
      user {
        _id
        firstName
      }
    }
  }
`

export const MAKE_USER_PRO = gql`
  mutation MakeUserPro {
    makeUserPro {
      _id
      pro
    }
  }
`

export const SAVE_RECIPE = gql`
  mutation SaveRecipe($input: RecipeInput!) {
    saveRecipe(input: $input) {
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

export const UPDATE_RECIPE = gql`
  mutation UpdateRecipe($input: RecipeInput!, $recipeId: ID!) {
    updateRecipe(input: $input, recipeId: $recipeId) {
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
    }
  }
`

export const REMOVE_RECIPE = gql`
  mutation RemoveRecipe($recipeId: ID!) {
    removeRecipe(recipeId: $recipeId)
  }
`

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
      }
    }
  }
`
