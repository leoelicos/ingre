import { Button, Divider, Empty, Row } from 'antd'
import React, { FC } from 'react'
import { Link } from 'react-router-dom'

const NotLoggedIn: FC = () => {
  return (
    <Empty>
      <Divider />
      <Row>You need to be logged in to see this page.</Row>
      <Link to="/login">
        <Button
          type="primary"
          style={{ marginTop: '1rem' }}
        >
          Log in
        </Button>
      </Link>
    </Empty>
  )
}

export default NotLoggedIn
