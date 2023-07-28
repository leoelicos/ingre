import { Typography } from 'antd'
import React, { FC, ReactNode } from 'react'

const LogoWrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <Typography.Title style={{ marginBottom: 0 }}>{children}</Typography.Title>
)

export default LogoWrapper
