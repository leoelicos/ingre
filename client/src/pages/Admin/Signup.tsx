import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignup } from './useSignup'
import { PrimaryButton } from '../../components/PrimaryButton'
import './auth.css'

export const Signup: FC = () => {
  const navigate = useNavigate()
  const {
    loggedIn,
    fields,
    handleFormSubmit,
    onFirstNameChange,
    onLastNameChange,
    onEmailChange,
    onPasswordChange,
    checkEmailLoading,
    emailExists,
    addUserLoading,
    validationMessage,
    from
  } = useSignup()

  const [showPassword, setShowPassword] = useState(false)

  // If already logged in when the page opens, return to the starting page.
  useEffect(() => {
    if (loggedIn) {
      navigate(from, { replace: true })
    }
  }, [loggedIn, from, navigate])

  return (
    <main className="auth-page">
      <h1 className="auth-page__title">Sign up</h1>
      <form
        className="auth-form"
        onSubmit={handleFormSubmit}
      >
        <label
          className="auth-form__label"
          htmlFor="firstName"
        >
          First name
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          className="auth-form__input focus-visible:focus-ring"
          value={fields.firstName}
          onChange={onFirstNameChange}
          autoComplete="given-name"
        />

        <label
          className="auth-form__label"
          htmlFor="lastName"
        >
          Last name
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          className="auth-form__input focus-visible:focus-ring"
          value={fields.lastName}
          onChange={onLastNameChange}
          autoComplete="family-name"
        />

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
          value={fields.email}
          onChange={onEmailChange}
          autoComplete="email"
        />
        {checkEmailLoading && (
          <p role="status">
            Checking email… the server may take a few seconds to wake up.
          </p>
        )}
        {emailExists && (
          <p
            className="auth-page__error"
            role="alert"
          >
            A user with this email already exists.{' '}
            <Link
              to="/login"
              state={{ from }}
            >
              Log in?
            </Link>
          </p>
        )}
        {!emailExists && validationMessage && (
          <p
            className="auth-page__error"
            role="alert"
          >
            {validationMessage}
          </p>
        )}

        <label
          className="auth-form__label"
          htmlFor="password"
        >
          Password
        </label>
        <p
          id="password-hint"
          className="auth-form__hint"
        >
          At least 5 characters.
        </p>
        <div className="auth-form__password">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            className="auth-form__input focus-visible:focus-ring"
            value={fields.password}
            onChange={onPasswordChange}
            autoComplete="new-password"
            minLength={5}
            aria-describedby="password-hint"
          />
          <button
            type="button"
            className="auth-form__show focus-visible:focus-ring"
            aria-pressed={showPassword}
            aria-controls="password"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {addUserLoading && <p role="status">Creating your account…</p>}

        <PrimaryButton
          type="submit"
          size="snug"
          className="auth-form__submit"
          isDisabled={checkEmailLoading || emailExists || addUserLoading}
        >
          Sign up
        </PrimaryButton>
      </form>
      <p className="auth-page__alt">
        Have an account?{' '}
        <Link
          to="/login"
          state={{ from }}
          className="focus-visible:focus-ring"
        >
          Log in
        </Link>
      </p>
    </main>
  )
}
