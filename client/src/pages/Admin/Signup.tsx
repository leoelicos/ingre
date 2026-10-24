import { useT } from '../../i18n'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MIN_PASSWORD_LENGTH, useSignup } from './useSignup'
import { PrimaryButton } from '../../components/PrimaryButton'
import './auth.css'

export const Signup: FC = () => {
  const t = useT()
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
    <div className="auth-page">
      <h1 className="auth-page__title">{t('auth.signUp')}</h1>
      <form
        className="auth-form"
        onSubmit={handleFormSubmit}
      >
        <label
          className="auth-form__label"
          htmlFor="firstName"
        >
          {t('auth.firstName')}
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
          {t('auth.lastName')}
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
          {t('auth.email')}
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
        {checkEmailLoading && <p role="status">{t('auth.checkingEmail')}</p>}
        {emailExists && (
          <p
            className="auth-page__error"
            role="alert"
          >
            {t('auth.emailExists')}{' '}
            <Link
              to="/login"
              state={{ from }}
            >
              {t('auth.logInQuestion')}
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
          {t('auth.password')}
        </label>
        <p
          id="password-hint"
          className="auth-form__hint"
        >
          {t('auth.passwordHint', { count: MIN_PASSWORD_LENGTH })}
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
            minLength={MIN_PASSWORD_LENGTH}
            aria-describedby="password-hint"
          />
          <button
            type="button"
            className="auth-form__show focus-visible:focus-ring"
            aria-pressed={showPassword}
            aria-controls="password"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {t(showPassword ? 'auth.hide' : 'auth.show')}
          </button>
        </div>

        {addUserLoading && <p role="status">{t('auth.creatingAccount')}</p>}

        <PrimaryButton
          type="submit"
          size="snug"
          className="auth-form__submit"
          isDisabled={checkEmailLoading || emailExists || addUserLoading}
        >
          {t('auth.signUp')}
        </PrimaryButton>
      </form>
      <p className="auth-page__alt">
        {t('auth.haveAccount')}{' '}
        <Link
          to="/login"
          state={{ from }}
          className="focus-visible:focus-ring"
        >
          {t('auth.logIn')}
        </Link>
      </p>
    </div>
  )
}
