import { Typography } from 'antd'
import React, { FC } from 'react'

const LogoWrapper: FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography.Title style={{ marginBottom: 0 }}>{children}</Typography.Title>
)

export default LogoWrapper
