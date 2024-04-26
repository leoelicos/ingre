import { Col, Row } from 'antd'
import React, { FC } from 'react'
import LoginLink from '../../../Links/LoginLink.tsx'
import LogoutLink from '../../../Links/LogoutLink.tsx'

type AuthButtonType = FC<{ loggedIn: boolean }>

const AuthButton: AuthButtonType = ({ loggedIn }) => {
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
