import React, { CSSProperties, FC } from 'react'

const LogoText: FC = () => {
  const LogoTextStyle: CSSProperties = {
    color: 'var(--ingre-dark-brown)',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '36px',
    letterSpacing: -1,
    fontWeight: '800'
  }
  return (
    <span
      className="ingre-log-text"
      style={LogoTextStyle}
    />
  )
}

export default LogoText
