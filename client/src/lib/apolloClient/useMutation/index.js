/* @apollo/client */
import { useMutation } from '@apollo/client'

/* graphql */
import {
  SAVE_RECIPE //
} from '../graphQL/mutations'

export const useSaveRecipe = async () => {
  const [cb, { loading, error }] = useMutation(SAVE_RECIPE)
  const saveRecipe = async (input) => {
    try {
      const result = await cb(input)
      return result?.data || undefined
    } catch (error) {
      console.error(error)
    }
  }
  return {
    saveRecipe,
    loading,
    error
  }
}
