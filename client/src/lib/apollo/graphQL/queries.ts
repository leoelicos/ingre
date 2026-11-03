import { gql } from '@apollo/client'
import type {
  Checkout,
  Operation,
  Recipe,
  SavedRecipe,
  Tier,
  TierProfile,
  UserProfile
} from './typedefs'

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

export const GET_SAVED_RECIPES: Operation<{
  getSavedRecipes: SavedRecipe[]
}> = gql`
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
        ingredientId
        category {
          _id
          name
        }
      }
      picture_url
      libraryId
      instructions
      customisations {
        __typename
        ... on AddedIngredient {
          ingredientId
          to
        }
        ... on RemovedIngredient {
          ingredientId
          from
        }
        ... on ChangedIngredient {
          ingredientId
          from
          to
        }
        ... on PortionsChange {
          fromPortions: from
          toPortions: to
        }
      }
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

/** `tier` buys that tier (#208); without it, the old PRO checkout. */
export const CHECKOUT: Operation<{ checkout: Checkout }, { tier?: Tier }> = gql`
  query Checkout($tier: Tier) {
    checkout(tier: $tier) {
      session
    }
  }
`

/** The tier the signed-in user has bought, if any (#208). */
export const GET_TIER: Operation<{ getUser: TierProfile }> = gql`
  query GetTier {
    getUser {
      _id
      tier
    }
  }
`
