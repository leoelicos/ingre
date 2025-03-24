import React, { FC, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { changeTitle } from 'utils/changeTitle'
import { useAuth } from 'hooks/useAuth'
import { useAuthContext } from 'utils/auth/AuthContext'

const useLoginForm = () => {
  const [email, setEmail] = React.useState<string>('')
  const [password, setPassword] = React.useState<string>('')
  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e?.target) setEmail(e.target.value)
  }
  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e?.target) setPassword(e.target.value)
  }
  return {
    email,
    onEmailChange,
    password,
    onPasswordChange
  }
}
export const Login: FC = () => {
  const navigate = useNavigate()
  const [auth] = useAuthContext()
  const { handleLogin, loginError, loginLoading } = useAuth()
  const { email, password, onEmailChange, onPasswordChange } = useLoginForm()

  const handleFormSubmit: React.FormEventHandler<
    HTMLFormElement
  > = async () => {
    handleLogin({ email, password })
  }

  useEffect(() => {
    changeTitle('Log in')
    if (auth.loggedIn) navigate(-1)
  }, [])
  return (
    <div>
      <div>
        <h1>Log in</h1>
      </div>
      {loginLoading ? (
        <p>Loading</p>
      ) : loginError ? (
        <p>Couldn't log you in.</p>
      ) : (
        <form onSubmit={handleFormSubmit}>
          <input
            id="email-input"
            type="text"
            onChange={onEmailChange}
          />
          <input
            id="password-input"
            type="text"
            onChange={onPasswordChange}
          />
          <button type="submit">Submit</button>
        </form>
      )}
      <Link to="/signup">
        <button>No account? Sign up</button>
      </Link>
    </div>
  )
}
