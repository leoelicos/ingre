import React, { FC } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useLogin } from './useLogin'

export const Login: FC = () => {
  const { loggedIn, handleFormSubmit, onEmailChange, onPasswordChange, error } =
    useLogin()
  if (loggedIn) return <Navigate to="/" />
  return (
    <div>
      <div>
        <p>Log in</p>
      </div>
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
        {error && <div>"Couldn't log you in."</div>}
        <button type="submit">Submit</button>
        <Link to="/signup">
          <button>No account? Sign up</button>
        </Link>
      </form>
    </div>
  )
}
