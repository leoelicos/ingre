/* react */
import React, { FC, CSSProperties, ReactNode } from 'react'

const style: CSSProperties = {
  color: 'var(--ingre-dark-brown)',
  fontSize: '1.2rem',
  margin: '1rem 1.2rem 0 1.2rem',
  padding: '0 8px',
  borderRadius: '1.2rem'
}

const AuthButton: FC<{ children: ReactNode }> = ({ children }) => {
  return <div style={style}>{children}</div>
}
export default AuthButton
