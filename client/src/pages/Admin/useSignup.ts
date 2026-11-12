import { translate } from '../../i18n'
import React from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { useLocation, useNavigate } from 'react-router-dom'
import { ADD_USER } from '../../lib/apollo/graphQL/mutations'
import { CHECK_EMAIL_ALREADY_EXISTS } from '../../lib/apollo/graphQL/queries'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { returnPath } from '../../utils/auth/returnPath'
import { firebaseEnabled, signUpWithEmail } from '../../utils/auth/firebase'
import { useFirebaseSignIn } from '../../utils/auth/useFirebaseSignIn'
import { changeTitle } from '../../utils/changeTitle'

type SignupResult =
  | { ok: true }
  | {
      ok: false
      reason: 'validation' | 'email-exists' | 'error'
      message: string
    }

/** Firebase Auth's minimum (the legacy server allowed 5). */
export const MIN_PASSWORD_LENGTH = 6

const emailExistsMessage = (): string => translate('auth.emailExists')
const checkFailedMessage = (): string => translate('auth.checkFailed')
const signupFailedMessage = (): string => translate('auth.signupFailed')

export const useSignup = () => {
  changeTitle(translate('auth.signUp'))

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
  const firebase = useFirebaseSignIn()

  const emailExists = !!checkEmailData?.checkEmailAlreadyExists

  const handleFormSubmit = async (e: {
    preventDefault: () => void
  }): Promise<SignupResult> => {
    e.preventDefault()
    setValidationMessage(null)

    const { firstName, lastName, email, password } = fields
    if (!firstName.trim()) {
      const message = translate('auth.enterFirstName')
      setValidationMessage(message)
      return { ok: false, reason: 'validation', message }
    }
    if (!email.trim()) {
      const message = translate('auth.enterEmail')
      setValidationMessage(message)
      return { ok: false, reason: 'validation', message }
    }
    if (!password) {
      const message = translate('auth.enterPassword')
      setValidationMessage(message)
      return { ok: false, reason: 'validation', message }
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      const message = translate('auth.passwordTooShort', {
        count: MIN_PASSWORD_LENGTH
      })
      setValidationMessage(message)
      return { ok: false, reason: 'validation', message }
    }

    try {
      const result = await checkEmailAlreadyExists({ variables: { email } })
      if (result.error || !result.data) {
        setValidationMessage(checkFailedMessage())
        return { ok: false, reason: 'error', message: checkFailedMessage() }
      }
      if (result.data.checkEmailAlreadyExists) {
        setValidationMessage(emailExistsMessage())
        return {
          ok: false,
          reason: 'email-exists',
          message: emailExistsMessage()
        }
      }
    } catch {
      setValidationMessage(checkFailedMessage())
      return { ok: false, reason: 'error', message: checkFailedMessage() }
    }

    // Firebase Auth: the account is made in Firebase; the API makes the ingré user
    if (firebaseEnabled()) {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim()
      if (await firebase.finish(() => signUpWithEmail(email, password, name))) {
        navigate(from, { replace: true })
        return { ok: true }
      }
      setValidationMessage(signupFailedMessage())
      return { ok: false, reason: 'error', message: signupFailedMessage() }
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
      setValidationMessage(signupFailedMessage())
      return { ok: false, reason: 'error', message: signupFailedMessage() }
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
    addUserLoading: addUserLoading || firebase.loading,
    validationMessage,
    from
  }
}
