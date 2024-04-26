import { Col, Row } from 'antd'
import React, { FC } from 'react'
import NotLoggedIn from '../../components/Layout/NotLoggedIn.tsx'
import ContentTitle from '../../components/Text/ContentTitle.tsx'
import { useAuthContext } from '../../utils/auth/AuthContext.tsx'
import CustomiseForm from './CustomiseForm/CustomiseForm.tsx'

const Customise: FC = () => {
  const [authState] = useAuthContext()
  const loggedIn = authState.loggedIn

  return (
    <Col style={{ width: '100%' }}>
      <Row>
        <ContentTitle>Customise</ContentTitle>
      </Row>
      <Row>{!loggedIn ? <NotLoggedIn /> : <CustomiseForm />}</Row>
    </Col>
  )
}
export default Customise
