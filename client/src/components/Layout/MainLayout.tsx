import { Layout, Row } from 'antd'
import React, { FC, ReactNode } from 'react'

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
  return (
    <Layout style={layoutStyle}>
      <Row style={rowStyle}>{props.children}</Row>
    </Layout>
  )
}

export default MainLayout
