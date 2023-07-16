/* looks like a button but is actually a link */

import React, { FC } from 'react'
import { Col, Row } from 'antd'
import LogoutLink from '../../../Links/LogoutLink.tsx'
import LoginLink from '../../../Links/LoginLink.tsx'

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
