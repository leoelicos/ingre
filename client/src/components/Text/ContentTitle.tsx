/* react */
import React, { CSSProperties, FC, ReactNode } from 'react'

/* ant */
import { Typography } from 'antd'

const style: CSSProperties = {
  color: 'var(--ingre-dark-brown)',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '36px',
  letterSpacing: -1,
  fontWeight: '800',
  margin: '0.6rem 0',
  textAlign: 'center'
}

const ContentTitle: FC<{ children: ReactNode }> = ({ children }) => (
  <Typography.Title
    level={1}
    style={style}
  >
    {children}
  </Typography.Title>
)

export default ContentTitle
