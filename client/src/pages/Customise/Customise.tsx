/* react */
import React, { FC } from 'react'

/* components */
import { Col, Row } from 'antd'
import ContentTitle from '../../components/Text/ContentTitle.tsx'
import NotLoggedIn from '../../components/Layout/NotLoggedIn.tsx'

/* state */
import { useAuthContext } from '../../utils/auth/AuthContext.tsx'

/* types */
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
