import type { FC, ChangeEvent, FormEvent } from 'react'
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { changeTitle } from '../../utils/changeTitle'
import { useAuth } from '../../hooks/useAuth'
import { useAuthContext } from '../../utils/auth/AuthContext'
import { returnPath } from '../../utils/auth/returnPath'
import { PrimaryButton } from '../../components/PrimaryButton'
import './auth.css'

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
  const location = useLocation()
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

  const from = returnPath(location.state)

  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  )
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setValidationMessage(null)
    if (!email.trim()) {
      setValidationMessage('Please enter an email address.')
      return
    }
    if (!password) {
      setValidationMessage('Please enter a password.')
      return
    }
    login({ email, password })
  }

  // Redirect only when this page opens. A successful login navigates itself.
  useEffect(() => {
    changeTitle('Log in')
    if (auth.loggedIn) navigate(from, { replace: true })
  }, [auth.loggedIn, from, navigate])
  return (
    <main className="auth-page">
      <h1 className="auth-page__title">Log in</h1>
      {loginLoading ? (
        <p role="status">Loading</p>
      ) : loginError ? (
        <p
          className="auth-page__error"
          role="alert"
        >
          Couldn't log you in.
        </p>
      ) : (
        <form
          className="auth-form"
          onSubmit={handleFormSubmit}
        >
          <label
            className="auth-form__label"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="auth-form__input focus-visible:focus-ring"
            value={email}
            onChange={onEmailChange}
            autoComplete="email"
          />
          <label
            className="auth-form__label"
            htmlFor="password"
          >
            Password
          </label>
          <div className="auth-form__password">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="auth-form__input focus-visible:focus-ring"
              value={password}
              onChange={onPasswordChange}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-form__show focus-visible:focus-ring"
              aria-pressed={showPassword}
              aria-controls="password"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {validationMessage && (
            <p
              className="auth-page__error"
              role="alert"
            >
              {validationMessage}
            </p>
          )}
          <PrimaryButton
            type="submit"
            size="snug"
            className="auth-form__submit"
          >
            Log in
          </PrimaryButton>
        </form>
      )}
      <p className="auth-page__alt">
        No account?{' '}
        <Link
          to="/signup"
          state={{ from }}
          className="focus-visible:focus-ring"
        >
          Sign up
        </Link>
      </p>
    </main>
  )
}
