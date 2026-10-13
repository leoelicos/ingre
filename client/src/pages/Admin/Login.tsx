import type { FC, ChangeEvent, FormEvent } from 'react'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { changeTitle } from '../../utils/changeTitle'
import { useAuth } from '../../hooks/useAuth'
import { useAuthContext } from '../../utils/auth/AuthContext'

const useLoginForm = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }
  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev)
  return {
    email,
    onEmailChange,
    password,
    onPasswordChange,
    showPassword,
    togglePasswordVisibility
  }
}
export const Login: FC = () => {
  const navigate = useNavigate()
  const [auth] = useAuthContext()
  const { login, loginError, loginLoading } = useAuth()
  const {
    email,
    password,
    showPassword,
    onEmailChange,
    onPasswordChange,
    togglePasswordVisibility
  } = useLoginForm()

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    login({ email, password })
  }

  // Redirect only when this page opens. A successful login navigates itself.
  useEffect(() => {
    changeTitle('Log in')
    if (auth.loggedIn) navigate(-1)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
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
            id="email"
            name="email"
            type="text"
            value={email}
            onChange={onEmailChange}
            autoComplete="email"
            required
          />
          <div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={onPasswordChange}
              autoComplete="password"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <button type="submit">Submit</button>
        </form>
      )}
      <Link to="/signup">
        <button>No account? Sign up</button>
      </Link>
    </div>
  )
}
