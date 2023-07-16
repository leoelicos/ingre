// React
import React, { FC, useEffect } from 'react'

// React Router DOM
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

// ApolloClient
import { useMutation } from '@apollo/client'
import { MAKE_USER_PRO } from '../../lib/apollo/graphQL/mutations.ts'
import { Alert, Button, Col, Row, Space, Timeline } from 'antd'

/* state */
import { useAuthContext } from '../../utils/auth/AuthContext.tsx'

/* components */
import ContentTitle from '../../components/Text/ContentTitle.tsx'
import NotLoggedIn from '../../components/Layout/NotLoggedIn.tsx'
import { IngreIconPro } from '../../lib/icon/Icon.tsx'

const Success: FC = () => {
  const [makeUserPro] = useMutation(MAKE_USER_PRO)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [authState] = useAuthContext()
  const loggedIn = authState.loggedIn

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
