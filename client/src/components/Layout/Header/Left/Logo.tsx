import React, { CSSProperties, FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Typography } from 'antd'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

const { Title } = Typography
const LogoIconStyle: CSSProperties = {
  marginRight: '0.3rem',
  color: 'var(--ingre-eggshell)',
  fontSize: '1.8rem',
  paddingBottom: '2px'
}

function LogoIcon() {
  return (
    <FontAwesomeIcon
      className="ingre-logo-icon"
      icon={'fa-solid fa-egg' as IconProp}
      style={LogoIconStyle}
    />
  )
}

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
      <LogoIcon />
      <LogoText />
    </Title>
  )
}
export default Logo
