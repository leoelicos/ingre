import React, { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Typography } from 'antd'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

const Logo: FC = () => {
  return (
    <Typography.Title style={{ marginBottom: 0 }}>
      <FontAwesomeIcon
        className="ingre-logo"
        icon={'fa-solid fa-egg' as IconProp}
        style={{
          marginRight: '0.3rem',
          color: 'var(--ingre-eggshell)',
          fontSize: '1.8rem',
          paddingBottom: '2px'
        }}
      />
      <span
        style={{
          color: 'var(--ingre-dark-brown)',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '36px',
          letterSpacing: -1,
          fontWeight: '800'
        }}
      >
        ingré
      </span>
    </Typography.Title>
  )
}
export default Logo
