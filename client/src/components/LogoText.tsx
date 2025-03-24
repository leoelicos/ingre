import React, { CSSProperties, FC } from 'react'

export const LogoText: FC<{ children: React.ReactNode }> = ({ children }) => {
  const LogoTextStyle: CSSProperties = {
    color: 'var(--ingre-dark-brown)',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '36px',
    letterSpacing: -1,
    fontWeight: '800'
  }
  return <span style={LogoTextStyle}>{children}</span>
}
