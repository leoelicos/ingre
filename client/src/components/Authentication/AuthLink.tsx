/* react */
import React, { FC, CSSProperties } from 'react'
import { Link } from 'react-router-dom'

const style: CSSProperties = {
  color: 'var(--ingre-dark-brown)',
  fontSize: '1.2rem',
  margin: '1rem 1.2rem 0 1.2rem',
  padding: '0 8px',
  borderRadius: '1.2rem'
}

const AuthLink: FC<{ link: string; text: string }> = ({ link, text }) => {
  return (
    <Link to={link}>
      <div style={style}>{text}</div>
    </Link>
  )
}
export default AuthLink
