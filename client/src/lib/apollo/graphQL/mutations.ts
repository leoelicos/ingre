import { gql } from '@apollo/client'
import type { Operation, User, UserInput, UserProfile } from './typedefs'

export const ADD_USER: Operation<
  { addUser: { token: string; user: Pick<User, '_id' | 'firstName'> } },
  { input: UserInput }
> = gql`
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

export const MAKE_USER_PRO: Operation<{
  makeUserPro: Pick<User, '_id' | 'pro'>
}> = gql`
  mutation MakeUserPro {
    makeUserPro {
      _id
      pro
    }
  }
`

export const REMOVE_RECIPE: Operation<
  { removeRecipe: boolean },
  { recipeId: string }
> = gql`
  mutation RemoveRecipe($recipeId: ID!) {
    removeRecipe(recipeId: $recipeId)
  }
`

export const LOGIN: Operation<
  { login: { token: string; user: UserProfile } },
  { email: string; password: string }
> = gql`
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
