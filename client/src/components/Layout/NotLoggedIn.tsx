/* react */
import React, { FC } from 'react'

/* components */
import { Divider, Empty, Row } from 'antd'
import LoginLink from '../Links/LoginLink.tsx'

const NotLoggedIn: FC = () => {
  return (
    <Empty>
      <Divider />
      <Row>You need to be logged in to see this page.</Row>
      <LoginLink />
    </Empty>
  )
}

export default NotLoggedIn
