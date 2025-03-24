import React, { FC } from 'react'
import { Link } from 'react-router-dom'

const NotLoggedIn: FC = () => {
  return (
    <div>
      <div>You need to be logged in to see this page.</div>
      <Link to="/login">Log&nbsp;in</Link>
    </div>
  )
}

export default NotLoggedIn
