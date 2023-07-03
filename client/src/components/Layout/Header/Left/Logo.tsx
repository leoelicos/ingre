import React, { CSSProperties, FC } from 'react'
import { Typography } from 'antd'
import { IngreIconLogoEgg } from '../../../Icons/Icon.tsx'

const { Title } = Typography

const LogoTextStyle: CSSProperties = {
  color: 'var(--ingre-dark-brown)',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '36px',
  letterSpacing: -1,
  fontWeight: '800'
}

function LogoText() {
  return (
    <span
      className="ingre-log-text"
      style={LogoTextStyle}
    >
      ingré
    </span>
  )
}

const Logo: FC = () => {
  return (
    <Title style={{ marginBottom: 0 }}>
      <IngreIconLogoEgg />
      <LogoText />
    </Title>
  )
}
export default Logo
