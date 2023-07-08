/* react */
import { Link } from 'react-router-dom'

/* @apollo/client */
import { useApolloClient } from '@apollo/client'

/* graphQL */
import {
  CHECK_EMAIL_ALREADY_EXISTS,
  GET_API_KEY,
  GET_USER,
  GET_RECIPE,
  GET_SAVED_RECIPES,
  CHECKOUT
} from '../graphQL/queries.ts'

/* components */
import { Alert, Button, Space } from 'antd'

/* instantiate client */

export const checkEmailAlreadyExists = async (email) => {
  const client = useApolloClient()
  const { data } = await client.query({
    query: CHECK_EMAIL_ALREADY_EXISTS,
    variables: { email }
  })
  if (data.checkEmailAlreadyExists) return false

  return true
}

export const getRecipe = async (id) => {
  const client = useApolloClient()
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
