import React, { FC } from 'react'
import { Col, Row } from 'antd'
import LogoutLink from '../../../Authentication/LogoutLink.tsx'
import LoginLink from '../../../Authentication/LoginLink.tsx'

const AuthButton: FC<{ loggedIn: boolean }> = ({ loggedIn }) => {
  return (
    <Col className="col-auth">
      <Row
        className="header-row-row-col3"
        align="middle"
      >
        {loggedIn ? <LogoutLink /> : <LoginLink />}
      </Row>
    </Col>
  )
}
export default AuthButton
