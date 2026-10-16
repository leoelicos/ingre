import React from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { useLocation, useNavigate } from 'react-router-dom'
import { ADD_USER } from '../../lib/apollo/graphQL/mutations'
import { CHECK_EMAIL_ALREADY_EXISTS } from '../../lib/apollo/graphQL/queries'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { returnPath } from '../../utils/auth/returnPath'
import { changeTitle } from '../../utils/changeTitle'

type SignupResult =
  | { ok: true }
  | {
      ok: false
      reason: 'validation' | 'email-exists' | 'error'
      message: string
    }

const MIN_PASSWORD_LENGTH = 5

const EMAIL_EXISTS = 'A user with this email already exists.'
const CHECK_FAILED = "Couldn't check that email."
const SIGNUP_FAILED = "Couldn't sign you up."

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

  const [validationMessage, setValidationMessage] = React.useState<
    string | null
  >(null)

  const [
    checkEmailAlreadyExists,
    { data: checkEmailData, loading: checkEmailLoading, error: checkEmailError }
  ] = useLazyQuery(CHECK_EMAIL_ALREADY_EXISTS, {
    fetchPolicy: 'network-only'
  })

  const [addUser, { error: addUserError, loading: addUserLoading }] =
    useMutation(ADD_USER)

  const navigate = useNavigate()
  const location = useLocation()
  const from = returnPath(location.state)

  const [state, dispatch] = useAuthContext()
  const loggedIn = state.loggedIn

  const emailExists = !!checkEmailData?.checkEmailAlreadyExists

  const handleFormSubmit = async (e: {
    preventDefault: () => void
  }): Promise<SignupResult> => {
    e.preventDefault()
    setValidationMessage(null)

    const { firstName, lastName, email, password } = fields
    if (!firstName.trim()) {
      const message = 'Please enter your first name.'
      setValidationMessage(message)
      return { ok: false, reason: 'validation', message }
    }
    if (!email.trim()) {
      const message = 'Please enter an email address.'
      setValidationMessage(message)
      return { ok: false, reason: 'validation', message }
    }
    if (!password) {
      const message = 'Please enter a password.'
      setValidationMessage(message)
      return { ok: false, reason: 'validation', message }
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      const message = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
      setValidationMessage(message)
      return { ok: false, reason: 'validation', message }
    }

    try {
      const result = await checkEmailAlreadyExists({ variables: { email } })
      if (result.error || !result.data) {
        setValidationMessage(CHECK_FAILED)
        return { ok: false, reason: 'error', message: CHECK_FAILED }
      }
      if (result.data.checkEmailAlreadyExists) {
        setValidationMessage(EMAIL_EXISTS)
        return {
          ok: false,
          reason: 'email-exists',
          message: EMAIL_EXISTS
        }
      }
    } catch {
      setValidationMessage(CHECK_FAILED)
      return { ok: false, reason: 'error', message: CHECK_FAILED }
    }

    try {
      const variables = { input: { email, password, firstName, lastName } }
      const res = await addUser({ variables })
      if (!res.data) {
        throw new Error('Sign up returned no data')
      }
      const token = res.data.addUser.token
      dispatch({ type: 'LOGIN', data: token })

      navigate(from, { replace: true })
      return { ok: true }
    } catch {
      setValidationMessage(SIGNUP_FAILED)
      return { ok: false, reason: 'error', message: SIGNUP_FAILED }
    }
  }

  const onFirstNameChange = (e: { target: { value: string } }) =>
    setFields((prev) => ({ ...prev, firstName: e.target.value }))

  const onLastNameChange = (e: { target: { value: string } }) =>
    setFields((prev) => ({ ...prev, lastName: e.target.value }))

  const onEmailChange = (e: { target: { value: string } }) =>
    setFields((prev) => ({ ...prev, email: e.target.value }))

  const onPasswordChange = (e: { target: { value: string } }) =>
    setFields((prev) => ({ ...prev, password: e.target.value }))

  return {
    loggedIn,
    fields,
    handleFormSubmit,
    onFirstNameChange,
    onLastNameChange,
    onEmailChange,
    onPasswordChange,
    checkEmailLoading,
    checkEmailError,
    emailExists,
    addUserError,
    addUserLoading,
    validationMessage,
    from
  }
}
