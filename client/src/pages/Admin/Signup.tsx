import React, { FC } from 'react'
import { Link, Navigate } from 'react-router-dom'
import LoginLink from 'components/LoginLink'
import { useSignup } from './useSignup'

export const Signup: FC = () => {
  const {
    loggedIn,
    handleFormSubmit,
    onFirstNameChange,
    onLastNameChange,
    onEmailChange,
    checkEmailLoading,
    checkEmailError,
    onPasswordChange,
    addUserError
  } = useSignup()
  if (!loggedIn) return <Navigate to="/" />
  return (
    <div>
      <div>
        <p>Sign up</p>
      </div>
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          onChange={onFirstNameChange}
        />
        <input
          type="text"
          onChange={onLastNameChange}
        />
        <input
          type="text"
          onChange={onEmailChange}
        />
        {checkEmailLoading ? (
          <p>Checking email</p>
        ) : checkEmailError ? (
          <p>Check email error</p>
        ) : (
          <>
            A user with this email already exists!
            <Link to="/login">
              <button>Log in?</button>
            </Link>
          </>
        )}
        <input
          type="text"
          onChange={onPasswordChange}
        />
        {addUserError && <p>Couldn't sign you up.</p>}

        <button type="submit">Submit</button>
        <div>
          <p>Already have an account?</p>
          <LoginLink />
        </div>
      </form>
    </div>
  )
}
