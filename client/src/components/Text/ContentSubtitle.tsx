import { Typography } from 'antd'
import React, { FC, ReactNode } from 'react'

const titleStyle = {
  color: 'var(--ingre-blue)',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '26px',
  letterSpacing: -1,
  fontWeight: '800',
  margin: '0.3rem 0'
}

const ContentSubtitle: FC<{ children: ReactNode }> = ({ children }) => (
  <Typography.Title
    level={2}
    style={titleStyle}
  >
    {children}
  </Typography.Title>
)
export default ContentSubtitle
