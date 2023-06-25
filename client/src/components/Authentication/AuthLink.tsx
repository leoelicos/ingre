/* react */
import React, { FC, ReactNode } from 'react'
import { Link } from 'react-router-dom'

const AuthLink: FC<{ link: string; children: ReactNode }> = ({
  link,
  children
}) => {
  return <Link to={link}>{children}</Link>
}
export default AuthLink
