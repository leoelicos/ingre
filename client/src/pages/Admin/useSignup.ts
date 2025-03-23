import React from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { ADD_USER } from 'lib/apollo/graphQL/mutations'
import { CHECK_EMAIL_ALREADY_EXISTS } from 'lib/apollo/graphQL/queries'
import { useAuthContext } from 'utils/auth/AuthContext'
import { changeTitle } from 'utils/changeTitle'

export const useSignup = () => {
  changeTitle('Sign up')

  const [fields, setFields] = React.useState<{
    firstName: string
    lastName: string
    email: string
    password: string
  }>({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })

  const [
    checkEmailAlreadyExists,
    {
      data: checkEmailData,
      loading: checkEmailLoading,
      error: checkEmailError //
    }
  ] = useLazyQuery(CHECK_EMAIL_ALREADY_EXISTS, {
    fetchPolicy: 'network-only'
    // nextFetchPolicy: 'cache-first'
  })

  const [addUser, { error: addUserError }] = useMutation(ADD_USER)

  const navigate = useNavigate()

  const [state, dispatch] = useAuthContext()
  const loggedIn = state.loggedIn

  const emailAlreadyExists = async (e: string) => {
    await checkEmailAlreadyExists({ variables: { email: e } })
    return checkEmailData
  }

  const handleFormSubmit: React.FormEventHandler<HTMLFormElement> = async (
    e
  ) => {
    console.log({ e })
    const { firstName, lastName, email, password } = fields
    const variables = { input: { email, password, firstName, lastName } }
    try {
      await emailAlreadyExists(email) // debug this
      const res = await addUser({ variables })
      const token = res.data.addUser.token
      dispatch({ type: 'LOGIN', data: token })

      navigate(-1)
    } catch (e) {
      console.error(e)
    }
  }

  const onFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((prev) => ({ ...prev, firstName: e.target.value }))

  const onLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((prev) => ({ ...prev, lastName: e.target.value }))

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((prev) => ({ ...prev, email: e.target.value }))

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((prev) => ({ ...prev, password: e.target.value }))

  return {
    loggedIn,
    handleFormSubmit,
    onFirstNameChange,
    onLastNameChange,
    onEmailChange,
    checkEmailLoading,
    checkEmailError,
    onPasswordChange,
    addUserError
  }
}
