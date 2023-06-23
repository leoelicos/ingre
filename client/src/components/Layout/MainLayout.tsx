// React
import React, { FC, ReactNode, useCallback } from 'react'

// Ant
import { Layout, Row } from 'antd'

const layoutStyle = {
  width: '100%',
  justifyContent: 'center'
}

const rowStyle = {
  width: '100%',
  maxWidth: '1264px',
  alignItems: 'flex-start',
  background: 'white'
}

const MainLayout: FC<{ children: ReactNode }> = (props) => {
  const x = useCallback((props: { children: ReactNode }) => {
    return (
      <Layout style={layoutStyle}>
        <Row style={rowStyle}>{props.children}</Row>
      </Layout>
    )
  }, [])
  return x(props)
}

export default MainLayout
