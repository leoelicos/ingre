import { useMutation } from '@apollo/client'
import { Alert, Button, Col, Row, Space, Timeline } from 'antd'
import React, { FC, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import NotLoggedIn from '../../components/Layout/NotLoggedIn.tsx'
import ContentTitle from '../../components/Text/ContentTitle.tsx'
import { MAKE_USER_PRO } from '../../lib/apollo/graphQL/mutations.ts'
import { IngreIconPro } from '../../lib/icon/Icon.tsx'
import { useAuthContext } from '../../utils/auth/AuthContext.tsx'

const Success: FC = () => {
  const [makeUserPro] = useMutation(MAKE_USER_PRO)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [auth] = useAuthContext()
  const loggedIn = auth.loggedIn

  const Token = () => {
    const params = searchParams.get('session_id')

    console.log('params', params)
    return null
  }

  useEffect(() => {
    async function saveOrder() {
      try {
        const product = { membership: 'PRO' }

        await makeUserPro({ variables: { product } })

        setTimeout(() => {
          navigate('/upgrade')
        }, 3000)
      } catch (e) {
        console.error(e)
      }
    }

    saveOrder()
  }, [makeUserPro, navigate])

  if (!loggedIn) return <NotLoggedIn />

  if (!searchParams.get('session_id')) {
    return (
      <Col>
        <Row>
          <Alert
            message="Payment error"
            type="error"
          />
        </Row>
        <Row>
          <Button
            type="primary"
            shape="round"
            block
          >
            <Link to="/upgrade">
              <IngreIconPro />
              Try again?
            </Link>
          </Button>
        </Row>
      </Col>
    )
  }
  return (
    <Row>
      <Space direction="vertical">
        <ContentTitle>Success!</ContentTitle>
        <Timeline>
          <Timeline.Item color="green">
            Thank you for your purchase!
          </Timeline.Item>
          <Timeline.Item color="green">
            Your purchase reference is <Token />
          </Timeline.Item>
          <Timeline.Item color="blue">
            You will now be redirected to the home page.
          </Timeline.Item>
        </Timeline>
      </Space>
    </Row>
  )
}

export default Success
