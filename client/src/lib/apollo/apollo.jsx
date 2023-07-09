/* the goal is to add types to the apollo graph QL callbacks  */

import { Link } from 'react-router-dom'
import { Alert, Button, Space } from 'antd'

import { useApolloClient, useMutation } from '@apollo/client'

import {
  CHECK_EMAIL_ALREADY_EXISTS,
  GET_APP_CREDENTIALS,
  GET_USER,
  GET_SAVED_RECIPES,
  GET_RECIPE,
  CHECKOUT
} from './graphQL/queries.ts'

import {
  ADD_USER,
  MAKE_USER_PRO,
  SAVE_RECIPE,
  UPDATE_RECIPE,
  REMOVE_RECIPE,
  LOGIN
} from './graphQL/mutations.ts'

const useApollo = () => {
  const client = useApolloClient() /* instantiate client */

  const checkEmailAlreadyExists = async (email) => {
    try {
      const { data } = await client.query({
        query: CHECK_EMAIL_ALREADY_EXISTS,
        variables: { email }
      })
      if (data.checkEmailAlreadyExists) return false
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  const getAppCredentials = async () => {
    try {
      const res = await client.query({ query: GET_APP_CREDENTIALS })
      if (!res) throw 'getAppCredentials'
      const appId = res.data.getApiKey.appId
      const appKey = res.data.getApiKey.appKey
      return { appId, appKey }
    } catch (error) {
      console.error(error)
      return null
    }
  }

  const getRecipe = async (id) => {
    try {
      const res = await client.query({
        query: GET_RECIPE,
        variables: { id }
      })

      return res?.data?.getRecipe || undefined
    } catch (error) {
      console.error('apolloClient', error)
    }
  }

  const useSaveRecipe = async () => {
    const [cb, { loading, error }] = useMutation(SAVE_RECIPE)
    const data = async (input) => {
      try {
        const result = await cb(input)
        return result?.data || undefined
      } catch (error) {
        console.error(error)
      }
    }
    return {
      data,
      loading,
      error
    }
  }

  return {
    checkEmailAlreadyExists,
    getRecipe,
    useSaveRecipe
  }
}

export default useApollo
