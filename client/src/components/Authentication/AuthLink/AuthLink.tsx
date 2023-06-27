/* react */
import React, { FC } from 'react'
import { Link } from 'react-router-dom'

import './AuthLink.scss'

const AuthLink: FC<{ link: string; text: string }> = ({ link, text }) => {
  return (
    <Link
      to={link}
      className="authlink"
    >
      {text}
    </Link>
  )
}
export default AuthLink
