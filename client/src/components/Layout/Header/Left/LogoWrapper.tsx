import { Typography } from 'antd'
import React, { CSSProperties, FC, ReactNode } from 'react'

const style: CSSProperties = {
  marginBottom: 0
}
const LogoWrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <Typography.Title style={style}>{children}</Typography.Title>
)

export default LogoWrapper
