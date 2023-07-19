import React, { CSSProperties, FC } from 'react'

import { Link } from 'react-router-dom'

const LoginLink: FC = () => {
  const style: CSSProperties = {
    backgroundColor: 'hotpink',
    color: 'white !important'
  }
  return (
    <Link
      style={style}
      to="/login"
      className="authlink"
    >
      Log in
    </Link>
  )
}
export default LoginLink
