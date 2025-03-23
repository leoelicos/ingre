import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { LOGIN } from 'lib/apollo/graphQL/mutations'
import { useAuthContext } from 'utils/auth/AuthContext'
import { changeTitle } from 'utils/changeTitle'

export const useLogin = () => {
  changeTitle('Log in')

  const [fields, setFields] = React.useState<{
    email: string
    password: string
  }>({ email: '', password: '' })
  const [login, { error }] = useMutation(LOGIN)
  const navigate = useNavigate()

  const [auth, dispatch] = useAuthContext()
  const loggedIn = auth.loggedIn

  const handleFormSubmit: React.FormEventHandler<HTMLFormElement> = async (
    e
  ) => {
    console.log({ e })
    const { email, password } = fields
    const payload = { email, password }

    try {
      const res = await login({ variables: payload })
      const token = res.data.login.token
      dispatch({ type: 'LOGIN', data: token })

      navigate(-1)
    } catch (e) {
      console.error(e)
    }
  }
  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, email: e.target.value }))
  }
  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, password: e.target.value }))
  }
  return { loggedIn, handleFormSubmit, onEmailChange, onPasswordChange, error }
}
