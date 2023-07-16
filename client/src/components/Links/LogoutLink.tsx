import React, { FC } from 'react'
import { Link } from 'react-router-dom'

const LogoutLink: FC = () => (
  <Link
    to="/logout"
    className="authlink"
  >
    Log out
  </Link>
)
export default LogoutLink
