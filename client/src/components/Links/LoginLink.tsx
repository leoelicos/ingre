import React, { FC } from 'react'

import { Link } from 'react-router-dom'

const LoginLink: FC = () => (
  <Link
    to="/login"
    className="authlink"
  >
    Log in
  </Link>
)
export default LoginLink
