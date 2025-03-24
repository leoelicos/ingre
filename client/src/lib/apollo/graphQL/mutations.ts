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
        email
        firstName
        lastName
        numSavedRecipes
        pro
      }
    }
  }
`
