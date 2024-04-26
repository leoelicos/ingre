import { Typography } from 'antd'
import React, { CSSProperties, FC, ReactNode } from 'react'

const style: CSSProperties = {
  color: 'var(--ingre-dark-brown)',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '36px',
  letterSpacing: -1,
  fontWeight: '800',
  margin: '0.6rem 0',
  textAlign: 'center'
}

const ContentTitle: FC<{ children: ReactNode }> = () => (
  <Typography.Title
    level={1}
    style={style}
  />
)

export default ContentTitle
