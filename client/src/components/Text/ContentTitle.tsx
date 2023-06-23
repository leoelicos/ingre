import React, { CSSProperties, FC, ReactNode, useCallback } from 'react'
import { Typography } from 'antd'
const { Title } = Typography

const contentTitleStyle: CSSProperties = {
  color: 'var(--ingre-dark-brown)',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '36px',
  letterSpacing: -1,
  fontWeight: '800',
  margin: '0.6rem 0',
  textAlign: 'center'
}
const ContentTitle: FC<{ children: ReactNode }> = (props) => {
  const x = useCallback(
    (props: { children: ReactNode }) => (
      <Title
        level={1}
        style={contentTitleStyle}
      >
        {props.children}
      </Title>
    ),
    []
  )
  return x(props)
}
export default ContentTitle
